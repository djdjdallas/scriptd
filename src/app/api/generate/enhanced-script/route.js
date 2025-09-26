import { NextResponse } from 'next/server';
import { generateScriptWithEnhancedVoice } from '@/lib/ai/remix-voice-analyzer';
import { getChannel } from '@/lib/db/channels';
import { trackUsage } from '@/lib/credits';

export async function POST(request) {
  try {
    const { channelId, topic, tier = 'balanced', features = {} } = await request.json();
    
    if (!channelId || !topic) {
      return NextResponse.json(
        { error: 'Channel ID and topic are required' },
        { status: 400 }
      );
    }
    
    // Get channel data with voice profile
    const channel = await getChannel(channelId);
    
    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }
    
    // Check if channel has enhanced voice profile
    const hasEnhancedProfile = channel.voice_profile?.linguisticFingerprints;
    
    if (!hasEnhancedProfile) {
      console.log(`Channel ${channelId} missing enhanced profile, will use defaults`);
    }
    
    // Generate script with enhanced voice patterns
    const scriptResult = await generateScriptWithEnhancedVoice(channel, topic, {
      tier,
      features
    });
    
    // Track credit usage based on tier
    const creditCost = {
      fast: 1,
      balanced: 3,
      premium: 5
    }[tier] || 3;
    
    await trackUsage(request, 'script_generation', creditCost);
    
    // Return the generated script with metadata
    return NextResponse.json({
      success: true,
      script: scriptResult.content,
      voiceCompliance: scriptResult.voiceCompliance,
      complianceScore: scriptResult.overallScore,
      metadata: {
        channel: channel.name,
        topic,
        tier,
        hasEnhancedProfile,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Enhanced script generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate script',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check voice profile status
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    
    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }
    
    const channel = await getChannel(channelId);
    
    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }
    
    // Check voice profile depth
    const voiceProfile = channel.voice_profile || {};
    const profileDepth = {
      hasBasic: Boolean(voiceProfile.tone || voiceProfile.style),
      hasAdvanced: Boolean(voiceProfile.dos || voiceProfile.donts),
      hasEnhanced: Boolean(voiceProfile.linguisticFingerprints),
      hasNarrative: Boolean(voiceProfile.narrativeStructure),
      hasEmotional: Boolean(voiceProfile.emotionalDynamics),
      hasTechnical: Boolean(voiceProfile.technicalPatterns),
      hasEngagement: Boolean(voiceProfile.engagementTechniques)
    };
    
    // Calculate profile completeness
    const completenessScore = Object.values(profileDepth).filter(Boolean).length / 7 * 100;
    
    return NextResponse.json({
      channelId,
      channelName: channel.name,
      profileDepth,
      completenessScore: Math.round(completenessScore),
      recommendation: completenessScore < 50 
        ? 'Consider analyzing more videos to improve voice accuracy'
        : 'Voice profile is comprehensive and ready for high-quality generation'
    });
    
  } catch (error) {
    console.error('Profile check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check profile',
        details: error.message 
      },
      { status: 500 }
    );
  }
}