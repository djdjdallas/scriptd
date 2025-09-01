// Voice Training API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { validateSchema } from '@/lib/validators';
import { getAIService } from '@/lib/ai';
import { analyzeVoicePrompt } from '@/lib/prompts/voice-matching';
import { CREDIT_COSTS } from '@/lib/constants';
import { validateCreditsWithBypass, conditionalCreditDeduction, logCreditUsage } from '@/lib/credit-bypass';

// POST /api/voice/train
export const POST = createApiHandler(async (req) => {
  // Check authentication
  const { user, supabase } = await getAuthenticatedUser();

  const body = await req.json();
  
  // Validate request
  const validated = validateSchema(body, {
    profileName: { required: true, validator: (v) => v.trim().length >= 3 },
    samples: { required: true, validator: (v) => Array.isArray(v) && v.length >= 3 },
    channelId: { required: false, validator: (v) => v },
    description: { required: false, validator: (v) => v || '' }
  });

  // Check user credits
  const creditCost = CREDIT_COSTS.VOICE_TRAINING;
  
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

  // Validate samples
  const validSamples = validated.samples.filter(sample => 
    sample && sample.trim().length >= 100
  );

  if (validSamples.length < 3) {
    throw new ApiError('At least 3 samples with 100+ characters each are required', 400);
  }

  try {
    // Analyze voice characteristics using AI
    const ai = getAIService();
    const prompt = analyzeVoicePrompt(validSamples);

    const result = await ai.generateChat({
      model: 'claude-3-opus-20240229', // Best model for voice analysis
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ],
      maxTokens: 2000,
      temperature: 0.3 // Lower temperature for consistent analysis
    });

    // Parse voice analysis results
    let voiceProfile;
    try {
      voiceProfile = JSON.parse(result.text);
    } catch (e) {
      // If not valid JSON, create structured profile from text
      voiceProfile = {
        characteristics: {
          tone: 'professional',
          style: 'informative',
          complexity: 'medium',
          personality: result.text
        },
        patterns: [],
        vocabulary: [],
        rawAnalysis: result.text
      };
    }

    // Create voice profile in database
    const { data: profile, error: profileError } = await supabase
      .from('voice_profiles')
      .insert({
        user_id: user.id,
        channel_id: validated.channelId,
        profile_name: validated.profileName,
        description: validated.description,
        training_data: {
          samples: validSamples,
          sampleCount: validSamples.length,
          totalWords: validSamples.join(' ').split(/\s+/).length,
          analyzedAt: new Date().toISOString()
        },
        parameters: voiceProfile,
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new ApiError('Failed to create voice profile', 500);
    }

    // Deduct credits (unless bypassed)
    const creditDeduction = await conditionalCreditDeduction(
      supabase, 
      user.id, 
      userData.credits, 
      creditCost, 
      userData
    );

    if (!creditDeduction.success && !creditDeduction.bypassed) {
      console.error('Failed to deduct credits:', creditDeduction.error);
    }

    // Log credit usage
    logCreditUsage({
      userId: user.id,
      action: 'voice_training',
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
          type: 'voice_training',
          description: `Voice training: ${validated.profileName}`,
          metadata: {
            voiceProfileId: profile.id,
            sampleCount: validSamples.length
          }
        });
    }

    return {
      profile: {
        id: profile.id,
        name: profile.profile_name,
        description: profile.description,
        characteristics: voiceProfile.characteristics || {},
        patterns: voiceProfile.patterns || [],
        createdAt: profile.created_at
      },
      usage: {
        creditsUsed: creditDeduction.bypassed ? 0 : creditCost,
        remainingCredits: creditDeduction.remainingCredits || userData.credits,
        samplesAnalyzed: validSamples.length,
        creditsBypassed: creditDeduction.bypassed
      }
    };

  } catch (error) {
    console.error('Voice training error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      'Failed to train voice profile. Please try again.',
      500
    );
  }
});