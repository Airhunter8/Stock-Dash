import type { MarketDataProvider, MarketQuote, HistoricalBar, CompanyProfile, SearchResult, SentimentData, NewsArticle } from './types'

const BASE_URL = 'https://www.alphavantage.co/query'

function parseNum(val: string | undefined | null): number | null {
  if (!val || val === 'None' || val === '-') return null
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

export class AlphaVantageProvider implements MarketDataProvider {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || ''
  }

  private async fetchAV(params: Record<string, string>): Promise<unknown> {
    const url = new URL(BASE_URL)
    url.searchParams.set('apikey', this.apiKey)
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
    const res = await fetch(url.toString())
    if (!res.ok) {
      throw new Error(`Alpha Vantage HTTP error: ${res.status} ${res.statusText}`)
    }
    const data = await res.json()
    if (data['Note']) {
      throw new Error('Alpha Vantage API rate limit reached. Please wait and try again.')
    }
    if (data['Information']) {
      throw new Error(`Alpha Vantage API error: ${data['Information']}`)
    }
    return data
  }

  async search(query: string): Promise<SearchResult[]> {
    const data = await this.fetchAV({ function: 'SYMBOL_SEARCH', keywords: query }) as Record<string, unknown>
    const matches = (data['bestMatches'] as Record<string, string>[] | undefined) || []
    return matches
      .filter((m) => m['4. region'] === 'United States')
      .slice(0, 5)
      .map((m) => ({
        ticker: m['1. symbol'],
        name: m['2. name'],
        type: m['3. type'],
        exchange: m['4. region'],
      }))
  }

  async getQuote(ticker: string): Promise<MarketQuote> {
    const data = await this.fetchAV({ function: 'GLOBAL_QUOTE', symbol: ticker }) as Record<string, unknown>
    const q = (data['Global Quote'] as Record<string, string> | undefined) || {}
    if (!q['01. symbol']) {
      throw new Error(`No quote data found for ticker: ${ticker}`)
    }
    const changePercentRaw = q['10. change percent'] || '0%'
    const changePercent = parseNum(changePercentRaw.replace('%', ''))
    return {
      ticker: q['01. symbol'],
      price: parseNum(q['05. price']) ?? 0,
      open: parseNum(q['02. open']) ?? 0,
      high: parseNum(q['03. high']) ?? 0,
      low: parseNum(q['04. low']) ?? 0,
      previousClose: parseNum(q['08. previous close']) ?? 0,
      volume: parseNum(q['06. volume']) ?? 0,
      change: parseNum(q['09. change']) ?? 0,
      changePercent: changePercent ?? 0,
      timestamp: new Date().toISOString(),
    }
  }

  async getHistory(ticker: string, outputSize: 'compact' | 'full' = 'compact'): Promise<HistoricalBar[]> {
    const data = await this.fetchAV({
      function: 'TIME_SERIES_DAILY_ADJUSTED',
      symbol: ticker,
      outputsize: outputSize,
    }) as Record<string, unknown>

    const series = (data['Time Series (Daily)'] as Record<string, Record<string, string>> | undefined) || {}
    if (Object.keys(series).length === 0) {
      throw new Error(`No historical data found for ticker: ${ticker}`)
    }

    const bars: HistoricalBar[] = Object.entries(series).map(([date, bar]) => ({
      date,
      open: parseNum(bar['1. open']) ?? 0,
      high: parseNum(bar['2. high']) ?? 0,
      low: parseNum(bar['3. low']) ?? 0,
      close: parseNum(bar['4. close']) ?? 0,
      adjClose: parseNum(bar['5. adjusted close']) ?? 0,
      volume: parseNum(bar['6. volume']) ?? 0,
    }))

    bars.sort((a, b) => a.date.localeCompare(b.date))
    return bars
  }

  async getNewsSentiment(ticker: string): Promise<SentimentData> {
    const data = await this.fetchAV({
      function: 'NEWS_SENTIMENT',
      tickers: ticker,
      limit: '20',
    }) as Record<string, unknown>

    const feed = (data['feed'] as Record<string, unknown>[] | undefined) || []

    let weightedSum = 0
    let totalWeight = 0
    const articles: NewsArticle[] = []

    for (const item of feed) {
      const tickerSentiments = (item['ticker_sentiment'] as Record<string, string>[] | undefined) || []
      const tickerEntry = tickerSentiments.find((t) => t['ticker'] === ticker)
      if (!tickerEntry) continue

      const relevance = parseFloat(tickerEntry['relevance_score'] || '0')
      const tickerScore = parseFloat(tickerEntry['ticker_sentiment_score'] || '0')

      weightedSum += tickerScore * relevance
      totalWeight += relevance

      articles.push({
        title: String(item['title'] || ''),
        url: String(item['url'] || ''),
        timePublished: String(item['time_published'] || ''),
        summary: String(item['summary'] || ''),
        source: String(item['source'] || ''),
        overallSentimentScore: parseFloat(String(item['overall_sentiment_score'] || '0')),
        overallSentimentLabel: String(item['overall_sentiment_label'] || 'Neutral'),
        tickerSentimentScore: tickerScore,
        tickerSentimentLabel: String(tickerEntry['ticker_sentiment_label'] || 'Neutral'),
        relevanceScore: relevance,
      })
    }

    const averageScore = totalWeight > 0 ? weightedSum / totalWeight : 0
    let label = 'Neutral'
    if (averageScore >= 0.35) label = 'Bullish'
    else if (averageScore >= 0.15) label = 'Somewhat-Bullish'
    else if (averageScore <= -0.35) label = 'Bearish'
    else if (averageScore <= -0.15) label = 'Somewhat-Bearish'

    return { averageScore, label, articleCount: articles.length, articles }
  }

  async getProfile(ticker: string): Promise<CompanyProfile> {
    const data = await this.fetchAV({ function: 'OVERVIEW', symbol: ticker }) as Record<string, string>
    if (!data['Symbol']) {
      throw new Error(`No profile data found for ticker: ${ticker}`)
    }
    return {
      ticker: data['Symbol'],
      name: data['Name'] || ticker,
      description: data['Description'] || '',
      sector: data['Sector'] || '',
      industry: data['Industry'] || '',
      exchange: data['Exchange'] || '',
      marketCap: parseNum(data['MarketCapitalization']),
      peRatio: parseNum(data['PERatio']),
      eps: parseNum(data['EPS']),
      dividendYield: parseNum(data['DividendYield']),
      beta: parseNum(data['Beta']),
      week52High: parseNum(data['52WeekHigh']),
      week52Low: parseNum(data['52WeekLow']),
      employees: parseNum(data['FullTimeEmployees']),
      ceo: data['CEO'] || null,
      headquarters: data['Address'] || null,
      founded: data['Founded'] || null,
      website: data['OfficialSite'] || null,
    }
  }
}
