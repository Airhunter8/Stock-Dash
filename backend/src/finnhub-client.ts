import WebSocket from 'ws'

export interface PriceUpdate {
  ticker: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
}

interface TickerState {
  previousClose: number
  price: number
  volume: number
}

export class FinnhubClient {
  private apiKey: string
  private ws: WebSocket | null = null
  private states = new Map<string, TickerState>()
  private subscriptions = new Set<string>()
  private onUpdate: (updates: PriceUpdate[]) => void
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private connected = false

  constructor(apiKey: string, onUpdate: (updates: PriceUpdate[]) => void) {
    this.apiKey = apiKey
    this.onUpdate = onUpdate
  }

  private connect() {
    if (this.ws) {
      this.ws.removeAllListeners()
      this.ws.terminate()
    }

    const url = `wss://ws.finnhub.io?token=${this.apiKey}`
    this.ws = new WebSocket(url)

    this.ws.on('open', () => {
      console.log('[Finnhub] WebSocket connected')
      this.connected = true
      // Re-subscribe to all active tickers
      for (const ticker of this.subscriptions) {
        this.sendSubscribe(ticker)
      }
    })

    this.ws.on('message', (raw: WebSocket.RawData) => {
      try {
        const msg = JSON.parse(raw.toString())
        if (msg.type !== 'trade' || !Array.isArray(msg.data)) return

        // Group by ticker, take last trade per ticker
        const latest = new Map<string, { price: number; volume: number; timestamp: number }>()
        for (const trade of msg.data) {
          const ticker = trade.s as string
          const existing = latest.get(ticker)
          if (!existing || trade.t > existing.timestamp) {
            latest.set(ticker, { price: trade.p, volume: trade.v, timestamp: trade.t })
          }
        }

        const updates: PriceUpdate[] = []
        for (const [ticker, trade] of latest) {
          const state = this.states.get(ticker)
          if (!state) continue

          state.price = trade.price
          state.volume += trade.volume

          const change = state.price - state.previousClose
          const changePercent = state.previousClose > 0
            ? (change / state.previousClose) * 100
            : 0

          updates.push({
            ticker,
            price: parseFloat(state.price.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(4)),
            volume: Math.round(state.volume),
            timestamp: trade.timestamp,
          })
        }

        if (updates.length > 0) this.onUpdate(updates)
      } catch {
        // ignore parse errors
      }
    })

    this.ws.on('error', (err) => {
      console.error('[Finnhub] WebSocket error:', err.message)
    })

    this.ws.on('close', () => {
      console.log('[Finnhub] WebSocket closed, reconnecting in 5s...')
      this.connected = false
      this.reconnectTimer = setTimeout(() => this.connect(), 5000)
    })
  }

  private sendSubscribe(ticker: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol: ticker }))
    }
  }

  private sendUnsubscribe(ticker: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol: ticker }))
    }
  }

  // Fetch previousClose via Finnhub REST quote API
  private async fetchQuote(ticker: string): Promise<{ previousClose: number; price: number } | null> {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${this.apiKey}`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = await res.json() as { c: number; pc: number }
      if (!data.c) return null
      return { previousClose: data.pc, price: data.c }
    } catch {
      return null
    }
  }

  async subscribe(ticker: string): Promise<void> {
    if (this.subscriptions.has(ticker)) return
    this.subscriptions.add(ticker)

    // Fetch quote to seed state with real previousClose and current price
    const quote = await this.fetchQuote(ticker)
    this.states.set(ticker, {
      previousClose: quote?.previousClose ?? 0,
      price: quote?.price ?? 0,
      volume: 0,
    })

    // Send initial snapshot if we have a price
    if (quote?.price) {
      const change = quote.price - quote.previousClose
      const changePercent = quote.previousClose > 0
        ? (change / quote.previousClose) * 100
        : 0
      this.onUpdate([{
        ticker,
        price: parseFloat(quote.price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(4)),
        volume: 0,
        timestamp: Date.now(),
      }])
    }

    if (!this.ws || !this.connected) {
      this.connect()
    } else {
      this.sendSubscribe(ticker)
    }
  }

  unsubscribe(ticker: string): void {
    if (!this.subscriptions.has(ticker)) return
    this.subscriptions.delete(ticker)
    this.states.delete(ticker)
    this.sendUnsubscribe(ticker)

    if (this.subscriptions.size === 0) {
      this.disconnect()
    }
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions)
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.removeAllListeners()
      this.ws.terminate()
      this.ws = null
    }
    this.connected = false
  }
}
