"use client";

import { useState, useEffect } from "react";
import { useWorkflow } from "../ScriptWorkflow";
import { FileText, Users, Mic, Brain, Video, Sparkles, Clock, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { SCRIPT_CONFIG } from "@/lib/scriptGenerationConfig";

export default function SummaryStep() {
  const {
    workflowData,
    updateStepData,
    markStepComplete,
    updateWorkflowTitle,
    goToStep,
  } = useWorkflow();
  const [topic, setTopic] = useState(workflowData.summary?.topic || "");
  const [targetAudience, setTargetAudience] = useState(
    workflowData.summary?.targetAudience || ""
  );
  const [audienceType, setAudienceType] = useState(
    workflowData.summary?.audienceType || "preset"
  );
  const [customAudience, setCustomAudience] = useState(
    workflowData.summary?.customAudience || ""
  );
  const [tone, setTone] = useState(
    workflowData.summary?.tone || "professional"
  );
  const [voiceProfile, setVoiceProfile] = useState(
    workflowData.summary?.voiceProfile || null
  );
  const [aiModel, setAiModel] = useState(
    workflowData.summary?.aiModel || "claude-3-5-sonnet"
  );
  const [voiceProfiles, setVoiceProfiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(
    workflowData.summary?.channelId || ""
  );
  const [targetDuration, setTargetDuration] = useState(
    workflowData.summary?.targetDuration || 300 // Default 5 minutes
  );
  const [customDuration, setCustomDuration] = useState("");
  const [userTier, setUserTier] = useState("free"); // NEW: Track user tier
  const [loading, setLoading] = useState(true); // NEW: Track loading state

  const supabase = createClient();

  useEffect(() => {
    loadUserTier(); // NEW: Load user tier first
    loadVoiceProfiles();
    loadChannels();
  }, []);

  // Sync voiceProfile state with loaded voiceProfiles when they become available
  useEffect(() => {
    if (voiceProfiles.length > 0 && voiceProfile?.id) {
      // Find the matching profile with full data
      const matchingProfile = voiceProfiles.find(p => p.id === voiceProfile.id);
      if (matchingProfile) {
        console.log('[SummaryStep] Syncing voice profile with loaded data');
        setVoiceProfile(matchingProfile);
      }
    }
  }, [voiceProfiles]);

  // NEW: Load user subscription tier
  const loadUserTier = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log("[SummaryStep] No user for tier check");
        setLoading(false);
        return;
      }

      const { data: userProfile, error } = await supabase
        .from("users")
        .select("subscription_tier, subscription_plan")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const tier = userProfile?.subscription_tier || userProfile?.subscription_plan || "free";
      // Normalize tier to 'free' or 'paid'
      const normalizedTier = ["free", "inactive"].includes(tier) ? "free" : "paid";
      setUserTier(normalizedTier);
      console.log("[SummaryStep] User tier:", normalizedTier);
    } catch (error) {
      console.error("Error loading user tier:", error);
      setUserTier("free"); // Default to free on error
    } finally {
      setLoading(false);
    }
  };

  const loadVoiceProfiles = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log("[SummaryStep] No user for voice profiles");
        return;
      }

      // Get user's channels with their voice_profile data
      const { data: userChannels, error: channelError } = await supabase
        .from("channels")
        .select("id, name, title, voice_profile, voice_training_status")
        .eq("user_id", user.id)
        .eq("voice_training_status", "completed"); // Only channels with completed voice training

      if (channelError) throw channelError;

      if (!userChannels || userChannels.length === 0) {
        console.log("[SummaryStep] No channels with voice profiles found for user");
        setVoiceProfiles([]);
        return;
      }

      // Transform channels into voice profile objects
      const profiles = userChannels.map(channel => {
        // Parse voice_profile if it's a string
        let voiceProfileData = channel.voice_profile;
        if (typeof voiceProfileData === 'string') {
          try {
            voiceProfileData = JSON.parse(voiceProfileData);
          } catch (e) {
            console.error(`Failed to parse voice_profile for channel ${channel.id}:`, e);
            voiceProfileData = {};
          }
        }

        // Handle nested structure: {success: true, voiceProfile: {...}}
        const actualProfile = voiceProfileData?.voiceProfile || voiceProfileData;

        const profile = {
          id: channel.id,
          profile_name: channel.title || channel.name,
          channel_id: channel.id,
          channel_title: channel.title,
          channel_name: channel.name,
          // Include the full voice profile data
          voiceProfileData: actualProfile,
          // Map to expected structure for compatibility
          basicProfile: actualProfile?.basicProfile,
          enhancedProfile: actualProfile?.enhancedProfile,
          metadata: actualProfile?.metadata,
          basedOnRealData: voiceProfileData?.basedOnRealData || actualProfile?.basedOnRealData,
        };

        // Debug logging
        console.log(`[SummaryStep] Voice profile for ${channel.title}:`, {
          hasBasicProfile: !!profile.basicProfile,
          hasEnhancedProfile: !!profile.enhancedProfile,
          hasMetadata: !!profile.metadata,
          basedOnRealData: profile.basedOnRealData,
        });

        return profile;
      });

      console.log(`[SummaryStep] Loaded ${profiles.length} voice profiles from channels`);
      setVoiceProfiles(profiles);
    } catch (error) {
      console.error("Error loading voice profiles:", error);
    }
  };

  const loadChannels = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log("[SummaryStep] No user for channels");
        return;
      }

      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);

      // If there's only one channel, auto-select it
      if (data && data.length === 1) {
        setSelectedChannel(data[0].id);
        if (data[0].audience_description) {
          setAudienceType("channel");
          setTargetAudience(data[0].audience_description);
        }
      }
    } catch (error) {
      console.error("Error loading channels:", error);
    }
  };

  const handleChannelSelect = async (channelId) => {
    setSelectedChannel(channelId);
    const channel = channels.find((c) => c.id === channelId);

    console.log('[SummaryStep] Channel selected:', channelId);

    if (channel) {
      // Try to load rich audience analysis from channel's analytics_data
      try {
        console.log('[SummaryStep] Loading analytics_data for channel:', channelId);

        // Parse analytics_data if it's a string
        let analyticsData = channel.analytics_data;
        if (typeof analyticsData === 'string') {
          try {
            analyticsData = JSON.parse(analyticsData);
            console.log('[SummaryStep] Parsed analytics_data');
          } catch (e) {
            console.error('[SummaryStep] Failed to parse analytics_data:', e);
            analyticsData = null;
          }
        }

        console.log('[SummaryStep] Analytics data:', {
          hasData: !!analyticsData,
          hasAudience: !!analyticsData?.audience,
          hasInsights: !!analyticsData?.audience?.insights,
          hasAudienceAnalysis: !!analyticsData?.audience?.insights?.audience_analysis
        });

        // Check if we have rich audience analysis
        if (analyticsData?.audience?.insights?.audience_analysis) {
          console.log('[SummaryStep] ✅ Loaded rich audience analysis from channel');
          setTargetAudience(JSON.stringify(analyticsData.audience.insights.audience_analysis));
          setAudienceType("channel");
          toast.success("Rich audience analysis loaded from your channel");
          return;
        }
      } catch (error) {
        console.error("[SummaryStep] Error loading audience analysis:", error);
      }

      // Fallback to simple audience_description
      console.log('[SummaryStep] Falling back to simple audience_description');
      if (channel.audience_description) {
        setTargetAudience(channel.audience_description);
        setAudienceType("channel");
        toast.success("Audience loaded from your YouTube channel");
      }
    }
  };

  const handleSave = () => {
    // Validate based on audience type
    let finalAudience = "";
    let isValid = true;

    if (audienceType === "custom") {
      finalAudience = customAudience;
      if (!customAudience.trim()) {
        isValid = false;
        toast.error("Please enter a custom audience description");
      }
    } else if (audienceType === "channel") {
      if (!selectedChannel) {
        isValid = false;
        toast.error("Please select a YouTube channel");
      } else {
        // Use the channel's audience description if available,
        // otherwise use the channel itself as the audience indicator
        const channel = channels.find((c) => c.id === selectedChannel);
        finalAudience = targetAudience || (channel ? `Audience of ${channel.title}` : "Channel audience");
      }
    } else { // preset
      finalAudience = targetAudience;
      if (!targetAudience) {
        isValid = false;
        toast.error("Please select a target audience");
      }
    }

    if (!topic.trim()) {
      isValid = false;
      toast.error("Please enter a video topic");
      return;
    }

    // NEW: Validate user access to selected duration and model
    const durationMinutes = Math.ceil(targetDuration / 60);
    if (!isDurationAllowed(targetDuration)) {
      isValid = false;
      toast.error(`Free users are limited to ${limits.maxDurationMinutes} minute videos. Please upgrade or select a shorter duration.`, {
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/pricing'
        }
      });
    }

    if (!isModelAllowed(aiModel)) {
      isValid = false;
      toast.error(`Free users can only use the Fast model. Please upgrade or select the Fast model.`, {
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/pricing'
        }
      });
    }

    if (!isValid) {
      return;
    }

    const summaryData = {
      topic,
      targetAudience: finalAudience,
      audienceType,
      customAudience,
      channelId: selectedChannel,
      tone,
      voiceProfile,
      aiModel,
      targetDuration,
      // Preserve content idea info and other metadata
      niche: workflowData.summary?.niche,
      contentIdeaInfo: workflowData.summary?.contentIdeaInfo,
      templateInfo: workflowData.summary?.templateInfo,
    };

    // Debug logging for voice profile
    if (voiceProfile) {
      console.log('[SummaryStep] Saving voice profile to workflow:', {
        profile_name: voiceProfile.profile_name,
        channel_id: voiceProfile.channel_id,
        hasBasicProfile: !!voiceProfile.basicProfile,
        hasEnhancedProfile: !!voiceProfile.enhancedProfile,
        hasMetadata: !!voiceProfile.metadata,
        basedOnRealData: voiceProfile.basedOnRealData,
      });
      console.log('[SummaryStep] Full voice profile object keys:', Object.keys(voiceProfile));
    }

    updateStepData("summary", summaryData);
    updateWorkflowTitle(topic || "Untitled Script");
    markStepComplete(1);
    toast.success("Summary saved!");
    // Navigate to next step (Research)
    goToStep(2);
  };

  const presetAudiences = [
    { value: "general", label: "General Audience" },
    { value: "beginners", label: "Beginners" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced/Expert" },
    { value: "business", label: "Business Professionals" },
    { value: "students", label: "Students" },
    { value: "developers", label: "Developers" },
    { value: "creators", label: "Content Creators" },
  ];

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const parseDuration = (durationString) => {
    const parts = durationString.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return parseInt(durationString) || 0;
  };

  // NEW: Get limits based on user tier
  const limits = userTier === "free"
    ? SCRIPT_CONFIG.freeUserLimits
    : SCRIPT_CONFIG.paidUserLimits;

  // NEW: Helper to check if duration is allowed
  const isDurationAllowed = (seconds) => {
    const minutes = Math.ceil(seconds / 60);
    return minutes <= limits.maxDurationMinutes;
  };

  // NEW: Helper to check if model is allowed
  const isModelAllowed = (model) => {
    return limits.allowedModels.includes(model);
  };

  const durationPresets = [
    { value: 30, label: "30 sec", description: "Quick tip or teaser" },
    { value: 60, label: "1 min", description: "Short-form content" },
    { value: 180, label: "3 min", description: "Brief explanation" },
    { value: 300, label: "5 min", description: "Standard tutorial" },
    { value: 600, label: "10 min", description: "In-depth guide" },
    { value: 900, label: "15 min", description: "Comprehensive lesson" },
    { value: 1200, label: "20 min", description: "Full course module" },
    { value: 1260, label: "21 min", description: "Extended content" }, // NEW: 21 min option (free limit)
    { value: 1800, label: "30 min", description: "Deep dive content" },
    { value: 2100, label: "35 min", description: "Extended tutorial" },
    { value: 2400, label: "40 min", description: "Documentary style" },
    { value: 2700, label: "45 min", description: "Masterclass format" },
    { value: 3000, label: "50 min", description: "Workshop session" },
    { value: 3600, label: "60 min", description: "Full presentation" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Script Summary</h2>
        <p className="text-gray-400">
          Define your video topic and configure generation settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Content Idea Info Display */}
        {workflowData.summary?.contentIdeaInfo && (
          <div className="glass-card-no-overflow p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-3">Content Idea Loaded</h3>
                <div className="space-y-2 text-sm">
                  {workflowData.summary.contentIdeaInfo.title && (
                    <div>
                      <span className="text-green-400 font-medium">Title: </span>
                      <span className="text-gray-300">{workflowData.summary.contentIdeaInfo.title}</span>
                    </div>
                  )}
                  {workflowData.summary.contentIdeaInfo.hook && (
                    <div>
                      <span className="text-green-400 font-medium">Hook: </span>
                      <span className="text-gray-300">{workflowData.summary.contentIdeaInfo.hook}</span>
                    </div>
                  )}
                  {workflowData.summary.contentIdeaInfo.description && (
                    <div>
                      <span className="text-green-400 font-medium">Description: </span>
                      <span className="text-gray-300">{workflowData.summary.contentIdeaInfo.description}</span>
                    </div>
                  )}
                  {workflowData.summary.contentIdeaInfo.basedOnEvent && (
                    <div>
                      <span className="text-green-400 font-medium">Based on Event: </span>
                      <span className="text-gray-300">{workflowData.summary.contentIdeaInfo.basedOnEvent}</span>
                    </div>
                  )}
                  {workflowData.summary.contentIdeaInfo.specifics && (
                    <div>
                      <span className="text-green-400 font-medium">Specifics: </span>
                      <span className="text-gray-300">{workflowData.summary.contentIdeaInfo.specifics}</span>
                    </div>
                  )}
                  {workflowData.summary.contentIdeaInfo.estimatedViews && (
                    <div>
                      <span className="text-green-400 font-medium">Est. Views: </span>
                      <span className="text-green-300 font-semibold">{workflowData.summary.contentIdeaInfo.estimatedViews}</span>
                    </div>
                  )}
                  {workflowData.summary.niche && (
                    <div>
                      <span className="text-green-400 font-medium">Niche: </span>
                      <span className="text-gray-300">{workflowData.summary.niche}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card-no-overflow p-6">
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Video Topic
            </span>
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your video topic or idea..."
            className="w-full h-24 px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:bg-black/70 focus:outline-none resize-none transition-all hover:border-purple-500/50"
          />
        </div>

        {/* Video Duration Section */}
        <div className="glass-card-no-overflow p-6">
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Target Video Duration
            </span>
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4 max-h-96 overflow-y-auto pr-2">
            {durationPresets.map((preset) => {
              const isAllowed = isDurationAllowed(preset.value);
              const isLocked = !isAllowed && userTier === "free";

              return (
                <button
                  key={preset.value}
                  onClick={() => {
                    if (isAllowed) {
                      setTargetDuration(preset.value);
                      setCustomDuration('');
                    } else {
                      toast.error(`Upgrade to generate ${preset.label} scripts`, {
                        action: {
                          label: 'Upgrade',
                          onClick: () => window.location.href = '/pricing'
                        }
                      });
                    }
                  }}
                  disabled={isLocked}
                  className={`p-3 rounded-lg border transition-all relative ${
                    targetDuration === preset.value && !customDuration
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : isLocked
                      ? 'border-purple-500/20 bg-black/20 text-gray-600 cursor-not-allowed opacity-60'
                      : 'border-purple-500/30 hover:border-purple-500/50 text-gray-400 hover:text-white bg-black/30'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-1 right-1">
                      <Lock className="h-3 w-3 text-orange-400" />
                    </div>
                  )}
                  <div className={`font-medium ${isLocked ? 'line-through' : ''}`}>
                    {preset.label}
                  </div>
                  <div className="text-xs mt-1 opacity-70">
                    {isLocked ? 'Pro Only' : preset.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* NEW: Show upgrade message for free users */}
          {userTier === "free" && (
            <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-sm text-orange-300 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Free users can generate up to {limits.maxDurationMinutes} minute videos.
                <a href="/pricing" className="text-orange-400 hover:text-orange-300 underline ml-1">
                  Upgrade for longer videos →
                </a>
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Custom:</span>
            <input
              type="text"
              value={customDuration}
              onChange={(e) => {
                setCustomDuration(e.target.value);
                const seconds = parseDuration(e.target.value);
                if (seconds > 0) {
                  setTargetDuration(seconds);
                }
              }}
              placeholder="MM:SS (e.g., 7:30)"
              className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:bg-black/70 focus:outline-none transition-all hover:border-purple-500/50"
            />
            <div className="text-sm text-purple-400 font-medium">
              Current: {formatDuration(targetDuration)}
            </div>
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="glass-card-no-overflow p-6">
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Target Audience
            </span>
          </label>
          <p className="text-xs text-gray-400 mb-4">
            Select a source below, then click the dropdown to choose your audience
          </p>

          {/* Audience Type Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setAudienceType("preset")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                audienceType === "preset"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-black/50 border border-purple-500/30 text-gray-400 hover:border-purple-500/50"
              }`}
            >
              Preset Audiences
            </button>
            {channels.length > 0 && (
              <button
                onClick={() => setAudienceType("channel")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  audienceType === "channel"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-black/50 border border-purple-500/30 text-gray-400 hover:border-purple-500/50"
                }`}
              >
                <Video className="h-4 w-4" />
                YouTube Channel
              </button>
            )}
            <button
              onClick={() => setAudienceType("custom")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                audienceType === "custom"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-black/50 border border-purple-500/30 text-gray-400 hover:border-purple-500/50"
              }`}
            >
              Custom Description
            </button>
          </div>

          {/* Preset Audience Dropdown */}
          {audienceType === "preset" && (
            <CustomDropdown
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              options={presetAudiences}
              placeholder="Select an audience"
            />
          )}

          {/* YouTube Channel Selector */}
          {audienceType === "channel" && (
            <div className="space-y-3">
              {channels.length > 0 ? (
                <>
                  <CustomDropdown
                    value={selectedChannel}
                    onChange={(e) => handleChannelSelect(e.target.value)}
                    options={channels.map((channel) => ({
                      value: channel.id,
                      label: channel.title,
                    }))}
                    placeholder="Select a channel"
                  />
                  {selectedChannel && targetAudience && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <p className="text-sm text-purple-300 mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Channel Audience Analysis
                      </p>
                      {(() => {
                        // Check if targetAudience is rich JSON data
                        let audienceData;
                        try {
                          audienceData = JSON.parse(targetAudience);
                        } catch (e) {
                          // Not JSON, display as simple text
                          return <p className="text-sm text-gray-300">{targetAudience}</p>;
                        }

                        // Display rich audience data summary
                        if (audienceData?.demographic_profile) {
                          return (
                            <div className="text-sm text-gray-300 space-y-2">
                              {audienceData.demographic_profile.age_distribution && (
                                <div>
                                  <span className="text-purple-300 font-medium">Demographics: </span>
                                  Primary age {Object.entries(audienceData.demographic_profile.age_distribution)
                                    .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0]?.[0] || 'N/A'}
                                  , {audienceData.demographic_profile.gender_distribution?.male}% male
                                </div>
                              )}
                              {audienceData.psychographic_analysis?.core_values && (
                                <div>
                                  <span className="text-purple-300 font-medium">Values: </span>
                                  {audienceData.psychographic_analysis.core_values.slice(0, 3).join(', ')}
                                </div>
                              )}
                              {audienceData.content_consumption_patterns?.preferred_video_length?.optimal_range && (
                                <div>
                                  <span className="text-purple-300 font-medium">Preferred length: </span>
                                  {audienceData.content_consumption_patterns.preferred_video_length.optimal_range}
                                </div>
                              )}
                              <p className="text-xs text-gray-400 mt-2">✨ Full demographic & psychographic analysis will be used</p>
                            </div>
                          );
                        }

                        // Fallback
                        return <p className="text-sm text-gray-300">{targetAudience}</p>;
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <Video className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    No YouTube channels connected
                  </p>
                  <a
                    href="/channels"
                    className="text-purple-400 text-sm hover:text-purple-300 mt-2 inline-block"
                  >
                    Connect a channel →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Custom Audience */}
          {audienceType === "custom" && (
            <textarea
              value={customAudience}
              onChange={(e) => setCustomAudience(e.target.value)}
              placeholder="Describe your target audience in detail. Include demographics, interests, pain points, and what they're looking for..."
              className="w-full h-32 px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:bg-black/70 focus:outline-none resize-none transition-all hover:border-purple-500/50"
            />
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 z-40">
          <div className="glass-card-no-overflow p-6 z-40">
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Tone
              </span>
            </label>
            <CustomDropdown
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              options={[
                { value: "professional", label: "Professional" },
                { value: "casual", label: "Casual" },
                { value: "friendly", label: "Friendly" },
                { value: "educational", label: "Educational" },
                { value: "entertaining", label: "Entertaining" },
                { value: "inspirational", label: "Inspirational" },
                { value: "technical", label: "Technical" },
                { value: "conversational", label: "Conversational" },
              ]}
            />
          </div>

          <div className="glass-card-no-overflow p-6 z-40">
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Script Quality
              </span>
            </label>

            {/* NEW: Show model selection buttons with locked state */}
            <div className="space-y-2 mb-3">
              {[
                { value: "claude-3-5-haiku", label: "Fast (1x credits)", description: "Quick generation with good quality" },
                { value: "claude-3-5-sonnet", label: "Professional (1.5x credits)", description: "Better storytelling and flow" },
                { value: "claude-opus-4-1", label: "Hollywood (3.5x credits)", description: "Premium quality with advanced AI" },
              ].map((model) => {
                const isAllowed = isModelAllowed(model.value);
                const isLocked = !isAllowed && userTier === "free";

                return (
                  <button
                    key={model.value}
                    onClick={() => {
                      if (isAllowed) {
                        setAiModel(model.value);
                      } else {
                        toast.error(`Upgrade to use ${model.label}`, {
                          action: {
                            label: 'Upgrade',
                            onClick: () => window.location.href = '/pricing'
                          }
                        });
                      }
                    }}
                    disabled={isLocked}
                    className={`w-full p-3 rounded-lg border transition-all text-left relative ${
                      aiModel === model.value
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : isLocked
                        ? 'border-purple-500/20 bg-black/20 text-gray-600 cursor-not-allowed opacity-60'
                        : 'border-purple-500/30 hover:border-purple-500/50 text-gray-400 hover:text-white bg-black/30'
                    }`}
                  >
                    {isLocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-4 w-4 text-orange-400" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${isLocked ? 'line-through' : ''}`}>
                          {model.label}
                        </div>
                        <div className="text-xs mt-1 opacity-70">
                          {isLocked ? 'Pro Only' : model.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* NEW: Show upgrade message for free users */}
            {userTier === "free" && (
              <div className="mb-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-xs text-orange-300 flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Free users are limited to Fast model.
                  <a href="/pricing" className="text-orange-400 hover:text-orange-300 underline ml-1">
                    Upgrade →
                  </a>
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Higher quality uses more advanced AI for better storytelling
            </p>
            <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Estimated Credits:</span>
                <span className="text-purple-400 font-semibold">
                  {(() => {
                    const minutes = Math.ceil(targetDuration / 60);
                    const baseRate = 0.33;
                    const multiplier = aiModel === 'claude-opus-4-1' ? 3.5 : 
                                     aiModel === 'claude-3-5-sonnet' ? 1.5 : 1;
                    return Math.max(1, Math.round(minutes * baseRate * multiplier));
                  })()} credits
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.ceil(targetDuration / 60)} min × {aiModel === 'claude-opus-4-1' ? '3.5x Hollywood' : 
                 aiModel === 'claude-3-5-sonnet' ? '1.5x Professional' : '1x Fast'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card-no-overflow p-6">
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Profile
            </span>
          </label>
          <CustomDropdown
            value={voiceProfile?.id || ""}
            onChange={(e) => {
              const profile = voiceProfiles.find(
                (p) => p.id === e.target.value
              );
              setVoiceProfile(profile);
            }}
            options={[
              { value: "", label: "No Voice Profile" },
              ...(voiceProfiles.length > 0
                ? voiceProfiles.map((profile) => ({
                    value: profile.id,
                    label: profile.profile_name || profile.channel_title || "Voice Profile",
                  }))
                : [
                    {
                      value: "disabled",
                      label: "No voice profiles available",
                      disabled: true,
                    },
                  ]),
            ]}
          />

          {/* Voice Profile Details Display */}
          {voiceProfile && voiceProfile.basicProfile && (
            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <Mic className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-300 mb-1">
                    {voiceProfile.profile_name || voiceProfile.channel_title}
                  </p>
                  {voiceProfile.basedOnRealData && (
                    <p className="text-xs text-green-400 mb-2">✓ Based on real channel analysis</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {voiceProfile.basicProfile.summary && (
                  <div className="pb-2 border-b border-purple-500/20">
                    <p className="text-gray-300 italic">{voiceProfile.basicProfile.summary}</p>
                  </div>
                )}

                {voiceProfile.basicProfile.tone && voiceProfile.basicProfile.tone.length > 0 && (
                  <div>
                    <span className="text-purple-300 font-medium">Tone: </span>
                    <span className="text-gray-300">{voiceProfile.basicProfile.tone.join(', ')}</span>
                  </div>
                )}

                {voiceProfile.basicProfile.style && voiceProfile.basicProfile.style.length > 0 && (
                  <div>
                    <span className="text-purple-300 font-medium">Style: </span>
                    <span className="text-gray-300">{voiceProfile.basicProfile.style.join(', ')}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {voiceProfile.basicProfile.pace && (
                    <div>
                      <span className="text-purple-300 font-medium text-xs">Pace: </span>
                      <span className="text-gray-300 text-xs">{voiceProfile.basicProfile.pace}</span>
                    </div>
                  )}
                  {voiceProfile.basicProfile.energy && (
                    <div>
                      <span className="text-purple-300 font-medium text-xs">Energy: </span>
                      <span className="text-gray-300 text-xs">{voiceProfile.basicProfile.energy}</span>
                    </div>
                  )}
                  {voiceProfile.basicProfile.humor && (
                    <div>
                      <span className="text-purple-300 font-medium text-xs">Humor: </span>
                      <span className="text-gray-300 text-xs">{voiceProfile.basicProfile.humor}</span>
                    </div>
                  )}
                </div>

                {voiceProfile.basicProfile.signaturePhrases && voiceProfile.basicProfile.signaturePhrases.length > 0 && (
                  <div className="pt-2 border-t border-purple-500/20">
                    <span className="text-purple-300 font-medium text-xs">Signature Phrases: </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {voiceProfile.basicProfile.signaturePhrases.slice(0, 5).map((phrase, idx) => (
                        <span key={idx} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded">
                          "{phrase}"
                        </span>
                      ))}
                      {voiceProfile.basicProfile.signaturePhrases.length > 5 && (
                        <span className="text-xs text-purple-400">
                          +{voiceProfile.basicProfile.signaturePhrases.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {voiceProfile.enhancedProfile?.confidenceScores && (
                  <div className="pt-2 mt-2 border-t border-purple-500/20">
                    <span className="text-purple-300 font-medium text-xs">Authenticity Score: </span>
                    <span className="text-green-400 font-semibold text-xs">
                      {Math.round(voiceProfile.enhancedProfile.confidenceScores.overallAuthenticity * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {voiceProfiles.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Train a voice profile for your channel to maintain consistent tone
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="glass-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 font-medium transition-all transform hover:scale-105"
          >
            Save Summary
          </button>
        </div>
      </div>
    </div>
  );
}
