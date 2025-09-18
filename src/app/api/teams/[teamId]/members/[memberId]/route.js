import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiHandler } from '@/lib/api-handler'
import { validateSchema } from '@/lib/validators'
import { z } from 'zod'
import { checkTeamPermission } from '@/lib/teams/permissions'

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  permissions: z.array(z.string()).optional()
})

async function requireAuth() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    throw new Error('Unauthorized')
  }
  
  return { session, supabase }
}

export async function PATCH(request, { params }) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth()
    const { teamId, memberId } = params
    const body = await request.json()

    const hasAccess = await checkTeamPermission(supabase, session.user.id, teamId, 'admin')
    if (!hasAccess.allowed) {
      throw new Error(hasAccess.error)
    }

    const validation = validateSchema(body, updateMemberSchema)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const { data: member } = await supabase
      .from('team_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single()

    if (!member) {
      throw new Error('Member not found')
    }

    const { data: team } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', teamId)
      .single()

    if (member.user_id === team.owner_id && body.role !== 'owner') {
      throw new Error('Cannot change the role of the team owner')
    }

    if (body.role === 'owner') {
      throw new Error('Cannot promote to owner. Use transfer ownership instead.')
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', memberId)
      .eq('team_id', teamId)

    if (error) throw error

    await supabase
      .from('team_activity')
      .insert({
        team_id: teamId,
        user_id: session.user.id,
        activity_type: 'member_role_changed',
        entity_type: 'user',
        entity_id: member.user_id,
        details: { 
          old_role: member.role,
          new_role: body.role,
          changed_by: session.user.email
        }
      })

    return NextResponse.json({ 
      message: 'Member updated successfully'
    })
  })
}

export async function DELETE(request, { params }) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth()
    const { teamId, memberId } = params

    const hasAccess = await checkTeamPermission(supabase, session.user.id, teamId, 'admin')
    
    const { data: member } = await supabase
      .from('team_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single()

    if (!member) {
      throw new Error('Member not found')
    }

    const { data: team } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', teamId)
      .single()

    if (member.user_id === team.owner_id) {
      throw new Error('Cannot remove the team owner')
    }

    if (!hasAccess.allowed && member.user_id !== session.user.id) {
      throw new Error('You can only remove yourself or need admin permissions')
    }

    const { error } = await supabase
      .from('team_members')
      .update({
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('team_id', teamId)

    if (error) throw error

    await supabase
      .from('team_activity')
      .insert({
        team_id: teamId,
        user_id: session.user.id,
        activity_type: member.user_id === session.user.id ? 'member_left' : 'member_removed',
        entity_type: 'user',
        entity_id: member.user_id,
        details: { 
          removed_by: session.user.email,
          member_role: member.role
        }
      })

    return NextResponse.json({ 
      message: member.user_id === session.user.id 
        ? 'You have left the team successfully' 
        : 'Member removed successfully'
    })
  })
}