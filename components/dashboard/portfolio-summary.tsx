'use client'

import { ArrowDown, ArrowUp, DollarSign, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { PortfolioSummary as PortfolioSummaryType } from '@/lib/types'

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const isPositiveDay = summary.dayChange >= 0
  const isPositiveTotal = summary.totalGain >= 0

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Portfolio Value */}
      <Card className="bg-card border-border/60 overflow-hidden group hover:border-primary/40 transition-all duration-300 luxury-glow">
        <div className="h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />
        <CardContent className="pt-5 pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-foreground tabular-nums" style={{ fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(summary.totalValue)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">All positions + cash</span>
          </div>
        </CardContent>
      </Card>

      {/* Today's Change */}
      <Card className="border-border/60 overflow-hidden group hover:border-primary/40 transition-all duration-300 luxury-glow">
        <div className={`h-[2px] bg-gradient-to-r ${isPositiveDay ? 'from-emerald-400 via-emerald-500/40 to-transparent' : 'from-destructive via-destructive/40 to-transparent'}`} />
        <CardContent className="pt-5 pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">{"Today's Change"}</p>
          <p className={`text-2xl font-bold tabular-nums ${isPositiveDay ? 'text-emerald-400' : 'text-destructive'}`} style={{ fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(summary.dayChange)}
          </p>
          <p className={`text-xs mt-3 flex items-center gap-1 font-semibold tabular-nums ${isPositiveDay ? 'text-emerald-400/70' : 'text-destructive/70'}`}>
            {isPositiveDay ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {formatPercent(summary.dayChangePercent)}
          </p>
        </CardContent>
      </Card>

      {/* Total Gain/Loss */}
      <Card className="border-border/60 overflow-hidden group hover:border-primary/40 transition-all duration-300 luxury-glow">
        <div className={`h-[2px] bg-gradient-to-r ${isPositiveTotal ? 'from-emerald-400 via-emerald-500/40 to-transparent' : 'from-destructive via-destructive/40 to-transparent'}`} />
        <CardContent className="pt-5 pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Total Gain / Loss</p>
          <p className={`text-2xl font-bold tabular-nums ${isPositiveTotal ? 'text-emerald-400' : 'text-destructive'}`} style={{ fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(summary.totalGain)}
          </p>
          <p className={`text-xs mt-3 flex items-center gap-1 font-semibold tabular-nums ${isPositiveTotal ? 'text-emerald-400/70' : 'text-destructive/70'}`}>
            {isPositiveTotal ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {formatPercent(summary.totalGainPercent)}
          </p>
        </CardContent>
      </Card>

      {/* Available Cash */}
      <Card className="bg-card border-border/60 overflow-hidden group hover:border-primary/40 transition-all duration-300 luxury-glow">
        <div className="h-[2px] bg-gradient-to-r from-primary/70 via-primary/25 to-transparent" />
        <CardContent className="pt-5 pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Available Cash</p>
          <p className="text-2xl font-bold text-foreground tabular-nums" style={{ fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(summary.availableCash)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Ready to invest</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
