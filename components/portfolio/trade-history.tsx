'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Transaction } from '@/hooks/use-portfolio'

interface TradeHistoryProps {
  transactions: Transaction[]
}

function fmt(v: number) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TradeHistory({ transactions }: TradeHistoryProps) {
  if (!transactions.length) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No transactions yet.
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Ticker</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Realized P/L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const isBuy = tx.type === 'BUY'
            const pnlPositive = tx.realizedPnl !== null && tx.realizedPnl >= 0
            return (
              <TableRow key={tx.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(tx.executedAt)}
                </TableCell>
                <TableCell className="font-semibold">{tx.ticker}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      isBuy
                        ? 'text-green-500 border-green-500/30 bg-green-500/10'
                        : 'text-red-500 border-red-500/30 bg-red-500/10'
                    }
                  >
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{tx.shares.toLocaleString()}</TableCell>
                <TableCell className="text-right">{fmt(tx.price)}</TableCell>
                <TableCell className="text-right font-medium">{fmt(tx.total)}</TableCell>
                <TableCell className="text-right">
                  {tx.realizedPnl !== null ? (
                    <span className={pnlPositive ? 'text-green-500' : 'text-red-500'}>
                      {pnlPositive ? '+' : ''}
                      {fmt(tx.realizedPnl)}
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
  )
}
