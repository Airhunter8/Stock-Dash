'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CompetitorStock } from '@/lib/types'

interface CompetitorListProps {
  competitors: CompetitorStock[]
  onSelectStock: (symbol: string) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function CompetitorList({ competitors, onSelectStock }: CompetitorListProps) {
  if (competitors.length === 0) {
    return null
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Competitors & Similar Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {competitors.map((stock) => {
            const isPositive = stock.change >= 0
            return (
              <Button
                key={stock.symbol}
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-4 hover:bg-secondary"
                onClick={() => onSelectStock(stock.symbol)}
              >
                <div className="text-left">
                  <p className="font-semibold text-foreground">{stock.symbol}</p>
                  <p className="text-xs text-muted-foreground">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatCurrency(stock.price)}</p>
                  <p className={`text-xs flex items-center justify-end gap-1 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                    {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </p>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
