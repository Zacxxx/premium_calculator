type EventName =
  | "simulation_started"
  | "simulation_completed"
  | "simulation_error"
  | "parameters_saved"
  | "parameters_loaded"
  | "results_exported"
  | "validation_error"

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

export interface AnalyticsEvent {
  name: EventName
  properties?: EventProperties
}

class Analytics {
  private static instance: Analytics
  private initialized = false

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  init() {
    if (this.initialized) return

    // Initialize analytics services here
    // Example: Google Analytics, Vercel Analytics, etc.

    this.initialized = true
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.initialized) {
      console.warn("Analytics not initialized")
      return
    }

    try {
      // Track the event using your analytics service
      console.log("Tracking event:", event)
    } catch (error) {
      console.error("Error tracking event:", error)
    }
  }

  trackError(error: Error, context?: Record<string, unknown>) {
    if (!this.initialized) {
      console.warn("Analytics not initialized")
      return
    }

    try {
      // Track the error using your analytics service
      console.error("Error:", error, "Context:", context)
    } catch (err) {
      console.error("Error tracking error:", err)
    }
  }
}

export const analytics = Analytics.getInstance()

