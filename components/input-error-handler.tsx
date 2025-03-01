"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle } from "lucide-react"

interface InputErrorHandlerProps {
  error?: string
  field: string
  onRetry?: () => void
}

export function InputErrorHandler({ error, field, onRetry }: InputErrorHandlerProps) {
  if (!error) return null

  return (
    <Alert variant="destructive" className="mt-2">
      <XCircle className="h-4 w-4" />
      <AlertDescription className="ml-2">
        Erreur dans le champ {field}: {error}
      </AlertDescription>
    </Alert>
  )
}

