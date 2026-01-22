'use client'

import { Clock, ExternalLink, Newspaper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { NewsArticle } from '@/lib/types'

interface StockNewsProps {
  news: NewsArticle[]
  symbol: string
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

export function StockNews({ news, symbol }: StockNewsProps) {
  if (news.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            News for {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recent news available for {symbol}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News for {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="text-xs">
                {article.source}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(article.timestamp)}
              </div>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
              {article.title}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {article.summary}
            </p>
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
