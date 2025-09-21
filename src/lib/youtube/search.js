import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export async function searchYouTubeChannels({
  query,
  maxResults = 20,
  type = 'channel',
  order = 'relevance'
}) {
  try {
    // Search for channels
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: type,
      maxResults: maxResults,
      order: order
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return [];
    }

    // Get channel IDs
    const channelIds = searchResponse.data.items
      .map(item => item.snippet.channelId || item.id.channelId)
      .filter(Boolean);

    if (channelIds.length === 0) {
      return [];
    }

    // Fetch detailed channel information
    const channelsResponse = await youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: channelIds.join(',')
    });

    return channelsResponse.data.items || [];
  } catch (error) {
    console.error('YouTube search error:', error);
    throw new Error(`Failed to search YouTube channels: ${error.message}`);
  }
}

export async function getChannelsByIds(channelIds) {
  try {
    if (!channelIds || channelIds.length === 0) {
      return [];
    }

    const channelsResponse = await youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
      id: Array.isArray(channelIds) ? channelIds.join(',') : channelIds
    });

    return channelsResponse.data.items || [];
  } catch (error) {
    console.error('Error fetching channels by IDs:', error);
    throw new Error(`Failed to fetch channels: ${error.message}`);
  }
}