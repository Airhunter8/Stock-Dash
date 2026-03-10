import { Redis } from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
  })
  client.on('error', (err) => {
    // Don't crash on Redis connection failure — degrade gracefully
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Redis] Connection error (caching disabled):', err.message)
    }
  })
  return client
}

export const redis = globalForRedis.redis || createRedisClient()
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key)
    return val ? (JSON.parse(val) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // Swallow Redis errors
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch {
    // Swallow
  }
}
