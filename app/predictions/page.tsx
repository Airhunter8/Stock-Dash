'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/dashboard/header'
import { StockSelector } from '@/components/predictions/StockSelector'
import { HorizonTabs } from '@/components/predictions/HorizonTabs'
import { TechnicalPanel } from '@/components/predictions/TechnicalPanel'
import { SentimentPanel } from '@/components/predictions/SentimentPanel'
import type { PredictionResult } from '@/lib/server/prediction-engine'

function scoreBadgeClass(score: number): string {
  if (score >= 60) return 'bg-green-500/20 text-green-600 border-green-500/30'
  if (score <= 40) return 'bg-red-500/20 text-red-600 border-red-500/30'
  return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
}

function combinedLabel(score: number): string {
  if (score > 0.3) return 'Bullish'
  if (score > 0.1) return 'Slightly Bullish'
  if (score < -0.3) return 'Bearish'
  if (score < -0.1) return 'Slightly Bearish'
  return 'Neutral'
}

function combinedBadgeClass(score: number): string {
  if (score > 0.1) return 'bg-green-500/20 text-green-600 border-green-500/30'
  if (score < -0.1) return 'bg-red-500/20 text-red-600 border-red-500/30'
  return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
}

export default function PredictionsPage() {
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async (ticker: string) => {
    try {
      setIsLoading(true)
      setResult(null)
      const res = await fetch(`/api/predictions/${encodeURIComponent(ticker)}`)
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Prediction failed')
      }
      const data: PredictionResult = await res.json()
      setResult(data)
    } catch (err) {
      toast.error('Prediction failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="px-4 md:px-6 pt-28 pb-32 max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>Stock Predictions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Algorithmic Bull / Base / Bear scenarios across 7d, 30d, and 90d horizons
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          {/* Left: selector */}
          <div className="lg:sticky lg:top-6">
            <StockSelector onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* Right: results */}
          <div>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-56 rounded-xl" />
                  <Skeleton className="h-56 rounded-xl" />
                  <Skeleton className="h-56 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-64 rounded-xl" />
                  <Skeleton className="h-64 rounded-xl" />
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Summary bar */}
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{result.ticker}</p>
                        <p className="text-muted-foreground text-sm">
                          ${result.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-auto">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Technical</p>
                          <Badge variant="outline" className={scoreBadgeClass(result.technicalScore)}>
                            {result.technicalScore}/100
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
                          <Badge variant="outline" className={scoreBadgeClass(result.sentimentScore)}>
                            {result.sentimentScore}/100
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Combined</p>
                          <Badge variant="outline" className={combinedBadgeClass(result.combinedScore)}>
                            {combinedLabel(result.combinedScore)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Horizon tabs */}
                <HorizonTabs result={result} />

                {/* Technical + Sentiment panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TechnicalPanel signals={result.signals} technicalScore={result.technicalScore} />
                  <SentimentPanel sentiment={result.sentiment} sentimentScore={result.sentimentScore} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 rounded-xl border border-border/50 bg-card">
                <div className="h-14 w-14 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary/60" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground/70">Select a stock and click Analyze</p>
                  <p className="text-xs text-muted-foreground">Bull / Base / Bear scenarios will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
