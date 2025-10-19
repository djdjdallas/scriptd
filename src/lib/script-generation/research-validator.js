/**
 * Research Validation System for Long-Form Content (35-60 minutes)
 *
 * Validates research adequacy, calculates quality scores, and provides
 * enhancement suggestions for comprehensive script generation.
 */

/**
 * Minimum research requirements by duration
 */
const RESEARCH_REQUIREMENTS = {
  35: { minWords: 7000, minSources: 10, minQuality: 0.70 },
  40: { minWords: 8500, minSources: 12, minQuality: 0.72 },
  45: { minWords: 10000, minSources: 15, minQuality: 0.75 },
  50: { minWords: 11500, minSources: 17, minQuality: 0.77 },
  60: { minWords: 13000, minSources: 20, minQuality: 0.80 }
};

/**
 * Get minimum requirements for a given duration
 */
function getRequirementsForDuration(minutes) {
  if (minutes < 35) {
    return { minWords: 3000, minSources: 5, minQuality: 0.60 };
  }

  // Find the nearest duration threshold
  const thresholds = Object.keys(RESEARCH_REQUIREMENTS).map(Number).sort((a, b) => a - b);
  const threshold = thresholds.find(t => minutes <= t) || 60;

  return RESEARCH_REQUIREMENTS[threshold];
}

/**
 * Calculate quality score for a single source
 */
function calculateSourceQuality(source) {
  let score = 0.5; // Base score

  // Source type bonuses
  if (source.source_type === 'synthesis') score = 1.0;
  else if (source.source_type === 'document') score += 0.2;
  else if (source.source_type === 'web') score += 0.1;

  // Verification bonuses
  if (source.is_starred) score += 0.1;
  if (source.fact_check_status === 'verified') score += 0.1;

  // Content length bonuses
  const wordCount = source.word_count ||
    (source.source_content ? source.source_content.split(/\s+/).length : 0);

  if (wordCount > 1000) score += 0.15;
  else if (wordCount > 500) score += 0.10;
  else if (wordCount > 200) score += 0.05;
  else if (wordCount < 50) score -= 0.2; // Penalty for snippets

  // Relevance bonus
  if (source.relevance) {
    score += (source.relevance - 0.75) * 0.2; // Normalize around 0.75
  }

  // Cap at 1.0
  return Math.min(1.0, Math.max(0, score));
}

/**
 * Calculate overall research quality score
 */
function calculateResearchScore(sources) {
  if (!sources || sources.length === 0) {
    return {
      overallScore: 0,
      sourceCount: 0,
      totalWords: 0,
      averageQuality: 0,
      breakdown: {
        synthesis: 0,
        documents: 0,
        web: 0,
        verified: 0,
        starred: 0
      }
    };
  }

  let totalWords = 0;
  let qualitySum = 0;
  const breakdown = {
    synthesis: 0,
    documents: 0,
    web: 0,
    verified: 0,
    starred: 0
  };

  sources.forEach(source => {
    // Count words
    const content = source.source_content || '';
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    totalWords += words;

    // Calculate quality
    const quality = calculateSourceQuality(source);
    qualitySum += quality;

    // Track breakdown
    if (source.source_type === 'synthesis') breakdown.synthesis++;
    else if (source.source_type === 'document') breakdown.documents++;
    else if (source.source_type === 'web') breakdown.web++;

    if (source.fact_check_status === 'verified') breakdown.verified++;
    if (source.is_starred) breakdown.starred++;
  });

  const averageQuality = sources.length > 0 ? qualitySum / sources.length : 0;

  // Calculate overall score (weighted combination)
  const sourceCountScore = Math.min(1.0, sources.length / 15); // 15 sources = 1.0
  const wordCountScore = Math.min(1.0, totalWords / 10000); // 10k words = 1.0
  const qualityScore = averageQuality;

  const overallScore = (
    sourceCountScore * 0.3 +
    wordCountScore * 0.4 +
    qualityScore * 0.3
  );

  return {
    overallScore: Number(overallScore.toFixed(2)),
    sourceCount: sources.length,
    totalWords,
    averageQuality: Number(averageQuality.toFixed(2)),
    breakdown
  };
}

/**
 * Validate research adequacy for a given duration
 */
function validateResearchForDuration(research, durationMinutes, hasUserDocuments = false) {
  const requirements = getRequirementsForDuration(durationMinutes);
  const score = calculateResearchScore(research?.sources || []);

  const validation = {
    isAdequate: true,
    score: score.overallScore,
    requirements,
    current: {
      words: score.totalWords,
      sources: score.sourceCount,
      quality: score.averageQuality
    },
    gaps: [],
    recommendations: []
  };

  // Check word count
  if (score.totalWords < requirements.minWords) {
    validation.isAdequate = false;
    validation.gaps.push({
      type: 'word_count',
      message: `Insufficient research content: ${score.totalWords} words (need ${requirements.minWords})`,
      severity: 'critical',
      missing: requirements.minWords - score.totalWords
    });

    validation.recommendations.push({
      action: 'add_research',
      title: 'Add More Research Sources',
      description: `Add ${Math.ceil((requirements.minWords - score.totalWords) / 500)} more comprehensive sources`,
      priority: 'high'
    });
  }

  // Check source count
  if (score.sourceCount < requirements.minSources) {
    validation.isAdequate = false;
    validation.gaps.push({
      type: 'source_count',
      message: `Insufficient research sources: ${score.sourceCount} sources (need ${requirements.minSources})`,
      severity: 'critical',
      missing: requirements.minSources - score.sourceCount
    });

    validation.recommendations.push({
      action: 'run_enhanced_research',
      title: 'Run Enhanced Research',
      description: 'Use 2x depth research to gather more comprehensive sources',
      priority: 'high'
    });
  }

  // Check quality score
  if (score.overallScore < requirements.minQuality) {
    validation.isAdequate = false;
    validation.gaps.push({
      type: 'quality',
      message: `Research quality below threshold: ${score.overallScore.toFixed(2)} (need ${requirements.minQuality})`,
      severity: 'warning',
      missing: requirements.minQuality - score.overallScore
    });

    if (!hasUserDocuments) {
      validation.recommendations.push({
        action: 'upload_documents',
        title: 'Upload Your Own Research',
        description: 'Add PDF/DOCX documents with detailed information on your topic',
        priority: 'medium'
      });
    }
  }

  // Check for synthesis sources
  if (score.breakdown.synthesis === 0) {
    validation.recommendations.push({
      action: 'run_perplexity_research',
      title: 'Add Synthesis Research',
      description: 'Run deep research to generate comprehensive synthesis sources',
      priority: 'medium'
    });
  }

  // Check for user documents
  if (!hasUserDocuments && durationMinutes >= 45) {
    validation.recommendations.push({
      action: 'upload_documents',
      title: 'Upload Specialized Documents',
      description: 'For 45+ minute content, custom research documents significantly improve quality',
      priority: 'low'
    });
  }

  return validation;
}

/**
 * Detect duplicate or highly similar content across sources
 */
function detectDuplicateContent(sources) {
  const duplicates = [];
  const chunks = [];

  // Create content chunks (first 500 chars of each source)
  sources.forEach((source, idx) => {
    const content = (source.source_content || '').toLowerCase();
    if (content.length > 100) {
      chunks.push({
        index: idx,
        source: source,
        fingerprint: content.substring(0, 500),
        fullContent: content
      });
    }
  });

  // Compare chunks for similarity
  for (let i = 0; i < chunks.length; i++) {
    for (let j = i + 1; j < chunks.length; j++) {
      const similarity = calculateTextSimilarity(
        chunks[i].fingerprint,
        chunks[j].fingerprint
      );

      if (similarity > 0.7) {
        duplicates.push({
          source1: chunks[i].source.source_title,
          source2: chunks[j].source.source_title,
          similarity: similarity.toFixed(2),
          recommendation: similarity > 0.9 ? 'Remove one source' : 'Review for overlap'
        });
      }
    }
  }

  return duplicates;
}

/**
 * Simple text similarity calculation (Jaccard similarity on words)
 */
function calculateTextSimilarity(text1, text2) {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Suggest research enhancements based on current state
 */
function suggestResearchEnhancements(currentScore, targetDuration) {
  const requirements = getRequirementsForDuration(targetDuration);
  const score = currentScore.overallScore || 0;

  const suggestions = [];

  if (score < 0.5) {
    suggestions.push({
      priority: 'critical',
      title: 'Research Critically Low',
      description: 'Current research is insufficient for quality script generation',
      actions: [
        'Run enhanced research (2x depth)',
        'Upload comprehensive documents',
        'Consider reducing target duration'
      ]
    });
  } else if (score < requirements.minQuality) {
    suggestions.push({
      priority: 'high',
      title: 'Research Below Target',
      description: `Need ${((requirements.minQuality - score) * 100).toFixed(0)}% more research quality`,
      actions: [
        'Add 3-5 more high-quality sources',
        'Upload topic-specific documents',
        'Run targeted research queries'
      ]
    });
  } else if (score < 0.8) {
    suggestions.push({
      priority: 'medium',
      title: 'Research Adequate, Improvements Recommended',
      description: 'Script will generate, but additional research improves quality',
      actions: [
        'Add specialized sources for depth',
        'Include case studies or examples',
        'Consider expert interviews or whitepapers'
      ]
    });
  } else {
    suggestions.push({
      priority: 'low',
      title: 'Research Quality Excellent',
      description: 'Research depth is sufficient for high-quality generation',
      actions: [
        'Proceed with confidence',
        'Consider marking best sources as starred'
      ]
    });
  }

  return suggestions;
}

/**
 * Calculate research adequacy percentage
 */
function calculateAdequacyPercentage(validation) {
  if (!validation) return 0;

  const requirements = validation.requirements;
  const current = validation.current;

  const wordPercent = Math.min(100, (current.words / requirements.minWords) * 100);
  const sourcePercent = Math.min(100, (current.sources / requirements.minSources) * 100);
  const qualityPercent = Math.min(100, (current.quality / requirements.minQuality) * 100);

  return Math.floor((wordPercent + sourcePercent + qualityPercent) / 3);
}

module.exports = {
  getRequirementsForDuration,
  calculateSourceQuality,
  calculateResearchScore,
  validateResearchForDuration,
  detectDuplicateContent,
  suggestResearchEnhancements,
  calculateAdequacyPercentage
};
