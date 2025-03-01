"use client"

import type { InsuranceParams } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EnhancedNumberInput } from "@/components/ui/enhanced-number-input"

interface InputParametersProps {
  params: InsuranceParams
  onChange: (newParams: Partial<InsuranceParams>) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export default function InputParameters({ params, onChange, errors = {}, disabled }: InputParametersProps) {
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
                  onChange={(value) => onChange({ premiumPerSqm: value ?? 0 })}
                  min={0}
                  step={0.1}
                  precision={2}
                  showControls
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
                  onChange={(value) => onChange({ totalSurface: value ?? 0 })}
                  min={0}
                  step={10}
                  precision={0}
                  showControls
                  showClear
                  error={errors.totalSurface}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="taxRate"
                  label="Taux de taxe (%)"
                  tooltip="Taux de taxe applicable sur la prime d'assurance"
                  value={params.taxRate * 100}
                  onChange={(value) => onChange({ taxRate: (value ?? 0) / 100 })}
                  min={0}
                  max={100}
                  step={0.1}
                  precision={1}
                  showControls
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
                  value={params.inflation * 100}
                  onChange={(value) => onChange({ inflation: (value ?? 0) / 100 })}
                  min={0}
                  max={100}
                  step={0.1}
                  precision={1}
                  showControls
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
                  value={params.targetSPRatio * 100}
                  onChange={(value) => onChange({ targetSPRatio: (value ?? 0) / 100 })}
                  min={0}
                  max={100}
                  step={0.1}
                  precision={1}
                  showControls
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
                  onChange={(value) => onChange({ deductible: value ?? 0 })}
                  min={0}
                  max={10000}
                  step={100}
                  precision={0}
                  showControls
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
                  onChange={(value) => onChange({ totalClaimAmount: value ?? 0 })}
                  min={0}
                  step={1000}
                  precision={0}
                  showControls
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
                  onChange={(value) => onChange({ insuranceCompanyCost: value ?? 0 })}
                  min={0}
                  step={1000}
                  precision={0}
                  showControls
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
                  onChange={(value) => onChange({ customerPaidCost: value ?? 0 })}
                  min={0}
                  step={1000}
                  precision={0}
                  showControls
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
                  onChange={(value) => onChange({ numberOfClaims: value ?? 0 })}
                  min={0}
                  step={1}
                  precision={0}
                  showControls
                  showClear
                  error={errors.numberOfClaims}
                  disabled={disabled}
                  required
                />

                <EnhancedNumberInput
                  id="numberOfWaterDamageClaims"
                  label="Dont sinistres DDE"
                  tooltip="Nombre de sinistres Dégâts Des Eaux"
                  value={params.numberOfWaterDamageClaims}
                  onChange={(value) => onChange({ numberOfWaterDamageClaims: value ?? 0 })}
                  min={0}
                  max={params.numberOfClaims}
                  step={1}
                  precision={0}
                  showControls
                  showClear
                  error={errors.numberOfWaterDamageClaims}
                  disabled={disabled}
                  required
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

