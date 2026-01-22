'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StockDetail } from '@/lib/types'

interface KeyStatisticsProps {
  stock: StockDetail
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function KeyStatistics({ stock }: KeyStatisticsProps) {
  const stats = [
    { label: 'Market Cap', value: stock.marketCap },
    { label: 'P/E Ratio (TTM)', value: stock.peRatio?.toFixed(2) || '-' },
    { label: 'Forward P/E', value: stock.forwardPE?.toFixed(2) || '-' },
    { label: 'EPS (TTM)', value: stock.eps ? formatCurrency(stock.eps) : '-' },
    { label: 'Dividend Yield', value: stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '-' },
    { label: 'Dividend/Share', value: stock.dividendPerShare ? formatCurrency(stock.dividendPerShare) : '-' },
    { label: '52 Week High', value: formatCurrency(stock.weekHigh52) },
    { label: '52 Week Low', value: formatCurrency(stock.weekLow52) },
    { label: 'Average Volume', value: stock.avgVolume.toLocaleString() },
    { label: 'Beta', value: stock.beta.toFixed(2) },
    { label: 'Short Interest', value: `${stock.shortInterest.toFixed(2)}%` },
    { label: 'Institutional Ownership', value: `${stock.institutionalOwnership.toFixed(1)}%` },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Key Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-sm font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
