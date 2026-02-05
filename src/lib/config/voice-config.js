/**
 * Voice Profile Configuration
 * Centralizes all voice-related configuration with sensible defaults
 */

// Environment-based defaults with fallbacks
export const VOICE_CONFIG = {
  // Completeness thresholds
  completeness: {
    minimum: parseFloat(process.env.VOICE_MIN_COMPLETENESS) || 0.5,
    recommended: parseFloat(process.env.VOICE_RECOMMENDED_COMPLETENESS) || 0.7,
    premium: parseFloat(process.env.VOICE_PREMIUM_COMPLETENESS) || 0.85,

    // Default threshold used when not specified
    default: parseFloat(process.env.VOICE_DEFAULT_COMPLETENESS) || 0.7
  },

  // Analysis settings
  analysis: {
    maxVideos: parseInt(process.env.VOICE_MAX_VIDEOS) || 20,
    minTranscripts: parseInt(process.env.VOICE_MIN_TRANSCRIPTS) || 3,
    optimalTranscripts: parseInt(process.env.VOICE_OPTIMAL_TRANSCRIPTS) || 10
  },

  // Cache settings (if not defined in cache module)
  cache: {
    ttlHours: parseInt(process.env.VOICE_CACHE_TTL_HOURS) || 24,
    partialTtlHours: parseInt(process.env.VOICE_PARTIAL_CACHE_TTL_HOURS) || 6
  }
};

/**
 * Get completeness threshold based on tier/context
 * @param {'minimum' | 'recommended' | 'premium' | 'default'} tier
 * @returns {number} Threshold value (0-1)
 */
export function getCompletenessThreshold(tier = 'default') {
  return VOICE_CONFIG.completeness[tier] || VOICE_CONFIG.completeness.default;
}

/**
 * Validate a custom threshold value
 * @param {number} threshold - Value to validate
 * @returns {number} Valid threshold (clamped to 0.3-1.0)
 */
export function validateThreshold(threshold) {
  if (typeof threshold !== 'number' || isNaN(threshold)) {
    return VOICE_CONFIG.completeness.default;
  }
  // Clamp between 0.3 (minimum useful) and 1.0 (perfect)
  return Math.max(0.3, Math.min(1.0, threshold));
}

export default VOICE_CONFIG;
