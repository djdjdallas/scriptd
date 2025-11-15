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

  // Format recent videos - handle both string array and object array formats
  let videoContext = 'No recent videos';
  if (recentVideos.length > 0) {
    if (typeof recentVideos[0] === 'string') {
      // Old format: just titles
      videoContext = recentVideos.join('\n- ');
    } else {
      // New format: objects with title and description
      videoContext = recentVideos.map((v, i) =>
        `${i + 1}. "${v.title}"\n   ${v.description ? `Description: ${v.description}` : ''}`
      ).join('\n\n');
    }
  }

  const prompt = `Analyze this YouTube channel and determine its EXACT niche. Be extremely specific.

Channel Name: ${name}
Channel Description: ${description || 'No description available'}

Recent Videos:
${videoContext}

${subscriberCount > 0 ? `Subscribers: ${subscriberCount.toLocaleString()}` : ''}
${videoCount > 0 ? `Total Videos: ${videoCount}` : ''}

CRITICAL ANALYSIS RULES:
1. Look for specific keywords and patterns in the channel name and videos
2. If the channel has no videos or description, analyze the name itself deeply
3. Never return generic niches like "Content Creation" or "General"
4. Be creative and specific based on available clues

Channel Name Analysis Examples:
- "Psyphoria" → Could be "Psychedelic Philosophy", "Psychology Euphoria Content", "Mind Expansion Topics"
- "Blackfiles" → Could be "Dark Web Investigations", "Classified Document Analysis", "Hacker Case Studies"
- "TechMystery" → Could be "Tech Crime Documentary", "Silicon Valley Investigations", "Startup Failure Analysis"
- "Kee" → If bio mentions psychology: "Applied Psychology Lessons", "Philosophical Psychology", "Mental Health Philosophy"
- Single names often indicate personal brand channels focused on expertise sharing

Examples of SPECIFIC niches (never generic):
* Tech: "Cybersecurity Breach Analysis", "AI Ethics Debates", "Quantum Computing Explained", "Blockchain Scam Investigations"
* Crime: "Hacker True Crime Stories", "Financial Fraud Documentary", "Cold Case DNA Analysis", "Prison Psychology Studies"
* Business: "Failed Startup Autopsies", "Billionaire Psychology Analysis", "Market Crash Investigations", "Corporate Espionage Cases"
* Education: "Neuroscience Breakthroughs", "Ancient Civilization Mysteries", "Mathematical Paradox Solutions", "Philosophy Mind Experiments"
* Psychology: "Practical Psychology Lessons", "Emotional Intelligence Training", "Human Behavior Analysis", "Self-Control Psychology", "Relationship Psychology", "Mental Strength Building", "Dark Psychology Explained", "Personality Types Explained", "Behavioral Science Insights", "Applied Social Psychology", "Everyday Psychology Tips"
* Philosophy: "Stoic Life Application", "Eastern Philosophy Practice", "Philosophical Psychology", "Life Hardship Philosophy", "Modern Philosophy Application"
* Entertainment: "Horror Movie Psychology", "Gaming Industry Scandals", "Music Theory Breakdowns", "Comedy Writing Analysis"

IMPORTANT: Look at the video titles and descriptions to understand what the channel actually creates, not just the channel name!
- If videos are about "people who never get angry", "emotional control", "confidence" → This is PRACTICAL PSYCHOLOGY or SELF-IMPROVEMENT
- If videos reference academic conferences, Jungian theory → This is ANALYTICAL PSYCHOLOGY
- If videos are about everyday behaviors → This is BEHAVIORAL PSYCHOLOGY
- If videos give life advice with psychological backing → This is APPLIED PSYCHOLOGY

Return in this JSON format:
{
  "broadCategory": "Technology/Crime/Business/Education/Entertainment/etc",
  "specificNiche": "EXACT specific niche (2-5 words, NEVER generic)",
  "subCategories": ["specific tag1", "specific tag2", "specific tag3"],
  "confidence": "high/medium/low",
  "reasoning": "Specific explanation of the clues that led to this niche determination"
}`;

  try {
    const response = await claude.generateCompletion(prompt, {
      model: 'claude-sonnet-4-5-20250929',
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
        model: 'claude-sonnet-4-5-20250929',
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
      model: 'claude-sonnet-4-5-20250929',
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
      model: 'claude-sonnet-4-5-20250929',
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

      // Only enrich if fields are missing or generic
      if (!template.format || !template.hook ||
          template.format === 'undefined' || template.hook === 'undefined' ||
          template.format.includes('undefined') || template.hook.includes('undefined') ||
          template.hook.length < 20 || template.format === 'Standard format') {
        try {
          const prompt = `For a ${niche} YouTube channel, create compelling content for this template:

Template Title: "${template.title}"
Structure: ${template.structure || template.type || 'Standard structure'}

Generate based on ${niche} style:
1. format: A specific production style for ${niche} content
   Examples:
   - "Investigative documentary with evidence reveals"
   - "Animated explainer with visual metaphors"
   - "First-person narrative with archival footage"
   - "Expert interview with demonstration segments"

2. hook: A gripping 15-second opening line specific to ${niche}
   Examples:
   - "What if I told you the biggest hack in history started with a typo?"
   - "Your brain on psychedelics looks nothing like you'd expect - let me show you"
   - "This company lost $50 billion in 24 hours, and nobody saw it coming"

Return ONLY valid JSON: { "format": "...", "hook": "..." }`;

          const response = await claude.generateCompletion(prompt, {
            model: 'claude-sonnet-4-5-20250929',
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

      if (!item.purpose || item.purpose === 'undefined' ||
          item.purpose.includes('undefined') ||
          item.purpose.length < 10) {
        try {
          const prompt = `For a ${niche} YouTube channel, explain why "${item.item}" is needed.

Be SPECIFIC to ${niche} content. Examples:
- Microphone for "Hacker True Crime": "To narrate complex cybersecurity incidents and interview security experts"
- Camera for "Psychedelic Philosophy": "To record visual discussions and consciousness-expanding presentations"
- Lighting for "Tech Investigations": "To create dramatic reveals and highlight evidence displays"

Answer in ONE sentence (10-20 words). Be specific to ${niche}.

Return ONLY the purpose text, no quotes.`;

          const purpose = await claude.generateCompletion(prompt, {
            model: 'claude-sonnet-4-5-20250929',
            temperature: 0.5,
            maxTokens: 100,
          });

          item.purpose = purpose.trim().replace(/['"]/g, '').slice(0, 100);
        } catch (error) {
          console.warn(`⚠️ Failed to enrich equipment ${i}:`, error.message);
          item.purpose = `For professional ${niche} content production and audience engagement`;
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
