'use client'

import { useState } from 'react'
import { ShoppingCart, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import type { StockDetail } from '@/lib/types'

interface TradePanelProps {
  stock: StockDetail
  onTrade: (shares: number, action: 'buy' | 'sell') => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function TradePanel({ stock, onTrade }: TradePanelProps) {
  const [shares, setShares] = useState('')
  const [action, setAction] = useState<'buy' | 'sell'>('buy')

  const numShares = parseInt(shares) || 0
  const estimatedValue = numShares * stock.currentPrice

  const handleTrade = () => {
    if (numShares > 0) {
      onTrade(numShares, action)
      setShares('')
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground text-base">Trade {stock.symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={action} onValueChange={(v) => setAction(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger 
              value="buy" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger 
              value="sell" 
              className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="buy-shares" className="text-sm text-muted-foreground">
                Number of Shares
              </Label>
              <Input
                id="buy-shares"
                type="number"
                min="1"
                placeholder="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="bg-secondary border-border text-lg h-12"
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Market Price</span>
                <span className="text-foreground font-medium">{formatCurrency(stock.currentPrice)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Cost</span>
                <span className="text-foreground font-bold text-lg">{formatCurrency(estimatedValue)}</span>
              </div>
            </div>

            <Button 
              onClick={handleTrade} 
              className="w-full bg-primary hover:bg-primary/90 h-12 text-base" 
              disabled={numShares <= 0}
            >
              Buy {numShares > 0 ? `${numShares} Share${numShares > 1 ? 's' : ''}` : 'Shares'}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="sell-shares" className="text-sm text-muted-foreground">
                Number of Shares
              </Label>
              <Input
                id="sell-shares"
                type="number"
                min="1"
                placeholder="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="bg-secondary border-border text-lg h-12"
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Market Price</span>
                <span className="text-foreground font-medium">{formatCurrency(stock.currentPrice)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Proceeds</span>
                <span className="text-foreground font-bold text-lg">{formatCurrency(estimatedValue)}</span>
              </div>
            </div>

            <Button 
              onClick={handleTrade} 
              variant="destructive"
              className="w-full h-12 text-base" 
              disabled={numShares <= 0}
            >
              Sell {numShares > 0 ? `${numShares} Share${numShares > 1 ? 's' : ''}` : 'Shares'}
            </Button>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Paper trading - no real money involved
        </p>
      </CardContent>
    </Card>
  )
}
