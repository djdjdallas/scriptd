import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request) {
  // Update the session
  const response = await updateSession(request)

  // Protected routes
  const protectedRoutes = ['/scripts', '/channels', '/research', '/settings', '/billing']
  const authRoutes = ['/login', '/signup']
  const pathname = request.nextUrl.pathname

  // Skip middleware for auth callback
  if (pathname.startsWith('/auth/callback')) {
    return response
  }

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Check for Supabase auth cookies (they start with sb-)
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(cookie => 
    cookie.name.startsWith('sb-') && 
    cookie.name.includes('auth-token')
  )

  // Redirect logic
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/scripts', request.url))
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