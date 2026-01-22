'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { allStocks } from '@/lib/mock-data'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Loading from './loading'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams?.get('query') || ''

  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return allStocks
    const lowerQuery = searchQuery.toLowerCase()
    return allStocks.filter(
      stock =>
        stock.symbol.toLowerCase().includes(lowerQuery) ||
        stock.name.toLowerCase().includes(lowerQuery) ||
        stock.sector.toLowerCase().includes(lowerQuery)
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search Stocks</h1>
          <p className="text-muted-foreground">
            Find stocks by symbol, company name, or sector
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a stock (e.g., AAPL, Apple, Technology)"
            value={searchQuery}
            onChange={(e) => router.push(`/search?query=${e.target.value}`)}
            className="pl-12 h-14 text-lg bg-card border-border"
            autoFocus
          />
        </div>

        <Suspense fallback={<Loading />}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {searchQuery ? `Results for "${searchQuery}"` : 'All Stocks'}
                <Badge variant="secondary" className="ml-2">
                  {filteredStocks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStocks.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No stocks found matching your search.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try searching for a different symbol or company name.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStocks.map((stock) => {
                    const dayChange = stock.currentPrice - stock.previousClose
                    const dayChangePercent = (dayChange / stock.previousClose) * 100
                    const isPositive = dayChange >= 0

                    return (
                      <button
                        key={stock.symbol}
                        onClick={() => router.push(`/stock/${stock.symbol}`)}
                        className="w-full flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary transition-colors text-left"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-lg">{stock.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {stock.sector}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(stock.currentPrice)}
                          </p>
                          <p className={`text-sm flex items-center justify-end gap-1 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {isPositive ? '+' : ''}{dayChangePercent.toFixed(2)}%
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Suspense>
      </main>
    </div>
  )
}
