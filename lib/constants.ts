import type { InsuranceParams } from "./types"

export const DEFAULT_TAX_RATE = 0.2 // 20%
export const DEFAULT_TARGET_SP_RATIO = 0.4 // 40%
export const DEFAULT_INFLATION_RATE = 0.03 // 3%
export const DEFAULT_PREMIUM_PER_SQM = 0.6 // 0.60€ - Modifié de 0.90€ pour ajuster la prime par défaut
export const DEFAULT_TOTAL_SURFACE = 1000000 // 1,000,000 m²
export const DEFAULT_DEDUCTIBLE = 9000 // 9,000€

export const defaultParams: InsuranceParams = {
  premiumPerSqm: DEFAULT_PREMIUM_PER_SQM,
  totalSurface: DEFAULT_TOTAL_SURFACE,
  totalClaimAmount: 0,
  insuranceCompanyCost: 0,
  taxRate: DEFAULT_TAX_RATE,
  inflation: DEFAULT_INFLATION_RATE,
  deductible: DEFAULT_DEDUCTIBLE,
  targetSPRatio: DEFAULT_TARGET_SP_RATIO,
  numberOfClaims: 0,
  customerPaidCost: 0,
  numberOfWaterDamageClaims: 0,
}

export const PERCENTAGE_PRECISION = 4 // Number of decimal places for percentage calculations

