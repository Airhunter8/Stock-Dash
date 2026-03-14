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
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
        <div className="text-sm font-medium">No positions yet</div>
        <div className="text-xs text-muted-foreground/60">Start trading to build your portfolio.</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Ticker</TableHead>
            <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Shares</TableHead>
            <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Avg Cost</TableHead>
            <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Current Price</TableHead>
            <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Current Value</TableHead>
            <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Unrealized P/L</TableHead>
            <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">P/L %</TableHead>
            <TableHead className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((pos) => {
            const isPositive = pos.unrealizedPnl >= 0
            return (
              <TableRow key={pos.ticker} className="border-border/30 hover:bg-accent/40 transition-colors">
                <TableCell>
                  <div className="font-semibold text-sm text-foreground">{pos.ticker}</div>
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">{pos.shares.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm tabular-nums">{fmt(pos.avgCost)}</TableCell>
                <TableCell className="text-right text-sm tabular-nums">{fmt(pos.currentPrice)}</TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">{fmt(pos.currentValue)}</TableCell>
                <TableCell className={`text-right text-sm font-medium tabular-nums ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                  {isPositive ? '+' : ''}{fmt(pos.unrealizedPnl)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className={`text-xs tabular-nums font-semibold ${isPositive ? 'text-primary border-primary/30 bg-primary/10' : 'text-destructive border-destructive/30 bg-destructive/10'}`}
                  >
                    {fmtPct(pos.unrealizedPnlPercent)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTrade(pos.ticker)}
                    className="h-7 px-3 text-xs border-border/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5"
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
