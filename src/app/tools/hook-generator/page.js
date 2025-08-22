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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">YouTube Hook Generator</h1>
        <p className="text-xl text-muted-foreground">
          Create compelling hooks that grab attention in the first 15 seconds
        </p>
        <Badge variant="secondary" className="gap-1">
          <Timer className="h-3 w-3" />
          15-second hooks
        </Badge>
      </div>

      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Hooks</CardTitle>
          <CardDescription>
            Enter your video details to create attention-grabbing opening lines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateHooks} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Video Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., How to start a successful podcast"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Video Type</Label>
              <Select value={videoType} onValueChange={setVideoType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select video type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any type</SelectItem>
                  {Object.entries(SCRIPT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience (Optional)</Label>
              <Input
                id="audience"
                placeholder="e.g., Aspiring podcasters, beginners"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
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
      <Card>
        <CardHeader>
          <CardTitle>Hook Styles</CardTitle>
          <CardDescription>
            Different types of hooks work better for different content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {HOOK_STYLES.map((style) => (
              <div key={style.id} className="space-y-1">
                <h4 className="font-medium">{style.label}</h4>
                <p className="text-sm text-muted-foreground">{style.description}</p>
                <p className="text-sm italic">"{style.example}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hooks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Hooks</CardTitle>
                <CardDescription>
                  Each hook is designed to capture attention within 15 seconds
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateHooks(new Event('submit'))}
                disabled={loading}
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
                  className="group p-4 rounded-lg border hover:border-primary hover:bg-muted/50 cursor-pointer transition-all"
                  onClick={() => copyHook(hook)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {hook.style}
                      </Badge>
                      <p className="font-medium">{hook.text}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          ~{hook.readTime}s
                        </span>
                        <span>{hook.wordCount} words</span>
                      </div>
                      {hook.tip && (
                        <p className="text-sm text-muted-foreground italic">
                          💡 {hook.tip}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
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
      <Card>
        <CardHeader>
          <CardTitle>Hook Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Front-load the value</p>
              <p className="text-sm text-muted-foreground">
                Tell viewers exactly what they'll gain from watching within the first 5 seconds
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Address your audience directly</p>
              <p className="text-sm text-muted-foreground">
                Use "you" to create a personal connection and make viewers feel seen
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Create urgency without clickbait</p>
              <p className="text-sm text-muted-foreground">
                Make it compelling but always deliver on what you promise
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}