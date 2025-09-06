// Key Points Recommendation Engine
// Generates intelligent content suggestions based on video details

export const getKeyPointRecommendations = (formData) => {
  const { title = '', type = '', tone = '', targetAudience = '' } = formData || {};
  
  // Base recommendations by video type
  const typeRecommendations = {
    educational: [
      'Introduction to core concepts and definitions',
      'Historical context and evolution',
      'Current state and recent developments',
      'Practical applications and real-world examples',
      'Common misconceptions to address',
      'Step-by-step explanation of key processes',
      'Expert insights and research findings',
      'Future trends and implications',
      'Actionable takeaways for viewers',
      'Additional resources for deeper learning'
    ],
    
    entertainment: [
      'Attention-grabbing opening story or fact',
      'Main entertainment value proposition',
      'Surprising or unexpected elements',
      'Humor and comedic timing points',
      'Emotional engagement moments',
      'Interactive audience participation',
      'Behind-the-scenes insights',
      'Celebrity or pop culture references',
      'Viral potential elements',
      'Memorable closing moment'
    ],
    
    tutorial: [
      'Prerequisites and required materials',
      'Step 1: Initial setup and preparation',
      'Step 2: Core technique demonstration',
      'Step 3: Advanced tips and tricks',
      'Common mistakes and how to avoid them',
      'Troubleshooting guide',
      'Time-saving shortcuts',
      'Alternative methods or approaches',
      'Safety considerations if applicable',
      'Next steps and skill progression'
    ],
    
    review: [
      'Product/service overview and specifications',
      'Unboxing or first impressions',
      'Key features deep dive',
      'Performance testing and benchmarks',
      'Pros and advantages',
      'Cons and limitations',
      'Comparison with competitors',
      'Value for money analysis',
      'Target audience fit',
      'Final verdict and rating'
    ],
    
    vlog: [
      'Personal story or experience setup',
      'Day/event highlights',
      'Challenges faced and overcome',
      'Emotional moments and reflections',
      'Interactions with others',
      'Lessons learned',
      'Behind-the-scenes moments',
      'Viewer questions addressed',
      'Life updates and announcements',
      'Teaser for next content'
    ],
    
    news: [
      'Breaking news headline and summary',
      'Background context and timeline',
      'Key facts and statistics',
      'Expert analysis and commentary',
      'Multiple perspectives presented',
      'Impact on viewers/community',
      'Related developments',
      'Fact-checking and verification',
      'Future implications',
      'Call to action or next steps'
    ],
    
    documentary: [
      'Topic introduction and significance',
      'Historical background and context',
      'Key figures and their roles',
      'Primary evidence and sources',
      'Different viewpoints and debates',
      'Turning points and critical moments',
      'Current situation analysis',
      'Expert interviews and insights',
      'Broader implications',
      'Conclusion and reflection'
    ],
    
    comedy: [
      'Opening joke or funny observation',
      'Setup for main comedic premise',
      'Character introductions if applicable',
      'Running gags and callbacks',
      'Physical comedy moments',
      'Wordplay and puns section',
      'Audience interaction jokes',
      'Satirical commentary',
      'Surprise twist or punchline',
      'Memorable closing joke'
    ],
    
    gaming: [
      'Game introduction and genre',
      'Gameplay mechanics overview',
      'Graphics and performance analysis',
      'Story and narrative elements',
      'Multiplayer features if applicable',
      'Tips and strategies',
      'Easter eggs and secrets',
      'Comparison with similar games',
      'Community and online features',
      'Overall rating and recommendation'
    ],
    
    lifestyle: [
      'Topic relevance to daily life',
      'Personal experience and journey',
      'Practical tips and advice',
      'Product or service recommendations',
      'Budget-friendly alternatives',
      'Time management strategies',
      'Health and wellness considerations',
      'Aesthetic and style elements',
      'Community and social aspects',
      'Inspirational takeaways'
    ]
  };

  // Tone-based modifications
  const toneModifiers = {
    professional: [
      'Industry standards and best practices',
      'Data-driven insights and metrics',
      'Professional terminology explained',
      'Case studies from leading organizations',
      'ROI and business impact'
    ],
    casual: [
      'Personal anecdotes and stories',
      'Relatable everyday examples',
      'Fun facts and trivia',
      'Community experiences shared',
      'Casual Q&A with viewers'
    ],
    educational: [
      'Learning objectives clearly stated',
      'Key concepts broken down simply',
      'Visual aids and diagrams explained',
      'Practice exercises or homework',
      'Knowledge check questions'
    ],
    entertaining: [
      'Dramatic reveals and surprises',
      'Engaging storytelling elements',
      'Interactive challenges or games',
      'Memorable quotes and moments',
      'Entertainment value highlights'
    ]
  };

  // Audience-specific additions
  const audienceSpecific = {
    developers: [
      'Code examples and implementation details',
      'API documentation and usage',
      'Performance optimization tips',
      'Security best practices',
      'Integration with popular frameworks'
    ],
    students: [
      'Study tips and techniques',
      'Exam preparation strategies',
      'Academic resources and references',
      'Career pathway discussions',
      'Scholarship and opportunity info'
    ],
    business: [
      'Market analysis and trends',
      'Competitive advantage strategies',
      'Revenue and growth potential',
      'Risk assessment and mitigation',
      'Implementation roadmap'
    ],
    beginners: [
      'Basic terminology explained',
      'Simple starting steps',
      'Common beginner mistakes',
      'Gradual skill progression',
      'Encouraging success stories'
    ],
    experts: [
      'Advanced techniques and methods',
      'Cutting-edge developments',
      'Industry insider insights',
      'Complex problem solving',
      'Research and innovation focus'
    ]
  };

  // Enhanced title analysis for better context understanding
  const analyzeTitleContext = (title) => {
    const titleLower = title.toLowerCase();
    const recommendations = [];
    
    // Check for specific gaming/hacking context
    if (titleLower.includes('hack') || titleLower.includes('cheat') || titleLower.includes('exploit')) {
      if (titleLower.includes('roblox')) {
        recommendations.push(
          'What are Roblox exploits and why players use them',
          'Common types of Roblox hacks and scripts',
          'Risks and consequences of using Roblox hacks',
          'How Roblox anti-cheat system works',
          'Legal and ethical considerations',
          'Safe alternatives to hacking (legitimate game mechanics)',
          'Famous Roblox hacking incidents and their impact',
          'How to protect your account from hackers',
          'Difference between exploiting and legitimate scripting',
          'Community perspective on hacking in Roblox'
        );
      } else {
        recommendations.push(
          'Types of hacks and exploits explained',
          'Security vulnerabilities being exploited',
          'Legal and ethical implications',
          'How anti-cheat systems work',
          'Protecting yourself from hackers'
        );
      }
    }
    
    // Check for tutorial context
    else if (titleLower.includes('how to') || titleLower.includes('guide') || titleLower.includes('tutorial')) {
      const subject = title.replace(/how to|guide|tutorial/gi, '').trim();
      recommendations.push(
        `Step-by-step process for ${subject}`,
        `Common mistakes to avoid when ${subject}`,
        `Tools and resources needed`,
        `Expected results and timeline`,
        `Troubleshooting common issues`
      );
    }
    
    // Check for review context
    else if (titleLower.includes('review') || titleLower.includes('best') || titleLower.includes('top')) {
      recommendations.push(
        'Evaluation criteria and methodology',
        'Detailed feature comparison',
        'Pros and cons analysis',
        'User experience and feedback',
        'Value for money assessment'
      );
    }
    
    // Gaming-specific content
    else if (titleLower.includes('game') || titleLower.includes('gaming') || 
             titleLower.includes('roblox') || titleLower.includes('minecraft') || 
             titleLower.includes('fortnite')) {
      const game = titleLower.match(/roblox|minecraft|fortnite|valorant|apex|warzone/)?.[0] || 'game';
      recommendations.push(
        `Current meta and popular strategies`,
        `Beginner tips and common mistakes`,
        `Advanced techniques for experienced players`,
        `Best loadouts/setups/configurations`,
        `Community events and updates`,
        `Monetization and in-game economy`,
        `Popular creators and content in the ${game} community`
      );
    }
    
    // If no specific context is found, generate smart recommendations based on the full title
    if (recommendations.length === 0 && title) {
      recommendations.push(
        `Understanding the basics of ${title}`,
        `Why ${title} is trending/important right now`,
        `Key facts and statistics about ${title}`,
        `Common misconceptions about ${title}`,
        `Expert opinions on ${title}`,
        `Future implications of ${title}`
      );
    }
    
    return recommendations.slice(0, 8);
  };
  
  const titleSpecific = analyzeTitleContext(title || '');

  // Compile recommendations with title-specific ones having priority
  let recommendations = [];
  
  // PRIORITY 1: Add title-specific recommendations first (most relevant)
  if (titleSpecific.length > 0) {
    recommendations = [...titleSpecific];
  }
  
  // PRIORITY 2: Add type-based recommendations
  const typeKey = type?.toLowerCase();
  if (typeKey && typeRecommendations[typeKey]) {
    // Only add type recommendations that don't overlap with title-specific ones
    const typeRecs = typeRecommendations[typeKey].filter(rec => 
      !recommendations.some(existing => 
        existing.toLowerCase().includes(rec.substring(0, 15).toLowerCase())
      )
    );
    recommendations = [...recommendations, ...typeRecs];
  }
  
  // PRIORITY 3: Add audience-specific points
  const audienceKey = targetAudience?.toLowerCase();
  if (audienceKey) {
    Object.keys(audienceSpecific).forEach(key => {
      if (audienceKey.includes(key)) {
        const audienceRecs = audienceSpecific[key].slice(0, 3); // Limit to 3 per audience type
        recommendations = [...recommendations, ...audienceRecs];
      }
    });
  }
  
  // PRIORITY 4: Add tone modifiers (least priority)
  const toneKey = tone?.toLowerCase();
  if (toneKey && toneModifiers[toneKey] && recommendations.length < 15) {
    recommendations = [...recommendations, ...toneModifiers[toneKey].slice(0, 2)];
  }
  
  // Remove duplicates and limit to top 10
  const uniqueRecommendations = [...new Set(recommendations)];
  
  // Return top 10 most relevant (title-specific are already prioritized)
  return uniqueRecommendations.slice(0, 10);
};

// Function to filter recommendations based on existing key points
export const filterNewRecommendations = (recommendations, existingKeyPoints) => {
  // Filter out empty key points and convert to lowercase
  const existingLower = existingKeyPoints
    .filter(point => point && point.trim())
    .map(point => point.toLowerCase().trim());
  
  // If no existing key points, return all recommendations
  if (existingLower.length === 0) {
    return recommendations;
  }
  
  return recommendations.filter(rec => {
    const recLower = rec.toLowerCase();
    // Check if this recommendation is not already covered
    return !existingLower.some(existing => {
      // Skip comparison if existing is too short
      if (existing.length < 3) return false;
      return existing.includes(recLower.substring(0, 20)) || 
             recLower.includes(existing.substring(0, 20));
    });
  });
};

// Function to generate smart recommendations based on partial input
export const getSmartSuggestions = (partialInput, formData) => {
  if (!partialInput || partialInput.length < 3) return [];
  
  const allRecommendations = getKeyPointRecommendations(formData);
  const inputLower = partialInput.toLowerCase();
  
  // Filter recommendations that match the partial input
  const matches = allRecommendations.filter(rec => 
    rec.toLowerCase().includes(inputLower)
  );
  
  // If no matches, suggest completions based on common patterns
  if (matches.length === 0) {
    const patterns = [
      `How to ${partialInput}`,
      `Why ${partialInput} is important`,
      `Benefits of ${partialInput}`,
      `Understanding ${partialInput}`,
      `${partialInput} best practices`,
      `Common ${partialInput} mistakes`,
      `${partialInput} for beginners`,
      `Advanced ${partialInput} techniques`
    ];
    return patterns.slice(0, 3);
  }
  
  return matches.slice(0, 5);
};