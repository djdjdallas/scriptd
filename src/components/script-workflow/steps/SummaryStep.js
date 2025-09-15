"use client";

import { useState, useEffect } from "react";
import { useWorkflow } from "../ScriptWorkflow";
import { FileText, Users, Mic, Brain, Youtube, Sparkles, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CustomDropdown } from "@/components/ui/custom-dropdown";

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
    workflowData.summary?.aiModel || "claude-3-opus"
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

  const supabase = createClient();

  useEffect(() => {
    loadVoiceProfiles();
    loadChannels();
  }, []);

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

      const { data, error } = await supabase
        .from("voice_profiles")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_trained", true) // Only show trained voice profiles
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVoiceProfiles(data || []);
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

  const handleChannelSelect = (channelId) => {
    setSelectedChannel(channelId);
    const channel = channels.find((c) => c.id === channelId);
    if (channel && channel.audience_description) {
      setTargetAudience(channel.audience_description);
      setAudienceType("channel");
      toast.success("Audience loaded from your YouTube channel");
    }
  };

  const handleSave = () => {
    const finalAudience =
      audienceType === "custom" ? customAudience : targetAudience;

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
    };

    updateStepData("summary", summaryData);
    updateWorkflowTitle(topic || "Untitled Script");

    if (topic && finalAudience) {
      markStepComplete(1);
      toast.success("Summary saved!");
      // Navigate to next step (Research)
      goToStep(2);
    } else {
      toast.error("Please fill in all required fields");
    }
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

  const durationPresets = [
    { value: 30, label: "30 sec", description: "Quick tip or teaser" },
    { value: 60, label: "1 min", description: "Short-form content" },
    { value: 180, label: "3 min", description: "Brief explanation" },
    { value: 300, label: "5 min", description: "Standard tutorial" },
    { value: 600, label: "10 min", description: "In-depth guide" },
    { value: 900, label: "15 min", description: "Comprehensive lesson" },
    { value: 1200, label: "20 min", description: "Full course module" },
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
            {durationPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setTargetDuration(preset.value);
                  setCustomDuration('');
                }}
                className={`p-3 rounded-lg border transition-all ${
                  targetDuration === preset.value && !customDuration
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-purple-500/30 hover:border-purple-500/50 text-gray-400 hover:text-white bg-black/30'
                }`}
              >
                <div className="font-medium">{preset.label}</div>
                <div className="text-xs mt-1 opacity-70">{preset.description}</div>
              </button>
            ))}
          </div>

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
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Target Audience
            </span>
          </label>

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
                <Youtube className="h-4 w-4" />
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
                      <p className="text-sm text-gray-300">{targetAudience}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <Youtube className="h-8 w-8 text-gray-500 mx-auto mb-2" />
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
                AI Model
              </span>
            </label>
            <CustomDropdown
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              options={[
                {
                  value: "claude-4-opus",
                  label: "Claude 4 Opus (Best Quality)",
                },
                {
                  value: "claude-3-sonnet",
                  label: "Claude 3 Sonnet (Balanced)",
                },
                { value: "claude-3-haiku", label: "Claude 3 Haiku (Faster)" },
              ]}
            />
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
                    label: `${profile.name} ${profile.is_trained ? "✓" : ""}`,
                  }))
                : [
                    {
                      value: "disabled",
                      label: "No trained voice profiles available",
                      disabled: true,
                    },
                  ]),
            ]}
          />
          {voiceProfiles.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Train a voice profile in the Voice section to maintain consistent
              tone
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
