import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { videoTopic, keywords, style, includeHashtags, includeCTA } = await request.json();

    if (!videoTopic?.trim()) {
      return NextResponse.json(
        { error: 'Video topic is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would use OpenAI or another AI service
    // For now, we'll generate a mock description
    
    const descriptionParts = [];
    
    // Opening hook
    descriptionParts.push('🎯 ' + generateOpeningHook(videoTopic, style));
    descriptionParts.push('');
    
    // Main description
    descriptionParts.push(generateMainDescription(videoTopic, keywords, style));
    descriptionParts.push('');
    
    // What you'll learn section
    descriptionParts.push('🔥 What You\'ll Learn:');
    const learningPoints = generateLearningPoints(videoTopic);
    learningPoints.forEach(point => {
      descriptionParts.push('• ' + point);
    });
    descriptionParts.push('');
    
    // Timestamps (placeholder)
    descriptionParts.push('⏰ Timestamps:');
    descriptionParts.push('00:00 - Introduction');
    descriptionParts.push('02:30 - Main content begins');
    descriptionParts.push('08:00 - Key techniques');
    descriptionParts.push('12:00 - Tips and troubleshooting');
    descriptionParts.push('15:30 - Conclusion');
    descriptionParts.push('');
    
    // Resources section
    descriptionParts.push('📚 Resources Mentioned:');
    descriptionParts.push('• Free guide: [link]');
    descriptionParts.push('• Recommended tools: [link]');
    descriptionParts.push('• Join our community: [link]');
    descriptionParts.push('');
    
    // Call to action
    if (includeCTA) {
      descriptionParts.push('👍 If this video helped you, please give it a thumbs up and subscribe for more tutorials!');
      descriptionParts.push('');
      descriptionParts.push('🔔 Turn on notifications so you never miss new content!');
      descriptionParts.push('');
    }
    
    // Hashtags
    if (includeHashtags) {
      const hashtags = generateHashtags(videoTopic, keywords);
      descriptionParts.push(hashtags.join(' '));
    }

    const description = descriptionParts.join('\n');

    return NextResponse.json({
      success: true,
      description,
      wordCount: description.split(' ').length,
      characterCount: description.length
    });

  } catch (error) {
    console.error('Description generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}

function generateOpeningHook(topic, style) {
  const hooks = {
    professional: `Master ${topic} with this comprehensive guide!`,
    casual: `Ready to learn ${topic}? Let's dive in!`,
    educational: `Understanding ${topic}: A Complete Tutorial`,
    entertaining: `You won't believe how easy ${topic} can be!`
  };
  
  return hooks[style] || hooks.professional;
}

function generateMainDescription(topic, keywords, style) {
  const templates = {
    professional: `In this comprehensive tutorial, you'll learn everything you need to know about ${topic}. Whether you're a beginner or looking to improve your skills, this step-by-step guide covers all the essential techniques and best practices.`,
    casual: `Hey there! Today we're diving deep into ${topic} and I'm going to show you exactly how to get amazing results. I've been doing this for years and I'm excited to share all my favorite tips and tricks with you!`,
    educational: `This educational video provides a thorough exploration of ${topic}, covering fundamental concepts, practical applications, and advanced techniques. Perfect for learners at any level.`,
    entertaining: `Get ready for the most fun you'll ever have learning about ${topic}! We're going to break it down step by step, and I guarantee you'll be amazed at how simple it really is.`
  };
  
  return templates[style] || templates.professional;
}

function generateLearningPoints(topic) {
  // Generic learning points that work for most topics
  return [
    `The fundamentals of ${topic}`,
    'Step-by-step techniques',
    'Common mistakes to avoid',
    'Pro tips and tricks',
    'Troubleshooting guide'
  ];
}

function generateHashtags(topic, keywords) {
  const topicWords = topic.toLowerCase().split(' ');
  const keywordList = keywords ? keywords.split(',').map(k => k.trim()) : [];
  
  const hashtags = new Set();
  
  // Add main topic words
  topicWords.forEach(word => {
    if (word.length > 3) {
      hashtags.add('#' + word.replace(/[^a-zA-Z0-9]/g, ''));
    }
  });
  
  // Add keywords
  keywordList.forEach(keyword => {
    if (keyword.length > 3) {
      hashtags.add('#' + keyword.replace(/[^a-zA-Z0-9]/g, ''));
    }
  });
  
  // Add some generic popular hashtags
  hashtags.add('#tutorial');
  hashtags.add('#howto');
  hashtags.add('#tips');
  hashtags.add('#diy');
  hashtags.add('#guide');
  
  return Array.from(hashtags).slice(0, 15); // Limit to 15 hashtags
}