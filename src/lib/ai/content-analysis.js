import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeContentWithAI(videos, transcripts = []) {
  try {
    // Prepare video data for analysis
    const videoData = videos.slice(0, 30).map(video => ({
      title: video.snippet.title,
      description: video.snippet.description?.slice(0, 500),
      views: video.statistics?.viewCount,
      likes: video.statistics?.likeCount,
      comments: video.statistics?.commentCount,
      duration: video.contentDetails?.duration,
      publishedAt: video.snippet.publishedAt,
      tags: video.snippet.tags?.slice(0, 10),
      categoryId: video.snippet.categoryId,
      transcript: transcripts.find(t => t.videoId === video.id)?.text?.slice(0, 1000)
    }));

    const prompt = `Analyze this YouTube channel's content and provide deep insights on content quality, sentiment, and performance patterns.

Videos Analyzed (${videoData.length}):
${JSON.stringify(videoData, null, 2)}

Provide a comprehensive content analysis in JSON format:
{
  "contentQuality": {
    "overallScore": 0-100,
    "consistency": 0-100,
    "uniqueness": 0-100,
    "productionValue": "Low/Medium/High",
    "storytelling": 0-100,
    "educationalValue": 0-100,
    "entertainmentValue": 0-100,
    "qualityTrend": "Improving/Stable/Declining",
    "strengthAreas": ["List of content strengths"],
    "improvementAreas": ["Areas needing improvement"]
  },
  "sentimentAnalysis": {
    "overallSentiment": "Positive/Neutral/Negative",
    "sentimentScore": -100 to 100,
    "emotionalTone": ["Primary emotions conveyed"],
    "audienceReception": "Excellent/Good/Mixed/Poor",
    "controversialTopics": ["Any controversial subjects"],
    "brandSentiment": "How the channel brand is perceived"
  },
  "contentPatterns": {
    "primaryThemes": ["Top 5 recurring themes"],
    "contentPillars": ["3-4 main content categories"],
    "publishingPattern": "Daily/Weekly/Irregular/etc",
    "optimalLength": "Recommended video duration",
    "bestPerformingFormats": ["Top performing content types"],
    "underperformingFormats": ["Formats to avoid or improve"]
  },
  "performanceInsights": {
    "viralPotential": 0-100,
    "engagementDrivers": ["What drives engagement"],
    "viewDropoffPatterns": "When viewers leave",
    "clickbaitAnalysis": "Use and effectiveness of clickbait",
    "thumbnailStrategy": "Thumbnail approach analysis",
    "titleEffectiveness": 0-100
  },
  "competitivePosition": {
    "nicheSaturation": "Low/Medium/High",
    "uniqueValueProposition": "What makes this channel unique",
    "competitiveAdvantages": ["Channel strengths vs competitors"],
    "marketGaps": ["Opportunities in the niche"],
    "threatAnalysis": ["Competitive threats"]
  },
  "recommendations": {
    "immediate": ["Quick wins to implement now"],
    "shortTerm": ["1-month improvements"],
    "longTerm": ["3-6 month strategic changes"],
    "contentToAvoid": ["Content types to stop"],
    "contentToDouble": ["Successful formats to increase"]
  },
  "predictiveAnalytics": {
    "growthTrajectory": "Rapid/Steady/Slow/Declining",
    "estimatedGrowthRate": "Percentage per month",
    "riskFactors": ["Potential issues ahead"],
    "opportunities": ["Upcoming opportunities"],
    "seasonalConsiderations": ["Seasonal content opportunities"]
  }
}

Be specific, analytical, and actionable in your analysis. Base insights on actual data patterns.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response - no JSON found');
    }

    let analysis;
    try {
      // First attempt: try to parse the matched JSON
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Initial JSON parse failed, attempting to clean JSON:', parseError.message);
      
      // Clean up common JSON issues
      let cleanedJson = jsonMatch[0]
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/'/g, '"')      // Replace single quotes with double quotes
        .replace(/(\w+):/g, '"$1":')  // Quote unquoted keys
        .replace(/:\s*undefined/g, ': null')  // Replace undefined with null
        .replace(/\n\s*\n/g, '\n')  // Remove extra blank lines
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas more aggressively
      
      try {
        analysis = JSON.parse(cleanedJson);
      } catch (secondError) {
        console.error('Cleaned JSON parse also failed:', secondError.message);
        console.error('JSON content (first 500 chars):', cleanedJson.substring(0, 500));
        throw new Error(`Failed to parse AI response: ${secondError.message}`);
      }
    }

    return {
      success: true,
      analysis,
      tokensUsed: response.usage?.total_tokens || 0,
      videosAnalyzed: videoData.length
    };

  } catch (error) {
    console.error('Content Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackContentAnalysis(videos)
    };
  }
}

function generateFallbackContentAnalysis(videos) {
  const avgViews = videos.reduce((sum, v) => 
    sum + (parseInt(v.statistics?.viewCount) || 0), 0) / videos.length;
  
  return {
    contentQuality: {
      overallScore: 70,
      consistency: 75,
      uniqueness: 65,
      productionValue: "Medium",
      storytelling: 70,
      educationalValue: 60,
      entertainmentValue: 70,
      qualityTrend: "Stable",
      strengthAreas: ["Regular uploads", "Engaged audience"],
      improvementAreas: ["Content variety", "Production quality"]
    },
    sentimentAnalysis: {
      overallSentiment: "Positive",
      sentimentScore: 65,
      emotionalTone: ["Informative", "Engaging"],
      audienceReception: "Good",
      controversialTopics: [],
      brandSentiment: "Generally positive"
    },
    contentPatterns: {
      primaryThemes: ["Main content theme"],
      contentPillars: ["Educational", "Entertainment"],
      publishingPattern: "Weekly",
      optimalLength: "10-15 minutes",
      bestPerformingFormats: ["Standard videos"],
      underperformingFormats: []
    },
    performanceInsights: {
      viralPotential: 60,
      engagementDrivers: ["Quality content", "Regular schedule"],
      viewDropoffPatterns: "Normal retention",
      clickbaitAnalysis: "Minimal clickbait usage",
      thumbnailStrategy: "Standard approach",
      titleEffectiveness: 70
    },
    competitivePosition: {
      nicheSaturation: "Medium",
      uniqueValueProposition: "Consistent quality content",
      competitiveAdvantages: ["Established audience"],
      marketGaps: ["More variety needed"],
      threatAnalysis: ["Increasing competition"]
    },
    recommendations: {
      immediate: ["Optimize titles", "Improve thumbnails"],
      shortTerm: ["Increase upload frequency"],
      longTerm: ["Develop content series"],
      contentToAvoid: [],
      contentToDouble: ["Best performing formats"]
    },
    predictiveAnalytics: {
      growthTrajectory: "Steady",
      estimatedGrowthRate: "5-10%",
      riskFactors: ["Content saturation"],
      opportunities: ["Trending topics"],
      seasonalConsiderations: ["Holiday content"]
    }
  };
}

export default {
  analyzeContentWithAI
};