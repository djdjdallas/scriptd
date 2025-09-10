import { createClient } from '@/lib/supabase/server';

export class OnboardingService {
  constructor() {
    this.supabase = null;
  }

  async initialize() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this;
  }

  /**
   * Check if user needs onboarding
   */
  async needsOnboarding(userId) {
    const { data: user } = await this.supabase
      .from('users')
      .select('onboarding_completed, onboarding_step')
      .eq('id', userId)
      .single();

    return !user?.onboarding_completed;
  }

  /**
   * Get user's onboarding status
   */
  async getOnboardingStatus(userId) {
    const { data, error } = await this.supabase
      .rpc('get_onboarding_status', { p_user_id: userId });

    if (error) {
      console.error('Error getting onboarding status:', error);
      return null;
    }

    return data;
  }

  /**
   * Update onboarding progress
   */
  async updateProgress(userId, stepName, stepNumber, completed = true, data = {}) {
    const { data: result, error } = await this.supabase
      .rpc('update_onboarding_progress', {
        p_user_id: userId,
        p_step_name: stepName,
        p_step_number: stepNumber,
        p_completed: completed,
        p_data: data
      });

    if (error) {
      console.error('Error updating onboarding progress:', error);
      return false;
    }

    return result;
  }

  /**
   * Skip onboarding entirely
   */
  async skipOnboarding(userId) {
    const { data, error } = await this.supabase
      .rpc('skip_onboarding', { p_user_id: userId });

    if (error) {
      console.error('Error skipping onboarding:', error);
      return false;
    }

    return true;
  }

  /**
   * Get onboarding analytics
   */
  async getOnboardingAnalytics(userId) {
    const { data: analytics } = await this.supabase
      .from('onboarding_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return analytics || [];
  }

  /**
   * Check and claim onboarding rewards
   */
  async checkRewards(userId) {
    const { data: rewards } = await this.supabase
      .from('onboarding_rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('claimed', false);

    return rewards || [];
  }

  /**
   * Claim a reward
   */
  async claimReward(userId, rewardId) {
    const { data, error } = await this.supabase
      .from('onboarding_rewards')
      .update({ 
        claimed: true, 
        claimed_at: new Date().toISOString() 
      })
      .eq('id', rewardId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error claiming reward:', error);
      return null;
    }

    // Apply the reward based on type
    if (data.reward_type === 'credits') {
      const credits = data.reward_value.amount || 0;
      await this.supabase
        .from('users')
        .update({ credits: this.supabase.raw(`credits + ${credits}`) })
        .eq('id', userId);
    }

    return data;
  }

  /**
   * Get step data for a specific step
   */
  async getStepData(userId, stepName) {
    const { data } = await this.supabase
      .from('user_onboarding_progress')
      .select('data')
      .eq('user_id', userId)
      .eq('step_name', stepName)
      .single();

    return data?.data || {};
  }

  /**
   * Track onboarding event
   */
  async trackEvent(userId, eventType, stepName = null, metadata = {}) {
    const { error } = await this.supabase
      .from('onboarding_analytics')
      .insert({
        user_id: userId,
        event_type: eventType,
        step_name: stepName,
        metadata: metadata,
        session_id: metadata.session_id || null
      });

    if (error) {
      console.error('Error tracking onboarding event:', error);
    }
  }

  /**
   * Get recommended next steps for user
   */
  async getNextSteps(userId) {
    const status = await this.getOnboardingStatus(userId);
    
    if (!status) return [];

    const nextSteps = [];

    // Check incomplete steps
    if (!status.completed) {
      nextSteps.push({
        type: 'complete_onboarding',
        title: 'Complete Your Setup',
        description: 'Finish onboarding to unlock all features',
        priority: 1
      });
    }

    // Check if channel is connected
    const channelStep = status.progress?.find(p => p.step_name === 'channel');
    if (!channelStep?.completed) {
      nextSteps.push({
        type: 'connect_channel',
        title: 'Connect Your YouTube Channel',
        description: 'Link your channel for personalized features',
        priority: 2
      });
    }

    // Check if voice is trained
    const voiceStep = status.progress?.find(p => p.step_name === 'voice');
    if (!voiceStep?.completed) {
      nextSteps.push({
        type: 'train_voice',
        title: 'Train Your AI Voice',
        description: 'Let AI learn your unique style',
        priority: 3
      });
    }

    return nextSteps;
  }

  /**
   * Check if specific feature is unlocked
   */
  async isFeatureUnlocked(userId, feature) {
    const status = await this.getOnboardingStatus(userId);
    
    // Define feature requirements
    const featureRequirements = {
      'team_collaboration': ['profile', 'channel'],
      'voice_training': ['channel'],
      'advanced_analytics': ['channel', 'goals'],
      'script_templates': []
    };

    const required = featureRequirements[feature] || [];
    
    if (required.length === 0) return true;

    const completedSteps = status?.progress
      ?.filter(p => p.completed)
      ?.map(p => p.step_name) || [];

    return required.every(req => completedSteps.includes(req));
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();