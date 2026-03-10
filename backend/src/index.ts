import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { FinnhubClient, PriceUpdate } from './finnhub-client'

dotenv.config()

const PORT = parseInt(process.env.WS_PORT || '3002', 10)
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || ''

if (!FINNHUB_API_KEY) {
  console.warn('[WS] FINNHUB_API_KEY not set — price updates will not work')
}

const app = express()
app.use(cors({ origin: FRONTEND_URL, credentials: true }))
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, credentials: true },
})

// Track which tickers each socket is watching
const socketTickers = new Map<string, Set<string>>()  // socketId -> Set<ticker>

// Broadcast price updates to all sockets watching that ticker
function broadcast(updates: PriceUpdate[]) {
  io.sockets.sockets.forEach((socket) => {
    const watching = socketTickers.get(socket.id)
    if (!watching || watching.size === 0) return
    const relevant = updates.filter((u) => watching.has(u.ticker))
    if (relevant.length > 0) {
      socket.emit('price:update', relevant)
    }
  })
}

const finnhub = new FinnhubClient(FINNHUB_API_KEY, broadcast)

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`)
  socketTickers.set(socket.id, new Set())

  socket.on('subscribe', async (tickers: string[]) => {
    const watching = socketTickers.get(socket.id)!
    for (const ticker of tickers) {
      const t = ticker.toUpperCase()
      watching.add(t)
      // FinnhubClient.subscribe sends an initial snapshot on first subscribe
      await finnhub.subscribe(t)
    }
  })

  socket.on('unsubscribe', (tickers: string[]) => {
    const watching = socketTickers.get(socket.id)!
    for (const ticker of tickers) {
      const t = ticker.toUpperCase()
      watching.delete(t)
    }

    // Unsubscribe from Finnhub for tickers no socket needs anymore
    const allWatching = new Set<string>()
    socketTickers.forEach((set) => set.forEach((t) => allWatching.add(t)))
    for (const ticker of tickers) {
      if (!allWatching.has(ticker.toUpperCase())) {
        finnhub.unsubscribe(ticker.toUpperCase())
      }
    }
  })

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`)
    socketTickers.delete(socket.id)

    // Clean up any tickers no remaining socket needs
    const allWatching = new Set<string>()
    socketTickers.forEach((set) => set.forEach((t) => allWatching.add(t)))
    for (const ticker of finnhub.getSubscriptions()) {
      if (!allWatching.has(ticker)) {
        finnhub.unsubscribe(ticker)
      }
    }
  })
})

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    connections: io.sockets.sockets.size,
    tickers: finnhub.getSubscriptions(),
  })
})

httpServer.listen(PORT, () => {
  console.log(`[WS] WebSocket server running on port ${PORT}`)
})
