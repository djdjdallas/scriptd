"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { ChannelSelector } from "./channel-selector";
import { RemixConfigPanel } from "./remix-config-panel";
import { RemixPreview } from "./remix-preview";
import {
  ChevronRight,
  ChevronLeft,
  Shuffle,
  Search,
  Settings,
  Eye,
  Check,
  Loader2,
} from "lucide-react";

export function RemixChannelWizard() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [remixConfig, setRemixConfig] = useState({
    name: "",
    description: "",
    weights: {},
    elements: {
      content_strategy: true,
      voice_style: true,
      audience_targeting: true,
      publishing_schedule: true,
      video_formats: true,
    },
  });
  const [analysisData, setAnalysisData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");

  // Debug selectedChannels state changes
  useEffect(() => {
    console.log(
      "selectedChannels state updated:",
      selectedChannels.length,
      "channels"
    );
    if (selectedChannels.length > 0) {
      console.log("First channel:", selectedChannels[0]);
    }
  }, [selectedChannels]);

  const steps = [
    {
      id: "select",
      title: "Select Channels",
      description: "Choose 2-3 successful channels to remix",
      icon: Search,
    },
    {
      id: "configure",
      title: "Configure Remix",
      description: "Choose which elements to combine",
      icon: Settings,
    },
    {
      id: "preview",
      title: "Preview & Create",
      description: "Review your remix and create your channel",
      icon: Eye,
    },
  ];

  const handleNext = async () => {
    if (currentStep === 0 && selectedChannels.length < 2) {
      toast({
        title: "Select More Channels",
        description: "Please select at least 2 channels to remix",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 1) {
      // Analyze the remix combination
      await analyzeRemix();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const analyzeRemix = async () => {
    setIsAnalyzing(true);
    setAnalysisStep("Analyzing remix...");

    try {
      // Simulate progress steps
      setTimeout(() => setAnalysisStep("Generating voice profile..."), 1000);
      setTimeout(
        () => setAnalysisStep("Generating audience insights..."),
        2000
      );
      setTimeout(() => setAnalysisStep("Generating content ideas..."), 3000);

      console.log(
        "Selected channels full data:",
        JSON.stringify(selectedChannels, null, 2)
      );
      const channelIds = selectedChannels.map((c) => {
        // Log all possible ID fields
        console.log("Channel object keys:", Object.keys(c));
        console.log("Channel details:", {
          id: c.id,
          channelId: c.channelId,
          youtube_channel_id: c.youtube_channel_id,
          title: c.title,
        });
        const id = c.id || c.channelId || c.youtube_channel_id;
        console.log("Extracted ID:", id);
        return id;
      });
      console.log("Final channelIds for analysis:", channelIds);

      const response = await fetch("/api/channels/remix/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelIds: channelIds,
          channels: selectedChannels, // Pass full channel data as well
          config: remixConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Analysis failed:", data);
        throw new Error(data.error || "Failed to analyze remix");
      }

      setAnalysisData(data);
      setAnalysisStep("");
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description:
          error.message || "Could not analyze the channel combination",
        variant: "destructive",
      });
      setAnalysisStep("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreate = async () => {
    if (!remixConfig.name) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your remixed channel",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/channels/remix/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedChannels,
          config: remixConfig,
          analysisData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create remix channel");
      }

      const { channel } = await response.json();

      toast({
        title: "Channel Created!",
        description: "Your remixed channel has been created successfully",
      });

      router.push(`/channels/${channel.id}`);
    } catch (error) {
      console.error("Creation error:", error);
      toast({
        title: "Creation Failed",
        description: "Could not create the remixed channel",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 ${
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    isActive
                      ? "bg-purple-500 text-white ring-4 ring-purple-500/20"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div
                  className={`hidden md:block ${
                    index < steps.length - 1 ? "mr-4" : ""
                  }`}
                >
                  <p
                    className={`font-medium ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-[2px] bg-gray-700 mx-4">
                    <div
                      className="h-full bg-purple-500 transition-all"
                      style={{
                        width: isCompleted ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="glass-card p-8">
        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-purple-200 animate-pulse"></div>
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-purple-500 animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-white mt-6 mb-2">
              Analyzing Your Remix
            </h3>
            <p className="text-gray-400 animate-pulse">{analysisStep}</p>
            <div className="mt-4 space-y-2 text-center">
              <p className="text-sm text-gray-500">
                Combining {selectedChannels.length} channels
              </p>
              <p className="text-sm text-gray-500">May take a couple mintues</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        {!isAnalyzing && currentStep === 0 && (
          <ChannelSelector
            selectedChannels={selectedChannels}
            onSelectChannel={(channel) => {
              console.log(
                "Selecting channel:",
                JSON.stringify(channel, null, 2)
              );
              console.log("Channel has these keys:", Object.keys(channel));
              if (selectedChannels.length < 3) {
                const newChannels = [...selectedChannels, channel];
                console.log(
                  "Updated selectedChannels:",
                  newChannels.length,
                  "channels"
                );
                setSelectedChannels(newChannels);
              }
            }}
            onRemoveChannel={(channelId) => {
              setSelectedChannels(
                selectedChannels.filter(
                  (c) => (c.id || c.channelId) !== channelId
                )
              );
            }}
            maxChannels={3}
          />
        )}

        {!isAnalyzing && currentStep === 1 && (
          <RemixConfigPanel
            selectedChannels={selectedChannels}
            config={remixConfig}
            onConfigChange={setRemixConfig}
          />
        )}

        {!isAnalyzing && currentStep === 2 && (
          <RemixPreview
            selectedChannels={selectedChannels}
            config={remixConfig}
            analysisData={analysisData}
            onConfigChange={setRemixConfig}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          disabled={currentStep === 0 || isAnalyzing}
          className="glass-button"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleCreate}
            disabled={isCreating || !remixConfig.name || isAnalyzing}
            className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Shuffle className="mr-2 h-4 w-4" />
                Create Remixed Channel
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isAnalyzing}
            className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
