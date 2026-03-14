'use client'

import { useEffect } from 'react'
import { applyThemeToDOM, DEFAULTS } from '@/hooks/use-settings'
import type { AppSettings } from '@/hooks/use-settings'

// Runs once on mount across the whole app to apply persisted theme before first render flash
export function ThemeApplier() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('stocflow-settings')
      if (stored) {
        const settings: AppSettings = { ...DEFAULTS, ...JSON.parse(stored) }
        applyThemeToDOM(settings)
      }
    } catch {}
  }, [])

  return null
}
