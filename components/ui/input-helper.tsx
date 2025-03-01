"use client"

import { InfoCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface InputHelperProps {
  title: string
  description: string
  className?: string
}

export function InputHelper({ title, description, className = "" }: InputHelperProps) {
  return (
    <div className={`flex items-center gap-2 mb-2 ${className}`}>
      <h4 className="font-medium text-primary">{title}</h4>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
} 