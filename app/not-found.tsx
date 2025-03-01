import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Page non trouvée</CardTitle>
          <CardDescription>La page que vous recherchez n'existe pas ou a été déplacée.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

