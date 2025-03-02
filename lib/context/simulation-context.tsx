"use client"

import * as React from "react"
import type { InsuranceParams, SimulationResults } from "@/lib/types"
import { calculateResults } from "@/lib/insurance-calculations"
import { validateBusinessRules, validateInsuranceParams } from "@/lib/validation"
import { defaultParams } from "@/lib/constants"
import { analytics } from "@/lib/analytics"
import { performanceMonitor } from "@/lib/performance-monitoring"
import { debug } from "@/lib/debug-utils"
import { handleError, ValidationError } from "@/lib/error-handling"
import { useCleanup } from "@/lib/hooks/use-cleanup"

interface SimulationState {
  params: InsuranceParams
  results: SimulationResults | null
  errors: Record<string, string>
  isCalculating: boolean
  isDirty: boolean
  lastCalculation: number | null
}

interface SimulationContextType extends SimulationState {
  updateParams: (newParams: Partial<InsuranceParams>) => void
  resetParams: () => void
  validateParams: () => boolean
  saveParams: () => void
  loadParams: () => void
  recalculate: () => void
}

const SimulationContext = React.createContext<SimulationContextType | undefined>(undefined)

type SimulationAction =
  | { type: "SET_PARAMS"; payload: Partial<InsuranceParams> }
  | { type: "SET_RESULTS"; payload: SimulationResults }
  | { type: "SET_ERRORS"; payload: Record<string, string> }
  | { type: "RESET_STATE" }
  | { type: "SET_CALCULATING"; payload: boolean }
  | { type: "UPDATE_PARAMS_WITHOUT_DIRTY"; payload: Partial<InsuranceParams> }

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case "SET_PARAMS":
      return {
        ...state,
        params: { ...state.params, ...action.payload },
        isDirty: true,
        lastCalculation: null,
      }
    case "UPDATE_PARAMS_WITHOUT_DIRTY":
      return {
        ...state,
        params: { ...state.params, ...action.payload },
      }
    case "SET_RESULTS":
      return {
        ...state,
        results: action.payload,
        isDirty: false,
        lastCalculation: typeof window !== 'undefined' ? Date.now() : null,
      }
    case "SET_ERRORS":
      return {
        ...state,
        errors: action.payload,
      }
    case "RESET_STATE":
      return {
        ...state,
        params: defaultParams,
        results: null,
        errors: {},
        isDirty: false,
        lastCalculation: null,
      }
    case "SET_CALCULATING":
      return {
        ...state,
        isCalculating: action.payload,
      }
    default:
      return state
  }
}

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(simulationReducer, {
    params: defaultParams,
    results: null,
    errors: {},
    isCalculating: false,
    isDirty: false,
    lastCalculation: null,
  })

  const validateParams = React.useCallback(() => {
    try {
      performanceMonitor.start("validateParams")
      debug.group("Parameter Validation", () => {
        debug.log("Current params:", state.params)
      })

      const schemaErrors = validateInsuranceParams(state.params)
      const businessErrors = validateBusinessRules(state.params)
      const allErrors = { ...schemaErrors, ...businessErrors }

      dispatch({ type: "SET_ERRORS", payload: allErrors })

      if (Object.keys(allErrors).length > 0) {
        throw new ValidationError("Validation errors detected", { errors: allErrors })
      }

      return true
    } catch (error) {
      const handledError = handleError(error)
      debug.error("Validation error:", handledError)
      analytics.trackError(handledError)
      return false
    } finally {
      performanceMonitor.end("validateParams")
    }
  }, [state.params])

  const calculateAsync = React.useCallback(async () => {
    if (!validateParams()) return

    dispatch({ type: "SET_CALCULATING", payload: true })
    performanceMonitor.start("calculation")
    analytics.trackEvent({ name: "simulation_started" })

    try {
      debug.time("calculation")
      await new Promise((resolve) => setTimeout(resolve, 100))
      
      const cleanParams = {
        ...state.params,
        premiumPerSqm: Number(state.params.premiumPerSqm.toFixed(2)),
        totalSurface: Number(state.params.totalSurface.toFixed(2)),
        insuranceCompanyCost: Number(state.params.insuranceCompanyCost.toFixed(2)),
        customerPaidCost: Number(state.params.customerPaidCost.toFixed(2)),
        inflation: Number(state.params.inflation.toFixed(4)),
        taxRate: Number(state.params.taxRate.toFixed(4)),
        targetSPRatio: Number(state.params.targetSPRatio.toFixed(4))
      };
      
      const results = calculateResults(cleanParams)
      debug.timeEnd("calculation")

      dispatch({ type: "SET_RESULTS", payload: results })
      analytics.trackEvent({ name: "simulation_completed" })
    } catch (error) {
      const handledError = handleError(error)
      debug.error("Calculation error:", handledError)
      analytics.trackError(handledError)
      dispatch({
        type: "SET_ERRORS",
        payload: { calculation: handledError.message },
      })
    } finally {
      dispatch({ type: "SET_CALCULATING", payload: false })
      performanceMonitor.end("calculation")
    }
  }, [state.params, validateParams])

  React.useEffect(() => {
    if (state.isDirty) {
      const timer = setTimeout(() => {
        calculateAsync()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [state.isDirty, calculateAsync])

  const updateParams = React.useCallback((newParams: Partial<InsuranceParams>) => {
    debug.log("Updating params:", newParams)
    
    const sanitizedParams: Partial<InsuranceParams> = {};
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
        sanitizedParams[key as keyof InsuranceParams] = value;
      } else if (value !== undefined && value !== null) {
        sanitizedParams[key as keyof InsuranceParams] = value;
      }
    });
    
    if (Object.keys(sanitizedParams).length > 0) {
      const shouldMarkAsDirty = Object.keys(sanitizedParams).some(key => {
        const currentValue = state.params[key as keyof InsuranceParams];
        const newValue = sanitizedParams[key as keyof InsuranceParams];
        
        if (typeof currentValue === 'number' && typeof newValue === 'number') {
          return Math.abs(currentValue - newValue) > 0.000001;
        }
        
        return currentValue !== newValue;
      });
      
      if (shouldMarkAsDirty) {
        dispatch({ type: "SET_PARAMS", payload: sanitizedParams });
      } else {
        dispatch({ 
          type: "UPDATE_PARAMS_WITHOUT_DIRTY", 
          payload: sanitizedParams 
        });
      }
    }
  }, [state.params])

  const resetParams = React.useCallback(() => {
    debug.log("Resetting params to defaults")
    dispatch({ type: "RESET_STATE" })
    analytics.trackEvent({ name: "parameters_reset" })
  }, [])

  const saveParams = React.useCallback(() => {
    try {
      debug.log("Saving params to localStorage")
      localStorage.setItem("insuranceParams", JSON.stringify(state.params))
      analytics.trackEvent({ name: "parameters_saved" })
    } catch (error) {
      const handledError = handleError(error)
      debug.error("Save error:", handledError)
      analytics.trackError(handledError)
      throw handledError
    }
  }, [state.params])

  const parameterLoadedRef = React.useRef(false);
  
  const loadParams = React.useCallback(() => {
    // Skip if we've already loaded parameters in this session
    if (parameterLoadedRef.current) {
      debug.log("Parameters already loaded, skipping");
      return;
    }
    
    try {
      debug.log("Loading params from localStorage")
      const savedParams = localStorage.getItem("insuranceParams")
      if (savedParams) {
        const parsed = JSON.parse(savedParams)
        dispatch({ type: "SET_PARAMS", payload: parsed })
        analytics.trackEvent({ name: "parameters_loaded" })
        // Mark that we've loaded parameters
        parameterLoadedRef.current = true;
      }
    } catch (error) {
      const handledError = handleError(error)
      debug.error("Load error:", handledError)
      analytics.trackError(handledError)
    }
  }, [])

  const recalculate = React.useCallback(() => {
    debug.log("Forcing recalculation")
    dispatch({ type: "SET_PARAMS", payload: state.params })
  }, [state.params])

  // Cleanup on unmount
  useCleanup(() => {
    performanceMonitor.clearMetrics()
  }, [])

  const value = React.useMemo(
    () => ({
      ...state,
      updateParams,
      resetParams,
      validateParams,
      saveParams,
      loadParams,
      recalculate,
    }),
    [state, updateParams, resetParams, validateParams, saveParams, loadParams, recalculate],
  )

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export function useSimulation() {
  const context = React.useContext(SimulationContext)
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider")
  }
  return context
}

