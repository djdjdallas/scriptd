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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Thumbnail Idea Generator</h1>
        <p className="text-xl text-muted-foreground">
          Get creative thumbnail concepts that boost click-through rates
        </p>
      </div>

      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Thumbnail Ideas</CardTitle>
          <CardDescription>
            Enter your video details to get custom thumbnail concepts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateIdeas} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Video Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., iPhone 15 Pro review"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Video Title (Optional)</Label>
              <Input
                id="title"
                placeholder="e.g., iPhone 15 Pro: Worth the Upgrade?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Helps create text overlay suggestions
              </p>
            </div>

            <div className="space-y-3">
              <Label>Thumbnail Style</Label>
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
                        className="flex flex-col gap-1 rounded-md border-2 border-muted bg-transparent p-3 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        <p className="font-medium">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience (Optional)</Label>
              <Input
                id="audience"
                placeholder="e.g., Tech enthusiasts, Apple fans"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Thumbnail Concepts</CardTitle>
                <CardDescription>
                  Click any idea to copy the full concept details
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateIdeas(new Event('submit'))}
                disabled={loading}
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
                  className="group p-4 rounded-lg border hover:border-primary hover:bg-muted/50 cursor-pointer transition-all"
                  onClick={() => copyIdea(idea)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg flex-1">{idea.concept}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* Color Palette */}
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Colors:</span>
                        <div className="flex gap-2">
                          {idea.colors?.map((color, i) => (
                            <Badge key={i} variant="outline">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Text Overlay */}
                      {idea.text && (
                        <div className="flex items-start gap-2">
                          <Type className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">Text: </span>
                            <span className="text-sm text-muted-foreground">"{idea.text}"</span>
                          </div>
                        </div>
                      )}

                      {/* Visual Elements */}
                      <div className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium">Elements: </span>
                          <span className="text-sm text-muted-foreground">
                            {idea.elements?.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Psychology */}
                      {idea.psychology && (
                        <div className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">Psychology: </span>
                            <span className="text-sm text-muted-foreground">{idea.psychology}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {idea.ctr_tip && (
                      <div className="mt-3 p-3 bg-primary/5 rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">CTR Tip:</span> {idea.ctr_tip}
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

      {/* Design Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Thumbnail Design Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Eye className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Test at small sizes</p>
              <p className="text-sm text-muted-foreground">
                Your thumbnail should be clear and readable even at mobile sizes
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Palette className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Use high contrast</p>
              <p className="text-sm text-muted-foreground">
                Bold colors and strong contrast help thumbnails stand out in feeds
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Include faces when possible</p>
              <p className="text-sm text-muted-foreground">
                Human faces with clear emotions typically get higher click-through rates
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Type className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Keep text minimal</p>
              <p className="text-sm text-muted-foreground">
                Use 3-5 words maximum for text overlays to maintain readability
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}