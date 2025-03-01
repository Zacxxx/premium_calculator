"use client"

import * as React from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { analytics } from "@/lib/analytics"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class EnhancedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error("Error caught by boundary:", error, errorInfo)

    // Track the error in analytics
    analytics.trackError(error, {
      component: "EnhancedErrorBoundary",
      errorInfo: errorInfo,
    })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Une erreur est survenue</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-4">
            <p>{this.state.error?.message || "Une erreur inattendue s'est produite."}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={this.handleReset}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Recharger la page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

