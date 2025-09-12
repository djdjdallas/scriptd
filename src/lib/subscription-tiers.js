// AI Feature configuration for subscription tiers
export const AI_FEATURES = {
  FREE: {
    contentAnalysis: { enabled: false, limit: 0 },
    trendAnalysis: { enabled: false, limit: 0 },
    videoIdeas: { enabled: false, limit: 0 },
    seoOptimization: { enabled: false, limit: 0 },
    voiceTraining: { enabled: false, limit: 0 },
    hookGeneration: { enabled: false, limit: 0 },
    commentAnalysis: { enabled: false, limit: 0 },
    analyticsIntelligence: { enabled: false, limit: 0 },
    contentRepurposing: { enabled: false, limit: 0 }
  },
  STARTER: {
    contentAnalysis: { enabled: true, limit: 5, creditsPerUse: 3 },
    trendAnalysis: { enabled: true, limit: 5, creditsPerUse: 2 },
    videoIdeas: { enabled: true, limit: 10, creditsPerUse: 2 },
    seoOptimization: { enabled: true, limit: 10, creditsPerUse: 1 },
    voiceTraining: { enabled: false, limit: 0 },
    hookGeneration: { enabled: true, limit: 20, creditsPerUse: 1 },
    commentAnalysis: { enabled: false, limit: 0 },
    analyticsIntelligence: { enabled: false, limit: 0 },
    contentRepurposing: { enabled: false, limit: 0 }
  },
  PRO: {
    contentAnalysis: { enabled: true, limit: 50, creditsPerUse: 2 },
    trendAnalysis: { enabled: true, limit: 50, creditsPerUse: 1 },
    videoIdeas: { enabled: true, limit: 100, creditsPerUse: 1 },
    seoOptimization: { enabled: true, limit: 100, creditsPerUse: 1 },
    voiceTraining: { enabled: true, limit: 10, creditsPerUse: 5 },
    hookGeneration: { enabled: true, limit: 200, creditsPerUse: 1 },
    commentAnalysis: { enabled: true, limit: 50, creditsPerUse: 2 },
    analyticsIntelligence: { enabled: true, limit: 20, creditsPerUse: 3 },
    contentRepurposing: { enabled: true, limit: 50, creditsPerUse: 2 }
  },
  BUSINESS: {
    contentAnalysis: { enabled: true, limit: -1, creditsPerUse: 1 }, // -1 = unlimited
    trendAnalysis: { enabled: true, limit: -1, creditsPerUse: 1 },
    videoIdeas: { enabled: true, limit: -1, creditsPerUse: 0 },
    seoOptimization: { enabled: true, limit: -1, creditsPerUse: 0 },
    voiceTraining: { enabled: true, limit: -1, creditsPerUse: 2 },
    hookGeneration: { enabled: true, limit: -1, creditsPerUse: 0 },
    commentAnalysis: { enabled: true, limit: -1, creditsPerUse: 1 },
    analyticsIntelligence: { enabled: true, limit: -1, creditsPerUse: 1 },
    contentRepurposing: { enabled: true, limit: -1, creditsPerUse: 1 }
  }
};

// Helper function to check if user can use AI feature
export async function canUseAIFeature(userId, feature, supabase) {
  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier, credits')
    .eq('id', userId)
    .single();
  
  const tier = user?.subscription_tier || 'FREE';
  const featureConfig = AI_FEATURES[tier][feature];
  
  if (!featureConfig.enabled) {
    return { allowed: false, reason: 'Feature not available in your plan' };
  }
  
  if (featureConfig.creditsPerUse > user.credits) {
    return { allowed: false, reason: 'Insufficient credits' };
  }
  
  // Check monthly limits
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { count } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', startOfMonth.toISOString());
  
  if (featureConfig.limit !== -1 && count >= featureConfig.limit) {
    return { allowed: false, reason: 'Monthly limit reached' };
  }
  
  return { allowed: true, creditsRequired: featureConfig.creditsPerUse };
}

// Subscription plan definitions with AI features
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    credits: 15,
    features: [
      '15 credits per month',
      'Basic script generation',
      'Limited YouTube tools',
      'Community support'
    ],
    aiFeatures: AI_FEATURES.FREE
  },
  STARTER: {
    name: 'Starter',
    price: 29,
    credits: 100,
    features: [
      '100 credits per month',
      'AI Content Analysis (5/month)',
      'AI Trend Analysis (5/month)',
      'Video Ideas Generator (10/month)',
      'SEO Optimization (10/month)',
      'Hook Generation (20/month)',
      'Priority support'
    ],
    aiFeatures: AI_FEATURES.STARTER
  },
  PRO: {
    name: 'Pro',
    price: 79,
    credits: 500,
    features: [
      '500 credits per month',
      'All Starter features with higher limits',
      'AI Voice Training (10/month)',
      'Comment Sentiment Analysis (50/month)',
      'Analytics Intelligence (20/month)',
      'Content Repurposing (50/month)',
      'Team collaboration',
      'Priority support'
    ],
    aiFeatures: AI_FEATURES.PRO
  },
  BUSINESS: {
    name: 'Business',
    price: 199,
    credits: 2000,
    features: [
      '2000 credits per month',
      'Unlimited AI features',
      'Custom AI training',
      'API access',
      'White-label options',
      'Dedicated support',
      'Custom integrations'
    ],
    aiFeatures: AI_FEATURES.BUSINESS
  }
};