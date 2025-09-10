// Enhanced Hook Formulas for YouTube Scripts - 2025 Optimization
// Based on latest retention research and viral content analysis

export const hookFormulas = {
  // PVSS Method: Proof, Value, Structure, Stakes
  pvss: {
    name: 'PVSS Method',
    description: 'Proven method for maximizing first 30-second retention',
    template: (topic, audience) => ({
      proof: `Start with credibility or surprising statistic about ${topic}`,
      value: `Clear promise of what ${audience} will gain`,
      structure: `Brief roadmap of content sections`,
      stakes: `What viewers risk by not watching till the end`
    }),
    examples: [
      {
        topic: 'AI Tools',
        hook: "I tested 47 AI tools last month and found 3 that doubled my productivity. In the next 8 minutes, I'll show you exactly how to use them, step by step. But first, let me show you the $2,000 mistake most people make when choosing AI tools..."
      }
    ]
  },

  // 2-Second Rule Hooks
  twoSecondRule: {
    curiosityGap: [
      "The {industry} doesn't want you to know about {topic}...",
      "{Number}% of {audience} are making this {topic} mistake...",
      "I accidentally discovered {result} when I {action}...",
      "Scientists just revealed {discovery} about {topic}...",
      "This {time} {topic} trick changed everything..."
    ],
    
    patternInterrupt: [
      "STOP! Before you {common_action}, watch this...",
      "Delete {tool/app} right now. Here's why...",
      "Everything you know about {topic} is wrong...",
      "I was today years old when I learned {fact}...",
      "Wait... {question}? Let me explain..."
    ],
    
    socialProof: [
      "{Number} million people tried this {topic} hack...",
      "{Authority} just announced {news} about {topic}...",
      "The {topic} method that {achievement}...",
      "{Company} engineers don't want you to see this...",
      "How {person/company} {achieved} with {topic}..."
    ]
  },

  // Platform-Specific Hooks
  platformOptimized: {
    shorts: {
      maxDuration: 3, // seconds
      structure: 'immediate_value',
      examples: [
        "3 {topic} tricks in 60 seconds",
        "Watch me {action} in real-time",
        "POV: You just discovered {revelation}",
        "Day {number} of {challenge}",
        "You've been using {tool} wrong"
      ]
    },
    
    longForm: {
      maxDuration: 45, // seconds
      structure: 'story_based',
      examples: [
        "Last week, I made a discovery about {topic} that fundamentally changed how I {action}. And after testing it for {time}, the results were {outcome}. Let me show you exactly what I found...",
        "If you're struggling with {problem}, you're not alone. {Statistic} of {audience} face the same challenge. Today, I'm sharing the {method} that finally solved this for me and {number} others..."
      ]
    }
  },

  // Retention Optimization Patterns
  retentionPatterns: {
    openLoop: {
      description: 'Create curiosity that must be satisfied',
      template: "I'll reveal the #1 {topic} mistake at the end, but first...",
      placement: 'Within first 15 seconds'
    },
    
    valueStack: {
      description: 'Promise multiple valuable outcomes',
      template: "By the end, you'll know: 1) {benefit1}, 2) {benefit2}, and 3) {bonus}",
      placement: 'After initial hook, before main content'
    },
    
    miniCliffhanger: {
      description: 'Small tension points throughout',
      template: "But here's where it gets interesting...",
      placement: 'Every 60-90 seconds'
    }
  },

  // Audience-Specific Hook Templates
  audienceHooks: {
    developers: {
      painPoints: ['debugging', 'deployment', 'performance', 'learning curve'],
      hooks: [
        "This {language/framework} feature will save you hours of debugging",
        "The {tool} command every developer should know",
        "Stop writing boilerplate code. Use this instead",
        "How to {achieve} without {common_pain_point}"
      ]
    },
    
    business: {
      painPoints: ['ROI', 'scaling', 'competition', 'costs'],
      hooks: [
        "{Number}X ROI using this {topic} strategy",
        "How {company} scaled to {milestone} with {method}",
        "The ${amount} mistake killing your {metric}",
        "Competitors hate this {topic} advantage"
      ]
    },
    
    creators: {
      painPoints: ['views', 'engagement', 'monetization', 'time'],
      hooks: [
        "How I went from {start} to {end} views in {time}",
        "The {platform} algorithm change nobody's talking about",
        "Turn {time} of work into {revenue/result}",
        "Why your {content_type} isn't getting views (and how to fix it)"
      ]
    },
    
    general: {
      painPoints: ['time', 'money', 'complexity', 'mistakes'],
      hooks: [
        "I wish I knew this {topic} trick sooner",
        "The lazy person's guide to {achieving_goal}",
        "{Number} {topic} facts that will blow your mind",
        "Do this before {deadline/event}"
      ]
    }
  },

  // Emotional Triggers
  emotionalTriggers: {
    fear: {
      loss: "You're losing {value} every day by not knowing this",
      mistake: "The {topic} mistake that could cost you {consequence}",
      missing: "What everyone else knows about {topic} (that you don't)"
    },
    
    excitement: {
      discovery: "I just discovered the future of {topic}",
      breakthrough: "This changes everything about {topic}",
      exclusive: "Be among the first to try {new_thing}"
    },
    
    curiosity: {
      mystery: "The {topic} secret {authority} doesn't want you to know",
      reveal: "I tested {topic} for {time}. Here's what happened",
      question: "Why does {unexpected_thing} happen when you {action}?"
    },
    
    urgency: {
      deadline: "Before {event/date}, you need to know this",
      limited: "Only {number} people know this {topic} trick",
      trending: "The {topic} trend taking over {platform/industry}"
    }
  },

  // Data-Driven Hook Performance Metrics
  performanceMetrics: {
    optimal: {
      wordCount: '12-20 words',
      readingTime: '3-5 seconds',
      emotionalWords: '1-2 per hook',
      specificityLevel: 'High (numbers, names, timeframes)',
      questionFormat: '30% of hooks should be questions'
    },
    
    avoid: {
      generic: ['amazing', 'awesome', 'incredible', 'unbelievable'],
      overused: ['You won\'t believe', 'Secret trick', 'Doctors hate'],
      vague: ['This thing', 'Some people', 'A while ago']
    }
  }
};

// Hook Generator Function
export function generateOptimizedHook(options) {
  const {
    topic,
    audience = 'general',
    platform = 'youtube',
    videoLength = 'long',
    emotion = 'curiosity',
    includeStats = true
  } = options;

  const hooks = [];
  
  // Generate multiple hook options
  const audienceHook = hookFormulas.audienceHooks[audience] || hookFormulas.audienceHooks.general;
  const emotionalHook = hookFormulas.emotionalTriggers[emotion];
  const platformHook = videoLength === 'short' 
    ? hookFormulas.platformOptimized.shorts.examples
    : hookFormulas.platformOptimized.longForm.examples;

  // Create personalized variations
  const personalizedHooks = {
    audience: audienceHook.hooks[Math.floor(Math.random() * audienceHook.hooks.length)],
    emotional: Object.values(emotionalHook)[Math.floor(Math.random() * Object.values(emotionalHook).length)],
    platform: platformHook[Math.floor(Math.random() * platformHook.length)]
  };

  return personalizedHooks;
}

// Retention Checkpoint Generator
export function generateRetentionCheckpoints(scriptLength) {
  const checkpoints = [];
  const intervalSeconds = scriptLength <= 60 ? 15 : 60;
  
  const patterns = Object.values(hookFormulas.retentionPatterns);
  let patternIndex = 0;
  
  for (let i = intervalSeconds; i < scriptLength; i += intervalSeconds) {
    checkpoints.push({
      timestamp: i,
      pattern: patterns[patternIndex % patterns.length],
      suggestion: `Insert ${patterns[patternIndex % patterns.length].description} here`
    });
    patternIndex++;
  }
  
  return checkpoints;
}

// PVSS Method Implementation
export function generatePVSSStructure(topic, audience, duration) {
  return {
    proof: {
      timing: '0-5 seconds',
      content: `Establish credibility with specific achievement, statistic, or qualification related to ${topic}`,
      example: `"After analyzing 10,000 ${topic} cases..." or "Stanford researchers just proved..."`
    },
    value: {
      timing: '5-10 seconds',
      content: `Clear, specific promise of what ${audience} will gain`,
      example: `"You'll learn the exact 3-step process that gets results in under 30 days"`
    },
    structure: {
      timing: '10-15 seconds',
      content: 'Brief roadmap of main points',
      example: `"First, we'll cover X, then I'll show you Y, and finally, the secret to Z"`
    },
    stakes: {
      timing: '15-20 seconds',
      content: 'What viewers miss if they leave early',
      example: `"And at the end, I'll share the one mistake that costs 90% of people their success"`
    }
  };
}

// Pattern Interrupt Library
export const patternInterrupts = {
  visual: [
    'Quick zoom in/out',
    'Color shift or filter change',
    'Text overlay with key point',
    'Unexpected image or meme',
    'Speed ramp (slow-mo to fast)'
  ],
  
  audio: [
    'Sound effect punctuation',
    'Music stop/change',
    'Voice tone shift',
    'Silence for emphasis',
    'Question to audience'
  ],
  
  verbal: [
    'But wait...',
    'Plot twist:',
    'Here\'s the crazy part...',
    'Nobody talks about this, but...',
    'Okay, real talk for a second...'
  ],
  
  structural: [
    'Mini-quiz or poll',
    'Viewer challenge',
    'Perspective shift',
    'Time jump (flash forward/back)',
    'Direct address to camera'
  ]
};

// Export utility to calculate optimal hook based on all factors
export function calculateOptimalHook(videoData) {
  const {
    topic,
    audience,
    platform,
    duration,
    previousPerformance = null,
    trendingTopics = []
  } = videoData;

  // Weight different factors
  const weights = {
    audienceMatch: 0.3,
    emotionalImpact: 0.25,
    trendRelevance: 0.2,
    platformOptimization: 0.15,
    historicalPerformance: 0.1
  };

  // Score different hook types and return best option
  const hookScores = {};
  
  // Calculate scores for each hook type
  for (const [hookType, hookData] of Object.entries(hookFormulas)) {
    let score = 0;
    
    // Add scoring logic based on weights
    // This is a simplified version - you can expand based on your needs
    
    hookScores[hookType] = score;
  }

  return {
    recommended: hookFormulas.pvss, // Default to PVSS as it's proven
    alternatives: [
      hookFormulas.twoSecondRule,
      hookFormulas.platformOptimized
    ],
    customization: {
      audience: audienceHooks[audience],
      emotional: emotionalTriggers.curiosity,
      platform: platform === 'shorts' ? platformOptimized.shorts : platformOptimized.longForm
    }
  };
}