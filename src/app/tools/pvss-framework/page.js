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
    <>
      <head>
        <title>PVSS Viral Framework - The Secret Structure Behind Every Viral Video</title>
        <meta name="description" content="Master the Pattern-Value-Story-Surprise framework used by top creators. Transform any content into viral-worthy videos with our proven structure." />
        <meta name="keywords" content="viral video framework, pvss method, youtube viral formula, content structure, viral content creation" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-50 via-pink-50 to-white dark:from-purple-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Award className="w-4 h-4 mr-1" />
              Used in 10M+ View Videos
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              The PVSS Framework: Your Blueprint for Viral Videos
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              <span className="font-semibold text-foreground">Pattern-Value-Story-Surprise</span> - 
              The four-phase structure that hooks viewers instantly and keeps them watching until the very end.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Apply PVSS to Your Content
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                See Real Examples
                <Play className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>3x Higher Virality</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span>Psychology-Based</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Framework Breakdown */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Master Each Phase of PVSS
          </h2>
          
          <div className="grid lg:grid-cols-4 gap-6">
            {Object.entries(frameworkPhases).map(([key, phase], idx) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all ${
                  activePhase === key 
                    ? 'border-purple-500 shadow-lg scale-105' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setActivePhase(key)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      {phase.icon}
                    </div>
                    <Badge variant="outline">Phase {idx + 1}</Badge>
                  </div>
                  <CardTitle className="text-lg">{phase.title}</CardTitle>
                  <CardDescription>{phase.timing}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{phase.description}</p>
                  <p className="text-xs italic text-muted-foreground">
                    {phase.example}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Detailed Phase Info */}
          <Card className="mt-8 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {frameworkPhases[activePhase].icon}
                {frameworkPhases[activePhase].title} - Deep Dive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {frameworkPhases[activePhase].description}
                </p>
                
                <div>
                  <h4 className="font-semibold mb-2">Implementation Tips:</h4>
                  <ul className="space-y-2">
                    {frameworkPhases[activePhase].tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-sm font-medium mb-1">Example Usage:</p>
                  <p className="italic">{frameworkPhases[activePhase].example}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real World Examples */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            PVSS in Action: Viral Video Breakdowns
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See how top creators use PVSS to get millions of views
          </p>
          
          <div className="space-y-6">
            {viralExamples.map((example, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{example.video}</CardTitle>
                      <CardDescription>{example.channel}</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {example.views} views
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium">Pattern</span>
                      </div>
                      <p className="text-sm">{example.pattern}</p>
                    </div>
                    
                    <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-pink-600" />
                        <span className="text-xs font-medium">Value</span>
                      </div>
                      <p className="text-sm">{example.value}</p>
                    </div>
                    
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium">Story</span>
                      </div>
                      <p className="text-sm">{example.story}</p>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium">Surprise</span>
                      </div>
                      <p className="text-sm">{example.surprise}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            PVSS Templates for Your Niche
          </h2>
          
          <Tabs defaultValue="education" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
              <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
            </TabsList>
            
            {Object.entries(scriptTemplates).map(([key, template]) => (
              <TabsContent key={key} value={key} className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>PVSS Template: {key.charAt(0).toUpperCase() + key.slice(1)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Pattern</span>
                        </div>
                        <p className="italic">{template.pattern}</p>
                      </div>
                      
                      <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-pink-600" />
                          <span className="font-medium">Value</span>
                        </div>
                        <p className="italic">{template.value}</p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-orange-600" />
                          <span className="font-medium">Story</span>
                        </div>
                        <p className="italic">{template.story}</p>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-yellow-600" />
                          <span className="font-medium">Surprise</span>
                        </div>
                        <p className="italic">{template.surprise}</p>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                        Use This Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            PVSS Framework Results
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-purple-600">3x</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  More likely to go viral vs standard structure
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-purple-600">
                  {socialProofData.metrics.averageRetention}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Average retention with PVSS structure
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-purple-600">89%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Of viral videos follow PVSS pattern
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Start Using The PVSS Framework Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Every script generated with Subscribr automatically follows the PVSS framework for maximum virality.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Generate PVSS Script Now
              <Lightbulb className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              Download Framework Guide
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}