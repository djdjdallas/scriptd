import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelByUrl, parseChannelData } from '@/lib/youtube/channel';

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

    // Save channel to database
    const { data: channel, error: insertError } = await supabase
      .from('channels')
      .insert({
        user_id: user.id,
        youtube_channel_id: parsedChannel.id,
        title: parsedChannel.title,
        description: parsedChannel.description,
        custom_url: parsedChannel.customUrl,
        thumbnail_url: parsedChannel.thumbnails?.default?.url,
        subscriber_count: parsedChannel.statistics.subscriberCount,
        video_count: parsedChannel.statistics.videoCount,
        view_count: parsedChannel.statistics.viewCount,
        published_at: parsedChannel.publishedAt,
        raw_data: channelData,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving channel:', insertError);
      return NextResponse.json({ error: 'Failed to save channel' }, { status: 500 });
    }

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Error connecting channel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect channel' },
      { status: 500 }
    );
  }
}