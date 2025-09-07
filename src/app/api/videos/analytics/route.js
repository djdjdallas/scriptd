import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Track video interactions
export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Get user if authenticated (optional - we can track anonymous views too)
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      videoId,
      videoTitle,
      channelName,
      topicCategory,
      actionType,
      sessionId
    } = body;

    // Validate required fields
    if (!videoId || !videoTitle || !channelName || !actionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ['watch', 'save', 'unsave', 'share'];
    if (!validActions.includes(actionType)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // Track the analytics
    const { error } = await supabase
      .from('video_analytics')
      .insert({
        user_id: user?.id || null,
        video_id: videoId,
        video_title: videoTitle,
        channel_name: channelName,
        topic_category: topicCategory,
        action_type: actionType,
        referrer_page: request.headers.get('referer') || null,
        session_id: sessionId
      });

    if (error) {
      console.error('Error tracking analytics:', error);
      return NextResponse.json(
        { error: 'Failed to track analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics tracked successfully'
    });
  } catch (error) {
    console.error('Error in POST analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch analytics (admin or user's own data)
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const actionType = searchParams.get('actionType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('video_analytics')
      .select('*')
      .eq('user_id', user.id)
      .order('clicked_at', { ascending: false })
      .limit(limit);

    if (videoId) {
      query = query.eq('video_id', videoId);
    }

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (startDate) {
      query = query.gte('clicked_at', startDate);
    }

    if (endDate) {
      query = query.lte('clicked_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summary = {
      totalActions: data.length,
      actionBreakdown: {},
      topVideos: [],
      topChannels: []
    };

    // Count actions by type
    const actionCounts = {};
    const videoCounts = {};
    const channelCounts = {};

    data.forEach(record => {
      // Action breakdown
      actionCounts[record.action_type] = (actionCounts[record.action_type] || 0) + 1;
      
      // Video counts
      const videoKey = `${record.video_id}|${record.video_title}`;
      videoCounts[videoKey] = (videoCounts[videoKey] || 0) + 1;
      
      // Channel counts
      channelCounts[record.channel_name] = (channelCounts[record.channel_name] || 0) + 1;
    });

    summary.actionBreakdown = actionCounts;

    // Top 5 videos
    summary.topVideos = Object.entries(videoCounts)
      .map(([key, count]) => {
        const [videoId, videoTitle] = key.split('|');
        return { videoId, videoTitle, interactions: count };
      })
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 5);

    // Top 5 channels
    summary.topChannels = Object.entries(channelCounts)
      .map(([channel, count]) => ({ channel, interactions: count }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data,
      summary
    });
  } catch (error) {
    console.error('Error in GET analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}