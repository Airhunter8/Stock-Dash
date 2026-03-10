# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Next.js frontend (port 3000)
npm run build        # Production build
npm run lint         # ESLint

# Database
npm run db:migrate   # Run Prisma migrations (dev)
npm run db:push      # Push schema changes without migration
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio (GUI)

# WebSocket server (separate process)
cd backend && npm run dev   # WebSocket server (port 3001)

# Docker (full stack)
docker-compose up -d        # Start postgres, redis, frontend, websocket
docker-compose down         # Stop all services
```

## Architecture

**Monorepo structure**: Next.js frontend + API routes at root; standalone Express/Socket.io WebSocket server in `backend/`; PostgreSQL + Prisma for data; Redis for caching.

### Stack
- **Frontend + API**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Shadcn/ui (New York)
- **Auth**: NextAuth v5 (Auth.js) with Credentials provider — config in `auth.ts` at root
- **Database**: PostgreSQL via Prisma ORM — schema at `prisma/schema.prisma`
- **Cache**: Redis (ioredis) — client at `lib/redis.ts`, helpers: `cacheGet`, `cacheSet`, `cacheDel`
- **State (client)**: Zustand stores in `store/`
- **Charts**: Recharts with custom technical indicator calculations
- **Real-time**: Socket.io in `backend/` — frontend connects via `hooks/use-realtime-prices.ts`
- **Market data**: Alpha Vantage (abstraction layer at `lib/market-data/`) — falls back to mock data if no API key

### Key files
- `auth.ts` — NextAuth config (JWT strategy, Credentials provider)
- `middleware.ts` — Auth protection for all routes except /api, /login, /register
- `lib/prisma.ts` — Singleton Prisma client
- `lib/redis.ts` — Redis client with graceful degradation
- `lib/market-data/index.ts` — Provider abstraction (`getMarketDataProvider()`)
- `lib/market-data/alpha-vantage.ts` — Alpha Vantage API implementation
- `lib/indicators.ts` — Pure TS implementations: SMA, EMA, RSI, MACD, Bollinger Bands
- `lib/server/portfolio-service.ts` — Portfolio CRUD + trade execution
- `lib/server/backtest-engine.ts` — Strategy backtesting engine
- `lib/mock-data.ts` — Fallback mock data (used when no API key set)

### Database models
`User → Portfolio → Position[]` (current holdings)
`User → Portfolio → Trade[]` (full history, with realizedPnl on SELL)
`User → Watchlist → WatchlistItem[]`
`StockData` (cached OHLCV bars, unique on ticker+date)
`StockProfile` (cached company overview)

### API routes
```
POST /api/auth/register          register new user
GET|POST /api/auth/[...nextauth] NextAuth handlers

GET  /api/stocks?q=QUERY         search tickers
GET  /api/stocks/[ticker]        company profile
GET  /api/stocks/[ticker]/quote  live quote (60s cache)
GET  /api/stocks/[ticker]/history?period=1Y  OHLCV bars

GET  /api/portfolio              positions + cash + totals
POST /api/portfolio/trade        execute BUY or SELL
GET  /api/portfolio/transactions recent trade history
POST /api/portfolio/deposit      add cash

GET    /api/watchlist            watchlist with quotes
POST   /api/watchlist            add ticker
DELETE /api/watchlist            remove ticker

POST /api/backtest               run strategy backtest
```

### Routing & pages
- `/` — Dashboard (auth protected, redirects to /login if not signed in)
- `/login`, `/register` — Auth pages (redirect to / if already signed in)
- `/portfolio` — Portfolio positions + trade history
- `/watchlist` — Watchlist management
- `/backtesting` — Strategy backtester
- `/stock/[symbol]` — Stock detail (existing, enhanced)
- `/search` — Stock search (existing, enhanced)

### Redis cache keys & TTLs
- `quote:{ticker}` — 60s
- `profile:{ticker}` — 3600s (1hr)
- `history:{ticker}:{period}` — 60–900s depending on period
- `search:{query}` — 300s

### Backtest engine
`runBacktest(req)` in `lib/server/backtest-engine.ts`. Evaluates buy/sell rules against historical bars. Each rule specifies an indicator (SMA/EMA/RSI/MACD), condition (CROSSES_ABOVE/BELOW/GREATER_THAN/LESS_THAN), and threshold. Returns: return%, Sharpe ratio, max drawdown, win rate, trade list.

### Environment variables
Copy `.env.example` to `.env.local`. Required:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (generate: `openssl rand -base64 32`)
- `ALPHA_VANTAGE_API_KEY` — free at alphavantage.co (5 req/min free tier)
- `REDIS_URL` — Redis connection (optional, degrades gracefully without it)
- `NEXT_PUBLIC_WS_URL` — WebSocket server URL (default: http://localhost:3001)

### Path alias
`@/*` → project root (e.g. `@/lib/prisma`)

### Important conventions
- Server-only imports (`lib/prisma.ts`, `lib/redis.ts`, `lib/market-data/*`, `lib/server/*`) must never be imported in client components
- API route auth check: `const session = await auth(); if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })`
- Dynamic route params in Next.js 15+: `const { ticker } = await params` (params is async)
- All currency formatted as `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
