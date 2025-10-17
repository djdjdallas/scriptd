'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Video,
  Copy,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Hash,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function TranscriptExtractionPage() {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractTranscript = async (e) => {
    e.preventDefault();

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
        throw new Error('Failed to extract transcript');
      }

      const data = await response.json();
      setTranscript(data);

      toast({
        title: "Success!",
        description: "Transcript extracted successfully"
      });

    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Extraction Failed",
        description: "Failed to extract transcript. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript.transcript);
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

  const downloadTranscript = () => {
    const blob = new Blob([transcript.transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${transcript.videoId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Transcript saved to your device"
    });
  };

  useEffect(() => {
    // Set document title and meta tags for SEO
    document.title = 'Free YouTube Transcript Extractor | Extract Video Transcripts for Research';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Free YouTube transcript extraction tool. Extract and analyze video transcripts for competitive research, hook analysis, and keyword detection.');
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="gap-2">
          <Sparkles className="h-3 w-3" />
          Free YouTube Transcript Extractor
        </Badge>
        <h1 className="text-4xl font-bold">YouTube Transcript Extraction</h1>
        <p className="text-xl text-muted-foreground">
          Extract and analyze video transcripts in seconds for competitive research
        </p>
      </div>

      {/* Extraction Form */}
      <Card>
        <CardHeader>
          <CardTitle>Extract Transcript</CardTitle>
          <CardDescription>
            Enter any YouTube video URL to extract its transcript
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={extractTranscript} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">YouTube Video URL *</Label>
              <Input
                id="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Works with any public YouTube video that has captions
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="timestamps"
                checked={includeTimestamps}
                onCheckedChange={setIncludeTimestamps}
                disabled={loading}
              />
              <Label htmlFor="timestamps" className="cursor-pointer">
                Include timestamps
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Extract Transcript
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {transcript && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Extracted Transcript</CardTitle>
                  <CardDescription>
                    Video ID: {transcript.videoId}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTranscript}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTranscript}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Word Count</span>
                    </div>
                    <p className="text-2xl font-bold">{transcript.wordCount}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Read Time</span>
                    </div>
                    <p className="text-2xl font-bold">{transcript.estimatedReadTime} min</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Format</span>
                    </div>
                    <p className="text-2xl font-bold">{transcript.includeTimestamps ? 'Timed' : 'Plain'}</p>
                  </div>
                </div>

                {/* Transcript Text */}
                <Textarea
                  value={transcript.transcript}
                  readOnly
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>What You Can Do With Transcripts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Competitive Research</p>
              <p className="text-sm text-muted-foreground">
                Analyze successful videos in your niche to understand their structure
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Hook Analysis</p>
              <p className="text-sm text-muted-foreground">
                Study how top creators hook viewers in the first 30 seconds
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Topic Detection</p>
              <p className="text-sm text-muted-foreground">
                Identify key topics and themes covered in successful content
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Keyword Research</p>
              <p className="text-sm text-muted-foreground">
                Extract keywords and phrases that resonate with audiences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Research Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold">1</span>
            </div>
            <div>
              <p className="font-medium">Analyze Top Performers</p>
              <p className="text-sm text-muted-foreground">
                Extract transcripts from the top 10 videos in your niche for pattern recognition
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold">2</span>
            </div>
            <div>
              <p className="font-medium">Study Hook Patterns</p>
              <p className="text-sm text-muted-foreground">
                Focus on the first 30 seconds to understand what makes viewers stay
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold">3</span>
            </div>
            <div>
              <p className="font-medium">Compare Structures</p>
              <p className="text-sm text-muted-foreground">
                Look for common storytelling structures across multiple successful videos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            Ready to Create Your Own Viral Scripts?
          </h3>
          <p className="text-muted-foreground mb-4">
            Use the insights from transcript research to generate scripts in your unique voice
          </p>
          <Button asChild>
            <Link href="/signup">
              Get Started Free
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
