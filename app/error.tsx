"use client"

import { useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-2xl">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Une erreur est survenue</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-4">
          <div className="space-y-2">
            <p className="font-medium">{error.message || "Une erreur inattendue s'est produite."}</p>
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-secondary/50 p-4 text-xs">{error.stack}</pre>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Recharger la page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

