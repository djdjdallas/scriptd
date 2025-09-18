import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiHandler } from '@/lib/api-handler'
import { validateSchema } from '@/lib/validators'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limiter'

const createTeamSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
})

async function requireAuth(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    throw new Error('Unauthorized')
  }
  
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitResult = await checkRateLimit(ip, 'team-operations', 30, 60000)
  
  if (!rateLimitResult.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds`)
  }
  
  return { session, supabase }
}

export async function GET(request) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth(request)
    
    const { data: teams, error } = await supabase
      .from('team_members')
      .select(`
        team_id,
        role,
        joined_at,
        is_active,
        teams (
          id,
          name,
          slug,
          description,
          subscription_tier,
          max_members,
          created_at,
          owner_id,
          is_active
        )
      `)
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    if (error) throw error

    const formattedTeams = teams
      .filter(tm => tm.teams && tm.teams.is_active)
      .map(tm => ({
        ...tm.teams,
        memberRole: tm.role,
        joinedAt: tm.joined_at,
        isOwner: tm.teams.owner_id === session.user.id
      }))

    return NextResponse.json({ 
      teams: formattedTeams,
      count: formattedTeams.length 
    })
  })
}

export async function POST(request) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth(request)
    const body = await request.json()
    
    const validation = validateSchema(body, createTeamSchema)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const { name, description, slug } = body

    const { data: existingSlug } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      throw new Error('A team with this slug already exists')
    }

    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', session.user.id)
      .eq('role', 'owner')
      
    if (userTeams && userTeams.length >= 5) {
      throw new Error('You can only own up to 5 teams')
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name,
        description: description || null,
        slug,
        owner_id: session.user.id,
        subscription_tier: 'free',
        max_members: 3
      })
      .select()
      .single()

    if (teamError) throw teamError

    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: session.user.id,
        role: 'owner',
        permissions: ['all']
      })

    if (memberError) {
      await supabase.from('teams').delete().eq('id', team.id)
      throw memberError
    }

    const { error: settingsError } = await supabase
      .from('team_settings')
      .insert({
        team_id: team.id,
        auto_save_enabled: true,
        script_retention_days: 30,
        notification_preferences: {
          new_member: true,
          script_shared: true,
          billing_alerts: true
        }
      })

    if (settingsError) {
      console.error('Failed to create team settings:', settingsError)
    }

    await supabase
      .from('team_activity')
      .insert({
        team_id: team.id,
        user_id: session.user.id,
        activity_type: 'team_created',
        details: { team_name: name }
      })

    return NextResponse.json({ 
      team,
      message: 'Team created successfully'
    }, { status: 201 })
  })
}