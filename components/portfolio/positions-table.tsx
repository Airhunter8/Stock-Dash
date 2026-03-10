'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PortfolioPosition } from '@/store/portfolio-store'

interface PositionsTableProps {
  positions: PortfolioPosition[]
  onTrade: (ticker: string) => void
}

function fmt(v: number) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

export function PositionsTable({ positions, onTrade }: PositionsTableProps) {
  if (!positions.length) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No positions yet. Start trading to build your portfolio.
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Avg Cost</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Current Value</TableHead>
            <TableHead className="text-right">Unrealized P/L</TableHead>
            <TableHead className="text-right">P/L %</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((pos) => {
            const isPositive = pos.unrealizedPnl >= 0
            return (
              <TableRow key={pos.ticker}>
                <TableCell>
                  <div className="font-semibold text-foreground">{pos.ticker}</div>
                </TableCell>
                <TableCell className="text-right">{pos.shares.toLocaleString()}</TableCell>
                <TableCell className="text-right">{fmt(pos.avgCost)}</TableCell>
                <TableCell className="text-right">{fmt(pos.currentPrice)}</TableCell>
                <TableCell className="text-right font-medium">{fmt(pos.currentValue)}</TableCell>
                <TableCell className={`text-right font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{fmt(pos.unrealizedPnl)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className={`${isPositive ? 'text-green-500 border-green-500/30 bg-green-500/10' : 'text-red-500 border-red-500/30 bg-red-500/10'}`}
                  >
                    {fmtPct(pos.unrealizedPnlPercent)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTrade(pos.ticker)}
                    className="h-7 px-3 text-xs"
                  >
                    Trade
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
