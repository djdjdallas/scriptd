import { createClient } from '@/lib/supabase/client';
import { CREDIT_COSTS } from '@/lib/constants';

export class CreditManager {
  static async checkBalance(userId) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .rpc('get_available_credit_balance', { p_user_id: userId });
    
    if (error) {
      console.error('Error checking credit balance:', error);
      return 0;
    }
    
    return data || 0;
  }

  static async deductCredits(userId, feature, options = {}) {
    const supabase = createClient();
    
    // Get the cost for this feature
    const cost = this.getFeatureCost(feature, options);
    
    if (cost === 0) {
      return { success: true, cost: 0 };
    }
    
    // Check if user has enough credits
    const balance = await this.checkBalance(userId);
    
    if (balance < cost) {
      return { 
        success: false, 
        error: 'Insufficient credits',
        required: cost,
        balance: balance
      };
    }
    
    // Deduct credits using the database function
    const { data, error } = await supabase
      .rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: cost,
        p_description: this.getFeatureDescription(feature, options)
      });
    
    if (error) {
      console.error('Error deducting credits:', error);
      return { 
        success: false, 
        error: 'Failed to deduct credits' 
      };
    }
    
    return { 
      success: data === true, 
      cost,
      remainingBalance: balance - cost
    };
  }

  static getFeatureCost(feature, options = {}) {
    const costs = CREDIT_COSTS[feature];
    
    if (!costs) {
      console.error(`Unknown feature: ${feature}`);
      return 0;
    }
    
    // If costs is an object (e.g., different models), use the specified model
    if (typeof costs === 'object' && options.model) {
      return costs[options.model] || 0;
    }
    
    // If costs is a number, return it directly
    if (typeof costs === 'number') {
      return costs;
    }
    
    // Default to GPT-3.5 if no model specified
    return costs.GPT35 || 0;
  }

  static getFeatureDescription(feature, options = {}) {
    const featureName = feature.replace(/_/g, ' ').toLowerCase();
    
    switch (feature) {
      case 'SCRIPT_GENERATION':
        return `Script generation${options.model ? ` (${options.model})` : ''}`;
      case 'TITLE_GENERATION':
        return 'Title generation';
      case 'HOOK_GENERATION':
        return 'Hook generation';
      case 'DESCRIPTION_GENERATION':
        return 'Description generation';
      case 'THUMBNAIL_IDEAS':
        return 'Thumbnail ideas generation';
      case 'VOICE_TRAINING':
        return 'Voice profile training';
      case 'VOICE_MATCHING':
        return 'Voice matching analysis';
      case 'KEYWORD_RESEARCH':
        return 'Keyword research';
      case 'IDEATION':
        return 'Content ideation';
      default:
        return featureName;
    }
  }

  static async canAffordFeature(userId, feature, options = {}) {
    const cost = this.getFeatureCost(feature, options);
    const balance = await this.checkBalance(userId);
    
    return {
      canAfford: balance >= cost,
      cost,
      balance,
      shortfall: Math.max(0, cost - balance)
    };
  }

  static async recordUsage(userId, feature, options = {}) {
    // This is an alias for deductCredits but can be extended
    // to include analytics, usage tracking, etc.
    const result = await this.deductCredits(userId, feature, options);
    
    if (result.success) {
      // Could add analytics tracking here
      console.log(`Credit usage recorded: ${feature} for user ${userId}`);
    }
    
    return result;
  }

  static async refundCredits(userId, amount, reason) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('credits_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'refund',
        description: reason || 'Credit refund'
      });
    
    if (error) {
      console.error('Error refunding credits:', error);
      return { success: false, error: 'Failed to refund credits' };
    }
    
    return { success: true, amount };
  }

  static async getTransactionHistory(userId, limit = 20) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('credits_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
    
    return data || [];
  }

  static async getPurchaseHistory(userId) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('credit_purchase_history')
      .select('*, credit_packages(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching purchase history:', error);
      return [];
    }
    
    return data || [];
  }

  static async getExpiringCredits(userId, daysAhead = 30) {
    const supabase = createClient();
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);
    
    const { data, error } = await supabase
      .from('credits_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'purchase')
      .eq('is_expired', false)
      .lt('expires_at', expiryDate.toISOString())
      .order('expires_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching expiring credits:', error);
      return [];
    }
    
    return data || [];
  }
}