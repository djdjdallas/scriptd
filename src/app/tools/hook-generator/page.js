'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Copy,
  RefreshCw,
  Loader2,
  Timer,
  TrendingUp,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SCRIPT_TYPES } from '@/lib/constants';

const HOOK_STYLES = [
  {
    id: 'question',
    label: 'Question Hook',
    description: 'Start with an intriguing question',
    example: 'Have you ever wondered why...'
  },
  {
    id: 'statistic',
    label: 'Statistic Hook',
    description: 'Open with a surprising fact or number',
    example: '90% of people don\'t know that...'
  },
  {
    id: 'story',
    label: 'Story Hook',
    description: 'Begin with a personal anecdote',
    example: 'Last week, something incredible happened...'
  },
  {
    id: 'challenge',
    label: 'Challenge Hook',
    description: 'Present a problem or challenge',
    example: 'Most people struggle with...'
  },
  {
    id: 'promise',
    label: 'Promise Hook',
    description: 'Make a bold promise or claim',
    example: 'In the next 5 minutes, you\'ll learn...'
  },
  {
    id: 'controversy',
    label: 'Controversial Hook',
    description: 'Start with a controversial statement',
    example: 'Everyone is wrong about...'
  }
];

export default function HookGeneratorPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [videoType, setVideoType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateHooks = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter your video topic",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/tools/hook-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          videoType,
          targetAudience: targetAudience.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate hooks');
      }

      const data = await response.json();
      setHooks(data.hooks);

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate hooks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyHook = async (hook) => {
    try {
      await navigator.clipboard.writeText(hook.text);
      toast({
        title: "Copied!",
        description: "Hook copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display text-white">YouTube Hook Generator</h1>
          <p className="text-xl text-gray-400">
            Create compelling hooks that grab attention in the first 15 seconds
          </p>
          <Badge className="gap-1 bg-violet-500/10 text-violet-400 border-violet-500/30">
            <Timer className="h-3 w-3" />
            15-second hooks
          </Badge>
        </div>

        {/* Generator Form */}
        <Card className="bg-white/[0.04] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Generate Hooks</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your video details to create attention-grabbing opening lines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={generateHooks} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-gray-300">Video Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., How to start a successful podcast"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                  className="bg-white/[0.04] border-white/5 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">Video Type</Label>
                <Select value={videoType} onValueChange={setVideoType}>
                  <SelectTrigger id="type" className="bg-white/[0.04] border-white/5 text-white">
                    <SelectValue placeholder="Select video type (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/[0.04] border-white/5">
                    <SelectItem value="any">Any type</SelectItem>
                    {Object.entries(SCRIPT_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={value}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="text-gray-300">Target Audience (Optional)</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Aspiring podcasters, beginners"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  disabled={loading}
                  className="bg-white/[0.04] border-white/5 text-white placeholder:text-gray-500"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-violet-700 to-cyan-700 hover:from-violet-700 hover:to-cyan-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Hooks...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Hooks
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Hook Styles Reference */}
        <Card className="bg-white/[0.04] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Hook Styles</CardTitle>
            <CardDescription className="text-gray-400">
              Different types of hooks work better for different content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {HOOK_STYLES.map((style) => (
                <div key={style.id} className="space-y-1">
                  <h4 className="font-medium text-white">{style.label}</h4>
                  <p className="text-sm text-gray-400">{style.description}</p>
                  <p className="text-sm italic text-gray-500">"{style.example}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hooks.length > 0 && (
          <Card className="bg-white/[0.04] border-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Generated Hooks</CardTitle>
                  <CardDescription className="text-gray-400">
                    Each hook is designed to capture attention within 15 seconds
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateHooks(new Event('submit'))}
                  disabled={loading}
                  className="border-white/[0.06] hover:bg-white/[0.06] text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hooks.map((hook, index) => (
                  <div
                    key={index}
                    className="group p-4 rounded-lg border border-white/5 hover:border-violet-500 hover:bg-white/[0.06] cursor-pointer transition-all"
                    onClick={() => copyHook(hook)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <Badge variant="outline" className="text-xs border-white/[0.06] text-gray-300">
                          {hook.style}
                        </Badge>
                        <p className="font-medium text-white">{hook.text}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            ~{hook.readTime}s
                          </span>
                          <span>{hook.wordCount} words</span>
                        </div>
                        {hook.tip && (
                          <p className="text-sm text-gray-400 italic">
                            💡 {hook.tip}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Best Practices */}
        <Card className="bg-white/[0.04] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Hook Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Front-load the value</p>
                <p className="text-sm text-gray-400">
                  Tell viewers exactly what they'll gain from watching within the first 5 seconds
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Users className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Address your audience directly</p>
                <p className="text-sm text-gray-400">
                  Use "you" to create a personal connection and make viewers feel seen
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Create urgency without clickbait</p>
                <p className="text-sm text-gray-400">
                  Make it compelling but always deliver on what you promise
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
