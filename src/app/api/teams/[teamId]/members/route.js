import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiHandler } from '@/lib/api-handler'
import { validateSchema } from '@/lib/validators'
import { z } from 'zod'
import { checkTeamPermission } from '@/lib/teams/permissions'
import { emailService } from '@/lib/email/email-service'

const addMemberSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'editor', 'viewer'])
}).refine(data => data.userId || data.email, {
  message: 'Either userId or email must be provided'
})

const updateMemberSchema = z.object({
  role: z.enum(['owner', 'admin', 'editor', 'viewer'])
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

    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        *,
        users (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('joined_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ 
      members,
      count: members.length
    })
  })
}

export async function POST(request, { params }) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth()
    const { teamId } = params
    const body = await request.json()

    const hasAccess = await checkTeamPermission(supabase, session.user.id, teamId, 'admin')
    if (!hasAccess.allowed) {
      throw new Error(hasAccess.error)
    }

    const validation = validateSchema(body, addMemberSchema)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    const { data: team } = await supabase
      .from('teams')
      .select('max_members, subscription_tier')
      .eq('id', teamId)
      .single()

    const { data: currentMembers } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('is_active', true)

    if (currentMembers && currentMembers.length >= team.max_members) {
      throw new Error(`Team member limit reached (${team.max_members} members for ${team.subscription_tier} plan)`)
    }

    let targetUserId = body.userId

    if (!targetUserId && body.email) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', body.email)
        .single()

      if (user) {
        targetUserId = user.id
      }
    }

    if (targetUserId) {
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id, is_active')
        .eq('team_id', teamId)
        .eq('user_id', targetUserId)
        .single()

      if (existingMember) {
        if (existingMember.is_active) {
          throw new Error('User is already a member of this team')
        } else {
          const { error } = await supabase
            .from('team_members')
            .update({
              is_active: true,
              role: body.role,
              joined_at: new Date().toISOString()
            })
            .eq('id', existingMember.id)

          if (error) throw error

          await supabase
            .from('team_activity')
            .insert({
              team_id: teamId,
              user_id: session.user.id,
              activity_type: 'member_rejoined',
              entity_type: 'user',
              entity_id: targetUserId,
              details: { role: body.role }
            })

          return NextResponse.json({ 
            message: 'Member rejoined successfully',
            memberId: existingMember.id
          })
        }
      }

      const { data: member, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: targetUserId,
          role: body.role,
          permissions: getDefaultPermissions(body.role)
        })
        .select()
        .single()

      if (error) throw error

      await supabase
        .from('team_activity')
        .insert({
          team_id: teamId,
          user_id: session.user.id,
          activity_type: 'member_added',
          entity_type: 'user',
          entity_id: targetUserId,
          details: { role: body.role, added_by: session.user.email }
        })

      return NextResponse.json({ 
        member,
        message: 'Member added successfully'
      }, { status: 201 })
    } else {
      const inviteToken = generateInviteToken()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { data: invitation, error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          invited_email: body.email,
          role: body.role,
          invited_by: session.user.id,
          token: inviteToken,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      await supabase
        .from('team_activity')
        .insert({
          team_id: teamId,
          user_id: session.user.id,
          activity_type: 'invitation_sent',
          details: { 
            email: body.email, 
            role: body.role,
            expires_at: expiresAt.toISOString()
          }
        })

      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/teams/invite/${inviteToken}`

      const { data: inviter } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', session.user.id)
        .single()

      const { data: teamData } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single()

      await emailService.sendTeamInvitation({
        email: body.email,
        inviterName: inviter?.full_name || inviter?.email || 'A team member',
        teamName: teamData?.name || 'the team',
        inviteLink,
        role: body.role
      })

      return NextResponse.json({ 
        invitation,
        message: 'Invitation sent successfully',
        inviteLink
      }, { status: 201 })
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

function generateInviteToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}