// Credit bypass for development/testing or specific features
// This module helps track credit usage without actually deducting credits

import { createClient } from '@/lib/supabase/server';

// Log credit usage for bypassed operations (audit trail)
// Uses the existing credits_transactions table with type='usage' and amount=0
export async function logCreditUsage(userId, feature, amount, metadata = {}) {
  // IMPORTANT: Always log bypassed credit usage for audit purposes
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('credits_transactions')
      .insert({
        user_id: userId,
        amount: 0, // No credits deducted for bypassed usage
        type: 'usage',
        description: `[BYPASSED] ${feature}`,
        metadata: {
          ...metadata,
          bypassed: true,
          intended_amount: amount,
          bypass_reason: metadata.bypass_reason || 'credit_bypass_enabled',
          timestamp: new Date().toISOString()
        }
      });

    if (error) {
      // Log error but don't fail the operation
      console.error('[Credit Bypass Audit] Error logging bypassed usage:', error.message);
    }

    return { success: true, bypassed: true };
  } catch (err) {
    // Log error but don't fail the operation - audit logging should not block features
    console.error('[Credit Bypass Audit] Failed to log bypassed usage:', err.message);
    return { success: true, bypassed: true, auditError: err.message };
  }
}

// Check if feature should bypass credits
export function shouldBypassCredits(feature, userId) {
  // IMPORTANT: Credit bypass is controlled by explicit environment variables only.
  // Never bypass based on NODE_ENV to prevent accidental production bypasses.

  // Check explicit bypass flag (must be set intentionally)
  if (process.env.ENABLE_CREDIT_BYPASS === 'true') {
    // Only in explicit bypass mode AND for allowed users
    const bypassUsers = process.env.CREDIT_BYPASS_USER_IDS?.split(',') || [];
    if (bypassUsers.includes(userId)) {
      return true;
    }
  }

  // Beta features that don't require credits (controlled via env)
  const betaFeatures = (process.env.BETA_FREE_FEATURES || '').split(',').filter(Boolean);
  if (betaFeatures.includes(feature)) {
    return true;
  }

  // Admin users (explicit list only)
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',').filter(Boolean) || [];
  if (adminUsers.includes(userId)) {
    return true;
  }

  return false;
}

// Wrapper for credit operations with bypass logic
export async function withCreditBypass(userId, feature, amount, operation) {
  if (shouldBypassCredits(feature, userId)) {
    await logCreditUsage(userId, feature, amount, { bypassed: true });
    return operation();
  }
  
  // Normal credit deduction flow
  const { deductCredits } = await import('@/lib/credits');
  const result = await deductCredits(userId, feature, { amount });
  
  if (!result.success) {
    throw new Error(result.error || 'Insufficient credits');
  }
  
  return operation();
}

// Validate credits with bypass logic
export async function validateCreditsWithBypass(userId, feature, requiredCredits) {
  if (shouldBypassCredits(feature, userId)) {
    return { valid: true, bypassed: true };
  }
  
  const { checkBalance } = await import('@/lib/credits');
  const balance = await checkBalance(userId);
  
  if (balance < requiredCredits) {
    return { 
      valid: false, 
      error: 'Insufficient credits',
      required: requiredCredits,
      balance
    };
  }
  
  return { valid: true, balance };
}

// Conditional credit deduction
export async function conditionalCreditDeduction(userId, feature, options = {}) {
  const { amount = 1, condition = true } = options;
  
  if (!condition) {
    return { success: true, skipped: true };
  }
  
  if (shouldBypassCredits(feature, userId)) {
    await logCreditUsage(userId, feature, amount, { bypassed: true });
    return { success: true, bypassed: true };
  }
  
  const { deductCredits } = await import('@/lib/credits');
  return deductCredits(userId, feature, { amount });
}