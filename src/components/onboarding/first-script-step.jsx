'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Create Your First Script</h2>
        <p className="text-gray-400">
          Let's generate your first AI-powered YouTube script
        </p>
      </div>

      {!generatedScript ? (
        <>
          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-white">
              Choose a Template <span className="text-red-400">*</span>
            </Label>
            <div className="grid md:grid-cols-2 gap-3">
              {templates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`
                      glass rounded-lg p-4 text-left transition-all
                      ${selectedTemplate === template.id ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{template.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                        <p className="text-xs text-purple-400 mt-2">
                          Example: {template.example}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-white">
              What's Your Topic? <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="topic"
                value={scriptTopic}
                onChange={(e) => setScriptTopic(e.target.value)}
                placeholder="e.g., Best cameras for YouTube beginners"
                className="glass-input pl-10"
                disabled={generating}
              />
            </div>
            <p className="text-xs text-gray-500">
              Be specific - the more detail you provide, the better the script
            </p>
          </div>

          {/* AI Features Preview */}
          <div className="glass rounded-lg p-4">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Your Script Will Include
            </h3>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ChevronRight className="h-4 w-4 text-purple-400" />
                Attention-grabbing hook
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ChevronRight className="h-4 w-4 text-purple-400" />
                SEO-optimized title
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ChevronRight className="h-4 w-4 text-purple-400" />
                Engaging storytelling
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ChevronRight className="h-4 w-4 text-purple-400" />
                Call-to-action
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateScript}
            disabled={!scriptTopic || !selectedTemplate || generating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Your Script...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My First Script
              </>
            )}
          </Button>

          {/* Skip Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleComplete}
              className="text-gray-400 hover:text-white"
            >
              I'll create a script later
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Generated Script Preview */}
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{generatedScript.title}</h3>
              <Badge className="bg-green-500/20 text-green-400">
                <Play className="h-3 w-3 mr-1" />
                {generatedScript.estimatedLength}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">Hook</h4>
                <p className="text-gray-300 text-sm italic">"{generatedScript.hook}"</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">Introduction</h4>
                <p className="text-gray-300 text-sm">{generatedScript.introduction}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">Main Points</h4>
                <ul className="space-y-1">
                  {generatedScript.mainPoints.map((point, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">Conclusion</h4>
                <p className="text-gray-300 text-sm">{generatedScript.conclusion}</p>
              </div>
            </div>
          </Card>

          {/* Success Message */}
          <div className="glass rounded-lg p-4 bg-green-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Great job! Your first script is ready</p>
                <p className="text-sm text-gray-400">You can edit and customize it anytime</p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            Continue to Final Step
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </>
      )}
    </div>
  );
}