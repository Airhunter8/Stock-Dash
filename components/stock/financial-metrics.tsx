'use client'

import React from "react"

import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { StockDetail } from '@/lib/types'

interface FinancialMetricsProps {
  stock: StockDetail
}

function MetricCard({ 
  icon: Icon, 
  title, 
  value, 
  subtext, 
  isPositive 
}: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string
  subtext?: string
  isPositive?: boolean 
}) {
  return (
    <div className="p-4 rounded-lg bg-secondary/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>
      <p className={`text-xl font-bold ${isPositive === undefined ? 'text-foreground' : isPositive ? 'text-primary' : 'text-destructive'}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  )
}

export function FinancialMetrics({ stock }: FinancialMetricsProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Profitability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              icon={TrendingUp}
              title="Revenue Growth"
              value={`${stock.revenueGrowth >= 0 ? '+' : ''}${stock.revenueGrowth.toFixed(1)}%`}
              subtext="Year over year"
              isPositive={stock.revenueGrowth >= 0}
            />
            <MetricCard 
              icon={DollarSign}
              title="Profit Margin"
              value={`${stock.profitMargin.toFixed(1)}%`}
              subtext="Net income / Revenue"
            />
            <MetricCard 
              icon={BarChart3}
              title="Operating Margin"
              value={`${stock.operatingMargin.toFixed(1)}%`}
              subtext="Operating income / Revenue"
            />
            <MetricCard 
              icon={TrendingUp}
              title="Return on Equity"
              value={`${stock.returnOnEquity.toFixed(1)}%`}
              subtext="Net income / Equity"
              isPositive={stock.returnOnEquity >= 15}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Financial Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Debt to Equity</span>
                <span className="text-foreground font-medium">{stock.debtToEquity.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(stock.debtToEquity, 200) / 2} 
                className="h-2 bg-secondary [&>div]:bg-chart-3" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {stock.debtToEquity < 50 ? 'Low leverage' : stock.debtToEquity < 100 ? 'Moderate leverage' : 'High leverage'}
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Current Ratio</span>
                <span className="text-foreground font-medium">{stock.currentRatio.toFixed(2)}</span>
              </div>
              <Progress 
                value={Math.min(stock.currentRatio * 33.33, 100)} 
                className="h-2 bg-secondary [&>div]:bg-primary" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {stock.currentRatio >= 1.5 ? 'Strong liquidity' : stock.currentRatio >= 1 ? 'Adequate liquidity' : 'Low liquidity'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard 
              icon={Scale}
              title="Debt/Equity"
              value={`${stock.debtToEquity.toFixed(1)}%`}
            />
            <MetricCard 
              icon={PieChart}
              title="Current Ratio"
              value={stock.currentRatio.toFixed(2)}
            />
            <MetricCard 
              icon={BarChart3}
              title="Short Interest"
              value={`${stock.shortInterest.toFixed(2)}%`}
              isPositive={stock.shortInterest < 5}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Valuation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">P/E Ratio (TTM)</p>
              <p className="text-xl font-bold text-foreground">{stock.peRatio?.toFixed(1) || '-'}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Forward P/E</p>
              <p className="text-xl font-bold text-foreground">{stock.forwardPE?.toFixed(1) || '-'}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">EPS (TTM)</p>
              <p className="text-xl font-bold text-foreground">${stock.eps?.toFixed(2) || '-'}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
              <p className="text-xl font-bold text-foreground">{stock.marketCap}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {stock.dividendYield && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Dividend Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Dividend Yield</p>
                <p className="text-2xl font-bold text-primary">{stock.dividendYield.toFixed(2)}%</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Annual Dividend</p>
                <p className="text-2xl font-bold text-foreground">${stock.dividendPerShare?.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
