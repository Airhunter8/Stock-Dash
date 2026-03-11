'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SuggestItem {
  ticker: string
  name: string
}

interface Props {
  onAnalyze: (ticker: string) => void
  isLoading: boolean
}

export function StockSelector({ onAnalyze, isLoading }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 1) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stocks?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions((data.results || []).slice(0, 6))
          setShowDropdown(true)
        }
      } catch {
        // ignore
      }
    }, 350)
  }, [query])

  const handleSelect = (ticker: string, name: string) => {
    setSelected(ticker)
    setQuery(`${ticker} — ${name}`)
    setShowDropdown(false)
  }

  const handleAnalyze = () => {
    const ticker = selected || query.split(/[\s—]/)[0].trim().toUpperCase()
    if (ticker) onAnalyze(ticker)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stock Selector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ticker or name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected('')
            }}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="pl-10"
          />
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s.ticker}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                  onMouseDown={() => handleSelect(s.ticker, s.name)}
                >
                  <span className="font-medium text-foreground w-14 shrink-0">{s.ticker}</span>
                  <span className="text-muted-foreground truncate">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handleAnalyze}
          disabled={isLoading || (!selected && query.trim().length === 0)}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>

        <p className="text-xs text-muted-foreground">
          Predictions combine 100 days of technical data and news sentiment. For informational purposes only.
        </p>
      </CardContent>
    </Card>
  )
}
