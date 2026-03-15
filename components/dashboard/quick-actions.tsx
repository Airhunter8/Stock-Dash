'use client'

import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  onDeposit: () => void
  onWithdraw: () => void
  onTrade: () => void
  onRefresh: () => void
}

export function QuickActions({ onDeposit, onWithdraw, onTrade, onRefresh }: QuickActionsProps) {
  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-2">
          {/* Primary actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onDeposit}
              className="group relative flex flex-col items-center justify-center h-16 gap-1.5 rounded-xl border cursor-pointer overflow-hidden transition-all duration-200 bg-primary/8 border-primary/25 hover:bg-primary/15 hover:border-primary/50 active:scale-95"
              style={{ transitionTimingFunction: 'var(--ease-expo)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, color-mix(in oklch, var(--primary) 12%, transparent), transparent)' }} />
              <ArrowDownToLine className="relative h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-110" style={{ transitionTimingFunction: 'var(--ease-expo)' }} />
              <span className="relative text-[10px] font-semibold tracking-wider uppercase text-primary/80 group-hover:text-primary">Deposit</span>
            </button>

            <button
              onClick={onTrade}
              className="group relative flex flex-col items-center justify-center h-16 gap-1.5 rounded-xl border cursor-pointer overflow-hidden transition-all duration-200 bg-primary/8 border-primary/25 hover:bg-primary/15 hover:border-primary/50 active:scale-95"
              style={{ transitionTimingFunction: 'var(--ease-expo)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, color-mix(in oklch, var(--primary) 12%, transparent), transparent)' }} />
              <Search className="relative h-4 w-4 text-primary/70 transition-transform duration-200 group-hover:scale-110 group-hover:text-primary" style={{ transitionTimingFunction: 'var(--ease-expo)' }} />
              <span className="relative text-[10px] font-semibold tracking-wider uppercase text-primary/60 group-hover:text-primary">Find Stock</span>
            </button>
          </div>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onWithdraw}
              className="group flex flex-col items-center justify-center h-12 gap-1 rounded-xl border cursor-pointer transition-all duration-200 bg-secondary/20 border-border/40 hover:bg-accent/60 hover:border-border/70 active:scale-95"
              style={{ transitionTimingFunction: 'var(--ease-expo)' }}
            >
              <ArrowUpFromLine className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground/80 transition-colors" />
              <span className="text-[9px] font-medium tracking-wider uppercase text-muted-foreground group-hover:text-foreground/70">Withdraw</span>
            </button>

            <button
              onClick={onRefresh}
              className="group flex flex-col items-center justify-center h-12 gap-1 rounded-xl border cursor-pointer transition-all duration-200 bg-secondary/20 border-border/40 hover:bg-accent/60 hover:border-border/70 active:scale-95"
              style={{ transitionTimingFunction: 'var(--ease-expo)' }}
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground/80 group-hover:rotate-180 transition-all duration-500" style={{ transitionTimingFunction: 'var(--ease-expo)' }} />
              <span className="text-[9px] font-medium tracking-wider uppercase text-muted-foreground group-hover:text-foreground/70">Refresh</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
