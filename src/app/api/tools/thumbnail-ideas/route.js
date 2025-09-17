import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { topic, title, style, targetAudience } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate thumbnail ideas based on input
    const ideas = generateThumbnailIdeas(topic, title, style, targetAudience);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Thumbnail idea generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate thumbnail ideas' },
      { status: 500 }
    );
  }
}

function generateThumbnailIdeas(topic, title, style, targetAudience) {
  const ideas = [];
  
  // Style-specific configurations
  const styleConfigs = {
    minimal: {
      colors: ['White', 'Black', 'Gray'],
      emphasis: 'Clean typography and negative space'
    },
    bold: {
      colors: ['Red', 'Yellow', 'Blue', 'Green', 'Orange'],
      emphasis: 'High contrast and vibrant colors'
    },
    professional: {
      colors: ['Navy', 'White', 'Gray', 'Gold'],
      emphasis: 'Trust and authority'
    },
    dramatic: {
      colors: ['Black', 'Red', 'White', 'Dark Blue'],
      emphasis: 'Strong emotions and contrast'
    },
    educational: {
      colors: ['Blue', 'White', 'Green', 'Yellow'],
      emphasis: 'Clear information hierarchy'
    },
    entertainment: {
      colors: ['Pink', 'Purple', 'Cyan', 'Yellow', 'Lime'],
      emphasis: 'Fun and eye-catching visuals'
    }
  };

  const config = styleConfigs[style] || styleConfigs.bold;

  // Thumbnail concept templates
  const templates = [
    {
      concept: `Split-screen comparison showing before/after of ${topic}`,
      colors: [config.colors[0], config.colors[1], 'White'],
      text: title ? (title.length > 30 ? title.substring(0, 30) + '...' : title) : 'BEFORE vs AFTER',
      elements: ['Split diagonal line', 'Before image (left)', 'After image (right)', 'Bold arrows'],
      psychology: 'Transformation stories create curiosity about the process',
      ctr_tip: 'Make the contrast between before and after dramatic and clear'
    },
    {
      concept: `Close-up reaction face with ${topic} result in background`,
      colors: [config.colors[0], config.colors[2], 'Black'],
      text: 'YOU WON\'T BELIEVE THIS',
      elements: ['Shocked/surprised face', 'Blurred background', 'Bright highlight on face', 'Result preview'],
      psychology: 'Human faces increase click-through rates by 40%',
      ctr_tip: 'Use genuine emotional expressions, avoid stock photos'
    },
    {
      concept: `Number-focused design highlighting key ${topic} statistics`,
      colors: [config.colors[1], 'White', config.colors[0]],
      text: title ? title.match(/\d+/) ? title.match(/\d+/)[0] : '10X' : '10X BETTER',
      elements: ['Large bold number', 'Supporting icon', 'Minimal background', 'Data visualization'],
      psychology: 'Specific numbers create concrete value propositions',
      ctr_tip: 'Make the number impossibly large or surprisingly specific'
    },
    {
      concept: `Mystery reveal setup for ${topic} with partially hidden element`,
      colors: ['Black', config.colors[0], 'White'],
      text: 'THE SECRET TO...',
      elements: ['Blurred/covered main subject', 'Question mark overlay', 'Teaser glimpse', 'Dramatic lighting'],
      psychology: 'Curiosity gap makes viewers need to know the answer',
      ctr_tip: 'Show just enough to intrigue but not enough to satisfy'
    },
    {
      concept: `Action shot capturing the peak moment of ${topic}`,
      colors: config.colors.slice(0, 3),
      text: title ? title.split(' ').slice(0, 3).join(' ') : 'WATCH THIS',
      elements: ['Motion blur effects', 'Peak action moment', 'Dynamic angle', 'Energy lines'],
      psychology: 'Movement and action suggest exciting content',
      ctr_tip: 'Capture the exact moment of maximum tension or excitement'
    },
    {
      concept: `Problem/solution layout showing ${topic} challenge and fix`,
      colors: ['Red', 'Green', 'White'],
      text: 'FIXED IN 5 MINS',
      elements: ['Red X on problem', 'Green check on solution', 'Clear divider', 'Timer icon'],
      psychology: 'People seek solutions to problems they relate to',
      ctr_tip: 'Make the problem relatable and the solution achievable'
    }
  ];

  // Customize based on target audience
  const audienceModifiers = {
    beginners: {
      textModifier: 'EASY ',
      elementModifier: 'Simple icons'
    },
    professionals: {
      textModifier: 'PRO ',
      elementModifier: 'Technical details'
    },
    students: {
      textModifier: 'LEARN ',
      elementModifier: 'Educational graphics'
    }
  };

  // Select 4-5 ideas and customize them
  const selectedTemplates = templates
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  selectedTemplates.forEach(template => {
    const idea = { ...template };
    
    // Apply audience modifiers if specified
    if (targetAudience) {
      const audienceKey = Object.keys(audienceModifiers).find(key => 
        targetAudience.toLowerCase().includes(key)
      );
      
      if (audienceKey) {
        const modifier = audienceModifiers[audienceKey];
        idea.text = modifier.textModifier + idea.text;
        idea.elements.push(modifier.elementModifier);
      }
    }

    // Ensure style colors are prominently featured
    idea.colors = [...new Set([...config.colors.slice(0, 3), ...idea.colors])].slice(0, 4);
    
    ideas.push(idea);
  });

  return ideas;
}