import { auth } from '@/auth'
import { portfolioService } from '@/lib/server/portfolio-service'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(req.url)
    const limitParam = parseInt(searchParams.get('limit') || '50', 10)
    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 50 : limitParam), 200)

    const trades = await portfolioService.getTransactions(userId, limit)

    const serialized = trades.map((t) => ({
      id: t.id,
      ticker: t.ticker,
      type: t.type,
      shares: Number(t.shares),
      price: Number(t.price),
      total: Number(t.total),
      realizedPnl: t.realizedPnl !== null ? Number(t.realizedPnl) : null,
      executedAt: t.executedAt,
    }))

    return Response.json({ trades: serialized })
  } catch (err) {
    console.error('[/api/portfolio/transactions] error:', err)
    return Response.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
