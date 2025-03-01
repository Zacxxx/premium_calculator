"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { InsuranceParams, SimulationResults } from "@/lib/types"
import { formatNumber, formatPercentage } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import ResultsTable from "./results-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ResultsDisplayProps {
  results: SimulationResults
  params: InsuranceParams
}

export default function ResultsDisplay({ results, params }: ResultsDisplayProps) {
  // Données pour le graphique de comparaison des primes
  const premiumComparisonData = [
    {
      name: "Prime actuelle",
      value: results.currentTotalPremium,
    },
    {
      name: "Prime ajustée",
      value: results.adjustedTotalPremium,
    },
  ]

  // Données pour le graphique de répartition des coûts
  const costDistributionData = [
    {
      name: "Coût Cie",
      value: params.insuranceCompanyCost,
    },
    {
      name: "Coût client",
      value: params.customerPaidCost,
    },
  ]

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))"]

  const percentChange =
    ((results.adjustedTotalPremium - results.currentTotalPremium) / results.currentTotalPremium) * 100

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prime actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(results.currentTotalPremium)} €</div>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(params.premiumPerSqm)} €/m²</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prime ajustée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(results.adjustedTotalPremium)} €</div>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(results.newPremiumPerSqm)} €/m²</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${percentChange >= 0 ? "text-destructive" : "text-green-600"}`}>
              {percentChange >= 0 ? "+" : ""}
              {formatNumber(percentChange)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(results.newPremiumPerSqm - params.premiumPerSqm)} €/m²
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ratio S/P</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(results.currentSPRatio)}</div>
            <p className="text-xs text-muted-foreground mt-1">Cible: {formatPercentage(params.targetSPRatio)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts">
        <TabsList className="mb-4">
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
          <TabsTrigger value="details">Détails des calculs</TabsTrigger>
        </TabsList>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Comparaison des primes</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={premiumComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${formatNumber(Number(value))} €`, "Montant"]} />
                    <Legend />
                    <Bar dataKey="value" name="Montant (€)" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des coûts des sinistres</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${formatNumber(Number(value))} €`, "Montant"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <ResultsTable results={results} params={params} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

