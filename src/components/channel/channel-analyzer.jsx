'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Video, 
  Eye, 
  ThumbsUp,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function ChannelAnalyzer({ channelId }) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (channelId) {
      startAnalysis();
    }
  }, [channelId]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const response = await fetch(`/api/channels/${channelId}/analyze`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setProgress(100);
      setAnalysisData(data);
      toast.success('Channel analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message);
      toast.error('Failed to analyze channel');
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4 animate-in zoom-in" />
            <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              {error === 'Failed to analyze channel' 
                ? 'We encountered an issue analyzing your channel. This might be due to YouTube API limits or connectivity issues.'
                : error}
            </p>
            <div className="flex gap-3">
              <Button onClick={startAnalysis}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push('/channels')}>Back to Channels</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing || !analysisData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Analyzing Your Channel</CardTitle>
          <CardDescription>
            This may take a few moments while we gather insights about your content and audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {progress < 30 && 'Fetching channel data...'}
                {progress >= 30 && progress < 60 && 'Analyzing video content...'}
                {progress >= 60 && progress < 90 && 'Generating audience insights...'}
                {progress >= 90 && 'Finalizing analysis...'}
              </p>
              <p className="text-xs text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { analytics, persona, insights } = analysisData;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.channel.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.performance.avgViewsPerVideo.toLocaleString()} per video
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.channel.subscriberCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.performance.viewsToSubscriberRatio}% view rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.avgEngagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.performance.totalEngagements.toLocaleString()} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.channel.videoCount}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.analysisMetadata.videosAnalyzed} analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Health Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Performance Score</span>
                  <span className="text-sm">{insights.metrics.performanceScore}/100</span>
                </div>
                <Progress value={insights.metrics.performanceScore} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Growth Potential</span>
                  <span className="text-sm">{insights.metrics.growthPotential}/100</span>
                </div>
                <Progress value={insights.metrics.growthPotential} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Audience Quality</span>
                  <span className="text-sm">{insights.metrics.audienceQuality}/100</span>
                </div>
                <Progress value={insights.metrics.audienceQuality} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <Badge variant="secondary" className="mr-2">+</Badge>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.opportunities && insights.opportunities.length > 0 ? (
                    insights.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start">
                        <Badge variant="outline" className="mr-2">!</Badge>
                        <span className="text-sm">{opportunity}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">Analyzing for improvement opportunities...</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <TrendingUp className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Persona</CardTitle>
              <CardDescription>
                Understanding who watches your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Engagement Level</h4>
                <Badge>{persona.behavior.engagementLevel}</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Loyalty Score: {persona.behavior.loyaltyScore}/100
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Viewing Patterns</h4>
                <p className="text-sm">{persona.behavior.viewingPatterns}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Content Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {persona.demographics.contentPreferences.map((pref, index) => (
                    <Badge key={index} variant="secondary">{pref}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Top Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {persona.demographics.interests.map((interest, index) => (
                    <Badge key={index} variant="outline">{interest}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Top Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.content.topKeywords.slice(0, 10).map(([keyword, count], index) => (
                      <Badge key={index} variant="secondary">
                        {keyword} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Content Types</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.content.contentTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type}</span>
                        <Badge variant="outline">{count} videos</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Upload Frequency</h4>
                  <p className="text-sm text-muted-foreground">
                    {persona.contentRecommendations.frequency}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topVideos.map((video, index) => (
                  <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">{video.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {video.views.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {video.likes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button onClick={() => router.push('/channels')}>
          View All Channels
        </Button>
      </div>
    </div>
  );
}