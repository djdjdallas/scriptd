import { getYouTubeClient, withRateLimit, getCached, setCache, extractChannelId, getRequestOptions } from './client.js';

export async function getChannelByUrl(url) {
  const channelInfo = extractChannelId(url);
  if (!channelInfo) {
    throw new Error('Invalid YouTube channel URL');
  }

  const cacheKey = `channel-${channelInfo.value}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();
  const requestOptions = getRequestOptions();

  try {
    let channelId;
    let channelData = null;

    if (channelInfo.type === 'id') {
      channelId = channelInfo.value;
    } else {
      // For @handles, we need to use a different approach
      console.log('Looking up channel with handle:', channelInfo.value);
      
      // Clean the handle (remove @ if present)
      const cleanHandle = channelInfo.value.replace('@', '');
      
      // First, try using the forHandle parameter (most accurate for handles)
      try {
        console.log('Attempting direct handle lookup with forHandle parameter...');
        const handleResponse = await withRateLimit('channels', () =>
          youtube.channels.list({ 
            part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
            forHandle: cleanHandle,
           }, requestOptions)
        );

        if (handleResponse.data.items && handleResponse.data.items.length > 0) {
          channelData = handleResponse.data.items[0];
          console.log('Successfully found channel via forHandle:', channelData.snippet.title);
          setCache(cacheKey, channelData);
          return channelData;
        }
      } catch (handleError) {
        console.log('forHandle lookup failed, trying fallback search...');
      }

      // Fallback: Search for the channel
      const searchResponse = await withRateLimit('search', () =>
        youtube.search.list({ 
          part: ['snippet'],
          q: cleanHandle,
          type: ['channel'],
          maxResults: 25, // Increased to find better matches
         }, requestOptions)
      );

      console.log('Search response items:', searchResponse.data.items?.length || 0);

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        throw new Error(`Channel not found for: ${channelInfo.value}`);
      }

      // Priority matching system
      let bestMatch = null;
      let bestScore = -1;

      for (const item of searchResponse.data.items) {
        const title = item.snippet.channelTitle;
        const titleLower = title.toLowerCase();
        const searchTerm = cleanHandle.toLowerCase();
        const customUrl = item.snippet.customUrl?.toLowerCase().replace('@', '');
        
        let score = 0;
        
        // Priority 1: Exact customUrl match (highest priority)
        if (customUrl === searchTerm) {
          score = 100;
          console.log(`Found exact customUrl match: ${title}`);
        }
        // Priority 2: Exact title match (case-insensitive)
        else if (titleLower === searchTerm) {
          score = 90;
          console.log(`Found exact title match: ${title}`);
        }
        // Priority 3: Title without spaces/special chars matches
        else if (titleLower.replace(/[^a-z0-9]/g, '') === searchTerm.replace(/[^a-z0-9]/g, '')) {
          score = 80;
          console.log(`Found normalized title match: ${title}`);
        }
        // Priority 4: Title starts with search term
        else if (titleLower.startsWith(searchTerm)) {
          score = 70;
        }
        // Priority 5: Title contains exact search term as a word
        else if (new RegExp(`\\b${searchTerm}\\b`).test(titleLower)) {
          score = 60;
        }
        // Priority 6: Title contains search term
        else if (titleLower.includes(searchTerm)) {
          score = 50;
        }
        // Priority 7: Description contains search term
        else if (item.snippet.description?.toLowerCase().includes(searchTerm)) {
          score = 30;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      }

      if (!bestMatch) {
        console.error('No suitable channel match found for:', channelInfo.value);
        // Last resort: use first result
        bestMatch = searchResponse.data.items[0];
        console.log('Using first search result as last resort:', bestMatch.snippet.channelTitle);
      } else {
        console.log(`Selected best match: ${bestMatch.snippet.channelTitle} (score: ${bestScore})`);
      }

      channelId = bestMatch.snippet.channelId;
    }

    // Get full channel details if we don't have them already
    if (!channelData) {
      const response = await withRateLimit('channels', () =>
        youtube.channels.list({ 
          part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
          id: [channelId],
         }, requestOptions)
      );

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      channelData = response.data.items[0];
    }
    
    setCache(cacheKey, channelData);
    return channelData;
  } catch (error) {
    console.error('Error fetching channel:', error);
    throw error;
  }
}

export async function getChannelById(channelId) {
  const cacheKey = `channel-${channelId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();
  const requestOptions = getRequestOptions();

  try {
    const response = await withRateLimit('channels', () =>
      youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
        id: [channelId],
       }, requestOptions)
    );

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channelData = response.data.items[0];
    setCache(cacheKey, channelData);
    return channelData;
  } catch (error) {
    console.error('Error fetching channel:', error);
    throw error;
  }
}

export async function getChannelVideos(channelId, maxResults = 50) {
  const cacheKey = `videos-${channelId}-${maxResults}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();
  const requestOptions = getRequestOptions();

  try {
    // First get the uploads playlist ID
    const channel = await getChannelById(channelId);
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    // Get videos from uploads playlist
    const response = await withRateLimit('playlistItems', () =>
      youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: uploadsPlaylistId,
        maxResults: Math.min(maxResults, 50),
      }, requestOptions)
    );

    const videoIds = response.data.items.map(item => item.contentDetails.videoId);

    // Get detailed video information
    const videosResponse = await withRateLimit('videos', () =>
      youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
       }, requestOptions)
    );

    const videos = videosResponse.data.items;
    setCache(cacheKey, videos);
    return videos;
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    throw error;
  }
}

export function parseChannelData(channelData) {
  return {
    id: channelData.id,
    title: channelData.snippet.title,
    description: channelData.snippet.description,
    customUrl: channelData.snippet.customUrl,
    publishedAt: channelData.snippet.publishedAt,
    thumbnails: channelData.snippet.thumbnails,
    statistics: {
      viewCount: parseInt(channelData.statistics.viewCount || 0),
      subscriberCount: parseInt(channelData.statistics.subscriberCount || 0),
      videoCount: parseInt(channelData.statistics.videoCount || 0),
    },
    brandingSettings: channelData.brandingSettings,
  };
}