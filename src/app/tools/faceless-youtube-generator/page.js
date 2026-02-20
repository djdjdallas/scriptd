'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight, Star, Zap, TrendingUp, Brain,
  Eye, EyeOff, Mic, Video, Bot, Sparkles,
  CheckCircle2, Play, DollarSign, Clock, Users
} from 'lucide-react';
import Link from 'next/link';
import { socialProofData } from '@/lib/comparison-data';

export default function FacelessYouTubeGeneratorPage() {
  const [generationStep, setGenerationStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'faceless-youtube-generator',
        referrer: document.referrer
      })
    });
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    const interval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsGenerating(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const generationSteps = [
    { label: 'Analyzing topic trends', icon: <Brain className="w-4 h-4" /> },
    { label: 'Generating viral script', icon: <Zap className="w-4 h-4" /> },
    { label: 'Creating voice narration', icon: <Mic className="w-4 h-4" /> },
    { label: 'Adding visual elements', icon: <Eye className="w-4 h-4" /> },
    { label: 'Optimizing for retention', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const facelessChannelTypes = [
    {
      type: 'Educational Explainers',
      icon: <Brain className="w-8 h-8 text-violet-600" />,
      examples: ['Science facts', 'History stories', 'Tech tutorials'],
      avgViews: '50K-500K',
      difficulty: 'Easy'
    },
    {
      type: 'Motivation & Quotes',
      icon: <Sparkles className="w-8 h-8 text-yellow-600" />,
      examples: ['Daily motivation', 'Success stories', 'Life lessons'],
      avgViews: '100K-1M',
      difficulty: 'Easy'
    },
    {
      type: 'Top 10 Lists',
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      examples: ['Top mysteries', 'Best products', 'Amazing facts'],
      avgViews: '200K-2M',
      difficulty: 'Medium'
    },
    {
      type: 'Story Narrations',
      icon: <Mic className="w-8 h-8 text-blue-600" />,
      examples: ['Reddit stories', 'True crime', 'Creepypasta'],
      avgViews: '300K-5M',
      difficulty: 'Medium'
    }
  ];

  const monetizationPotential = [
    { months: 1, subscribers: 500, revenue: '$50-100' },
    { months: 3, subscribers: 5000, revenue: '$500-1000' },
    { months: 6, subscribers: 25000, revenue: '$2500-5000' },
    { months: 12, subscribers: 100000, revenue: '$10000+' }
  ];

  return (
    <div className="min-h-screen bg-[#030303]">
      <head>
        <title>Faceless YouTube Channel Generator - Create Viral Videos Without Showing Your Face</title>
        <meta name="description" content="Generate complete faceless YouTube videos with AI. Scripts, voiceovers, and visuals in minutes. Join creators earning $10K+/month without being on camera." />
        <meta name="keywords" content="faceless youtube channel, youtube automation, ai video generator, passive income youtube, faceless content creator" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-violet-950/40 via-[#030303] to-violet-950/20 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/30">
              <EyeOff className="w-4 h-4 mr-1" />
              No Camera Required
            </Badge>

            <h1 className="font-display text-5xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Create Viral Faceless YouTube Videos in Minutes
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Generate complete YouTube videos without showing your face.
              <span className="font-semibold text-white"> AI scripts</span>,
              <span className="font-semibold text-white"> voice narration</span>, and
              <span className="font-semibold text-white"> visual generation</span> - all automated.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
                onClick={handleGenerate}
              >
                Generate Your First Video Free
                <Video className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/[0.06] hover:bg-white/[0.06] text-white">
                See Success Stories
                <Users className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Bot className="w-4 h-4" />
                <span>100% Automated</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>5-Min Creation</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>Monetization Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Generation Demo */}
      {isGenerating && (
        <section className="py-16 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="bg-gradient-to-br from-violet-950/50 to-cyan-950/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Generating Your Faceless Video...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generationSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${idx <= generationStep ? 'bg-violet-600 text-white' : 'bg-white/[0.06]'}`}>
                        {idx <= generationStep ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                      </div>
                      <span className={idx <= generationStep ? 'font-medium text-white' : 'text-gray-400'}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <Progress value={(generationStep + 1) * 20} className="mt-6" />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Channel Types */}
      <section className="py-20 bg-gradient-to-b from-[#030303] to-violet-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-center mb-4 text-white">
            Choose Your Faceless Channel Type
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Each type has proven success patterns and monetization potential
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facelessChannelTypes.map((channel, idx) => (
              <Card key={idx} className="bg-white/[0.04] border-white/5 hover:border-violet-500 transition-all cursor-pointer">
                <CardHeader>
                  <div className="mb-3">{channel.icon}</div>
                  <CardTitle className="text-lg text-white">{channel.type}</CardTitle>
                  <Badge className={channel.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/[0.06] text-gray-300'}>
                    {channel.difficulty}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1 text-gray-300">Examples:</p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {channel.examples.map((ex, i) => (
                          <li key={i}>• {ex}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-sm font-medium text-gray-300">Avg Views:</p>
                      <p className="text-lg font-bold text-violet-400">{channel.avgViews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white/[0.02]">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-white">
            From Idea to Published Video in 5 Minutes
          </h2>

          <Tabs defaultValue="script" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 bg-white/[0.06]">
              <TabsTrigger value="script">1. Script</TabsTrigger>
              <TabsTrigger value="voice">2. Voice</TabsTrigger>
              <TabsTrigger value="visuals">3. Visuals</TabsTrigger>
              <TabsTrigger value="publish">4. Publish</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="mt-8">
              <Card className="bg-white/[0.04] border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">AI-Generated Viral Scripts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300">Enter any topic and our AI creates scripts optimized for:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>68%+ retention rate</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Viral hook in first 3 seconds</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Perfect 8-10 minute length</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">Generate Script Now</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="mt-8">
              <Card className="bg-white/[0.04] border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Natural AI Voice Narration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300">Choose from multiple voice options:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-white/5 rounded-lg bg-white/[0.04]">
                        <p className="font-medium text-white">Documentary Style</p>
                        <p className="text-sm text-gray-400">David Attenborough-like</p>
                      </div>
                      <div className="p-3 border border-white/5 rounded-lg bg-white/[0.04]">
                        <p className="font-medium text-white">Energetic</p>
                        <p className="text-sm text-gray-400">MrBeast-inspired</p>
                      </div>
                      <div className="p-3 border border-white/5 rounded-lg bg-white/[0.04]">
                        <p className="font-medium text-white">Storyteller</p>
                        <p className="text-sm text-gray-400">Engaging narrative</p>
                      </div>
                      <div className="p-3 border border-white/5 rounded-lg bg-white/[0.04]">
                        <p className="font-medium text-white">Professional</p>
                        <p className="text-sm text-gray-400">News anchor style</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">Generate Voiceover</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visuals" className="mt-8">
              <Card className="bg-white/[0.04] border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Automated Visual Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300">AI creates engaging visuals including:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Stock footage matching script</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Animated text overlays</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Transitions and effects</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Background music</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">Add Visuals</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publish" className="mt-8">
              <Card className="bg-white/[0.04] border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">One-Click Publishing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300">Everything ready for YouTube:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>SEO-optimized title</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Engaging description</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Relevant tags</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Eye-catching thumbnail</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
                      Publish to YouTube
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Monetization Potential */}
      <section className="py-20 bg-gradient-to-b from-[#030303] to-violet-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-center mb-4 text-white">
            Your Monetization Timeline
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Realistic earnings potential based on {socialProofData.metrics.totalUsers}+ successful channels
          </p>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {monetizationPotential.map((milestone, idx) => (
              <Card key={idx} className={`bg-white/[0.04] border-white/5 ${idx === 3 ? 'border-violet-500 shadow-lg shadow-violet-500/20' : ''}`}>
                <CardHeader>
                  <CardDescription className="text-gray-400">Month {milestone.months}</CardDescription>
                  <CardTitle className="text-2xl text-white">{milestone.revenue}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-gray-300">{milestone.subscribers.toLocaleString()} subs</span>
                    </div>
                    <Progress value={(idx + 1) * 25} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-violet-950/50 to-cyan-950/50 rounded-2xl text-center max-w-3xl mx-auto border border-violet-500/30">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Start Your Faceless Channel Today
            </h3>
            <p className="mb-6 text-gray-400">
              Join creators earning passive income without ever showing their face
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/[0.06] hover:bg-white/[0.06] text-white">
                View Case Studies
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-[#030303]">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-white">
            Real Faceless Channel Success Stories
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/[0.04] border-white/5">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <CardTitle className="text-white">Mystery Channel</CardTitle>
                <CardDescription className="text-gray-400">Started 3 months ago</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 text-gray-300">
                  "I create top 10 mystery videos. Never showed my face, now at 50K subs earning $3K/month."
                </p>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Videos: 24</span>
                  <span className="font-bold text-violet-400">$3,200/mo</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.04] border-white/5">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <CardTitle className="text-white">Motivation Daily</CardTitle>
                <CardDescription className="text-gray-400">Started 6 months ago</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 text-gray-300">
                  "Daily motivation videos, 100% automated. Hit 100K subs and making $8K monthly."
                </p>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Videos: 180</span>
                  <span className="font-bold text-violet-400">$8,500/mo</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.04] border-white/5">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <CardTitle className="text-white">Tech Facts</CardTitle>
                <CardDescription className="text-gray-400">Started 1 year ago</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 text-gray-300">
                  "Tech explainer videos without showing face. 250K subs, full-time income now!"
                </p>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Videos: 365</span>
                  <span className="font-bold text-violet-400">$15,000/mo</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-display text-4xl font-bold mb-6">
            Your Faceless YouTube Empire Starts Here
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            No camera, no problem. Create viral content and earn passive income with AI.
          </p>

          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>100% Faceless</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>5-Min Videos</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Proven Templates</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Create Your First Video Free
                <Play className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              Watch Tutorial
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
