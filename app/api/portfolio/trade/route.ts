import { auth } from '@/auth'
import { portfolioService } from '@/lib/server/portfolio-service'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await req.json()
    const { ticker, type, shares, price, notes } = body

    if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
      return Response.json({ error: 'ticker is required' }, { status: 400 })
    }
    if (type !== 'BUY' && type !== 'SELL') {
      return Response.json({ error: 'type must be BUY or SELL' }, { status: 400 })
    }
    if (typeof shares !== 'number' || shares <= 0) {
      return Response.json({ error: 'shares must be a positive number' }, { status: 400 })
    }
    if (typeof price !== 'number' || price <= 0) {
      return Response.json({ error: 'price must be a positive number' }, { status: 400 })
    }

    const result = await portfolioService.executeTrade({
      userId,
      ticker: ticker.toUpperCase().trim(),
      type,
      shares,
      price,
      notes,
    })

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json(result)
  } catch (err) {
    console.error('[/api/portfolio/trade] error:', err)
    return Response.json({ error: 'Failed to execute trade' }, { status: 500 })
  }
}
