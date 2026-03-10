'use client'

import { useCallback, useEffect } from 'react'
import { useWatchlistStore, type WatchlistItem } from '@/store/watchlist-store'

export function useWatchlist() {
  const { items, isLoading, error, setItems, setLoading, setError, addTicker, removeTicker } =
    useWatchlistStore()

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/watchlist')
      if (!res.ok) throw new Error('Failed to fetch watchlist')
      const data = await res.json()
      const items: WatchlistItem[] = (data.items ?? []).map((item: {
        ticker: string
        quote: { price?: number; change?: number; changePercent?: number } | null
      }) => ({
        ticker: item.ticker,
        price: item.quote?.price,
        change: item.quote?.change,
        changePercent: item.quote?.changePercent,
      }))
      setItems(items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [setItems, setLoading, setError])

  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  const handleAddTicker = useCallback(
    async (ticker: string) => {
      addTicker(ticker)
      try {
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker }),
        })
        if (!res.ok) {
          removeTicker(ticker)
          throw new Error('Failed to add ticker')
        }
        await fetchWatchlist()
      } catch (err) {
        throw err
      }
    },
    [addTicker, removeTicker, fetchWatchlist]
  )

  const handleRemoveTicker = useCallback(
    async (ticker: string) => {
      removeTicker(ticker)
      try {
        const res = await fetch(`/api/watchlist/${ticker}`, {
          method: 'DELETE',
        })
        if (!res.ok) {
          await fetchWatchlist()
          throw new Error('Failed to remove ticker')
        }
      } catch (err) {
        throw err
      }
    },
    [removeTicker, fetchWatchlist]
  )

  return {
    items,
    isLoading,
    error,
    addTicker: handleAddTicker,
    removeTicker: handleRemoveTicker,
  }
}
