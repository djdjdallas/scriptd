import { YoutubeTranscript } from '@danielxceron/youtube-transcript';
import { getYouTubeClient, withRateLimit, getCached, setCache, getRequestOptions } from './client.js';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

export async function getVideoById(videoId) {
  const cacheKey = `video-${videoId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();
  const requestOptions = getRequestOptions();

  try {
    const response = await withRateLimit('videos', () =>
      youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [videoId],
      }, requestOptions)
    );

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    setCache(cacheKey, video);
    return video;
  } catch (error) {
    apiLogger.error('Error fetching video', error, { videoId });
    throw error;
  }
}

/**
 * Get transcript from Supabase cache
 */
async function getTranscriptFromCache(videoId) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('video_transcripts_cache')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return null;
    }

    // Update access count and last accessed time
    await supabase
      .from('video_transcripts_cache')
      .update({
        access_count: data.access_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('video_id', videoId);

    return {
      segments: data.transcript_data.segments || [],
      fullText: data.full_text,
      hasTranscript: data.has_transcript,
      fromCache: true,
      cachedAt: data.cached_at
    };
  } catch (error) {
    apiLogger.warn('Error reading from transcript cache', { error: error.message });
    return null;
  }
}

/**
 * Save transcript to Supabase cache
 * Uses different TTLs for positive vs negative results to prevent cache poisoning
 */
async function saveTranscriptToCache(videoId, transcriptData) {
  try {
    const supabase = await createClient();

    // Use shorter TTL for negative results (24 hours) vs positive results (7 days)
    // This prevents cache poisoning when transcripts become available later
    const ttlMs = transcriptData.hasTranscript
      ? 7 * 24 * 60 * 60 * 1000  // 7 days for successful transcripts
      : 24 * 60 * 60 * 1000;     // 24 hours for failed/no transcript

    const { error } = await supabase
      .from('video_transcripts_cache')
      .upsert({
        video_id: videoId,
        transcript_data: {
          segments: transcriptData.segments
        },
        full_text: transcriptData.fullText,
        has_transcript: transcriptData.hasTranscript,
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + ttlMs).toISOString(),
        access_count: 0,
        last_accessed_at: new Date().toISOString()
      }, {
        onConflict: 'video_id'
      });

    if (error) {
      apiLogger.warn('Error saving to transcript cache', { error: error.message });
    }
  } catch (error) {
    apiLogger.warn('Error saving to transcript cache', { error: error.message });
  }
}

/**
 * Fetch transcript from Supadata.ai API (fallback when scraping fails)
 * API Docs: https://docs.supadata.ai/youtube/get-transcript
 */
async function getTranscriptFromSupadata(videoId) {
  const apiKey = process.env.SUPADATA_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {

    const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=false`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supadata API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Supadata returns: { content: [{text, offset, duration, lang}], lang, availableLangs }
    if (!data.content || !Array.isArray(data.content)) {
      throw new Error('Invalid Supadata API response format');
    }

    // Convert Supadata format to our format
    const segments = data.content.map(chunk => ({
      text: chunk.text,
      offset: chunk.offset,
      duration: chunk.duration
    }));

    const fullText = data.content
      .map(chunk => chunk.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      segments,
      fullText,
      hasTranscript: true,
      source: 'supadata-api',
      language: data.lang,
      availableLanguages: data.availableLangs || []
    };

  } catch (error) {
    // Log Supadata API failures for monitoring and debugging
    // This helps detect API key issues, quota exhaustion, or service outages
    // apiLogger.error automatically sends to Sentry in production
    apiLogger.error('Supadata API failed to fetch transcript', error, {
      videoId,
      hasApiKey: !!process.env.SUPADATA_API_KEY,
      service: 'supadata'
    });

    return null;
  }
}

export async function getVideoTranscript(videoId) {
  // Check in-memory cache first (fast)
  const cacheKey = `transcript-${videoId}`;
  const memoryCached = getCached(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }

  // Check Supabase cache (persistent)
  const dbCached = await getTranscriptFromCache(videoId);
  if (dbCached) {
    setCache(cacheKey, dbCached); // Also store in memory for this session
    return dbCached;
  }

  try {
    let transcript = null;
    let lastError = null;

    // The youtube-transcript package has issues with language codes
    // Try without any config first - this often works best
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (e) {
      lastError = e;

      // Try different approaches based on error
      const attempts = [
        { config: { lang: 'en' }, name: 'lang: en' },
        { config: { country: 'US' }, name: 'country: US' },
        { config: { lang: 'en', country: 'US' }, name: 'lang: en, country: US' }
      ];

      for (const attempt of attempts) {
        try {
          transcript = await YoutubeTranscript.fetchTranscript(videoId, attempt.config);

          if (transcript && transcript.length > 0) {
            break;
          }
        } catch (e2) {
          lastError = e2;
        }
      }
    }

    if (!transcript || transcript.length === 0) {
      // FALLBACK: Try Supadata.ai API before giving up

      const apiTranscript = await getTranscriptFromSupadata(videoId);

      if (apiTranscript) {
        // Success! Cache and return
        setCache(cacheKey, apiTranscript);
        await saveTranscriptToCache(videoId, apiTranscript);
        return apiTranscript;
      }

      // Both scraping AND API failed - cache negative result
      const noTranscriptResult = {
        segments: [],
        fullText: '',
        hasTranscript: false,
        error: lastError?.message || 'No transcript found (tried scraping + API)'
      };

      await saveTranscriptToCache(videoId, noTranscriptResult);
      throw lastError || new Error('No transcript found');
    }

    // Combine transcript segments into full text
    const fullText = transcript
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const result = {
      segments: transcript,
      fullText,
      hasTranscript: true,
      source: 'youtube-scraping' // Track that this came from scraping
    };

    // Save to both caches
    setCache(cacheKey, result); // Memory cache
    await saveTranscriptToCache(videoId, result); // DB cache

    return result;
  } catch (error) {
    apiLogger.warn('Error fetching transcript', { videoId, error: error.message });
    return {
      segments: [],
      fullText: '',
      hasTranscript: false,
      error: error.message,
    };
  }
}

export async function analyzeVideoContent(videos) {
  const analysis = {
    totalVideos: videos.length,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    avgViewsPerVideo: 0,
    avgEngagementRate: 0,
    topPerformingVideos: [],
    contentPatterns: {},
    uploadFrequency: {},
    transcriptsAvailable: 0,
    topics: {},
  };

  // Calculate basic statistics
  videos.forEach(video => {
    const views = parseInt(video.statistics.viewCount || 0);
    const likes = parseInt(video.statistics.likeCount || 0);
    const comments = parseInt(video.statistics.commentCount || 0);
    
    analysis.totalViews += views;
    analysis.totalLikes += likes;
    analysis.totalComments += comments;
  });

  analysis.avgViewsPerVideo = Math.round(analysis.totalViews / videos.length);
  
  // Calculate engagement rate (likes + comments / views)
  if (analysis.totalViews > 0) {
    analysis.avgEngagementRate = ((analysis.totalLikes + analysis.totalComments) / analysis.totalViews * 100).toFixed(2);
  }

  // Sort videos by performance
  analysis.topPerformingVideos = videos
    .sort((a, b) => parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount))
    .slice(0, 5)
    .map(video => ({
      id: video.id,
      title: video.snippet.title,
      views: parseInt(video.statistics.viewCount),
      likes: parseInt(video.statistics.likeCount || 0),
      publishedAt: video.snippet.publishedAt,
    }));

  // Analyze upload frequency
  const uploadDates = videos.map(v => new Date(v.snippet.publishedAt));
  const monthCounts = {};
  
  uploadDates.forEach(date => {
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });
  
  analysis.uploadFrequency = monthCounts;

  // Analyze content patterns from titles and descriptions
  const commonWords = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those']);
  
  videos.forEach(video => {
    const text = `${video.snippet.title} ${video.snippet.description}`.toLowerCase();
    const words = text.match(/\b[a-z]+\b/g) || [];
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        commonWords[word] = (commonWords[word] || 0) + 1;
      }
    });
  });

  // Get top content patterns
  analysis.contentPatterns = Object.entries(commonWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .reduce((acc, [word, count]) => {
      acc[word] = count;
      return acc;
    }, {});

  return analysis;
}

export async function extractVideoTopics(videos, sampleSize = 10) {
  const topics = {
    categories: {},
    themes: [],
    keywords: {},
    contentTypes: {},
  };

  // Sample videos for transcript analysis
  const sampleVideos = videos.slice(0, sampleSize);
  let transcriptsAnalyzed = 0;

  for (const video of sampleVideos) {
    const transcript = await getVideoTranscript(video.id);
    
    if (transcript.hasTranscript) {
      transcriptsAnalyzed++;
      
      // Extract themes from transcript
      const text = transcript.fullText.toLowerCase();
      const sentences = text.split(/[.!?]+/);
      
      // Simple keyword extraction (can be enhanced with NLP)
      const words = text.match(/\b[a-z]+\b/g) || [];
      const wordFreq = {};
      
      words.forEach(word => {
        if (word.length > 4) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
      
      // Add to overall topics
      Object.entries(wordFreq).forEach(([word, count]) => {
        if (count > 2) {
          topics.keywords[word] = (topics.keywords[word] || 0) + count;
        }
      });
    }
    
    // Categorize by video title patterns
    const title = video.snippet.title.toLowerCase();
    if (title.includes('tutorial') || title.includes('how to')) {
      topics.contentTypes.tutorial = (topics.contentTypes.tutorial || 0) + 1;
    } else if (title.includes('review')) {
      topics.contentTypes.review = (topics.contentTypes.review || 0) + 1;
    } else if (title.includes('vlog') || title.includes('day in')) {
      topics.contentTypes.vlog = (topics.contentTypes.vlog || 0) + 1;
    } else if (title.includes('q&a') || title.includes('questions')) {
      topics.contentTypes.qa = (topics.contentTypes.qa || 0) + 1;
    }
  }

  // Sort keywords by frequency
  topics.keywords = Object.entries(topics.keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .reduce((acc, [word, count]) => {
      acc[word] = count;
      return acc;
    }, {});

  topics.transcriptsAnalyzed = transcriptsAnalyzed;
  topics.totalVideos = videos.length;

  return topics;
}