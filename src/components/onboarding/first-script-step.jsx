'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  FileText,
  Sparkles,
  TrendingUp,
  Zap,
  Lightbulb,
  Video,
  Target,
  Loader2,
  ChevronRight,
  Play,
  Award
} from 'lucide-react';

export function FirstScriptStep({ userData, onComplete }) {
  const [scriptTopic, setScriptTopic] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState(null);

  const templates = [
    {
      id: 'howto',
      title: 'How-To Tutorial',
      description: 'Step-by-step educational content',
      icon: Lightbulb,
      color: 'from-blue-500 to-cyan-500',
      example: 'How to grow your YouTube channel'
    },
    {
      id: 'toplist',
      title: 'Top 10 List',
      description: 'Engaging countdown format',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      example: 'Top 10 productivity apps'
    },
    {
      id: 'review',
      title: 'Product Review',
      description: 'In-depth analysis and opinion',
      icon: Award,
      color: 'from-green-500 to-emerald-500',
      example: 'iPhone 15 Pro Review'
    },
    {
      id: 'story',
      title: 'Story Time',
      description: 'Personal narrative content',
      icon: Video,
      color: 'from-orange-500 to-red-500',
      example: 'My journey to 1M subscribers'
    }
  ];

  const handleGenerateScript = async () => {
    if (!scriptTopic || !selectedTemplate) {
      toast.error('Please select a template and enter a topic');
      return;
    }

    setGenerating(true);
    
    // Simulate script generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockScript = {
      title: `${scriptTopic} - Generated Script`,
      hook: "Did you know that 90% of viewers decide whether to keep watching in the first 15 seconds? Today, I'm going to show you...",
      introduction: "Welcome back to the channel! In this video, we're diving deep into...",
      mainPoints: [
        "First, let's talk about the importance of...",
        "The second thing you need to know is...",
        "Finally, and this is crucial..."
      ],
      conclusion: "If you found this helpful, make sure to like and subscribe for more content like this!",
      estimatedLength: "8-10 minutes"
    };
    
    setGeneratedScript(mockScript);
    setGenerating(false);
    toast.success('Your first script is ready!');
  };

  const handleComplete = async () => {
    if (generatedScript) {
      await onComplete({
        firstScript: generatedScript,
        template: selectedTemplate,
        topic: scriptTopic
      });
    } else {
      await onComplete({ skipped: true });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white">Create Your First Script</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Experience the power of AI script generation. This is just a preview - you'll be able to generate full scripts in your dashboard.
        </p>
      </div>

      {!generatedScript ? (
        <>
          {/* Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white text-lg font-semibold">
                Choose a Script Style <span className="text-red-400">*</span>
              </Label>
              {selectedTemplate && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Zap className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">
              Select the format that best matches your content style
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`
                      glass rounded-xl p-5 text-left transition-all transform hover:scale-105
                      ${isSelected ? 'ring-2 ring-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20' : 'hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{template.title}</h4>
                        <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                        <div className="glass rounded px-2 py-1 inline-block">
                          <p className="text-xs text-purple-300">
                            {template.example}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Input */}
          <div className="space-y-3">
            <Label htmlFor="topic" className="text-white text-lg font-semibold">
              What's Your Video Topic? <span className="text-red-400">*</span>
            </Label>
            <p className="text-sm text-gray-400">
              Be specific to get better results. Include details about your audience and what value you'll provide.
            </p>
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="topic"
                value={scriptTopic}
                onChange={(e) => setScriptTopic(e.target.value)}
                placeholder="e.g., Best budget-friendly cameras for YouTube beginners in 2024"
                className="glass-input pl-12 py-6 text-base"
                disabled={generating}
              />
            </div>
            {scriptTopic && (
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Lightbulb className="h-3 w-3 mr-1" />
                Great topic! This will work well
              </Badge>
            )}
          </div>

          {/* AI Features Preview */}
          <div className="glass rounded-xl p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Your AI-Generated Script Will Include
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Hook</p>
                  <p className="text-xs text-gray-400">Attention-grabbing opening</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">SEO Title</p>
                  <p className="text-xs text-gray-400">Optimized for search</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Story Flow</p>
                  <p className="text-xs text-gray-400">Engaging narrative arc</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">CTA</p>
                  <p className="text-xs text-gray-400">Strong call-to-action</p>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="space-y-3">
            <Button
              onClick={handleGenerateScript}
              disabled={!scriptTopic || !selectedTemplate || generating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 py-6 text-lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Your Script...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Sample Script
                </>
              )}
            </Button>

            {/* Info message */}
            {generating && (
              <div className="glass rounded-lg p-3">
                <p className="text-sm text-gray-400 text-center">
                  Our AI is crafting your personalized script...
                </p>
              </div>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleComplete}
              className="text-gray-400 hover:text-white"
            >
              Skip - I'll create my first script later
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Success Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">Your Script is Ready!</h3>
            <p className="text-gray-400">
              This is a sample preview. In your dashboard, you'll get fully detailed scripts with research and optimization.
            </p>
          </div>

          {/* Generated Script Preview */}
          <div className="glass-card p-6 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{generatedScript.title}</h3>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Play className="h-4 w-4 mr-1" />
                {generatedScript.estimatedLength}
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-lg p-4 bg-purple-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-purple-300">Hook</h4>
                </div>
                <p className="text-gray-300 text-sm italic leading-relaxed">
                  "{generatedScript.hook}"
                </p>
              </div>

              <div className="glass rounded-lg p-4 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Video className="h-4 w-4 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-blue-300">Introduction</h4>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {generatedScript.introduction}
                </p>
              </div>

              <div className="glass rounded-lg p-4 bg-pink-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-pink-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-pink-300">Main Points</h4>
                </div>
                <ul className="space-y-2">
                  {generatedScript.mainPoints.map((point, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400 text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass rounded-lg p-4 bg-green-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Target className="h-4 w-4 text-green-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-green-300">Conclusion & CTA</h4>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {generatedScript.conclusion}
                </p>
              </div>
            </div>
          </div>

          {/* Info Callout */}
          <div className="glass rounded-xl p-5 border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold mb-1">This is just a preview!</p>
                <p className="text-sm text-gray-300">
                  In the full platform, you'll get detailed scripts with SEO research,
                  competitor analysis, trending topics, and much more. Plus, scripts will
                  be personalized to your unique voice and style.
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 py-6 text-lg"
          >
            Continue to Final Step
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </>
      )}
    </div>
  );
}