import { CREDIT_COSTS } from '@/lib/constants';

export class ServerCreditManager {
  static async checkBalance(supabase, userId) {
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

  static async deductCredits(supabase, userId, feature, options = {}) {
    // Allow custom calculated cost to override feature cost
    const cost = options.calculatedCost || this.getFeatureCost(feature, options);
    
    if (cost === 0) {
      return { success: true, cost: 0 };
    }
    
    // Check if user has enough credits
    const balance = await this.checkBalance(supabase, userId);
    
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
      case 'HASHTAG_GENERATION':
        return 'Hashtag generation';
      case 'VIDEO_IDEAS':
        return 'Video idea generation';
      case 'CHANNEL_ANALYSIS':
        return 'Channel analysis';
      case 'RESEARCH_SESSION':
        return 'Research session';
      default:
        return featureName;
    }
  }

  static async addCredits(supabase, userId, amount, description = 'Credit purchase', metadata = {}) {
    try {
      // Get current balance
      const currentBalance = await this.checkBalance(supabase, userId);
      
      // Update user's credit balance
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ 
          credits: currentBalance + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('credits')
        .single();
      
      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return { 
          success: false, 
          error: 'Failed to add credits' 
        };
      }
      
      // Record the transaction
      const { error: txError } = await supabase
        .from('credits_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: metadata.type || 'purchase',
          description: description,
          metadata: metadata
        });
      
      if (txError) {
        console.error('Error recording credit transaction:', txError);
      }
      
      return { 
        success: true, 
        newBalance: updateData.credits
      };
    } catch (error) {
      console.error('Error adding credits:', error);
      return { 
        success: false, 
        error: 'Failed to add credits' 
      };
    }
  }
}