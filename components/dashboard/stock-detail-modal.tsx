'use client'

import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Stock } from '@/lib/types'
import { useState } from 'react'

interface StockDetailModalProps {
  stock: Stock | null
  open: boolean
  onClose: () => void
  onTrade: (symbol: string, shares: number, action: 'buy' | 'sell') => void
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

export function StockDetailModal({ stock, open, onClose, onTrade }: StockDetailModalProps) {
  const [shares, setShares] = useState('')
  const [action, setAction] = useState<'buy' | 'sell'>('buy')

  if (!stock) return null

  const dayChange = stock.currentPrice - stock.previousClose
  const dayChangePercent = (dayChange / stock.previousClose) * 100
  const totalGain = (stock.currentPrice - stock.avgCost) * stock.shares
  const totalGainPercent = ((stock.currentPrice - stock.avgCost) / stock.avgCost) * 100
  const marketValue = stock.currentPrice * stock.shares
  const isPositiveDay = dayChange >= 0
  const isPositiveTotal = totalGain >= 0

  const handleTrade = () => {
    const numShares = parseInt(shares)
    if (numShares > 0) {
      onTrade(stock.symbol, numShares, action)
      setShares('')
      onClose()
    }
  }

  const estimatedCost = parseFloat(shares) * stock.currentPrice || 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div>
              <span className="text-2xl font-bold text-foreground">{stock.symbol}</span>
              <p className="text-sm text-muted-foreground font-normal">{stock.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-foreground">
              {formatCurrency(stock.currentPrice)}
            </span>
            <span className={`text-lg flex items-center gap-1 ${isPositiveDay ? 'text-primary' : 'text-destructive'}`}>
              {isPositiveDay ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {isPositiveDay ? '+' : ''}{formatCurrency(dayChange)} ({dayChangePercent.toFixed(2)}%)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Shares Owned</span>
                <span className="text-foreground font-medium">{stock.shares}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Avg Cost</span>
                <span className="text-foreground font-medium">{formatCurrency(stock.avgCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Market Value</span>
                <span className="text-foreground font-medium">{formatCurrency(marketValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Total Gain</span>
                <span className={`font-medium ${isPositiveTotal ? 'text-primary' : 'text-destructive'}`}>
                  {isPositiveTotal ? '+' : ''}{formatCurrency(totalGain)} ({totalGainPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Day High</span>
                <span className="text-foreground font-medium">{formatCurrency(stock.dayHigh)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Day Low</span>
                <span className="text-foreground font-medium">{formatCurrency(stock.dayLow)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Volume</span>
                <span className="text-foreground font-medium">{formatNumber(stock.volume)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">P/E Ratio</span>
                <span className="text-foreground font-medium">{stock.peRatio?.toFixed(2) || '-'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <Tabs value={action} onValueChange={(v) => setAction(v as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                  Sell
                </TabsTrigger>
              </TabsList>
              <TabsContent value="buy" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="buy-shares">Number of Shares</Label>
                  <Input
                    id="buy-shares"
                    type="number"
                    min="1"
                    placeholder="Enter shares to buy"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                {estimatedCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <span className="text-foreground font-medium">{formatCurrency(estimatedCost)}</span>
                  </div>
                )}
                <Button onClick={handleTrade} className="w-full bg-primary hover:bg-primary/90" disabled={!shares}>
                  Buy {stock.symbol}
                </Button>
              </TabsContent>
              <TabsContent value="sell" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="sell-shares">Number of Shares (Max: {stock.shares})</Label>
                  <Input
                    id="sell-shares"
                    type="number"
                    min="1"
                    max={stock.shares}
                    placeholder="Enter shares to sell"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                {estimatedCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Proceeds</span>
                    <span className="text-foreground font-medium">{formatCurrency(estimatedCost)}</span>
                  </div>
                )}
                <Button 
                  onClick={handleTrade} 
                  variant="destructive" 
                  className="w-full" 
                  disabled={!shares || parseInt(shares) > stock.shares}
                >
                  Sell {stock.symbol}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
