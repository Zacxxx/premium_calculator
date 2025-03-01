"use client"

import type { InsuranceParams } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EnhancedNumberInput } from "@/components/ui/enhanced-number-input"
import React from "react"

interface InputParametersProps {
  params: InsuranceParams
  onChange: (newParams: Partial<InsuranceParams>) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export default function InputParameters({ params, onChange, errors = {}, disabled }: InputParametersProps) {
  const handleChange = React.useCallback(
    (key: keyof InsuranceParams, value: number | null) => {
      if (value !== null) {
        // Validation supplémentaire pour éviter les valeurs problématiques
        if (key === 'insuranceCompanyCost' && value === 0) {
          // Ne pas permettre un coût compagnie à zéro si des sinistres sont déclarés
          if (params.numberOfClaims > 0 && params.totalClaimAmount > 0) {
            // Utiliser une valeur par défaut basée sur le montant total des sinistres
            value = params.totalClaimAmount * 0.8; // 80% du montant total par défaut
          }
        }
        
        // Validation pour le ratio S/P cible
        if (key === 'targetSPRatio' && (value <= 0 || value >= 1)) {
          // Limiter à une plage raisonnable entre 0.1 et 0.9
          value = Math.max(0.1, Math.min(0.9, value));
        }
        
        // Validation pour l'inflation
        if (key === 'inflation' && (value < 0 || value > 0.5)) {
          // Limiter à une plage raisonnable entre 0 et 50%
          value = Math.max(0, Math.min(0.5, value));
        }
        
        onChange({ [key]: value })
      }
    },
    [onChange, params]
  )

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible defaultValue="general">
        <AccordionItem value="general">
          <AccordionTrigger>
            <h3 className="text-lg font-medium">Paramètres Généraux</h3>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedNumberInput
                  id="premiumPerSqm"
                  label="Prime actuelle (€/m²)"
                  tooltip="Prime d'assurance actuelle par mètre carré"
                  value={params.premiumPerSqm}
                  onChange={(value) => handleChange('premiumPerSqm', value)}
                  min={0}
                  step={0.1}
                  precision={2}
                  showClear
                  formatOptions={{ style: "currency", currency: "EUR" }}
                  error={errors.premiumPerSqm}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="totalSurface"
                  label="Surface totale (m²)"
                  tooltip="Surface totale assurée en mètres carrés"
                  value={params.totalSurface}
                  onChange={(value) => handleChange('totalSurface', value)}
                  min={0}
                  step={10}
                  precision={0}
                  showClear
                  error={errors.totalSurface}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="taxRate"
                  label="Taux de taxe (%)"
                  tooltip="Taux de taxe applicable sur la prime d'assurance"
                  value={params.taxRate}
                  onChange={(value) => handleChange('taxRate', value)}
                  min={0}
                  max={1}
                  step={0.001}
                  precision={1}
                  showClear
                  formatOptions={{ style: "percent", maximumFractionDigits: 1 }}
                  error={errors.taxRate}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="inflation"
                  label="Inflation (%)"
                  tooltip="Taux d'inflation annuel prévu"
                  value={params.inflation}
                  onChange={(value) => handleChange('inflation', value)}
                  min={0}
                  max={1}
                  step={0.001}
                  precision={1}
                  showClear
                  formatOptions={{ style: "percent", maximumFractionDigits: 1 }}
                  error={errors.inflation}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="targetSPRatio"
                  label="S/P cible (%)"
                  tooltip="Ratio Sinistres/Primes cible"
                  value={params.targetSPRatio}
                  onChange={(value) => handleChange('targetSPRatio', value)}
                  min={0}
                  max={1}
                  step={0.001}
                  precision={1}
                  showClear
                  formatOptions={{ style: "percent", maximumFractionDigits: 1 }}
                  error={errors.targetSPRatio}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="deductible"
                  label="Franchise (€)"
                  tooltip="Montant de la franchise par sinistre"
                  value={params.deductible}
                  onChange={(value) => handleChange('deductible', value)}
                  min={0}
                  max={10000}
                  step={100}
                  precision={0}
                  showClear
                  formatOptions={{ style: "currency", currency: "EUR" }}
                  error={errors.deductible}
                  disabled={disabled}
                  required
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="claims">
          <AccordionTrigger>
            <h3 className="text-lg font-medium">Données des Sinistres</h3>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedNumberInput
                  id="totalClaimAmount"
                  label="Montant total des sinistres (€)"
                  tooltip="Somme totale des sinistres sur la période"
                  value={params.totalClaimAmount}
                  onChange={(value) => handleChange('totalClaimAmount', value)}
                  min={0}
                  step={1000}
                  precision={0}
                  showClear
                  formatOptions={{ style: "currency", currency: "EUR" }}
                  error={errors.totalClaimAmount}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="insuranceCompanyCost"
                  label="Coût Cie (€)"
                  tooltip="Part des sinistres prise en charge par l'assurance"
                  value={params.insuranceCompanyCost}
                  onChange={(value) => handleChange('insuranceCompanyCost', value)}
                  min={0}
                  step={1000}
                  precision={0}
                  showClear
                  formatOptions={{ style: "currency", currency: "EUR" }}
                  error={errors.insuranceCompanyCost}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="customerPaidCost"
                  label="Coût payé par le client (€)"
                  tooltip="Part des sinistres payée par le client"
                  value={params.customerPaidCost}
                  onChange={(value) => handleChange('customerPaidCost', value)}
                  min={0}
                  step={1000}
                  precision={0}
                  showClear
                  formatOptions={{ style: "currency", currency: "EUR" }}
                  error={errors.customerPaidCost}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="numberOfClaims"
                  label="Nombre de sinistres"
                  tooltip="Nombre total de sinistres déclarés"
                  value={params.numberOfClaims}
                  onChange={(value) => handleChange('numberOfClaims', value)}
                  min={0}
                  step={1}
                  precision={0}
                  showClear
                  error={errors.numberOfClaims}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  label="Nombre de sinistres DDE"
                  tooltip="Nombre de sinistres Dégâts Des Eaux"
                  value={params.numberOfWaterDamageClaims}
                  onChange={(value) => handleChange('numberOfWaterDamageClaims', value)}
                  min={0}
                  max={params.numberOfClaims}
                  step={1}
                  integer
                  error={errors.numberOfWaterDamageClaims}
                  disabled={disabled}
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

