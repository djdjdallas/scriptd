// Subscription Helper Functions

import { MODEL_ACCESS_BY_TIER, PREMIUM_AI_MODELS } from './constants';

/**
 * Check if a user has access to a specific AI model
 * @param {string} model - The AI model identifier
 * @param {string} subscriptionTier - User's subscription tier (free, starter, professional, business, enterprise)
 * @returns {boolean} - Whether the user has access
 */
export function hasAccessToModel(model, subscriptionTier = 'free') {
  const tier = subscriptionTier?.toLowerCase() || 'free';
  const allowedModels = MODEL_ACCESS_BY_TIER[tier] || MODEL_ACCESS_BY_TIER.free;
  return allowedModels.includes(model);
}

/**
 * Check if a model is premium (requires paid subscription)
 * @param {string} model - The AI model identifier
 * @returns {boolean} - Whether the model is premium
 */
export function isPremiumModel(model) {
  return PREMIUM_AI_MODELS.includes(model);
}

/**
 * Get the minimum required tier for a specific model
 * @param {string} model - The AI model identifier
 * @returns {string|null} - The minimum tier name or null if not found
 */
export function getMinimumTierForModel(model) {
  const tiers = ['free', 'starter', 'professional', 'business', 'enterprise'];
  
  for (const tier of tiers) {
    if (MODEL_ACCESS_BY_TIER[tier]?.includes(model)) {
      return tier;
    }
  }
  
  return null;
}

/**
 * Get all models available for a subscription tier
 * @param {string} subscriptionTier - User's subscription tier
 * @returns {Array} - Array of available model identifiers
 */
export function getAvailableModels(subscriptionTier = 'free') {
  const tier = subscriptionTier?.toLowerCase() || 'free';
  return MODEL_ACCESS_BY_TIER[tier] || MODEL_ACCESS_BY_TIER.free;
}

/**
 * Check if user needs to upgrade to access a model
 * @param {string} model - The AI model identifier
 * @param {string} currentTier - User's current subscription tier
 * @returns {Object} - { needsUpgrade: boolean, minimumTier: string|null }
 */
export function checkUpgradeRequirement(model, currentTier = 'free') {
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
    starter: 'Starter',
    professional: 'Professional',
    business: 'Business',
    enterprise: 'Enterprise'
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