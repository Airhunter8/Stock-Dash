export interface Stock {
  symbol: string
  name: string
  shares: number
  avgCost: number
  currentPrice: number
  previousClose: number
  dayHigh: number
  dayLow: number
  volume: number
  marketCap: string
  peRatio: number | null
  dividendYield: number | null
}

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  dayChange: number
  dayChangePercent: number
  totalGain: number
  totalGainPercent: number
  availableCash: number
}

export interface NewsArticle {
  id: string
  title: string
  source: string
  timestamp: Date
  url: string
  relatedSymbols: string[]
  summary: string
}

export interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export type ColumnKey = 
  | 'shares'
  | 'avgCost'
  | 'currentPrice'
  | 'marketValue'
  | 'dayChange'
  | 'dayChangePercent'
  | 'totalGain'
  | 'totalGainPercent'
  | 'dayHigh'
  | 'dayLow'
  | 'volume'
  | 'marketCap'
  | 'peRatio'
  | 'dividendYield'

export interface ColumnConfig {
  key: ColumnKey
  label: string
  visible: boolean
}
