"use client"

import { HelpCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SectionHelpProps {
  title: string
  description: string
  className?: string
}

export function SectionHelp({ title, description, className = "" }: SectionHelpProps) {
  return (
    <Alert className={`bg-muted/50 ${className}`}>
      <HelpCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  )
} 