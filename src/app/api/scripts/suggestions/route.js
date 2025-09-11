// AI-Powered Key Point Suggestions API
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { getAIService } from '@/lib/ai';
import { AI_MODELS } from '@/lib/constants';

// POST /api/scripts/suggestions
export const POST = createApiHandler(async (req) => {
  // Check authentication
  const { user } = await getAuthenticatedUser();
  
  const body = await req.json();
  const { title, type = 'educational', targetAudience = 'general', existingPoints = [] } = body;
  
  if (!title || title.trim().length < 3) {
    throw new ApiError('Title must be at least 3 characters long', 400);
  }
  
  try {
    // Use Claude for generating intelligent suggestions
    const ai = getAIService(AI_MODELS.CLAUDE_3_HAIKU); // Use Haiku for fast, affordable suggestions
    
    const systemPrompt = `You are an expert YouTube content strategist who creates compelling, SEO-optimized video scripts. You understand what makes videos go viral and what keeps viewers engaged.`;
    
    const userPrompt = `Generate 8-10 highly specific, engaging key points for a YouTube ${type} video titled: "${title}"
    
Target Audience: ${targetAudience}

${existingPoints.length > 0 ? `Already included points (generate different ones):
${existingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}

Requirements for each key point:
1. Be SPECIFIC and actionable (not generic)
2. Include concrete details, numbers, or examples when possible
3. Focus on what viewers will learn or gain
4. Use engaging, curiosity-driven language
5. Each point should be 10-20 words
6. Cover different aspects of the topic
7. Order them logically from foundational to advanced
8. Include at least one controversial or surprising angle
9. Add practical tips and real-world applications
10. Consider SEO keywords naturally

Format your response as a JSON array of strings, nothing else:
["point 1", "point 2", "point 3", ...]

Examples of GOOD key points:
- "Step-by-step breakdown of the $0 to $10k/month framework"
- "The #1 mistake beginners make (and how to avoid it)"
- "Real case study: How Sarah gained 100k subscribers in 60 days"
- "Secret algorithm hack that 99% of creators don't know"

Examples of BAD key points (too generic):
- "Introduction to the topic"
- "Benefits and features"
- "Tips and tricks"
- "Conclusion and summary"`;

    // Generate suggestions using AI
    const response = await ai.generateCompletion({
      prompt: userPrompt,
      system: systemPrompt,
      model: AI_MODELS.CLAUDE_3_HAIKU,
      maxTokens: 500,
      temperature: 0.8
    });
    
    // Parse the response
    let suggestions = [];
    try {
      // Extract JSON array from the response
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines if not JSON
        suggestions = response.text
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-•*\d.)\s]+/, '').trim())
          .filter(line => line.length > 5 && line.length < 100)
          .slice(0, 10);
      }
    } catch (parseError) {
      console.error('Failed to parse AI suggestions:', parseError);
      // Fallback to line-by-line parsing
      suggestions = response.text
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[-•*\d.)\s]+/, '').trim())
        .filter(line => line.length > 5 && line.length < 100)
        .slice(0, 10);
    }
    
    // Ensure we have valid suggestions
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('Failed to generate suggestions');
    }
    
    // Filter out any existing points
    const filteredSuggestions = suggestions.filter(
      suggestion => !existingPoints.some(
        existing => existing.toLowerCase().includes(suggestion.toLowerCase().slice(0, 20))
      )
    );
    
    // Add metadata about why these suggestions are good
    const enhancedSuggestions = filteredSuggestions.map(suggestion => ({
      text: suggestion,
      reason: getReasonForSuggestion(suggestion, title, type)
    }));
    
    return NextResponse.json({
      suggestions: enhancedSuggestions.slice(0, 8),
      metadata: {
        title,
        type,
        targetAudience,
        generatedBy: 'AI',
        model: AI_MODELS.CLAUDE_3_HAIKU
      }
    });
    
  } catch (error) {
    console.error('Suggestion generation error:', error);
    
    // Fallback to smart template-based suggestions if AI fails
    const fallbackSuggestions = generateSmartFallbackSuggestions(title, type, targetAudience);
    
    return NextResponse.json({
      suggestions: fallbackSuggestions,
      metadata: {
        title,
        type,
        targetAudience,
        generatedBy: 'template',
        fallback: true
      }
    });
  }
});

// Helper function to explain why a suggestion is good
function getReasonForSuggestion(suggestion, title, type) {
  const lowerSuggestion = suggestion.toLowerCase();
  
  if (lowerSuggestion.includes('mistake') || lowerSuggestion.includes('avoid')) {
    return 'Addresses common pain points';
  }
  if (lowerSuggestion.includes('step') || lowerSuggestion.includes('how')) {
    return 'Provides actionable guidance';
  }
  if (lowerSuggestion.includes('case study') || lowerSuggestion.includes('example')) {
    return 'Uses real-world examples';
  }
  if (lowerSuggestion.includes('secret') || lowerSuggestion.includes('hack')) {
    return 'Creates curiosity gap';
  }
  if (/\d+/.test(suggestion)) {
    return 'Uses specific numbers';
  }
  if (lowerSuggestion.includes('vs') || lowerSuggestion.includes('comparison')) {
    return 'Helps viewers choose';
  }
  if (lowerSuggestion.includes('tool') || lowerSuggestion.includes('resource')) {
    return 'Provides practical resources';
  }
  
  return 'Covers important aspect';
}

// Smart fallback suggestions based on video type and title analysis
function generateSmartFallbackSuggestions(title, type, targetAudience) {
  const titleWords = title.toLowerCase().split(' ');
  const suggestions = [];
  
  // Analyze title for keywords
  const isHowTo = titleWords.some(w => ['how', 'guide', 'tutorial'].includes(w));
  const isList = /\d+/.test(title) || titleWords.some(w => ['best', 'top', 'worst'].includes(w));
  const isComparison = titleWords.includes('vs') || titleWords.includes('versus');
  const isBeginner = titleWords.some(w => ['beginner', 'start', 'first', 'basic'].includes(w));
  const isAdvanced = titleWords.some(w => ['advanced', 'pro', 'expert', 'master'].includes(w));
  
  // Type-specific suggestions
  if (type === 'tutorial' || isHowTo) {
    suggestions.push(
      `Prerequisites and tools needed for ${extractMainTopic(title)}`,
      `Step-by-step walkthrough with visual demonstrations`,
      `Common mistakes to avoid when ${extractAction(title)}`,
      `Pro tips to get better results faster`,
      `Troubleshooting guide for common issues`,
      `Real-world project example from start to finish`
    );
  } else if (type === 'review' || isComparison) {
    suggestions.push(
      `Detailed pros and cons analysis with real usage examples`,
      `Price comparison and value for money breakdown`,
      `Best use cases and who should buy/use this`,
      `Alternatives comparison with feature matrix`,
      `Long-term usage review (30+ days experience)`,
      `Hidden costs and limitations not mentioned elsewhere`
    );
  } else if (type === 'educational' || isList) {
    suggestions.push(
      `Scientific research and data behind ${extractMainTopic(title)}`,
      `Real case studies with measurable results`,
      `Expert opinions and industry insights`,
      `Practical applications you can implement today`,
      `Common misconceptions debunked with evidence`,
      `Future trends and what's coming next`
    );
  } else if (type === 'entertainment') {
    suggestions.push(
      `Behind-the-scenes stories and exclusive details`,
      `Surprising facts that will blow your mind`,
      `Community reactions and viral moments`,
      `Predictions and theories with evidence`,
      `Exclusive interviews or insider information`,
      `Interactive challenges for viewers to try`
    );
  } else {
    // Generic but smart suggestions
    suggestions.push(
      `The psychology behind ${extractMainTopic(title)}`,
      `Data-driven analysis with surprising statistics`,
      `Expert breakdown of key concepts`,
      `Practical examples from real scenarios`,
      `Tools and resources to get started`,
      `Action plan with timeline and milestones`
    );
  }
  
  // Audience-specific additions
  if (targetAudience.includes('developer') || targetAudience.includes('technical')) {
    suggestions.push(
      `Code examples and implementation details`,
      `Performance benchmarks and optimization tips`
    );
  } else if (targetAudience.includes('business')) {
    suggestions.push(
      `ROI analysis and business case examples`,
      `Implementation strategy for teams`
    );
  } else if (targetAudience.includes('beginner') || isBeginner) {
    suggestions.push(
      `Simplified explanation with analogies`,
      `Beginner-friendly resources and next steps`
    );
  }
  
  // Add trending/viral elements
  suggestions.push(
    `The #1 thing nobody tells you about ${extractMainTopic(title)}`,
    `Why 90% of people fail at this (and how to be in the 10%)`
  );
  
  return suggestions.slice(0, 8).map(text => ({
    text,
    reason: getReasonForSuggestion(text, title, type)
  }));
}

// Extract main topic from title
function extractMainTopic(title) {
  // Remove common words and return the core topic
  const stopWords = ['how', 'to', 'the', 'best', 'top', 'ultimate', 'guide', 'tutorial', 'for', 'in', 'with'];
  const words = title.toLowerCase().split(' ').filter(w => !stopWords.includes(w));
  return words.slice(0, 3).join(' ') || title.toLowerCase();
}

// Extract action from title
function extractAction(title) {
  const lower = title.toLowerCase();
  if (lower.includes('how to')) {
    return lower.split('how to')[1]?.trim() || 'doing this';
  }
  return 'implementing this';
}

export default { POST };