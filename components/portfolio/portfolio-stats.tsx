'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PortfolioResponse } from '@/store/portfolio-store'

interface PortfolioStatsProps {
  portfolio: PortfolioResponse
}

function fmt(v: number) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

export function PortfolioStats({ portfolio }: PortfolioStatsProps) {
  const stats = [
    {
      label: 'Total Portfolio Value',
      value: fmt(portfolio.totalValue),
      subValue: null,
      positive: null,
    },
    {
      label: 'Available Cash',
      value: fmt(portfolio.cashBalance),
      subValue: null,
      positive: null,
    },
    {
      label: 'Unrealized P/L',
      value: fmt(portfolio.totalUnrealizedPnl),
      subValue: null,
      positive: portfolio.totalUnrealizedPnl >= 0,
    },
    {
      label: 'Day Change',
      value: fmt(portfolio.dayChange),
      subValue: fmtPct(portfolio.dayChangePercent),
      positive: portfolio.dayChange >= 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/60 overflow-hidden">
          <div className={`h-[2px] ${
            stat.positive === null
              ? 'bg-gradient-to-r from-blue-500/50 to-blue-500/10'
              : stat.positive
              ? 'bg-gradient-to-r from-primary/60 to-primary/20'
              : 'bg-gradient-to-r from-destructive/60 to-destructive/20'
          }`} />
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div
              className={`text-2xl font-bold tabular-nums ${
                stat.positive === null
                  ? 'text-foreground'
                  : stat.positive
                  ? 'text-emerald-400'
                  : 'text-destructive'
              }`}
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {stat.positive !== null && stat.positive ? '+' : ''}
              {stat.value}
            </div>
            {stat.subValue && (
              <p
                className={`text-xs mt-1 font-medium tabular-nums ${
                  stat.positive ? 'text-emerald-400/70' : 'text-destructive/70'
                }`}
              >
                {stat.subValue}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
