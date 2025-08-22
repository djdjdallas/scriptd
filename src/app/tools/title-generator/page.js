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
  Sparkles, 
  Copy, 
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  Target,
  Users,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

const TITLE_STYLES = [
  { id: 'how-to', label: 'How-To', icon: Target, example: 'How to...' },
  { id: 'listicle', label: 'Listicle', icon: TrendingUp, example: 'Top 10...' },
  { id: 'question', label: 'Question', icon: Users, example: 'Why do...' },
  { id: 'shocking', label: 'Shocking', icon: Zap, example: 'You won\'t believe...' }
];

export default function TitleGeneratorPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState('how-to');
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateTitles = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your video",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setHasGenerated(true);

    try {
      const response = await fetch('/api/tools/title-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords.trim(),
          style
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate titles');
      }

      const data = await response.json();
      setTitles(data.titles);

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate titles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyTitle = async (title) => {
    try {
      await navigator.clipboard.writeText(title);
      toast({
        title: "Copied!",
        description: "Title copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const regenerate = () => {
    if (topic.trim()) {
      generateTitles(new Event('submit'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">YouTube Title Generator</h1>
        <p className="text-xl text-muted-foreground">
          Create compelling titles that get clicks and rank in search
        </p>
      </div>

      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Titles</CardTitle>
          <CardDescription>
            Enter your video topic and we'll create optimized titles for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateTitles} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Video Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Making sourdough bread at home"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords (Optional)</Label>
              <Input
                id="keywords"
                placeholder="e.g., sourdough, bread recipe, homemade"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Add keywords you want to rank for in YouTube search
              </p>
            </div>

            <div className="space-y-3">
              <Label>Title Style</Label>
              <RadioGroup value={style} onValueChange={setStyle}>
                <div className="grid grid-cols-2 gap-3">
                  {TITLE_STYLES.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.id}>
                        <RadioGroupItem
                          value={s.id}
                          id={s.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={s.id}
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            <div>
                              <p className="font-medium">{s.label}</p>
                              <p className="text-xs text-muted-foreground">{s.example}</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Titles
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {hasGenerated && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Titles</CardTitle>
                <CardDescription>
                  Click to copy any title to your clipboard
                </CardDescription>
              </div>
              {titles.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerate}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : titles.length > 0 ? (
              <div className="space-y-3">
                {titles.map((title, index) => (
                  <div
                    key={index}
                    className="group p-4 rounded-lg border hover:border-primary hover:bg-muted/50 cursor-pointer transition-all"
                    onClick={() => copyTitle(title.text)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{title.text}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{title.text.length} characters</span>
                          {title.score && (
                            <Badge variant="secondary">
                              Score: {title.score}/10
                            </Badge>
                          )}
                        </div>
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No titles generated yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Title Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold">1</span>
            </div>
            <div>
              <p className="font-medium">Keep it under 60 characters</p>
              <p className="text-sm text-muted-foreground">
                YouTube truncates titles in search results and suggested videos
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold">2</span>
            </div>
            <div>
              <p className="font-medium">Front-load important keywords</p>
              <p className="text-sm text-muted-foreground">
                Put your main keyword at the beginning for better SEO
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold">3</span>
            </div>
            <div>
              <p className="font-medium">Create curiosity without clickbait</p>
              <p className="text-sm text-muted-foreground">
                Make viewers want to click while delivering on your promise
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            Want to Generate Complete Scripts?
          </h3>
          <p className="text-muted-foreground mb-4">
            Sign up for free and get access to our full AI script generator
          </p>
          <Button asChild>
            <Link href="/sign-up">
              Get Started Free
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}