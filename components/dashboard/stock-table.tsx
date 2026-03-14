'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Settings2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Stock, ColumnConfig, ColumnKey } from '@/lib/types'

interface StockTableProps {
  stocks: Stock[]
  columns: ColumnConfig[]
  onColumnsChange: (columns: ColumnConfig[]) => void
  onStockSelect: (stock: Stock) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return value.toString()
}

function getCellValue(stock: Stock, columnKey: ColumnKey): React.ReactNode {
  const marketValue = stock.currentPrice * stock.shares
  const dayChange = (stock.currentPrice - stock.previousClose) * stock.shares
  const dayChangePercent = ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100
  const totalGain = (stock.currentPrice - stock.avgCost) * stock.shares
  const totalGainPercent = ((stock.currentPrice - stock.avgCost) / stock.avgCost) * 100

  switch (columnKey) {
    case 'shares':
      return stock.shares
    case 'avgCost':
      return formatCurrency(stock.avgCost)
    case 'currentPrice':
      return formatCurrency(stock.currentPrice)
    case 'marketValue':
      return formatCurrency(marketValue)
    case 'dayChange':
      return (
        <span className={dayChange >= 0 ? 'text-primary' : 'text-destructive'}>
          {dayChange >= 0 ? '+' : ''}{formatCurrency(dayChange)}
        </span>
      )
    case 'dayChangePercent':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${dayChangePercent >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
          {dayChangePercent >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%
        </span>
      )
    case 'totalGain':
      return (
        <span className={totalGain >= 0 ? 'text-primary' : 'text-destructive'}>
          {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
        </span>
      )
    case 'totalGainPercent':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${totalGainPercent >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
          {totalGainPercent >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
        </span>
      )
    case 'dayHigh':
      return formatCurrency(stock.dayHigh)
    case 'dayLow':
      return formatCurrency(stock.dayLow)
    case 'volume':
      return formatNumber(stock.volume)
    case 'marketCap':
      return stock.marketCap
    case 'peRatio':
      return stock.peRatio?.toFixed(2) || '-'
    case 'dividendYield':
      return stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '-'
    default:
      return '-'
  }
}

export function StockTable({ stocks, columns, onColumnsChange, onStockSelect }: StockTableProps) {
  const router = useRouter()
  const [hoveredStock, setHoveredStock] = useState<string | null>(null)
  const visibleColumns = columns.filter(col => col.visible)

  const toggleColumn = (key: ColumnKey) => {
    const newColumns = columns.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    )
    onColumnsChange(newColumns)
  }

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold text-foreground">Your Holdings</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent border-border/60 text-xs h-7 px-2.5">
              <Settings2 className="h-3.5 w-3.5" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map(column => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={column.visible}
                onCheckedChange={() => toggleColumn(column.key)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Symbol</th>
                {visibleColumns.map(col => (
                  <th key={col.key} className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {col.label}
                  </th>
                ))}
                <th className="text-center py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-12">Details</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(stock => (
                <tr
                  key={stock.symbol}
                  className={`border-b border-border/30 cursor-pointer transition-colors ${
                    hoveredStock === stock.symbol ? 'bg-accent/60' : 'hover:bg-accent/40'
                  }`}
                  onMouseEnter={() => setHoveredStock(stock.symbol)}
                  onMouseLeave={() => setHoveredStock(null)}
                  onClick={() => onStockSelect(stock)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground">{stock.symbol}</span>
                      <span className="text-xs text-muted-foreground">{stock.name}</span>
                    </div>
                  </td>
                  {visibleColumns.map(col => (
                    <td key={col.key} className="text-right py-3.5 px-4 text-sm text-foreground tabular-nums">
                      {getCellValue(stock, col.key)}
                    </td>
                  ))}
                  <td className="py-4 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/stock/${stock.symbol}`)
                      }}
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      <span className="sr-only">View {stock.symbol} details</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
