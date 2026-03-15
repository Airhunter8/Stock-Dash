'use client'

import { ArrowDown, ArrowUp, TrendingUp, Wallet, Activity, BarChart2 } from 'lucide-react'
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
      <Card className="overflow-hidden group cursor-default select-none">
        <div className="h-[3px] bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        <CardContent className="pt-5 pb-5 px-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Portfolio Value</p>
            <div className="h-7 w-7 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors" style={{ transitionTimingFunction: 'var(--ease-expo)' }}>
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-[1.6rem] font-bold text-foreground tabular-nums leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(summary.totalValue)}
          </p>
          <p className="mt-2.5 text-[10px] text-muted-foreground/70">All positions + cash</p>
        </CardContent>
      </Card>

      {/* Today's Change */}
      <Card className="overflow-hidden group cursor-default select-none">
        <div className={`h-[3px] bg-gradient-to-r ${isPositiveDay ? 'from-emerald-400 via-emerald-500/50 to-transparent' : 'from-destructive via-destructive/50 to-transparent'}`} />
        <CardContent className="pt-5 pb-5 px-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{"Today's Change"}</p>
            <div className={`h-7 w-7 rounded-xl ring-1 flex items-center justify-center transition-colors ${isPositiveDay ? 'bg-emerald-400/10 ring-emerald-400/20 group-hover:bg-emerald-400/15' : 'bg-destructive/10 ring-destructive/20 group-hover:bg-destructive/15'}`} style={{ transitionTimingFunction: 'var(--ease-expo)' }}>
              <Activity className={`h-3.5 w-3.5 ${isPositiveDay ? 'text-emerald-400' : 'text-destructive'}`} />
            </div>
          </div>
          <p className={`text-[1.6rem] font-bold tabular-nums leading-none ${isPositiveDay ? 'text-emerald-400' : 'text-destructive'}`} style={{ fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(summary.dayChange)}
          </p>
          <span className={`inline-flex items-center gap-1 mt-2.5 text-[10px] font-semibold tabular-nums px-2 py-0.5 rounded-full ${isPositiveDay ? 'bg-emerald-400/10 text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
            {isPositiveDay ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {formatPercent(summary.dayChangePercent)}
          </span>
        </CardContent>
      </Card>

      {/* Total Gain/Loss */}
      <Card className="overflow-hidden group cursor-default select-none">
        <div className={`h-[3px] bg-gradient-to-r ${isPositiveTotal ? 'from-emerald-400 via-emerald-500/50 to-transparent' : 'from-destructive via-destructive/50 to-transparent'}`} />
        <CardContent className="pt-5 pb-5 px-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Total Gain / Loss</p>
            <div className={`h-7 w-7 rounded-xl ring-1 flex items-center justify-center transition-colors ${isPositiveTotal ? 'bg-emerald-400/10 ring-emerald-400/20 group-hover:bg-emerald-400/15' : 'bg-destructive/10 ring-destructive/20 group-hover:bg-destructive/15'}`} style={{ transitionTimingFunction: 'var(--ease-expo)' }}>
              <BarChart2 className={`h-3.5 w-3.5 ${isPositiveTotal ? 'text-emerald-400' : 'text-destructive'}`} />
            </div>
          </div>
          <p className={`text-[1.6rem] font-bold tabular-nums leading-none ${isPositiveTotal ? 'text-emerald-400' : 'text-destructive'}`} style={{ fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(summary.totalGain)}
          </p>
          <span className={`inline-flex items-center gap-1 mt-2.5 text-[10px] font-semibold tabular-nums px-2 py-0.5 rounded-full ${isPositiveTotal ? 'bg-emerald-400/10 text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
            {isPositiveTotal ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {formatPercent(summary.totalGainPercent)}
          </span>
        </CardContent>
      </Card>

      {/* Available Cash */}
      <Card className="overflow-hidden group cursor-default select-none">
        <div className="h-[3px] bg-gradient-to-r from-primary/60 via-primary/25 to-transparent" />
        <CardContent className="pt-5 pb-5 px-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Available Cash</p>
            <div className="h-7 w-7 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors" style={{ transitionTimingFunction: 'var(--ease-expo)' }}>
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-[1.6rem] font-bold text-foreground tabular-nums leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(summary.availableCash)}
          </p>
          <p className="mt-2.5 text-[10px] text-muted-foreground/70">Ready to invest</p>
        </CardContent>
      </Card>

    </div>
  )
}
