import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SimulationProvider } from "@/lib/context/simulation-context"
import { FontSizeProvider } from "@/lib/context/font-size-context"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import "@/styles/font-scaling.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: "%s | Simulateur de Prime d'Assurance",
    default: "Simulateur de Prime d'Assurance",
  },
  description: "Calculez et optimisez vos primes d'assurance en fonction de différents paramètres",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    title: "Simulateur de Prime d'Assurance",
    description: "Calculez et optimisez vos primes d'assurance en fonction de différents paramètres",
    siteName: "Simulateur de Prime d'Assurance",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SimulationProvider>
            <FontSizeProvider>
              {children}
              <Toaster />
            </FontSizeProvider>
          </SimulationProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}



import './globals.css'