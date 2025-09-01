// Re-export everything from manager.js
export * from './manager.js';

// Export convenience functions
import { CreditManager } from './manager.js';

export const deductCredits = (userId, feature, options) => 
  CreditManager.deductCredits(userId, feature, options);

export const checkBalance = (userId) => 
  CreditManager.checkBalance(userId);

export const canAffordFeature = (userId, feature, options) =>
  CreditManager.canAffordFeature(userId, feature, options);