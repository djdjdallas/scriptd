import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelById } from '@/lib/youtube/channel';
import { getChannelVideos } from '@/lib/youtube/channel';
import { generateChannelAnalytics, generateAudiencePersona, generateInsights } from '@/lib/youtube/analytics';
import { analyzeChannelAudience } from '@/lib/youtube/audience-analyzer';
import { analyzeChannelWithAI } from '@/lib/ai/audience-analysis';
import { generateVideoIdeasWithAI } from '@/lib/ai/video-ideas';

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
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !dbChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Check if this is a remix channel
    if (dbChannel.is_remix) {
      // For remix channels, return the pre-analyzed data
      const { data: remixData } = await supabase
        .from('remix_channels')
        .select('*, source_channel_ids')
        .eq('channel_id', id)
        .single();

      if (remixData) {
        // Check for remix analyses first
        const { data: remixAnalyses } = await supabase
          .from('channel_remix_analyses')
          .select('*')
          .eq('remix_channel_id', remixData.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        const combinedAnalytics = remixData.combined_analytics || {};
        const analysisData = remixAnalyses?.analysis_data || {};
        
        // Calculate combined stats from source channels if needed
        let totalViews = 0;
        let totalSubscribers = 0;
        let totalVideos = 0;
        
        // Try to get stats from source channels
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
        
        // Format the response to match expected structure
        const formattedAnalytics = {
          channel: {
            totalViews: totalViews || dbChannel.view_count || 0,
            subscriberCount: totalSubscribers || dbChannel.subscriber_count || 0,
            videoCount: totalVideos || dbChannel.video_count || 0,
            title: dbChannel.name || dbChannel.title,
            description: dbChannel.description
          },
          performance: {
            avgViewsPerVideo: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
            viewsToSubscriberRatio: totalSubscribers > 0 ? Math.round((totalViews / totalSubscribers) * 100) : 0,
            engagementRate: combinedAnalytics.engagementRate || 5,
            performanceScore: combinedAnalytics.performanceScore || 75,
            growthPotential: typeof combinedAnalytics.growthPotential === 'number' ? combinedAnalytics.growthPotential : 80
          },
          audience: combinedAnalytics.audience || analysisData.audience || {},
          contentTrends: combinedAnalytics.contentTrends || [],
          competitorAnalysis: combinedAnalytics.competitorAnalysis || []
        };
        
        // Return the pre-computed remix analysis with proper structure
        return NextResponse.json({
          analytics: formattedAnalytics,
          persona: analysisData.audience?.audience_analysis || combinedAnalytics.audience || {},
          insights: {
            strengths: analysisData.insights || combinedAnalytics.insights || [],
            opportunities: analysisData.recommendations || combinedAnalytics.recommendations || [],
            metrics: {
              performanceScore: formattedAnalytics.performance.performanceScore,
              growthPotential: typeof formattedAnalytics.performance.growthPotential === 'number' ? formattedAnalytics.performance.growthPotential : 80,
              audienceQuality: 85 // Default high quality for remix
            }
          },
          audienceAnalysis: analysisData.audience?.audience_analysis || combinedAnalytics.audience || {},
          contentIdeas: combinedAnalytics.contentIdeas || analysisData.recommendations || [],
          voiceProfile: remixData.combined_voice_profile || combinedAnalytics.voiceProfile || {},
          isRemix: true,
          message: 'Remix channel analysis loaded from combined data'
        });
      }
      
      // If no remix data found, return error for remix channels
      return NextResponse.json({ 
        error: 'Remix channel analysis not available. Please recreate the remix.' 
      }, { status: 400 });
    }

    // Fetch fresh channel data (only for non-remix channels)
    const channel = await getChannelById(dbChannel.youtube_channel_id);
    
    // Fetch recent videos for analysis
    const videos = await getChannelVideos(dbChannel.youtube_channel_id, 50);
    
    // Generate analytics
    const analytics = await generateChannelAnalytics(channel, videos);
    const persona = await generateAudiencePersona(analytics);
    const insights = generateInsights(analytics, persona);
    
    // Try AI-powered analysis first, fallback to keyword-based if needed
    let audienceAnalysis;
    const aiAnalysis = await analyzeChannelWithAI(channel, videos);
    
    if (aiAnalysis.success) {
      // Use AI analysis
      audienceAnalysis = {
        persona: aiAnalysis.analysis.audiencePersona,
        demographics: aiAnalysis.analysis.demographics,
        interests: aiAnalysis.analysis.psychographics.interests,
        psychographics: aiAnalysis.analysis.psychographics,
        viewingBehavior: aiAnalysis.analysis.viewingBehavior,
        contentPreferences: aiAnalysis.analysis.contentPreferences,
        communityProfile: aiAnalysis.analysis.communityProfile,
        aiInsights: aiAnalysis.analysis.insights,
        aiRecommendations: aiAnalysis.analysis.recommendations
      };
    } else {
      // Fallback to keyword-based analysis
      audienceAnalysis = await analyzeChannelAudience(channel, videos);
    }

    // Generate content ideas based on channel analysis
    const channelContext = {
      niche: channel.snippet.description?.slice(0, 200) || 'General content',
      subscriberCount: channel.statistics.subscriberCount,
      averageViews: Math.round(videos.reduce((sum, v) => sum + (parseInt(v.statistics?.viewCount) || 0), 0) / videos.length)
    };
    
    const contentIdeas = await generateVideoIdeasWithAI(
      channelContext,
      videos,
      audienceAnalysis,
      [] // Trends can be fetched separately if needed
    );

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
        content_ideas: contentIdeas.success ? contentIdeas.ideas : null,
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
      contentIdeas: contentIdeas.success ? contentIdeas.ideas : null,
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