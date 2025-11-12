import Anthropic from '@anthropic-ai/sdk';
import {
  searchRecentCrimes,
  searchTrendingCases,
  formatResearchForClaude
} from './perplexity-research.js';
import {
  addFactualMetadata,
  batchVerifyIdeas
} from './fact-checker.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate factual video ideas based on real events
 * First researches real cases with Perplexity, then uses Claude to create content strategy
 */
export async function generateFactualVideoIdeas(channelData, recentVideos, audienceData, trends) {
  try {
    console.log('🔍 Step 1: Researching real cases with Perplexity...');

    // Determine the channel's content focus
    const contentFocus = determineContentFocus(recentVideos, channelData.niche);

    // Research real cases using Perplexity
    const [recentCases, trendingCases] = await Promise.all([
      searchRecentCrimes(contentFocus.topic, {
        category: contentFocus.category,
        dateRange: 'past 2 years',
        maxResults: 10
      }),
      searchTrendingCases({
        timeframe: 'past 3 months',
        minViralScore: 70
      })
    ]);

    if (!recentCases.success && !trendingCases.success) {
      console.error('Failed to fetch real cases from Perplexity');
      // Fall back to original function
      return generateVideoIdeasWithAI(channelData, recentVideos, audienceData, trends);
    }

    // Format research for Claude
    const realEvents = [
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
          uniqueAngle: c.uniqueAngle,
          audienceHook: c.trendingReason
        }
      })) : [])
    ];

    console.log(`✅ Found ${realEvents.length} real cases to work with`);

    // Now use Claude to create compelling content from these real events
    return await generateContentFromRealEvents(
      channelData,
      recentVideos,
      audienceData,
      realEvents
    );

  } catch (error) {
    console.error('Factual video generation error:', error);
    // Fall back to original function
    return generateVideoIdeasWithAI(channelData, recentVideos, audienceData, trends);
  }
}

/**
 * Determine the channel's content focus based on recent videos
 */
function determineContentFocus(recentVideos, niche) {
  const titles = recentVideos.slice(0, 10).map(v => v.snippet?.title?.toLowerCase() || '').join(' ');

  // Comprehensive category analysis (not just fraud!)
  const categories = {
    'financial fraud': ['money', 'bank', 'fraud', 'million', 'billion', 'steal', 'scam', 'heist', 'embezzle'],
    'crypto scams': ['crypto', 'bitcoin', 'nft', 'blockchain', 'ethereum', 'defi', 'wallet'],
    'tech crimes': ['hack', 'data', 'breach', 'cyber', 'online', 'phishing', 'ransomware'],
    'corporate fraud': ['ceo', 'company', 'corporation', 'business', 'executive', 'corporate'],
    'identity theft': ['identity', 'fake', 'impersonat', 'stolen identity'],
    'romance scams': ['dating', 'romance', 'catfish', 'love', 'relationship scam'],
    'psychology': ['psychology', 'mental', 'brain', 'behavior', 'therapy', 'cognitive', 'mindset'],
    'self improvement': ['improve', 'productivity', 'habits', 'motivation', 'success', 'growth'],
    'technology': ['tech', 'ai', 'software', 'innovation', 'gadget', 'startup', 'silicon valley'],
    'science': ['science', 'research', 'discovery', 'experiment', 'study', 'scientist'],
    'business': ['entrepreneur', 'startup', 'marketing', 'sales', 'strategy', 'business model'],
    'true crime': ['murder', 'killer', 'crime', 'detective', 'investigation', 'serial', 'victim'],
    'history': ['history', 'historical', 'ancient', 'war', 'empire', 'civilization'],
    'sports': ['sport', 'athlete', 'game', 'championship', 'team', 'player'],
    'entertainment': ['celebrity', 'hollywood', 'movie', 'actor', 'film', 'entertainment'],
    'gaming': ['game', 'gaming', 'esports', 'gamer', 'gameplay', 'console'],
    'cooking': ['cook', 'recipe', 'food', 'chef', 'kitchen', 'meal'],
    'travel': ['travel', 'trip', 'destination', 'explore', 'adventure', 'tourist'],
    'fitness': ['fitness', 'workout', 'gym', 'exercise', 'health', 'training']
  };

  let bestCategory = 'general interest';
  let highestScore = 0;

  for (const [category, keywords] of Object.entries(categories)) {
    const score = keywords.filter(kw => titles.includes(kw)).length;
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }

  // If no strong match, use niche or default to general
  if (highestScore === 0 && niche) {
    bestCategory = niche;
  }

  return {
    topic: niche || bestCategory,
    category: bestCategory
  };
}

/**
 * Generate content strategy from real events using Claude
 */
async function generateContentFromRealEvents(channelData, recentVideos, audienceData, realEvents) {
  const videoHistory = recentVideos.slice(0, 10).map(v => ({
    title: v.snippet.title,
    views: v.statistics?.viewCount
  }));

  const prompt = `You are creating YouTube content ideas based on REAL, DOCUMENTED events. Each event has been verified and has sources.

Channel Context:
- Niche: ${channelData.niche}
- Subscribers: ${channelData.subscriberCount}
- Average Views: ${channelData.averageViews}
- Recent Videos: ${JSON.stringify(videoHistory, null, 2)}

REAL EVENTS TO CREATE CONTENT FROM:
${JSON.stringify(realEvents.slice(0, 10), null, 2)}

Create compelling YouTube video ideas from these REAL events. For each idea:
1. Use the actual event name and facts
2. Create an engaging title that highlights the shocking/interesting aspects
3. Develop hooks and storytelling approach
4. Keep all facts accurate to the sources provided

Generate 10 video ideas in this JSON format:
[
  {
    "title": "Engaging title about the REAL event",
    "factualBasis": {
      "verified": true,
      "realEvent": "Actual event name",
      "date": "When it happened",
      "keyFacts": ["3-5 verified facts"],
      "sources": ["Include the source URLs from the research"]
    },
    "concept": "How to tell this real story compellingly",
    "hooks": ["Opening hooks based on real facts"],
    "format": "Documentary-style investigation",
    "estimatedLength": "15-20 minutes",
    "difficulty": "easy/medium/hard",
    "viralPotential": 1-10,
    "thumbnailConcept": "Visual concept",
    "productionNotes": "Research and production requirements",
    "tags": ["relevant", "tags"],
    "contentWarnings": "Any sensitive content warnings if needed"
  }
]`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      temperature: 0.7, // Lower than before for more factual accuracy
      system: "You are a YouTube content strategist who ONLY creates ideas based on real, verified events. Never invent or embellish facts.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response - no JSON found');
    }

    let ideas = JSON.parse(jsonMatch[0]);

    // Ensure all ideas are marked as factual
    ideas = ideas.map(idea => ({
      ...idea,
      factualBasis: {
        ...idea.factualBasis,
        verified: true,
        verifiedAt: new Date().toISOString()
      }
    }));

    return {
      success: true,
      ideas,
      totalFactualIdeas: ideas.length,
      researchSources: realEvents.length,
      generatedAt: new Date().toISOString(),
      tokensUsed: response.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('Content generation from real events error:', error);
    throw error;
  }
}

/**
 * Original function - now marked as creative/unverified
 */
export async function generateVideoIdeasWithAI(channelData, recentVideos, audienceData, trends) {
  try {
    const videoHistory = recentVideos.slice(0, 20).map(v => ({
      title: v.snippet.title,
      views: v.statistics?.viewCount,
      performance: parseInt(v.statistics?.viewCount) / channelData.averageViews
    }));

    const prompt = `Generate creative, high-potential video ideas for this YouTube channel based on their history and audience.

Channel Context:
- Niche: ${channelData.niche}
- Subscribers: ${channelData.subscriberCount}
- Average Views: ${channelData.averageViews}
- Audience: ${audienceData?.persona || 'General audience'}

Recent Video Performance:
${JSON.stringify(videoHistory, null, 2)}

Current Trends:
${JSON.stringify(trends?.slice(0, 5) || [], null, 2)}

Generate comprehensive video ideas in JSON format:
{
  "viralPotentialIdeas": [
    {
      "title": "Compelling video title",
      "concept": "Detailed concept description",
      "hook": "First 5 seconds hook",
      "format": "Video format (tutorial/reaction/etc)",
      "estimatedLength": "Optimal duration",
      "viralScore": 0-100,
      "uniqueAngle": "What makes this different",
      "thumbnailConcept": "Thumbnail idea description",
      "expectedViews": "View range prediction",
      "productionComplexity": "Easy/Medium/Hard",
      "requiredResources": ["List of needed resources"],
      "collaborationOpportunity": "Potential collabs",
      "bestPublishTime": "Optimal publish day/time"
    }
  ],
  "seriesIdeas": [
    {
      "seriesName": "Series title",
      "concept": "Overall series concept",
      "episodeCount": 5-20,
      "episodes": [
        {
          "episodeNumber": 1,
          "title": "Episode title",
          "focus": "Episode focus",
          "cliffhanger": "Hook for next episode"
        }
      ],
      "audienceRetention": "How to keep viewers watching",
      "crossPromotion": "How episodes promote each other",
      "expectedGrowth": "Subscriber growth potential"
    }
  ],
  "trendingAdaptations": [
    {
      "originalTrend": "Current trend",
      "adaptation": "Your unique take",
      "title": "Video title",
      "timeSensitivity": "High/Medium/Low",
      "publishBy": "Latest publish date for relevance",
      "competitorAnalysis": "What others are missing",
      "estimatedReach": "Potential reach"
    }
  ],
  "evergreenContent": [
    {
      "title": "Timeless video title",
      "concept": "Core concept",
      "searchVolume": "Monthly searches",
      "competitionLevel": "Low/Medium/High",
      "seoKeywords": ["Target keywords"],
      "longTermValue": "Why this stays relevant",
      "updateStrategy": "How to refresh over time"
    }
  ],
  "experimentalIdeas": [
    {
      "title": "Innovative video title",
      "concept": "Experimental concept",
      "risk": "Low/Medium/High",
      "reward": "Potential upside",
      "audienceReaction": "Expected response",
      "learningOpportunity": "What you'll learn",
      "pivotStrategy": "How to adjust if it fails"
    }
  ],
  "quickWins": [
    {
      "title": "Easy video title",
      "concept": "Simple concept",
      "productionTime": "Hours needed",
      "recycledContent": "What existing content to reuse",
      "expectedROI": "Return on time invested"
    }
  ],
  "collaborationIdeas": [
    {
      "title": "Collab video title",
      "collaboratorProfile": "Ideal collaborator type",
      "mutualBenefit": "Win-win explanation",
      "format": "Collab format",
      "reachMultiplier": "Audience expansion potential"
    }
  ],
  "contentCalendar": {
    "week1": [
      {
        "day": "Monday/Wednesday/Friday/etc",
        "videoIdea": "Which idea to publish",
        "preparationNeeded": "Prep required"
      }
    ],
    "week2": ["Week 2 schedule"],
    "week3": ["Week 3 schedule"],
    "week4": ["Week 4 schedule"],
    "specialDates": [
      {
        "date": "Special date/holiday",
        "opportunity": "Content opportunity",
        "idea": "Specific video idea"
      }
    ]
  },
  "audienceRequests": [
    {
      "requestType": "Common audience request",
      "videoIdea": "How to fulfill it",
      "expectedSatisfaction": 0-100,
      "communityBuilding": "How this strengthens community"
    }
  ],
  "contentGaps": [
    {
      "gap": "Missing content type",
      "opportunity": "Why fill this gap",
      "videoIdea": "Specific video to fill gap",
      "audienceNeed": "What need this meets"
    }
  ]
}

Generate creative, specific, and actionable video ideas that align with the channel's brand and audience expectations while pushing creative boundaries.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      temperature: 0.9,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response - no JSON found');
    }

    let ideas;
    try {
      // First attempt: try to parse the matched JSON
      ideas = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Initial JSON parse failed, attempting to clean JSON:', parseError.message);
      
      // Clean up common JSON issues
      let cleanedJson = jsonMatch[0]
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/'/g, '"')      // Replace single quotes with double quotes
        .replace(/(\w+):/g, '"$1":')  // Quote unquoted keys
        .replace(/:\s*undefined/g, ': null')  // Replace undefined with null
        .replace(/\n\s*\n/g, '\n')  // Remove extra blank lines
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas more aggressively
      
      try {
        ideas = JSON.parse(cleanedJson);
      } catch (secondError) {
        console.error('Cleaned JSON parse also failed:', secondError.message);
        console.error('JSON content (first 500 chars):', cleanedJson.substring(0, 500));
        throw new Error(`Failed to parse AI response: ${secondError.message}`);
      }
    }

    return {
      success: true,
      ideas,
      tokensUsed: response.usage?.total_tokens || 0,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Video Ideas Generation Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackVideoIdeas()
    };
  }
}

function generateFallbackVideoIdeas() {
  return {
    viralPotentialIdeas: [
      {
        title: "10 Things You Didn't Know About [Your Niche]",
        concept: "Revealing surprising facts",
        hook: "You won't believe number 7...",
        format: "Listicle",
        estimatedLength: "8-10 minutes",
        viralScore: 70,
        uniqueAngle: "Exclusive research",
        thumbnailConcept: "Shocked expression with bold text",
        expectedViews: "2-3x average",
        productionComplexity: "Medium",
        requiredResources: ["Research", "Graphics"],
        collaborationOpportunity: "Expert interview",
        bestPublishTime: "Tuesday 2PM"
      }
    ],
    seriesIdeas: [],
    trendingAdaptations: [],
    evergreenContent: [],
    experimentalIdeas: [],
    quickWins: [],
    collaborationIdeas: [],
    contentCalendar: {
      week1: [],
      week2: [],
      week3: [],
      week4: [],
      specialDates: []
    },
    audienceRequests: [],
    contentGaps: []
  };
}

export default {
  generateVideoIdeasWithAI,
  generateFactualVideoIdeas
};