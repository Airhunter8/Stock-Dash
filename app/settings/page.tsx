'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettings } from '@/hooks/use-settings'
import type { AccentTheme, CardStyle } from '@/hooks/use-settings'
import {
  Palette, Bell, TrendingUp, Shield, RotateCcw,
  User, Check
} from 'lucide-react'

const ACCENT_THEMES: { id: AccentTheme; label: string; color: string; ring: string }[] = [
  { id: 'amber',   label: 'Amber',   color: 'oklch(0.74 0.18 68)',  ring: 'oklch(0.74 0.18 68 / 0.5)' },
  { id: 'emerald', label: 'Emerald', color: 'oklch(0.70 0.19 145)', ring: 'oklch(0.70 0.19 145 / 0.5)' },
  { id: 'sapphire',label: 'Sapphire',color: 'oklch(0.65 0.20 220)', ring: 'oklch(0.65 0.20 220 / 0.5)' },
  { id: 'rose',    label: 'Rose',    color: 'oklch(0.72 0.22 5)',   ring: 'oklch(0.72 0.22 5 / 0.5)' },
  { id: 'violet',  label: 'Violet',  color: 'oklch(0.65 0.22 285)', ring: 'oklch(0.65 0.22 285 / 0.5)' },
  { id: 'crimson', label: 'Crimson', color: 'oklch(0.60 0.22 25)',  ring: 'oklch(0.60 0.22 25 / 0.5)' },
]

const CARD_STYLES: { id: CardStyle; label: string; description: string }[] = [
  { id: 'gradient', label: 'Gradient', description: 'Warm brown depth gradient' },
  { id: 'flat',     label: 'Flat',     description: 'Solid dark surface, minimal' },
  { id: 'glass',    label: 'Glass',    description: 'Frosted glass with blur' },
]

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
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

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-border/30 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground/90">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { settings, updateSettings, resetSettings, loaded } = useSettings()
  const [tradeSizeInput, setTradeSizeInput] = useState<string>('')

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-muted-foreground text-sm tracking-wider animate-pulse">
            Loading settings...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 pt-28 pb-32 max-w-[860px] mx-auto space-y-8">
        {/* Page heading */}
        <div>
          <h1
            className="text-3xl font-bold text-foreground tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Customize your StocFlow experience
          </p>
        </div>

        {/* ── Profile ── */}
        <Card>
          <CardHeader className="pb-0">
            <SectionHeading icon={User} title="Profile" />
          </CardHeader>
          <CardContent>
            <SettingRow label="Display Name" description="Shown throughout the dashboard">
              <p className="text-sm text-foreground/70 font-medium">
                {session?.user?.name ?? '—'}
              </p>
            </SettingRow>
            <SettingRow label="Email" description="Your account email address">
              <p className="text-sm text-muted-foreground">{session?.user?.email ?? '—'}</p>
            </SettingRow>
            <SettingRow label="Account Type" description="Paper trading simulator account">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary border border-primary/30 bg-primary/10 px-2.5 py-1 rounded-full">
                Simulator
              </span>
            </SettingRow>
          </CardContent>
        </Card>

        {/* ── Appearance ── */}
        <Card>
          <CardHeader className="pb-0">
            <SectionHeading icon={Palette} title="Appearance" />
          </CardHeader>
          <CardContent>
            {/* Accent color */}
            <div className="pb-5 mb-5 border-b border-border/30">
              <p className="text-sm font-medium text-foreground/90 mb-1">Accent Color</p>
              <p className="text-xs text-muted-foreground mb-4">
                Changes the primary highlight color across the entire app
              </p>
              <div className="flex flex-wrap gap-3">
                {ACCENT_THEMES.map((theme) => {
                  const active = settings.accentTheme === theme.id
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        updateSettings({ accentTheme: theme.id })
                        toast.success(`Theme changed to ${theme.label}`)
                      }}
                      className="flex flex-col items-center gap-2 group"
                      aria-label={`${theme.label} theme`}
                    >
                      <div
                        className="h-10 w-10 rounded-full transition-all duration-200 flex items-center justify-center"
                        style={{
                          background: theme.color,
                          boxShadow: active
                            ? `0 0 0 2px oklch(0.08 0.01 65), 0 0 0 4px ${theme.ring}, 0 0 16px ${theme.ring}`
                            : `0 0 0 1px oklch(0.30 0.02 65)`,
                          transform: active ? 'scale(1.12)' : undefined,
                        }}
                      >
                        {active && <Check className="h-4 w-4 text-black/70 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-[10px] tracking-wider uppercase transition-colors ${
                          active ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {theme.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card Style */}
            <div>
              <p className="text-sm font-medium text-foreground/90 mb-1">Card Style</p>
              <p className="text-xs text-muted-foreground mb-4">Controls how cards appear throughout the app</p>
              <div className="grid grid-cols-3 gap-3">
                {CARD_STYLES.map((style) => {
                  const active = settings.cardStyle === style.id
                  return (
                    <button
                      key={style.id}
                      onClick={() => {
                        updateSettings({ cardStyle: style.id })
                        toast.success(`Card style set to ${style.label}`)
                      }}
                      className={`relative flex flex-col items-start p-3.5 rounded-xl border transition-all duration-200 text-left ${
                        active
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-border/40 bg-secondary/30 hover:border-border/70'
                      }`}
                    >
                      {active && (
                        <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-black stroke-[3]" />
                        </div>
                      )}
                      {/* Style preview swatch */}
                      <div
                        className="h-8 w-full rounded-lg mb-2.5"
                        style={
                          style.id === 'gradient'
                            ? { background: 'linear-gradient(135deg, oklch(0.21 0.032 68), oklch(0.12 0.014 65))' }
                            : style.id === 'flat'
                            ? { background: 'oklch(0.15 0.015 67)' }
                            : {
                                background: 'oklch(0.18 0.018 67 / 0.6)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid oklch(0.74 0.18 68 / 0.15)',
                              }
                        }
                      />
                      <p className={`text-xs font-semibold ${active ? 'text-primary' : 'text-foreground/80'}`}>
                        {style.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{style.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Compact mode */}
            <SettingRow
              label="Compact Mode"
              description="Reduces spacing and padding for denser data display"
            >
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(v) => {
                  updateSettings({ compactMode: v })
                  toast.success(v ? 'Compact mode enabled' : 'Compact mode disabled')
                }}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* ── Trading Preferences ── */}
        <Card>
          <CardHeader className="pb-0">
            <SectionHeading icon={TrendingUp} title="Trading Preferences" />
          </CardHeader>
          <CardContent>
            <SettingRow
              label="Confirm Before Trading"
              description="Show a confirmation dialog before executing any order"
            >
              <Switch
                checked={settings.confirmTrades}
                onCheckedChange={(v) => updateSettings({ confirmTrades: v })}
              />
            </SettingRow>

            <SettingRow
              label="Default Trade Size ($)"
              description="Pre-fills the order amount when opening the trade dialog"
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  className="w-28 h-8 text-sm text-right bg-secondary/50 border-border/60"
                  value={tradeSizeInput !== '' ? tradeSizeInput : settings.defaultTradeSize}
                  onChange={(e) => setTradeSizeInput(e.target.value)}
                  onBlur={() => {
                    const val = parseFloat(tradeSizeInput)
                    if (!isNaN(val) && val > 0) {
                      updateSettings({ defaultTradeSize: val })
                      toast.success('Default trade size saved')
                    }
                    setTradeSizeInput('')
                  }}
                />
              </div>
            </SettingRow>

            <SettingRow
              label="Auto-Refresh Prices"
              description="Automatically refresh portfolio prices at an interval"
            >
              <Select
                value={String(settings.autoRefreshInterval)}
                onValueChange={(v) =>
                  updateSettings({ autoRefreshInterval: Number(v) as 0 | 10 | 30 | 60 })
                }
              >
                <SelectTrigger className="w-28 h-8 text-sm bg-secondary/50 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Off</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </CardContent>
        </Card>

        {/* ── Notifications ── */}
        <Card>
          <CardHeader className="pb-0">
            <SectionHeading icon={Bell} title="Notifications" />
          </CardHeader>
          <CardContent>
            <SettingRow
              label="Price Alerts"
              description="Notify when a watchlist stock moves significantly"
            >
              <Switch
                checked={settings.priceAlerts}
                onCheckedChange={(v) => updateSettings({ priceAlerts: v })}
              />
            </SettingRow>
            <SettingRow
              label="Portfolio Summary"
              description="Daily digest of your portfolio performance"
            >
              <Switch
                checked={settings.portfolioAlerts}
                onCheckedChange={(v) => updateSettings({ portfolioAlerts: v })}
              />
            </SettingRow>
            <SettingRow
              label="Trade Confirmations"
              description="In-app notification when an order is executed"
            >
              <Switch
                checked={settings.tradeAlerts}
                onCheckedChange={(v) => updateSettings({ tradeAlerts: v })}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* ── Danger Zone ── */}
        <Card className="border-destructive/20">
          <CardHeader className="pb-0">
            <SectionHeading icon={Shield} title="Reset & Data" />
          </CardHeader>
          <CardContent>
            <SettingRow
              label="Reset All Settings"
              description="Restore all preferences to their default values"
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-border/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5 gap-1.5"
                onClick={() => {
                  resetSettings()
                  toast.success('Settings reset to defaults')
                }}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </SettingRow>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
