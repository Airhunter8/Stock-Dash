'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface PortfolioChartProps {
  totalValue: number
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

function generateChartData(timeRange: TimeRange, currentValue: number) {
  const dataPoints: { time: string; value: number }[] = []
  let points = 0
  let startValue = currentValue * 0.95

  switch (timeRange) {
    case '1D':
      points = 24
      startValue = currentValue * 0.995
      break
    case '1W':
      points = 7
      startValue = currentValue * 0.98
      break
    case '1M':
      points = 30
      startValue = currentValue * 0.94
      break
    case '3M':
      points = 90
      startValue = currentValue * 0.88
      break
    case '1Y':
      points = 52
      startValue = currentValue * 0.75
      break
    case 'ALL':
      points = 100
      startValue = currentValue * 0.5
      break
  }

  const trend = (currentValue - startValue) / points
  
  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * (currentValue * 0.02)
    const value = startValue + (trend * i) + noise
    
    let label = ''
    switch (timeRange) {
      case '1D':
        label = `${i}:00`
        break
      case '1W':
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        label = days[i % 7]
        break
      case '1M':
        label = `Day ${i + 1}`
        break
      case '3M':
        label = `Week ${Math.floor(i / 7) + 1}`
        break
      case '1Y':
        label = `W${i + 1}`
        break
      case 'ALL':
        label = `${i + 1}`
        break
    }
    
    dataPoints.push({ time: label, value: Math.max(0, value) })
  }

  dataPoints[dataPoints.length - 1].value = currentValue

  return dataPoints
}

export function PortfolioChart({ totalValue }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const chartData = generateChartData(timeRange, totalValue)

  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL']

  const startValue = chartData[0]?.value || 0
  const isPositive = totalValue >= startValue

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl text-foreground">Portfolio Performance</CardTitle>
        <div className="flex gap-1">
          {timeRanges.map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={`text-xs px-2 ${timeRange === range ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? 'oklch(0.75 0.18 145)' : 'oklch(0.6 0.2 25)'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? 'oklch(0.75 0.18 145)' : 'oklch(0.6 0.2 25)'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.6 0 0)', fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                hide
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-foreground font-semibold">
                          ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-muted-foreground text-sm">{payload[0].payload.time}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? 'oklch(0.75 0.18 145)' : 'oklch(0.6 0.2 25)'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
