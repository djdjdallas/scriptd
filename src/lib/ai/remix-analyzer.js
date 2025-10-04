import Anthropic from '@anthropic-ai/sdk';
import { analyzeChannelVoicesFromYouTube, combineRealVoiceAnalyses } from './remix-voice-analyzer';

// Initialize Anthropic with the premium model
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use VOICE_MODEL for remix analysis (Sonnet is more cost-effective and provides excellent results)
const REMIX_MODEL = process.env.VOICE_MODEL || process.env.REMIX_MODEL || 'claude-sonnet-4-20250514';

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
    try {
      // First try direct parse
      analysis = JSON.parse(content);
    } catch (e) {
      console.log('Initial parse failed, attempting JSON extraction and repair...');

      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      let jsonText = jsonMatch ? jsonMatch[1] : content;

      // Apply comprehensive JSON repairs
      try {
        jsonText = repairJSON(jsonText);
        analysis = JSON.parse(jsonText);
        console.log('✅ Successfully parsed after JSON repair');
      } catch (e2) {
        console.error('JSON parse failed even after repair:', e2.message);
        // Fallback: create structured data from text response
        analysis = parseTextResponse(content);
      }
    }

    return {
      success: true,
      analysis: analysis,
      model: REMIX_MODEL
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
export async function generateRemixContentIdeas(channels, config, analysis) {
  try {
    const prompt = `Based on this remixed YouTube channel combining ${channels.map(c => c.title || c.name).join(', ')}, generate 10 specific, high-potential video ideas.

Channel Remix: ${config.name}
Description: ${config.description}

Audience Profile: ${JSON.stringify(analysis?.audience || {}, null, 2)}
Content Strategy: ${analysis?.contentStrategy || 'Blend of source channels'}

Generate 10 video ideas that:
1. Appeal to the combined audience
2. Leverage strengths from all source channels
3. Are unique and haven't been overdone
4. Have high viral/growth potential
5. Are actionable and specific

For each video provide:
- Title (catchy, SEO-optimized)
- Description (2-3 sentences)
- Format (tutorial, reaction, etc.)
- Length (estimated)
- Key hooks
- Thumbnail concept
- SEO tags
- Estimated difficulty (easy/medium/hard)
- Growth potential (1-10)

Format as a JSON array.`;

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
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[1]);
      } else {
        ideas = [];
      }
    }

    return {
      success: true,
      ideas: Array.isArray(ideas) ? ideas : [ideas]
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
    const prompt = `Analyze the combined audience for a YouTube channel remix combining these channels:

${channels.map(ch => `- ${ch.title || ch.name}: ${ch.subscriber_count?.toLocaleString() || 'Unknown'} subscribers`).join('\n')}

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
    try {
      insights = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[1]);
      } else {
        insights = { raw: content };
      }
    }

    return {
      success: true,
      insights: insights
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
 * Comprehensive JSON repair function
 */
function repairJSON(jsonText) {
  let fixed = jsonText.trim();

  // Remove empty keys (critical fix)
  fixed = fixed.replace(/,?\s*""\s*:\s*"[^"]*"/g, '');
  fixed = fixed.replace(/,?\s*""\s*:\s*\{[^}]*\}/g, '');
  fixed = fixed.replace(/,?\s*""\s*:\s*\[[^\]]*\]/g, '');

  // Fix unescaped quotes in string values
  fixed = fixed.replace(
    /"([^":\\,\[\]{}]+)":\s*"([^"]*)"/g,
    (match, key, value) => {
      // Don't double-escape already escaped quotes
      if (value.includes('\\"')) return match;
      // Escape any unescaped quotes in the value
      let fixedValue = value.replace(/(?<!\\)"/g, '\\"');
      return `"${key}": "${fixedValue}"`;
    }
  );

  // Remove trailing commas
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // Add missing commas between properties
  fixed = fixed.replace(/([}\]])(\s*)("[^"]+":)/g, '$1,$2$3');
  fixed = fixed.replace(/("|\d|true|false|null)(\s+)("[^"]+":)/g, '$1,$2$3');

  // Clean up double commas created by removing empty keys
  fixed = fixed.replace(/,\s*,/g, ',');
  // Remove leading commas after opening braces
  fixed = fixed.replace(/\{\s*,/g, '{');

  return fixed;
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