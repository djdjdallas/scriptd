"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Users,
  Video,
  Eye,
  ThumbsUp,
  MessageSquare,
  Loader2,
  AlertCircle,
  Sparkles,
  ChartBar,
  Target,
  Clock,
  Hash,
  Award,
  PlayCircle,
  UserCheck,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Lightbulb,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { TiltCard } from "@/components/ui/tilt-card";

export function ChannelAnalyzer({
  channelId,
  isRemix = false,
  channelData = null,
}) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("insights");
  const [existingAnalysis, setExistingAnalysis] = useState(null);

  // Use channelData prop directly - no need for separate API call
  useEffect(() => {
    if (channelData) {
      const hasAnalysisData =
        channelData.analytics_data ||
        channelData.insights ||
        channelData.audience_analysis;
      if (hasAnalysisData) {
        console.log("📊 ChannelAnalyzer - Processing channelData:", {
          hasAnalyticsData: !!channelData.analytics_data,
          hasInsights: !!channelData.insights,
          hasAudienceAnalysis: !!channelData.audience_analysis,
          hasContentIdeas: !!channelData.content_ideas,
          audienceDataKeys: channelData.analytics_data?.audience
            ? Object.keys(channelData.analytics_data.audience)
            : [],
        });

        // Format channelData to match expected analysis structure
        const formattedData = {
          analytics: channelData.analytics_data || {},
          persona:
            channelData.audience_analysis?.persona ||
            channelData.audience_description ||
            "",
          // Extract insights from analytics_data.audience.insights or directly from insights field
          insights: channelData.analytics_data?.audience?.insights || channelData.insights || {},
          // CRITICAL: Extract deep audience analysis from nested structure
          audienceAnalysis:
            channelData.analytics_data?.audience?.insights?.audience_analysis ||
            channelData.audience_persona ||
            channelData.audience_analysis ||
            channelData.analytics_data?.audience ||
            {},
          // Extract content ideas - prioritize contentStrategy.ideas over generic content_ideas
          contentIdeas:
            channelData.analytics_data?.contentStrategy?.ideas ||
            channelData.analytics_data?.content_ideas ||
            channelData.contentStrategy?.ideas ||
            channelData.content_ideas ||
            [],
          voiceProfile:
            channelData.voice_profile ||
            channelData.combined_voice_profile ||
            {},
        };

        console.log("✅ ChannelAnalyzer - Formatted data:", {
          hasAudienceAnalysis: !!formattedData.audienceAnalysis,
          audienceAnalysisKeys: Object.keys(formattedData.audienceAnalysis),
          hasDemographicProfile:
            !!formattedData.audienceAnalysis?.demographic_profile,
          hasPsychographicAnalysis:
            !!formattedData.audienceAnalysis?.psychographic_analysis,
          contentIdeasCount: formattedData.contentIdeas?.length || 0,
          contentIdeasIsArray: Array.isArray(formattedData.contentIdeas),
          contentIdeasSource: channelData.analytics_data?.contentStrategy?.ideas ? 'analytics_data.contentStrategy.ideas' :
                             channelData.analytics_data?.content_ideas ? 'analytics_data.content_ideas' :
                             channelData.contentStrategy?.ideas ? 'contentStrategy.ideas' :
                             channelData.content_ideas ? 'content_ideas' : 'none',
          insightsKeys: Object.keys(formattedData.insights),
          hasStrengths: !!formattedData.insights?.strengths?.length,
          hasOpportunities: !!formattedData.insights?.opportunities?.length,
          insightsMetrics: formattedData.insights?.metrics,
          strengthsCount: formattedData.insights?.strengths?.length || 0,
          opportunitiesCount: formattedData.insights?.opportunities?.length || 0,
          recommendationsCount: formattedData.insights?.recommendations?.length || 0,
        });

        setAnalysisData(formattedData);
        setExistingAnalysis({
          analysisDate: channelData.last_analyzed_at || channelData.updated_at,
          isRecent: true,
          videosAnalyzed: channelData.videos_analyzed || 0,
        });
      }
    }
  }, [channelData]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    try {
      const response = await fetch(`/api/channels/${channelId}/analyze`, {
        method: "POST",
      });

      // Check if response is JSON (timeout errors return HTML)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Analysis timeout - the operation took too long. Please try again with fewer videos or a simpler analysis."
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error(
          "Failed to parse analysis response. The operation may have timed out. Please try again."
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setProgress(100);
      setAnalysisData(data);

      // Show success with summary info
      if (data.summary) {
        toast.success(
          `Analysis complete! Analyzed ${data.summary.videosAnalyzed} videos, generated ${data.summary.contentIdeasGenerated} content ideas.`,
          { duration: 5000 }
        );
      } else {
        toast.success("Channel analysis complete!");
      }

      // Reload page after short delay to show updated channel data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Analysis error:", error);
      setError(error.message);
      toast.error(error.message || "Failed to analyze channel");
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  if (error) {
    return (
      <div className="glass-card p-8">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            {error === "Failed to analyze channel"
              ? "We encountered an issue analyzing your channel. This might be due to YouTube API limits or connectivity issues."
              : error}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={startAnalysis}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/channels")}
              className="glass-button"
            >
              Back to Channels
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show prompt to analyze if no existing analysis
  if (!isAnalyzing && !analysisData) {
    return (
      <div className="glass-card p-8">
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              Channel Analysis
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Get comprehensive insights about your channel performance,
              audience, and content strategy
            </p>
          </div>

          <Button
            onClick={startAnalysis}
            size="lg"
            className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            Start Analysis
          </Button>

          <p className="text-xs text-gray-500">
            This analysis uses AI to provide detailed insights and may take a
            few moments
          </p>
        </div>
      </div>
    );
  }

  // Show analyzing state
  if (isAnalyzing) {
    return (
      <div className="glass-card p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              Analyzing Your Channel
            </h2>
            <p className="text-gray-400">
              This may take a few moments while we gather insights about your
              content and audience
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Progress value={progress} className="h-3 bg-gray-800" />
              <div className="absolute inset-0 h-3 overflow-hidden rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
            </div>

            <div className="text-center">
              <p className="text-white font-medium mb-2">
                {progress < 30 && "Fetching channel data..."}
                {progress >= 30 &&
                  progress < 60 &&
                  "Analyzing video content..."}
                {progress >= 60 &&
                  progress < 90 &&
                  "Generating audience insights..."}
                {progress >= 90 && "Finalizing analysis..."}
              </p>
              <p className="text-gray-400 text-sm">{progress}% complete</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle new lightweight response format (after API optimization)
  const { analytics, persona, insights, audienceAnalysis, contentIdeas, summary } =
    analysisData || {};

  // If we got a lightweight response with summary, show completion state
  if (analysisData && summary && !analytics) {
    return (
      <div className="glass-card p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-green-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Analysis Complete!
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              {analysisData.message}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Videos Analyzed</p>
              <p className="text-2xl font-bold text-white">{summary.videosAnalyzed}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Content Ideas</p>
              <p className="text-2xl font-bold text-white">{summary.contentIdeasGenerated}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Reloading to show updated channel data...
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    // Handle null, undefined, or non-numeric values
    if (num === null || num === undefined || isNaN(num)) {
      return "0";
    }
    // Ensure num is a number
    num = Number(num);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const tabs = [
    { id: "insights", label: "Insights", icon: ChartBar },
    { id: "audience", label: "Audience", icon: Users },
    ...(!isRemix ? [{ id: "content", label: "Content", icon: Video }] : []),
    ...(!isRemix
      ? [{ id: "performance", label: "Performance", icon: TrendingUp }]
      : []),
    ...(contentIdeas
      ? [{ id: "ideas", label: "Video Ideas", icon: Lightbulb }]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "5s" }}
        />
      </div>

      {/* Existing Analysis Banner */}
      {existingAnalysis && (
        <div className="glass-card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Using Cached Analysis</p>
                <p className="text-xs text-gray-400">
                  Last analyzed{" "}
                  {new Date(existingAnalysis.analysisDate).toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              onClick={startAnalysis}
              size="sm"
              variant="outline"
              className="glass-button text-black"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Fresh Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards - Hide for remix channels */}
      {!isRemix && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TiltCard>
            <div className="glass-card p-6 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Total Views</span>
                <Eye className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {formatNumber(analytics?.channel?.totalViews)}
              </div>
              <p className="text-xs text-gray-400">
                {formatNumber(analytics?.performance?.avgViewsPerVideo)} per
                video
              </p>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="glass-card p-6 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Subscribers</span>
                <Users className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {formatNumber(analytics?.channel?.subscriberCount)}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="text-green-400">
                  +{analytics?.performance?.viewsToSubscriberRatio || 0}%
                </span>
                view rate
              </p>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="glass-card p-6 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Engagement Rate</span>
                <ThumbsUp className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {analytics?.performance?.avgEngagementRate ||
                  analytics?.performance?.engagementRate ||
                  0}
                %
              </div>
              <p className="text-xs text-gray-400">
                {formatNumber(analytics?.performance?.totalEngagements)} total
              </p>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="glass-card p-6 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Videos</span>
                <Video className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {analytics?.channel?.videoCount || 0}
              </div>
              <p className="text-xs text-gray-400">
                {analytics?.analysisMetadata?.videosAnalyzed ||
                  analytics?.channel?.videoCount ||
                  0}{" "}
                analyzed
              </p>
            </div>
          </TiltCard>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="glass-card p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-reveal">
        {activeTab === "insights" && (
          <div className="space-y-6">
            {/* Show message if insights data is missing or empty */}
            {(!insights || (!insights.metrics && !insights.strengths && !insights.opportunities && !insights.recommendations)) && (
              <div className="glass-card p-8 border-2 border-yellow-500/30">
                <div className="flex flex-col items-center justify-center text-center">
                  <AlertCircle className="h-12 w-12 text-yellow-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Insights Not Generated Yet</h3>
                  <p className="text-gray-300 mb-6 max-w-md">
                    Channel insights, metrics, and recommendations haven't been generated for this {isRemix ? 'remix' : 'channel'} yet. Click "Run Fresh Analysis" above to generate comprehensive insights.
                  </p>
                </div>
              </div>
            )}

            {/* Only show metrics if they exist */}
            {(insights?.metrics || insights?.strengths || insights?.opportunities) && (
              <>
                {/* Channel Health Metrics */}
                {insights?.metrics && (
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-400" />
                      Channel Health Metrics
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-medium">
                            Performance Score
                          </span>
                          <span className="text-2xl font-bold text-purple-400">
                            {insights.metrics.performanceScore || 0}/100
                          </span>
                        </div>
                        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-700"
                            style={{
                              width: `${insights.metrics.performanceScore || 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-medium">
                            Growth Potential
                          </span>
                          <span className="text-2xl font-bold text-blue-400">
                            {insights.metrics.growthPotential || 0}/100
                          </span>
                        </div>
                        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                            style={{
                              width: `${insights.metrics.growthPotential || 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">
                      Audience Quality
                    </span>
                    <span className="text-2xl font-bold text-green-400">
                      {insights?.metrics?.audienceQuality || 0}/100
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700"
                      style={{
                        width: `${insights?.metrics?.audienceQuality || 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
                )}

            {/* Strengths and Opportunities */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-400" />
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {insights?.strengths && insights.strengths.length > 0 ? (
                    insights.strengths.map((strength, index) => {
                      // Handle both string and object formats
                      if (typeof strength === "string") {
                        return (
                          <li key={index} className="flex items-start gap-3">
                            <div className="mt-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full" />
                            </div>
                            <span className="text-gray-300 text-sm">
                              {strength}
                            </span>
                          </li>
                        );
                      } else if (strength?.category && strength?.items) {
                        // Handle {category, items} format
                        return (
                          <li key={index} className="space-y-2">
                            <div className="text-white font-medium text-sm">
                              {strength.category}
                            </div>
                            <ul className="ml-4 space-y-2">
                              {(Array.isArray(strength.items)
                                ? strength.items
                                : [strength.items]
                              ).map((item, itemIndex) => (
                                <li
                                  key={itemIndex}
                                  className="flex items-start gap-3"
                                >
                                  <div className="mt-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                                  </div>
                                  <span className="text-gray-300 text-sm">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <>
                      <li className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                        </div>
                        <span className="text-gray-300 text-sm">
                          Established audience base showing consistent
                          engagement
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                        </div>
                        <span className="text-gray-300 text-sm">
                          Consistent content output maintaining viewer interest
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                        </div>
                        <span className="text-gray-300 text-sm">
                          Growing channel presence in your niche
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-400" />
                  Opportunities
                </h3>
                <ul className="space-y-3">
                  {insights?.opportunities &&
                  insights?.opportunities.length > 0 ? (
                    insights?.opportunities.map((opportunity, index) => {
                      // Handle both string and object formats
                      if (typeof opportunity === "string") {
                        return (
                          <li key={index} className="flex items-start gap-3">
                            <div className="mt-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            </div>
                            <span className="text-gray-300 text-sm">
                              {opportunity}
                            </span>
                          </li>
                        );
                      } else if (opportunity?.category && opportunity?.items) {
                        // Handle {category, items} format
                        return (
                          <li key={index} className="space-y-2">
                            <div className="text-white font-medium text-sm">
                              {opportunity.category}
                            </div>
                            <ul className="ml-4 space-y-2">
                              {(Array.isArray(opportunity.items)
                                ? opportunity.items
                                : [opportunity.items]
                              ).map((item, itemIndex) => (
                                <li
                                  key={itemIndex}
                                  className="flex items-start gap-3"
                                >
                                  <div className="mt-1">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                  </div>
                                  <span className="text-gray-300 text-sm">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      } else if (typeof opportunity === "object") {
                        // Handle any other object format
                        const text =
                          opportunity.text ||
                          opportunity.recommendation ||
                          opportunity.description;
                        if (text) {
                          return (
                            <li key={index} className="flex items-start gap-3">
                              <div className="mt-1">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                              </div>
                              <span className="text-gray-300 text-sm">
                                {text}
                              </span>
                            </li>
                          );
                        }
                      }
                      return null;
                    })
                  ) : (
                    <>
                      <li className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        </div>
                        <span className="text-gray-300 text-sm">
                          Optimize video titles and thumbnails for better
                          click-through rates
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        </div>
                        <span className="text-gray-300 text-sm">
                          Experiment with content formats to boost engagement
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        </div>
                        <span className="text-gray-300 text-sm">
                          Leverage trending topics in your niche
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                Recommendations
              </h3>
              <div className="grid gap-3">
                {insights?.recommendations &&
                insights.recommendations.length > 0 ? (
                  insights.recommendations.map((rec, index) => {
                    // Handle both string and object formats
                    const displayText =
                      typeof rec === "string"
                        ? rec
                        : rec?.text || rec?.recommendation || rec?.title || "";
                    if (!displayText) return null;

                    return (
                      <div
                        key={index}
                        className="glass p-4 rounded-lg flex items-start gap-3 group hover:bg-white/5 transition-colors"
                      >
                        <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-gray-300 text-sm">
                          {displayText}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="glass p-4 rounded-lg flex items-start gap-3 group hover:bg-white/5 transition-colors">
                      <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm">
                        Increase upload consistency to 2-3 videos per week
                      </span>
                    </div>
                    <div className="glass p-4 rounded-lg flex items-start gap-3 group hover:bg-white/5 transition-colors">
                      <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm">
                        Focus on creating content around your top-performing
                        topics
                      </span>
                    </div>
                    <div className="glass p-4 rounded-lg flex items-start gap-3 group hover:bg-white/5 transition-colors">
                      <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm">
                        Improve video retention by adding hooks in the first 15
                        seconds
                      </span>
                    </div>
                    <div className="glass p-4 rounded-lg flex items-start gap-3 group hover:bg-white/5 transition-colors">
                      <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm">
                        Engage with your audience through community posts and
                        comments
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {activeTab === "audience" && (
          <div className="space-y-6">
            {/* Audience Overview */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Audience Persona
              </h3>

              {/* Audience Description */}
              <div className="mb-6">
                <div className="glass p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    Audience Profile
                    {(audienceAnalysis?.aiInsights ||
                      channelData?.remix_analysis?.analysis_data?.audience) && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                        AI Enhanced
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {channelData?.audience_description ||
                      audienceAnalysis?.persona ||
                      (channelData?.remix_analysis?.analysis_data?.audience
                        ?.audience_analysis?.demographic_profile
                        ?.age_distribution?.median_age
                        ? `Median age ${
                            channelData?.remix_analysis?.analysis_data?.audience
                              ?.audience_analysis?.demographic_profile
                              ?.age_distribution?.median_age
                          } with interests in ${
                            channelData?.remix_analysis?.analysis_data?.audience?.audience_analysis?.audience_overlap?.common_interests
                              ?.slice(0, 3)
                              ?.join(", ") || "various topics"
                          }`
                        : "Run analysis to see your audience profile")}
                  </p>
                </div>
              </div>

              {/* AI Insights if available */}
              {audienceAnalysis?.aiInsights && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="glass p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      Content Gaps
                    </h4>
                    <ul className="space-y-2">
                      {audienceAnalysis?.aiInsights?.contentGaps?.map(
                        (gap, index) => (
                          <li
                            key={index}
                            className="text-gray-300 text-sm flex items-start gap-2"
                          >
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>{gap}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="glass p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-400" />
                      Audience Needs
                    </h4>
                    <ul className="space-y-2">
                      {audienceAnalysis?.aiInsights?.audienceNeeds?.map(
                        (need, index) => (
                          <li
                            key={index}
                            className="text-gray-300 text-sm flex items-start gap-2"
                          >
                            <span className="text-green-400 mt-1">•</span>
                            <span>{need}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Deep Audience Analysis Data (from both single channels and remix channels) */}
              {(audienceAnalysis?.demographic_profile ||
                audienceAnalysis?.audience_analysis?.demographic_profile ||
                channelData?.remix_analysis?.analysis_data?.audience) &&
                (() => {
                  // Extract the audience analysis data - handle both direct and nested formats
                  const remixAudience = audienceAnalysis?.demographic_profile
                    ? audienceAnalysis // Direct format from audience_persona
                    : audienceAnalysis?.audience_analysis ||
                      channelData?.remix_analysis?.analysis_data?.audience
                        ?.audience_analysis;
                  return (
                    <div className="space-y-6 mb-6">
                      {/* Demographics */}
                      {remixAudience?.demographic_profile && (
                        <div className="glass p-4 rounded-lg">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-400" />
                            Demographics
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {remixAudience.demographic_profile.age_distribution
                              ?.median_age && (
                              <div>
                                <span className="text-gray-400">
                                  Median Age:
                                </span>
                                <span className="text-white ml-2">
                                  {
                                    remixAudience.demographic_profile
                                      .age_distribution.median_age
                                  }
                                </span>
                              </div>
                            )}
                            {remixAudience.demographic_profile
                              .gender_distribution && (
                              <div>
                                <span className="text-gray-400">Gender:</span>
                                <span className="text-white ml-2">
                                  {Object.entries(
                                    remixAudience.demographic_profile
                                      .gender_distribution
                                  )
                                    .slice(0, 2)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(", ")}
                                </span>
                              </div>
                            )}
                            {remixAudience.demographic_profile.education_income
                              ?.education_level && (
                              <div>
                                <span className="text-gray-400">
                                  Education:
                                </span>
                                <span className="text-white ml-2">
                                  {Object.entries(
                                    remixAudience.demographic_profile
                                      .education_income.education_level
                                  )
                                    .sort(
                                      (a, b) => parseInt(b[1]) - parseInt(a[1])
                                    )
                                    .slice(0, 1)
                                    .map(
                                      ([k, v]) => `${k.replace("_", " ")}: ${v}`
                                    )
                                    .join("")}
                                </span>
                              </div>
                            )}
                            {remixAudience.demographic_profile
                              .geographic_distribution?.top_countries && (
                              <div>
                                <span className="text-gray-400">Regions:</span>
                                <span className="text-white ml-2">
                                  {remixAudience.demographic_profile.geographic_distribution.top_countries
                                    .slice(0, 3)
                                    .join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Core Values */}
                      {remixAudience?.psychographic_analysis?.core_values && (
                        <div className="glass p-4 rounded-lg">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400" />
                            Core Values
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {remixAudience.psychographic_analysis.core_values.map(
                              (value, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-purple-500/20 text-purple-200 text-sm rounded-full"
                                >
                                  {value}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Common Interests */}
                      {remixAudience?.audience_overlap?.common_interests && (
                        <div className="glass p-4 rounded-lg">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-400" />
                            Common Interests
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {remixAudience.audience_overlap.common_interests.map(
                              (interest, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-blue-500/20 text-blue-200 text-sm rounded-full"
                                >
                                  {interest}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Content Ideas */}
                      {channelData?.remix_analysis?.analysis_data?.audience
                        ?.contentIdeas && (
                        <div className="glass p-4 rounded-lg">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-orange-400" />
                            Video Ideas
                          </h4>
                          <div className="space-y-3">
                            {channelData.remix_analysis.analysis_data.audience.contentIdeas
                              .slice(0, 3)
                              .map((idea, i) => (
                                <div
                                  key={i}
                                  className="p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg"
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <h5 className="text-white font-medium flex-1">
                                      {idea.title}
                                    </h5>
                                    {idea.isVerified && (
                                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded flex-shrink-0 ml-2">
                                        ✓ Verified
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-300 text-sm mb-2">
                                    {idea.description}
                                  </p>
                                  {idea.verificationDetails && (
                                    <p className="text-xs text-blue-300 mb-2 italic">
                                      {idea.verificationDetails}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                      Format: {idea.format}
                                    </span>
                                    <span className="text-xs text-green-400">
                                      Potential: {idea.growth_potential}/10
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {/* Default Audience Characteristics - Only show if no deep analysis data */}
              {!audienceAnalysis?.demographic_profile &&
                !audienceAnalysis?.audience_analysis?.demographic_profile &&
                !channelData?.remix_analysis?.analysis_data?.audience && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-400" />
                          Engagement Level
                        </h4>
                        <div className="glass p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-purple-400 font-bold text-lg">
                              {persona?.behavior?.engagementLevel || "N/A"}
                            </span>
                            <span className="text-gray-400 text-sm">
                              Score: {persona?.behavior?.loyaltyScore || 0}/100
                            </span>
                          </div>
                          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                              style={{
                                width: `${
                                  persona?.behavior?.loyaltyScore || 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          Viewing Patterns
                        </h4>
                        <div className="glass p-4 rounded-lg">
                          <p className="text-gray-300">
                            {persona?.behavior?.viewingPatterns ||
                              "No viewing pattern data"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-purple-400" />
                          Content Preferences
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(
                            persona?.demographics?.contentPreferences || []
                          ).map((pref, index) => (
                            <span
                              key={index}
                              className="glass px-3 py-1 rounded-full text-sm text-purple-300"
                            >
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Hash className="h-4 w-4 text-yellow-400" />
                          Top Interests
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(persona?.demographics?.interests || []).map(
                            (interest, index) => (
                              <span
                                key={index}
                                className="glass px-3 py-1 rounded-full text-sm text-yellow-300"
                              >
                                {interest}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Audience Insights */}
            <div className="grid md:grid-cols-3 gap-4">
              <TiltCard>
                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">
                    High Engagement
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Your audience actively interacts with your content
                  </p>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">
                    Growing Community
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Consistent growth in viewer retention
                  </p>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">
                    Loyal Viewers
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Strong viewer-to-subscriber conversion
                  </p>
                </div>
              </TiltCard>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Content Analysis */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Video className="h-5 w-5 text-red-400" />
                Content Analysis
              </h3>

              <div className="space-y-6">
                {/* Content Strategy Insights */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-400" />
                    Content Strategy Analysis
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="glass p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-purple-400 mb-2">
                        Core Topics
                      </h5>
                      <div className="space-y-2">
                        {(analytics?.content?.topKeywords || []).length > 0 ? (
                          analytics.content.topKeywords
                            .slice(0, 5)
                            .map(([keyword], i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm text-gray-300">
                                  {keyword}
                                </span>
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    i === 0
                                      ? "bg-purple-400"
                                      : i === 1
                                      ? "bg-blue-400"
                                      : "bg-gray-400"
                                  }`}
                                />
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-gray-400">
                            No topic data available
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="glass p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-green-400 mb-2">
                        Content Mix
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Educational</span>
                          <span className="text-white">45%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Entertainment</span>
                          <span className="text-white">35%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Tutorials</span>
                          <span className="text-white">20%</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-400 mb-2">
                        Publishing Insights
                      </h5>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-300">
                          <span className="block text-white font-medium">
                            Optimal Days
                          </span>
                          <span className="text-xs">
                            Tuesday, Thursday, Saturday
                          </span>
                        </div>
                        <div className="text-sm text-gray-300">
                          <span className="block text-white font-medium">
                            Best Time
                          </span>
                          <span className="text-xs">
                            2-5 PM (audience timezone)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      Content Types
                    </h4>
                    <div className="space-y-3">
                      {analytics?.content?.contentTypes &&
                      Object.keys(analytics?.content?.contentTypes || {})
                        .length > 0 ? (
                        Object.entries(
                          analytics?.content?.contentTypes || {}
                        ).map(([type, count]) => (
                          <div key={type} className="glass p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white capitalize">
                                {type}
                              </span>
                              <span className="text-purple-400 font-bold">
                                {count}
                              </span>
                            </div>
                            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                style={{
                                  width: `${
                                    (count /
                                      Math.max(
                                        analytics?.channel?.videoCount || 1,
                                        1
                                      )) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="glass p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">
                            Content type analysis not available
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Advanced Content Patterns */}
                    {analytics.content?.contentPatterns && (
                      <div className="mt-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-purple-400" />
                          Performance Patterns
                        </h4>
                        <div className="space-y-3">
                          <div className="glass p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">
                                Title Style
                              </span>
                              <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                                Question-based performs 40% better
                              </span>
                            </div>
                          </div>
                          <div className="glass p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">
                                Thumbnail Strategy
                              </span>
                              <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                                Face + Text optimal
                              </span>
                            </div>
                          </div>
                          <div className="glass p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">
                                Hook Effectiveness
                              </span>
                              <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                                First 15 seconds crucial
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-400" />
                      Upload Schedule
                    </h4>
                    <div className="glass p-4 rounded-lg">
                      <p className="text-gray-300 mb-3">
                        {persona?.contentRecommendations?.frequency ||
                          "More consistent upload schedule recommended"}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-400">
                          Optimal for audience retention
                        </span>
                      </div>
                    </div>

                    <h4 className="text-white font-semibold mb-4 mt-6 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Strategic Recommendations
                    </h4>
                    <div className="space-y-3">
                      <div className="glass p-3 rounded-lg border-l-2 border-yellow-400">
                        <p className="text-xs text-yellow-400 mb-1">
                          High Priority
                        </p>
                        <p className="text-sm text-white">
                          Create series-based content
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Viewers who watch series have 3x higher retention
                        </p>
                      </div>
                      <div className="glass p-3 rounded-lg border-l-2 border-blue-400">
                        <p className="text-xs text-blue-400 mb-1">Quick Win</p>
                        <p className="text-sm text-white">
                          Optimize video endings
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Add end screens to increase session duration by 25%
                        </p>
                      </div>
                      <div className="glass p-3 rounded-lg border-l-2 border-green-400">
                        <p className="text-xs text-green-400 mb-1">
                          Growth Opportunity
                        </p>
                        <p className="text-sm text-white">
                          Collaborate with similar channels
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Cross-promotion can boost subscribers by 15-20%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            {/* Top Performing Videos */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Top Performing Videos
              </h3>

              <div className="space-y-3">
                {(analytics?.topVideos || []).map((video, index) => {
                  const isTop3 = index < 3;
                  return (
                    <div
                      key={video.id}
                      className={`glass p-4 rounded-lg flex items-center gap-4 group hover:bg-white/5 transition-all ${
                        isTop3 ? "border border-purple-500/30" : ""
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 ${isTop3 ? "relative" : ""}`}
                      >
                        <div
                          className={`w-12 h-12 glass rounded-lg flex items-center justify-center font-bold text-lg ${
                            index === 0
                              ? "text-yellow-400"
                              : index === 1
                              ? "text-gray-300"
                              : index === 2
                              ? "text-orange-400"
                              : "text-gray-400"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {isTop3 && (
                          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate group-hover:text-purple-300 transition-colors">
                          {video.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(video.views)}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {formatNumber(video.likes)}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {formatNumber(video.comments || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {video.views >
                        (analytics?.performance?.avgViewsPerVideo || 0) ? (
                          <div className="flex items-center gap-1 text-green-400">
                            <ArrowUpRight className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              +
                              {Math.round(
                                (video.views /
                                  (analytics?.performance?.avgViewsPerVideo ||
                                    1) -
                                  1) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-400">
                            <ArrowDownRight className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              -
                              {Math.round(
                                (1 -
                                  video.views /
                                    (analytics?.performance?.avgViewsPerVideo ||
                                      1)) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-3 gap-4">
              <TiltCard>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Eye className="h-5 w-5 text-purple-400" />
                    <span className="text-xs text-green-400">+12%</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">Avg Views/Video</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(analytics?.performance?.avgViewsPerVideo)}
                  </p>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <span className="text-xs text-green-400">Good</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">Watch Time</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(
                      ((analytics?.performance?.avgViewsPerVideo || 0) * 4.5) /
                        60
                    )}
                    h
                  </p>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span className="text-xs text-yellow-400">Stable</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">CTR</p>
                  <p className="text-2xl font-bold text-white">
                    {(
                      (analytics?.performance?.avgEngagementRate ||
                        analytics?.performance?.engagementRate ||
                        0) * 1.2
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </TiltCard>
            </div>
          </div>
        )}

        {activeTab === "ideas" && (
          <div className="space-y-6">
            {/* Show message if content ideas are missing */}
            {(!contentIdeas || (Array.isArray(contentIdeas) && contentIdeas.length === 0) && !contentIdeas?.viralPotentialIdeas && !contentIdeas?.quickWins) && (
              <div className="glass-card p-8 border-2 border-yellow-500/30">
                <div className="flex flex-col items-center justify-center text-center">
                  <Lightbulb className="h-12 w-12 text-yellow-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Video Ideas Not Generated Yet</h3>
                  <p className="text-gray-300 mb-6 max-w-md">
                    AI-generated video ideas haven't been created for this {isRemix ? 'remix' : 'channel'} yet. Click "Run Fresh Analysis" above to generate personalized content ideas.
                  </p>
                </div>
              </div>
            )}

            {/* Video Ideas Generated by AI */}
            {(contentIdeas && ((Array.isArray(contentIdeas) && contentIdeas.length > 0) || contentIdeas?.viralPotentialIdeas || contentIdeas?.quickWins)) && (
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  AI-Generated Video Ideas
                </h3>

                {/* Handle array format (from generateRemixContentIdeas) */}
                {Array.isArray(contentIdeas) && contentIdeas.length > 0 && (
                <div className="space-y-4">
                  {contentIdeas.map((idea, i) => (
                    <div
                      key={i}
                      className="glass p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h5 className="text-white font-medium flex-1">
                          {idea.title}
                        </h5>
                        {idea.growth_potential && (
                          <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded flex-shrink-0">
                            {idea.growth_potential}/10 potential
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-300 mb-3">
                        {idea.description}
                      </p>

                      {idea.key_hooks &&
                        Array.isArray(idea.key_hooks) &&
                        idea.key_hooks.length > 0 && (
                          <div className="mb-3 p-2 bg-purple-900/20 rounded">
                            <span className="text-xs font-semibold text-purple-300">
                              Hooks:{" "}
                            </span>
                            <span className="text-xs text-purple-200">
                              {idea.key_hooks.join(" • ")}
                            </span>
                          </div>
                        )}

                      <div className="flex flex-wrap gap-2">
                        {idea.format && (
                          <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                            {idea.format}
                          </span>
                        )}
                        {idea.length && (
                          <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                            {idea.length}
                          </span>
                        )}
                        {idea.estimated_difficulty && (
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              idea.estimated_difficulty.toLowerCase() === "easy"
                                ? "bg-green-900/30 text-green-400"
                                : idea.estimated_difficulty.toLowerCase() ===
                                  "medium"
                                ? "bg-yellow-900/30 text-yellow-400"
                                : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            {idea.estimated_difficulty}
                          </span>
                        )}
                      </div>

                      {idea.seo_tags &&
                        Array.isArray(idea.seo_tags) &&
                        idea.seo_tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {idea.seo_tags.slice(0, 5).map((tag, j) => (
                              <span
                                key={j}
                                className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}

              {/* Handle structured format (viralPotentialIdeas, quickWins) */}
              {contentIdeas?.viralPotentialIdeas &&
                contentIdeas?.viralPotentialIdeas.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      High Viral Potential
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {contentIdeas?.viralPotentialIdeas
                        ?.slice(0, 4)
                        .map((idea, i) => (
                          <div
                            key={i}
                            className="glass p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                          >
                            <h5 className="text-white font-medium mb-2">
                              {idea.title}
                            </h5>
                            <p className="text-sm text-gray-300 mb-3">
                              {idea.concept}
                            </p>

                            {idea.hook && (
                              <div className="mb-3 p-2 bg-purple-900/20 rounded text-xs text-purple-300">
                                <span className="font-semibold">Hook: </span>
                                {idea.hook}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {idea.viralScore && (
                                <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                                  {idea.viralScore}% viral
                                </span>
                              )}
                              {idea.estimatedLength && (
                                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                                  {idea.estimatedLength}
                                </span>
                              )}
                              {idea.productionComplexity && (
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    idea.productionComplexity === "Easy"
                                      ? "bg-green-900/30 text-green-400"
                                      : idea.productionComplexity === "Medium"
                                      ? "bg-yellow-900/30 text-yellow-400"
                                      : "bg-red-900/30 text-red-400"
                                  }`}
                                >
                                  {idea.productionComplexity}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {contentIdeas?.quickWins &&
                contentIdeas?.quickWins.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Win Ideas
                    </h4>
                    <div className="space-y-3">
                      {contentIdeas?.quickWins?.slice(0, 3).map((idea, i) => (
                        <div
                          key={i}
                          className="glass p-3 rounded-lg flex items-start gap-3"
                        >
                          <div className="w-8 h-8 bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-green-400 text-sm font-bold">
                              {i + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">
                              {idea.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {idea.concept}
                            </p>
                            {idea.productionTime && (
                              <span className="text-xs text-green-400 mt-2 inline-block">
                                ⏱ {idea.productionTime}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={() => router.push("/channels")}
          className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
        >
          View All Channels
        </Button>
      </div>
    </div>
  );
}
