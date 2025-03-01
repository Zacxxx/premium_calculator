import { PERCENTAGE_PRECISION } from "./constants"

/**
 * Converts a percentage (0-100) to a decimal value (0-1)
 */
export function percentageToDecimal(percentage: number): number {
  return Number((percentage / 100).toFixed(PERCENTAGE_PRECISION))
}

/**
 * Converts a decimal value (0-1) to a percentage (0-100)
 */
export function decimalToPercentage(decimal: number): number {
  return Number((decimal * 100).toFixed(PERCENTAGE_PRECISION))
}

/**
 * Formats a decimal value as a percentage string
 */
export function formatPercentage(decimal: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(decimal)
}

/**
 * Validates if a decimal value is a valid percentage (between 0 and 1)
 */
export function isValidPercentage(decimal: number): boolean {
  return !isNaN(decimal) && decimal >= 0 && decimal <= 1
}

/**
 * Applies a percentage increase to a value
 */
export function applyPercentageIncrease(value: number, percentage: number): number {
  return value * (1 + percentage)
}

/**
 * Calculates what percentage one value is of another
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Number((value / total).toFixed(PERCENTAGE_PRECISION))
}

