import { NextResponse } from 'next/server';
import { extractTranscript, extractVideoId, generateCopyrightNotice, FAIR_USE_GUIDELINES } from '@/lib/youtube/transcript-extractor';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * POST /api/workflow/transcript-extract
 *
 * Extract and analyze YouTube video transcripts for research purposes
 *
 * ⚠️ CRITICAL: Transcripts are for RESEARCH and ANALYSIS ONLY
 * Users must follow fair use guidelines and never reproduce content verbatim
 *
 * Request body:
 * {
 *   videoId: string - YouTube video ID or URL
 *   videoTitle: string - Video title (optional, for better tracking)
 *   channelTitle: string - Channel name (optional, for attribution)
 *   videoUrl: string - Full video URL (optional, for reference)
 *   workflowId: string - Workflow ID for saving to database (optional)
 *   includeAnalysis: boolean - Whether to include detailed analysis (default: true)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   videoId: string,
 *   videoTitle: string,
 *   videoUrl: string,
 *   transcript: {
 *     language: string,
 *     type: string,
 *     fullText: string,
 *     segments: Array<Segment>,
 *     metadata: Object,
 *     analysis: Object
 *   },
 *   copyrightNotice: Object,
 *   timestamp: string
 * }
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const {
      videoId: rawVideoId,
      videoTitle,
      channelTitle,
      videoUrl,
      workflowId,
      includeAnalysis = true
    } = body;

    // Validate required parameters
    if (!rawVideoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'videoId or video URL is required'
        },
        { status: 400 }
      );
    }

    // Extract clean video ID from URL or ID
    const videoId = extractVideoId(rawVideoId);

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid video ID or URL format'
        },
        { status: 400 }
      );
    }

    // Extract transcript
    const result = await extractTranscript(videoId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to extract transcript'
        },
        { status: 500 }
      );
    }

    // Generate copyright notice with attribution
    const fullVideoUrl = videoUrl || `https://www.youtube.com/watch?v=${videoId}`;
    const copyrightNotice = generateCopyrightNotice(
      videoTitle || 'Unknown Video',
      channelTitle || 'Unknown Channel',
      fullVideoUrl
    );

    // Save transcript to dedicated workflow_video_transcripts table if workflowId provided
    let transcriptDbId = null;
    if (workflowId) {
      try {

        const supabase = createServiceClient();

        // Prepare transcript entry for dedicated table
        const transcriptEntry = {
          workflow_id: workflowId,
          video_id: videoId,
          video_url: fullVideoUrl,
          video_title: videoTitle || 'Unknown Video',
          channel_name: channelTitle || 'Unknown Channel',
          channel_id: null, // Could be extracted from video details if needed
          video_duration: result.transcript.metadata.duration,
          transcript_language: result.transcript.language || 'en',
          transcript_type: result.transcript.type || 'auto',
          word_count: result.transcript.metadata.wordCount,
          extraction_date: new Date().toISOString(),
          transcript_data: {
            fullText: result.transcript.fullText,
            segments: result.transcript.segments,
            metadata: result.transcript.metadata
          },
          analysis_data: {
            mainTopics: result.transcript.analysis.mainTopics,
            keyPhrases: result.transcript.analysis.keyPhrases,
            hookAnalysis: result.transcript.analysis.hookAnalysis,
            timestamps: result.transcript.analysis.timestamps
          },
          is_starred: false,
          is_selected: true, // Auto-select newly extracted transcripts
          relevance_score: calculateRelevance(result.transcript),
          user_notes: null,
          user_tags: [],
          research_id: null, // Will be set when user adds to research
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('workflow_video_transcripts')
          .insert(transcriptEntry)
          .select()
          .single();

        if (error) {
          // Don't fail the request, just continue
        } else {
          transcriptDbId = data.id;
        }
      } catch {
        // Continue even if database save fails
      }
    }

    const processingTime = Date.now() - startTime;

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      videoId,
      videoTitle: videoTitle || 'Unknown Video',
      videoUrl: fullVideoUrl,
      channelTitle: channelTitle || 'Unknown Channel',
      transcript: result.transcript,

      // ⚠️ COPYRIGHT AND USAGE INFORMATION
      copyrightNotice,
      usageGuidelines: {
        warning: FAIR_USE_GUIDELINES.warning,
        allowed: FAIR_USE_GUIDELINES.fairUse,
        notAllowed: FAIR_USE_GUIDELINES.notAllowed,
        reminder: [
          '⚠️ This transcript is for RESEARCH ONLY',
          '✅ Use to analyze structure, topics, and techniques',
          '✅ Create transformative commentary',
          '❌ NEVER copy word-for-word into your scripts',
          '✅ Always attribute to the original creator'
        ]
      },

      // Metadata
      metadata: {
        workflowId: workflowId || null,
        transcriptDbId: transcriptDbId,
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
        apiVersion: '1.0',
        savedToDatabase: !!transcriptDbId
      }
    });

  } catch (error) {
    // Provide user-friendly error messages
    let errorMessage = 'Failed to extract transcript';
    let statusCode = 500;

    if (error.message.includes('captions available') ||
        error.message.includes('captions disabled')) {
      errorMessage = 'This video does not have captions available. The creator may have disabled captions.';
      statusCode = 404;
    } else if (error.message.includes('Invalid video')) {
      errorMessage = 'Invalid video ID or URL. Please check and try again.';
      statusCode = 400;
    } else if (error.message.includes('unavailable') ||
               error.message.includes('private') ||
               error.message.includes('age-restricted')) {
      errorMessage = 'This video is unavailable, private, or age-restricted.';
      statusCode = 403;
    } else if (error.message.includes('Rate limit')) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
      statusCode = 429;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        troubleshooting: {
          noCaptions: 'Ask the creator to enable captions',
          ageRestricted: 'Cannot extract transcripts from age-restricted videos',
          private: 'Cannot access transcripts from private videos',
          rateLimit: 'Wait 30-60 seconds before trying again'
        }
      },
      { status: statusCode }
    );
  }
}

/**
 * Calculate relevance score based on transcript quality
 * This helps prioritize high-quality transcripts in the research step
 */
function calculateRelevance(transcript) {
  let score = 0.5; // Base score

  // Higher word count = more detailed content
  if (transcript.metadata.wordCount > 1000) score += 0.2;
  if (transcript.metadata.wordCount > 3000) score += 0.1;

  // Good speaking pace indicates professional content
  const wpm = transcript.metadata.wordsPerMinute;
  if (wpm >= 120 && wpm <= 180) score += 0.1; // Optimal speaking pace

  // More topics = more comprehensive
  if (transcript.analysis.mainTopics.length >= 5) score += 0.1;

  // Cap at 1.0
  return Math.min(score, 1.0);
}

/**
 * GET /api/workflow/transcript-extract
 *
 * Get information about the transcript extraction API
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/workflow/transcript-extract',
    method: 'POST',
    description: 'Extract and analyze YouTube video transcripts for research',
    parameters: {
      videoId: 'string (required) - YouTube video ID or URL',
      videoTitle: 'string (optional) - Video title for tracking',
      channelTitle: 'string (optional) - Channel name for attribution',
      videoUrl: 'string (optional) - Full video URL',
      workflowId: 'string (optional) - Save to workflow_research table',
      includeAnalysis: 'boolean (optional, default: true) - Include AI analysis'
    },
    features: [
      'Extract full video transcript with timestamps',
      'Analyze hook patterns (first 30 seconds)',
      'Identify main topics and key phrases',
      'Detect calls-to-action and topic changes',
      'Calculate speaking pace and content metrics',
      'Save to research database for workflow integration'
    ],
    copyrightNotice: '⚠️ Transcripts are for RESEARCH ONLY. Follow fair use guidelines.',
    fairUse: {
      allowed: [
        'Analyze content structure and techniques',
        'Identify topics and keywords for inspiration',
        'Study hook patterns and engagement strategies',
        'Create transformative commentary or critique',
        'Reference with proper attribution'
      ],
      notAllowed: [
        'Copy transcript word-for-word into scripts',
        'Reproduce without attribution',
        'Use for competing commercial content',
        'Claim as original work'
      ]
    },
    documentation: {
      example: {
        videoId: 'dQw4w9WgXcQ',
        workflowId: '123e4567-e89b-12d3-a456-426614174000',
        includeAnalysis: true
      },
      response: {
        transcript: {
          segments: 'Array of text segments with timestamps',
          metadata: 'Word count, duration, speaking pace',
          analysis: 'Topics, keywords, hook analysis, key moments'
        }
      }
    }
  });
}
