// Script Generation API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { validateSchema, schemas } from '@/lib/validators';
import { getAIService } from '@/lib/ai';
import { scriptPrompts } from '@/lib/prompts/script-generation';
import { CREDIT_COSTS, AI_MODELS } from '@/lib/constants';
import { validateCreditsWithBypass, conditionalCreditDeduction } from '@/lib/credit-bypass';

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

  // Check user credits
  const creditCost = CREDIT_COSTS.SCRIPT_GENERATION[validated.model] || 10;
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new ApiError('Failed to fetch user data', 500);
  }

  // Check user credits with bypass option
  const creditValidation = validateCreditsWithBypass(userData.credits, creditCost, user);
  if (!creditValidation.isValid) {
    throw new ApiError(creditValidation.message, 402);
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
    // Generate script using AI
    const ai = getAIService();
    const prompt = scriptPrompts.generateScript({
      title: validated.title,
      type: validated.type,
      length: validated.length,
      tone: validated.tone,
      targetAudience: validated.targetAudience,
      keyPoints: validated.keyPoints,
      channelContext,
      voiceProfile
    });

    const result = await ai.generateChat({
      model: validated.model,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ],
      maxTokens: 4000,
      temperature: 0.8
    });

    // Save script to database
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .insert({
        user_id: user.id,
        title: validated.title,
        type: validated.type,
        length: validated.length,
        content: result.text,
        metadata: {
          tone: validated.tone,
          targetAudience: validated.targetAudience,
          keyPoints: validated.keyPoints,
          model: validated.model,
          channelId: validated.channelId,
          voiceProfileId: validated.voiceProfileId,
          tokenUsage: result.usage,
          cost: result.cost
        }
      })
      .select()
      .single();

    if (scriptError) {
      throw new ApiError('Failed to save script', 500);
    }

    // Deduct credits (with bypass check)
    const creditDeduction = await conditionalCreditDeduction(
      supabase,
      user.id,
      userData.credits,
      creditCost,
      user
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

    return {
      script: {
        id: script.id,
        title: script.title,
        type: script.type,
        length: script.length,
        content: script.content,
        createdAt: script.created_at
      },
      usage: {
        creditsUsed: creditDeduction.bypassed ? 0 : creditCost,
        remainingCredits: creditDeduction.bypassed ? userData.credits : creditDeduction.remainingCredits,
        tokenUsage: result.usage,
        creditsBypassed: creditDeduction.bypassed
      }
    };

  } catch (error) {
    console.error('Script generation error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      'Failed to generate script. Please try again.',
      500
    );
  }
});