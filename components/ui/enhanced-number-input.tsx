"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Info, ChevronUp, ChevronDown, X } from "lucide-react"
import { useMounted } from "@/lib/hooks/use-mounted"
import { formatNumber, parseNumber, sanitizeInput, validateNumberInput } from "@/lib/validation-utils"
import type { InputValidation, NumberFormatOptions } from "@/lib/types"
import { InputErrorHandler } from "@/components/input-error-handler"

interface EnhancedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string
  tooltip?: string
  error?: string
  min?: number
  max?: number
  step?: number
  precision?: number
  formatOptions?: NumberFormatOptions
  showControls?: boolean
  showClear?: boolean
  className?: string
  isPercentage?: boolean
  integer?: boolean
  onChange?: (value: number | null) => void
  onBlur?: () => void
  onError?: (error: string) => void
}

// Create a memoized tooltip component to prevent re-renders
const InfoTooltip = React.memo(({ content }: { content: string }) => (
  <div className="relative group flex items-center">
    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
    <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-50 bottom-full mb-2 right-0 transform">
      <div className="bg-popover text-popover-foreground border rounded-md shadow-md p-2 text-sm max-w-xs">
        {content}
      </div>
    </div>
  </div>
));
InfoTooltip.displayName = "InfoTooltip";

export function EnhancedNumberInput({
  label,
  tooltip,
  error,
  min,
  max,
  step = 1,
  precision = 2,
  formatOptions,
  showControls = false,
  showClear = false,
  className,
  value,
  isPercentage = false,
  integer = false,
  onChange,
  onBlur,
  onError,
  disabled,
  required,
  ...props
}: EnhancedNumberInputProps) {
  const mounted = useMounted()
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Memoize formatOptions to create a stable reference
  const stableFormatOptions = React.useMemo(() => formatOptions || {}, [
    formatOptions ? JSON.stringify(formatOptions) : null
  ]);
  
  const [localValue, setLocalValue] = React.useState<string>(() => {
    if (typeof value === "number") {
      return formatNumber(value, { ...stableFormatOptions, maximumFractionDigits: precision })
    }
    return ""
  })
  const [isFocused, setIsFocused] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [localError, setLocalError] = React.useState<string>()

  const validateInput = (value: number): string | undefined => {
    const validation: InputValidation = {
      value,
      min,
      max,
      required,
      integer,
      isPercentage,
    }

    const result = validateNumberInput(validation)
    return result.isValid ? undefined : result.error
  }

  const handleValidation = (value: number | null) => {
    if (value === null) {
      if (required) {
        const error = "Ce champ est requis"
        setLocalError(error)
        onError?.(error)
        return false
      }
      return true
    }

    const validationError = validateInput(value)
    setLocalError(validationError)
    if (validationError) {
      onError?.(validationError)
      return false
    }
    return true
  }

  const updateValue = (newValue: number | null) => {
    if (!handleValidation(newValue)) return

    if (newValue === null) {
      setLocalValue("")
      onChange?.(null)
      return
    }

    // Apply step constraint if needed
    if (step) {
      newValue = Math.round(newValue / step) * step
    }

    // Apply precision
    newValue = Number(newValue.toFixed(precision))

    // Apply range constraints
    if (min !== undefined) newValue = Math.max(newValue, min)
    if (max !== undefined) newValue = Math.min(newValue, max)

    // Format and update
    setLocalValue(formatNumber(newValue, { ...stableFormatOptions, maximumFractionDigits: precision }))
    onChange?.(newValue)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value)
    setLocalValue(sanitizedValue)
    
    // Éviter les mises à jour pendant la saisie
  }

  const handleBlur = () => {
    setIsFocused(false)
    
    try {
      // Utiliser notre fonction parseNumber personnalisée avec les options de formatage
      const parsed = parseNumber(localValue)
      
      // Seulement mettre à jour si la valeur est valide et différente de la valeur actuelle
      if (parsed !== null) {
        // Vérifier si la valeur a réellement changé pour éviter des mises à jour inutiles
        if (typeof value !== 'number' || Math.abs(parsed - value) > 0.000001) {
          updateValue(parsed)
        } else {
          // Si la valeur n'a pas changé, juste reformater l'affichage
          setLocalValue(formatNumber(value, { ...stableFormatOptions, maximumFractionDigits: precision }))
        }
      } else if (required && localValue.trim() === '') {
        // Si le champ est requis et vide, restaurer la valeur précédente
        if (typeof value === "number") {
          setLocalValue(formatNumber(value, { ...stableFormatOptions, maximumFractionDigits: precision }))
        }
      }
    } catch (error) {
      console.error("Error parsing number:", error)
      // En cas d'erreur, restaurer la valeur précédente
      if (typeof value === "number") {
        setLocalValue(formatNumber(value, { ...stableFormatOptions, maximumFractionDigits: precision }))
      }
    }
    
    onBlur?.()
  }

  const parseNumber = (value: string): number | null => {
    if (stableFormatOptions?.style === "percent") {
      // For percentage inputs, remove % and any thousand separators
      const cleanValue = value.replace(/[^\d.-]/g, "")
      const parsed = Number.parseFloat(cleanValue)
      return Number.isNaN(parsed) ? null : parsed / 100
    }

    // For non-percentage inputs, just remove thousand separators
    const cleanValue = value.replace(/[^\d.-]/g, "")
    const parsed = Number.parseFloat(cleanValue)
    return Number.isNaN(parsed) ? null : parsed
  }

  const handleFocus = () => {
    setIsFocused(true)
    setLocalError(undefined)
    const parsed = parseNumber(localValue)
    if (parsed !== null) {
      if (stableFormatOptions?.style === "percent") {
        setLocalValue((parsed * 100).toString())
      } else {
        setLocalValue(parsed.toString())
      }
    }
  }

  const increment = () => {
    const current = parseNumber(localValue) ?? 0
    updateValue(current + (step ?? 1))
    inputRef.current?.focus()
  }

  const decrement = () => {
    const current = parseNumber(localValue) ?? 0
    updateValue(current - (step ?? 1))
    inputRef.current?.focus()
  }

  const clear = () => {
    updateValue(null)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        increment()
        break
      case "ArrowDown":
        e.preventDefault()
        decrement()
        break
      case "Escape":
        e.preventDefault()
        // Restaurer la valeur d'origine et perdre le focus
        if (typeof value === "number") {
          setLocalValue(formatNumber(value, { ...stableFormatOptions, maximumFractionDigits: precision }))
        } else {
          setLocalValue("")
        }
        inputRef.current?.blur()
        break
      case "Enter":
        e.preventDefault()
        const parsed = parseNumber(localValue)
        if (parsed !== null) {
          updateValue(parsed)
        }
        inputRef.current?.blur()
        break
    }
  }

  React.useEffect(() => {
    // Skip effect if component is not mounted or if we're focused (user is editing)
    if (!mounted || isFocused) return;
    
    if (typeof value === "number") {
      setLocalValue(formatNumber(value, { ...stableFormatOptions, maximumFractionDigits: precision }))
    } else if (value === null) {
      setLocalValue("")
    }
  }, [value, isFocused, stableFormatOptions, precision, mounted]);

  if (!mounted) {
    return null
  }

  const showError = !!error || !!localError
  const showClearButton = showClear && localValue !== "" && !disabled
  const hasValue = localValue !== ""
  const displayedError = error || localError

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={props.id}
          className={cn("text-sm font-medium", required && "after:content-['*'] after:ml-0.5 after:text-destructive")}
        >
          {label}
        </Label>
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      <div
        className="relative flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
          className={cn(
            "pr-10",
            showError && "border-destructive",
            showControls && "pr-16",
            hasValue && "pr-8",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          aria-invalid={showError}
          aria-describedby={displayedError ? `${props.id}-error` : undefined}
          disabled={disabled}
          required={required}
        />
        {showClearButton && isHovered && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 h-6 w-6"
            onClick={clear}
            tabIndex={-1}
            aria-label="Effacer la valeur"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {showControls && (
          <div className="absolute right-0 top-0 h-full flex flex-col border-l">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-1/2 px-2 rounded-none rounded-tr"
              onClick={increment}
              disabled={disabled || (max !== undefined && parseNumber(localValue) === max)}
              tabIndex={-1}
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
              disabled={disabled || (min !== undefined && parseNumber(localValue) === min)}
              tabIndex={-1}
              aria-label="Diminuer la valeur"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {displayedError && (
        <InputErrorHandler error={displayedError} field={label} onRetry={() => setLocalError(undefined)} />
      )}
    </div>
  )
}

