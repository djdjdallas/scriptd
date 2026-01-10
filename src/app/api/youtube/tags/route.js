import { NextResponse } from 'next/server';
import { apiLogger } from '@/lib/monitoring/logger';

export async function POST(request) {
  try {
    const { videoTopic } = await request.json();

    if (!videoTopic?.trim()) {
      return NextResponse.json(
        { error: 'Video topic is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would use YouTube Data API or similar services
    // For now, we'll generate mock tags based on the video topic
    
    const tags = generateTags(videoTopic.trim());

    return NextResponse.json({
      success: true,
      tags,
      videoTopic
    });

  } catch (error) {
    apiLogger.error('Tag generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate tags' },
      { status: 500 }
    );
  }
}

function generateTags(videoTopic) {
  const tags = [];
  const topicWords = videoTopic.toLowerCase().split(' ');
  
  // Extract main keywords from the topic
  const mainKeywords = topicWords.filter(word => 
    word.length > 3 && 
    !['with', 'from', 'your', 'this', 'that', 'they', 'them', 'have', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'into', 'only', 'more', 'very', 'what', 'know', 'just', 'first', 'some', 'could', 'would', 'make', 'like', 'than', 'most', 'over', 'such', 'take', 'many', 'well', 'also'].includes(word)
  );
  
  // Primary tags (exact topic match)
  if (mainKeywords.length > 0) {
    tags.push({
      tag: mainKeywords.join(' '),
      relevance: 95,
      competition: getRandomCompetition(),
      volume: getRandomVolume()
    });
  }
  
  // Individual keyword tags
  mainKeywords.forEach((keyword, index) => {
    tags.push({
      tag: keyword,
      relevance: 90 - (index * 2),
      competition: getRandomCompetition(),
      volume: getRandomVolume()
    });
  });
  
  // Generate related tags based on common patterns
  const relatedTags = generateRelatedTags(videoTopic, mainKeywords);
  tags.push(...relatedTags);
  
  // Add generic high-performing tags
  const genericTags = [
    { tag: 'tutorial', relevance: 75, competition: 'High', volume: '500K' },
    { tag: 'how to', relevance: 73, competition: 'High', volume: '450K' },
    { tag: 'guide', relevance: 70, competition: 'Medium', volume: '200K' },
    { tag: 'tips', relevance: 68, competition: 'Medium', volume: '180K' },
    { tag: 'beginner', relevance: 65, competition: 'Medium', volume: '150K' },
    { tag: 'step by step', relevance: 63, competition: 'Medium', volume: '120K' },
    { tag: 'easy', relevance: 60, competition: 'Low', volume: '100K' },
    { tag: 'diy', relevance: 58, competition: 'Medium', volume: '90K' },
    { tag: 'learn', relevance: 55, competition: 'High', volume: '300K' },
    { tag: 'explained', relevance: 52, competition: 'Low', volume: '80K' }
  ];
  
  // Add relevant generic tags
  genericTags.forEach(genericTag => {
    if (tags.length < 15) { // Limit to 15 total tags
      tags.push(genericTag);
    }
  });
  
  // Sort by relevance and return top 10-12 tags
  return tags
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 12);
}

function generateRelatedTags(videoTopic, mainKeywords) {
  const relatedTags = [];
  
  // Generate combination tags
  if (mainKeywords.length >= 2) {
    for (let i = 0; i < mainKeywords.length - 1; i++) {
      for (let j = i + 1; j < mainKeywords.length; j++) {
        relatedTags.push({
          tag: `${mainKeywords[i]} ${mainKeywords[j]}`,
          relevance: 85 - relatedTags.length,
          competition: getRandomCompetition(),
          volume: getRandomVolume()
        });
      }
    }
  }
  
  // Topic-specific related terms
  const topicLower = videoTopic.toLowerCase();
  
  // Cooking/Baking related
  if (topicLower.includes('recipe') || topicLower.includes('cooking') || topicLower.includes('baking') || topicLower.includes('bread') || topicLower.includes('cake')) {
    relatedTags.push(
      { tag: 'recipe', relevance: 88, competition: 'High', volume: '400K' },
      { tag: 'cooking', relevance: 85, competition: 'High', volume: '350K' },
      { tag: 'homemade', relevance: 82, competition: 'Medium', volume: '200K' },
      { tag: 'kitchen', relevance: 78, competition: 'Medium', volume: '150K' },
      { tag: 'food', relevance: 75, competition: 'High', volume: '600K' }
    );
  }
  
  // Fitness/Workout related
  if (topicLower.includes('workout') || topicLower.includes('exercise') || topicLower.includes('fitness') || topicLower.includes('training')) {
    relatedTags.push(
      { tag: 'workout', relevance: 88, competition: 'High', volume: '300K' },
      { tag: 'fitness', relevance: 85, competition: 'High', volume: '450K' },
      { tag: 'exercise', relevance: 82, competition: 'High', volume: '280K' },
      { tag: 'training', relevance: 78, competition: 'Medium', volume: '200K' },
      { tag: 'health', relevance: 75, competition: 'High', volume: '500K' }
    );
  }
  
  // Technology related
  if (topicLower.includes('tech') || topicLower.includes('computer') || topicLower.includes('software') || topicLower.includes('app') || topicLower.includes('programming')) {
    relatedTags.push(
      { tag: 'technology', relevance: 88, competition: 'High', volume: '400K' },
      { tag: 'tech', relevance: 85, competition: 'High', volume: '350K' },
      { tag: 'software', relevance: 82, competition: 'Medium', volume: '180K' },
      { tag: 'review', relevance: 78, competition: 'Medium', volume: '250K' },
      { tag: 'comparison', relevance: 75, competition: 'Low', volume: '120K' }
    );
  }
  
  // Beauty/Fashion related
  if (topicLower.includes('makeup') || topicLower.includes('beauty') || topicLower.includes('fashion') || topicLower.includes('style')) {
    relatedTags.push(
      { tag: 'beauty', relevance: 88, competition: 'High', volume: '500K' },
      { tag: 'makeup', relevance: 85, competition: 'High', volume: '400K' },
      { tag: 'skincare', relevance: 82, competition: 'Medium', volume: '300K' },
      { tag: 'style', relevance: 78, competition: 'Medium', volume: '200K' },
      { tag: 'fashion', relevance: 75, competition: 'High', volume: '450K' }
    );
  }
  
  return relatedTags.slice(0, 5); // Limit related tags
}

function getRandomCompetition() {
  const competitions = ['Low', 'Medium', 'High'];
  const weights = [0.3, 0.5, 0.2]; // More medium difficulty tags
  
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < competitions.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return competitions[i];
    }
  }
  
  return 'Medium';
}

function getRandomVolume() {
  const volumes = ['2K', '5K', '8K', '12K', '18K', '25K', '35K', '50K', '75K', '100K', '150K', '200K'];
  return volumes[Math.floor(Math.random() * volumes.length)];
}