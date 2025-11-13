"use client";

import { useState, useEffect } from "react";
import { useWorkflow } from "../ScriptWorkflow";
import { FileText, Users, Mic, Brain, Video, Sparkles, Clock, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { SCRIPT_CONFIG } from "@/lib/scriptGenerationConfig";
import { MODEL_TIERS } from "@/lib/constants";
import ContentIdeaBanner from "../ContentIdeaBanner";

// Helper function to normalize model names from old to new format
const normalizeModelName = (model) => {
  // Map old model names to new ones
  const modelMapping = {
    'claude-3-5-haiku': MODEL_TIERS.FAST.actualModel,
    'claude-3-5-sonnet': MODEL_TIERS.BALANCED.actualModel,
    'claude-3-opus': MODEL_TIERS.PREMIUM.actualModel,
    'claude-opus-4-1': MODEL_TIERS.PREMIUM.actualModel,
  };

  // If it's an old model name, return the new one
  if (modelMapping[model]) {
    console.log(`[SummaryStep] Migrating old model ${model} to ${modelMapping[model]}`);
    return modelMapping[model];
  }

  // Otherwise return as-is (already correct or default)
  return model;
};

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
    normalizeModelName(workflowData.summary?.aiModel) || MODEL_TIERS.BALANCED.actualModel
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

  // Sync local state with workflowData when it changes (for content idea pre-fill)
  useEffect(() => {
    if (workflowData.summary) {
      console.log('[SummaryStep] Syncing state with workflowData.summary');
      if (workflowData.summary.topic && !topic) {
        setTopic(workflowData.summary.topic);
      }
      if (workflowData.summary.targetAudience && !targetAudience) {
        setTargetAudience(workflowData.summary.targetAudience);
      }
      if (workflowData.summary.audienceType && audienceType === 'preset') {
        setAudienceType(workflowData.summary.audienceType);
      }
      if (workflowData.summary.tone && tone === 'professional') {
        setTone(workflowData.summary.tone);
      }
      if (workflowData.summary.voiceProfile && !voiceProfile) {
        setVoiceProfile(workflowData.summary.voiceProfile);
      }
      if (workflowData.summary.channelId && !selectedChannel) {
        setSelectedChannel(workflowData.summary.channelId);
      }
      if (workflowData.summary.targetDuration && targetDuration === 300) {
        setTargetDuration(workflowData.summary.targetDuration);
      }
      if (workflowData.summary.aiModel) {
        const normalizedModel = normalizeModelName(workflowData.summary.aiModel);
        if (normalizedModel !== aiModel) {
          setAiModel(normalizedModel);
        }
      }
    }
  }, [workflowData.summary]);

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
      // Filter for channels that have voice_profile data (not null/empty)
      const { data: userChannels, error: channelError } = await supabase
        .from("channels")
        .select("id, name, title, voice_profile, voice_training_status")
        .eq("user_id", user.id)
        .not("voice_profile", "is", null); // Only channels with voice profile data

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

        // Normalize the structure - handle both flat and nested formats
        // Database stores: { tone: [], style: [], pace: "..." }
        // UI expects: { basicProfile: { tone: [], style: [], pace: "..." } }
        let basicProfile = actualProfile?.basicProfile;

        if (!basicProfile && actualProfile) {
          // If basicProfile doesn't exist but we have top-level properties, create it
          basicProfile = {
            tone: actualProfile.tone || [],
            style: actualProfile.style || [],
            pace: actualProfile.pace || 'moderate',
            energy: actualProfile.energy || 'medium',
            humor: actualProfile.humor || 'occasional',
            summary: actualProfile.summary || '',
            signaturePhrases: actualProfile.signature_phrases || actualProfile.signaturePhrases || [],
            hooks: actualProfile.hooks || '',
            transitions: actualProfile.transitions || '',
            engagement: actualProfile.engagement || ''
          };
        }

        const profile = {
          id: channel.id,
          profile_name: channel.title || channel.name,
          channel_id: channel.id,
          channel_title: channel.title,
          channel_name: channel.name,
          // Include the full voice profile data
          voiceProfileData: actualProfile,
          // Map to expected structure for compatibility
          basicProfile: basicProfile,
          enhancedProfile: actualProfile?.enhancedProfile || actualProfile?.confidenceScores,
          metadata: actualProfile?.metadata || (actualProfile?.metadata ? actualProfile.metadata : undefined),
          basedOnRealData: voiceProfileData?.basedOnRealData || actualProfile?.basedOnRealData || actualProfile?.metadata?.basedOnRealData,
          // Include top-level fields for backward compatibility
          hooks: actualProfile.hooks || basicProfile?.hooks || '',
          transitions: actualProfile.transitions || basicProfile?.transitions || '',
          engagement: actualProfile.engagement || basicProfile?.engagement || '',
          signature_phrases: actualProfile.signature_phrases || actualProfile.signaturePhrases || basicProfile?.signaturePhrases || [],
          // Include comprehensive voice profile fields
          tone: actualProfile.tone || basicProfile?.tone || [],
          style: actualProfile.style || basicProfile?.style || [],
          pace: actualProfile.pace || basicProfile?.pace || 'moderate',
          energy: actualProfile.energy || basicProfile?.energy || 'medium',
          personality: actualProfile.personality || [],
          linguisticFingerprints: actualProfile.linguisticFingerprints || {},
          narrativeStructure: actualProfile.narrativeStructure || {},
          emotionalDynamics: actualProfile.emotionalDynamics || {},
          contentPositioning: actualProfile.contentPositioning || {},
          culturalReferences: actualProfile.culturalReferences || {},
          technicalPatterns: actualProfile.technicalPatterns || {},
          engagementTechniques: actualProfile.engagementTechniques || {},
          pacingDynamics: actualProfile.pacingDynamics || {},
          implementationNotes: actualProfile.implementationNotes || {},
          confidenceScores: actualProfile.confidenceScores || {},
          performanceInsights: actualProfile.performanceInsights || {}
        };

        // Debug logging
        console.log(`[SummaryStep] Voice profile for ${channel.title}:`, {
          hasBasicProfile: !!profile.basicProfile,
          hasTopLevelTone: !!actualProfile?.tone,
          hasEnhancedProfile: !!profile.enhancedProfile,
          hasMetadata: !!profile.metadata,
          basedOnRealData: profile.basedOnRealData,
          hasLinguisticFingerprints: !!profile.linguisticFingerprints && Object.keys(profile.linguisticFingerprints).length > 0,
          hasNarrativeStructure: !!profile.narrativeStructure && Object.keys(profile.narrativeStructure).length > 0,
          hasEmotionalDynamics: !!profile.emotionalDynamics && Object.keys(profile.emotionalDynamics).length > 0,
          hasPerformanceInsights: !!profile.performanceInsights && Object.keys(profile.performanceInsights).length > 0
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
    } catch (error) {
      console.error("Error loading channels:", error);
    }
  };

  // Helper function to create comprehensive but token-efficient audience description
  // Keeps ALL important data but removes JSON bloat to save ~30-40% tokens
  const createComprehensiveAudienceDescription = (audiencePersona) => {
    const sections = [];

    // DEMOGRAPHICS (keep full - essential for targeting)
    if (audiencePersona.demographic_profile) {
      const demo = audiencePersona.demographic_profile;
      sections.push('DEMOGRAPHICS:');

      if (demo.age_distribution) {
        sections.push(`Age: ${Object.entries(demo.age_distribution).map(([k,v]) => `${k}=${v}`).join(', ')}`);
      }
      if (demo.gender_distribution) {
        sections.push(`Gender: ${Object.entries(demo.gender_distribution).map(([k,v]) => `${k}=${v}`).join(', ')}`);
      }
      if (demo.geographic_distribution) {
        sections.push(`Location: ${Object.entries(demo.geographic_distribution).map(([k,v]) => `${k}=${v}`).join(', ')}`);
      }
      if (demo.education_income?.education_level) {
        sections.push(`Education: ${Object.entries(demo.education_income.education_level).map(([k,v]) => `${k}=${v}`).join(', ')}`);
      }
      if (demo.education_income?.income_brackets) {
        sections.push(`Income: ${Object.entries(demo.education_income.income_brackets).map(([k,v]) => `${k}=${v}`).join(', ')}`);
      }
    }

    // PSYCHOGRAPHICS (keep full - critical for script tone and messaging)
    if (audiencePersona.psychographic_analysis) {
      const psycho = audiencePersona.psychographic_analysis;
      sections.push('\nPSYCHOGRAPHICS:');

      if (psycho.core_values && psycho.core_values.length > 0) {
        sections.push(`Values: ${psycho.core_values.join(', ')}`);
      }
      if (psycho.pain_points && psycho.pain_points.length > 0) {
        sections.push(`Pain Points: ${psycho.pain_points.join(', ')}`);
      }
      if (psycho.aspirations && psycho.aspirations.length > 0) {
        sections.push(`Aspirations: ${psycho.aspirations.join(', ')}`);
      }
      if (psycho.lifestyle_preferences) {
        const life = psycho.lifestyle_preferences;
        if (life.media_consumption) sections.push(`Media: ${life.media_consumption}`);
        if (life.social_habits) sections.push(`Social: ${life.social_habits}`);
        if (life.leisure_activities && life.leisure_activities.length > 0) {
          sections.push(`Activities: ${life.leisure_activities.join(', ')}`);
        }
      }
    }

    // ENGAGEMENT DRIVERS (keep full - critical for hooks, retention, and virality)
    if (audiencePersona.engagement_drivers) {
      const engage = audiencePersona.engagement_drivers;
      sections.push('\nENGAGEMENT TRIGGERS:');

      if (engage.comment_triggers && engage.comment_triggers.length > 0) {
        sections.push(`Comment Triggers: ${engage.comment_triggers.join('; ')}`);
      }
      if (engage.loyalty_builders && engage.loyalty_builders.length > 0) {
        sections.push(`Loyalty Builders: ${engage.loyalty_builders.join('; ')}`);
      }
      if (engage.sharing_motivators && engage.sharing_motivators.length > 0) {
        sections.push(`Share Motivators: ${engage.sharing_motivators.join('; ')}`);
      }
    }

    // CONTENT CONSUMPTION (keep full - critical for pacing, length, and structure)
    if (audiencePersona.content_consumption_patterns) {
      const content = audiencePersona.content_consumption_patterns;
      sections.push('\nCONTENT PREFERENCES:');

      if (content.preferred_video_length) {
        sections.push(`Video Length: ${Object.entries(content.preferred_video_length).map(([k,v]) => `${k}=${v}`).join(', ')}`);
      }
      if (content.viewing_behavior) {
        const viewing = content.viewing_behavior;
        if (viewing.completion_rate) sections.push(`Completion Rate: ${viewing.completion_rate}`);
        if (viewing.binge_watching) sections.push(`Binge Watching: ${viewing.binge_watching}`);
        if (viewing.return_frequency) sections.push(`Return Frequency: ${viewing.return_frequency}`);
      }
      if (content.platform_preferences) {
        sections.push(`Platforms: ${Object.entries(content.platform_preferences).map(([k,v]) => `${k}=${v}`).join(', ')}`);
      }
    }

    // AUDIENCE SEGMENTS (keep - useful for understanding different viewer types)
    if (audiencePersona.audience_overlap?.unique_segments) {
      sections.push('\nAUDIENCE SEGMENTS:');
      Object.entries(audiencePersona.audience_overlap.unique_segments).forEach(([name, data]) => {
        sections.push(`• ${name.replace(/_/g, ' ')} (${data.percentage}): ${data.characteristics.join(', ')}`);
      });
    }

    // COMMON INTERESTS (keep - helps with content relevance)
    if (audiencePersona.audience_overlap?.common_interests && audiencePersona.audience_overlap.common_interests.length > 0) {
      sections.push('\nCOMMON INTERESTS:');
      sections.push(audiencePersona.audience_overlap.common_interests.join(', '));
    }

    return sections.join('\n');
  };

  const handleChannelSelect = async (channelId) => {
    setSelectedChannel(channelId);
    const channel = channels.find((c) => c.id === channelId);

    console.log('[SummaryStep] Channel selected:', channelId);

    if (channel) {
      // Try to load latest analysis from channel_analyses table
      try {
        console.log('[SummaryStep] Loading latest analysis from channel_analyses for channel:', channelId);

        const { data: latestAnalysis, error: analysisError } = await supabase
          .from('channel_analyses')
          .select('audience_persona, analytics_data')
          .eq('channel_id', channelId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (analysisError) {
          console.log('[SummaryStep] No analysis found in channel_analyses:', analysisError);
        } else if (latestAnalysis) {
          console.log('[SummaryStep] Found latest analysis');

          // Parse audience_persona if it's a string
          let audiencePersona = latestAnalysis.audience_persona;
          if (typeof audiencePersona === 'string') {
            try {
              audiencePersona = JSON.parse(audiencePersona);
              console.log('[SummaryStep] Parsed audience_persona');
            } catch (e) {
              console.error('[SummaryStep] Failed to parse audience_persona:', e);
              audiencePersona = null;
            }
          }

          console.log('[SummaryStep] Audience persona structure:', {
            hasData: !!audiencePersona,
            hasDemographicProfile: !!audiencePersona?.demographic_profile,
            hasPsychographicAnalysis: !!audiencePersona?.psychographic_analysis,
            hasContentConsumption: !!audiencePersona?.content_consumption_patterns,
            hasMonetization: !!audiencePersona?.monetization_potential,
            parseMethod: audiencePersona?._parseMethod
          });

          // Check if we have rich audience analysis (new comprehensive structure)
          if (audiencePersona && (audiencePersona.demographic_profile || audiencePersona.psychographic_analysis)) {
            console.log('[SummaryStep] ✅ Loaded comprehensive audience analysis from channel_analyses');

            // Create token-efficient description that keeps ALL important data
            const audienceDescription = createComprehensiveAudienceDescription(audiencePersona);
            console.log('[SummaryStep] Created comprehensive audience description:', audienceDescription.substring(0, 200) + '...');
            console.log('[SummaryStep] Description length:', audienceDescription.length, 'chars');

            setTargetAudience(audienceDescription);
            setAudienceType("channel");
            toast.success("Comprehensive audience analysis loaded from your channel");
            return;
          }

          // OLD FORMAT: Try analytics_data.audience.insights.audience_analysis (backwards compatibility)
          let analyticsData = latestAnalysis.analytics_data;
          if (typeof analyticsData === 'string') {
            try {
              analyticsData = JSON.parse(analyticsData);
            } catch (e) {
              analyticsData = null;
            }
          }

          if (analyticsData?.audience?.insights?.audience_analysis) {
            console.log('[SummaryStep] ✅ Loaded audience analysis from analytics_data (old format)');

            // Try to create comprehensive description if it has the same structure
            const oldFormatData = analyticsData.audience.insights.audience_analysis;
            let audienceDescription;

            if (oldFormatData.demographic_profile || oldFormatData.psychographic_analysis) {
              audienceDescription = createComprehensiveAudienceDescription(oldFormatData);
              console.log('[SummaryStep] Created description from old format, length:', audienceDescription.length, 'chars');
            } else {
              // Fallback for very old formats - just stringify if small enough
              const stringified = JSON.stringify(oldFormatData);
              audienceDescription = stringified.length < 500 ? stringified : `Audience of ${channel.title || channel.name}`;
            }

            setTargetAudience(audienceDescription);
            setAudienceType("channel");
            toast.success("Audience analysis loaded from your channel");
            return;
          }
        }
      } catch (error) {
        console.error("[SummaryStep] Error loading analysis from channel_analyses:", error);
      }

      // Fallback to simple audience_description from channels table
      console.log('[SummaryStep] Falling back to simple audience_description from channels table');
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
      aiModel: normalizeModelName(aiModel), // Ensure we always save the correct model name
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

  // Helper to check if duration is "coming soon" (45+ minutes)
  const isDurationComingSoon = (seconds) => {
    const minutes = Math.ceil(seconds / 60);
    return minutes >= 45; // 45+ minutes are coming soon
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
          <ContentIdeaBanner
            contentIdeaInfo={workflowData.summary.contentIdeaInfo}
            niche={workflowData.summary.niche}
            compact={false}
          />
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
              const isComingSoon = isDurationComingSoon(preset.value);
              const isAllowed = isDurationAllowed(preset.value);
              const isLocked = isComingSoon || (!isAllowed && userTier === "free");

              return (
                <button
                  key={preset.value}
                  onClick={() => {
                    if (isComingSoon) {
                      toast.info(`${preset.label} scripts are coming soon! Stay tuned.`);
                    } else if (isAllowed) {
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
                    {isComingSoon ? 'Coming Soon' : isLocked ? 'Pro Only' : preset.description}
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
                        if (audienceData?.demographic_profile || audienceData?.psychographic_analysis) {
                          return (
                            <div className="text-sm text-gray-300 space-y-2">
                              {audienceData.demographic_profile?.age_distribution && (
                                <div>
                                  <span className="text-purple-300 font-medium">Demographics: </span>
                                  {(() => {
                                    const ages = audienceData.demographic_profile.age_distribution;
                                    const primaryAge = Object.entries(ages)
                                      .sort((a, b) => {
                                        const percentA = parseInt(String(a[1]).replace('%', '')) || 0;
                                        const percentB = parseInt(String(b[1]).replace('%', '')) || 0;
                                        return percentB - percentA;
                                      })[0]?.[0] || 'N/A';
                                    const malePercent = audienceData.demographic_profile.gender_distribution?.male || 'N/A';
                                    return `Primary age ${primaryAge}, ${malePercent}% male`;
                                  })()}
                                </div>
                              )}
                              {audienceData.psychographic_analysis?.core_values && (
                                <div>
                                  <span className="text-purple-300 font-medium">Values: </span>
                                  {Array.isArray(audienceData.psychographic_analysis.core_values)
                                    ? audienceData.psychographic_analysis.core_values.slice(0, 3).join(', ')
                                    : audienceData.psychographic_analysis.core_values}
                                </div>
                              )}
                              {audienceData.content_consumption_patterns?.preferred_video_length && (
                                <div>
                                  <span className="text-purple-300 font-medium">Preferred length: </span>
                                  {(() => {
                                    const lengthData = audienceData.content_consumption_patterns.preferred_video_length;
                                    // Handle both new format (object with percentages) and old format (optimal_range string)
                                    if (typeof lengthData === 'object' && !lengthData.optimal_range) {
                                      // New format: find highest percentage category
                                      const topLength = Object.entries(lengthData)
                                        .filter(([key]) => !key.startsWith('_'))
                                        .sort((a, b) => {
                                          const percentA = parseInt(String(a[1]).replace('%', '')) || 0;
                                          const percentB = parseInt(String(b[1]).replace('%', '')) || 0;
                                          return percentB - percentA;
                                        })[0];
                                      return topLength ? `${topLength[0].replace(/_/g, ' ')} (${topLength[1]})` : 'N/A';
                                    }
                                    // Old format: optimal_range string
                                    return lengthData.optimal_range || lengthData.optimal_length || 'N/A';
                                  })()}
                                </div>
                              )}
                              {audienceData.monetization_potential?.product_categories?.high_interest && (
                                <div>
                                  <span className="text-purple-300 font-medium">Interests: </span>
                                  {audienceData.monetization_potential.product_categories.high_interest.slice(0, 2).join(', ')}
                                </div>
                              )}
                              {audienceData._parseMethod && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Parse method: {audienceData._parseMethod}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-2">✨ Full demographic & psychographic analysis will be used for script generation</p>
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
                { value: MODEL_TIERS.FAST.actualModel, label: "Fast (1x credits)", description: "Quick generation with good quality" },
                { value: MODEL_TIERS.BALANCED.actualModel, label: "Professional (1.5x credits)", description: "Better storytelling and flow" },
                { value: MODEL_TIERS.PREMIUM.actualModel, label: "Hollywood (3.5x credits)", description: "Premium quality with advanced AI" },
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
                    const multiplier = aiModel === MODEL_TIERS.PREMIUM.actualModel ? 3.5 :
                                     aiModel === MODEL_TIERS.BALANCED.actualModel ? 1.5 : 1;
                    return Math.max(1, Math.round(minutes * baseRate * multiplier));
                  })()} credits
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.ceil(targetDuration / 60)} min × {aiModel === MODEL_TIERS.PREMIUM.actualModel ? '3.5x Hollywood' :
                 aiModel === MODEL_TIERS.BALANCED.actualModel ? '1.5x Professional' : '1x Fast'}
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
          {voiceProfile && voiceProfile.id && (
            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-300 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Voice Profile Analysis
              </p>

              <div className="space-y-2 text-sm">
                <div className="pb-2 border-b border-purple-500/20">
                  <p className="text-sm font-semibold text-white mb-1">
                    {voiceProfile.profile_name || voiceProfile.channel_title}
                  </p>
                  {voiceProfile.basedOnRealData && (
                    <p className="text-xs text-green-400">✓ Based on real channel analysis</p>
                  )}
                </div>

                {(voiceProfile.basicProfile || voiceProfile.tone || voiceProfile.style || voiceProfile.summary) ? (
                  <>
                    {(voiceProfile.basicProfile?.summary || voiceProfile.summary) && (
                      <div className="pb-2">
                        <p className="text-gray-300 italic">{voiceProfile.basicProfile?.summary || voiceProfile.summary}</p>
                      </div>
                    )}

                    {(voiceProfile.basicProfile?.tone || voiceProfile.tone) && (
                      <div>
                        <span className="text-purple-300 font-medium">Tone: </span>
                        <span className="text-gray-300">
                          {(() => {
                            const tone = voiceProfile.basicProfile?.tone || voiceProfile.tone;
                            return Array.isArray(tone) ? tone.join(', ') : tone;
                          })()}
                        </span>
                      </div>
                    )}

                    {(voiceProfile.basicProfile?.style || voiceProfile.style) && (
                      <div>
                        <span className="text-purple-300 font-medium">Style: </span>
                        <span className="text-gray-300">
                          {(() => {
                            const style = voiceProfile.basicProfile?.style || voiceProfile.style;
                            return Array.isArray(style) ? style.join(', ') : style;
                          })()}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {(voiceProfile.basicProfile?.pace || voiceProfile.pace) && (
                        <div>
                          <span className="text-purple-300 font-medium text-xs">Pace: </span>
                          <span className="text-gray-300 text-xs">{voiceProfile.basicProfile?.pace || voiceProfile.pace}</span>
                        </div>
                      )}
                      {(voiceProfile.basicProfile?.energy || voiceProfile.energy) && (
                        <div>
                          <span className="text-purple-300 font-medium text-xs">Energy: </span>
                          <span className="text-gray-300 text-xs">{voiceProfile.basicProfile?.energy || voiceProfile.energy}</span>
                        </div>
                      )}
                      {(voiceProfile.basicProfile?.humor || voiceProfile.humor) && (
                        <div>
                          <span className="text-purple-300 font-medium text-xs">Humor: </span>
                          <span className="text-gray-300 text-xs">{voiceProfile.basicProfile?.humor || voiceProfile.humor}</span>
                        </div>
                      )}
                    </div>

                    {(() => {
                      const phrases = voiceProfile.basicProfile?.signaturePhrases ||
                                     voiceProfile.signature_phrases ||
                                     voiceProfile.signaturePhrases;
                      const phrasesArray = Array.isArray(phrases) ? phrases : (phrases ? [phrases] : null);
                      return phrasesArray && phrasesArray.length > 0 && (
                        <div className="pt-2 border-t border-purple-500/20">
                          <span className="text-purple-300 font-medium text-xs">Signature Phrases: </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {phrasesArray.slice(0, 5).map((phrase, idx) => (
                              <span key={idx} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded">
                                "{phrase}"
                              </span>
                            ))}
                            {phrasesArray.length > 5 && (
                              <span className="text-xs text-purple-400">
                                +{phrasesArray.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {(() => {
                      const scores = voiceProfile.enhancedProfile?.confidenceScores || voiceProfile.confidenceScores;
                      const overallScore = scores?.overallAuthenticity || scores?.overall?.confidence;
                      return overallScore && (
                        <div className="pt-2 mt-2 border-t border-purple-500/20">
                          <span className="text-purple-300 font-medium text-xs">Confidence Score: </span>
                          <span className="text-green-400 font-semibold text-xs">
                            {typeof overallScore === 'number'
                              ? (overallScore > 1 ? Math.round(overallScore) : Math.round(overallScore * 100))
                              : overallScore}
                            {typeof overallScore === 'number' && overallScore <= 1 ? '%' : ''}
                          </span>
                        </div>
                      );
                    })()}

                    <p className="text-xs text-gray-400 mt-2">✨ Full voice profile will be used for script generation</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-300">
                    Voice profile loaded for {voiceProfile.profile_name || voiceProfile.channel_title}
                  </p>
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
