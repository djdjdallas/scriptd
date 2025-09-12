import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateVideoIdeasWithAI } from '@/lib/ai/video-ideas';
import { getChannelVideos } from '@/lib/youtube/channel';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { channelId } = await request.json();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get channel and recent videos
    const { data: channel } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single();
    
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    // Get recent videos from YouTube API
    const recentVideos = await getChannelVideos(channel.youtube_channel_id, 20);
    
    // Get audience data
    const { data: audienceData } = await supabase
      .from('channel_analyses')
      .select('audience_persona, audience_description')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // Get trending topics
    const { data: trends } = await supabase
      .from('trending_topics_history')
      .select('topic_name, category, score')
      .order('score', { ascending: false })
      .limit(5);
    
    // Generate ideas
    const ideas = await generateVideoIdeasWithAI(
      {
        niche: channel.niche || 'general',
        subscriberCount: channel.subscriber_count,
        averageViews: channel.average_views || 0
      },
      recentVideos || [],
      audienceData,
      trends || []
    );
    
    // Track usage if successful
    if (ideas.success) {
      await supabase
        .from('ai_usage')
        .insert({
          user_id: user.id,
          feature: 'videoIdeas',
          credits_used: 2,
          tokens_used: ideas.tokensUsed || 0,
          created_at: new Date().toISOString()
        });
      
      // Deduct credits
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      if (userData && userData.credits >= 2) {
        await supabase
          .from('users')
          .update({ credits: userData.credits - 2 })
          .eq('id', user.id);
      }
    }
    
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Video ideas generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video ideas' },
      { status: 500 }
    );
  }
}