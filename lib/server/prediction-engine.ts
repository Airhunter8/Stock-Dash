import { sma, rsi, macd, bollingerBands } from '@/lib/indicators'
import type { HistoricalBar } from '@/lib/market-data/types'
import type { SentimentData } from '@/lib/market-data/types'

export interface TechnicalSignal {
  name: string
  value: number       // [-1, 1]
  weight: number
  direction: 'bullish' | 'bearish' | 'neutral'
}

export interface ScenarioResult {
  priceTarget: number
  rangeLow: number
  rangeHigh: number
  returnPercent: number
  confidence: number
  rationale: string
}

export interface HorizonResult {
  bull: ScenarioResult
  base: ScenarioResult
  bear: ScenarioResult
}

export interface PredictionResult {
  ticker: string
  currentPrice: number
  technicalScore: number       // [0, 100]
  sentimentScore: number       // [0, 100]
  combinedScore: number        // [-1, 1]
  signals: TechnicalSignal[]
  sentiment: SentimentData
  horizons: {
    '7d': HorizonResult
    '30d': HorizonResult
    '90d': HorizonResult
  }
}

export interface PredictionInput {
  ticker: string
  bars: HistoricalBar[]
  sentiment: SentimentData
  beta?: number
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function computeATR(bars: HistoricalBar[], period: number): number {
  const trs: number[] = []
  for (let i = 1; i < bars.length; i++) {
    const prevClose = bars[i - 1].close
    const tr = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - prevClose),
      Math.abs(bars[i].low - prevClose)
    )
    trs.push(tr)
  }
  const last = trs.slice(-period)
  return last.reduce((a, b) => a + b, 0) / last.length
}

function rationale(scenario: 'bull' | 'base' | 'bear', combinedScore: number, horizon: number): string {
  const strength = Math.abs(combinedScore)
  const dir = combinedScore > 0.1 ? 'bullish' : combinedScore < -0.1 ? 'bearish' : 'mixed'
  const days = horizon

  if (scenario === 'bull') {
    if (dir === 'bullish' && strength > 0.4) return `Strong technical momentum and positive sentiment support an upside move over ${days} days.`
    if (dir === 'bullish') return `Moderately bullish signals suggest potential upside over ${days} days.`
    return `Contrarian rally possible if sentiment reverses over ${days} days.`
  }
  if (scenario === 'bear') {
    if (dir === 'bearish' && strength > 0.4) return `Weak technicals and negative sentiment increase downside risk over ${days} days.`
    if (dir === 'bearish') return `Moderately bearish signals suggest caution over the next ${days} days.`
    return `Macro or sector headwinds could pressure the stock over ${days} days.`
  }
  // base
  if (dir === 'bullish') return `Signals lean positive; base case assumes gradual appreciation over ${days} days.`
  if (dir === 'bearish') return `Signals lean negative; base case assumes modest drift lower over ${days} days.`
  return `Mixed signals point to range-bound trading over the next ${days} days.`
}

export function runPrediction({ ticker, bars, sentiment, beta = 1.0 }: PredictionInput): PredictionResult {
  const closes = bars.map((b) => b.close)
  const last = closes[closes.length - 1]

  // --- Step 1: Indicators ---
  const sma20arr = sma(closes, 20)
  const sma50arr = sma(closes, 50)
  const sma200arr = sma(closes, 200)
  const rsi14arr = rsi(closes, 14)
  const macdResult = macd(closes)
  const bbResult = bollingerBands(closes, 20)

  const sma20 = sma20arr[sma20arr.length - 1]
  const sma50 = sma50arr[sma50arr.length - 1]
  const sma200 = sma200arr[sma200arr.length - 1]
  const rsi14 = rsi14arr[rsi14arr.length - 1]
  const macdHist = macdResult.histogram[macdResult.histogram.length - 1]
  const bbUpper = bbResult.upper[bbResult.upper.length - 1]
  const bbLower = bbResult.lower[bbResult.lower.length - 1]

  const atr14 = computeATR(bars, 14)
  const atrPercent = atr14 / last

  // --- Step 2: Signals ---
  const signals: TechnicalSignal[] = []

  function addSignal(name: string, weight: number, raw: number) {
    const value = clamp(raw, -1, 1)
    const direction: TechnicalSignal['direction'] = value > 0.1 ? 'bullish' : value < -0.1 ? 'bearish' : 'neutral'
    signals.push({ name, value, weight, direction })
  }

  // SMA20/50 Cross (12)
  if (sma20 !== null && sma50 !== null) {
    addSignal('SMA20/50 Cross', 12, sma20 > sma50 ? 1 : -1)
  }

  // SMA50/200 Trend (13)
  if (sma50 !== null && sma200 !== null) {
    addSignal('SMA50/200 Trend', 13, sma50 > sma200 ? 1 : -1)
  } else {
    addSignal('SMA50/200 Trend', 13, 0)
  }

  // Price vs SMA20 (10) — pct dev linear -1→+1 at ±3%
  if (sma20 !== null) {
    const pctDev = (last - sma20) / sma20
    addSignal('Price vs SMA20', 10, clamp(-pctDev / 0.03, -1, 1))
  }

  // RSI (13)
  if (rsi14 !== null) {
    let rsiVal: number
    if (rsi14 < 35) rsiVal = 1
    else if (rsi14 > 65) rsiVal = -1
    else rsiVal = -(rsi14 - 50) / 15
    addSignal('RSI(14)', 13, rsiVal)
  }

  // MACD Histogram (12)
  if (macdHist !== null) {
    const macdNorm = atr14 > 0 ? clamp(macdHist / atr14, -1, 1) : (macdHist > 0 ? 1 : -1)
    addSignal('MACD Histogram', 12, macdNorm)
  }

  // Bollinger %B (12)
  if (bbUpper !== null && bbLower !== null) {
    const range = bbUpper - bbLower
    const pctB = range > 0 ? (last - bbLower) / range : 0.5
    let bbVal: number
    if (pctB < 0.2) bbVal = 1
    else if (pctB > 0.8) bbVal = -1
    else bbVal = -(pctB - 0.5) / 0.3
    addSignal('Bollinger %B', 12, bbVal)
  }

  // 5D Momentum (10)
  if (closes.length >= 6) {
    const ret5 = (last - closes[closes.length - 6]) / closes[closes.length - 6]
    addSignal('5D Momentum', 10, clamp(ret5 / 0.03, -1, 1))
  }

  // 20D Momentum (10)
  if (closes.length >= 21) {
    const ret20 = (last - closes[closes.length - 21]) / closes[closes.length - 21]
    addSignal('20D Momentum', 10, clamp(ret20 / 0.05, -1, 1))
  }

  // --- Step 3: Weighted score ---
  let weightedSum = 0
  let totalWeight = 0
  for (const sig of signals) {
    weightedSum += sig.value * sig.weight
    totalWeight += sig.weight
  }
  const normalizedTechnical = totalWeight > 0 ? weightedSum / totalWeight : 0
  const technicalScore = Math.round(((normalizedTechnical + 1) / 2) * 100)

  // --- Step 4: Sentiment ---
  const sentimentRaw = clamp(sentiment.averageScore, -1, 1)
  const sentimentScore = Math.round(((sentimentRaw + 1) / 2) * 100)

  // --- Step 5: Combined ---
  const combinedScore = normalizedTechnical * 0.6 + sentimentRaw * 0.4

  // --- Step 6: Annual return ---
  const baseAnnualReturn = 0.08 + combinedScore * 0.25

  // --- Step 7 & 8: Per-horizon ---
  function buildHorizon(days: number): HorizonResult {
    const frac = days / 365
    const baseReturn = baseAnnualReturn * Math.sqrt(frac)
    const rangeWidth = atrPercent * Math.sqrt(days)

    const bullReturn = baseReturn * 1.5 + rangeWidth * 0.5
    const baseRet = baseReturn
    const bearReturn = baseReturn * -0.5 - rangeWidth * 0.5

    function buildScenario(ret: number, scenario: 'bull' | 'base' | 'bear'): ScenarioResult {
      const target = last * (1 + ret)
      const rangeLow = target - rangeWidth * last * (scenario === 'bull' ? 0.3 : 0.7)
      const rangeHigh = target + rangeWidth * last * (scenario === 'bear' ? 0.3 : 0.7)

      const strength = Math.abs(combinedScore)
      const techDir = normalizedTechnical > 0 ? 1 : normalizedTechnical < 0 ? -1 : 0
      const sentDir = sentimentRaw > 0 ? 1 : sentimentRaw < 0 ? -1 : 0
      const alignment = techDir === sentDir && techDir !== 0 ? 1 : 0

      let baseConf = 50
        + strength * 25
        + alignment * Math.min(Math.abs(normalizedTechnical), Math.abs(sentimentRaw)) * 10
        - Math.max(0, (beta - 1.0) * 8)
        - (days === 90 ? 8 : days === 30 ? 4 : 0)

      let conf: number
      if (scenario === 'bull') {
        conf = combinedScore > 0 ? baseConf + strength * 5 : baseConf - strength * 8
      } else if (scenario === 'bear') {
        conf = combinedScore < 0 ? baseConf + strength * 5 : baseConf - strength * 8
      } else {
        conf = baseConf
      }

      return {
        priceTarget: Math.round(target * 100) / 100,
        rangeLow: Math.round(Math.max(0, rangeLow) * 100) / 100,
        rangeHigh: Math.round(rangeHigh * 100) / 100,
        returnPercent: Math.round(ret * 10000) / 100,
        confidence: Math.round(clamp(conf, 20, 85)),
        rationale: rationale(scenario, combinedScore, days),
      }
    }

    return {
      bull: buildScenario(bullReturn, 'bull'),
      base: buildScenario(baseRet, 'base'),
      bear: buildScenario(bearReturn, 'bear'),
    }
  }

  return {
    ticker,
    currentPrice: last,
    technicalScore,
    sentimentScore,
    combinedScore,
    signals,
    sentiment,
    horizons: {
      '7d': buildHorizon(7),
      '30d': buildHorizon(30),
      '90d': buildHorizon(90),
    },
  }
}
