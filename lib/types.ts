/**
 * Core types for the insurance simulation application
 * @module types
 */

/**
 * Parameters for insurance calculations
 */
export interface InsuranceParams {
  /** Premium per square meter in euros */
  premiumPerSqm: number
  /** Total surface area in square meters */
  totalSurface: number
  /** Total amount of claims in euros */
  totalClaimAmount: number
  /** Cost covered by insurance company in euros */
  insuranceCompanyCost: number
  /** Tax rate as a decimal (e.g., 0.20 for 20%) */
  taxRate: number
  /** Inflation rate as a decimal */
  inflation: number
  /** Deductible amount per claim in euros */
  deductible: number
  /** Target S/P ratio as a decimal */
  targetSPRatio: number
  /** Total number of claims */
  numberOfClaims: number
  /** Cost paid by customer in euros */
  customerPaidCost: number
  /** Number of water damage claims */
  numberOfWaterDamageClaims: number
}

/**
 * Results of insurance calculations
 */
export interface SimulationResults {
  /** Average cost per claim for insurance company */
  averageCostPerClaimInsurance: number
  /** Average cost per claim for customer */
  averageCostPerClaimCustomer: number
  /** Total deductible paid */
  totalDeductiblePaid: number
  /** Average deductible per claim */
  averageDeductiblePerClaim: number
  /** Total deductible for water damage claims */
  waterDamageDeductible: number
  /** Total deductible for non-water damage claims */
  nonWaterDamageDeductible: number
  /** Current total premium */
  currentTotalPremium: number
  /** Current S/P ratio */
  currentSPRatio: number
  /** Projected claim cost with inflation */
  projectedClaimCost: number
  /** Required net premium */
  requiredNetPremium: number
  /** Adjusted total premium */
  adjustedTotalPremium: number
  /** New premium per square meter */
  newPremiumPerSqm: number
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Function type for validation
 */
export type ValidationFunction = (value: number) => ValidationResult

/**
 * Input validation configuration
 */
export interface InputValidation {
  value: number
  min?: number
  max?: number
  required?: boolean
  integer?: boolean
  isPercentage?: boolean
  customValidator?: (value: number) => string | undefined
}

/**
 * Validation errors type
 */
export type ValidationErrors = Partial<Record<keyof InsuranceParams, string>>

/**
 * Number format options extending Intl.NumberFormatOptions
 */
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  allowNegative?: boolean
  enforceStep?: boolean
  step?: number
}

/**
 * Analytics event type
 */
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
}

/**
 * Performance metric type
 */
export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, unknown>
}

