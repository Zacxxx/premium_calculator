"use client"

import { useEffect } from "react"
import { debug } from "@/lib/debug-utils"

export function useCleanup(cleanup: () => void, deps: any[] = []) {
  useEffect(() => {
    return () => {
      try {
        debug.log("Running cleanup function")
        cleanup()
      } catch (error) {
        debug.error("Cleanup error:", error)
      }
    }
  }, [...deps, cleanup])
}

