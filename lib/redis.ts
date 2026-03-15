import { Redis } from '@upstash/redis'

const globalForRedis = globalThis as unknown as { redis: Redis | null }

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    console.warn('[Redis] UPSTASH_REDIS_REST_URL/TOKEN not set — caching disabled')
    return null
  }
  return new Redis({ url, token })
}

export const redis: Redis | null = globalForRedis.redis !== undefined
  ? globalForRedis.redis
  : (globalForRedis.redis = createRedisClient())

// Cache helpers — all swallow errors so the app degrades gracefully
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    const val = await redis.get<T>(key)
    return val ?? null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!redis) return
  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch {}
}

export async function cacheDel(key: string): Promise<void> {
  if (!redis) return
  try {
    await redis.del(key)
  } catch {}
}
