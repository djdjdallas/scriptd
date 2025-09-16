import { createBrowserClient } from '@supabase/ssr';

/**
 * Activity Logger Client - Client-side activity logging for teams
 */

// Get Supabase client (client-side)
function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Get team activities (client-side only)
 */
export async function getTeamActivities(teamId, limit = 20) {
  try {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('team_activity')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch team activities: ${error.message}`);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Log team activity (client-side only)
 */
export async function logTeamActivity({
  teamId,
  userId,
  action,
  details
}) {
  try {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('team_activity')
      .insert([
        {
          team_id: teamId,
          user_id: userId,
          action,
          details,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log activity: ${error.message}`);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Get user's recent team activities (client-side only)
 */
export async function getUserTeamActivities(userId, limit = 10) {
  try {
    const supabase = getBrowserClient();
    
    // First, get user's teams
    const { data: teams, error: teamsError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (teamsError) {
      throw new Error(`Failed to fetch user teams: ${teamsError.message}`);
    }

    const teamIds = teams.map(t => t.team_id);

    if (teamIds.length === 0) {
      return { data: [], error: null };
    }

    // Get activities from user's teams
    const { data, error } = await supabase
      .from('team_activity')
      .select(`
        *,
        teams:team_id (
          id,
          name
        ),
        profiles:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .in('team_id', teamIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch user team activities: ${error.message}`);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Format activity message for display
 */
export function formatActivityMessage(activity) {
  const actor = activity.profiles?.full_name || activity.profiles?.email || 'Someone';
  
  switch (activity.action) {
    case 'team_created':
      return `${actor} created the team`;
    
    case 'team_updated':
      const fields = Object.keys(activity.details || {}).join(', ');
      return `${actor} updated team ${fields}`;
    
    case 'member_invited':
      return `${actor} invited ${activity.details?.email} as ${activity.details?.role}`;
    
    case 'member_joined':
      return `${actor} joined the team as ${activity.details?.role}`;
    
    case 'member_role_updated':
      return `${actor} changed ${activity.details?.email}'s role from ${activity.details?.old_role} to ${activity.details?.new_role}`;
    
    case 'member_removed':
      return `${actor} removed ${activity.details?.email} from the team`;
    
    case 'member_left':
      return `${actor} left the team`;
    
    case 'script_created':
      return `${actor} created script "${activity.details?.title}"`;
    
    case 'script_updated':
      return `${actor} updated script "${activity.details?.title}"`;
    
    case 'script_deleted':
      return `${actor} deleted script "${activity.details?.title}"`;
    
    case 'script_published':
      return `${actor} published script "${activity.details?.title}"`;
    
    case 'script_shared':
      return `${actor} shared script "${activity.details?.title}" with the team`;
    
    case 'ownership_transferred':
      return `${actor} transferred ownership to ${activity.details?.new_owner}`;
    
    default:
      return `${actor} performed ${activity.action}`;
  }
}

/**
 * Get activity icon based on action type
 */
export function getActivityIcon(action) {
  const iconMap = {
    'team_created': 'Users',
    'team_updated': 'Settings',
    'member_invited': 'UserPlus',
    'member_joined': 'UserCheck',
    'member_role_updated': 'Shield',
    'member_removed': 'UserMinus',
    'member_left': 'UserX',
    'script_created': 'FilePlus',
    'script_updated': 'FileEdit',
    'script_deleted': 'FileX',
    'script_published': 'Send',
    'script_shared': 'Share2',
    'ownership_transferred': 'Crown',
  };

  return iconMap[action] || 'Activity';
}

/**
 * Get activity color based on action type
 */
export function getActivityColor(action) {
  const colorMap = {
    'team_created': 'text-green-600',
    'team_updated': 'text-blue-600',
    'member_invited': 'text-indigo-600',
    'member_joined': 'text-green-600',
    'member_role_updated': 'text-orange-600',
    'member_removed': 'text-red-600',
    'member_left': 'text-gray-600',
    'script_created': 'text-green-600',
    'script_updated': 'text-blue-600',
    'script_deleted': 'text-red-600',
    'script_published': 'text-purple-600',
    'script_shared': 'text-indigo-600',
    'ownership_transferred': 'text-yellow-600',
  };

  return colorMap[action] || 'text-gray-600';
}