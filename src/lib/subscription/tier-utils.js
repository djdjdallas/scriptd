/**
 * Tier hierarchy utilities for subscription tracking
 * Used to detect upgrades, downgrades, and subscription changes
 */

// Tier hierarchy from lowest to highest (based on PLANS in constants.js)
export const TIER_HIERARCHY = {
  free: 0,
  creator: 1,
  professional: 2,
  agency: 3
};

/**
 * Get numeric tier level for comparison
 * @param {string} tier - Subscription tier name
 * @returns {number} - Tier level (0-3)
 */
export function getTierLevel(tier) {
  return TIER_HIERARCHY[tier?.toLowerCase()] ?? 0;
}

/**
 * Compare two tiers to determine the type of change
 * @param {string|null} previousTier - Previous subscription tier
 * @param {string|null} newTier - New subscription tier
 * @returns {'new'|'upgrade'|'downgrade'|'same'} - Type of tier change
 */
export function compareTiers(previousTier, newTier) {
  // Handle new subscription from free/null tier
  if (!previousTier || previousTier === 'free') {
    return newTier && newTier !== 'free' ? 'new' : 'same';
  }

  const prevLevel = getTierLevel(previousTier);
  const newLevel = getTierLevel(newTier);

  if (newLevel > prevLevel) return 'upgrade';
  if (newLevel < prevLevel) return 'downgrade';
  return 'same';
}

/**
 * Determine the subscription event type based on tier change
 * @param {string|null} previousTier - Previous subscription tier
 * @param {string|null} newTier - New subscription tier
 * @param {boolean} isReactivation - Whether this is a reactivation of cancelled subscription
 * @returns {string|null} - Event type or null if no event needed
 */
export function getSubscriptionEventType(previousTier, newTier, isReactivation = false) {
  if (isReactivation) return 'subscription_reactivated';

  const comparison = compareTiers(previousTier, newTier);

  switch (comparison) {
    case 'new': return 'subscription_started';
    case 'upgrade': return 'subscription_upgraded';
    case 'downgrade': return 'subscription_downgraded';
    default: return null; // No event needed for same tier
  }
}

/**
 * Check if a tier is a paid tier
 * @param {string} tier - Subscription tier name
 * @returns {boolean} - True if tier is paid
 */
export function isPaidTier(tier) {
  return tier && tier !== 'free' && getTierLevel(tier) > 0;
}

/**
 * Get tier display name
 * @param {string} tier - Subscription tier name
 * @returns {string} - Formatted tier name
 */
export function getTierDisplayName(tier) {
  const names = {
    free: 'Free',
    creator: 'Creator',
    professional: 'Professional',
    agency: 'Agency'
  };
  return names[tier?.toLowerCase()] || 'Unknown';
}
