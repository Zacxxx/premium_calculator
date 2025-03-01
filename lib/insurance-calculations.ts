import type { InsuranceParams, SimulationResults } from "./types"
import { validateParams } from "./validation"
import { CalculationError } from "./error-handling"
import { debug } from "./debug-utils"

/**
 * Ensures a number is finite and properly rounded to avoid floating point precision issues
 * @param value The number to check and round
 * @param decimals Number of decimal places to round to (default: 2)
 * @returns The rounded number or 0 if not finite
 */
function ensureFiniteNumber(value: number, decimals: number = 2): number {
  if (!isFinite(value) || isNaN(value)) {
    return 0;
  }
  // Round to specified number of decimals to avoid floating point precision issues
  return Number(value.toFixed(decimals));
}

export function calculateResults(params: InsuranceParams): SimulationResults {
  try {
    debug.group("Calculation", () => {
      debug.log("Input params:", params)
    })

    // Validate all parameters first
    validateParams(params)

    // Basic calculations
    const currentTotalPremium = ensureFiniteNumber(params.premiumPerSqm * params.totalSurface);
    if (currentTotalPremium === 0) {
      throw new CalculationError("Erreur de calcul de la prime totale actuelle")
    }

    const currentSPRatio = ensureFiniteNumber(params.insuranceCompanyCost / currentTotalPremium);
    if (!isFinite(currentSPRatio)) {
      throw new CalculationError("Erreur de calcul du ratio S/P actuel")
    }

    // Claims related calculations
    const averageCostPerClaimInsurance = ensureFiniteNumber(
      params.numberOfClaims > 0 ? params.insuranceCompanyCost / params.numberOfClaims : 0
    );
    
    const averageCostPerClaimCustomer = ensureFiniteNumber(
      params.numberOfClaims > 0 ? params.customerPaidCost / params.numberOfClaims : 0
    );
    
    const totalDeductiblePaid = ensureFiniteNumber(params.customerPaidCost);
    
    const averageDeductiblePerClaim = ensureFiniteNumber(
      params.numberOfClaims > 0 ? totalDeductiblePaid / params.numberOfClaims : 0
    );

    // Water damage calculations
    const safeNumberOfWaterDamageClaims = Math.min(params.numberOfWaterDamageClaims, params.numberOfClaims);
    const waterDamageDeductible = ensureFiniteNumber(safeNumberOfWaterDamageClaims * params.deductible);
    const nonWaterDamageDeductible = ensureFiniteNumber((params.numberOfClaims - safeNumberOfWaterDamageClaims) * params.deductible);

    // Premium adjustments
    if (!isFinite(params.insuranceCompanyCost) || isNaN(params.insuranceCompanyCost) || params.insuranceCompanyCost === 0) {
      debug.warn("Coût compagnie d'assurance invalide ou nul, utilisation d'une valeur par défaut", {
        insuranceCompanyCost: params.insuranceCompanyCost
      });
      params = {
        ...params,
        insuranceCompanyCost: currentTotalPremium * 0.4 // Valeur par défaut basée sur un ratio S/P de 40%
      };
    }
    
    if (!isFinite(params.inflation) || isNaN(params.inflation)) {
      debug.warn("Taux d'inflation invalide, utilisation de la valeur par défaut", {
        inflation: params.inflation
      });
      params = {
        ...params,
        inflation: 0.03 // Valeur par défaut de 3%
      };
    }
    
    const projectedClaimCost = ensureFiniteNumber(params.insuranceCompanyCost * (1 + params.inflation));
    
    if (projectedClaimCost === 0) {
      debug.warn("Coût projeté des sinistres est toujours nul après correction, utilisation d'une valeur par défaut");
      const defaultProjectedCost = currentTotalPremium * 0.4 * 1.03; // Basé sur un ratio S/P de 40% avec 3% d'inflation
      const results = {
        averageCostPerClaimInsurance,
        averageCostPerClaimCustomer,
        totalDeductiblePaid,
        averageDeductiblePerClaim,
        waterDamageDeductible,
        nonWaterDamageDeductible,
        currentTotalPremium,
        currentSPRatio: params.targetSPRatio, // Utiliser le ratio cible comme valeur actuelle
        projectedClaimCost: defaultProjectedCost,
        requiredNetPremium: defaultProjectedCost / params.targetSPRatio,
        adjustedTotalPremium: (defaultProjectedCost / params.targetSPRatio) * (1 + params.taxRate),
        newPremiumPerSqm: params.totalSurface > 0 ? 
          ((defaultProjectedCost / params.targetSPRatio) * (1 + params.taxRate)) / params.totalSurface : 
          params.premiumPerSqm
      }
      
      debug.group("Calculation Results (with default values)", () => {
        debug.log("Results:", results)
      })
      
      return results;
    }

    const requiredNetPremium = ensureFiniteNumber(projectedClaimCost / params.targetSPRatio);
    
    if (requiredNetPremium === 0) {
      debug.warn("Ratio S/P cible invalide, utilisation de la valeur par défaut", {
        targetSPRatio: params.targetSPRatio
      });
      params = {
        ...params,
        targetSPRatio: 0.4 // Valeur par défaut de 40%
      };
      const correctedRequiredNetPremium = ensureFiniteNumber(projectedClaimCost / params.targetSPRatio);
      if (correctedRequiredNetPremium > 0) {
        const results = calculateResults(params); // Recalculer avec les paramètres corrigés
        return results;
      } else {
        throw new CalculationError("Erreur de calcul de la prime nette requise malgré les corrections")
      }
    }

    const adjustedTotalPremium = ensureFiniteNumber(requiredNetPremium * (1 + params.taxRate));
    
    if (adjustedTotalPremium === 0) {
      debug.warn("Taux de taxe invalide, utilisation de la valeur par défaut", {
        taxRate: params.taxRate
      });
      params = {
        ...params,
        taxRate: 0.2 // Valeur par défaut de 20%
      };
      const correctedAdjustedTotalPremium = ensureFiniteNumber(requiredNetPremium * (1 + params.taxRate));
      if (correctedAdjustedTotalPremium > 0) {
        const results = calculateResults(params); // Recalculer avec les paramètres corrigés
        return results;
      } else {
        throw new CalculationError("Erreur de calcul de la prime totale ajustée malgré les corrections")
      }
    }

    const newPremiumPerSqm = ensureFiniteNumber(
      params.totalSurface > 0 ? adjustedTotalPremium / params.totalSurface : 0
    );
    
    if (newPremiumPerSqm === 0 && params.totalSurface > 0) {
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

