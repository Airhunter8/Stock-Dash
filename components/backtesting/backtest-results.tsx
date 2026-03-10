'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface BacktestResult {
  ticker: string
  startDate: string
  endDate: string
  initialCapital: number
  finalValue: number
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  maxDrawdownPercent: number
  winRate: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  trades: Array<{
    date: string
    type: string
    price: number
    shares: number
    value: number
    pnl?: number
    pnlPercent?: number
  }>
}

interface BacktestResultsProps {
  result: BacktestResult
}

function fmt(v: number) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function BacktestResults({ result }: BacktestResultsProps) {
  // Reconstruct equity curve from trades
  const equityCurve = useMemo(() => {
    let equity = result.initialCapital
    const points: { date: string; value: number }[] = [
      { date: result.startDate, value: equity },
    ]
    for (const trade of result.trades) {
      if (trade.pnl !== undefined) {
        equity += trade.pnl
      }
      points.push({ date: trade.date, value: equity })
    }
    points.push({ date: result.endDate, value: result.finalValue })
    return points
  }, [result])

  const stats = [
    {
      label: 'Total Return',
      value: fmtPct(result.totalReturnPercent),
      positive: result.totalReturnPercent >= 0,
    },
    {
      label: 'Annualized Return',
      value: fmtPct(result.annualizedReturn),
      positive: result.annualizedReturn >= 0,
    },
    {
      label: 'Sharpe Ratio',
      value: result.sharpeRatio.toFixed(2),
      positive: result.sharpeRatio >= 1,
    },
    {
      label: 'Max Drawdown',
      value: fmtPct(-Math.abs(result.maxDrawdownPercent)),
      positive: false,
    },
    {
      label: 'Win Rate',
      value: `${result.winRate.toFixed(1)}%`,
      positive: result.winRate >= 50,
    },
    {
      label: 'Total Trades',
      value: String(result.totalTrades),
      positive: null,
    },
    {
      label: 'Avg Win',
      value: fmt(result.avgWin),
      positive: true,
    },
    {
      label: 'Profit Factor',
      value: result.profitFactor.toFixed(2),
      positive: result.profitFactor >= 1,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Results: {result.ticker}
            <span className="text-sm font-normal text-muted-foreground">
              {formatDate(result.startDate)} — {formatDate(result.endDate)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Initial: <span className="text-foreground font-medium">{fmt(result.initialCapital)}</span>
            </span>
            <span className="text-muted-foreground">
              Final: <span className="text-foreground font-medium">{fmt(result.finalValue)}</span>
            </span>
            <span className={result.totalReturn >= 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
              {result.totalReturn >= 0 ? '+' : ''}{fmt(result.totalReturn)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p
                className={`text-xl font-bold ${
                  stat.positive === null
                    ? 'text-foreground'
                    : stat.positive
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Equity curve */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={equityCurve} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                }
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                formatter={(v: any) => [fmt(v), 'Portfolio Value']}
                labelFormatter={(l) => formatDate(l)}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Portfolio Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trade history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Trade History
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {result.winningTrades}W / {result.losingTrades}L
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.trades.map((trade, idx) => {
                  const isBuy = trade.type === 'BUY'
                  const pnlPos = trade.pnl !== undefined && trade.pnl >= 0
                  return (
                    <TableRow key={idx}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(trade.date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            isBuy
                              ? 'text-green-500 border-green-500/30 bg-green-500/10'
                              : 'text-red-500 border-red-500/30 bg-red-500/10'
                          }
                        >
                          {trade.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{fmt(trade.price)}</TableCell>
                      <TableCell className="text-right">{trade.shares}</TableCell>
                      <TableCell className="text-right">{fmt(trade.value)}</TableCell>
                      <TableCell className="text-right">
                        {trade.pnl !== undefined ? (
                          <span className={pnlPos ? 'text-green-500' : 'text-red-500'}>
                            {pnlPos ? '+' : ''}
                            {fmt(trade.pnl)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
