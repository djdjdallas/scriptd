import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the most recent analysis for this channel
    const { data: analysis, error: fetchError } = await supabase
      .from('channel_analyses')
      .select('*')
      .eq('channel_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json({ 
        analysis: null, 
        isRecent: false,
        message: 'No analysis found' 
      });
    }

    // Check if analysis is recent (within 24 hours)
    const analysisDate = new Date(analysis.created_at);
    const now = new Date();
    const hoursSinceAnalysis = (now - analysisDate) / (1000 * 60 * 60);
    const isRecent = hoursSinceAnalysis < 24;

    // Format the response to match what the component expects
    const formattedAnalysis = {
      analytics: analysis.analytics_data,
      persona: analysis.audience_persona,
      insights: analysis.insights,
      audienceAnalysis: {
        persona: analysis.audience_description,
        demographics: analysis.analytics_data?.demographics,
        interests: analysis.analytics_data?.interests,
        psychographics: analysis.analytics_data?.psychographics,
        aiInsights: analysis.insights?.aiInsights,
        aiRecommendations: analysis.insights?.aiRecommendations
      },
      contentIdeas: analysis.content_ideas
    };

    return NextResponse.json({
      analysis: formattedAnalysis,
      isRecent,
      analysisDate: analysis.created_at,
      hoursOld: Math.round(hoursSinceAnalysis),
      message: isRecent ? 'Using cached analysis' : 'Analysis is outdated'
    });

  } catch (error) {
    console.error('Error fetching latest analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}