'use client'

import { ArrowDown, ArrowUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { EarningsData } from '@/lib/types'

interface EarningsTableProps {
  earnings: EarningsData[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function EarningsTable({ earnings }: EarningsTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Earnings History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium py-3">Quarter</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-3">Report Date</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-3">EPS Est.</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-3">EPS Actual</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-3">Surprise</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((earning) => {
                const isPositiveSurprise = earning.surprise !== null && earning.surprise >= 0
                return (
                  <tr key={earning.quarter} className="border-b border-border/50">
                    <td className="py-4 text-sm text-foreground font-medium">{earning.quarter}</td>
                    <td className="py-4 text-sm text-muted-foreground">{earning.date}</td>
                    <td className="py-4 text-sm text-muted-foreground text-right">
                      {formatCurrency(earning.epsEstimate)}
                    </td>
                    <td className="py-4 text-sm text-foreground text-right font-medium">
                      {earning.epsActual !== null ? formatCurrency(earning.epsActual) : '-'}
                    </td>
                    <td className="py-4 text-right">
                      {earning.surprise !== null ? (
                        <Badge 
                          variant="secondary" 
                          className={`${isPositiveSurprise ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}
                        >
                          <span className="flex items-center gap-1">
                            {isPositiveSurprise ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {earning.surprisePercent?.toFixed(2)}%
                          </span>
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-secondary/50">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Note:</span> Earnings surprises show the difference between actual EPS and analyst estimates. 
            A positive surprise typically indicates better-than-expected performance.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
