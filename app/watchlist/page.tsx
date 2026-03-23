'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useWatchlist } from '@/hooks/use-watchlist'
import { Header } from '@/components/dashboard/header'
import { toast } from 'sonner'
import { Search, Trash2, ExternalLink, TrendingUp, TrendingDown, Star } from 'lucide-react'

interface SearchResult {
  ticker: string
  name: string
  type: string
  exchange: string
}

function fmt(v: number) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

export default function WatchlistPage() {
  const router = useRouter()
  const { items, isLoading, addTicker, removeTicker } = useWatchlist()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([])
      return
    }
    try {
      const res = await fetch(`/api/stocks?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data.slice(0, 8) : [])
      }
    } catch {
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchSuggestions])

  const handleAdd = async (ticker: string) => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    try {
      await addTicker(ticker.toUpperCase())
      toast.success(`${ticker.toUpperCase()} added to watchlist`)
    } catch {
      toast.error('Failed to add ticker')
    }
  }

  const handleRemove = async (ticker: string) => {
    try {
      await removeTicker(ticker)
      toast.success(`${ticker} removed from watchlist`)
    } catch {
      toast.error('Failed to remove ticker')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="px-4 md:px-6 pt-28 pb-32 max-w-[900px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>Watchlist</h1>
          <p className="text-muted-foreground text-sm mt-1">Track stocks you are interested in</p>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search and add stocks (e.g. AAPL)"
              className="pl-9 bg-card border-border/60 h-10 rounded-xl"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  handleAdd(query.trim())
                }
              }}
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.ticker}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/50 transition-colors text-left"
                  onMouseDown={() => handleAdd(s.ticker)}
                >
                  <span className="font-medium">{s.ticker}</span>
                  <span className="text-muted-foreground truncate max-w-[60%] text-right">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Watchlist table */}
        {isLoading && !items.length ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
              <Star className="h-6 w-6 text-primary/60" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground/70">Your watchlist is empty</p>
              <p className="text-xs text-muted-foreground">Search for a ticker above to start tracking stocks</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Ticker</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Name</TableHead>
                  <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Price</TableHead>
                  <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Change</TableHead>
                  <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Change %</TableHead>
                  <TableHead className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isPositive = (item.changePercent ?? 0) >= 0
                  return (
                    <TableRow
                      key={item.ticker}
                      className="cursor-pointer border-border/30 hover:bg-accent/40 transition-colors"
                      onClick={() => router.push(`/stock/${item.ticker}`)}
                    >
                      <TableCell className="font-semibold text-sm">{item.ticker}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.name ?? '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {item.price != null ? fmt(item.price) : '—'}
                      </TableCell>
                      <TableCell className={`text-right text-sm tabular-nums ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                        {item.change != null ? (
                          <span className="flex items-center justify-end gap-1">
                            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {isPositive ? '+' : ''}{fmt(item.change)}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.changePercent != null ? (
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold tabular-nums ${isPositive ? 'text-primary border-primary/30 bg-primary/10' : 'text-destructive border-destructive/30 bg-destructive/10'}`}
                          >
                            {fmtPct(item.changePercent)}
                          </Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-primary"
                            onClick={() => router.push(`/stock/${item.ticker}`)}
                            title="View chart"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemove(item.ticker)}
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
