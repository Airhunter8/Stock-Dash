'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface TradeModalProps {
  ticker: string
  currentPrice: number
  availableShares: number
  availableCash: number
  open: boolean
  onClose: () => void
  onTrade: (type: 'BUY' | 'SELL', shares: number, price: number) => void
}

function fmt(v: number) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function TradeModal({
  ticker,
  currentPrice,
  availableShares,
  availableCash,
  open,
  onClose,
  onTrade,
}: TradeModalProps) {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
  const [sharesInput, setSharesInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSharesInput('')
      setError(null)
      setTradeType('BUY')
    }
  }, [open])

  const shares = parseFloat(sharesInput) || 0
  const total = shares * currentPrice

  const validate = (): string | null => {
    if (!shares || shares <= 0) return 'Enter a valid number of shares'
    if (!Number.isInteger(shares)) return 'Shares must be a whole number'
    if (tradeType === 'BUY' && total > availableCash) {
      return `Insufficient funds. You need ${fmt(total)} but have ${fmt(availableCash)}`
    }
    if (tradeType === 'SELL' && shares > availableShares) {
      return `You only own ${availableShares} share${availableShares !== 1 ? 's' : ''}`
    }
    return null
  }

  const handleSubmit = () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    onTrade(tradeType, shares, currentPrice)
    onClose()
  }

  const maxShares =
    tradeType === 'BUY'
      ? Math.floor(availableCash / currentPrice)
      : availableShares

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Trade {ticker}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* BUY / SELL toggle */}
          <div className="flex rounded-md overflow-hidden border border-border">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tradeType === 'BUY'
                  ? 'bg-green-500 text-white'
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setTradeType('BUY'); setError(null) }}
            >
              BUY
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tradeType === 'SELL'
                  ? 'bg-red-500 text-white'
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setTradeType('SELL'); setError(null) }}
            >
              SELL
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Market Price</span>
            <span className="font-semibold">{fmt(currentPrice)}</span>
          </div>

          <Separator />

          {/* Shares input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="shares">Shares</Label>
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => setSharesInput(String(maxShares))}
              >
                Max: {maxShares.toLocaleString()}
              </button>
            </div>
            <Input
              id="shares"
              type="number"
              min="1"
              step="1"
              placeholder="0"
              value={sharesInput}
              onChange={(e) => {
                setSharesInput(e.target.value)
                setError(null)
              }}
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Total</span>
            <span className="font-semibold text-lg">{fmt(total)}</span>
          </div>

          {/* Context info */}
          <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground space-y-1">
            {tradeType === 'BUY' ? (
              <p>Available cash: <span className="text-foreground font-medium">{fmt(availableCash)}</span></p>
            ) : (
              <p>Shares owned: <span className="text-foreground font-medium">{availableShares.toLocaleString()}</span></p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Submit */}
          <Button
            className={`w-full ${tradeType === 'BUY' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
            onClick={handleSubmit}
            disabled={!sharesInput}
          >
            Execute Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
