import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelById, parseChannelData } from '@/lib/youtube/channel';

export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get channel from database
    const { data: channel, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Always check for remix data (a channel might have remix data even if is_remix is false)
    try {
      // Get remix channel data
      const { data: remixData, error: remixError } = await supabase
        .from('remix_channels')
        .select('*')
        .eq('channel_id', id)
        .single();

      if (remixError && remixError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching remix data:', remixError);
      }
      
      // If we have remix data, ensure is_remix flag is set
      if (remixData) {
        channel.is_remix = true;
      }

        // Get channel remix analyses data if we have remix data
        if (remixData) {
          const { data: remixAnalyses, error: analysisError } = await supabase
            .from('channel_remix_analyses')
            .select('*')
            .eq('remix_channel_id', remixData.id)
            .order('generated_at', { ascending: false })
            .limit(1)
            .single();

          if (analysisError && analysisError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching remix analyses:', analysisError);
          }

          // Merge the data
          channel.remix_data = remixData;
          
          // Parse combined_voice_profile if it's a string
          if (remixData.combined_voice_profile) {
            try {
              channel.combined_voice_profile = typeof remixData.combined_voice_profile === 'string' 
                ? JSON.parse(remixData.combined_voice_profile)
                : remixData.combined_voice_profile;
              console.log('API: Set combined_voice_profile:', {
                hasBasic: !!channel.combined_voice_profile?.basic,
                hasTone: !!channel.combined_voice_profile?.basic?.tone,
                keys: Object.keys(channel.combined_voice_profile || {})
              });
            } catch (e) {
              console.error('Error parsing combined_voice_profile:', e);
              channel.combined_voice_profile = {};
            }
          }
          
          // Parse combined_analytics if needed
          if (remixData.combined_analytics) {
            try {
              channel.combined_analytics = typeof remixData.combined_analytics === 'string'
                ? JSON.parse(remixData.combined_analytics)
                : remixData.combined_analytics;
            } catch (e) {
              console.error('Error parsing combined_analytics:', e);
              channel.combined_analytics = {};
            }
          }
          
          if (remixAnalyses) {
            channel.remix_analysis = remixAnalyses;
            channel.audience_analysis = remixAnalyses.analysis_data?.audience;
          }
      }
    } catch (error) {
      console.error('Error fetching remix channel data:', error);
      // Continue without remix data rather than failing completely
    }

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get channel from database
    const { data: existingChannel, error: fetchError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Skip YouTube refresh for remix channels
    if (existingChannel.is_remix || existingChannel.youtube_channel_id?.startsWith('remix_')) {
      // For remix channels, just return the existing data
      return NextResponse.json({ channel: existingChannel });
    }

    // Fetch updated data from YouTube
    const channelData = await getChannelById(existingChannel.youtube_channel_id);
    const parsedChannel = parseChannelData(channelData);

    // Update channel in database
    const { data: channel, error: updateError } = await supabase
      .from('channels')
      .update({
        title: parsedChannel.title,
        description: parsedChannel.description,
        custom_url: parsedChannel.customUrl,
        thumbnail_url: parsedChannel.thumbnails?.default?.url,
        subscriber_count: parsedChannel.statistics.subscriberCount,
        video_count: parsedChannel.statistics.videoCount,
        view_count: parsedChannel.statistics.viewCount,
        raw_data: channelData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating channel:', updateError);
      return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
    }

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Error updating channel:', error);
    return NextResponse.json(
      { error: 'Failed to update channel' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete channel from database
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting channel:', error);
      return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json(
      { error: 'Failed to delete channel' },
      { status: 500 }
    );
  }
}