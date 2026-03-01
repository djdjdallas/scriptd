/**
 * Voice Confidence Score Calculator
 *
 * Replaces the fake "85 + Math.random() * 10" accuracy metric with a real
 * computed score based on profile completeness, data quality, source type,
 * and pattern depth.
 */

import { analyzeCompleteness } from '@/lib/ai/completeness-analyzer';
import { calculateDataQuality } from '@/lib/ai/pattern-analyzer';
import { detectProfileSource } from '@/lib/voice-training/normalizer';

const DEEP_FIELDS = [
  'linguisticFingerprints',
  'narrativeStructure',
  'emotionalDynamics',
  'engagementTechniques',
  'pacingDynamics',
  'technicalPatterns',
  'contentPositioning',
  'culturalReferences',
];

const SOURCE_QUALITY_SCORES = {
  deep_analysis: 95,
  remix: 80,
  basic: 60,
  train_route: 50,
  unknown: 30,
};

/**
 * Compute a real voice confidence score from a raw profile.
 *
 * @param {Object} rawProfile - The raw voice profile (e.g. from parameters column)
 * @returns {{ score: number, status: string, breakdown: Object, improvements: string[] }}
 */
export function computeVoiceConfidenceScore(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'object') {
    return {
      score: 0,
      status: 'untrained',
      breakdown: {
        completeness: 0,
        dataQuality: 0,
        sourceQuality: 0,
        patternDepth: 0,
      },
      improvements: ['Connect a YouTube channel to start voice training'],
    };
  }

  // 1. Completeness (35%)
  let completenessScore = 0;
  try {
    const completeness = analyzeCompleteness(rawProfile);
    completenessScore = completeness.scorePercent;
  } catch {
    completenessScore = 0;
  }

  // 2. Data Quality (25%)
  let dataQualityScore = 0;
  try {
    const quality = calculateDataQuality(rawProfile);
    dataQualityScore = quality.completeness * 100;
  } catch {
    dataQualityScore = 0;
  }

  // 3. Source Quality (20%)
  const source = detectProfileSource(rawProfile);
  const sourceQualityScore = SOURCE_QUALITY_SCORES[source] || SOURCE_QUALITY_SCORES.unknown;

  // 4. Pattern Depth (20%)
  let populatedDeepFields = 0;
  for (const field of DEEP_FIELDS) {
    const value = rawProfile[field];
    if (value && typeof value === 'object' && Object.keys(value).length > 0) {
      populatedDeepFields++;
    }
  }
  const patternDepthScore = (populatedDeepFields / DEEP_FIELDS.length) * 100;

  // Weighted total
  const score = Math.round(
    completenessScore * 0.35 +
    dataQualityScore * 0.25 +
    sourceQualityScore * 0.20 +
    patternDepthScore * 0.20
  );

  const clampedScore = Math.max(0, Math.min(100, score));

  // Status mapping
  const status = getStatus(clampedScore);

  // Build improvement suggestions
  const improvements = buildImprovements(rawProfile, source, completenessScore, patternDepthScore);

  return {
    score: clampedScore,
    status,
    breakdown: {
      completeness: Math.round(completenessScore),
      dataQuality: Math.round(dataQualityScore),
      sourceQuality: sourceQualityScore,
      patternDepth: Math.round(patternDepthScore),
    },
    improvements,
  };
}

function getStatus(score) {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 20) return 'poor';
  return 'untrained';
}

function buildImprovements(profile, source, completenessScore, patternDepthScore) {
  const improvements = [];

  if (source === 'basic' || source === 'train_route' || source === 'unknown') {
    improvements.push('Analyze your channel to upgrade from basic to deep voice profile');
  }

  if (!profile.linguisticFingerprints && !profile.narrativeStructure) {
    improvements.push('Enable captions on your YouTube videos for 40% better voice replication');
  }

  if (completenessScore < 50) {
    improvements.push('Voice profile based on metadata only — connect a channel with transcripts for accurate matching');
  }

  if (!profile.performance) {
    improvements.push('Run channel analysis to link voice patterns with your top-performing videos');
  }

  if (patternDepthScore < 50 && source !== 'basic' && source !== 'unknown') {
    improvements.push('Analyze more videos to strengthen pattern detection accuracy');
  }

  return improvements;
}
