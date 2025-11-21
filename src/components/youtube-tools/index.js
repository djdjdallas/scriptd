'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  BarChart3,
  FileText, 
  Zap,
  Search,
  Type,
  Hash,
  Image,
  FileAudio,
  Copy,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  PlayCircle,
  TrendingUp,
  Target,
  Users,
  Eye,
  Clock,
  Star,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// YouTube Tools Data
const youtubeTools = [
  {
    id: 'video-breakdown',
    title: 'Video Breakdown',
    description: 'Analyze successful YouTube videos to understand their structure and strategy',
    icon: BarChart3,
    badge: 'Analytics',
    features: ['Content structure analysis', 'Engagement metrics', 'Strategy insights'],
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'description-generator',
    title: 'Description Generator',
    description: 'Create engaging and SEO-friendly descriptions for YouTube videos',
    icon: FileText,
    badge: 'SEO',
    features: ['SEO optimization', 'Call-to-action templates', 'Hashtag suggestions'],
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'hook-generator',
    title: 'Hook Generator',
    description: 'Generate engaging hooks for YouTube videos to capture viewers\' attention',
    icon: Zap,
    badge: 'Most Popular',
    features: ['Multiple styles', 'Engagement focused', 'Time-tested formulas'],
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'keyword-research',
    title: 'Keyword Research',
    description: 'Discover high-performing keywords for YouTube content strategy',
    icon: Search,
    badge: 'Research',
    features: ['Search volume data', 'Competition analysis', 'Trend insights'],
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'title-generator',
    title: 'Title Generator',
    description: 'Create catchy and SEO-friendly titles for YouTube videos',
    icon: Type,
    badge: 'Essential',
    features: ['Click-worthy titles', 'A/B testing ready', 'Character counter'],
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'tag-generator',
    title: 'Tag Generator',
    description: 'Generate relevant tags for YouTube videos to improve discoverability',
    icon: Hash,
    badge: 'Discovery',
    features: ['Relevance scoring', 'Competition level', 'Trending tags'],
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'thumbnail-grabber',
    title: 'Thumbnail Grabber',
    description: 'Download high-quality thumbnails from any YouTube video in multiple resolutions',
    icon: Image,
    badge: 'Utility',
    features: ['Multiple resolutions', 'High quality', 'Instant download'],
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'transcript-generator',
    title: 'Transcript Generator',
    description: 'Extract complete transcripts from any YouTube video with captions',
    icon: FileAudio,
    badge: 'Content',
    features: ['Auto-generated captions', 'Timestamp support', 'Export options'],
    color: 'from-purple-500/20 to-pink-500/20'
  }
];

// Video Breakdown Component
function VideoBreakdownTool() {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube video URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/youtube/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoUrl.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="video-url" className="text-gray-300">YouTube Video URL</Label>
        <div className="flex gap-2">
          <Input
            id="video-url"
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={loading}
            className="glass-input text-white placeholder:text-gray-500"
          />
          <Button onClick={analyzeVideo} disabled={loading || !videoUrl.trim()} className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            Analyze
          </Button>
        </div>
      </div>

      {analysis && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-purple-400" />
              Video Overview
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{analysis.views}</p>
                  <p className="text-sm text-gray-400">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{analysis.likes}</p>
                  <p className="text-sm text-gray-400">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{analysis.duration}</p>
                  <p className="text-sm text-gray-400">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">4.2%</p>
                  <p className="text-sm text-gray-400">Engagement</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Content Structure</h3>
            <div>
              <div className="space-y-3">
                {analysis.structure.map((section, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 glass rounded-lg">
                    <Badge className="glass bg-purple-500/20 text-purple-300 border-purple-400/50">{section.section}</Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">{section.duration}</span>
                      </div>
                      <p className="text-sm text-gray-400">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
            <div>
              <ul className="space-y-2">
                {analysis.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-sm text-gray-300">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Description Generator Component
function DescriptionGeneratorTool() {
  const { toast } = useToast();
  const [videoTopic, setVideoTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState('professional');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const generateDescription = async () => {
    if (!videoTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter your video topic",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/youtube/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTopic: videoTopic.trim(),
          keywords: keywords.trim(),
          style,
          includeHashtags,
          includeCTA
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      setDescription(data.description);
      
    } catch (error) {
      console.error('Description generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyDescription = async () => {
    try {
      await navigator.clipboard.writeText(description);
      toast({
        title: "Copied!",
        description: "Description copied to clipboard"
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
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="video-topic" className="text-gray-300">Video Topic</Label>
          <Input
            id="video-topic"
            placeholder="e.g., How to make sourdough bread"
            value={videoTopic}
            onChange={(e) => setVideoTopic(e.target.value)}
            disabled={loading}
            className="glass-input text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-gray-300">Target Keywords</Label>
          <Input
            id="keywords"
            placeholder="e.g., sourdough, bread making, homemade"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={loading}
            className="glass-input text-white placeholder:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="style" className="text-gray-300">Writing Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="glass-input text-white [&>span]:text-white">
                <SelectValue placeholder="Select a writing style" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20 bg-black/95">
                <SelectItem value="professional" className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 cursor-pointer">Professional</SelectItem>
                <SelectItem value="casual" className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 cursor-pointer">Casual & Friendly</SelectItem>
                <SelectItem value="educational" className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 cursor-pointer">Educational</SelectItem>
                <SelectItem value="entertaining" className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 cursor-pointer">Entertaining</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Include Hashtags</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={includeHashtags}
                onCheckedChange={setIncludeHashtags}
              />
              <span className="text-sm text-gray-300">Add relevant hashtags</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Call-to-Action</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={includeCTA}
                onCheckedChange={setIncludeCTA}
              />
              <span className="text-sm text-gray-300">Include subscribe CTA</span>
            </div>
          </div>
        </div>

        <Button onClick={generateDescription} disabled={loading || !videoTopic.trim()} className="w-full glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Description
            </>
          )}
        </Button>
      </div>

      {description && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Generated Description</h3>
            <Button className="glass-button text-white" size="sm" onClick={copyDescription}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <div>
            <div className="relative">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input min-h-[400px] font-mono text-sm text-white"
                placeholder="Your generated description will appear here..."
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {description.length} characters
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook Generator Component
function HookGeneratorTool() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [hookStyle, setHookStyle] = useState('question');
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const hookStyles = [
    { id: 'question', label: 'Question Hook', example: 'Did you know that...?' },
    { id: 'shocking', label: 'Shocking Statement', example: 'This will blow your mind...' },
    { id: 'story', label: 'Story Hook', example: 'Last week something crazy happened...' },
    { id: 'problem', label: 'Problem Hook', example: 'If you\'re struggling with...' },
    { id: 'benefit', label: 'Benefit Hook', example: 'In the next 10 minutes...' },
    { id: 'curiosity', label: 'Curiosity Gap', example: 'The secret that nobody tells you...' }
  ];

  const generateHooks = async () => {
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
      const response = await fetch('/api/youtube/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          hookStyle
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate hooks');
      }

      const data = await response.json();
      setHooks(data.hooks);
      
    } catch (error) {
      console.error('Hook generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate hooks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyHook = async (hookText) => {
    try {
      await navigator.clipboard.writeText(hookText);
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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="hook-topic" className="text-gray-300">Video Topic</Label>
          <Input
            id="hook-topic"
            placeholder="e.g., Making sourdough bread for beginners"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            className="glass-input text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-gray-300">Hook Style</Label>
          <RadioGroup value={hookStyle} onValueChange={setHookStyle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hookStyles.map((style) => (
                <div key={style.id}>
                  <RadioGroupItem
                    value={style.id}
                    id={style.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={style.id}
                    className="flex flex-col gap-1 rounded-md border-2 border-white/20 glass p-4 hover:bg-white/10 peer-data-[state=checked]:border-purple-400 peer-data-[state=checked]:bg-purple-500/20 cursor-pointer text-white"
                  >
                    <span className="font-medium text-white">{style.label}</span>
                    <span className="text-xs text-gray-400">{style.example}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Button onClick={generateHooks} disabled={loading || !topic.trim()} className="w-full glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Generate Hooks
            </>
          )}
        </Button>
      </div>

      {hooks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Generated Hooks</h3>
          {hooks.map((hook, index) => (
            <div key={index} className="glass-card p-6 glass-hover cursor-pointer" onClick={() => copyHook(hook.text)}>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium mb-2 text-white">{hook.text}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge className="glass bg-purple-500/20 text-purple-300 border-purple-400/50">{hook.type}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">{hook.engagement}/10</span>
                      </div>
                    </div>
                  </div>
                  <Button className="glass-button text-white" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Keyword Research Component
function KeywordResearchTool() {
  const { toast } = useToast();
  const [seedKeyword, setSeedKeyword] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  const researchKeywords = async () => {
    if (!seedKeyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a seed keyword",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/youtube/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedKeyword: seedKeyword.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to research keywords');
      }

      const data = await response.json();
      setKeywords(data.keywords);
      
    } catch (error) {
      console.error('Keyword research error:', error);
      toast({
        title: "Research Failed",
        description: "Failed to research keywords. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendColor = (trend) => {
    const value = parseInt(trend);
    return value > 15 ? 'text-green-600' : value > 5 ? 'text-yellow-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seed-keyword" className="text-gray-300">Seed Keyword</Label>
          <div className="flex gap-2">
            <Input
              id="seed-keyword"
              placeholder="e.g., sourdough bread"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              disabled={loading}
              className="glass-input text-white placeholder:text-gray-500"
            />
            <Button onClick={researchKeywords} disabled={loading || !seedKeyword.trim()} className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Research
            </Button>
          </div>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Keyword Opportunities</h3>
          <p className="text-sm text-gray-400 mb-4">
            Keywords related to "{seedKeyword}" with search volume and difficulty
          </p>
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-gray-300">Keyword</th>
                    <th className="text-center py-2 text-gray-300">Volume</th>
                    <th className="text-center py-2 text-gray-300">Difficulty</th>
                    <th className="text-center py-2 text-gray-300">Trend</th>
                    <th className="text-center py-2 text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((item, index) => (
                    <tr key={index} className="border-b border-white/10">
                      <td className="py-3 font-medium text-white">{item.keyword}</td>
                      <td className="text-center py-3 text-gray-300">{item.volume}</td>
                      <td className="text-center py-3">
                        <Badge className={getDifficultyColor(item.difficulty)}>
                          {item.difficulty}
                        </Badge>
                      </td>
                      <td className={`text-center py-3 font-medium ${getTrendColor(item.trend)}`}>
                        {item.trend}
                      </td>
                      <td className="text-center py-3">
                        <Button
                          className="glass-button text-white"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(item.keyword)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Title Generator Component (Enhanced)
function TitleGeneratorTool() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState('how-to');
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);

  const titleStyles = [
    { id: 'how-to', label: 'How-To', example: 'How to...' },
    { id: 'listicle', label: 'Listicle', example: 'Top 10...' },
    { id: 'question', label: 'Question', example: 'Why do...' },
    { id: 'shocking', label: 'Shocking', example: 'You won\'t believe...' }
  ];

  const generateTitles = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your video",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/youtube/titles', {
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
      console.error('Title generation error:', error);
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title-topic" className="text-gray-300">Video Topic</Label>
          <Input
            id="title-topic"
            placeholder="e.g., Making sourdough bread at home"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            className="glass-input text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title-keywords" className="text-gray-300">Target Keywords</Label>
          <Input
            id="title-keywords"
            placeholder="e.g., sourdough, bread recipe, homemade"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={loading}
            className="glass-input text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-gray-300">Title Style</Label>
          <RadioGroup value={style} onValueChange={setStyle}>
            <div className="grid grid-cols-2 gap-3">
              {titleStyles.map((s) => (
                <div key={s.id}>
                  <RadioGroupItem
                    value={s.id}
                    id={s.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={s.id}
                    className="flex items-center justify-between rounded-md border-2 border-white/20 glass p-4 hover:bg-white/10 peer-data-[state=checked]:border-purple-400 peer-data-[state=checked]:bg-purple-500/20 cursor-pointer text-white"
                  >
                    <div>
                      <p className="font-medium text-white">{s.label}</p>
                      <p className="text-xs text-gray-400">{s.example}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Button onClick={generateTitles} disabled={loading || !topic.trim()} className="w-full glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Type className="h-4 w-4 mr-2" />
              Generate Titles
            </>
          )}
        </Button>
      </div>

      {titles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Generated Titles</h3>
          {titles.map((title, index) => (
            <div key={index} className="glass-card p-6 glass-hover cursor-pointer" onClick={() => copyTitle(title.text)}>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium mb-2 text-white">{title.text}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">{title.text.length} characters</span>
                      <Badge className="glass bg-purple-500/20 text-purple-300 border-purple-400/50">
                        Score: {title.score}/10
                      </Badge>
                    </div>
                  </div>
                  <Button className="glass-button text-white" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tag Generator Component
function TagGeneratorTool() {
  const { toast } = useToast();
  const [videoTopic, setVideoTopic] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateTags = async () => {
    if (!videoTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter your video topic",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/youtube/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTopic: videoTopic.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate tags');
      }

      const data = await response.json();
      setTags(data.tags);
      
    } catch (error) {
      console.error('Tag generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate tags. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAllTags = async () => {
    const tagList = tags.map(t => t.tag).join(', ');
    try {
      await navigator.clipboard.writeText(tagList);
      toast({
        title: "Copied!",
        description: "All tags copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getCompetitionColor = (competition) => {
    switch (competition) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tag-topic" className="text-gray-300">Video Topic</Label>
          <div className="flex gap-2">
            <Input
              id="tag-topic"
              placeholder="e.g., How to make sourdough bread"
              value={videoTopic}
              onChange={(e) => setVideoTopic(e.target.value)}
              disabled={loading}
              className="glass-input text-white placeholder:text-gray-500"
            />
            <Button onClick={generateTags} disabled={loading || !videoTopic.trim()} className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />}
              Generate
            </Button>
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Generated Tags</h3>
              <p className="text-sm text-gray-400">
                Optimized tags for "{videoTopic}" ranked by relevance
              </p>
            </div>
            <Button className="glass-button text-white" size="sm" onClick={copyAllTags}>
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>
          <div>
            <div className="grid gap-3">
              {tags.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{item.relevance}</div>
                      <div className="text-xs text-gray-400">relevance</div>
                    </div>
                    <div>
                      <div className="font-medium text-white">#{item.tag}</div>
                      <div className="text-sm text-gray-400">{item.volume} monthly searches</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getCompetitionColor(item.competition)}>
                      {item.competition}
                    </Badge>
                    <Button
                      className="glass-button text-white"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(item.tag)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Thumbnail Grabber Component
function ThumbnailGrabberTool() {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);

  const grabThumbnails = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube video URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Extract real video ID from URL
      const videoId = extractVideoId(videoUrl);

      if (!videoId) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid YouTube video URL",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const realThumbnails = [
        {
          quality: 'Max Resolution',
          url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          dimensions: '1280×720',
          size: '~200KB'
        },
        {
          quality: 'Standard Definition',
          url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
          dimensions: '640×480',
          size: '~80KB'
        },
        {
          quality: 'High Quality',
          url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          dimensions: '480×360',
          size: '~50KB'
        },
        {
          quality: 'Medium Quality',
          url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          dimensions: '320×180',
          size: '~20KB'
        },
        {
          quality: 'Default',
          url: `https://img.youtube.com/vi/${videoId}/default.jpg`,
          dimensions: '120×90',
          size: '~8KB'
        }
      ];

      setThumbnails(realThumbnails);
      toast({
        title: "Success!",
        description: "Thumbnails loaded successfully"
      });
    } catch (error) {
      toast({
        title: "Grab Failed",
        description: "Failed to grab thumbnails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const downloadThumbnail = async (thumbnail) => {
    try {
      const response = await fetch(thumbnail.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thumbnail_${thumbnail.quality.toLowerCase().replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded!",
        description: `${thumbnail.quality} thumbnail downloaded`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download thumbnail",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="thumbnail-url" className="text-gray-300">YouTube Video URL</Label>
          <div className="flex gap-2">
            <Input
              id="thumbnail-url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={loading}
              className="glass-input text-white placeholder:text-gray-500"
            />
            <Button onClick={grabThumbnails} disabled={loading || !videoUrl.trim()} className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
              Grab
            </Button>
          </div>
        </div>
      </div>

      {thumbnails.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Available Thumbnails</h3>
          <div className="grid gap-4">
            {thumbnails.map((thumbnail, index) => (
              <div key={index} className="glass-card p-6">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-24 glass rounded-lg overflow-hidden">
                      <img
                        src={thumbnail.url}
                        alt={`${thumbnail.quality} thumbnail`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiNGNUY1RjUiLz48dGV4dCB4PSI2MCIgeT0iNDUiIGZpbGw9IiM5Q0E3QjYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{thumbnail.quality}</h4>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>Resolution: {thumbnail.dimensions}</div>
                        <div>File Size: {thumbnail.size}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="glass-button text-white"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(thumbnail.url)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
                        size="sm"
                        onClick={() => downloadThumbnail(thumbnail)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Transcript Generator Component
function TranscriptGeneratorTool() {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);

  const generateTranscript = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube video URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/youtube/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoUrl.trim(),
          includeTimestamps
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate transcript');
      }

      const data = await response.json();
      setTranscript(data.transcript);
      
    } catch (error) {
      console.error('Transcript generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate transcript. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube_transcript.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Downloaded!",
      description: "Transcript downloaded as text file"
    });
  };

  const copyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      toast({
        title: "Copied!",
        description: "Transcript copied to clipboard"
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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="transcript-url" className="text-gray-300">YouTube Video URL</Label>
          <div className="flex gap-2">
            <Input
              id="transcript-url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={loading}
              className="glass-input text-white placeholder:text-gray-500"
            />
            <Button onClick={generateTranscript} disabled={loading || !videoUrl.trim()} className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileAudio className="h-4 w-4" />}
              Extract
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={includeTimestamps}
            onCheckedChange={setIncludeTimestamps}
          />
          <Label className="text-gray-300">Include timestamps</Label>
        </div>
      </div>

      {transcript && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Generated Transcript</h3>
              <p className="text-sm text-gray-400">
                Transcript extracted with {includeTimestamps ? 'timestamps' : 'no timestamps'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="glass-button text-white" size="sm" onClick={copyTranscript}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button className="glass-button text-white" size="sm" onClick={downloadTranscript}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <div>
            <div className="relative">
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="glass-input min-h-[400px] font-mono text-sm text-white"
                placeholder="Extracted transcript will appear here..."
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {transcript.split(' ').length} words
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main YouTube Tools Component
export default function YouTubeTools() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openTool = (tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const closeTool = () => {
    setIsModalOpen(false);
    setSelectedTool(null);
  };

  const renderToolContent = () => {
    if (!selectedTool) return null;

    switch (selectedTool.id) {
      case 'video-breakdown':
        return <VideoBreakdownTool />;
      case 'description-generator':
        return <DescriptionGeneratorTool />;
      case 'hook-generator':
        return <HookGeneratorTool />;
      case 'keyword-research':
        return <KeywordResearchTool />;
      case 'title-generator':
        return <TitleGeneratorTool />;
      case 'tag-generator':
        return <TagGeneratorTool />;
      case 'thumbnail-grabber':
        return <ThumbnailGrabberTool />;
      case 'transcript-generator':
        return <TranscriptGeneratorTool />;
      default:
        return <div>Tool not found</div>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">
          YouTube Creator Tools
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Professional-grade tools to optimize your YouTube content, boost engagement, and grow your channel
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {youtubeTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="glass-card p-6 glass-hover cursor-pointer group animate-reveal"
              onClick={() => openTool(tool)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg`} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="glass w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-purple-400" />
                  </div>
                  {tool.badge && (
                    <Badge className="glass bg-purple-500/20 text-purple-300 border-purple-400/50 text-xs">
                      {tool.badge}
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {tool.description}
                </p>

                <ul className="space-y-2 mb-4">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="h-1 w-1 bg-purple-400 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span>Try it free</span>
                  <ExternalLink className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tool Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-white/20 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900">
          {selectedTool && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="glass w-10 h-10 rounded-lg flex items-center justify-center">
                    <selectedTool.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl text-white">{selectedTool.title}</DialogTitle>
                    <DialogDescription className="text-base text-gray-400">
                      {selectedTool.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="py-4">
                {renderToolContent()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export individual tool components for use elsewhere
export {
  VideoBreakdownTool,
  DescriptionGeneratorTool,
  HookGeneratorTool,
  KeywordResearchTool,
  TitleGeneratorTool,
  TagGeneratorTool,
  ThumbnailGrabberTool,
  TranscriptGeneratorTool
};