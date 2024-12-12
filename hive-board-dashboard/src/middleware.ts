import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export function middleware(request: NextRequest) {
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  const token = cookies().get("token")?.value;

  try {
    // Handle public routes
    if (isPublicRoute && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!token && !isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // TODO: Add token verification
    // const isValidToken = await verifyToken(token);
    // if (!isValidToken) {
    //   cookies().delete("token");
    //   return NextResponse.redirect(new URL("/login", request.url));
    // }

    return NextResponse.next();
  } catch (error) {
    // Handle any errors during token verification
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
