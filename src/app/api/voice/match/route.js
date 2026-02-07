// Voice Matching API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { validateSchema } from '@/lib/validators';
import { getAIService } from '@/lib/ai';
import { matchVoicePrompt } from '@/lib/prompts/voice-matching';
import { CREDIT_COSTS } from '@/lib/constants';
import { validateCreditsWithBypass, conditionalCreditDeduction, logCreditUsage } from '@/lib/credit-bypass';
import { apiLogger } from '@/lib/monitoring/logger';

// POST /api/voice/match - Apply voice profile to content
export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const body = await req.json();
  
  // Validate request
  const validated = validateSchema(body, {
    content: { required: true, validator: (v) => v.trim().length >= 50 },
    voiceProfileId: { required: true, validator: (v) => v },
    preserveStructure: { required: false, validator: (v) => typeof v === 'boolean' || v === undefined },
    tone: { required: false, validator: (v) => v || 'match' } // match, enhance, simplify
  });

  // Check user credits
  const creditCost = CREDIT_COSTS.SCRIPT_GENERATION.GPT4_TURBO; // Voice matching uses similar credits
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits, email, bypass_credits')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new ApiError('Failed to fetch user data', 500);
  }

  // Validate credits with bypass
  const creditValidation = validateCreditsWithBypass(userData.credits, creditCost, userData);
  
  if (!creditValidation.isValid) {
    throw new ApiError(creditValidation.message, 402);
  }

  // Fetch voice profile
  const { data: voiceProfile, error: profileError } = await supabase
    .from('voice_profiles')
    .select('*')
    .eq('id', validated.voiceProfileId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (profileError || !voiceProfile) {
    throw new ApiError('Voice profile not found or inactive', 404);
  }

  try {
    // Apply voice matching using AI
    const ai = getAIService();
    const prompt = matchVoicePrompt(
      validated.content,
      voiceProfile.parameters,
      {
        preserveStructure: validated.preserveStructure !== false,
        tone: validated.tone
      }
    );

    const result = await ai.generateChatCompletion({
      model: 'claude-opus-4-6', // Best for voice matching
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ],
      maxTokens: 4000,
      temperature: 0.7
    });

    // Calculate similarity score (basic implementation)
    const originalWords = validated.content.split(/\s+/).length;
    const matchedWords = result.text.split(/\s+/).length;
    const similarityScore = Math.min(100, Math.round((matchedWords / originalWords) * 85 + 15));

    // Deduct credits (unless bypassed)
    const creditDeduction = await conditionalCreditDeduction(
      supabase, 
      user.id, 
      userData.credits, 
      creditCost, 
      userData
    );

    if (!creditDeduction.success && !creditDeduction.bypassed) {
      apiLogger.error('Failed to deduct credits', null, { error: creditDeduction.error });
    }

    // Log credit usage
    logCreditUsage({
      userId: user.id,
      action: 'voice_matching',
      creditCost,
      bypassed: creditDeduction.bypassed
    });

    // Record transaction (only if credits weren't bypassed)
    if (!creditDeduction.bypassed) {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -creditCost,
          type: 'voice_matching',
          description: `Voice matching with: ${voiceProfile.profile_name}`,
          metadata: {
            voiceProfileId: validated.voiceProfileId,
            contentLength: validated.content.length,
            similarityScore
          }
        });
    }

    return {
      matched: {
        content: result.text,
        voiceProfile: {
          id: voiceProfile.id,
          name: voiceProfile.profile_name
        },
        metrics: {
          originalLength: validated.content.length,
          matchedLength: result.text.length,
          similarityScore,
          preservedStructure: validated.preserveStructure !== false
        }
      },
      usage: {
        creditsUsed: creditDeduction.bypassed ? 0 : creditCost,
        remainingCredits: creditDeduction.remainingCredits || userData.credits,
        tokenUsage: result.usage,
        creditsBypassed: creditDeduction.bypassed
      }
    };

  } catch (error) {
    apiLogger.error('Voice matching error', error);

    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      'Failed to apply voice matching. Please try again.',
      500
    );
  }
});