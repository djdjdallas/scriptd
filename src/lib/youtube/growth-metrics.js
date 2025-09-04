/**
 * Calculate real growth metrics for YouTube channels
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Store channel metrics snapshot for historical tracking
 */
export async function storeChannelMetrics(channelId, metrics) {
  const supabase = createClient();
  
  const snapshot = {
    channel_id: channelId,
    subscriber_count: metrics.subscriberCount,
    view_count: metrics.viewCount,
    video_count: metrics.videoCount,
    average_views: metrics.averageViews || 0,
    engagement_rate: metrics.engagementRate || 0,
    snapshot_date: new Date().toISOString(),
    metadata: metrics.metadata || {}
  };

  const { data, error } = await supabase
    .from('channel_metrics_history')
    .insert(snapshot)
    .select()
    .single();

  if (error) {
    console.error('Error storing channel metrics:', error);
    return null;
  }

  return data;
}

/**
 * Calculate growth rate between two time periods
 */
export function calculateGrowthRate(currentValue, previousValue) {
  if (!previousValue || previousValue === 0) return 0;
  
  const growth = ((currentValue - previousValue) / previousValue) * 100;
  return Math.round(growth * 100) / 100; // Round to 2 decimal places
}

/**
 * Get channel growth metrics comparing current stats with historical data
 */
export async function getChannelGrowthMetrics(channelId, currentStats, period = 30) {
  const supabase = createClient();
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  // Fetch historical metrics
  const { data: historicalData, error } = await supabase
    .from('channel_metrics_history')
    .select('*')
    .eq('channel_id', channelId)
    .gte('snapshot_date', startDate.toISOString())
    .lte('snapshot_date', endDate.toISOString())
    .order('snapshot_date', { ascending: true });

  if (error || !historicalData || historicalData.length === 0) {
    // No historical data - return neutral growth
    return {
      subscriberGrowth: 0,
      viewGrowth: 0,
      videoGrowth: 0,
      engagementGrowth: 0,
      period: period,
      hasHistoricalData: false,
      trend: 'stable',
      growthScore: 50
    };
  }

  // Get the oldest snapshot for comparison
  const oldestSnapshot = historicalData[0];
  const latestSnapshot = historicalData[historicalData.length - 1];

  // Calculate growth rates
  const subscriberGrowth = calculateGrowthRate(
    currentStats.subscriber_count || 0,
    oldestSnapshot.subscriber_count || 0
  );

  const viewGrowth = calculateGrowthRate(
    currentStats.view_count || 0,
    oldestSnapshot.view_count || 0
  );

  const videoGrowth = calculateGrowthRate(
    currentStats.video_count || 0,
    oldestSnapshot.video_count || 0
  );

  const engagementGrowth = calculateGrowthRate(
    currentStats.engagement_rate || 0,
    oldestSnapshot.engagement_rate || 0
  );

  // Calculate average daily growth
  const daysElapsed = Math.max(1, Math.floor((new Date() - new Date(oldestSnapshot.snapshot_date)) / (1000 * 60 * 60 * 24)));
  const dailySubscriberGrowth = subscriberGrowth / daysElapsed;
  const dailyViewGrowth = viewGrowth / daysElapsed;

  // Determine growth trend
  let trend = 'stable';
  let growthScore = 50;
  
  if (subscriberGrowth > 10) {
    trend = 'rapid-growth';
    growthScore = Math.min(100, 70 + subscriberGrowth);
  } else if (subscriberGrowth > 5) {
    trend = 'growing';
    growthScore = 60 + (subscriberGrowth * 2);
  } else if (subscriberGrowth > 0) {
    trend = 'steady';
    growthScore = 50 + (subscriberGrowth * 2);
  } else if (subscriberGrowth < -5) {
    trend = 'declining';
    growthScore = Math.max(0, 40 + subscriberGrowth);
  }

  // Calculate momentum (acceleration of growth)
  let momentum = 'stable';
  if (historicalData.length >= 3) {
    const midPoint = Math.floor(historicalData.length / 2);
    const firstHalfGrowth = calculateGrowthRate(
      historicalData[midPoint].subscriber_count,
      historicalData[0].subscriber_count
    );
    const secondHalfGrowth = calculateGrowthRate(
      currentStats.subscriber_count,
      historicalData[midPoint].subscriber_count
    );
    
    if (secondHalfGrowth > firstHalfGrowth * 1.2) {
      momentum = 'accelerating';
    } else if (secondHalfGrowth < firstHalfGrowth * 0.8) {
      momentum = 'decelerating';
    }
  }

  // Compile metrics
  return {
    subscriberGrowth,
    viewGrowth,
    videoGrowth,
    engagementGrowth,
    dailySubscriberGrowth: Math.round(dailySubscriberGrowth * 100) / 100,
    dailyViewGrowth: Math.round(dailyViewGrowth * 100) / 100,
    period,
    daysTracked: daysElapsed,
    hasHistoricalData: true,
    trend,
    momentum,
    growthScore,
    projectedSubscribers30Days: Math.round(
      currentStats.subscriber_count * (1 + (dailySubscriberGrowth * 30 / 100))
    ),
    historicalSnapshots: historicalData.length
  };
}

/**
 * Get comparative growth metrics across all user's channels
 */
export async function getComparativeGrowthMetrics(userId) {
  const supabase = createClient();
  
  // Get all user's channels
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('*')
    .eq('user_id', userId);

  if (channelsError || !channels) {
    return null;
  }

  // Get growth metrics for each channel
  const growthMetrics = await Promise.all(
    channels.map(async (channel) => {
      const metrics = await getChannelGrowthMetrics(channel.id, {
        subscriber_count: channel.subscriber_count,
        view_count: channel.view_count,
        video_count: channel.video_count
      });

      return {
        channelId: channel.id,
        channelName: channel.title || channel.name,
        ...metrics
      };
    })
  );

  // Calculate averages and identify best performers
  const avgSubscriberGrowth = growthMetrics.reduce((sum, m) => sum + m.subscriberGrowth, 0) / growthMetrics.length;
  const avgViewGrowth = growthMetrics.reduce((sum, m) => sum + m.viewGrowth, 0) / growthMetrics.length;
  
  const bestPerformer = growthMetrics.reduce((best, current) => 
    current.subscriberGrowth > best.subscriberGrowth ? current : best
  );

  const worstPerformer = growthMetrics.reduce((worst, current) => 
    current.subscriberGrowth < worst.subscriberGrowth ? current : worst
  );

  return {
    channels: growthMetrics,
    summary: {
      avgSubscriberGrowth: Math.round(avgSubscriberGrowth * 100) / 100,
      avgViewGrowth: Math.round(avgViewGrowth * 100) / 100,
      bestPerformer: bestPerformer.channelName,
      bestGrowth: bestPerformer.subscriberGrowth,
      worstPerformer: worstPerformer.channelName,
      worstGrowth: worstPerformer.subscriberGrowth,
      totalChannels: growthMetrics.length
    }
  };
}

/**
 * Schedule regular metrics snapshots (to be called by a cron job or API route)
 */
export async function updateAllChannelMetrics() {
  const supabase = createClient();
  
  // Get all active channels
  const { data: channels, error } = await supabase
    .from('channels')
    .select('*')
    .eq('is_active', true);

  if (error || !channels) {
    console.error('Error fetching channels for metrics update:', error);
    return;
  }

  // Store metrics for each channel
  const results = await Promise.all(
    channels.map(async (channel) => {
      const metrics = {
        subscriberCount: channel.subscriber_count,
        viewCount: channel.view_count,
        videoCount: channel.video_count,
        metadata: {
          title: channel.title,
          handle: channel.handle
        }
      };
      
      return storeChannelMetrics(channel.id, metrics);
    })
  );

  return {
    updated: results.filter(r => r !== null).length,
    failed: results.filter(r => r === null).length,
    total: channels.length
  };
}