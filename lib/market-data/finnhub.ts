const API_KEY = process.env.FINNHUB_API_KEY || ''

export interface FinnhubQuote {
  price: number
  change: number
  changePercent: number
  previousClose: number
  open: number
  high: number
  low: number
}

export async function finnhubQuote(ticker: string): Promise<FinnhubQuote | null> {
  if (!API_KEY) return null
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`,
      { next: { revalidate: 0 } }
    )
    if (!res.ok) return null
    const d = await res.json()
    if (!d.c) return null
    return {
      price: d.c,
      change: d.d,
      changePercent: d.dp,
      previousClose: d.pc,
      open: d.o,
      high: d.h,
      low: d.l,
    }
  } catch {
    return null
  }
}
