import { auth } from '@/auth'
import { getMarketDataProvider } from '@/lib/market-data'
import { runBacktest } from '@/lib/server/backtest-engine'
import type { StrategyRule } from '@/lib/server/backtest-engine'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { ticker, period, initialCapital, buyRules, sellRules } = body

    if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
      return Response.json({ error: 'ticker is required' }, { status: 400 })
    }
    if (!period || typeof period !== 'string') {
      return Response.json({ error: 'period is required' }, { status: 400 })
    }
    if (typeof initialCapital !== 'number' || initialCapital <= 0) {
      return Response.json({ error: 'initialCapital must be a positive number' }, { status: 400 })
    }
    if (!Array.isArray(buyRules) || buyRules.length === 0) {
      return Response.json({ error: 'at least one buy rule is required' }, { status: 400 })
    }
    if (!Array.isArray(sellRules) || sellRules.length === 0) {
      return Response.json({ error: 'at least one sell rule is required' }, { status: 400 })
    }

    const tickerUpper = ticker.toUpperCase().trim()
    const outputSize = period === '5Y' ? 'full' : 'compact'

    const provider = getMarketDataProvider()
    const bars = await provider.getHistory(tickerUpper, outputSize)

    if (!bars || bars.length === 0) {
      return Response.json({ error: 'No historical data available for the given ticker' }, { status: 422 })
    }

    const result = runBacktest({
      ticker: tickerUpper,
      bars,
      buyRules: buyRules as StrategyRule[],
      sellRules: sellRules as StrategyRule[],
      initialCapital,
    })

    return Response.json(result)
  } catch (err) {
    console.error('[/api/backtest] error:', err)
    return Response.json({ error: 'Failed to run backtest' }, { status: 500 })
  }
}
