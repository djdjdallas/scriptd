import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeTrendsWithAI } from '@/lib/ai/trend-analysis';
import { apiLogger } from '@/lib/monitoring/logger';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { channelId, niche } = await request.json();
    
    // Auth and credits check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();
    
    if (!userData || userData.credits < 5) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }
    
    // Get channel data
    const { data: channel } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single();
    
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    // Get current trends from database or API
    const { data: currentTrends } = await supabase
      .from('trending_topics_history')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(20);
    
    // Perform AI analysis
    const trendAnalysis = await analyzeTrendsWithAI(
      {
        subscriberCount: channel.subscriber_count,
        averageViews: channel.average_views || 0,
        contentType: channel.content_type || 'general'
      },
      currentTrends || [],
      niche || channel.niche
    );
    
    // Deduct credits and track usage if successful
    if (trendAnalysis.success) {
      await supabase
        .from('users')
        .update({ credits: userData.credits - 5 })
        .eq('id', user.id);
      
      await supabase
        .from('ai_usage')
        .insert({
          user_id: user.id,
          feature: 'trendAnalysis',
          credits_used: 5,
          tokens_used: trendAnalysis.tokensUsed || 0,
          created_at: new Date().toISOString()
        });
      
      // Store analysis results
      await supabase
        .from('ai_analyses')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          analysis_type: 'trends',
          results: trendAnalysis.analysis,
          created_at: new Date().toISOString()
        });
    }
    
    return NextResponse.json(trendAnalysis);
  } catch (error) {
    apiLogger.error('Trend analysis error', error);
    return NextResponse.json(
      { error: 'Failed to analyze trends' },
      { status: 500 }
    );
  }
}