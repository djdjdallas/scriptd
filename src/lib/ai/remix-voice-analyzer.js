import Anthropic from '@anthropic-ai/sdk';
import { getChannelVideos } from '@/lib/youtube/channel';
import { getVideoTranscript } from '@/lib/youtube/video';
import { analyzeVoiceStyle } from '@/lib/youtube/voice-analyzer';
import { analyzeVoiceStyleAdvanced } from '@/lib/youtube/voice-analyzer-v2';

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use VOICE_MODEL for voice analysis (Sonnet provides excellent results at lower cost)
const VOICE_MODEL = process.env.VOICE_MODEL || process.env.PREMIUM_MODEL || 'claude-sonnet-4-20250514';

/**
 * Fetch and analyze actual transcripts from YouTube channels
 * This provides real voice analysis instead of theoretical blending
 */
export async function analyzeChannelVoicesFromYouTube(channels, config) {
  const channelAnalyses = [];
  
  for (const channel of channels) {
    console.log(`\n📺 Analyzing voice for channel: ${channel.title || channel.name}`);
    
    try {
      // Extract YouTube channel ID from various possible fields
      const youtubeChannelId = channel.youtube_channel_id || 
                              channel.channelId || 
                              channel.youtubeChannelId ||
                              channel.channel_id;
      
      console.log(`  YouTube Channel ID: ${youtubeChannelId || 'NOT FOUND'}`);
      
      // Skip if not a real YouTube channel (e.g., custom/remix channels)
      if (!youtubeChannelId || youtubeChannelId.startsWith('remix_')) {
        console.log(`  ⚠️ Skipping non-YouTube channel: ${channel.title} (no valid YouTube ID)`);
        channelAnalyses.push({
          channel: channel,
          voiceAnalysis: null,
          source: 'skipped',
          error: 'Not a YouTube channel'
        });
        continue;
      }

      // Check if channel already has a trained voice profile
      if (channel.voice_profile && Object.keys(channel.voice_profile).length > 0) {
        console.log(`  ✓ Using existing voice profile for ${channel.title}`);
        channelAnalyses.push({
          channel: channel,
          voiceAnalysis: channel.voice_profile,
          source: 'existing',
          videosAnalyzed: 0
        });
        continue;
      }

      // Fetch videos from the channel
      console.log(`  🔍 Fetching videos from YouTube channel: ${youtubeChannelId}`);
      const videos = await getChannelVideos(youtubeChannelId, 10);
      
      if (!videos || videos.length === 0) {
        console.log(`  ⚠️ No videos found for channel: ${channel.title}`);
        channelAnalyses.push({
          channel: channel,
          voiceAnalysis: null,
          source: 'no-videos',
          error: 'No videos found'
        });
        continue;
      }

      // Fetch transcripts from videos
      const transcripts = [];
      const analyzedVideos = [];
      const maxTranscripts = 5; // Analyze up to 5 videos per channel for remix
      
      console.log(`  📝 Attempting to fetch transcripts from ${videos.length} videos...`);
      
      for (const video of videos) {
        if (transcripts.length >= maxTranscripts) break;
        
        try {
          const transcript = await getVideoTranscript(video.id);
          
          if (transcript.hasTranscript && transcript.fullText) {
            transcripts.push(transcript.fullText);
            analyzedVideos.push({
              id: video.id,
              title: video.snippet.title,
              publishedAt: video.snippet.publishedAt
            });
            console.log(`    ✓ Got transcript: ${video.snippet.title.substring(0, 50)}...`);
          } else {
            console.log(`    ✗ No transcript: ${video.snippet.title.substring(0, 50)}...`);
          }
        } catch (error) {
          console.log(`    ✗ Error: ${error.message}`);
        }
      }

      // Analyze the transcripts if we have any
      let voiceAnalysis = null;
      let source = 'none';
      
      if (transcripts.length > 0) {
        console.log(`  🧠 Analyzing ${transcripts.length} transcripts...`);
        
        // Run both basic and advanced analysis
        const basicAnalysis = await analyzeVoiceStyle(transcripts);
        const advancedAnalysis = await analyzeVoiceStyleAdvanced(transcripts);
        
        voiceAnalysis = {
          ...basicAnalysis,
          advanced: advancedAnalysis,
          analyzedVideos: analyzedVideos,
          transcriptCount: transcripts.length
        };
        source = 'youtube-transcripts';
        
        console.log(`  ✅ Successfully analyzed voice from ${transcripts.length} videos`);
      } else {
        // Fallback to metadata analysis if no transcripts
        console.log(`  ⚠️ No transcripts available, using video metadata...`);
        const videoTexts = videos.slice(0, 3).map(v => 
          `${v.snippet.title}. ${v.snippet.description}`
        );
        
        voiceAnalysis = await analyzeVoiceStyle(videoTexts);
        source = 'metadata';
      }

      channelAnalyses.push({
        channel: channel,
        voiceAnalysis: voiceAnalysis,
        source: source,
        videosAnalyzed: analyzedVideos.length,
        videos: analyzedVideos
      });

    } catch (error) {
      console.error(`  ❌ Error analyzing channel ${channel.title}:`, error.message);
      channelAnalyses.push({
        channel: channel,
        voiceAnalysis: null,
        source: 'error',
        error: error.message
      });
    }
  }

  return channelAnalyses;
}

/**
 * Combine real voice analyses from multiple channels
 * This creates a data-driven remix instead of theoretical
 */
export async function combineRealVoiceAnalyses(channelAnalyses, config) {
  // Filter out channels without voice analysis
  const validAnalyses = channelAnalyses.filter(ca => ca.voiceAnalysis);
  
  if (validAnalyses.length === 0) {
    console.log('⚠️ No valid voice analyses to combine');
    return {
      success: false,
      error: 'No voice analyses available',
      fallback: generateFallbackVoiceProfile()
    };
  }

  try {
    // Prepare data for Claude to combine
    const analysisData = validAnalyses.map(ca => ({
      channelName: ca.channel.title || ca.channel.name,
      weight: config.weights?.[ca.channel.id] || (1 / validAnalyses.length),
      voiceAnalysis: ca.voiceAnalysis,
      source: ca.source,
      videosAnalyzed: ca.videosAnalyzed
    }));

    const prompt = `You are an expert voice coach and linguistic analyst. You need to create a COMBINED voice profile from these real voice analyses of YouTube channels.

ANALYZED CHANNELS:
${analysisData.map((data, i) => `
Channel ${i + 1}: ${data.channelName}
Weight: ${Math.round(data.weight * 100)}%
Videos Analyzed: ${data.videosAnalyzed}
Source: ${data.source}

Voice Analysis:
${JSON.stringify(data.voiceAnalysis, null, 2)}
`).join('\n---\n')}

REMIX CONFIGURATION:
- Channel Name: ${config.name}
- Description: ${config.description || 'Not provided'}

Create a UNIFIED voice profile that:
1. Combines the ACTUAL analyzed speech patterns weighted by importance
2. Merges vocabulary, tone, and style based on real data
3. Creates a cohesive voice that draws from all sources
4. Is based on REAL content analysis, not theoretical

The combined voice should feel natural and authentic, not like multiple personalities.

Include in your response:
- tone: Array of 3-5 tone descriptors
- style: Array of style elements
- personality: Array of 5-7 personality traits
- pace: Speaking pace (slow/moderate/fast/variable)
- energy: Energy level (low/medium/high/variable)
- vocabulary: Vocabulary style
- sentenceStructure: How they structure sentences
- hooks: Common hook patterns
- transitions: How they transition between topics
- engagement: How they engage the audience
- humor: Humor style and frequency
- signature_phrases: Any notable phrases or patterns
- dos: List of things to do
- donts: List of things to avoid
- summary: A brief description of the combined voice

Format as JSON.`;

    const response = await anthropic.messages.create({
      model: VOICE_MODEL,
      max_tokens: 3000,
      temperature: 0.7,
      system: "You are an expert at analyzing and combining speaking styles based on real transcript data. Create authentic, data-driven voice profiles.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse the response
    const content = response.content[0].text;
    let combinedProfile;
    
    try {
      combinedProfile = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        combinedProfile = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse combined voice profile');
      }
    }

    // Add metadata about the analysis
    combinedProfile.metadata = {
      channelsAnalyzed: validAnalyses.length,
      totalVideosAnalyzed: validAnalyses.reduce((sum, ca) => sum + (ca.videosAnalyzed || 0), 0),
      sources: validAnalyses.map(ca => ({
        channel: ca.channel.title,
        videosAnalyzed: ca.videosAnalyzed,
        source: ca.source
      })),
      createdAt: new Date().toISOString(),
      basedOnRealData: true
    };

    return {
      success: true,
      voiceProfile: combinedProfile,
      channelAnalyses: validAnalyses
    };

  } catch (error) {
    console.error('Error combining voice analyses:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackVoiceProfile()
    };
  }
}

/**
 * Generate a fallback voice profile
 */
function generateFallbackVoiceProfile() {
  return {
    tone: ['engaging', 'authentic', 'conversational'],
    style: ['informative', 'approachable'],
    personality: ['knowledgeable', 'friendly', 'enthusiastic'],
    pace: 'moderate',
    energy: 'medium',
    vocabulary: 'accessible',
    sentenceStructure: 'clear and concise',
    hooks: ['questions', 'surprising facts'],
    transitions: 'smooth and logical',
    engagement: 'direct address to audience',
    humor: 'light and occasional',
    signature_phrases: [],
    dos: ['Be authentic', 'Engage with the audience', 'Provide value'],
    donts: ['Overcomplicate', 'Rush through content'],
    summary: 'A balanced, engaging voice that combines multiple influences',
    metadata: {
      basedOnRealData: false,
      fallback: true
    }
  };
}