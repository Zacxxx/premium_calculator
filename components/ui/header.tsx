"use client"

import React from "react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useMounted } from "@/lib/hooks/use-mounted"
import { cn } from "@/lib/utils"

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  showThemeToggle?: boolean
}

export const Header = React.memo(function Header({ className, showThemeToggle = true, ...props }: HeaderProps) {
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
          <nav className="flex items-center space-x-2">{showThemeToggle && mounted && <ThemeToggle />}</nav>
        </div>
      </div>
    </header>
  )
})

