import { getYouTubeClient, withRateLimit, getCached, setCache, extractChannelId } from './client.js';

export async function getChannelByUrl(url) {
  const channelInfo = extractChannelId(url);
  if (!channelInfo) {
    throw new Error('Invalid YouTube channel URL');
  }

  const cacheKey = `channel-${channelInfo.value}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();

  try {
    let channelId;

    if (channelInfo.type === 'id') {
      channelId = channelInfo.value;
    } else {
      // For @handles, we need to use a different approach
      // First try searching by the handle/username
      console.log('Searching for channel with identifier:', channelInfo.value);
      
      // Clean the handle (remove @ if present)
      const cleanHandle = channelInfo.value.replace('@', '');
      
      // Try searching for the channel
      const searchResponse = await withRateLimit('search', () =>
        youtube.search.list({
          part: ['snippet'],
          q: cleanHandle,
          type: ['channel'],
          maxResults: 10,
        })
      );

      console.log('Search response items:', searchResponse.data.items?.length || 0);

      // Try to find exact match or closest match
      let channel = searchResponse.data.items?.find(item => {
        const title = item.snippet.channelTitle.toLowerCase();
        const searchTerm = cleanHandle.toLowerCase();
        
        // Check for exact match or if title contains the search term
        return title === searchTerm || 
               title.includes(searchTerm) ||
               item.snippet.description?.toLowerCase().includes(searchTerm);
      });

      // If no exact match, try to use forHandle parameter (YouTube API v3)
      if (!channel && searchResponse.data.items?.length > 0) {
        // Use the first result as fallback
        channel = searchResponse.data.items[0];
        console.log('Using first search result as fallback:', channel.snippet.channelTitle);
      }

      if (!channel) {
        console.error('No channel found for identifier:', channelInfo.value);
        throw new Error(`Channel not found for: ${channelInfo.value}`);
      }

      channelId = channel.snippet.channelId;
    }

    // Get full channel details
    const response = await withRateLimit('channels', () =>
      youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
        id: [channelId],
      })
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

export async function getChannelById(channelId) {
  const cacheKey = `channel-${channelId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();

  try {
    const response = await withRateLimit('channels', () =>
      youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
        id: [channelId],
      })
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
      })
    );

    const videoIds = response.data.items.map(item => item.contentDetails.videoId);

    // Get detailed video information
    const videosResponse = await withRateLimit('videos', () =>
      youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
      })
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