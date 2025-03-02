import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center mb-6 landscape:mb-3 landscape:h-auto">
        <div className="relative">
          <div className="h-12 w-12 landscape:h-10 landscape:w-10 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-medium">
            Calcul
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="landscape:shadow-sm">
            <CardHeader className="pb-1 landscape:pb-0 landscape:pt-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="landscape:py-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-20 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="landscape:shadow-sm landscape:mt-3">
        <CardContent className="pt-4 landscape:pt-3 landscape:pb-3">
          <div className="grid grid-cols-1 landscape:grid-cols-2 gap-3 landscape:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 landscape:h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Simulate charts loading */}
      <div className="mt-4 grid grid-cols-1 landscape:grid-cols-2 gap-4">
        <Card className="landscape:shadow-sm">
          <CardHeader className="pb-1 landscape:pb-1 landscape:pt-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="landscape:py-2">
            <Skeleton className="h-40 landscape:h-32 w-full rounded-md" />
          </CardContent>
        </Card>
        <Card className="landscape:shadow-sm">
          <CardHeader className="pb-1 landscape:pb-1 landscape:pt-2">
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="landscape:py-2">
            <Skeleton className="h-40 landscape:h-32 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

