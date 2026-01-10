import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

// GET - Fetch user's saved videos
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
    const watched = searchParams.get('watched');
    
    let query = supabase
      .from('saved_videos')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (watched !== null) {
      query = query.eq('watched', watched === 'true');
    }

    const { data, error } = await query;

    if (error) {
      apiLogger.error('Error fetching saved videos', error);
      return NextResponse.json(
        { error: 'Failed to fetch saved videos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videos: data || []
    });
  } catch (error) {
    apiLogger.error('Error in GET saved videos', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save a video for later
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      videoId,
      videoTitle,
      channelName,
      channelId,
      thumbnailUrl,
      duration,
      views,
      likes,
      topicCategory,
      notes
    } = body;

    // Validate required fields
    if (!videoId || !videoTitle || !channelName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save the video
    const { data, error } = await supabase
      .from('saved_videos')
      .insert({
        user_id: user.id,
        video_id: videoId,
        video_title: videoTitle,
        channel_name: channelName,
        channel_id: channelId,
        thumbnail_url: thumbnailUrl,
        duration,
        views,
        likes,
        topic_category: topicCategory,
        notes
      })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Video already saved' },
          { status: 409 }
        );
      }
      apiLogger.error('Error saving video', error);
      return NextResponse.json(
        { error: 'Failed to save video' },
        { status: 500 }
      );
    }

    // Track analytics
    await supabase
      .from('video_analytics')
      .insert({
        user_id: user.id,
        video_id: videoId,
        video_title: videoTitle,
        channel_name: channelName,
        topic_category: topicCategory,
        action_type: 'save',
        referrer_page: request.headers.get('referer') || null
      });

    return NextResponse.json({
      success: true,
      video: data
    });
  } catch (error) {
    apiLogger.error('Error in POST save video', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a saved video
export async function DELETE(request) {
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

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID required' },
        { status: 400 }
      );
    }

    // Get video info before deletion for analytics
    const { data: videoData } = await supabase
      .from('saved_videos')
      .select('video_title, channel_name, topic_category')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single();

    // Delete the saved video
    const { error } = await supabase
      .from('saved_videos')
      .delete()
      .eq('user_id', user.id)
      .eq('video_id', videoId);

    if (error) {
      apiLogger.error('Error deleting saved video', error);
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      );
    }

    // Track analytics
    if (videoData) {
      await supabase
        .from('video_analytics')
        .insert({
          user_id: user.id,
          video_id: videoId,
          video_title: videoData.video_title,
          channel_name: videoData.channel_name,
          topic_category: videoData.topic_category,
          action_type: 'unsave',
          referrer_page: request.headers.get('referer') || null
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Video removed from saved list'
    });
  } catch (error) {
    apiLogger.error('Error in DELETE saved video', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update saved video (mark as watched, add notes, etc.)
export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { videoId, watched, notes } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID required' },
        { status: 400 }
      );
    }

    const updateData = {};
    if (watched !== undefined) updateData.watched = watched;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('saved_videos')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .select()
      .single();

    if (error) {
      apiLogger.error('Error updating saved video', error);
      return NextResponse.json(
        { error: 'Failed to update video' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      video: data
    });
  } catch (error) {
    apiLogger.error('Error in PATCH saved video', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}