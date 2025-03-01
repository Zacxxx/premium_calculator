import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Add security headers
  const headers = new Headers(request.headers)
  const response = NextResponse.next({
    request: {
      headers,
    },
  })

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")

  // Add CSP header in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:;",
    )
  }

  return response
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
}

