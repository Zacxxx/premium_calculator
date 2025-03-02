import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-2 px-4 landscape:py-2">
          <Skeleton className="h-8 w-64" />
        </div>
      </header>

      <main className="container landscape:max-w-[98%] mx-auto py-4 landscape:py-2 px-4 landscape:px-3">
        <div className="max-w-3xl landscape:max-w-full mx-auto space-y-4">
          <Skeleton className="h-4 w-full max-w-lg mx-auto" />

          <Card>
            <CardContent className="p-4">
              <div className="landscape:flex landscape:flex-row landscape:gap-6">
                {/* Colonne de gauche en mode paysage */}
                <div className="landscape:w-[35%] landscape:pr-4 landscape:border-r landscape:border-border">
                  <Skeleton className="h-6 w-full mb-4" />
                  <div className="flex justify-end mb-4">
                    <Skeleton className="h-8 w-32 mr-2" />
                    <Skeleton className="h-8 w-32 mr-2" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  
                  <Skeleton className="h-5 w-28 mb-3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Colonne de droite en mode paysage */}
                <div className="mt-6 pt-6 border-t border-border landscape:mt-0 landscape:pt-0 landscape:border-t-0 landscape:w-[65%]">
                  <Skeleton className="h-5 w-28 mb-4" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 landscape:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="landscape:shadow-sm">
                        <CardHeader className="pb-1 landscape:pb-0 landscape:pt-2">
                          <Skeleton className="h-3 w-20" />
                        </CardHeader>
                        <CardContent className="landscape:py-2">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-3 w-16 mt-1" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 landscape:grid-cols-2 gap-4">
                    <Card className="landscape:shadow-sm">
                      <CardHeader className="pb-1 landscape:pt-2">
                        <Skeleton className="h-4 w-32" />
                      </CardHeader>
                      <CardContent className="landscape:py-2">
                        <Skeleton className="h-40 landscape:h-32 w-full rounded-md" />
                      </CardContent>
                    </Card>
                    <Card className="landscape:shadow-sm">
                      <CardHeader className="pb-1 landscape:pt-2">
                        <Skeleton className="h-4 w-40" />
                      </CardHeader>
                      <CardContent className="landscape:py-2">
                        <Skeleton className="h-40 landscape:h-32 w-full rounded-md" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

