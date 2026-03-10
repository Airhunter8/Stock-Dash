'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePortfolioStore, type PortfolioResponse } from '@/store/portfolio-store'

export interface Transaction {
  id: string
  ticker: string
  type: 'BUY' | 'SELL'
  shares: number
  price: number
  total: number
  realizedPnl: number | null
  executedAt: string
}

export function usePortfolio() {
  const { portfolio, isLoading, error, setPortfolio, setLoading, setError, applyTrade } =
    usePortfolioStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/portfolio')
      if (!res.ok) throw new Error('Failed to fetch portfolio')
      const data: PortfolioResponse = await res.json()
      setPortfolio(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [setPortfolio, setLoading, setError])

  useEffect(() => {
    fetchPortfolio()
    intervalRef.current = setInterval(fetchPortfolio, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchPortfolio])

  const executeTrade = useCallback(
    async (ticker: string, type: 'BUY' | 'SELL', shares: number, price: number) => {
      // Optimistic update
      applyTrade(ticker, type, shares, price)

      try {
        const res = await fetch('/api/portfolio/trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker, type, shares, price }),
        })
        if (!res.ok) {
          // Revert on failure by refetching
          await fetchPortfolio()
          const data = await res.json()
          throw new Error(data.error || 'Trade failed')
        }
        // Refetch to sync server state
        await fetchPortfolio()
      } catch (err) {
        throw err
      }
    },
    [applyTrade, fetchPortfolio]
  )

  const deposit = useCallback(
    async (amount: number) => {
      try {
        const res = await fetch('/api/portfolio/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        })
        if (!res.ok) throw new Error('Deposit failed')
        await fetchPortfolio()
      } catch (err) {
        throw err
      }
    },
    [fetchPortfolio]
  )

  return { portfolio, isLoading, error, refetch: fetchPortfolio, executeTrade, deposit }
}
