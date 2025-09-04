/**
 * Calculate channel performance metrics based on real data
 */

export function calculateChannelMetrics(channel) {
  const subscriberCount = parseInt(channel.subscriber_count || 0);
  const viewCount = parseInt(channel.view_count || 0);
  const videoCount = parseInt(channel.video_count || 0);
  
  // If we have stored analytics summary, use it
  if (channel.analytics_summary?.performance_score !== undefined) {
    return {
      performanceScore: channel.analytics_summary.performance_score,
      growthPotential: channel.analytics_summary.growth_potential,
      audienceQuality: channel.analytics_summary.audience_quality
    };
  }
  
  // Otherwise, calculate based on available data
  const metrics = {
    performanceScore: 0,
    growthPotential: 0,
    audienceQuality: 0
  };
  
  // Performance Score Calculation (0-100)
  // Based on: views per video, subscriber to video ratio, overall reach
  if (videoCount > 0) {
    const avgViewsPerVideo = viewCount / videoCount;
    const subscriberVideoRatio = subscriberCount / videoCount;
    
    // Score components
    let performancePoints = 0;
    
    // Views per video score (max 40 points)
    if (avgViewsPerVideo > 10000) performancePoints += 40;
    else if (avgViewsPerVideo > 5000) performancePoints += 35;
    else if (avgViewsPerVideo > 1000) performancePoints += 30;
    else if (avgViewsPerVideo > 500) performancePoints += 25;
    else if (avgViewsPerVideo > 100) performancePoints += 20;
    else performancePoints += Math.min(15, avgViewsPerVideo / 10);
    
    // Subscriber efficiency (max 30 points)
    if (subscriberVideoRatio > 1000) performancePoints += 30;
    else if (subscriberVideoRatio > 500) performancePoints += 25;
    else if (subscriberVideoRatio > 100) performancePoints += 20;
    else if (subscriberVideoRatio > 50) performancePoints += 15;
    else if (subscriberVideoRatio > 10) performancePoints += 10;
    else performancePoints += Math.min(8, subscriberVideoRatio);
    
    // Overall reach score (max 30 points)
    if (subscriberCount > 100000) performancePoints += 30;
    else if (subscriberCount > 10000) performancePoints += 25;
    else if (subscriberCount > 1000) performancePoints += 20;
    else if (subscriberCount > 500) performancePoints += 15;
    else if (subscriberCount > 100) performancePoints += 10;
    else performancePoints += Math.min(8, subscriberCount / 20);
    
    metrics.performanceScore = Math.round(Math.min(100, performancePoints));
  }
  
  // Growth Potential Calculation (0-100)
  // Higher for smaller channels with good engagement
  let growthPoints = 0;
  
  // Small channel bonus (max 40 points)
  if (subscriberCount < 100) growthPoints += 40;
  else if (subscriberCount < 500) growthPoints += 35;
  else if (subscriberCount < 1000) growthPoints += 30;
  else if (subscriberCount < 5000) growthPoints += 25;
  else if (subscriberCount < 10000) growthPoints += 20;
  else if (subscriberCount < 50000) growthPoints += 15;
  else if (subscriberCount < 100000) growthPoints += 10;
  else growthPoints += 5;
  
  // Engagement potential (max 30 points)
  if (videoCount > 0) {
    const viewToSubRatio = viewCount / Math.max(1, subscriberCount);
    if (viewToSubRatio > 100) growthPoints += 30;
    else if (viewToSubRatio > 50) growthPoints += 25;
    else if (viewToSubRatio > 20) growthPoints += 20;
    else if (viewToSubRatio > 10) growthPoints += 15;
    else if (viewToSubRatio > 5) growthPoints += 10;
    else growthPoints += Math.min(8, viewToSubRatio * 2);
  }
  
  // Content consistency bonus (max 30 points)
  if (videoCount >= 50) growthPoints += 30;
  else if (videoCount >= 25) growthPoints += 25;
  else if (videoCount >= 10) growthPoints += 20;
  else if (videoCount >= 5) growthPoints += 15;
  else growthPoints += Math.min(10, videoCount * 2);
  
  metrics.growthPotential = Math.round(Math.min(100, growthPoints));
  
  // Audience Quality Calculation (0-100)
  // Based on engagement metrics and viewer loyalty
  let qualityPoints = 0;
  
  // View to subscriber ratio (max 50 points)
  if (subscriberCount > 0) {
    const avgViewsPerSub = viewCount / subscriberCount;
    if (avgViewsPerSub > 50) qualityPoints += 50;
    else if (avgViewsPerSub > 20) qualityPoints += 40;
    else if (avgViewsPerSub > 10) qualityPoints += 30;
    else if (avgViewsPerSub > 5) qualityPoints += 20;
    else if (avgViewsPerSub > 2) qualityPoints += 15;
    else qualityPoints += Math.min(10, avgViewsPerSub * 5);
  }
  
  // Subscriber base quality (max 30 points)
  if (subscriberCount > 0 && videoCount > 0) {
    const subsPerVideo = subscriberCount / videoCount;
    if (subsPerVideo > 500) qualityPoints += 30;
    else if (subsPerVideo > 200) qualityPoints += 25;
    else if (subsPerVideo > 100) qualityPoints += 20;
    else if (subsPerVideo > 50) qualityPoints += 15;
    else if (subsPerVideo > 20) qualityPoints += 10;
    else qualityPoints += Math.min(8, subsPerVideo / 3);
  }
  
  // Engagement baseline (max 20 points)
  // Give some points for active channels
  if (videoCount > 20 && viewCount > 1000) qualityPoints += 20;
  else if (videoCount > 10 && viewCount > 500) qualityPoints += 15;
  else if (videoCount > 5 && viewCount > 100) qualityPoints += 10;
  else if (videoCount > 0 && viewCount > 0) qualityPoints += 5;
  
  metrics.audienceQuality = Math.round(Math.min(100, qualityPoints));
  
  return metrics;
}

/**
 * Get performance level description
 */
export function getPerformanceLevel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 45) return 'Average';
  if (score >= 30) return 'Below Average';
  return 'Needs Improvement';
}

/**
 * Get growth potential description
 */
export function getGrowthPotentialLevel(score) {
  if (score >= 90) return 'Exceptional';
  if (score >= 75) return 'High';
  if (score >= 60) return 'Strong';
  if (score >= 45) return 'Moderate';
  if (score >= 30) return 'Limited';
  return 'Low';
}

/**
 * Get audience quality description
 */
export function getAudienceQualityLevel(score) {
  if (score >= 90) return 'Highly Engaged';
  if (score >= 75) return 'Very Engaged';
  if (score >= 60) return 'Engaged';
  if (score >= 45) return 'Moderately Engaged';
  if (score >= 30) return 'Low Engagement';
  return 'Needs Attention';
}