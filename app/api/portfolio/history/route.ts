import { auth } from '@/auth'
import { getMarketDataProvider } from '@/lib/market-data'
import { cacheGet, cacheSet } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

type Period = '1W' | '1M' | '3M' | '1Y' | '5Y' | 'ALL'

const PERIOD_DAYS: Record<Period, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  '5Y': 1825,
  'ALL': Infinity,
}

// Forward-fill missing prices using last known value
function forwardFill(
  dates: string[],
  pricesByDate: Record<string, Record<string, number>>,
  tickers: string[]
): Record<string, Record<string, number>> {
  const last: Record<string, number> = {}
  const filled: Record<string, Record<string, number>> = {}
  for (const date of dates) {
    const prices = pricesByDate[date] ?? {}
    for (const ticker of tickers) {
      if (prices[ticker] != null) last[ticker] = prices[ticker]
    }
    filled[date] = { ...last }
  }
  return filled
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const periodParam = (searchParams.get('period') ?? '1Y') as Period
    const validPeriods: Period[] = ['1W', '1M', '3M', '1Y', '5Y', 'ALL']
    const period = validPeriods.includes(periodParam) ? periodParam : '1Y'

    const cacheKey = `portfolio-history:${session.user.id}:${period}`
    const cached = await cacheGet<{ date: string; value: number }[]>(cacheKey)
    if (cached) return Response.json({ period, points: cached })

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: {
        trades: { orderBy: { executedAt: 'asc' } },
      },
    })

    if (!portfolio || portfolio.trades.length === 0) {
      return Response.json({ period, points: [] })
    }

    // Derive the initial cash from current balance + total bought - total sold
    const totalBought = portfolio.trades
      .filter((t) => t.type === 'BUY')
      .reduce((sum, t) => sum + Number(t.total), 0)
    const totalSold = portfolio.trades
      .filter((t) => t.type === 'SELL')
      .reduce((sum, t) => sum + Number(t.total), 0)
    const initialCash = Number(portfolio.cashBalance) + totalBought - totalSold

    const tickers = [...new Set(portfolio.trades.map((t) => t.ticker))]

    // Fetch full price history for each ticker (DB first, then API)
    const pricesByDate: Record<string, Record<string, number>> = {}
    const provider = getMarketDataProvider()

    for (const ticker of tickers) {
      try {
        // Try DB first
        const dbBars = await prisma.stockData.findMany({
          where: { ticker },
          orderBy: { date: 'asc' },
          select: { date: true, adjClose: true },
        })

        let bars: { date: string; price: number }[] = []

        if (dbBars.length > 100) {
          bars = dbBars.map((b) => ({
            date: b.date.toISOString().split('T')[0],
            price: Number(b.adjClose),
          }))
        } else {
          const apiBars = await provider.getHistory(ticker, 'full')
          bars = apiBars.map((b) => ({ date: b.date, price: b.adjClose }))
        }

        for (const bar of bars) {
          if (!pricesByDate[bar.date]) pricesByDate[bar.date] = {}
          pricesByDate[bar.date][ticker] = bar.price
        }
      } catch {
        // skip failed tickers
      }
    }

    // Build sorted list of all dates with price data
    const allDates = Object.keys(pricesByDate).sort()
    if (allDates.length === 0) {
      return Response.json({ period, points: [] })
    }

    // Forward-fill prices so every trading day has a price for each known ticker
    const filledPrices = forwardFill(allDates, pricesByDate, tickers)

    // Determine the start date: earliest of (first trade date, period cutoff)
    const firstTradeDate = portfolio.trades[0].executedAt.toISOString().split('T')[0]
    const maxDays = PERIOD_DAYS[period]
    const periodCutoff =
      maxDays === Infinity
        ? null
        : (() => {
            const d = new Date()
            d.setDate(d.getDate() - maxDays)
            return d.toISOString().split('T')[0]
          })()

    // We replay from firstTradeDate but only return points from periodCutoff
    const replayStartDate = firstTradeDate
    const returnStartDate = periodCutoff
      ? periodCutoff > firstTradeDate
        ? periodCutoff
        : firstTradeDate
      : firstTradeDate

    const replayDates = allDates.filter((d) => d >= replayStartDate)

    // Replay trades in order
    const trades = portfolio.trades.map((t) => ({
      date: t.executedAt.toISOString().split('T')[0],
      ticker: t.ticker,
      type: t.type as 'BUY' | 'SELL',
      shares: Number(t.shares),
      price: Number(t.price),
    }))

    let cash = initialCash
    const positions: Record<string, number> = {}
    let tradePtr = 0
    const allPoints: { date: string; value: number }[] = []

    for (const date of replayDates) {
      // Apply all trades up to and including this date
      while (tradePtr < trades.length && trades[tradePtr].date <= date) {
        const t = trades[tradePtr]
        const cost = t.shares * t.price
        if (t.type === 'BUY') {
          cash -= cost
          positions[t.ticker] = (positions[t.ticker] ?? 0) + t.shares
        } else {
          cash += cost
          positions[t.ticker] = (positions[t.ticker] ?? 0) - t.shares
          if ((positions[t.ticker] ?? 0) <= 0) delete positions[t.ticker]
        }
        tradePtr++
      }

      const prices = filledPrices[date] ?? {}
      let value = cash
      for (const [ticker, shares] of Object.entries(positions)) {
        value += shares * (prices[ticker] ?? 0)
      }

      allPoints.push({ date, value })
    }

    // Filter to the return window and downsample for large ranges
    const returnPoints = allPoints.filter((p) => p.date >= returnStartDate)

    // Downsample: for ranges > 1Y keep ~1 point per week; for ALL keep ~1 per 2 weeks
    let points = returnPoints
    if (returnPoints.length > 365) {
      const step = period === 'ALL' ? 14 : 7
      points = returnPoints.filter((_, i) => i % step === 0 || i === returnPoints.length - 1)
    }

    await cacheSet(cacheKey, points, 300)
    return Response.json({ period, points })
  } catch (err) {
    console.error('[/api/portfolio/history] error:', err)
    return Response.json({ error: 'Failed to fetch portfolio history' }, { status: 500 })
  }
}
