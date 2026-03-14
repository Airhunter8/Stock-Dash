'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface PortfolioChartProps {
  totalValue: number
}

type TimeRange = '1W' | '1M' | '3M' | '1Y' | '5Y' | 'ALL'

const TIME_RANGES: TimeRange[] = ['1W', '1M', '3M', '1Y', '5Y', 'ALL']

function appendNow(
  base: { date: string; value: number }[],
  today: string,
  value: number
): { date: string; value: number }[] {
  if (base.length === 0) return [{ date: today, value }]
  const last = base[base.length - 1]
  if (last.date === today) return [...base.slice(0, -1), { date: today, value }]
  return [...base, { date: today, value }]
}

function formatDate(dateStr: string, range: TimeRange): string {
  const date = new Date(dateStr)
  if (range === '1W' || range === '1M') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (range === '3M' || range === '1Y') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function PortfolioChart({ totalValue }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y')
  const [points, setPoints] = useState<{ date: string; value: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const basePointsRef = useRef<{ date: string; value: number }[]>([])

  // Fetch historical data when time range changes
  useEffect(() => {
    let cancelled = false
    async function fetchHistory() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/portfolio/history?period=${timeRange}`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        if (!cancelled) {
          basePointsRef.current = data.points ?? []
          const today = new Date().toISOString().split('T')[0]
          const withNow = appendNow(basePointsRef.current, today, totalValue)
          setPoints(withNow)
        }
      } catch {
        if (!cancelled) setPoints([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchHistory()
    return () => { cancelled = true }
  }, [timeRange]) // eslint-disable-line

  // Update the trailing "now" point whenever totalValue changes (real-time price tick)
  useEffect(() => {
    if (basePointsRef.current.length === 0) return
    const today = new Date().toISOString().split('T')[0]
    setPoints(appendNow(basePointsRef.current, today, totalValue))
  }, [totalValue])

  const chartData = points.map((p) => ({
    time: formatDate(p.date, timeRange),
    value: p.value,
  }))

  const startValue = chartData[0]?.value ?? 0
  const isPositive = totalValue >= startValue
  const color = isPositive ? 'oklch(0.74 0.18 68)' : 'oklch(0.60 0.22 25)'

  return (
    <Card className="bg-card border-border/60 luxury-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>Portfolio Performance</CardTitle>
        <div className="flex gap-0.5">
          {TIME_RANGES.map((range) => (
            <Button
              key={range}
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange(range)}
              className={`text-xs px-2 h-7 rounded-md ${
                timeRange === range
                  ? 'bg-primary/15 text-primary font-semibold hover:bg-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-xl" />
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No historical data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.5 0 0)', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border/60 rounded-xl px-3 py-2.5 shadow-xl">
                          <p className="text-foreground font-semibold tabular-nums text-sm">
                            ${payload[0].value?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-muted-foreground text-xs mt-0.5">{payload[0].payload.time}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
