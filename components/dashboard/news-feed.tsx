'use client'

import { ExternalLink, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { NewsArticle } from '@/lib/types'

interface NewsFeedProps {
  articles: NewsArticle[]
  portfolioSymbols: string[]
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

  if (diffInHours >= 24) {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
  if (diffInHours >= 1) {
    return `${diffInHours}h ago`
  }
  return `${diffInMinutes}m ago`
}

export function NewsFeed({ articles, portfolioSymbols }: NewsFeedProps) {
  const relevantArticles = articles.filter(article =>
    article.relatedSymbols.some(symbol => portfolioSymbols.includes(symbol))
  )

  return (
    <Card className="bg-card border-border/60 luxury-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>Market News</CardTitle>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Related to your portfolio</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-0 divide-y divide-border/40">
          {relevantArticles.map(article => (
            <a
              key={article.id}
              href={article.url}
              className="flex items-start justify-between gap-4 py-4 hover:bg-accent/40 transition-colors group px-1 -mx-1 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                  {article.summary}
                </p>
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="text-[11px] font-medium text-muted-foreground/70">{article.source}</span>
                  <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(article.timestamp)}
                  </span>
                  <div className="flex gap-1">
                    {article.relatedSymbols.map(symbol => (
                      <Badge key={symbol} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-secondary/60">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
