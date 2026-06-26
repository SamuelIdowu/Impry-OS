import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Define protected and auth routes
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/clients") ||
        pathname.startsWith("/projects") ||
        pathname.startsWith("/settings");

    if (!isAuthRoute && !isProtectedRoute) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && sessionCookie) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !sessionCookie) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         * - api/auth (better auth endpoints)
         */
        "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
