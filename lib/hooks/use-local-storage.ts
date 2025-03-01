"use client"

import * as React from "react"
import { debug } from "@/lib/debug-utils"

/**
 * Custom hook for managing local storage state
 * @param key The storage key
 * @param initialValue The initial value
 * @returns [storedValue, setValue] tuple
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Always initialize with initialValue to avoid hydration mismatch
  const [storedValue, setStoredValue] = React.useState<T>(initialValue)
  
  // Only access localStorage after component has mounted (client-side only)
  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      debug.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = React.useCallback(
    (value: T) => {
      try {
        setStoredValue(value)
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        debug.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key],
  )

  return [storedValue, setValue]
}

