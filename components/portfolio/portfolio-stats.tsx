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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stat.positive === null
                  ? 'text-foreground'
                  : stat.positive
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              {stat.positive !== null && stat.positive ? '+' : ''}
              {stat.value}
            </div>
            {stat.subValue && (
              <p
                className={`text-sm mt-1 ${
                  stat.positive ? 'text-green-500' : 'text-red-500'
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
