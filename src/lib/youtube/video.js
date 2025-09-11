import { YoutubeTranscript } from '@danielxceron/youtube-transcript';
import { getYouTubeClient, withRateLimit, getCached, setCache } from './client.js';

export async function getVideoById(videoId) {
  const cacheKey = `video-${videoId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const youtube = getYouTubeClient();

  try {
    const response = await withRateLimit('videos', () =>
      youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [videoId],
      })
    );

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    setCache(cacheKey, video);
    return video;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
}

export async function getVideoTranscript(videoId) {
  const cacheKey = `transcript-${videoId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    let transcript = null;
    let lastError = null;
    
    // The youtube-transcript package has issues with language codes
    // Try without any config first - this often works best
    try {
      console.log(`Fetching transcript for ${videoId} (default/auto-detect)...`);
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (transcript && transcript.length > 0) {
        console.log(`✓ Found transcript for ${videoId} using auto-detect`);
      }
    } catch (e) {
      lastError = e;
      console.log(`Auto-detect failed for ${videoId}: ${e.message}`);
      
      // Try different approaches based on error
      const attempts = [
        { config: { lang: 'en' }, name: 'lang: en' },
        { config: { country: 'US' }, name: 'country: US' },
        { config: { lang: 'en', country: 'US' }, name: 'lang: en, country: US' }
      ];
      
      for (const attempt of attempts) {
        try {
          console.log(`Trying ${attempt.name} for ${videoId}...`);
          transcript = await YoutubeTranscript.fetchTranscript(videoId, attempt.config);
          
          if (transcript && transcript.length > 0) {
            console.log(`✓ Found transcript for ${videoId} using ${attempt.name}`);
            break;
          }
        } catch (e2) {
          console.log(`Failed with ${attempt.name}: ${e2.message}`);
          lastError = e2;
        }
      }
    }
    
    if (!transcript || transcript.length === 0) {
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
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error fetching transcript for ${videoId}:`, error.message);
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