import { create } from 'zustand'

export interface WatchlistItem {
  ticker: string
  name?: string
  price?: number
  change?: number
  changePercent?: number
}

interface WatchlistStore {
  tickers: string[]
  items: WatchlistItem[]
  isLoading: boolean
  error: string | null
  setTickers: (tickers: string[]) => void
  setItems: (items: WatchlistItem[]) => void
  addTicker: (ticker: string) => void
  removeTicker: (ticker: string) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
}

export const useWatchlistStore = create<WatchlistStore>((set) => ({
  tickers: [],
  items: [],
  isLoading: false,
  error: null,

  setTickers: (tickers) => set({ tickers }),
  setItems: (items) => set({ items }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),

  addTicker: (ticker) =>
    set((state) => ({
      tickers: state.tickers.includes(ticker) ? state.tickers : [...state.tickers, ticker],
    })),

  removeTicker: (ticker) =>
    set((state) => ({
      tickers: state.tickers.filter((t) => t !== ticker),
      items: state.items.filter((item) => item.ticker !== ticker),
    })),
}))
