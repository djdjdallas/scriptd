import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request) {
  // Update the session
  const response = await updateSession(request)

  // Protected routes
  const protectedRoutes = ['/dashboard', '/scripts', '/channels', '/research', '/settings']
  const authRoutes = ['/login', '/signup', '/auth']
  const pathname = request.nextUrl.pathname

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Get the session from the response cookies
  const sessionCookie = response.cookies.get('sb-auth-token')
  const hasSession = !!sessionCookie?.value

  // Redirect logic
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}