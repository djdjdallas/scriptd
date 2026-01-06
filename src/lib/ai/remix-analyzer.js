import Anthropic from '@anthropic-ai/sdk';
import { analyzeChannelVoicesFromYouTube, combineRealVoiceAnalyses } from './remix-voice-analyzer';

// Initialize Anthropic with the premium model
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use VOICE_MODEL for remix analysis (Sonnet is more cost-effective and provides excellent results)
const REMIX_MODEL = process.env.VOICE_MODEL || process.env.REMIX_MODEL || 'claude-sonnet-4-5-20250929';

/**
 * Analyze channel combination and generate remix strategy using Claude
 */
export async function analyzeRemixWithClaude(channels, config) {
  try {
    // Prepare channel data for Claude
    const channelSummaries = channels.map(ch => ({
      name: ch.title || ch.name,
      subscribers: ch.subscriber_count,
      description: ch.description,
      niche: ch.analytics_data?.niche || 'Unknown',
      topContent: ch.analytics_data?.top_content || [],
      audience: ch.analytics_data?.audience || {},
      voiceProfile: ch.voice_profile || {},
      weight: config.weights[ch.id] || (1 / channels.length)
    }));

    const prompt = `You are an expert YouTube growth strategist and channel analyst. Analyze these ${channels.length} successful YouTube channels and create a comprehensive remix strategy that combines their best elements.

CHANNELS TO REMIX:
${channelSummaries.map((ch, i) => `
Channel ${i + 1}: ${ch.name}
- Subscribers: ${ch.subscribers?.toLocaleString() || 'Unknown'}
- Weight in remix: ${Math.round(ch.weight * 100)}%
- Description: ${ch.description || 'No description'}
- Niche: ${ch.niche}
`).join('\n')}

REMIX CONFIGURATION:
- Channel Name: ${config.name}
- Description: ${config.description || 'Not provided'}
- Elements to combine: ${Object.entries(config.elements)
  .filter(([_, enabled]) => enabled)
  .map(([key]) => key.replace(/_/g, ' '))
  .join(', ')}

Return a comprehensive JSON object with this EXACT structure:

{
  "synergy_analysis": {
    "key_synergies": ["synergy 1", "synergy 2", "synergy 3"],
    "unique_opportunity": "description of unique opportunity",
    "competitive_advantages": ["advantage 1", "advantage 2", "advantage 3"],
    "audience_overlap_potential": "description"
  },
  "combined_audience_profile": {
    "demographics": {
      "age_range": "XX-XX primary demographic",
      "locations": ["location 1", "location 2", "location 3"],
      "interests": ["interest 1", "interest 2", "interest 3", "interest 4", "interest 5"]
    },
    "psychographics": {
      "values": ["value 1", "value 2", "value 3"],
      "goals": ["goal 1", "goal 2", "goal 3"],
      "pain_points": ["pain 1", "pain 2", "pain 3"]
    },
    "content_preferences": {
      "preferred_formats": ["format 1", "format 2", "format 3"],
      "optimal_length": "X-X minutes",
      "consumption_patterns": "description"
    },
    "viewing_habits": {
      "best_posting_times": "description",
      "engagement_patterns": "description",
      "retention_factors": ["factor 1", "factor 2", "factor 3"]
    }
  },
  "unique_positioning": {
    "value_proposition": "clear value proposition statement",
    "differentiation_from_sources": "how it differs from source channels",
    "market_gap_filled": "description of gap filled",
    "brand_identity": "description of brand identity",
    "tagline_options": ["option 1", "option 2", "option 3"]
  },
  "content_strategy": {
    "content_pillars": [
      {
        "pillar_name": "name",
        "description": "description",
        "frequency": "how often",
        "example_topics": ["topic 1", "topic 2", "topic 3"]
      }
    ],
    "video_ideas": [
      {
        "title": "video title",
        "format": "format type",
        "pillar": "which pillar",
        "description": "brief description"
      }
    ],
    "publishing_schedule": {
      "frequency": "description",
      "optimal_days": ["day 1", "day 2"],
      "batching_strategy": "description"
    }
  },
  "voice_and_style_guide": {
    "tone": ["tone 1", "tone 2", "tone 3"],
    "personality_traits": ["trait 1", "trait 2", "trait 3"],
    "language_style": "description",
    "presentation_approach": "description",
    "hooks_and_intros": "description",
    "visual_aesthetic": "description"
  },
  "growth_tactics": [
    {
      "tactic": "tactic name",
      "description": "detailed description",
      "timeline": "when to implement",
      "expected_impact": "expected results"
    }
  ],
  "potential_challenges": [
    {
      "challenge": "challenge description",
      "mitigation_strategy": "how to overcome it",
      "priority": "high/medium/low"
    }
  ],
  "action_plan_30_days": {
    "week_1": {
      "focus": "main focus",
      "tasks": ["task 1", "task 2", "task 3"],
      "deliverables": ["deliverable 1", "deliverable 2"]
    },
    "week_2": {
      "focus": "main focus",
      "tasks": ["task 1", "task 2", "task 3"],
      "deliverables": ["deliverable 1", "deliverable 2"]
    },
    "week_3": {
      "focus": "main focus",
      "tasks": ["task 1", "task 2", "task 3"],
      "deliverables": ["deliverable 1", "deliverable 2"]
    },
    "week_4": {
      "focus": "main focus",
      "tasks": ["task 1", "task 2", "task 3"],
      "deliverables": ["deliverable 1", "deliverable 2"]
    }
  },
  "success_metrics": {
    "subscriber_goal_30_days": "number with reasoning",
    "view_goal_30_days": "number with reasoning",
    "engagement_rate_target": "percentage with reasoning",
    "key_milestones": ["milestone 1", "milestone 2", "milestone 3"]
  }
}

Be extremely detailed and specific. Provide actionable insights based on the channel data provided.`;

    const response = await anthropic.messages.create({
      model: REMIX_MODEL,
      max_tokens: 6000,
      temperature: 0.7,
      system: "You are an expert YouTube strategist who provides detailed, actionable insights for channel growth. CRITICAL: Respond ONLY with valid JSON. Never use empty keys like \"\": \"value\". All property names must be non-empty strings. Ensure all quotes are properly escaped. No trailing commas. Validate JSON syntax before responding.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse the response with comprehensive JSON repair
    const content = response.content[0].text;

    // Try to extract JSON from the response
    let analysis;
    let parseMethod = 'direct';

    try {
      // First try direct parse
      analysis = JSON.parse(content);
    } catch (e) {

      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      let jsonText = jsonMatch ? jsonMatch[1] : content;

      // Apply comprehensive JSON repairs
      try {
        jsonText = repairJSON(jsonText);
        analysis = JSON.parse(jsonText);
        parseMethod = 'repaired';
      } catch (e2) {
        // Fallback: create structured data from text response
        analysis = parseTextResponse(content);
        parseMethod = 'text-fallback';
      }
    }

    // Add metadata about parsing method for debugging
    if (analysis && typeof analysis === 'object') {
      analysis._parseMethod = parseMethod;
    }

    return {
      success: true,
      analysis: analysis,
      model: REMIX_MODEL,
      parseMethod
    };

  } catch (error) {
    console.error('Claude remix analysis error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackAnalysis(channels, config)
    };
  }
}

/**
 * Generate unique voice profile using real YouTube data
 * This now analyzes actual videos instead of theoretical blending
 */
export async function generateRemixVoiceProfile(channels, config) {
  try {
    // First, try to get real voice analyses from YouTube
    const channelAnalyses = await analyzeChannelVoicesFromYouTube(channels, config);

    // Combine the real analyses
    const combinedResult = await combineRealVoiceAnalyses(channelAnalyses, config);

    if (combinedResult.success) {
      return {
        success: true,
        voiceProfile: combinedResult.voiceProfile,
        basedOnRealData: true,
        channelAnalyses: combinedResult.channelAnalyses
      };
    }

    // Fallback to theoretical blending if real analysis fails
    
    const voiceProfiles = channels.map(ch => ({
      channel: ch.title || ch.name,
      profile: ch.voice_profile || {},
      weight: config.weights[ch.id] || (1 / channels.length)
    }));

    const prompt = `As a voice and presentation coach, create a unique voice profile that combines these YouTube channel styles:

${voiceProfiles.map((vp, i) => `
Channel ${i + 1}: ${vp.channel} (${Math.round(vp.weight * 100)}% influence)
Voice Profile: ${JSON.stringify(vp.profile, null, 2)}
`).join('\n')}

Create a UNIQUE voice profile that:
1. Combines the best elements from each channel
2. Creates something fresh and distinctive
3. Maintains authenticity and consistency
4. Appeals to the combined audience

Include in the voice profile:
- Tone (3-5 descriptors)
- Speaking style and pace
- Energy level
- Personality traits (5-7 traits)
- Vocabulary and language patterns
- Humor style
- Engagement techniques
- Unique catchphrases or signatures
- Do's and Don'ts

Format as JSON with detailed descriptions.`;

    const response = await anthropic.messages.create({
      model: REMIX_MODEL,
      max_tokens: 2000,
      temperature: 0.8,
      system: "You are a voice coach specializing in YouTube content creation. Create unique, actionable voice profiles.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;
    
    // Parse response
    let voiceProfile;
    try {
      voiceProfile = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        voiceProfile = JSON.parse(jsonMatch[1]);
      } else {
        voiceProfile = {
          generated: true,
          description: content,
          tone: ['engaging', 'authentic', 'dynamic'],
          style: ['conversational', 'informative', 'entertaining']
        };
      }
    }

    return {
      success: true,
      voiceProfile: voiceProfile
    };

  } catch (error) {
    console.error('Claude voice profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate content ideas using Claude
 */
import { searchRecentCrimes, searchTrendingCases, formatResearchForClaude } from './perplexity-research.js';

/**
 * Dynamically detect what topics to research based on channel content
 */
function detectChannelResearchTopics(channels, config) {
  // Collect all video titles to analyze content patterns
  const recentVideoTitles = channels.flatMap(ch =>
    (ch.recentVideos || []).map(v => v.title)
  ).filter(Boolean);

  const allText = [
    ...recentVideoTitles,
    config.description || '',
    ...channels.map(ch => ch.description || '')
  ].join(' ').toLowerCase();

  // Comprehensive topic detection patterns
  const topicPatterns = {
    'true crime': {
      keywords: ['murder', 'killer', 'crime', 'detective', 'investigation', 'case', 'criminal', 'death', 'victim'],
      searchTopics: ['true crime cases', 'criminal investigations', 'murder cases'],
      categories: ['true crime', 'criminal cases']
    },
    'financial fraud': {
      keywords: ['fraud', 'scam', 'steal', 'heist', 'embezzle', 'money', 'million', 'billion', 'ponzi', 'scheme'],
      searchTopics: ['fraud cases', 'financial scams', 'embezzlement'],
      categories: ['financial fraud', 'white collar crime']
    },
    'technology': {
      keywords: ['tech', 'ai', 'software', 'hack', 'cyber', 'startup', 'silicon valley', 'code', 'programming'],
      searchTopics: ['tech industry news', 'technology breakthroughs', 'tech controversies'],
      categories: ['technology', 'innovation']
    },
    'psychology': {
      keywords: ['psychology', 'mental', 'brain', 'behavior', 'cognitive', 'therapy', 'mindset', 'emotion'],
      searchTopics: ['psychology research', 'mental health breakthroughs', 'behavioral science'],
      categories: ['psychology', 'mental health']
    },
    'business': {
      keywords: ['business', 'entrepreneur', 'startup', 'ceo', 'company', 'corporate', 'economy', 'market'],
      searchTopics: ['business news', 'corporate scandals', 'startup stories'],
      categories: ['business', 'entrepreneurship']
    },
    'science': {
      keywords: ['science', 'research', 'discovery', 'experiment', 'study', 'scientist', 'breakthrough'],
      searchTopics: ['scientific discoveries', 'research breakthroughs', 'science news'],
      categories: ['science', 'research']
    },
    'history': {
      keywords: ['history', 'historical', 'ancient', 'war', 'battle', 'empire', 'civilization'],
      searchTopics: ['historical events', 'historical mysteries', 'history documentaries'],
      categories: ['history', 'historical events']
    },
    'sports': {
      keywords: ['sport', 'athlete', 'game', 'championship', 'team', 'player', 'coach'],
      searchTopics: ['sports controversies', 'athletic achievements', 'sports scandals'],
      categories: ['sports', 'athletics']
    },
    'politics': {
      keywords: ['politic', 'government', 'election', 'vote', 'senate', 'congress', 'law'],
      searchTopics: ['political events', 'government scandals', 'policy changes'],
      categories: ['politics', 'government']
    },
    'entertainment': {
      keywords: ['celebrity', 'hollywood', 'movie', 'actor', 'film', 'entertainment', 'fame'],
      searchTopics: ['entertainment news', 'celebrity stories', 'hollywood scandals'],
      categories: ['entertainment', 'celebrities']
    }
  };

  // Score each topic
  const scores = {};
  for (const [topic, topicConfig] of Object.entries(topicPatterns)) {
    const matchCount = topicConfig.keywords.filter(kw => allText.includes(kw)).length;
    scores[topic] = matchCount;
  }

  // Find best match
  let bestTopic = 'general interest';
  let bestScore = 0;

  for (const [topic, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  // Get the search configuration for the detected topic
  const topicConfig = topicPatterns[bestTopic] || {
    searchTopics: ['trending news', 'viral stories', 'interesting events'],
    categories: ['general', 'news']
  };


  return {
    detectedTopic: bestTopic,
    searchTopic: topicConfig.searchTopics[0],
    category: topicConfig.categories[0],
    confidence: bestScore
  };
}

export async function generateRemixContentIdeas(channels, config, analysis, useFactualContent = true) {
  try {
    // Extract actual content themes from recent videos
    const recentVideoTitles = channels.flatMap(ch =>
      (ch.recentVideos || []).map(v => v.title)
    ).filter(Boolean);

    const actualContentTheme = config.actualChannelContent ||
      (recentVideoTitles.length > 0 ? `Based on recent videos: ${recentVideoTitles.slice(0, 5).join(', ')}` : '');

    // If factual content is requested, research real events first
    let realEvents = [];
    if (useFactualContent && process.env.PERPLEXITY_API_KEY) {
      // Dynamically detect what to search for
      const researchConfig = detectChannelResearchTopics(channels, config);

      try {
        const [recentCases, trendingCases] = await Promise.all([
          searchRecentCrimes(researchConfig.searchTopic, {
            category: researchConfig.category,
            dateRange: 'past 2 years',
            maxResults: 10
          }),
          searchTrendingCases({
            topic: researchConfig.searchTopic,
            category: researchConfig.category,
            timeframe: 'past 3 months',
            minViralScore: 70
          })
        ]);

        if (recentCases.success || trendingCases.success) {
          realEvents = [
            ...formatResearchForClaude(recentCases),
            ...(trendingCases.success ? trendingCases.cases.map(c => ({
              realEvent: {
                name: c.title,
                date: c.date,
                description: c.headline,
                sources: c.sources
              },
              contentPotential: {
                viralScore: c.viralScore,
                uniqueAngle: c.uniqueAngle
              }
            })) : [])
          ];
        }
      } catch {
        // Continue without real events
      }
    }

    const prompt = `Based on this YouTube channel${channels.length > 1 ? ' remix combining ' + channels.map(c => c.title || c.name).join(', ') : ': ' + (channels[0]?.title || channels[0]?.name)}, generate 10 specific, high-potential video ideas.

Channel${channels.length > 1 ? ' Remix' : ''}: ${config.name}
Description: ${config.description}
${actualContentTheme ? `\nACTUAL CHANNEL CONTENT (IMPORTANT - BASE IDEAS ON THIS): ${actualContentTheme}` : ''}
${recentVideoTitles.length > 0 ? `\nRecent Video Examples:\n${recentVideoTitles.slice(0, 10).map(t => `- ${t}`).join('\n')}` : ''}

${realEvents.length > 0 ? `\nREAL EVENTS TO BASE CONTENT ON (VERIFIED & DOCUMENTED):\n${JSON.stringify(realEvents.slice(0, 10), null, 2)}\n` : ''}

Audience Profile: ${JSON.stringify(analysis?.audience || {}, null, 2)}
Content Strategy: ${analysis?.contentStrategy || 'Blend of source channels'}

${realEvents.length > 0 ?
`CRITICAL: Create content ideas based on the REAL EVENTS provided above. Each idea must:
- Be based on an actual documented case with sources
- Include factual information (dates, amounts, names)
- Mark as verified with source links` :
`CRITICAL: Generate video ideas that match the ACTUAL CONTENT THEME shown in the recent videos above, NOT just based on the channel name.`}

Generate exactly 10 video ideas based on the channel's actual content style.

IMPORTANT: Return ONLY a JSON array, no other text. Each object should have these exact fields:
[
  {
    "title": "Compelling video title under 70 characters",
    "description": "2-3 sentence description of the video content",
    ${realEvents.length > 0 ? `"isVerified": true,
    "verificationDetails": "When and where this happened with specific details",` : ''}
    "format": "documentary|investigation|deep-dive|analysis",
    "duration": "20-25 minutes",
    "keyHooks": ["hook1", "hook2", "hook3"],
    "thumbnailConcept": "Visual description for thumbnail",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "difficulty": "easy|medium|hard",
    "growth_potential": 8
  }
]

Generate 10 ideas that match the channel's proven successful format.
Return ONLY the JSON array, nothing else.`;

    const response = await anthropic.messages.create({
      model: REMIX_MODEL,
      max_tokens: 3000,
      temperature: 0.9,
      system: "You are a YouTube content strategist who creates viral, high-performing video concepts.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;

    let ideas;
    try {
      ideas = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      let jsonText = jsonMatch ? jsonMatch[1] : content;

      // Apply comprehensive JSON repairs
      try {
        jsonText = repairComplexJSON(jsonText);
        ideas = JSON.parse(jsonText);
      } catch (e2) {
        // Try to find array pattern
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try {
            const repairedArray = repairComplexJSON(arrayMatch[0]);
            ideas = JSON.parse(repairedArray);
          } catch {
            ideas = [];
          }
        } else {
          ideas = [];
        }
      }
    }

    // Ensure we have valid ideas
    const validIdeas = Array.isArray(ideas) ? ideas : [ideas];

    return {
      success: true,
      ideas: validIdeas
    };

  } catch (error) {
    console.error('Claude content generation error:', error);
    return {
      success: false,
      error: error.message,
      ideas: []
    };
  }
}

/**
 * Generate audience insights using Claude
 */
export async function generateAudienceInsights(channels, config) {
  try {
    // Include recent videos for context
    const channelDetails = channels.map(ch => {
      const recentTitles = (ch.recentVideos || []).slice(0, 5).map(v => v.title).filter(Boolean);
      return `- ${ch.title || ch.name}: ${ch.subscriber_count?.toLocaleString() || 'Unknown'} subscribers
  ${recentTitles.length > 0 ? `Recent content: ${recentTitles.join(', ')}` : ''}`;
    }).join('\n');

    const prompt = `Analyze the ${channels.length > 1 ? 'combined audience for a YouTube channel remix combining' : 'audience for'} these channels:

${channelDetails}

Return a comprehensive JSON object with this EXACT structure (provide specific percentages, lists, and detailed insights):

{
  "demographic_profile": {
    "age_distribution": {
      "16-24": "XX%",
      "25-34": "XX%",
      "35-44": "XX%",
      "45+": "XX%"
    },
    "gender_distribution": {
      "male": "XX%",
      "female": "XX%",
      "non_binary_other": "XX%"
    },
    "geographic_distribution": {
      "united_states": "XX%",
      "united_kingdom": "XX%",
      "canada": "XX%",
      "australia": "XX%",
      "germany": "XX%",
      "other_europe": "XX%",
      "rest_of_world": "XX%"
    },
    "education_income": {
      "education_level": {
        "high_school": "XX%",
        "some_college": "XX%",
        "bachelors_degree": "XX%",
        "graduate_degree": "XX%"
      },
      "income_brackets": {
        "under_30k": "XX%",
        "30k_60k": "XX%",
        "60k_100k": "XX%",
        "over_100k": "XX%"
      }
    }
  },
  "psychographic_analysis": {
    "core_values": ["value 1", "value 2", "value 3", "value 4", "value 5", "value 6", "value 7"],
    "aspirations": ["aspiration 1", "aspiration 2", "aspiration 3", "aspiration 4", "aspiration 5", "aspiration 6"],
    "pain_points": ["pain 1", "pain 2", "pain 3", "pain 4", "pain 5"],
    "lifestyle_preferences": {
      "media_consumption": "description of how they consume media",
      "social_habits": "description of social interaction patterns",
      "leisure_activities": ["activity 1", "activity 2", "activity 3", "activity 4", "activity 5"],
      "work_style": "description of work preferences and habits"
    }
  },
  "audience_overlap": {
    "common_interests": ["interest 1", "interest 2", "interest 3", "interest 4", "interest 5", "interest 6", "interest 7"],
    "cross_channel_following": {
      "all_channels": "XX%",
      "channel_pair_1": "XX%",
      "channel_pair_2": "XX%"
    },
    "unique_segments": {
      "segment_name_1": {
        "percentage": "XX%",
        "characteristics": ["char 1", "char 2", "char 3"]
      }
    }
  },
  "content_consumption_patterns": {
    "preferred_video_length": {
      "short_form_1_5_min": "XX%",
      "medium_form_8_15_min": "XX%",
      "long_form_20_45_min": "XX%",
      "extended_45_plus_min": "XX%"
    },
    "optimal_posting_times": {
      "weekdays": "specific times EST",
      "weekends": "specific times EST",
      "peak_days": ["day 1", "day 2", "day 3"]
    },
    "viewing_behavior": {
      "binge_watching": "description with percentage",
      "completion_rate": "XX% for videos under X minutes",
      "return_frequency": "description"
    },
    "platform_preferences": {
      "mobile": "XX%",
      "desktop": "XX%",
      "tv_streaming": "XX%"
    }
  },
  "engagement_drivers": {
    "comment_triggers": ["trigger 1", "trigger 2", "trigger 3", "trigger 4", "trigger 5"],
    "sharing_motivators": ["motivator 1", "motivator 2", "motivator 3", "motivator 4", "motivator 5"],
    "loyalty_builders": ["builder 1", "builder 2", "builder 3", "builder 4", "builder 5"]
  },
  "monetization_potential": {
    "product_categories": {
      "high_interest": ["product 1 ($X-$Y)", "product 2 ($X-$Y)", "product 3 ($X-$Y)", "product 4 ($X-$Y)"],
      "medium_interest": ["product 1 ($X-$Y)", "product 2 ($X-$Y)", "product 3 ($X-$Y)", "product 4 ($X-$Y)"]
    },
    "price_sensitivity": {
      "threshold": "description",
      "consideration_range": "description",
      "premium_acceptance": "description"
    },
    "brand_affinity": {
      "preferred_brands": ["brand 1", "brand 2", "brand 3", "brand 4", "brand 5", "brand 6"],
      "brand_values_alignment": "description"
    },
    "services_needed": ["service 1", "service 2", "service 3", "service 4", "service 5"]
  },
  "strategic_recommendations": {
    "content_strategy": ["strategy 1", "strategy 2", "strategy 3", "strategy 4"],
    "community_building": ["tactic 1", "tactic 2", "tactic 3", "tactic 4"],
    "monetization_approach": ["approach 1", "approach 2", "approach 3", "approach 4"]
  }
}

Be extremely detailed and specific. Provide realistic percentages that add up to 100% where applicable. Base insights on typical YouTube audience behavior for these content types.`;

    const response = await anthropic.messages.create({
      model: REMIX_MODEL,
      max_tokens: 4000,
      temperature: 0.7,
      system: "You are a YouTube audience analyst who provides detailed, data-driven insights.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;

    let insights;
    let parseMethod = 'direct';

    try {
      // First try direct parse
      insights = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      let jsonText = jsonMatch ? jsonMatch[1] : content;

      // Apply comprehensive JSON repairs
      try {
        jsonText = repairJSON(jsonText);
        insights = JSON.parse(jsonText);
        parseMethod = 'repaired';
      } catch (e2) {
        // Fallback: Parse text into structured audience data
        insights = parseAudienceTextResponse(content);
        parseMethod = 'text-fallback';
      }
    }

    // Add metadata about parsing method
    if (insights && typeof insights === 'object') {
      insights._parseMethod = parseMethod;
    }

    return {
      success: true,
      insights: insights,
      parseMethod
    };

  } catch (error) {
    console.error('Claude audience insights error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Parse text response into structured data
 */
/**
 * Comprehensive JSON repair function - handles complex nested structures
 */
function repairComplexJSON(jsonText) {
  let fixed = jsonText.trim();

  // Step 1: Remove markdown code block markers if present
  fixed = fixed.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '');

  // Step 2: Remove empty keys (critical fix)
  fixed = fixed.replace(/,?\s*""\s*:\s*"[^"]*"/g, '');
  fixed = fixed.replace(/,?\s*""\s*:\s*\{[^}]*\}/g, '');
  fixed = fixed.replace(/,?\s*""\s*:\s*\[[^\]]*\]/g, '');

  // Step 3: Fix unescaped quotes in string values (more aggressive)
  // This is tricky - we need to be careful not to break already-valid JSON
  const lines = fixed.split('\n');
  const repairedLines = lines.map(line => {
    // Match lines with key-value pairs
    const kvMatch = line.match(/^(\s*)"([^"]+)":\s*"(.*)"\s*,?\s*$/);
    if (kvMatch) {
      const indent = kvMatch[1];
      const key = kvMatch[2];
      const value = kvMatch[3];
      const hasComma = line.trim().endsWith(',');

      // Count unescaped quotes in value
      let fixedValue = value;
      // Only escape quotes that aren't already escaped
      fixedValue = fixedValue.replace(/(?<!\\)"/g, '\\"');

      return `${indent}"${key}": "${fixedValue}"${hasComma ? ',' : ''}`;
    }
    return line;
  });
  fixed = repairedLines.join('\n');

  // Step 4: Remove trailing commas before closing brackets/braces
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // Step 5: Add missing commas between properties
  fixed = fixed.replace(/([}\]])(\s*)("[^"]+":)/g, '$1,$2$3');
  fixed = fixed.replace(/("|\d|true|false|null)(\s+)("[^"]+":)/g, '$1,$2$3');

  // Step 6: Clean up double commas created by previous operations
  fixed = fixed.replace(/,\s*,/g, ',');

  // Step 7: Remove leading commas after opening braces/brackets
  fixed = fixed.replace(/\{\s*,/g, '{');
  fixed = fixed.replace(/\[\s*,/g, '[');

  // Step 8: Fix missing quotes around property names
  fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  // Step 9: Ensure proper spacing
  fixed = fixed.trim();

  return fixed;
}

/**
 * Original JSON repair function (kept for backwards compatibility)
 */
function repairJSON(jsonText) {
  return repairComplexJSON(jsonText);
}

function parseTextResponse(text) {

  // Comprehensive fallback structure matching expected depth
  const analysis = {
    synergy_analysis: {
      key_synergies: [
        "Complementary content styles that appeal to overlapping audiences",
        "Shared audience interests creating cross-promotion opportunities",
        "Combined expertise covering broader topic spectrum"
      ],
      unique_opportunity: "Create a unique blend that fills market gap between source channels",
      competitive_advantages: [
        "Established credibility from source channels",
        "Diverse content approach appealing to wider audience",
        "Multiple content formats and styles"
      ],
      audience_overlap_potential: "Moderate to high overlap potential based on content similarity"
    },
    combined_audience_profile: {
      demographics: {
        age_range: "18-44 primary demographic",
        locations: ["United States", "United Kingdom", "Canada", "Australia", "Europe"],
        interests: [
          "Educational content",
          "Personal development",
          "Technology and innovation",
          "Creative pursuits",
          "Professional growth"
        ]
      },
      psychographics: {
        values: [
          "Continuous learning and growth",
          "Authenticity and transparency",
          "Quality over quantity"
        ],
        goals: [
          "Career advancement",
          "Skill development",
          "Building meaningful online presence"
        ],
        pain_points: [
          "Information overload",
          "Lack of actionable guidance",
          "Difficulty finding quality content"
        ]
      },
      content_preferences: {
        preferred_formats: ["Deep-dive videos", "Tutorials", "Case studies"],
        optimal_length: "10-20 minutes",
        consumption_patterns: "Regular viewers who prefer educational content during evening hours"
      },
      viewing_habits: {
        best_posting_times: "Weekday evenings (6-9 PM EST) and weekend mornings",
        engagement_patterns: "High engagement on thoughtful, well-researched content",
        retention_factors: [
          "Clear value proposition",
          "Strong storytelling",
          "Actionable takeaways"
        ]
      }
    },
    unique_positioning: {
      value_proposition: "Combining expertise and entertainment to deliver actionable insights",
      differentiation_from_sources: "Unique blend of styles creating fresh perspective on familiar topics",
      market_gap_filled: "Bridge between theoretical knowledge and practical application",
      brand_identity: "Trusted guide for professionals seeking growth",
      tagline_options: [
        "Where Expertise Meets Action",
        "Learn. Apply. Grow.",
        "Practical Insights for Modern Professionals"
      ]
    },
    content_strategy: {
      content_pillars: [
        {
          pillar_name: "Core Education",
          description: "Fundamental concepts and principles explained clearly",
          frequency: "Weekly",
          example_topics: [
            "Essential skills for success",
            "Foundational principles",
            "Key concepts explained"
          ]
        },
        {
          pillar_name: "Practical Applications",
          description: "Real-world case studies and implementation guides",
          frequency: "Bi-weekly",
          example_topics: [
            "Step-by-step tutorials",
            "Case study analysis",
            "Behind-the-scenes processes"
          ]
        },
        {
          pillar_name: "Trends & Insights",
          description: "Current developments and future predictions",
          frequency: "Monthly",
          example_topics: [
            "Industry trends",
            "Emerging technologies",
            "Future predictions"
          ]
        }
      ],
      video_ideas: [
        {
          title: "Getting Started: Complete Beginner's Guide",
          format: "Tutorial",
          pillar: "Core Education",
          description: "Comprehensive introduction for newcomers"
        },
        {
          title: "Case Study: Real-World Success Story",
          format: "Analysis",
          pillar: "Practical Applications",
          description: "Detailed breakdown of successful implementation"
        },
        {
          title: "What's Next: Trends to Watch",
          format: "Commentary",
          pillar: "Trends & Insights",
          description: "Analysis of emerging trends and opportunities"
        }
      ],
      publishing_schedule: {
        frequency: "1-2 videos per week for consistent growth",
        optimal_days: ["Tuesday", "Thursday"],
        batching_strategy: "Record 4 videos monthly, edit and schedule in batches"
      }
    },
    voice_and_style_guide: {
      tone: ["Professional", "Approachable", "Authoritative"],
      personality_traits: [
        "Knowledgeable without being condescending",
        "Enthusiastic about the subject matter",
        "Relatable and authentic"
      ],
      language_style: "Clear and accessible while maintaining expertise",
      presentation_approach: "Blend of education and entertainment with strong storytelling",
      hooks_and_intros: "Start with compelling question or surprising insight",
      visual_aesthetic: "Clean, professional with emphasis on clarity"
    },
    growth_tactics: [
      {
        tactic: "Collaborate with complementary creators",
        description: "Partner with channels in adjacent niches for cross-promotion",
        timeline: "Months 2-3",
        expected_impact: "15-25% subscriber growth from collaboration exposure"
      },
      {
        tactic: "Optimize for search and discovery",
        description: "Focus on SEO-friendly titles and comprehensive video descriptions",
        timeline: "Ongoing from launch",
        expected_impact: "30-40% of views from search and suggested videos"
      },
      {
        tactic: "Build engaged community",
        description: "Consistent interaction in comments and community posts",
        timeline: "Ongoing from launch",
        expected_impact: "Higher retention and loyalty metrics"
      }
    ],
    potential_challenges: [
      {
        challenge: "Establishing unique identity while honoring source channels",
        mitigation_strategy: "Focus on unique value proposition and differentiation points",
        priority: "high"
      },
      {
        challenge: "Maintaining consistent quality and posting schedule",
        mitigation_strategy: "Implement content batching and backup content library",
        priority: "medium"
      },
      {
        challenge: "Standing out in competitive niche",
        mitigation_strategy: "Double down on unique perspective and high production value",
        priority: "high"
      }
    ],
    action_plan_30_days: {
      week_1: {
        focus: "Foundation and Setup",
        tasks: [
          "Finalize channel branding and visual identity",
          "Create channel art and profile assets",
          "Set up analytics and tracking systems"
        ],
        deliverables: [
          "Complete channel setup",
          "Brand guidelines document"
        ]
      },
      week_2: {
        focus: "Content Creation",
        tasks: [
          "Script and record first 3 videos",
          "Create thumbnails and titles",
          "Plan next month's content calendar"
        ],
        deliverables: [
          "3 videos ready for publication",
          "30-day content calendar"
        ]
      },
      week_3: {
        focus: "Launch and Promotion",
        tasks: [
          "Publish first video",
          "Engage with initial audience",
          "Share across social platforms"
        ],
        deliverables: [
          "First video published",
          "Promotional campaign executed"
        ]
      },
      week_4: {
        focus: "Optimization and Growth",
        tasks: [
          "Analyze performance metrics",
          "Adjust strategy based on data",
          "Plan collaborations and partnerships"
        ],
        deliverables: [
          "Performance report",
          "Refined strategy document"
        ]
      }
    },
    success_metrics: {
      subscriber_goal_30_days: "500-1,000 subscribers based on initial content quality and promotion",
      view_goal_30_days: "5,000-10,000 views across all content",
      engagement_rate_target: "5-8% engagement rate (likes, comments, shares)",
      key_milestones: [
        "First 100 subscribers",
        "First 1,000 views",
        "10% average watch time retention"
      ]
    },
    _source: 'text-parser-fallback',
    _note: 'JSON parsing failed - using comprehensive default analysis structure'
  };

  return analysis;
}

/**
 * Parse audience insights from text response (fallback when JSON fails)
 */
function parseAudienceTextResponse(text) {

  // Comprehensive fallback structure matching expected depth
  const insights = {
    demographic_profile: {
      age_distribution: {
        "16-24": "35%",
        "25-34": "40%",
        "35-44": "20%",
        "45+": "5%"
      },
      gender_distribution: {
        male: "60%",
        female: "37%",
        non_binary_other: "3%"
      },
      geographic_distribution: {
        united_states: "45%",
        united_kingdom: "12%",
        canada: "8%",
        australia: "6%",
        germany: "5%",
        other_europe: "15%",
        rest_of_world: "9%"
      },
      education_income: {
        education_level: {
          high_school: "25%",
          some_college: "35%",
          bachelors_degree: "30%",
          graduate_degree: "10%"
        },
        income_brackets: {
          under_30k: "40%",
          "30k_60k": "35%",
          "60k_100k": "20%",
          over_100k: "5%"
        }
      },
      _fallback: true
    },
    psychographic_analysis: {
      core_values: [
        "Authenticity and transparency",
        "Intellectual curiosity",
        "Creative expression",
        "Social awareness",
        "Independent thinking",
        "Quality over quantity",
        "Community and belonging"
      ],
      aspirations: [
        "Creative career success",
        "Financial independence",
        "Making meaningful impact",
        "Building authentic community",
        "Continuous learning and growth",
        "Personal development"
      ],
      pain_points: [
        "Information overload and misinformation",
        "Career uncertainty and financial instability",
        "Social isolation despite digital connection",
        "Creative block and imposter syndrome",
        "Work-life balance challenges"
      ],
      lifestyle_preferences: {
        media_consumption: "Heavy digital natives, multi-platform users consuming 3-5 hours of content daily",
        social_habits: "Online-first social interaction, meme culture participants, prefer small meaningful connections",
        leisure_activities: [
          "Streaming content (YouTube, Netflix, Twitch)",
          "Gaming (casual and competitive)",
          "Reading (digital and physical)",
          "Podcasts and audiobooks",
          "Social media browsing"
        ],
        work_style: "Flexible, remote-friendly, values autonomy and creativity over traditional structure"
      },
      _fallback: true
    },
    audience_overlap: {
      common_interests: [
        "Educational entertainment",
        "Personal development",
        "Creative content",
        "Internet culture and trends",
        "Technology and innovation",
        "Critical thinking and analysis",
        "Storytelling and narratives"
      ],
      cross_channel_following: {
        all_channels: "5-10%",
        similar_content_channels: "20-30%",
        complementary_niches: "15-25%"
      },
      unique_segments: {
        core_enthusiasts: {
          percentage: "25-30%",
          characteristics: [
            "Highly engaged superfans",
            "Regular commenters and sharers",
            "Premium content consumers"
          ]
        },
        casual_viewers: {
          percentage: "50-60%",
          characteristics: [
            "Occasional engagement",
            "Recommendation-driven discovery",
            "Passive consumption"
          ]
        },
        new_discoverers: {
          percentage: "15-20%",
          characteristics: [
            "Recently subscribed",
            "Exploring content catalog",
            "High conversion potential"
          ]
        }
      },
      _fallback: true
    },
    content_consumption_patterns: {
      preferred_video_length: {
        short_form_1_5_min: "15%",
        medium_form_8_15_min: "45%",
        long_form_20_45_min: "35%",
        extended_45_plus_min: "5%"
      },
      optimal_posting_times: {
        weekdays: "3-6 PM EST, 8-10 PM EST",
        weekends: "12-3 PM EST, 7-9 PM EST",
        peak_days: ["Tuesday", "Wednesday", "Saturday"]
      },
      viewing_behavior: {
        binge_watching: "Moderate - 40% watch 2-3 videos per session",
        completion_rate: "70% for videos under 15 minutes, 50% for longer content",
        return_frequency: "3-4 times per week average"
      },
      platform_preferences: {
        mobile: "65%",
        desktop: "30%",
        tv_streaming: "5%"
      },
      _fallback: true
    },
    engagement_drivers: {
      comment_triggers: [
        "Controversial or thought-provoking statements",
        "Personal stories and vulnerability",
        "Questions posed directly to audience",
        "Current events and trending topics",
        "Calls for audience input and feedback"
      ],
      sharing_motivators: [
        "Educational value they want to spread",
        "Content that validates their worldview",
        "Entertaining or emotional moments",
        "Supporting creators they love",
        "Starting discussions with friends"
      ],
      loyalty_builders: [
        "Consistent quality and authenticity",
        "Creator accessibility and interaction",
        "Exclusive or early access content",
        "Community building initiatives",
        "Transparent creative process"
      ],
      _fallback: true
    },
    monetization_potential: {
      product_categories: {
        high_interest: [
          "Digital courses and workshops ($25-150)",
          "Creative software and tools ($50-200)",
          "Books and digital publications ($10-30)",
          "Exclusive community memberships ($5-25/month)"
        ],
        medium_interest: [
          "Branded merchandise ($15-50)",
          "Tech gadgets and accessories ($30-300)",
          "Productivity tools ($10-50/month)",
          "Premium content subscriptions ($5-15/month)"
        ]
      },
      price_sensitivity: {
        threshold: "Under $50 for impulse purchases",
        consideration_range: "$50-200 for planned purchases",
        premium_acceptance: "Will pay premium for quality, authenticity, and exclusive value"
      },
      brand_affinity: {
        preferred_brands: [
          "Creator-owned brands and independent businesses",
          "Tech companies (Apple, Google, Adobe)",
          "Streaming platforms (Spotify, Netflix)",
          "Creative tools (Notion, Figma)",
          "Ethical and sustainable brands"
        ],
        brand_values_alignment: "Authenticity, sustainability, creativity, innovation, social responsibility"
      },
      services_needed: [
        "Content creation tools and platforms",
        "Online learning and skill development",
        "Financial planning and passive income guidance",
        "Mental health and wellness resources",
        "Career development and networking"
      ],
      _fallback: true
    },
    strategic_recommendations: {
      content_strategy: [
        "Create 10-15 minute deep-dive videos as primary content format",
        "Develop series format to encourage binge-watching and subscription",
        "Balance educational value with entertainment",
        "Include interactive elements and audience participation"
      ],
      community_building: [
        "Establish Discord server or community platform for deeper engagement",
        "Host live Q&A sessions or streams monthly",
        "Create collaborative projects with audience input",
        "Feature audience submissions and user-generated content"
      ],
      monetization_approach: [
        "Launch Patreon or membership program with tiered benefits",
        "Develop educational products (courses, guides, templates)",
        "Partner with aligned brands for authentic sponsorships",
        "Create limited-edition merchandise drops based on community feedback"
      ],
      _fallback: true
    },
    _source: 'text-parser-fallback',
    _note: 'JSON parsing failed - using comprehensive default audience structure based on typical YouTube demographics'
  };

  return insights;
}

/**
 * Generate fallback analysis if Claude fails
 */
function generateFallbackAnalysis(channels, config) {
  return {
    synergy: `Combining ${channels.length} successful channels creates unique opportunities`,
    audience: {
      description: 'A diverse audience interested in varied content',
      size: channels.reduce((sum, ch) => sum + (ch.subscriber_count || 0), 0)
    },
    positioning: `${config.name} - A unique blend of proven strategies`,
    contentStrategy: 'Mix content types from all source channels',
    voiceProfile: {
      tone: ['engaging', 'authentic'],
      style: ['conversational', 'informative']
    },
    growthTactics: [
      'Cross-promote to existing audiences',
      'Leverage combined SEO keywords',
      'Create collaborative content'
    ],
    challenges: [
      'Maintaining consistent brand identity',
      'Balancing different content styles'
    ],
    actionPlan: [
      'Week 1: Set up channel and branding',
      'Week 2: Create first 5 videos',
      'Week 3: Launch and promote',
      'Week 4: Analyze and optimize'
    ]
  };
}