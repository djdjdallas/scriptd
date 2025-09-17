import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { niche, category, targetAudience } = await request.json();

    if (!niche) {
      return NextResponse.json(
        { error: 'Niche is required' },
        { status: 400 }
      );
    }

    // Generate video ideas based on input
    const ideas = generateVideoIdeas(niche, category, targetAudience);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Idea generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}

function generateVideoIdeas(niche, category, targetAudience) {
  const ideas = [];
  
  // Template-based idea generation
  const templates = [
    {
      title: `The Complete ${niche} Guide for Beginners`,
      description: `Everything ${targetAudience || 'viewers'} need to know to get started with ${niche}. Cover the fundamentals, common mistakes, and best practices.`,
      tags: ['tutorial', 'beginner-friendly', 'comprehensive'],
      difficulty: 'Medium',
      potential: 'High',
      trending: Math.random() > 0.7
    },
    {
      title: `10 ${niche} Mistakes You're Probably Making`,
      description: `Reveal common errors in ${niche} and how to avoid them. Perfect for helping ${targetAudience || 'your audience'} improve their skills quickly.`,
      tags: ['listicle', 'educational', 'problem-solving'],
      difficulty: 'Easy',
      potential: 'High',
      trending: Math.random() > 0.6
    },
    {
      title: `${niche}: What Changed in 2025`,
      description: `Explore the latest trends, updates, and developments in ${niche}. Keep ${targetAudience || 'viewers'} informed about what's new and relevant.`,
      tags: ['news', 'trends', 'updates'],
      difficulty: 'Easy',
      potential: 'Medium',
      trending: Math.random() > 0.5
    },
    {
      title: `How I Mastered ${niche} in 30 Days`,
      description: `Share a personal journey of learning ${niche} with actionable tips and a day-by-day breakdown that ${targetAudience || 'viewers'} can follow.`,
      tags: ['personal story', 'challenge', 'motivational'],
      difficulty: 'Medium',
      potential: 'High',
      trending: Math.random() > 0.6
    },
    {
      title: `${niche} vs. Alternatives: Which is Best?`,
      description: `Compare ${niche} with similar options to help ${targetAudience || 'viewers'} make informed decisions. Include pros, cons, and recommendations.`,
      tags: ['comparison', 'review', 'analysis'],
      difficulty: 'Medium',
      potential: 'Medium',
      trending: Math.random() > 0.7
    },
    {
      title: `The Science Behind ${niche}`,
      description: `Dive deep into how ${niche} actually works. Perfect for curious ${targetAudience || 'viewers'} who want to understand the underlying principles.`,
      tags: ['educational', 'in-depth', 'explainer'],
      difficulty: 'Hard',
      potential: 'Medium',
      trending: Math.random() > 0.8
    },
    {
      title: `5-Minute ${niche} Tips That Actually Work`,
      description: `Quick, actionable tips for ${niche} that ${targetAudience || 'viewers'} can implement immediately. Perfect for short-form content.`,
      tags: ['quick tips', 'actionable', 'shorts-friendly'],
      difficulty: 'Easy',
      potential: 'High',
      trending: Math.random() > 0.5
    },
    {
      title: `${niche} Q&A: Answering Your Top Questions`,
      description: `Address the most common questions about ${niche} from ${targetAudience || 'your community'}. Great for engagement and SEO.`,
      tags: ['Q&A', 'community', 'FAQ'],
      difficulty: 'Easy',
      potential: 'Medium',
      trending: Math.random() > 0.7
    }
  ];

  // Category-specific modifications
  const categoryModifiers = {
    tech: ['Software', 'Tools', 'Apps', 'Gadgets'],
    education: ['Learning', 'Study', 'Course', 'Tutorial'],
    entertainment: ['Fun', 'Creative', 'Viral', 'Challenge'],
    lifestyle: ['Daily', 'Routine', 'Habits', 'Tips'],
    business: ['Professional', 'Career', 'Money', 'Success'],
    gaming: ['Gameplay', 'Strategy', 'Tips', 'Walkthrough'],
    food: ['Recipe', 'Cooking', 'Kitchen', 'Taste Test'],
    fitness: ['Workout', 'Exercise', 'Health', 'Training'],
    diy: ['Project', 'Build', 'Create', 'Craft'],
    travel: ['Destination', 'Journey', 'Adventure', 'Guide'],
    fashion: ['Style', 'Outfit', 'Trend', 'Look']
  };

  // Select 5-6 random ideas and customize them
  const selectedTemplates = templates
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  selectedTemplates.forEach(template => {
    const idea = { ...template };
    
    // Add category-specific modifications if applicable
    if (category && category !== 'any' && categoryModifiers[category]) {
      const modifier = categoryModifiers[category][Math.floor(Math.random() * categoryModifiers[category].length)];
      idea.tags.push(category);
      
      // Sometimes prepend modifier to title
      if (Math.random() > 0.5 && !idea.title.includes(modifier)) {
        idea.title = idea.title.replace(niche, `${modifier} ${niche}`);
      }
    }

    ideas.push(idea);
  });

  return ideas;
}