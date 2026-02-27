'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight, Sparkles, TrendingUp, Brain,
  Lightbulb, Zap, Target, BookOpen, Play,
  CheckCircle2, Award
} from 'lucide-react';
import Link from 'next/link';
import { socialProofData } from '@/lib/comparison-data';

export default function PVSSFrameworkPage() {
  const [activePhase, setActivePhase] = useState('pattern');

  useEffect(() => {
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'pvss-framework',
        referrer: document.referrer
      })
    });
  }, []);

  const frameworkPhases = {
    pattern: {
      icon: <Brain className="w-6 h-6" />,
      title: 'Pattern Recognition',
      timing: '0-15 seconds',
      description: 'Instantly connect with viewer\'s existing mental models',
      example: '"You know that feeling when..."',
      tips: [
        'Reference universal experiences',
        'Use familiar scenarios',
        'Create instant relatability'
      ]
    },
    value: {
      icon: <Target className="w-6 h-6" />,
      title: 'Value Promise',
      timing: '15-30 seconds',
      description: 'Clear, specific benefit they\'ll gain',
      example: '"In the next 10 minutes, you\'ll learn exactly how to..."',
      tips: [
        'Be ultra-specific',
        'Use numbers and timeframes',
        'Focus on transformation'
      ]
    },
    story: {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Story Arc',
      timing: '30s-8 minutes',
      description: 'Engaging narrative that delivers the value',
      example: '"Let me tell you about Sarah, who went from..."',
      tips: [
        'Use case studies',
        'Create emotional connection',
        'Build tension and resolution'
      ]
    },
    surprise: {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Surprise Element',
      timing: 'Final 2 minutes',
      description: 'Unexpected bonus that exceeds expectations',
      example: '"But here\'s what nobody talks about..."',
      tips: [
        'Save best insight for last',
        'Add unexpected value',
        'Create shareable moment'
      ]
    }
  };

  const viralExamples = [
    {
      channel: 'MrBeast',
      video: 'I Spent 50 Hours in Solitary Confinement',
      views: '152M',
      pattern: 'Extreme challenge premise',
      value: 'See if human can survive',
      story: 'Progressive difficulty increase',
      surprise: 'Donates $100K at the end'
    },
    {
      channel: 'Veritasium',
      video: 'The Surprising Secret of Synchronization',
      views: '28M',
      pattern: 'Metronomes syncing mysteriously',
      value: 'Understanding hidden physics',
      story: 'Scientific explanation journey',
      surprise: 'Applies to human behavior'
    },
    {
      channel: 'Mark Rober',
      video: 'Glitter Bomb vs Package Thieves',
      views: '94M',
      pattern: 'Package theft frustration',
      value: 'Engineering revenge solution',
      story: 'Building and deploying trap',
      surprise: 'Multiple thief reactions'
    }
  ];

  const scriptTemplates = {
    education: {
      pattern: 'Most people think [common belief], but science shows...',
      value: 'By the end, you\'ll understand [specific knowledge] that less than 1% know',
      story: 'Let me take you through [number] discoveries that changed everything',
      surprise: 'The real application? You can use this to [unexpected benefit]'
    },
    entertainment: {
      pattern: 'What would you do if [relatable scenario]?',
      value: 'Watch as we [exciting action] with [interesting twist]',
      story: 'Starting with [small stake], escalating to [huge stake]',
      surprise: 'Plot twist: [unexpected revelation]'
    },
    tutorial: {
      pattern: 'Remember struggling with [common problem]?',
      value: 'Master [skill] in [timeframe] with this method',
      story: 'Step-by-step from beginner to [impressive result]',
      surprise: 'Secret technique pros use: [advanced tip]'
    }
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      <head>
        <title>PVSS Viral Framework - The Secret Structure Behind Every Viral Video</title>
        <meta name="description" content="Master the Pattern-Value-Story-Surprise framework used by top creators. Transform any content into viral-worthy videos with our proven structure." />
        <meta name="keywords" content="viral video framework, pvss method, youtube viral formula, content structure, viral content creation" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-violet-950/40 via-[#030303] to-violet-950/20 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/30">
              <Award className="w-4 h-4 mr-1" />
              Used in 10M+ View Videos
            </Badge>

            <h1 className="font-display text-5xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-cyan-400 to-orange-400 bg-clip-text text-transparent">
              The PVSS Framework: Your Blueprint for Viral Videos
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              <span className="font-semibold text-white">Pattern-Value-Story-Surprise</span> -
              The four-phase structure that hooks viewers instantly and keeps them watching until the very end.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
                  Apply PVSS to Your Content
                  <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/[0.06] hover:bg-white/[0.06] text-white">
                See Real Examples
                <Play className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span>3x Higher Virality</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4 text-violet-400" />
                <span>Psychology-Based</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Framework Breakdown */}
      <section className="py-20 bg-[#030303]">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-white">
            Master Each Phase of PVSS
          </h2>

          <div className="grid lg:grid-cols-4 gap-6">
            {Object.entries(frameworkPhases).map(([key, phase], idx) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all bg-white/[0.04] border-white/5 ${
                  activePhase === key
                    ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-105'
                    : 'hover:shadow-md hover:border-white/[0.06]'
                }`}
                onClick={() => setActivePhase(key)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                      {phase.icon}
                    </div>
                    <Badge variant="outline" className="border-white/[0.06] text-gray-300">Phase {idx + 1}</Badge>
                  </div>
                  <CardTitle className="text-lg text-white">{phase.title}</CardTitle>
                  <CardDescription className="text-gray-400">{phase.timing}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3 text-gray-300">{phase.description}</p>
                  <p className="text-xs italic text-gray-500">
                    {phase.example}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Phase Info */}
          <Card className="mt-8 bg-white/[0.04] border-violet-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-violet-400">{frameworkPhases[activePhase].icon}</span>
                {frameworkPhases[activePhase].title} - Deep Dive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-400">
                  {frameworkPhases[activePhase].description}
                </p>

                <div>
                  <h4 className="font-semibold mb-2 text-white">Implementation Tips:</h4>
                  <ul className="space-y-2">
                    {frameworkPhases[activePhase].tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-gray-300">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-violet-950/30 rounded-lg border border-violet-500/30">
                  <p className="text-sm font-medium mb-1 text-white">Example Usage:</p>
                  <p className="italic text-gray-400">{frameworkPhases[activePhase].example}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real World Examples */}
      <section className="py-20 bg-gradient-to-b from-[#030303] to-violet-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-center mb-4 text-white">
            PVSS in Action: Viral Video Breakdowns
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            See how top creators use PVSS to get millions of views
          </p>

          <div className="space-y-6">
            {viralExamples.map((example, idx) => (
              <Card key={idx} className="overflow-hidden bg-white/[0.04] border-white/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{example.video}</CardTitle>
                      <CardDescription className="text-gray-400">{example.channel}</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white">
                      {example.views} views
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-3 bg-violet-950/30 rounded-lg border border-violet-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-medium text-violet-400">Pattern</span>
                      </div>
                      <p className="text-sm text-gray-300">{example.pattern}</p>
                    </div>

                    <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-medium text-cyan-400">Value</span>
                      </div>
                      <p className="text-sm text-gray-300">{example.value}</p>
                    </div>

                    <div className="p-3 bg-orange-950/30 rounded-lg border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-medium text-orange-400">Story</span>
                      </div>
                      <p className="text-sm text-gray-300">{example.story}</p>
                    </div>

                    <div className="p-3 bg-yellow-950/30 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-400">Surprise</span>
                      </div>
                      <p className="text-sm text-gray-300">{example.surprise}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 bg-[#030303]">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-white">
            PVSS Templates for Your Niche
          </h2>

          <Tabs defaultValue="education" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-white/[0.06]">
              <TabsTrigger value="education" className="data-[state=active]:bg-violet-600">Education</TabsTrigger>
              <TabsTrigger value="entertainment" className="data-[state=active]:bg-violet-600">Entertainment</TabsTrigger>
              <TabsTrigger value="tutorial" className="data-[state=active]:bg-violet-600">Tutorial</TabsTrigger>
            </TabsList>

            {Object.entries(scriptTemplates).map(([key, template]) => (
              <TabsContent key={key} value={key} className="mt-8">
                <Card className="bg-white/[0.04] border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white">PVSS Template: {key.charAt(0).toUpperCase() + key.slice(1)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-violet-950/30 rounded-lg border border-violet-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-5 h-5 text-violet-400" />
                          <span className="font-medium text-violet-400">Pattern</span>
                        </div>
                        <p className="italic text-gray-300">{template.pattern}</p>
                      </div>

                      <div className="p-4 bg-cyan-950/30 rounded-lg border border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-cyan-400" />
                          <span className="font-medium text-cyan-400">Value</span>
                        </div>
                        <p className="italic text-gray-300">{template.value}</p>
                      </div>

                      <div className="p-4 bg-orange-950/30 rounded-lg border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-orange-400" />
                          <span className="font-medium text-orange-400">Story</span>
                        </div>
                        <p className="italic text-gray-300">{template.story}</p>
                      </div>

                      <div className="p-4 bg-yellow-950/30 rounded-lg border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                          <span className="font-medium text-yellow-400">Surprise</span>
                        </div>
                        <p className="italic text-gray-300">{template.surprise}</p>
                      </div>

                      <Link href="/signup">
                        <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
                          Use This Template
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-gradient-to-b from-[#030303] to-violet-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-white">
            PVSS Framework Results
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center bg-white/[0.04] border-white/5">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-violet-400">3x</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  More likely to go viral vs standard structure
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/[0.04] border-white/5">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-violet-400">
                  {socialProofData.metrics.averageRetention}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Average retention with PVSS structure
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/[0.04] border-white/5">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-violet-400">89%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Of viral videos follow PVSS pattern
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-violet-600 via-cyan-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-display text-4xl font-bold mb-6">
            Start Using The PVSS Framework Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Every script generated with GenScript automatically follows the PVSS framework for maximum virality.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Generate PVSS Script Now
                <Lightbulb className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              Download Framework Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
