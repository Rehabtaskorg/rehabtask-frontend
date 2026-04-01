import { NextResponse } from "next/server";

/**
 * Route protection middleware — reads the non-httpOnly `app_role` cookie set by the backend.
 *
 * Rules:
 *  - Auth pages (/login, /register/*) → redirect to dashboard if already authenticated
 *  - /customer/* → requires role === "customer"
 *  - /therapist/* → requires role === "therapist"
 *  - /admin/* → requires role === "admin" | "sub_admin"
 *  - Everything else (public pages, API, static assets) → pass through
 */

const ROLE_DASHBOARDS = {
    customer: "/customer/dashboard",
    therapist: "/therapist/dashboard",
    admin: "/admin/dashboard",
    sub_admin: "/admin/dashboard",
};

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const role = request.cookies.get("app_role")?.value ?? null;

    // --- Auth pages: redirect authenticated users to their dashboard ---
    if (
        pathname === "/login" ||
        pathname.startsWith("/register")
    ) {
        if (role && ROLE_DASHBOARDS[role]) {
            return NextResponse.redirect(
                new URL(ROLE_DASHBOARDS[role], request.url)
            );
        }
        return NextResponse.next();
    }

    // --- Protected: /customer/* ---
    if (pathname.startsWith("/customer")) {
        if (!role) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("next", pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (role !== "customer") {
            return NextResponse.redirect(
                new URL(ROLE_DASHBOARDS[role] ?? "/login", request.url)
            );
        }
        return NextResponse.next();
    }

    // --- Protected: /therapist/* ---
    if (pathname.startsWith("/therapist")) {
        if (!role) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("next", pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (role !== "therapist") {
            return NextResponse.redirect(
                new URL(ROLE_DASHBOARDS[role] ?? "/login", request.url)
            );
        }
        return NextResponse.next();
    }

    // --- Protected: /admin/* ---
    if (pathname.startsWith("/admin")) {
        if (!role) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("next", pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (role !== "admin" && role !== "sub_admin") {
            return NextResponse.redirect(
                new URL(ROLE_DASHBOARDS[role] ?? "/login", request.url)
            );
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         *  - _next/static  (static files)
         *  - _next/image   (image optimisation)
         *  - favicon.ico
         *  - /api/*        (backend proxy — Next.js rewrites, no auth needed at edge)
         *  - public files (images, fonts, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|css|js)$).*)",
    ],
};
