"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnhancedSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  formatValue?: (value: number) => string
  showTooltip?: boolean
  showTicks?: boolean
  tickCount?: number
  tickValues?: number[]
  label?: string
  error?: string
}

const EnhancedSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, EnhancedSliderProps>(
  (
    {
      className,
      formatValue = (v) => v.toString(),
      showTooltip = true,
      showTicks = false,
      tickCount = 5,
      tickValues,
      min = 0,
      max = 100,
      step = 1,
      label,
      error,
      ...props
    },
    ref,
  ) => {
    const [showTooltipValue, setShowTooltipValue] = React.useState(false)
    const [localValue, setLocalValue] = React.useState(props.value ?? props.defaultValue ?? [0])

    const calculateTickValues = () => {
      if (tickValues) return tickValues
      const ticks = []
      const interval = (max - min) / (tickCount - 1)
      for (let i = 0; i < tickCount; i++) {
        ticks.push(min + interval * i)
      }
      return ticks
    }

    const handleValueChange = (newValue: number[]) => {
      if (newValue[0] < min) newValue[0] = min
      if (newValue[0] > max) newValue[0] = max
      setLocalValue(newValue)
      if (props.onValueChange) {
        props.onValueChange(newValue)
      }
    }

    return (
      <div className="space-y-4">
        {label && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-sm text-muted-foreground">{formatValue(localValue[0])}</span>
          </div>
        )}
        <TooltipProvider>
          <Tooltip open={showTooltip && showTooltipValue}>
            <TooltipTrigger asChild>
              <SliderPrimitive.Root
                ref={ref}
                min={min}
                max={max}
                step={step}
                value={localValue}
                onValueChange={handleValueChange}
                onPointerDown={() => setShowTooltipValue(true)}
                onPointerUp={() => setShowTooltipValue(false)}
                className={cn("relative flex w-full touch-none select-none items-center", className)}
                aria-label={label || "Slider"}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={localValue[0]}
                {...props}
              >
                <SliderPrimitive.Track
                  className={cn(
                    "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
                    error && "bg-destructive/20",
                  )}
                >
                  <SliderPrimitive.Range className={cn("absolute h-full bg-primary", error && "bg-destructive")} />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                  className={cn(
                    "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    error && "border-destructive",
                  )}
                />
              </SliderPrimitive.Root>
            </TooltipTrigger>
            <TooltipContent>{formatValue(localValue[0])}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showTicks && (
          <div className="relative w-full h-6">
            {calculateTickValues().map((tick, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2"
                style={{
                  left: `${((tick - min) / (max - min)) * 100}%`,
                  top: 0,
                }}
              >
                <div className="h-2 w-0.5 bg-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground">{formatValue(tick)}</span>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  },
)
EnhancedSlider.displayName = SliderPrimitive.Root.displayName

export { EnhancedSlider }

