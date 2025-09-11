// YouTube Channel Audience Analysis
// Generates detailed audience personas from channel data

export async function analyzeChannelAudience(channelData, recentVideos = []) {
  // Extract key information from channel
  const {
    snippet: { title, description, customUrl, country },
    statistics: { viewCount, subscriberCount, videoCount },
    brandingSettings
  } = channelData;

  // Analyze video categories and topics
  const videoTopics = analyzeVideoTopics(recentVideos);
  const averageViews = calculateAverageViews(recentVideos);
  const engagementRate = calculateEngagementRate(recentVideos);
  
  // Generate audience persona
  const audiencePersona = generateAudiencePersona({
    channelTitle: title,
    channelDescription: description,
    videoTopics,
    averageViews,
    subscriberCount,
    engagementRate,
    country
  });

  return {
    persona: audiencePersona,
    demographics: estimateDemographics(videoTopics, engagementRate),
    interests: extractInterests(videoTopics, description),
    psychographics: generatePsychographics(videoTopics, engagementRate)
  };
}

function analyzeVideoTopics(videos) {
  const topics = {};
  const categories = {};
  
  videos.forEach(video => {
    // Extract topics from titles and descriptions
    const text = `${video.snippet.title} ${video.snippet.description}`.toLowerCase();
    
    // Common topic keywords
    const topicKeywords = {
      tech: ['tech', 'coding', 'programming', 'software', 'ai', 'machine learning', 'web', 'app'],
      gaming: ['gaming', 'game', 'play', 'stream', 'esports', 'console', 'pc'],
      education: ['learn', 'tutorial', 'how to', 'guide', 'course', 'lesson', 'teach'],
      entertainment: ['funny', 'comedy', 'react', 'challenge', 'vlog', 'prank'],
      music: ['music', 'song', 'cover', 'remix', 'beat', 'track', 'album'],
      fashion: ['fashion', 'style', 'outfit', 'clothes', 'wear', 'trend', 'look'],
      fitness: ['workout', 'exercise', 'fitness', 'gym', 'health', 'training'],
      food: ['recipe', 'cooking', 'food', 'meal', 'dish', 'cuisine', 'bake'],
      business: ['business', 'entrepreneur', 'startup', 'money', 'invest', 'finance'],
      lifestyle: ['lifestyle', 'daily', 'routine', 'life', 'day', 'morning', 'night']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          topics[topic] = (topics[topic] || 0) + 1;
        }
      });
    });
    
    // Track video categories
    if (video.snippet.categoryId) {
      categories[video.snippet.categoryId] = (categories[video.snippet.categoryId] || 0) + 1;
    }
  });
  
  return { topics, categories };
}

function calculateAverageViews(videos) {
  if (!videos.length) return 0;
  
  const totalViews = videos.reduce((sum, video) => {
    return sum + (parseInt(video.statistics?.viewCount) || 0);
  }, 0);
  
  return Math.round(totalViews / videos.length);
}

function calculateEngagementRate(videos) {
  if (!videos.length) return 0;
  
  const engagementRates = videos.map(video => {
    const views = parseInt(video.statistics?.viewCount) || 1;
    const likes = parseInt(video.statistics?.likeCount) || 0;
    const comments = parseInt(video.statistics?.commentCount) || 0;
    
    return ((likes + comments) / views) * 100;
  });
  
  const avgEngagement = engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length;
  return avgEngagement.toFixed(2);
}

function generateAudiencePersona({
  channelTitle,
  channelDescription,
  videoTopics,
  averageViews,
  subscriberCount,
  engagementRate,
  country
}) {
  const { topics } = videoTopics;
  const primaryTopics = Object.entries(topics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);
  
  // Determine audience characteristics based on content
  let ageRange = '18-34';
  let gender = 'mixed';
  let interests = [];
  let characteristics = [];
  
  // Age estimation based on topics
  if (primaryTopics.includes('gaming') || primaryTopics.includes('entertainment')) {
    ageRange = '16-28';
  } else if (primaryTopics.includes('business') || primaryTopics.includes('finance')) {
    ageRange = '25-45';
  } else if (primaryTopics.includes('education')) {
    ageRange = '18-35';
  }
  
  // Gender tendency based on topics (with careful generalization)
  if (primaryTopics.includes('fashion') || primaryTopics.includes('lifestyle')) {
    gender = 'predominantly female (60-70%)';
  } else if (primaryTopics.includes('gaming') || primaryTopics.includes('tech')) {
    gender = 'predominantly male (60-70%)';
  }
  
  // Generate interests based on topics
  interests = primaryTopics.map(topic => {
    const topicInterests = {
      tech: 'technology, innovation, and digital tools',
      gaming: 'video games, esports, and gaming culture',
      education: 'learning, self-improvement, and skill development',
      entertainment: 'pop culture, trends, and social media',
      music: 'music discovery, artists, and creative expression',
      fashion: 'style trends, personal expression, and fashion brands',
      fitness: 'health, wellness, and physical fitness',
      food: 'culinary arts, cooking, and food culture',
      business: 'entrepreneurship, financial growth, and career success',
      lifestyle: 'daily routines, personal development, and life optimization'
    };
    return topicInterests[topic] || topic;
  });
  
  // Generate characteristics based on engagement
  const engagementLevel = parseFloat(engagementRate);
  if (engagementLevel > 5) {
    characteristics.push('highly engaged and interactive');
  } else if (engagementLevel > 2) {
    characteristics.push('moderately engaged');
  } else {
    characteristics.push('passive viewers');
  }
  
  // Size-based characteristics
  const subCount = parseInt(subscriberCount) || 0;
  if (subCount > 100000) {
    characteristics.push('part of a large, established community');
  } else if (subCount > 10000) {
    characteristics.push('part of a growing, dedicated community');
  } else {
    characteristics.push('early adopters and niche enthusiasts');
  }
  
  // Build the persona description
  const persona = `This channel appeals to ${ageRange} year olds (${gender}) who are passionate about ${interests.join(', ')}. ` +
    `They are ${characteristics.join(' and ')} with an average engagement rate of ${engagementRate}%. ` +
    `The audience seeks content that is ${primaryTopics.includes('education') ? 'informative and practical' : 
      primaryTopics.includes('entertainment') ? 'entertaining and engaging' : 'inspiring and valuable'}. ` +
    `With ${subscriberCount} subscribers and an average of ${averageViews.toLocaleString()} views per video, ` +
    `this audience values ${primaryTopics.includes('tech') ? 'cutting-edge information and practical tutorials' :
      primaryTopics.includes('lifestyle') ? 'authentic storytelling and lifestyle inspiration' :
      'quality content that delivers on its promises'}.`;
  
  return persona;
}

function estimateDemographics(videoTopics, engagementRate) {
  const { topics } = videoTopics;
  const primaryTopics = Object.entries(topics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);
  
  return {
    ageRange: primaryTopics.includes('gaming') ? '16-28' :
              primaryTopics.includes('business') ? '25-45' : '18-35',
    primaryGender: primaryTopics.includes('fashion') ? 'female' :
                   primaryTopics.includes('gaming') ? 'male' : 'mixed',
    education: primaryTopics.includes('tech') || primaryTopics.includes('business') ? 
               'college-educated' : 'varied',
    income: primaryTopics.includes('business') || primaryTopics.includes('tech') ?
            'middle to upper-middle class' : 'varied',
    location: 'primarily English-speaking countries'
  };
}

function extractInterests(videoTopics, description) {
  const { topics } = videoTopics;
  const interests = [];
  
  // Map topics to broader interests
  const topicInterestMap = {
    tech: ['technology', 'innovation', 'gadgets', 'software', 'AI'],
    gaming: ['video games', 'esports', 'streaming', 'gaming hardware'],
    education: ['learning', 'self-improvement', 'skills', 'knowledge'],
    entertainment: ['pop culture', 'trends', 'humor', 'viral content'],
    music: ['music', 'concerts', 'artists', 'music production'],
    fashion: ['style', 'trends', 'brands', 'personal expression'],
    fitness: ['health', 'wellness', 'exercise', 'nutrition'],
    food: ['cooking', 'recipes', 'restaurants', 'food culture'],
    business: ['entrepreneurship', 'investing', 'career', 'finance'],
    lifestyle: ['daily routines', 'productivity', 'minimalism', 'self-care']
  };
  
  Object.entries(topics).forEach(([topic, count]) => {
    if (count > 0 && topicInterestMap[topic]) {
      interests.push(...topicInterestMap[topic]);
    }
  });
  
  return [...new Set(interests)]; // Remove duplicates
}

function generatePsychographics(videoTopics, engagementRate) {
  const { topics } = videoTopics;
  const engagement = parseFloat(engagementRate);
  
  return {
    values: determineCoreValues(topics),
    motivations: determineMotivations(topics),
    challenges: determineChallenges(topics),
    aspirations: determineAspirations(topics),
    contentPreferences: {
      format: engagement > 3 ? 'interactive and engaging' : 'informative and structured',
      length: engagement > 3 ? 'varied, including longer deep-dives' : 'concise and to-the-point',
      style: Object.keys(topics).includes('entertainment') ? 'entertaining and casual' : 'informative and professional'
    }
  };
}

function determineCoreValues(topics) {
  const values = [];
  
  if (topics.education) values.push('continuous learning');
  if (topics.business) values.push('success and achievement');
  if (topics.fitness) values.push('health and wellness');
  if (topics.tech) values.push('innovation and progress');
  if (topics.lifestyle) values.push('personal growth');
  if (topics.entertainment) values.push('enjoyment and relaxation');
  
  return values;
}

function determineMotivations(topics) {
  const motivations = [];
  
  if (topics.education) motivations.push('skill development');
  if (topics.business) motivations.push('financial growth');
  if (topics.fitness) motivations.push('physical improvement');
  if (topics.tech) motivations.push('staying current with technology');
  if (topics.entertainment) motivations.push('entertainment and escapism');
  
  return motivations;
}

function determineChallenges(topics) {
  const challenges = [];
  
  if (topics.education) challenges.push('finding time to learn');
  if (topics.business) challenges.push('achieving financial goals');
  if (topics.fitness) challenges.push('maintaining consistency');
  if (topics.tech) challenges.push('keeping up with rapid changes');
  
  return challenges;
}

function determineAspirations(topics) {
  const aspirations = [];
  
  if (topics.education) aspirations.push('becoming an expert in their field');
  if (topics.business) aspirations.push('building successful ventures');
  if (topics.fitness) aspirations.push('achieving optimal health');
  if (topics.tech) aspirations.push('mastering new technologies');
  if (topics.lifestyle) aspirations.push('living their best life');
  
  return aspirations;
}

export default {
  analyzeChannelAudience,
  generateAudiencePersona,
  estimateDemographics,
  extractInterests,
  generatePsychographics
};