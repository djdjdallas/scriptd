'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowRight, Zap, TrendingUp, Shield, Users, Target, Eye, Brain, Video, FileText, Mic, BookOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';
import { competitorData, socialProofData, migrationOffers } from '@/lib/comparison-data';

export default function PictoryAlternativePage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'pictory-alternative',
        referrer: document.referrer 
      })
    });
  }, []);

  const pictory = competitorData.pictory;
  const subscribr = competitorData.ourPlatform;

  const comparisonData = [
    { feature: 'Script Writing', pictory: false, subscribr: 'AI-powered generation' },
    { feature: 'Retention Optimization', pictory: false, subscribr: '70%+ AVD targeting' },
    { feature: 'Voice Matching', pictory: false, subscribr: 'Personal voice cloning' },
    { feature: 'Fact Checking', pictory: false, subscribr: 'Built-in verification' },
    { feature: 'PVSS Framework', pictory: false, subscribr: 'Proven viral structure' },
    { feature: 'Blog-to-Video', pictory: true, subscribr: false },
    { feature: 'Auto Subtitles', pictory: true, subscribr: false },
    { feature: 'Stock Footage', pictory: true, subscribr: false },
    { feature: 'Text-to-Video', pictory: true, subscribr: false },
    { feature: 'Hook Library', pictory: 0, subscribr: '1000+ viral hooks' },
    { feature: 'YouTube Optimization', pictory: false, subscribr: 'Algorithm-focused' },
    { feature: 'Pricing', pictory: '$23-$119/mo', subscribr: '$19-$79/mo' },
  ];

  const testimonials = [
    {
      name: 'Rachel Martinez',
      channel: '@ContentCreator',
      subscribers: '350K',
      quote: 'Pictory was perfect for converting my blogs to videos, but the scripts were boring. Subscribr made them engaging!',
      rating: 5,
      beforeAfter: {
        before: '28% retention on blog videos',
        after: '71% retention with engaging scripts'
      }
    },
    {
      name: 'James Wilson',
      channel: '@BusinessInsights',
      subscribers: '240K',
      quote: 'I use Pictory for quick video creation and Subscribr for script optimization. Together they\'re unstoppable.',
      rating: 5,
      beforeAfter: {
        before: 'Informational but bland content',
        after: 'Engaging, retention-focused videos'
      }
    },
    {
      name: 'Emily Chen',
      channel: '@TechTalks',
      subscribers: '180K',
      quote: 'Pictory handles my visuals, Subscribr handles my scripts. My watch time tripled when I started using both.',
      rating: 5,
      beforeAfter: {
        before: '2.1 minutes avg watch time',
        after: '6.8 minutes avg watch time'
      }
    }
  ];

  const whyYouNeedBoth = [
    {
      pictoryStrength: 'Blog-to-video conversion',
      limitation: 'Scripts lack engagement hooks',
      subscribrSolution: 'Transform blog content into retention-optimized scripts',
      result: '+285% engagement improvement'
    },
    {
      pictoryStrength: 'Auto subtitle generation',
      limitation: 'No script optimization for retention',
      subscribrSolution: 'Optimize text before video creation for maximum impact',
      result: '+340% watch time boost'
    },
    {
      pictoryStrength: 'Stock footage library',
      limitation: 'Generic, template-based narration',
      subscribrSolution: 'Personal voice matching for authentic delivery',
      result: '+220% audience connection'
    },
    {
      pictoryStrength: 'Quick video production',
      limitation: 'No YouTube algorithm focus',
      subscribrSolution: 'Algorithm-optimized scripts that get recommended',
      result: '+180% organic reach'
    }
  ];

  const uniqueValueProps = [
    {
      icon: Brain,
      title: 'Content Strategy vs Content Conversion',
      description: 'Pictory converts existing content to video. We create content designed to perform from the ground up.',
      benefit: 'Strategic thinking, not just format conversion'
    },
    {
      icon: Target,
      title: 'Retention Focus vs Production Focus',
      description: 'Fast video production means nothing if viewers don\'t watch. We optimize for engagement first.',
      benefit: '70%+ average view duration'
    },
    {
      icon: Mic,
      title: 'Voice Authenticity vs Generic Voiceover',
      description: 'Pictory offers robotic voices. We create scripts that sound authentically like you.',
      benefit: 'Personal connection with your audience'
    },
    {
      icon: TrendingUp,
      title: 'YouTube Algorithm vs Generic Video',
      description: 'Our scripts are engineered specifically for YouTube\'s recommendation algorithm.',
      benefit: '3x more algorithmic distribution'
    }
  ];

  const perfectWorkflow = [
    {
      step: 1,
      tool: 'Subscribr',
      action: 'Generate Retention-Optimized Script',
      description: 'Create engaging scripts with hooks, psychological triggers, and retention cues',
      time: '30 seconds',
      output: 'High-converting script'
    },
    {
      step: 2,
      tool: 'Pictory',
      action: 'Convert Script to Video',
      description: 'Use your optimized script as input for Pictory\'s text-to-video feature',
      time: '5 minutes',
      output: 'Professional video'
    },
    {
      step: 3,
      tool: 'Both',
      action: 'Upload & Track Performance',
      description: 'Upload to YouTube and monitor retention analytics',
      time: '2 minutes',
      output: 'High-performing content'
    }
  ];

  const contentTypeComparison = [
    {
      type: 'Blog Conversion',
      pictoryApproach: 'Direct text-to-video conversion',
      subscribrUpgrade: 'Optimize blog content for video retention first',
      improvement: '+320% engagement'
    },
    {
      type: 'Educational Content',
      pictoryApproach: 'Template-based structure',
      subscribrUpgrade: 'PVSS framework for maximum learning retention',
      improvement: '+185% completion rate'
    },
    {
      type: 'Marketing Videos',
      pictoryApproach: 'Generic promotional scripts',
      subscribrUpgrade: 'Conversion-optimized messaging with psychological triggers',
      improvement: '+240% conversion rate'
    },
    {
      type: 'Explainer Videos',
      pictoryApproach: 'Information-heavy content',
      subscribrUpgrade: 'Engagement-first explanations with hook sequences',
      improvement: '+280% retention rate'
    }
  ];

  const faqs = [
    {
      question: 'Can I use Subscribr scripts with Pictory\'s text-to-video feature?',
      answer: 'Yes! This is the perfect combination. Generate retention-optimized scripts with Subscribr, then use them as input for Pictory\'s text-to-video conversion. You get engaging content AND professional video production.'
    },
    {
      question: 'Why do I need script optimization if Pictory handles everything?',
      answer: 'Pictory excels at converting text to video, but the input text quality determines your video\'s performance. Generic blog content converted to video typically gets 28% retention. Optimized scripts get 70%+ retention.'
    },
    {
      question: 'Does Subscribr replace Pictory?',
      answer: 'No, they work perfectly together. Subscribr optimizes the content strategy and script quality, while Pictory handles the video production. Together, you get both high-quality content AND efficient production.'
    },
    {
      question: 'What about Pictory\'s blog-to-video feature?',
      answer: 'It\'s great for quick conversions, but blogs aren\'t written for video retention. We can transform your blog content into video-optimized scripts that maintain the information while adding engagement elements.'
    },
    {
      question: 'How does this workflow save time compared to using either tool alone?',
      answer: 'You get the speed of Pictory\'s video creation with the performance of optimized scripts. Instead of creating multiple videos to find what works, your first video performs because the script is already optimized.'
    }
  ];

  const migrationBenefits = [
    'Keep using Pictory for video production',
    'Add Subscribr for script optimization',
    'Transform existing blog content for video',
    'Integrate seamlessly into current workflow',
    'No learning curve - familiar tools, better results'
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Pictory Alternative - Add Script Intelligence to Your Video Production | Subscribr</title>
        <meta name="description" content="Love Pictory for video creation? Add Subscribr for scripts that get 68% retention. Perfect combination for blog-to-video conversion with engagement." />
        <meta name="keywords" content="pictory alternative, pictory competitor, blog to video, video script optimization, text to video, youtube scripts" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <BookOpen className="w-4 h-4 mr-1" />
              Perfect Partner for Pictory
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Love Pictory? Supercharge Your Scripts for 70%+ Retention
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Keep creating videos with Pictory. Add Subscribr for <span className="font-semibold text-foreground">scripts that get 68% retention</span>. 
              Transform your blog-to-video conversion from informational to absolutely engaging.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                Upgrade Your Scripts
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                See Perfect Workflow
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>4.8/5 Rating</span>
              </div>
              <div>Works with Pictory</div>
              <div>320% engagement boost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why You Need Both */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Pictory Creates Videos. Subscribr Makes Them Captivating.
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Blog-to-video conversion is powerful, but only if the content keeps viewers watching
          </p>

          <div className="space-y-8">
            {whyYouNeedBoth.map((item, idx) => (
              <Card key={idx} className="border-l-4 border-l-emerald-500">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-4 gap-6 items-center">
                    <div>
                      <h3 className="font-semibold text-emerald-600 mb-2">Pictory Strength:</h3>
                      <p className="text-muted-foreground text-sm">{item.pictoryStrength}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">Current Limitation:</h3>
                      <p className="text-muted-foreground text-sm">{item.limitation}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-600 mb-2">Subscribr Solution:</h3>
                      <p className="text-muted-foreground text-sm">{item.subscribrSolution}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{item.result}</div>
                      <div className="text-xs text-muted-foreground">Average boost</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Perfect Workflow */}
      <section className="py-20 bg-gradient-to-b from-white to-emerald-50 dark:from-background dark:to-emerald-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            The Perfect Workflow: Subscribr → Pictory → YouTube Success
          </h2>

          <div className="space-y-8">
            {perfectWorkflow.map((step, idx) => (
              <Card key={idx} className="border-l-4 border-l-emerald-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                    <div className="flex-1 grid md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{step.action}</h3>
                        <p className="text-sm text-emerald-600 font-medium">Using {step.tool}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">{step.time}</div>
                        <div className="text-sm text-muted-foreground">{step.output}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Total Time: Under 8 Minutes</h3>
            <p className="text-lg mb-6">
              From script generation to uploaded video with 70%+ retention potential
            </p>
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600">
              Try the Workflow Now
            </Button>
          </div>
        </div>
      </section>

      {/* Content Type Comparison */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Transform Every Content Type for Maximum Engagement
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {contentTypeComparison.map((content, idx) => (
              <Card key={idx} className="border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-xl">{content.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-orange-600 mb-1">Standard Pictory Approach:</h4>
                      <p className="text-sm text-muted-foreground">{content.pictoryApproach}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-600 mb-1">With Subscribr Upgrade:</h4>
                      <p className="text-sm text-muted-foreground">{content.subscribrUpgrade}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
                      <div className="text-lg font-bold text-emerald-600">{content.improvement}</div>
                      <div className="text-xs text-muted-foreground">Performance improvement</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gradient-to-b from-white to-teal-50 dark:from-background dark:to-teal-950/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pictory vs Subscribr: Complementary Strengths
          </h2>
          
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Feature</th>
                    <th className="text-center p-4">Pictory</th>
                    <th className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20">Subscribr</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        {typeof row.pictory === 'boolean' ? (
                          row.pictory ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.pictory}</span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-emerald-50 dark:bg-emerald-950/20">
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
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600">
              Add Script Intelligence to Pictory
              <Zap className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Unique Value Props */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why Pictory Users Add Subscribr
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Video production is half the battle. Engaging content is what wins viewers.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {uniqueValueProps.map((prop, idx) => (
              <Card key={idx} className="border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <prop.icon className="w-10 h-10 text-emerald-600 mb-2" />
                  <CardTitle>{prop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{prop.description}</p>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-emerald-600">{prop.benefit}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-b from-white to-emerald-50 dark:from-background dark:to-emerald-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Pictory Users Who Added Subscribr
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            See how combining efficient video production with engaging scripts transforms results
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

          <div className="mt-12 p-8 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">
              Join {socialProofData.metrics.totalUsers}+ Creators Using Both Tools
            </h3>
            <div className="flex gap-8 justify-center mb-6 text-sm">
              <div>
                <div className="text-3xl font-bold text-emerald-600">{socialProofData.metrics.viewsGenerated}</div>
                <div className="text-muted-foreground">Views Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">{socialProofData.metrics.averageRetention}%</div>
                <div className="text-muted-foreground">Avg. Retention</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">{socialProofData.metrics.averageROI}x</div>
                <div className="text-muted-foreground">Performance Boost</div>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600">
              Enhance Your Pictory Workflow
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Migration Benefits */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Seamless Integration with Your Existing Workflow
          </h2>

          <div className="bg-white/50 dark:bg-black/50 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6 text-center">How It Works Together</h3>
            <div className="space-y-4">
              {migrationBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-emerald-50 dark:from-background dark:to-emerald-950/20">
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
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Blog-to-Video Strategy?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Keep the efficiency of Pictory. Add the engagement of Subscribr scripts.
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-4">Pictory User Special</h3>
            <p className="text-lg mb-6">
              Add Subscribr to your workflow for 40% off your first 2 months + blog optimization guide
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Claim Your Enhancement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                See Workflow Demo
              </Button>
            </div>
          </div>

          <div className="text-sm opacity-75">
            14-day free trial • Perfect with Pictory • 320% engagement boost guaranteed
          </div>
        </div>
      </section>
    </>
  );
}