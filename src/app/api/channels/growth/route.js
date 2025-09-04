import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelGrowthMetrics, getComparativeGrowthMetrics } from '@/lib/youtube/growth-metrics';

// GET /api/channels/growth - Get growth metrics for all user's channels
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const period = parseInt(searchParams.get('period') || '30');

    if (channelId) {
      // Get metrics for specific channel
      const { data: channel, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .eq('user_id', user.id)
        .single();

      if (error || !channel) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
      }

      const metrics = await getChannelGrowthMetrics(
        channel.id,
        {
          subscriber_count: channel.subscriber_count,
          view_count: channel.view_count,
          video_count: channel.video_count,
          engagement_rate: channel.analytics_data?.engagement_rate
        },
        period
      );

      return NextResponse.json({
        success: true,
        data: {
          channel: {
            id: channel.id,
            name: channel.title || channel.name,
            thumbnail: channel.thumbnail_url
          },
          metrics
        }
      });
    } else {
      // Get comparative metrics for all channels
      const comparativeMetrics = await getComparativeGrowthMetrics(user.id);
      
      return NextResponse.json({
        success: true,
        data: comparativeMetrics
      });
    }
  } catch (error) {
    console.error('Error fetching growth metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch growth metrics' },
      { status: 500 }
    );
  }
}

// POST /api/channels/growth - Store current metrics snapshot
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelId } = await request.json();

    // Verify channel ownership
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single();

    if (channelError || !channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Store metrics snapshot
    const { data: snapshot, error: snapshotError } = await supabase
      .from('channel_metrics_history')
      .insert({
        channel_id: channelId,
        subscriber_count: channel.subscriber_count,
        view_count: channel.view_count,
        video_count: channel.video_count,
        average_views: channel.analytics_data?.avgViewsPerVideo || 0,
        engagement_rate: channel.analytics_data?.engagement_rate || 0,
        metadata: {
          title: channel.title || channel.name,
          handle: channel.handle
        }
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('Error storing metrics snapshot:', snapshotError);
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    console.error('Error storing metrics:', error);
    return NextResponse.json(
      { error: 'Failed to store metrics' },
      { status: 500 }
    );
  }
}