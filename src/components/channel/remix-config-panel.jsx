'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Sparkles,
  Users,
  Video,
  Clock,
  Mic,
  Target,
  BarChart3
} from 'lucide-react';

export function RemixConfigPanel({ selectedChannels, config, onConfigChange }) {
  const updateConfig = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const updateElement = (element, enabled) => {
    onConfigChange({
      ...config,
      elements: {
        ...config.elements,
        [element]: enabled
      }
    });
  };

  const updateWeight = (channelId, weight) => {
    const newWeights = { ...config.weights };
    newWeights[channelId] = weight;
    
    // Normalize weights to sum to 1
    const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    if (total > 0) {
      Object.keys(newWeights).forEach(id => {
        newWeights[id] = newWeights[id] / total;
      });
    }
    
    onConfigChange({
      ...config,
      weights: newWeights
    });
  };

  // Initialize weights if not set - use useEffect to avoid setState during render
  React.useEffect(() => {
    if (Object.keys(config.weights).length === 0 && selectedChannels.length > 0) {
      const initialWeights = {};
      const weight = 1 / selectedChannels.length;
      selectedChannels.forEach(channel => {
        const channelId = channel.id || channel.channelId;
        initialWeights[channelId] = weight;
      });
      updateConfig('weights', initialWeights);
    }
  }, []);

  const elements = [
    {
      id: 'content_strategy',
      label: 'Content Strategy',
      description: 'Topics, themes, and content types',
      icon: Target
    },
    {
      id: 'voice_style',
      label: 'Voice & Style',
      description: 'Tone, personality, and presentation',
      icon: Mic
    },
    {
      id: 'audience_targeting',
      label: 'Audience Targeting',
      description: 'Demographics and interests',
      icon: Users
    },
    {
      id: 'publishing_schedule',
      label: 'Publishing Schedule',
      description: 'Frequency and timing patterns',
      icon: Clock
    },
    {
      id: 'video_formats',
      label: 'Video Formats',
      description: 'Length, structure, and style',
      icon: Video
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Configure Your Remix</h3>
        <p className="text-gray-400">
          Customize how you want to combine the selected channels
        </p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-gray-300">
            Remix Channel Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            value={config.name}
            onChange={(e) => updateConfig('name', e.target.value)}
            placeholder="My Awesome Remix Channel"
            className="mt-2 glass-input text-white"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-gray-300">
            Channel Description
          </Label>
          <Textarea
            id="description"
            value={config.description}
            onChange={(e) => updateConfig('description', e.target.value)}
            placeholder="Describe your unique approach and what makes your remix special..."
            className="mt-2 glass-input text-white min-h-[100px] bg-black/20 border-gray-700 placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Channel Weights */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-white flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Channel Influence
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Adjust how much influence each channel has on your remix
          </p>
        </div>

        <div className="space-y-4">
          {selectedChannels.map((channel, index) => {
            const channelId = channel.id || channel.channelId;
            const weight = config.weights[channelId] || (1 / selectedChannels.length);
            
            return (
              <div key={channelId || `channel-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">{channel.title}</Label>
                  <Badge variant="outline" className="text-white border-purple-400/50">
                    {Math.round(weight * 100)}%
                  </Badge>
                </div>
                <Slider
                  value={[weight * 100]}
                  onValueChange={(value) => updateWeight(channelId, value[0] / 100)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Elements to Remix */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-white flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Elements to Remix
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Choose which aspects of the channels you want to combine
          </p>
        </div>

        <div className="space-y-3">
          {elements.map((element) => {
            const Icon = element.icon;
            
            return (
              <div
                key={element.id}
                className="flex items-center justify-between p-4 glass rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">{element.label}</p>
                    <p className="text-sm text-gray-400">{element.description}</p>
                  </div>
                </div>
                <Switch
                  checked={config.elements[element.id]}
                  onCheckedChange={(checked) => updateElement(element.id, checked)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Stats */}
      <div className="p-4 glass rounded-lg border border-purple-400/30">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-5 w-5 text-purple-400" />
          <p className="font-medium text-white">Configuration Summary</p>
        </div>
        <div className="space-y-1 text-sm text-gray-400">
          <p>• Remixing {selectedChannels.length} channels</p>
          <p>• {Object.values(config.elements).filter(Boolean).length} elements selected</p>
          <p>• Custom weights applied</p>
        </div>
      </div>
    </div>
  );
}