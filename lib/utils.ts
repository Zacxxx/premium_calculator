import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...options,
  }).format(value)
}

export function formatPercentage(value: number): string {
  return formatNumber(value, {
    style: "percent",
    maximumFractionDigits: 1,
  })
}

export function formatCurrency(value: number): string {
  return formatNumber(value, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  })
}

export function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateNumberInput(
  value: number,
  options: {
    min?: number
    max?: number
    integer?: boolean
    positive?: boolean
  } = {},
): ValidationResult {
  const { min, max, integer, positive } = options

  if (Number.isNaN(value)) {
    return { isValid: false, error: "La valeur doit être un nombre" }
  }

  if (positive && value < 0) {
    return { isValid: false, error: "La valeur doit être positive" }
  }

  if (integer && !Number.isInteger(value)) {
    return { isValid: false, error: "La valeur doit être un nombre entier" }
  }

  if (min !== undefined && value < min) {
    return { isValid: false, error: `La valeur minimale est ${formatNumber(min)}` }
  }

  if (max !== undefined && value > max) {
    return { isValid: false, error: `La valeur maximale est ${formatNumber(max)}` }
  }

  return { isValid: true }
}

