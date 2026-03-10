'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { PortfolioSummary } from '@/components/dashboard/portfolio-summary'
import { StockTable } from '@/components/dashboard/stock-table'
import { NewsFeed } from '@/components/dashboard/news-feed'
import { StockDetailModal } from '@/components/dashboard/stock-detail-modal'
import { Watchlist } from '@/components/dashboard/watchlist'
import { PortfolioChart } from '@/components/dashboard/portfolio-chart'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { MarketStatus } from '@/components/dashboard/market-status'
import { mockNews, defaultColumns } from '@/lib/mock-data'
import type { Stock, ColumnConfig, PortfolioSummary as PortfolioSummaryType, WatchlistItem } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { usePortfolio } from '@/hooks/use-portfolio'
import { useWatchlist } from '@/hooks/use-watchlist'
import { useRealtimePrices } from '@/hooks/use-realtime-prices'

export default function DashboardPage() {
  const router = useRouter()
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  const { portfolio, isLoading, refetch, executeTrade, deposit } = usePortfolio()
  const { items: watchlistItems } = useWatchlist()

  const tickers = useMemo(() => portfolio?.positions.map(p => p.ticker) ?? [], [portfolio])
  const { prices } = useRealtimePrices({ tickers, enabled: tickers.length > 0 })

  // Map portfolio positions to the Stock shape StockTable expects
  // Override currentPrice with real-time Finnhub price when available
  const stocks = useMemo<Stock[]>(() => {
    if (!portfolio) return []
    return portfolio.positions.map(pos => {
      const rt = prices[pos.ticker]
      const currentPrice = rt?.price ?? pos.currentPrice
      // Use avgCost as the baseline so change reflects P&L since purchase
      const previousClose = pos.avgCost
      return {
        symbol: pos.ticker,
        name: pos.ticker,
        shares: pos.shares,
        avgCost: pos.avgCost,
        currentPrice,
        previousClose,
        dayHigh: 0,
        dayLow: 0,
        volume: rt?.volume ?? 0,
        marketCap: '-',
        peRatio: null,
        dividendYield: null,
      }
    })
  }, [portfolio, prices])

  const portfolioSummary = useMemo<PortfolioSummaryType>(() => {
    if (!portfolio) {
      return { totalValue: 0, totalCost: 0, dayChange: 0, dayChangePercent: 0, totalGain: 0, totalGainPercent: 0, availableCash: 0 }
    }
    const totalInvested = portfolio.positions.reduce((sum, p) => sum + p.avgCost * p.shares, 0)
    const totalCurrentValue = portfolio.positions.reduce((sum, p) => {
      const rtPrice = prices[p.ticker]?.price ?? p.currentPrice
      return sum + p.shares * rtPrice
    }, 0)
    const totalValue = portfolio.cashBalance + totalCurrentValue
    // dayChange = total gain/loss since purchase (not since previous close)
    const dayChange = totalCurrentValue - totalInvested
    const totalGain = dayChange
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
    const dayChangePercent = totalInvested > 0 ? (dayChange / totalInvested) * 100 : 0
    return {
      totalValue,
      totalCost: totalInvested,
      dayChange,
      dayChangePercent,
      totalGain,
      totalGainPercent,
      availableCash: portfolio.cashBalance,
    }
  }, [portfolio, prices])

  // Map store watchlist items (using ticker field) to Watchlist component shape (symbol field)
  const watchlistDisplay = useMemo<WatchlistItem[]>(() => {
    return watchlistItems.map(item => ({
      symbol: item.ticker,
      name: item.ticker,
      price: item.price ?? 0,
      change: item.change ?? 0,
      changePercent: item.changePercent ?? 0,
    }))
  }, [watchlistItems])

  const filteredStocks = searchQuery
    ? stocks.filter(
        s =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stocks

  const portfolioSymbols = stocks.map(s => s.symbol)

  const handleStockSelect = useCallback((stock: Stock) => {
    setSelectedStock(stock)
    setIsModalOpen(true)
  }, [])

  const handleTrade = useCallback(
    async (symbol: string, shares: number, action: 'buy' | 'sell') => {
      const stock = stocks.find(s => s.symbol === symbol)
      if (!stock) return
      try {
        await executeTrade(symbol, action === 'buy' ? 'BUY' : 'SELL', shares, stock.currentPrice)
        toast({
          title: 'Order executed',
          description: `${action === 'buy' ? 'Bought' : 'Sold'} ${shares} shares of ${symbol}`,
        })
      } catch (err) {
        toast({
          title: 'Trade failed',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        })
      }
    },
    [stocks, executeTrade, toast]
  )

  const handleRefresh = useCallback(async () => {
    await refetch()
    toast({ title: 'Prices updated', description: 'Portfolio data has been refreshed.' })
  }, [refetch, toast])

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} />

      <main className="px-4 md:px-6 py-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, Trader</h2>
            <p className="text-muted-foreground mt-1">{"Here's your portfolio overview"}</p>
          </div>
          <MarketStatus />
        </div>

        <div className="space-y-6">
          <PortfolioSummary summary={portfolioSummary} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PortfolioChart totalValue={portfolioSummary.totalValue} />
            </div>
            <div className="space-y-6">
              <QuickActions
                onDeposit={async () => {
                  try {
                    await deposit(10000)
                    toast({ title: 'Deposit successful', description: '$10,000 has been added to your account.' })
                  } catch {
                    toast({ title: 'Deposit failed', description: 'Could not process deposit.', variant: 'destructive' })
                  }
                }}
                onWithdraw={() => {
                  toast({ title: 'Coming soon', description: 'Withdrawals will be available soon.' })
                }}
                onTrade={() => router.push('/search')}
                onRefresh={handleRefresh}
              />
              <Watchlist items={watchlistDisplay} onAddStock={() => router.push('/watchlist')} />
            </div>
          </div>

          {isLoading && stocks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Loading portfolio...</div>
          ) : (
            <StockTable
              stocks={filteredStocks}
              columns={columns}
              onColumnsChange={setColumns}
              onStockSelect={handleStockSelect}
            />
          )}

          <NewsFeed articles={mockNews} portfolioSymbols={portfolioSymbols} />
        </div>
      </main>

      <StockDetailModal
        stock={selectedStock}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTrade={handleTrade}
      />

      <Toaster />
    </div>
  )
}
