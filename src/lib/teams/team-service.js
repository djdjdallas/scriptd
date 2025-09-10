import { createClient } from '../supabase/server';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Team Service - Handles all team-related operations
 */

// Get Supabase client (server-side)
async function getServerClient() {
  return await createClient();
}

// Get Supabase client (client-side)
function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Create a new team
 */
export async function createTeam({ name, description, ownerId, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([
        {
          name,
          description,
          owner_id: ownerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (teamError) {
      throw new Error(`Failed to create team: ${teamError.message}`);
    }

    // Add owner as team member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: team.id,
          user_id: ownerId,
          role: 'owner',
          joined_at: new Date().toISOString(),
        },
      ]);

    if (memberError) {
      // If adding member fails, delete the team to maintain consistency
      await supabase.from('teams').delete().eq('id', team.id);
      throw new Error(`Failed to add owner to team: ${memberError.message}`);
    }

    // Log activity
    await logTeamActivity({
      teamId: team.id,
      userId: ownerId,
      action: 'team_created',
      details: { team_name: name },
      isServerSide,
    });

    return { data: team, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Get user's teams
 */
export async function getUserTeams(userId, isServerSide = false) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        role,
        joined_at,
        teams (
          id,
          name,
          description,
          owner_id,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch teams: ${error.message}`);
    }

    // Transform data to include member count
    const teamsWithMemberCount = await Promise.all(
      data.map(async (item) => {
        const { data: memberCount, error: countError } = await supabase
          .from('team_members')
          .select('id', { count: 'exact' })
          .eq('team_id', item.teams.id);

        return {
          ...item.teams,
          user_role: item.role,
          joined_at: item.joined_at,
          member_count: countError ? 0 : memberCount.length,
        };
      })
    );

    return { data: teamsWithMemberCount, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Get team details by ID
 */
export async function getTeamById(teamId, userId, isServerSide = false) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Check if user is a member of the team
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (membershipError) {
      throw new Error('You do not have access to this team');
    }

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError) {
      throw new Error(`Failed to fetch team: ${teamError.message}`);
    }

    return { data: { ...team, user_role: membership.role }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId, userId, isServerSide = false) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Check if user has access to view members
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (membershipError) {
      throw new Error('You do not have access to this team');
    }

    // Get team members with user details
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        joined_at,
        profiles:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch team members: ${error.message}`);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Invite user to team
 */
export async function inviteUserToTeam({ teamId, email, role, invitedBy, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Check if inviter has permission to invite
    const { data: inviterMembership, error: inviterError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', invitedBy)
      .single();

    if (inviterError || !['owner', 'admin'].includes(inviterMembership.role)) {
      throw new Error('You do not have permission to invite users to this team');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('profiles.email', email)
      .single();

    if (existingMember) {
      throw new Error('User is already a member of this team');
    }

    // Generate invitation token
    const token = crypto.randomUUID();

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .insert([
        {
          team_id: teamId,
          email,
          role,
          token,
          invited_by: invitedBy,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (invitationError) {
      throw new Error(`Failed to create invitation: ${invitationError.message}`);
    }

    // Log activity
    await logTeamActivity({
      teamId,
      userId: invitedBy,
      action: 'member_invited',
      details: { email, role },
      isServerSide,
    });

    return { data: invitation, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Accept team invitation
 */
export async function acceptInvitation({ token, userId, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select(`
        *,
        teams (id, name)
      `)
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError) {
      throw new Error('Invalid or expired invitation');
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Get user profile to verify email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (profileError || profile.email !== invitation.email) {
      throw new Error('Invitation is not for your email address');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', invitation.team_id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      throw new Error('You are already a member of this team');
    }

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: invitation.team_id,
          user_id: userId,
          role: invitation.role,
          joined_at: new Date().toISOString(),
        },
      ]);

    if (memberError) {
      throw new Error(`Failed to add to team: ${memberError.message}`);
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    if (updateError) {
      // Continue even if invitation update fails
      console.error('Failed to update invitation status:', updateError);
    }

    // Log activity
    await logTeamActivity({
      teamId: invitation.team_id,
      userId,
      action: 'member_joined',
      details: { email: invitation.email, role: invitation.role },
      isServerSide,
    });

    return { data: invitation.teams, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Update team member role
 */
export async function updateMemberRole({ teamId, memberId, newRole, updatedBy, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Check if updater has permission
    const { data: updaterMembership, error: updaterError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', updatedBy)
      .single();

    if (updaterError || !['owner', 'admin'].includes(updaterMembership.role)) {
      throw new Error('You do not have permission to update member roles');
    }

    // Get member details
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:user_id (email)
      `)
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single();

    if (memberError) {
      throw new Error('Member not found');
    }

    // Prevent changing owner role (only owner can transfer ownership)
    if (member.role === 'owner' && updaterMembership.role !== 'owner') {
      throw new Error('Only the owner can transfer ownership');
    }

    // Update member role
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (updateError) {
      throw new Error(`Failed to update member role: ${updateError.message}`);
    }

    // Log activity
    await logTeamActivity({
      teamId,
      userId: updatedBy,
      action: 'member_role_updated',
      details: { 
        email: member.profiles.email,
        old_role: member.role,
        new_role: newRole,
      },
      isServerSide,
    });

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Remove team member
 */
export async function removeMember({ teamId, memberId, removedBy, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Check if remover has permission
    const { data: removerMembership, error: removerError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', removedBy)
      .single();

    if (removerError || !['owner', 'admin'].includes(removerMembership.role)) {
      throw new Error('You do not have permission to remove members');
    }

    // Get member details
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:user_id (email)
      `)
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single();

    if (memberError) {
      throw new Error('Member not found');
    }

    // Prevent removing owner (must transfer ownership first)
    if (member.role === 'owner') {
      throw new Error('Cannot remove team owner. Transfer ownership first.');
    }

    // Remove member
    const { error: removeError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (removeError) {
      throw new Error(`Failed to remove member: ${removeError.message}`);
    }

    // Log activity
    await logTeamActivity({
      teamId,
      userId: removedBy,
      action: 'member_removed',
      details: { 
        email: member.profiles.email,
        role: member.role,
      },
      isServerSide,
    });

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Update team settings
 */
export async function updateTeam({ teamId, updates, updatedBy, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Check if user has permission to update team
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', updatedBy)
      .single();

    if (membershipError || !['owner', 'admin'].includes(membership.role)) {
      throw new Error('You do not have permission to update team settings');
    }

    // Update team
    const { data: team, error: updateError } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update team: ${updateError.message}`);
    }

    // Log activity
    await logTeamActivity({
      teamId,
      userId: updatedBy,
      action: 'team_updated',
      details: updates,
      isServerSide,
    });

    return { data: team, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Delete team
 */
export async function deleteTeam({ teamId, deletedBy, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Check if user is the owner
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', deletedBy)
      .single();

    if (membershipError || membership.role !== 'owner') {
      throw new Error('Only team owners can delete teams');
    }

    // Delete team (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (deleteError) {
      throw new Error(`Failed to delete team: ${deleteError.message}`);
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Log team activity (helper function)
 */
async function logTeamActivity({ teamId, userId, action, details, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    await supabase
      .from('team_activity')
      .insert([
        {
          team_id: teamId,
          user_id: userId,
          action,
          details,
          created_at: new Date().toISOString(),
        },
      ]);
  } catch (error) {
    // Don't throw error for activity logging failures
    console.error('Failed to log team activity:', error);
  }
}