'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowRight, TrendingUp, BarChart3, Target, Clock,
  AlertTriangle, CheckCircle2, Play, Pause, FastForward,
  Activity, Eye, Users, Zap
} from 'lucide-react';
import { socialProofData } from '@/lib/comparison-data';

export default function RetentionOptimizerPage() {
  const [currentRetention, setCurrentRetention] = useState([35]);
  const [optimizedRetention, setOptimizedRetention] = useState(68);
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'retention-optimizer',
        referrer: document.referrer 
      })
    });
    
    // Calculate optimized retention based on current
    setOptimizedRetention(Math.min(currentRetention[0] * 2, 85));
  }, [currentRetention]);

  const retentionCurveData = [
    { time: '0:00', standard: 100, optimized: 100, section: 'intro' },
    { time: '0:15', standard: 65, optimized: 92, section: 'intro' },
    { time: '0:30', standard: 45, optimized: 85, section: 'hook' },
    { time: '1:00', standard: 38, optimized: 78, section: 'context' },
    { time: '2:00', standard: 35, optimized: 72, section: 'main' },
    { time: '3:00', standard: 33, optimized: 70, section: 'main' },
    { time: '5:00', standard: 30, optimized: 68, section: 'main' },
    { time: '7:00', standard: 28, optimized: 65, section: 'climax' },
    { time: '9:00', standard: 25, optimized: 63, section: 'outro' },
    { time: '10:00', standard: 20, optimized: 60, section: 'outro' }
  ];

  const optimizationTechniques = [
    {
      name: 'Pattern Interrupt',
      timing: 'Every 30-45 seconds',
      impact: '+15% retention',
      description: 'Break viewer patterns with visual or audio changes'
    },
    {
      name: 'Open Loops',
      timing: 'Intro & throughout',
      impact: '+20% retention',
      description: 'Create curiosity gaps that demand closure'
    },
    {
      name: 'Micro-Commitments',
      timing: 'Every 60 seconds',
      impact: '+12% retention',
      description: 'Small viewer investments that build engagement'
    },
    {
      name: 'Visual Anchoring',
      timing: 'Key moments',
      impact: '+18% retention',
      description: 'Visual cues that reinforce important points'
    }
  ];

  const scriptSections = {
    intro: {
      label: 'Power Intro (0-15s)',
      standard: 'Hi everyone, welcome back to my channel...',
      optimized: 'This changes everything. In 10 seconds, you\'ll know why [topic] matters...',
      retention: { standard: 65, optimized: 92 }
    },
    hook: {
      label: 'Viral Hook (15-30s)',
      standard: 'Today we\'re going to talk about...',
      optimized: 'But first, let me show you the $10,000 mistake that 90% of people make...',
      retention: { standard: 45, optimized: 85 }
    },
    context: {
      label: 'Context Building (30s-2m)',
      standard: 'So basically, this is about...',
      optimized: 'Here\'s what nobody tells you: [shocking fact]. And by the end, you\'ll have...',
      retention: { standard: 38, optimized: 78 }
    },
    main: {
      label: 'Main Content (2-7m)',
      standard: 'Let me explain how this works...',
      optimized: 'Step 1 will blow your mind. But wait until you see step 3...',
      retention: { standard: 30, optimized: 68 }
    },
    outro: {
      label: 'Strong Close (7-10m)',
      standard: 'Thanks for watching, please subscribe...',
      optimized: 'The secret I mentioned earlier? Here it is... Plus one final bonus...',
      retention: { standard: 20, optimized: 60 }
    }
  };

  return (
    <>
      <head>
        <title>YouTube Retention Optimizer - Keep Viewers Watching Until The End</title>
        <meta name="description" content="Transform your scripts for 68%+ retention. AI-powered optimization that keeps viewers glued to your videos. Used by top creators." />
        <meta name="keywords" content="youtube retention, average view duration, retention optimization, viewer retention, watch time" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Activity className="w-4 h-4 mr-1" />
              {socialProofData.metrics.averageRetention}%+ Average Retention
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Turn 30% Retention Into 68%+ With AI Optimization
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Our retention optimizer analyzes your scripts and transforms them using 
              <span className="font-semibold text-foreground"> psychological triggers</span> that keep viewers watching 
              until the very last second.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600">
                Optimize Your Script Now
                <TrendingUp className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                See Before & After
                <BarChart3 className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Retention Curve */}
      <section className="py-20 bg-white dark:bg-background border-y">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Your Retention Transformation
          </h2>
          
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Current vs Optimized Retention</CardTitle>
              <CardDescription>
                Adjust your current retention to see potential improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Your Current Retention</span>
                    <span className="font-bold">{currentRetention[0]}%</span>
                  </div>
                  <Slider
                    value={currentRetention}
                    onValueChange={setCurrentRetention}
                    min={20}
                    max={60}
                    step={5}
                    className="mb-6"
                  />
                </div>
                
                <div className="relative h-64 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background rounded-lg p-4">
                  <div className="absolute inset-0 p-4">
                    {/* Simplified retention curve visualization */}
                    <div className="relative h-full">
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                        {retentionCurveData.map(point => (
                          <span key={point.time}>{point.time}</span>
                        ))}
                      </div>
                      
                      <svg className="absolute inset-0 w-full h-full">
                        {/* Standard retention curve */}
                        <polyline
                          points={retentionCurveData.map((point, i) => 
                            `${i * 10}%,${100 - (point.standard * currentRetention[0] / 35)}%`
                          ).join(' ')}
                          fill="none"
                          stroke="rgb(239, 68, 68)"
                          strokeWidth="2"
                          opacity="0.5"
                        />
                        
                        {/* Optimized retention curve */}
                        <polyline
                          points={retentionCurveData.map((point, i) => 
                            `${i * 10}%,${100 - point.optimized}%`
                          ).join(' ')}
                          fill="none"
                          stroke="rgb(34, 197, 94)"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{currentRetention[0]}%</div>
                    <p className="text-sm text-muted-foreground">Current Retention</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{optimizedRetention}%</div>
                    <p className="text-sm text-muted-foreground">After Optimization</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Improvement</span>
                    <span className="text-2xl font-bold text-green-600">
                      +{optimizedRetention - currentRetention[0]}% AVD
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    That's {Math.round((optimizedRetention - currentRetention[0]) / currentRetention[0] * 100)}% better retention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Script Optimization Examples */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50 dark:from-background dark:to-green-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            See The Optimization In Action
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Real examples of how we transform standard scripts into retention magnets
          </p>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {Object.entries(scriptSections).map(([key, section]) => (
              <Card 
                key={key}
                className={activeSection === key ? 'border-green-500 shadow-lg' : ''}
                onClick={() => setActiveSection(key)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{section.label}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-950/20">
                        Before: {section.retention.standard}%
                      </Badge>
                      <Badge className="bg-green-600 text-white">
                        After: {section.retention.optimized}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium">Standard Script</span>
                      </div>
                      <p className="text-sm italic text-muted-foreground">
                        "{section.standard}"
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Optimized Script</span>
                      </div>
                      <p className="text-sm italic">
                        "{section.optimized}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Optimization Techniques */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Advanced Retention Techniques We Use
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {optimizationTechniques.map((technique, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{technique.name}</CardTitle>
                  <Badge variant="secondary">{technique.impact}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {technique.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{technique.timing}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50 dark:from-background dark:to-green-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Better Retention Means For You
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Eye className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <CardTitle>More Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">3.5x</div>
                <p className="text-sm text-muted-foreground">
                  Algorithm boost from higher retention
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <CardTitle>More Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">2.8x</div>
                <p className="text-sm text-muted-foreground">
                  Viewer-to-subscriber conversion
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Target className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <CardTitle>More Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">4.2x</div>
                <p className="text-sm text-muted-foreground">
                  RPM increase from watch time
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Stop Losing Viewers. Start Keeping Them.
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Transform any script into a retention masterpiece with our AI optimizer.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Optimize Your First Script Free
              <Zap className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}