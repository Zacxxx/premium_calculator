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
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      debug.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = React.useCallback(
    (value: T) => {
      try {
        setStoredValue(value)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value))
        }
      } catch (error) {
        debug.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key],
  )

  return [storedValue, setValue]
}

