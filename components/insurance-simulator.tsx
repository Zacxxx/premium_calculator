"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Save, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingState } from "@/components/loading-state"
import { useSimulation } from "@/lib/context/simulation-context"
import InputParameters from "@/components/input-parameters"
import ResultsDisplay from "@/components/results-display"
import { analytics } from "@/lib/analytics"
import { StepIndicator, type Step } from "@/components/ui/step-indicator"
import { performanceMonitor } from "@/lib/performance-monitoring"
import { debug } from "@/lib/debug-utils"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { cache } from "@/lib/cache"

const SIMULATION_STEPS: Step[] = [
  {
    id: "parameters",
    title: "Paramètres",
    description: "Saisie des données",
  },
  {
    id: "validation",
    title: "Validation",
    description: "Vérification des données",
  },
  {
    id: "results",
    title: "Résultats",
    description: "Analyse des résultats",
  },
]

export default function InsuranceSimulator() {
  const { toast } = useToast()
  const { params, results, errors, isCalculating, updateParams, resetParams, saveParams, loadParams, recalculate } = useSimulation()

  const [currentStep, setCurrentStep] = React.useState(0)
  const debouncedParams = useDebounce(params)
  const [lastSavedParams, saveParamsToStorage] = useLocalStorage("lastSavedParams", null)
  const [defaultResultsCalculated, setDefaultResultsCalculated] = React.useState(false)

  // Performance tracking
  React.useEffect(() => {
    const metricName = "componentLifetime"
    performanceMonitor.start(metricName)
    return () => {
      performanceMonitor.end(metricName)
    }
  }, [])

  // Load params on mount and calculate default results
  React.useEffect(() => {
    const metricName = "loadParams"
    performanceMonitor.start(metricName)
    try {
      // Réinitialiser les paramètres pour utiliser la nouvelle valeur par défaut
      resetParams()
      debug.log("Parameters reset to new defaults")
      
      // Ensuite charger les paramètres sauvegardés (si disponibles)
      loadParams()
      debug.log("Parameters loaded successfully")
      
      // Calculer les résultats par défaut si aucun résultat n'est disponible
      if (!results && !isCalculating && !defaultResultsCalculated) {
        debug.log("Calculating default results")
        recalculate()
        setDefaultResultsCalculated(true)
      }
    } catch (error) {
      debug.error("Error loading parameters:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres sauvegardés.",
        variant: "destructive",
      })
    } finally {
      performanceMonitor.end(metricName)
    }
  }, [loadParams, toast, results, isCalculating, defaultResultsCalculated, recalculate, resetParams])

  // Update step based on state
  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setCurrentStep(0)
    } else if (isCalculating) {
      setCurrentStep(1)
    } else if (results) {
      setCurrentStep(2)
    }
  }, [errors, isCalculating, results])

  // Cache results
  React.useEffect(() => {
    if (results) {
      const cacheKey = JSON.stringify(debouncedParams)
      cache.set(cacheKey, results)
    }
  }, [results, debouncedParams])

  const handleSaveParameters = React.useCallback(async () => {
    const metricName = "saveParameters"
    performanceMonitor.start(metricName)
    try {
      await saveParams()
      saveParamsToStorage(params)
      toast({
        title: "Succès",
        description: "Vos paramètres ont été sauvegardés avec succès.",
      })
      analytics.trackEvent({ name: "parameters_saved" })
    } catch (error) {
      debug.error("Save error:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos paramètres.",
        variant: "destructive",
      })
    } finally {
      performanceMonitor.end(metricName)
    }
  }, [params, saveParams, saveParamsToStorage, toast])

  const handleExportResults = React.useCallback(() => {
    if (!results) return

    const startTime = performance.now()
    try {
      const resultsData = {
        params,
        results,
        exportDate: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(resultsData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
      const exportFileDefaultName = `simulation-assurance-${new Date().toISOString().slice(0, 10)}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      analytics.trackEvent({ name: "results_exported" })
      toast({
        title: "Succès",
        description: "Les résultats ont été exportés avec succès.",
      })
    } catch (error) {
      debug.error("Export error:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les résultats.",
        variant: "destructive",
      })
    } finally {
      const duration = performance.now() - startTime
      performanceMonitor.trackMetric("exportResults", duration)
    }
  }, [results, params, toast])

  const handleReset = React.useCallback(() => {
    const startTime = performance.now()
    try {
      resetParams()
      setCurrentStep(0)
      setDefaultResultsCalculated(false)
      cache.clear()
      toast({
        title: "Succès",
        description: "Les paramètres ont été réinitialisés aux valeurs par défaut.",
      })
      analytics.trackEvent({ name: "parameters_reset" })
    } catch (error) {
      debug.error("Reset error:", error)
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les paramètres.",
        variant: "destructive",
      })
    } finally {
      const duration = performance.now() - startTime
      performanceMonitor.trackMetric("resetParameters", duration)
    }
  }, [resetParams, toast])

  return (
    <ErrorBoundary>
      <Card className="p-6 shadow-lg">
        <div className="mb-8">
          <StepIndicator steps={SIMULATION_STEPS} currentStep={currentStep} />
        </div>

        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveParameters}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportResults} disabled={!results}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Section du simulateur */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold">Simulateur</h2>
          {isCalculating ? (
            <LoadingState />
          ) : (
            <InputParameters params={params} onChange={updateParams} errors={errors} />
          )}
        </div>

        {/* Section des résultats */}
        <div className="mt-8 pt-8 border-t border-border">
          <h2 className="text-xl font-semibold mb-6">Résultats</h2>
          {isCalculating ? (
            <LoadingState />
          ) : results ? (
            <ResultsDisplay results={results} params={params} />
          ) : (
            <div className="text-center py-6 bg-muted/50 rounded-md">
              <p className="text-muted-foreground">Calcul des résultats en cours...</p>
            </div>
          )}
        </div>
      </Card>
    </ErrorBoundary>
  )
}

