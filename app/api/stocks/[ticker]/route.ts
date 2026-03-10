import { auth } from '@/auth'
import { getMarketDataProvider } from '@/lib/market-data'
import { cacheGet, cacheSet } from '@/lib/redis'
import { prisma } from '@/lib/prisma'
import type { CompanyProfile } from '@/lib/market-data/types'

const mockProfiles: Record<string, CompanyProfile> = {
  AAPL: {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    exchange: 'NASDAQ',
    marketCap: 3000000000000,
    peRatio: 29.5,
    eps: 6.43,
    dividendYield: 0.005,
    beta: 1.24,
    week52High: 199.62,
    week52Low: 143.9,
    employees: 161000,
    ceo: 'Tim Cook',
    headquarters: 'One Apple Park Way, Cupertino, CA',
    founded: '1976',
    website: 'https://www.apple.com',
  },
  MSFT: {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    sector: 'Technology',
    industry: 'Software',
    exchange: 'NASDAQ',
    marketCap: 2800000000000,
    peRatio: 35.2,
    eps: 11.45,
    dividendYield: 0.007,
    beta: 0.9,
    week52High: 420.82,
    week52Low: 309.45,
    employees: 221000,
    ceo: 'Satya Nadella',
    headquarters: 'One Microsoft Way, Redmond, WA',
    founded: '1975',
    website: 'https://www.microsoft.com',
  },
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticker: rawTicker } = await params
    const ticker = rawTicker.toUpperCase()

    const cacheKey = `profile:${ticker}`
    const cached = await cacheGet<CompanyProfile>(cacheKey)
    if (cached) {
      return Response.json(cached)
    }

    try {
      const provider = getMarketDataProvider()
      const profile = await provider.getProfile(ticker)

      await cacheSet(cacheKey, profile, 3600)

      await prisma.stockProfile.upsert({
        where: { ticker },
        update: {
          name: profile.name,
          description: profile.description,
          sector: profile.sector,
          industry: profile.industry,
          exchange: profile.exchange,
          marketCap: profile.marketCap,
          peRatio: profile.peRatio,
          eps: profile.eps,
          dividendYield: profile.dividendYield,
          beta: profile.beta,
          week52High: profile.week52High,
          week52Low: profile.week52Low,
          employees: profile.employees,
          ceo: profile.ceo,
          headquarters: profile.headquarters,
          founded: profile.founded,
          website: profile.website,
        },
        create: {
          ticker,
          name: profile.name,
          description: profile.description,
          sector: profile.sector,
          industry: profile.industry,
          exchange: profile.exchange,
          marketCap: profile.marketCap,
          peRatio: profile.peRatio,
          eps: profile.eps,
          dividendYield: profile.dividendYield,
          beta: profile.beta,
          week52High: profile.week52High,
          week52Low: profile.week52Low,
          employees: profile.employees,
          ceo: profile.ceo,
          headquarters: profile.headquarters,
          founded: profile.founded,
          website: profile.website,
        },
      })

      return Response.json(profile)
    } catch {
      const mock = mockProfiles[ticker]
      if (mock) {
        return Response.json(mock)
      }
      const fallback: CompanyProfile = {
        ticker,
        name: ticker,
        description: 'Profile data unavailable.',
        sector: null,
        industry: null,
        exchange: null,
        marketCap: null,
        peRatio: null,
        eps: null,
        dividendYield: null,
        beta: null,
        week52High: null,
        week52Low: null,
        employees: null,
        ceo: null,
        headquarters: null,
        founded: null,
        website: null,
      }
      return Response.json(fallback)
    }
  } catch (err) {
    console.error('[/api/stocks/[ticker]] error:', err)
    return Response.json({ error: 'Failed to fetch stock profile' }, { status: 500 })
  }
}
