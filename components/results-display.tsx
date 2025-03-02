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
import { useState, ReactNode, useEffect } from "react"

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

function ChartModal({ isOpen, onClose, title, children }: ChartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] flex flex-col landscape:max-w-[95vw] landscape:w-[95vw] landscape:h-[90vh] overflow-hidden rounded-lg border-0 shadow-xl">
        <DialogHeader className="flex flex-row items-center justify-between py-2 px-4 border-b">
          <DialogTitle className="text-lg font-medium">{title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted/50 transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-hidden p-1">
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
  const [activeTab, setActiveTab] = useState("charts")
  const [fadeIn, setFadeIn] = useState(true)

  // Effect to handle tab transition animation
  useEffect(() => {
    setFadeIn(true);
  }, [activeTab]);

  // Fonction pour ouvrir un graphique en plein écran
  const openChartModal = (title: string, content: ReactNode) => {
    setModalTitle(title)
    setModalContent(content)
    setModalOpen(true)
  }

  // Handle tab change with animation
  const handleTabChange = (value: string) => {
    setFadeIn(false);
    setTimeout(() => {
      setActiveTab(value);
    }, 150);
  };

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
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
          </linearGradient>
          <filter id="shadow" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2"/>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
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
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "8px 12px",
          }}
          wrapperStyle={{ outline: "none" }}
        />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        <Bar 
          dataKey="value" 
          name="Montant (€)" 
          fill="url(#premiumBarFill)" 
          radius={[6, 6, 0, 0]}
          filter="url(#shadow)"
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
      <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <filter id="shadow-pie" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodOpacity="0.2" />
          </filter>
        </defs>
        <Pie
          data={costDistributionData}
          cx="50%"
          cy="50%"
          labelLine={{ stroke: "hsl(var(--foreground))", strokeOpacity: 0.5, strokeWidth: 1 }}
          label={({ name, percent, value }) => 
            `${name}: ${formatNumber(value)} € (${(percent * 100).toFixed(0)}%)`
          }
          outerRadius={costDistributionData.length > 0 ? "60%" : 90}
          innerRadius={costDistributionData.length > 0 ? "40%" : 40}
          paddingAngle={6}
          dataKey="value"
          filter="url(#shadow-pie)"
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
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "8px 12px",
          }}
          wrapperStyle={{ outline: "none" }}
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
      <AreaChart 
        data={inflationTrendData} 
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="currentPremiumGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="adjustedPremiumGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
          </linearGradient>
          <filter id="shadow-line">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
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
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "8px 12px",
          }}
          wrapperStyle={{ outline: "none" }}
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
          filter="url(#shadow-line)"
        />
        <Area 
          type="monotone" 
          dataKey="Prime ajustée" 
          stroke="hsl(var(--secondary))" 
          strokeWidth={2}
          fill="url(#adjustedPremiumGradient)" 
          activeDot={{ r: 8, stroke: "hsl(var(--background))", strokeWidth: 2 }} 
          filter="url(#shadow-line)"
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
        margin={{ top: 20, right: 35, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="premiumColorGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="premiumAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="coverageAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.7} />
            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
          </linearGradient>
          <filter id="shadow-premium-coverage">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
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
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "8px 12px"
          }}
          wrapperStyle={{ outline: "none" }}
        />
        <Legend 
          formatter={(value) => (
            <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
          )}
          wrapperStyle={{ paddingTop: 10 }}
        />
        <Area 
          type="monotone" 
          dataKey="premium" 
          name="Prime"
          yAxisId="left"
          stroke="hsl(var(--primary))" 
          fill="url(#premiumAreaGradient)"
          fillOpacity={0.6} 
          strokeWidth={2}
        />
        <Area 
          type="monotone" 
          dataKey="coverage" 
          name="Couverture"
          yAxisId="left"
          stroke="hsl(var(--secondary))" 
          fill="url(#coverageAreaGradient)"
          fillOpacity={0.6}
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="ratio" 
          name="Ratio S/P"
          yAxisId="right"
          stroke="url(#premiumColorGradient)"
          strokeWidth={3}
          dot={{ stroke: 'hsl(var(--background))', strokeWidth: 2, r: 6, fill: '#8884d8' }}
          activeDot={{ r: 8, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
          filter="url(#shadow-premium-coverage)"
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
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="otherClaimsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.9} />
            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.6} />
          </linearGradient>
          <filter id="shadow-bars">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
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
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "8px 12px"
          }}
          wrapperStyle={{ outline: "none" }}
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
          radius={[6, 6, 0, 0]}
          filter="url(#shadow-bars)"
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
          radius={[6, 6, 0, 0]}
          filter="url(#shadow-bars)"
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
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
        <PolarGrid stroke="hsl(var(--muted))" strokeOpacity={0.5} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--muted))" }}
          tickCount={5}
          stroke="hsl(var(--muted))"
        />
        <Radar
          name="Valeurs actuelles"
          dataKey="A"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
          strokeWidth={2}
        />
        <Tooltip 
          formatter={(value: any) => {
            // Ensure value is a number before using toFixed
            const numValue = typeof value === 'number' ? value : parseFloat(String(value));
            return [isNaN(numValue) ? '0%' : `${numValue.toFixed(0)}%`, "Score"];
          }}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "8px 12px"
          }}
          wrapperStyle={{ outline: "none" }}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          formatter={(value) => (
            <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
          )}
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-5 landscape:space-y-3">
      {/* Modal pour l'affichage des graphiques en plein écran */}
      <ChartModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle}
      >
        {modalContent}
      </ChartModal>

      {/* Cartes d'informations principales - adaptées pour le mode paysage */}
      <div className="grid grid-cols-2 landscape:grid-cols-4 gap-2 landscape:gap-2">
        <Card className="shadow-sm border border-border/40 hover:border-border/70 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 fill-mode-both delay-[150ms]">
          <CardHeader className="pb-1 landscape:py-2 landscape:pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prime actuelle</CardTitle>
          </CardHeader>
          <CardContent className="landscape:pt-0 pb-3">
            <div className="text-xl landscape:text-lg font-bold">{formatNumber(results.currentTotalPremium)} €</div>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(params.premiumPerSqm)} €/m²</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border/40 hover:border-border/70 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 fill-mode-both delay-[200ms]">
          <CardHeader className="pb-1 landscape:py-2 landscape:pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prime ajustée</CardTitle>
          </CardHeader>
          <CardContent className="landscape:pt-0 pb-3">
            <div className="text-xl landscape:text-lg font-bold">{formatNumber(results.adjustedTotalPremium)} €</div>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(results.newPremiumPerSqm)} €/m²</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border/40 hover:border-border/70 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 fill-mode-both delay-[250ms]">
          <CardHeader className="pb-1 landscape:py-2 landscape:pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Variation</CardTitle>
          </CardHeader>
          <CardContent className="landscape:pt-0 pb-3">
            <div className={`text-xl landscape:text-lg font-bold ${percentChange >= 0 ? "text-destructive" : "text-green-600"}`}>
              {percentChange >= 0 ? "+" : ""}
              {formatNumber(percentChange)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(results.newPremiumPerSqm - params.premiumPerSqm)} €/m²
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border/40 hover:border-border/70 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 fill-mode-both delay-[300ms]">
          <CardHeader className="pb-1 landscape:py-2 landscape:pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ratio S/P</CardTitle>
          </CardHeader>
          <CardContent className="landscape:pt-0 pb-3">
            <div className="text-xl landscape:text-lg font-bold">{formatPercentage(results.currentSPRatio)}</div>
            <p className="text-xs text-muted-foreground mt-1">Cible: {formatPercentage(params.targetSPRatio)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Liste d'onglets plus compacte en mode paysage */}
        <TabsList className="mb-3 w-full landscape:max-w-[80%] landscape:mx-auto landscape:flex landscape:justify-center bg-background border border-border/40 p-1 rounded-lg">
          <TabsTrigger value="charts" className="landscape:flex-initial landscape:px-6 data-[state=active]:bg-muted/80 data-[state=active]:shadow-sm transition-all">Graphiques</TabsTrigger>
          <TabsTrigger value="advanced-charts" className="landscape:flex-initial landscape:px-6 data-[state=active]:bg-muted/80 data-[state=active]:shadow-sm transition-all">Graphiques avancés</TabsTrigger>
          <TabsTrigger value="details" className="landscape:flex-initial landscape:px-6 data-[state=active]:bg-muted/80 data-[state=active]:shadow-sm transition-all">Détails des calculs</TabsTrigger>
        </TabsList>

        <div className={`transition-opacity duration-150 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <TabsContent value="charts" forceMount hidden={activeTab !== "charts"}>
            {/* Adaptation des graphiques principaux pour le mode paysage */}
            <div className="grid grid-cols-1 landscape:grid-cols-2 gap-4 landscape:gap-3">
              <Card className="shadow-sm border border-border/40 hover:shadow-md hover:border-border/70 transition-all duration-300 animate-in fade-in slide-in-from-left-3 fill-mode-both delay-[100ms]">
                <CardHeader className="flex flex-row items-center justify-between landscape:py-2 pb-1 border-b border-border/30">
                  <CardTitle className="landscape:text-sm text-muted-foreground">Comparaison des primes</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openChartModal("Comparaison des primes", PremiumComparisonChart)}
                    title="Ouvrir en plein écran"
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[280px] landscape:h-[200px] landscape:pt-1">
                  {PremiumComparisonChart}
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-border/40 hover:shadow-md hover:border-border/70 transition-all duration-300 animate-in fade-in slide-in-from-right-3 fill-mode-both delay-[150ms]">
                <CardHeader className="flex flex-row items-center justify-between landscape:py-2 pb-1 border-b border-border/30">
                  <CardTitle className="landscape:text-sm text-muted-foreground">Répartition des coûts des sinistres</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openChartModal("Répartition des coûts des sinistres", CostDistributionChart)}
                    title="Ouvrir en plein écran"
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[280px] landscape:h-[200px] landscape:pt-1">
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

          <TabsContent value="advanced-charts" forceMount hidden={activeTab !== "advanced-charts"}>
            {/* Optimisation des graphiques avancés pour le mode paysage */}
            <div className="grid grid-cols-1 landscape:grid-cols-2 gap-4 landscape:gap-3">
              <Card className="shadow-sm border border-border/40 hover:shadow-md hover:border-border/70 transition-all duration-300 animate-in fade-in slide-in-from-left-3 fill-mode-both delay-[100ms]">
                <CardHeader className="flex flex-row items-center justify-between landscape:py-2 pb-1 border-b border-border/30">
                  <CardTitle className="landscape:text-sm text-muted-foreground">Évolution des primes avec inflation (5 ans)</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openChartModal("Évolution des primes avec inflation (5 ans)", InflationTrendChart)}
                    title="Ouvrir en plein écran"
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[280px] landscape:h-[200px] landscape:pt-1">
                  {InflationTrendChart}
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-border/40 hover:shadow-md hover:border-border/70 transition-all duration-300 animate-in fade-in slide-in-from-right-3 fill-mode-both delay-[150ms]">
                <CardHeader className="flex flex-row items-center justify-between landscape:py-2 pb-1 border-b border-border/30">
                  <CardTitle className="landscape:text-sm text-muted-foreground">Rapport Prime/Couverture</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openChartModal("Rapport Prime/Couverture", PremiumCoverageChart)}
                    title="Ouvrir en plein écran"
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[280px] landscape:h-[200px] landscape:pt-1">
                  {PremiumCoverageChart}
                </CardContent>
              </Card>

              {/* Les deux graphiques suivants sur une même ligne en mode paysage */}
              <Card className="shadow-sm border border-border/40 hover:shadow-md hover:border-border/70 transition-all duration-300 animate-in fade-in slide-in-from-left-3 fill-mode-both delay-[100ms]">
                <CardHeader className="flex flex-row items-center justify-between landscape:py-2 pb-1 border-b border-border/30">
                  <CardTitle className="landscape:text-sm text-muted-foreground">Répartition des types de sinistres</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openChartModal("Répartition des types de sinistres", ClaimBreakdownChart)}
                    title="Ouvrir en plein écran"
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[280px] landscape:h-[200px] landscape:pt-1">
                  {ClaimBreakdownChart}
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-border/40 hover:shadow-md hover:border-border/70 transition-all duration-300 animate-in fade-in slide-in-from-right-3 fill-mode-both delay-[150ms]">
                <CardHeader className="flex flex-row items-center justify-between landscape:py-2 pb-1 border-b border-border/30">
                  <CardTitle className="landscape:text-sm text-muted-foreground">Indicateurs clés de performance</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openChartModal("Indicateurs clés de performance", PerformanceRadarChart)}
                    title="Ouvrir en plein écran"
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[280px] landscape:h-[200px] landscape:pt-1">
                  {PerformanceRadarChart}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" forceMount hidden={activeTab !== "details"}>
            <ResultsTable results={results} params={params} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

