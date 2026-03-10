import { auth } from '@/auth'
import { getMarketDataProvider } from '@/lib/market-data'
import { cacheGet, cacheSet } from '@/lib/redis'
import { prisma } from '@/lib/prisma'
import type { HistoricalBar } from '@/lib/market-data/types'

type Period = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'

const PERIOD_DAYS: Record<Period, number> = {
  '1D': 30,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  '5Y': Infinity,
}

const PERIOD_TTL: Record<Period, number> = {
  '1D': 60,
  '1W': 300,
  '1M': 600,
  '3M': 900,
  '1Y': 900,
  '5Y': 900,
}

function generateMockBars(ticker: string, count: number): HistoricalBar[] {
  const bars: HistoricalBar[] = []
  let price = 150 + Math.random() * 100
  const today = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const change = (Math.random() - 0.48) * price * 0.03
    const open = price
    const close = price + change
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)
    const volume = Math.floor(10000000 + Math.random() * 40000000)

    bars.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      adjClose: parseFloat(close.toFixed(2)),
      volume,
    })

    price = close
  }

  return bars
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticker: rawTicker } = await params
    const ticker = rawTicker.toUpperCase()

    const { searchParams } = new URL(req.url)
    const periodParam = (searchParams.get('period') || '1Y') as Period
    const validPeriods: Period[] = ['1D', '1W', '1M', '3M', '1Y', '5Y']
    const period = validPeriods.includes(periodParam) ? periodParam : '1Y'

    const outputSize = period === '5Y' ? 'full' : 'compact'
    const cacheKey = `history:${ticker}:${period}`
    const ttl = PERIOD_TTL[period]

    const cached = await cacheGet<HistoricalBar[]>(cacheKey)
    if (cached) {
      return Response.json({ ticker, period, bars: cached })
    }

    try {
      const provider = getMarketDataProvider()
      const allBars = await provider.getHistory(ticker, outputSize)

      // Filter bars to the requested period
      let bars: HistoricalBar[]
      const maxDays = PERIOD_DAYS[period]

      if (maxDays === Infinity) {
        bars = allBars
      } else {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - maxDays)
        const cutoffStr = cutoff.toISOString().split('T')[0]
        bars = allBars.filter((b) => b.date >= cutoffStr)

        if (period === '1D') {
          bars = allBars.slice(-30)
        }
      }

      await cacheSet(cacheKey, bars, ttl)

      // Upsert into DB (fire and forget — don't block response)
      const upsertOps = bars.map((bar) =>
        prisma.stockData.upsert({
          where: { ticker_date: { ticker, date: bar.date } },
          update: {
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            adjClose: bar.adjClose,
            volume: bar.volume,
          },
          create: {
            ticker,
            date: bar.date,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            adjClose: bar.adjClose,
            volume: bar.volume,
          },
        })
      )
      Promise.all(upsertOps).catch((e) => console.error('[history] DB upsert error:', e))

      return Response.json({ ticker, period, bars })
    } catch {
      const maxDays = PERIOD_DAYS[period]
      const mockCount = maxDays === Infinity ? 1260 : Math.min(maxDays, 365)
      const bars = generateMockBars(ticker, mockCount)
      return Response.json({ ticker, period, bars })
    }
  } catch (err) {
    console.error('[/api/stocks/[ticker]/history] error:', err)
    return Response.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
