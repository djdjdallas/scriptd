/**
 * SupaData YouTube API Integration
 * https://www.supadata.ai/
 */

import { withRetry, isRateLimitError, createApiError } from '@/lib/utils/retry';

const SUPADATA_API_URL = 'https://api.supadata.ai/v1';

/**
 * Fetch recent videos from a YouTube channel using SupaData
 * @param {string} channelId - YouTube channel ID
 * @param {number} maxResults - Number of videos to fetch (default: 10)
 * @returns {Promise<Array>} Array of video objects
 */
export async function fetchChannelRecentVideos(channelId, maxResults = 10) {
  const apiKey = process.env.SUPADATA_API_KEY;

  if (!apiKey) {
    console.warn('SUPADATA_API_KEY not configured');
    return [];
  }

  try {
    return await withRetry(
      async () => {
        const response = await fetch(
          `${SUPADATA_API_URL}/youtube/videos?id=${channelId}&max_results=${maxResults}&order=date`,
          {
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw createApiError(
            `SupaData API error: ${response.status} - ${errorText}`,
            response.status,
            response
          );
        }

        const data = await response.json();

        if (!data.videos || !Array.isArray(data.videos)) {
          return [];
        }

        // Transform to simplified format
        return data.videos.map(video => ({
          title: video.title || '',
          description: video.description || '',
          videoId: video.id || video.video_id || '',
          publishedAt: video.published_at || video.publishedAt || '',
          viewCount: video.view_count || video.viewCount || 0,
          likeCount: video.like_count || video.likeCount || 0,
          commentCount: video.comment_count || video.commentCount || 0,
          duration: video.duration || '',
          tags: video.tags || [],
        }));
      },
      {
        maxRetries: 3,
        baseDelayMs: 1000,
        shouldRetry: isRateLimitError
      }
    );
  } catch (error) {
    console.error('Error fetching videos from SupaData after retries:', error.message);
    return [];
  }
}

/**
 * Fetch channel information using SupaData
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<Object|null>} Channel object or null
 */
export async function fetchChannelInfo(channelId) {
  const apiKey = process.env.SUPADATA_API_KEY;

  if (!apiKey) {
    console.error('SUPADATA_API_KEY environment variable is not set');
    return null;
  }

  try {
    return await withRetry(
      async () => {
        const response = await fetch(
          `${SUPADATA_API_URL}/youtube/channel?id=${channelId}`,
          {
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw createApiError(
            `SupaData API error: ${response.status} - ${errorText}`,
            response.status,
            response
          );
        }

        const data = await response.json();

        return {
          id: data.id || data.channel_id || channelId,
          title: data.title || data.name || '',
          description: data.description || '',
          subscriberCount: data.subscriber_count || data.subscriberCount || 0,
          viewCount: data.view_count || data.viewCount || 0,
          videoCount: data.video_count || data.videoCount || 0,
          customUrl: data.custom_url || data.customUrl || '',
          thumbnails: data.thumbnails || {},
          publishedAt: data.published_at || data.publishedAt || '',
        };
      },
      {
        maxRetries: 3,
        baseDelayMs: 1000,
        shouldRetry: isRateLimitError
      }
    );
  } catch (error) {
    console.error('Error fetching channel info from SupaData after retries:', error.message);
    return null;
  }
}

/**
 * Search for videos using SupaData
 * @param {string} query - Search query
 * @param {number} maxResults - Number of results (default: 10)
 * @returns {Promise<Array>} Array of video objects
 */
export async function searchVideos(query, maxResults = 10) {
  const apiKey = process.env.SUPADATA_API_KEY;

  if (!apiKey) {
    console.warn('SUPADATA_API_KEY not configured');
    return [];
  }

  try {
    return await withRetry(
      async () => {
        const response = await fetch(
          `${SUPADATA_API_URL}/youtube/search?q=${encodeURIComponent(query)}&max_results=${maxResults}&type=video`,
          {
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw createApiError(
            `SupaData API error: ${response.status} - ${errorText}`,
            response.status,
            response
          );
        }

        const data = await response.json();

        return data.videos || [];
      },
      {
        maxRetries: 3,
        baseDelayMs: 1000,
        shouldRetry: isRateLimitError
      }
    );
  } catch (error) {
    console.error('Error searching videos with SupaData after retries:', error.message);
    return [];
  }
}
