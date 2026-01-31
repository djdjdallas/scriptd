"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StaticCard } from "@/components/ui/static-card";
import {
  Eye,
  Sparkles,
  Users,
  Target,
  Mic,
  Video,
  Clock,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function RemixPreview({
  selectedChannels,
  config,
  analysisData,
  onConfigChange,
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localAnalysis, setLocalAnalysis] = useState(analysisData);

  // Helper function to safely render any value
  const renderValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "object") {
      // Handle the specific case of {primary_descriptors, description} objects
      if (value.primary_descriptors && value.description) {
        // Combine both fields into a readable string
        const descriptors = renderValue(value.primary_descriptors);
        const desc = renderValue(value.description);
        return descriptors ? `${descriptors}: ${desc}` : desc;
      }
      // Try to extract meaningful content from object
      if (value.description) return renderValue(value.description);
      if (value.primary_descriptors)
        return renderValue(value.primary_descriptors);
      if (value.text) return renderValue(value.text);
      if (value.content) return renderValue(value.content);
      if (value.message) return renderValue(value.message);
      if (Array.isArray(value))
        return value.map((v) => renderValue(v)).join(", ");
      // For other objects, try to get a string representation
      if (Object.keys(value).length === 0) return "";
      // Last resort: stringify
      try {
        return JSON.stringify(value);
      } catch (e) {
        return "[Complex Object]";
      }
    }
    return String(value);
  };

  useEffect(() => {
    if (!analysisData && selectedChannels.length > 0) {
      generatePreview();
    }
  }, []);

  const generatePreview = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/channels/remix/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelIds: selectedChannels.map((c) => c.id || c.channelId),
          config: config,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLocalAnalysis(data);
      }
    } catch (error) {
      console.error("Preview generation error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analysis = localAnalysis || analysisData;

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-4" />
        <p className="text-gray-400">Generating your remix preview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          Preview Your Remixed Channel
        </h3>
        <p className="text-gray-400">
          Review how your channel will combine the best of all selected channels
        </p>
      </div>

      {/* Channel Name & Description */}
      <div className="p-6 glass rounded-lg space-y-4">
        <div>
          <Label htmlFor="preview-name" className="text-gray-300">
            Channel Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="preview-name"
            value={config.name || ""}
            onChange={(e) => {
              const newConfig = { ...config, name: e.target.value };
              // Call parent's onConfigChange if it exists
              if (onConfigChange) {
                onConfigChange(newConfig);
              }
            }}
            placeholder="Enter your remix channel name"
            className="mt-2 glass-input text-white"
          />
        </div>

        <div>
          <Label htmlFor="preview-description" className="text-gray-300">
            Channel Description
          </Label>
          <Textarea
            id="preview-description"
            value={config.description || ""}
            onChange={(e) => {
              const newConfig = { ...config, description: e.target.value };
              // Call parent's onConfigChange if it exists
              if (onConfigChange) {
                onConfigChange(newConfig);
              }
            }}
            placeholder="Describe your unique approach and what makes your remix special..."
            className="mt-2 glass-input text-white min-h-[80px] bg-black/20 border-gray-700 placeholder:text-gray-500"
          />
        </div>

        <div className="flex gap-2">
          <Badge className="bg-purple-500/20 text-purple-400">
            Remix Channel
          </Badge>
          <Badge className="bg-green-500/20 text-green-400">
            {selectedChannels.length} Sources
          </Badge>
        </div>
      </div>

      {/* Source Channels */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Source Channels
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {selectedChannels.map((channel, index) => {
            const channelId =
              channel.id || channel.channelId || `channel-${index}`;
            const weight =
              config.weights[channelId] || 1 / selectedChannels.length;

            return (
              <div
                key={channelId || `channel-${index}`}
                className="p-4 glass rounded-lg"
              >
                <h5 className="font-medium text-white line-clamp-1">
                  {channel.title}
                </h5>
                <p className="text-sm text-gray-400 mt-1">
                  {Math.round(weight * 100)}% influence
                </p>
                <Progress value={weight * 100} className="mt-2 h-1" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Remix Elements */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Remix Configuration
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(config.elements).map(([key, enabled]) => {
            const icons = {
              content_strategy: Target,
              voice_style: Mic,
              audience_targeting: Users,
              publishing_schedule: Clock,
              video_formats: Video,
            };
            const labels = {
              content_strategy: "Content Strategy",
              voice_style: "Voice & Style",
              audience_targeting: "Audience",
              publishing_schedule: "Schedule",
              video_formats: "Formats",
            };
            const Icon = icons[key];

            return (
              <div
                key={key}
                className={`p-3 glass rounded-lg border ${
                  enabled ? "border-green-400/30" : "border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                  )}
                  <Icon
                    className={`h-4 w-4 ${
                      enabled ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      enabled ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {labels[key]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Analysis Preview (if available) */}
      {analysis && (
        <div className="space-y-4">
          {/* <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            AI Analysis by Claude (Sonnet 4)
          </h4> */}

          {/* Main Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StaticCard className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-blue-400" />
                <h5 className="font-medium text-white">Combined Audience</h5>
              </div>
              <p className="text-sm text-gray-400">
                {renderValue(analysis.audience?.description) ||
                  "Analyzing combined audience demographics and interests..."}
              </p>
              {analysis.audience?.demographics && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Key Demographics:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(analysis.audience.demographics)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {renderValue(value)}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </StaticCard>

            <StaticCard className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <h5 className="font-medium text-white">Growth Potential</h5>
              </div>
              <p className="text-sm text-gray-400">
                {renderValue(analysis.growthPotential) ||
                  "Calculating growth potential based on source channels..."}
              </p>
              {analysis.growthTactics && analysis.growthTactics.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Key Tactics:</p>
                  <ul className="text-xs text-gray-400 mt-1">
                    {analysis.growthTactics.slice(0, 2).map((tactic, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-400">•</span>
                        <span className="line-clamp-1">
                          {renderValue(tactic)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </StaticCard>

            <StaticCard className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-purple-400" />
                <h5 className="font-medium text-white">Content Strategy</h5>
              </div>
              <p className="text-sm text-gray-400 line-clamp-3">
                {renderValue(analysis.contentStrategy) ||
                  "Generating hybrid content strategy recommendations..."}
              </p>
              {analysis.contentIdeas && analysis.contentIdeas.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">First Video Ideas:</p>
                  <p className="text-xs text-purple-400 mt-1">
                    {analysis.contentIdeas.length} unique ideas generated
                  </p>
                </div>
              )}
            </StaticCard>

            <StaticCard className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mic className="h-5 w-5 text-pink-400" />
                <h5 className="font-medium text-white">Voice Profile</h5>
              </div>
              {typeof analysis.voiceProfile === "object" &&
              analysis.voiceProfile ? (
                <div className="space-y-2">
                  {analysis.voiceProfile.description && (
                    <div>
                      <p className="text-sm text-gray-400">
                        {renderValue(analysis.voiceProfile.description)}
                      </p>
                    </div>
                  )}
                  {analysis.voiceProfile.tone && (
                    <div>
                      <p className="text-xs text-gray-500">Tone:</p>
                      <p className="text-sm text-gray-400">
                        {Array.isArray(analysis.voiceProfile.tone)
                          ? analysis.voiceProfile.tone
                              .map((t) => renderValue(t))
                              .join(", ")
                          : renderValue(analysis.voiceProfile.tone)}
                      </p>
                    </div>
                  )}
                  {analysis.voiceProfile.style && (
                    <div>
                      <p className="text-xs text-gray-500">Style:</p>
                      <p className="text-sm text-gray-400">
                        {Array.isArray(analysis.voiceProfile.style)
                          ? analysis.voiceProfile.style
                              .map((s) => renderValue(s))
                              .join(", ")
                          : renderValue(analysis.voiceProfile.style)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  {renderValue(analysis.voiceProfile) ||
                    "Creating unique voice profile from selected channels..."}
                </p>
              )}
            </StaticCard>
          </div>

          {/* Synergy & Positioning */}
          {(analysis.synergy || analysis.positioning) && (
            <div className="glass p-4 rounded-lg border border-purple-400/30">
              {analysis.synergy && (
                <div className="mb-3">
                  <h5 className="font-medium text-white flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                    Channel Synergy
                  </h5>
                  <p className="text-sm text-gray-400 line-clamp-3">
                    {renderValue(analysis.synergy)}
                  </p>
                </div>
              )}
              {analysis.positioning && (
                <div>
                  <h5 className="font-medium text-white flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-400" />
                    Unique Positioning
                  </h5>
                  <p className="text-sm text-gray-400 line-clamp-3">
                    {renderValue(analysis.positioning)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Insights & Recommendations */}
          {analysis.insights && analysis.insights.length > 0 && (
            <div className="glass p-4 rounded-lg">
              <h5 className="font-medium text-white flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                Key Insights
              </h5>
              <ul className="space-y-1">
                {analysis.insights.slice(0, 3).map((insight, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-400"
                  >
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{renderValue(insight)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Plan if available */}
          {analysis.actionPlan && analysis.actionPlan.length > 0 && (
            <div className="glass p-4 rounded-lg border border-green-400/30">
              <h5 className="font-medium text-white flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-400" />
                30-Day Action Plan
              </h5>
              <ul className="space-y-1">
                {analysis.actionPlan.slice(0, 4).map((action, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-400"
                  >
                    <span className="text-green-400">{i + 1}.</span>
                    <span>{renderValue(action)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Final Confirmation */}
      <div className="p-4 glass rounded-lg border border-green-400/30 bg-green-400/5">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="font-medium text-white">Ready to Create</p>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Your remixed channel is configured and ready to be created. Click
          "Create Remixed Channel" to proceed.
        </p>
      </div>
    </div>
  );
}
