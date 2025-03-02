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
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts"
import ResultsTable from "./results-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Maximize2, X } from "lucide-react"
import { useState, ReactNode } from "react"

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

function ChartModal({ isOpen, onClose, title, children }: ChartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ResultsDisplayProps {
  results: SimulationResults
  params: InsuranceParams
}

export default function ResultsDisplay({ results, params }: ResultsDisplayProps) {
  // État pour la gestion du modal des graphiques
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalContent, setModalContent] = useState<ReactNode | null>(null)

  // Fonction pour ouvrir un graphique en plein écran
  const openChartModal = (title: string, content: ReactNode) => {
    setModalTitle(title)
    setModalContent(content)
    setModalOpen(true)
  }

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
  // Utilisation des valeurs calculées à partir des résultats pour une représentation plus précise
  // Multiplication par le nombre de sinistres pour obtenir le coût total
  // Vérification que les valeurs sont des nombres valides pour éviter les erreurs de rendu
  const costDistributionData = [
    {
      name: "Coût Cie",
      value: isFinite(results.averageCostPerClaimInsurance) ? 
        results.averageCostPerClaimInsurance * params.numberOfClaims : 0,
    },
    {
      name: "Coût client",
      value: isFinite(results.averageCostPerClaimCustomer) ? 
        results.averageCostPerClaimCustomer * params.numberOfClaims : 0,
    },
  ]

  // Nouvelles données pour le graphique d'évolution des primes avec inflation
  const inflationTrendData = Array.from({ length: 5 }, (_, i) => {
    const yearInflation = Math.pow(1 + params.inflation, i);
    return {
      name: `Année ${i + 1}`,
      "Prime actuelle": results.currentTotalPremium * yearInflation,
      "Prime ajustée": results.adjustedTotalPremium * yearInflation,
    };
  });

  // Données pour le graphique de répartition des sinistres
  const claimBreakdownData = [
    {
      name: "Répartition",
      "Dégâts des eaux": params.numberOfWaterDamageClaims,
      "Autres sinistres": params.numberOfClaims - params.numberOfWaterDamageClaims,
    }
  ];

  // Données pour le radar chart des indicateurs clés
  const normalizeValue = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const radarData = [
    {
      subject: "Ratio S/P",
      A: normalizeValue(results.currentSPRatio, 0, 1.5),
      fullMark: 100,
    },
    {
      subject: "Coût moyen",
      A: normalizeValue(
        results.averageCostPerClaimInsurance,
        0,
        results.averageCostPerClaimInsurance * 2
      ),
      fullMark: 100,
    },
    {
      subject: "Franchise",
      A: normalizeValue(results.averageDeductiblePerClaim, 0, params.deductible * 2),
      fullMark: 100,
    },
    {
      subject: "Inflation",
      A: normalizeValue(params.inflation, 0, 0.1),
      fullMark: 100,
    },
    {
      subject: "Nb sinistres",
      A: normalizeValue(params.numberOfClaims, 0, params.numberOfClaims * 2),
      fullMark: 100,
    },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))"]

  const percentChange =
    ((results.adjustedTotalPremium - results.currentTotalPremium) / results.currentTotalPremium) * 100

  // Composants des graphiques réutilisables pour le modal
  const PremiumComparisonChart = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={premiumComparisonData} 
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        barGap={30}
      >
        <defs>
          <linearGradient id="premiumBarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
        />
        <YAxis 
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
          tickFormatter={(value: number) => `${formatNumber(value)} €`}
        />
        <Tooltip 
          formatter={(value: number) => [`${formatNumber(value)} €`, "Montant"]}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
          }}
        />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        <Bar 
          dataKey="value" 
          name="Montant (€)" 
          fill="url(#premiumBarFill)" 
          radius={[4, 4, 0, 0]}
          label={{
            position: "top",
            fill: "hsl(var(--foreground))",
            fontSize: 12,
            formatter: (value: number) => `${formatNumber(value)} €`
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const CostDistributionChart = (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>
        <Pie
          data={costDistributionData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent, value }) => 
            `${name}: ${formatNumber(value)} € (${(percent * 100).toFixed(0)}%)`
          }
          outerRadius={costDistributionData.length > 0 ? "60%" : 90}
          innerRadius={costDistributionData.length > 0 ? "40%" : 40}
          paddingAngle={4}
          dataKey="value"
          filter="url(#shadow)"
        >
          {costDistributionData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${formatNumber(value)} €`, "Montant"]}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
          }}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          formatter={(value, entry) => (
            <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const InflationTrendChart = (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={inflationTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="currentPremiumGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="adjustedPremiumGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
        />
        <YAxis 
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
          tickFormatter={(value: number) => `${formatNumber(value)} €`}
        />
        <Tooltip 
          formatter={(value: number) => [`${formatNumber(value)} €`, "Montant"]}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
          }}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          formatter={(value) => (
            <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
          )}
        />
        <ReferenceLine 
          y={results.currentTotalPremium} 
          stroke="hsl(var(--muted-foreground))" 
          strokeDasharray="3 3"
          label={{ 
            value: "Prime initiale", 
            position: "insideBottomRight",
            fill: "hsl(var(--muted-foreground))",
            fontSize: 12
          }}
        />
        <Area 
          type="monotone" 
          dataKey="Prime actuelle" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          fill="url(#currentPremiumGradient)" 
          activeDot={{ r: 8, stroke: "hsl(var(--background))", strokeWidth: 2 }} 
        />
        <Area 
          type="monotone" 
          dataKey="Prime ajustée" 
          stroke="hsl(var(--secondary))" 
          strokeWidth={2}
          fill="url(#adjustedPremiumGradient)" 
          activeDot={{ r: 8, stroke: "hsl(var(--background))", strokeWidth: 2 }} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const PremiumCoverageChart = (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={[
          {
            name: "Actuel",
            premium: results.currentTotalPremium,
            coverage: params.insuranceCompanyCost,
            ratio: results.currentSPRatio
          },
          {
            name: "Ajusté",
            premium: results.adjustedTotalPremium,
            coverage: params.insuranceCompanyCost * (1 + params.inflation),
            ratio: params.targetSPRatio
          }
        ]}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="premiumColorGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
          tickFormatter={(value: number) => `${formatNumber(value)} €`}
          label={{ 
            value: 'Montant (€)', 
            angle: -90, 
            position: 'insideLeft',
            fill: "hsl(var(--foreground))",
            style: { textAnchor: 'middle' } 
          }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
          tickFormatter={(value: number) => `${formatPercentage(value)}`}
          label={{ 
            value: 'Ratio S/P', 
            angle: 90, 
            position: 'insideRight',
            fill: "hsl(var(--foreground))",
            style: { textAnchor: 'middle' } 
          }}
          domain={[0, 1.5]}
        />
        <Tooltip 
          formatter={(value: number, name) => {
            if (name === "ratio") {
              return [formatPercentage(value), "Ratio S/P"];
            }
            return [`${formatNumber(value)} €`, name === "premium" ? "Prime" : "Couverture"];
          }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="premium" 
          name="Prime"
          yAxisId="left"
          stroke="hsl(var(--primary))" 
          fill="hsl(var(--primary))"
          fillOpacity={0.4} 
        />
        <Area 
          type="monotone" 
          dataKey="coverage" 
          name="Couverture"
          yAxisId="left"
          stroke="hsl(var(--secondary))" 
          fill="hsl(var(--secondary))"
          fillOpacity={0.4} 
        />
        <Line 
          type="monotone" 
          dataKey="ratio" 
          name="Ratio S/P"
          yAxisId="right"
          stroke="url(#premiumColorGradient)"
          strokeWidth={3}
          dot={{ stroke: 'hsl(var(--background))', strokeWidth: 2, r: 6, fill: '#8884d8' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const ClaimBreakdownChart = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={claimBreakdownData} 
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        barSize={100}
      >
        <defs>
          <linearGradient id="waterDamageGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
          </linearGradient>
          <linearGradient id="otherClaimsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
          height={50}
        />
        <YAxis 
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
          label={{ 
            value: 'Nombre de sinistres', 
            angle: -90, 
            position: 'insideLeft',
            fill: "hsl(var(--foreground))",
            style: { textAnchor: 'middle' } 
          }}
        />
        <Tooltip 
          formatter={(value: number, name) => {
            // Calculate percentage
            const total = params.numberOfClaims;
            const percentage = ((value / total) * 100).toFixed(1);
            return [`${value} (${percentage}%)`, name];
          }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
          }}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          formatter={(value) => (
            <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
          )}
        />
        <Bar 
          dataKey="Dégâts des eaux" 
          stackId="a" 
          fill="url(#waterDamageGradient)"
          radius={[4, 4, 0, 0]}
          label={{
            position: 'insideBottom',
            fill: "hsl(var(--background))",
            formatter: (value: number) => {
              if (value === 0) return '';
              const total = params.numberOfClaims;
              const percentage = ((value / total) * 100).toFixed(0);
              return `${percentage}%`;
            }
          }}
        />
        <Bar 
          dataKey="Autres sinistres" 
          stackId="a" 
          fill="url(#otherClaimsGradient)"
          radius={[4, 4, 0, 0]}
          label={{
            position: 'insideTop',
            fill: "hsl(var(--background))",
            formatter: (value: number) => {
              if (value === 0) return '';
              const total = params.numberOfClaims;
              const percentage = ((value / total) * 100).toFixed(0);
              return `${percentage}%`;
            }
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const PerformanceRadarChart = (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
        <PolarGrid stroke="hsl(var(--muted))" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
          tickCount={5}
        />
        <Radar
          name="Valeurs actuelles"
          dataKey="A"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.5}
        />
        <Tooltip 
          formatter={(value: any) => {
            // Ensure value is a number before using toFixed
            const numValue = typeof value === 'number' ? value : parseFloat(String(value));
            return [isNaN(numValue) ? '0%' : `${numValue.toFixed(0)}%`, "Score"];
          }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
          }}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-8">
      {/* Modal pour l'affichage des graphiques en plein écran */}
      <ChartModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle}
      >
        {modalContent}
      </ChartModal>

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
          <TabsTrigger value="advanced-charts">Graphiques avancés</TabsTrigger>
          <TabsTrigger value="details">Détails des calculs</TabsTrigger>
        </TabsList>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Comparaison des primes</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openChartModal("Comparaison des primes", PremiumComparisonChart)}
                  title="Ouvrir en plein écran"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[300px]">
                {PremiumComparisonChart}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Répartition des coûts des sinistres</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openChartModal("Répartition des coûts des sinistres", CostDistributionChart)}
                  title="Ouvrir en plein écran"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[300px]">
                {costDistributionData.every(item => item.value === 0) ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                  </div>
                ) : (
                  CostDistributionChart
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced-charts">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Évolution des primes avec inflation (5 ans)</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openChartModal("Évolution des primes avec inflation (5 ans)", InflationTrendChart)}
                  title="Ouvrir en plein écran"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[300px]">
                {InflationTrendChart}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Rapport Prime/Couverture</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openChartModal("Rapport Prime/Couverture", PremiumCoverageChart)}
                  title="Ouvrir en plein écran"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[300px]">
                {PremiumCoverageChart}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Répartition des types de sinistres</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openChartModal("Répartition des types de sinistres", ClaimBreakdownChart)}
                    title="Ouvrir en plein écran"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {ClaimBreakdownChart}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Indicateurs clés de performance</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openChartModal("Indicateurs clés de performance", PerformanceRadarChart)}
                    title="Ouvrir en plein écran"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {PerformanceRadarChart}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <ResultsTable results={results} params={params} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

