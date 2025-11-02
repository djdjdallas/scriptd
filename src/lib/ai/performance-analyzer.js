/**
 * Performance Analysis Utilities
 * Correlates video performance metrics with voice patterns
 */

/**
 * Analyze video performance and categorize videos
 */
export function analyzeVideoPerformance(videos) {
  if (!videos || videos.length === 0) {
    return {
      hasData: false,
      metrics: {}
    };
  }

  // Extract view counts and basic metrics
  const videoMetrics = videos.map(video => {
    const views = parseInt(video.statistics?.viewCount || 0);
    const likes = parseInt(video.statistics?.likeCount || 0);
    const comments = parseInt(video.statistics?.commentCount || 0);
    const publishedAt = new Date(video.snippet?.publishedAt);
    const daysSincePublish = Math.max(1, (Date.now() - publishedAt) / (1000 * 60 * 60 * 24));

    return {
      id: video.id,
      title: video.snippet?.title || '',
      description: video.snippet?.description || '',
      views,
      likes,
      comments,
      engagement: views > 0 ? ((likes + comments) / views) : 0,
      velocity: views / daysSincePublish,  // Views per day
      publishedAt,
      daysSincePublish,
      duration: parseDuration(video.contentDetails?.duration)
    };
  });

  // Calculate percentiles for categorization
  const viewCounts = videoMetrics.map(v => v.views).sort((a, b) => a - b);
  const percentile75 = getPercentile(viewCounts, 75);
  const percentile25 = getPercentile(viewCounts, 25);
  const median = getPercentile(viewCounts, 50);

  // Categorize videos by performance
  const highPerformers = videoMetrics.filter(v => v.views >= percentile75);
  const lowPerformers = videoMetrics.filter(v => v.views <= percentile25);
  const averagePerformers = videoMetrics.filter(v => v.views > percentile25 && v.views < percentile75);

  // Calculate average metrics for each category
  const analysis = {
    hasData: true,
    sampleSize: videos.length,
    overall: {
      avgViews: calculateAverage(videoMetrics.map(v => v.views)),
      medianViews: median,
      avgEngagement: calculateAverage(videoMetrics.map(v => v.engagement)),
      avgVelocity: calculateAverage(videoMetrics.map(v => v.velocity))
    },
    highPerformers: {
      count: highPerformers.length,
      avgViews: calculateAverage(highPerformers.map(v => v.views)),
      avgEngagement: calculateAverage(highPerformers.map(v => v.engagement)),
      avgVelocity: calculateAverage(highPerformers.map(v => v.velocity)),
      avgDuration: calculateAverage(highPerformers.map(v => v.duration)),
      videos: highPerformers.slice(0, 5).map(v => ({
        id: v.id,
        title: v.title,
        views: v.views,
        engagement: Math.round(v.engagement * 10000) / 100  // Convert to percentage
      }))
    },
    lowPerformers: {
      count: lowPerformers.length,
      avgViews: calculateAverage(lowPerformers.map(v => v.views)),
      avgEngagement: calculateAverage(lowPerformers.map(v => v.engagement)),
      avgVelocity: calculateAverage(lowPerformers.map(v => v.velocity)),
      avgDuration: calculateAverage(lowPerformers.map(v => v.duration)),
      videos: lowPerformers.slice(0, 5).map(v => ({
        id: v.id,
        title: v.title,
        views: v.views,
        engagement: Math.round(v.engagement * 10000) / 100
      }))
    },
    thresholds: {
      high: percentile75,
      median: median,
      low: percentile25
    }
  };

  return analysis;
}

/**
 * Correlate voice patterns with performance metrics
 */
export function correlateVoiceWithPerformance(voiceProfile, performanceAnalysis, transcripts) {
  if (!performanceAnalysis.hasData || !voiceProfile) {
    return {
      hasCorrelation: false,
      recommendations: []
    };
  }

  const correlations = {
    hasCorrelation: true,
    patterns: {},
    recommendations: [],
    insights: []
  };

  // Analyze high vs low performer patterns
  const { highPerformers, lowPerformers } = performanceAnalysis;

  // Hook pattern correlation
  if (voiceProfile.hooks) {
    const hookTypes = identifyHookTypes(voiceProfile.hooks);
    correlations.patterns.hooks = {
      type: hookTypes,
      performanceImpact: highPerformers.avgViews > lowPerformers.avgViews * 1.5 ? 'positive' : 'neutral',
      recommendation: generateHookRecommendation(hookTypes, performanceAnalysis)
    };
  }

  // Pacing correlation
  if (voiceProfile.pace) {
    const paceScore = getPaceScore(voiceProfile.pace);
    const durationDiff = highPerformers.avgDuration - lowPerformers.avgDuration;

    correlations.patterns.pacing = {
      currentPace: voiceProfile.pace,
      optimalDuration: highPerformers.avgDuration,
      durationCorrelation: durationDiff > 60 ? 'longer_performs_better' :
                          durationDiff < -60 ? 'shorter_performs_better' :
                          'no_clear_correlation',
      recommendation: generatePacingRecommendation(paceScore, durationDiff)
    };
  }

  // Energy level correlation
  if (voiceProfile.energy) {
    const energyScore = getEnergyScore(voiceProfile.energy);
    const engagementDiff = highPerformers.avgEngagement - lowPerformers.avgEngagement;

    correlations.patterns.energy = {
      currentEnergy: voiceProfile.energy,
      engagementCorrelation: engagementDiff > 0.01 ? 'higher_engagement' :
                            engagementDiff < -0.01 ? 'lower_engagement' :
                            'neutral',
      recommendation: generateEnergyRecommendation(energyScore, engagementDiff)
    };
  }

  // Title pattern analysis (if we have transcript titles)
  const titlePatterns = analyzeTitlePatterns(performanceAnalysis);
  if (titlePatterns.hasPatterns) {
    correlations.patterns.titles = titlePatterns;
  }

  // Generate overall recommendations
  correlations.recommendations = generateOverallRecommendations(correlations.patterns, performanceAnalysis);

  // Add performance-based insights
  correlations.insights = generateInsights(performanceAnalysis, voiceProfile);

  return correlations;
}

/**
 * Extract patterns from high-performing content
 */
export function extractHighPerformerPatterns(videos, transcripts) {
  const patterns = {
    openings: [],
    hooks: [],
    structuralElements: [],
    commonPhrases: []
  };

  // This would need actual transcript analysis
  // For now, we analyze titles and descriptions
  videos.forEach(video => {
    // Analyze title patterns
    if (video.title) {
      const titleWords = video.title.toLowerCase().split(/\s+/);

      // Check for number hooks
      if (/\d+/.test(video.title)) {
        patterns.hooks.push('numbers_in_title');
      }

      // Check for question hooks
      if (video.title.includes('?')) {
        patterns.hooks.push('question_in_title');
      }

      // Check for power words
      const powerWords = ['secret', 'revealed', 'truth', 'shocking', 'amazing', 'incredible'];
      if (powerWords.some(word => titleWords.includes(word))) {
        patterns.hooks.push('power_words');
      }
    }
  });

  // Count pattern frequencies
  patterns.hooks = countFrequencies(patterns.hooks);

  return patterns;
}

// Helper Functions

function getPercentile(sortedArray, percentile) {
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)] || 0;
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
}

function parseDuration(duration) {
  // Parse ISO 8601 duration to seconds
  if (!duration) return 0;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

function identifyHookTypes(hooks) {
  const hookString = typeof hooks === 'string' ? hooks.toLowerCase() : '';
  const types = [];

  if (hookString.includes('statistic') || hookString.includes('number')) {
    types.push('statistical');
  }
  if (hookString.includes('question') || hookString.includes('curious')) {
    types.push('curiosity');
  }
  if (hookString.includes('shock') || hookString.includes('surprising')) {
    types.push('shocking');
  }
  if (hookString.includes('story') || hookString.includes('narrative')) {
    types.push('storytelling');
  }

  return types.length > 0 ? types : ['general'];
}

function getPaceScore(pace) {
  const paceMap = {
    'slow': 1,
    'moderate-slow': 2,
    'moderate': 3,
    'moderate-fast': 4,
    'fast': 5
  };
  return paceMap[pace] || 3;
}

function getEnergyScore(energy) {
  const energyMap = {
    'low': 1,
    'low-medium': 2,
    'medium': 3,
    'medium-high': 4,
    'high': 5
  };
  return energyMap[energy] || 3;
}

function generateHookRecommendation(hookTypes, performance) {
  const ratio = performance.highPerformers.avgViews / performance.lowPerformers.avgViews;

  if (ratio > 3) {
    return `Current hook style (${hookTypes.join(', ')}) correlates with ${Math.round(ratio)}x better performance. Continue using these hooks.`;
  } else if (ratio > 1.5) {
    return `Hook style shows moderate performance correlation. Consider testing variations of ${hookTypes[0]} hooks.`;
  } else {
    return 'Current hooks show no clear performance correlation. Test different hook styles.';
  }
}

function generatePacingRecommendation(paceScore, durationDiff) {
  if (Math.abs(durationDiff) < 60) {
    return 'Video duration shows no clear correlation with performance. Current pacing is acceptable.';
  } else if (durationDiff > 60) {
    return `High-performing videos are ${Math.round(durationDiff / 60)} minutes longer. Consider creating longer, more detailed content.`;
  } else {
    return `High-performing videos are ${Math.round(-durationDiff / 60)} minutes shorter. Consider tightening pacing and reducing duration.`;
  }
}

function generateEnergyRecommendation(energyScore, engagementDiff) {
  if (engagementDiff > 0.01) {
    return 'Higher energy correlates with better engagement. Consider increasing enthusiasm and energy.';
  } else if (engagementDiff < -0.01) {
    return 'Current energy level may be too high. Consider a more measured approach.';
  } else {
    return 'Energy level shows appropriate engagement. Maintain current energy.';
  }
}

function analyzeTitlePatterns(performance) {
  const patterns = {
    hasPatterns: false,
    highPerformerPatterns: [],
    lowPerformerPatterns: []
  };

  // Analyze title characteristics
  const analyzeGroup = (videos) => {
    const characteristics = {
      avgLength: 0,
      hasNumbers: 0,
      hasQuestions: 0,
      hasPowerWords: 0
    };

    videos.forEach(v => {
      characteristics.avgLength += v.title.length;
      if (/\d+/.test(v.title)) characteristics.hasNumbers++;
      if (v.title.includes('?')) characteristics.hasQuestions++;

      const powerWords = ['secret', 'revealed', 'truth', 'shocking', 'how', 'why'];
      if (powerWords.some(w => v.title.toLowerCase().includes(w))) {
        characteristics.hasPowerWords++;
      }
    });

    characteristics.avgLength = Math.round(characteristics.avgLength / videos.length);
    characteristics.hasNumbers = Math.round((characteristics.hasNumbers / videos.length) * 100);
    characteristics.hasQuestions = Math.round((characteristics.hasQuestions / videos.length) * 100);
    characteristics.hasPowerWords = Math.round((characteristics.hasPowerWords / videos.length) * 100);

    return characteristics;
  };

  if (performance.highPerformers.videos.length > 0) {
    patterns.highPerformerPatterns = analyzeGroup(performance.highPerformers.videos);
    patterns.hasPatterns = true;
  }

  if (performance.lowPerformers.videos.length > 0) {
    patterns.lowPerformerPatterns = analyzeGroup(performance.lowPerformers.videos);
  }

  return patterns;
}

function countFrequencies(array) {
  const counts = {};
  array.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([pattern, count]) => ({ pattern, frequency: count }));
}

function generateOverallRecommendations(patterns, performance) {
  const recommendations = [];
  const performanceRatio = performance.highPerformers.avgViews / performance.lowPerformers.avgViews;

  // Primary recommendation based on performance gap
  if (performanceRatio > 10) {
    recommendations.push({
      priority: 'high',
      category: 'pattern_analysis',
      recommendation: 'Significant performance variance detected. Focus on replicating high-performer patterns.'
    });
  }

  // Hook recommendations
  if (patterns.hooks?.performanceImpact === 'positive') {
    recommendations.push({
      priority: 'high',
      category: 'hooks',
      recommendation: patterns.hooks.recommendation
    });
  }

  // Pacing recommendations
  if (patterns.pacing?.durationCorrelation !== 'no_clear_correlation') {
    recommendations.push({
      priority: 'medium',
      category: 'pacing',
      recommendation: patterns.pacing.recommendation
    });
  }

  // Title pattern recommendations
  if (patterns.titles?.hasPatterns) {
    const hp = patterns.titles.highPerformerPatterns;
    const lp = patterns.titles.lowPerformerPatterns;

    if (hp && lp) {
      if (hp.hasNumbers > lp.hasNumbers + 20) {
        recommendations.push({
          priority: 'medium',
          category: 'titles',
          recommendation: `Include numbers in titles - ${hp.hasNumbers}% of high performers use them vs ${lp.hasNumbers}% of low performers.`
        });
      }

      if (hp.hasQuestions > lp.hasQuestions + 20) {
        recommendations.push({
          priority: 'medium',
          category: 'titles',
          recommendation: `Use question-based titles - ${hp.hasQuestions}% of high performers use them.`
        });
      }
    }
  }

  // Velocity recommendation
  const velocityRatio = performance.highPerformers.avgVelocity / performance.lowPerformers.avgVelocity;
  if (velocityRatio > 2) {
    recommendations.push({
      priority: 'low',
      category: 'timing',
      recommendation: 'High performers gain views faster. Consider optimizing upload timing and initial promotion.'
    });
  }

  return recommendations;
}

function generateInsights(performance, voiceProfile) {
  const insights = [];

  // Performance spread insight
  const spread = performance.highPerformers.avgViews / performance.lowPerformers.avgViews;
  insights.push({
    type: 'performance_spread',
    value: spread,
    interpretation: spread > 5 ? 'Very high variance - significant optimization opportunities' :
                   spread > 2 ? 'Moderate variance - room for improvement' :
                   'Low variance - consistent performance'
  });

  // Engagement insight
  const engagementDiff = performance.highPerformers.avgEngagement - performance.lowPerformers.avgEngagement;
  if (Math.abs(engagementDiff) > 0.005) {
    insights.push({
      type: 'engagement_correlation',
      value: engagementDiff,
      interpretation: engagementDiff > 0 ?
        `High performers have ${Math.round(engagementDiff * 10000) / 100}% better engagement` :
        'Low performers surprisingly have better engagement - investigate quality vs clickbait balance'
    });
  }

  // Duration insight
  insights.push({
    type: 'optimal_duration',
    value: Math.round(performance.highPerformers.avgDuration / 60),
    interpretation: `High-performing videos average ${Math.round(performance.highPerformers.avgDuration / 60)} minutes`
  });

  return insights;
}