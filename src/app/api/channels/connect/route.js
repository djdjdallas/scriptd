import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelByUrl, parseChannelData } from '@/lib/youtube/channel';
import { queueVoiceTraining } from '@/lib/voice-training/queue';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }
    
    // Check if user is on free plan and already has a channel
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single();
    
    const isPremium = subscription?.status === 'active';
    
    if (!isPremium) {
      // Count existing channels for free users
      const { data: existingChannels } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', user.id);
      
      if (existingChannels && existingChannels.length >= 1) {
        return NextResponse.json({ 
          error: 'Channel limit reached. Free users can only have 1 channel. Upgrade to add more channels.',
          code: 'CHANNEL_LIMIT_REACHED'
        }, { status: 403 });
      }
    }

    // Fetch channel data from YouTube
    const channelData = await getChannelByUrl(url);
    const parsedChannel = parseChannelData(channelData);

    // Check if channel already exists for this user
    const { data: existingChannel } = await supabase
      .from('channels')
      .select('id')
      .eq('youtube_channel_id', parsedChannel.id)
      .eq('user_id', user.id)
      .single();

    if (existingChannel) {
      return NextResponse.json({ error: 'Channel already connected' }, { status: 409 });
    }

    // Save channel to database with voice training enabled
    const { data: channel, error: insertError } = await supabase
      .from('channels')
      .insert({
        user_id: user.id,
        youtube_channel_id: parsedChannel.id,
        title: parsedChannel.title || 'Unknown Channel',
        name: parsedChannel.title || 'Unknown Channel',
        handle: parsedChannel.customUrl || parsedChannel.id,
        subscriber_count: parsedChannel.statistics?.subscriberCount || 0,
        view_count: parsedChannel.statistics?.viewCount || 0,
        video_count: parsedChannel.statistics?.videoCount || 0,
        thumbnail_url: parsedChannel.thumbnails?.high?.url || parsedChannel.thumbnails?.medium?.url || parsedChannel.thumbnails?.default?.url,
        voice_profile: {},
        voice_training_status: null, // Start with null, will be updated to 'queued' after
        auto_train_enabled: true,
        is_active: true,
        analytics_data: {
          description: parsedChannel.description,
          custom_url: parsedChannel.customUrl,
          thumbnail_url: parsedChannel.thumbnails?.high?.url || parsedChannel.thumbnails?.medium?.url || parsedChannel.thumbnails?.default?.url,
          thumbnails: parsedChannel.thumbnails,
          video_count: parsedChannel.statistics?.videoCount,
          view_count: parsedChannel.statistics?.viewCount,
          published_at: parsedChannel.publishedAt,
          raw_data: channelData,
        },
      })
      .select()
      .single();

    if (insertError) {
      // Handle specific error cases
      if (insertError.code === '23505') {
        // Unique constraint violation
        if (insertError.message.includes('channels_youtube_channel_id_key')) {
          return NextResponse.json({
            error: 'This YouTube channel has already been added by another user. Run the database migration to allow multiple users to add the same channel.',
            code: 'CHANNEL_EXISTS_GLOBALLY',
            details: insertError.message
          }, { status: 409 });
        }
        if (insertError.message.includes('channels_youtube_channel_id_user_id_key')) {
          return NextResponse.json({
            error: 'You have already connected this channel.',
            code: 'CHANNEL_ALREADY_CONNECTED'
          }, { status: 409 });
        }
      }

      return NextResponse.json({
        error: 'Failed to save channel',
        details: insertError.message
      }, { status: 500 });
    }

    // Queue FREE voice training automatically after channel connection
    try {
      const jobId = await queueVoiceTraining({
        channelId: channel.id,
        userId: user.id,
        priority: 3, // Higher priority for new channels
        metadata: {
          channelName: parsedChannel.title,
          videoCount: parsedChannel.statistics?.videoCount || 0,
          trigger: 'channel_connection',
          isFree: true
        }
      });

      // Update channel with training status
      await supabase
        .from('channels')
        .update({
          voice_training_status: 'queued',
          voice_training_job_id: jobId
        })
        .eq('id', channel.id);

      channel.voice_training_status = 'queued';
      channel.voice_training_job_id = jobId;

    } catch (voiceError) {
      // Don't fail channel connection if voice training fails to queue
      console.error('Failed to queue voice training:', voiceError);
    }

    return NextResponse.json({ 
      channel,
      voiceTraining: {
        status: channel.voice_training_status || 'skipped',
        isFree: true,
        message: channel.voice_training_status === 'queued' 
          ? 'FREE voice training has been queued and will start automatically!' 
          : 'Channel connected successfully!'
      }
    });
  } catch (error) {
    console.error('Channel connection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect channel' },
      { status: 500 }
    );
  }
}