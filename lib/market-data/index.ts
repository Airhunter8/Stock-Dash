import { AlphaVantageProvider } from './alpha-vantage'
import { FinnhubProvider } from './finnhub'
import type { MarketDataProvider, HistoricalBar, MarketQuote, CompanyProfile, SearchResult, SentimentData } from './types'

export * from './types'

// Wraps AlphaVantage with Finnhub fallback for each method
class FallbackProvider implements MarketDataProvider {
  private av: AlphaVantageProvider
  private fh: FinnhubProvider

  constructor() {
    this.av = new AlphaVantageProvider()
    this.fh = new FinnhubProvider()
  }

  async search(query: string): Promise<SearchResult[]> {
    try { return await this.av.search(query) } catch { return this.fh.search(query) }
  }

  async getQuote(ticker: string): Promise<MarketQuote> {
    try { return await this.av.getQuote(ticker) } catch { return this.fh.getQuote(ticker) }
  }

  async getHistory(ticker: string, outputSize?: 'compact' | 'full'): Promise<HistoricalBar[]> {
    try { return await this.av.getHistory(ticker, outputSize) } catch { return this.fh.getHistory(ticker, outputSize) }
  }

  async getProfile(ticker: string): Promise<CompanyProfile> {
    try { return await this.av.getProfile(ticker) } catch { return this.fh.getProfile(ticker) }
  }

  async getNewsSentiment(ticker: string): Promise<SentimentData> {
    try { return await this.av.getNewsSentiment(ticker) } catch { return this.fh.getNewsSentiment(ticker) }
  }
}

let _provider: FallbackProvider | null = null

export function getMarketDataProvider(): FallbackProvider {
  if (!_provider) {
    _provider = new FallbackProvider()
  }
  return _provider
}
