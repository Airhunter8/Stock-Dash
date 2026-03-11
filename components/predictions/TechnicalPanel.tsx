import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { TechnicalSignal } from '@/lib/server/prediction-engine'

interface Props {
  signals: TechnicalSignal[]
  technicalScore: number
}

const directionVariant: Record<TechnicalSignal['direction'], 'default' | 'secondary' | 'destructive'> = {
  bullish: 'default',
  neutral: 'secondary',
  bearish: 'destructive',
}

const directionLabel: Record<TechnicalSignal['direction'], string> = {
  bullish: 'Bullish',
  neutral: 'Neutral',
  bearish: 'Bearish',
}

export function TechnicalPanel({ signals, technicalScore }: Props) {
  const scoreColor =
    technicalScore >= 60 ? 'text-green-500' : technicalScore <= 40 ? 'text-red-500' : 'text-yellow-500'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Technical Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Score</span>
            <span className={`font-bold text-lg ${scoreColor}`}>{technicalScore}/100</span>
          </div>
          <Progress value={technicalScore} className="h-2" />
        </div>

        <div className="space-y-2">
          {signals.map((sig) => (
            <div key={sig.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{sig.name}</span>
              <Badge variant={directionVariant[sig.direction]} className="text-xs">
                {directionLabel[sig.direction]}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
