import Anthropic from '@anthropic-ai/sdk';
import { analyzeChannelVoicesFromYouTube } from './remix-voice-analyzer';

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use the same model as remix for consistency
const ANALYSIS_MODEL = process.env.VOICE_MODEL || 'claude-sonnet-4-5-20250929';

/**
 * Comprehensive single channel analysis using Claude
 */
export async function analyzeChannelWithClaude(channel, videos, channelData) {
  try {
    // Prepare channel data for Claude
    const channelSummary = {
      name: channel.snippet?.title || channel.title || channel.name,
      subscribers: channel.statistics?.subscriberCount || channel.subscriber_count,
      totalViews: channel.statistics?.viewCount || channel.view_count,
      videoCount: channel.statistics?.videoCount || channel.video_count,
      description: channel.snippet?.description || channel.description || '',
      customUrl: channel.snippet?.customUrl || channel.handle,
      publishedAt: channel.snippet?.publishedAt || channel.created_at
    };

    // Analyze recent video performance
    const videoStats = videos.slice(0, 20).map(v => ({
      title: v.snippet?.title,
      views: parseInt(v.statistics?.viewCount || 0),
      likes: parseInt(v.statistics?.likeCount || 0),
      comments: parseInt(v.statistics?.commentCount || 0),
      publishedAt: v.snippet?.publishedAt
    }));

    const avgViews = videoStats.reduce((sum, v) => sum + v.views, 0) / videoStats.length;
    const avgEngagement = videoStats.reduce((sum, v) => sum + (v.likes + v.comments), 0) / videoStats.length;

    const prompt = `You are an expert YouTube growth strategist and channel analyst. Analyze this YouTube channel and provide a comprehensive strategy for growth and success.

CHANNEL OVERVIEW:
- Name: ${channelSummary.name}
- Subscribers: ${parseInt(channelSummary.subscribers || 0).toLocaleString()}
- Total Views: ${parseInt(channelSummary.totalViews || 0).toLocaleString()}
- Video Count: ${channelSummary.videoCount}
- Channel Age: ${channelSummary.publishedAt ? new Date(channelSummary.publishedAt).toLocaleDateString() : 'Unknown'}
- Description: ${channelSummary.description.slice(0, 300)}

PERFORMANCE METRICS:
- Average Views per Video: ${Math.round(avgViews).toLocaleString()}
- Average Engagement (Likes + Comments): ${Math.round(avgEngagement).toLocaleString()}
- Views to Subscriber Ratio: ${channelSummary.subscribers > 0 ? Math.round((channelSummary.totalViews / channelSummary.subscribers) * 100) : 0}

TOP RECENT VIDEOS:
${videoStats.slice(0, 10).map((v, i) => `${i + 1}. "${v.title}" - ${v.views.toLocaleString()} views`).join('\n')}

Please provide a comprehensive analysis with the following sections:

1. CHANNEL IDENTITY
Analyze the channel's core identity, niche, and what makes it unique. What is the channel's current positioning in the YouTube ecosystem?

2. AUDIENCE PROFILE
Create a detailed audience persona including:
- Demographics (age range, locations, gender distribution)
- Psychographics (interests, values, goals, pain points)
- Content preferences and viewing habits
- What problems this channel solves for viewers
- Why people subscribe and stay engaged

3. CONTENT ANALYSIS
Evaluate the content strategy:
- Current content pillars and themes
- What's working well (based on top videos)
- Content gaps and opportunities
- Optimal video length and format
- Publishing frequency recommendations

4. VOICE & PRESENTATION STYLE
Describe the channel's presentation style:
- Tone and energy level
- Speaking style and pace
- Personality traits that shine through
- Unique elements that differentiate the channel
- How the creator connects with the audience

5. GROWTH STRATEGY
Provide specific, actionable growth tactics:
- Quick wins (30 days)
- Medium-term strategies (90 days)
- Long-term positioning (6-12 months)
- Collaboration opportunities
- SEO and discoverability tactics
- Audience retention strategies

6. CONTENT RECOMMENDATIONS
Suggest 8-10 specific video ideas that would perform well based on:
- Current audience interests
- Content gaps in the niche
- Trending topics aligned with the channel
- Videos that could go viral
- Series or playlist opportunities

CRITICAL REQUIREMENTS FOR VIDEO IDEAS:
- ONLY suggest video topics based on REAL, VERIFIABLE events
- If suggesting a specific incident (heist, hack, scandal, etc), it MUST have actually happened
- Include the year and verifiable details if mentioning specific events
- For true crime/documentary style content, only use documented cases
- If you're unsure whether an event is real, DO NOT suggest it
- Focus on well-documented stories that can be fact-checked
- Hypothetical scenarios should be clearly labeled as "What If" or "Hypothetical"

7. OPTIMIZATION OPPORTUNITIES
Identify areas for improvement:
- Thumbnail and title optimization
- Video structure and pacing
- Call-to-action strategies
- Community engagement
- Monetization opportunities
- Channel branding and consistency

8. COMPETITIVE POSITIONING
Analyze the competitive landscape:
- Main competitors and how this channel compares
- Unique advantages and differentiators
- Market opportunities and threats
- How to stand out in the niche

9. METRICS & BENCHMARKS
Provide realistic targets for:
- Subscriber growth (30/90/180 days)
- View count goals
- Engagement rate targets
- Revenue potential (if applicable)
- Key performance indicators to track

10. ACTION PLAN (First 30 Days)
Create a specific, day-by-day action plan for immediate implementation.

IMPORTANT: Format your response as a valid JSON object with these exact camelCase keys:
{
  "channelIdentity": { ... },
  "audienceProfile": {
    "demographics": { "ageRange": "", "locations": [], "gender": "" },
    "psychographics": { "interests": [], "values": [], "goals": [], "painPoints": [] },
    "contentPreferences": [],
    "viewingHabits": {},
    "problemsSolved": [],
    "subscriptionMotivation": "",
    "persona": "Brief persona description"
  },
  "contentAnalysis": { ... },
  "voiceAndStyle": { ... },
  "growthStrategy": { ... },
  "contentRecommendations": [
    {
      "title": "Video title",
      "description": "What the video is about",
      "format": "documentary/explainer/etc",
      "duration": "15-20 minutes",
      "growth_potential": 8,
      "isVerified": true,
      "verificationDetails": "Event occurred in [year], documented by [sources]",
      "tags": ["tag1", "tag2"]
    }
  ],
  "optimizationOpportunities": { ... },
  "competitivePositioning": { ... },
  "metricsAndBenchmarks": { ... },
  "actionPlan": { ... }
}

Respond ONLY with valid JSON, no markdown code blocks or extra text.`;

    const response = await anthropic.messages.create({
      model: ANALYSIS_MODEL,
      max_tokens: 6000,
      temperature: 0.7,
      system: "You are an expert YouTube strategist who provides detailed, actionable insights for channel growth. Always respond with valid JSON.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse the response
    const content = response.content[0].text;

    // Try to extract JSON from the response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[1]);
        } catch (e2) {
          console.error('Failed to parse JSON from markdown:', e2.message);
          // Fallback: create structured data from text response
          analysis = parseTextResponse(content);
        }
      } else {
        // Fallback: create structured data from text response
        analysis = parseTextResponse(content);
      }
    }

    // Normalize keys to camelCase if they came with different formatting
    const normalizedAnalysis = {
      channelIdentity: analysis['CHANNEL IDENTITY'] || analysis.channelIdentity || analysis['1. CHANNEL IDENTITY'] || {},
      audienceProfile: analysis['AUDIENCE PROFILE'] || analysis.audienceProfile || analysis['2. AUDIENCE PROFILE'] || {},
      contentAnalysis: analysis['CONTENT ANALYSIS'] || analysis.contentAnalysis || analysis['3. CONTENT ANALYSIS'] || {},
      voiceAndStyle: analysis['VOICE & PRESENTATION STYLE'] || analysis.voiceAndStyle || analysis['4. VOICE & PRESENTATION STYLE'] || {},
      growthStrategy: analysis['GROWTH STRATEGY'] || analysis.growthStrategy || analysis['5. GROWTH STRATEGY'] || {},
      contentRecommendations: analysis['CONTENT RECOMMENDATIONS'] || analysis.contentRecommendations || analysis['6. CONTENT RECOMMENDATIONS'] || [],
      optimizationOpportunities: analysis['OPTIMIZATION OPPORTUNITIES'] || analysis.optimizationOpportunities || analysis['7. OPTIMIZATION OPPORTUNITIES'] || {},
      competitivePositioning: analysis['COMPETITIVE POSITIONING'] || analysis.competitivePositioning || analysis['8. COMPETITIVE POSITIONING'] || {},
      metricsAndBenchmarks: analysis['METRICS & BENCHMARKS'] || analysis.metricsAndBenchmarks || analysis['9. METRICS & BENCHMARKS'] || {},
      actionPlan: analysis['ACTION PLAN (First 30 Days)'] || analysis.actionPlan || analysis['10. ACTION PLAN (First 30 Days)'] || {}
    };

    return {
      success: true,
      analysis: normalizedAnalysis,
      model: ANALYSIS_MODEL,
      channelSummary
    };

  } catch (error) {
    console.error('Claude channel analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate comprehensive voice profile from real YouTube data
 */
export async function generateChannelVoiceProfile(channel, videos) {
  try {
    // Analyze actual videos for voice/style
    // Note: analyzeChannelVoicesFromYouTube expects an array of channels with youtube_channel_id
    const channelWithId = {
      ...channel,
      youtube_channel_id: channel.id,
      title: channel.snippet?.title,
      name: channel.snippet?.title
    };

    const channelAnalyses = await analyzeChannelVoicesFromYouTube([channelWithId], {});
    const voiceAnalysis = channelAnalyses[0]?.voiceAnalysis ? { success: true, voiceProfile: channelAnalyses[0].voiceAnalysis } : { success: false };

    if (voiceAnalysis.success) {
      return {
        success: true,
        voiceProfile: voiceAnalysis.voiceProfile,
        basedOnRealData: true,
        analysisDetails: voiceAnalysis
      };
    }

    // Fallback to metadata-based analysis
    return await generateVoiceFromMetadata(channel, videos);

  } catch (error) {
    console.error('Voice profile generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fallback voice generation from video metadata
 */
async function generateVoiceFromMetadata(channel, videos) {
  try {
    const channelName = channel.snippet?.title || channel.title || channel.name;
    const videoTitles = videos.slice(0, 20).map(v => v.snippet?.title).filter(Boolean);
    const channelDesc = channel.snippet?.description || channel.description || '';

    const prompt = `As a voice and presentation coach, analyze this YouTube channel and create a detailed voice profile based on their content:

Channel: ${channelName}
Description: ${channelDesc.slice(0, 300)}

Recent Video Titles:
${videoTitles.join('\n')}

Based on this information, infer the likely voice and presentation style. Create a comprehensive voice profile including:

1. TONE
   - Primary tone descriptors (3-5)
   - Emotional range
   - Formality level

2. SPEAKING STYLE
   - Pacing (slow/moderate/fast)
   - Energy level (calm/balanced/energetic)
   - Articulation style

3. PERSONALITY TRAITS
   - 5-7 key personality traits that likely show through
   - How they connect with viewers

4. LANGUAGE PATTERNS
   - Vocabulary level
   - Common phrases or patterns
   - Technical vs casual language

5. ENGAGEMENT TECHNIQUES
   - How they likely keep viewers engaged
   - Call-to-action style
   - Community interaction approach

6. HUMOR & ENTERTAINMENT
   - Humor style (if applicable)
   - Entertainment elements

7. UNIQUE SIGNATURES
   - Potential catchphrases
   - Distinctive elements
   - Brand voice characteristics

8. DO'S AND DON'TS
   - 5 things to do for consistency
   - 5 things to avoid

Format as detailed JSON.`;

    const response = await anthropic.messages.create({
      model: ANALYSIS_MODEL,
      max_tokens: 2000,
      temperature: 0.7,
      system: "You are a voice coach who analyzes YouTube channels. Provide detailed, actionable voice profiles in JSON format.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;
    let voiceProfile;

    try {
      voiceProfile = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        voiceProfile = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse voice profile');
      }
    }

    return {
      success: true,
      voiceProfile,
      basedOnRealData: false
    };

  } catch (error) {
    console.error('Metadata voice analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Parse text response into structured format (fallback)
 */
function parseTextResponse(text) {
  // Basic parsing for when JSON extraction fails
  const sections = {
    channelIdentity: extractSection(text, 'CHANNEL IDENTITY', 'AUDIENCE PROFILE'),
    audienceProfile: extractSection(text, 'AUDIENCE PROFILE', 'CONTENT ANALYSIS'),
    contentAnalysis: extractSection(text, 'CONTENT ANALYSIS', 'VOICE & PRESENTATION'),
    voiceAndStyle: extractSection(text, 'VOICE & PRESENTATION', 'GROWTH STRATEGY'),
    growthStrategy: extractSection(text, 'GROWTH STRATEGY', 'CONTENT RECOMMENDATIONS'),
    contentRecommendations: extractSection(text, 'CONTENT RECOMMENDATIONS', 'OPTIMIZATION'),
    optimizationOpportunities: extractSection(text, 'OPTIMIZATION', 'COMPETITIVE'),
    competitivePositioning: extractSection(text, 'COMPETITIVE', 'METRICS'),
    metricsAndBenchmarks: extractSection(text, 'METRICS', 'ACTION PLAN'),
    actionPlan: extractSection(text, 'ACTION PLAN', null)
  };

  return sections;
}

/**
 * Extract section from text
 */
function extractSection(text, startMarker, endMarker) {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return '';

  const endIndex = endMarker ? text.indexOf(endMarker, startIndex) : text.length;
  return text.slice(startIndex, endIndex > -1 ? endIndex : text.length).trim();
}
