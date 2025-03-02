"use client"

import React from "react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { FontSizeControl } from "@/components/ui/font-size-control"
import { useMounted } from "@/lib/hooks/use-mounted"
import { cn } from "@/lib/utils"

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  showThemeToggle?: boolean
  showFontSizeControl?: boolean
}

export const Header = React.memo(function Header({ 
  className, 
  showThemeToggle = true, 
  showFontSizeControl = true,
  ...props 
}: HeaderProps) {
  const mounted = useMounted()

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
      {...props}
    >
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Simulateur d'Assurance</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-4">
            {showFontSizeControl && mounted && <FontSizeControl variant="horizontal" />}
            {showThemeToggle && mounted && <ThemeToggle />}
          </nav>
        </div>
      </div>
    </header>
  )
})

