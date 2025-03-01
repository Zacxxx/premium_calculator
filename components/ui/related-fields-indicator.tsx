"use client"

import { ArrowRightLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RelatedFieldsIndicatorProps {
  description: string
  className?: string
}

export function RelatedFieldsIndicator({ description, className = "" }: RelatedFieldsIndicatorProps) {
  return (
    <div className={`flex justify-center items-center py-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-muted-foreground cursor-help">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Champs liés</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
} 