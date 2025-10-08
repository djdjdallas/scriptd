import { NextResponse } from 'next/server';
import { searchRelatedVideos, getSuggestedReferences, getVideoChapters } from '@/lib/youtube/video-search';
import { COPYRIGHT_WARNING } from '@/lib/youtube/fair-use-guidelines';

/**
 * POST /api/workflow/video-search
 *
 * Search YouTube for related videos to use as references in script workflow
 *
 * ⚠️ CRITICAL: All videos returned are for REFERENCE PURPOSES ONLY
 * Users must follow fair use guidelines and provide proper attribution
 *
 * Request body:
 * {
 *   topic: string - Topic or keywords to search for
 *   workflowId: string - Workflow ID for tracking
 *   options: {
 *     maxResults: number - Maximum results (default: 10)
 *     duration: string - Filter by duration: 'short', 'medium', 'long'
 *     order: string - Sort order: 'relevance', 'date', 'viewCount', 'rating'
 *     license: string - License filter: 'any', 'creativeCommon'
 *   }
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   videos: Array<VideoObject>,
 *   references: Array<ReferenceObject>,
 *   copyrightWarning: string,
 *   usageGuidelines: Object,
 *   timestamp: string
 * }
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const { topic, workflowId, options = {} } = body;

    // Validate required parameters
    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic is required'
        },
        { status: 400 }
      );
    }

    console.log(`[API] Video search request: topic="${topic}", workflow=${workflowId}`);

    // Extract search options
    const searchOptions = {
      topic,
      maxResults: options.maxResults || 10,
      duration: options.duration || null, // 'short', 'medium', 'long', or null for any
      order: options.order || 'relevance', // 'relevance', 'date', 'viewCount', 'rating'
      license: options.license || 'any', // 'any' or 'creativeCommon'
      regionCode: options.regionCode || 'US'
    };

    // Perform video search
    const searchResult = await searchRelatedVideos(searchOptions);

    if (!searchResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: searchResult.error || 'Failed to search videos'
        },
        { status: 500 }
      );
    }

    // Get suggested reference points from top videos
    const references = await getSuggestedReferences(searchResult.videos, 5);

    // Fetch detailed chapters for top 3 videos with chapters
    const videosWithChapters = searchResult.videos
      .filter(v => v.chapters && v.chapters.length > 0)
      .slice(0, 3);

    const detailedReferences = [];
    for (const video of videosWithChapters) {
      try {
        const chaptersResult = await getVideoChapters(video.videoId);
        if (chaptersResult.success) {
          detailedReferences.push({
            videoId: video.videoId,
            videoTitle: video.title,
            channelTitle: video.channelTitle,
            chapters: chaptersResult.chapters,
            copyrightWarning: chaptersResult.copyrightWarning,
            url: video.url
          });
        }
      } catch (error) {
        console.error(`[API] Error fetching chapters for ${video.videoId}:`, error);
        // Continue with other videos
      }
    }

    const processingTime = Date.now() - startTime;

    // Return comprehensive response with copyright warnings
    return NextResponse.json({
      success: true,
      videos: searchResult.videos,
      count: searchResult.videos.length,
      searchQuery: topic,
      references: references,
      detailedReferences: detailedReferences,

      // ⚠️ COPYRIGHT AND USAGE INFORMATION
      copyrightWarning: COPYRIGHT_WARNING.detailed,
      copyrightNotice: '⚠️ All videos are for REFERENCE ONLY. You must follow fair use guidelines.',

      usageGuidelines: {
        allowed: [
          '✅ Reference for commentary and criticism',
          '✅ Educational analysis with original insights',
          '✅ Minimal use with proper attribution',
          '✅ Link to original video for full context',
          '✅ Transformative use with added value'
        ],
        notAllowed: [
          '❌ Downloading or reproducing video content',
          '❌ Re-uploading videos without permission',
          '❌ Using without attribution to creator',
          '❌ Wholesale copying of content',
          '❌ Commercial use that harms original creator'
        ],
        requirements: [
          'Always provide attribution (channel, title, URL)',
          'Add substantial original commentary',
          'Use only what is necessary',
          'Ensure transformative use',
          'Respect takedown requests'
        ]
      },

      // Metadata
      metadata: {
        workflowId: workflowId || null,
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
        apiVersion: '1.0'
      }
    });

  } catch (error) {
    console.error('[API] Video search error:', error);

    // Check if it's a rate limit error
    if (error.message && error.message.includes('Rate limit')) {
      return NextResponse.json(
        {
          success: false,
          error: 'YouTube API rate limit reached. Please try again in a moment.',
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    // Check if it's an API key error
    if (error.message && error.message.includes('API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'YouTube API is not configured. Please add YOUTUBE_API_KEY to environment variables.'
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search videos. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflow/video-search
 *
 * Get information about the video search API
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/workflow/video-search',
    method: 'POST',
    description: 'Search YouTube for videos to reference in scripts',
    parameters: {
      topic: 'string (required) - Topic or keywords to search',
      workflowId: 'string (optional) - Workflow ID for tracking',
      options: {
        maxResults: 'number (optional, default: 10) - Maximum results',
        duration: 'string (optional) - "short", "medium", or "long"',
        order: 'string (optional, default: "relevance") - "relevance", "date", "viewCount", or "rating"',
        license: 'string (optional, default: "any") - "any" or "creativeCommon"'
      }
    },
    copyrightNotice: '⚠️ All videos are for REFERENCE ONLY. Follow fair use guidelines and provide attribution.',
    documentation: {
      fairUse: 'Videos are for commentary, criticism, and educational use only',
      attribution: 'Always provide channel name, video title, and URL',
      transformation: 'Add substantial original commentary and analysis',
      limitations: 'Do not download, reproduce, or re-upload video content'
    }
  });
}
