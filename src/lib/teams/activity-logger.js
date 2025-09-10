import { createClient } from '../supabase/server';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Activity Logger - Logs team activities for audit and display purposes
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

// Activity types and their display configurations
export const ACTIVITY_TYPES = {
  // Team activities
  team_created: {
    icon: '🎉',
    color: 'text-green-600',
    format: (details) => `created the team "${details.team_name}"`,
  },
  team_updated: {
    icon: '⚙️',
    color: 'text-blue-600',
    format: (details) => {
      const changes = Object.keys(details).filter(key => key !== 'updated_at');
      return `updated team settings (${changes.join(', ')})`;
    },
  },
  team_deleted: {
    icon: '🗑️',
    color: 'text-red-600',
    format: () => 'deleted the team',
  },
  
  // Member activities
  member_invited: {
    icon: '📧',
    color: 'text-blue-600',
    format: (details) => `invited ${details.email} as ${details.role}`,
  },
  member_joined: {
    icon: '👋',
    color: 'text-green-600',
    format: (details) => `${details.email} joined as ${details.role}`,
  },
  member_left: {
    icon: '👋',
    color: 'text-yellow-600',
    format: (details) => `${details.email} left the team`,
  },
  member_removed: {
    icon: '❌',
    color: 'text-red-600',
    format: (details) => `removed ${details.email} (${details.role})`,
  },
  member_role_updated: {
    icon: '🔄',
    color: 'text-blue-600',
    format: (details) => `changed ${details.email}'s role from ${details.old_role} to ${details.new_role}`,
  },
  ownership_transferred: {
    icon: '👑',
    color: 'text-purple-600',
    format: (details) => `transferred ownership to ${details.new_owner_email}`,
  },
  
  // Script activities
  script_created: {
    icon: '📝',
    color: 'text-green-600',
    format: (details) => `created script "${details.script_title}"`,
  },
  script_updated: {
    icon: '✏️',
    color: 'text-blue-600',
    format: (details) => `updated script "${details.script_title}"`,
  },
  script_deleted: {
    icon: '🗑️',
    color: 'text-red-600',
    format: (details) => `deleted script "${details.script_title}"`,
  },
  script_exported: {
    icon: '📤',
    color: 'text-blue-600',
    format: (details) => `exported script "${details.script_title}" as ${details.format}`,
  },
  
  // Collaboration activities
  script_shared: {
    icon: '🔗',
    color: 'text-blue-600',
    format: (details) => `shared script "${details.script_title}" with team`,
  },
  comment_added: {
    icon: '💬',
    color: 'text-gray-600',
    format: (details) => `commented on script "${details.script_title}"`,
  },
};

/**
 * Log a team activity
 */
export async function logActivity({ teamId, userId, action, details = {}, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    const { error } = await supabase
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

    if (error) {
      console.error('Failed to log activity:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to log activity:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get team activity feed
 */
export async function getTeamActivity({ teamId, userId, limit = 50, offset = 0, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Check if user has access to the team
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (membershipError) {
      throw new Error('You do not have access to this team');
    }

    // Get activity with user profiles
    const { data, error } = await supabase
      .from('team_activity')
      .select(`
        id,
        action,
        details,
        created_at,
        profiles:user_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch activity: ${error.message}`);
    }

    // Format activities for display
    const formattedActivities = data.map(activity => ({
      ...activity,
      ...formatActivity(activity),
    }));

    return { data: formattedActivities, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Get activity for a specific user
 */
export async function getUserActivity({ userId, limit = 20, offset = 0, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    const { data, error } = await supabase
      .from('team_activity')
      .select(`
        id,
        action,
        details,
        created_at,
        teams:team_id (
          id,
          name
        ),
        profiles:user_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch user activity: ${error.message}`);
    }

    // Format activities for display
    const formattedActivities = data.map(activity => ({
      ...activity,
      ...formatActivity(activity),
    }));

    return { data: formattedActivities, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Format activity for display
 */
function formatActivity(activity) {
  const config = ACTIVITY_TYPES[activity.action];
  
  if (!config) {
    return {
      icon: '📋',
      color: 'text-gray-600',
      message: `performed action: ${activity.action}`,
    };
  }

  return {
    icon: config.icon,
    color: config.color,
    message: config.format(activity.details || {}),
  };
}

/**
 * Get activity statistics for a team
 */
export async function getActivityStats({ teamId, userId, days = 30, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    // Check if user has access to the team
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (membershipError) {
      throw new Error('You do not have access to this team');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get activity counts by type
    const { data: activityData, error: activityError } = await supabase
      .from('team_activity')
      .select('action, created_at')
      .eq('team_id', teamId)
      .gte('created_at', startDate.toISOString());

    if (activityError) {
      throw new Error(`Failed to fetch activity stats: ${activityError.message}`);
    }

    // Process the data
    const stats = {
      total: activityData.length,
      byType: {},
      byDay: {},
      mostActive: {},
    };

    // Count by activity type
    activityData.forEach(activity => {
      stats.byType[activity.action] = (stats.byType[activity.action] || 0) + 1;
      
      // Count by day
      const day = activity.created_at.split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    // Get most active members
    const { data: memberActivity, error: memberError } = await supabase
      .from('team_activity')
      .select(`
        user_id,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('team_id', teamId)
      .gte('created_at', startDate.toISOString());

    if (!memberError && memberActivity) {
      const memberCounts = {};
      memberActivity.forEach(activity => {
        const userId = activity.user_id;
        memberCounts[userId] = (memberCounts[userId] || 0) + 1;
      });

      // Get top 5 most active members
      const topMembers = Object.entries(memberCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => {
          const member = memberActivity.find(a => a.user_id === userId);
          return {
            userId,
            count,
            name: member?.profiles?.full_name || member?.profiles?.email || 'Unknown',
          };
        });

      stats.mostActive = topMembers;
    }

    return { data: stats, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Bulk log multiple activities (for batch operations)
 */
export async function logBulkActivity({ teamId, activities, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    const formattedActivities = activities.map(activity => ({
      team_id: teamId,
      user_id: activity.userId,
      action: activity.action,
      details: activity.details || {},
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('team_activity')
      .insert(formattedActivities);

    if (error) {
      console.error('Failed to log bulk activities:', error);
      return { success: false, error: error.message };
    }

    return { success: true, count: activities.length };
  } catch (error) {
    console.error('Failed to log bulk activities:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete old activity records (cleanup function)
 */
export async function cleanupOldActivity({ teamId, daysToKeep = 365, isServerSide = false }) {
  try {
    const supabase = isServerSide ? await getServerClient() : getBrowserClient();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('team_activity')
      .delete()
      .eq('team_id', teamId)
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Failed to cleanup old activity:', error);
      return { success: false, error: error.message };
    }

    return { success: true, deletedCount: data?.length || 0 };
  } catch (error) {
    console.error('Failed to cleanup old activity:', error);
    return { success: false, error: error.message };
  }
}