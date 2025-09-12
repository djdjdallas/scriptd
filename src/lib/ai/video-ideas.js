import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
  generateVideoIdeasWithAI
};