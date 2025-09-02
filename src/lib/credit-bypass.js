// Credit bypass for development/testing or specific features
// This module helps track credit usage without actually deducting credits

import { createClient } from '@/lib/supabase/client';

// Log credit usage without deducting
export async function logCreditUsage(userId, feature, amount, metadata = {}) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('credit_usage_logs')
      .insert({
        user_id: userId,
        feature,
        amount,
        metadata,
        bypassed: true,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging credit usage:', error);
    }
    
    return { success: true, bypassed: true };
  } catch (err) {
    console.error('Failed to log credit usage:', err);
    return { success: false, error: err.message };
  }
}

// Check if feature should bypass credits
export function shouldBypassCredits(feature, userId) {
  // Add bypass logic here
  // For example:
  // - Development environment
  // - Specific user IDs
  // - Certain features during beta
  
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Beta features that don't require credits
  const betaFeatures = ['VOICE_TRAINING', 'VOICE_MATCHING'];
  if (betaFeatures.includes(feature)) {
    return true;
  }
  
  // Admin users
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || [];
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