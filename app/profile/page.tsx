'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowDown, ArrowUp, Award, Briefcase, Star, Settings,
  TrendingUp, TrendingDown, Activity, DollarSign, BarChart2,
  Clock, Target, Zap, Trophy
} from 'lucide-react'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ── Types ──────────────────────────────────────────────────────────────────

interface Transaction {
  id: string
  ticker: string
  type: 'BUY' | 'SELL'
  shares: number
  price: number
  total: number
  realizedPnl: number | null
  executedAt: string
}

interface PortfolioData {
  cashBalance: number
  totalValue: number
  totalInvested: number
  totalUnrealizedPnl: number
  positions: { ticker: string; shares: number; currentValue: number; unrealizedPnl: number }[]
}

interface TradingStats {
  totalTrades: number
  buys: number
  sells: number
  winRate: number
  totalRealizedPnl: number
  bestTrade: number
  worstTrade: number
  avgTrade: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function computeStats(transactions: Transaction[]): TradingStats {
  const sells = transactions.filter((t) => t.type === 'SELL' && t.realizedPnl !== null)
  const pnls = sells.map((t) => t.realizedPnl as number)
  const wins = pnls.filter((p) => p > 0)
  return {
    totalTrades: transactions.length,
    buys: transactions.filter((t) => t.type === 'BUY').length,
    sells: sells.length,
    winRate: sells.length > 0 ? (wins.length / sells.length) * 100 : 0,
    totalRealizedPnl: pnls.reduce((s, p) => s + p, 0),
    bestTrade: pnls.length > 0 ? Math.max(...pnls) : 0,
    worstTrade: pnls.length > 0 ? Math.min(...pnls) : 0,
    avgTrade: pnls.length > 0 ? pnls.reduce((s, p) => s + p, 0) / pnls.length : 0,
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2
        className="text-base font-semibold tracking-[0.06em] uppercase text-foreground/80"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {title}
      </h2>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string
  value: string
  sub?: string
  positive?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-secondary/25 border border-border/30">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-xl font-bold tabular-nums leading-none ${
          positive === undefined
            ? 'text-foreground'
            : positive
            ? 'text-emerald-400'
            : 'text-destructive'
        }`}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ── Achievement config ─────────────────────────────────────────────────────

function getAchievements(stats: TradingStats, portfolio: PortfolioData | null) {
  return [
    {
      id: 'first_trade',
      icon: Zap,
      label: 'First Trade',
      description: 'Executed your first order',
      unlocked: stats.totalTrades >= 1,
    },
    {
      id: 'ten_trades',
      icon: Activity,
      label: 'Active Trader',
      description: '10 trades executed',
      unlocked: stats.totalTrades >= 10,
    },
    {
      id: 'winner',
      icon: Trophy,
      label: 'Winner',
      description: 'Closed a profitable trade',
      unlocked: stats.bestTrade > 0,
    },
    {
      id: 'diversified',
      icon: BarChart2,
      label: 'Diversified',
      description: 'Holding 3+ different stocks',
      unlocked: (portfolio?.positions.length ?? 0) >= 3,
    },
    {
      id: 'high_roller',
      icon: DollarSign,
      label: 'High Roller',
      description: 'Portfolio value over $50,000',
      unlocked: (portfolio?.totalValue ?? 0) >= 50000,
    },
    {
      id: 'sharp_shooter',
      icon: Target,
      label: 'Sharp Shooter',
      description: '70%+ win rate (min 5 sells)',
      unlocked: stats.sells >= 5 && stats.winRate >= 70,
    },
  ]
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/portfolio/transactions?limit=50').then((r) => r.json()),
      fetch('/api/portfolio').then((r) => r.json()),
    ]).then(([txData, pfData]) => {
      setTransactions(txData.trades ?? [])
      if (!pfData.error) setPortfolio(pfData)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-muted-foreground text-sm tracking-wider animate-pulse">
            Loading profile...
          </div>
        </div>
      </div>
    )
  }

  const stats = computeStats(transactions)
  const achievements = getAchievements(stats, portfolio)
  const recentTrades = [...transactions].slice(0, 8)
  const initials = getInitials(session?.user?.name)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 pt-28 pb-32 max-w-[900px] mx-auto space-y-8">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-2xl border border-border/40 p-8"
          style={{
            background: 'linear-gradient(135deg, color-mix(in oklch, var(--primary) 18%, oklch(from var(--background) calc(l + 0.025) c h)) 0%, var(--background) 80%)',
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ring-2 ring-primary/30"
              style={{
                background: 'color-mix(in oklch, var(--primary) 20%, oklch(from var(--background) calc(l + 0.04) c h))',
                color: 'var(--primary)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className="text-2xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {session?.user?.name ?? 'Trader'}
                </h1>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-primary border border-primary/30 bg-primary/10 px-2.5 py-1 rounded-full">
                  Simulator
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{session?.user?.email}</p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{portfolio?.positions.length ?? 0} positions</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  <span>{stats.totalTrades} total trades</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>{formatCurrency(portfolio?.cashBalance ?? 0)} cash</span>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex gap-2 shrink-0">
              <Link href="/settings">
                <Button variant="outline" size="sm" className="gap-1.5 bg-transparent border-border/60 text-xs h-8 hover:border-primary/40 hover:text-primary">
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="outline" size="sm" className="gap-1.5 bg-transparent border-border/60 text-xs h-8 hover:border-primary/40 hover:text-primary">
                  <Briefcase className="h-3.5 w-3.5" />
                  Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Trading Stats ── */}
        <Card>
          <CardHeader className="pb-0">
            <SectionHeading icon={BarChart2} title="Trading Stats" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Total Trades"
                value={String(stats.totalTrades)}
                sub={`${stats.buys} buys · ${stats.sells} sells`}
              />
              <StatCard
                label="Win Rate"
                value={stats.sells > 0 ? `${stats.winRate.toFixed(1)}%` : '—'}
                sub={stats.sells > 0 ? `${Math.round(stats.winRate / 100 * stats.sells)} of ${stats.sells} sells` : 'No sells yet'}
                positive={stats.sells > 0 ? stats.winRate >= 50 : undefined}
              />
              <StatCard
                label="Realized P&L"
                value={stats.sells > 0 ? formatCurrency(stats.totalRealizedPnl) : '—'}
                sub="From closed positions"
                positive={stats.sells > 0 ? stats.totalRealizedPnl >= 0 : undefined}
              />
              <StatCard
                label="Portfolio Value"
                value={portfolio ? formatCurrency(portfolio.totalValue) : '—'}
                sub={portfolio && portfolio.totalUnrealizedPnl !== 0
                  ? `${portfolio.totalUnrealizedPnl >= 0 ? '+' : ''}${formatCurrency(portfolio.totalUnrealizedPnl)} unrealized`
                  : 'Open positions'}
                positive={portfolio ? portfolio.totalUnrealizedPnl >= 0 : undefined}
              />
            </div>

            {stats.sells > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <StatCard
                  label="Best Trade"
                  value={formatCurrency(stats.bestTrade)}
                  sub="Single sell profit"
                  positive={stats.bestTrade > 0}
                />
                <StatCard
                  label="Worst Trade"
                  value={formatCurrency(stats.worstTrade)}
                  sub="Single sell loss"
                  positive={stats.worstTrade >= 0}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Achievements ── */}
        <Card>
          <CardHeader className="pb-0">
            <SectionHeading icon={Award} title="Achievements" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((a) => {
                const Icon = a.icon
                return (
                  <div
                    key={a.id}
                    className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                      a.unlocked
                        ? 'border-primary/30 bg-primary/8'
                        : 'border-border/25 bg-secondary/15 opacity-50'
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        a.unlocked ? 'bg-primary/20 ring-1 ring-primary/30' : 'bg-secondary/40'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${a.unlocked ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold leading-none ${a.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {a.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                        {a.description}
                      </p>
                    </div>
                    {a.unlocked && (
                      <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Recent Activity ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <div>
              <SectionHeading icon={Clock} title="Recent Activity" />
            </div>
            <Link href="/portfolio" className="text-[10px] text-primary hover:underline mb-5">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 ? (
              <div className="text-center py-10">
                <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No trades yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Your trading history will appear here</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentTrades.map((trade) => {
                  const isBuy = trade.type === 'BUY'
                  const hasPnl = trade.realizedPnl !== null
                  const pnlPositive = hasPnl && (trade.realizedPnl as number) >= 0
                  return (
                    <div
                      key={trade.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors group"
                      style={{ transitionTimingFunction: 'var(--ease-expo)', transitionDuration: '150ms' }}
                    >
                      {/* Type badge */}
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold ${
                          isBuy
                            ? 'bg-emerald-400/10 text-emerald-400'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {isBuy ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      </div>

                      {/* Ticker + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{trade.ticker}</span>
                          <span
                            className={`text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                              isBuy
                                ? 'bg-emerald-400/10 text-emerald-400'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {trade.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {trade.shares} shares @ {formatCurrency(trade.price)} · {formatDate(trade.executedAt)}
                        </p>
                      </div>

                      {/* Total + P&L */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground tabular-nums">
                          {isBuy ? '−' : '+'}{formatCurrency(Math.abs(trade.total))}
                        </p>
                        {hasPnl && (
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums ${
                              pnlPositive ? 'text-emerald-400' : 'text-destructive'
                            }`}
                          >
                            {pnlPositive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                            {pnlPositive ? '+' : ''}{formatCurrency(trade.realizedPnl as number)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/portfolio',   icon: Briefcase,   label: 'Portfolio',   sub: `${portfolio?.positions.length ?? 0} positions` },
            { href: '/watchlist',   icon: Star,        label: 'Watchlist',   sub: 'Track stocks' },
            { href: '/backtesting', icon: TrendingUp,  label: 'Backtesting', sub: 'Test strategies' },
          ].map(({ href, icon: Icon, label, sub }) => (
            <Link key={href} href={href}>
              <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/40 bg-secondary/20 hover:border-primary/35 hover:bg-primary/6 transition-all cursor-pointer group"
                style={{ transitionTimingFunction: 'var(--ease-expo)', transitionDuration: '200ms' }}
              >
                <div className="h-9 w-9 rounded-xl bg-primary/10 ring-1 ring-primary/15 flex items-center justify-center group-hover:bg-primary/18 transition-colors">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground/85">{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  )
}
