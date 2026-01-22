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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(summary.totalValue)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{"Today's Change"}</p>
              <p className={`text-3xl font-bold mt-1 ${isPositiveDay ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(summary.dayChange)}
              </p>
              <p className={`text-sm mt-1 flex items-center gap-1 ${isPositiveDay ? 'text-primary' : 'text-destructive'}`}>
                {isPositiveDay ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {formatPercent(summary.dayChangePercent)}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isPositiveDay ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              {isPositiveDay ? (
                <ArrowUp className="h-6 w-6 text-primary" />
              ) : (
                <ArrowDown className="h-6 w-6 text-destructive" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
              <p className={`text-3xl font-bold mt-1 ${isPositiveTotal ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(summary.totalGain)}
              </p>
              <p className={`text-sm mt-1 flex items-center gap-1 ${isPositiveTotal ? 'text-primary' : 'text-destructive'}`}>
                {isPositiveTotal ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {formatPercent(summary.totalGainPercent)}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isPositiveTotal ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              <DollarSign className={`h-6 w-6 ${isPositiveTotal ? 'text-primary' : 'text-destructive'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Cash</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(summary.availableCash)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ready to invest
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Wallet className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
