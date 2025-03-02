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
  const [lastSavedParams, saveParamsToStorage] = useLocalStorage<string | null>("lastSavedParams", null)
  const [defaultResultsCalculated, setDefaultResultsCalculated] = React.useState(false)
  const initializedRef = React.useRef(false)

  // Performance tracking
  React.useEffect(() => {
    const metricName = "componentLifetime"
    performanceMonitor.start(metricName)
    return () => {
      performanceMonitor.end(metricName)
    }
  }, [])

  // Load params on mount and calculate default results - only once
  React.useEffect(() => {
    // Skip if already initialized
    if (initializedRef.current) {
      return;
    }
    
    const metricName = "loadParams"
    performanceMonitor.start(metricName)
    try {
      // Ne pas réinitialiser les paramètres à chaque montage du composant
      // Charger d'abord les paramètres sauvegardés
      loadParams()
      debug.log("Parameters loaded successfully")
      
      // Calculer les résultats par défaut si aucun résultat n'est disponible
      if (!results && !isCalculating) {
        debug.log("Calculating default results")
        recalculate()
        setDefaultResultsCalculated(true)
      }
      
      // Mark as initialized
      initializedRef.current = true;
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
  }, []) // Empty dependency array - run only once on mount

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
      saveParamsToStorage(JSON.stringify(params))
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

    const metricName = "exportResults"
    performanceMonitor.start(metricName)
    try {
      const resultsData = {
        params,
        results,
        exportDate: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(resultsData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
      
      // Use a stable date format for the filename to avoid hydration issues
      const exportFileDefaultName = `simulation-assurance-export.json`

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
      performanceMonitor.end(metricName)
    }
  }, [results, params, toast])

  const handleReset = React.useCallback(() => {
    performanceMonitor.start("resetParameters")
    try {
      resetParams()
      setCurrentStep(0)
      setDefaultResultsCalculated(false)
      cache.clear()
      toast({
        title: "Succès",
        description: "Les paramètres ont été réinitialisés aux valeurs par défaut.",
      })
      analytics.trackEvent({ name: "parameters_saved" })
    } catch (error) {
      debug.error("Reset error:", error)
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les paramètres.",
        variant: "destructive",
      })
    } finally {
      performanceMonitor.end("resetParameters")
    }
  }, [resetParams, toast])

  return (
    <ErrorBoundary>
      <Card className="p-4 landscape:p-4 shadow-lg">
        <div className="landscape:flex landscape:flex-row landscape:items-start landscape:gap-6">
          {/* Colonne de gauche en mode paysage - En-tête et paramètres */}
          <div className="landscape:w-[35%] landscape:pr-4 landscape:border-r landscape:border-border">
            <div className="mb-5 landscape:mb-4">
              <StepIndicator steps={SIMULATION_STEPS} currentStep={currentStep} />
            </div>

            <div className="flex justify-end gap-2 mb-4 landscape:mb-3">
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
            <div className="space-y-3 mb-8 landscape:mb-0">
              <h2 className="text-xl font-semibold landscape:text-lg">Simulateur</h2>
              {isCalculating ? (
                <div className="landscape:max-h-[calc(100vh-14rem)] landscape:overflow-y-auto landscape:pr-2">
                  <LoadingState />
                </div>
              ) : (
                <div className="landscape:max-h-[calc(100vh-14rem)] landscape:overflow-y-auto landscape:pr-2">
                  <InputParameters params={params} onChange={updateParams} errors={errors} />
                </div>
              )}
            </div>
          </div>

          {/* Colonne de droite en mode paysage - Résultats */}
          <div className="pt-6 border-t border-border landscape:border-t-0 landscape:pt-0 landscape:w-[65%] landscape:flex-grow">
            <h2 className="text-xl font-semibold mb-4 landscape:mb-3 landscape:text-lg">Résultats</h2>
            {isCalculating ? (
              <div className="landscape:max-h-[calc(100vh-10rem)] landscape:overflow-y-auto">
                <LoadingState />
              </div>
            ) : results ? (
              <div className="landscape:max-h-[calc(100vh-10rem)] landscape:overflow-y-auto landscape:pr-1">
                <ResultsDisplay results={results} params={params} />
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/50 rounded-md">
                <p className="text-muted-foreground">
                  {Object.keys(errors).length > 0 
                    ? "Veuillez corriger les erreurs dans les paramètres pour voir les résultats."
                    : "Ajustez les paramètres pour calculer les résultats."}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </ErrorBoundary>
  )
}

