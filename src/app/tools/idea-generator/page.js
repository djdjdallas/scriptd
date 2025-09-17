'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Copy, 
  RefreshCw,
  Loader2,
  TrendingUp,
  Star,
  Target,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CONTENT_CATEGORIES = [
  { value: 'tech', label: 'Technology' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'business', label: 'Business' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'food', label: 'Food & Cooking' },
  { value: 'fitness', label: 'Health & Fitness' },
  { value: 'diy', label: 'DIY & Crafts' },
  { value: 'travel', label: 'Travel' },
  { value: 'fashion', label: 'Fashion & Beauty' },
  { value: 'other', label: 'Other' }
];

export default function IdeaGeneratorPage() {
  const { toast } = useToast();
  const [niche, setNiche] = useState('');
  const [category, setCategory] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateIdeas = async (e) => {
    e.preventDefault();
    
    if (!niche.trim()) {
      toast({
        title: "Niche Required",
        description: "Please enter your channel niche or topic",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/tools/idea-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: niche.trim(),
          category,
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
        description: "Failed to generate ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyIdea = async (idea) => {
    try {
      await navigator.clipboard.writeText(`${idea.title}\n\n${idea.description}`);
      toast({
        title: "Copied!",
        description: "Idea copied to clipboard"
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
        <h1 className="text-4xl font-bold">Video Idea Generator</h1>
        <p className="text-xl text-muted-foreground">
          Never run out of content ideas with AI-powered suggestions
        </p>
      </div>

      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Video Ideas</CardTitle>
          <CardDescription>
            Enter your niche and preferences to get tailored video ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateIdeas} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="niche">Channel Niche/Topic *</Label>
              <Input
                id="niche"
                placeholder="e.g., Personal finance, Web development tutorials"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Content Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any category</SelectItem>
                  {CONTENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience (Optional)</Label>
              <Input
                id="audience"
                placeholder="e.g., Beginners, Young professionals, Students"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Specify your target audience for more relevant ideas
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Video Ideas
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
                <CardTitle>Generated Ideas</CardTitle>
                <CardDescription>
                  Click any idea to copy it to your clipboard
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold text-lg">{idea.title}</h3>
                        {idea.trending && (
                          <Badge variant="secondary" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{idea.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {idea.tags?.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {idea.difficulty && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Difficulty: {idea.difficulty}
                          </span>
                          {idea.potential && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Potential: {idea.potential}
                            </span>
                          )}
                        </div>
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

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Content Ideation Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Mix evergreen and trending content</p>
              <p className="text-sm text-muted-foreground">
                Balance timeless topics with current trends for consistent growth
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Research your competition</p>
              <p className="text-sm text-muted-foreground">
                Look at what's working for similar channels and add your unique spin
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Solve real problems</p>
              <p className="text-sm text-muted-foreground">
                The best content ideas address actual pain points your audience faces
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}