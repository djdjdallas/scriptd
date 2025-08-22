import { getYouTubeClient, withRateLimit, getCached, setCache } from './client.js';

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