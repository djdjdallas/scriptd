import { createClient } from '@/lib/supabase/server';
import { getChannelById, getChannelVideos } from '@/lib/youtube/channel';
import { analyzeChannelWithClaude, generateChannelVoiceProfile } from '@/lib/ai/single-channel-analyzer';
import { apiLogger } from '@/lib/monitoring/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { id } = await params;

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event, data) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          sendEvent('error', { message: 'Unauthorized' });
          controller.close();
          return;
        }

        // Get channel from database
        const { data: dbChannel, error: fetchError } = await supabase
          .from('channels')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !dbChannel) {
          sendEvent('error', { message: 'Channel not found' });
          controller.close();
          return;
        }

        // Send initial progress
        sendEvent('progress', {
          stage: 'initializing',
          message: 'Starting channel analysis...',
          progress: 5
        });

        // Fetch channel data from YouTube
        sendEvent('progress', {
          stage: 'fetching',
          message: 'Fetching channel data from YouTube...',
          progress: 15
        });

        const channel = await getChannelById(dbChannel.youtube_channel_id);
        const videos = await getChannelVideos(dbChannel.youtube_channel_id, 50);

        sendEvent('progress', {
          stage: 'analyzing',
          message: `Analyzing ${videos.length} videos with AI...`,
          progress: 30
        });

        // Run comprehensive Claude analysis
        const claudeAnalysis = await analyzeChannelWithClaude(channel, videos, dbChannel);

        if (!claudeAnalysis.success) {
          throw new Error('Failed to analyze channel: ' + claudeAnalysis.error);
        }

        sendEvent('progress', {
          stage: 'voice_analysis',
          message: 'Generating voice profile from real data...',
          progress: 60
        });

        // Generate voice profile
        const voiceProfileResult = await generateChannelVoiceProfile(channel, videos);

        sendEvent('progress', {
          stage: 'processing',
          message: 'Processing analysis results...',
          progress: 80
        });

        const analysis = claudeAnalysis.analysis;
        const stats = channel.statistics || {};

        // Format analytics
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
          }
        };

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

        sendEvent('progress', {
          stage: 'saving',
          message: 'Saving analysis results...',
          progress: 90
        });

        // Save to database
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

        // Update channel
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

        // Send complete event with all data
        sendEvent('complete', {
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

        sendEvent('progress', {
          stage: 'done',
          message: 'Analysis complete!',
          progress: 100
        });

      } catch (error) {
        apiLogger.error('SSE Analysis error', error);
        sendEvent('error', {
          message: error.message || 'Analysis failed',
          details: error.toString()
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
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
  let score = 50;

  if (performance.engagementRate > 5) score += 15;
  else if (performance.engagementRate > 3) score += 10;
  else if (performance.engagementRate > 1) score += 5;

  if (performance.viewsToSubscriberRatio > 200) score += 20;
  else if (performance.viewsToSubscriberRatio > 100) score += 15;
  else if (performance.viewsToSubscriberRatio > 50) score += 10;

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
