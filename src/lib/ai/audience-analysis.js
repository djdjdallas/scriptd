import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeChannelWithAI(channelData, recentVideos, transcripts = []) {
  try {
    // Prepare context about the channel
    const channelContext = {
      title: channelData.snippet.title,
      description: channelData.snippet.description,
      subscriberCount: channelData.statistics.subscriberCount,
      viewCount: channelData.statistics.viewCount,
      videoCount: channelData.statistics.videoCount,
      country: channelData.snippet.country,
      publishedAt: channelData.snippet.publishedAt,
    };

    // Prepare video data
    const videoSummaries = recentVideos.slice(0, 20).map(video => ({
      title: video.snippet.title,
      description: video.snippet.description?.slice(0, 500),
      views: video.statistics?.viewCount,
      likes: video.statistics?.likeCount,
      comments: video.statistics?.commentCount,
      duration: video.contentDetails?.duration,
      publishedAt: video.snippet.publishedAt,
      tags: video.snippet.tags?.slice(0, 10),
    }));

    // Include transcript samples if available
    const transcriptSamples = transcripts.slice(0, 5).map(t => 
      t.text?.slice(0, 1000)
    ).filter(Boolean);

    const prompt = `Analyze this YouTube channel and provide a detailed audience analysis.

Channel Information:
${JSON.stringify(channelContext, null, 2)}

Recent Videos (${videoSummaries.length} analyzed):
${JSON.stringify(videoSummaries, null, 2)}

${transcriptSamples.length > 0 ? `Sample Transcripts:
${transcriptSamples.join('\n\n---\n\n')}` : ''}

Based on this data, provide a comprehensive analysis in the following JSON format:
{
  "audiencePersona": "A detailed 3-4 sentence description of the target audience including demographics, interests, and viewing behaviors",
  "demographics": {
    "primaryAgeRange": "e.g., 18-34",
    "genderDistribution": "e.g., 60% male, 40% female",
    "geographicLocation": "Primary regions/countries",
    "educationLevel": "Estimated education level",
    "incomeLevel": "Estimated income bracket"
  },
  "psychographics": {
    "coreValues": ["List of 3-5 core values"],
    "interests": ["List of 5-7 specific interests"],
    "painPoints": ["List of 3-5 pain points or challenges"],
    "aspirations": ["List of 3-5 aspirations or goals"],
    "personality": "Brief personality description"
  },
  "viewingBehavior": {
    "watchTime": "Estimated average watch session",
    "frequency": "How often they watch",
    "preferredContentLength": "Short/Medium/Long form preference",
    "engagementStyle": "How they interact with content",
    "discoveryMethod": "How they find content"
  },
  "contentPreferences": {
    "topics": ["Top 5 preferred topics"],
    "formats": ["Preferred video formats"],
    "tone": "Preferred content tone",
    "pacing": "Preferred video pacing"
  },
  "communityProfile": {
    "communitySize": "Small/Medium/Large",
    "communityEngagement": "Low/Medium/High",
    "communityType": "Educational/Entertainment/Lifestyle/etc",
    "loyaltyLevel": "Casual/Regular/Dedicated/Superfan"
  },
  "insights": {
    "strengths": ["3-5 channel strengths"],
    "opportunities": ["3-5 growth opportunities"],
    "contentGaps": ["2-3 content gaps to fill"],
    "audienceNeeds": ["3-4 unmet audience needs"]
  },
  "recommendations": {
    "contentStrategy": ["3-4 strategic recommendations"],
    "engagementTactics": ["2-3 engagement improvements"],
    "growthOpportunities": ["2-3 growth strategies"]
  }
}

Provide thoughtful, specific analysis based on the actual channel data. Be detailed and insightful.`;

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

    // Parse the AI response
    const content = response.content[0].text;
    
    // Extract JSON from the response - try to find the most complete JSON object
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
      model: 'claude-3-5-haiku-20241022'
    };

  } catch (error) {
    console.error('AI Analysis Error:', error);
    
    // Fallback to basic analysis if AI fails
    return {
      success: false,
      error: error.message,
      fallback: true,
      analysis: generateFallbackAnalysis(channelData, recentVideos)
    };
  }
}

function generateFallbackAnalysis(channelData, recentVideos) {
  // Basic fallback analysis when AI is unavailable
  const avgViews = recentVideos.reduce((sum, v) => 
    sum + (parseInt(v.statistics?.viewCount) || 0), 0) / recentVideos.length;
  
  const avgEngagement = recentVideos.reduce((sum, v) => {
    const views = parseInt(v.statistics?.viewCount) || 1;
    const likes = parseInt(v.statistics?.likeCount) || 0;
    const comments = parseInt(v.statistics?.commentCount) || 0;
    return sum + ((likes + comments) / views * 100);
  }, 0) / recentVideos.length;

  return {
    audiencePersona: `The audience for ${channelData.snippet.title} consists of viewers interested in the channel's content. With ${channelData.statistics.subscriberCount} subscribers and an average of ${Math.round(avgViews).toLocaleString()} views per video, the community shows ${avgEngagement > 3 ? 'strong' : 'moderate'} engagement.`,
    demographics: {
      primaryAgeRange: "18-34",
      genderDistribution: "Mixed audience",
      geographicLocation: "Global, primarily English-speaking",
      educationLevel: "Varied",
      incomeLevel: "Middle income"
    },
    psychographics: {
      coreValues: ["Learning", "Entertainment", "Community"],
      interests: ["Online content", "Digital media"],
      painPoints: ["Finding quality content"],
      aspirations: ["Personal growth", "Entertainment"],
      personality: "Curious and engaged"
    },
    viewingBehavior: {
      watchTime: "10-20 minutes",
      frequency: "Weekly",
      preferredContentLength: "Medium",
      engagementStyle: avgEngagement > 3 ? "Active" : "Passive",
      discoveryMethod: "Subscriptions and recommendations"
    },
    contentPreferences: {
      topics: ["Channel-specific content"],
      formats: ["Standard YouTube videos"],
      tone: "Informative",
      pacing: "Moderate"
    },
    communityProfile: {
      communitySize: parseInt(channelData.statistics.subscriberCount) > 100000 ? "Large" : "Medium",
      communityEngagement: avgEngagement > 3 ? "High" : "Medium",
      communityType: "Mixed",
      loyaltyLevel: "Regular"
    },
    insights: {
      strengths: ["Established audience", "Regular content"],
      opportunities: ["Increase engagement", "Expand reach"],
      contentGaps: ["More variety", "Different formats"],
      audienceNeeds: ["Consistent uploads", "Community interaction"]
    },
    recommendations: {
      contentStrategy: ["Maintain consistency", "Experiment with formats"],
      engagementTactics: ["Respond to comments", "Create community posts"],
      growthOpportunities: ["Collaborate with others", "Optimize SEO"]
    }
  };
}

export default {
  analyzeChannelWithAI
};