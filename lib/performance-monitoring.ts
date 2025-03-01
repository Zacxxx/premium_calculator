import { analytics } from "@/lib/analytics"
import { config } from "@/lib/config"
import type { PerformanceMetric } from "@/lib/types"

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, { startTime: number; metadata?: Record<string, unknown> }>
  private completedMetrics: PerformanceMetric[]

  private constructor() {
    this.metrics = new Map()
    this.completedMetrics = []
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  start(name: string, metadata?: Record<string, unknown>): void {
    if (!config.features.performanceMonitoring) return

    this.metrics.set(name, {
      startTime: performance.now(),
      metadata,
    })
  }

  end(name: string): number | undefined {
    if (!config.features.performanceMonitoring) return

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`No start time found for metric: ${name}`)
      return
    }

    const duration = performance.now() - metric.startTime
    this.metrics.delete(name)

    const completedMetric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata: metric.metadata,
    }

    this.completedMetrics.push(completedMetric)

    // Trim old metrics if needed
    if (this.completedMetrics.length > config.performance.maxEventsInMemory) {
      this.completedMetrics = this.completedMetrics.slice(-config.performance.maxEventsInMemory)
    }

    // Report slow operations
    if (duration > config.performance.warningThresholdMs) {
      console.warn(`Performance warning: ${name} took ${duration}ms`)
      analytics.trackEvent({
        name: "performance_warning",
        properties: {
          metricName: name,
          duration,
          ...metric.metadata,
        },
      })
    }

    if (duration > config.performance.errorThresholdMs) {
      console.error(`Performance error: ${name} took ${duration}ms`)
      analytics.trackEvent({
        name: "performance_error",
        properties: {
          metricName: name,
          duration,
          ...metric.metadata,
        },
      })
    }

    return duration
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics]
  }

  clearMetrics(): void {
    this.metrics.clear()
    this.completedMetrics = []
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

