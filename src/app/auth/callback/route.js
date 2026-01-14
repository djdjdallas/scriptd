import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  console.log('[Auth Callback] Starting:', {
    hasCode: !!code,
    next,
    origin,
    appUrl: process.env.NEXT_PUBLIC_APP_URL
  })

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[Auth Callback] Session exchange:', {
      success: !error,
      hasUser: !!data?.user,
      error: error?.message
    })
    
    if (!error && data?.user) {
      // Check if this is a new user
      const { data: userData } = await supabase
        .from('users')
        .select('onboarding_completed, created_at')
        .eq('id', data.user.id)
        .single()

      // Determine redirect URL
      // ONBOARDING DISABLED FOR LAUNCH - Always go to dashboard
      let redirectUrl = next || '/dashboard'

      if (!userData) {
        // Brand new user - create user record
        await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
            onboarding_completed: true, // Skip onboarding for launch
            onboarding_step: 7, // Mark as completed
            onboarding_started_at: new Date().toISOString(),
            onboarding_completed_at: new Date().toISOString()
          })

        // Also create profile record
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url
          })

        // Log onboarding skipped event (optional)
        try {
          await supabase
            .from('onboarding_analytics')
            .insert({
              user_id: data.user.id,
              event_type: 'abandoned',
              metadata: {
                auth_provider: data.user.app_metadata?.provider || 'email',
                referrer: request.headers.get('referer'),
                reason: 'onboarding_disabled_for_launch'
              }
            })
        } catch (e) {
          // Ignore analytics errors
        }

        // redirectUrl = '/onboarding'  // DISABLED
      }
      // else if (!userData.onboarding_completed) {
      //   // Existing user who hasn't completed onboarding
      //   redirectUrl = '/onboarding'  // DISABLED
      // }
      else if (next) {
        // User has completed onboarding, redirect to requested page
        redirectUrl = next
      }

      // Build redirect URL reliably for all environments
      const forwardedHost = request.headers.get('x-forwarded-host')

      const getRedirectUrl = () => {
        if (process.env.NODE_ENV === 'development') {
          return `${origin}${redirectUrl}`
        }

        // Production: use configured app URL (most reliable)
        if (process.env.NEXT_PUBLIC_APP_URL) {
          return `${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}`
        }

        // Fallback: use x-forwarded-host from Vercel/proxy
        if (forwardedHost) {
          return `https://${forwardedHost}${redirectUrl}`
        }

        // Last resort: use origin
        return `${origin}${redirectUrl}`
      }

      const finalRedirectUrl = getRedirectUrl()
      console.log('[Auth Callback] Redirecting:', {
        redirectUrl,
        finalRedirectUrl,
        forwardedHost,
        nodeEnv: process.env.NODE_ENV
      })

      return NextResponse.redirect(finalRedirectUrl)
    }
  }

  // Return the user to an error page with instructions
  const errorBaseUrl = process.env.NEXT_PUBLIC_APP_URL || origin
  return NextResponse.redirect(`${errorBaseUrl}/auth/auth-error`)
}