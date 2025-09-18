import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiHandler } from '@/lib/api-handler'

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
    const { token } = params
    const supabase = createRouteHandlerClient({ cookies })

    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        teams (
          id,
          name,
          slug,
          description
        ),
        users!invited_by (
          email,
          full_name
        )
      `)
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (error || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)

    if (now > expiresAt) {
      await supabase
        .from('team_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      throw new Error('This invitation has expired')
    }

    return NextResponse.json({ 
      invitation: {
        id: invitation.id,
        team: invitation.teams,
        role: invitation.role,
        invitedBy: invitation.users,
        expiresAt: invitation.expires_at
      }
    })
  })
}

export async function POST(request, { params }) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth()
    const { token } = params
    const body = await request.json()
    const { action } = body

    if (!['accept', 'decline'].includes(action)) {
      throw new Error('Invalid action. Must be "accept" or "decline"')
    }

    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (error || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)

    if (now > expiresAt) {
      await supabase
        .from('team_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      throw new Error('This invitation has expired')
    }

    if (invitation.invited_email && invitation.invited_email !== session.user.email) {
      throw new Error('This invitation was sent to a different email address')
    }

    if (action === 'accept') {
      const { data: team } = await supabase
        .from('teams')
        .select('max_members')
        .eq('id', invitation.team_id)
        .single()

      const { data: currentMembers } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', invitation.team_id)
        .eq('is_active', true)

      if (currentMembers && currentMembers.length >= team.max_members) {
        throw new Error('This team has reached its member limit')
      }

      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id, is_active')
        .eq('team_id', invitation.team_id)
        .eq('user_id', session.user.id)
        .single()

      if (existingMember && existingMember.is_active) {
        throw new Error('You are already a member of this team')
      }

      if (existingMember) {
        await supabase
          .from('team_members')
          .update({
            is_active: true,
            role: invitation.role,
            joined_at: new Date().toISOString()
          })
          .eq('id', existingMember.id)
      } else {
        await supabase
          .from('team_members')
          .insert({
            team_id: invitation.team_id,
            user_id: session.user.id,
            role: invitation.role,
            permissions: getDefaultPermissions(invitation.role)
          })
      }

      await supabase
        .from('team_invitations')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
          invited_user_id: session.user.id
        })
        .eq('id', invitation.id)

      await supabase
        .from('team_activity')
        .insert({
          team_id: invitation.team_id,
          user_id: session.user.id,
          activity_type: 'invitation_accepted',
          details: { 
            invited_by: invitation.invited_by,
            role: invitation.role
          }
        })

      return NextResponse.json({ 
        message: 'Successfully joined the team',
        teamId: invitation.team_id
      })
    } else {
      await supabase
        .from('team_invitations')
        .update({
          status: 'declined',
          responded_at: new Date().toISOString(),
          invited_user_id: session.user.id
        })
        .eq('id', invitation.id)

      await supabase
        .from('team_activity')
        .insert({
          team_id: invitation.team_id,
          user_id: invitation.invited_by,
          activity_type: 'invitation_declined',
          details: { 
            declined_by: session.user.email || invitation.invited_email
          }
        })

      return NextResponse.json({ 
        message: 'Invitation declined'
      })
    }
  })
}

function getDefaultPermissions(role) {
  const permissions = {
    owner: ['all'],
    admin: ['manage_members', 'manage_settings', 'manage_scripts', 'read', 'write'],
    editor: ['manage_own_scripts', 'read', 'write'],
    viewer: ['read']
  }
  return permissions[role] || ['read']
}