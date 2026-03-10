export function sma(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(null)
    } else {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) {
        sum += values[j]
      }
      result.push(sum / period)
    }
  }
  return result
}

export function ema(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  const k = 2 / (period + 1)

  // Fill nulls for the first period-1 elements
  for (let i = 0; i < period - 1; i++) {
    result.push(null)
  }

  if (values.length < period) return result

  // Seed: SMA of the first `period` values
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += values[i]
  }
  let prev = sum / period
  result.push(prev)

  // EMA for remaining values
  for (let i = period; i < values.length; i++) {
    const current = values[i] * k + prev * (1 - k)
    result.push(current)
    prev = current
  }

  return result
}

export function rsi(values: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = []

  if (values.length < period + 1) {
    return values.map(() => null)
  }

  // Calculate gains and losses
  const gains: number[] = []
  const losses: number[] = []
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1]
    gains.push(diff > 0 ? diff : 0)
    losses.push(diff < 0 ? -diff : 0)
  }

  // First period-1 values are null (no diff available for index 0)
  for (let i = 0; i < period; i++) {
    result.push(null)
  }

  // Seed: simple average of first `period` gains/losses
  let avgGain = 0
  let avgLoss = 0
  for (let i = 0; i < period; i++) {
    avgGain += gains[i]
    avgLoss += losses[i]
  }
  avgGain /= period
  avgLoss /= period

  const firstRs = avgLoss === 0 ? Infinity : avgGain / avgLoss
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRs))

  // Wilder's smoothing for remaining values
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs))
  }

  return result
}

export function macd(
  values: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): {
  macd: (number | null)[]
  signal: (number | null)[]
  histogram: (number | null)[]
} {
  const fastEma = ema(values, fastPeriod)
  const slowEma = ema(values, slowPeriod)

  const macdLine: (number | null)[] = values.map((_, i) => {
    const f = fastEma[i]
    const s = slowEma[i]
    if (f === null || s === null) return null
    return f - s
  })

  // Compute EMA of macdLine values (only non-null ones, preserving index)
  // Extract non-null macd values with their indices
  const macdValues: number[] = []
  const macdIndices: number[] = []
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null) {
      macdValues.push(macdLine[i] as number)
      macdIndices.push(i)
    }
  }

  const signalEmaValues = ema(macdValues, signalPeriod)

  const signal: (number | null)[] = new Array(values.length).fill(null)
  for (let j = 0; j < macdIndices.length; j++) {
    if (signalEmaValues[j] !== null) {
      signal[macdIndices[j]] = signalEmaValues[j]
    }
  }

  const histogram: (number | null)[] = values.map((_, i) => {
    const m = macdLine[i]
    const s = signal[i]
    if (m === null || s === null) return null
    return m - s
  })

  return { macd: macdLine, signal, histogram }
}

export function bollingerBands(
  values: number[],
  period = 20,
  stdDevMultiplier = 2
): {
  upper: (number | null)[]
  middle: (number | null)[]
  lower: (number | null)[]
} {
  const middle = sma(values, period)
  const upper: (number | null)[] = []
  const lower: (number | null)[] = []

  for (let i = 0; i < values.length; i++) {
    if (middle[i] === null) {
      upper.push(null)
      lower.push(null)
    } else {
      const avg = middle[i] as number
      let variance = 0
      for (let j = i - period + 1; j <= i; j++) {
        variance += (values[j] - avg) ** 2
      }
      const stdDev = Math.sqrt(variance / period)
      upper.push(avg + stdDevMultiplier * stdDev)
      lower.push(avg - stdDevMultiplier * stdDev)
    }
  }

  return { upper, middle, lower }
}
