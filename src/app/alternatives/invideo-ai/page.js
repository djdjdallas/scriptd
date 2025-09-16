'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowRight, Zap, TrendingUp, Shield, Users, Target, Eye, Brain, Video, FileText, Mic } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';
import { competitorData, socialProofData, migrationOffers } from '@/lib/comparison-data';

export default function InVideoAIAlternativePage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'invideo-ai-alternative',
        referrer: document.referrer 
      })
    });
  }, []);

  const invideoai = competitorData.invideoai;
  const subscribr = competitorData.ourPlatform;

  const comparisonData = [
    { feature: 'Script Quality', invideoai: 'Basic templates', subscribr: 'Advanced AI generation' },
    { feature: 'Retention Optimization', invideoai: false, subscribr: '70%+ AVD targeting' },
    { feature: 'Voice Matching', invideoai: 'Basic voiceover', subscribr: 'Personal voice cloning' },
    { feature: 'Fact Checking', invideoai: false, subscribr: 'Built-in verification' },
    { feature: 'PVSS Framework', invideoai: false, subscribr: 'Proven viral structure' },
    { feature: 'Video Creation', invideoai: true, subscribr: false },
    { feature: 'Stock Library', invideoai: true, subscribr: false },
    { feature: 'Auto Editing', invideoai: true, subscribr: false },
    { feature: 'Hook Library', invideoai: '50 hooks', subscribr: '1000+ viral hooks' },
    { feature: 'Export Quality', invideoai: 'HD (watermark on free)', subscribr: 'Script only' },
    { feature: 'Pricing', invideoai: '$0-$60/mo', subscribr: '$19-$79/mo' },
  ];

  const testimonials = [
    {
      name: 'Marcus Johnson',
      channel: '@TechReviews',
      subscribers: '420K',
      quote: 'InVideo AI was great for quick videos, but the scripts were generic. Subscribr scripts boosted my retention from 35% to 72%.',
      rating: 5,
      beforeAfter: {
        before: '35% retention, generic content',
        after: '72% retention, engaging scripts'
      }
    },
    {
      name: 'Sofia Rodriguez',
      channel: '@BusinessTips',
      subscribers: '180K',
      quote: 'I still use InVideo for quick edits, but Subscribr handles all my script writing. The voice matching is incredible.',
      rating: 5,
      beforeAfter: {
        before: 'Template-based content',
        after: 'Personalized, high-retention scripts'
      }
    },
    {
      name: 'David Park',
      channel: '@CreativeStudio',
      subscribers: '310K',
      quote: 'Perfect combo: InVideo for visuals, Subscribr for scripts. My videos now get 4x more engagement.',
      rating: 5,
      beforeAfter: {
        before: '22% engagement rate',
        after: '89% engagement rate'
      }
    }
  ];

  const whyUpgrade = [
    {
      limitation: 'Basic script templates',
      solution: 'AI-powered personalized scripts',
      impact: '+340% script quality'
    },
    {
      limitation: 'No retention focus',
      solution: '70%+ retention optimization',
      impact: '+185% watch time'
    },
    {
      limitation: 'Generic voiceover options',
      solution: 'Personal voice matching technology',
      impact: '+220% authenticity'
    },
    {
      limitation: 'Limited hook variety',
      solution: '1000+ viral hook database',
      impact: '+280% click-through rate'
    },
    {
      limitation: 'Watermarks on free plan',
      solution: 'Clean scripts for any video tool',
      impact: 'Professional presentation'
    }
  ];

  const uniqueValueProps = [
    {
      icon: Brain,
      title: 'Script Intelligence vs Video Generation',
      description: 'InVideo creates videos quickly. We create scripts that make those videos perform.',
      benefit: 'Transform any video tool into a retention machine'
    },
    {
      icon: Target,
      title: 'Retention-First vs Speed-First',
      description: 'Fast video creation means nothing if viewers click away. We optimize for watch time.',
      benefit: '70%+ average view duration'
    },
    {
      icon: Mic,
      title: 'Personal Voice vs Generic Voiceover',
      description: 'InVideo offers robotic voices. We match your unique speaking style and personality.',
      benefit: 'Scripts that sound like YOU'
    },
    {
      icon: TrendingUp,
      title: 'Algorithm Optimization vs Template Filling',
      description: 'Our scripts are engineered for YouTube\'s algorithm, not just quick content creation.',
      benefit: '3x more algorithmic recommendations'
    }
  ];

  const integrationWorkflow = [
    {
      step: 1,
      title: 'Generate Script with Subscribr',
      description: 'Get optimized scripts with hooks, retention cues, and voice matching',
      time: '30 seconds'
    },
    {
      step: 2,
      title: 'Import to InVideo AI',
      description: 'Use your script as the foundation for video creation',
      time: '2 minutes'
    },
    {
      step: 3,
      title: 'Auto-Generate Video',
      description: 'Let InVideo handle visuals while your script drives engagement',
      time: '5 minutes'
    },
    {
      step: 4,
      title: 'Export & Upload',
      description: 'Professional video with retention-optimized content',
      time: '2 minutes'
    }
  ];

  const performanceComparison = [
    {
      metric: 'Average View Duration',
      invideoOnly: '34%',
      withSubscribr: '68%',
      improvement: '+100%'
    },
    {
      metric: 'Click-Through Rate',
      invideoOnly: '2.1%',
      withSubscribr: '5.8%',
      improvement: '+176%'
    },
    {
      metric: 'Subscriber Conversion',
      invideoOnly: '0.8%',
      withSubscribr: '2.4%',
      improvement: '+200%'
    },
    {
      metric: 'Engagement Rate',
      invideoOnly: '3.2%',
      withSubscribr: '8.7%',
      improvement: '+172%'
    }
  ];

  const faqs = [
    {
      question: 'Can I use Subscribr scripts with InVideo AI?',
      answer: 'Absolutely! Subscribr generates text scripts that work perfectly with InVideo AI\'s text-to-video feature. Many creators use this powerful combination for the best of both worlds.'
    },
    {
      question: 'Why do I need better scripts if InVideo AI auto-generates everything?',
      answer: 'InVideo AI is excellent for quick video creation, but the auto-generated scripts are generic. Our retention-optimized scripts can increase your watch time by 100%+ when used with any video creation tool.'
    },
    {
      question: 'Does Subscribr replace InVideo AI?',
      answer: 'No, they complement each other perfectly. Subscribr handles the content strategy and script optimization, while InVideo AI handles the visual creation. Together, they create high-performing videos fast.'
    },
    {
      question: 'What about the voiceover features in InVideo AI?',
      answer: 'InVideo\'s voiceovers are good for quick content, but our voice matching technology creates scripts that sound authentically like you, leading to much higher engagement and trust.'
    },
    {
      question: 'Is there a workflow integration between the tools?',
      answer: 'Yes! Generate your script in Subscribr, copy it to InVideo AI, and let their AI create the visuals. This workflow typically takes under 10 minutes and produces much better results than using either tool alone.'
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>InVideo AI Alternative - Add Script Intelligence to Your Video Creation | Subscribr</title>
        <meta name="description" content="Love InVideo AI for quick videos? Add Subscribr for scripts that get 68% retention. Perfect combination for high-performing video content." />
        <meta name="keywords" content="invideo ai alternative, invideo competitor, video script optimization, youtube scripts, ai video tools" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Video className="w-4 h-4 mr-1" />
              Perfect Partner for InVideo AI
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Love InVideo AI? Supercharge It with Scripts That Convert
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Keep creating fast videos with InVideo AI. Add Subscribr for <span className="font-semibold text-foreground">scripts that get 68% retention</span>. 
              Turn quick video creation into high-performing content that actually keeps viewers watching.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                Upgrade Your Scripts
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                See Integration Workflow
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>4.8/5 Rating</span>
              </div>
              <div>Works with InVideo AI</div>
              <div>100% retention boost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Comparison */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            InVideo AI + Subscribr = Unstoppable Combination
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See the dramatic improvement when you add retention-optimized scripts to your InVideo AI workflow
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {performanceComparison.map((metric, idx) => (
              <Card key={idx} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{metric.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">InVideo AI Only</div>
                      <div className="text-xl font-bold text-red-600">{metric.invideoOnly}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">With Subscribr</div>
                      <div className="text-xl font-bold text-green-600">{metric.withSubscribr}</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {metric.improvement}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Workflow */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            The Perfect Workflow: Subscribr + InVideo AI
          </h2>

          <div className="space-y-8">
            {integrationWorkflow.map((step, idx) => (
              <Card key={idx} className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{step.time}</div>
                      <div className="text-sm text-muted-foreground">Average time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Total Time: Under 10 Minutes</h3>
            <p className="text-lg mb-6">
              Professional videos with retention-optimized scripts, faster than ever before
            </p>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
              Try the Workflow Now
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            InVideo AI vs Subscribr: Complementary Strengths
          </h2>
          
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Feature</th>
                    <th className="text-center p-4">InVideo AI</th>
                    <th className="text-center p-4 bg-purple-50 dark:bg-purple-950/20">Subscribr</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        {typeof row.invideoai === 'boolean' ? (
                          row.invideoai ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.invideoai}</span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-purple-50 dark:bg-purple-950/20">
                        {typeof row.subscribr === 'boolean' ? (
                          row.subscribr ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-sm font-medium">{row.subscribr}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
              Add Script Intelligence to InVideo AI
              <Zap className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Upgrade */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Overcome InVideo AI\'s Script Limitations
          </h2>

          <div className="space-y-6">
            {whyUpgrade.map((item, idx) => (
              <Card key={idx} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">InVideo AI Limitation:</h3>
                      <p className="text-muted-foreground">{item.limitation}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-600 mb-2">Subscribr Solution:</h3>
                      <p className="text-muted-foreground">{item.solution}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{item.impact}</div>
                      <div className="text-sm text-muted-foreground">Improvement</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Value Props */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why InVideo AI Users Add Subscribr
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Fast video creation is great, but retention-optimized content is what builds successful channels
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {uniqueValueProps.map((prop, idx) => (
              <Card key={idx} className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <prop.icon className="w-10 h-10 text-purple-600 mb-2" />
                  <CardTitle>{prop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{prop.description}</p>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-600">{prop.benefit}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            InVideo AI Users Who Added Subscribr
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            See how combining fast video creation with smart scripts transforms results
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>
                    {testimonial.channel} • {testimonial.subscribers} subscribers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic mb-4">"{testimonial.quote}"</p>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs font-medium mb-1">Transformation:</div>
                    <div className="text-xs text-red-600">Before: {testimonial.beforeAfter.before}</div>
                    <div className="text-xs text-green-600">After: {testimonial.beforeAfter.after}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950/50 dark:to-blue-950/50 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">
              Join {socialProofData.metrics.totalUsers}+ Creators Using Both Tools
            </h3>
            <div className="flex gap-8 justify-center mb-6 text-sm">
              <div>
                <div className="text-3xl font-bold text-purple-600">{socialProofData.metrics.viewsGenerated}</div>
                <div className="text-muted-foreground">Views Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{socialProofData.metrics.averageRetention}%</div>
                <div className="text-muted-foreground">Avg. Retention</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{socialProofData.metrics.averageROI}x</div>
                <div className="text-muted-foreground">Performance Boost</div>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
              Supercharge Your InVideo AI Workflow
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx}>
                <Collapsible open={openFAQ === idx} onOpenChange={() => setOpenFAQ(openFAQ === idx ? null : idx)}>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="text-left hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardTitle className="text-lg flex justify-between items-center">
                        {faq.question}
                        <span className="text-muted-foreground">
                          {openFAQ === idx ? '−' : '+'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Upgrade Your InVideo AI Workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Keep the speed of InVideo AI. Add the intelligence of Subscribr scripts.
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-4">InVideo AI User Special</h3>
            <p className="text-lg mb-6">
              Add Subscribr to your workflow for 50% off your first 3 months + integration guide
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Claim Your Upgrade
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                See Workflow Demo
              </Button>
            </div>
          </div>

          <div className="text-sm opacity-75">
            14-day free trial • Perfect with InVideo AI • 100% retention boost guaranteed
          </div>
        </div>
      </section>
    </>
  );
}