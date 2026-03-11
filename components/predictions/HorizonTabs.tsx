import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScenarioCard } from './ScenarioCard'
import type { PredictionResult } from '@/lib/server/prediction-engine'

interface Props {
  result: PredictionResult
}

export function HorizonTabs({ result }: Props) {
  const horizonKeys = ['7d', '30d', '90d'] as const
  const labels: Record<typeof horizonKeys[number], string> = {
    '7d': '7 Days',
    '30d': '30 Days',
    '90d': '90 Days',
  }

  return (
    <Tabs defaultValue="7d">
      <TabsList className="grid w-full grid-cols-3">
        {horizonKeys.map((h) => (
          <TabsTrigger key={h} value={h}>{labels[h]}</TabsTrigger>
        ))}
      </TabsList>
      {horizonKeys.map((h) => (
        <TabsContent key={h} value={h} className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScenarioCard scenario="Bull" data={result.horizons[h].bull} currentPrice={result.currentPrice} />
            <ScenarioCard scenario="Base" data={result.horizons[h].base} currentPrice={result.currentPrice} />
            <ScenarioCard scenario="Bear" data={result.horizons[h].bear} currentPrice={result.currentPrice} />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
