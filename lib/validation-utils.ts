import type { InputValidation, ValidationResult, NumberFormatOptions } from "@/lib/types"
import { performanceMonitor } from "@/lib/performance-monitoring"
import { debug } from "@/lib/debug-utils"

/**
 * Validates a number input based on provided constraints
 * @param input Validation configuration
 * @returns Validation result
 */
export function validateNumberInput(input: InputValidation): ValidationResult {
  const metricName = "validateNumberInput"
  performanceMonitor.start(metricName, { input })

  try {
    const { value, min, max, required, integer, isPercentage, customValidator } = input

    // Required check
    if (required && (value === undefined || value === null)) {
      return { isValid: false, error: "Ce champ est requis" }
    }

    // Type check
    if (typeof value !== "number" || Number.isNaN(value)) {
      return { isValid: false, error: "Veuillez entrer un nombre valide" }
    }

    // Integer check
    if (integer && !Number.isInteger(value)) {
      return { isValid: false, error: "Veuillez entrer un nombre entier" }
    }

    // Range checks
    if (min !== undefined && value < min) {
      return { isValid: false, error: `La valeur minimale est ${min}` }
    }

    if (max !== undefined && value > max) {
      return { isValid: false, error: `La valeur maximale est ${max}` }
    }

    // Percentage check
    if (isPercentage && (value < 0 || value > 1)) {
      return { isValid: false, error: "Le pourcentage doit être compris entre 0 et 100%" }
    }

    // Custom validation
    if (customValidator) {
      const customError = customValidator(value)
      if (customError) {
        return { isValid: false, error: customError }
      }
    }

    return { isValid: true }
  } catch (error) {
    debug.error("Validation error:", error)
    return { isValid: false, error: "Une erreur est survenue lors de la validation" }
  } finally {
    performanceMonitor.end(metricName)
  }
}

/**
 * Formats a number according to locale and options
 * @param value Number to format
 * @param options Formatting options
 * @returns Formatted string
 */
export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
  const { allowNegative = true, enforceStep = false, step = 1, ...numberFormatOptions } = options

  try {
    // Handle negative numbers
    if (!allowNegative && value < 0) {
      value = 0
    }

    // Enforce step if required
    if (enforceStep && step) {
      value = Math.round(value / step) * step
    }

    return new Intl.NumberFormat("fr-FR", numberFormatOptions).format(value)
  } catch (error) {
    debug.error("Number formatting error:", error)
    return value.toString()
  }
}

/**
 * Parses a string into a number
 * @param value String to parse
 * @param options Parsing options
 * @returns Parsed number or null
 */
export function parseNumber(value: string, options: NumberFormatOptions = {}): number | null {
  const { allowNegative = true } = options

  try {
    // Remove all non-numeric characters except decimal point and minus sign
    const cleanValue = value.replace(/[^\d.-]/g, "")

    // Parse the cleaned value
    const parsed = Number.parseFloat(cleanValue)

    // Handle invalid numbers
    if (Number.isNaN(parsed)) {
      return null
    }

    // Handle negative numbers
    if (!allowNegative && parsed < 0) {
      return 0
    }

    return parsed
  } catch (error) {
    debug.error("Number parsing error:", error)
    return null
  }
}

/**
 * Sanitizes input string
 * @param value Input string
 * @returns Sanitized string
 */
export function sanitizeInput(value: string): string {
  return value.replace(/[<>{}]/g, "")
}

