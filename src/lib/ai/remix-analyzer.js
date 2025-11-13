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

Please provide a comprehensive analysis with the following sections:

1. SYNERGY ANALYSIS
Identify the key synergies between these channels. What makes them work well together? What unique opportunity does this combination create?

2. COMBINED AUDIENCE PROFILE
Create a detailed audience persona that represents the combined viewership. Include:
- Demographics (age, location, interests)
- Psychographics (values, goals, pain points)
- Content preferences
- Viewing habits

3. UNIQUE POSITIONING
Define the unique value proposition of this remixed channel. How does it stand out from both the source channels and competitors?

4. CONTENT STRATEGY
Provide specific content pillars and video ideas that blend elements from all channels while maintaining uniqueness.

5. VOICE & STYLE GUIDE
Create a unique voice profile that combines the best elements of each channel's presentation style.

6. GROWTH TACTICS
Suggest specific growth strategies that leverage the combined strengths of all source channels.

7. POTENTIAL CHALLENGES
Identify potential challenges in combining these channels and how to overcome them.

8. FIRST 30 DAYS ACTION PLAN
Provide a specific action plan for the first month of the remixed channel.

CRITICAL JSON RULES:
- Respond ONLY with valid JSON (no markdown, no code blocks)
- Never use empty keys (all keys must be non-empty strings)
- All property names must be descriptive and non-empty
- Ensure all quotes are properly escaped using backslash (\\")
- No trailing commas
- Validate JSON structure before responding

Format your response as a structured JSON object.`;

    const response = await anthropic.messages.create({
      model: REMIX_MODEL,
      max_tokens: 4000,
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
      console.log('✅ Direct JSON parse successful');
    } catch (e) {
      console.log('Initial parse failed, attempting JSON extraction and repair...');

      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      let jsonText = jsonMatch ? jsonMatch[1] : content;

      // Apply comprehensive JSON repairs
      try {
        jsonText = repairJSON(jsonText);
        analysis = JSON.parse(jsonText);
        parseMethod = 'repaired';
        console.log('✅ Successfully parsed after JSON repair');
      } catch (e2) {
        // Log compact error (no need for full error message)
        console.log(`⚠️  JSON repair couldn't fix syntax error - using text fallback`);

        // Fallback: create structured data from text response
        analysis = parseTextResponse(content);
        parseMethod = 'text-fallback';
        console.log('✅ Text-based parsing complete - analysis data generated');
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
    console.log('🎯 Starting enhanced voice profile generation with real YouTube data...');
    
    // First, try to get real voice analyses from YouTube
    const channelAnalyses = await analyzeChannelVoicesFromYouTube(channels, config);
    
    // Combine the real analyses
    const combinedResult = await combineRealVoiceAnalyses(channelAnalyses, config);
    
    if (combinedResult.success) {
      console.log('✅ Successfully created voice profile from real YouTube data');
      return {
        success: true,
        voiceProfile: combinedResult.voiceProfile,
        basedOnRealData: true,
        channelAnalyses: combinedResult.channelAnalyses
      };
    }
    
    // Fallback to theoretical blending if real analysis fails
    console.log('⚠️ Falling back to theoretical voice blending...');
    
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

  console.log(`🎯 Detected channel topic: ${bestTopic} (score: ${bestScore})`);
  console.log(`🔍 Will search for: ${topicConfig.searchTopics[0]}`);

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
      console.log('🔍 Researching real events for content ideas...');

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
          console.log(`✅ Found ${realEvents.length} real cases for content ideas`);
        }
      } catch (error) {
        console.error('Perplexity research error:', error);
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

    // Debug log the response
    console.log('📝 Claude response preview (first 500 chars):', content.substring(0, 500));

    let ideas;
    try {
      ideas = JSON.parse(content);
    } catch (e) {
      console.log('Failed direct JSON parse, trying to extract from markdown...');
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      let jsonText = jsonMatch ? jsonMatch[1] : content;

      // Apply comprehensive JSON repairs
      try {
        jsonText = repairComplexJSON(jsonText);
        ideas = JSON.parse(jsonText);
        console.log('✅ Successfully parsed after JSON repair');
      } catch (e2) {
        console.error('Failed to parse JSON from markdown:', e2.message);
        // Try to find array pattern
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try {
            const repairedArray = repairComplexJSON(arrayMatch[0]);
            ideas = JSON.parse(repairedArray);
            console.log('✅ Successfully parsed array after repair');
          } catch (e3) {
            console.error('Failed to parse array:', e3.message);
            ideas = [];
          }
        } else {
          console.error('No valid JSON found in response');
          ideas = [];
        }
      }
    }

    // Ensure we have valid ideas
    const validIdeas = Array.isArray(ideas) ? ideas : [ideas];

    console.log(`📊 Parsed ${validIdeas.length} content ideas`);
    if (validIdeas.length > 0) {
      console.log('First idea title:', validIdeas[0]?.title || 'No title');
    }

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

Provide deep insights about:

1. AUDIENCE OVERLAP
- What percentage likely follows multiple source channels?
- Common interests across all audiences
- Unique segments from each channel

2. DEMOGRAPHIC PROFILE
- Age distribution
- Geographic distribution
- Gender distribution
- Education and income levels

3. PSYCHOGRAPHIC ANALYSIS
- Core values and beliefs
- Lifestyle preferences
- Pain points and challenges
- Aspirations and goals

4. CONTENT CONSUMPTION PATTERNS
- Preferred video length
- Best posting times
- Binge-watching behavior
- Platform preferences (mobile vs desktop)

5. ENGAGEMENT DRIVERS
- What makes them comment?
- What makes them share?
- What builds loyalty?

6. MONETIZATION POTENTIAL
- Products they'd buy
- Services they need
- Price sensitivity
- Brand affinity

Provide specific, actionable insights formatted as JSON.`;

    const response = await anthropic.messages.create({
      model: REMIX_MODEL,
      max_tokens: 2500,
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
      console.log('✅ Direct JSON parse successful (audience insights)');
    } catch (e) {
      console.log('Initial parse failed, attempting JSON extraction and repair (audience insights)...');

      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      let jsonText = jsonMatch ? jsonMatch[1] : content;

      // Apply comprehensive JSON repairs
      try {
        jsonText = repairJSON(jsonText);
        insights = JSON.parse(jsonText);
        parseMethod = 'repaired';
        console.log('✅ Successfully parsed after JSON repair (audience insights)');
      } catch (e2) {
        // NEVER store raw content - parse it into structured data
        console.log(`⚠️ JSON repair couldn't fix syntax error - using text fallback for audience insights`);

        // Fallback: Parse text into structured audience data
        insights = parseAudienceTextResponse(content);
        parseMethod = 'text-fallback';
        console.log('✅ Text-based parsing complete for audience insights');
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

  console.log('🔧 Attempting JSON repair...');

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

  console.log('✅ JSON repair complete');
  return fixed;
}

/**
 * Original JSON repair function (kept for backwards compatibility)
 */
function repairJSON(jsonText) {
  return repairComplexJSON(jsonText);
}

function parseTextResponse(text) {
  // Basic parsing to create structured data from text
  const sections = text.split(/\n\n+/);
  const analysis = {
    synergy: '',
    audience: {},
    positioning: '',
    contentStrategy: '',
    voiceProfile: {},
    growthTactics: [],
    challenges: [],
    actionPlan: []
  };

  sections.forEach(section => {
    const lower = section.toLowerCase();
    if (lower.includes('synerg')) {
      analysis.synergy = section;
    } else if (lower.includes('audience')) {
      analysis.audience = { description: section };
    } else if (lower.includes('position')) {
      analysis.positioning = section;
    } else if (lower.includes('content')) {
      analysis.contentStrategy = section;
    } else if (lower.includes('voice') || lower.includes('style')) {
      analysis.voiceProfile = { description: section };
    } else if (lower.includes('growth')) {
      analysis.growthTactics = section.split('\n').filter(l => l.trim());
    } else if (lower.includes('challenge')) {
      analysis.challenges = section.split('\n').filter(l => l.trim());
    } else if (lower.includes('action') || lower.includes('plan')) {
      analysis.actionPlan = section.split('\n').filter(l => l.trim());
    }
  });

  return analysis;
}

/**
 * Parse audience insights from text response (fallback when JSON fails)
 */
function parseAudienceTextResponse(text) {
  console.log('📝 Parsing audience insights from text...');

  const sections = text.split(/\n\n+/);
  const insights = {
    demographic_profile: {},
    psychographic_analysis: {},
    audience_overlap: {},
    content_consumption_patterns: {},
    engagement_drivers: {},
    monetization_potential: {},
    _source: 'text-parser',
    _note: 'Parsed from unstructured text response'
  };

  sections.forEach(section => {
    const lower = section.toLowerCase();

    if (lower.includes('demographic') || lower.includes('age') || lower.includes('gender')) {
      // Extract demographic info
      const lines = section.split('\n').filter(l => l.trim());
      insights.demographic_profile = {
        description: section,
        keyPoints: lines.slice(0, 5).map(l => l.trim())
      };
    } else if (lower.includes('psychographic') || lower.includes('values') || lower.includes('lifestyle')) {
      insights.psychographic_analysis = {
        description: section,
        keyTraits: section.match(/\b(value|believe|prefer|seek|want)\w*\s+[^.!?]+[.!?]/gi) || []
      };
    } else if (lower.includes('overlap') || lower.includes('common interest')) {
      insights.audience_overlap = {
        description: section,
        commonInterests: section.match(/[-•]\s*([^:\n]+)/g) || []
      };
    } else if (lower.includes('consumption') || lower.includes('viewing') || lower.includes('watch')) {
      insights.content_consumption_patterns = {
        description: section
      };
    } else if (lower.includes('engagement') || lower.includes('comment') || lower.includes('share')) {
      insights.engagement_drivers = {
        description: section
      };
    } else if (lower.includes('monetization') || lower.includes('product') || lower.includes('price')) {
      insights.monetization_potential = {
        description: section
      };
    }
  });

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