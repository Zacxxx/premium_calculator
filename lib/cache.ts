import { config } from "@/lib/config"

interface CacheItem<T> {
  value: T
  timestamp: number
}

class Cache {
  private static instance: Cache
  private cache: Map<string, CacheItem<any>>

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  set<T>(key: string, value: T): void {
    if (this.cache.size >= config.cache.maxSize) {
      // Remove oldest item
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > config.cache.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const cache = Cache.getInstance()

