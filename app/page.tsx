'use client'

import { useState, useCallback } from 'react'
import { Header } from '@/components/dashboard/header'
import { PortfolioSummary } from '@/components/dashboard/portfolio-summary'
import { StockTable } from '@/components/dashboard/stock-table'
import { NewsFeed } from '@/components/dashboard/news-feed'
import { StockDetailModal } from '@/components/dashboard/stock-detail-modal'
import { Watchlist } from '@/components/dashboard/watchlist'
import { PortfolioChart } from '@/components/dashboard/portfolio-chart'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { MarketStatus } from '@/components/dashboard/market-status'
import { 
  mockStocks, 
  calculatePortfolioSummary, 
  mockNews, 
  mockWatchlist, 
  defaultColumns 
} from '@/lib/mock-data'
import type { Stock, ColumnConfig } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

const INITIAL_CASH = 25000

export default function DashboardPage() {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks)
  const [cash, setCash] = useState(INITIAL_CASH)
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  const portfolioSummary = calculatePortfolioSummary(stocks, cash)
  const portfolioSymbols = stocks.map(s => s.symbol)

  const filteredStocks = searchQuery
    ? stocks.filter(
        s =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stocks

  const handleStockSelect = useCallback((stock: Stock) => {
    setSelectedStock(stock)
    setIsModalOpen(true)
  }, [])

  const handleTrade = useCallback((symbol: string, shares: number, action: 'buy' | 'sell') => {
    const stock = stocks.find(s => s.symbol === symbol)
    if (!stock) return

    const totalCost = stock.currentPrice * shares

    if (action === 'buy') {
      if (totalCost > cash) {
        toast({
          title: 'Insufficient funds',
          description: `You need ${totalCost.toFixed(2)} but only have ${cash.toFixed(2)} available.`,
          variant: 'destructive'
        })
        return
      }

      setStocks(prev =>
        prev.map(s =>
          s.symbol === symbol
            ? {
                ...s,
                shares: s.shares + shares,
                avgCost: (s.avgCost * s.shares + totalCost) / (s.shares + shares)
              }
            : s
        )
      )
      setCash(prev => prev - totalCost)
      toast({
        title: 'Order executed',
        description: `Bought ${shares} shares of ${symbol} for $${totalCost.toFixed(2)}`,
      })
    } else {
      if (shares > stock.shares) {
        toast({
          title: 'Insufficient shares',
          description: `You only own ${stock.shares} shares of ${symbol}.`,
          variant: 'destructive'
        })
        return
      }

      setStocks(prev =>
        prev.map(s =>
          s.symbol === symbol
            ? { ...s, shares: s.shares - shares }
            : s
        ).filter(s => s.shares > 0)
      )
      setCash(prev => prev + totalCost)
      toast({
        title: 'Order executed',
        description: `Sold ${shares} shares of ${symbol} for $${totalCost.toFixed(2)}`,
      })
    }
  }, [stocks, cash, toast])

  const handleRefresh = useCallback(() => {
    // Simulate price updates
    setStocks(prev =>
      prev.map(s => ({
        ...s,
        previousClose: s.currentPrice,
        currentPrice: s.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
        dayHigh: Math.max(s.dayHigh, s.currentPrice * 1.01),
        dayLow: Math.min(s.dayLow, s.currentPrice * 0.99),
        volume: s.volume + Math.floor(Math.random() * 100000)
      }))
    )
    toast({
      title: 'Prices updated',
      description: 'Stock prices have been refreshed.',
    })
  }, [toast])

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
                onDeposit={() => {
                  setCash(prev => prev + 10000)
                  toast({
                    title: 'Deposit successful',
                    description: '$10,000 has been added to your account.',
                  })
                }}
                onWithdraw={() => {
                  if (cash >= 5000) {
                    setCash(prev => prev - 5000)
                    toast({
                      title: 'Withdrawal successful',
                      description: '$5,000 has been withdrawn from your account.',
                    })
                  } else {
                    toast({
                      title: 'Insufficient funds',
                      description: 'You need at least $5,000 to withdraw.',
                      variant: 'destructive'
                    })
                  }
                }}
                onTrade={() => {
                  toast({
                    title: 'Coming soon',
                    description: 'Stock search functionality will be available soon.',
                  })
                }}
                onRefresh={handleRefresh}
              />
              <Watchlist items={mockWatchlist} onAddStock={() => {
                toast({
                  title: 'Coming soon',
                  description: 'Watchlist management will be available soon.',
                })
              }} />
            </div>
          </div>

          <StockTable
            stocks={filteredStocks}
            columns={columns}
            onColumnsChange={setColumns}
            onStockSelect={handleStockSelect}
          />

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
