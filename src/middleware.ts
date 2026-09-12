import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/forms', '/workflows', '/explore', '/static'];
const AUTH_COOKIE_NAME = 'postpipe_auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);
  const hasTokenCookie = request.cookies.has('token');
  const isAuthenticated = hasAuthCookie && hasTokenCookie;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    // Clear stale cookies if only one exists
    if (hasAuthCookie && !hasTokenCookie) {
      response.cookies.delete(AUTH_COOKIE_NAME);
    }
    return response;
  }

  if (pathname.startsWith('/login') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Legacy route redirects
  if (pathname === '/forms') {
    return NextResponse.redirect(new URL('/dashboard/forms', request.url));
  }
  if (pathname === '/workflows') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/forms', '/workflows', '/explore', '/static'],
}
