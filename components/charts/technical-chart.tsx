'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Button } from '@/components/ui/button'

export interface HistoricalBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  adjClose: number
  volume: number
}

interface TechnicalChartProps {
  ticker: string
  bars?: HistoricalBar[]
  height?: number
}

type Period = '1W' | '1M' | '3M' | '1Y' | '5Y'

interface Indicators {
  ma20: boolean
  ma50: boolean
  ma200: boolean
  ema20: boolean
  rsi: boolean
  macd: boolean
  volume: boolean
  bollinger: boolean
}

function calcSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null
    const slice = data.slice(i - period + 1, i + 1)
    return slice.reduce((a, b) => a + b, 0) / period
  })
}

function calcEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1)
  const result: (number | null)[] = []
  let ema: number | null = null

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
      continue
    }
    if (i === period - 1) {
      ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period
    } else {
      ema = data[i] * k + (ema as number) * (1 - k)
    }
    result.push(ema)
  }
  return result
}

function calcRSI(data: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = []
  const changes = data.map((v, i) => (i === 0 ? 0 : v - data[i - 1]))

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null)
      continue
    }
    const gains = changes.slice(i - period + 1, i + 1).filter((c) => c > 0)
    const losses = changes.slice(i - period + 1, i + 1).filter((c) => c < 0).map((c) => -c)
    const avgGain = gains.reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.reduce((a, b) => a + b, 0) / period
    if (avgLoss === 0) {
      result.push(100)
    } else {
      const rs = avgGain / avgLoss
      result.push(100 - 100 / (1 + rs))
    }
  }
  return result
}

function calcMACD(data: number[]): {
  macd: (number | null)[]
  signal: (number | null)[]
  histogram: (number | null)[]
} {
  const ema12 = calcEMA(data, 12)
  const ema26 = calcEMA(data, 26)
  const macdLine = ema12.map((v, i) =>
    v !== null && ema26[i] !== null ? v - (ema26[i] as number) : null
  )
  const macdValues = macdLine.map((v) => (v !== null ? v : 0))
  const signalLine = calcEMA(macdValues, 9)
  const histogram = macdLine.map((v, i) =>
    v !== null && signalLine[i] !== null ? v - (signalLine[i] as number) : null
  )
  return { macd: macdLine, signal: signalLine, histogram }
}

function calcBollinger(
  data: number[],
  period = 20
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = calcSMA(data, period)
  const upper = middle.map((m, i) => {
    if (m === null) return null
    const slice = data.slice(i - period + 1, i + 1)
    const variance = slice.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / period
    return m + 2 * Math.sqrt(variance)
  })
  const lower = middle.map((m, i) => {
    if (m === null) return null
    const slice = data.slice(i - period + 1, i + 1)
    const variance = slice.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / period
    return m - 2 * Math.sqrt(variance)
  })
  return { upper, middle, lower }
}

function formatXAxis(dateStr: string, period: Period): string {
  const date = new Date(dateStr)
  if (period === '1W' || period === '1M') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (period === '3M' || period === '1Y') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

const PERIODS: Period[] = ['1W', '1M', '3M', '1Y', '5Y']

const INDICATOR_LABELS: Record<keyof Indicators, string> = {
  ma20: 'MA20',
  ma50: 'MA50',
  ma200: 'MA200',
  ema20: 'EMA20',
  rsi: 'RSI',
  macd: 'MACD',
  volume: 'Volume',
  bollinger: 'Bollinger',
}

export function TechnicalChart({ ticker, bars: initialBars = [], height = 500 }: TechnicalChartProps) {
  const [period, setPeriod] = useState<Period>('1M')
  const [bars, setBars] = useState<HistoricalBar[]>(initialBars)
  const [isLoading, setIsLoading] = useState(false)
  const [indicators, setIndicators] = useState<Indicators>({
    ma20: true,
    ma50: false,
    ma200: false,
    ema20: false,
    rsi: false,
    macd: false,
    volume: true,
    bollinger: false,
  })

  const fetchBars = useCallback(
    async (p: Period) => {
      if (!ticker) return
      try {
        setIsLoading(true)
        const res = await fetch(`/api/stocks/${ticker}/history?period=${p}`)
        if (res.ok) {
          const data = await res.json()
          setBars(data)
        }
      } catch {
        // silently fail, keep existing bars
      } finally {
        setIsLoading(false)
      }
    },
    [ticker]
  )

  useEffect(() => {
    fetchBars(period)
  }, [period, fetchBars])

  const closes = useMemo(() => bars.map((b) => b.close), [bars])

  const chartData = useMemo(() => {
    if (!bars.length) return []

    const ma20 = calcSMA(closes, 20)
    const ma50 = calcSMA(closes, 50)
    const ma200 = calcSMA(closes, 200)
    const ema20 = calcEMA(closes, 20)
    const rsi = calcRSI(closes)
    const { macd, signal, histogram } = calcMACD(closes)
    const { upper, middle, lower } = calcBollinger(closes)

    return bars.map((bar, i) => ({
      date: bar.date,
      price: bar.close,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      volume: bar.volume,
      ma20: ma20[i],
      ma50: ma50[i],
      ma200: ma200[i],
      ema20: ema20[i],
      rsi: rsi[i],
      macd: macd[i],
      signal: signal[i],
      histogram: histogram[i],
      bollingerUpper: upper[i],
      bollingerMiddle: middle[i],
      bollingerLower: lower[i],
    }))
  }, [bars, closes])

  const toggleIndicator = (key: keyof Indicators) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const formatCurrency = (v: number) =>
    `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    if (!d) return null
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-xs space-y-1 shadow-lg">
        <p className="font-semibold text-foreground">{label}</p>
        <p>O: {formatCurrency(d.open)} H: {formatCurrency(d.high)}</p>
        <p>L: {formatCurrency(d.low)} C: {formatCurrency(d.price)}</p>
        <p className="text-muted-foreground">Vol: {d.volume?.toLocaleString()}</p>
        {indicators.ma20 && d.ma20 && <p style={{ color: '#3b82f6' }}>MA20: {formatCurrency(d.ma20)}</p>}
        {indicators.ma50 && d.ma50 && <p style={{ color: '#f59e0b' }}>MA50: {formatCurrency(d.ma50)}</p>}
        {indicators.ma200 && d.ma200 && <p style={{ color: '#ef4444' }}>MA200: {formatCurrency(d.ma200)}</p>}
        {indicators.ema20 && d.ema20 && <p style={{ color: '#8b5cf6' }}>EMA20: {formatCurrency(d.ema20)}</p>}
        {indicators.bollinger && d.bollingerUpper && (
          <>
            <p style={{ color: '#6366f1' }}>BB Upper: {formatCurrency(d.bollingerUpper)}</p>
            <p style={{ color: '#6366f1' }}>BB Lower: {formatCurrency(d.bollingerLower)}</p>
          </>
        )}
      </div>
    )
  }

  const xAxisInterval = Math.max(1, Math.floor(chartData.length / 8))

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {PERIODS.map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
            className="h-7 px-3 text-xs"
          >
            {p}
          </Button>
        ))}
        {isLoading && <span className="text-xs text-muted-foreground ml-2">Loading...</span>}
      </div>

      {/* Indicator toggles */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(indicators) as (keyof Indicators)[]).map((key) => (
          <button
            key={key}
            onClick={() => toggleIndicator(key)}
            className={`px-2 py-1 rounded text-xs border transition-colors ${
              indicators[key]
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:border-foreground'
            }`}
          >
            {INDICATOR_LABELS[key]}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div
          className="flex items-center justify-center bg-card rounded-lg border border-border text-muted-foreground text-sm"
          style={{ height }}
        >
          {isLoading ? 'Loading chart data...' : 'No data available'}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Main price chart */}
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatXAxis(v, period)}
                interval={xAxisInterval}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="price"
                domain={['auto', 'auto']}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              {indicators.volume && (
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />

              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price"
                fill="#22c55e33"
                stroke="#22c55e"
                strokeWidth={1.5}
                dot={false}
                name="Price"
              />

              {indicators.volume && (
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill="#64748b"
                  opacity={0.4}
                  name="Volume"
                />
              )}

              {indicators.ma20 && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ma20"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA20"
                  connectNulls
                />
              )}
              {indicators.ma50 && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ma50"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA50"
                  connectNulls
                />
              )}
              {indicators.ma200 && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ma200"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA200"
                  connectNulls
                />
              )}
              {indicators.ema20 && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ema20"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={false}
                  name="EMA20"
                  connectNulls
                />
              )}

              {indicators.bollinger && (
                <>
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="bollingerUpper"
                    stroke="#6366f1"
                    strokeWidth={1}
                    strokeDasharray="4 2"
                    dot={false}
                    name="BB Upper"
                    connectNulls
                  />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="bollingerMiddle"
                    stroke="#6366f1"
                    strokeWidth={1}
                    dot={false}
                    name="BB Middle"
                    connectNulls
                  />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="bollingerLower"
                    stroke="#6366f1"
                    strokeWidth={1}
                    strokeDasharray="4 2"
                    dot={false}
                    name="BB Lower"
                    connectNulls
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* RSI panel */}
          {indicators.rsi && (
            <ResponsiveContainer width="100%" height={120}>
              <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatXAxis(v, period)}
                  interval={xAxisInterval}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                  ticks={[0, 30, 70, 100]}
                />
                <Tooltip
                  formatter={(v: any) => [typeof v === 'number' ? v.toFixed(2) : v, 'RSI']}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 11 }}
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  dot={false}
                  name="RSI"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* MACD panel */}
          {indicators.macd && (
            <ResponsiveContainer width="100%" height={120}>
              <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatXAxis(v, period)}
                  interval={xAxisInterval}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 11 }}
                />
                <Bar
                  dataKey="histogram"
                  name="Histogram"
                  fill="#22c55e"
                  // Each bar colored by sign via Cell would need extra code; use unified color
                />
                <Line
                  type="monotone"
                  dataKey="macd"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                  name="MACD"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="signal"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="Signal"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}
