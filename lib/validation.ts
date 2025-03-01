import { z } from "zod"
import type { InsuranceParams } from "./types"
import { isValidPercentage } from "./percentage-utils"

export const insuranceParamsSchema = z.object({
  premiumPerSqm: z
    .number()
    .positive("La prime au m² doit être positive")
    .max(1000, "La prime au m² ne peut pas dépasser 1000€"),

  totalSurface: z
    .number()
    .positive("La surface totale doit être positive")
    .max(1000000, "La surface totale ne peut pas dépasser 1 000 000 m²"),

  totalClaimAmount: z.number().nonnegative("Le montant total des sinistres ne peut pas être négatif"),

  insuranceCompanyCost: z.number().nonnegative("Le coût Cie ne peut pas être négatif"),

  taxRate: z.number().refine(isValidPercentage, "Le taux de taxe doit être compris entre 0 et 100%"),

  inflation: z.number().refine(isValidPercentage, "L'inflation doit être comprise entre 0 et 100%"),

  deductible: z
    .number()
    .nonnegative("La franchise ne peut pas être négative")
    .max(10000, "La franchise ne peut pas dépasser 10 000€"),

  targetSPRatio: z.number().refine(isValidPercentage, "Le ratio S/P cible doit être compris entre 0 et 100%"),

  numberOfClaims: z
    .number()
    .int("Le nombre de sinistres doit être un nombre entier")
    .nonnegative("Le nombre de sinistres ne peut pas être négatif"),

  customerPaidCost: z.number().nonnegative("Le coût payé par le client ne peut pas être négatif"),

  numberOfWaterDamageClaims: z
    .number()
    .int("Le nombre de sinistres DDE doit être un nombre entier")
    .nonnegative("Le nombre de sinistres DDE ne peut pas être négatif"),
})

export type ValidationErrors = Partial<Record<keyof InsuranceParams, string>>

export function validateInsuranceParams(params: InsuranceParams): ValidationErrors {
  try {
    insuranceParamsSchema.parse(params)
    return {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.reduce((acc, err) => {
        const path = err.path[0] as keyof InsuranceParams
        acc[path] = err.message
        return acc
      }, {} as ValidationErrors)
    }
    return {}
  }
}

export function validateBusinessRules(params: InsuranceParams): ValidationErrors {
  const errors: ValidationErrors = {}

  // Validate that water damage claims don't exceed total claims
  if (params.numberOfWaterDamageClaims > params.numberOfClaims) {
    errors.numberOfWaterDamageClaims = "Le nombre de sinistres DDE ne peut pas dépasser le nombre total de sinistres"
  }

  // Validate that customer paid cost doesn't exceed total claim amount
  if (params.customerPaidCost > params.totalClaimAmount) {
    errors.customerPaidCost = "Le coût payé par le client ne peut pas dépasser le montant total des sinistres"
  }

  // Validate that insurance company cost doesn't exceed total claim amount
  if (params.insuranceCompanyCost > params.totalClaimAmount) {
    errors.insuranceCompanyCost = "Le coût Cie ne peut pas dépasser le montant total des sinistres"
  }

  // Validate that the sum of costs equals total claim amount
  // Utiliser une tolérance plus grande pour éviter des erreurs d'arrondi
  // et ne valider que si les deux coûts ont été saisis (non nuls)
  const totalCosts = params.customerPaidCost + params.insuranceCompanyCost
  if (params.customerPaidCost > 0 && params.insuranceCompanyCost > 0 && 
      params.totalClaimAmount > 0 && Math.abs(totalCosts - params.totalClaimAmount) > 0.1) {
    // Suggérer une correction automatique plutôt qu'une erreur bloquante
    if (totalCosts > 0) {
      errors.totalClaimAmount = 
        `La somme des coûts (${totalCosts.toFixed(2)}€) diffère du montant total des sinistres (${params.totalClaimAmount.toFixed(2)}€)`
    }
  }

  return errors
}

export function validateParams(params: InsuranceParams): void {
  const schemaErrors = validateInsuranceParams(params)
  const businessErrors = validateBusinessRules(params)
  const allErrors = { ...schemaErrors, ...businessErrors }

  if (Object.keys(allErrors).length > 0) {
    throw new Error(JSON.stringify(allErrors))
  }
}

