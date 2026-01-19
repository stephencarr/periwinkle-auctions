import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

/**
 * Protected route patterns
 */
const protectedRoutes = [
    '/dashboard',
    '/auctions/create',
];

const adminRoutes = [
    '/admin',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route requires authentication
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    const isAdminRoute = adminRoutes.some(route =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute || isAdminRoute) {
        const session = await auth();

        // Redirect to login if not authenticated
        if (!session?.user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check admin access
        if (isAdminRoute && session.user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/auctions/create',
        '/admin/:path*',
    ],
};
