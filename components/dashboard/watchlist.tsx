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
    <Card className="bg-card border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-warning fill-warning/30" />
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Watchlist</CardTitle>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 bg-transparent border-border/60 text-xs h-7 px-2.5 hover:border-primary/40 hover:text-primary hover:bg-primary/5" onClick={onAddStock}>
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-1">
          {items.map(item => {
            const isPositive = item.change >= 0
            return (
              <div
                key={item.symbol}
                className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-sm text-foreground">{item.symbol}</p>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-foreground tabular-nums">{formatCurrency(item.price)}</p>
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                    {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
