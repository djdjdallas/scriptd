'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowRight, Zap, TrendingUp, Shield, Users, Target, Eye, Brain, MessageSquare } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';
import { competitorData, socialProofData, migrationOffers } from '@/lib/comparison-data';

export default function SimplifiedAlternativePage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'simplified-alternative',
        referrer: document.referrer 
      })
    });
  }, []);

  const simplified = competitorData.simplified;
  const subscribr = competitorData.ourPlatform;
  const migrationOffer = migrationOffers.simplified || migrationOffers.default;

  const comparisonData = [
    { feature: 'Script Generation', simplified: false, subscribr: 'Full AI generation' },
    { feature: 'YouTube Optimization', simplified: false, subscribr: '70%+ retention focus' },
    { feature: 'Voice Matching', simplified: false, subscribr: 'Advanced AI matching' },
    { feature: 'Fact Checking', simplified: false, subscribr: 'Built-in verification' },
    { feature: 'PVSS Framework', simplified: false, subscribr: 'Proven viral structure' },
    { feature: 'Video Editing', simplified: true, subscribr: false },
    { feature: 'Graphic Design', simplified: true, subscribr: false },
    { feature: 'Social Scheduling', simplified: true, subscribr: false },
    { feature: 'Hook Library', simplified: 0, subscribr: '1000+ viral hooks' },
    { feature: 'Retention Analytics', simplified: false, subscribr: 'Real-time tracking' },
    { feature: 'Pricing', simplified: '$0-$40/mo', subscribr: '$19-$79/mo' },
  ];

  const testimonials = [
    {
      name: 'Jordan Williams',
      channel: '@CreativeStudio',
      subscribers: '280K',
      quote: 'Simplified was great for design, but I needed actual scripts that convert. Subscribr delivered 3x better results.',
      rating: 5,
      beforeAfter: {
        before: 'Beautiful videos, low retention',
        after: '68% retention + great design'
      }
    },
    {
      name: 'Maya Patel',
      channel: '@TechDesign',
      subscribers: '150K',
      quote: 'I still use Simplified for graphics, but Subscribr handles all my script writing. Perfect combination.',
      rating: 5,
      beforeAfter: {
        before: '32% average view duration',
        after: '71% average view duration'
      }
    },
    {
      name: 'Alex Chen',
      channel: '@BusinessVisuals',
      subscribers: '95K',
      quote: 'Simplified helped with visuals, Subscribr helped with content. Now I have both sides covered perfectly.',
      rating: 5,
      beforeAfter: {
        before: 'Design-focused content',
        after: 'Strategic, engaging content'
      }
    }
  ];

  const uniqueValueProps = [
    {
      icon: Brain,
      title: 'Script Intelligence vs Design Tools',
      description: 'While Simplified focuses on visual creation, we optimize the content that drives engagement.',
      benefit: 'Get viewers to actually watch your beautiful videos'
    },
    {
      icon: Target,
      title: 'Retention-First Approach',
      description: 'Simplified makes pretty videos. We make videos that keep people watching until the end.',
      benefit: '70%+ average view duration'
    },
    {
      icon: MessageSquare,
      title: 'Content Strategy vs Visual Strategy',
      description: 'Perfect visuals mean nothing without compelling scripts that convert viewers into subscribers.',
      benefit: '3x higher subscriber conversion'
    },
    {
      icon: TrendingUp,
      title: 'YouTube Algorithm Optimization',
      description: 'Our scripts are designed specifically for YouTube\'s algorithm, not generic social media.',
      benefit: '280% more views from recommendations'
    }
  ];

  const whySwitch = [
    {
      problem: 'Beautiful videos with low watch time',
      solution: 'Engaging scripts that match your visual quality',
      result: '+340% watch time improvement'
    },
    {
      problem: 'Great design but poor conversion',
      solution: 'Conversion-optimized scripts with visual cues',
      result: '+250% subscriber growth'
    },
    {
      problem: 'Generic content despite custom graphics',
      solution: 'Personalized voice matching for authentic content',
      result: '+180% engagement rates'
    },
    {
      problem: 'Time spent on design, neglecting script quality',
      solution: 'AI-generated scripts in 30 seconds',
      result: '80% time savings on content creation'
    }
  ];

  const integrationBenefits = [
    'Keep using Simplified for design work',
    'Add Subscribr for script optimization',
    'Perfect visual + content combination',
    'No workflow disruption',
    'Complementary tool strategy'
  ];

  const faqs = [
    {
      question: 'Can I use both Simplified and Subscribr together?',
      answer: 'Absolutely! Many creators use Simplified for graphics and video editing while using Subscribr for script writing and content strategy. They complement each other perfectly.'
    },
    {
      question: 'Why do I need script optimization if my videos look great?',
      answer: 'Beautiful visuals get clicks, but engaging scripts keep viewers watching. YouTube\'s algorithm prioritizes watch time over visual quality. You need both great design AND great content.'
    },
    {
      question: 'Does Subscribr offer any visual creation tools?',
      answer: 'We focus purely on content optimization - scripts, hooks, and retention strategies. For visuals, we recommend continuing to use tools like Simplified while adding our script intelligence.'
    },
    {
      question: 'How much better are the results compared to Simplified alone?',
      answer: 'Users report 340% better watch time, 250% more subscribers, and 180% higher engagement when combining great visuals with optimized scripts.'
    },
    {
      question: 'Is there a migration discount from Simplified?',
      answer: 'Yes! We offer 40% off your first 2 months plus free setup assistance to help you integrate script optimization into your existing Simplified workflow.'
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Simplified Alternative - Add Script Intelligence to Your Visual Content | Subscribr</title>
        <meta name="description" content="Love Simplified for design? Add Subscribr for scripts that convert. 68% retention + beautiful visuals = YouTube success. Perfect complement to Simplified." />
        <meta name="keywords" content="simplified alternative, simplified competitor, youtube scripts, video content optimization, content creation tools" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Star className="w-4 h-4 mr-1" />
              Perfect Complement to Simplified
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Love Simplified's Design? Add Script Intelligence That Converts
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Keep creating beautiful visuals with Simplified. Add Subscribr for <span className="font-semibold text-foreground">scripts that get 68% retention</span>. 
              Together, they create content that looks amazing AND performs incredibly.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600">
                Add Script Intelligence
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                See Integration Benefits
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>4.8/5 Rating</span>
              </div>
              <div>Works with Simplified</div>
              <div>No workflow disruption</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why You Need Both */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Beautiful Videos Need Beautiful Scripts
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Simplified makes your videos look professional. Subscribr makes them perform professionally.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="text-xl text-orange-600">What Simplified Does Best</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span>Professional video editing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span>Beautiful graphic design</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span>Social media scheduling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span>Brand kit management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">What Subscribr Adds</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span>AI script generation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span>70%+ retention optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span>Voice matching technology</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span>Viral hook frameworks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">The Perfect Combination</h3>
            <p className="text-lg mb-6">
              Simplified + Subscribr = Professional visuals + Engaging content = YouTube success
            </p>
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="text-center">
                <div className="text-sm font-medium">Simplified</div>
                <div className="text-xs text-muted-foreground">Beautiful Design</div>
              </div>
              <div className="text-center text-2xl">+</div>
              <div className="text-center">
                <div className="text-sm font-medium">Subscribr</div>
                <div className="text-xs text-muted-foreground">Smart Scripts</div>
              </div>
              <div className="text-center text-2xl">=</div>
              <div className="text-center">
                <div className="text-sm font-medium text-green-600">68% Retention</div>
                <div className="text-xs text-muted-foreground">YouTube Success</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50 dark:from-background dark:to-orange-950/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simplified vs Subscribr: What Each Does Best
          </h2>
          
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Feature</th>
                    <th className="text-center p-4">Simplified</th>
                    <th className="text-center p-4 bg-orange-50 dark:bg-orange-950/20">Subscribr</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        {typeof row.simplified === 'boolean' ? (
                          row.simplified ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.simplified}</span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-orange-50 dark:bg-orange-950/20">
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
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600">
              Add Subscribr to Your Workflow
              <Zap className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Unique Value Props */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why Creators Add Subscribr to Their Simplified Workflow
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Simplified creates beautiful videos. Subscribr makes them perform beautifully.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {uniqueValueProps.map((prop, idx) => (
              <Card key={idx} className="border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <prop.icon className="w-10 h-10 text-orange-600 mb-2" />
                  <CardTitle>{prop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{prop.description}</p>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-orange-600">{prop.benefit}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 bg-gradient-to-b from-white to-red-50 dark:from-background dark:to-red-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common Problems Simplified Users Face (And How We Solve Them)
          </h2>

          <div className="space-y-6">
            {whySwitch.map((item, idx) => (
              <Card key={idx} className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">Problem:</h3>
                      <p className="text-muted-foreground">{item.problem}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-600 mb-2">Subscribr Solution:</h3>
                      <p className="text-muted-foreground">{item.solution}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{item.result}</div>
                      <div className="text-sm text-muted-foreground">Average improvement</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Creators Who Added Subscribr to Their Simplified Workflow
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            See how the combination of great design + great scripts transforms results
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

          <div className="mt-12 p-8 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">
              Join {socialProofData.metrics.totalUsers}+ Creators Getting Better Results
            </h3>
            <div className="flex gap-8 justify-center mb-6 text-sm">
              <div>
                <div className="text-3xl font-bold text-orange-600">{socialProofData.metrics.viewsGenerated}</div>
                <div className="text-muted-foreground">Views Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">{socialProofData.metrics.averageRetention}%</div>
                <div className="text-muted-foreground">Avg. Retention</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">{socialProofData.metrics.averageROI}x</div>
                <div className="text-muted-foreground">Revenue Increase</div>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600">
              Add Script Intelligence Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Integration Benefits */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50 dark:from-background dark:to-orange-950/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perfect Integration with Your Existing Workflow
          </h2>

          <div className="bg-white/50 dark:bg-black/50 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6 text-center">How It Works Together</h3>
            <div className="space-y-4">
              {integrationBenefits.map((benefit, idx) => (
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
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Complete Your Content Creation Toolkit?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Keep designing with Simplified. Add script intelligence with Subscribr.
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-4">Special Simplified User Offer</h3>
            <p className="text-lg mb-6">
              Add Subscribr for 40% off your first 2 months + free integration setup
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Claim Your Discount
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                Learn More
              </Button>
            </div>
          </div>

          <div className="text-sm opacity-75">
            14-day free trial • Works with Simplified • No workflow disruption
          </div>
        </div>
      </section>
    </>
  );
}