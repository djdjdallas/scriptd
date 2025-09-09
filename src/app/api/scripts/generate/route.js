// Script Generation API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { validateSchema, schemas } from '@/lib/validators';
import { getAIService } from '@/lib/ai';
import { generateScript } from '@/lib/prompts/script-generation';
import { CREDIT_COSTS, AI_MODELS } from '@/lib/constants';
import { validateCreditsWithBypass, conditionalCreditDeduction } from '@/lib/credit-bypass';
import { hasAccessToModel, checkUpgradeRequirement, getTierDisplayName } from '@/lib/subscription-helpers';

// POST /api/scripts/generate
export const POST = createApiHandler(async (req) => {
  // Check authentication
  const { user, supabase } = await getAuthenticatedUser();

  const body = await req.json();
  
  // Validate request
  const validated = validateSchema(body, {
    title: { required: true, validator: (v) => v.trim() },
    type: { required: true, validator: (v) => v },
    length: { required: true, validator: (v) => parseInt(v) },
    tone: { required: false, validator: (v) => v || 'professional' },
    targetAudience: { required: false, validator: (v) => v || 'general' },
    keyPoints: { required: false, validator: (v) => Array.isArray(v) ? v : [] },
    model: { required: false, validator: (v) => v || AI_MODELS.GPT4_TURBO },
    voiceProfileId: { required: false, validator: (v) => v },
    channelId: { required: false, validator: (v) => v }
  });

  // Check user data and subscription
  const creditCost = CREDIT_COSTS.SCRIPT_GENERATION[validated.model] || 10;
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits, subscription_tier, subscription_status')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new ApiError('Failed to fetch user data', 500);
  }

  // Check model access based on subscription tier
  const userTier = userData.subscription_tier || 'free';
  const upgradeCheck = checkUpgradeRequirement(validated.model, userTier);
  
  if (upgradeCheck.needsUpgrade) {
    const requiredTier = getTierDisplayName(upgradeCheck.minimumTier);
    throw new ApiError(
      `This AI model requires a ${requiredTier} subscription or higher. Please upgrade your plan to access ${validated.model}.`,
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
    const { data: profile } = await supabase
      .from('voice_profiles')
      .select('profile_data')
      .eq('id', validated.voiceProfileId)
      .eq('user_id', user.id)
      .single();

    if (profile) {
      voiceProfile = profile.profile_data;
    }
  }

  try {
    console.log('[Generate] Starting script generation with model:', validated.model);
    
    // Generate script using AI (select provider based on model)
    const ai = getAIService(validated.model);
    console.log('[Generate] AI service initialized');
    
    const prompt = generateScript({
      title: validated.title,
      type: validated.type,
      length: validated.length,
      tone: validated.tone,
      targetAudience: validated.targetAudience,
      keyPoints: validated.keyPoints,
      channelContext,
      voiceProfile
    });

    console.log('[Generate] Prompt created, length:', prompt.user?.length || 0);
    
    // Check if this is an Anthropic model, GROQ model, or OpenAI model
    const isAnthropic = validated.model.includes('claude');
    const isGroq = validated.model.includes('mistral') || validated.model.includes('mixtral');
    console.log('[Generate] Model type - Anthropic:', isAnthropic, 'GROQ:', isGroq);
    
    let result;
    if (isAnthropic || isGroq) {
      console.log('[Generate] Calling', isAnthropic ? 'Anthropic' : 'GROQ', 'API...');
      // Both AnthropicProvider and GroqProvider return object with text, usage, cost
      result = await ai.generateCompletion({
        prompt: prompt.user,
        system: prompt.system,
        model: validated.model,
        maxTokens: 4000,
        temperature: 0.8
      });
      console.log('[Generate]', isAnthropic ? 'Anthropic' : 'GROQ', 'response received');
    } else {
      // OpenAI returns string directly
      const text = await ai.generateCompletion(
        prompt.user,
        {
          model: validated.model,
          systemPrompt: prompt.system,
          maxTokens: 4000,
          temperature: 0.8
        }
      );
      // Format OpenAI response to match Anthropic/GROQ structure
      result = {
        text: text,
        usage: { totalTokens: 4000 }, // Estimate for OpenAI
        cost: 0.01 // Estimate for OpenAI
      };
    }
    
    // Result is now consistently formatted with text, usage, and cost properties
    const formattedResult = result;

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
          model: validated.model,
          voiceProfileId: validated.voiceProfileId,
          tokenUsage: formattedResult.usage,
          cost: formattedResult.cost
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
            model: validated.model
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
    } else if (error.message?.includes('OPENAI_API_KEY')) {
      errorMessage = 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.';
    } else if (error.message?.includes('API key')) {
      errorMessage = `API key error: ${error.message}`;
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'API rate limit exceeded. Please try again later.';
    } else if (error.message?.includes('model')) {
      errorMessage = 'Invalid AI model selected.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new ApiError(errorMessage, 500);
  }
});