import { auth } from '@/auth'
import { cacheGet, cacheSet } from '@/lib/redis'
import { getMarketDataProvider } from '@/lib/market-data'
import { getMockSentimentData, generatePriceHistory } from '@/lib/mock-data'
import { runPrediction } from '@/lib/server/prediction-engine'
import type { PredictionResult } from '@/lib/server/prediction-engine'
import type { SentimentData } from '@/lib/market-data/types'

const TICKER_RE = /^[A-Z]{1,5}$/

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ticker } = await params
  const upper = ticker.toUpperCase()

  if (!TICKER_RE.test(upper)) {
    return Response.json({ error: 'Invalid ticker' }, { status: 400 })
  }

  const cacheKey = `prediction:${upper}`
  const cached = await cacheGet<PredictionResult>(cacheKey)
  if (cached) return Response.json(cached)

  const provider = getMarketDataProvider()

  // Fetch bars
  let bars
  try {
    bars = await provider.getHistory(upper, 'compact')
  } catch {
    const mockBars = generatePriceHistory(150, 100)
    bars = mockBars.map((b) => ({
      date: b.date,
      open: b.price * 0.99,
      high: b.price * 1.01,
      low: b.price * 0.98,
      close: b.price,
      adjClose: b.price,
      volume: b.volume,
    }))
  }

  if (bars.length < 30) {
    return Response.json({ error: 'Insufficient historical data (need ≥ 30 bars)' }, { status: 422 })
  }

  // Fetch sentiment
  let sentiment: SentimentData
  try {
    const av = provider as { getNewsSentiment?: (t: string) => Promise<SentimentData> }
    if (typeof av.getNewsSentiment === 'function') {
      sentiment = await av.getNewsSentiment(upper)
    } else {
      sentiment = getMockSentimentData(upper)
    }
  } catch {
    sentiment = getMockSentimentData(upper)
  }

  // Fetch beta
  let beta: number | undefined
  try {
    const profile = await provider.getProfile(upper)
    beta = profile.beta ?? undefined
  } catch {
    beta = undefined
  }

  const result = runPrediction({ ticker: upper, bars, sentiment, beta })
  await cacheSet(cacheKey, result, 300)

  return Response.json(result)
}
