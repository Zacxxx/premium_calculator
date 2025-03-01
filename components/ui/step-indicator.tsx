"use client"
import { cn } from "@/lib/utils"
import { Check, CircleDot } from "lucide-react"

export interface Step {
  id: string
  title: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <li key={step.id} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary",
                    !isCompleted && !isCurrent && "border-muted",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <CircleDot className="w-4 h-4 text-primary" />
                  ) : (
                    <span className="w-4 h-4 text-muted-foreground">{index + 1}</span>
                  )}
                </div>
                <div className="flex flex-col items-center mt-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && <span className="text-xs text-muted-foreground mt-0.5">{step.description}</span>}
                </div>
              </div>
              {!isLast && (
                <div className={cn("w-full h-0.5 transition-colors", isCompleted ? "bg-primary" : "bg-muted")} />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

