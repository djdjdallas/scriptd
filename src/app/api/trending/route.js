import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getTrendingVideos, 
  getVideoCategories, 
  searchVideos,
  analyzeTrendingTopics 
} from '@/lib/youtube/trending';

// YouTube category mappings for niches
const CATEGORY_MAPPINGS = {
  'technology': '28', // Science & Technology
  'gaming': '20',
  'music': '10',
  'entertainment': '24',
  'education': '27',
  'howto': '26', // Howto & Style
  'sports': '17',
  'travel': '19',
  'food': '26', // Part of Howto & Style
  'comedy': '23',
  'news': '25',
  'pets': '15',
  'autos': '2',
  'film': '1',
  'nonprofits': '29',
  'all': null
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const timeframe = searchParams.get('timeframe') || 'today';
    const region = searchParams.get('region') || 'US';
    const useUserNiche = searchParams.get('userNiche') === 'true';

    // Get user's niche preference if requested
    let userCategory = category;
    if (useUserNiche) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        if (userData?.preferences?.niche) {
          userCategory = userData.preferences.niche;
        }
      }
    }

    // Calculate date range for timeframe
    let publishedAfter = null;
    const now = new Date();
    switch (timeframe) {
      case 'today':
        publishedAfter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'week':
        publishedAfter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        publishedAfter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }

    // Fetch trending videos
    const categoryId = CATEGORY_MAPPINGS[userCategory.toLowerCase()] || null;
    const trendingVideos = await getTrendingVideos({
      regionCode: region,
      categoryId,
      maxResults: 50
    });

    // Analyze trending topics
    const topicAnalysis = await analyzeTrendingTopics(trendingVideos);

    // Process videos into trending topics with better phrase extraction
    const topicMap = new Map();
    
    // Common topic patterns and phrases
    const topicPatterns = [
      // Tech topics
      { pattern: /ai\s+(tools?|apps?|software)/gi, topic: 'AI Tools & Applications' },
      { pattern: /chatgpt|claude|gemini|ai\s+assistant/gi, topic: 'AI Assistants' },
      { pattern: /machine\s+learning|deep\s+learning|neural/gi, topic: 'Machine Learning' },
      { pattern: /crypto|bitcoin|ethereum|blockchain/gi, topic: 'Cryptocurrency' },
      { pattern: /web\s*3|nft|metaverse/gi, topic: 'Web3 & NFTs' },
      
      // Content creation
      { pattern: /youtube\s+(tips|growth|algorithm)/gi, topic: 'YouTube Growth Tips' },
      { pattern: /content\s+creat/gi, topic: 'Content Creation' },
      { pattern: /video\s+edit|premiere|final\s+cut|davinci/gi, topic: 'Video Editing' },
      { pattern: /thumbnail|title\s+tips/gi, topic: 'Thumbnail & Title Optimization' },
      
      // Gaming
      { pattern: /gameplay|walkthrough|lets?\s+play/gi, topic: 'Gaming Content' },
      { pattern: /game\s+review|first\s+impressions/gi, topic: 'Game Reviews' },
      { pattern: /speed\s*run|world\s+record/gi, topic: 'Speedrunning' },
      
      // Lifestyle
      { pattern: /morning\s+routine|night\s+routine|daily\s+routine/gi, topic: 'Daily Routines' },
      { pattern: /productivity|time\s+management|habits/gi, topic: 'Productivity & Habits' },
      { pattern: /minimalism|declutter|organizing/gi, topic: 'Minimalism & Organization' },
      
      // Education
      { pattern: /tutorial|how\s+to|guide|learn/gi, topic: 'Tutorials & How-To' },
      { pattern: /course\s+review|online\s+learning/gi, topic: 'Online Learning' },
      { pattern: /study\s+with\s+me|study\s+tips/gi, topic: 'Study Content' },
      
      // Entertainment
      { pattern: /reaction|reacts?\s+to/gi, topic: 'Reaction Videos' },
      { pattern: /challenge|24\s+hour|overnight/gi, topic: 'Challenges' },
      { pattern: /prank|social\s+experiment/gi, topic: 'Pranks & Experiments' },
      
      // Food
      { pattern: /recipe|cooking|baking/gi, topic: 'Cooking & Recipes' },
      { pattern: /food\s+review|taste\s+test|trying/gi, topic: 'Food Reviews' },
      { pattern: /meal\s+prep|healthy\s+eating/gi, topic: 'Meal Prep & Healthy Eating' },
      
      // Fitness
      { pattern: /workout|exercise|fitness/gi, topic: 'Fitness & Workouts' },
      { pattern: /weight\s+loss|transformation/gi, topic: 'Fitness Transformation' },
      { pattern: /yoga|meditation|mindfulness/gi, topic: 'Yoga & Meditation' },
      
      // Finance
      { pattern: /investing|stocks|trading/gi, topic: 'Investing & Trading' },
      { pattern: /budget|saving\s+money|frugal/gi, topic: 'Budgeting & Saving' },
      { pattern: /passive\s+income|side\s+hustle/gi, topic: 'Passive Income' },
      
      // Travel
      { pattern: /travel\s+(vlog|guide)|destination/gi, topic: 'Travel Vlogs' },
      { pattern: /budget\s+travel|cheap\s+flights/gi, topic: 'Budget Travel' },
      { pattern: /digital\s+nomad|remote\s+work/gi, topic: 'Digital Nomad Lifestyle' }
    ];
    
    // Extract topics from video titles and descriptions
    trendingVideos.forEach(video => {
      const content = `${video.snippet.title} ${video.snippet.description}`.toLowerCase();
      
      // Check against topic patterns
      topicPatterns.forEach(({ pattern, topic }) => {
        if (pattern.test(content)) {
          if (!topicMap.has(topic)) {
            topicMap.set(topic, {
              topic: topic,
              videos: [],
              totalViews: 0,
              totalEngagement: 0,
              channels: new Set(),
              tags: new Set()
            });
          }
          
          const topicData = topicMap.get(topic);
          topicData.videos.push(video);
          topicData.totalViews += parseInt(video.statistics.viewCount || 0);
          topicData.totalEngagement += parseInt(video.statistics.likeCount || 0) + 
                                      parseInt(video.statistics.commentCount || 0);
          topicData.channels.add(video.snippet.channelTitle);
          
          // Add relevant tags
          if (video.snippet.tags) {
            video.snippet.tags.slice(0, 5).forEach(tag => topicData.tags.add(tag));
          }
        }
      });
    });
    
    // If no pattern matches, fall back to extracting multi-word phrases from titles
    if (topicMap.size === 0) {
      const phraseMap = new Map();
      
      trendingVideos.forEach(video => {
        const title = video.snippet.title;
        // Extract 2-3 word phrases
        const words = title.split(/\s+/);
        for (let i = 0; i < words.length - 1; i++) {
          const phrase = words.slice(i, Math.min(i + 3, words.length)).join(' ');
          if (phrase.length > 8 && !phrase.match(/^(the|and|for|with|from|about)/i)) {
            if (!phraseMap.has(phrase)) {
              phraseMap.set(phrase, 0);
            }
            phraseMap.set(phrase, phraseMap.get(phrase) + 1);
          }
        }
      });
      
      // Use most common phrases as topics
      const topPhrases = Array.from(phraseMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      topPhrases.forEach(([phrase, count]) => {
        const relevantVideos = trendingVideos.filter(v => 
          v.snippet.title.toLowerCase().includes(phrase.toLowerCase())
        );
        
        if (relevantVideos.length > 0) {
          topicMap.set(phrase, {
            topic: phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            videos: relevantVideos,
            totalViews: relevantVideos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || 0), 0),
            totalEngagement: relevantVideos.reduce((sum, v) => 
              sum + parseInt(v.statistics.likeCount || 0) + parseInt(v.statistics.commentCount || 0), 0
            ),
            channels: new Set(relevantVideos.map(v => v.snippet.channelTitle)),
            tags: new Set()
          });
        }
      });
    }

    // Convert to trending topics format
    const trendingTopics = Array.from(topicMap.values())
      .map(topic => {
        const avgViews = topic.totalViews / topic.videos.length;
        const avgEngagement = topic.totalEngagement / topic.videos.length;
        const engagementRate = (avgEngagement / avgViews * 100).toFixed(2);
        
        // Calculate growth (mock for now - would need historical data)
        const growthRate = Math.floor(Math.random() * 500) + 100;
        
        // Generate relevant hashtags from tags or topic
        const hashtagSet = new Set();
        if (topic.tags && topic.tags.size > 0) {
          Array.from(topic.tags).slice(0, 3).forEach(tag => {
            hashtagSet.add(`#${tag.replace(/\s+/g, '')}`);
          });
        } else {
          const topicWords = topic.topic.split(' ').filter(w => w.length > 3);
          if (topicWords.length > 0) {
            hashtagSet.add(`#${topicWords.join('')}`);
          }
          if (userCategory !== 'all') {
            hashtagSet.add(`#${userCategory}`);
          }
          hashtagSet.add('#trending');
        }
        
        return {
          id: topic.topic,
          topic: topic.topic,
          category: userCategory,
          growth: `+${growthRate}%`,
          searches: formatNumber(avgViews * 10), // Estimate
          videos: formatNumber(topic.videos.length * 100), // Estimate
          engagement: engagementRate > 5 ? 'Very High' : engagementRate > 2 ? 'High' : 'Medium',
          hashtags: Array.from(hashtagSet).slice(0, 4),
          description: `${topic.topic} content is trending with ${topic.channels.size} channels creating content`,
          score: Math.min(Math.round(growthRate / 5), 100),
          rawData: {
            videos: topic.videos.slice(0, 3), // Top 3 videos
            channelCount: topic.channels.size,
            avgViews,
            avgEngagement,
            engagementRate
          }
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Get trending channels from the videos
    const channelStats = new Map();
    
    trendingVideos.forEach(video => {
      const channelId = video.snippet.channelId;
      const channelTitle = video.snippet.channelTitle;
      
      if (!channelStats.has(channelId)) {
        channelStats.set(channelId, {
          id: channelId,
          name: channelTitle,
          handle: `@${channelTitle.toLowerCase().replace(/\s+/g, '')}`,
          videos: [],
          totalViews: 0,
          totalLikes: 0,
          category: userCategory
        });
      }
      
      const channel = channelStats.get(channelId);
      channel.videos.push(video);
      channel.totalViews += parseInt(video.statistics.viewCount || 0);
      channel.totalLikes += parseInt(video.statistics.likeCount || 0);
    });

    const trendingChannels = Array.from(channelStats.values())
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        handle: channel.handle,
        subscribers: formatNumber(Math.floor(channel.totalViews / 100)), // Estimate
        growth: `+${formatNumber(Math.floor(channel.totalLikes / 10))}/week`, // Estimate
        category: channel.category,
        thumbnail: channel.videos[0]?.snippet?.thumbnails?.default?.url || '/youtube-default.svg',
        avgViews: formatNumber(channel.totalViews / channel.videos.length),
        uploadFreq: channel.videos.length > 5 ? 'Daily' : channel.videos.length > 2 ? '3/week' : '2/week',
        topVideo: channel.videos[0]?.snippet?.title || '',
        verified: channel.totalViews > 1000000
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 8);

    // Get the hottest topic
    const hottestTopic = trendingTopics[0] || null;

    // Store metrics for growth tracking
    if (trendingTopics.length > 0) {
      await storeTrendingMetrics(trendingTopics, trendingChannels);
    }

    return NextResponse.json({
      success: true,
      data: {
        trendingTopics,
        trendingChannels,
        hottestTopic,
        analysis: topicAnalysis,
        stats: {
          totalTopics: trendingTopics.length,
          avgGrowthRate: Math.round(trendingTopics.reduce((sum, t) => sum + parseInt(t.growth), 0) / trendingTopics.length),
          totalChannels: trendingChannels.length,
          totalSearchVolume: trendingVideos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching trending data:', error);
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

// Store trending metrics in database for growth tracking
async function storeTrendingMetrics(topics, channels) {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // Store topic metrics
    const topicMetrics = topics.map(topic => ({
      topic_name: topic.topic,
      category: topic.category,
      score: topic.score,
      engagement_rate: topic.rawData?.engagementRate || 0,
      avg_views: Math.floor(topic.rawData?.avgViews || 0), // Convert to integer for bigint field
      channel_count: topic.rawData?.channelCount || 0,
      recorded_at: now
    }));

    const { error: topicsError } = await supabase
      .from('trending_topics_history')
      .insert(topicMetrics);

    if (topicsError) {
      console.error('Error storing topic metrics:', topicsError);
    }

    // Store channel metrics
    const channelMetrics = channels.map(channel => ({
      channel_id: channel.id,
      channel_name: channel.name,
      category: channel.category,
      avg_views: parseInt(channel.avgViews.replace(/[KM]/g, match => match === 'K' ? '000' : '000000')),
      subscriber_estimate: parseInt(channel.subscribers.replace(/[KM]/g, match => match === 'K' ? '000' : '000000')),
      recorded_at: now
    }));

    const { error: channelsError } = await supabase
      .from('trending_channels_history')
      .insert(channelMetrics);

    if (channelsError) {
      console.error('Error storing channel metrics:', channelsError);
    }
  } catch (error) {
    console.error('Error in storeTrendingMetrics:', error);
    // Don't throw - this is supplementary functionality
  }
}