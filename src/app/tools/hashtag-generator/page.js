'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Copy, 
  RefreshCw,
  Loader2,
  TrendingUp,
  BarChart3,
  Target,
  Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function HashtagGeneratorPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateHashtags = async (e) => {
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
      const response = await fetch('/api/tools/hashtag-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          description: description.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate hashtags');
      }

      const data = await response.json();
      setHashtags(data.hashtags);

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate hashtags. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyHashtags = async (tags = null) => {
    try {
      const textToCopy = tags 
        ? tags.map(tag => `#${tag}`).join(' ')
        : hashtags.map(h => `#${h.tag}`).join(' ');
      
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied!",
        description: "Hashtags copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const copyHashtag = async (hashtag) => {
    try {
      await navigator.clipboard.writeText(`#${hashtag}`);
      toast({
        title: "Copied!",
        description: "Hashtag copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getCompetitionColor = (level) => {
    switch(level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCompetitionBadge = (level) => {
    switch(level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Hashtag Generator</h1>
        <p className="text-xl text-muted-foreground">
          Find the perfect hashtags to increase your video discoverability
        </p>
      </div>

      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Hashtags</CardTitle>
          <CardDescription>
            Enter your video details to get relevant, high-performing hashtags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateHashtags} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Video Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Home workout routines for beginners"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Video Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your video content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Adding a description helps generate more accurate hashtags
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Hashtags...
                </>
              ) : (
                <>
                  <Hash className="h-4 w-4 mr-2" />
                  Generate Hashtags
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {hashtags.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Hashtags</CardTitle>
                  <CardDescription>
                    Click any hashtag to copy individually, or copy all at once
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyHashtags()}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateHashtags(new Event('submit'))}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {hashtags.map((hashtag, index) => (
                  <div
                    key={index}
                    className="group p-3 rounded-lg border hover:border-primary hover:bg-muted/50 cursor-pointer transition-all"
                    onClick={() => copyHashtag(hashtag.tag)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <p className="font-medium text-lg">#{hashtag.tag}</p>
                        <div className="flex items-center gap-3 text-sm">
                          {hashtag.relevance && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {hashtag.relevance}% relevant
                            </span>
                          )}
                          {hashtag.competition && (
                            <Badge 
                              variant="outline" 
                              className={getCompetitionBadge(hashtag.competition)}
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              {hashtag.competition}
                            </Badge>
                          )}
                        </div>
                        {hashtag.trending && (
                          <Badge variant="secondary" className="gap-1 w-fit">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </Badge>
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

          {/* Suggested Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Suggested Hashtag Sets</CardTitle>
              <CardDescription>
                Optimized combinations for maximum reach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">High Volume Set</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyHashtags(hashtags.slice(0, 5).map(h => h.tag))}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Popular hashtags for maximum visibility
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.slice(0, 5).map((h, i) => (
                      <Badge key={i} variant="secondary">#{h.tag}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Balanced Set</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyHashtags(hashtags.slice(2, 7).map(h => h.tag))}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Mix of popular and niche hashtags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.slice(2, 7).map((h, i) => (
                      <Badge key={i} variant="secondary">#{h.tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Hashtag Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Use 3-5 hashtags per video</p>
              <p className="text-sm text-muted-foreground">
                YouTube recommends using a few highly relevant hashtags rather than many
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Mix broad and specific hashtags</p>
              <p className="text-sm text-muted-foreground">
                Combine popular hashtags with niche ones for better targeting
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Include trending hashtags when relevant</p>
              <p className="text-sm text-muted-foreground">
                Jump on trends but only if they genuinely relate to your content
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}