import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateVideoIdeasWithAI, generateFactualVideoIdeas } from '@/lib/ai/video-ideas';
import { getChannelVideos } from '@/lib/youtube/channel';
import { ServerCreditManager } from '@/lib/credits/server-manager';

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
    
    // Generate ideas - use factual generation if Perplexity API key is available
    const useFactualGeneration = !!process.env.PERPLEXITY_API_KEY;

    const ideas = useFactualGeneration
      ? await generateFactualVideoIdeas(
          {
            niche: channel.category || 'general',
            subscriberCount: channel.subscriber_count,
            averageViews: Math.round(channel.view_count / Math.max(channel.video_count, 1)) || 0
          },
          recentVideos || [],
          audienceData,
          trends || []
        )
      : await generateVideoIdeasWithAI(
          {
            niche: channel.category || 'general',
            subscriberCount: channel.subscriber_count,
            averageViews: Math.round(channel.view_count / Math.max(channel.video_count, 1)) || 0
          },
          recentVideos || [],
          audienceData,
          trends || []
        );

    console.log(`Generated ${useFactualGeneration ? 'factual' : 'creative'} video ideas`);
    
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
      
      // Deduct credits using ServerCreditManager
      const creditResult = await ServerCreditManager.deductCredits(
        supabase,
        user.id,
        'VIDEO_IDEAS',
        { channelId } // Add metadata for tracking
      );

      if (!creditResult.success) {
        return NextResponse.json(
          { error: creditResult.error || 'Insufficient credits' },
          { status: 402 }
        );
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