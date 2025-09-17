import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { topic, description } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate hashtags based on topic and description
    const hashtags = generateHashtags(topic, description);

    return NextResponse.json({ hashtags });
  } catch (error) {
    console.error('Hashtag generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hashtags' },
      { status: 500 }
    );
  }
}

function generateHashtags(topic, description) {
  const hashtags = [];
  
  // Extract keywords from topic
  const topicWords = topic.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3);

  // Common YouTube hashtag patterns
  const patterns = [
    // Direct topic hashtags
    ...topicWords.map(word => ({
      tag: word,
      relevance: 95,
      competition: 'high',
      trending: Math.random() > 0.7
    })),
    
    // Combined topic words
    {
      tag: topicWords.join(''),
      relevance: 90,
      competition: 'medium',
      trending: Math.random() > 0.8
    },
    
    // Topic + common suffixes
    {
      tag: `${topicWords[0]}tips`,
      relevance: 85,
      competition: 'medium',
      trending: Math.random() > 0.6
    },
    {
      tag: `${topicWords[0]}tutorial`,
      relevance: 85,
      competition: 'high',
      trending: Math.random() > 0.7
    },
    {
      tag: `howto${topicWords[0]}`,
      relevance: 80,
      competition: 'medium',
      trending: Math.random() > 0.6
    },
    
    // Year-specific
    {
      tag: `${topicWords[0]}2025`,
      relevance: 75,
      competition: 'low',
      trending: true
    },
    
    // General high-volume hashtags
    {
      tag: 'youtube',
      relevance: 60,
      competition: 'high',
      trending: false
    },
    {
      tag: 'viral',
      relevance: 50,
      competition: 'high',
      trending: Math.random() > 0.5
    },
    {
      tag: 'fyp',
      relevance: 55,
      competition: 'high',
      trending: true
    },
    {
      tag: 'trending',
      relevance: 55,
      competition: 'high',
      trending: true
    }
  ];

  // Category-specific hashtags
  const categoryHashtags = {
    tech: ['technology', 'tech', 'gadgets', 'innovation', 'techtips'],
    education: ['education', 'learning', 'study', 'edtech', 'students'],
    entertainment: ['entertainment', 'fun', 'comedy', 'viral', 'mustwatch'],
    lifestyle: ['lifestyle', 'life', 'daily', 'vlog', 'routine'],
    business: ['business', 'entrepreneur', 'success', 'money', 'hustle'],
    gaming: ['gaming', 'games', 'gamer', 'gameplay', 'gamingcommunity'],
    food: ['food', 'foodie', 'cooking', 'recipe', 'yummy'],
    fitness: ['fitness', 'workout', 'health', 'gym', 'fitnessmotivation'],
    diy: ['diy', 'howto', 'craft', 'handmade', 'creative'],
    travel: ['travel', 'wanderlust', 'adventure', 'explore', 'travelvlog'],
    fashion: ['fashion', 'style', 'ootd', 'fashionista', 'trends']
  };

  // Detect category from topic/description and add relevant hashtags
  const allText = `${topic} ${description || ''}`.toLowerCase();
  Object.entries(categoryHashtags).forEach(([category, tags]) => {
    if (allText.includes(category) || tags.some(tag => allText.includes(tag))) {
      tags.slice(0, 3).forEach(tag => {
        patterns.push({
          tag,
          relevance: 70 + Math.floor(Math.random() * 20),
          competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          trending: Math.random() > 0.6
        });
      });
    }
  });

  // Process description for additional hashtags if provided
  if (description) {
    const descWords = description.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 4 && !topicWords.includes(word))
      .slice(0, 3);
    
    descWords.forEach(word => {
      patterns.push({
        tag: word,
        relevance: 70 + Math.floor(Math.random() * 15),
        competition: ['low', 'medium'][Math.floor(Math.random() * 2)],
        trending: Math.random() > 0.7
      });
    });
  }

  // Remove duplicates and select top hashtags
  const uniqueTags = new Map();
  patterns.forEach(pattern => {
    if (!uniqueTags.has(pattern.tag) && pattern.tag.length > 2) {
      uniqueTags.set(pattern.tag, pattern);
    }
  });

  // Convert to array and sort by relevance
  hashtags.push(...Array.from(uniqueTags.values())
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 15));

  return hashtags;
}