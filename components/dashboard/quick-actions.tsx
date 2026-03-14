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
    <Card className="bg-card border-border/60 luxury-glow">
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/15 hover:border-primary/50 hover:text-primary bg-secondary/30 border-border/60 transition-all duration-200"
            style={{ boxShadow: '0 0 12px oklch(0.74 0.18 68 / 0.06)' }}
            onClick={onDeposit}
          >
            <ArrowDownToLine className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium tracking-wide">Deposit</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-accent hover:border-border/80 bg-secondary/20 border-border/50 transition-all duration-200"
            onClick={onWithdraw}
          >
            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium tracking-wide">Withdraw</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/15 hover:border-primary/50 hover:text-primary bg-secondary/30 border-border/60 transition-all duration-200"
            onClick={onTrade}
          >
            <Search className="h-4 w-4 text-primary/70" />
            <span className="text-xs font-medium tracking-wide">Find Stock</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-accent hover:border-border/80 bg-secondary/20 border-border/50 transition-all duration-200"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium tracking-wide">Refresh</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
