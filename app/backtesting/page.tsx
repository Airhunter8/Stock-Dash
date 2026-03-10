'use client'

import { useState } from 'react'
import { BacktestForm, type BacktestConfig } from '@/components/backtesting/backtest-form'
import { BacktestResults, type BacktestResult } from '@/components/backtesting/backtest-results'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function BacktestingPage() {
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (config: BacktestConfig) => {
    try {
      setIsLoading(true)
      setResult(null)
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Backtest failed')
      }
      const data: BacktestResult = await res.json()
      setResult(data)
    } catch (err) {
      toast.error('Backtest failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 md:px-6 py-6 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Strategy Backtester</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Test trading strategies against historical data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
          {/* Form */}
          <div className="lg:sticky lg:top-6">
            <BacktestForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Results */}
          <div>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 rounded-xl" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-72 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
              </div>
            ) : result ? (
              <BacktestResults result={result} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-2 rounded-xl border border-border bg-card">
                <p className="text-muted-foreground">Configure a strategy and run a backtest.</p>
                <p className="text-sm text-muted-foreground">Results will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
