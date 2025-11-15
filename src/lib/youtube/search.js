import { google } from 'googleapis';

// Always use production domain for YouTube API requests
// YouTube API keys are restricted to specific domains configured in Google Cloud Console
const YOUTUBE_REFERER_URL = 'https://scriptd.vercel.app';

// Configure YouTube client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Create request options with headers
const requestOptions = {
  headers: {
    'Referer': YOUTUBE_REFERER_URL,
    'Origin': YOUTUBE_REFERER_URL
  }
};

export async function searchYouTubeChannels({
  query,
  maxResults = 20,
  type = 'channel',
  order = 'relevance'
}) {
  try {
    // Search for channels with referer header
    const searchResponse = await youtube.search.list(
      {
        part: ['snippet'],
        q: query,
        type: type,
        maxResults: maxResults,
        order: order
      },
      requestOptions  // Pass headers as second parameter
    );

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

    // Fetch detailed channel information with referer header
    const channelsResponse = await youtube.channels.list(
      {
        part: ['snippet', 'statistics', 'contentDetails'],
        id: channelIds.join(',')
      },
      requestOptions  // Pass headers as second parameter
    );

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

    const channelsResponse = await youtube.channels.list(
      {
        part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
        id: Array.isArray(channelIds) ? channelIds.join(',') : channelIds
      },
      requestOptions  // Pass headers as second parameter
    );

    return channelsResponse.data.items || [];
  } catch (error) {
    console.error('Error fetching channels by IDs:', error);
    throw new Error(`Failed to fetch channels: ${error.message}`);
  }
}