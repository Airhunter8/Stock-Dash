'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { X, Plus } from 'lucide-react'

export interface StrategyRule {
  indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'PRICE'
  period?: number
  fastPeriod?: number
  slowPeriod?: number
  signalPeriod?: number
  condition: 'CROSSES_ABOVE' | 'CROSSES_BELOW' | 'GREATER_THAN' | 'LESS_THAN'
  value?: number
  compareWith?: 'SMA' | 'EMA'
  comparePeriod?: number
}

export interface BacktestConfig {
  ticker: string
  period: string
  initialCapital: number
  buyRules: StrategyRule[]
  sellRules: StrategyRule[]
}

interface BacktestFormProps {
  onSubmit: (config: BacktestConfig) => void
  isLoading: boolean
}

const INDICATORS = ['SMA', 'EMA', 'RSI', 'MACD', 'PRICE'] as const
const CONDITIONS = ['CROSSES_ABOVE', 'CROSSES_BELOW', 'GREATER_THAN', 'LESS_THAN'] as const
const CONDITION_LABELS: Record<string, string> = {
  CROSSES_ABOVE: 'Crosses Above',
  CROSSES_BELOW: 'Crosses Below',
  GREATER_THAN: 'Greater Than',
  LESS_THAN: 'Less Than',
}

const defaultRule = (): StrategyRule => ({
  indicator: 'RSI',
  period: 14,
  condition: 'LESS_THAN',
  value: 30,
})

const MA_CROSSOVER_BUY: StrategyRule[] = [
  { indicator: 'SMA', period: 50, condition: 'CROSSES_ABOVE', compareWith: 'SMA', comparePeriod: 200 },
]
const MA_CROSSOVER_SELL: StrategyRule[] = [
  { indicator: 'SMA', period: 50, condition: 'CROSSES_BELOW', compareWith: 'SMA', comparePeriod: 200 },
]
const RSI_BUY: StrategyRule[] = [
  { indicator: 'RSI', period: 14, condition: 'LESS_THAN', value: 30 },
]
const RSI_SELL: StrategyRule[] = [
  { indicator: 'RSI', period: 14, condition: 'GREATER_THAN', value: 70 },
]

function RuleEditor({
  rule,
  onChange,
  onRemove,
}: {
  rule: StrategyRule
  onChange: (r: StrategyRule) => void
  onRemove: () => void
}) {
  const needsPeriod = ['SMA', 'EMA', 'RSI'].includes(rule.indicator)
  const useCompare = rule.condition === 'CROSSES_ABOVE' || rule.condition === 'CROSSES_BELOW'

  return (
    <div className="rounded-xl border border-border/60 p-3 space-y-3 bg-secondary/20">
      <div className="flex items-center gap-2">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Indicator</Label>
            <Select
              value={rule.indicator}
              onValueChange={(v) => onChange({ ...rule, indicator: v as StrategyRule['indicator'] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDICATORS.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {needsPeriod && (
            <div className="space-y-1">
              <Label className="text-xs">Period</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                value={rule.period ?? ''}
                onChange={(e) => onChange({ ...rule, period: parseInt(e.target.value) || undefined })}
                placeholder="14"
              />
            </div>
          )}
        </div>
        <button
          onClick={onRemove}
          className="mt-4 p-1 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Condition</Label>
          <Select
            value={rule.condition}
            onValueChange={(v) => onChange({ ...rule, condition: v as StrategyRule['condition'] })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((c) => (
                <SelectItem key={c} value={c}>{CONDITION_LABELS[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {useCompare ? (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Compare With</Label>
              <Select
                value={rule.compareWith ?? 'SMA'}
                onValueChange={(v) => onChange({ ...rule, compareWith: v as 'SMA' | 'EMA' })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMA">SMA</SelectItem>
                  <SelectItem value="EMA">EMA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Compare Period</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                value={rule.comparePeriod ?? ''}
                onChange={(e) => onChange({ ...rule, comparePeriod: parseInt(e.target.value) || undefined })}
                placeholder="200"
              />
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">Value</Label>
            <Input
              className="h-8 text-xs"
              type="number"
              value={rule.value ?? ''}
              onChange={(e) => onChange({ ...rule, value: parseFloat(e.target.value) || undefined })}
              placeholder="0"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function BacktestForm({ onSubmit, isLoading }: BacktestFormProps) {
  const [ticker, setTicker] = useState('')
  const [period, setPeriod] = useState('1Y')
  const [initialCapital, setInitialCapital] = useState(10000)
  const [buyRules, setBuyRules] = useState<StrategyRule[]>([defaultRule()])
  const [sellRules, setSellRules] = useState<StrategyRule[]>([
    { indicator: 'RSI', period: 14, condition: 'GREATER_THAN', value: 70 },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker.trim()) return
    onSubmit({ ticker: ticker.toUpperCase().trim(), period, initialCapital, buyRules, sellRules })
  }

  const updateRule = (
    rules: StrategyRule[],
    setRules: (r: StrategyRule[]) => void,
    idx: number,
    updated: StrategyRule
  ) => {
    setRules(rules.map((r, i) => (i === idx ? updated : r)))
  }

  const removeRule = (
    rules: StrategyRule[],
    setRules: (r: StrategyRule[]) => void,
    idx: number
  ) => {
    setRules(rules.filter((_, i) => i !== idx))
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Strategy Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preset strategies */}
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Presets</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs border-border/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                onClick={() => {
                  setBuyRules(MA_CROSSOVER_BUY)
                  setSellRules(MA_CROSSOVER_SELL)
                }}
              >
                MA Crossover
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs border-border/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                onClick={() => {
                  setBuyRules(RSI_BUY)
                  setSellRules(RSI_SELL)
                }}
              >
                RSI Strategy
              </Button>
            </div>
          </div>

          <Separator />

          {/* Basic settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker Symbol</Label>
              <Input
                id="ticker"
                placeholder="AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1M">1 Month</SelectItem>
                  <SelectItem value="3M">3 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                  <SelectItem value="5Y">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capital">Initial Capital</Label>
            <Input
              id="capital"
              type="number"
              min="100"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 10000)}
            />
          </div>

          <Separator />

          {/* Buy rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Buy Rules</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBuyRules([...buyRules, defaultRule()])}
                className="h-7 px-2 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Rule
              </Button>
            </div>
            {buyRules.map((rule, idx) => (
              <RuleEditor
                key={idx}
                rule={rule}
                onChange={(r) => updateRule(buyRules, setBuyRules, idx, r)}
                onRemove={() => removeRule(buyRules, setBuyRules, idx)}
              />
            ))}
            {buyRules.length === 0 && (
              <p className="text-xs text-muted-foreground">No buy rules. Add a rule to define entry conditions.</p>
            )}
          </div>

          <Separator />

          {/* Sell rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Sell Rules</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSellRules([...sellRules, defaultRule()])}
                className="h-7 px-2 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Rule
              </Button>
            </div>
            {sellRules.map((rule, idx) => (
              <RuleEditor
                key={idx}
                rule={rule}
                onChange={(r) => updateRule(sellRules, setSellRules, idx, r)}
                onRemove={() => removeRule(sellRules, setSellRules, idx)}
              />
            ))}
            {sellRules.length === 0 && (
              <p className="text-xs text-muted-foreground">No sell rules. Add a rule to define exit conditions.</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !ticker.trim()}>
            {isLoading ? 'Running backtest...' : 'Run Backtest'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
