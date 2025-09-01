'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Sparkles, TrendingUp, Hash, FileText, BarChart3, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export function SEOOptimizer({ initialData = {} }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [copiedItems, setCopiedItems] = useState({});
  
  // Form states
  const [titleForm, setTitleForm] = useState({
    topic: initialData.topic || '',
    keywords: initialData.keywords?.join(', ') || '',
    channelNiche: initialData.channelNiche || '',
    competitorTitles: '',
  });

  const [descriptionForm, setDescriptionForm] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    keywords: initialData.keywords?.join(', ') || '',
    channelDescription: '',
    timestamps: '',
  });

  const [tagsForm, setTagsForm] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    category: initialData.category || '',
    competitorTags: '',
  });

  const [seoAnalysis, setSeoAnalysis] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    tags: initialData.tags?.join(', ') || '',
    keywords: initialData.keywords?.join(', ') || '',
    thumbnailOptimized: false,
  });

  const handleOptimize = async (action, data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/youtube/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) {
        throw new Error('Optimization failed');
      }

      const result = await response.json();
      setResults(prev => ({ ...prev, [action]: result.data }));
      
      if (result.creditsUsed > 0) {
        toast.success(`Optimization complete! Used ${result.creditsUsed} credits`);
      }
    } catch (error) {
      toast.error(error.message || 'Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, itemId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => ({ ...prev, [itemId]: true }));
      toast.success('Copied to clipboard!');
      
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [itemId]: false }));
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const parseKeywords = (keywordsString) => {
    return keywordsString.split(',').map(k => k.trim()).filter(k => k);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            YouTube SEO Optimizer
          </CardTitle>
          <CardDescription>
            Optimize your video metadata for maximum visibility and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="title" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="title">Title</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="analysis">SEO Score</TabsTrigger>
            </TabsList>

            {/* Title Optimization */}
            <TabsContent value="title" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="topic">Video Topic</Label>
                  <Input
                    id="topic"
                    value={titleForm.topic}
                    onChange={(e) => setTitleForm(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="What is your video about?"
                  />
                </div>
                
                <div>
                  <Label htmlFor="keywords">Primary Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={titleForm.keywords}
                    onChange={(e) => setTitleForm(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="youtube seo, video optimization, grow channel"
                  />
                </div>

                <div>
                  <Label htmlFor="niche">Channel Niche</Label>
                  <Input
                    id="niche"
                    value={titleForm.channelNiche}
                    onChange={(e) => setTitleForm(prev => ({ ...prev, channelNiche: e.target.value }))}
                    placeholder="Tech, Gaming, Education, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="competitors">Competitor Titles (optional, one per line)</Label>
                  <Textarea
                    id="competitors"
                    value={titleForm.competitorTitles}
                    onChange={(e) => setTitleForm(prev => ({ ...prev, competitorTitles: e.target.value }))}
                    placeholder="Enter successful competitor video titles for reference"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => handleOptimize('optimizeTitle', {
                    ...titleForm,
                    keywords: parseKeywords(titleForm.keywords),
                    competitorTitles: titleForm.competitorTitles.split('\n').filter(t => t.trim()),
                  })}
                  disabled={loading || !titleForm.topic || !titleForm.keywords}
                  className="w-full"
                >
                  {loading ? 'Optimizing...' : 'Generate Optimized Titles'}
                </Button>

                {results.optimizeTitle && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Optimized Title Suggestions:</h4>
                    {results.optimizeTitle.map((item, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{item.length} chars</Badge>
                              <Badge variant="outline">Score: {item.score}/10</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(item.title, `title-${index}`)}
                          >
                            {copiedItems[`title-${index}`] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Description Optimization */}
            <TabsContent value="description" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="desc-title">Video Title</Label>
                  <Input
                    id="desc-title"
                    value={descriptionForm.title}
                    onChange={(e) => setDescriptionForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Your video title"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content Summary</Label>
                  <Textarea
                    id="content"
                    value={descriptionForm.content}
                    onChange={(e) => setDescriptionForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Brief summary of what your video covers"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="desc-keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="desc-keywords"
                    value={descriptionForm.keywords}
                    onChange={(e) => setDescriptionForm(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="youtube seo, video optimization"
                  />
                </div>

                <div>
                  <Label htmlFor="timestamps">Timestamps (optional, format: 00:00 Topic)</Label>
                  <Textarea
                    id="timestamps"
                    value={descriptionForm.timestamps}
                    onChange={(e) => setDescriptionForm(prev => ({ ...prev, timestamps: e.target.value }))}
                    placeholder="00:00 Introduction&#10;02:30 Main Topic&#10;10:45 Conclusion"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => {
                    const timestampData = descriptionForm.timestamps
                      .split('\n')
                      .filter(t => t.trim())
                      .map(line => {
                        const match = line.match(/^(\d{1,2}:\d{2})\s+(.+)$/);
                        return match ? { time: match[1], topic: match[2] } : null;
                      })
                      .filter(Boolean);

                    handleOptimize('optimizeDescription', {
                      ...descriptionForm,
                      keywords: parseKeywords(descriptionForm.keywords),
                      timestamps: timestampData,
                    });
                  }}
                  disabled={loading || !descriptionForm.title || !descriptionForm.content}
                  className="w-full"
                >
                  {loading ? 'Optimizing...' : 'Generate Optimized Description'}
                </Button>

                {results.optimizeDescription && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">Optimized Description:</h4>
                      <Card className="p-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-muted-foreground">Preview (first 125 chars):</Label>
                            <p className="mt-1 p-2 bg-muted rounded text-sm">{results.optimizeDescription.preview}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Full Description:</Label>
                            <div className="relative mt-1">
                              <Textarea
                                value={results.optimizeDescription.description}
                                readOnly
                                rows={10}
                                className="pr-12"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(results.optimizeDescription.description, 'description')}
                              >
                                {copiedItems.description ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          {results.optimizeDescription.hashtags.length > 0 && (
                            <div>
                              <Label className="text-sm text-muted-foreground">Hashtags:</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {results.optimizeDescription.hashtags.map((tag, i) => (
                                  <Badge key={i} variant="secondary">#{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tags Optimization */}
            <TabsContent value="tags" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="tags-title">Video Title</Label>
                  <Input
                    id="tags-title"
                    value={tagsForm.title}
                    onChange={(e) => setTagsForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Your video title"
                  />
                </div>

                <div>
                  <Label htmlFor="tags-content">Content Description</Label>
                  <Textarea
                    id="tags-content"
                    value={tagsForm.content}
                    onChange={(e) => setTagsForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Brief description of your video content"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Video Category</Label>
                  <Input
                    id="category"
                    value={tagsForm.category}
                    onChange={(e) => setTagsForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Gaming, Tech, Education, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="competitor-tags">Competitor Tags (optional, comma-separated)</Label>
                  <Textarea
                    id="competitor-tags"
                    value={tagsForm.competitorTags}
                    onChange={(e) => setTagsForm(prev => ({ ...prev, competitorTags: e.target.value }))}
                    placeholder="youtube seo, how to grow on youtube, youtube algorithm"
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={() => handleOptimize('optimizeTags', {
                    ...tagsForm,
                    competitorTags: tagsForm.competitorTags.split(',').map(t => t.trim()).filter(t => t),
                  })}
                  disabled={loading || !tagsForm.title || !tagsForm.content}
                  className="w-full"
                >
                  {loading ? 'Optimizing...' : 'Generate Optimized Tags'}
                </Button>

                {results.optimizeTags && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Optimized Tags:</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">{results.optimizeTags.tagCount} tags</Badge>
                        <Badge variant="outline">{results.optimizeTags.characterCount} chars</Badge>
                      </div>
                    </div>
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {results.optimizeTags.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="pt-3 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => copyToClipboard(results.optimizeTags.tags.join(', '), 'tags')}
                          >
                            {copiedItems.tags ? 'Copied!' : 'Copy All Tags'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* SEO Analysis */}
            <TabsContent value="analysis" className="space-y-4">
              <div className="grid gap-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Analyze your complete video metadata to get an SEO score and recommendations
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="analysis-title">Video Title</Label>
                  <Input
                    id="analysis-title"
                    value={seoAnalysis.title}
                    onChange={(e) => setSeoAnalysis(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Your video title"
                  />
                </div>

                <div>
                  <Label htmlFor="analysis-description">Description</Label>
                  <Textarea
                    id="analysis-description"
                    value={seoAnalysis.description}
                    onChange={(e) => setSeoAnalysis(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Your video description"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="analysis-tags">Tags (comma-separated)</Label>
                  <Textarea
                    id="analysis-tags"
                    value={seoAnalysis.tags}
                    onChange={(e) => setSeoAnalysis(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="youtube seo, video optimization, grow channel"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="analysis-keywords">Target Keywords (comma-separated)</Label>
                  <Input
                    id="analysis-keywords"
                    value={seoAnalysis.keywords}
                    onChange={(e) => setSeoAnalysis(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="youtube seo, video optimization"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="thumbnail-optimized"
                    checked={seoAnalysis.thumbnailOptimized}
                    onChange={(e) => setSeoAnalysis(prev => ({ ...prev, thumbnailOptimized: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="thumbnail-optimized">Thumbnail is optimized</Label>
                </div>

                <Button 
                  onClick={() => handleOptimize('analyzeSEO', {
                    ...seoAnalysis,
                    tags: seoAnalysis.tags.split(',').map(t => t.trim()).filter(t => t),
                    keywords: parseKeywords(seoAnalysis.keywords),
                  })}
                  disabled={loading || !seoAnalysis.title || !seoAnalysis.description}
                  className="w-full"
                >
                  {loading ? 'Analyzing...' : 'Analyze SEO Score'}
                </Button>

                {results.analyzeSEO && (
                  <div className="mt-4 space-y-4">
                    <Card className="p-6">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold mb-2">{results.analyzeSEO.totalScore}/100</div>
                        <Badge variant={results.analyzeSEO.grade.startsWith('A') ? 'default' : results.analyzeSEO.grade.startsWith('B') ? 'secondary' : 'outline'} className="text-lg px-3 py-1">
                          Grade: {results.analyzeSEO.grade}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Title Optimization</span>
                            <span className="text-sm text-muted-foreground">{results.analyzeSEO.breakdown.title}/30</span>
                          </div>
                          <Progress value={(results.analyzeSEO.breakdown.title / 30) * 100} />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Description</span>
                            <span className="text-sm text-muted-foreground">{results.analyzeSEO.breakdown.description}/25</span>
                          </div>
                          <Progress value={(results.analyzeSEO.breakdown.description / 25) * 100} />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Tags</span>
                            <span className="text-sm text-muted-foreground">{results.analyzeSEO.breakdown.tags}/20</span>
                          </div>
                          <Progress value={(results.analyzeSEO.breakdown.tags / 20) * 100} />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Keyword Usage</span>
                            <span className="text-sm text-muted-foreground">{results.analyzeSEO.breakdown.keywords}/15</span>
                          </div>
                          <Progress value={(results.analyzeSEO.breakdown.keywords / 15) * 100} />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Thumbnail</span>
                            <span className="text-sm text-muted-foreground">{results.analyzeSEO.breakdown.thumbnail}/10</span>
                          </div>
                          <Progress value={(results.analyzeSEO.breakdown.thumbnail / 10) * 100} />
                        </div>
                      </div>

                      {results.analyzeSEO.recommendations.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {results.analyzeSEO.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}