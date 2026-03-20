import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/", "/login", "/signup", "/api/auth/login", "/api/auth/signup"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and static files
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const token = request.cookies.get("sb-access-token")?.value

  // API routes: return 401 if no token
  if (pathname.startsWith("/api/") && !token) {
    // Allow generate-script without auth for backwards compatibility
    if (pathname === "/api/generate-script") {
      return NextResponse.next()
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Protected pages: redirect to login
  if (!token && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
