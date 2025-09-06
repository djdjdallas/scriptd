import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/scripts',
  '/channels',
  '/research',
  '/voice',
  '/analytics',
  '/credits',
  '/settings'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Add debug logging to track middleware execution
  console.log(`[Middleware] Processing: ${pathname} at ${new Date().toISOString()}`);

  try {
    // CRITICAL: Always update the session to keep cookies fresh
    const response = await updateSession(request);
    
    // Check if this is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname === route);
    
    // Get auth status from the response cookies
    const authToken = request.cookies.get('sb-access-token');
    const hasAuth = !!authToken?.value;
    
    console.log(`[Middleware] Auth status: ${hasAuth ? 'authenticated' : 'not authenticated'}`);
    
    // Handle protected routes
    if (isProtectedRoute && !hasAuth) {
      console.log(`[Middleware] Redirecting to /login from protected route: ${pathname}`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      
      // IMPORTANT: Return redirect response, not just NextResponse.redirect
      return NextResponse.redirect(loginUrl);
    }
    
    // Handle authenticated users on public routes (optional - prevents logged in users from seeing login page)
    if (isPublicRoute && hasAuth && (pathname === '/login' || pathname === '/signup')) {
      console.log(`[Middleware] Redirecting authenticated user from ${pathname} to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // CRITICAL: Always return the response from updateSession
    // This ensures cookies are properly set
    return response;
    
  } catch (error) {
    console.error('[Middleware] Error:', error);
    
    // IMPORTANT: Always return a response, even on error
    // This prevents the infinite loop
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     * - .well-known (for various services)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|xml|txt|pdf)$|.well-known).*)',
  ],
};