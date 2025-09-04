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

  // Get base metrics
  const subCount = analytics.channel.subscriberCount;
  const viewCount = analytics.channel.totalViews;
  const videoCount = analytics.channel.videoCount;
  const avgViews = analytics.performance.avgViewsPerVideo;
  const engagementRate = parseFloat(analytics.performance.avgEngagementRate);

  // Calculate Performance Score (0-100) - similar to channel-metrics.js
  let performancePoints = 0;
  
  // Views per video score (max 40 points)
  if (avgViews > 10000) performancePoints += 40;
  else if (avgViews > 5000) performancePoints += 35;
  else if (avgViews > 1000) performancePoints += 30;
  else if (avgViews > 500) performancePoints += 25;
  else if (avgViews > 100) performancePoints += 20;
  else performancePoints += Math.min(15, avgViews / 10);
  
  // Engagement score (max 30 points)
  if (engagementRate > 10) performancePoints += 30;
  else if (engagementRate > 5) performancePoints += 25;
  else if (engagementRate > 3) performancePoints += 20;
  else if (engagementRate > 2) performancePoints += 15;
  else if (engagementRate > 1) performancePoints += 10;
  else performancePoints += Math.min(8, engagementRate * 3);
  
  // Channel size score (max 30 points)
  if (subCount > 100000) performancePoints += 30;
  else if (subCount > 10000) performancePoints += 25;
  else if (subCount > 1000) performancePoints += 20;
  else if (subCount > 500) performancePoints += 15;
  else if (subCount > 100) performancePoints += 10;
  else performancePoints += Math.min(8, subCount / 20);
  
  insights.metrics.performanceScore = Math.round(Math.min(100, performancePoints));

  // Calculate Growth Potential (0-100)
  let growthPoints = 0;
  
  // Small channel bonus (max 40 points)
  if (subCount < 100) growthPoints += 40;
  else if (subCount < 500) growthPoints += 35;
  else if (subCount < 1000) growthPoints += 30;
  else if (subCount < 5000) growthPoints += 25;
  else if (subCount < 10000) growthPoints += 20;
  else if (subCount < 50000) growthPoints += 15;
  else if (subCount < 100000) growthPoints += 10;
  else growthPoints += 5;
  
  // Engagement potential (max 30 points)
  const viewToSubRatio = viewCount / Math.max(1, subCount);
  if (viewToSubRatio > 100) growthPoints += 30;
  else if (viewToSubRatio > 50) growthPoints += 25;
  else if (viewToSubRatio > 20) growthPoints += 20;
  else if (viewToSubRatio > 10) growthPoints += 15;
  else if (viewToSubRatio > 5) growthPoints += 10;
  else growthPoints += Math.min(8, viewToSubRatio * 2);
  
  // Content consistency bonus (max 30 points)
  if (videoCount >= 50) growthPoints += 30;
  else if (videoCount >= 25) growthPoints += 25;
  else if (videoCount >= 10) growthPoints += 20;
  else if (videoCount >= 5) growthPoints += 15;
  else growthPoints += Math.min(10, videoCount * 2);
  
  insights.metrics.growthPotential = Math.round(Math.min(100, growthPoints));

  // Calculate Audience Quality (0-100)
  let qualityPoints = 0;
  
  // Engagement quality (max 40 points)
  if (engagementRate > 8) qualityPoints += 40;
  else if (engagementRate > 5) qualityPoints += 32;
  else if (engagementRate > 3) qualityPoints += 25;
  else if (engagementRate > 2) qualityPoints += 18;
  else if (engagementRate > 1) qualityPoints += 12;
  else qualityPoints += Math.min(10, engagementRate * 4);
  
  // Loyalty score contribution (max 30 points)
  qualityPoints += Math.min(30, persona.behavior.loyaltyScore * 0.3);
  
  // View consistency (max 30 points)
  if (subCount > 0) {
    const avgViewsPerSub = viewCount / subCount;
    if (avgViewsPerSub > 50) qualityPoints += 30;
    else if (avgViewsPerSub > 20) qualityPoints += 24;
    else if (avgViewsPerSub > 10) qualityPoints += 18;
    else if (avgViewsPerSub > 5) qualityPoints += 12;
    else if (avgViewsPerSub > 2) qualityPoints += 8;
    else qualityPoints += Math.min(6, avgViewsPerSub * 3);
  }
  
  insights.metrics.audienceQuality = Math.round(Math.min(100, qualityPoints));

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
  
  // Always provide at least 2 strengths
  if (insights.strengths.length === 0) {
    if (analytics.channel.subscriberCount > 100) {
      insights.strengths.push('Established subscriber base');
    }
    if (analytics.channel.videoCount > 10) {
      insights.strengths.push('Consistent content library');
    }
    if (!insights.strengths.length) {
      insights.strengths.push('Growing channel with potential');
    }
  }
  if (insights.strengths.length === 1) {
    insights.strengths.push('Active YouTube presence');
  }

  // Generate opportunities - always provide some suggestions
  if (engagementRate < 2) {
    insights.opportunities.push('Improve audience engagement through CTAs');
  }
  if (avgViews < subCount * 0.05) {
    insights.opportunities.push('Optimize thumbnails and titles for higher CTR');
  }
  if (analytics.analysisMetadata.transcriptsAnalyzed < analytics.analysisMetadata.videosAnalyzed * 0.5) {
    insights.opportunities.push('Add captions/transcripts to improve accessibility');
  }
  
  // Always provide at least 3 opportunities
  if (insights.opportunities.length === 0) {
    insights.opportunities.push('Experiment with trending topics in your niche');
    insights.opportunities.push('Collaborate with other creators for cross-promotion');
    insights.opportunities.push('Create series or playlists to increase watch time');
  } else if (insights.opportunities.length === 1) {
    insights.opportunities.push('Analyze competitor channels for content gaps');
    insights.opportunities.push('Improve video SEO with better descriptions and tags');
  } else if (insights.opportunities.length === 2) {
    insights.opportunities.push('Test different video lengths to find optimal duration');
  }

  // Generate recommendations
  insights.recommendations = [
    ...persona.contentRecommendations.topics.slice(0, 2),
    persona.contentRecommendations.frequency,
    `Focus on ${persona.demographics.contentPreferences[0]} content`,
  ];

  return insights;
}