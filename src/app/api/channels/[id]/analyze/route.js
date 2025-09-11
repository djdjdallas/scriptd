import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelById } from '@/lib/youtube/channel';
import { getChannelVideos } from '@/lib/youtube/channel';
import { generateChannelAnalytics, generateAudiencePersona, generateInsights } from '@/lib/youtube/analytics';
import { analyzeChannelAudience } from '@/lib/youtube/audience-analyzer';

export async function POST(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get channel from database
    const { data: dbChannel, error: fetchError } = await supabase
      .from('channels')
      .select('youtube_channel_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !dbChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Fetch fresh channel data
    const channel = await getChannelById(dbChannel.youtube_channel_id);
    
    // Fetch recent videos for analysis
    const videos = await getChannelVideos(dbChannel.youtube_channel_id, 50);
    
    // Generate analytics
    const analytics = await generateChannelAnalytics(channel, videos);
    const persona = await generateAudiencePersona(analytics);
    const insights = generateInsights(analytics, persona);
    
    // Generate detailed audience analysis
    const audienceAnalysis = await analyzeChannelAudience(channel, videos);

    // Save analysis results to database
    const { data: analysis, error: saveError } = await supabase
      .from('channel_analyses')
      .insert({
        channel_id: id,
        user_id: user.id,
        analytics_data: analytics,
        audience_persona: persona,
        audience_description: audienceAnalysis.persona, // Detailed description for scripts
        insights: insights,
        videos_analyzed: videos.length,
        analysis_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      // Continue anyway - we can still return the analysis
    }

    // Update channel with latest analytics and audience description
    await supabase
      .from('channels')
      .update({
        last_analyzed_at: new Date().toISOString(),
        audience_description: audienceAnalysis.persona, // Store for auto-fill in scripts
        analytics_summary: {
          performance_score: insights.metrics.performanceScore,
          growth_potential: insights.metrics.growthPotential,
          audience_quality: insights.metrics.audienceQuality,
          demographics: audienceAnalysis.demographics,
          interests: audienceAnalysis.interests,
        },
      })
      .eq('id', id)
      .eq('user_id', user.id);

    return NextResponse.json({
      analytics,
      persona,
      insights,
      audienceAnalysis, // Include detailed audience analysis
      analysisId: analysis?.id,
    });
  } catch (error) {
    console.error('Error analyzing channel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze channel' },
      { status: 500 }
    );
  }
}