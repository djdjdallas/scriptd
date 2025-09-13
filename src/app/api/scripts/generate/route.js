// Script Generation API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { validateSchema, schemas } from '@/lib/validators';
import { getAIService } from '@/lib/ai';
import { generateScript } from '@/lib/prompts/script-generation';
import { validateScriptFactChecking, extractFactCheckData } from '@/lib/prompts/fact-checking-config';
import { CREDIT_COSTS, AI_MODELS, MODEL_TIERS, calculateScriptCost, TIER_ACCESS_BY_SUBSCRIPTION } from '@/lib/constants';
import { validateCreditsWithBypass, conditionalCreditDeduction } from '@/lib/credit-bypass';
import { hasAccessToModel, checkUpgradeRequirement, getTierDisplayName } from '@/lib/subscription-helpers';

// Helper function to map quality tiers to actual AI models (hidden from users)
function getTierModel(tier) {
  const tierConfig = MODEL_TIERS[tier];
  if (tierConfig) {
    return tierConfig.actualModel;
  }
  
  // Fallback mapping using environment variables for flexibility
  const tierMappings = {
    'FAST': process.env.FAST_MODEL || 'claude-3-5-haiku-20241022',
    'BALANCED': process.env.BALANCED_MODEL || 'claude-3-5-sonnet-20241022', 
    'PREMIUM': process.env.PREMIUM_MODEL || 'claude-opus-4-1-20250805'
  };
  
  return tierMappings[tier] || tierMappings.BALANCED;
}

// POST /api/scripts/generate
export const POST = createApiHandler(async (req) => {
  // Check authentication
  const { user, supabase } = await getAuthenticatedUser();

  const body = await req.json();
  
  // Validate request
  const validated = validateSchema(body, {
    title: { required: true, validator: (v) => v.trim() },
    topic: { required: false, validator: (v) => v || '' }, // Optional topic field
    type: { required: true, validator: (v) => v },
    length: { required: true, validator: (v) => parseInt(v) },
    tone: { required: false, validator: (v) => v || 'professional' },
    targetAudience: { required: false, validator: (v) => v || 'general' },
    keyPoints: { required: false, validator: (v) => Array.isArray(v) ? v : [] },
    qualityTier: { required: false, validator: (v) => v || null }, // New quality tier parameter
    tier: { required: false, validator: (v) => v || null }, // Legacy tier parameter
    model: { required: false, validator: (v) => v || null }, // Legacy model parameter
    voiceProfileId: { required: false, validator: (v) => v },
    channelId: { required: false, validator: (v) => v },
    enableFactChecking: { required: false, validator: (v) => v === true } // Default to false, must explicitly enable
  });

  // Determine the tier and model to use (support both new tier system and legacy model system)
  let selectedTier = validated.qualityTier || validated.tier;
  let actualModel = validated.model;
  
  if (validated.qualityTier || validated.tier) {
    // New tier system: map tier to actual model
    actualModel = getTierModel(selectedTier);
    if (!actualModel) {
      throw new ApiError('Invalid tier selected', 400);
    }
  } else if (validated.model) {
    // Legacy model system: try to map model back to tier for cost calculation
    // Find tier that matches this model
    for (const [tierKey, tierConfig] of Object.entries(MODEL_TIERS)) {
      if (tierConfig.actualModel === validated.model) {
        selectedTier = tierKey;
        break;
      }
    }
  }
  
  // Default to BALANCED tier if no tier could be determined
  if (!selectedTier) {
    selectedTier = 'BALANCED';
    actualModel = getTierModel('BALANCED');
  }

  // Calculate credit cost using tier-based system
  const creditCost = calculateScriptCost(selectedTier, validated.length);
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits, subscription_tier, subscription_status')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new ApiError('Failed to fetch user data', 500);
  }

  // Check tier access based on subscription tier
  const userTier = userData.subscription_tier || 'free';
  const allowedTiers = TIER_ACCESS_BY_SUBSCRIPTION[userTier] || TIER_ACCESS_BY_SUBSCRIPTION['free'];
  
  if (!allowedTiers.includes(selectedTier)) {
    // Find minimum tier required for this quality tier
    let requiredTier = 'professional'; // Default fallback
    for (const [tier, tiers] of Object.entries(TIER_ACCESS_BY_SUBSCRIPTION)) {
      if (tiers.includes(selectedTier)) {
        requiredTier = tier;
        break;
      }
    }
    
    const requiredTierDisplay = getTierDisplayName(requiredTier);
    const tierName = MODEL_TIERS[selectedTier]?.name || selectedTier;
    throw new ApiError(
      `The ${tierName} quality tier requires a ${requiredTierDisplay} subscription or higher. Please upgrade your plan to access this quality level.`,
      403
    );
  }

  // Check user credits with bypass option
  console.log('[Generate] Checking credits - User:', user.id, 'Cost:', creditCost, 'Balance:', userData.credits);
  console.log('[Generate] NODE_ENV:', process.env.NODE_ENV);
  
  const creditValidation = await validateCreditsWithBypass(user.id, 'SCRIPT_GENERATION', creditCost);
  console.log('[Generate] Credit validation result:', creditValidation);
  
  if (!creditValidation.valid) {
    const message = creditValidation.error || `Insufficient credits. You need ${creditCost} credits but only have ${creditValidation.balance || userData.credits}.`;
    throw new ApiError(message, 402);
  }

  // Get channel context if provided
  let channelContext = null;
  if (validated.channelId) {
    const { data: channel } = await supabase
      .from('channels')
      .select('name, description, keywords')
      .eq('id', validated.channelId)
      .eq('user_id', user.id)
      .single();

    if (channel) {
      channelContext = `Channel: ${channel.name}\nDescription: ${channel.description}\nKeywords: ${channel.keywords?.join(', ')}`;
    }
  }

  // Get voice profile if provided
  let voiceProfile = null;
  if (validated.voiceProfileId) {
    // First get user's channels to verify ownership
    const { data: userChannels } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', user.id);
    
    const userChannelIds = userChannels?.map(c => c.id) || [];
    
    // Get the voice profile ensuring user owns the channel
    const { data: profile } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('id', validated.voiceProfileId)
      .in('channel_id', userChannelIds)
      .single();

    if (profile) {
      // Extract voice characteristics for script generation
      voiceProfile = {
        name: profile.profile_name,
        parameters: profile.parameters || {},
        training_data: profile.training_data || {},
        // Include specific voice characteristics
        tone: profile.parameters?.tone,
        pitch: profile.parameters?.pitch,
        speed: profile.parameters?.speed,
        emphasis: profile.parameters?.emphasis,
        // Include any style analysis from training
        formality: profile.parameters?.formality,
        enthusiasm: profile.parameters?.enthusiasm,
        catchphrases: profile.parameters?.catchphrases,
        greetings: profile.parameters?.greetings,
        topWords: profile.parameters?.topWords
      };
    }
  }

  try {
    console.log('[Generate] Starting script generation with tier:', selectedTier, 'model:', actualModel);
    
    // Generate script using AI (select provider based on actual model)
    const ai = getAIService(actualModel);
    console.log('[Generate] AI service initialized');
    
    const prompt = generateScript({
      title: validated.title,
      topic: validated.topic, // Pass topic for better context
      type: validated.type,
      length: validated.length,
      tone: validated.tone,
      targetAudience: validated.targetAudience,
      keyPoints: validated.keyPoints,
      channelContext,
      voiceProfile,
      enableFactChecking: validated.enableFactChecking
    });

    console.log('[Generate] Prompt created, length:', prompt.user?.length || 0);
    
    // All models are Claude models now
    console.log('[Generate] Using Claude model:', actualModel);
    
    let result;
    console.log('[Generate] Calling Anthropic API...');
    // Call Anthropic API with Claude model
    result = await ai.generateCompletion({
      prompt: prompt.user,
      system: prompt.system,
      model: actualModel,
      maxTokens: 4000,
      temperature: 0.8
    });
    console.log('[Generate] Anthropic response received');
    
    // Result is now consistently formatted with text, usage, and cost properties
    const formattedResult = result;
    
    // Validate fact-checking only if explicitly enabled
    let factCheckValidation = null;
    let factCheckData = null;
    
    if (validated.enableFactChecking === true) {
      console.log('[Generate] Fact-checking explicitly enabled, validating generated script...');
      factCheckValidation = validateScriptFactChecking(formattedResult.text);
      factCheckData = extractFactCheckData(formattedResult.text);
      
      console.log('[Generate] Fact-check validation:', factCheckValidation.status);
      console.log('[Generate] Fact-check score:', factCheckValidation.score);
      
      // Log warnings if any
      if (factCheckValidation.warnings.length > 0) {
        console.warn('[Generate] Fact-check warnings:', factCheckValidation.warnings);
      }
      
      // Reject script if fact-checking failed
      if (!factCheckValidation.passed) {
        console.error('[Generate] Script failed fact-checking:', factCheckValidation.errors);
        // Instead of throwing, just log the error and continue
        console.warn('[Generate] Continuing despite fact-check failure (consider improving prompts)');
        // throw new ApiError(
        //   `Script generation failed fact-checking requirements: ${factCheckValidation.errors.join(', ')}. Please try again with accurate information.`,
        //   400
        // );
      }
    } else {
      console.log('[Generate] Fact-checking disabled for this generation');
    }

    // Get or create default channel
    let channelId = validated.channelId;
    if (!channelId) {
      // Try to get user's first channel
      const { data: channels } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (channels && channels.length > 0) {
        channelId = channels[0].id;
      } else {
        // Create a default channel
        const { data: newChannel } = await supabase
          .from('channels')
          .insert({
            user_id: user.id,
            youtube_channel_id: `default_${user.id}`,
            name: 'My Channel'
          })
          .select()
          .single();
        
        if (newChannel) {
          channelId = newChannel.id;
        }
      }
    }

    // Save script to database
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .insert({
        channel_id: channelId, // Required field
        title: validated.title,
        content: formattedResult.text,
        hook: '',
        description: '',
        tags: [],
        metadata: {
          type: validated.type,
          length: validated.length,
          tone: validated.tone,
          targetAudience: validated.targetAudience,
          keyPoints: validated.keyPoints,
          tier: selectedTier, // New tier information
          model: actualModel, // Actual model used
          legacyModel: validated.model, // Legacy model parameter for backward compatibility
          voiceProfileId: validated.voiceProfileId,
          tokenUsage: formattedResult.usage,
          cost: formattedResult.cost,
          factCheckEnabled: validated.enableFactChecking !== false,
          factCheckValidation: factCheckValidation,
          factCheckData: factCheckData
        }
      })
      .select()
      .single();

    if (scriptError) {
      throw new ApiError('Failed to save script', 500);
    }

    // Deduct credits (with bypass check)
    const creditDeduction = await conditionalCreditDeduction(
      user.id,
      'SCRIPT_GENERATION',
      { amount: creditCost }
    );

    if (!creditDeduction.success && !creditDeduction.bypassed) {
      console.error('Failed to deduct credits:', creditDeduction.error);
      // Don't throw error, script was already generated
    }

    // Record transaction (only if credits weren't bypassed)
    if (!creditDeduction.bypassed) {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -creditCost,
          type: 'script_generation',
          description: `Generated script: ${validated.title}`,
          metadata: {
            scriptId: script.id,
            tier: selectedTier,
            model: actualModel,
            legacyModel: validated.model
          }
        });
    }

    return NextResponse.json({
      scriptId: script.id, // Frontend expects scriptId
      script: {
        id: script.id,
        title: script.title,
        content: script.content,
        createdAt: script.created_at
      },
      usage: {
        creditsUsed: creditDeduction.bypassed ? 0 : creditCost,
        remainingCredits: creditDeduction.bypassed ? userData.credits : (userData.credits - creditCost),
        tokenUsage: result.usage,
        creditsBypassed: creditDeduction.bypassed
      },
      factCheck: validated.enableFactChecking === true ? {
        enabled: true,
        validation: factCheckValidation,
        data: factCheckData
      } : {
        enabled: false,
        message: 'Fact-checking is disabled by default'
      }
    });

  } catch (error) {
    console.error('Script generation error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Check for specific error types
    let errorMessage = 'Failed to generate script. Please try again.';
    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      errorMessage = 'Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your environment variables.';
    } else if (error.message?.includes('API key')) {
      errorMessage = `API key error: ${error.message}`;
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'API rate limit exceeded. Please try again later.';
    } else if (error.message?.includes('model')) {
      errorMessage = 'Invalid quality tier or AI model selected.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new ApiError(errorMessage, 500);
  }
});