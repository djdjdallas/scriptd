import { getYouTubeClient, withRateLimit, withDeduplication, getCached, setCache, clearCache } from './client.js';

export async function getTrendingVideos(options = {}) {
  const {
    regionCode = 'US',
    categoryId = null,
    maxResults = 50,
  } = options;

  const cacheKey = `trending-${regionCode}-${categoryId}-${maxResults}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();

  try {
    const params = {
      part: ['snippet', 'statistics', 'contentDetails'],
      chart: 'mostPopular',
      regionCode,
      maxResults: Math.min(maxResults, 50),
    };

    if (categoryId) {
      params.videoCategoryId = categoryId;
    }

    const response = await withRateLimit('videos', () =>
      youtube.videos.list(params)
    );

    const videos = response.data.items || [];
    setCache(cacheKey, videos);
    return videos;
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw error;
  }
}

export async function getVideoCategories(regionCode = 'US') {
  const cacheKey = `categories-${regionCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();

  try {
    const response = await withRateLimit('videoCategories', () =>
      youtube.videoCategories.list({
        part: ['snippet'],
        regionCode,
      })
    );

    const categories = response.data.items || [];
    setCache(cacheKey, categories);
    return categories;
  } catch (error) {
    console.error('Error fetching video categories:', error);
    throw error;
  }
}

export async function searchVideos(query, options = {}) {
  const {
    maxResults = 25,
    order = 'relevance',
    publishedAfter = null,
    type = 'video',
    videoDuration = null, // short, medium, long
  } = options;

  const cacheKey = `search-${query}-${JSON.stringify(options)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();

  try {
    const params = {
      part: ['snippet'],
      q: query,
      type: [type],
      order,
      maxResults: Math.min(maxResults, 50),
    };

    if (publishedAfter) {
      params.publishedAfter = publishedAfter;
    }

    if (videoDuration) {
      params.videoDuration = videoDuration;
    }

    const response = await withRateLimit('search', () =>
      youtube.search.list(params)
    );

    // Get detailed video information
    const videoIds = response.data.items
      .filter(item => item.id.videoId)
      .map(item => item.id.videoId);

    if (videoIds.length === 0) {
      return [];
    }

    const videosResponse = await withRateLimit('videos', () =>
      youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
      })
    );

    const videos = videosResponse.data.items || [];
    setCache(cacheKey, videos);
    return videos;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
}

export async function getRelatedChannels(channelId, maxResults = 10) {
  const cacheKey = `related-channels-${channelId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();

  try {
    // Search for channels that appear in the same searches
    const response = await withRateLimit('search', () =>
      youtube.search.list({
        part: ['snippet'],
        type: ['channel'],
        maxResults: Math.min(maxResults * 2, 50),
        relevanceLanguage: 'en',
      })
    );

    const channelIds = response.data.items
      .filter(item => item.id.channelId && item.id.channelId !== channelId)
      .map(item => item.id.channelId)
      .slice(0, maxResults);

    if (channelIds.length === 0) {
      return [];
    }

    // Get detailed channel information
    const channelsResponse = await withRateLimit('channels', () =>
      youtube.channels.list({
        part: ['snippet', 'statistics'],
        id: channelIds,
      })
    );

    const channels = channelsResponse.data.items || [];
    setCache(cacheKey, channels);
    return channels;
  } catch (error) {
    console.error('Error fetching related channels:', error);
    throw error;
  }
}

export async function getChannelStatistics(channelIds) {
  if (!channelIds || channelIds.length === 0) return {};
  
  const cacheKey = `channel-stats-${channelIds.join('-')}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();
  
  try {
    const response = await withRateLimit('channels', () =>
      youtube.channels.list({
        part: ['statistics', 'snippet', 'contentDetails'],
        id: channelIds,
        maxResults: 50
      })
    );

    const channelStats = {};
    response.data.items?.forEach(channel => {
      channelStats[channel.id] = {
        subscriberCount: parseInt(channel.statistics.subscriberCount || 0),
        viewCount: parseInt(channel.statistics.viewCount || 0),
        videoCount: parseInt(channel.statistics.videoCount || 0),
        customUrl: channel.snippet.customUrl,
        country: channel.snippet.country,
        publishedAt: channel.snippet.publishedAt,
        uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads
      };
    });

    setCache(cacheKey, channelStats);
    return channelStats;
  } catch (error) {
    console.error('Error fetching channel statistics:', error);
    return {};
  }
}

export async function getChannelRecentVideos(playlistId, maxResults = 10) {
  if (!playlistId) return [];

  const cacheKey = `channel-recent-${playlistId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Use deduplication to prevent multiple simultaneous requests
  return withDeduplication(cacheKey, async () => {
    const youtube = getYouTubeClient();

    try {
      const response = await withRateLimit('playlistItems', () =>
        youtube.playlistItems.list({
          part: ['snippet', 'contentDetails'],
          playlistId,
          maxResults: Math.min(maxResults, 50),
          order: 'date'
        })
      );

      const videos = response.data.items || [];
      setCache(cacheKey, videos);
      return videos;
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      return [];
    }
  });
}

// Fetch videos published in the last N hours
export async function getRecentVideos(options = {}) {
  const {
    hours = 24,
    categoryId = null,
    regionCode = 'US',
    maxResults = 50,
    searchQuery = '',
    forceRefresh = false
  } = options;

  const now = new Date();
  const publishedAfter = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  
  const cacheKey = `recent-${hours}-${categoryId}-${regionCode}-${searchQuery}`;
  const cached = getCached(cacheKey, forceRefresh);
  if (cached) return cached;

  const youtube = getYouTubeClient();

  try {
    // Search for recent videos with relevance and view count sorting
    const searchParams = {
      part: ['snippet'],
      type: ['video'],
      publishedAfter,
      regionCode,
      maxResults: Math.min(maxResults, 50),
      order: 'date', // Get most recent first
      relevanceLanguage: 'en',
    };

    if (categoryId) {
      searchParams.videoCategoryId = categoryId;
    }

    if (searchQuery) {
      searchParams.q = searchQuery;
    }

    const response = await withRateLimit('search', () =>
      youtube.search.list(searchParams)
    );

    // Get video IDs
    const videoIds = response.data.items
      ?.filter(item => item.id?.videoId)
      .map(item => item.id.videoId) || [];

    if (videoIds.length === 0) {
      return [];
    }

    // Get detailed stats for these videos
    const videosResponse = await withRateLimit('videos', () =>
      youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
      })
    );

    const videos = videosResponse.data.items || [];
    
    // Sort by view velocity (views per hour since published)
    const videosWithVelocity = videos.map(video => {
      const publishedAt = new Date(video.snippet.publishedAt);
      const hoursSincePublish = Math.max(1, (now - publishedAt) / (1000 * 60 * 60));
      const views = parseInt(video.statistics.viewCount || 0);
      const velocity = views / hoursSincePublish;
      
      return {
        ...video,
        velocity,
        hoursSincePublish
      };
    });

    // Sort by velocity to get fastest growing videos
    videosWithVelocity.sort((a, b) => b.velocity - a.velocity);
    
    setCache(cacheKey, videosWithVelocity);
    return videosWithVelocity;
  } catch (error) {
    console.error('Error fetching recent videos:', error);
    return [];
  }
}

// Search multiple trending queries to diversify data sources
export async function searchTrendingQueries(options = {}) {
  const {
    queries = [],
    hours = 24,
    regionCode = 'US',
    maxResultsPerQuery = 10
  } = options;

  const allVideos = [];
  const now = new Date();
  const publishedAfter = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

  for (const query of queries) {
    const cacheKey = `search-trending-${query}-${hours}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      allVideos.push(...cached);
      continue;
    }

    try {
      const videos = await searchVideos(query, {
        maxResults: maxResultsPerQuery,
        order: 'viewCount',
        publishedAfter,
        type: 'video'
      });

      // Calculate velocity for each video
      const videosWithMetrics = videos.map(video => {
        const publishedAt = new Date(video.snippet.publishedAt);
        const hoursSincePublish = Math.max(1, (now - publishedAt) / (1000 * 60 * 60));
        const views = parseInt(video.statistics.viewCount || 0);
        const velocity = views / hoursSincePublish;
        
        return {
          ...video,
          velocity,
          hoursSincePublish,
          searchQuery: query
        };
      });

      setCache(cacheKey, videosWithMetrics);
      allVideos.push(...videosWithMetrics);
    } catch (error) {
      console.error(`Error searching for query "${query}":`, error);
    }
  }

  return allVideos;
}

// Get emerging topics by comparing with historical data
export async function getEmergingTopics(videos, historicalTopics = []) {
  const currentTopics = new Map();
  const now = new Date();
  
  // Extract topics from current videos
  videos.forEach(video => {
    const content = `${video.snippet.title} ${video.snippet.description}`.toLowerCase();
    const tags = video.snippet.tags || [];
    
    // Extract multi-word phrases (2-4 words)
    const words = content.split(/\s+/).filter(w => w.length > 2);
    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(' ');
        
        // Skip common phrases
        if (phrase.match(/^(the|and|for|with|from|about|this|that|have|will)/i)) continue;
        
        const topic = phrase.charAt(0).toUpperCase() + phrase.slice(1);
        
        if (!currentTopics.has(topic)) {
          currentTopics.set(topic, {
            count: 0,
            videos: [],
            totalViews: 0,
            avgVelocity: 0,
            firstSeen: now,
            tags: new Set()
          });
        }
        
        const topicData = currentTopics.get(topic);
        topicData.count++;
        topicData.videos.push(video);
        topicData.totalViews += parseInt(video.statistics?.viewCount || 0);
        topicData.avgVelocity += video.velocity || 0;
        tags.forEach(tag => topicData.tags.add(tag));
      }
    }
  });
  
  // Calculate growth compared to historical data
  const emergingTopics = [];
  
  for (const [topic, data] of currentTopics) {
    // Only consider topics that appear in multiple videos
    if (data.count < 2) continue;
    
    const avgVelocity = data.avgVelocity / data.count;
    const avgViews = data.totalViews / data.count;
    
    // Check if this is a new topic (not in historical data)
    const historical = historicalTopics.find(h => h.topic_name === topic);
    let growthRate = 100; // Default 100% for new topics
    let isEmerging = true;
    
    if (historical) {
      // Calculate growth rate with safe division
      const historicalAvgViews = historical.avg_views || avgViews;
      if (historicalAvgViews > 0) {
        growthRate = Math.min(9999, ((avgViews - historicalAvgViews) / historicalAvgViews) * 100);
      } else {
        growthRate = avgViews > 0 ? 999 : 0;
      }
      
      // Consider emerging if growth > 50%
      isEmerging = growthRate > 50;
    }
    
    if (isEmerging) {
      emergingTopics.push({
        topic,
        count: data.count,
        avgViews,
        avgVelocity,
        growthRate,
        isNew: !historical,
        videos: data.videos.slice(0, 3), // Top 3 videos
        tags: Array.from(data.tags).slice(0, 5)
      });
    }
  }
  
  // Sort by velocity (fastest growing first)
  emergingTopics.sort((a, b) => b.avgVelocity - a.avgVelocity);
  
  return emergingTopics.slice(0, 20); // Top 20 emerging topics
}

export async function analyzeTrendingTopics(videos) {
  const analysis = {
    trendingKeywords: {},
    popularFormats: {},
    optimalDuration: null,
    bestPublishTime: {},
    viralFactors: [],
  };

  // Extract keywords from trending video titles
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from']);
  
  videos.forEach(video => {
    const words = video.snippet.title.toLowerCase().match(/\b[a-z]+\b/g) || [];
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        analysis.trendingKeywords[word] = (analysis.trendingKeywords[word] || 0) + 1;
      }
    });

    // Analyze video duration
    const duration = video.contentDetails.duration;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const totalSeconds = 
        (parseInt(match[1] || 0) * 3600) +
        (parseInt(match[2] || 0) * 60) +
        parseInt(match[3] || 0);
      
      if (totalSeconds < 60) {
        analysis.popularFormats.shorts = (analysis.popularFormats.shorts || 0) + 1;
      } else if (totalSeconds < 600) {
        analysis.popularFormats.medium = (analysis.popularFormats.medium || 0) + 1;
      } else {
        analysis.popularFormats.long = (analysis.popularFormats.long || 0) + 1;
      }
    }

    // Analyze publish time
    const publishDate = new Date(video.snippet.publishedAt);
    const dayOfWeek = publishDate.toLocaleDateString('en-US', { weekday: 'long' });
    analysis.bestPublishTime[dayOfWeek] = (analysis.bestPublishTime[dayOfWeek] || 0) + 1;
  });

  // Sort trending keywords
  analysis.trendingKeywords = Object.entries(analysis.trendingKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .reduce((acc, [word, count]) => {
      acc[word] = count;
      return acc;
    }, {});

  // Determine optimal format
  const formatCounts = Object.entries(analysis.popularFormats);
  if (formatCounts.length > 0) {
    analysis.optimalDuration = formatCounts.sort((a, b) => b[1] - a[1])[0][0];
  }

  // Identify viral factors
  const highPerformers = videos.filter(v => parseInt(v.statistics.viewCount) > 1000000);
  if (highPerformers.length > 0) {
    const avgTitleLength = highPerformers.reduce((sum, v) => sum + v.snippet.title.length, 0) / highPerformers.length;
    analysis.viralFactors.push(`Optimal title length: ${Math.round(avgTitleLength)} characters`);
    
    const hasEmoji = highPerformers.filter(v => /[\u{1F600}-\u{1F64F}]/u.test(v.snippet.title)).length;
    if (hasEmoji > highPerformers.length * 0.3) {
      analysis.viralFactors.push('Use emojis in titles');
    }
    
    const hasNumbers = highPerformers.filter(v => /\d+/.test(v.snippet.title)).length;
    if (hasNumbers > highPerformers.length * 0.5) {
      analysis.viralFactors.push('Include numbers in titles');
    }
  }

  return analysis;
}