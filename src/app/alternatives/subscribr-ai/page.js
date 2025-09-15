'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowRight, Brain, Target, BarChart3, Sparkles, Users } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';

export default function SubscribrAIAlternativePage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'subscribr-ai-alternative',
        referrer: document.referrer 
      })
    });
  }, []);

  const comparisonData = [
    { feature: 'Voice Matching Technology', subscribrAI: 'Basic templates', genscript: 'Advanced AI matching' },
    { feature: 'Retention Optimization', subscribrAI: '50% AVD target', genscript: '70%+ AVD guarantee' },
    { feature: 'Psychographic Targeting', subscribrAI: false, genscript: 'Deep audience analysis' },
    { feature: 'PVSS Framework', subscribrAI: false, genscript: 'Built-in viral structure' },
    { feature: 'Quality Tiers', subscribrAI: 'One size fits all', genscript: 'Fast/Balanced/Premium' },
    { feature: 'Fact Verification', subscribrAI: false, genscript: 'Real-time checking' },
    { feature: 'Hook Library', subscribrAI: '100+ hooks', genscript: '1000+ tested hooks' },
    { feature: 'Custom Voice Training', subscribrAI: false, genscript: 'Personal AI model' },
    { feature: 'A/B Testing Scripts', subscribrAI: false, genscript: 'Built-in testing' },
    { feature: 'Pricing', subscribrAI: '$29-$99/mo', genscript: '$19-$79/mo' },
    { feature: 'API Access', subscribrAI: 'Enterprise only', genscript: 'All paid plans' },
    { feature: 'White Label Option', subscribrAI: false, genscript: 'Available' },
  ];

  const testimonials = [
    {
      name: 'David Park',
      channel: '@BusinessMastery',
      subscribers: '2.3M',
      quote: 'Subscribr AI was good, but Genscript is next level. The psychographic targeting helps me connect with viewers on a deeper level. Engagement is through the roof!',
      rating: 5
    },
    {
      name: 'Emma Thompson',
      channel: '@BeautySecrets',
      subscribers: '780K',
      quote: 'The custom voice training is what sold me. My scripts sound exactly like me, not like every other AI-generated content out there.',
      rating: 5
    },
    {
      name: 'Jake Morrison',
      channel: '@FitnessCoach',
      subscribers: '1.5M',
      quote: 'Switched last month and already seeing 2x better retention. The PVSS framework is genius - my videos are getting pushed by the algorithm like crazy.',
      rating: 5
    }
  ];

  const faqs = [
    {
      question: 'How is this different from Subscribr AI?',
      answer: 'While Subscribr AI offers solid script generation, Genscript goes deeper with psychographic audience analysis, custom voice training, and guaranteed 70%+ retention optimization. Genscript\'s PVSS framework and extensive hook library are unique features not found in Subscribr AI.'
    },
    {
      question: 'Can I import my Subscribr AI templates?',
      answer: 'Yes! Genscript offers free migration assistance including template import, voice profile setup, and personalized onboarding. The Genscript team will help you transition smoothly within 24 hours.'
    },
    {
      question: 'Why is your pricing lower with more features?',
      answer: 'Genscript has optimized its AI infrastructure to be more efficient, allowing better features at lower prices. Plus, Genscript believes in making advanced tools accessible to all creators, not just enterprises.'
    },
    {
      question: 'Do you have the same AI models as Subscribr AI?',
      answer: 'Genscript uses more advanced models including GPT-4, Claude 3 Opus, and a proprietary retention optimization model. You can choose between different quality tiers based on your needs and budget.'
    },
    {
      question: 'What about customer support?',
      answer: 'Unlike Subscribr AI\'s email-only support, Genscript offers 24/7 live chat, priority support for paid users, and a dedicated success manager for professional plans.'
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Subscribr AI Alternative - Better Scripts, Lower Price, More Features | Genscript</title>
        <meta name="description" content="Looking for a Subscribr AI alternative? Get advanced voice matching, 70%+ retention optimization, and psychographic targeting for less. Try free for 14 days." />
        <meta name="keywords" content="subscribr ai alternative, subscribr competitor, youtube script ai, script generator, content creation tool" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="w-4 h-4 mr-1" />
              30% More Features, 30% Less Cost
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              The Subscribr AI Alternative That Actually Understands Your Audience
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Go beyond basic templates with <span className="font-semibold text-foreground">psychographic targeting</span>, 
              <span className="font-semibold text-foreground"> custom voice training</span>, and 
              <span className="font-semibold text-foreground"> guaranteed 70%+ retention</span>.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                Start Free Trial - No CC Required
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo (2 min)
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>15,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>4.9/5 on Trustpilot</span>
              </div>
              <div>Free Migration Help</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Point Section */}
      <section className="py-16 bg-white dark:bg-background border-y">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">
            Genscript Knows Why You're Looking for Alternatives...
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">😔</div>
              <h3 className="font-semibold mb-2">Generic Scripts</h3>
              <p className="text-sm text-muted-foreground">
                Subscribr AI scripts sound the same for everyone
              </p>
            </div>
            <div>
              <div className="text-4xl mb-2">📉</div>
              <h3 className="font-semibold mb-2">Poor Retention</h3>
              <p className="text-sm text-muted-foreground">
                50% AVD isn't enough for the algorithm anymore
              </p>
            </div>
            <div>
              <div className="text-4xl mb-2">💸</div>
              <h3 className="font-semibold mb-2">High Price</h3>
              <p className="text-sm text-muted-foreground">
                Paying premium for basic features
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Side-by-Side Feature Comparison
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            More features, better results, lower price
          </p>
          
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Feature</th>
                    <th className="text-center p-4">Subscribr AI</th>
                    <th className="text-center p-4 bg-blue-50 dark:bg-blue-950/20">Genscript</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        {typeof row.subscribrAI === 'boolean' ? (
                          row.subscribrAI ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.subscribrAI}</span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-blue-50 dark:bg-blue-950/20">
                        {typeof row.genscript === 'boolean' ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{row.genscript}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600">
              Switch & Save 30% Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Plus get 3 months at 50% off when switching
            </p>
          </div>
        </div>
      </section>

      {/* Unique Value Props */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Features You Won't Find in Subscribr AI
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Advanced technology that takes your content to the next level
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <Brain className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Psychographic AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Understand not just who watches, but why they watch and what keeps them engaged.
                </p>
                <Badge variant="secondary">Exclusive Feature</Badge>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <Target className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Custom Voice Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Train the AI on your past scripts to perfectly match your unique voice and style.
                </p>
                <Badge variant="secondary">1-Click Setup</Badge>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle className="text-lg">A/B Script Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate multiple versions and test which performs better with your audience.
                </p>
                <Badge variant="secondary">Data-Driven</Badge>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <Sparkles className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle className="text-lg">PVSS Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Pattern-Value-Story-Surprise structure for maximum virality and engagement.
                </p>
                <Badge variant="secondary">3x Viral Rate</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Results Banner */}
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-2xl">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">72%</div>
                <div className="text-sm text-muted-foreground">Avg. Retention Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">3.2x</div>
                <div className="text-sm text-muted-foreground">More Engagement</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">45%</div>
                <div className="text-sm text-muted-foreground">Cost Savings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-muted-foreground">Live Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Creators Who Made the Switch
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            From Subscribr AI to exponential growth
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
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

          {/* Case Study CTA */}
          <Card className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Case Study: How David Went from 50K to 2.3M Subscribers
              </h3>
              <p className="mb-6 opacity-90">
                Learn the exact strategy and scripts that transformed a struggling channel into a YouTube powerhouse
              </p>
              <Button size="lg" variant="secondary">
                Download Free Case Study
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common Questions About Switching
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            LIMITED TIME OFFER
          </Badge>
          
          <h2 className="text-4xl font-bold mb-6">
            Switch from Subscribr AI Today, Get 50% Off for 3 Months
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Plus free migration assistance and priority onboarding
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-bold mb-3">What You Get:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5" />
                    <span>50% discount for 3 months</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5" />
                    <span>Free template migration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5" />
                    <span>1-on-1 onboarding call</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5" />
                    <span>30-day money-back guarantee</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3">Pricing After Discount:</h3>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="font-semibold">Starter</div>
                    <div className="text-2xl font-bold">
                      <span className="line-through opacity-50">$19</span> $9.50/mo
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="font-semibold">Professional</div>
                    <div className="text-2xl font-bold">
                      <span className="line-through opacity-50">$49</span> $24.50/mo
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center mt-8">
              <Button size="lg" variant="secondary">
                Claim Your 50% Discount
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                Schedule Demo
              </Button>
            </div>
          </div>

          <div className="text-sm opacity-75">
            Offer expires in 48 hours • No credit card required to start
          </div>
        </div>
      </section>
    </>
  );
}