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
  Target
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ToolResultsCTA from '@/components/tools/ToolResultsCTA';

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
    <div className="min-h-screen bg-[#030303] py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display text-white">Video Idea Generator</h1>
          <p className="text-xl text-gray-400">
            Never run out of content ideas with AI-powered suggestions
          </p>
        </div>

        {/* Generator Form */}
        <Card className="bg-white/[0.04] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Generate Video Ideas</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your niche and preferences to get tailored video ideas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={generateIdeas} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-gray-300">Channel Niche/Topic *</Label>
                <Input
                  id="niche"
                  placeholder="e.g., Personal finance, Web development tutorials"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  disabled={loading}
                  className="bg-white/[0.04] border-white/5 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">Content Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="bg-white/[0.04] border-white/5 text-white">
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/[0.04] border-white/5">
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
                <Label htmlFor="audience" className="text-gray-300">Target Audience (Optional)</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Beginners, Young professionals, Students"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  disabled={loading}
                  className="bg-white/[0.04] border-white/5 text-white placeholder:text-gray-500"
                />
                <p className="text-sm text-gray-400">
                  Specify your target audience for more relevant ideas
                </p>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-violet-700 to-cyan-700 hover:from-violet-700 hover:to-cyan-700" disabled={loading}>
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
          <Card className="bg-white/[0.04] border-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Generated Ideas</CardTitle>
                  <CardDescription className="text-gray-400">
                    Click any idea to copy it to your clipboard
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2">
                          <h3 className="font-semibold text-lg text-white">{idea.title}</h3>
                          {idea.trending && (
                            <Badge className="gap-1 bg-violet-500/10 text-violet-400 border-violet-500/30">
                              <TrendingUp className="h-3 w-3" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400">{idea.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {idea.tags?.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="border-white/[0.06] text-gray-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {idea.difficulty && (
                          <div className="flex items-center gap-4 text-sm text-gray-400">
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

        {/* Post-generation CTA */}
        {ideas.length > 0 && (
          <ToolResultsCTA sourceTool="idea-generator" />
        )}

        {/* Tips */}
        <Card className="bg-white/[0.04] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Content Ideation Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Mix evergreen and trending content</p>
                <p className="text-sm text-gray-400">
                  Balance timeless topics with current trends for consistent growth
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Research your competition</p>
                <p className="text-sm text-gray-400">
                  Look at what's working for similar channels and add your unique spin
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Target className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Solve real problems</p>
                <p className="text-sm text-gray-400">
                  The best content ideas address actual pain points your audience faces
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
