import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { logger } from '@/lib/monitoring/logger'

export async function middleware(request) {
  try {
    const start = Date.now()
    const pathname = request.nextUrl.pathname
    const method = request.method

    // Normalize trailing slashes to prevent duplicate URLs in search engines
    if (pathname !== '/' && pathname.endsWith('/') && !pathname.startsWith('/ingest')) {
      const url = request.nextUrl.clone()
      url.pathname = pathname.slice(0, -1)
      return NextResponse.redirect(url, 308)
    }

    // Protected routes
    const protectedRoutes = ['/scripts', '/channels', '/research', '/settings', '/billing', '/dashboard', '/teams', '/admin']
    const authRoutes = ['/login', '/signup']

    // Skip middleware for auth callback
    if (pathname.startsWith('/auth/callback')) {
      const { response } = await updateSession(request)
      return response
    }

    // Update session and get user in one call
    const { response, user, error } = await updateSession(request)

    // Add monitoring for API routes
    if (pathname.startsWith('/api/')) {
      const ip = request.headers.get('x-forwarded-for') || 'unknown'

      // Add request ID header
      response.headers.set('X-Request-ID', crypto.randomUUID())
      response.headers.set('X-Response-Time', `${Date.now() - start}ms`)

      // Log API requests in production
      if (process.env.NODE_ENV === 'production') {
        logger.info('API request', {
          pathname,
          method,
          ip,
          userAgent: request.headers.get('user-agent'),
        })
      }

      return response
    }

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    const isOnboardingRoute = pathname.startsWith('/onboarding')

    // Validate session
    const hasValidSession = !!user && !error

    // Redirect logic for unauthenticated users
    if ((isProtectedRoute || isOnboardingRoute) && !hasValidSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && hasValidSession) {
      // ONBOARDING DISABLED FOR LAUNCH - Skip onboarding checks
      // Check if user needs onboarding
      // try {
      //   const { data: { user } } = await supabase.auth.getUser()
      //
      //   if (user) {
      //     // Get user's onboarding status
      //     const { data: userData } = await supabase
      //       .from('users')
      //       .select('onboarding_completed')
      //       .eq('id', user.id)
      //       .single()
      //
      //     // Redirect to onboarding if not completed
      //     if (!userData?.onboarding_completed) {
      //       return NextResponse.redirect(new URL('/onboarding', request.url))
      //     }
      //   }
      // } catch (error) {
      //   console.error('Error checking onboarding status:', error)
      // }

      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check onboarding status for protected routes
    // ONBOARDING DISABLED FOR LAUNCH - Skip onboarding checks
    // if (isProtectedRoute && hasSession && !isOnboardingRoute) {
    //   try {
    //     const { data: { user } } = await supabase.auth.getUser()
    //
    //     if (user) {
    //       const { data: userData } = await supabase
    //         .from('users')
    //         .select('onboarding_completed')
    //         .eq('id', user.id)
    //         .single()
    //
    //       // Redirect to onboarding if not completed (except for certain routes)
    //       const skipOnboardingRoutes = ['/settings', '/billing']
    //       const shouldSkipOnboarding = skipOnboardingRoutes.some(route => pathname.startsWith(route))
    //
    //       if (!userData?.onboarding_completed && !shouldSkipOnboarding) {
    //         return NextResponse.redirect(new URL('/onboarding', request.url))
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error checking onboarding status:', error)
    //   }
    // }

    // Prevent access to onboarding if already completed
    // ONBOARDING DISABLED FOR LAUNCH - Redirect all onboarding attempts to dashboard
    if (isOnboardingRoute && hasValidSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // if (isOnboardingRoute && hasSession) {
    //   try {
    //     const { data: { user } } = await supabase.auth.getUser()
    //
    //     if (user) {
    //       const { data: userData } = await supabase
    //         .from('users')
    //         .select('onboarding_completed')
    //         .eq('id', user.id)
    //         .single()
    //
    //       if (userData?.onboarding_completed) {
    //         return NextResponse.redirect(new URL('/dashboard', request.url))
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error checking onboarding status:', error)
    //   }
    // }

    return response
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error)
    // Return a basic response to prevent middleware from crashing
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (now handled in middleware)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}