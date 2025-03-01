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
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log the error
    console.error("Error caught by boundary:", error, errorInfo)

    // Track the error in analytics
    analytics.trackError(error, {
      component: "ErrorBoundary",
      errorInfo: errorInfo,
    })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.error) {
      const ErrorFallback = () => (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Une erreur est survenue</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-4">
            <div className="space-y-2">
              <p className="font-medium">{this.state.error?.message || "Une erreur inattendue s'est produite."}</p>
              {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-secondary/50 p-4 text-xs">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  this.setState({ error: null, errorInfo: null })
                  this.props.onReset?.()
                }}
              >
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

      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback />
    }

    return this.props.children
  }
}

