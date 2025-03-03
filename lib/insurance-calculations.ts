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
  /**
   * Calcul des résultats de simulation d'assurance
   * 
   * Cette fonction calcule la prime d'assurance ajustée en tenant compte de plusieurs facteurs :
   * 
   * 1. Impact de la franchise :
   *    - La franchise est le montant que l'assuré prend à sa charge avant l'intervention de l'assurance
   *    - Plus la franchise est élevée, moins l'assurance aura à payer en cas de sinistre
   *    - L'impact de la franchise est calculé avec un facteur de pondération (30%) pour refléter
   *      le fait que tous les sinistres ne sont pas concernés de la même façon par la franchise
   *    - L'économie réalisée grâce à la franchise est plafonnée à 30% du coût total pour l'assurance
   * 
   * 2. Projection des coûts futurs :
   *    - Le coût ajusté (après prise en compte de la franchise) est projeté avec l'inflation
   * 
   * 3. Calcul de la prime requise :
   *    - La prime nette est calculée pour atteindre le ratio S/P cible
   *    - La prime totale inclut les taxes
   *    - La prime au m² est calculée en divisant par la surface totale
   */
  try {
    debug.group("Calculation", () => {
      debug.log("Input params:", params)
    })

    // Vérifier et corriger les incohérences dans les données d'entrée
    let correctedParams = { ...params };
    
    // S'assurer que la somme des coûts est cohérente avec le montant total des sinistres
    const totalCosts = params.customerPaidCost + params.insuranceCompanyCost;
    if (Math.abs(totalCosts - params.totalClaimAmount) > 0.1) {
      debug.warn("Incohérence détectée entre les coûts et le montant total des sinistres", {
        customerPaidCost: params.customerPaidCost,
        insuranceCompanyCost: params.insuranceCompanyCost,
        totalCosts,
        totalClaimAmount: params.totalClaimAmount
      });
      
      // Si le montant total est défini mais pas cohérent, ajuster les coûts
      if (params.totalClaimAmount > 0) {
        // Maintenir les proportions relatives si possible
        if (totalCosts > 0) {
          const ratio = params.totalClaimAmount / totalCosts;
          correctedParams.customerPaidCost = ensureFiniteNumber(params.customerPaidCost * ratio);
          correctedParams.insuranceCompanyCost = ensureFiniteNumber(params.totalClaimAmount - correctedParams.customerPaidCost);
        } else {
          // Répartition par défaut
          correctedParams.customerPaidCost = ensureFiniteNumber(params.totalClaimAmount * 0.2);
          correctedParams.insuranceCompanyCost = ensureFiniteNumber(params.totalClaimAmount * 0.8);
        }
      } else if (totalCosts > 0) {
        // Si le montant total n'est pas défini mais les coûts le sont, ajuster le montant total
        correctedParams.totalClaimAmount = totalCosts;
      }
      
      debug.log("Paramètres corrigés:", correctedParams);
    }
    
    // Continuer avec les paramètres corrigés
    params = correctedParams;

    // Validate all parameters first
    try {
      const validationErrors = validateParams(params);
      if (Object.keys(validationErrors).length > 0) {
        debug.warn("Validation errors, proceeding with calculations anyway:", validationErrors);
      }
    } catch (error) {
      debug.warn("Validation error, proceeding with calculations anyway:", error);
      // Continuer malgré les erreurs de validation
    }

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

    /**
     * Calcul de l'impact de la franchise sur le coût d'assurance
     * 
     * Principe : La franchise est le montant que l'assuré prend à sa charge avant que l'assurance n'intervienne.
     * Plus la franchise est élevée, moins l'assurance aura à payer en cas de sinistre.
     * 
     * Méthode de calcul :
     * 1. On estime l'économie potentielle pour l'assureur grâce à la franchise
     * 2. Cette économie est limitée à un pourcentage du coût total pour rester réaliste
     * 3. On ajuste le coût supporté par l'assurance en conséquence
     */
    
    // Calcul de l'économie potentielle due à la franchise
    // On utilise un facteur d'impact pour modérer l'effet de la franchise (plus réaliste)
    const franchiseImpactFactor = 0.3; // La franchise n'a pas un impact à 100% sur tous les sinistres
    
    // L'économie potentielle est la franchise multipliée par le nombre de sinistres, 
    // pondérée par le facteur d'impact
    const potentialSavings = params.deductible * params.numberOfClaims * franchiseImpactFactor;
    
    // On limite l'économie à un maximum de 30% du coût total supporté par l'assurance
    // pour éviter des réductions irréalistes
    const maxSavings = params.insuranceCompanyCost * 0.3;
    const actualDeductibleImpact = Math.min(potentialSavings, maxSavings);
    
    // Calcul du coût ajusté pour l'assurance après prise en compte de la franchise
    const adjustedInsuranceCompanyCost = Math.max(0, params.insuranceCompanyCost - actualDeductibleImpact);
    
    debug.log("Impact de la franchise sur le coût assurance:", {
      originalInsuranceCost: params.insuranceCompanyCost,
      deductible: params.deductible,
      franchiseImpactFactor,
      potentialSavings,
      maxSavings,
      actualDeductibleImpact,
      adjustedInsuranceCompanyCost
    });

    // Premium adjustments
    if (!isFinite(adjustedInsuranceCompanyCost) || isNaN(adjustedInsuranceCompanyCost) || adjustedInsuranceCompanyCost === 0) {
      debug.warn("Coût compagnie d'assurance invalide ou nul, utilisation d'une valeur par défaut", {
        insuranceCompanyCost: adjustedInsuranceCompanyCost
      });
      
      // Calculer une valeur par défaut qui tient compte de la franchise
      const defaultInsuranceCost = currentTotalPremium * 0.4; // Valeur par défaut basée sur un ratio S/P de 40%
      
      // Appliquer la même logique de calcul de l'impact de la franchise
      const potentialSavings = params.deductible * params.numberOfClaims * franchiseImpactFactor;
      const maxSavings = defaultInsuranceCost * 0.3;
      const actualDeductibleImpact = Math.min(potentialSavings, maxSavings);
      const defaultAdjustedCost = Math.max(0, defaultInsuranceCost - actualDeductibleImpact);
      
      params = {
        ...params,
        insuranceCompanyCost: defaultAdjustedCost > 0 ? defaultAdjustedCost : defaultInsuranceCost
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
    
    // Calcul du coût projeté des sinistres en tenant compte de l'inflation
    const projectedClaimCost = ensureFiniteNumber(adjustedInsuranceCompanyCost * (1 + params.inflation));
    
    debug.log("Coût projeté des sinistres:", {
      adjustedInsuranceCompanyCost,
      inflation: params.inflation,
      projectedClaimCost
    });
    
    if (projectedClaimCost === 0) {
      debug.warn("Coût projeté des sinistres est nul, utilisation d'une valeur par défaut");
      
      // Calculer une valeur par défaut qui tient compte de la franchise
      const defaultInsuranceCost = currentTotalPremium * 0.4; // Valeur par défaut basée sur un ratio S/P de 40%
      
      // Appliquer la même logique de calcul de l'impact de la franchise
      const potentialSavings = params.deductible * params.numberOfClaims * franchiseImpactFactor;
      const maxSavings = defaultInsuranceCost * 0.3;
      const actualDeductibleImpact = Math.min(potentialSavings, maxSavings);
      const defaultAdjustedCost = Math.max(0, defaultInsuranceCost - actualDeductibleImpact);
      
      // Appliquer l'inflation
      const defaultProjectedCost = defaultAdjustedCost * (1 + (params.inflation || 0.03));
      
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

