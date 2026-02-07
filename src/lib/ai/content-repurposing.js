import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateRepurposingIdeasWithAI(videoData, channelData, platforms) {
  try {
    const prompt = `Generate creative content repurposing strategies for this YouTube video across multiple platforms.

Original Video:
- Title: ${videoData.title}
- Duration: ${videoData.duration}
- Topic: ${videoData.topic}
- Format: ${videoData.format}
- Key Points: ${JSON.stringify(videoData.keyPoints || [], null, 2)}

Channel Context:
- Niche: ${channelData.niche}
- Audience: ${channelData.audience}

Target Platforms: ${JSON.stringify(platforms || ['All platforms'], null, 2)}

Generate comprehensive repurposing strategies in JSON format:
{
  "shortForm": {
    "youtubeShorts": [
      {
        "title": "Short title",
        "concept": "What this short covers",
        "hook": "Opening hook",
        "duration": "15-60 seconds",
        "extractFrom": "Timestamp or section from original",
        "modifications": ["What to change/add"],
        "hashtags": ["#relevant", "#hashtags"],
        "expectedViews": "View potential",
        "productionTime": "Minutes to create"
      }
    ],
    "tiktok": [
      {
        "concept": "TikTok adaptation",
        "trend": "Trend to leverage if any",
        "format": "TikTok format style",
        "audio": "Audio/music choice",
        "duration": "Optimal length",
        "callToAction": "TikTok CTA",
        "crossPromotion": "How to promote YouTube"
      }
    ],
    "instagramReels": [
      {
        "concept": "Reel concept",
        "visualStyle": "Visual approach",
        "caption": "Caption strategy",
        "hashtags": ["#instagram", "#specific"],
        "storyTie": "How to use in Stories too"
      }
    ]
  },
  "socialMedia": {
    "twitter": {
      "threads": [
        {
          "concept": "Thread topic",
          "tweets": ["Tweet 1", "Tweet 2", "..."],
          "visualAssets": ["Images/GIFs to include"],
          "engagement": "Engagement strategy",
          "timing": "When to post"
        }
      ],
      "quotes": ["Quotable moments to tweet"],
      "polls": ["Poll ideas from content"],
      "spaces": "Twitter Spaces topic idea"
    },
    "linkedin": {
      "article": {
        "title": "Article title",
        "angle": "Professional angle",
        "structure": ["Article outline"],
        "cta": "LinkedIn CTA",
        "keywords": ["LinkedIn SEO"]
      },
      "posts": [
        {
          "format": "Text/Image/Video/Document",
          "content": "Post content",
          "professional": "Professional value",
          "engagement": "Question or CTA"
        }
      ]
    },
    "facebook": {
      "post": "Facebook post adaptation",
      "group": "Groups to share in",
      "live": "Facebook Live idea"
    },
    "pinterest": {
      "pins": [
        {
          "title": "Pin title",
          "description": "Pin description",
          "imageIdea": "Visual concept",
          "board": "Board suggestion",
          "keywords": ["Pinterest SEO"]
        }
      ],
      "storyPins": "Story pin adaptation"
    }
  },
  "longForm": {
    "blogPost": {
      "title": "Blog post title",
      "structure": {
        "intro": "Introduction approach",
        "sections": ["Main sections"],
        "conclusion": "Conclusion and CTA"
      },
      "seo": {
        "keywords": ["Target keywords"],
        "metaDescription": "Meta description",
        "internalLinks": ["Link opportunities"]
      },
      "enhancements": ["What to add beyond video"],
      "wordCount": "Target word count"
    },
    "podcast": {
      "episode": {
        "title": "Episode title",
        "format": "Solo/Interview/Discussion",
        "outline": ["Episode structure"],
        "duration": "Target duration",
        "guests": "Potential guests if applicable"
      },
      "clips": ["Clip ideas for promotion"],
      "platforms": ["Where to distribute"]
    },
    "ebook": {
      "concept": "Ebook concept",
      "chapters": ["Chapter ideas"],
      "leadMagnet": "How to use as lead magnet",
      "expansion": "How to expand content"
    },
    "course": {
      "module": "Course module idea",
      "lessons": ["Lesson breakdown"],
      "exercises": ["Practice exercises"],
      "platform": "Suggested platform"
    }
  },
  "email": {
    "newsletter": {
      "subject": "Email subject line",
      "preview": "Preview text",
      "content": "Email content structure",
      "cta": "Email CTA",
      "segmentation": "Audience segments"
    },
    "sequence": [
      {
        "email": "Email 1",
        "purpose": "Purpose",
        "content": "Content focus"
      }
    ]
  },
  "visual": {
    "infographic": {
      "title": "Infographic title",
      "dataPoints": ["Key data to visualize"],
      "structure": "Visual flow",
      "designNotes": "Design suggestions"
    },
    "carousel": {
      "platform": "Instagram/LinkedIn",
      "slides": ["Slide content"],
      "design": "Design approach",
      "engagement": "Engagement elements"
    },
    "memes": [
      {
        "concept": "Meme idea",
        "format": "Meme format",
        "text": "Meme text",
        "relevance": "How it relates"
      }
    ],
    "quotes": [
      {
        "quote": "Quote text",
        "design": "Visual design idea",
        "attribution": "How to attribute"
      }
    ]
  },
  "interactive": {
    "quiz": {
      "title": "Quiz title",
      "questions": ["Quiz questions"],
      "platform": "Where to host",
      "leadGen": "Lead generation potential"
    },
    "calculator": {
      "concept": "Calculator/tool idea",
      "functionality": "What it calculates",
      "value": "Value to user"
    },
    "template": {
      "type": "Template type",
      "content": "What's included",
      "platform": "Where to share"
    }
  },
  "community": {
    "discussion": {
      "topic": "Discussion topic",
      "platform": "Discord/Reddit/etc",
      "prompt": "Discussion prompt",
      "moderation": "Moderation approach"
    },
    "challenge": {
      "name": "Challenge name",
      "duration": "Challenge length",
      "rules": "Challenge rules",
      "prize": "Incentive if any"
    },
    "ama": {
      "topic": "AMA topic",
      "platform": "Where to host",
      "promotion": "How to promote"
    }
  },
  "monetization": {
    "sponsored": [
      {
        "platform": "Platform",
        "format": "Content format",
        "angle": "Sponsored angle",
        "value": "Sponsor value prop"
      }
    ],
    "affiliate": [
      {
        "product": "Affiliate opportunity",
        "integration": "How to integrate",
        "disclosure": "Disclosure approach"
      }
    ],
    "premium": [
      {
        "content": "Premium content idea",
        "platform": "Patreon/Membership/etc",
        "value": "Exclusive value"
      }
    ]
  },
  "automation": {
    "priority": ["Repurpose in this order"],
    "batch": ["What to create together"],
    "tools": ["Recommended tools"],
    "workflow": {
      "step1": "First step",
      "step2": "Second step",
      "timeline": "Full timeline"
    },
    "roi": {
      "timeInvestment": "Total time needed",
      "expectedReach": "Total reach across platforms",
      "valueScore": 0-100
    }
  }
}

Generate creative, platform-specific repurposing ideas that maximize the value of the original content while adapting to each platform's unique requirements and audience expectations.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
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
      throw new Error('Failed to parse AI response');
    }

    const repurposing = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      repurposing,
      tokensUsed: response.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('Content Repurposing Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackRepurposing()
    };
  }
}

function generateFallbackRepurposing() {
  return {
    shortForm: {
      youtubeShorts: [],
      tiktok: [],
      instagramReels: []
    },
    socialMedia: {
      twitter: {
        threads: [],
        quotes: [],
        polls: [],
        spaces: ""
      },
      linkedin: {
        article: {
          title: "",
          angle: "",
          structure: [],
          cta: "",
          keywords: []
        },
        posts: []
      },
      facebook: {
        post: "",
        group: "",
        live: ""
      },
      pinterest: {
        pins: [],
        storyPins: ""
      }
    },
    longForm: {
      blogPost: {
        title: "",
        structure: {
          intro: "",
          sections: [],
          conclusion: ""
        },
        seo: {
          keywords: [],
          metaDescription: "",
          internalLinks: []
        },
        enhancements: [],
        wordCount: "1500-2000"
      },
      podcast: {
        episode: {
          title: "",
          format: "",
          outline: [],
          duration: "",
          guests: ""
        },
        clips: [],
        platforms: []
      },
      ebook: {
        concept: "",
        chapters: [],
        leadMagnet: "",
        expansion: ""
      },
      course: {
        module: "",
        lessons: [],
        exercises: [],
        platform: ""
      }
    },
    email: {
      newsletter: {
        subject: "",
        preview: "",
        content: "",
        cta: "",
        segmentation: ""
      },
      sequence: []
    },
    visual: {
      infographic: {
        title: "",
        dataPoints: [],
        structure: "",
        designNotes: ""
      },
      carousel: {
        platform: "",
        slides: [],
        design: "",
        engagement: ""
      },
      memes: [],
      quotes: []
    },
    interactive: {
      quiz: {
        title: "",
        questions: [],
        platform: "",
        leadGen: ""
      },
      calculator: {
        concept: "",
        functionality: "",
        value: ""
      },
      template: {
        type: "",
        content: "",
        platform: ""
      }
    },
    community: {
      discussion: {
        topic: "",
        platform: "",
        prompt: "",
        moderation: ""
      },
      challenge: {
        name: "",
        duration: "",
        rules: "",
        prize: ""
      },
      ama: {
        topic: "",
        platform: "",
        promotion: ""
      }
    },
    monetization: {
      sponsored: [],
      affiliate: [],
      premium: []
    },
    automation: {
      priority: [],
      batch: [],
      tools: [],
      workflow: {
        step1: "",
        step2: "",
        timeline: ""
      },
      roi: {
        timeInvestment: "",
        expectedReach: "",
        valueScore: 70
      }
    }
  };
}

export default {
  generateRepurposingIdeasWithAI
};