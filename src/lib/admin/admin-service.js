import { createClient } from '@/lib/supabase/client';

class AdminService {
  constructor() {
    this.supabase = createClient();
  }

  // Check if current user is admin
  async isAdmin(userId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data?.role === 'admin';
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  }

  // Dashboard Overview Metrics
  async getDashboardMetrics() {
    try {
      const [usersData, scriptsData, teamsData, revenueData] = await Promise.all([
        this.getUserMetrics(),
        this.getScriptMetrics(),
        this.getTeamMetrics(),
        this.getRevenueMetrics()
      ]);

      return {
        users: usersData,
        scripts: scriptsData,
        teams: teamsData,
        revenue: revenueData,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  // User Metrics
  async getUserMetrics() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Total users
      const { count: totalUsers } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Active users (users with activity in last 7 days)
      const { count: activeUsers } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', sevenDaysAgo.toISOString());

      // New users this month
      const { count: newUsersThisMonth } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        total: totalUsers || 0,
        active: activeUsers || 0,
        newThisMonth: newUsersThisMonth || 0
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      return { total: 0, active: 0, newThisMonth: 0 };
    }
  }

  // Script Metrics
  async getScriptMetrics() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Total scripts
      const { count: totalScripts } = await this.supabase
        .from('scripts')
        .select('*', { count: 'exact', head: true });

      // Scripts this month
      const { count: scriptsThisMonth } = await this.supabase
        .from('scripts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Total script versions (edits)
      const { count: totalEdits } = await this.supabase
        .from('script_versions')
        .select('*', { count: 'exact', head: true });

      return {
        total: totalScripts || 0,
        thisMonth: scriptsThisMonth || 0,
        totalEdits: totalEdits || 0
      };
    } catch (error) {
      console.error('Error fetching script metrics:', error);
      return { total: 0, thisMonth: 0, totalEdits: 0 };
    }
  }

  // Team Metrics
  async getTeamMetrics() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Total teams
      const { count: totalTeams } = await this.supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      // Active teams (teams with member activity in last 7 days)
      const { data: activeTeamsData } = await this.supabase
        .from('team_members')
        .select('team_id')
        .gte('last_active', sevenDaysAgo.toISOString());

      const activeTeams = new Set(activeTeamsData?.map(r => r.team_id)).size;

      return {
        total: totalTeams || 0,
        active: activeTeams
      };
    } catch (error) {
      console.error('Error fetching team metrics:', error);
      return { total: 0, active: 0 };
    }
  }

  // Revenue Metrics - Now integrated with real Stripe data
  async getRevenueMetrics() {
    try {
      // Import revenue service dynamically to avoid circular dependencies
      const { revenueService } = await import('./revenue-service');
      const metrics = await revenueService.getRevenueMetrics();

      return {
        mrr: metrics.mrr,
        growth: metrics.growth,
        totalRevenue: metrics.totalRevenue,
        arr: metrics.arr,
        activeSubscriptions: metrics.activeSubscriptions,
        churnRate: metrics.churnRate,
        clv: metrics.clv
      };
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      // Return zero metrics on error to prevent dashboard crashes
      return {
        mrr: 0,
        growth: 0,
        totalRevenue: 0,
        arr: 0,
        activeSubscriptions: 0,
        churnRate: 0,
        clv: 0
      };
    }
  }

  // Recent Activity Feed
  async getRecentActivity(limit = 10) {
    try {
      // Get recent scripts, user signups, and team activities
      const [recentScripts, recentUsers, recentTeams] = await Promise.all([
        this.supabase
          .from('scripts')
          .select('id, title, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(limit),
        
        this.supabase
          .from('users')
          .select('id, email, created_at')
          .order('created_at', { ascending: false })
          .limit(limit),
        
        this.supabase
          .from('teams')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(limit)
      ]);

      const activities = [];

      // Add script activities
      recentScripts.data?.forEach(script => {
        activities.push({
          id: `script-${script.id}`,
          type: 'script_created',
          description: `New script "${script.title}" created`,
          timestamp: script.created_at,
          userId: script.user_id
        });
      });

      // Add user activities
      recentUsers.data?.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_signup',
          description: `New user signed up: ${user.email}`,
          timestamp: user.created_at,
          userId: user.id
        });
      });

      // Add team activities
      recentTeams.data?.forEach(team => {
        activities.push({
          id: `team-${team.id}`,
          type: 'team_created',
          description: `New team created: ${team.name}`,
          timestamp: team.created_at
        });
      });

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // User Management
  async getAllUsers(page = 1, limit = 50, search = '') {
    try {
      let query = this.supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;

      return {
        users: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserDetails(userId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select(`
          *,
          scripts(count),
          team_members(
            team_id,
            role,
            teams(name)
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async suspendUser(userId, suspended = true) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ 
          suspended: suspended,
          suspended_at: suspended ? new Date().toISOString() : null
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  // Team Management
  async getAllTeams(page = 1, limit = 50, search = '') {
    try {
      let query = this.supabase
        .from('teams')
        .select(`
          *,
          team_members(count),
          scripts(count)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;

      return {
        teams: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  async getTeamDetails(teamId) {
    try {
      const { data, error } = await this.supabase
        .from('teams')
        .select(`
          *,
          team_members(
            id,
            user_id,
            role,
            joined_at,
            users(email, full_name)
          ),
          scripts(
            id,
            title,
            created_at,
            updated_at
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw error;
    }
  }

  async deleteTeam(teamId) {
    try {
      // This should cascade and delete related records
      const { error } = await this.supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }

  // Analytics Data
  async getAnalyticsData(timeRange = '30d') {
    try {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      const [userGrowth, scriptGeneration, teamActivity] = await Promise.all([
        this.getUserGrowthData(startDate, endDate),
        this.getScriptGenerationData(startDate, endDate),
        this.getTeamActivityData(startDate, endDate)
      ]);

      return {
        userGrowth,
        scriptGeneration,
        teamActivity,
        timeRange,
        startDate,
        endDate
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  async getUserGrowthData(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by date
      const groupedData = {};
      data?.forEach(user => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        groupedData[date] = (groupedData[date] || 0) + 1;
      });

      return Object.entries(groupedData).map(([date, count]) => ({
        date,
        users: count
      }));
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      return [];
    }
  }

  async getScriptGenerationData(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('scripts')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by date
      const groupedData = {};
      data?.forEach(script => {
        const date = new Date(script.created_at).toISOString().split('T')[0];
        groupedData[date] = (groupedData[date] || 0) + 1;
      });

      return Object.entries(groupedData).map(([date, count]) => ({
        date,
        scripts: count
      }));
    } catch (error) {
      console.error('Error fetching script generation data:', error);
      return [];
    }
  }

  async getTeamActivityData(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('teams')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by date
      const groupedData = {};
      data?.forEach(team => {
        const date = new Date(team.created_at).toISOString().split('T')[0];
        groupedData[date] = (groupedData[date] || 0) + 1;
      });

      return Object.entries(groupedData).map(([date, count]) => ({
        date,
        teams: count
      }));
    } catch (error) {
      console.error('Error fetching team activity data:', error);
      return [];
    }
  }

  // Export data functionality
  async exportUserData(format = 'json') {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (format === 'csv') {
        return this.convertToCSV(data, 'users');
      }

      return data;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  async exportTeamData(format = 'json') {
    try {
      const { data, error } = await this.supabase
        .from('teams')
        .select(`
          *,
          team_members(
            user_id,
            role,
            joined_at,
            users(email, full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (format === 'csv') {
        return this.convertToCSV(data, 'teams');
      }

      return data;
    } catch (error) {
      console.error('Error exporting team data:', error);
      throw error;
    }
  }

  convertToCSV(data, type) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]).filter(key => 
      typeof data[0][key] !== 'object' || data[0][key] === null
    );
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }
}

export const adminService = new AdminService();
export default adminService;