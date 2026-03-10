import type { HistoricalBar } from '@/lib/market-data/types'

export interface StrategyRule {
  indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'PRICE'
  period?: number
  fastPeriod?: number
  slowPeriod?: number
  signalPeriod?: number
  condition: 'CROSSES_ABOVE' | 'CROSSES_BELOW' | 'GREATER_THAN' | 'LESS_THAN'
  value?: number
  compareWith?: 'SMA' | 'EMA'
  comparePeriod?: number
}

export interface BacktestRequest {
  ticker: string
  bars: HistoricalBar[]
  buyRules: StrategyRule[]
  sellRules: StrategyRule[]
  initialCapital: number
}

export interface BacktestTrade {
  date: string
  type: 'BUY' | 'SELL'
  price: number
  shares: number
  value: number
  pnl?: number
  pnlPercent?: number
}

export interface BacktestResult {
  ticker: string
  startDate: string
  endDate: string
  initialCapital: number
  finalValue: number
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  maxDrawdownPercent: number
  winRate: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  trades: BacktestTrade[]
}

// --- Indicator calculations ---

function calcSMA(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) => {
    if (i < period - 1) return null
    const slice = prices.slice(i - period + 1, i + 1)
    return slice.reduce((a, b) => a + b, 0) / period
  })
}

function calcEMA(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(prices.length).fill(null)
  const k = 2 / (period + 1)
  let ema: number | null = null
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result[i] = null
      continue
    }
    if (i === period - 1) {
      ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
    } else {
      ema = prices[i] * k + (ema as number) * (1 - k)
    }
    result[i] = ema
  }
  return result
}

function calcRSI(prices: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = new Array(prices.length).fill(null)
  if (prices.length < period + 1) return result

  const gains: number[] = []
  const losses: number[] = []

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    gains.push(diff > 0 ? diff : 0)
    losses.push(diff < 0 ? -diff : 0)
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period

  for (let i = period; i < prices.length; i++) {
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    result[i] = 100 - 100 / (1 + rs)
    const gIdx = i - 1
    avgGain = (avgGain * (period - 1) + gains[gIdx]) / period
    avgLoss = (avgLoss * (period - 1) + losses[gIdx]) / period
  }

  return result
}

interface MACDResult {
  macd: number | null
  signal: number | null
  histogram: number | null
}

function calcMACD(
  prices: number[],
  fast = 12,
  slow = 26,
  signal = 9
): MACDResult[] {
  const fastEMA = calcEMA(prices, fast)
  const slowEMA = calcEMA(prices, slow)
  const macdLine: (number | null)[] = prices.map((_, i) => {
    if (fastEMA[i] === null || slowEMA[i] === null) return null
    return (fastEMA[i] as number) - (slowEMA[i] as number)
  })

  const macdValues = macdLine.filter((v): v is number => v !== null)
  const signalEMA = calcEMA(macdValues, signal)

  const result: MACDResult[] = []
  let signalIdx = 0
  let macdCount = 0

  for (let i = 0; i < prices.length; i++) {
    if (macdLine[i] === null) {
      result.push({ macd: null, signal: null, histogram: null })
    } else {
      const sig = signalEMA[macdCount] ?? null
      const macdVal = macdLine[i] as number
      result.push({
        macd: macdVal,
        signal: sig,
        histogram: sig !== null ? macdVal - sig : null,
      })
      macdCount++
    }
  }

  return result
}

// --- Rule evaluation ---

function getIndicatorValues(
  rule: StrategyRule,
  closes: number[],
  idx: number
): { current: number | null; previous: number | null } {
  const prev = idx > 0 ? idx - 1 : 0

  if (rule.indicator === 'PRICE') {
    return { current: closes[idx], previous: closes[prev] }
  }

  if (rule.indicator === 'SMA') {
    const period = rule.period || 20
    const sma = calcSMA(closes.slice(0, idx + 1), period)
    const smaPrev = calcSMA(closes.slice(0, idx), period)
    return {
      current: sma[sma.length - 1],
      previous: smaPrev.length > 0 ? smaPrev[smaPrev.length - 1] : null,
    }
  }

  if (rule.indicator === 'EMA') {
    const period = rule.period || 20
    const ema = calcEMA(closes.slice(0, idx + 1), period)
    const emaPrev = calcEMA(closes.slice(0, idx), period)
    return {
      current: ema[ema.length - 1],
      previous: emaPrev.length > 0 ? emaPrev[emaPrev.length - 1] : null,
    }
  }

  if (rule.indicator === 'RSI') {
    const period = rule.period || 14
    const rsi = calcRSI(closes.slice(0, idx + 1), period)
    const rsiPrev = calcRSI(closes.slice(0, idx), period)
    return {
      current: rsi[rsi.length - 1],
      previous: rsiPrev.length > 0 ? rsiPrev[rsiPrev.length - 1] : null,
    }
  }

  if (rule.indicator === 'MACD') {
    const fast = rule.fastPeriod || 12
    const slow = rule.slowPeriod || 26
    const sig = rule.signalPeriod || 9
    const macd = calcMACD(closes.slice(0, idx + 1), fast, slow, sig)
    const macdPrev = calcMACD(closes.slice(0, idx), fast, slow, sig)
    const cur = macd[macd.length - 1]?.macd ?? null
    const pre = macdPrev.length > 0 ? (macdPrev[macdPrev.length - 1]?.macd ?? null) : null
    return { current: cur, previous: pre }
  }

  return { current: null, previous: null }
}

function getCompareValue(
  rule: StrategyRule,
  closes: number[],
  idx: number
): { current: number | null; previous: number | null } {
  if (rule.value !== undefined) {
    return { current: rule.value, previous: rule.value }
  }
  if (rule.compareWith && rule.comparePeriod) {
    const period = rule.comparePeriod
    if (rule.compareWith === 'SMA') {
      const sma = calcSMA(closes.slice(0, idx + 1), period)
      const smaPrev = calcSMA(closes.slice(0, idx), period)
      return {
        current: sma[sma.length - 1],
        previous: smaPrev.length > 0 ? smaPrev[smaPrev.length - 1] : null,
      }
    }
    if (rule.compareWith === 'EMA') {
      const ema = calcEMA(closes.slice(0, idx + 1), period)
      const emaPrev = calcEMA(closes.slice(0, idx), period)
      return {
        current: ema[ema.length - 1],
        previous: emaPrev.length > 0 ? emaPrev[emaPrev.length - 1] : null,
      }
    }
  }
  return { current: null, previous: null }
}

function evaluateRule(rule: StrategyRule, closes: number[], idx: number): boolean {
  if (idx < 1) return false

  const { current, previous } = getIndicatorValues(rule, closes, idx)
  const { current: cmpCurrent, previous: cmpPrevious } = getCompareValue(rule, closes, idx)

  if (current === null) return false

  switch (rule.condition) {
    case 'GREATER_THAN':
      return cmpCurrent !== null ? current > cmpCurrent : false
    case 'LESS_THAN':
      return cmpCurrent !== null ? current < cmpCurrent : false
    case 'CROSSES_ABOVE':
      if (previous === null || cmpCurrent === null || cmpPrevious === null) return false
      return previous <= cmpPrevious && current > cmpCurrent
    case 'CROSSES_BELOW':
      if (previous === null || cmpCurrent === null || cmpPrevious === null) return false
      return previous >= cmpPrevious && current < cmpCurrent
    default:
      return false
  }
}

// --- Main backtest runner ---

export function runBacktest(req: BacktestRequest): BacktestResult {
  const { ticker, bars, buyRules, sellRules, initialCapital } = req

  if (bars.length === 0) {
    throw new Error('No historical bars provided for backtesting')
  }

  const closes = bars.map((b) => b.close)
  let cash = initialCapital
  let shares = 0
  let entryPrice = 0
  const trades: BacktestTrade[] = []
  const portfolioValues: number[] = []

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i]
    const price = bar.close
    const portfolioValue = cash + shares * price
    portfolioValues.push(portfolioValue)

    if (shares === 0) {
      // Check buy signal
      const buySignal = buyRules.every((rule) => evaluateRule(rule, closes, i))
      if (buySignal && cash > 0) {
        const sharesToBuy = Math.floor(cash / price)
        if (sharesToBuy > 0) {
          const value = sharesToBuy * price
          cash -= value
          shares = sharesToBuy
          entryPrice = price
          trades.push({
            date: bar.date,
            type: 'BUY',
            price,
            shares: sharesToBuy,
            value,
          })
        }
      }
    } else {
      // Check sell signal
      const sellSignal = sellRules.every((rule) => evaluateRule(rule, closes, i))
      if (sellSignal) {
        const value = shares * price
        const pnl = (price - entryPrice) * shares
        const pnlPercent = ((price - entryPrice) / entryPrice) * 100
        trades.push({
          date: bar.date,
          type: 'SELL',
          price,
          shares,
          value,
          pnl,
          pnlPercent,
        })
        cash += value
        shares = 0
        entryPrice = 0
      }
    }
  }

  // Close any open position at the end
  if (shares > 0) {
    const lastBar = bars[bars.length - 1]
    const price = lastBar.close
    const value = shares * price
    const pnl = (price - entryPrice) * shares
    const pnlPercent = ((price - entryPrice) / entryPrice) * 100
    trades.push({
      date: lastBar.date,
      type: 'SELL',
      price,
      shares,
      value,
      pnl,
      pnlPercent,
    })
    cash += value
    shares = 0
  }

  const finalValue = cash
  const totalReturn = finalValue - initialCapital
  const totalReturnPercent = (totalReturn / initialCapital) * 100

  // Annualized return
  const startDate = bars[0].date
  const endDate = bars[bars.length - 1].date
  const startMs = new Date(startDate).getTime()
  const endMs = new Date(endDate).getTime()
  const years = (endMs - startMs) / (365.25 * 24 * 60 * 60 * 1000)
  const annualizedReturn =
    years > 0 ? (Math.pow(finalValue / initialCapital, 1 / years) - 1) * 100 : 0

  // Sharpe ratio
  const dailyReturns: number[] = []
  for (let i = 1; i < portfolioValues.length; i++) {
    dailyReturns.push((portfolioValues[i] - portfolioValues[i - 1]) / portfolioValues[i - 1])
  }
  const riskFreePerDay = 0.02 / 252
  const excessReturns = dailyReturns.map((r) => r - riskFreePerDay)
  const meanExcess = excessReturns.reduce((a, b) => a + b, 0) / (excessReturns.length || 1)
  const variance =
    excessReturns.reduce((sum, r) => sum + Math.pow(r - meanExcess, 2), 0) /
    (excessReturns.length || 1)
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? (meanExcess / stdDev) * Math.sqrt(252) : 0

  // Max drawdown
  let peak = portfolioValues[0]
  let maxDrawdown = 0
  let maxDrawdownPercent = 0
  for (const val of portfolioValues) {
    if (val > peak) peak = val
    const dd = peak - val
    if (dd > maxDrawdown) {
      maxDrawdown = dd
      maxDrawdownPercent = (dd / peak) * 100
    }
  }

  // Win/loss stats
  const sellTrades = trades.filter((t) => t.type === 'SELL' && t.pnl !== undefined)
  const winningTrades = sellTrades.filter((t) => (t.pnl ?? 0) > 0)
  const losingTrades = sellTrades.filter((t) => (t.pnl ?? 0) <= 0)
  const totalTrades = sellTrades.length
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0
  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0) / winningTrades.length
      : 0
  const avgLoss =
    losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0) / losingTrades.length
      : 0
  const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0))
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0

  return {
    ticker,
    startDate,
    endDate,
    initialCapital,
    finalValue,
    totalReturn,
    totalReturnPercent,
    annualizedReturn,
    sharpeRatio,
    maxDrawdown,
    maxDrawdownPercent,
    winRate,
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    avgWin,
    avgLoss,
    profitFactor,
    trades,
  }
}
