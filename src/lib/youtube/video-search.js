import { getYouTubeClient, withRateLimit, getCached, setCache } from './client.js';

/**
 * YouTube Video Search Service
 *
 * ⚠️ CRITICAL COPYRIGHT NOTICE:
 * This service is designed for REFERENCE PURPOSES ONLY.
 * Videos found through this service should be used for:
 * - Commentary and criticism (fair use)
 * - Educational analysis
 * - Reference material with proper attribution
 *
 * DO NOT use this service to:
 * - Download or reproduce video content
 * - Re-upload videos without permission
 * - Use content without attribution
 * - Cause harm to original creators
 */

/**
 * Parse ISO 8601 duration format (PT1H2M10S) to seconds and formatted string
 * @param {string} duration - ISO 8601 duration string
 * @returns {{seconds: number, formatted: string}}
 */
export function parseDuration(duration) {
  if (!duration) return { seconds: 0, formatted: '0:00' };

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return { seconds: 0, formatted: '0:00' };

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Format as HH:MM:SS or MM:SS
  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return { seconds: totalSeconds, formatted };
}

/**
 * Extract chapter timestamps from video description
 * Supports formats: "0:00 Title" or "00:00:00 Title" or "[0:00] Title"
 * @param {string} description - Video description text
 * @returns {Array<{time: string, seconds: number, title: string}>}
 */
export function extractChaptersFromDescription(description) {
  if (!description) return [];

  const chapters = [];
  const lines = description.split('\n');

  // Common timestamp patterns
  const patterns = [
    /^(?:\[)?(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\])?[\s-]*(.+)$/,  // [0:00] Title or 0:00 - Title
    /^(?:\[)?(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\])?\s*(.+)$/,     // 0:00 Title
  ];

  for (const line of lines) {
    const trimmedLine = line.trim();

    for (const pattern of patterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        const hours = match[3] ? parseInt(match[1]) : 0;
        const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1]);
        const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2]);
        const title = (match[4] || match[3]).trim();

        if (title) {
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          const timeStr = hours > 0
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            : `${minutes}:${seconds.toString().padStart(2, '0')}`;

          chapters.push({
            time: timeStr,
            seconds: totalSeconds,
            title: title
          });
        }
        break;
      }
    }
  }

  // Sort chapters by time
  chapters.sort((a, b) => a.seconds - b.seconds);

  return chapters;
}

/**
 * Calculate relevance score for a video based on search query
 * Considers title match, description match, engagement, and recency
 * @param {Object} video - Video object with metadata
 * @param {string} searchQuery - Search query string
 * @returns {number} - Relevance score between 0 and 1
 */
export function calculateRelevanceScore(video, searchQuery) {
  let score = 0.5; // Base score

  const query = searchQuery.toLowerCase();
  const title = (video.title || '').toLowerCase();
  const description = (video.description || '').toLowerCase();

  // Title match (most important)
  if (title.includes(query)) {
    score += 0.3;
  } else {
    // Partial word matches in title
    const queryWords = query.split(' ');
    const matchingWords = queryWords.filter(word => title.includes(word)).length;
    score += (matchingWords / queryWords.length) * 0.2;
  }

  // Description match
  if (description.includes(query)) {
    score += 0.1;
  }

  // Engagement score (views, likes, comments)
  const views = parseInt(video.viewCount || 0);
  const likes = parseInt(video.likeCount || 0);
  const comments = parseInt(video.commentCount || 0);

  // Engagement ratio (likes + comments per 1000 views)
  if (views > 0) {
    const engagementRatio = ((likes + comments) / views) * 1000;
    score += Math.min(engagementRatio / 100, 0.15); // Cap at 0.15
  }

  // Recency bonus (videos from last 30 days)
  if (video.publishedAt) {
    const publishDate = new Date(video.publishedAt);
    const daysSincePublish = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublish <= 30) {
      score += 0.05;
    }
  }

  // Cap score at 1.0
  return Math.min(score, 1.0);
}

/**
 * Search YouTube for videos related to a topic
 *
 * ⚠️ COPYRIGHT COMPLIANCE:
 * - Results are for REFERENCE only
 * - Users must provide attribution when referencing videos
 * - Do not download or reproduce video content
 * - Respect fair use guidelines
 *
 * @param {Object} options - Search options
 * @param {string} options.topic - Topic or keywords to search for
 * @param {number} options.maxResults - Maximum number of results (default: 10)
 * @param {string} options.duration - Filter by duration: 'short' (<4min), 'medium' (4-20min), 'long' (>20min)
 * @param {string} options.order - Sort order: 'relevance', 'date', 'viewCount', 'rating'
 * @param {string} options.license - Filter by license: 'any', 'creativeCommon'
 * @param {string} options.regionCode - Region code (e.g., 'US')
 * @returns {Promise<{success: boolean, videos: Array, error?: string}>}
 */
export async function searchRelatedVideos({
  topic,
  maxResults = 10,
  duration = null,
  order = 'relevance',
  license = 'any',
  regionCode = 'US'
}) {
  console.log(`[VideoSearch] Searching for: "${topic}" (max: ${maxResults}, duration: ${duration || 'any'}, license: ${license})`);

  try {
    // Check cache first
    const cacheKey = `video-search:${topic}:${maxResults}:${duration}:${order}:${license}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('[VideoSearch] Returning cached results');
      return cached;
    }

    const youtube = getYouTubeClient();

    // Search for videos
    const searchParams = {
      part: 'snippet',
      q: topic,
      type: 'video',
      maxResults: Math.min(maxResults, 50), // YouTube API limit
      order: order,
      regionCode: regionCode,
      videoEmbeddable: 'true', // Only embeddable videos
      videoSyndicated: 'true', // Only syndicated videos
    };

    // Add duration filter if specified
    if (duration && ['short', 'medium', 'long'].includes(duration)) {
      searchParams.videoDuration = duration;
    }

    // Add license filter for Creative Commons
    if (license === 'creativeCommon') {
      searchParams.videoLicense = 'creativeCommon';
    }

    // Execute search with rate limiting
    const searchResponse = await withRateLimit('video-search', async () => {
      return await youtube.search.list(searchParams);
    });

    const searchItems = searchResponse.data.items || [];

    if (searchItems.length === 0) {
      return {
        success: true,
        videos: [],
        message: 'No videos found for this search query'
      };
    }

    // Get video IDs for detailed information
    const videoIds = searchItems.map(item => item.id.videoId).filter(Boolean);

    // Fetch detailed video information (stats, duration, license)
    const videoDetailsResponse = await withRateLimit('video-details', async () => {
      return await youtube.videos.list({
        part: 'snippet,contentDetails,statistics,status',
        id: videoIds.join(',')
      });
    });

    const videoDetails = videoDetailsResponse.data.items || [];

    // Process and enrich video data
    const videos = videoDetails.map(video => {
      const snippet = video.snippet || {};
      const contentDetails = video.contentDetails || {};
      const statistics = video.statistics || {};
      const status = video.status || {};

      // Parse duration
      const durationInfo = parseDuration(contentDetails.duration);

      // Extract chapters from description
      const chapters = extractChaptersFromDescription(snippet.description);

      // Calculate relevance score
      const relevanceScore = calculateRelevanceScore({
        title: snippet.title,
        description: snippet.description,
        viewCount: statistics.viewCount,
        likeCount: statistics.likeCount,
        commentCount: statistics.commentCount,
        publishedAt: snippet.publishedAt
      }, topic);

      // Determine license type
      const isCreativeCommons = contentDetails.licensedContent === false ||
                                 contentDetails.license === 'creativeCommon';

      return {
        videoId: video.id,
        title: snippet.title,
        description: snippet.description,
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        publishedAt: snippet.publishedAt,
        thumbnails: snippet.thumbnails,
        duration: durationInfo.formatted,
        durationSeconds: durationInfo.seconds,
        viewCount: parseInt(statistics.viewCount || 0),
        likeCount: parseInt(statistics.likeCount || 0),
        commentCount: parseInt(statistics.commentCount || 0),
        isCreativeCommons: isCreativeCommons,
        license: isCreativeCommons ? 'Creative Commons' : 'Standard YouTube License',
        chapters: chapters,
        relevanceScore: relevanceScore,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        // ⚠️ Copyright warning embedded in data
        copyrightNotice: 'This video is for REFERENCE ONLY. Provide proper attribution and follow fair use guidelines.',
        usageGuidelines: {
          allowed: [
            'Reference for commentary',
            'Criticism and analysis',
            'Educational purposes',
            'Minimal use with attribution'
          ],
          notAllowed: [
            'Reproduction without permission',
            'Re-uploading content',
            'Using without credit',
            'Commercial exploitation'
          ]
        }
      };
    });

    // Sort by relevance score
    videos.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const result = {
      success: true,
      videos: videos,
      count: videos.length,
      searchQuery: topic
    };

    // Cache results
    setCache(cacheKey, result);

    console.log(`[VideoSearch] Found ${videos.length} videos`);
    return result;

  } catch (error) {
    console.error('[VideoSearch] Error:', error);
    return {
      success: false,
      videos: [],
      error: error.message || 'Failed to search videos'
    };
  }
}

/**
 * Get video chapters for use as reference points
 * Returns chapters with copyright warnings and fair use guidelines
 *
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<{success: boolean, chapters: Array, copyrightWarning: string}>}
 */
export async function getVideoChapters(videoId) {
  console.log(`[VideoSearch] Fetching chapters for video: ${videoId}`);

  try {
    // Check cache
    const cacheKey = `video-chapters:${videoId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const youtube = getYouTubeClient();

    // Fetch video details
    const videoResponse = await withRateLimit('video-details', async () => {
      return await youtube.videos.list({
        part: 'snippet,contentDetails',
        id: videoId
      });
    });

    const video = videoResponse.data.items?.[0];
    if (!video) {
      return {
        success: false,
        error: 'Video not found'
      };
    }

    const description = video.snippet?.description || '';
    const chapters = extractChaptersFromDescription(description);

    const result = {
      success: true,
      videoId: videoId,
      videoTitle: video.snippet?.title,
      chapters: chapters,
      copyrightWarning: '⚠️ These chapters are reference points only. Always provide attribution to the original video.',
      usageNote: 'When referencing specific chapters, include the video URL and timestamp in your attribution.'
    };

    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.error('[VideoSearch] Error fetching chapters:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch video chapters'
    };
  }
}

/**
 * Get suggested reference points for script writing
 * Returns top chapters from videos as potential reference moments
 *
 * ⚠️ IMPORTANT: These are suggestions for COMMENTARY and REFERENCE only
 *
 * @param {Array} videos - Array of video objects from searchRelatedVideos
 * @param {number} maxReferences - Maximum number of reference points to return
 * @returns {Array<{videoId, videoTitle, chapter, timestamp, referenceType, attributionRequired}>}
 */
export async function getSuggestedReferences(videos, maxReferences = 5) {
  console.log(`[VideoSearch] Generating reference suggestions from ${videos.length} videos`);

  const references = [];

  for (const video of videos.slice(0, 5)) { // Only process top 5 videos
    if (video.chapters && video.chapters.length > 0) {
      // Get first 2 chapters from each video as potential references
      const topChapters = video.chapters.slice(0, 2);

      for (const chapter of topChapters) {
        references.push({
          videoId: video.videoId,
          videoTitle: video.title,
          channelTitle: video.channelTitle,
          chapter: chapter.title,
          timestamp: chapter.time,
          timestampSeconds: chapter.seconds,
          url: `${video.url}&t=${chapter.seconds}s`,
          referenceType: 'chapter',
          attributionRequired: true,
          copyrightWarning: '⚠️ Must provide attribution when referencing',
          suggestedUse: 'Commentary or analysis of this specific moment',
          attribution: `"${chapter.title}" from "${video.title}" by ${video.channelTitle} (${video.url}&t=${chapter.seconds}s)`
        });

        if (references.length >= maxReferences) break;
      }
    }

    if (references.length >= maxReferences) break;
  }

  return references;
}

/**
 * Search specifically for Creative Commons licensed videos
 * These videos have more permissive usage rights but still require attribution
 *
 * @param {Object} options - Search options (same as searchRelatedVideos)
 * @returns {Promise<{success: boolean, videos: Array}>}
 */
export async function searchCreativeCommonsVideos(options) {
  console.log('[VideoSearch] Searching for Creative Commons videos');

  return await searchRelatedVideos({
    ...options,
    license: 'creativeCommon'
  });
}

/**
 * Get full video metadata for detailed reference
 * Useful when user wants to add a specific video as a reference
 *
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<{success: boolean, video: Object}>}
 */
export async function getVideoMetadata(videoId) {
  console.log(`[VideoSearch] Fetching metadata for video: ${videoId}`);

  try {
    // Check cache
    const cacheKey = `video-metadata:${videoId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const youtube = getYouTubeClient();

    const videoResponse = await withRateLimit('video-details', async () => {
      return await youtube.videos.list({
        part: 'snippet,contentDetails,statistics,status',
        id: videoId
      });
    });

    const video = videoResponse.data.items?.[0];
    if (!video) {
      return {
        success: false,
        error: 'Video not found'
      };
    }

    const snippet = video.snippet || {};
    const contentDetails = video.contentDetails || {};
    const statistics = video.statistics || {};

    const durationInfo = parseDuration(contentDetails.duration);
    const chapters = extractChaptersFromDescription(snippet.description);
    const isCreativeCommons = contentDetails.license === 'creativeCommon';

    const result = {
      success: true,
      video: {
        videoId: video.id,
        title: snippet.title,
        description: snippet.description,
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        publishedAt: snippet.publishedAt,
        thumbnails: snippet.thumbnails,
        duration: durationInfo.formatted,
        durationSeconds: durationInfo.seconds,
        viewCount: parseInt(statistics.viewCount || 0),
        likeCount: parseInt(statistics.likeCount || 0),
        commentCount: parseInt(statistics.commentCount || 0),
        isCreativeCommons: isCreativeCommons,
        license: isCreativeCommons ? 'Creative Commons' : 'Standard YouTube License',
        chapters: chapters,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        copyrightNotice: 'This video is for REFERENCE ONLY. Provide proper attribution.',
      }
    };

    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.error('[VideoSearch] Error fetching metadata:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch video metadata'
    };
  }
}
