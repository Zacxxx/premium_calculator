"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { InsuranceParams, SimulationResults } from "@/lib/types"
import { formatNumber, formatPercentage } from "@/lib/utils"

interface ResultsTableProps {
  results: SimulationResults
  params: InsuranceParams
}

export default function ResultsTable({ results, params }: ResultsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails des calculs</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Indicateur</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Formule / Explication</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Prime totale actuelle</TableCell>
              <TableCell>{formatNumber(results.currentTotalPremium)} €</TableCell>
              <TableCell className="text-muted-foreground">Premium actuel × Surface totale</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ratio S/P actuel</TableCell>
              <TableCell>{formatPercentage(results.currentSPRatio)}</TableCell>
              <TableCell className="text-muted-foreground">Coût Cie ÷ Prime totale actuelle</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Coût moyen par sinistre (Cie)</TableCell>
              <TableCell>{formatNumber(results.averageCostPerClaimInsurance)} €</TableCell>
              <TableCell className="text-muted-foreground">Coût Cie ÷ Nombre de sinistres</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Coût moyen par sinistre (Client)</TableCell>
              <TableCell>{formatNumber(results.averageCostPerClaimCustomer)} €</TableCell>
              <TableCell className="text-muted-foreground">Coût payé par le client ÷ Nombre de sinistres</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Franchise moyenne par sinistre</TableCell>
              <TableCell>{formatNumber(results.averageDeductiblePerClaim)} €</TableCell>
              <TableCell className="text-muted-foreground">Franchise totale réglée ÷ Nombre de sinistres</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Franchise DDE</TableCell>
              <TableCell>{formatNumber(results.waterDamageDeductible)} €</TableCell>
              <TableCell className="text-muted-foreground">Nombre de sinistres DDE × Franchise unitaire</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Franchise hors DDE</TableCell>
              <TableCell>{formatNumber(results.nonWaterDamageDeductible)} €</TableCell>
              <TableCell className="text-muted-foreground">
                (Nombre total de sinistres - Nombre de sinistres DDE) × Franchise unitaire
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Coût des sinistres projeté avec inflation</TableCell>
              <TableCell>{formatNumber(results.projectedClaimCost)} €</TableCell>
              <TableCell className="text-muted-foreground">Coût Cie × (1 + Inflation)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Prime nette nécessaire (hors taxes)</TableCell>
              <TableCell>{formatNumber(results.requiredNetPremium)} €</TableCell>
              <TableCell className="text-muted-foreground">Coût des sinistres projeté ÷ S/P cible</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Prime totale ajustée TTC</TableCell>
              <TableCell>{formatNumber(results.adjustedTotalPremium)} €</TableCell>
              <TableCell className="text-muted-foreground">Prime nette nécessaire × (1 + Taux de taxe)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Nouveau premium au m²</TableCell>
              <TableCell>{formatNumber(results.newPremiumPerSqm)} €</TableCell>
              <TableCell className="text-muted-foreground">Prime totale ajustée TTC ÷ Surface totale</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

