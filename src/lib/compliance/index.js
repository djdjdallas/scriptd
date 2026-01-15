/**
 * Compliance Module
 *
 * YouTube script compliance checking for GenScript.
 * Analyzes scripts for authenticity, AI patterns, and YouTube policy compliance.
 */

// Main analysis function
export { analyzeCompliance } from './compliance-rules';

// Individual analyzers (for advanced usage)
export {
  analyzeRepetitiveness,
  analyzeOriginalInsight,
  detectAIPatterns,
  analyzeStructure,
  calculateVocabularyDiversity,
  findRepeatedPhrases,
  findSimilarSentences,
  jaccardSimilarity
} from './compliance-rules';

// Constants and configuration
export {
  CATEGORY_WEIGHTS,
  STATUS_THRESHOLDS,
  SEVERITY_LEVELS,
  AI_HEDGING_PHRASES,
  AI_TRANSITION_PHRASES,
  AI_FORMULAIC_PHRASES,
  FIRST_PERSON_MARKERS,
  OPINION_MARKERS,
  ANECDOTE_MARKERS,
  WARNING_MESSAGES,
  SUGGESTIONS,
  CATEGORY_INFO,
  BADGE_STATUS
} from './compliance-constants';
