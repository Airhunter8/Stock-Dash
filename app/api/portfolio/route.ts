import { auth } from '@/auth'
import { portfolioService } from '@/lib/server/portfolio-service'
import { finnhubQuote } from '@/lib/market-data/finnhub'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const portfolio = await portfolioService.getOrCreatePortfolio(userId)

    // Fetch real-time quotes from Finnhub in parallel
    const quoteResults = await Promise.allSettled(
      portfolio.positions.map(async (position) => {
        const quote = await finnhubQuote(position.ticker)
        return { ticker: position.ticker, quote }
      })
    )

    const quoteMap: Record<string, { price: number; change: number; changePercent: number }> = {}
    for (const result of quoteResults) {
      if (result.status === 'fulfilled' && result.value.quote) {
        quoteMap[result.value.ticker] = result.value.quote
      }
    }

    const enrichedPositions = portfolio.positions.map((position) => {
      const quote = quoteMap[position.ticker]
      const currentPrice = quote?.price ?? position.avgCost
      const currentValue = position.shares * currentPrice
      const costBasis = position.shares * position.avgCost
      const unrealizedPnl = currentValue - costBasis
      const unrealizedPnlPercent = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0
      // Day change = gain/loss since purchase price, not since previous close
      const dayChange = unrealizedPnl
      const dayChangePercent = unrealizedPnlPercent

      return {
        ticker: position.ticker,
        shares: position.shares,
        avgCost: position.avgCost,
        currentPrice,
        currentValue,
        costBasis,
        unrealizedPnl,
        unrealizedPnlPercent,
        dayChange,
        changePercent: dayChangePercent,
      }
    })

    const totalInvestedValue = enrichedPositions.reduce((sum, p) => sum + p.currentValue, 0)
    const totalValue = portfolio.cashBalance + totalInvestedValue
    const totalCostBasis = enrichedPositions.reduce((sum, p) => sum + p.costBasis, 0)
    const totalUnrealizedPnl = totalInvestedValue - totalCostBasis
    const dayChange = enrichedPositions.reduce((sum, p) => sum + p.dayChange, 0)
    const prevTotalValue = totalValue - dayChange
    const dayChangePercent = prevTotalValue > 0 ? (dayChange / prevTotalValue) * 100 : 0

    return Response.json({
      id: portfolio.id,
      cashBalance: portfolio.cashBalance,
      totalValue,
      totalInvested: totalInvestedValue,
      totalUnrealizedPnl,
      dayChange,
      dayChangePercent,
      positions: enrichedPositions,
    })
  } catch (err) {
    console.error('[/api/portfolio] error:', err)
    return Response.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}
