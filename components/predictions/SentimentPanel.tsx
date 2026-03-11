import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { SentimentData } from '@/lib/market-data/types'

interface Props {
  sentiment: SentimentData
  sentimentScore: number
}

function sentimentBadgeClass(label: string): string {
  const l = label.toLowerCase()
  if (l === 'bullish') return 'bg-green-500/20 text-green-600 border-green-500/30'
  if (l === 'somewhat-bullish') return 'bg-lime-500/20 text-lime-600 border-lime-500/30'
  if (l === 'somewhat-bearish') return 'bg-orange-500/20 text-orange-600 border-orange-500/30'
  if (l === 'bearish') return 'bg-red-500/20 text-red-600 border-red-500/30'
  return 'bg-muted text-muted-foreground border-border'
}

function formatTime(raw: string): string {
  if (!raw || raw === '#') return ''
  // Alpha Vantage format: 20240101T120000
  if (raw.includes('T') && raw.length >= 15) {
    const y = raw.slice(0, 4)
    const mo = raw.slice(4, 6)
    const d = raw.slice(6, 8)
    return `${y}-${mo}-${d}`
  }
  try {
    return new Date(raw).toLocaleDateString()
  } catch {
    return ''
  }
}

export function SentimentPanel({ sentiment, sentimentScore }: Props) {
  const scoreColor =
    sentimentScore >= 60 ? 'text-green-500' : sentimentScore <= 40 ? 'text-red-500' : 'text-yellow-500'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">News Sentiment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sentiment Score</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${scoreColor}`}>{sentimentScore}/100</span>
              <Badge
                variant="outline"
                className={`text-xs ${sentimentBadgeClass(sentiment.label)}`}
              >
                {sentiment.label}
              </Badge>
            </div>
          </div>
          <Progress value={sentimentScore} className="h-2" />
        </div>

        <p className="text-xs text-muted-foreground">{sentiment.articleCount} articles analyzed</p>

        <ScrollArea className="h-64">
          <div className="space-y-3 pr-2">
            {sentiment.articles.map((article, i) => (
              <div key={i} className="border border-border rounded-md p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                    {article.url && article.url !== '#' ? (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {article.title}
                      </a>
                    ) : article.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${sentimentBadgeClass(article.tickerSentimentLabel)}`}
                  >
                    {article.tickerSentimentLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{article.source}</span>
                  {article.timePublished && <span>· {formatTime(article.timePublished)}</span>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
