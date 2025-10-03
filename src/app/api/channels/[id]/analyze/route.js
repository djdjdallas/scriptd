import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelById, getChannelVideos } from '@/lib/youtube/channel';
import { analyzeChannelWithClaude, generateChannelVoiceProfile } from '@/lib/ai/single-channel-analyzer';

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

    // Check if this is a remix channel - use existing logic
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

    // === NEW: Comprehensive Analysis for Regular Channels ===
    console.log('🚀 Starting comprehensive channel analysis for:', dbChannel.name);

    // Fetch fresh channel data from YouTube
    const channel = await getChannelById(dbChannel.youtube_channel_id);

    // Fetch recent videos for analysis
    const videos = await getChannelVideos(dbChannel.youtube_channel_id, 50);

    console.log(`📊 Analyzing channel with ${videos.length} videos`);

    // Run comprehensive Claude analysis
    const claudeAnalysis = await analyzeChannelWithClaude(channel, videos, dbChannel);

    if (!claudeAnalysis.success) {
      throw new Error('Failed to analyze channel with AI: ' + claudeAnalysis.error);
    }

    // Generate comprehensive voice profile from real YouTube data
    const voiceProfileResult = await generateChannelVoiceProfile(channel, videos);

    // Extract analysis sections
    const analysis = claudeAnalysis.analysis;

    // Format analytics data to match expected structure
    const stats = channel.statistics || {};
    const formattedAnalytics = {
      channel: {
        totalViews: parseInt(stats.viewCount || 0),
        subscriberCount: parseInt(stats.subscriberCount || 0),
        videoCount: parseInt(stats.videoCount || 0),
        title: channel.snippet?.title || dbChannel.name,
        description: channel.snippet?.description || dbChannel.description
      },
      performance: {
        avgViewsPerVideo: videos.length > 0
          ? Math.round(videos.reduce((sum, v) => sum + parseInt(v.statistics?.viewCount || 0), 0) / videos.length)
          : 0,
        viewsToSubscriberRatio: stats.subscriberCount > 0
          ? Math.round((stats.viewCount / stats.subscriberCount) * 100)
          : 0,
        engagementRate: calculateEngagementRate(videos),
        performanceScore: analysis.metricsAndBenchmarks?.performanceScore || 70,
        growthPotential: analysis.metricsAndBenchmarks?.growthPotential || 75
      },
      audience: {
        demographics: analysis.audienceProfile?.demographics || {},
        interests: analysis.audienceProfile?.interests || [],
        psychographics: analysis.audienceProfile?.psychographics || {},
        viewingHabits: analysis.audienceProfile?.viewingHabits || {}
      },
      contentAnalysis: analysis.contentAnalysis || {},
      voiceAndStyle: analysis.voiceAndStyle || {},
      competitivePositioning: analysis.competitivePositioning || {}
    };

    // Create comprehensive insights object
    const comprehensiveInsights = {
      strengths: extractStrengths(analysis),
      opportunities: analysis.optimizationOpportunities || [],
      growthStrategy: analysis.growthStrategy || {},
      contentRecommendations: analysis.contentRecommendations || [],
      actionPlan: analysis.actionPlan || {},
      metrics: {
        performanceScore: formattedAnalytics.performance.performanceScore,
        growthPotential: formattedAnalytics.performance.growthPotential,
        audienceQuality: calculateAudienceQuality(formattedAnalytics)
      }
    };

    // Save comprehensive analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('channel_analyses')
      .insert({
        channel_id: id,
        user_id: user.id,
        analytics_data: formattedAnalytics,
        audience_persona: analysis.audienceProfile?.persona || '',
        audience_description: formatAudienceDescription(analysis.audienceProfile),
        insights: comprehensiveInsights,
        content_ideas: analysis.contentRecommendations || [],
        videos_analyzed: videos.length,
        analysis_date: new Date().toISOString(),
        // Store full Claude analysis
        ai_analysis: {
          channelIdentity: analysis.channelIdentity,
          audienceProfile: analysis.audienceProfile,
          contentAnalysis: analysis.contentAnalysis,
          voiceAndStyle: analysis.voiceAndStyle,
          growthStrategy: analysis.growthStrategy,
          competitivePositioning: analysis.competitivePositioning,
          metricsAndBenchmarks: analysis.metricsAndBenchmarks,
          actionPlan: analysis.actionPlan,
          model: claudeAnalysis.model
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
    }

    // Update channel with latest analytics, voice profile, and audience description
    await supabase
      .from('channels')
      .update({
        last_analyzed_at: new Date().toISOString(),
        audience_description: formatAudienceDescription(analysis.audienceProfile),
        voice_profile: voiceProfileResult.success ? voiceProfileResult.voiceProfile : {},
        analytics_summary: {
          performance_score: formattedAnalytics.performance.performanceScore,
          growth_potential: formattedAnalytics.performance.growthPotential,
          audience_quality: comprehensiveInsights.metrics.audienceQuality,
          demographics: analysis.audienceProfile?.demographics || {},
          interests: analysis.audienceProfile?.interests || [],
        },
      })
      .eq('id', id)
      .eq('user_id', user.id);

    console.log('✅ Comprehensive analysis completed and saved');

    // Return comprehensive response
    return NextResponse.json({
      analytics: formattedAnalytics,
      persona: analysis.audienceProfile?.persona || '',
      insights: comprehensiveInsights,
      audienceAnalysis: analysis.audienceProfile || {},
      contentIdeas: analysis.contentRecommendations || [],
      voiceProfile: voiceProfileResult.success ? voiceProfileResult.voiceProfile : {},
      channelIdentity: analysis.channelIdentity || {},
      growthStrategy: analysis.growthStrategy || {},
      competitivePositioning: analysis.competitivePositioning || {},
      actionPlan: analysis.actionPlan || {},
      analysisId: savedAnalysis?.id,
      isComprehensive: true,
      basedOnRealData: voiceProfileResult.basedOnRealData || false,
      message: 'Comprehensive AI analysis completed successfully'
    });

  } catch (error) {
    console.error('Error analyzing channel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze channel' },
      { status: 500 }
    );
  }
}

// Helper functions

function calculateEngagementRate(videos) {
  if (!videos.length) return 0;

  const totalEngagement = videos.reduce((sum, v) => {
    const views = parseInt(v.statistics?.viewCount || 0);
    const likes = parseInt(v.statistics?.likeCount || 0);
    const comments = parseInt(v.statistics?.commentCount || 0);
    return sum + (views > 0 ? ((likes + comments) / views) * 100 : 0);
  }, 0);

  return Math.round((totalEngagement / videos.length) * 10) / 10;
}

function calculateAudienceQuality(analytics) {
  const { performance } = analytics;
  let score = 50; // Base score

  // High engagement rate indicates quality audience
  if (performance.engagementRate > 5) score += 15;
  else if (performance.engagementRate > 3) score += 10;
  else if (performance.engagementRate > 1) score += 5;

  // Good views to subscriber ratio
  if (performance.viewsToSubscriberRatio > 200) score += 20;
  else if (performance.viewsToSubscriberRatio > 100) score += 15;
  else if (performance.viewsToSubscriberRatio > 50) score += 10;

  // Performance score contribution
  score += Math.round(performance.performanceScore * 0.15);

  return Math.min(100, score);
}

function extractStrengths(analysis) {
  const strengths = [];

  if (analysis.channelIdentity?.uniqueElements) {
    strengths.push({
      category: 'Channel Identity',
      items: Array.isArray(analysis.channelIdentity.uniqueElements)
        ? analysis.channelIdentity.uniqueElements
        : [analysis.channelIdentity.uniqueElements]
    });
  }

  if (analysis.contentAnalysis?.whatWorksWell) {
    strengths.push({
      category: 'Content Performance',
      items: Array.isArray(analysis.contentAnalysis.whatWorksWell)
        ? analysis.contentAnalysis.whatWorksWell
        : [analysis.contentAnalysis.whatWorksWell]
    });
  }

  if (analysis.competitivePositioning?.uniqueAdvantages) {
    strengths.push({
      category: 'Competitive Advantages',
      items: Array.isArray(analysis.competitivePositioning.uniqueAdvantages)
        ? analysis.competitivePositioning.uniqueAdvantages
        : [analysis.competitivePositioning.uniqueAdvantages]
    });
  }

  return strengths;
}

function formatAudienceDescription(audienceProfile) {
  if (!audienceProfile) return 'Audience analysis pending';

  const demographics = audienceProfile.demographics || {};
  const interests = audienceProfile.interests || [];
  const psychographics = audienceProfile.psychographics || {};

  let description = '';

  if (demographics.ageRange) {
    description += `${demographics.ageRange} viewers`;
  }

  if (interests.length > 0) {
    description += ` interested in ${interests.slice(0, 3).join(', ')}`;
  }

  if (psychographics.goals) {
    description += `. ${psychographics.goals}`;
  }

  return description || audienceProfile.persona || 'Engaged YouTube audience';
}
