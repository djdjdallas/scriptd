import Anthropic from '@anthropic-ai/sdk';
import { AI_MODELS } from '@/lib/constants';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// YouTube SEO configuration
const SEO_CONFIG = {
  TITLE_MAX_LENGTH: 100,
  TITLE_OPTIMAL_LENGTH: 60,
  DESCRIPTION_MAX_LENGTH: 5000,
  DESCRIPTION_OPTIMAL_LENGTH: 200,
  TAGS_MAX_COUNT: 500,
  TAGS_MAX_LENGTH: 500,
  KEYWORD_DENSITY_RANGE: { min: 1, max: 3 }, // percentage
};

// High-value YouTube keywords by category
const HIGH_VALUE_KEYWORDS = {
  educational: ['tutorial', 'how to', 'guide', 'learn', 'explained', 'step by step'],
  entertainment: ['funny', 'best', 'top', 'amazing', 'incredible', 'must see'],
  gaming: ['gameplay', 'walkthrough', 'tips', 'tricks', 'pro', 'noob'],
  tech: ['review', 'unboxing', 'comparison', 'vs', 'best', 'budget'],
  lifestyle: ['morning routine', 'day in my life', 'haul', 'transformation'],
};

// YouTube algorithm ranking factors
const RANKING_FACTORS = {
  clickThroughRate: 0.3,
  watchTime: 0.25,
  engagement: 0.2,
  relevance: 0.15,
  freshness: 0.1,
};

/**
 * Generate SEO-optimized title for YouTube video
 */
export async function generateOptimizedTitle({
  topic,
  keywords,
  channelNiche,
  competitorTitles = [],
  targetLength = SEO_CONFIG.TITLE_OPTIMAL_LENGTH,
}) {
  const prompt = `Generate an SEO-optimized YouTube video title for the following:
Topic: ${topic}
Channel Niche: ${channelNiche}
Primary Keywords: ${keywords.join(', ')}
Target Length: ${targetLength} characters (max ${SEO_CONFIG.TITLE_MAX_LENGTH})

Competitor Titles for Reference:
${competitorTitles.slice(0, 5).join('\n')}

Requirements:
1. Include primary keyword near the beginning
2. Create curiosity or urgency
3. Use power words and emotional triggers
4. Keep it under ${targetLength} characters
5. Make it click-worthy but not clickbait
6. Use numbers or lists if relevant
7. Consider YouTube search intent

Generate 5 title variations, ranked by SEO potential.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = response.content[0].text;
    const titles = responseText.split('\n').filter(line => line.trim().match(/^\d+\./));
    
    return titles.map(title => ({
      title: title.replace(/^\d+\.\s*/, '').trim(),
      length: title.replace(/^\d+\.\s*/, '').trim().length,
      score: calculateTitleScore(title, keywords),
    }));
  } catch (error) {
    console.error('Error generating optimized title:', error);
    // Fallback to basic title generation
    return [{
      title: `${topic} - ${keywords[0] || channelNiche}`,
      length: topic.length + (keywords[0] || channelNiche).length + 3,
      score: 50
    }];
  }
}

/**
 * Generate SEO-optimized description
 */
export async function generateOptimizedDescription({
  title,
  transcript,
  keywords,
  channelInfo,
  links = [],
  targetLength = SEO_CONFIG.DESCRIPTION_OPTIMAL_LENGTH,
}) {
  const prompt = `Generate an SEO-optimized YouTube video description:
Title: ${title}
Keywords: ${keywords.join(', ')}
Channel Info: ${channelInfo}
Target Length: First ${targetLength} characters should contain the most important info

Transcript Summary: ${transcript ? transcript.slice(0, 500) : 'Not available'}

Requirements:
1. Front-load primary keywords in first 125 characters
2. Include a compelling hook in the first line
3. Add timestamps section if relevant
4. Include relevant hashtags (3-5)
5. Natural keyword placement (1-3% density)
6. Include call-to-action
7. Format for readability with line breaks
8. Add social media links section

Generate an optimized description.`;

  try {
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

    const description = response.content[0].text;
    
    // Add links if provided
    const linksSection = links.length > 0 
      ? `\n\n📱 CONNECT WITH ME:\n${links.join('\n')}`
      : '';
    
    return {
      description: description + linksSection,
      length: description.length,
      keywordDensity: calculateKeywordDensity(description, keywords),
    };
  } catch (error) {
    console.error('Error generating optimized description:', error);
    // Fallback to basic description
    return {
      description: `${title}\n\nKeywords: ${keywords.join(', ')}\n\n${channelInfo}`,
      length: 100,
      keywordDensity: 1
    };
  }
}

/**
 * Generate relevant tags for YouTube video
 */
export async function generateOptimizedTags({
  title,
  description,
  primaryKeywords,
  competitorTags = [],
  maxTags = 30,
}) {
  const prompt = `Generate YouTube tags for maximum discoverability:
Title: ${title}
Description: ${description?.slice(0, 200)}
Primary Keywords: ${primaryKeywords.join(', ')}

Competitor Tags for Reference:
${competitorTags.slice(0, 20).join(', ')}

Requirements:
1. Include exact primary keywords
2. Add long-tail variations
3. Include misspellings of difficult words
4. Add related search terms
5. Mix broad and specific tags
6. Include trending variations
7. Maximum ${maxTags} tags
8. Order by importance

Generate a comma-separated list of tags.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const tagsText = response.content[0].text;
    const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    return {
      tags: tags.slice(0, maxTags),
      totalLength: tags.join(',').length,
      count: Math.min(tags.length, maxTags),
    };
  } catch (error) {
    console.error('Error generating optimized tags:', error);
    // Fallback to basic tags
    return {
      tags: primaryKeywords,
      totalLength: primaryKeywords.join(',').length,
      count: primaryKeywords.length
    };
  }
}

/**
 * Calculate title SEO score
 */
function calculateTitleScore(title, keywords) {
  let score = 50; // Base score
  
  // Check keyword placement
  const titleLower = title.toLowerCase();
  keywords.forEach((keyword, index) => {
    if (titleLower.includes(keyword.toLowerCase())) {
      score += index === 0 ? 20 : 10; // Primary keyword worth more
      
      // Bonus for keyword at beginning
      if (titleLower.indexOf(keyword.toLowerCase()) < 20) {
        score += 10;
      }
    }
  });
  
  // Check length
  const length = title.length;
  if (length >= 50 && length <= 60) {
    score += 10; // Optimal length
  } else if (length > 60 && length <= 70) {
    score += 5; // Acceptable length
  }
  
  // Check for power words
  const powerWords = ['how', 'best', 'guide', 'tips', 'top', 'ultimate', 'complete'];
  powerWords.forEach(word => {
    if (titleLower.includes(word)) {
      score += 5;
    }
  });
  
  // Check for numbers
  if (/\d+/.test(title)) {
    score += 5;
  }
  
  return Math.min(score, 100); // Cap at 100
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(text, keywords) {
  const words = text.toLowerCase().split(/\s+/);
  let keywordCount = 0;
  
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    keywordCount += words.filter(word => word.includes(keywordLower)).length;
  });
  
  const density = (keywordCount / words.length) * 100;
  return Math.round(density * 10) / 10; // Round to 1 decimal
}

/**
 * Analyze competitor content for SEO insights
 */
export async function analyzeCompetitorSEO(competitorVideos) {
  const insights = {
    commonKeywords: {},
    averageTitleLength: 0,
    averageDescriptionLength: 0,
    commonTags: {},
    titlePatterns: [],
  };
  
  competitorVideos.forEach(video => {
    // Analyze title
    if (video.title) {
      insights.averageTitleLength += video.title.length;
      
      // Extract patterns (numbers, brackets, etc.)
      if (/^\d+/.test(video.title)) {
        insights.titlePatterns.push('starts-with-number');
      }
      if (/\[.*\]/.test(video.title)) {
        insights.titlePatterns.push('uses-brackets');
      }
    }
    
    // Analyze description
    if (video.description) {
      insights.averageDescriptionLength += video.description.length;
    }
    
    // Analyze tags
    if (video.tags) {
      video.tags.forEach(tag => {
        insights.commonTags[tag] = (insights.commonTags[tag] || 0) + 1;
      });
    }
  });
  
  // Calculate averages
  const videoCount = competitorVideos.length || 1;
  insights.averageTitleLength = Math.round(insights.averageTitleLength / videoCount);
  insights.averageDescriptionLength = Math.round(insights.averageDescriptionLength / videoCount);
  
  // Sort common tags
  insights.commonTags = Object.entries(insights.commonTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([tag]) => tag);
  
  return insights;
}

export { SEO_CONFIG, HIGH_VALUE_KEYWORDS, RANKING_FACTORS };