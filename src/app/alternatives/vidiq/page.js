'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowRight, Zap, TrendingUp, Shield, Users } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';

export default function VidIQAlternativePage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'vidiq-alternative',
        referrer: document.referrer 
      })
    });
  }, []);

  const comparisonData = [
    { feature: 'Retention Optimization', vidiq: false, genscript: '70%+ AVD targeting' },
    { feature: 'Voice Matching', vidiq: false, genscript: 'Authentic creator voice' },
    { feature: 'Fact Checking', vidiq: false, genscript: 'Built-in verification' },
    { feature: 'PVSS Structure', vidiq: false, genscript: 'Proven viral framework' },
    { feature: 'Psychographic Targeting', vidiq: 'Basic', genscript: 'Advanced AI analysis' },
    { feature: 'Script Generation', vidiq: 'Templates only', genscript: 'Full AI generation' },
    { feature: 'Quality Tiers', vidiq: false, genscript: 'Fast/Balanced/Premium' },
    { feature: 'SEO Optimization', vidiq: true, genscript: true },
    { feature: 'Thumbnail Analysis', vidiq: true, genscript: 'AI-powered creation' },
    { feature: 'Pricing', vidiq: '$7.50-$39/mo', genscript: '$19-$79/mo' },
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      channel: '@TechExplained',
      subscribers: '450K',
      quote: 'Switched from VidIQ 3 months ago. My average view duration went from 35% to 72%. The retention optimization alone pays for itself.',
      rating: 5
    },
    {
      name: 'Sarah Williams',
      channel: '@LifestyleDaily',
      subscribers: '1.2M',
      quote: 'VidIQ helped with SEO, but Genscript actually helps me keep viewers watching. My RPM increased by 40% since switching.',
      rating: 5
    },
    {
      name: 'Marcus Rivera',
      channel: '@GamingPro',
      subscribers: '890K',
      quote: 'The voice matching is incredible. My scripts sound exactly like me now, not generic AI. Game changer for authenticity.',
      rating: 5
    }
  ];

  const faqs = [
    {
      question: 'How easy is it to switch from VidIQ?',
      answer: 'Extremely easy! You can start using Genscript immediately - no data migration needed. Our onboarding team provides free setup assistance for all new users switching from VidIQ.'
    },
    {
      question: 'Can I use both VidIQ and Genscript together?',
      answer: 'Absolutely! Many creators use VidIQ for keyword research and Genscript for script generation and retention optimization. They complement each other perfectly.'
    },
    {
      question: 'What makes Genscript better for retention?',
      answer: 'We analyze millions of high-retention videos to understand psychological hooks, pacing, and structure. Our AI optimizes every sentence for maximum engagement, not just SEO.'
    },
    {
      question: 'Is the pricing worth it compared to VidIQ?',
      answer: 'While our starting price is slightly higher, users report 3-5x ROI within the first month through improved retention and monetization. We also offer a 14-day free trial.'
    },
    {
      question: 'Do you offer the same SEO features as VidIQ?',
      answer: 'We include essential SEO optimization, but our focus is retention-first content. Most creators find combining our retention optimization with basic SEO outperforms SEO-only strategies.'
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>VidIQ Alternative - Better YouTube Scripts with 70%+ Retention | Genscript</title>
        <meta name="description" content="Looking for a VidIQ alternative? Genscript optimizes scripts for 70%+ viewer retention, not just SEO. See why 15,000+ creators switched. Try free for 14 days." />
        <meta name="keywords" content="vidiq alternative, vidiq competitor, youtube script generator, retention optimization, youtube tools" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Star className="w-4 h-4 mr-1" />
              Trusted by 15,000+ Creators
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Looking for a VidIQ Alternative That Actually Improves Retention?
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              While VidIQ focuses on SEO, we optimize your scripts for <span className="font-semibold text-foreground">70%+ viewer retention</span>. 
              See why thousands of creators switched to Genscript for viral-ready content.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Start Free 14-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                See Full Comparison
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
              <div>No credit card required</div>
              <div>Cancel anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            VidIQ vs Genscript: Feature Comparison
          </h2>
          
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Feature</th>
                    <th className="text-center p-4">VidIQ</th>
                    <th className="text-center p-4 bg-purple-50 dark:bg-purple-950/20">Genscript</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        {typeof row.vidiq === 'boolean' ? (
                          row.vidiq ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.vidiq}</span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-purple-50 dark:bg-purple-950/20">
                        {typeof row.genscript === 'boolean' ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-sm font-medium">{row.genscript}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
              Get Genscript Free for 14 Days
              <Zap className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Unique Value Props */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why Creators Switch from VidIQ to Genscript
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            VidIQ helps you get discovered. We help you keep viewers watching.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>70%+ Average View Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Our AI analyzes millions of viral videos to understand what keeps viewers engaged. 
                  Every script is optimized for retention, not just discovery.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">Average Results:</div>
                  <div className="flex justify-between text-sm">
                    <span>Before: 35% AVD</span>
                    <span className="font-bold text-purple-600">After: 72% AVD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <Users className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>Voice Matching Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Your scripts sound like YOU, not generic AI. Our voice matching ensures authentic 
                  content that resonates with your specific audience.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">Creator Feedback:</div>
                  <div className="text-sm italic">
                    "Finally, AI scripts that sound like me!"
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <Shield className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>Built-in Fact Checking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Never worry about misinformation. Every script includes automatic fact-checking 
                  and source verification to protect your credibility.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">Trust & Safety:</div>
                  <div className="text-sm">
                    100% verified facts with source citations
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <Zap className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>PVSS Viral Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Pattern-Value-Story-Surprise structure proven to maximize engagement. 
                  Used by top creators to consistently hit the algorithm.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">Success Rate:</div>
                  <div className="text-sm">
                    3x more likely to go viral vs traditional scripts
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Creators Who Switched from VidIQ
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Join thousands who improved their retention and revenue
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
                  <p className="text-sm italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/50 dark:to-pink-950/50 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">
              Join 15,000+ Creators Getting Better Results
            </h3>
            <div className="flex gap-8 justify-center mb-6 text-sm">
              <div>
                <div className="text-3xl font-bold text-purple-600">2.5B+</div>
                <div className="text-muted-foreground">Views Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">72%</div>
                <div className="text-muted-foreground">Avg. Retention</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">3.2x</div>
                <div className="text-muted-foreground">Revenue Increase</div>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
              Start Your Free Trial Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
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
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Create Scripts That Keep Viewers Watching?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Stop optimizing for clicks. Start optimizing for retention.
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-4">Limited Time Offer</h3>
            <p className="text-lg mb-6">
              Switch from VidIQ and get 50% off your first 3 months + free migration assistance
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Claim Your Discount
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                Talk to Sales
              </Button>
            </div>
          </div>

          <div className="text-sm opacity-75">
            14-day free trial • No credit card required • Cancel anytime
          </div>
        </div>
      </section>
    </>
  );
}