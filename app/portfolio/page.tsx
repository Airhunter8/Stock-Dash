'use client'

import { useState, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PortfolioStats } from '@/components/portfolio/portfolio-stats'
import { PositionsTable } from '@/components/portfolio/positions-table'
import { TradeHistory } from '@/components/portfolio/trade-history'
import { TradeModal } from '@/components/portfolio/trade-modal'
import { usePortfolio } from '@/hooks/use-portfolio'
import { useRealtimePrices } from '@/hooks/use-realtime-prices'
import { toast } from 'sonner'

export default function PortfolioPage() {
  const { portfolio, isLoading, error, executeTrade, deposit } = usePortfolio()

  const tickers = useMemo(() => portfolio?.positions.map(p => p.ticker) ?? [], [portfolio])
  const { prices } = useRealtimePrices({ tickers, enabled: tickers.length > 0 })

  // Merge real-time prices into portfolio for display
  const enrichedPortfolio = useMemo(() => {
    if (!portfolio) return null
    const positions = portfolio.positions.map(p => {
      const rt = prices[p.ticker]
      const currentPrice = rt?.price ?? p.currentPrice
      const currentValue = p.shares * currentPrice
      const unrealizedPnl = currentValue - p.shares * p.avgCost
      const unrealizedPnlPercent = p.avgCost > 0 ? (unrealizedPnl / (p.shares * p.avgCost)) * 100 : 0
      const dayChange = unrealizedPnl
      return { ...p, currentPrice, currentValue, unrealizedPnl, unrealizedPnlPercent, dayChange, changePercent: unrealizedPnlPercent }
    })
    const totalInvestedValue = positions.reduce((sum, p) => sum + p.currentValue, 0)
    const totalValue = portfolio.cashBalance + totalInvestedValue
    const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0)
    const dayChange = positions.reduce((sum, p) => sum + p.dayChange, 0)
    const prevTotalValue = totalValue - dayChange
    const dayChangePercent = prevTotalValue > 0 ? (dayChange / prevTotalValue) * 100 : 0
    return { ...portfolio, positions, totalValue, totalUnrealizedPnl, dayChange, dayChangePercent }
  }, [portfolio, prices])
  const [tradeModal, setTradeModal] = useState<{
    open: boolean
    ticker: string
    currentPrice: number
    availableShares: number
  } | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [txLoading, setTxLoading] = useState(false)

  const fetchTransactions = useCallback(async () => {
    try {
      setTxLoading(true)
      const res = await fetch('/api/portfolio/transactions')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch {
      // ignore
    } finally {
      setTxLoading(false)
    }
  }, [])

  const handleOpenTrade = useCallback(
    async (ticker: string) => {
      if (!enrichedPortfolio) return
      const pos = enrichedPortfolio.positions.find((p) => p.ticker === ticker)
      let currentPrice = pos?.currentPrice ?? 0

      // Fetch live quote if no position
      if (!currentPrice) {
        try {
          const res = await fetch(`/api/stocks/${ticker}/quote`)
          if (res.ok) {
            const q = await res.json()
            currentPrice = q.price ?? 0
          }
        } catch {
          // ignore
        }
      }

      setTradeModal({
        open: true,
        ticker,
        currentPrice,
        availableShares: pos?.shares ?? 0,
      })
    },
    [enrichedPortfolio]
  )

  const handleTrade = useCallback(
    async (type: 'BUY' | 'SELL', shares: number, price: number) => {
      if (!tradeModal) return
      try {
        await executeTrade(tradeModal.ticker, type, shares, price)
        toast.success(`${type} order executed`, {
          description: `${type === 'BUY' ? 'Bought' : 'Sold'} ${shares} shares of ${tradeModal.ticker} at $${price.toFixed(2)}`,
        })
      } catch (err) {
        toast.error('Order failed', {
          description: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    },
    [tradeModal, executeTrade]
  )

  const handleDeposit = useCallback(async () => {
    try {
      await deposit(10000)
      toast.success('Deposit successful', { description: '$10,000 added to your account' })
    } catch {
      toast.error('Deposit failed')
    }
  }, [deposit])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Failed to load portfolio</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 md:px-6 py-6 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Portfolio</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your positions and track performance</p>
          </div>
          <Button onClick={handleDeposit} variant="outline">
            + Deposit $10,000
          </Button>
        </div>

        {/* Stats */}
        {isLoading && !enrichedPortfolio ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : enrichedPortfolio ? (
          <PortfolioStats portfolio={enrichedPortfolio} />
        ) : null}

        {/* Tabs */}
        <Tabs defaultValue="positions" onValueChange={(v) => v === 'transactions' && fetchTransactions()}>
          <TabsList>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="mt-4">
            {isLoading && !enrichedPortfolio ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : enrichedPortfolio ? (
              <PositionsTable
                positions={enrichedPortfolio.positions}
                onTrade={handleOpenTrade}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            {txLoading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : (
              <TradeHistory transactions={transactions} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {tradeModal && enrichedPortfolio && (
        <TradeModal
          ticker={tradeModal.ticker}
          currentPrice={tradeModal.currentPrice}
          availableShares={tradeModal.availableShares}
          availableCash={enrichedPortfolio.cashBalance}
          open={tradeModal.open}
          onClose={() => setTradeModal(null)}
          onTrade={handleTrade}
        />
      )}
    </div>
  )
}
