import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { apiLogger } from '@/lib/monitoring/logger';

export async function POST(request) {
  let requestData = {};
  
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data - store it for use in fallback
    requestData = await request.json();
    const { title, type, targetAudience, tone, length, existingPoints } = requestData;

    if (!title || !type) {
      return NextResponse.json({ 
        error: 'Title and type are required' 
      }, { status: 400 });
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Generate recommendations using Claude
    const prompt = `You are creating a YouTube video script. Generate 5-7 specific key content points for this exact video:
    
VIDEO TITLE: "${title}"
VIDEO TYPE: ${type}
VIDEO TONE: ${tone || 'professional'}
VIDEO LENGTH: ${length || 'MEDIUM'}
TARGET AUDIENCE: ${targetAudience || 'General audience'}
${existingPoints?.length > 0 ? `\nEXISTING POINTS TO BUILD ON: ${existingPoints.join(', ')}` : ''}

Based on the title "${title}", generate content points that directly relate to this specific topic. 

For a ${type} video titled "${title}", what are the essential points that MUST be covered?

Requirements:
- Each point must be directly relevant to "${title}"
- Points should be specific to the ${type} format
- Consider what the target audience would expect from a video with this exact title
- Each point should be actionable and specific (not generic)
- If the title mentions specific topics, tools, or concepts, include points about those

Return ONLY a JSON array of 5-7 specific content points as strings. Each point should be one clear sentence that relates directly to "${title}". No additional text or formatting.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = response.content[0].text;

    // Try to parse the response as JSON
    let recommendations;
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole response
        recommendations = JSON.parse(responseText);
      }
    } catch {
      // If parsing fails, try to extract bullet points or lines
      recommendations = responseText
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[-•*\d\.]\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(line => line.length > 0 && !line.startsWith('[') && !line.startsWith(']'))
        .slice(0, 7);
    }

    // Ensure recommendations is an array
    if (!Array.isArray(recommendations)) {
      recommendations = [recommendations].flat().filter(r => r && typeof r === 'string');
    }

    return NextResponse.json({
      recommendations: recommendations.slice(0, 7), // Limit to 7 recommendations
      success: true
    });

  } catch (error) {
    apiLogger.error('Error generating recommendations', error);
    
    // Use the requestData we stored earlier
    const { title = '', type = '' } = requestData;
    
    // Provide contextual fallback recommendations based on video type and title
    let fallbackRecommendations = [];
    
    // Type-specific fallbacks that include the actual title
    if (type === 'tutorial' && title) {
      fallbackRecommendations = [
        `Introduction to ${title} - what viewers will learn`,
        `Prerequisites and materials needed for ${title}`,
        `Step 1: Getting started with ${title}`,
        `Step 2: Core techniques for ${title}`,
        `Step 3: Advanced tips for ${title}`,
        `Common mistakes to avoid when doing ${title}`,
        `Summary and next steps after mastering ${title}`
      ];
    } else if (type === 'review' && title) {
      fallbackRecommendations = [
        `First impressions of ${title}`,
        `Key features and specifications of ${title}`,
        `Testing ${title} in real-world scenarios`,
        `Pros and cons of ${title}`,
        `Comparing ${title} with alternatives`,
        `Is ${title} worth the price?`,
        `Final verdict on ${title}`
      ];
    } else if (type === 'vlog' && title) {
      fallbackRecommendations = [
        `Opening: Setting the scene for ${title}`,
        `Main story: The heart of ${title}`,
        `Key moments and highlights from ${title}`,
        `Personal reflections on ${title}`,
        `Unexpected moments during ${title}`,
        `Lessons learned from ${title}`,
        `What's next after ${title}`
      ];
    } else if (type === 'educational' && title) {
      fallbackRecommendations = [
        `What is ${title}? Definition and overview`,
        `The history and background of ${title}`,
        `Core concepts of ${title} explained`,
        `Real-world examples of ${title}`,
        `Common misconceptions about ${title}`,
        `How to apply ${title} in practice`,
        `Key takeaways about ${title}`,
        `Deep dive into the most interesting aspects of ${title}`,
        `Unexpected connections and insights about ${title}`,
        `Future implications and developments in ${title}`,
        `Expert perspectives and debates around ${title}`,
        `Practical experiments or demonstrations with ${title}`,
        `Questions viewers should ask themselves about ${title}`,
        `Resources and next steps for learning more about ${title}`
      ];
    } else if (type === 'entertainment' && title) {
      fallbackRecommendations = [
        `Opening hook for ${title}`,
        `Main content: Diving into ${title}`,
        `Funny moments and highlights from ${title}`,
        `Unexpected twists in ${title}`,
        `Audience interaction segment about ${title}`,
        `Behind the scenes of ${title}`,
        `Wrapping up ${title} with a bang`
      ];
    } else if (title) {
      // Generic fallbacks but with the actual title
      fallbackRecommendations = [
        `Introduction: What is ${title} all about`,
        `Why ${title} matters to viewers`,
        `Key points about ${title}`,
        `Examples and demonstrations of ${title}`,
        `Important considerations for ${title}`,
        `Tips and best practices for ${title}`,
        `Conclusion: Final thoughts on ${title}`
      ];
    } else {
      // Last resort - completely generic
      fallbackRecommendations = [
        'Introduction and hook to grab attention',
        'Main topic overview and why it matters',
        'Key point 1: Core concept explanation',
        'Key point 2: Practical examples',
        'Key point 3: Common challenges and solutions',
        'Tips and best practices',
        'Conclusion and call to action'
      ];
    }

    return NextResponse.json({
      recommendations: fallbackRecommendations,
      success: true,
      fallback: true
    });
  }
}