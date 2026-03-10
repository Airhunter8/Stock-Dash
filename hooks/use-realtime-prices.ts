'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface PriceUpdate {
  ticker: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
}

interface UsePricesOptions {
  tickers: string[]
  enabled?: boolean
}

export function useRealtimePrices({ tickers, enabled = true }: UsePricesOptions) {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({})
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const updatePrices = useCallback((updates: PriceUpdate[]) => {
    setPrices(prev => {
      const next = { ...prev }
      for (const u of updates) {
        next[u.ticker] = u
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!enabled || tickers.length === 0) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'

    const socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('subscribe', tickers)
    })

    socket.on('disconnect', () => setConnected(false))
    socket.on('price:update', updatePrices)
    socket.on('price:snapshot', updatePrices)

    return () => {
      socket.emit('unsubscribe', tickers)
      socket.disconnect()
      setConnected(false)
    }
  }, [tickers.join(','), enabled])  // eslint-disable-line

  return { prices, connected }
}
