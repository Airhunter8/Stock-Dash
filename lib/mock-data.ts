import type { Stock, PortfolioSummary, NewsArticle, WatchlistItem, ColumnConfig, StockDetail, AnalystEstimate, EarningsData, CompetitorStock } from './types'
import type { SentimentData } from './market-data/types'

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

export const stockDetailData: Record<string, StockDetail> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 192.53,
    previousClose: 189.84,
    open: 190.25,
    dayHigh: 193.45,
    dayLow: 190.12,
    weekHigh52: 199.62,
    weekLow52: 164.08,
    volume: 48234567,
    avgVolume: 52456789,
    marketCap: '2.98T',
    marketCapValue: 2980000000000,
    peRatio: 31.2,
    forwardPE: 28.5,
    eps: 6.17,
    dividendYield: 0.51,
    dividendPerShare: 0.96,
    beta: 1.28,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    exchange: 'NASDAQ',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home and accessories. It also provides AppleCare support and cloud services, operates various platforms, and offers various services.',
    ceo: 'Tim Cook',
    employees: 164000,
    headquarters: 'Cupertino, CA',
    founded: '1976',
    website: 'apple.com',
    analystRating: 'Buy',
    priceTarget: 210.50,
    priceTargetHigh: 240.00,
    priceTargetLow: 165.00,
    numberOfAnalysts: 42,
    buyRatings: 28,
    holdRatings: 12,
    sellRatings: 2,
    revenueGrowth: 2.1,
    profitMargin: 25.3,
    operatingMargin: 29.8,
    returnOnEquity: 147.2,
    debtToEquity: 181.3,
    currentRatio: 0.99,
    shortInterest: 0.72,
    institutionalOwnership: 60.8
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    currentPrice: 175.98,
    previousClose: 173.45,
    open: 174.10,
    dayHigh: 177.22,
    dayLow: 173.10,
    weekHigh52: 191.75,
    weekLow52: 129.40,
    volume: 23456789,
    avgVolume: 25678901,
    marketCap: '2.17T',
    marketCapValue: 2170000000000,
    peRatio: 25.8,
    forwardPE: 21.3,
    eps: 6.82,
    dividendYield: null,
    dividendPerShare: null,
    beta: 1.05,
    sector: 'Technology',
    industry: 'Internet Content & Information',
    exchange: 'NASDAQ',
    description: 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.',
    ceo: 'Sundar Pichai',
    employees: 182502,
    headquarters: 'Mountain View, CA',
    founded: '1998',
    website: 'abc.xyz',
    analystRating: 'Strong Buy',
    priceTarget: 195.00,
    priceTargetHigh: 220.00,
    priceTargetLow: 160.00,
    numberOfAnalysts: 48,
    buyRatings: 38,
    holdRatings: 8,
    sellRatings: 2,
    revenueGrowth: 13.5,
    profitMargin: 22.5,
    operatingMargin: 27.4,
    returnOnEquity: 25.8,
    debtToEquity: 10.2,
    currentRatio: 2.1,
    shortInterest: 0.89,
    institutionalOwnership: 64.2
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    currentPrice: 415.67,
    previousClose: 412.33,
    open: 413.50,
    dayHigh: 418.90,
    dayLow: 411.25,
    weekHigh52: 430.82,
    weekLow52: 309.45,
    volume: 19876543,
    avgVolume: 21234567,
    marketCap: '3.09T',
    marketCapValue: 3090000000000,
    peRatio: 36.4,
    forwardPE: 31.2,
    eps: 11.42,
    dividendYield: 0.73,
    dividendPerShare: 3.00,
    beta: 0.89,
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    exchange: 'NASDAQ',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates through three segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing.',
    ceo: 'Satya Nadella',
    employees: 221000,
    headquarters: 'Redmond, WA',
    founded: '1975',
    website: 'microsoft.com',
    analystRating: 'Strong Buy',
    priceTarget: 450.00,
    priceTargetHigh: 500.00,
    priceTargetLow: 380.00,
    numberOfAnalysts: 52,
    buyRatings: 42,
    holdRatings: 9,
    sellRatings: 1,
    revenueGrowth: 17.6,
    profitMargin: 34.2,
    operatingMargin: 42.1,
    returnOnEquity: 35.1,
    debtToEquity: 42.5,
    currentRatio: 1.77,
    shortInterest: 0.53,
    institutionalOwnership: 72.1
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    currentPrice: 875.34,
    previousClose: 862.19,
    open: 865.00,
    dayHigh: 882.50,
    dayLow: 858.40,
    weekHigh52: 974.00,
    weekLow52: 395.17,
    volume: 45678901,
    avgVolume: 48901234,
    marketCap: '2.16T',
    marketCapValue: 2160000000000,
    peRatio: 65.2,
    forwardPE: 42.8,
    eps: 13.42,
    dividendYield: 0.02,
    dividendPerShare: 0.16,
    beta: 1.68,
    sector: 'Technology',
    industry: 'Semiconductors',
    exchange: 'NASDAQ',
    description: 'NVIDIA Corporation provides graphics, computing and networking solutions in the United States, Taiwan, China, and internationally. The company operates through two segments, Graphics and Compute & Networking.',
    ceo: 'Jensen Huang',
    employees: 26196,
    headquarters: 'Santa Clara, CA',
    founded: '1993',
    website: 'nvidia.com',
    analystRating: 'Strong Buy',
    priceTarget: 950.00,
    priceTargetHigh: 1100.00,
    priceTargetLow: 700.00,
    numberOfAnalysts: 56,
    buyRatings: 48,
    holdRatings: 7,
    sellRatings: 1,
    revenueGrowth: 122.4,
    profitMargin: 55.0,
    operatingMargin: 61.6,
    returnOnEquity: 91.5,
    debtToEquity: 41.1,
    currentRatio: 4.17,
    shortInterest: 1.12,
    institutionalOwnership: 65.9
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    currentPrice: 238.45,
    previousClose: 242.67,
    open: 241.00,
    dayHigh: 244.30,
    dayLow: 235.80,
    weekHigh52: 299.29,
    weekLow52: 138.80,
    volume: 67890123,
    avgVolume: 89012345,
    marketCap: '758.2B',
    marketCapValue: 758200000000,
    peRatio: 48.9,
    forwardPE: 58.2,
    eps: 4.87,
    dividendYield: null,
    dividendPerShare: null,
    beta: 2.31,
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    exchange: 'NASDAQ',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems. The company operates through two segments: Automotive, and Energy Generation and Storage.',
    ceo: 'Elon Musk',
    employees: 140473,
    headquarters: 'Austin, TX',
    founded: '2003',
    website: 'tesla.com',
    analystRating: 'Hold',
    priceTarget: 255.00,
    priceTargetHigh: 380.00,
    priceTargetLow: 120.00,
    numberOfAnalysts: 48,
    buyRatings: 15,
    holdRatings: 22,
    sellRatings: 11,
    revenueGrowth: -8.7,
    profitMargin: 13.0,
    operatingMargin: 8.2,
    returnOnEquity: 18.2,
    debtToEquity: 18.1,
    currentRatio: 1.73,
    shortInterest: 2.89,
    institutionalOwnership: 44.2
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    currentPrice: 186.23,
    previousClose: 184.56,
    open: 185.00,
    dayHigh: 187.90,
    dayLow: 183.45,
    weekHigh52: 201.20,
    weekLow52: 144.05,
    volume: 34567890,
    avgVolume: 38901234,
    marketCap: '1.93T',
    marketCapValue: 1930000000000,
    peRatio: 58.3,
    forwardPE: 38.5,
    eps: 3.19,
    dividendYield: null,
    dividendPerShare: null,
    beta: 1.16,
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    exchange: 'NASDAQ',
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores in North America and internationally. The company operates through three segments: North America, International, and Amazon Web Services (AWS).',
    ceo: 'Andy Jassy',
    employees: 1525000,
    headquarters: 'Seattle, WA',
    founded: '1994',
    website: 'amazon.com',
    analystRating: 'Strong Buy',
    priceTarget: 220.00,
    priceTargetHigh: 260.00,
    priceTargetLow: 175.00,
    numberOfAnalysts: 54,
    buyRatings: 46,
    holdRatings: 7,
    sellRatings: 1,
    revenueGrowth: 12.5,
    profitMargin: 5.3,
    operatingMargin: 6.4,
    returnOnEquity: 17.8,
    debtToEquity: 59.2,
    currentRatio: 1.05,
    shortInterest: 0.71,
    institutionalOwnership: 63.1
  }
}

export function getStockDetail(symbol: string): StockDetail | null {
  return stockDetailData[symbol.toUpperCase()] || null
}

export function searchStocks(query: string): StockDetail[] {
  const upperQuery = query.toUpperCase()
  return Object.values(stockDetailData).filter(
    stock => 
      stock.symbol.includes(upperQuery) || 
      stock.name.toUpperCase().includes(upperQuery)
  )
}

export const allStocks: StockDetail[] = Object.values(stockDetailData)

export function getStockNews(symbol: string): NewsArticle[] {
  return mockNews.filter(news => 
    news.relatedSymbols.includes(symbol.toUpperCase())
  )
}

export function getCompetitors(symbol: string): CompetitorStock[] {
  const competitors: Record<string, CompetitorStock[]> = {
    AAPL: [
      { symbol: 'SAMSUNG', name: 'Samsung Electronics', price: 1245.00, change: 12.50, changePercent: 1.01, marketCap: '312.5B' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.67, change: 3.34, changePercent: 0.81, marketCap: '3.09T' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.98, change: 2.53, changePercent: 1.46, marketCap: '2.17T' },
    ],
    GOOGL: [
      { symbol: 'META', name: 'Meta Platforms', price: 505.23, change: 8.45, changePercent: 1.70, marketCap: '1.29T' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.67, change: 3.34, changePercent: 0.81, marketCap: '3.09T' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.23, change: 1.67, changePercent: 0.90, marketCap: '1.93T' },
    ],
    MSFT: [
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.98, change: 2.53, changePercent: 1.46, marketCap: '2.17T' },
      { symbol: 'AAPL', name: 'Apple Inc.', price: 192.53, change: 2.69, changePercent: 1.42, marketCap: '2.98T' },
      { symbol: 'CRM', name: 'Salesforce Inc.', price: 267.45, change: 3.21, changePercent: 1.21, marketCap: '259.3B' },
    ],
    NVDA: [
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: 165.78, change: -2.34, changePercent: -1.39, marketCap: '268.1B' },
      { symbol: 'INTC', name: 'Intel Corporation', price: 34.56, change: 0.45, changePercent: 1.32, marketCap: '145.8B' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', price: 1456.78, change: 23.45, changePercent: 1.64, marketCap: '676.2B' },
    ],
    TSLA: [
      { symbol: 'F', name: 'Ford Motor Co.', price: 12.34, change: -0.12, changePercent: -0.96, marketCap: '49.3B' },
      { symbol: 'GM', name: 'General Motors', price: 45.67, change: 0.89, changePercent: 1.99, marketCap: '52.1B' },
      { symbol: 'RIVN', name: 'Rivian Automotive', price: 15.23, change: 0.34, changePercent: 2.28, marketCap: '15.8B' },
    ],
    AMZN: [
      { symbol: 'WMT', name: 'Walmart Inc.', price: 167.89, change: 1.23, changePercent: 0.74, marketCap: '452.3B' },
      { symbol: 'BABA', name: 'Alibaba Group', price: 78.45, change: 2.12, changePercent: 2.78, marketCap: '189.5B' },
      { symbol: 'SHOP', name: 'Shopify Inc.', price: 78.90, change: 1.56, changePercent: 2.02, marketCap: '99.8B' },
    ],
  }
  return competitors[symbol.toUpperCase()] || []
}

export function getAnalystEstimates(symbol: string): AnalystEstimate[] {
  return [
    { period: 'Q1 2026', epsEstimate: 1.85, revenueEstimate: '95.2B', numberOfAnalysts: 32 },
    { period: 'Q2 2026', epsEstimate: 1.92, revenueEstimate: '98.5B', numberOfAnalysts: 28 },
    { period: 'FY 2026', epsEstimate: 7.45, revenueEstimate: '410.5B', numberOfAnalysts: 42 },
    { period: 'FY 2027', epsEstimate: 8.12, revenueEstimate: '445.2B', numberOfAnalysts: 35 },
  ]
}

export function getEarningsHistory(symbol: string): EarningsData[] {
  return [
    { quarter: 'Q4 2025', date: 'Jan 30, 2026', epsActual: 2.18, epsEstimate: 2.10, surprise: 0.08, surprisePercent: 3.81 },
    { quarter: 'Q3 2025', date: 'Oct 28, 2025', epsActual: 1.95, epsEstimate: 1.88, surprise: 0.07, surprisePercent: 3.72 },
    { quarter: 'Q2 2025', date: 'Jul 25, 2025', epsActual: 1.78, epsEstimate: 1.82, surprise: -0.04, surprisePercent: -2.20 },
    { quarter: 'Q1 2025', date: 'Apr 24, 2025', epsActual: 1.68, epsEstimate: 1.65, surprise: 0.03, surprisePercent: 1.82 },
  ]
}

export function getMockSentimentData(ticker: string): SentimentData {
  const seed = ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const rng = (offset: number) => ((seed * 9301 + offset * 49297) % 233280) / 233280
  const score = (rng(1) - 0.5) * 0.8 // [-0.4, 0.4]

  let label = 'Neutral'
  if (score >= 0.35) label = 'Bullish'
  else if (score >= 0.15) label = 'Somewhat-Bullish'
  else if (score <= -0.35) label = 'Bearish'
  else if (score <= -0.15) label = 'Somewhat-Bearish'

  const sources = ['Bloomberg', 'Reuters', 'CNBC', 'MarketWatch', 'Barron\'s', 'The Street']
  const sentimentLabels = ['Bullish', 'Somewhat-Bullish', 'Neutral', 'Somewhat-Bearish', 'Bearish']

  const articles = Array.from({ length: 5 }, (_, i) => {
    const articleScore = (rng(i + 10) - 0.5) * 1.2
    const clampedScore = Math.max(-1, Math.min(1, articleScore))
    let sentLabel = 'Neutral'
    if (clampedScore >= 0.35) sentLabel = 'Bullish'
    else if (clampedScore >= 0.15) sentLabel = 'Somewhat-Bullish'
    else if (clampedScore <= -0.35) sentLabel = 'Bearish'
    else if (clampedScore <= -0.15) sentLabel = 'Somewhat-Bearish'

    const hoursAgo = Math.floor(rng(i + 20) * 48)
    const pub = new Date(Date.now() - hoursAgo * 3600 * 1000)
    const timePublished = pub.toISOString().replace(/[-:T.]/g, '').slice(0, 15) + '0000'

    return {
      title: `${ticker} ${sentimentLabels[i % sentimentLabels.length]} on ${sources[i % sources.length]}`,
      url: '#',
      timePublished,
      summary: `Analysis of ${ticker} stock performance and market outlook based on recent developments and technical factors.`,
      source: sources[i % sources.length],
      overallSentimentScore: clampedScore,
      overallSentimentLabel: sentLabel,
      tickerSentimentScore: clampedScore,
      tickerSentimentLabel: sentLabel,
      relevanceScore: 0.5 + rng(i + 30) * 0.5,
    }
  })

  return { averageScore: score, label, articleCount: articles.length, articles }
}

export function generatePriceHistory(basePrice: number, days: number): { date: string; price: number; volume: number }[] {
  const data = []
  let currentPrice = basePrice * 0.85
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const change = (Math.random() - 0.48) * (basePrice * 0.03)
    currentPrice = Math.max(currentPrice + change, basePrice * 0.7)
    currentPrice = Math.min(currentPrice, basePrice * 1.15)
    
    const volume = Math.floor(Math.random() * 50000000) + 20000000
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2)),
      volume
    })
  }
  
  if (data.length > 0) {
    data[data.length - 1].price = basePrice
  }
  
  return data
}
