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
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/10 hover:border-primary bg-transparent"
            onClick={onDeposit}
          >
            <ArrowDownToLine className="h-5 w-5 text-primary" />
            <span className="text-sm">Deposit</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/10 hover:border-primary bg-transparent"
            onClick={onWithdraw}
          >
            <ArrowUpFromLine className="h-5 w-5 text-foreground" />
            <span className="text-sm">Withdraw</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/10 hover:border-primary bg-transparent"
            onClick={onTrade}
          >
            <Search className="h-5 w-5 text-foreground" />
            <span className="text-sm">Find Stock</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/10 hover:border-primary bg-transparent"
            onClick={onRefresh}
          >
            <RefreshCw className="h-5 w-5 text-foreground" />
            <span className="text-sm">Refresh</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
