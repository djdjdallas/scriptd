import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    // Get channel analysis status
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('last_analyzed_at, voice_training_status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (channelError || !channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Check if there's a recent analysis (within last hour)
    const lastAnalyzed = channel.last_analyzed_at ? new Date(channel.last_analyzed_at) : null;
    const isRecent = lastAnalyzed && (Date.now() - lastAnalyzed.getTime()) < 3600000; // 1 hour

    // Get the most recent analysis
    const { data: analysis } = await supabase
      .from('channel_analyses')
      .select('id, analysis_date, videos_analyzed, content_ideas')
      .eq('channel_id', id)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      status: channel.voice_training_status || 'pending',
      lastAnalyzed: channel.last_analyzed_at,
      isRecent,
      hasAnalysis: !!analysis,
      analysisId: analysis?.id,
      summary: analysis ? {
        videosAnalyzed: analysis.videos_analyzed || 0,
        contentIdeasGenerated: analysis.content_ideas?.length || 0,
        analysisDate: analysis.analysis_date
      } : null
    });

  } catch (error) {
    apiLogger.error('Error checking analysis status', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check analysis status' },
      { status: 500 }
    );
  }
}