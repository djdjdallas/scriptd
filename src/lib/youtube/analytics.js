import { analyzeVideoContent, extractVideoTopics } from './video.js';

export async function generateChannelAnalytics(channel, videos) {
  const videoAnalysis = await analyzeVideoContent(videos);
  const topicAnalysis = await extractVideoTopics(videos);
  
  const analytics = {
    channel: {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      subscriberCount: parseInt(channel.statistics.subscriberCount || 0),
      totalViews: parseInt(channel.statistics.viewCount || 0),
      videoCount: parseInt(channel.statistics.videoCount || 0),
      publishedAt: channel.snippet.publishedAt,
    },
    performance: {
      avgViewsPerVideo: videoAnalysis.avgViewsPerVideo,
      avgEngagementRate: videoAnalysis.avgEngagementRate,
      totalEngagements: videoAnalysis.totalLikes + videoAnalysis.totalComments,
      viewsToSubscriberRatio: channel.statistics.subscriberCount > 0 
        ? (videoAnalysis.avgViewsPerVideo / parseInt(channel.statistics.subscriberCount) * 100).toFixed(2)
        : 0,
    },
    content: {
      uploadFrequency: videoAnalysis.uploadFrequency,
      contentPatterns: videoAnalysis.contentPatterns,
      contentTypes: topicAnalysis.contentTypes,
      topKeywords: Object.entries(topicAnalysis.keywords).slice(0, 10),
    },
    topVideos: videoAnalysis.topPerformingVideos,
    analysisMetadata: {
      videosAnalyzed: videos.length,
      transcriptsAnalyzed: topicAnalysis.transcriptsAnalyzed,
      analysisDate: new Date().toISOString(),
    },
  };

  return analytics;
}

export async function generateAudiencePersona(analytics) {
  const persona = {
    demographics: {
      estimatedAgeRange: '',
      interests: [],
      contentPreferences: [],
    },
    behavior: {
      viewingPatterns: '',
      engagementLevel: '',
      loyaltyScore: 0,
    },
    psychographics: {
      values: [],
      painPoints: [],
      aspirations: [],
    },
    contentRecommendations: {
      topics: [],
      formats: [],
      frequency: '',
    },
  };

  // Estimate audience based on content patterns
  const { contentTypes, topKeywords } = analytics.content;
  const { avgEngagementRate, viewsToSubscriberRatio } = analytics.performance;

  // Determine engagement level
  if (parseFloat(avgEngagementRate) > 5) {
    persona.behavior.engagementLevel = 'Highly Engaged';
  } else if (parseFloat(avgEngagementRate) > 2) {
    persona.behavior.engagementLevel = 'Moderately Engaged';
  } else {
    persona.behavior.engagementLevel = 'Passive Viewers';
  }

  // Calculate loyalty score (0-100)
  persona.behavior.loyaltyScore = Math.min(100, Math.round(
    (parseFloat(avgEngagementRate) * 10) + 
    (parseFloat(viewsToSubscriberRatio) * 2)
  ));

  // Determine content preferences based on content types
  const sortedContentTypes = Object.entries(contentTypes || {})
    .sort((a, b) => b[1] - a[1]);
  
  persona.demographics.contentPreferences = sortedContentTypes
    .slice(0, 3)
    .map(([type]) => type.charAt(0).toUpperCase() + type.slice(1));

  // Extract interests from keywords
  persona.demographics.interests = topKeywords
    .slice(0, 5)
    .map(([keyword]) => keyword);

  // Viewing patterns based on upload frequency
  const uploadCounts = Object.values(analytics.content.uploadFrequency || {});
  const avgUploadsPerMonth = uploadCounts.length > 0 
    ? uploadCounts.reduce((a, b) => a + b, 0) / uploadCounts.length 
    : 0;

  if (avgUploadsPerMonth > 15) {
    persona.behavior.viewingPatterns = 'Daily viewers expecting frequent content';
  } else if (avgUploadsPerMonth > 4) {
    persona.behavior.viewingPatterns = 'Regular weekly viewers';
  } else {
    persona.behavior.viewingPatterns = 'Occasional viewers for special content';
  }

  // Generate recommendations
  persona.contentRecommendations.topics = topKeywords
    .slice(0, 5)
    .map(([keyword]) => `More content about ${keyword}`);

  persona.contentRecommendations.formats = sortedContentTypes
    .slice(0, 2)
    .map(([type]) => `${type} videos perform well`);

  if (avgUploadsPerMonth > 8) {
    persona.contentRecommendations.frequency = 'Maintain current high frequency';
  } else if (avgUploadsPerMonth > 2) {
    persona.contentRecommendations.frequency = 'Consider increasing to weekly uploads';
  } else {
    persona.contentRecommendations.frequency = 'More consistent upload schedule recommended';
  }

  return persona;
}

export function generateInsights(analytics, persona) {
  const insights = {
    strengths: [],
    opportunities: [],
    recommendations: [],
    metrics: {
      performanceScore: 0,
      growthPotential: 0,
      audienceQuality: 0,
    },
  };

  // Calculate performance score (0-100)
  const subCount = analytics.channel.subscriberCount;
  const avgViews = analytics.performance.avgViewsPerVideo;
  const engagementRate = parseFloat(analytics.performance.avgEngagementRate);

  insights.metrics.performanceScore = Math.min(100, Math.round(
    (Math.log10(avgViews + 1) * 10) +
    (engagementRate * 5) +
    (persona.behavior.loyaltyScore * 0.3)
  ));

  // Calculate growth potential
  insights.metrics.growthPotential = Math.min(100, Math.round(
    (100 - insights.metrics.performanceScore) * 0.5 +
    (engagementRate > 3 ? 30 : 0) +
    (avgViews / subCount > 0.1 ? 20 : 0)
  ));

  // Calculate audience quality
  insights.metrics.audienceQuality = persona.behavior.loyaltyScore;

  // Generate strengths
  if (engagementRate > 3) {
    insights.strengths.push('High audience engagement rate');
  }
  if (avgViews / subCount > 0.1) {
    insights.strengths.push('Strong viewer-to-subscriber conversion');
  }
  if (Object.keys(analytics.content.contentTypes || {}).length > 2) {
    insights.strengths.push('Diverse content portfolio');
  }

  // Generate opportunities
  if (engagementRate < 2) {
    insights.opportunities.push('Improve audience engagement through CTAs');
  }
  if (avgViews < subCount * 0.05) {
    insights.opportunities.push('Optimize thumbnails and titles for higher CTR');
  }
  if (analytics.analysisMetadata.transcriptsAnalyzed < analytics.analysisMetadata.videosAnalyzed * 0.5) {
    insights.opportunities.push('Add captions/transcripts to improve accessibility');
  }

  // Generate recommendations
  insights.recommendations = [
    ...persona.contentRecommendations.topics.slice(0, 2),
    persona.contentRecommendations.frequency,
    `Focus on ${persona.demographics.contentPreferences[0]} content`,
  ];

  return insights;
}