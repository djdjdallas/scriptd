'use client';

import { use, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentAnalysisDashboard } from '@/components/ai/content-analysis-dashboard';
import { VideoIdeasGenerator } from '@/components/ai/video-ideas-generator';
import { AIErrorBoundary } from '@/components/ai/ai-error-boundary';
import { Sparkles, Lightbulb, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react';

export default function AIInsightsPage({ params }) {
  const resolvedParams = use(params);
  const channelId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            AI-Powered Channel Insights
          </h1>
          <p className="text-gray-400">
            Leverage artificial intelligence to optimize your content strategy
          </p>
        </div>

        <AIErrorBoundary>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="ideas" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Ideas
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <ContentAnalysisDashboard channelId={channelId} />
            </TabsContent>

            <TabsContent value="ideas" className="space-y-6">
              <VideoIdeasGenerator channelId={channelId} />
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <ComingSoonCard 
                title="AI Trend Analysis"
                description="Intelligent trend prediction and impact analysis for your channel"
                icon={<TrendingUp className="h-12 w-12 text-purple-400" />}
              />
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <ComingSoonCard 
                title="Comment Sentiment Analysis"
                description="Analyze viewer sentiment and engagement patterns from comments"
                icon={<MessageSquare className="h-12 w-12 text-blue-400" />}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <ComingSoonCard 
                title="Analytics Intelligence"
                description="AI-powered insights and predictions from your channel analytics"
                icon={<BarChart3 className="h-12 w-12 text-green-400" />}
              />
            </TabsContent>
          </Tabs>
        </AIErrorBoundary>
      </div>
    </div>
  );
}

function ComingSoonCard({ title, description, icon }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">{icon}</div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 rounded-full">
          <span className="text-sm text-purple-300">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}