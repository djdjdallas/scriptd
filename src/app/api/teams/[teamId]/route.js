import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiHandler } from '@/lib/api-handler'
import { validateSchema } from '@/lib/validators'
import { z } from 'zod'
import { checkTeamPermission } from '@/lib/teams/permissions'

const updateTeamSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
})

async function requireAuth() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    throw new Error('Unauthorized')
  }
  
  return { session, supabase }
}

export async function GET(request, { params }) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth()
    const { teamId } = params

    const hasAccess = await checkTeamPermission(supabase, session.user.id, teamId, 'read')
    if (!hasAccess.allowed) {
      throw new Error(hasAccess.error)
    }

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          user_id,
          role,
          joined_at,
          last_active,
          permissions,
          users (
            id,
            email,
            full_name,
            avatar_url
          )
        ),
        team_settings (
          auto_save_enabled,
          script_retention_days,
          notification_preferences
        )
      `)
      .eq('id', teamId)
      .single()

    if (error) throw error

    const { data: stats } = await supabase
      .rpc('get_team_stats', { team_id_param: teamId })

    return NextResponse.json({ 
      team: {
        ...team,
        memberRole: hasAccess.memberRole,
        stats
      }
    })
  })
}

export async function PATCH(request, { params }) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth()
    const { teamId } = params
    const body = await request.json()

    const hasAccess = await checkTeamPermission(supabase, session.user.id, teamId, 'admin')
    if (!hasAccess.allowed) {
      throw new Error(hasAccess.error)
    }

    const validation = validateSchema(body, updateTeamSchema)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    if (body.slug) {
      const { data: existingSlug } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', teamId)
        .single()

      if (existingSlug) {
        throw new Error('A team with this slug already exists')
      }
    }

    const { data: team, error } = await supabase
      .from('teams')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single()

    if (error) throw error

    await supabase
      .from('team_activity')
      .insert({
        team_id: teamId,
        user_id: session.user.id,
        activity_type: 'team_updated',
        details: { 
          fields_updated: Object.keys(body),
          updated_by_role: hasAccess.memberRole
        }
      })

    return NextResponse.json({ 
      team,
      message: 'Team updated successfully'
    })
  })
}

export async function DELETE(request, { params }) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth()
    const { teamId } = params

    const hasAccess = await checkTeamPermission(supabase, session.user.id, teamId, 'owner')
    if (!hasAccess.allowed) {
      throw new Error('Only team owners can delete teams')
    }

    const { data: scripts } = await supabase
      .from('scripts')
      .select('id')
      .eq('team_id', teamId)
      .eq('is_team_script', true)

    if (scripts && scripts.length > 0) {
      throw new Error('Cannot delete team with existing scripts. Please delete all scripts first.')
    }

    const { error } = await supabase
      .from('teams')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', teamId)

    if (error) throw error

    await supabase
      .from('team_activity')
      .insert({
        team_id: teamId,
        user_id: session.user.id,
        activity_type: 'team_deleted',
        details: {}
      })

    return NextResponse.json({ 
      message: 'Team deleted successfully'
    })
  })
}