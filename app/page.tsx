import { ErrorBoundary } from "@/components/error-boundary"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import InsuranceSimulator from "@/components/insurance-simulator"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background theme-transition">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Simulateur de Prime d'Assurance</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground mb-8 text-center">
            Calculez et optimisez vos primes d'assurance en fonction de différents paramètres
          </p>
          <ErrorBoundary>
            <InsuranceSimulator />
          </ErrorBoundary>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Simulateur de Prime d'Assurance</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

