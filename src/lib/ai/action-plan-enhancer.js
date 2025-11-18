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
- "Psyphoria" → Could be "Mind Psychology Explained", "Mental Health Tips", "Psychology Life Hacks"
- "Blackfiles" → Could be "Mystery Investigations", "Unsolved Cases", "True Story Breakdowns"
- "TechMystery" → Could be "Tech News Commentary", "Gadget Reviews", "Tech Drama Stories"
- "Kee" → If bio mentions psychology: "Everyday Psychology Tips", "Life Improvement Advice", "Practical Psychology"
- Single names often indicate personal brand channels focused on relatable, practical content sharing

Examples of SPECIFIC niches (never generic):
* Tech: "Tech Scam Exposés", "AI Product Reviews", "Gadget Unboxing Reviews", "Tech Drama Commentary", "Software Tutorial Guides"
* Crime: "True Crime Stories", "Unsolved Mystery Analysis", "Scam Investigation Videos", "Crime Documentary Breakdowns"
* Business: "Entrepreneur Success Stories", "Side Hustle Ideas", "Business Breakdown Analysis", "Company Drama Exposés", "Startup Failure Analysis"
* Education: "Quick Learning Hacks", "Study Tips & Techniques", "Educational Explainers", "Fun Science Experiments", "History Storytelling"
* Psychology: "Everyday Psychology Tips", "Social Skills Advice", "Dating Psychology", "Productivity Psychology", "Body Language Reads", "Confidence Building Tips", "Mental Health Awareness", "Life Advice Psychology", "Habit Formation Guide"
* Self-Improvement: "Morning Routine Optimization", "Fitness Transformation Stories", "Mindset Shift Strategies", "Goal Achievement Methods", "Time Management Hacks"
* Entertainment: "Movie Breakdown Analysis", "Gaming Commentary", "Pop Culture Commentary", "Celebrity Drama Analysis", "Reaction Content"
* Documentary: "Internet Drama Investigation", "Documentary Commentary", "Social Media Exposés", "Influencer Scandal Coverage"

IMPORTANT: Look at the video titles and descriptions to understand what the channel actually creates, not just the channel name!
- If videos are about "people who never get angry", "emotional control", "confidence" → This is "Everyday Psychology Tips" or "Self-Improvement Advice"
- If videos give life advice with psychological backing → This is "Life Advice Psychology" or "Practical Psychology"
- If videos are about everyday behaviors → This is "Social Psychology Tips" or "Human Behavior Insights"
- Prefer PRACTICAL, YOUTUBE-FRIENDLY niches over academic ones
- Avoid referencing academic conferences, scholarly theories, or university research unless the channel explicitly focuses on them
- Default to actionable, clickable content categories that work well on YouTube

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

Return ONLY a specific 2-4 word niche category. Examples: "Fitness Motivation", "Gaming Commentary", "Cooking Tutorials", "Life Advice", "Product Reviews"`;

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

    const prompt = `From these search results about ${niche}, extract 8-12 REAL, specific events that would make compelling YOUTUBE video content.

Search Results:
${JSON.stringify(searchResults.results.slice(0, 10), null, 2)}

Summary: ${searchResults.summary}

For each event, provide:
- title: Specific event title with real names (company/person/location)
- date: Approximate date (YYYY-MM format)
- description: Brief description (1-2 sentences)
- entities: Array of specific names mentioned (companies, people, locations)
- videoAngle: Why this would make a great YOUTUBE video (focus on clickability and engagement)
- estimatedViews: Realistic view potential (e.g., "50K-100K")

CRITICAL: Every event MUST be:
1. Based on a REAL incident/event from the search results
2. Include SPECIFIC names (no generic "The Company" or "A Person")
3. Include approximate dates
4. Verifiable through the sources provided
5. Be YOUTUBE-FRIENDLY and CLICKABLE (prefer viral stories, trending topics, drama, practical tips over academic conferences)
6. Avoid academic conferences, seminars, or scholarly symposiums UNLESS they involve major viral moments or scandals

PREFER: Viral incidents, trending stories, scandals, product launches, company drama, influencer events, breakthrough discoveries with mass appeal
AVOID: Academic conferences, university seminars, scholarly colloquia (unless they went viral or controversial)

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
   Examples (choose what fits the niche):
   - "Direct-to-camera talking head with engaging delivery"
   - "Screen recording tutorial with voiceover"
   - "Investigative documentary with evidence reveals and timeline graphics"
   - "Reaction format with genuine personality"
   - "List-style countdown with visual examples"
   - "Documentary deep-dive with archival footage and interviews"
   - "Quick-cut montage with trending music"
   - "Simple explainer with on-screen text overlays"

2. hook: A gripping 15-second opening line specific to ${niche}
   Examples (choose what fits the niche):
   - "I tried this for 30 days and here's what actually happened"
   - "Everyone gets this wrong - let me show you the right way"
   - "This scam stole $50 million and nobody saw it coming"
   - "You're probably making this mistake right now without realizing it"
   - "What I'm about to show you will change how you see everything"
   - "This company's collapse reveals a pattern nobody's talking about"
   - "I can't believe this actually works - watch this"

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

Be SPECIFIC to ${niche} content. Examples (choose what fits):
- Microphone for "Fitness Tips": "To capture clear audio for workout instructions and motivational talking-head videos"
- Camera for "Cooking Tutorials": "To film recipe demonstrations and ingredient close-ups with good quality"
- Microphone for "True Crime Stories": "To narrate complex investigations and create immersive documentary storytelling"
- Lighting for "Product Reviews": "To ensure products are well-lit and visible for detailed examination"
- Camera for "Scam Investigations": "To record evidence reveals and create professional documentary-style content"
- Ring light for "Beauty Content": "To achieve flattering lighting for makeup tutorials and skincare routines"

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
          item.purpose = `For creating engaging ${niche} content and improving video quality`;
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
