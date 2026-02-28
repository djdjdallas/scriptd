'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Image,
  Copy,
  RefreshCw,
  Loader2,
  Palette,
  Type,
  Users,
  Zap,
  Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ToolResultsCTA from '@/components/tools/ToolResultsCTA';

const THUMBNAIL_STYLES = [
  { id: 'minimal', label: 'Minimal', description: 'Clean and simple design' },
  { id: 'bold', label: 'Bold & Bright', description: 'High contrast, vibrant colors' },
  { id: 'professional', label: 'Professional', description: 'Polished and trustworthy' },
  { id: 'dramatic', label: 'Dramatic', description: 'High emotion and impact' },
  { id: 'educational', label: 'Educational', description: 'Clear and informative' },
  { id: 'entertainment', label: 'Entertainment', description: 'Fun and eye-catching' }
];

export default function ThumbnailIdeasPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('bold');
  const [targetAudience, setTargetAudience] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateIdeas = async (e) => {
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
      const response = await fetch('/api/tools/thumbnail-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          title: title.trim(),
          style,
          targetAudience: targetAudience.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate ideas');
      }

      const data = await response.json();
      setIdeas(data.ideas);

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate thumbnail ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyIdea = async (idea) => {
    try {
      const text = `${idea.concept}\n\nColors: ${idea.colors.join(', ')}\nText: ${idea.text}\nElements: ${idea.elements.join(', ')}`;
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Thumbnail idea copied to clipboard"
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
          <h1 className="text-4xl font-bold font-display text-white">Thumbnail Idea Generator</h1>
          <p className="text-xl text-gray-400">
            Get creative thumbnail concepts that boost click-through rates
          </p>
        </div>

        {/* Generator Form */}
        <Card className="bg-white/[0.04] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Generate Thumbnail Ideas</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your video details to get custom thumbnail concepts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={generateIdeas} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-gray-300">Video Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., iPhone 15 Pro review"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                  className="vb-input text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Video Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., iPhone 15 Pro: Worth the Upgrade?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  className="vb-input text-white placeholder:text-gray-500"
                />
                <p className="text-sm text-gray-400">
                  Helps create text overlay suggestions
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300">Thumbnail Style</Label>
                <RadioGroup value={style} onValueChange={setStyle}>
                  <div className="grid grid-cols-2 gap-3">
                    {THUMBNAIL_STYLES.map((s) => (
                      <div key={s.id}>
                        <RadioGroupItem
                          value={s.id}
                          id={s.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={s.id}
                          className="flex flex-col gap-1 rounded-md border-2 border-white/5 bg-white/[0.04] p-3 hover:bg-white/[0.06] peer-data-[state=checked]:border-violet-500 cursor-pointer"
                        >
                          <p className="font-medium text-white">{s.label}</p>
                          <p className="text-xs text-gray-400">{s.description}</p>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="text-gray-300">Target Audience (Optional)</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Tech enthusiasts, Apple fans"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  disabled={loading}
                  className="vb-input text-white placeholder:text-gray-500"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-violet-700 to-cyan-700 hover:from-violet-700 hover:to-cyan-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Ideas...
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Generate Thumbnail Ideas
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {ideas.length > 0 && (
          <Card className="bg-white/[0.04] border-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Thumbnail Concepts</CardTitle>
                  <CardDescription className="text-gray-400">
                    Click any idea to copy the full concept details
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateIdeas(new Event('submit'))}
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
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="group p-4 rounded-lg border border-white/5 hover:border-violet-500 hover:bg-white/[0.06] cursor-pointer transition-all"
                    onClick={() => copyIdea(idea)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg flex-1 text-white">{idea.concept}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {/* Color Palette */}
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-white">Colors:</span>
                          <div className="flex gap-2">
                            {idea.colors?.map((color, i) => (
                              <Badge key={i} variant="outline" className="border-white/[0.06] text-gray-300">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Text Overlay */}
                        {idea.text && (
                          <div className="flex items-start gap-2">
                            <Type className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-white">Text: </span>
                              <span className="text-sm text-gray-400">"{idea.text}"</span>
                            </div>
                          </div>
                        )}

                        {/* Visual Elements */}
                        <div className="flex items-start gap-2">
                          <Eye className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-white">Elements: </span>
                            <span className="text-sm text-gray-400">
                              {idea.elements?.join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* Psychology */}
                        {idea.psychology && (
                          <div className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-white">Psychology: </span>
                              <span className="text-sm text-gray-400">{idea.psychology}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {idea.ctr_tip && (
                        <div className="mt-3 p-3 bg-violet-500/10 rounded-md">
                          <p className="text-sm text-gray-300">
                            <span className="font-medium text-white">CTR Tip:</span> {idea.ctr_tip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Post-generation CTA */}
        {ideas.length > 0 && (
          <ToolResultsCTA sourceTool="thumbnail-ideas" />
        )}

        {/* Design Tips */}
        <Card className="bg-white/[0.04] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Thumbnail Design Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Eye className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Test at small sizes</p>
                <p className="text-sm text-gray-400">
                  Your thumbnail should be clear and readable even at mobile sizes
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Palette className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Use high contrast</p>
                <p className="text-sm text-gray-400">
                  Bold colors and strong contrast help thumbnails stand out in feeds
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Users className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Include faces when possible</p>
                <p className="text-sm text-gray-400">
                  Human faces with clear emotions typically get higher click-through rates
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Type className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Keep text minimal</p>
                <p className="text-sm text-gray-400">
                  Use 3-5 words maximum for text overlays to maintain readability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
