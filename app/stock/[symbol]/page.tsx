'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowDown, ArrowUp, Star, Plus, ExternalLink, Building2, Users, Calendar, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getStockDetail, getStockNews, getCompetitors, getAnalystEstimates, getEarningsHistory, generatePriceHistory } from '@/lib/mock-data'
import type { StockDetail, NewsArticle, CompetitorStock, AnalystEstimate, EarningsData } from '@/lib/types'
import { StockPriceChart } from '@/components/stock/stock-price-chart'
import { KeyStatistics } from '@/components/stock/key-statistics'
import { AnalystRatings } from '@/components/stock/analyst-ratings'
import { StockNews } from '@/components/stock/stock-news'
import { CompetitorList } from '@/components/stock/competitor-list'
import { EarningsTable } from '@/components/stock/earnings-table'
import { FinancialMetrics } from '@/components/stock/financial-metrics'
import { TradePanel } from '@/components/stock/trade-panel'
import { useToast } from '@/hooks/use-toast'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const symbol = params.symbol as string
  
  const [stock, setStock] = useState<StockDetail | null>(null)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [competitors, setCompetitors] = useState<CompetitorStock[]>([])
  const [estimates, setEstimates] = useState<AnalystEstimate[]>([])
  const [earnings, setEarnings] = useState<EarningsData[]>([])
  const [priceHistory, setPriceHistory] = useState<{ date: string; price: number; volume: number }[]>([])
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (symbol) {
      const stockData = getStockDetail(symbol)
      if (stockData) {
        setStock(stockData)
        setNews(getStockNews(symbol))
        setCompetitors(getCompetitors(symbol))
        setEstimates(getAnalystEstimates(symbol))
        setEarnings(getEarningsHistory(symbol))
        setPriceHistory(generatePriceHistory(stockData.currentPrice, 365))
      }
      setLoading(false)
    }
  }, [symbol])

  const handleAddToWatchlist = () => {
    setIsInWatchlist(!isInWatchlist)
    toast({
      title: isInWatchlist ? 'Removed from Watchlist' : 'Added to Watchlist',
      description: `${symbol} has been ${isInWatchlist ? 'removed from' : 'added to'} your watchlist.`
    })
  }

  const handleTrade = (shares: number, action: 'buy' | 'sell') => {
    toast({
      title: `${action === 'buy' ? 'Buy' : 'Sell'} Order Placed`,
      description: `${action === 'buy' ? 'Bought' : 'Sold'} ${shares} shares of ${symbol} at ${formatCurrency(stock?.currentPrice || 0)}.`
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Stock Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The stock symbol &quot;{symbol}&quot; was not found in our database.
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dayChange = stock.currentPrice - stock.previousClose
  const dayChangePercent = (dayChange / stock.previousClose) * 100
  const isPositive = dayChange >= 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{stock.symbol}</h1>
                  <Badge variant="secondary" className="text-xs">
                    {stock.exchange}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{stock.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isInWatchlist ? 'default' : 'outline'}
                size="sm"
                onClick={handleAddToWatchlist}
              >
                <Star className={`h-4 w-4 mr-2 ${isInWatchlist ? 'fill-current' : ''}`} />
                {isInWatchlist ? 'Watching' : 'Watch'}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`https://${stock.website}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold text-foreground">
                    {formatCurrency(stock.currentPrice)}
                  </span>
                  <div className={`flex items-center gap-1 text-xl ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                    {isPositive ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                    <span>{isPositive ? '+' : ''}{formatCurrency(dayChange)}</span>
                    <span>({dayChangePercent.toFixed(2)}%)</span>
                  </div>
                </div>
                
                <StockPriceChart priceHistory={priceHistory} isPositive={isPositive} />
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-secondary">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">About {stock.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {stock.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Headquarters</p>
                          <p className="text-sm text-foreground font-medium">{stock.headquarters}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Employees</p>
                          <p className="text-sm text-foreground font-medium">{stock.employees.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Founded</p>
                          <p className="text-sm text-foreground font-medium">{stock.founded}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">CEO</p>
                          <p className="text-sm text-foreground font-medium">{stock.ceo}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <KeyStatistics stock={stock} />
                
                <CompetitorList competitors={competitors} onSelectStock={(s) => router.push(`/stock/${s}`)} />
              </TabsContent>
              
              <TabsContent value="financials" className="mt-6">
                <FinancialMetrics stock={stock} />
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-6">
                <AnalystRatings stock={stock} estimates={estimates} />
              </TabsContent>
              
              <TabsContent value="news" className="mt-6">
                <StockNews news={news} symbol={stock.symbol} />
              </TabsContent>
              
              <TabsContent value="earnings" className="mt-6">
                <EarningsTable earnings={earnings} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <TradePanel stock={stock} onTrade={handleTrade} />
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Previous Close</span>
                  <span className="text-sm text-foreground font-medium">{formatCurrency(stock.previousClose)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Open</span>
                  <span className="text-sm text-foreground font-medium">{formatCurrency(stock.open)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Day Range</span>
                  <span className="text-sm text-foreground font-medium">
                    {formatCurrency(stock.dayLow)} - {formatCurrency(stock.dayHigh)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">52 Week Range</span>
                  <span className="text-sm text-foreground font-medium">
                    {formatCurrency(stock.weekLow52)} - {formatCurrency(stock.weekHigh52)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volume</span>
                  <span className="text-sm text-foreground font-medium">{stock.volume.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Volume</span>
                  <span className="text-sm text-foreground font-medium">{stock.avgVolume.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Cap</span>
                  <span className="text-sm text-foreground font-medium">{stock.marketCap}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Beta</span>
                  <span className="text-sm text-foreground font-medium">{stock.beta.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base">Sector & Industry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sector</p>
                  <Badge variant="secondary">{stock.sector}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Industry</p>
                  <Badge variant="outline">{stock.industry}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
