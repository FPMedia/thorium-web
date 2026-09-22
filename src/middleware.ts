import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPrefetchRequest(request: NextRequest): boolean {
  return (
    request.headers.get("Next-Router-Prefetch") === "1" ||
    request.headers.get("x-middleware-prefetch") === "1" ||
    request.headers.get("Purpose") === "prefetch"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (login, signup, home)
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return NextResponse.next();
  }

  // Protect /read/* routes
  if (pathname.startsWith("/read/")) {
    const authToken = request.cookies.get("__session");

    if (!authToken?.value) {
      // Prefetching a protected route must not cache a login redirect.
      // Otherwise clicking "Read" after sign-in replays the cached /login navigation.
      if (isPrefetchRequest(request)) {
        return new NextResponse(null, { status: 204 });
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
