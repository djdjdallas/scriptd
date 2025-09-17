import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelById, parseChannelData } from '@/lib/youtube/channel';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all channels for the user that don't have thumbnails
    const { data: channels, error: fetchError } = await supabase
      .from('channels')
      .select('id, youtube_channel_id, thumbnail_url')
      .eq('user_id', user.id)
      .is('thumbnail_url', null);

    if (fetchError) {
      console.error('Error fetching channels:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json({ message: 'All channels have thumbnails', updated: 0 });
    }

    // Update thumbnails for channels that don't have them
    const updates = await Promise.all(
      channels.map(async (channel) => {
        try {
          if (!channel.youtube_channel_id) {
            return null;
          }

          // Fetch fresh channel data from YouTube
          const channelData = await getChannelById(channel.youtube_channel_id);
          const parsedChannel = parseChannelData(channelData);

          // Update the channel with the thumbnail
          const thumbnailUrl = parsedChannel.thumbnails?.high?.url || 
                             parsedChannel.thumbnails?.medium?.url || 
                             parsedChannel.thumbnails?.default?.url;

          if (thumbnailUrl) {
            const { error: updateError } = await supabase
              .from('channels')
              .update({
                thumbnail_url: thumbnailUrl,
                title: parsedChannel.title,
                handle: parsedChannel.customUrl || channel.youtube_channel_id,
                subscriber_count: parsedChannel.statistics?.subscriberCount || 0,
                view_count: parsedChannel.statistics?.viewCount || 0,
                video_count: parsedChannel.statistics?.videoCount || 0,
                analytics_data: {
                  ...channel.analytics_data,
                  thumbnails: parsedChannel.thumbnails,
                  thumbnail_url: thumbnailUrl,
                }
              })
              .eq('id', channel.id);

            if (updateError) {
              console.error(`Error updating channel ${channel.id}:`, updateError);
              return null;
            }

            return channel.id;
          }
        } catch (error) {
          console.error(`Error processing channel ${channel.id}:`, error);
          return null;
        }
      })
    );

    const updatedCount = updates.filter(Boolean).length;

    return NextResponse.json({
      message: `Updated ${updatedCount} channel thumbnails`,
      updated: updatedCount,
      total: channels.length
    });
  } catch (error) {
    console.error('Error refreshing thumbnails:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh thumbnails' },
      { status: 500 }
    );
  }
}