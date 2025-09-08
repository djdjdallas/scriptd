import { google } from 'googleapis';

const youtube = google.youtube('v3');

/**
 * Extract transcript/captions from a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<{text: string, segments: Array}>}
 */
export async function getVideoTranscript(videoId) {
  try {
    // First, get video details to check for captions
    const videoResponse = await youtube.videos.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet', 'contentDetails'],
      id: [videoId]
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      throw new Error('Video not found');
    }

    // Get captions list
    const captionsResponse = await youtube.captions.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet'],
      videoId: videoId
    });

    const captions = captionsResponse.data.items || [];
    
    // Try to find English captions (auto-generated or manual)
    const englishCaption = captions.find(
      cap => cap.snippet.language === 'en' || cap.snippet.language === 'en-US'
    );

    if (!englishCaption) {
      // If no captions available, return empty
      return {
        text: '',
        segments: [],
        hasTranscript: false
      };
    }

    // Download the caption track
    // Note: This requires OAuth authentication for the actual download
    // For now, we'll use a workaround with youtube-transcript package
    
    return {
      text: '',
      segments: [],
      hasTranscript: true,
      message: 'Transcript extraction requires additional setup'
    };

  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
}

/**
 * Extract transcripts from multiple videos
 * @param {Array<string>} videoIds - Array of YouTube video IDs
 * @returns {Promise<Array>}
 */
export async function getMultipleTranscripts(videoIds) {
  const transcripts = [];
  
  for (const videoId of videoIds) {
    try {
      const transcript = await getVideoTranscript(videoId);
      transcripts.push({
        videoId,
        ...transcript
      });
    } catch (error) {
      console.error(`Failed to get transcript for ${videoId}:`, error);
      transcripts.push({
        videoId,
        text: '',
        segments: [],
        hasTranscript: false,
        error: error.message
      });
    }
  }
  
  return transcripts;
}

/**
 * Extract transcripts from a channel's recent videos
 * @param {string} channelId - YouTube channel ID
 * @param {number} maxVideos - Maximum number of videos to process
 * @returns {Promise<Array>}
 */
export async function getChannelTranscripts(channelId, maxVideos = 10) {
  try {
    // Get channel's recent videos
    const videosResponse = await youtube.search.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['id'],
      channelId: channelId,
      maxResults: maxVideos,
      order: 'date',
      type: 'video'
    });

    const videoIds = videosResponse.data.items.map(item => item.id.videoId);
    
    // Get transcripts for these videos
    const transcripts = await getMultipleTranscripts(videoIds);
    
    return transcripts;
  } catch (error) {
    console.error('Error fetching channel transcripts:', error);
    throw error;
  }
}

/**
 * Process and combine transcripts for analysis
 * @param {Array} transcripts - Array of transcript objects
 * @returns {string} Combined text
 */
export function combineTranscripts(transcripts) {
  return transcripts
    .filter(t => t.hasTranscript && t.text)
    .map(t => t.text)
    .join('\n\n');
}