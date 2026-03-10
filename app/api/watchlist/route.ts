import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getMarketDataProvider } from '@/lib/market-data'
import { cacheGet, cacheSet } from '@/lib/redis'
import type { MarketQuote } from '@/lib/market-data/types'

async function getOrCreateDefaultWatchlist(userId: string) {
  let watchlist = await prisma.watchlist.findFirst({
    where: { userId },
    include: { items: { orderBy: { addedAt: 'asc' } } },
  })

  if (!watchlist) {
    watchlist = await prisma.watchlist.create({
      data: {
        userId,
        name: 'My Watchlist',
      },
      include: { items: { orderBy: { addedAt: 'asc' } } },
    })
  }

  return watchlist
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const watchlist = await getOrCreateDefaultWatchlist(userId)
    const provider = getMarketDataProvider()

    const quoteResults = await Promise.allSettled(
      watchlist.items.map(async (item) => {
        const cacheKey = `quote:${item.ticker}`
        const cached = await cacheGet<MarketQuote>(cacheKey)
        if (cached) return { ticker: item.ticker, quote: cached }

        const quote = await provider.getQuote(item.ticker)
        await cacheSet(cacheKey, quote, 60)
        return { ticker: item.ticker, quote }
      })
    )

    const quoteMap: Record<string, MarketQuote | null> = {}
    for (const result of quoteResults) {
      if (result.status === 'fulfilled') {
        quoteMap[result.value.ticker] = result.value.quote
      } else {
        // Keep null for failed quotes
      }
    }

    const enrichedItems = watchlist.items.map((item) => ({
      ticker: item.ticker,
      addedAt: item.addedAt,
      quote: quoteMap[item.ticker] ?? null,
    }))

    return Response.json({
      id: watchlist.id,
      name: watchlist.name,
      items: enrichedItems,
    })
  } catch (err) {
    console.error('[/api/watchlist GET] error:', err)
    return Response.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await req.json()
    const { ticker } = body

    if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
      return Response.json({ error: 'ticker is required' }, { status: 400 })
    }

    const tickerUpper = ticker.toUpperCase().trim()
    const watchlist = await getOrCreateDefaultWatchlist(userId)

    const existing = await prisma.watchlistItem.findFirst({
      where: { watchlistId: watchlist.id, ticker: tickerUpper },
    })

    if (existing) {
      return Response.json({ error: `${tickerUpper} is already in your watchlist` }, { status: 409 })
    }

    const item = await prisma.watchlistItem.create({
      data: {
        watchlistId: watchlist.id,
        ticker: tickerUpper,
      },
    })

    return Response.json({ success: true, item }, { status: 201 })
  } catch (err) {
    console.error('[/api/watchlist POST] error:', err)
    return Response.json({ error: 'Failed to add to watchlist' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await req.json()
    const { ticker } = body

    if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
      return Response.json({ error: 'ticker is required' }, { status: 400 })
    }

    const tickerUpper = ticker.toUpperCase().trim()
    const watchlist = await getOrCreateDefaultWatchlist(userId)

    const deleted = await prisma.watchlistItem.deleteMany({
      where: { watchlistId: watchlist.id, ticker: tickerUpper },
    })

    if (deleted.count === 0) {
      return Response.json({ error: `${tickerUpper} not found in your watchlist` }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[/api/watchlist DELETE] error:', err)
    return Response.json({ error: 'Failed to remove from watchlist' }, { status: 500 })
  }
}
