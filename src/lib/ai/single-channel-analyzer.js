import Anthropic from '@anthropic-ai/sdk';
import { analyzeChannelVoicesFromYouTube } from './remix-voice-analyzer';
import { parseAIResponse } from '@/lib/utils/json-parser';

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use the same model as remix for consistency
const ANALYSIS_MODEL = process.env.VOICE_MODEL || 'claude-sonnet-4-5-20250929';

/**
 * Comprehensive single channel analysis using Claude
 * @param {Object} channel - Channel data from YouTube API
 * @param {Array} videos - Array of video data
 * @param {Object} channelData - Database channel record
 * @param {Object} options - Optional parameters
 * @param {Function} options.onProgress - Progress callback (progress, message, stage)
 */
export async function analyzeChannelWithClaude(channel, videos, channelData, options = {}) {
  const { onProgress } = options;
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
- ONLY suggest video topics based on REAL, VERIFIABLE information relevant to the channel's niche
- If suggesting specific events, studies, or cases, they MUST be documented and verifiable
- Include the year and verifiable details when mentioning specific events or research
- For documentary/educational content, only use well-documented, fact-checkable sources
- Examples of verifiable sources: documented research studies, verified news events, published case studies, peer-reviewed findings
- If you're unsure whether information is accurate, DO NOT suggest it
- Focus on well-documented topics that can be independently verified
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

    // Parse the response using shared utility
    let analysis = parseAIResponse(content, {
      fallback: null,
      logErrors: true
    });

    // Log parsing results for debugging
    console.log('[Channel Analyzer] Parse result:', {
      hasAnalysis: !!analysis,
      isPartial: analysis?._partial,
      keys: analysis ? Object.keys(analysis).slice(0, 10) : [],
      hasContentRecommendations: !!(analysis?.contentRecommendations || analysis?.['CONTENT RECOMMENDATIONS'] || analysis?.['6. CONTENT RECOMMENDATIONS']),
      contentRecommendationsCount: (analysis?.contentRecommendations || analysis?.['CONTENT RECOMMENDATIONS'] || analysis?.['6. CONTENT RECOMMENDATIONS'] || []).length
    });

    // Check if we got a partial or insufficient result
    const isPartialOrInsufficient = !analysis ||
      analysis._partial ||
      (!analysis.channelIdentity && !analysis['CHANNEL IDENTITY'] && !analysis['1. CHANNEL IDENTITY']);

    if (isPartialOrInsufficient) {
      console.log('[Channel Analyzer] JSON parse returned partial/insufficient result, using text fallback');
      analysis = parseTextResponse(content);

      // If text parsing also fails to get content recommendations, try direct extraction
      if (!analysis.contentRecommendations || analysis.contentRecommendations.length === 0) {
        const directExtracted = extractContentRecommendationsDirectly(content);
        if (directExtracted.length > 0) {
          console.log('[Channel Analyzer] Extracted', directExtracted.length, 'content recommendations directly');
          analysis.contentRecommendations = directExtracted;
        }
      }
    } else {
      // Even if parsing succeeded, check if contentRecommendations is missing
      const contentRecs = analysis.contentRecommendations || analysis['CONTENT RECOMMENDATIONS'] || analysis['6. CONTENT RECOMMENDATIONS'];
      if (!contentRecs || (Array.isArray(contentRecs) && contentRecs.length === 0)) {
        console.log('[Channel Analyzer] Content recommendations empty in parsed result, trying direct extraction');
        const directExtracted = extractContentRecommendationsDirectly(content);
        if (directExtracted.length > 0) {
          console.log('[Channel Analyzer] Extracted', directExtracted.length, 'content recommendations directly');
          analysis.contentRecommendations = directExtracted;
        }
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
 * @param {Object} channel - Channel data from YouTube API
 * @param {Array} videos - Array of video data
 * @param {Object} options - Optional parameters
 * @param {Function} options.onProgress - Progress callback (progress, message, stage)
 */
export async function generateChannelVoiceProfile(channel, videos, options = {}) {
  const { onProgress } = options;

  try {
    // Analyze actual videos for voice/style
    // Note: analyzeChannelVoicesFromYouTube expects an array of channels with youtube_channel_id
    const channelWithId = {
      ...channel,
      youtube_channel_id: channel.id,
      title: channel.snippet?.title,
      name: channel.snippet?.title
    };

    // Pass onProgress callback through to voice analyzer
    const channelAnalyses = await analyzeChannelVoicesFromYouTube([channelWithId], { onProgress });
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

    // Parse voice profile using shared utility
    const voiceProfile = parseAIResponse(content, {
      fallback: null,
      logErrors: true
    });

    if (!voiceProfile) {
      throw new Error('Failed to parse voice profile');
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
 * Returns a properly structured object matching the expected schema
 */
function parseTextResponse(text) {
  // Extract sections from text-based response
  const channelIdentityText = extractSection(text, 'CHANNEL IDENTITY', 'AUDIENCE PROFILE');
  const audienceProfileText = extractSection(text, 'AUDIENCE PROFILE', 'CONTENT ANALYSIS');
  const contentAnalysisText = extractSection(text, 'CONTENT ANALYSIS', 'VOICE & PRESENTATION');
  const voiceAndStyleText = extractSection(text, 'VOICE & PRESENTATION', 'GROWTH STRATEGY');
  const growthStrategyText = extractSection(text, 'GROWTH STRATEGY', 'CONTENT RECOMMENDATIONS');
  const contentRecommendationsText = extractSection(text, 'CONTENT RECOMMENDATIONS', 'OPTIMIZATION');
  const optimizationText = extractSection(text, 'OPTIMIZATION', 'COMPETITIVE');
  const competitiveText = extractSection(text, 'COMPETITIVE', 'METRICS');
  const metricsText = extractSection(text, 'METRICS', 'ACTION PLAN');
  const actionPlanText = extractSection(text, 'ACTION PLAN', null);

  // Return properly structured object matching the expected schema
  return {
    channelIdentity: {
      summary: channelIdentityText,
      uniqueElements: [],
      _fallback: true
    },
    audienceProfile: {
      demographics: { ageRange: '', locations: [], gender: '' },
      psychographics: { interests: [], values: [], goals: [], painPoints: [] },
      contentPreferences: [],
      viewingHabits: {},
      problemsSolved: [],
      subscriptionMotivation: '',
      persona: audienceProfileText,
      _fallback: true
    },
    contentAnalysis: {
      summary: contentAnalysisText,
      whatWorksWell: [],
      contentGaps: [],
      _fallback: true
    },
    voiceAndStyle: {
      summary: voiceAndStyleText,
      tone: [],
      _fallback: true
    },
    growthStrategy: {
      summary: growthStrategyText,
      quickWins: [],
      mediumTerm: [],
      longTerm: [],
      _fallback: true
    },
    contentRecommendations: extractVideoIdeasFromText(contentRecommendationsText),
    optimizationOpportunities: {
      summary: optimizationText,
      thumbnails: '',
      titles: '',
      cta: '',
      _fallback: true
    },
    competitivePositioning: {
      summary: competitiveText,
      uniqueAdvantages: [],
      _fallback: true
    },
    metricsAndBenchmarks: {
      summary: metricsText,
      performanceScore: 70,
      growthPotential: 75,
      _fallback: true
    },
    actionPlan: {
      summary: actionPlanText,
      _fallback: true
    },
    _source: 'text-parser-fallback'
  };
}

/**
 * Extract video ideas from text content
 */
function extractVideoIdeasFromText(text) {
  if (!text) return [];

  // Try to find numbered items or bullet points
  const lines = text.split('\n').filter(line => line.trim());
  const ideas = [];

  for (const line of lines) {
    // Match numbered items like "1." or bullet points
    const match = line.match(/^[\d.)\-•*]+\s*(.+)/);
    if (match && match[1]) {
      const title = match[1].trim();
      if (title.length > 10 && title.length < 200) {
        ideas.push({
          title,
          description: '',
          format: 'unknown',
          duration: '',
          growth_potential: 5,
          isVerified: false,
          _fallback: true
        });
      }
    }
  }

  return ideas.slice(0, 10); // Max 10 ideas
}

/**
 * Directly extract contentRecommendations array from raw AI response
 * Uses pattern matching to find and parse individual recommendation objects
 */
function extractContentRecommendationsDirectly(content) {
  const recommendations = [];

  if (!content || typeof content !== 'string') return recommendations;

  // Look for the contentRecommendations or CONTENT RECOMMENDATIONS section
  const patterns = [
    /"contentRecommendations"\s*:\s*\[/i,
    /"CONTENT RECOMMENDATIONS"\s*:\s*\[/i,
    /CONTENT RECOMMENDATIONS[^[]*\[/i,
    /"6\. CONTENT RECOMMENDATIONS"\s*:\s*\[/i
  ];

  let startIndex = -1;
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      startIndex = content.indexOf(match[0]) + match[0].length - 1;
      break;
    }
  }

  if (startIndex === -1) return recommendations;

  // Find the end of the array (matching ])
  let depth = 0;
  let inStr = false;
  let esc = false;
  let endIndex = -1;

  for (let i = startIndex; i < content.length; i++) {
    if (esc) { esc = false; continue; }
    if (content[i] === '\\' && inStr) { esc = true; continue; }
    if (content[i] === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (content[i] === '[') depth++;
    else if (content[i] === ']') {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  // Extract the array content
  const arrayContent = content.substring(startIndex, endIndex > startIndex ? endIndex + 1 : content.length);

  // Try to parse each object in the array individually
  // Find objects by matching { ... } patterns
  let objStart = -1;
  depth = 0;
  inStr = false;
  esc = false;

  for (let i = 0; i < arrayContent.length; i++) {
    if (esc) { esc = false; continue; }
    if (arrayContent[i] === '\\' && inStr) { esc = true; continue; }
    if (arrayContent[i] === '"') { inStr = !inStr; continue; }
    if (inStr) continue;

    if (arrayContent[i] === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (arrayContent[i] === '}') {
      depth--;
      if (depth === 0 && objStart >= 0) {
        const objStr = arrayContent.substring(objStart, i + 1);
        try {
          const obj = JSON.parse(objStr);
          if (obj.title) {
            recommendations.push({
              title: obj.title || '',
              description: obj.description || '',
              format: obj.format || 'video',
              duration: obj.duration || obj.length || '',
              growth_potential: obj.growth_potential || obj.growthPotential || 5,
              isVerified: obj.isVerified || false,
              verificationDetails: obj.verificationDetails || '',
              tags: obj.tags || []
            });
          }
        } catch {
          // Try to extract at least title and description
          const titleMatch = objStr.match(/"title"\s*:\s*"([^"]+)"/);
          const descMatch = objStr.match(/"description"\s*:\s*"([^"]+)"/);
          const formatMatch = objStr.match(/"format"\s*:\s*"([^"]+)"/);
          const durationMatch = objStr.match(/"duration"\s*:\s*"([^"]+)"/);
          const potentialMatch = objStr.match(/"growth_potential"\s*:\s*(\d+)/);

          if (titleMatch) {
            recommendations.push({
              title: titleMatch[1],
              description: descMatch ? descMatch[1] : '',
              format: formatMatch ? formatMatch[1] : 'video',
              duration: durationMatch ? durationMatch[1] : '',
              growth_potential: potentialMatch ? parseInt(potentialMatch[1]) : 5,
              isVerified: false,
              _extracted: true
            });
          }
        }
        objStart = -1;
      }
    }
  }

  return recommendations.slice(0, 10); // Max 10 recommendations
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
