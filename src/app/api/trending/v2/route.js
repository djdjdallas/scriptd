import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getTrendingVideos,
  getRecentVideos,
  searchTrendingQueries,
  getEmergingTopics,
  analyzeTrendingTopics,
  getChannelStatistics,
  searchVideos
} from '@/lib/youtube/trending';
import { apiLogger } from '@/lib/monitoring/logger';

// Dynamic trending search queries based on time and category
const TRENDING_QUERIES = {
  'all': [
    'trending 2024', 'viral video', 'breaking news', 'new release',
    'must watch', 'trending now', 'going viral', 'everyone talking about'
  ],
  'technology': [
    'new tech 2024', 'AI news', 'tech review', 'gadget unboxing',
    'software tutorial', 'tech breakthrough', 'future technology', 'tech trends'
  ],
  'gaming': [
    'new game release', 'gaming news', 'game review', 'gameplay trending',
    'esports highlights', 'gaming tips', 'game walkthrough', 'gaming setup'
  ],
  'entertainment': [
    'movie trailer', 'celebrity news', 'music video', 'tv show recap',
    'entertainment news', 'behind the scenes', 'fan reaction', 'movie review'
  ],
  'education': [
    'learn online', 'tutorial 2024', 'how to guide', 'educational content',
    'study tips', 'online course', 'skill learning', 'education trends'
  ],
  'lifestyle': [
    'lifestyle vlog', 'daily routine', 'life hacks', 'productivity tips',
    'wellness trends', 'minimalism', 'self improvement', 'lifestyle change'
  ]
};

// Category mappings
const CATEGORY_MAPPINGS = {
  'technology': '28',
  'gaming': '20',
  'music': '10',
  'entertainment': '24',
  'education': '27',
  'howto': '26',
  'sports': '17',
  'travel': '19',
  'comedy': '23',
  'news': '25',
  'pets': '15',
  'autos': '2',
  'film': '1'
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const timeframe = searchParams.get('timeframe') || 'today';
    const region = searchParams.get('region') || 'US';
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Get supabase client
    const supabase = await createClient();
    
    // Get hours based on timeframe
    let hours = 24;
    switch (timeframe) {
      case 'now': hours = 1; break;
      case 'today': hours = 24; break;
      case 'week': hours = 168; break;
      case 'month': hours = 720; break;
    }
    
    // 1. Fetch recent videos (last N hours)
    const categoryId = CATEGORY_MAPPINGS[category.toLowerCase()] || null;
    const recentVideos = await getRecentVideos({
      hours,
      categoryId,
      regionCode: region,
      maxResults: 50,
      forceRefresh
    });
    
    // 2. Search trending queries for more diverse data
    const queries = TRENDING_QUERIES[category.toLowerCase()] || TRENDING_QUERIES['all'];
    const trendingSearchVideos = await searchTrendingQueries({
      queries: queries.slice(0, 5), // Use top 5 queries
      hours,
      regionCode: region,
      maxResultsPerQuery: 20
    });
    
    // 3. Get traditional trending videos for comparison
    const trendingVideos = await getTrendingVideos({
      regionCode: region,
      categoryId,
      maxResults: 25
    });
    
    // 4. Combine all video sources, remove duplicates
    const videoMap = new Map();
    [...recentVideos, ...trendingSearchVideos, ...trendingVideos].forEach(video => {
      const id = video.id?.videoId || video.id;
      if (id && !videoMap.has(id)) {
        videoMap.set(id, video);
      }
    });
    
    const allVideos = Array.from(videoMap.values());
    
    // 5. Get historical data for comparison (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data: historicalTopics } = await supabase
      .from('trending_topics_history')
      .select('topic_name, avg_views, score, engagement_rate')
      .gte('recorded_at', oneWeekAgo.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(100);
    
    // 6. Get emerging topics using historical comparison
    const emergingTopics = await getEmergingTopics(allVideos, historicalTopics || []);
    
    // 7. Analyze current trending patterns
    const topicAnalysis = await analyzeTrendingTopics(allVideos);
    
    // 8. Create enhanced topic list with real-time data
    const enhancedTopics = emergingTopics.map((topic, index) => {
      const growthIndicator = topic.isNew ? '🆕' : topic.growthRate > 100 ? '🔥' : '📈';
      const engagement = topic.avgVelocity > 10000 ? 'Very High' : 
                        topic.avgVelocity > 5000 ? 'High' : 
                        topic.avgVelocity > 1000 ? 'Medium' : 'Growing';
      
      return {
        id: `${topic.topic}-${Date.now()}-${index}`,
        topic: topic.topic,
        category: category,
        growth: topic.isNew ? 'NEW' : `+${Math.min(9999, Math.round(topic.growthRate))}%`,
        growthIndicator,
        searches: formatNumber(Math.round(topic.avgViews)),
        videos: formatNumber(topic.count * 100), // Estimate based on sample
        engagement,
        velocity: Math.round(topic.avgVelocity),
        hashtags: topic.tags.map(tag => `#${tag.replace(/\s+/g, '')}`),
        description: `${growthIndicator} ${topic.topic} is ${topic.isNew ? 'emerging as a new trend' : 'rapidly growing'} with ${topic.count} videos gaining traction`,
        score: Math.round(topic.avgVelocity / 100),
        isNew: topic.isNew,
        topVideos: topic.videos.map(v => ({
          title: v.snippet.title,
          views: parseInt(v.statistics.viewCount),
          channel: v.snippet.channelTitle,
          publishedAt: v.snippet.publishedAt
        }))
      };
    });
    
    // 9. Get trending channels from high-velocity videos
    const channelMap = new Map();
    allVideos
      .sort((a, b) => (b.velocity || 0) - (a.velocity || 0))
      .slice(0, 30)
      .forEach(video => {
        const channelId = video.snippet.channelId;
        if (!channelMap.has(channelId)) {
          channelMap.set(channelId, {
            id: channelId,
            name: video.snippet.channelTitle,
            videos: [],
            totalVelocity: 0,
            category
          });
        }
        const channel = channelMap.get(channelId);
        channel.videos.push(video);
        channel.totalVelocity += video.velocity || 0;
      });
    
    // Get real channel statistics
    const channelIds = Array.from(channelMap.keys());
    const channelStats = await getChannelStatistics(channelIds.slice(0, 20));
    
    const trendingChannels = Array.from(channelMap.values())
      .map(channel => {
        const stats = channelStats[channel.id] || {};
        const avgVelocity = channel.totalVelocity / channel.videos.length;
        
        return {
          id: channel.id,
          name: channel.name,
          handle: stats.customUrl || `@${channel.name.toLowerCase().replace(/\s+/g, '')}`,
          subscribers: formatNumber(stats.subscriberCount || 0),
          growth: avgVelocity > 5000 ? '🔥 Hot' : avgVelocity > 1000 ? '📈 Rising' : '🌱 Growing',
          category: channel.category,
          thumbnail: channel.videos[0]?.snippet?.thumbnails?.default?.url,
          avgViews: formatNumber(Math.round(avgVelocity * 24)), // Daily view estimate
          topVideo: channel.videos[0]?.snippet?.title || '',
          velocity: avgVelocity,
          videoCount: stats.videoCount || 0
        };
      })
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 10);
    
    // 10. Store metrics for future comparison
    if (enhancedTopics.length > 0) {
      await storeTrendingMetrics(enhancedTopics, trendingChannels, supabase);
    }
    
    // Calculate real-time stats
    const stats = {
      dataFreshness: new Date().toISOString(),
      videosAnalyzed: allVideos.length,
      recentVideos: recentVideos.length,
      searchVideos: trendingSearchVideos.length,
      emergingTopicsFound: emergingTopics.filter(t => t.isNew).length,
      totalViewVelocity: Math.round(allVideos.reduce((sum, v) => sum + (v.velocity || 0), 0)),
      topKeywords: Object.entries(topicAnalysis.trendingKeywords || {}).slice(0, 10)
    };
    
    return NextResponse.json({
      success: true,
      data: {
        trendingTopics: enhancedTopics.slice(0, 10),
        emergingTopics: enhancedTopics.filter(t => t.isNew).slice(0, 5),
        trendingChannels,
        analysis: topicAnalysis,
        stats,
        lastUpdated: new Date().toISOString(),
        cacheInfo: {
          refreshed: forceRefresh,
          nextUpdate: new Date(Date.now() + 30000).toISOString() // 30 seconds
        }
      }
    });
    
  } catch (error) {
    apiLogger.error('Error in trending v2 API', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending data', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to format numbers
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Store metrics for trend tracking
async function storeTrendingMetrics(topics, channels, supabase) {
  try {
    const now = new Date().toISOString();
    
    // Store topic metrics with additional metadata
    const topicMetrics = topics.map(topic => ({
      topic_name: topic.topic,
      category: topic.category,
      score: topic.score,
      engagement_rate: topic.engagement === 'Very High' ? 5 : 
                      topic.engagement === 'High' ? 3 : 
                      topic.engagement === 'Medium' ? 2 : 1,
      avg_views: Math.floor(parseInt(topic.searches.replace(/[KM]/g, match => 
        match === 'K' ? '000' : '000000'))),
      channel_count: topic.topVideos?.length || 0,
      recorded_at: now
    }));
    
    await supabase
      .from('trending_topics_history')
      .insert(topicMetrics);
    
  } catch (error) {
    apiLogger.error('Error storing metrics', error);
  }
}