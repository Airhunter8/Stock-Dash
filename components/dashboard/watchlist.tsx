'use client'

import { ArrowDown, ArrowUp, Plus, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WatchlistItem } from '@/lib/types'

interface WatchlistProps {
  items: WatchlistItem[]
  onAddStock: () => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function Watchlist({ items, onAddStock }: WatchlistProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-warning" />
          <CardTitle className="text-xl text-foreground">Watchlist</CardTitle>
        </div>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={onAddStock}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map(item => {
            const isPositive = item.change >= 0
            return (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.symbol}</p>
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatCurrency(item.price)}</p>
                  <p className={`text-sm flex items-center justify-end gap-1 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                    {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
