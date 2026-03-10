export interface MarketQuote {
  ticker: string
  price: number
  open: number
  high: number
  low: number
  previousClose: number
  volume: number
  change: number
  changePercent: number
  timestamp: Date
}

export interface HistoricalBar {
  date: string          // YYYY-MM-DD
  open: number
  high: number
  low: number
  close: number
  adjClose: number
  volume: number
}

export interface CompanyProfile {
  ticker: string
  name: string
  description: string
  sector: string
  industry: string
  exchange: string
  marketCap: number
  peRatio: number | null
  eps: number | null
  dividendYield: number | null
  beta: number | null
  week52High: number | null
  week52Low: number | null
  employees: number | null
  ceo: string | null
  headquarters: string | null
  founded: string | null
  website: string | null
}

export interface SearchResult {
  ticker: string
  name: string
  type: string
  exchange: string
}

export interface MarketDataProvider {
  search(query: string): Promise<SearchResult[]>
  getQuote(ticker: string): Promise<MarketQuote>
  getHistory(ticker: string, outputSize?: 'compact' | 'full'): Promise<HistoricalBar[]>
  getProfile(ticker: string): Promise<CompanyProfile>
}
