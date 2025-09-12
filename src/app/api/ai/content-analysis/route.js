import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeContentWithAI } from '@/lib/ai/content-analysis';
import { getChannelVideos } from '@/lib/youtube/channel';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { channelId } = await request.json();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get channel data
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single();
    
    if (channelError || !channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    // Get videos for analysis
    const videos = await getChannelVideos(channel.youtube_channel_id, 30);
    
    // Perform AI analysis
    const analysis = await analyzeContentWithAI(videos);
    
    // Store results if successful
    if (analysis.success) {
      await supabase
        .from('ai_analyses')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          analysis_type: 'content',
          results: analysis.analysis,
          created_at: new Date().toISOString()
        });
      
      // Track usage
      await supabase
        .from('ai_usage')
        .insert({
          user_id: user.id,
          feature: 'contentAnalysis',
          credits_used: 3,
          tokens_used: analysis.tokensUsed || 0,
          created_at: new Date().toISOString()
        });
    }
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Content analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}