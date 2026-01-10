import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

// This endpoint creates voice profile entries for existing remix channels
// Run this once to fix existing remix channels that don't have voice profiles

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all remix channels for the user that don't have voice profiles
    const { data: remixChannels, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_remix', true);

    if (channelError) {
      apiLogger.error('Error fetching remix channels', channelError, { userId: user.id });
      return NextResponse.json({ error: 'Failed to fetch remix channels' }, { status: 500 });
    }

    if (!remixChannels || remixChannels.length === 0) {
      return NextResponse.json({ 
        message: 'No remix channels found to fix',
        fixed: 0
      });
    }

    // Check which channels already have voice profiles
    const { data: existingProfiles } = await supabase
      .from('voice_profiles')
      .select('channel_id')
      .in('channel_id', remixChannels.map(c => c.id));

    const existingChannelIds = new Set((existingProfiles || []).map(p => p.channel_id));
    const channelsToFix = remixChannels.filter(c => !existingChannelIds.has(c.id));

    if (channelsToFix.length === 0) {
      return NextResponse.json({ 
        message: 'All remix channels already have voice profiles',
        fixed: 0
      });
    }

    // Create voice profiles for channels that don't have them
    const voiceProfiles = [];
    
    for (const channel of channelsToFix) {
      // Get remix data if needed
      let remixData = {};
      if (channel.remix_id) {
        const { data: remixChannel } = await supabase
          .from('remix_channels')
          .select('combined_voice_profile, remix_config')
          .eq('id', channel.remix_id)
          .single();
        
        if (remixChannel) {
          remixData = remixChannel;
        }
      }
      
      const voiceProfileData = channel.voice_profile || 
                              remixData.combined_voice_profile || 
                              {};
      
      voiceProfiles.push({
        channel_id: channel.id,
        profile_name: `${channel.name || channel.title} Voice`,
        training_data: {
          combined_from_remix: true,
          remix_config: remixData.remix_config || {},
          created_from_fix: true,
          original_creation_date: channel.created_at,
          ...voiceProfileData
        },
        parameters: {
          tone: voiceProfileData.tone || ['engaging', 'authentic', 'dynamic'],
          style: voiceProfileData.style || ['conversational', 'informative'],
          personality: voiceProfileData.personality || ['enthusiastic', 'knowledgeable'],
          energy: voiceProfileData.energy || 'medium-high',
          pace: voiceProfileData.pace || 'moderate',
          vocabulary: voiceProfileData.vocabulary || 'accessible',
          humor: voiceProfileData.humor || 'light',
          status: 'completed'
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Insert all voice profiles
    const { data: createdProfiles, error: insertError } = await supabase
      .from('voice_profiles')
      .insert(voiceProfiles)
      .select();

    if (insertError) {
      apiLogger.error('Error creating voice profiles', insertError, { userId: user.id, channelCount: channelsToFix.length });
      return NextResponse.json({
        error: 'Failed to create voice profiles',
        details: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${createdProfiles.length} remix channels`,
      fixed: createdProfiles.length,
      profiles: createdProfiles.map(p => ({
        id: p.id,
        channel_id: p.channel_id,
        profile_name: p.profile_name
      }))
    });

  } catch (error) {
    apiLogger.error('Fix voice profiles error', error);
    return NextResponse.json(
      { error: 'Failed to fix voice profiles', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check status without making changes
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get remix channels count
    const { data: remixChannels, count: remixCount } = await supabase
      .from('channels')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_remix', true);

    // Get voice profiles count for remix channels
    const { data: voiceProfiles, count: profileCount } = await supabase
      .from('voice_profiles')
      .select('id', { count: 'exact' })
      .in('channel_id', (remixChannels || []).map(c => c.id));

    return NextResponse.json({
      remixChannels: remixCount || 0,
      voiceProfiles: profileCount || 0,
      needsFix: (remixCount || 0) - (profileCount || 0)
    });

  } catch (error) {
    apiLogger.error('Check voice profiles error', error);
    return NextResponse.json(
      { error: 'Failed to check voice profiles', details: error.message },
      { status: 500 }
    );
  }
}