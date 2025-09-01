import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CreditManager } from '@/lib/credits/manager';
import { validateCreditsWithBypass } from '@/lib/credit-bypass';

export async function POST(request) {
  try {
    const { audioData, channelId, profileName } = await request.json();
    
    // Validate input
    if (!audioData || !channelId || !profileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns the channel
    const { data: channel } = await supabase
      .from('channels')
      .select('id')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or unauthorized' },
        { status: 403 }
      );
    }

    // Check credits using the bypass system
    const creditCheck = await validateCreditsWithBypass(user.id, 'VOICE_TRAINING');
    
    if (!creditCheck.hasCredits) {
      return NextResponse.json({
        error: 'Insufficient credits',
        required: creditCheck.required,
        balance: creditCheck.balance,
        message: `Voice training requires ${creditCheck.required} credits. Your balance is ${creditCheck.balance}.`
      }, { status: 402 });
    }

    // Simulate voice training process
    // In a real implementation, this would:
    // 1. Process the audio data
    // 2. Extract voice characteristics
    // 3. Train a voice model
    // 4. Store the model parameters
    
    const voiceProfile = {
      id: crypto.randomUUID(),
      channel_id: channelId,
      profile_name: profileName,
      training_data: {
        audio_length: audioData.length,
        sample_rate: 44100,
        processed_at: new Date().toISOString()
      },
      parameters: {
        pitch: Math.random() * 2 - 1,
        tone: Math.random() * 2 - 1,
        speed: Math.random() * 0.5 + 0.75,
        emphasis: Math.random()
      },
      status: 'completed',
      created_at: new Date().toISOString()
    };

    // Save voice profile
    const { data: savedProfile, error: saveError } = await supabase
      .from('voice_profiles')
      .insert(voiceProfile)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving voice profile:', saveError);
      return NextResponse.json(
        { error: 'Failed to save voice profile' },
        { status: 500 }
      );
    }

    // Deduct credits only after successful training
    if (!creditCheck.bypass) {
      const deductResult = await CreditManager.deductCredits(
        user.id,
        'VOICE_TRAINING',
        { channelId, profileName }
      );

      if (!deductResult.success) {
        // Log the error but don't fail the request since training succeeded
        console.error('Failed to deduct credits after voice training:', deductResult.error);
      }
    }

    return NextResponse.json({
      success: true,
      profile: savedProfile,
      creditsUsed: creditCheck.bypass ? 0 : CreditManager.getFeatureCost('VOICE_TRAINING'),
      message: 'Voice profile trained successfully'
    });

  } catch (error) {
    console.error('Voice training error:', error);
    return NextResponse.json(
      { error: 'Failed to train voice profile' },
      { status: 500 }
    );
  }
}

// GET endpoint to check voice training cost
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cost = CreditManager.getFeatureCost('VOICE_TRAINING');
    const balance = await CreditManager.checkBalance(user.id);
    
    return NextResponse.json({
      cost,
      balance,
      canAfford: balance >= cost
    });
  } catch (error) {
    console.error('Error checking voice training cost:', error);
    return NextResponse.json(
      { error: 'Failed to check cost' },
      { status: 500 }
    );
  }
}