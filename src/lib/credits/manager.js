import { createClient } from '@/lib/supabase/client';
import { CREDIT_COSTS } from '@/lib/constants';

export class CreditManager {
  static async checkBalance(userId) {
    const supabase = createClient();
    
    // Get user's credit balance from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error checking user credits:', userError);
      // Try to calculate from transactions as fallback
      const { data: transactions, error: txError } = await supabase
        .from('credits_transactions')
        .select('amount, type')
        .eq('user_id', userId);
      
      if (txError) {
        console.error('Error checking credit transactions:', txError);
        return 0;
      }
      
      // Calculate balance from transactions
      let balance = 0;
      transactions?.forEach(tx => {
        if (tx.type === 'purchase' || tx.type === 'bonus') {
          balance += tx.amount;
        } else if (tx.type === 'usage') {
          balance -= Math.abs(tx.amount);
        }
      });
      
      return Math.max(0, balance);
    }
    
    return userData?.credits || 0;
  }

  static async deductCredits(userId, feature, options = {}) {
    const supabase = createClient();
    
    // Allow custom calculated cost to override feature cost
    const cost = options.calculatedCost || this.getFeatureCost(feature, options);
    
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
    
    // Start a transaction to deduct credits
    try {
      // Update user's credit balance
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ 
          credits: balance - cost,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('credits')
        .single();
      
      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return { 
          success: false, 
          error: 'Failed to update credits',
          details: updateError.message
        };
      }
      
      // Record the transaction
      const { error: txError } = await supabase
        .from('credits_transactions')
        .insert({
          user_id: userId,
          amount: -cost, // Negative for usage
          type: 'usage',
          description: this.getFeatureDescription(feature, options),
          metadata: {
            feature,
            ...options
          }
        });
      
      if (txError) {
        console.error('Error recording credit transaction:', txError);
        // Transaction recording failed, but credits were deducted
        // This is not ideal but we'll allow it to proceed
      }
      
      return { 
        success: true, 
        cost,
        remainingBalance: updateData.credits
      };
    } catch (error) {
      console.error('Error in credit deduction:', error);
      return { 
        success: false, 
        error: 'Failed to deduct credits',
        details: error.message
      };
    }
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