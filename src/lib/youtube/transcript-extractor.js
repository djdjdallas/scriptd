/**
 * YouTube Transcript Extractor
 *
 * Extracts and analyzes video transcripts from YouTube videos.
 * Handles multiple caption types, performs NLP analysis, and provides
 * structured data for script generation research.
 *
 * IMPORTANT: This tool is for RESEARCH and ANALYSIS only.
 * All extracted content must be used in accordance with fair use principles.
 */

import { YoutubeTranscript } from '@danielxceron/youtube-transcript';

/**
 * Formats seconds into MM:SS timestamp
 */
function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Extracts the videoId from various YouTube URL formats
 */
export function extractVideoId(urlOrId) {
  // If it's already just an ID (11 characters), return it
  if (urlOrId && urlOrId.length === 11 && !urlOrId.includes('/') && !urlOrId.includes('?')) {
    return urlOrId;
  }

  try {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = urlOrId.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

/**
 * Analyzes the first 30 seconds of transcript to identify hook patterns
 */
function analyzeHook(segments) {
  // Get text from first 30 seconds
  const hookSegments = segments.filter(seg => seg.start < 30);
  const hookText = hookSegments.map(seg => seg.text).join(' ').toLowerCase();

  // Identify common hook patterns
  const patterns = {
    question: /\?|what|why|how|when|where|who/i,
    statement: /today|this video|gonna show you|in this video/i,
    shock: /can't believe|you won't believe|shocking|incredible|amazing/i,
    story: /story|happened|remember when|let me tell you/i,
    problem: /problem|issue|struggle|difficult|challenge/i
  };

  let detectedPattern = 'direct'; // default
  let effectiveness = 'medium';

  for (const [pattern, regex] of Object.entries(patterns)) {
    if (regex.test(hookText)) {
      detectedPattern = pattern;
      break;
    }
  }

  // Determine effectiveness based on length and engagement indicators
  const wordCount = hookText.split(/\s+/).length;
  if (wordCount < 50 && (detectedPattern === 'question' || detectedPattern === 'shock')) {
    effectiveness = 'high';
  } else if (wordCount > 100) {
    effectiveness = 'low';
  }

  return {
    firstThirtySeconds: hookSegments.map(seg => seg.text).join(' ').trim(),
    pattern: detectedPattern,
    effectiveness,
    wordCount
  };
}

/**
 * Extracts key phrases and their frequency from text
 */
function extractKeyPhrases(text, limit = 10) {
  // Simple word frequency analysis
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3); // Only words longer than 3 chars

  // Common words to exclude
  const stopWords = new Set([
    'that', 'this', 'with', 'from', 'have', 'they', 'will', 'what',
    'about', 'when', 'make', 'like', 'just', 'know', 'take', 'people',
    'into', 'year', 'your', 'some', 'could', 'them', 'than', 'then',
    'been', 'were', 'said', 'there', 'each', 'which', 'their', 'would'
  ]);

  // Count word frequency
  const wordFreq = {};
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Sort by frequency and return top phrases
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([phrase, frequency]) => ({ phrase, frequency }));
}

/**
 * Identifies main topics from transcript text
 */
function extractMainTopics(text, limit = 5) {
  const keyPhrases = extractKeyPhrases(text, 20);

  // Group related phrases into topics
  const topics = keyPhrases
    .slice(0, limit)
    .map(item => item.phrase)
    .map(phrase => {
      // Capitalize first letter
      return phrase.charAt(0).toUpperCase() + phrase.slice(1);
    });

  return topics;
}

/**
 * Identifies potential timestamps for topic changes and key moments
 */
function identifyKeyTimestamps(segments) {
  const timestamps = [];
  const callToActionPhrases = [
    'subscribe', 'like', 'comment', 'share', 'click', 'check out',
    'link in description', 'bell icon', 'follow'
  ];

  segments.forEach((segment, index) => {
    const text = segment.text.toLowerCase();

    // Detect calls to action
    if (callToActionPhrases.some(phrase => text.includes(phrase))) {
      timestamps.push({
        time: Math.floor(segment.start),
        description: segment.text.substring(0, 50) + (segment.text.length > 50 ? '...' : ''),
        type: 'call_to_action'
      });
    }

    // Detect potential topic changes (longer pauses or transition words)
    if (index > 0 && index < segments.length - 1) {
      const gap = segment.start - (segments[index - 1].start + segments[index - 1].duration);
      if (gap > 2) { // 2+ second pause might indicate topic change
        timestamps.push({
          time: Math.floor(segment.start),
          description: segment.text.substring(0, 50) + (segment.text.length > 50 ? '...' : ''),
          type: 'topic_change'
        });
      }
    }
  });

  // Limit to most significant timestamps
  return timestamps.slice(0, 15);
}

/**
 * Main function to extract and analyze YouTube video transcript
 */
export async function extractTranscript(videoId) {
  try {
    // Extract the video ID if a URL was provided
    const cleanVideoId = extractVideoId(videoId);

    if (!cleanVideoId) {
      throw new Error('Invalid video ID or URL');
    }

    // Fetch transcript using youtube-transcript library
    const transcriptData = await YoutubeTranscript.fetchTranscript(cleanVideoId);

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error('No transcript available for this video');
    }

    // Process transcript segments
    const segments = transcriptData.map(item => ({
      text: item.text,
      start: item.offset / 1000, // Convert milliseconds to seconds
      duration: item.duration / 1000, // Convert milliseconds to seconds
      timestamp: formatTimestamp(item.offset / 1000)
    }));

    // Combine all text for analysis
    const fullText = segments.map(seg => seg.text).join(' ');

    // Calculate metadata
    const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
    const totalDuration = segments[segments.length - 1].start + segments[segments.length - 1].duration;
    const wordsPerMinute = Math.round((wordCount / totalDuration) * 60);
    const estimatedReadingTime = Math.ceil(wordCount / 200); // Average reading speed

    // Perform analysis
    const mainTopics = extractMainTopics(fullText);
    const keyPhrases = extractKeyPhrases(fullText);
    const hookAnalysis = analyzeHook(segments);
    const timestamps = identifyKeyTimestamps(segments);

    return {
      success: true,
      videoId: cleanVideoId,
      transcript: {
        language: 'en', // The library doesn't provide language info, defaulting to English
        type: 'auto', // Assume auto-generated unless we can detect otherwise
        fullText,
        segments,
        metadata: {
          wordCount,
          duration: Math.floor(totalDuration),
          wordsPerMinute,
          estimatedReadingTime
        },
        analysis: {
          mainTopics,
          keyPhrases,
          hookAnalysis,
          timestamps
        }
      }
    };

  } catch (error) {
    console.error('❌ Transcript extraction error:', error);

    // Provide user-friendly error messages
    let errorMessage = 'Failed to extract transcript';

    if (error.message.includes('Transcript is disabled') ||
        error.message.includes('No transcript available')) {
      errorMessage = 'This video does not have captions available. Captions may be disabled by the video owner.';
    } else if (error.message.includes('Invalid video')) {
      errorMessage = 'Invalid video ID or URL provided';
    } else if (error.message.includes('Video unavailable')) {
      errorMessage = 'This video is unavailable, private, or age-restricted';
    } else if (error.message.includes('Too Many Requests')) {
      errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
    }

    throw new Error(errorMessage);
  }
}

/**
 * Copyright and fair use guidelines
 */
export const FAIR_USE_GUIDELINES = {
  warning: 'This transcript is for REFERENCE and ANALYSIS only. All content belongs to the original creator.',
  fairUse: [
    'Use transcripts to analyze content structure and patterns',
    'Identify topics and keywords for inspiration',
    'Understand hook techniques and storytelling approaches',
    'Create transformative commentary or critique',
    'Always provide proper attribution to the original creator'
  ],
  notAllowed: [
    'Never copy transcript content word-for-word into scripts',
    'Do not reproduce large portions without transformation',
    'Do not use transcripts without attribution',
    'Avoid commercial use that competes with the original'
  ]
};

/**
 * Generates a copyright notice for a specific video
 */
export function generateCopyrightNotice(videoTitle, channelTitle, videoUrl) {
  return {
    warning: FAIR_USE_GUIDELINES.warning,
    fairUse: FAIR_USE_GUIDELINES.fairUse,
    attribution: `Original content by ${channelTitle}: "${videoTitle}"\nSource: ${videoUrl}`,
    originalVideo: {
      title: videoTitle,
      channel: channelTitle,
      url: videoUrl
    }
  };
}
