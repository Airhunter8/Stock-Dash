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

export interface StockDetail {
  symbol: string
  name: string
  currentPrice: number
  previousClose: number
  open: number
  dayHigh: number
  dayLow: number
  weekHigh52: number
  weekLow52: number
  volume: number
  avgVolume: number
  marketCap: string
  marketCapValue: number
  peRatio: number | null
  forwardPE: number | null
  eps: number | null
  dividendYield: number | null
  dividendPerShare: number | null
  beta: number
  sector: string
  industry: string
  exchange: string
  description: string
  ceo: string
  employees: number
  headquarters: string
  founded: string
  website: string
  analystRating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
  priceTarget: number
  priceTargetHigh: number
  priceTargetLow: number
  numberOfAnalysts: number
  buyRatings: number
  holdRatings: number
  sellRatings: number
  revenueGrowth: number
  profitMargin: number
  operatingMargin: number
  returnOnEquity: number
  debtToEquity: number
  currentRatio: number
  shortInterest: number
  institutionalOwnership: number
}

export interface AnalystEstimate {
  period: string
  epsEstimate: number
  revenueEstimate: string
  numberOfAnalysts: number
}

export interface EarningsData {
  quarter: string
  date: string
  epsActual: number | null
  epsEstimate: number
  surprise: number | null
  surprisePercent: number | null
}

export interface CompetitorStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: string
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
