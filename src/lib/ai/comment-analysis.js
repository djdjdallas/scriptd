import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeCommentsWithAI(comments, videoData, channelData) {
  try {
    // Prepare comment data
    const commentSample = comments.slice(0, 100).map(c => ({
      text: c.text,
      likes: c.likes,
      replies: c.replyCount,
      timestamp: c.publishedAt
    }));

    const prompt = `Analyze these YouTube video comments for sentiment, engagement patterns, and actionable insights.

Video: ${videoData.title}
Channel: ${channelData.name}
Total Comments: ${comments.length}

Comment Sample (${commentSample.length} comments):
${JSON.stringify(commentSample, null, 2)}

Provide comprehensive comment analysis in JSON format:
{
  "sentimentAnalysis": {
    "overall": {
      "sentiment": "Positive/Neutral/Negative/Mixed",
      "score": -100 to 100,
      "confidence": 0-100,
      "distribution": {
        "positive": 0-100,
        "neutral": 0-100,
        "negative": 0-100
      }
    },
    "emotional": {
      "primaryEmotions": ["Top 3 emotions expressed"],
      "emotionalIntensity": 0-100,
      "emotionalRange": "Narrow/Moderate/Wide",
      "triggers": ["What triggered strong emotions"]
    },
    "temporal": {
      "sentimentTrend": "Improving/Stable/Declining",
      "peakPositive": "When most positive",
      "peakNegative": "When most negative",
      "volatility": 0-100
    }
  },
  "engagementPatterns": {
    "responseRate": "% of comments that got responses",
    "conversationDepth": "Average conversation length",
    "engagementQuality": {
      "score": 0-100,
      "substantive": "% substantive comments",
      "superficial": "% surface-level comments",
      "spam": "% spam/bot comments"
    },
    "communityHealth": {
      "score": 0-100,
      "toxicity": 0-100,
      "supportiveness": 0-100,
      "constructiveness": 0-100
    },
    "influencers": [
      {
        "type": "Super fan/Critic/Expert",
        "influence": 0-100,
        "sentiment": "Their sentiment",
        "engagement": "How to engage them"
      }
    ]
  },
  "contentFeedback": {
    "strengths": [
      {
        "aspect": "What viewers loved",
        "mentions": "Number of mentions",
        "sentiment": 0-100,
        "quotes": ["Example comments"]
      }
    ],
    "weaknesses": [
      {
        "aspect": "What viewers disliked",
        "mentions": "Number of mentions",
        "severity": 0-100,
        "quotes": ["Example comments"],
        "suggestions": ["How to improve"]
      }
    ],
    "questions": [
      {
        "question": "Common question",
        "frequency": "How often asked",
        "answered": true/false,
        "suggestedResponse": "How to answer"
      }
    ],
    "requests": [
      {
        "request": "What viewers want",
        "frequency": "How often requested",
        "feasibility": "Easy/Medium/Hard",
        "priority": "High/Medium/Low"
      }
    ]
  },
  "audienceInsights": {
    "demographics": {
      "ageIndicators": ["Age-related clues"],
      "interests": ["Mentioned interests"],
      "expertise": "Novice/Intermediate/Expert",
      "language": ["Language patterns"]
    },
    "behavior": {
      "viewingContext": ["When/how they watched"],
      "sharingIntent": "Likelihood to share",
      "returnViewers": "% likely to return",
      "subscriberConversion": "% likely to subscribe"
    },
    "needs": [
      {
        "need": "Identified audience need",
        "urgency": "Low/Medium/High",
        "opportunity": "How to address",
        "contentIdea": "Video idea to meet need"
      }
    ]
  },
  "controversyDetection": {
    "hasControversy": true/false,
    "topics": [
      {
        "topic": "Controversial topic",
        "heat": 0-100,
        "sides": ["Different viewpoints"],
        "resolution": "How to address",
        "risk": "Potential risks"
      }
    ],
    "moderation": {
      "urgentFlags": ["Comments needing immediate attention"],
      "toxicThreads": ["Toxic conversation threads"],
      "interventionNeeded": true/false
    }
  },
  "responseStrategy": {
    "priority": [
      {
        "comment": "Comment to respond to",
        "why": "Why respond to this",
        "suggestedResponse": "Recommended response",
        "timing": "When to respond"
      }
    ],
    "templates": {
      "appreciation": "Thank you response template",
      "clarification": "Clarification template",
      "criticism": "Handling criticism template",
      "question": "Question response template"
    },
    "timing": {
      "optimalResponseTime": "Best time to respond",
      "batchStrategy": "How to batch responses",
      "frequency": "Response frequency"
    }
  },
  "competitiveIntel": {
    "mentions": [
      {
        "competitor": "Competitor mentioned",
        "context": "How mentioned",
        "sentiment": "Positive/Negative",
        "comparison": "How you compare"
      }
    ],
    "switching": {
      "from": ["Creators viewers came from"],
      "to": ["Creators viewers might go to"],
      "retention": "How to retain them"
    }
  },
  "viralIndicators": {
    "virality": 0-100,
    "shareability": 0-100,
    "memeability": 0-100,
    "quotability": ["Quotable moments"],
    "clipability": ["Clippable segments mentioned"]
  },
  "actionableInsights": {
    "immediate": [
      {
        "action": "What to do now",
        "reason": "Why do this",
        "impact": "Expected impact"
      }
    ],
    "contentIdeas": [
      {
        "idea": "Video idea from comments",
        "demand": 0-100,
        "complexity": "Easy/Medium/Hard"
      }
    ],
    "improvements": [
      {
        "area": "What to improve",
        "priority": "High/Medium/Low",
        "method": "How to improve"
      }
    ],
    "warnings": [
      {
        "issue": "Potential issue",
        "severity": "Low/Medium/High",
        "prevention": "How to prevent"
      }
    ]
  },
  "metrics": {
    "engagementRate": "Comment rate vs views",
    "sentimentScore": -100 to 100,
    "communityScore": 0-100,
    "responseRate": "Creator response rate",
    "conversationRate": "% generating conversation",
    "loyaltyIndicator": 0-100
  }
}

Provide detailed, actionable analysis based on actual comment patterns and sentiment.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
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

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      analysis,
      tokensUsed: response.usage?.total_tokens || 0,
      commentsAnalyzed: commentSample.length
    };

  } catch (error) {
    console.error('Comment Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackCommentAnalysis(comments)
    };
  }
}

function generateFallbackCommentAnalysis(comments) {
  return {
    sentimentAnalysis: {
      overall: {
        sentiment: "Positive",
        score: 65,
        confidence: 70,
        distribution: {
          positive: 65,
          neutral: 25,
          negative: 10
        }
      },
      emotional: {
        primaryEmotions: ["Happy", "Interested", "Grateful"],
        emotionalIntensity: 60,
        emotionalRange: "Moderate",
        triggers: []
      },
      temporal: {
        sentimentTrend: "Stable",
        peakPositive: "First 24 hours",
        peakNegative: "None significant",
        volatility: 20
      }
    },
    engagementPatterns: {
      responseRate: "15%",
      conversationDepth: "2-3 messages",
      engagementQuality: {
        score: 70,
        substantive: "40%",
        superficial: "50%",
        spam: "10%"
      },
      communityHealth: {
        score: 75,
        toxicity: 10,
        supportiveness: 70,
        constructiveness: 65
      },
      influencers: []
    },
    contentFeedback: {
      strengths: [],
      weaknesses: [],
      questions: [],
      requests: []
    },
    audienceInsights: {
      demographics: {
        ageIndicators: [],
        interests: [],
        expertise: "Mixed",
        language: []
      },
      behavior: {
        viewingContext: [],
        sharingIntent: "Moderate",
        returnViewers: "60%",
        subscriberConversion: "15%"
      },
      needs: []
    },
    controversyDetection: {
      hasControversy: false,
      topics: [],
      moderation: {
        urgentFlags: [],
        toxicThreads: [],
        interventionNeeded: false
      }
    },
    responseStrategy: {
      priority: [],
      templates: {
        appreciation: "Thanks for watching and commenting!",
        clarification: "Great question! Let me clarify...",
        criticism: "I appreciate your feedback...",
        question: "That's a great question..."
      },
      timing: {
        optimalResponseTime: "Within 24 hours",
        batchStrategy: "Respond in batches",
        frequency: "Daily"
      }
    },
    competitiveIntel: {
      mentions: [],
      switching: {
        from: [],
        to: [],
        retention: "Maintain quality and consistency"
      }
    },
    viralIndicators: {
      virality: 50,
      shareability: 60,
      memeability: 30,
      quotability: [],
      clipability: []
    },
    actionableInsights: {
      immediate: [],
      contentIdeas: [],
      improvements: [],
      warnings: []
    },
    metrics: {
      engagementRate: "2%",
      sentimentScore: 65,
      communityScore: 75,
      responseRate: "10%",
      conversationRate: "15%",
      loyaltyIndicator: 70
    }
  };
}

export default {
  analyzeCommentsWithAI
};