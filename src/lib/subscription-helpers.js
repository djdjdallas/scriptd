// Subscription Helper Functions

import { 
  TIER_ACCESS_BY_SUBSCRIPTION,
  MODEL_TIERS,
  LEGACY_PLAN_MAPPING,
  LENGTH_MULTIPLIERS
} from './constants';

/**
 * Check if a user has access to a specific quality tier
 * @param {string} qualityTier - The quality tier identifier (FAST, BALANCED, PREMIUM)
 * @param {string} subscriptionTier - User's subscription tier
 * @returns {boolean} - Whether the user has access
 */
export function hasAccessToTier(qualityTier, subscriptionTier = 'free') {
  const tier = normalizeTierName(subscriptionTier);
  const allowedTiers = TIER_ACCESS_BY_SUBSCRIPTION[tier] || TIER_ACCESS_BY_SUBSCRIPTION.free;
  return allowedTiers.includes(qualityTier);
}

/**
 * Check if a user has access to a specific AI model (legacy support)
 * @param {string} model - The AI model identifier
 * @param {string} subscriptionTier - User's subscription tier
 * @returns {boolean} - Whether the user has access
 */
export function hasAccessToModel(model, subscriptionTier = 'free') {
  // First check if it's a tier name
  if (MODEL_TIERS[model]) {
    return hasAccessToTier(model, subscriptionTier);
  }
  
  // For legacy models, map to quality tiers
  // All Claude models are now mapped to quality tiers
  if (model?.includes('haiku')) return hasAccessToTier('FAST', subscriptionTier);
  if (model?.includes('sonnet')) return hasAccessToTier('BALANCED', subscriptionTier);
  if (model?.includes('opus')) return hasAccessToTier('PREMIUM', subscriptionTier);
  
  // Default to BALANCED tier for unknown models
  return hasAccessToTier('BALANCED', subscriptionTier);
}

/**
 * Check if a model is premium (requires paid subscription)
 * @param {string} model - The AI model identifier
 * @returns {boolean} - Whether the model is premium
 */
export function isPremiumModel(model) {
  // Check if it's a premium tier
  if (model === 'PREMIUM') return true;
  
  // Check if it's an opus model (premium)
  if (model?.includes('opus')) return true;
  
  // Check if it's balanced tier (also requires paid)
  if (model === 'BALANCED' || model?.includes('sonnet')) return true;
  
  // FAST tier is not premium
  return false;
}

/**
 * Get the minimum required subscription tier for a quality tier
 * @param {string} qualityTier - The quality tier identifier
 * @returns {string|null} - The minimum subscription tier name or null
 */
export function getMinimumTierForQuality(qualityTier) {
  const tiers = ['free', 'creator', 'professional', 'agency'];
  
  for (const tier of tiers) {
    if (TIER_ACCESS_BY_SUBSCRIPTION[tier]?.includes(qualityTier)) {
      return tier;
    }
  }
  
  return null;
}

/**
 * Get the minimum required tier for a specific model (legacy support)
 * @param {string} model - The AI model identifier
 * @returns {string|null} - The minimum tier name or null if not found
 */
export function getMinimumTierForModel(model) {
  // Check if it's a quality tier
  if (MODEL_TIERS[model]) {
    return getMinimumTierForQuality(model);
  }
  
  // Map legacy models to quality tiers then find minimum
  if (model?.includes('haiku')) return getMinimumTierForQuality('FAST');
  if (model?.includes('sonnet')) return getMinimumTierForQuality('BALANCED');
  if (model?.includes('opus')) return getMinimumTierForQuality('PREMIUM');
  
  // Default to BALANCED tier minimum
  return getMinimumTierForQuality('BALANCED');
}

/**
 * Get all quality tiers available for a subscription
 * @param {string} subscriptionTier - User's subscription tier
 * @returns {Array} - Array of available quality tier identifiers
 */
export function getAvailableTiers(subscriptionTier = 'free') {
  const tier = normalizeTierName(subscriptionTier);
  return TIER_ACCESS_BY_SUBSCRIPTION[tier] || TIER_ACCESS_BY_SUBSCRIPTION.free;
}

/**
 * Get all models available for a subscription tier (legacy support)
 * @param {string} subscriptionTier - User's subscription tier
 * @returns {Array} - Array of available model identifiers
 */
export function getAvailableModels(subscriptionTier = 'free') {
  const tier = normalizeTierName(subscriptionTier);
  const availableTiers = TIER_ACCESS_BY_SUBSCRIPTION[tier] || [];
  
  // Map tiers to actual models
  const models = [];
  availableTiers.forEach(tierName => {
    if (MODEL_TIERS[tierName]) {
      models.push(MODEL_TIERS[tierName].actualModel);
    }
  });
  
  return models;
}

/**
 * Check if user needs to upgrade to access a quality tier
 * @param {string} qualityTier - The quality tier identifier
 * @param {string} currentTier - User's current subscription tier
 * @returns {Object} - { needsUpgrade: boolean, minimumTier: string|null }
 */
export function checkTierUpgradeRequirement(qualityTier, currentTier = 'free') {
  const hasAccess = hasAccessToTier(qualityTier, currentTier);
  const minimumTier = getMinimumTierForQuality(qualityTier);
  
  return {
    needsUpgrade: !hasAccess,
    minimumTier: hasAccess ? null : minimumTier
  };
}

/**
 * Check if user needs to upgrade to access a model (legacy support)
 * @param {string} model - The AI model identifier
 * @param {string} currentTier - User's current subscription tier
 * @returns {Object} - { needsUpgrade: boolean, minimumTier: string|null }
 */
export function checkUpgradeRequirement(model, currentTier = 'free') {
  // Check if it's a quality tier
  if (MODEL_TIERS[model]) {
    return checkTierUpgradeRequirement(model, currentTier);
  }
  
  const hasAccess = hasAccessToModel(model, currentTier);
  const minimumTier = getMinimumTierForModel(model);
  
  return {
    needsUpgrade: !hasAccess,
    minimumTier: hasAccess ? null : minimumTier
  };
}

/**
 * Get tier display name
 * @param {string} tier - Tier identifier
 * @returns {string} - Display name
 */
export function getTierDisplayName(tier) {
  const displayNames = {
    free: 'Free',
    starter: 'Starter', // Legacy
    creator: 'Creator',
    professional: 'Professional',
    business: 'Business', // Legacy
    enterprise: 'Enterprise', // Legacy
    agency: 'Agency'
  };
  
  return displayNames[tier?.toLowerCase()] || 'Free';
}

/**
 * Check if a subscription is paid
 * @param {string} tier - Tier identifier
 * @returns {boolean} - Whether it's a paid tier
 */
export function isPaidTier(tier) {
  return tier && tier.toLowerCase() !== 'free';
}

/**
 * Normalize tier name to handle legacy naming
 * @param {string} tier - Tier identifier
 * @returns {string} - Normalized tier name
 */
export function normalizeTierName(tier) {
  if (!tier) return 'free';
  const lowerTier = tier.toLowerCase();
  
  // Check for legacy mapping
  if (LEGACY_PLAN_MAPPING[lowerTier]) {
    return LEGACY_PLAN_MAPPING[lowerTier];
  }
  
  return lowerTier;
}

/**
 * Get quality tier from model name
 * @param {string} model - The AI model identifier
 * @returns {string|null} - The quality tier or null
 */
export function getQualityTierFromModel(model) {
  // Check each tier's actual model
  for (const [tierKey, tierConfig] of Object.entries(MODEL_TIERS)) {
    if (tierConfig.actualModel === model) {
      return tierKey;
    }
  }
  
  // Legacy mapping
  if (model?.includes('haiku')) return 'FAST';
  if (model?.includes('sonnet')) return 'BALANCED';
  if (model?.includes('opus')) return 'PREMIUM';
  
  return null;
}

/**
 * Get tier access information with required plan
 * @param {string} tier - The quality tier identifier
 * @param {string} subscriptionTier - User's subscription tier
 * @returns {Object} - { hasAccess: boolean, requiredPlan: string|null }
 */
export function getTierAccess(tier, subscriptionTier = 'free') {
  const normalizedTier = normalizeTierName(subscriptionTier);
  const allowedTiers = TIER_ACCESS_BY_SUBSCRIPTION[normalizedTier] || TIER_ACCESS_BY_SUBSCRIPTION.free;
  const hasAccess = allowedTiers.includes(tier);
  
  let requiredPlan = null;
  if (!hasAccess) {
    if (tier === 'BALANCED') {
      requiredPlan = 'Creator+ required';
    } else if (tier === 'PREMIUM') {
      requiredPlan = 'Professional+ required';
    }
  }
  
  return { hasAccess, requiredPlan };
}

/**
 * Calculate script cost estimates for a credit amount
 * @param {number} credits - Number of credits
 * @param {string} tier - Quality tier (FAST, BALANCED, PREMIUM)
 * @returns {Object} - Script estimates { minimum, average, maximum, range }
 */
export function getScriptEstimates(credits, tier = 'BALANCED') {
  const costs = {
    FAST: { min: 3, avg: 5, max: 11 },      // 3 base * 1.0 to 3.5 multiplier
    BALANCED: { min: 8, avg: 15, max: 28 }, // 8 base * 1.0 to 3.5 multiplier
    PREMIUM: { min: 15, avg: 30, max: 53 }  // 15 base * 1.0 to 3.5 multiplier
  };
  
  const tierCosts = costs[tier] || costs.BALANCED;
  
  return {
    minimum: Math.floor(credits / tierCosts.max),
    average: Math.floor(credits / tierCosts.avg),
    maximum: Math.floor(credits / tierCosts.min),
    range: `${Math.floor(credits / tierCosts.max)}-${Math.floor(credits / tierCosts.min)}`
  };
}

/**
 * Get required tier display name for a quality tier
 * @param {string} qualityTier - The quality tier identifier
 * @returns {string} - Display name of required tier
 */
export function getRequiredTier(qualityTier) {
  if (qualityTier === 'FAST') return 'Free';
  if (qualityTier === 'BALANCED') return 'Creator';
  if (qualityTier === 'PREMIUM') return 'Professional';
  return 'Free';
}

/**
 * Check tier access for multiple tiers
 * @param {string[]} tiers - Array of quality tier identifiers
 * @param {string} subscriptionTier - User's subscription tier
 * @returns {boolean} - Whether user has access to all tiers
 */
export function checkTierAccess(tiers, subscriptionTier = 'free') {
  return tiers.every(tier => getTierAccess(tier, subscriptionTier).hasAccess);
}