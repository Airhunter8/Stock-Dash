'use client'

import { useState, useEffect, useCallback } from 'react'

export type AccentTheme = 'amber' | 'emerald' | 'sapphire' | 'rose' | 'violet' | 'crimson'
export type CardStyle = 'gradient' | 'flat' | 'glass'
export type RefreshInterval = 0 | 10 | 30 | 60

export interface AppSettings {
  accentTheme: AccentTheme
  cardStyle: CardStyle
  confirmTrades: boolean
  defaultTradeSize: number
  autoRefreshInterval: RefreshInterval
  priceAlerts: boolean
  portfolioAlerts: boolean
  tradeAlerts: boolean
  compactMode: boolean
}

export const DEFAULTS: AppSettings = {
  accentTheme: 'amber',
  cardStyle: 'gradient',
  confirmTrades: true,
  defaultTradeSize: 1000,
  autoRefreshInterval: 30,
  priceAlerts: true,
  portfolioAlerts: true,
  tradeAlerts: true,
  compactMode: false,
}

const STORAGE_KEY = 'stocflow-settings'

export function applyThemeToDOM(settings: AppSettings) {
  const root = document.documentElement
  root.setAttribute('data-accent', settings.accentTheme)
  root.setAttribute('data-card-style', settings.cardStyle)
  if (settings.compactMode) {
    root.setAttribute('data-compact', 'true')
  } else {
    root.removeAttribute('data-compact')
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = { ...DEFAULTS, ...JSON.parse(stored) }
        setSettings(parsed)
        applyThemeToDOM(parsed)
      } else {
        applyThemeToDOM(DEFAULTS)
      }
    } catch {
      applyThemeToDOM(DEFAULTS)
    }
    setLoaded(true)
  }, [])

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      applyThemeToDOM(next)
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setSettings(DEFAULTS)
    applyThemeToDOM(DEFAULTS)
  }, [])

  return { settings, updateSettings, resetSettings, loaded }
}
