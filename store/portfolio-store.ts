import { create } from 'zustand'

export interface PortfolioPosition {
  ticker: string
  shares: number
  avgCost: number
  currentPrice: number
  currentValue: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
  changePercent: number
  dayChange: number
}

export interface PortfolioResponse {
  id: string
  cashBalance: number
  positions: PortfolioPosition[]
  totalValue: number
  totalUnrealizedPnl: number
  dayChange: number
  dayChangePercent: number
}

interface PortfolioStore {
  portfolio: PortfolioResponse | null
  isLoading: boolean
  error: string | null
  setPortfolio: (p: PortfolioResponse) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  applyTrade: (ticker: string, type: 'BUY' | 'SELL', shares: number, price: number) => void
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolio: null,
  isLoading: false,
  error: null,

  setPortfolio: (p) => set({ portfolio: p }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),

  applyTrade: (ticker, type, shares, price) => {
    const { portfolio } = get()
    if (!portfolio) return

    const total = shares * price

    if (type === 'BUY') {
      const existingIdx = portfolio.positions.findIndex((p) => p.ticker === ticker)
      let newPositions: PortfolioPosition[]

      if (existingIdx >= 0) {
        newPositions = portfolio.positions.map((pos, idx) => {
          if (idx !== existingIdx) return pos
          const newShares = pos.shares + shares
          const newAvgCost = (pos.avgCost * pos.shares + total) / newShares
          const newValue = newShares * pos.currentPrice
          const unrealizedPnl = newValue - newAvgCost * newShares
          const unrealizedPnlPercent = (unrealizedPnl / (newAvgCost * newShares)) * 100
          return {
            ...pos,
            shares: newShares,
            avgCost: newAvgCost,
            currentValue: newValue,
            unrealizedPnl,
            unrealizedPnlPercent,
          }
        })
      } else {
        const newPos: PortfolioPosition = {
          ticker,
          shares,
          avgCost: price,
          currentPrice: price,
          currentValue: total,
          unrealizedPnl: 0,
          unrealizedPnlPercent: 0,
        }
        newPositions = [...portfolio.positions, newPos]
      }

      const cashBalance = portfolio.cashBalance - total
      const totalValue = newPositions.reduce((acc, p) => acc + p.currentValue, 0) + cashBalance
      const totalUnrealizedPnl = newPositions.reduce((acc, p) => acc + p.unrealizedPnl, 0)

      set({
        portfolio: {
          ...portfolio,
          cashBalance,
          positions: newPositions,
          totalValue,
          totalUnrealizedPnl,
        },
      })
    } else {
      const newPositions = portfolio.positions
        .map((pos) => {
          if (pos.ticker !== ticker) return pos
          const newShares = pos.shares - shares
          if (newShares <= 0) return null
          const newValue = newShares * pos.currentPrice
          const unrealizedPnl = newValue - pos.avgCost * newShares
          const unrealizedPnlPercent = (unrealizedPnl / (pos.avgCost * newShares)) * 100
          return {
            ...pos,
            shares: newShares,
            currentValue: newValue,
            unrealizedPnl,
            unrealizedPnlPercent,
          }
        })
        .filter(Boolean) as PortfolioPosition[]

      const cashBalance = portfolio.cashBalance + total
      const totalValue = newPositions.reduce((acc, p) => acc + p.currentValue, 0) + cashBalance
      const totalUnrealizedPnl = newPositions.reduce((acc, p) => acc + p.unrealizedPnl, 0)

      set({
        portfolio: {
          ...portfolio,
          cashBalance,
          positions: newPositions,
          totalValue,
          totalUnrealizedPnl,
        },
      })
    }
  },
}))
