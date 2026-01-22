'use client'

import { useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'

interface StockPriceChartProps {
  priceHistory: { date: string; price: number; volume: number }[]
  isPositive: boolean
}

const timeRanges = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 365 },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function StockPriceChart({ priceHistory, isPositive }: StockPriceChartProps) {
  const [selectedRange, setSelectedRange] = useState('1M')

  const filteredData = (() => {
    const range = timeRanges.find(r => r.label === selectedRange)
    const days = range?.days || 30
    return priceHistory.slice(-days)
  })()

  const minPrice = Math.min(...filteredData.map(d => d.price)) * 0.995
  const maxPrice = Math.max(...filteredData.map(d => d.price)) * 1.005

  const rangeChange = filteredData.length >= 2 
    ? filteredData[filteredData.length - 1].price - filteredData[0].price 
    : 0
  const isRangePositive = rangeChange >= 0
  const chartColor = isRangePositive ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {timeRanges.map((range) => (
          <Button
            key={range.label}
            variant={selectedRange === range.label ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedRange(range.label)}
            className="text-xs"
          >
            {range.label}
          </Button>
        ))}
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                if (selectedRange === '1D') {
                  return date.toLocaleTimeString('en-US', { hour: 'numeric' })
                }
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              width={60}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(data.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(data.price)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vol: {data.volume.toLocaleString()}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
