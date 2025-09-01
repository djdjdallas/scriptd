// Credit Bypass Middleware for Testing
// This module provides functionality to bypass credit checks during development/testing

/**
 * Checks if credit validation should be bypassed
 * @param {Object} user - The authenticated user object
 * @returns {boolean} - Whether to bypass credit checks
 */
export function shouldBypassCredits(user = null) {
  // Environment-based bypass
  if (process.env.BYPASS_CREDIT_CHECKS === 'true') {
    console.log('[Credit Bypass] Bypassing credits due to environment variable');
    return true;
  }

  // User-specific bypass (if user has a bypass flag)
  if (user && user.bypass_credits === true) {
    console.log(`[Credit Bypass] Bypassing credits for user ${user.id}`);
    return true;
  }

  // Development environment bypass (optional)
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_CREDITS_IN_DEV === 'true') {
    console.log('[Credit Bypass] Bypassing credits in development mode');
    return true;
  }

  return false;
}

/**
 * Validates user credits with bypass option
 * @param {number} userCredits - Current user credits
 * @param {number} requiredCredits - Credits required for operation
 * @param {Object} user - The authenticated user object
 * @returns {Object} - Validation result { isValid: boolean, message?: string, bypassed: boolean }
 */
export function validateCreditsWithBypass(userCredits, requiredCredits, user = null) {
  const bypass = shouldBypassCredits(user);
  
  if (bypass) {
    return {
      isValid: true,
      bypassed: true,
      message: 'Credit check bypassed for testing'
    };
  }

  if (userCredits < requiredCredits) {
    return {
      isValid: false,
      bypassed: false,
      message: `Insufficient credits. Need ${requiredCredits}, have ${userCredits}`
    };
  }

  return {
    isValid: true,
    bypassed: false
  };
}

/**
 * Conditionally deducts credits based on bypass status
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {number} currentCredits - Current credits
 * @param {number} creditCost - Credits to deduct
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Object>} - Result of credit deduction
 */
export async function conditionalCreditDeduction(supabase, userId, currentCredits, creditCost, user = null) {
  const bypass = shouldBypassCredits(user);
  
  if (bypass) {
    console.log(`[Credit Bypass] Skipping credit deduction of ${creditCost} credits for user ${userId}`);
    return {
      success: true,
      bypassed: true,
      remainingCredits: currentCredits
    };
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ credits: currentCredits - creditCost })
      .eq('id', userId);

    if (error) {
      return {
        success: false,
        error,
        bypassed: false
      };
    }

    return {
      success: true,
      bypassed: false,
      remainingCredits: currentCredits - creditCost
    };
  } catch (error) {
    return {
      success: false,
      error,
      bypassed: false
    };
  }
}