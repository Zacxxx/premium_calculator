import type * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  segments: {
    title: string
    href?: string
  }[]
  separator?: React.ReactNode
}

export function Breadcrumb({
  segments,
  separator = <ChevronRight className="h-4 w-4" />,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm", className)} {...props}>
      <ol className="flex items-center gap-2">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          return (
            <li key={segment.title} className="flex items-center gap-2">
              {segment.href && !isLast ? (
                <a href={segment.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {segment.title}
                </a>
              ) : (
                <span className={cn(isLast ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {segment.title}
                </span>
              )}
              {!isLast && <span className="text-muted-foreground">{separator}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export const BreadcrumbList = () => {
  return null
}
export const BreadcrumbItem = () => {
  return null
}
export const BreadcrumbLink = () => {
  return null
}
export const BreadcrumbPage = () => {
  return null
}
export const BreadcrumbSeparator = () => {
  return null
}
export const BreadcrumbEllipsis = () => {
  return null
}

