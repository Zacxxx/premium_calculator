"use client"

import * as React from "react"
import { Bug, Loader2 } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function DevIndicator() {
  const pathname = usePathname()
  const [isCompiling, setIsCompiling] = React.useState(false)
  const [hasErrors, setHasErrors] = React.useState(false)

  // Listen for compilation status
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") return

    const ws = new WebSocket(`ws://localhost:${process.env.PORT || 3000}/_next/webpack-hmr`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.action === "building") {
        setIsCompiling(true)
      }
      if (data.action === "built" || data.action === "sync") {
        setIsCompiling(false)
      }
      if (data.errors?.length > 0) {
        setHasErrors(true)
      } else {
        setHasErrors(false)
      }
    }

    return () => ws.close()
  }, [])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`fixed bottom-4 right-4 h-6 w-6 shrink-0 rounded-full border bg-background transition-colors hover:bg-muted ${
            isCompiling ? "animate-pulse" : ""
          } ${hasErrors ? "border-destructive" : ""}`}
        >
          {isCompiling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bug className={`h-4 w-4 ${hasErrors ? "text-destructive" : ""}`} />
          )}
          <span className="sr-only">Toggle developer tools</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="text-xs">Path: {pathname}</DropdownMenuItem>
        <DropdownMenuItem className="text-xs">
          Rendering: {process.env.NEXT_RUNTIME === "edge" ? "Edge" : "Node.js"}
        </DropdownMenuItem>
        {hasErrors && <DropdownMenuItem className="text-xs text-destructive">Build errors detected</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

