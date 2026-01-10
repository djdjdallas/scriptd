import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTrendingVideos, getChannelStatistics } from '@/lib/youtube/trending';
import { apiLogger } from '@/lib/monitoring/logger';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, or external service)
// Recommended frequency: Every 6-12 hours to track growth trends

export async function GET(request) {
  try {
    // Verify the request is authorized
    // Vercel Cron jobs send a special header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow both Vercel cron (which uses a different auth method) and manual triggers
    const isVercelCron = process.env.VERCEL && request.headers.get('x-vercel-cron');
    const isAuthorized = isVercelCron || authHeader === `Bearer ${cronSecret}`;
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const now = new Date().toISOString();
    
    // Fetch trending videos from multiple categories
    const categories = ['all', 'technology', 'gaming', 'music', 'education', 'entertainment'];
    const allChannelIds = new Set();
    const topicMetrics = [];
    const channelMetrics = [];
    
    for (const category of categories) {
      try {
        // Get trending videos for each category
        const categoryId = getCategoryId(category);
        const videos = await getTrendingVideos({
          regionCode: 'US',
          categoryId,
          maxResults: 50
        });
        
        if (!videos || videos.length === 0) continue;
        
        // Collect unique channel IDs
        videos.forEach(video => {
          allChannelIds.add(video.snippet.channelId);
        });
        
        // Analyze topics for this category
        const topicAnalysis = analyzeTopicsForMetrics(videos, category);
        topicMetrics.push(...topicAnalysis);
        
      } catch (error) {
        apiLogger.error('Error processing category', error, { category });
      }
    }
    
    // Fetch real channel statistics for all unique channels
    const channelIdsArray = Array.from(allChannelIds);
    const channelStats = await getChannelStatistics(channelIdsArray);
    
    // Store channel metrics in database
    for (const [channelId, stats] of Object.entries(channelStats)) {
      // First, ensure channel exists in channels table
      const { data: existingChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('youtube_channel_id', channelId)
        .single();
      
      let channelDbId = existingChannel?.id;
      
      if (!channelDbId) {
        // Get a default user ID (first admin user or first user)
        const { data: defaultUser } = await supabase
          .from('users')
          .select('id')
          .or('role.eq.admin,role.eq.user')
          .limit(1)
          .single();
        
        if (defaultUser) {
          // Create a basic channel entry if it doesn't exist
          const { data: newChannel } = await supabase
            .from('channels')
            .insert({
              youtube_channel_id: channelId,
              name: 'Channel ' + channelId, // Will be updated on next sync
              subscriber_count: stats.subscriberCount,
              view_count: stats.viewCount,
              video_count: stats.videoCount,
              published_at: stats.publishedAt,
              user_id: defaultUser.id // Use real user ID
            })
            .select('id')
            .single();
          
          channelDbId = newChannel?.id;
        }
      }
      
      if (channelDbId) {
        // Store metrics history
        channelMetrics.push({
          channel_id: channelDbId,
          subscriber_count: stats.subscriberCount,
          view_count: stats.viewCount,
          video_count: stats.videoCount,
          average_views: Math.round(stats.viewCount / Math.max(stats.videoCount, 1)),
          engagement_rate: 0, // Would need video-level data to calculate
          snapshot_date: now,
          metadata: {
            customUrl: stats.customUrl,
            country: stats.country
          }
        });
      }
    }
    
    // Store topic metrics
    if (topicMetrics.length > 0) {
      const { error: topicsError } = await supabase
        .from('trending_topics_history')
        .insert(topicMetrics);
      
      if (topicsError) {
        apiLogger.error('Error storing topic metrics', topicsError);
      }
    }
    
    // Store channel metrics
    if (channelMetrics.length > 0) {
      const { error: channelsError } = await supabase
        .from('channel_metrics_history')
        .insert(channelMetrics);
      
      if (channelsError) {
        apiLogger.error('Error storing channel metrics', channelsError);
      }
    }
    
    // Clean up old metrics (keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await supabase
      .from('trending_topics_history')
      .delete()
      .lt('recorded_at', thirtyDaysAgo.toISOString());
    
    await supabase
      .from('channel_metrics_history')
      .delete()
      .lt('snapshot_date', thirtyDaysAgo.toISOString());
    
    return NextResponse.json({
      success: true,
      metrics: {
        topicsCollected: topicMetrics.length,
        channelsCollected: channelMetrics.length,
        timestamp: now
      }
    });
    
  } catch (error) {
    apiLogger.error('Error in metrics collection', error);
    return NextResponse.json(
      { error: 'Failed to collect metrics', details: error.message },
      { status: 500 }
    );
  }
}

function getCategoryId(category) {
  const mappings = {
    'technology': '28',
    'gaming': '20',
    'music': '10',
    'entertainment': '24',
    'education': '27',
    'howto': '26',
    'sports': '17',
    'travel': '19',
    'food': '26',
    'all': null
  };
  return mappings[category] || null;
}

function analyzeTopicsForMetrics(videos, category) {
  const topicMap = new Map();
  
  // Extract topics from video titles
  videos.forEach(video => {
    const words = video.snippet.title.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const phrases = [];
    
    // Extract 2-3 word phrases as topics
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words.slice(i, Math.min(i + 3, words.length)).join(' ');
      if (phrase.length > 8) {
        phrases.push(phrase);
      }
    }
    
    phrases.forEach(phrase => {
      if (!topicMap.has(phrase)) {
        topicMap.set(phrase, {
          count: 0,
          totalViews: 0,
          totalEngagement: 0,
          videos: []
        });
      }
      
      const topic = topicMap.get(phrase);
      topic.count++;
      topic.totalViews += parseInt(video.statistics.viewCount || 0);
      topic.totalEngagement += parseInt(video.statistics.likeCount || 0) + 
                               parseInt(video.statistics.commentCount || 0);
      topic.videos.push(video.id);
    });
  });
  
  // Convert to metrics format
  return Array.from(topicMap.entries())
    .filter(([_, data]) => data.count >= 2) // Only topics that appear multiple times
    .map(([phrase, data]) => ({
      topic_name: phrase,
      category: category,
      score: Math.min(data.count * 10, 100),
      engagement_rate: data.totalViews > 0 ? (data.totalEngagement / data.totalViews * 100) : 0,
      avg_views: Math.floor(data.totalViews / data.count),
      channel_count: data.count,
      recorded_at: new Date().toISOString()
    }))
    .slice(0, 20); // Top 20 topics per category
}