import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeTrendsWithAI(channelData, currentTrends, niche) {
  try {
    const prompt = `Analyze current YouTube trends and provide intelligent predictions and impact analysis for this channel.

Channel Context:
- Niche: ${niche || 'General'}
- Subscribers: ${channelData.subscriberCount}
- Average Views: ${channelData.averageViews}
- Content Type: ${channelData.contentType}

Current Trending Topics:
${JSON.stringify(currentTrends, null, 2)}

Provide comprehensive trend analysis in JSON format:
{
  "trendPredictions": {
    "emergingTrends": [
      {
        "topic": "Trend name",
        "confidenceScore": 0-100,
        "timeToMainstream": "Days/Weeks/Months",
        "relevanceToChannel": 0-100,
        "potentialViews": "Estimated view range",
        "competitionLevel": "Low/Medium/High",
        "firstMoverAdvantage": true/false,
        "suggestedAngle": "How to approach this trend"
      }
    ],
    "peakingTrends": [
      {
        "topic": "Trend name",
        "daysUntilPeak": 0-30,
        "currentSaturation": 0-100,
        "worthPursuing": true/false,
        "bestFormat": "Video format recommendation",
        "expectedLifespan": "Days remaining"
      }
    ],
    "decliningTrends": [
      {
        "topic": "Trend name",
        "declineRate": "Slow/Medium/Rapid",
        "avoidAfter": "Date or timeframe",
        "alternativeSuggestion": "What to do instead"
      }
    ]
  },
  "impactAnalysis": {
    "highImpactOpportunities": [
      {
        "trend": "Trend name",
        "potentialGrowth": "Subscriber/view increase %",
        "effortRequired": "Low/Medium/High",
        "roi": "Expected return on investment",
        "risks": ["Potential risks"],
        "implementation": "How to capitalize"
      }
    ],
    "nicheTrends": [
      {
        "trend": "Niche-specific trend",
        "audienceInterest": 0-100,
        "competitorAdoption": "% of competitors using",
        "differentiationOpportunity": "How to stand out",
        "estimatedDuration": "Trend lifespan"
      }
    ]
  },
  "seasonalOpportunities": {
    "upcoming": [
      {
        "event": "Holiday/Season/Event",
        "daysUntil": 0-365,
        "preparationTime": "When to start creating",
        "contentIdeas": ["Specific video ideas"],
        "expectedPerformance": "View multiplier"
      }
    ],
    "yearRoundTrends": [
      {
        "topic": "Evergreen trend",
        "monthlySearchVolume": "Search volume",
        "competition": "Low/Medium/High",
        "contentStrategy": "How to leverage"
      }
    ]
  },
  "competitiveTrendAnalysis": {
    "competitorTrends": [
      {
        "trend": "What competitors are doing",
        "adoptionRate": "% using this",
        "averagePerformance": "View/engagement metrics",
        "shouldFollow": true/false,
        "betterApproach": "How to do it better"
      }
    ],
    "marketGaps": [
      {
        "opportunity": "Unfilled niche",
        "demandLevel": 0-100,
        "difficulty": "Easy/Medium/Hard",
        "potentialAudience": "Audience size",
        "strategy": "How to fill this gap"
      }
    ]
  },
  "algorithmInsights": {
    "currentFavoredContent": ["Content types YouTube is promoting"],
    "formatPreferences": ["Shorts/Long-form/Live preferences"],
    "engagementTriggers": ["What drives algorithm promotion"],
    "avoidanceFactors": ["What the algorithm penalizes"],
    "optimizationTips": ["Specific algorithm optimization tips"]
  },
  "actionablePlan": {
    "immediate": [
      {
        "action": "What to do today",
        "trend": "Related trend",
        "expectedResult": "What to expect",
        "effort": "Time/resource needed"
      }
    ],
    "thisWeek": ["Actions for this week"],
    "thisMonth": ["Monthly trend strategy"],
    "quarterly": ["3-month trend roadmap"]
  },
  "riskAssessment": {
    "trendRisks": [
      {
        "risk": "Potential trend-related risk",
        "probability": "Low/Medium/High",
        "impact": "Low/Medium/High",
        "mitigation": "How to avoid/minimize"
      }
    ],
    "oversaturationRisk": 0-100,
    "audienceFatigueRisk": 0-100,
    "brandAlignmentScore": 0-100
  }
}

Provide data-driven, specific insights based on current YouTube trends and the channel's position.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      temperature: 0.8,
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

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      analysis,
      tokensUsed: response.usage?.total_tokens || 0,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Trend Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackTrendAnalysis()
    };
  }
}

function generateFallbackTrendAnalysis() {
  return {
    trendPredictions: {
      emergingTrends: [
        {
          topic: "AI-generated content",
          confidenceScore: 75,
          timeToMainstream: "Weeks",
          relevanceToChannel: 80,
          potentialViews: "10K-50K",
          competitionLevel: "Medium",
          firstMoverAdvantage: true,
          suggestedAngle: "Educational approach to AI tools"
        }
      ],
      peakingTrends: [],
      decliningTrends: []
    },
    impactAnalysis: {
      highImpactOpportunities: [],
      nicheTrends: []
    },
    seasonalOpportunities: {
      upcoming: [],
      yearRoundTrends: []
    },
    competitiveTrendAnalysis: {
      competitorTrends: [],
      marketGaps: []
    },
    algorithmInsights: {
      currentFavoredContent: ["Shorts", "Educational content"],
      formatPreferences: ["8-12 minute videos"],
      engagementTriggers: ["High watch time", "Comments"],
      avoidanceFactors: ["Clickbait", "Low retention"],
      optimizationTips: ["Post consistently", "Engage with comments"]
    },
    actionablePlan: {
      immediate: [],
      thisWeek: ["Research trending topics"],
      thisMonth: ["Create trend-based content"],
      quarterly: ["Develop content strategy"]
    },
    riskAssessment: {
      trendRisks: [],
      oversaturationRisk: 50,
      audienceFatigueRisk: 30,
      brandAlignmentScore: 80
    }
  };
}

export default {
  analyzeTrendsWithAI
};