import type { Stock, PortfolioSummary, NewsArticle, WatchlistItem, ColumnConfig } from './types'

export const mockStocks: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 50,
    avgCost: 178.50,
    currentPrice: 192.53,
    previousClose: 189.84,
    dayHigh: 193.45,
    dayLow: 190.12,
    volume: 48234567,
    marketCap: '2.98T',
    peRatio: 31.2,
    dividendYield: 0.51
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 25,
    avgCost: 142.30,
    currentPrice: 175.98,
    previousClose: 173.45,
    dayHigh: 177.22,
    dayLow: 173.10,
    volume: 23456789,
    marketCap: '2.17T',
    peRatio: 25.8,
    dividendYield: null
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 30,
    avgCost: 378.20,
    currentPrice: 415.67,
    previousClose: 412.33,
    dayHigh: 418.90,
    dayLow: 411.25,
    volume: 19876543,
    marketCap: '3.09T',
    peRatio: 36.4,
    dividendYield: 0.73
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    shares: 20,
    avgCost: 485.60,
    currentPrice: 875.34,
    previousClose: 862.19,
    dayHigh: 882.50,
    dayLow: 858.40,
    volume: 45678901,
    marketCap: '2.16T',
    peRatio: 65.2,
    dividendYield: 0.02
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 15,
    avgCost: 245.80,
    currentPrice: 238.45,
    previousClose: 242.67,
    dayHigh: 244.30,
    dayLow: 235.80,
    volume: 67890123,
    marketCap: '758.2B',
    peRatio: 48.9,
    dividendYield: null
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    shares: 35,
    avgCost: 168.40,
    currentPrice: 186.23,
    previousClose: 184.56,
    dayHigh: 187.90,
    dayLow: 183.45,
    volume: 34567890,
    marketCap: '1.93T',
    peRatio: 58.3,
    dividendYield: null
  }
]

export function calculatePortfolioSummary(stocks: Stock[], cash: number): PortfolioSummary {
  const totalValue = stocks.reduce((sum, stock) => sum + stock.currentPrice * stock.shares, 0) + cash
  const totalCost = stocks.reduce((sum, stock) => sum + stock.avgCost * stock.shares, 0)
  const previousValue = stocks.reduce((sum, stock) => sum + stock.previousClose * stock.shares, 0) + cash
  
  const dayChange = totalValue - previousValue
  const dayChangePercent = ((totalValue - previousValue) / previousValue) * 100
  const totalGain = totalValue - totalCost - cash
  const totalGainPercent = (totalGain / totalCost) * 100
  
  return {
    totalValue,
    totalCost,
    dayChange,
    dayChangePercent,
    totalGain,
    totalGainPercent,
    availableCash: cash
  }
}

export const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'Apple Unveils New AI Features at Developer Conference',
    source: 'Bloomberg',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    url: '#',
    relatedSymbols: ['AAPL'],
    summary: 'Apple announced new artificial intelligence capabilities coming to iPhone, iPad, and Mac devices at its annual developer conference.'
  },
  {
    id: '2',
    title: 'NVIDIA Surpasses Expectations with Record Data Center Revenue',
    source: 'Reuters',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    url: '#',
    relatedSymbols: ['NVDA'],
    summary: 'NVIDIA reported quarterly earnings that exceeded analyst expectations, driven by strong demand for AI chips in data centers.'
  },
  {
    id: '3',
    title: 'Google Cloud Partners with Major Enterprise Clients',
    source: 'TechCrunch',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    url: '#',
    relatedSymbols: ['GOOGL'],
    summary: 'Alphabet\'s Google Cloud division announced new partnerships with several Fortune 500 companies for cloud infrastructure services.'
  },
  {
    id: '4',
    title: 'Tesla Expands Charging Network Partnerships',
    source: 'CNBC',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    url: '#',
    relatedSymbols: ['TSLA'],
    summary: 'Tesla signed agreements with additional automakers to provide access to its Supercharger network across North America.'
  },
  {
    id: '5',
    title: 'Microsoft Azure Introduces New Security Features',
    source: 'The Verge',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
    url: '#',
    relatedSymbols: ['MSFT'],
    summary: 'Microsoft announced enhanced security features for Azure cloud platform targeting enterprise customers with strict compliance requirements.'
  },
  {
    id: '6',
    title: 'Amazon Prime Day Sales Break Previous Records',
    source: 'Wall Street Journal',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    url: '#',
    relatedSymbols: ['AMZN'],
    summary: 'Amazon reported that this year\'s Prime Day event generated record sales, with electronics and home goods leading categories.'
  }
]

export const mockWatchlist: WatchlistItem[] = [
  { symbol: 'META', name: 'Meta Platforms', price: 505.23, change: 8.45, changePercent: 1.70 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 165.78, change: -2.34, changePercent: -1.39 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 628.90, change: 12.67, changePercent: 2.06 },
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 267.45, change: 3.21, changePercent: 1.21 }
]

export const defaultColumns: ColumnConfig[] = [
  { key: 'shares', label: 'Shares', visible: true },
  { key: 'avgCost', label: 'Avg Cost', visible: true },
  { key: 'currentPrice', label: 'Price', visible: true },
  { key: 'marketValue', label: 'Market Value', visible: true },
  { key: 'dayChange', label: 'Day Change', visible: true },
  { key: 'dayChangePercent', label: 'Day %', visible: true },
  { key: 'totalGain', label: 'Total Gain', visible: true },
  { key: 'totalGainPercent', label: 'Total %', visible: true },
  { key: 'dayHigh', label: 'Day High', visible: false },
  { key: 'dayLow', label: 'Day Low', visible: false },
  { key: 'volume', label: 'Volume', visible: false },
  { key: 'marketCap', label: 'Market Cap', visible: false },
  { key: 'peRatio', label: 'P/E Ratio', visible: false },
  { key: 'dividendYield', label: 'Div Yield', visible: false }
]
