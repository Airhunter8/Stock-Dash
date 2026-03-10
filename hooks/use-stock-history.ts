'use client'

import { useState, useEffect, useCallback } from 'react'

export interface HistoricalBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  adjClose: number
  volume: number
}

type Period = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'

export function useStockHistory(ticker: string, initialPeriod: Period = '1M') {
  const [bars, setBars] = useState<HistoricalBar[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>(initialPeriod)

  const fetchHistory = useCallback(async (t: string, p: Period) => {
    if (!t) return
    try {
      setIsLoading(true)
      const res = await fetch(`/api/stocks/${t}/history?period=${p}`)
      if (!res.ok) throw new Error('Failed to fetch history')
      const data: HistoricalBar[] = await res.json()
      setBars(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory(ticker, period)
  }, [ticker, period, fetchHistory])

  return { bars, isLoading, error, period, setPeriod }
}
