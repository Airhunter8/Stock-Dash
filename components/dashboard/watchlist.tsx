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
          <Star className="h-3.5 w-3.5 text-warning fill-warning/40" />
          <CardTitle className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Watchlist</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 bg-transparent border-border/60 text-[10px] h-6 px-2.5 cursor-pointer hover:border-primary/50 hover:text-primary hover:bg-primary/8 transition-all"
          style={{ transitionTimingFunction: 'var(--ease-expo)', transitionDuration: '250ms' }}
          onClick={onAddStock}
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="pt-0 px-3">
        <div className="space-y-0.5">
          {items.map(item => {
            const isPositive = item.change >= 0
            return (
              <div
                key={item.symbol}
                className="relative flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer group transition-all"
                style={{ transitionTimingFunction: 'var(--ease-expo)', transitionDuration: '200ms' }}
              >
                {/* Left accent bar — slides in on hover */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-r-full h-0 group-hover:h-7 transition-all duration-200 ${isPositive ? 'bg-emerald-400' : 'bg-destructive'}`}
                  style={{ transitionTimingFunction: 'var(--ease-expo)' }}
                />
                {/* Hover background */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-white/[0.03] transition-opacity duration-200" />

                <div className="relative flex items-center gap-2.5">
                  {/* Ticker badge */}
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 ${isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
                    {item.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] text-foreground leading-none">{item.symbol}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-none truncate max-w-[80px]">{item.name}</p>
                  </div>
                </div>

                <div className="relative text-right">
                  <p className="font-semibold text-[13px] text-foreground tabular-nums leading-none">{formatCurrency(item.price)}</p>
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-destructive'}`}>
                    {isPositive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
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
