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
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Market News</CardTitle>
        <p className="text-sm text-muted-foreground">News related to your portfolio</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relevantArticles.map(article => (
            <a
              key={article.id}
              href={article.url}
              className="block p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-muted-foreground">{article.source}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(article.timestamp)}
                    </span>
                    <div className="flex gap-1">
                      {article.relatedSymbols.map(symbol => (
                        <Badge key={symbol} variant="secondary" className="text-xs">
                          {symbol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
