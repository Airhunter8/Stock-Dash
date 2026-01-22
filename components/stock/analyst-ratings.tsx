'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { StockDetail, AnalystEstimate } from '@/lib/types'

interface AnalystRatingsProps {
  stock: StockDetail
  estimates: AnalystEstimate[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'Strong Buy':
      return 'bg-primary text-primary-foreground'
    case 'Buy':
      return 'bg-primary/80 text-primary-foreground'
    case 'Hold':
      return 'bg-warning text-warning-foreground'
    case 'Sell':
      return 'bg-destructive/80 text-destructive-foreground'
    case 'Strong Sell':
      return 'bg-destructive text-destructive-foreground'
    default:
      return 'bg-secondary text-secondary-foreground'
  }
}

export function AnalystRatings({ stock, estimates }: AnalystRatingsProps) {
  const totalRatings = stock.buyRatings + stock.holdRatings + stock.sellRatings
  const buyPercent = (stock.buyRatings / totalRatings) * 100
  const holdPercent = (stock.holdRatings / totalRatings) * 100
  const sellPercent = (stock.sellRatings / totalRatings) * 100

  const priceTargetUpside = ((stock.priceTarget - stock.currentPrice) / stock.currentPrice) * 100

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Analyst Ratings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Consensus Rating</p>
              <Badge className={`text-lg px-4 py-1 ${getRatingColor(stock.analystRating)}`}>
                {stock.analystRating}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Based on</p>
              <p className="text-2xl font-bold text-foreground">{stock.numberOfAnalysts}</p>
              <p className="text-xs text-muted-foreground">analysts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-primary font-medium">Buy ({stock.buyRatings})</span>
                <span className="text-muted-foreground">{buyPercent.toFixed(0)}%</span>
              </div>
              <Progress value={buyPercent} className="h-2 bg-secondary [&>div]:bg-primary" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-warning font-medium">Hold ({stock.holdRatings})</span>
                <span className="text-muted-foreground">{holdPercent.toFixed(0)}%</span>
              </div>
              <Progress value={holdPercent} className="h-2 bg-secondary [&>div]:bg-warning" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-destructive font-medium">Sell ({stock.sellRatings})</span>
                <span className="text-muted-foreground">{sellPercent.toFixed(0)}%</span>
              </div>
              <Progress value={sellPercent} className="h-2 bg-secondary [&>div]:bg-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Price Target</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Target</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(stock.priceTarget)}</p>
              <p className={`text-sm ${priceTargetUpside >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {priceTargetUpside >= 0 ? '+' : ''}{priceTargetUpside.toFixed(1)}% from current
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
              <p className="text-xl font-semibold text-foreground">{formatCurrency(stock.currentPrice)}</p>
            </div>
          </div>

          <div className="relative pt-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Low: {formatCurrency(stock.priceTargetLow)}</span>
              <span>High: {formatCurrency(stock.priceTargetHigh)}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full relative">
              <div 
                className="absolute h-4 w-1 bg-foreground rounded-full top-1/2 -translate-y-1/2"
                style={{ 
                  left: `${((stock.currentPrice - stock.priceTargetLow) / (stock.priceTargetHigh - stock.priceTargetLow)) * 100}%` 
                }}
              />
              <div 
                className="absolute h-4 w-1 bg-primary rounded-full top-1/2 -translate-y-1/2"
                style={{ 
                  left: `${((stock.priceTarget - stock.priceTargetLow) / (stock.priceTargetHigh - stock.priceTargetLow)) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-foreground">Current</span>
              <span className="text-primary">Target</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Analyst Estimates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium py-3">Period</th>
                  <th className="text-right text-xs text-muted-foreground font-medium py-3">EPS Est.</th>
                  <th className="text-right text-xs text-muted-foreground font-medium py-3">Revenue Est.</th>
                  <th className="text-right text-xs text-muted-foreground font-medium py-3">Analysts</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((estimate) => (
                  <tr key={estimate.period} className="border-b border-border/50">
                    <td className="py-3 text-sm text-foreground font-medium">{estimate.period}</td>
                    <td className="py-3 text-sm text-foreground text-right">{formatCurrency(estimate.epsEstimate)}</td>
                    <td className="py-3 text-sm text-foreground text-right">{estimate.revenueEstimate}</td>
                    <td className="py-3 text-sm text-muted-foreground text-right">{estimate.numberOfAnalysts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
