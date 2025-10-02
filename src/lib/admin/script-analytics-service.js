// File: /src/lib/admin/script-analytics-service.js
// Purpose: Script analytics service for tracking generation patterns and usage

import { createClient } from '@/lib/supabase/client';

class ScriptAnalyticsService {
  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get comprehensive script analytics
   * Includes generation patterns, type distribution, and trends
   */
  async getScriptAnalytics(timeRange = '30d') {
    try {
      const { startDate, endDate } = this.getDateRange(timeRange);

      const [
        totalScripts,
        scriptsByType,
        scriptsByLength,
        scriptsByTier,
        generationTrend,
        topUsers,
        editMetrics
      ] = await Promise.all([
        this.getTotalScripts(startDate, endDate),
        this.getScriptsByType(startDate, endDate),
        this.getScriptsByLength(startDate, endDate),
        this.getScriptsByTier(startDate, endDate),
        this.getGenerationTrend(startDate, endDate),
        this.getTopScriptCreators(startDate, endDate),
        this.getEditMetrics(startDate, endDate)
      ]);

      return {
        total: totalScripts,
        byType: scriptsByType,
        byLength: scriptsByLength,
        byTier: scriptsByTier,
        trend: generationTrend,
        topUsers,
        editMetrics,
        timeRange,
        startDate,
        endDate
      };
    } catch (error) {
      console.error('Error fetching script analytics:', error);
      return {
        total: 0,
        byType: [],
        byLength: [],
        byTier: [],
        trend: [],
        topUsers: [],
        editMetrics: { avgEdits: 0, totalEdits: 0 },
        timeRange,
        startDate: new Date(),
        endDate: new Date()
      };
    }
  }

  /**
   * Get total scripts created in time range
   */
  async getTotalScripts(startDate, endDate) {
    try {
      const { count } = await this.supabase
        .from('scripts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      return count || 0;
    } catch (error) {
      console.error('Error getting total scripts:', error);
      return 0;
    }
  }

  /**
   * Get scripts grouped by type (educational, entertainment, etc.)
   * Uses metadata field where script type is stored
   */
  async getScriptsByType(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('scripts')
        .select('metadata')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Count scripts by type from metadata
      const typeCounts = {};
      data?.forEach(script => {
        const type = script.metadata?.scriptType || 'other';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      // Convert to array format for charts
      return Object.entries(typeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting scripts by type:', error);
      return [];
    }
  }

  /**
   * Get scripts grouped by length
   */
  async getScriptsByLength(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('scripts')
        .select('script_length')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('script_length', 'is', null);

      if (error) throw error;

      // Group by length ranges
      const lengthRanges = {
        '1-5 min': 0,
        '5-10 min': 0,
        '10-20 min': 0,
        '20-30 min': 0,
        '30+ min': 0
      };

      data?.forEach(script => {
        const length = script.script_length;
        if (length <= 5) lengthRanges['1-5 min']++;
        else if (length <= 10) lengthRanges['5-10 min']++;
        else if (length <= 20) lengthRanges['10-20 min']++;
        else if (length <= 30) lengthRanges['20-30 min']++;
        else lengthRanges['30+ min']++;
      });

      return Object.entries(lengthRanges).map(([name, count]) => ({ name, count }));
    } catch (error) {
      console.error('Error getting scripts by length:', error);
      return [];
    }
  }

  /**
   * Get scripts grouped by quality tier (Fast, Balanced, Premium)
   */
  async getScriptsByTier(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('scripts')
        .select('generation_tier')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('generation_tier', 'is', null);

      if (error) throw error;

      const tierCounts = {};
      data?.forEach(script => {
        const tier = script.generation_tier || 'unknown';
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
      });

      return Object.entries(tierCounts)
        .map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting scripts by tier:', error);
      return [];
    }
  }

  /**
   * Get script generation trend over time
   * Returns daily script counts for the date range
   */
  async getGenerationTrend(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('scripts')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by date
      const dailyCounts = {};
      data?.forEach(script => {
        const date = new Date(script.created_at).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      // Fill in missing dates with 0
      const trend = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        trend.push({
          date: dateStr,
          count: dailyCounts[dateStr] || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return trend;
    } catch (error) {
      console.error('Error getting generation trend:', error);
      return [];
    }
  }

  /**
   * Get top script creators
   * Shows which users are creating the most scripts
   */
  async getTopScriptCreators(startDate, endDate, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('scripts')
        .select('user_id, users(email, full_name)')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Count scripts per user
      const userCounts = {};
      data?.forEach(script => {
        const userId = script.user_id;
        if (!userCounts[userId]) {
          userCounts[userId] = {
            userId,
            email: script.users?.email || 'Unknown',
            name: script.users?.full_name || script.users?.email || 'Unknown',
            count: 0
          };
        }
        userCounts[userId].count++;
      });

      // Convert to array and sort
      return Object.values(userCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top creators:', error);
      return [];
    }
  }

  /**
   * Get edit metrics
   * Shows how often scripts are being edited
   */
  async getEditMetrics(startDate, endDate) {
    try {
      const { data: scripts, error: scriptsError } = await this.supabase
        .from('scripts')
        .select('id, edit_count')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (scriptsError) throw scriptsError;

      const { count: totalEdits, error: editsError } = await this.supabase
        .from('script_versions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (editsError) throw editsError;

      const totalScripts = scripts?.length || 0;
      const avgEdits = totalScripts > 0
        ? scripts.reduce((sum, s) => sum + (s.edit_count || 0), 0) / totalScripts
        : 0;

      return {
        totalEdits: totalEdits || 0,
        avgEdits: Math.round(avgEdits * 10) / 10, // Round to 1 decimal
        scriptsWithEdits: scripts?.filter(s => s.edit_count > 0).length || 0
      };
    } catch (error) {
      console.error('Error getting edit metrics:', error);
      return {
        totalEdits: 0,
        avgEdits: 0,
        scriptsWithEdits: 0
      };
    }
  }

  /**
   * Get credits usage analytics
   * Shows how credits are being spent
   */
  async getCreditsAnalytics(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('scripts')
        .select('credits_used, generation_tier')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('credits_used', 'is', null);

      if (error) throw error;

      const totalCredits = data?.reduce((sum, s) => sum + (s.credits_used || 0), 0) || 0;
      const avgCredits = data?.length > 0 ? totalCredits / data.length : 0;

      // Credits by tier
      const creditsByTier = {};
      data?.forEach(script => {
        const tier = script.generation_tier || 'unknown';
        if (!creditsByTier[tier]) {
          creditsByTier[tier] = 0;
        }
        creditsByTier[tier] += script.credits_used || 0;
      });

      return {
        total: totalCredits,
        average: Math.round(avgCredits * 10) / 10,
        byTier: Object.entries(creditsByTier).map(([tier, credits]) => ({
          tier,
          credits
        }))
      };
    } catch (error) {
      console.error('Error getting credits analytics:', error);
      return {
        total: 0,
        average: 0,
        byTier: []
      };
    }
  }

  /**
   * Helper to get date range based on timeRange string
   */
  getDateRange(timeRange) {
    const endDate = new Date();
    const startDate = new Date();

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

    return { startDate, endDate };
  }
}

export const scriptAnalyticsService = new ScriptAnalyticsService();
export default scriptAnalyticsService;
