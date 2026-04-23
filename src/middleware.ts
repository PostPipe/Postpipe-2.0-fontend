import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Existing constants
const PROTECTED_ROUTES = ['/dashboard', '/forms', '/workflows', '/explore', '/static'];
const AUTH_COOKIE_NAME = 'postpipe_auth';

// NEW: Protected Admin routes
const ADMIN_ROUTES = ['/dashboard/team', '/dashboard/settings/security']; 

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. ORIGINAL AUTH CHECK (Hack removed, back to normal)
  const isAuthenticated = request.cookies.has(AUTH_COOKIE_NAME);

  // 2. Get the user's role for RBAC
  const userRole = (request.cookies.get('postpipe_role')?.value || 'viewer').toLowerCase();

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // If trying to access a protected route without being logged in
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in but trying to go to login page
  if (pathname.startsWith('/login') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Existing Legacy Route Redirects
  if (pathname === '/forms') {
    return NextResponse.redirect(new URL('/dashboard/forms', request.url));
  }
  if (pathname === '/workflows') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. NEW: RBAC Authorization Check
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  
 if (isAdminRoute && userRole !== 'admin' && userRole !== 'owner') {
    return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/forms', '/workflows', '/explore', '/static'],
}
