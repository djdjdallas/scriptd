// Enhanced Script Generation API Route with 2025 Optimizations

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { validateSchema } from '@/lib/validators';
import { getAIService } from '@/lib/ai';
import { generateEnhancedScript, createChainPrompts, predictScriptPerformance } from '@/lib/prompts/script-generation-v2';
import { generateEnhancedScriptPrompt } from '@/lib/prompts/enhanced-script-generation';
import { normalizeVoiceProfile } from '@/lib/voice-training/normalizer';
import { generateHook } from '@/lib/script-generation/hook-engine';
import { CREDIT_COSTS, AI_MODELS } from '@/lib/constants';
import { validateCreditsWithBypass, conditionalCreditDeduction } from '@/lib/credit-bypass';
import { checkUpgradeRequirement, getTierDisplayName } from '@/lib/subscription-helpers';
import { getPostHogClient } from '@/lib/posthog-server';
import { apiLogger } from '@/lib/monitoring/logger';
import { checkFeatureRateLimit } from '@/lib/api/rate-limit';

// POST /api/scripts/generate-enhanced
export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();
  const body = await req.json();
  
  // Enhanced validation with new parameters
  const validated = validateSchema(body, {
    title: { required: true, validator: (v) => v.trim() },
    type: { required: true, validator: (v) => v },
    length: { required: true, validator: (v) => parseInt(v) },
    tone: { required: false, validator: (v) => v || 'professional' },
    targetAudience: { required: false, validator: (v) => v || 'general' },
    keyPoints: { required: false, validator: (v) => Array.isArray(v) ? v : [] },
    model: { required: false, validator: (v) => v || AI_MODELS.GPT4_TURBO },
    voiceProfileId: { required: false, validator: (v) => v },
    channelId: { required: false, validator: (v) => v },
    platform: { required: false, validator: (v) => v || 'youtube_long' },
    performanceGoals: { required: false, validator: (v) => v || {} },
    useChainPrompting: { required: false, validator: (v) => v || false },
    includePrediction: { required: false, validator: (v) => v || true }
  });

  // Credit and subscription checks
  const creditCost = CREDIT_COSTS.SCRIPT_GENERATION[validated.model] || 10;
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits, subscription_tier, subscription_status')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new ApiError('Failed to fetch user data', 500);
  }

  // Check model access
  const userTier = userData.subscription_tier || 'free';

  // Check feature-specific rate limit (scripts per day based on subscription tier)
  const rateLimitCheck = await checkFeatureRateLimit(user.id, 'scripts', userTier);
  if (!rateLimitCheck.success) {
    throw new ApiError(
      `Daily script limit reached. ${userTier === 'free' ? 'Free users can generate 3 scripts per day. Upgrade to generate more.' : 'Please try again tomorrow.'}`,
      429
    );
  }

  const upgradeCheck = checkUpgradeRequirement(validated.model, userTier);

  if (upgradeCheck.needsUpgrade) {
    const requiredTier = getTierDisplayName(upgradeCheck.minimumTier);
    throw new ApiError(
      `This AI model requires a ${requiredTier} subscription or higher.`,
      403
    );
  }

  // Credit validation
  const creditValidation = await validateCreditsWithBypass(user.id, 'SCRIPT_GENERATION', creditCost);

  if (!creditValidation.valid) {
    const message = creditValidation.error || `Insufficient credits. You need ${creditCost} credits.`;
    throw new ApiError(message, 402);
  }

  const generationStartTime = Date.now();

  // Track script generation started
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user.id,
    event: 'script_generation_started',
    properties: {
      generation_source: 'enhanced',
      script_type: validated.type,
      script_length: validated.length,
      model: validated.model,
      platform: validated.platform,
      tone: validated.tone,
      has_voice_profile: !!validated.voiceProfileId,
      has_channel: !!validated.channelId,
      use_chain_prompting: !!validated.useChainPrompting,
      include_prediction: !!validated.includePrediction,
      subscription_tier: userTier,
    }
  });

  // Get channel context if provided
  let channelContext = null;
  let channelObject = null;
  if (validated.channelId) {
    const { data: channel } = await supabase
      .from('channels')
      .select('name, description, keywords')
      .eq('id', validated.channelId)
      .eq('user_id', user.id)
      .single();

    if (channel) {
      channelObject = channel;
      channelContext = `Channel: ${channel.name}\nDescription: ${channel.description}\nKeywords: ${channel.keywords?.join(', ')}`;
    }
  }

  // Get voice profile if provided - check voice_profiles table first,
  // then fall back to channels.voice_profile for deep analysis data
  let voiceProfile = null;
  if (validated.voiceProfileId) {
    const { data: profile } = await supabase
      .from('voice_profiles')
      .select('parameters, training_data, channel_id')
      .eq('id', validated.voiceProfileId)
      .single();

    if (profile) {
      voiceProfile = profile.parameters;
    }

    // If the voice_profiles entry is a basic profile but the channel has a
    // deep analysis profile, prefer the deep one
    if (profile?.channel_id) {
      const isBasicProfile = voiceProfile && !voiceProfile.linguisticFingerprints && !Array.isArray(voiceProfile.tone);
      if (isBasicProfile || !voiceProfile) {
        const { data: channel } = await supabase
          .from('channels')
          .select('voice_profile')
          .eq('id', profile.channel_id)
          .single();

        if (channel?.voice_profile && (channel.voice_profile.linguisticFingerprints || Array.isArray(channel.voice_profile.tone))) {
          voiceProfile = channel.voice_profile;
        }
      }
    }
  } else if (validated.channelId) {
    // No voice profile ID but channel ID provided - check channel's voice_profile directly
    const { data: channel } = await supabase
      .from('channels')
      .select('voice_profile')
      .eq('id', validated.channelId)
      .eq('user_id', user.id)
      .single();

    if (channel?.voice_profile && Object.keys(channel.voice_profile).length > 0) {
      voiceProfile = channel.voice_profile;
    }
  }

  // Block script generation if voice profile is still a placeholder
  if (voiceProfile?.isPlaceholder === true || voiceProfile?.status === 'training_pending') {
    throw new ApiError(
      'Voice profile is still being trained. Script generation will unlock when training completes.',
      409
    );
  }

  // Get trending topics for the niche (optional enhancement)
  let trendingTopics = [];
  if (validated.performanceGoals.useTrending) {
    // This could be enhanced with real trending data API
    trendingTopics = ['AI tools', 'productivity', 'automation']; // Placeholder
  }

  // Get previous high-performing scripts for learning (optional)
  let previousScripts = [];
  if (validated.performanceGoals.learnFromPrevious) {
    const { data: topScripts } = await supabase
      .from('scripts')
      .select('title, content, metadata')
      .eq('channel_id', validated.channelId)
      .order('created_at', { ascending: false })
      .limit(3);
    
    previousScripts = topScripts || [];
  }

  try {
    // Pre-generate a dedicated hook before main script generation
    let preGeneratedHook = null;
    try {
      const hookResult = await generateHook({
        voiceProfile,
        scriptContext: {
          title: validated.title,
          type: validated.type,
          targetAudience: validated.targetAudience,
          tone: validated.tone,
          length: validated.length,
        },
        channelName: channelContext?.split('\n')?.[0]?.replace('Channel: ', '') || '',
      });
      if (hookResult.success) {
        preGeneratedHook = hookResult.hook;
        apiLogger.info('Hook pre-generated successfully', { hookLength: preGeneratedHook.length });
      }
    } catch (hookError) {
      apiLogger.warn('Hook pre-generation failed, proceeding without', { error: hookError.message });
    }

    // Generate enhanced script
    const ai = getAIService(validated.model);

    // Route to deep profile prompt generator if profile has full linguistic data
    const hasDeepVoiceProfile = (profile) =>
      profile?.linguisticFingerprints && profile?.narrativeStructure && profile?.emotionalDynamics;

    let enhancedPrompt;
    let generationPath;

    if (voiceProfile && hasDeepVoiceProfile(voiceProfile)) {
      // Use the enhanced prompt generator with 10-category voice decomposition
      const normalizedProfile = normalizeVoiceProfile(voiceProfile);
      const deepPromptText = generateEnhancedScriptPrompt({
        topic: validated.title,
        channel: channelObject || { name: channelContext?.split('\n')?.[0]?.replace('Channel: ', '') || 'Creator' },
        voiceProfile: normalizedProfile,
        tier: userTier === 'premium' ? 'premium' : 'balanced',
        features: { factChecking: true },
      });
      enhancedPrompt = {
        system: 'You are an elite YouTube script writer. Follow the voice implementation instructions precisely.',
        user: deepPromptText,
        metadata: { generationPath: 'enhanced_deep_profile' },
      };
      generationPath = 'enhanced';
      apiLogger.info('Using enhanced deep-profile prompt generator', { channel: channelObject?.name });
    } else {
      // Standard v2 generation
      enhancedPrompt = generateEnhancedScript({
        title: validated.title,
        type: validated.type,
        length: validated.length,
        tone: validated.tone,
        targetAudience: validated.targetAudience,
        keyPoints: validated.keyPoints,
        channelContext,
        voiceProfile,
        platform: validated.platform,
        trendingTopics,
        previousScripts,
        performanceGoals: validated.performanceGoals,
      });
      generationPath = 'v2_standard';
      apiLogger.info('Using v2 standard prompt generator');
    }

    // Inject pre-generated hook into user prompt if available
    let userPrompt = enhancedPrompt.user;
    if (preGeneratedHook) {
      userPrompt += `\n\nMANDATORY OPENING HOOK (use EXACTLY as first lines): ${preGeneratedHook}. Do NOT modify this hook.`;
    }

    // Generate initial script
    const isAnthropic = validated.model.includes('claude');
    const isGroq = validated.model.includes('mistral') || validated.model.includes('mixtral');

    let result;
    if (isAnthropic || isGroq) {
      result = await ai.generateCompletion({
        prompt: userPrompt,
        system: enhancedPrompt.system,
        model: validated.model,
        maxTokens: 4000,
        temperature: 0.8
      });
    } else {
      const text = await ai.generateCompletion(
        userPrompt,
        {
          model: validated.model,
          systemPrompt: enhancedPrompt.system,
          maxTokens: 4000,
          temperature: 0.8
        }
      );
      result = {
        text: text,
        usage: { totalTokens: 4000 },
        cost: 0.01
      };
    }

    let finalScript = result.text;
    let chainResults = [];

    // Apply chain prompting if requested
    if (validated.useChainPrompting) {
      const chainPrompts = createChainPrompts(
        { hook: extractHook(result.text), content: result.text },
        validated.performanceGoals
      );

      for (const chainPrompt of chainPrompts) {
        const chainResult = isAnthropic || isGroq ?
          await ai.generateCompletion({
            prompt: chainPrompt.prompt,
            system: 'You are an expert script optimizer focused on maximizing YouTube retention.',
            model: validated.model,
            maxTokens: 1000,
            temperature: 0.7
          }) :
          await ai.generateCompletion(
            chainPrompt.prompt,
            {
              model: validated.model,
              systemPrompt: 'You are an expert script optimizer focused on maximizing YouTube retention.',
              maxTokens: 1000,
              temperature: 0.7
            }
          );

        chainResults.push({
          name: chainPrompt.name,
          improvement: typeof chainResult === 'string' ? chainResult : chainResult.text
        });
      }
    }

    // Predict performance if requested
    let performancePrediction = null;
    if (validated.includePrediction) {
      performancePrediction = predictScriptPerformance(
        { hook: extractHook(finalScript), content: finalScript }
      );
    }

    // Get or create default channel
    let channelId = validated.channelId;
    if (!channelId) {
      const { data: channels } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (channels && channels.length > 0) {
        channelId = channels[0].id;
      } else {
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

    // Save enhanced script with metadata
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .insert({
        channel_id: channelId,
        title: validated.title,
        content: finalScript,
        hook: extractHook(finalScript),
        description: extractDescription(finalScript),
        tags: extractTags(finalScript, validated.keyPoints),
        metadata: {
          type: validated.type,
          length: validated.length,
          tone: validated.tone,
          targetAudience: validated.targetAudience,
          keyPoints: validated.keyPoints,
          model: validated.model,
          voiceProfileId: validated.voiceProfileId,
          platform: validated.platform,
          enhanced: true,
          enhancedMetadata: enhancedPrompt.metadata,
          chainResults,
          performancePrediction,
          tokenUsage: result.usage,
          cost: result.cost
        }
      })
      .select()
      .single();

    if (scriptError) {
      throw new ApiError('Failed to save script', 500);
    }

    // Deduct credits
    const creditDeduction = await conditionalCreditDeduction(
      user.id,
      'SCRIPT_GENERATION',
      { amount: creditCost }
    );

    // Record transaction
    if (!creditDeduction.bypassed) {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -creditCost,
          type: 'script_generation',
          description: `Enhanced script: ${validated.title}`,
          metadata: {
            scriptId: script.id,
            model: validated.model,
            enhanced: true
          }
        });
    }

    // Track script generation completed in PostHog
    posthog.capture({
      distinctId: user.id,
      event: 'script_generation_completed',
      properties: {
        generation_source: 'enhanced',
        script_id: script.id,
        script_type: validated.type,
        script_length: validated.length,
        tone: validated.tone,
        platform: validated.platform,
        model: validated.model,
        credits_used: creditDeduction.bypassed ? 0 : creditCost,
        credits_bypassed: !!creditDeduction.bypassed,
        generation_time_ms: Date.now() - generationStartTime,
        word_count: finalScript.split(/\s+/).length,
        has_voice_profile: !!validated.voiceProfileId,
        used_chain_prompting: !!validated.useChainPrompting,
        has_performance_prediction: !!performancePrediction,
        preGeneratedHook: !!preGeneratedHook,
        generation_path: generationPath,
        subscription_tier: userTier,
      }
    });

    return NextResponse.json({
      scriptId: script.id,
      script: {
        id: script.id,
        title: script.title,
        content: script.content,
        hook: script.hook,
        description: script.description,
        tags: script.tags,
        createdAt: script.created_at
      },
      enhancements: {
        metadata: enhancedPrompt.metadata,
        chainResults,
        performancePrediction
      },
      usage: {
        creditsUsed: creditDeduction.bypassed ? 0 : creditCost,
        remainingCredits: creditDeduction.bypassed ? userData.credits : (userData.credits - creditCost),
        tokenUsage: result.usage,
        creditsBypassed: creditDeduction.bypassed
      }
    });

  } catch (error) {
    apiLogger.error('Enhanced script generation error', error);

    // Track script generation failed
    posthog.capture({
      distinctId: user.id,
      event: 'script_generation_failed',
      properties: {
        generation_source: 'enhanced',
        script_type: validated.type,
        script_length: validated.length,
        model: validated.model,
        platform: validated.platform,
        error_message: error.message || 'Unknown error',
        error_type: error instanceof ApiError ? 'api_error' : 'unexpected_error',
        generation_time_ms: Date.now() - generationStartTime,
        subscription_tier: userTier,
      }
    });

    if (error instanceof ApiError) {
      throw error;
    }

    let errorMessage = 'Failed to generate enhanced script. Please try again.';
    if (error.message?.includes('API key')) {
      errorMessage = `API configuration error: ${error.message}`;
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'API rate limit exceeded. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new ApiError(errorMessage, 500);
  }
});

// Helper functions
function extractHook(content) {
  // Extract the hook from the script content
  const hookMatch = content.match(/\*\*HOOK.*?\*\*\s*([\s\S]*?)(?:\*\*|$)/);
  if (hookMatch) {
    return hookMatch[1].trim().slice(0, 200);
  }
  // Fallback: return first 200 characters
  return content.slice(0, 200);
}

function extractDescription(content) {
  // Extract a description from the script
  const sections = content.split(/\*\*[A-Z]+.*?\*\*/);
  if (sections.length > 2) {
    // Get the introduction or first main section
    return sections[2].trim().slice(0, 500);
  }
  return content.slice(200, 700);
}

function extractTags(content, keyPoints) {
  // Extract relevant tags from the script
  const tags = [...keyPoints];
  
  // Add common YouTube-relevant tags based on content
  const commonTags = ['tutorial', 'guide', 'tips', 'howto', 'review', 'explained'];
  commonTags.forEach(tag => {
    if (content.toLowerCase().includes(tag)) {
      tags.push(tag);
    }
  });
  
  // Extract any hashtags mentioned
  const hashtagMatches = content.match(/#\w+/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches.map(tag => tag.slice(1)));
  }
  
  return [...new Set(tags)].slice(0, 10); // Return unique tags, max 10
}