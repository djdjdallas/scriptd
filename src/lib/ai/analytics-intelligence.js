import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeAnalyticsWithAI(analyticsData, historicalData, channelGoals) {
  try {
    const prompt = `Provide intelligent insights and predictions based on YouTube analytics data.

Current Analytics:
${JSON.stringify(analyticsData, null, 2)}

Historical Trends:
${JSON.stringify(historicalData, null, 2)}

Channel Goals:
${JSON.stringify(channelGoals || 'Growth and engagement', null, 2)}

Generate comprehensive analytics intelligence in JSON format:
{
  "performanceAnalysis": {
    "overall": {
      "healthScore": 0-100,
      "trend": "Growing/Stable/Declining",
      "momentum": 0-100,
      "sustainability": 0-100
    },
    "keyMetrics": {
      "views": {
        "current": "Current performance",
        "trend": "Trend direction",
        "projection": "30-day projection",
        "insights": ["Key insights"],
        "actions": ["Recommended actions"]
      },
      "watchTime": {
        "current": "Current watch time",
        "quality": 0-100,
        "retention": "Average retention",
        "dropoffPoints": ["Common drop-off points"],
        "improvements": ["How to improve"]
      },
      "engagement": {
        "rate": "Current rate",
        "quality": 0-100,
        "drivers": ["What drives engagement"],
        "barriers": ["What prevents engagement"]
      },
      "growth": {
        "subscriberRate": "Growth rate",
        "velocity": "Accelerating/Steady/Slowing",
        "projection": "6-month projection",
        "catalysts": ["Growth catalysts needed"]
      }
    }
  },
  "audienceBehavior": {
    "viewingPatterns": {
      "peakTimes": ["Best times to publish"],
      "sessionLength": "Average session",
      "bingeability": 0-100,
      "loyaltyLoop": "How viewers return"
    },
    "discoverySource": {
      "primary": "Main traffic source",
      "emerging": "Growing sources",
      "declining": "Declining sources",
      "untapped": "Opportunities to explore"
    },
    "retention": {
      "patterns": ["Retention patterns identified"],
      "hooks": "What keeps viewers",
      "exits": "Why viewers leave",
      "improvements": ["Specific improvements"]
    }
  },
  "contentPerformance": {
    "topPerformers": [
      {
        "identifier": "Video/format identifier",
        "metrics": "Key metrics",
        "whySuccessful": "Success factors",
        "replicate": "How to replicate success"
      }
    ],
    "underperformers": [
      {
        "identifier": "Video/format identifier",
        "issues": ["What went wrong"],
        "lessons": ["Lessons learned"],
        "avoid": "What to avoid"
      }
    ],
    "patterns": {
      "successful": ["Patterns in successful content"],
      "unsuccessful": ["Patterns to avoid"],
      "optimal": {
        "length": "Optimal video length",
        "frequency": "Optimal upload frequency",
        "format": "Best performing formats"
      }
    }
  },
  "algorithmInsights": {
    "favor": {
      "current": "What algorithm currently favors",
      "signals": ["Positive signals you're sending"],
      "optimization": ["How to optimize further"]
    },
    "penalties": {
      "potential": ["Potential penalty triggers"],
      "avoiding": ["How to avoid penalties"],
      "recovery": ["Recovery strategies if penalized"]
    },
    "opportunities": {
      "features": ["New features to leverage"],
      "formats": ["Formats to try"],
      "timing": ["Timing opportunities"]
    }
  },
  "competitivePosition": {
    "market": {
      "position": "Your position in niche",
      "share": "Estimated market share",
      "trajectory": "Direction you're heading"
    },
    "benchmarks": {
      "vsIndustry": "How you compare to industry",
      "vsCompetitors": "How you compare to competitors",
      "gaps": ["Performance gaps to close"]
    },
    "advantages": {
      "current": ["Your current advantages"],
      "potential": ["Advantages to develop"],
      "threats": ["Threats to advantages"]
    }
  },
  "predictiveAnalytics": {
    "nextMonth": {
      "views": "Predicted views",
      "subscribers": "Predicted subscribers",
      "revenue": "Predicted revenue if monetized",
      "confidence": 0-100
    },
    "nextQuarter": {
      "milestones": ["Likely milestones"],
      "challenges": ["Potential challenges"],
      "opportunities": ["Upcoming opportunities"]
    },
    "scenarios": {
      "best": {
        "conditions": "If everything goes right",
        "outcome": "Best case outcome",
        "requirements": "What's needed"
      },
      "likely": {
        "conditions": "Most likely scenario",
        "outcome": "Expected outcome",
        "requirements": "What's needed"
      },
      "worst": {
        "conditions": "If things go wrong",
        "outcome": "Worst case outcome",
        "prevention": "How to prevent"
      }
    }
  },
  "monetization": {
    "readiness": 0-100,
    "potential": {
      "adsense": "AdSense potential",
      "sponsorships": "Sponsorship value",
      "products": "Product sales potential",
      "memberships": "Membership potential"
    },
    "optimization": {
      "current": "Current monetization rate",
      "improvements": ["How to increase revenue"],
      "timeline": "Revenue growth timeline"
    }
  },
  "riskAnalysis": {
    "immediate": [
      {
        "risk": "Immediate risk",
        "severity": "Low/Medium/High",
        "mitigation": "How to mitigate"
      }
    ],
    "medium": ["Medium-term risks"],
    "long": ["Long-term risks"],
    "earlyWarnings": ["Metrics to watch"]
  },
  "strategicRecommendations": {
    "immediate": [
      {
        "action": "What to do now",
        "impact": "Expected impact",
        "effort": "Low/Medium/High",
        "priority": 1-10
      }
    ],
    "shortTerm": ["1-month strategy"],
    "mediumTerm": ["3-month strategy"],
    "longTerm": ["6-12 month strategy"],
    "experiments": [
      {
        "experiment": "What to test",
        "hypothesis": "Expected outcome",
        "metrics": "How to measure",
        "duration": "Test duration"
      }
    ]
  },
  "customAlerts": {
    "positive": ["Positive trends to amplify"],
    "negative": ["Negative trends to address"],
    "opportunities": ["Time-sensitive opportunities"],
    "maintenance": ["Regular maintenance needed"]
  }
}

Provide data-driven, actionable insights with specific recommendations based on the analytics patterns.`;

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

    const intelligence = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      intelligence,
      tokensUsed: response.usage?.total_tokens || 0,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Analytics Intelligence Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackIntelligence()
    };
  }
}

function generateFallbackIntelligence() {
  return {
    performanceAnalysis: {
      overall: {
        healthScore: 70,
        trend: "Stable",
        momentum: 60,
        sustainability: 75
      },
      keyMetrics: {
        views: {
          current: "Average",
          trend: "Steady",
          projection: "Maintain current",
          insights: [],
          actions: []
        },
        watchTime: {
          current: "Average",
          quality: 70,
          retention: "50%",
          dropoffPoints: [],
          improvements: []
        },
        engagement: {
          rate: "3%",
          quality: 70,
          drivers: [],
          barriers: []
        },
        growth: {
          subscriberRate: "5%",
          velocity: "Steady",
          projection: "Moderate growth",
          catalysts: []
        }
      }
    },
    audienceBehavior: {
      viewingPatterns: {
        peakTimes: [],
        sessionLength: "10 minutes",
        bingeability: 60,
        loyaltyLoop: "Weekly returns"
      },
      discoverySource: {
        primary: "Search",
        emerging: [],
        declining: [],
        untapped: []
      },
      retention: {
        patterns: [],
        hooks: "",
        exits: "",
        improvements: []
      }
    },
    contentPerformance: {
      topPerformers: [],
      underperformers: [],
      patterns: {
        successful: [],
        unsuccessful: [],
        optimal: {
          length: "10-15 minutes",
          frequency: "Weekly",
          format: "Standard"
        }
      }
    },
    algorithmInsights: {
      favor: {
        current: "",
        signals: [],
        optimization: []
      },
      penalties: {
        potential: [],
        avoiding: [],
        recovery: []
      },
      opportunities: {
        features: [],
        formats: [],
        timing: []
      }
    },
    competitivePosition: {
      market: {
        position: "Middle",
        share: "Small",
        trajectory: "Stable"
      },
      benchmarks: {
        vsIndustry: "Average",
        vsCompetitors: "Competitive",
        gaps: []
      },
      advantages: {
        current: [],
        potential: [],
        threats: []
      }
    },
    predictiveAnalytics: {
      nextMonth: {
        views: "Similar to current",
        subscribers: "+5%",
        revenue: "N/A",
        confidence: 60
      },
      nextQuarter: {
        milestones: [],
        challenges: [],
        opportunities: []
      },
      scenarios: {
        best: {
          conditions: "",
          outcome: "",
          requirements: ""
        },
        likely: {
          conditions: "",
          outcome: "",
          requirements: ""
        },
        worst: {
          conditions: "",
          outcome: "",
          prevention: ""
        }
      }
    },
    monetization: {
      readiness: 50,
      potential: {
        adsense: "Low",
        sponsorships: "Medium",
        products: "Low",
        memberships: "Low"
      },
      optimization: {
        current: "Not monetized",
        improvements: [],
        timeline: "6-12 months"
      }
    },
    riskAnalysis: {
      immediate: [],
      medium: [],
      long: [],
      earlyWarnings: []
    },
    strategicRecommendations: {
      immediate: [],
      shortTerm: [],
      mediumTerm: [],
      longTerm: [],
      experiments: []
    },
    customAlerts: {
      positive: [],
      negative: [],
      opportunities: [],
      maintenance: []
    }
  };
}

export default {
  analyzeAnalyticsWithAI
};