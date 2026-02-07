import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function optimizeSEOWithAI(videoData, channelData, competitorData) {
  try {
    const prompt = `Provide advanced SEO optimization strategy for this YouTube video/channel using competitive analysis and keyword research.

Video/Content Context:
${JSON.stringify(videoData, null, 2)}

Channel Stats:
- Subscribers: ${channelData.subscriberCount}
- Niche: ${channelData.niche}
- Average Views: ${channelData.averageViews}

Competitor Analysis:
${JSON.stringify(competitorData || 'No competitor data available', null, 2)}

Generate comprehensive SEO optimization in JSON format:
{
  "keywordStrategy": {
    "primaryKeywords": [
      {
        "keyword": "Main keyword",
        "searchVolume": "Monthly searches",
        "difficulty": 0-100,
        "relevance": 0-100,
        "currentRank": "Current position if applicable",
        "targetRank": "Achievable position",
        "optimizationTips": ["Specific tips for this keyword"]
      }
    ],
    "secondaryKeywords": [
      {
        "keyword": "Supporting keyword",
        "searchVolume": "Monthly searches",
        "useCase": "Where to use this keyword"
      }
    ],
    "longTailKeywords": [
      {
        "keyword": "Long tail phrase",
        "intent": "Search intent",
        "conversionPotential": "Low/Medium/High",
        "placement": "Where to use"
      }
    ],
    "trendingKeywords": [
      {
        "keyword": "Trending term",
        "trendStrength": 0-100,
        "timeWindow": "How long it will trend",
        "firstMoverAdvantage": true/false
      }
    ]
  },
  "titleOptimization": {
    "currentTitle": "Current title if provided",
    "optimizedTitles": [
      {
        "title": "Optimized title option",
        "clickPotential": 0-100,
        "seoScore": 0-100,
        "emotionalHook": "Emotional trigger used",
        "characterCount": 0-100,
        "powerWords": ["Power words used"],
        "reasoning": "Why this title works"
      }
    ],
    "titleFormulas": [
      {
        "formula": "Title structure formula",
        "example": "Example using this formula",
        "bestFor": "When to use this formula"
      }
    ],
    "abTestingSuggestions": ["Titles to A/B test"]
  },
  "descriptionOptimization": {
    "structure": {
      "firstLine": "Hook for first line",
      "keywordPlacement": ["Where to place keywords naturally"],
      "sections": [
        {
          "sectionName": "Section title",
          "content": "What to include",
          "keywords": ["Keywords for this section"]
        }
      ],
      "callToAction": "CTA placement and text",
      "timestamps": "Timestamp strategy"
    },
    "optimizedDescription": "Full optimized description text",
    "linkStrategy": {
      "internalLinks": ["Links to your content"],
      "externalLinks": ["Valuable external resources"],
      "affiliateLinks": ["Affiliate opportunity"]
    }
  },
  "tagStrategy": {
    "recommendedTags": [
      {
        "tag": "Tag text",
        "priority": "High/Medium/Low",
        "reason": "Why use this tag",
        "competitorUsage": "% of competitors using"
      }
    ],
    "tagOrder": ["Optimal tag order"],
    "avoidTags": ["Tags to avoid and why"],
    "tagLimit": "Recommended number of tags"
  },
  "thumbnailSEO": {
    "textOverlay": {
      "primaryText": "Main thumbnail text",
      "supportingText": "Secondary text if any",
      "keywords": ["Visual keywords to include"],
      "fontSize": "Recommended size",
      "placement": "Where to place text"
    },
    "visualElements": ["Elements that improve CTR"],
    "colorPsychology": "Color recommendations",
    "competitiveDifferentiation": "How to stand out"
  },
  "competitiveAnalysis": {
    "topCompetitors": [
      {
        "channel": "Competitor name",
        "theirStrategy": "What they're doing",
        "theirWeakness": "Where they're vulnerable",
        "opportunity": "How to outrank them"
      }
    ],
    "contentGaps": ["Topics competitors missed"],
    "keywordGaps": ["Keywords competitors ignored"],
    "formatGaps": ["Formats not being used"]
  },
  "hashtagStrategy": {
    "recommended": ["#hashtag1", "#hashtag2"],
    "trending": ["#trending1", "#trending2"],
    "branded": ["#yourbrand"],
    "avoid": ["#oversaturated"]
  },
  "localSEO": {
    "applicable": true/false,
    "location": "Target location if applicable",
    "localKeywords": ["Location-based keywords"],
    "localTrends": ["Local trending topics"]
  },
  "platformOptimization": {
    "youtubeSearch": {
      "optimization": "YouTube-specific SEO",
      "suggestedSearchTerms": ["Terms YouTube suggests"]
    },
    "googleSearch": {
      "optimization": "Google search optimization",
      "featuredSnippet": "How to target featured snippet"
    },
    "socialMedia": {
      "optimization": "Social sharing optimization",
      "platforms": ["Platform-specific tips"]
    }
  },
  "performanceMetrics": {
    "expectedImprovement": {
      "views": "+X% expected",
      "ctr": "+X% click-through rate",
      "watchTime": "+X% watch time",
      "discovery": "+X% discovery traffic"
    },
    "trackingPlan": {
      "kpis": ["Key metrics to track"],
      "tools": ["Recommended tracking tools"],
      "reviewSchedule": "When to review and adjust"
    }
  },
  "actionPlan": {
    "immediate": ["Do right now"],
    "beforePublish": ["Do before publishing"],
    "afterPublish": ["Do after publishing"],
    "ongoing": ["Continuous optimization tasks"]
  }
}

Provide specific, actionable SEO recommendations based on current YouTube algorithm understanding and competitive landscape.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      temperature: 0.7,
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
      throw new Error('Failed to parse AI response');
    }

    const optimization = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      optimization,
      tokensUsed: response.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('SEO Optimization Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackSEO(videoData)
    };
  }
}

function generateFallbackSEO(videoData) {
  return {
    keywordStrategy: {
      primaryKeywords: [],
      secondaryKeywords: [],
      longTailKeywords: [],
      trendingKeywords: []
    },
    titleOptimization: {
      currentTitle: videoData?.title || '',
      optimizedTitles: [],
      titleFormulas: [],
      abTestingSuggestions: []
    },
    descriptionOptimization: {
      structure: {
        firstLine: "Start with a hook",
        keywordPlacement: ["First 125 characters"],
        sections: [],
        callToAction: "Subscribe and like",
        timestamps: "Add timestamps for better retention"
      },
      optimizedDescription: "",
      linkStrategy: {
        internalLinks: [],
        externalLinks: [],
        affiliateLinks: []
      }
    },
    tagStrategy: {
      recommendedTags: [],
      tagOrder: [],
      avoidTags: [],
      tagLimit: "Use 10-15 relevant tags"
    },
    thumbnailSEO: {
      textOverlay: {
        primaryText: "",
        supportingText: "",
        keywords: [],
        fontSize: "Large and readable",
        placement: "Rule of thirds"
      },
      visualElements: [],
      colorPsychology: "Use contrasting colors",
      competitiveDifferentiation: "Stand out from competitors"
    },
    competitiveAnalysis: {
      topCompetitors: [],
      contentGaps: [],
      keywordGaps: [],
      formatGaps: []
    },
    hashtagStrategy: {
      recommended: [],
      trending: [],
      branded: [],
      avoid: []
    },
    localSEO: {
      applicable: false,
      location: "",
      localKeywords: [],
      localTrends: []
    },
    platformOptimization: {
      youtubeSearch: {
        optimization: "Optimize for YouTube search",
        suggestedSearchTerms: []
      },
      googleSearch: {
        optimization: "Optimize for Google",
        featuredSnippet: "Structure content for snippets"
      },
      socialMedia: {
        optimization: "Optimize for sharing",
        platforms: []
      }
    },
    performanceMetrics: {
      expectedImprovement: {
        views: "+20-30%",
        ctr: "+15%",
        watchTime: "+10%",
        discovery: "+25%"
      },
      trackingPlan: {
        kpis: ["CTR", "Watch time", "Traffic sources"],
        tools: ["YouTube Analytics"],
        reviewSchedule: "Weekly"
      }
    },
    actionPlan: {
      immediate: ["Update title", "Optimize tags"],
      beforePublish: ["Check description", "Review thumbnail"],
      afterPublish: ["Monitor performance", "Engage with comments"],
      ongoing: ["Track metrics", "Iterate based on data"]
    }
  };
}

export default {
  optimizeSEOWithAI
};