import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/monitoring/logger'

export async function middleware(request) {
  const start = Date.now()
  const pathname = request.nextUrl.pathname
  const method = request.method
  
  // Update the session
  let response = await updateSession(request)

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Protected routes
  const protectedRoutes = ['/scripts', '/channels', '/research', '/settings', '/billing', '/dashboard', '/teams', '/admin']
  const authRoutes = ['/login', '/signup']

  // Skip middleware for auth callback
  if (pathname.startsWith('/auth/callback')) {
    return response
  }

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

  // Check for Supabase auth cookies (they start with sb-)
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(cookie => 
    cookie.name.startsWith('sb-') && 
    cookie.name.includes('auth-token')
  )

  // Redirect logic for unauthenticated users
  if ((isProtectedRoute || isOnboardingRoute) && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && hasSession) {
    // Check if user needs onboarding
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get user's onboarding status
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        // Redirect to onboarding if not completed
        if (!userData?.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check onboarding status for protected routes
  if (isProtectedRoute && hasSession && !isOnboardingRoute) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        // Redirect to onboarding if not completed (except for certain routes)
        const skipOnboardingRoutes = ['/settings', '/billing']
        const shouldSkipOnboarding = skipOnboardingRoutes.some(route => pathname.startsWith(route))
        
        if (!userData?.onboarding_completed && !shouldSkipOnboarding) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  // Prevent access to onboarding if already completed
  if (isOnboardingRoute && hasSession) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (userData?.onboarding_completed) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
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
     * - api routes (now handled in middleware)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}