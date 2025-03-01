/**
 * Application configuration
 * @module config
 */

export const config = {
  app: {
    name: "Simulateur de Prime d'Assurance",
    version: "1.0.0",
    description: "Calculez et optimisez vos primes d'assurance",
    locale: "fr-FR",
  },
  validation: {
    debounceMs: 500,
    maxRetries: 3,
    timeoutMs: 5000,
  },
  performance: {
    warningThresholdMs: 1000,
    errorThresholdMs: 3000,
    maxEventsInMemory: 100,
  },
  features: {
    analytics: true,
    errorReporting: true,
    performanceMonitoring: true,
    debugMode: process.env.NODE_ENV === "development",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    retryAttempts: 3,
  },
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 100, // Maximum number of items
  },
} as const

export type Config = typeof config

