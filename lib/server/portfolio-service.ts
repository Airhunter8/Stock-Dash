import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { finnhubQuote } from '@/lib/market-data/finnhub'

export interface TradeRequest {
  userId: string
  ticker: string
  type: 'BUY' | 'SELL'
  shares: number
  price: number
  notes?: string
}

export interface TradeResult {
  success: boolean
  error?: string
  trade?: {
    id: string
    ticker: string
    type: string
    shares: number
    price: number
    total: number
    realizedPnl: number | null
    executedAt: Date
  }
  portfolio?: {
    cashBalance: number
  }
}

export interface PortfolioData {
  id: string
  cashBalance: number
  positions: Array<{
    ticker: string
    shares: number
    avgCost: number
  }>
  totalInvested: number
}

class PortfolioService {
  async getOrCreatePortfolio(userId: string): Promise<PortfolioData> {
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { positions: true },
    })

    if (!portfolio) {
      // Seed: 5 shares of 5 stocks purchased at current market prices
      const SEED_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']
      const FALLBACK_PRICES: Record<string, number> = {
        AAPL: 210, MSFT: 390, GOOGL: 170, AMZN: 205, NVDA: 115,
      }
      const SEED_SHARES = 5
      const now = new Date()

      // Fetch current prices from Finnhub; fall back to hardcoded if unavailable
      const priceResults = await Promise.allSettled(
        SEED_TICKERS.map(async (ticker) => {
          const q = await finnhubQuote(ticker)
          return { ticker, price: q?.price ?? FALLBACK_PRICES[ticker] }
        })
      )
      const seedStocks = priceResults.map((r) =>
        r.status === 'fulfilled' ? r.value : { ticker: 'AAPL', price: FALLBACK_PRICES['AAPL'] }
      )

      const seedCost = seedStocks.reduce((sum, s) => sum + s.price * SEED_SHARES, 0)
      const initialCash = new Decimal(Math.max(0, 100000 - seedCost))

      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          cashBalance: initialCash,
          positions: {
            create: seedStocks.map((s) => ({
              ticker: s.ticker,
              shares: new Decimal(SEED_SHARES),
              avgCost: new Decimal(s.price),
            })),
          },
          trades: {
            create: seedStocks.map((s) => ({
              ticker: s.ticker,
              type: 'BUY' as const,
              shares: new Decimal(SEED_SHARES),
              price: new Decimal(s.price),
              total: new Decimal(s.price * SEED_SHARES),
              realizedPnl: null,
              executedAt: now,
            })),
          },
        },
        include: { positions: true },
      })
    }

    const cashBalance = Number(portfolio.cashBalance)
    const positions = portfolio.positions.map((p) => ({
      ticker: p.ticker,
      shares: Number(p.shares),
      avgCost: Number(p.avgCost),
    }))

    const totalInvested = positions.reduce((sum, p) => sum + p.shares * p.avgCost, 0)

    return {
      id: portfolio.id,
      cashBalance,
      positions,
      totalInvested,
    }
  }

  async executeTrade(req: TradeRequest): Promise<TradeResult> {
    const { userId, ticker, type, shares, price } = req
    const total = shares * price

    try {
      const result = await prisma.$transaction(async (tx) => {
        const portfolio = await tx.portfolio.findUnique({
          where: { userId },
          include: { positions: true },
        })

        if (!portfolio) {
          throw new Error('Portfolio not found. Please initialize your portfolio first.')
        }

        const cashBalance = Number(portfolio.cashBalance)

        if (type === 'BUY') {
          if (cashBalance < total) {
            throw new Error(
              `Insufficient cash balance. Required: $${total.toFixed(2)}, Available: $${cashBalance.toFixed(2)}`
            )
          }

          const newCash = cashBalance - total

          const existingPosition = portfolio.positions.find((p) => p.ticker === ticker)

          if (existingPosition) {
            const existingShares = Number(existingPosition.shares)
            const existingAvgCost = Number(existingPosition.avgCost)
            const newShares = existingShares + shares
            const newAvgCost = (existingShares * existingAvgCost + shares * price) / newShares

            await tx.position.update({
              where: { id: existingPosition.id },
              data: {
                shares: new Decimal(newShares),
                avgCost: new Decimal(newAvgCost),
              },
            })
          } else {
            await tx.position.create({
              data: {
                portfolioId: portfolio.id,
                ticker,
                shares: new Decimal(shares),
                avgCost: new Decimal(price),
              },
            })
          }

          await tx.portfolio.update({
            where: { id: portfolio.id },
            data: { cashBalance: new Decimal(newCash) },
          })

          const trade = await tx.trade.create({
            data: {
              portfolioId: portfolio.id,
              ticker,
              type: 'BUY',
              shares: new Decimal(shares),
              price: new Decimal(price),
              total: new Decimal(total),
              realizedPnl: null,
            },
          })

          return {
            trade: {
              id: trade.id,
              ticker: trade.ticker,
              type: trade.type,
              shares: Number(trade.shares),
              price: Number(trade.price),
              total: Number(trade.total),
              realizedPnl: null,
              executedAt: trade.executedAt,
            },
            cashBalance: newCash,
          }
        } else {
          // SELL
          const existingPosition = portfolio.positions.find((p) => p.ticker === ticker)
          if (!existingPosition) {
            throw new Error(`No position found for ${ticker}`)
          }

          const existingShares = Number(existingPosition.shares)
          if (existingShares < shares) {
            throw new Error(
              `Insufficient shares. Required: ${shares}, Available: ${existingShares}`
            )
          }

          const avgCost = Number(existingPosition.avgCost)
          const realizedPnl = (price - avgCost) * shares
          const newCash = cashBalance + total
          const remainingShares = existingShares - shares

          if (remainingShares <= 0) {
            await tx.position.delete({ where: { id: existingPosition.id } })
          } else {
            await tx.position.update({
              where: { id: existingPosition.id },
              data: { shares: new Decimal(remainingShares) },
            })
          }

          await tx.portfolio.update({
            where: { id: portfolio.id },
            data: { cashBalance: new Decimal(newCash) },
          })

          const trade = await tx.trade.create({
            data: {
              portfolioId: portfolio.id,
              ticker,
              type: 'SELL',
              shares: new Decimal(shares),
              price: new Decimal(price),
              total: new Decimal(total),
              realizedPnl: new Decimal(realizedPnl),
            },
          })

          return {
            trade: {
              id: trade.id,
              ticker: trade.ticker,
              type: trade.type,
              shares: Number(trade.shares),
              price: Number(trade.price),
              total: Number(trade.total),
              realizedPnl,
              executedAt: trade.executedAt,
            },
            cashBalance: newCash,
          }
        }
      })

      return {
        success: true,
        trade: result.trade,
        portfolio: { cashBalance: result.cashBalance },
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Trade execution failed',
      }
    }
  }

  async getTransactions(userId: string, limit = 50) {
    const portfolio = await prisma.portfolio.findUnique({ where: { userId } })
    if (!portfolio) return []

    return prisma.trade.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { executedAt: 'desc' },
      take: limit,
    })
  }

  async deposit(userId: string, amount: number): Promise<{ cashBalance: number }> {
    const portfolio = await prisma.portfolio.findUnique({ where: { userId } })
    if (!portfolio) {
      throw new Error('Portfolio not found')
    }
    const newBalance = Number(portfolio.cashBalance) + amount
    const updated = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { cashBalance: new Decimal(newBalance) },
    })
    return { cashBalance: Number(updated.cashBalance) }
  }

  async withdraw(userId: string, amount: number): Promise<{ cashBalance: number }> {
    const portfolio = await prisma.portfolio.findUnique({ where: { userId } })
    if (!portfolio) {
      throw new Error('Portfolio not found')
    }
    const currentBalance = Number(portfolio.cashBalance)
    if (currentBalance < amount) {
      throw new Error(
        `Insufficient balance. Requested: $${amount.toFixed(2)}, Available: $${currentBalance.toFixed(2)}`
      )
    }
    const newBalance = currentBalance - amount
    const updated = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { cashBalance: new Decimal(newBalance) },
    })
    return { cashBalance: Number(updated.cashBalance) }
  }
}

export const portfolioService = new PortfolioService()
