import { auth } from '@/auth'
import { getMarketDataProvider } from '@/lib/market-data'
import { cacheGet, cacheSet } from '@/lib/redis'
import type { SearchResult } from '@/lib/market-data/types'

const MOCK_RESULTS: SearchResult[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', type: 'Equity', exchange: 'NASDAQ' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', exchange: 'NASDAQ' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', exchange: 'NASDAQ' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', exchange: 'NASDAQ' },
  { ticker: 'TSLA', name: 'Tesla Inc.', type: 'Equity', exchange: 'NASDAQ' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', exchange: 'NASDAQ' },
  { ticker: 'META', name: 'Meta Platforms Inc.', type: 'Equity', exchange: 'NASDAQ' },
  { ticker: 'AMD', name: 'Advanced Micro Devices Inc.', type: 'Equity', exchange: 'NASDAQ' },
  { ticker: 'NFLX', name: 'Netflix Inc.', type: 'Equity', exchange: 'NASDAQ' },
]

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()

    if (!q) {
      return Response.json({ results: [] })
    }

    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      const lq = q.toLowerCase()
      const filtered = MOCK_RESULTS.filter(
        (r) =>
          r.ticker.toLowerCase().includes(lq) || r.name.toLowerCase().includes(lq)
      )
      return Response.json({ results: filtered })
    }

    const cacheKey = `search:${q}`
    const cached = await cacheGet<SearchResult[]>(cacheKey)
    if (cached) {
      return Response.json({ results: cached })
    }

    const provider = getMarketDataProvider()
    const results = await provider.search(q)

    await cacheSet(cacheKey, results, 300)

    return Response.json({ results })
  } catch (err) {
    console.error('[/api/stocks] error:', err)
    return Response.json({ error: 'Failed to search stocks' }, { status: 500 })
  }
}
