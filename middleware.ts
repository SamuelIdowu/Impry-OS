import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Define protected and auth routes
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
    
    const sessionCookie = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && sessionCookie) {
        return NextResponse.redirect(new URL("/workspaces", request.url));
    }

    // Extract workspace ID from UUID pattern in path: e.g. /123e4567-e89b-12d3-a456-426614174000/dashboard
    const workspaceIdMatch = pathname.match(/^\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:\/|$)/);
    const workspaceId = workspaceIdMatch ? workspaceIdMatch[1] : null;

    // Define public routes that unauthenticated users can access
    const isPublicRoute =
        pathname === "/" ||
        pathname.startsWith("/public") ||
        pathname.startsWith("/legal") ||
        pathname.startsWith("/privacy") ||
        pathname.startsWith("/terms") ||
        pathname.startsWith("/cookies") ||
        pathname.startsWith("/security") ||
        pathname.startsWith("/scope/share") ||
        pathname.startsWith("/invite") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/verify-email") ||
        pathname.startsWith("/api/webhooks") ||
        pathname.startsWith("/api/auth");

    // We consider it a protected route if it's not an auth route and not a public route
    const isProtectedRoute = !isAuthRoute && !isPublicRoute;

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !sessionCookie) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // If it's a workspace route, pass the workspace ID in the headers
    if (workspaceId) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-workspace-id', workspaceId);
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
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
