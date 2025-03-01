import type { InsuranceParams, SimulationResults } from "./types"
import { validateParams } from "./validation"
import { CalculationError } from "./error-handling"
import { debug } from "./debug-utils"

export function calculateResults(params: InsuranceParams): SimulationResults {
  try {
    debug.group("Calculation", () => {
      debug.log("Input params:", params)
    })

    // Validate all parameters first
    validateParams(params)

    // Basic calculations
    const currentTotalPremium = params.premiumPerSqm * params.totalSurface
    if (!isFinite(currentTotalPremium)) {
      throw new CalculationError("Erreur de calcul de la prime totale actuelle")
    }

    const currentSPRatio = currentTotalPremium > 0 ? params.insuranceCompanyCost / currentTotalPremium : 0
    if (!isFinite(currentSPRatio)) {
      throw new CalculationError("Erreur de calcul du ratio S/P actuel")
    }

    // Claims related calculations
    const averageCostPerClaimInsurance =
      params.numberOfClaims > 0 ? params.insuranceCompanyCost / params.numberOfClaims : 0
    const averageCostPerClaimCustomer = params.numberOfClaims > 0 ? params.customerPaidCost / params.numberOfClaims : 0
    const totalDeductiblePaid = params.customerPaidCost
    const averageDeductiblePerClaim = params.numberOfClaims > 0 ? totalDeductiblePaid / params.numberOfClaims : 0

    // Water damage calculations
    const safeNumberOfWaterDamageClaims = Math.min(params.numberOfWaterDamageClaims, params.numberOfClaims)
    const waterDamageDeductible = safeNumberOfWaterDamageClaims * params.deductible
    const nonWaterDamageDeductible = (params.numberOfClaims - safeNumberOfWaterDamageClaims) * params.deductible

    // Premium adjustments
    const projectedClaimCost = params.insuranceCompanyCost * (1 + params.inflation)
    if (!isFinite(projectedClaimCost)) {
      throw new CalculationError("Erreur de calcul du coût projeté des sinistres")
    }

    const requiredNetPremium = projectedClaimCost / params.targetSPRatio
    if (!isFinite(requiredNetPremium)) {
      throw new CalculationError("Erreur de calcul de la prime nette requise")
    }

    const adjustedTotalPremium = requiredNetPremium * (1 + params.taxRate)
    if (!isFinite(adjustedTotalPremium)) {
      throw new CalculationError("Erreur de calcul de la prime totale ajustée")
    }

    const newPremiumPerSqm = params.totalSurface > 0 ? adjustedTotalPremium / params.totalSurface : 0
    if (!isFinite(newPremiumPerSqm)) {
      throw new CalculationError("Erreur de calcul de la nouvelle prime au m²")
    }

    const results = {
      averageCostPerClaimInsurance,
      averageCostPerClaimCustomer,
      totalDeductiblePaid,
      averageDeductiblePerClaim,
      waterDamageDeductible,
      nonWaterDamageDeductible,
      currentTotalPremium,
      currentSPRatio,
      projectedClaimCost,
      requiredNetPremium,
      adjustedTotalPremium,
      newPremiumPerSqm,
    }

    debug.group("Calculation Results", () => {
      debug.log("Results:", results)
    })

    return results
  } catch (error) {
    debug.error("Calculation error:", error)
    throw error instanceof CalculationError
      ? error
      : new CalculationError("Erreur lors des calculs", { originalError: error })
  }
}

