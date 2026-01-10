import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelVideos } from '@/lib/youtube/channel';
import { getVideoTranscript } from '@/lib/youtube/video';
import { apiLogger } from '@/lib/monitoring/logger';

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
    const { data: channel, error: fetchError } = await supabase
      .from('channels')
      .select('youtube_channel_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeTranscripts = searchParams.get('transcripts') === 'true';

    // Fetch videos from YouTube
    const videos = await getChannelVideos(channel.youtube_channel_id, limit);

    // Optionally fetch transcripts
    if (includeTranscripts && videos.length > 0) {
      // Fetch transcripts for first 5 videos to avoid rate limiting
      const videosWithTranscripts = await Promise.all(
        videos.slice(0, 5).map(async (video) => {
          const transcript = await getVideoTranscript(video.id);
          return {
            ...video,
            transcript: transcript,
          };
        })
      );

      // Combine with remaining videos
      const remainingVideos = videos.slice(5).map(video => ({
        ...video,
        transcript: { hasTranscript: false, fullText: '', segments: [] },
      }));

      return NextResponse.json({
        videos: [...videosWithTranscripts, ...remainingVideos],
        total: videos.length,
        transcriptsIncluded: true,
      });
    }

    return NextResponse.json({
      videos,
      total: videos.length,
      transcriptsIncluded: false,
    });
  } catch (error) {
    apiLogger.error('Error fetching videos', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}