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

    // First check if this is a remix channel
    const { data: channel } = await supabase
      .from('channels')
      .select('is_remix')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    // If it's a remix channel, get data from remix_channels table
    if (channel?.is_remix) {
      const { data: remixData } = await supabase
        .from('remix_channels')
        .select('*, source_channel_ids')
        .eq('channel_id', id)
        .single();

      if (remixData && remixData.combined_analytics) {
        const combinedAnalytics = remixData.combined_analytics;
        
        // Get the channel data for stats
        const { data: dbChannel } = await supabase
          .from('channels')
          .select('*')
          .eq('id', id)
          .single();
        
        // Calculate combined stats from source channels
        let totalViews = 0;
        let totalSubscribers = 0;
        let totalVideos = 0;
        
        if (remixData.source_channel_ids && remixData.source_channel_ids.length > 0) {
          const { data: sourceChannels } = await supabase
            .from('channels')
            .select('view_count, subscriber_count, video_count')
            .in('id', remixData.source_channel_ids);
          
          if (sourceChannels) {
            totalViews = sourceChannels.reduce((sum, ch) => sum + (ch.view_count || 0), 0);
            totalSubscribers = sourceChannels.reduce((sum, ch) => sum + (ch.subscriber_count || 0), 0);
            totalVideos = sourceChannels.reduce((sum, ch) => sum + (ch.video_count || 0), 0);
          }
        }
        
        // Format analytics to match expected structure
        const formattedAnalytics = {
          channel: {
            totalViews: totalViews || dbChannel?.view_count || 0,
            subscriberCount: totalSubscribers || dbChannel?.subscriber_count || 0,
            videoCount: totalVideos || dbChannel?.video_count || 0,
            title: dbChannel?.name || dbChannel?.title || remixData.name,
            description: dbChannel?.description || remixData.description
          },
          performance: {
            avgViewsPerVideo: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
            viewsToSubscriberRatio: totalSubscribers > 0 ? Math.round((totalViews / totalSubscribers) * 100) : 0,
            engagementRate: combinedAnalytics.engagementRate || 5,
            performanceScore: combinedAnalytics.performanceScore || 75,
            growthPotential: typeof combinedAnalytics.growthPotential === 'number' ? combinedAnalytics.growthPotential : 80
          },
          audience: combinedAnalytics.audience || {},
          contentTrends: combinedAnalytics.contentTrends || [],
          competitorAnalysis: combinedAnalytics.competitorAnalysis || []
        };
        
        // Return the remix analysis
        return NextResponse.json({
          analysis: {
            analytics: formattedAnalytics,
            persona: combinedAnalytics.audience || {},
            insights: {
              strengths: combinedAnalytics.insights || [],
              opportunities: combinedAnalytics.recommendations || [],
              metrics: {
                performanceScore: formattedAnalytics.performance.performanceScore,
                growthPotential: typeof formattedAnalytics.performance.growthPotential === 'number' ? formattedAnalytics.performance.growthPotential : 80,
                audienceQuality: 85
              }
            },
            audienceAnalysis: combinedAnalytics.audience || {},
            contentIdeas: combinedAnalytics.contentIdeas || combinedAnalytics.recommendations || [],
            voiceProfile: remixData?.combined_voice_profile || combinedAnalytics.voiceProfile || {}
          },
          isRecent: true, // Remix analysis is always "recent"
          isRemix: true,
          analysisDate: remixData.created_at,
          message: 'Remix channel analysis'
        });
      }
    }

    // Get the most recent analysis for this channel (non-remix)
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