/**
 * Action Plan Enhancement with AI
 * Multi-stage AI processing for high-quality action plans
 */

import { getClaudeService } from './claude';
import { performMultiTierSearch } from './multi-tier-search';

/**
 * STAGE 1: Detect Channel Niche (ENHANCED)
 * Uses AI to analyze channel and determine specific niche with confidence scoring
 */
export async function detectChannelNiche(channelData) {
  const {
    name,
    description = '',
    recentVideos = [],
    subscriberCount = 0,
    viewCount = 0,
    videoCount = 0
  } = channelData;

  console.log(`🎯 Detecting niche for channel: ${name}`);

  const claude = getClaudeService();

  const prompt = `Analyze this YouTube channel and determine its niche with detailed categorization.

Channel Name: ${name}
Description: ${description || 'No description available'}
Recent Video Titles: ${recentVideos.length > 0 ? recentVideos.join(', ') : 'No recent videos'}
${subscriberCount > 0 ? `Subscribers: ${subscriberCount.toLocaleString()}` : ''}
${videoCount > 0 ? `Total Videos: ${videoCount}` : ''}

Requirements:
- Analyze the channel name, description, and video titles to understand the content pattern
- Be hyper-specific about the content style and approach
- Use 2-5 words maximum for each category

Examples by domain:
* Tech: "Cybersecurity Investigations", "AI Product Reviews", "Programming Tutorials", "Tech Startup Analysis"
* Crime: "Hacker True Crime", "Mystery Investigations", "Cold Case Documentary", "Forensic Analysis"
* Business: "Startup Deep Dives", "Financial Market Analysis", "Entrepreneur Interviews", "SaaS Product Reviews"
* Education: "Science Explainers", "History Documentary", "Math Tutorials", "Philosophy Discussions"
* Entertainment: "Movie Commentary", "Gaming Walkthroughs", "Music Production", "Stand-up Comedy"

Return in this JSON format:
{
  "broadCategory": "Technology/Crime/Business/Education/Entertainment/etc",
  "specificNiche": "Exact specific niche (2-5 words)",
  "subCategories": ["tag1", "tag2", "tag3"],
  "confidence": "high/medium/low",
  "reasoning": "Brief 1-sentence explanation of why this niche was chosen"
}`;

  try {
    const response = await claude.generateCompletion(prompt, {
      model: 'claude-sonnet-4-20250514',
      temperature: 0.3,
      maxTokens: 300,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse niche detection JSON');
    }

    const nicheData = JSON.parse(jsonMatch[0]);

    console.log(`✅ Detected niche: ${nicheData.specificNiche}`);
    console.log(`   Broad Category: ${nicheData.broadCategory}`);
    console.log(`   Confidence: ${nicheData.confidence}`);
    console.log(`   Sub-categories: ${nicheData.subCategories.join(', ')}`);
    console.log(`   Reasoning: ${nicheData.reasoning}`);

    // Return the enhanced niche data
    return {
      niche: nicheData.specificNiche,
      broadCategory: nicheData.broadCategory,
      subCategories: nicheData.subCategories || [],
      confidence: nicheData.confidence,
      reasoning: nicheData.reasoning
    };
  } catch (error) {
    console.error('❌ Enhanced niche detection failed:', error);
    console.warn('⚠️ Falling back to simple niche detection...');

    // Fallback to simple detection
    try {
      const simplePrompt = `Analyze this YouTube channel: "${name}"
Description: ${description}
Videos: ${recentVideos.join(', ')}

Return ONLY a specific 2-4 word niche category. Examples: "Cybersecurity Documentary", "Tech Reviews", "Cooking Tutorials"`;

      const simpleResponse = await claude.generateCompletion(simplePrompt, {
        model: 'claude-sonnet-4-20250514',
        temperature: 0.3,
        maxTokens: 50,
      });

      const cleanNiche = simpleResponse.trim().replace(/['"]/g, '');
      return {
        niche: cleanNiche,
        broadCategory: 'Content Creation',
        subCategories: [],
        confidence: 'low',
        reasoning: 'Fallback detection'
      };
    } catch (fallbackError) {
      console.error('❌ Fallback niche detection also failed:', fallbackError);
      return {
        niche: 'Content Creation',
        broadCategory: 'General',
        subCategories: [],
        confidence: 'low',
        reasoning: 'Default fallback'
      };
    }
  }
}

/**
 * STAGE 2: Find Real Events (ENHANCED with sub-categories)
 * Uses multi-tier search to find real, recent events in the niche
 */
export async function findRealEvents(niche, timeframe = '12 months', subCategories = []) {
  console.log(`🔍 Finding real events in ${niche} (last ${timeframe})`);

  const currentYear = new Date().getFullYear();

  // Build enhanced search query with sub-categories
  let searchQuery = `major ${niche} events incidents news ${currentYear} ${currentYear - 1}`;
  if (subCategories.length > 0) {
    searchQuery += ` ${subCategories.join(' ')}`;
  }

  try {
    // Use multi-tier search
    const searchResults = await performMultiTierSearch(searchQuery, {
      maxResults: 15,
      includeContent: true
    });

    if (!searchResults.success) {
      throw new Error('Search failed');
    }

    // Use AI to extract structured events from search results
    const claude = getClaudeService();

    const prompt = `From these search results about ${niche}, extract 8-12 REAL, specific events that would make compelling video content.

Search Results:
${JSON.stringify(searchResults.results.slice(0, 10), null, 2)}

Summary: ${searchResults.summary}

For each event, provide:
- title: Specific event title with real names (company/person/location)
- date: Approximate date (YYYY-MM format)
- description: Brief description (1-2 sentences)
- entities: Array of specific names mentioned (companies, people, locations)
- videoAngle: Why this would make a great video
- estimatedViews: Realistic view potential (e.g., "50K-100K")

CRITICAL: Every event MUST be:
1. Based on a REAL incident/event from the search results
2. Include SPECIFIC names (no generic "The Company" or "A Person")
3. Include approximate dates
4. Verifiable through the sources provided

Return ONLY a JSON array of events, no other text.`;

    const response = await claude.generateCompletion(prompt, {
      model: 'claude-sonnet-4-20250514',
      temperature: 0.5,
      maxTokens: 3000,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse events JSON');
    }

    const events = JSON.parse(jsonMatch[0]);
    console.log(`✅ Found ${events.length} real events`);

    return {
      success: true,
      events,
      searchProvider: searchResults.provider,
      searchSummary: searchResults.summary
    };
  } catch (error) {
    console.error('❌ Real events search failed:', error);
    return {
      success: false,
      events: [],
      error: error.message
    };
  }
}

/**
 * STAGE 3: Validate Content Ideas
 * Ensures all content ideas reference real events with specific details
 */
export async function validateContentIdeas(contentIdeas, realEvents, niche) {
  console.log(`✅ Validating ${contentIdeas.length} content ideas against real events`);

  const claude = getClaudeService();

  const prompt = `Validate and enhance these content ideas for a ${niche} channel.

Content Ideas to Validate:
${JSON.stringify(contentIdeas, null, 2)}

Real Events for Reference:
${JSON.stringify(realEvents, null, 2)}

For each content idea:
1. Check if it references a real event from the list
2. If generic/template, replace with a specific real event
3. Add specific details (names, dates, locations)
4. Ensure title is compelling and specific

Return a JSON array with validated ideas in this format:
[
  {
    "title": "Specific title with real names and details",
    "hook": "15-second opening hook to grab attention",
    "description": "What the video covers",
    "estimatedViews": "Realistic view range",
    "basedOnEvent": "Which real event this references",
    "specifics": "Key names, dates, or details mentioned"
  }
]`;

  try {
    const response = await claude.generateCompletion(prompt, {
      model: 'claude-sonnet-4-20250514',
      temperature: 0.6,
      maxTokens: 3000,
    });

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️ Could not parse validated ideas, using originals');
      return contentIdeas;
    }

    const validatedIdeas = JSON.parse(jsonMatch[0]);
    console.log(`✅ Validated ${validatedIdeas.length} content ideas`);
    return validatedIdeas;
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return contentIdeas; // Return originals on failure
  }
}

/**
 * STAGE 4: Enrich Action Plan
 * Fills in missing fields using AI
 */
export async function enrichActionPlan(actionPlan, niche) {
  console.log(`🎨 Enriching action plan fields for ${niche}`);

  const claude = getClaudeService();

  // Enrich content templates
  if (actionPlan.contentTemplates && actionPlan.contentTemplates.length > 0) {
    console.log('📝 Enriching content templates...');

    for (let i = 0; i < actionPlan.contentTemplates.length; i++) {
      const template = actionPlan.contentTemplates[i];

      // Only enrich if fields are missing
      if (!template.format || !template.hook || template.format === 'undefined' || template.hook === 'undefined') {
        try {
          const prompt = `For this ${niche} video template, provide:

Template Title: "${template.title}"
Structure: ${template.structure || template.type || 'Standard structure'}

Generate:
1. format: The production format/style (e.g., "Documentary investigation", "Tutorial walkthrough", "Interview-based storytelling")
2. hook: A compelling 15-second opening line to grab viewer attention

Return ONLY valid JSON: { "format": "...", "hook": "..." }`;

          const response = await claude.generateCompletion(prompt, {
            model: 'claude-sonnet-4-20250514',
            temperature: 0.7,
            maxTokens: 200,
          });

          const jsonMatch = response.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const enriched = JSON.parse(jsonMatch[0]);
            template.format = enriched.format || template.structure || 'Standard format';
            template.hook = enriched.hook || 'Start with a compelling hook...';
          }
        } catch (error) {
          console.warn(`⚠️ Failed to enrich template ${i}:`, error.message);
          template.format = template.structure || 'Standard format';
          template.hook = 'Hook viewers in the first 15 seconds...';
        }
      }
    }
  }

  // Enrich equipment
  if (actionPlan.equipment && actionPlan.equipment.length > 0) {
    console.log('🎥 Enriching equipment list...');

    for (let i = 0; i < actionPlan.equipment.length; i++) {
      const item = actionPlan.equipment[i];

      if (!item.purpose || item.purpose === 'undefined') {
        try {
          const prompt = `Why would a ${niche} content creator need: ${item.item}?

Answer in ONE sentence (5-15 words max). Be specific to ${niche} content creation.

Return ONLY the purpose text, no quotes or extra formatting.`;

          const purpose = await claude.generateCompletion(prompt, {
            model: 'claude-sonnet-4-20250514',
            temperature: 0.3,
            maxTokens: 50,
          });

          item.purpose = purpose.trim().replace(/['"]/g, '');
        } catch (error) {
          console.warn(`⚠️ Failed to enrich equipment ${i}:`, error.message);
          item.purpose = `Essential for ${niche} content production`;
        }
      }
    }
  }

  console.log(`✅ Enrichment complete`);
  return actionPlan;
}

/**
 * Complete Multi-Stage Enhancement Pipeline
 * Runs all enhancement stages in sequence
 */
export async function enhanceActionPlanComplete(channelData, rawActionPlan) {
  console.log('🚀 Starting complete action plan enhancement pipeline');

  try {
    // Stage 1: Detect niche
    const niche = await detectChannelNiche(channelData);

    // Stage 2: Find real events
    const { events: realEvents } = await findRealEvents(niche);

    // Stage 3: Validate content ideas
    if (rawActionPlan.contentIdeas && rawActionPlan.contentIdeas.length > 0) {
      rawActionPlan.contentIdeas = await validateContentIdeas(
        rawActionPlan.contentIdeas,
        realEvents,
        niche
      );
    }

    // Stage 4: Enrich missing fields
    const enrichedPlan = await enrichActionPlan(rawActionPlan, niche);

    // Add metadata
    enrichedPlan.detectedNiche = niche;
    enrichedPlan.realEventsCount = realEvents.length;
    enrichedPlan.enhancementApplied = true;

    console.log('✅ Complete enhancement pipeline finished');
    return enrichedPlan;
  } catch (error) {
    console.error('❌ Enhancement pipeline failed:', error);
    return rawActionPlan; // Return unenhanced on failure
  }
}
