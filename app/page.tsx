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

      {/* ── Cinematic full-bleed hero ── */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">

        {/* Chiaroscuro background — single warm light from above, falling into darkness */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 55% 65% at 50% 15%, oklch(0.26 0.055 68 / 0.75) 0%, transparent 58%),
              radial-gradient(ellipse 80% 40% at 50% 0%,  oklch(0.74 0.18 68 / 0.07) 0%, transparent 55%),
              radial-gradient(ellipse 30% 50% at 15% 80%, oklch(0.74 0.18 68 / 0.04) 0%, transparent 50%),
              oklch(0.04 0.004 65)
            `,
          }}
        />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.74 0.18 68) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.74 0.18 68) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Dark vignette overlay at edges */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 100% at 50% 50%,
                transparent 40%,
                oklch(0.02 0.002 65 / 0.6) 100%)
            `,
          }}
        />

        {/* Center hero content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 select-none">
          {/* Thin decorative rule */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-16 bg-primary/40" />
            <span
              className="text-[10px] tracking-[0.35em] uppercase text-primary/70 font-medium"
            >
              Est. 2024
            </span>
            <div className="h-px w-16 bg-primary/40" />
          </div>

          {/* Main serif heading */}
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-bold text-foreground leading-none tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-serif)', textShadow: '0 2px 40px oklch(0.74 0.18 68 / 0.18)' }}
          >
            <span className="text-primary">Stoc</span>
            <span className="text-foreground/95">Flow</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg text-foreground/45 tracking-[0.08em] mb-10 max-w-xs"
          >
            Reinventing Stocks
          </p>

          {/* Underlined "Discover" link — editorial convention */}
          <a
            href="#dashboard"
            className="text-sm tracking-[0.2em] uppercase text-foreground/60 hover:text-primary transition-colors duration-300"
            style={{ borderBottom: '1px solid currentColor', paddingBottom: '2px' }}
          >
            Discover
          </a>
        </div>


      </section>

      {/* ── Dashboard content ── */}
      <main id="dashboard" className="px-4 md:px-6 pt-16 pb-32 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Welcome back, Trader
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm tracking-wide">{"Here's your portfolio overview"}</p>
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
      {/* spacer for fixed bottom MENU button */}

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
