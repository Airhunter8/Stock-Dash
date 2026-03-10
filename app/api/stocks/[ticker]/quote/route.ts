import { auth } from '@/auth'
import { getMarketDataProvider } from '@/lib/market-data'
import { cacheGet, cacheSet } from '@/lib/redis'
import type { MarketQuote } from '@/lib/market-data/types'

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

    const cacheKey = `quote:${ticker}`
    const cached = await cacheGet<MarketQuote>(cacheKey)
    if (cached) {
      return Response.json(cached)
    }

    const provider = getMarketDataProvider()
    const quote = await provider.getQuote(ticker)

    await cacheSet(cacheKey, quote, 60)

    return Response.json(quote)
  } catch (err) {
    console.error('[/api/stocks/[ticker]/quote] error:', err)
    return Response.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
