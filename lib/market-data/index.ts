import { AlphaVantageProvider } from './alpha-vantage'
import type { MarketDataProvider } from './types'

let _provider: MarketDataProvider | null = null

export function getMarketDataProvider(): MarketDataProvider {
  if (!_provider) {
    // In future, could be 'polygon' | 'iex' | 'yahoo' based on env var
    _provider = new AlphaVantageProvider()
  }
  return _provider
}

export * from './types'
