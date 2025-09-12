import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeVoiceWithAI(transcripts, channelData) {
  try {
    // Prepare transcript samples for analysis
    const samples = transcripts.slice(0, 10).map(t => ({
      text: t.text?.slice(0, 2000),
      videoTitle: t.videoTitle,
      duration: t.duration
    }));

    const prompt = `Analyze this YouTube creator's voice, personality, and communication style to create a comprehensive voice profile.

Channel: ${channelData.name}
Transcript Samples:
${JSON.stringify(samples, null, 2)}

Provide an advanced voice and personality profile in JSON format:
{
  "personalityProfile": {
    "primaryPersonality": "Main personality type",
    "personalityTraits": [
      {
        "trait": "Trait name",
        "strength": 0-100,
        "examples": ["Specific examples from transcripts"],
        "impact": "How this affects content"
      }
    ],
    "communicationStyle": {
      "formality": "Casual/Semi-formal/Formal",
      "energy": "Low/Medium/High/Variable",
      "humor": {
        "usage": 0-100,
        "style": "Type of humor used",
        "examples": ["Humor examples"]
      },
      "empathy": 0-100,
      "authority": 0-100,
      "authenticity": 0-100
    },
    "emotionalRange": {
      "dominant": "Primary emotion",
      "spectrum": ["Range of emotions expressed"],
      "triggers": ["What triggers emotion changes"]
    },
    "uniqueQuirks": ["Distinctive personality features"]
  },
  "linguisticPatterns": {
    "vocabulary": {
      "complexity": "Simple/Moderate/Complex",
      "specializedTerms": ["Industry-specific terms used"],
      "catchphrases": ["Repeated phrases/signatures"],
      "fillerWords": ["Common filler words"],
      "powerWords": ["Impactful words frequently used"]
    },
    "sentenceStructure": {
      "averageLength": "Short/Medium/Long",
      "complexity": "Simple/Compound/Complex",
      "rhythm": "Choppy/Flowing/Variable",
      "patterns": ["Common sentence patterns"]
    },
    "speechPatterns": {
      "pace": "Slow/Moderate/Fast/Variable",
      "pauses": "Frequency and purpose of pauses",
      "emphasis": "How emphasis is created",
      "transitions": ["Common transition phrases"]
    },
    "storytelling": {
      "structure": "How stories are structured",
      "techniques": ["Storytelling techniques used"],
      "effectiveness": 0-100
    }
  },
  "contentDelivery": {
    "openingStyle": {
      "approach": "How videos typically open",
      "hookTechniques": ["Hook methods used"],
      "consistency": 0-100,
      "examples": ["Opening examples"]
    },
    "bodyStructure": {
      "organization": "How content is organized",
      "pacing": "Content pacing strategy",
      "informationDensity": "Low/Medium/High",
      "explanationStyle": "How concepts are explained"
    },
    "closingStyle": {
      "approach": "How videos typically end",
      "callToAction": ["CTA styles used"],
      "consistency": 0-100,
      "examples": ["Closing examples"]
    },
    "engagementTechniques": [
      {
        "technique": "Engagement method",
        "frequency": "How often used",
        "effectiveness": 0-100,
        "example": "Specific example"
      }
    ]
  },
  "audienceRelationship": {
    "tone": "How they address audience",
    "relationship": "Teacher/Friend/Entertainer/Expert/etc",
    "inclusivity": 0-100,
    "communityBuilding": ["Community building techniques"],
    "parasocialStrength": 0-100,
    "trustIndicators": ["What builds trust"]
  },
  "brandVoice": {
    "coreValues": ["Values communicated through voice"],
    "brandPersonality": "Overall brand personality",
    "consistency": 0-100,
    "differentiation": "What makes this voice unique",
    "memorability": 0-100,
    "evolutionPotential": "How voice could evolve"
  },
  "strengthsAndWeaknesses": {
    "strengths": [
      {
        "strength": "Voice strength",
        "impact": "How it helps",
        "examples": ["Examples"],
        "leverage": "How to maximize this"
      }
    ],
    "weaknesses": [
      {
        "weakness": "Voice weakness",
        "impact": "How it hurts",
        "examples": ["Examples"],
        "improvement": "How to improve"
      }
    ],
    "opportunities": ["Voice development opportunities"],
    "threats": ["Potential voice-related risks"]
  },
  "aiWritingGuidelines": {
    "dos": [
      {
        "guideline": "What to do",
        "reason": "Why this matters",
        "example": "How to implement"
      }
    ],
    "donts": [
      {
        "guideline": "What to avoid",
        "reason": "Why avoid this",
        "alternative": "What to do instead"
      }
    ],
    "templates": {
      "opening": "Template for openings",
      "transition": "Template for transitions",
      "explanation": "Template for explanations",
      "closing": "Template for closings"
    },
    "voiceSettings": {
      "temperature": 0.0-1.0,
      "formalityLevel": 0-100,
      "creativityLevel": 0-100,
      "emotionalLevel": 0-100
    }
  },
  "contentAdaptation": {
    "byFormat": {
      "tutorial": "Voice adaptation for tutorials",
      "entertainment": "Voice adaptation for entertainment",
      "review": "Voice adaptation for reviews",
      "vlog": "Voice adaptation for vlogs"
    },
    "byAudience": {
      "beginners": "How to address beginners",
      "advanced": "How to address experts",
      "general": "How to address general audience"
    },
    "byPlatform": {
      "youtube": "YouTube-specific voice",
      "shorts": "Shorts adaptation",
      "community": "Community post voice",
      "social": "Social media voice"
    }
  },
  "voiceEvolution": {
    "currentStage": "Current voice maturity",
    "growthTrajectory": "How voice is evolving",
    "recommendations": ["Evolution recommendations"],
    "experimentationAreas": ["Areas to experiment with"],
    "consistencyBalance": "How to evolve while staying consistent"
  }
}

Provide detailed, specific analysis based on actual transcript patterns and examples.`;

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

    const voiceProfile = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      voiceProfile,
      tokensUsed: response.usage?.total_tokens || 0,
      samplesAnalyzed: samples.length
    };

  } catch (error) {
    console.error('Voice Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackVoiceProfile()
    };
  }
}

function generateFallbackVoiceProfile() {
  return {
    personalityProfile: {
      primaryPersonality: "Engaging content creator",
      personalityTraits: [],
      communicationStyle: {
        formality: "Semi-formal",
        energy: "Medium",
        humor: {
          usage: 50,
          style: "Casual",
          examples: []
        },
        empathy: 70,
        authority: 60,
        authenticity: 80
      },
      emotionalRange: {
        dominant: "Positive",
        spectrum: ["Enthusiastic", "Informative"],
        triggers: []
      },
      uniqueQuirks: []
    },
    linguisticPatterns: {
      vocabulary: {
        complexity: "Moderate",
        specializedTerms: [],
        catchphrases: [],
        fillerWords: [],
        powerWords: []
      },
      sentenceStructure: {
        averageLength: "Medium",
        complexity: "Compound",
        rhythm: "Flowing",
        patterns: []
      },
      speechPatterns: {
        pace: "Moderate",
        pauses: "Natural pauses",
        emphasis: "Key points emphasized",
        transitions: []
      },
      storytelling: {
        structure: "Linear",
        techniques: [],
        effectiveness: 70
      }
    },
    contentDelivery: {
      openingStyle: {
        approach: "Direct",
        hookTechniques: [],
        consistency: 75,
        examples: []
      },
      bodyStructure: {
        organization: "Logical flow",
        pacing: "Steady",
        informationDensity: "Medium",
        explanationStyle: "Clear and concise"
      },
      closingStyle: {
        approach: "Summary and CTA",
        callToAction: [],
        consistency: 75,
        examples: []
      },
      engagementTechniques: []
    },
    audienceRelationship: {
      tone: "Friendly",
      relationship: "Teacher",
      inclusivity: 80,
      communityBuilding: [],
      parasocialStrength: 60,
      trustIndicators: []
    },
    brandVoice: {
      coreValues: [],
      brandPersonality: "Professional yet approachable",
      consistency: 75,
      differentiation: "Unique perspective",
      memorability: 70,
      evolutionPotential: "Room for growth"
    },
    strengthsAndWeaknesses: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    },
    aiWritingGuidelines: {
      dos: [],
      donts: [],
      templates: {
        opening: "",
        transition: "",
        explanation: "",
        closing: ""
      },
      voiceSettings: {
        temperature: 0.7,
        formalityLevel: 60,
        creativityLevel: 70,
        emotionalLevel: 50
      }
    },
    contentAdaptation: {
      byFormat: {
        tutorial: "",
        entertainment: "",
        review: "",
        vlog: ""
      },
      byAudience: {
        beginners: "",
        advanced: "",
        general: ""
      },
      byPlatform: {
        youtube: "",
        shorts: "",
        community: "",
        social: ""
      }
    },
    voiceEvolution: {
      currentStage: "Developing",
      growthTrajectory: "Positive",
      recommendations: [],
      experimentationAreas: [],
      consistencyBalance: "Maintain core voice"
    }
  };
}

export default {
  analyzeVoiceWithAI
};