/**
 * Script Generation Configuration
 * Optimized for realistic content generation targets
 */

const SCRIPT_CONFIG = {
  // Content targets - REDUCED FROM 150 to 130 WPM
  wordsPerMinute: 130, // More realistic for engaging content

  // Quality thresholds - Strict minimum to ensure quality
  qualityBypassThreshold: 0.80, // Require 80% minimum even with quality research
  minResearchRatio: 1.1, // Minimum research:script ratio

  // Generation settings - REDUCED FROM 3 to 1
  maxRetries: 1, // Save API costs
  chunkOverlapWords: 50,

  // Research requirements for quality bypass
  minVerifiedSources: 15,
  minStarredSources: 5,

  // FREE USER RESTRICTIONS - Updated to include Balanced model
  freeUserLimits: {
    maxDurationMinutes: 21, // Free users limited to 21 minutes
    allowedModels: ['claude-3-5-haiku-20241022', 'claude-sonnet-4-5-20250929'], // Fast and Balanced/Professional models available
  },

  // PAID USER (all models available)
  paidUserLimits: {
    maxDurationMinutes: 60, // Up to 1 hour
    allowedModels: ['claude-3-5-haiku-20241022', 'claude-sonnet-4-5-20250929', 'claude-opus-4-1-20250805'], // All models: Fast, Balanced, Premium (Hollywood)
  },
};

/**
 * Calculate realistic chunk strategy based on target duration
 */
function calculateChunkStrategy(durationMinutes) {
  const targetWords = durationMinutes * SCRIPT_CONFIG.wordsPerMinute;

  // Aim for chunks of ~1800-2000 words (sweet spot for generation)
  const IDEAL_CHUNK_SIZE = 1900;
  const chunkCount = Math.max(1, Math.ceil(targetWords / IDEAL_CHUNK_SIZE));

  const wordsPerChunk = Math.ceil(targetWords / chunkCount);
  const minWordsPerChunk = Math.ceil(wordsPerChunk * SCRIPT_CONFIG.qualityBypassThreshold);

  return {
    targetWords,
    chunkCount,
    wordsPerChunk,
    minWordsPerChunk,
    strategy: `${chunkCount} chunks × ~${wordsPerChunk} words each`,
  };
}

/**
 * Validate if script meets quality standards
 * Returns whether script should pass despite being short
 */
function validateScriptQuality(script, research, targetWords) {
  const wordCount = script.split(/\s+/).length;
  const percentComplete = (wordCount / targetWords) * 100;

  // Quality bypass criteria
  const hasGoodResearch =
    research.verifiedSources >= SCRIPT_CONFIG.minVerifiedSources &&
    research.starredSources >= SCRIPT_CONFIG.minStarredSources &&
    research.ratio >= SCRIPT_CONFIG.minResearchRatio;

  const meetsMinimumLength =
    percentComplete >= (SCRIPT_CONFIG.qualityBypassThreshold * 100);

  return {
    passes: hasGoodResearch && meetsMinimumLength,
    wordCount,
    targetWords,
    percentComplete: Math.round(percentComplete),
    bypassReason: hasGoodResearch ? 'High-quality research' : null,
    shouldRetry: !hasGoodResearch && !meetsMinimumLength,
  };
}

/**
 * Check if user can access requested duration and model
 */
function validateUserAccess(userId, userTier, duration, model) {
  // Normalize tier to 'free' or 'paid'
  const normalizedTier = ['free', 'inactive'].includes(userTier) ? 'free' : 'paid';

  const limits = normalizedTier === 'free'
    ? SCRIPT_CONFIG.freeUserLimits
    : SCRIPT_CONFIG.paidUserLimits;

  // Debug logging to see what's being used
  console.log('🔍 Model validation:', {
    userId,
    userTier,
    normalizedTier,
    model,
    allowedModels: limits.allowedModels,
    modelAllowed: limits.allowedModels.includes(model)
  });

  const errors = [];

  if (duration > limits.maxDurationMinutes) {
    errors.push({
      field: 'duration',
      message: `${normalizedTier === 'free' ? 'Free users are limited to' : 'Maximum duration is'} ${limits.maxDurationMinutes} minutes`,
      maxAllowed: limits.maxDurationMinutes,
    });
  }

  if (!limits.allowedModels.includes(model)) {
    errors.push({
      field: 'model',
      message: `${normalizedTier === 'free' ? 'Free users cannot access' : 'Model not available:'} ${model}`,
      allowedModels: limits.allowedModels,
    });
  }

  return {
    allowed: errors.length === 0,
    errors,
    limits,
    normalizedTier,
  };
}

module.exports = {
  SCRIPT_CONFIG,
  calculateChunkStrategy,
  validateScriptQuality,
  validateUserAccess,
};
