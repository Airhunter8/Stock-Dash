import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ScenarioResult } from '@/lib/server/prediction-engine'

interface Props {
  scenario: 'Bull' | 'Base' | 'Bear'
  data: ScenarioResult
  currentPrice: number
}

const borderColor = {
  Bull: 'border-green-500/60',
  Base: 'border-border',
  Bear: 'border-red-500/60',
}

const titleColor = {
  Bull: 'text-green-500',
  Base: 'text-foreground',
  Bear: 'text-red-500',
}

const returnColor = (ret: number) =>
  ret >= 0 ? 'text-green-500' : 'text-red-500'

export function ScenarioCard({ scenario, data, currentPrice: _ }: Props) {
  return (
    <Card className={`border-2 ${borderColor[scenario]}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-semibold ${titleColor[scenario]}`}>
          {scenario} Case
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-2xl font-bold text-foreground">
            ${data.priceTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-medium ${returnColor(data.returnPercent)}`}>
            {data.returnPercent >= 0 ? '+' : ''}{data.returnPercent.toFixed(1)}%
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          Range: ${data.rangeLow.toLocaleString('en-US', { minimumFractionDigits: 2 })} – ${data.rangeHigh.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">{data.confidence}%</span>
          </div>
          <Progress value={data.confidence} className="h-1.5" />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{data.rationale}</p>
      </CardContent>
    </Card>
  )
}
