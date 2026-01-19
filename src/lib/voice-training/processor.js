import { createClient } from '@/lib/supabase/server';
import { getChannelVideos } from '@/lib/youtube/channel';
import { getVideoTranscript } from '@/lib/youtube/video';

/** Concurrency limit for parallel transcript fetching */
const TRANSCRIPT_CONCURRENCY_LIMIT = 5;

/**
 * Parse ISO 8601 duration string to seconds
 * @param {string} duration - ISO 8601 duration (e.g., "PT10M30S", "PT1H2M10S")
 * @returns {number} Duration in seconds
 */
function parseISO8601Duration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetch transcripts for multiple videos with concurrency limit
 * @param {Array<{id: string, title: string}>} videos - Videos to fetch transcripts for
 * @param {number} concurrencyLimit - Maximum parallel requests
 * @returns {Promise<Map<string, {fullText: string, hasTranscript: boolean}>>} Map of videoId to transcript data
 */
async function fetchTranscriptsInBatches(videos, concurrencyLimit = TRANSCRIPT_CONCURRENCY_LIMIT) {
  const transcriptMap = new Map();
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < videos.length; i += concurrencyLimit) {
    const batch = videos.slice(i, i + concurrencyLimit);

    const batchResults = await Promise.allSettled(
      batch.map(async (video) => {
        try {
          const transcript = await getVideoTranscript(video.id);
          return { videoId: video.id, videoTitle: video.title, transcript };
        } catch (error) {
          console.warn('Transcript fetch failed', {
            videoId: video.id,
            videoTitle: video.title,
            error: error.message
          });
          return { videoId: video.id, videoTitle: video.title, transcript: null };
        }
      })
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        const { videoId, transcript } = result.value;
        transcriptMap.set(videoId, transcript);
        if (transcript?.hasTranscript) {
          successCount++;
        } else {
          failureCount++;
        }
      } else {
        failureCount++;
      }
    }
  }

  console.log(`[Voice Training] Transcript fetch complete: ${successCount} succeeded, ${failureCount} failed/unavailable`);
  return transcriptMap;
}

/**
 * Transform YouTube API video response to the format expected by extractTrainingData
 * @param {Object} video - YouTube API video object
 * @param {Object|null} transcript - Transcript data from getVideoTranscript
 * @returns {Object} Transformed video object
 */
function transformYouTubeVideo(video, transcript) {
  return {
    id: video.id,
    title: video.snippet?.title || '',
    description: video.snippet?.description || '',
    transcript: transcript?.hasTranscript ? transcript.fullText : '',
    duration: parseISO8601Duration(video.contentDetails?.duration),
    publishedAt: video.snippet?.publishedAt || new Date().toISOString()
  };
}

export async function processVoiceTraining({
  channelId,
  userId: _userId,
  channelData,
  isFree: _isFree = true // Always free
}) {
  const supabase = await createClient();
  
  try {
    // Fetch channel videos for training data
    const videos = await fetchChannelVideos(channelData.youtube_channel_id || channelData.channel_id, 10);
    
    // Extract training data from videos
    const trainingData = await extractTrainingData(videos, channelData);
    
    // Create or update voice profile
    const { data: voiceProfile, error: profileError } = await supabase
      .from('voice_profiles')
      .upsert({
        channel_id: channelId,
        profile_name: `${channelData.title || channelData.name} Voice`,
        training_data: {
          samples: trainingData.samples,
          patterns: trainingData.patterns,
          vocabulary: trainingData.vocabulary,
          sampleCount: videos.length,
          totalWords: trainingData.totalWords,
          analyzedAt: new Date().toISOString(),
          isFree: true // Mark as free training
        },
        parameters: {
          characteristics: trainingData.characteristics,
          tone: trainingData.tone,
          style: trainingData.style,
          pacing: trainingData.pacing,
          commonPhrases: trainingData.commonPhrases,
          vocabulary: trainingData.uniqueVocabulary
        },
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'channel_id'
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Failed to create voice profile: ${profileError.message}`);
    }

    // Return the profile data
    return {
      success: true,
      profile: voiceProfile.parameters,
      profileId: voiceProfile.id,
      trainingStats: {
        videosAnalyzed: videos.length,
        totalWords: trainingData.totalWords,
        uniquePhrases: trainingData.patterns.length,
        vocabularySize: trainingData.vocabulary.length,
        isFree: true
      }
    };

  } catch (error) {
    console.error('Voice training processing error:', error);
    throw error;
  }
}

/**
 * Fetch channel videos with real transcripts for voice training
 * @param {string} channelId - YouTube channel ID
 * @param {number} limit - Maximum number of videos to fetch (default: 10)
 * @returns {Promise<Array<{id: string, title: string, description: string, transcript: string, duration: number, publishedAt: string}>>}
 */
async function fetchChannelVideos(channelId, limit = 10) {
  try {
    // Fetch real videos from YouTube API
    const youtubeVideos = await getChannelVideos(channelId, limit);

    if (!youtubeVideos || youtubeVideos.length === 0) {
      console.warn(`[Voice Training] No videos found for channel: ${channelId}`);
      return [];
    }

    // Prepare video metadata for transcript fetching
    const videosWithMetadata = youtubeVideos.map(video => ({
      id: video.id,
      title: video.snippet?.title || `Video ${video.id}`
    }));

    // Fetch transcripts in parallel with concurrency limit
    const transcriptMap = await fetchTranscriptsInBatches(videosWithMetadata);

    // Transform videos to expected format
    const transformedVideos = youtubeVideos.map(video => {
      const transcript = transcriptMap.get(video.id);
      return transformYouTubeVideo(video, transcript);
    });

    // Log summary
    const withTranscripts = transformedVideos.filter(v => v.transcript).length;
    console.log(`[Voice Training] Fetched ${transformedVideos.length} videos, ${withTranscripts} with transcripts for channel: ${channelId}`);

    return transformedVideos;

  } catch (error) {
    console.error(`[Voice Training] Error fetching channel videos for ${channelId}:`, error.message);
    throw error;
  }
}

async function extractTrainingData(videos, _channelData) {
  
  // Aggregate all transcripts
  const allText = videos
    .map(v => `${v.title} ${v.description} ${v.transcript}`)
    .join(' ');
  
  // Extract patterns and vocabulary
  const words = allText.toLowerCase().split(/\s+/);
  const uniqueWords = [...new Set(words)];
  
  // Find common phrases (simplified)
  const phrases = extractCommonPhrases(allText);
  
  // Analyze style and tone
  const styleAnalysis = analyzeStyle(allText);
  
  return {
    samples: videos.map(v => ({
      id: v.id,
      text: v.transcript,
      duration: v.duration
    })),
    patterns: phrases,
    vocabulary: uniqueWords.slice(0, 1000), // Top 1000 words
    totalWords: words.length,
    uniqueVocabulary: uniqueWords.slice(0, 500),
    commonPhrases: phrases.slice(0, 50),
    characteristics: {
      averageVideoLength: videos.reduce((sum, v) => sum + v.duration, 0) / videos.length,
      vocabularyRichness: uniqueWords.length / words.length,
      ...styleAnalysis.characteristics
    },
    tone: styleAnalysis.tone,
    style: styleAnalysis.style,
    pacing: styleAnalysis.pacing
  };
}

function extractCommonPhrases(text) {
  // Simple phrase extraction (in production, use NLP library)
  const phrases = [];
  const words = text.toLowerCase().split(/\s+/);
  
  // Extract 2-4 word phrases
  for (let i = 0; i < words.length - 3; i++) {
    phrases.push(words.slice(i, i + 2).join(' '));
    phrases.push(words.slice(i, i + 3).join(' '));
    phrases.push(words.slice(i, i + 4).join(' '));
  }
  
  // Count phrase frequency
  const phraseCount = {};
  phrases.forEach(phrase => {
    phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
  });
  
  // Return top phrases
  return Object.entries(phraseCount)
    .filter(([phrase, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([phrase]) => phrase);
}

function analyzeStyle(text) {
  // Simple style analysis (in production, use AI/NLP)
  const lower = text.toLowerCase();
  
  // Determine tone based on keywords
  let tone = 'neutral';
  if (lower.includes('excited') || lower.includes('amazing') || lower.includes('awesome')) {
    tone = 'enthusiastic';
  } else if (lower.includes('professional') || lower.includes('technical')) {
    tone = 'professional';
  } else if (lower.includes('fun') || lower.includes('lol') || lower.includes('haha')) {
    tone = 'casual';
  }
  
  // Determine style
  let style = 'informative';
  if (lower.includes('tutorial') || lower.includes('how to')) {
    style = 'educational';
  } else if (lower.includes('review') || lower.includes('opinion')) {
    style = 'analytical';
  } else if (lower.includes('story') || lower.includes('experience')) {
    style = 'narrative';
  }
  
  // Determine pacing
  const sentences = text.split(/[.!?]+/);
  const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
  let pacing = 'moderate';
  if (avgWordsPerSentence < 10) {
    pacing = 'fast';
  } else if (avgWordsPerSentence > 20) {
    pacing = 'slow';
  }
  
  return {
    tone,
    style,
    pacing,
    characteristics: {
      sentenceComplexity: avgWordsPerSentence,
      exclamationUsage: (text.match(/!/g) || []).length,
      questionUsage: (text.match(/\?/g) || []).length,
      emphasisWords: (lower.match(/very|really|absolutely|definitely/g) || []).length
    }
  };
}