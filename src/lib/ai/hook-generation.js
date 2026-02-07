import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateHooksWithAI(videoData, channelData, audienceData) {
  try {
    const prompt = `Generate emotionally intelligent, high-converting hooks for this YouTube video using psychological triggers and A/B testing variations.

Video Context:
- Title: ${videoData.title}
- Topic: ${videoData.topic}
- Target Length: ${videoData.length || '10-15 minutes'}
- Content Type: ${videoData.type || 'Educational'}

Channel Context:
- Niche: ${channelData.niche}
- Audience: ${audienceData?.description || 'General audience'}
- Average Retention: ${channelData.averageRetention || '50%'}

Generate comprehensive hook strategies in JSON format:
{
  "primaryHooks": [
    {
      "hook": "The exact hook text/script",
      "duration": "0-5 seconds",
      "emotionalTrigger": "Primary emotion targeted",
      "psychologicalPrinciple": "Principle used (curiosity gap, loss aversion, etc)",
      "visualDescription": "What should be on screen",
      "deliveryNotes": "How to deliver this hook",
      "expectedRetention": "% expected to continue watching",
      "strengthScore": 0-100,
      "targetAudience": "Who this resonates with most"
    }
  ],
  "abTestVariations": [
    {
      "versionA": {
        "hook": "Version A text",
        "approach": "Strategy for A",
        "emotionalAngle": "Emotion targeted",
        "expectedCTR": "Click-through prediction",
        "bestFor": "When to use this"
      },
      "versionB": {
        "hook": "Version B text",
        "approach": "Strategy for B",
        "emotionalAngle": "Different emotion",
        "expectedCTR": "Click-through prediction",
        "bestFor": "When to use this"
      },
      "testingStrategy": "How to test these",
      "successMetrics": ["What to measure"],
      "decisionCriteria": "How to pick winner"
    }
  ],
  "emotionalSequence": {
    "opening": {
      "emotion": "Initial emotion",
      "intensity": 0-100,
      "technique": "How to create it"
    },
    "buildup": {
      "emotion": "Building emotion",
      "intensity": 0-100,
      "transition": "How to transition"
    },
    "peak": {
      "emotion": "Peak emotion",
      "intensity": 0-100,
      "timing": "When to hit peak"
    },
    "resolution": {
      "emotion": "Resolution emotion",
      "intensity": 0-100,
      "satisfaction": "How to satisfy viewer"
    }
  },
  "patternInterrupts": [
    {
      "timing": "When to use (seconds)",
      "technique": "Interruption technique",
      "purpose": "Why interrupt here",
      "execution": "How to execute",
      "riskLevel": "Low/Medium/High"
    }
  ],
  "curiosityLoops": [
    {
      "setup": "Initial curiosity seed",
      "timing": "When to plant (seconds)",
      "payoff": "When/how to pay off",
      "tension": "How to maintain tension",
      "examples": ["Specific examples"]
    }
  ],
  "socialProof": [
    {
      "type": "Type of social proof",
      "placement": "Where in hook",
      "presentation": "How to present",
      "credibility": "Why it works"
    }
  ],
  "urgencyTriggers": [
    {
      "trigger": "Urgency element",
      "placement": "When to introduce",
      "intensity": "Subtle/Moderate/Strong",
      "justification": "Why urgent"
    }
  ],
  "personalization": {
    "directAddress": ["Ways to address viewer directly"],
    "relatability": ["Relatable elements to include"],
    "identification": ["How viewer identifies with content"],
    "inclusivity": ["Inclusive language choices"]
  },
  "multiSensory": {
    "visual": {
      "elements": ["Visual hook elements"],
      "timing": "Visual rhythm",
      "emphasis": "What to emphasize visually"
    },
    "auditory": {
      "music": "Music/sound strategy",
      "pacing": "Speech pacing",
      "emphasis": "Vocal emphasis points"
    },
    "kinesthetic": {
      "action": "Action words to use",
      "movement": "Suggested movements/gestures"
    }
  },
  "hookFormulas": [
    {
      "formula": "Hook formula structure",
      "example": "Applied to this video",
      "strength": "Why it works",
      "when": "Best use cases"
    }
  ],
  "antiHooks": {
    "avoid": ["Hook types to avoid"],
    "commonMistakes": ["Mistakes for this content"],
    "turnoffs": ["What would turn audience off"],
    "recovery": ["How to recover from bad start"]
  },
  "culturalAdaptation": {
    "universal": ["Universal hook elements"],
    "specific": ["Culture-specific considerations"],
    "sensitivity": ["Areas to be sensitive about"],
    "localization": ["How to localize if needed"]
  },
  "performancePredictor": {
    "estimatedRetention": {
      "5seconds": "% watching at 5s",
      "15seconds": "% watching at 15s",
      "30seconds": "% watching at 30s"
    },
    "clickProbability": 0-100,
    "shareability": 0-100,
    "memorability": 0-100,
    "benchmarks": ["Industry benchmarks to beat"]
  },
  "iterationStrategy": {
    "testing": ["What to test first"],
    "metrics": ["Key metrics to track"],
    "timeline": "Testing timeline",
    "optimization": ["How to optimize based on data"],
    "scaling": ["How to scale successful hooks"]
  }
}

Generate creative, psychologically sophisticated hooks that leverage emotional intelligence and human psychology for maximum engagement.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
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

    const hooks = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      hooks,
      tokensUsed: response.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('Hook Generation Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackHooks(videoData)
    };
  }
}

function generateFallbackHooks(videoData) {
  return {
    primaryHooks: [
      {
        hook: `You won't believe what happens when...`,
        duration: "0-5 seconds",
        emotionalTrigger: "Curiosity",
        psychologicalPrinciple: "Curiosity gap",
        visualDescription: "Compelling visual",
        deliveryNotes: "Energetic delivery",
        expectedRetention: "70%",
        strengthScore: 75,
        targetAudience: "General"
      }
    ],
    abTestVariations: [],
    emotionalSequence: {
      opening: {
        emotion: "Curiosity",
        intensity: 80,
        technique: "Question or statement"
      },
      buildup: {
        emotion: "Anticipation",
        intensity: 85,
        transition: "Gradual reveal"
      },
      peak: {
        emotion: "Surprise",
        intensity: 90,
        timing: "10-15 seconds"
      },
      resolution: {
        emotion: "Satisfaction",
        intensity: 70,
        satisfaction: "Answer the question"
      }
    },
    patternInterrupts: [],
    curiosityLoops: [],
    socialProof: [],
    urgencyTriggers: [],
    personalization: {
      directAddress: ["You", "Your"],
      relatability: [],
      identification: [],
      inclusivity: []
    },
    multiSensory: {
      visual: {
        elements: [],
        timing: "",
        emphasis: ""
      },
      auditory: {
        music: "",
        pacing: "",
        emphasis: ""
      },
      kinesthetic: {
        action: [],
        movement: []
      }
    },
    hookFormulas: [],
    antiHooks: {
      avoid: [],
      commonMistakes: [],
      turnoffs: [],
      recovery: []
    },
    culturalAdaptation: {
      universal: [],
      specific: [],
      sensitivity: [],
      localization: []
    },
    performancePredictor: {
      estimatedRetention: {
        "5seconds": "80%",
        "15seconds": "65%",
        "30seconds": "50%"
      },
      clickProbability: 70,
      shareability: 60,
      memorability: 65,
      benchmarks: []
    },
    iterationStrategy: {
      testing: [],
      metrics: [],
      timeline: "",
      optimization: [],
      scaling: []
    }
  };
}

export default {
  generateHooksWithAI
};