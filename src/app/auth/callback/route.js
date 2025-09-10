import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Check if this is a new user
      const { data: userData } = await supabase
        .from('users')
        .select('onboarding_completed, created_at')
        .eq('id', data.user.id)
        .single()

      // Determine redirect URL
      let redirectUrl = '/dashboard'
      
      if (!userData) {
        // Brand new user - create user record
        await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
            onboarding_completed: false,
            onboarding_step: 0,
            onboarding_started_at: new Date().toISOString()
          })

        // Also create profile record
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url
          })

        // Log onboarding start event
        await supabase
          .from('onboarding_analytics')
          .insert({
            user_id: data.user.id,
            event_type: 'started',
            metadata: {
              auth_provider: data.user.app_metadata?.provider || 'email',
              referrer: request.headers.get('referer')
            }
          })

        redirectUrl = '/onboarding'
      } else if (!userData.onboarding_completed) {
        // Existing user who hasn't completed onboarding
        redirectUrl = '/onboarding'
      } else if (next) {
        // User has completed onboarding, redirect to requested page
        redirectUrl = next
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}