import { ErrorBoundary } from "@/components/error-boundary"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import InsuranceSimulator from "@/components/insurance-simulator"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background theme-transition">
      <header className="border-b">
        <div className="container mx-auto py-2 px-4 landscape:py-2 flex items-center justify-between">
          <h1 className="text-xl font-bold">Simulateur de Prime d'Assurance</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container landscape:max-w-[98%] mx-auto py-4 landscape:py-2 px-4 landscape:px-3">
        <div className="max-w-3xl landscape:max-w-full mx-auto">
          <p className="text-lg text-muted-foreground mb-4 landscape:mb-2 text-center landscape:max-w-[80%] landscape:mx-auto">
            Calculez et optimisez vos primes d'assurance en fonction de différents paramètres
          </p>
          <ErrorBoundary>
            <InsuranceSimulator />
          </ErrorBoundary>
        </div>
      </main>

      <footer className="border-t mt-8 landscape:mt-2">
        <div className="container mx-auto py-4 landscape:py-1 px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Simulateur de Prime d'Assurance</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

