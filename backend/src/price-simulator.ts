export interface PriceUpdate {
  ticker: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
}

// Starting mock prices for common tickers
const BASE_PRICES: Record<string, number> = {
  AAPL: 192.53, GOOGL: 175.98, MSFT: 415.67, NVDA: 875.34,
  TSLA: 238.45, AMZN: 186.23, META: 505.23, AMD: 165.78,
  NFLX: 628.90, CRM: 267.45, INTC: 34.56, AVGO: 1456.78,
  SPY: 521.43, QQQ: 447.82, DIS: 112.45, BABA: 78.45,
}

export class PriceSimulator {
  private prices: Map<string, number>  // ticker -> current price
  private openPrices: Map<string, number>  // ticker -> day open (for change calc)
  private subscriptions: Set<string>  // active tickers

  constructor() {
    this.prices = new Map()
    this.openPrices = new Map()
    this.subscriptions = new Set()
  }

  subscribe(ticker: string): void {
    if (!this.subscriptions.has(ticker)) {
      const base = BASE_PRICES[ticker] || 100 + Math.random() * 900
      this.prices.set(ticker, base)
      this.openPrices.set(ticker, base)
      this.subscriptions.add(ticker)
    }
  }

  unsubscribe(ticker: string): void {
    this.subscriptions.delete(ticker)
    this.prices.delete(ticker)
    this.openPrices.delete(ticker)
  }

  // Generate next tick for all subscribed tickers
  tick(): PriceUpdate[] {
    const updates: PriceUpdate[] = []

    for (const ticker of this.subscriptions) {
      const current = this.prices.get(ticker)!
      const open = this.openPrices.get(ticker)!

      // Random walk: ±0.1% per tick with slight mean reversion
      const drift = (open - current) * 0.001  // slight pull toward open
      const noise = (Math.random() - 0.5) * current * 0.001  // ±0.1%
      const newPrice = Math.max(current + drift + noise, 0.01)

      this.prices.set(ticker, newPrice)

      const change = newPrice - open
      const changePercent = (change / open) * 100
      const volume = Math.floor(Math.random() * 500000) + 100000

      updates.push({
        ticker,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(4)),
        volume,
        timestamp: Date.now(),
      })
    }

    return updates
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions)
  }
}
