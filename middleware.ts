import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Define protected and auth routes
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/clients") ||
        pathname.startsWith("/projects") ||
        pathname.startsWith("/settings");

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && user) {
        const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
        // Copy cookies from supabaseResponse (which might have refreshed session) to the redirect response
        const cookiesToSet = supabaseResponse.cookies.getAll();
        cookiesToSet.forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
        });
        return redirectResponse;
    }

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !user) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
