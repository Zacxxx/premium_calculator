"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Info, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMounted } from "@/lib/hooks/use-mounted"

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string
  tooltip?: string
  error?: string
  min?: number
  max?: number
  step?: number
  precision?: number
  formatOptions?: Intl.NumberFormatOptions
  showControls?: boolean
  className?: string
  onChange?: (value: number) => void
}

export function NumberInput({
  label,
  tooltip,
  error,
  min,
  max,
  step = 1,
  precision = 2,
  formatOptions,
  showControls = false,
  className,
  value,
  onChange,
  disabled,
  ...props
}: NumberInputProps) {
  const mounted = useMounted()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = React.useState(() => {
    return typeof value === "number" ? new Intl.NumberFormat("fr-FR", formatOptions).format(value) : ""
  })
  const [isFocused, setIsFocused] = React.useState(false)

  const numberFormatter = React.useRef<Intl.NumberFormat>(
    new Intl.NumberFormat("fr-FR", {
      ...formatOptions,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }),
  )

  React.useEffect(() => {
    numberFormatter.current = new Intl.NumberFormat("fr-FR", {
      ...formatOptions,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    })
  }, [formatOptions, precision])

  const parseNumber = (value: string): number => {
    const cleanValue = value.replace(/[^\d.-]/g, "")
    const parsed = Number.parseFloat(cleanValue)
    return isNaN(parsed) ? 0 : parsed
  }

  const formatNumber = (num: number): string => {
    return numberFormatter.current.format(num)
  }

  const updateValue = (newValue: number) => {
    const bounded = Math.min(Math.max(newValue, min ?? Number.NEGATIVE_INFINITY), max ?? Number.POSITIVE_INFINITY)
    const rounded = Number(bounded.toFixed(precision))
    setLocalValue(formatNumber(rounded))
    onChange?.(rounded)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)

    if (!isFocused) {
      const parsed = parseNumber(newValue)
      if (!isNaN(parsed)) {
        updateValue(parsed)
      }
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    const parsed = parseNumber(localValue)
    if (!isNaN(parsed)) {
      updateValue(parsed)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    const parsed = parseNumber(localValue)
    if (!isNaN(parsed)) {
      setLocalValue(parsed.toString())
    }
  }

  const increment = () => {
    const current = parseNumber(localValue)
    updateValue(current + step)
    inputRef.current?.focus()
  }

  const decrement = () => {
    const current = parseNumber(localValue)
    updateValue(current - step)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      increment()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      decrement()
    }
  }

  React.useEffect(() => {
    if (typeof value === "number" && !isFocused) {
      setLocalValue(formatNumber(value))
    }
  }, [value, isFocused, formatNumber])

  if (!mounted) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative flex items-center">
        <Input
          {...props}
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(error && "border-destructive", showControls && "pr-16")}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          disabled={disabled}
        />
        {showControls && (
          <div className="absolute right-0 top-0 h-full flex flex-col border-l">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-1/2 px-2 rounded-none rounded-tr"
              onClick={increment}
              disabled={disabled || (max !== undefined && parseNumber(localValue) >= max)}
              aria-label="Augmenter la valeur"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-1/2 px-2 rounded-none rounded-br border-t"
              onClick={decrement}
              disabled={disabled || (min !== undefined && parseNumber(localValue) <= min)}
              aria-label="Diminuer la valeur"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive" id={`${props.id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

