/**
 * Voice Profile Completeness Analyzer
 * Provides detailed analysis of voice profile completeness
 */

import { getCompletenessThreshold, validateThreshold, VOICE_CONFIG } from '@/lib/config/voice-config';

// Required fields for basic voice profile (60% weight)
const REQUIRED_FIELDS = [
  { key: 'tone', weight: 1, description: 'Voice tone characteristics' },
  { key: 'style', weight: 1, description: 'Communication style' },
  { key: 'pace', weight: 0.8, description: 'Speaking pace' },
  { key: 'energy', weight: 0.8, description: 'Energy level' },
  { key: 'personality', weight: 1, description: 'Personality traits' },
  { key: 'hooks', weight: 1, description: 'Opening hooks' },
  { key: 'transitions', weight: 0.8, description: 'Transition phrases' },
  { key: 'engagement', weight: 1, description: 'Engagement techniques' },
  { key: 'vocabulary', weight: 0.8, description: 'Vocabulary patterns' },
  { key: 'sentenceStructure', weight: 0.6, description: 'Sentence structure' },
  { key: 'dos', weight: 0.8, description: 'Style guidelines (do)' },
  { key: 'donts', weight: 0.8, description: "Style guidelines (don't)" },
  { key: 'summary', weight: 0.6, description: 'Voice summary' }
];

// Enhanced fields for deep voice profile (40% weight)
const ENHANCED_FIELDS = [
  { key: 'linguisticFingerprints', weight: 1.2, description: 'Unique linguistic patterns' },
  { key: 'narrativeStructure', weight: 1, description: 'Story/content structure' },
  { key: 'emotionalDynamics', weight: 1, description: 'Emotional patterns' },
  { key: 'contentPositioning', weight: 0.8, description: 'Content positioning style' },
  { key: 'culturalReferences', weight: 0.6, description: 'Cultural reference patterns' },
  { key: 'technicalPatterns', weight: 0.8, description: 'Technical writing patterns' },
  { key: 'engagementTechniques', weight: 1, description: 'Audience engagement methods' },
  { key: 'pacingDynamics', weight: 0.8, description: 'Pacing and rhythm' }
];

/**
 * Analyze voice profile completeness with detailed breakdown
 * @param {Object} profile - Voice profile to analyze
 * @param {Object} options - Analysis options
 * @param {number} options.threshold - Custom threshold (0-1)
 * @param {string} options.tier - Threshold tier ('minimum', 'recommended', 'premium')
 * @returns {Object} Detailed completeness analysis
 */
export function analyzeCompleteness(profile, options = {}) {
  if (!profile || typeof profile !== 'object') {
    return createEmptyAnalysis(options);
  }

  const threshold = options.threshold
    ? validateThreshold(options.threshold)
    : getCompletenessThreshold(options.tier || 'default');

  // Analyze required fields
  const requiredAnalysis = analyzeFieldGroup(profile, REQUIRED_FIELDS);

  // Analyze enhanced fields
  const enhancedAnalysis = analyzeFieldGroup(profile, ENHANCED_FIELDS);

  // Calculate weighted overall score (60% required, 40% enhanced)
  const overallScore = (requiredAnalysis.score * 0.6) + (enhancedAnalysis.score * 0.4);

  // Determine status based on threshold
  const meetsThreshold = overallScore >= threshold;
  const status = getStatus(overallScore, threshold);

  // Generate recommendations
  const recommendations = generateRecommendations(
    requiredAnalysis.missing,
    enhancedAnalysis.missing,
    overallScore,
    threshold
  );

  return {
    // Core metrics
    score: Math.round(overallScore * 1000) / 1000,
    scorePercent: Math.round(overallScore * 100),
    threshold,
    thresholdPercent: Math.round(threshold * 100),
    meetsThreshold,
    status,

    // Detailed breakdown
    required: {
      score: requiredAnalysis.score,
      scorePercent: Math.round(requiredAnalysis.score * 100),
      populated: requiredAnalysis.populated,
      total: REQUIRED_FIELDS.length,
      missing: requiredAnalysis.missing,
      fields: requiredAnalysis.details
    },

    enhanced: {
      score: enhancedAnalysis.score,
      scorePercent: Math.round(enhancedAnalysis.score * 100),
      populated: enhancedAnalysis.populated,
      total: ENHANCED_FIELDS.length,
      missing: enhancedAnalysis.missing,
      fields: enhancedAnalysis.details
    },

    // Actionable output
    recommendations,
    needsEnhancement: !meetsThreshold,

    // Metadata
    analyzedAt: new Date().toISOString(),
    configuredThreshold: threshold,
    tier: options.tier || 'default'
  };
}

/**
 * Analyze a group of fields
 */
function analyzeFieldGroup(profile, fields) {
  let totalWeight = 0;
  let achievedWeight = 0;
  const details = [];
  const missing = [];
  let populated = 0;

  for (const field of fields) {
    totalWeight += field.weight;
    const value = profile[field.key];
    const hasValue = isPopulated(value);

    if (hasValue) {
      achievedWeight += field.weight;
      populated++;
    } else {
      missing.push({
        key: field.key,
        description: field.description,
        impact: field.weight >= 1 ? 'high' : field.weight >= 0.8 ? 'medium' : 'low'
      });
    }

    details.push({
      key: field.key,
      description: field.description,
      populated: hasValue,
      weight: field.weight
    });
  }

  return {
    score: totalWeight > 0 ? achievedWeight / totalWeight : 0,
    populated,
    missing,
    details
  };
}

/**
 * Check if a value is meaningfully populated
 */
function isPopulated(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0 &&
           Object.values(value).some(v => isPopulated(v));
  }
  return true;
}

/**
 * Get status label based on score
 */
function getStatus(score, threshold) {
  if (score >= 0.9) return 'excellent';
  if (score >= threshold) return 'good';
  if (score >= threshold * 0.8) return 'fair';
  if (score >= 0.3) return 'poor';
  return 'insufficient';
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(missingRequired, missingEnhanced, score, threshold) {
  const recommendations = [];
  const gap = threshold - score;

  if (gap <= 0) {
    recommendations.push({
      type: 'success',
      message: 'Voice profile meets quality threshold',
      priority: 'none'
    });
    return recommendations;
  }

  // Prioritize high-impact missing required fields
  const highImpactMissing = missingRequired.filter(f => f.impact === 'high');
  if (highImpactMissing.length > 0) {
    recommendations.push({
      type: 'action',
      message: `Add ${highImpactMissing.length} critical fields: ${highImpactMissing.map(f => f.key).join(', ')}`,
      priority: 'high',
      fields: highImpactMissing.map(f => f.key)
    });
  }

  // Suggest more video analysis if enhanced fields are low
  if (missingEnhanced.length > 4) {
    recommendations.push({
      type: 'suggestion',
      message: 'Analyze more videos with transcripts for deeper voice patterns',
      priority: 'medium'
    });
  }

  // Provide specific gap info
  recommendations.push({
    type: 'info',
    message: `Profile is ${Math.round(gap * 100)}% below threshold. Need ${Math.ceil(gap * 10)} more fields.`,
    priority: 'info'
  });

  return recommendations;
}

/**
 * Create empty analysis result
 */
function createEmptyAnalysis(options) {
  const threshold = getCompletenessThreshold(options.tier || 'default');
  return {
    score: 0,
    scorePercent: 0,
    threshold,
    thresholdPercent: Math.round(threshold * 100),
    meetsThreshold: false,
    status: 'insufficient',
    required: { score: 0, populated: 0, total: REQUIRED_FIELDS.length, missing: REQUIRED_FIELDS },
    enhanced: { score: 0, populated: 0, total: ENHANCED_FIELDS.length, missing: ENHANCED_FIELDS },
    recommendations: [{ type: 'error', message: 'No voice profile data available', priority: 'critical' }],
    needsEnhancement: true,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Quick check if profile meets a threshold
 * @param {Object} profile - Voice profile
 * @param {number|string} threshold - Threshold value or tier name
 * @returns {boolean}
 */
export function meetsThreshold(profile, threshold = 'default') {
  const analysis = analyzeCompleteness(profile, {
    tier: typeof threshold === 'string' ? threshold : undefined,
    threshold: typeof threshold === 'number' ? threshold : undefined
  });
  return analysis.meetsThreshold;
}

/**
 * Get a simple completeness score (0-100)
 * @param {Object} profile - Voice profile
 * @returns {number} Score 0-100
 */
export function getCompletenessScore(profile) {
  const analysis = analyzeCompleteness(profile);
  return analysis.scorePercent;
}

export { REQUIRED_FIELDS, ENHANCED_FIELDS };
