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
    const { amount } = body

    if (typeof amount !== 'number' || amount <= 0) {
      return Response.json({ error: 'amount must be a positive number' }, { status: 400 })
    }
    if (amount > 1000000) {
      return Response.json({ error: 'amount cannot exceed $1,000,000 per deposit' }, { status: 400 })
    }

    const result = await portfolioService.deposit(userId, amount)
    return Response.json(result)
  } catch (err) {
    console.error('[/api/portfolio/deposit] error:', err)
    return Response.json({ error: 'Failed to process deposit' }, { status: 500 })
  }
}
