"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Trash2,
  RefreshCw,
  Video,
  Users,
  Mic,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { calculateChannelMetrics } from "@/lib/utils/channel-metrics";
import { ChannelAnalyzer } from "@/components/channel/channel-analyzer";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export default function ChannelDetailPage({ params }) {
  const router = useRouter();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingActionPlan, setCreatingActionPlan] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const channelId = resolvedParams.id;

  // Sanitize voice profile text to remove non-Latin characters (Arabic, etc.)
  const sanitizeVoiceText = (text) => {
    if (!text || typeof text !== 'string') return '';
    // Remove non-Latin characters and trim
    return text.replace(/[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF]/g, '').trim();
  };

  useEffect(() => {
    fetchChannel();
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      const response = await fetch(`/api/channels/${channelId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch channel");
      }

      setChannel(data.channel);
    } catch (error) {
      console.error("Error fetching channel:", error);
      toast.error("Failed to load channel");
      router.push("/channels");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: "PUT",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh channel");
      }

      setChannel(data.channel);
      toast.success("Channel data refreshed");
    } catch (error) {
      console.error("Error refreshing channel:", error);
      toast.error("Failed to refresh channel");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteModal({ isOpen: true });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal({ isOpen: false });

    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete failed:", errorData);
        throw new Error(errorData.details || errorData.error || "Failed to delete channel");
      }

      toast.success("Channel removed successfully");
      router.push("/channels");
    } catch (error) {
      console.error("Error deleting channel:", error);
      toast.error(error.message || "Failed to remove channel");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false });
  };

  const handleCreateActionPlan = async () => {
    setCreatingActionPlan(true);

    try {
      // Extract topic from channel data
      // Priority: 1) First content idea topic 2) First audience interest 3) Fallback
      let topic = "Channel Growth Strategy";

      // Try to get topic from content ideas
      const contentIdeas =
        channel.analytics_data?.contentStrategy?.ideas ||
        channel.analytics_data?.content_ideas ||
        channel.contentStrategy?.ideas ||
        [];

      if (contentIdeas && contentIdeas.length > 0) {
        // Use tags or title from first content idea
        if (contentIdeas[0].tags && contentIdeas[0].tags.length > 0) {
          topic = contentIdeas[0].tags.slice(0, 2).join(" & ");
        } else if (contentIdeas[0].title) {
          topic = contentIdeas[0].title;
        }
      } else {
        // Try to get from audience interests
        const audienceData =
          channel.remix_analysis?.analysis_data?.audience?.audience_analysis ||
          channel.analytics_data?.audience?.insights?.audience_analysis ||
          channel.analytics_data?.audience?.audience_analysis;

        if (audienceData?.audience_overlap?.common_interests &&
            audienceData.audience_overlap.common_interests.length > 0) {
          topic = audienceData.audience_overlap.common_interests[0];
        }
      }

      // Build remix analytics object if this is a remix channel
      let remixAnalytics = null;

      if (channel.is_remix) {
        // Extract voice profile data
        const voiceData =
          channel.combined_voice_profile ||
          channel.voice_profile ||
          channel.remix_data?.combined_voice_profile ||
          channel.analytics_data?.voiceProfile;

        const basicVoice = voiceData?.voiceProfile?.basicProfile || voiceData?.basicProfile || voiceData?.basic || voiceData;

        // Extract audience data
        const audienceData =
          channel.remix_analysis?.analysis_data?.audience?.audience_analysis ||
          channel.analytics_data?.audience?.insights?.audience_analysis ||
          channel.analytics_data?.audience?.audience_analysis;

        remixAnalytics = {
          combinedReach: audienceData?.total_combined_reach?.estimated_unique_audience
            ? `${(audienceData.total_combined_reach.estimated_unique_audience / 1000000).toFixed(1)}M+ combined reach`
            : "Multi-million combined reach",

          contentFocus: contentIdeas.length > 0
            ? `Investigative documentary - ${contentIdeas.map(i => i.tags?.[0]).filter(Boolean).slice(0, 3).join(", ")}`
            : "Educational documentary content",

          contentIdeas: contentIdeas.slice(0, 10), // Pass all 10 verified ideas

          voiceStyle: basicVoice ? {
            tone: basicVoice.tone,
            style: basicVoice.style,
            energy: basicVoice.energy,
          } : null,

          audienceProfile: audienceData ? {
            interests: audienceData.audience_overlap?.common_interests || [],
            demographics: audienceData.demographic_profile?.age_distribution?.median_age
              ? `Median age ${audienceData.demographic_profile.age_distribution.median_age}, ${audienceData.demographic_profile.gender_distribution?.male || 0}% male`
              : null,
          } : null,
        };
      }

      toast.loading("Generating your personalized action plan...");

      // Call the action plan API
      const response = await fetch("/api/trending/action-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName: channel.name || channel.title,
          topic: topic,
          remixAnalytics: remixAnalytics, // Pass remix analytics if available
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create action plan");
      }

      const actionPlan = await response.json();

      toast.dismiss();
      toast.success("Action plan created successfully!");

      // Navigate to the action plan view
      // The plan was stored in the database by the API, so we need to get its ID
      // For now, navigate with channel and topic params - the follow page will load the latest plan
      router.push(
        `/trending/follow?channel=${encodeURIComponent(
          channel.name || channel.title
        )}&topic=${encodeURIComponent(topic)}`
      );
    } catch (error) {
      console.error("Error creating action plan:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to create action plan");
    } finally {
      setCreatingActionPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!channel) {
    return null;
  }

  // Calculate real metrics based on channel data
  const metrics = calculateChannelMetrics(channel);

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 -z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      <div className="relative">
        {/* Header */}
        <div className="mb-8">
          <Link href="/channels">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-white hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Channels
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {channel.thumbnail_url ? (
                <img
                  src={channel.thumbnail_url}
                  alt={channel.name || channel.title}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <Video className="h-8 w-8 text-white/60" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  {channel.name || channel.title}
                </h1>
                <p className="text-white/70 mt-1">
                  {channel.subscriber_count?.toLocaleString() || 0} subscribers
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/90 hover:bg-white text-black"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              {channel.is_remix && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCreateActionPlan}
                  disabled={creatingActionPlan}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Zap
                    className={`mr-2 h-4 w-4 ${creatingActionPlan ? "animate-pulse" : ""}`}
                  />
                  {creatingActionPlan ? "Creating..." : "Create Action Plan"}
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Only show for non-remix channels */}
        {!channel.is_remix && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {channel.view_count?.toLocaleString() || "0"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {channel.video_count || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Channel Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {metrics.performanceScore}
                  <span className="text-sm font-normal text-white/50">/100</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audience and Voice Profile Cards - Show for all channels */}
        <div className="grid gap-4 md:grid-cols-2 mt-8">
          {/* Audience Card */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Audience
              </CardTitle>
              <CardDescription className="text-white/60">
                {channel.is_remix
                  ? "Combined audience profile from remixed channels"
                  : "Your target audience profile"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Try multiple paths for audience data
                const audienceData =
                  channel.remix_analysis?.analysis_data?.audience?.audience_analysis ||
                  channel.remix_analysis?.analysis_data?.audience?.insights?.audience_analysis ||
                  channel.audience_analysis?.audience_analysis ||
                  channel.analytics_data?.audience?.insights?.audience_analysis ||
                  channel.analytics_data?.audience?.audience_analysis ||
                  channel.analytics_data?.audience;
                const hasAudienceData =
                  channel.audience_description || audienceData;

                if (!hasAudienceData) {
                  return (
                    <p className="text-white/50 text-sm">
                      No audience analysis available yet
                    </p>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* Audience Description */}
                    {channel.audience_description && (
                      <p className="text-white/90 text-sm leading-relaxed">
                        {channel.audience_description}
                      </p>
                    )}

                    {/* Demographics */}
                    {audienceData?.demographic_profile && (
                      <div className="space-y-3 pt-3 border-t border-white/10">
                        <p className="text-xs font-medium text-white/60 mb-2">
                          Demographics
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {audienceData.demographic_profile.age_distribution
                            ?.median_age && (
                            <div>
                              <span className="text-white/50">Median Age:</span>
                              <span className="text-white ml-2">
                                {
                                  audienceData.demographic_profile
                                    .age_distribution.median_age
                                }
                              </span>
                            </div>
                          )}
                          {audienceData.demographic_profile
                            .gender_distribution && (
                            <div>
                              <span className="text-white/50">Gender:</span>
                              <span className="text-white ml-2">
                                {Object.entries(
                                  audienceData.demographic_profile
                                    .gender_distribution
                                )
                                  .slice(0, 2)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Core Values */}
                    {audienceData?.psychographic_analysis?.core_values && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs font-medium text-white/60 mb-2">
                          Core Values
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {audienceData.psychographic_analysis.core_values
                            .slice(0, 3)
                            .map((value, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full"
                              >
                                {value}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Common Interests */}
                    {audienceData?.audience_overlap?.common_interests && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs font-medium text-white/60 mb-2">
                          Common Interests
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {audienceData.audience_overlap.common_interests
                            .slice(0, 5)
                            .map((interest, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full"
                              >
                                {interest}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Voice Profile Card */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Profile
              </CardTitle>
              <CardDescription className="text-white/60">
                {channel.is_remix
                  ? "Combined voice characteristics from remixed channels"
                  : "Your channel's voice characteristics"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Try multiple sources for voice data
                let voiceData = null;

                // Priority order: combined_voice_profile > voice_profile > remix_data > analytics_data
                if (
                  channel.combined_voice_profile &&
                  typeof channel.combined_voice_profile === "object" &&
                  Object.keys(channel.combined_voice_profile).length > 0
                ) {
                  voiceData = channel.combined_voice_profile;
                }
                else if (
                  channel.voice_profile &&
                  typeof channel.voice_profile === "object" &&
                  Object.keys(channel.voice_profile).length > 0
                ) {
                  voiceData = channel.voice_profile;
                }
                else if (
                  channel.remix_data?.combined_voice_profile &&
                  typeof channel.remix_data.combined_voice_profile === "object" &&
                  Object.keys(channel.remix_data.combined_voice_profile).length > 0
                ) {
                  voiceData = channel.remix_data.combined_voice_profile;
                }
                else if (
                  channel.analytics_data?.voiceProfile &&
                  Object.keys(channel.analytics_data.voiceProfile).length > 0
                ) {
                  voiceData = channel.analytics_data.voiceProfile;
                }

                // Voice data can be nested under 'voiceProfile' (from API response) or 'basic' or at the root level
                const nestedVoiceProfile = voiceData?.voiceProfile || voiceData;
                const basicVoice = nestedVoiceProfile?.basicProfile || nestedVoiceProfile?.basic || nestedVoiceProfile;

                // Check if we have actual voice properties (not just an empty object)
                const hasVoiceData =
                  basicVoice &&
                  typeof basicVoice === "object" &&
                  Object.keys(basicVoice).length > 0 &&
                  (basicVoice.tone ||
                    basicVoice.style ||
                    basicVoice.energy ||
                    basicVoice.pace ||
                    basicVoice.personality ||
                    basicVoice.catchphrases ||
                    basicVoice.signature_phrases ||
                    basicVoice.signaturePhrases ||
                    basicVoice.summary);

                if (!hasVoiceData) {
                  return (
                    <div className="text-center py-4">
                      <p className="text-white/50 text-sm mb-2">
                        No voice profile configured yet
                      </p>
                      {channel.is_remix && (
                        <p className="text-white/30 text-xs">
                          Voice analysis will be generated when the remix is
                          analyzed
                        </p>
                      )}
                    </div>
                  );
                }

                // Extract data from enhanced/advanced section
                const advancedVoice = nestedVoiceProfile?.enhancedProfile || nestedVoiceProfile?.advanced || {};

                // Build RICH tone array from multiple sources with contextual info
                const toneData = [];
                if (basicVoice.tone && Array.isArray(basicVoice.tone) && basicVoice.tone.length > 0) {
                  toneData.push(...basicVoice.tone);
                } else if (basicVoice.tone && typeof basicVoice.tone === 'string') {
                  toneData.push(basicVoice.tone);
                }
                // Fallback to advanced data - extract meaningful insights
                if (toneData.length === 0 && advancedVoice.personality?.formalityScore?.level) {
                  toneData.push(advancedVoice.personality.formalityScore.level);
                }
                if (advancedVoice.personality?.emotionalRange?.dominant) {
                  const emotion = advancedVoice.personality.emotionalRange.dominant;
                  if (!toneData.includes(emotion)) toneData.push(emotion);
                }
                // Add formality context
                if (basicVoice.formality && !toneData.includes(basicVoice.formality)) {
                  toneData.push(basicVoice.formality);
                }

                // Build ENRICHED style array
                const styleData = [];
                if (basicVoice.style && Array.isArray(basicVoice.style) && basicVoice.style.length > 0) {
                  styleData.push(...basicVoice.style);
                } else if (basicVoice.style && typeof basicVoice.style === 'string') {
                  styleData.push(basicVoice.style);
                }
                // Add humor style
                if (advancedVoice.personality?.humorFrequency?.level) {
                  const humorLevel = advancedVoice.personality.humorFrequency.level;
                  if (humorLevel !== 'rare') {
                    styleData.push(`${humorLevel} humor`);
                  }
                }
                // Add storytelling style
                if (advancedVoice.personality?.storytellingStyle?.primaryStyle) {
                  const style = advancedVoice.personality.storytellingStyle.primaryStyle;
                  if (!styleData.includes(style)) styleData.push(`${style} storytelling`);
                }
                // Add technical depth
                if (advancedVoice.personality?.technicalDepth?.level) {
                  styleData.push(`${advancedVoice.personality.technicalDepth.level} content`);
                }

                // Get energy level with MORE CONTEXT
                const energyLevel = basicVoice.energy ||
                                   advancedVoice.prosody?.energyLevel?.level ||
                                   null;
                const energyScore = advancedVoice.prosody?.energyLevel?.score;
                const energyContext = energyScore !== undefined ? ` (score: ${energyScore.toFixed(1)})` : '';

                // Get speaking pace with MORE DETAIL
                const speakingPace = basicVoice.pace ||
                                    advancedVoice.prosody?.speechTempo?.pace ||
                                    null;
                const wordsPerMinute = advancedVoice.prosody?.speechTempo?.wordsPerMinute;
                const paceContext = wordsPerMinute ? ` (${wordsPerMinute} wpm)` : '';

                // Build RICH personality array
                const personalityData = [];
                if (basicVoice.personality && Array.isArray(basicVoice.personality) && basicVoice.personality.length > 0) {
                  personalityData.push(...basicVoice.personality);
                } else if (basicVoice.personality && typeof basicVoice.personality === 'string') {
                  personalityData.push(basicVoice.personality);
                }
                // Add emotional range info
                if (advancedVoice.personality?.emotionalRange) {
                  const emotions = advancedVoice.personality.emotionalRange.scores || {};
                  const topEmotions = Object.entries(emotions)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([emotion]) => emotion);
                  topEmotions.forEach(emotion => {
                    if (!personalityData.includes(emotion)) personalityData.push(emotion);
                  });
                }
                // Add confidence/uncertainty markers
                if (advancedVoice.fingerprint?.uniqueIdentifiers?.personalityMarkers) {
                  const markers = advancedVoice.fingerprint.uniqueIdentifiers.personalityMarkers;
                  if (markers.analytical > 50) personalityData.push('analytical');
                  if (markers.confidence > 50) personalityData.push('confident');
                  if (markers.enthusiasm > 50) personalityData.push('enthusiastic');
                }

                return (
                  <div className="space-y-4">
                    {toneData.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-white/60 mb-2">
                          Tone
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {toneData.filter(Boolean).map((t, i) => {
                            const sanitized = sanitizeVoiceText(t);
                            return sanitized ? (
                              <span
                                key={i}
                                className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-full"
                              >
                                {sanitized}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {styleData.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-white/60 mb-2">
                          Style
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {styleData.filter(Boolean).map((s, i) => {
                            const sanitized = sanitizeVoiceText(s);
                            return sanitized ? (
                              <span
                                key={i}
                                className="px-2 py-1 bg-green-500/20 text-green-200 text-xs rounded-full"
                              >
                                {sanitized}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {energyLevel && sanitizeVoiceText(energyLevel) && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-white/60">
                          Energy Level
                        </p>
                        <span className="text-white/80 text-sm">
                          <span className="capitalize">{sanitizeVoiceText(energyLevel)}</span>
                          {energyContext && <span className="text-white/50 text-xs ml-1">{energyContext}</span>}
                        </span>
                      </div>
                    )}
                    {speakingPace && sanitizeVoiceText(speakingPace) && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-white/60">
                          Speaking Pace
                        </p>
                        <span className="text-white/80 text-sm">
                          <span className="capitalize">{sanitizeVoiceText(speakingPace)}</span>
                          {paceContext && <span className="text-white/50 text-xs ml-1">{paceContext}</span>}
                        </span>
                      </div>
                    )}
                    {/* Add Vocabulary Complexity */}
                    {advancedVoice.quality?.vocabularyDiversity && (
                      <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-white/60">
                            Vocabulary
                          </p>
                          <span className="text-white/80 text-sm capitalize">
                            {advancedVoice.quality.vocabularyDiversity.level}
                          </span>
                        </div>
                        <p className="text-xs text-white/50">
                          {advancedVoice.quality.vocabularyDiversity.uniqueWords?.toLocaleString()} unique words
                          {advancedVoice.quality.vocabularyDiversity.ttr &&
                            ` • ${(advancedVoice.quality.vocabularyDiversity.ttr * 100).toFixed(0)}% diversity`}
                        </p>
                      </div>
                    )}
                    {/* Add Filler Word Usage */}
                    {advancedVoice.quality?.fillerWordUsage && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-white/60">
                          Speech Clarity
                        </p>
                        <span className="text-white/80 text-sm capitalize">
                          {advancedVoice.quality.fillerWordUsage.level} filler words
                        </span>
                      </div>
                    )}
                    {personalityData.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-white/60 mb-2">
                          Personality
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {personalityData.filter(Boolean).map((p, i) => {
                            const sanitized = sanitizeVoiceText(p);
                            return sanitized ? (
                              <span
                                key={i}
                                className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full"
                              >
                                {sanitized}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {/* Top Words Used */}
                    {(basicVoice.topWords || advancedVoice.fingerprint?.topVocabulary) && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs font-medium text-white/60 mb-2">
                          Most Used Words
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(basicVoice.topWords || advancedVoice.fingerprint?.topVocabulary || [])
                            .slice(0, 8)
                            .map((item, i) => {
                              const word = typeof item === 'object' ? item.word : item;
                              const count = typeof item === 'object' ? item.count : null;
                              return (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-indigo-500/20 text-indigo-200 text-xs rounded"
                                >
                                  {word}
                                  {count && <span className="text-indigo-400/60 ml-1">×{count}</span>}
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    )}
                    {basicVoice.summary && sanitizeVoiceText(basicVoice.summary) && (
                      <div>
                        <p className="text-xs font-medium text-white/60 mb-2">
                          Voice Summary
                        </p>
                        <p className="text-white/70 text-xs leading-relaxed">
                          {sanitizeVoiceText(basicVoice.summary)}
                        </p>
                      </div>
                    )}
                    {(basicVoice.signature_phrases || basicVoice.catchphrases || advancedVoice.fingerprint?.signaturePhrases) && (
                      (() => {
                        const phrases = basicVoice.signature_phrases ||
                                       basicVoice.catchphrases ||
                                       (advancedVoice.fingerprint?.signaturePhrases?.map(p => p.phrase || p) || []);
                        return phrases.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-white/60 mb-2">
                              Signature Phrases
                            </p>
                            <div className="space-y-1">
                              {phrases.slice(0, 3).map((phrase, i) => {
                                const phraseText = typeof phrase === 'object' ? phrase.phrase : phrase;
                                const sanitized = sanitizeVoiceText(phraseText);
                                return sanitized ? (
                                  <p
                                    key={i}
                                    className="text-white/70 text-xs italic"
                                  >
                                    "{sanitized}"
                                  </p>
                                ) : null;
                              })}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Source Channels for Remix */}
        {channel.is_remix &&
          channel.remix_source_ids &&
          channel.remix_source_ids.length > 0 && (
            <Card className="mt-8 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Remix Sources
                </CardTitle>
                <CardDescription className="text-white/60">
                  Channels combined to create this remix
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 text-sm">
                  This channel combines strategies from{" "}
                  {channel.remix_source_ids.length} source channels
                </p>
              </CardContent>
            </Card>
          )}

        {/* Channel Analysis Component - Now integrated directly */}
        <div className="mt-8">
          <ChannelAnalyzer 
            channelId={channelId} 
            isRemix={channel.is_remix}
            channelData={channel}
          />
        </div>

        {/* Channel Information Card */}
        <Card className="mt-8 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Channel Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-white/60">
                  YouTube ID
                </dt>
                <dd className="text-sm mt-1 font-mono text-white">
                  {channel.youtube_channel_id}
                </dd>
              </div>
              {channel.custom_url && (
                <div>
                  <dt className="text-sm font-medium text-white/60">
                    Custom URL
                  </dt>
                  <dd className="text-sm mt-1">
                    <a
                      href={`https://youtube.com/${channel.custom_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 hover:underline"
                    >
                      {channel.custom_url}
                    </a>
                  </dd>
                </div>
              )}
              {channel.description && (
                <div>
                  <dt className="text-sm font-medium text-white/60">
                    Description
                  </dt>
                  <dd className="text-sm mt-1 text-white/80 line-clamp-3">
                    {channel.description}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-white/60">Connected</dt>
                <dd className="text-sm mt-1 text-white">
                  {new Date(channel.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Remove Channel"
        message="Are you sure you want to remove this channel? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}
