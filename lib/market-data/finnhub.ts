import type { MarketDataProvider, MarketQuote, HistoricalBar, CompanyProfile, SearchResult, SentimentData } from './types'

const BASE_URL = 'https://finnhub.io/api/v1'
const API_KEY = process.env.FINNHUB_API_KEY || ''

export interface FinnhubQuote {
  price: number
  change: number
  changePercent: number
  previousClose: number
  open: number
  high: number
  low: number
}

export async function finnhubQuote(ticker: string): Promise<FinnhubQuote | null> {
  if (!API_KEY) return null
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`,
      { next: { revalidate: 0 } }
    )
    if (!res.ok) return null
    const d = await res.json()
    if (!d.c) return null
    return {
      price: d.c,
      change: d.d,
      changePercent: d.dp,
      previousClose: d.pc,
      open: d.o,
      high: d.h,
      low: d.l,
    }
  } catch {
    return null
  }
}

export class FinnhubProvider implements MarketDataProvider {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY || ''
  }

  private async fetchFH(path: string, params: Record<string, string>): Promise<unknown> {
    const url = new URL(`${BASE_URL}${path}`)
    url.searchParams.set('token', this.apiKey)
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Finnhub HTTP error: ${res.status}`)
    return res.json()
  }

  async search(query: string): Promise<SearchResult[]> {
    const data = await this.fetchFH('/search', { q: query }) as {
      result?: { symbol: string; description: string; type: string; displaySymbol: string }[]
    }
    return (data.result || [])
      .filter((r) => r.type === 'Common Stock')
      .slice(0, 5)
      .map((r) => ({
        ticker: r.symbol,
        name: r.description,
        type: r.type,
        exchange: r.displaySymbol,
      }))
  }

  async getQuote(ticker: string): Promise<MarketQuote> {
    const data = await this.fetchFH('/quote', { symbol: ticker }) as {
      c: number; h: number; l: number; o: number; pc: number; v: number
    }
    if (!data.c) throw new Error(`No quote data for: ${ticker}`)
    return {
      ticker,
      price: data.c,
      open: data.o,
      high: data.h,
      low: data.l,
      previousClose: data.pc,
      volume: data.v,
      change: data.c - data.pc,
      changePercent: data.pc ? ((data.c - data.pc) / data.pc) * 100 : 0,
      timestamp: new Date(),
    }
  }

  async getHistory(ticker: string, outputSize: 'compact' | 'full' = 'compact'): Promise<HistoricalBar[]> {
    const to = Math.floor(Date.now() / 1000)
    const days = outputSize === 'compact' ? 100 : 365
    const from = to - days * 86400

    const data = await this.fetchFH('/stock/candle', {
      symbol: ticker,
      resolution: 'D',
      from: String(from),
      to: String(to),
    }) as { s: string; t: number[]; o: number[]; h: number[]; l: number[]; c: number[]; v: number[] }

    if (data.s !== 'ok' || !data.t?.length) {
      throw new Error(`No historical data for: ${ticker}`)
    }

    return data.t.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().slice(0, 10),
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      adjClose: data.c[i],
      volume: data.v[i],
    }))
  }

  async getProfile(ticker: string): Promise<CompanyProfile> {
    const data = await this.fetchFH('/stock/profile2', { symbol: ticker }) as Record<string, unknown>
    if (!data['ticker']) throw new Error(`No profile data for: ${ticker}`)
    return {
      ticker: String(data['ticker'] || ticker),
      name: String(data['name'] || ticker),
      description: '',
      sector: '',
      industry: String(data['finnhubIndustry'] || ''),
      exchange: String(data['exchange'] || ''),
      marketCap: typeof data['marketCapitalization'] === 'number' ? (data['marketCapitalization'] as number) * 1e6 : 0,
      peRatio: null,
      eps: null,
      dividendYield: null,
      beta: null,
      week52High: typeof data['52WeekHigh'] === 'number' ? data['52WeekHigh'] as number : null,
      week52Low: typeof data['52WeekLow'] === 'number' ? data['52WeekLow'] as number : null,
      employees: typeof data['employeeTotal'] === 'number' ? data['employeeTotal'] as number : null,
      ceo: null,
      headquarters: String(data['country'] || ''),
      founded: String(data['ipo'] || ''),
      website: String(data['weburl'] || ''),
    }
  }

  async getNewsSentiment(ticker: string): Promise<SentimentData> {
    const data = await this.fetchFH('/news-sentiment', { symbol: ticker }) as {
      sentiment?: { bullishPercent: number; bearishPercent: number }
      buzz?: { articlesInLastWeek: number }
    }
    const bull = data.sentiment?.bullishPercent ?? 0.5
    const bear = data.sentiment?.bearishPercent ?? 0.5
    const averageScore = bull - bear

    let label = 'Neutral'
    if (averageScore >= 0.35) label = 'Bullish'
    else if (averageScore >= 0.15) label = 'Somewhat-Bullish'
    else if (averageScore <= -0.35) label = 'Bearish'
    else if (averageScore <= -0.15) label = 'Somewhat-Bearish'

    return {
      averageScore,
      label,
      articleCount: data.buzz?.articlesInLastWeek ?? 0,
      articles: [],
    }
  }
}
