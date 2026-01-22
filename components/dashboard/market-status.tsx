'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'

export function MarketStatus() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const day = currentTime.getDay()

  // Market hours: 9:30 AM - 4:00 PM ET, Monday-Friday
  const isWeekday = day >= 1 && day <= 5
  const marketOpenTime = 9 * 60 + 30 // 9:30 AM in minutes
  const marketCloseTime = 16 * 60 // 4:00 PM in minutes
  const currentTimeInMinutes = hours * 60 + minutes

  const isMarketOpen = isWeekday && currentTimeInMinutes >= marketOpenTime && currentTimeInMinutes < marketCloseTime

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${isMarketOpen ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
        <span className="text-sm font-medium text-foreground">
          {isMarketOpen ? 'Market Open' : 'Market Closed'}
        </span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2 text-muted-foreground">
        <Activity className="h-4 w-4" />
        <span className="text-sm font-mono">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
