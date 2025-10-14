'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowRight, Youtube, TrendingUp, DollarSign, Clock, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';

export default function JasperAIAlternativePage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'jasper-ai-alternative',
        referrer: document.referrer 
      })
    });
  }, []);

  const comparisonData = [
    { feature: 'Transcript Extraction', jasper: false, genscript: 'AI-powered competitive research' },
    { feature: 'YouTube Specialization', jasper: 'Generic content', genscript: 'YouTube-optimized' },
    { feature: 'Retention Analytics', jasper: false, genscript: '70%+ AVD targeting' },
    { feature: 'Hook Library', jasper: '50+ templates', genscript: '1000+ viral hooks' },
    { feature: 'Voice Matching', jasper: 'Brand voice only', genscript: 'Personal AI voice' },
    { feature: 'Video Script Format', jasper: 'Basic', genscript: 'Professional format' },
    { feature: 'Thumbnail Integration', jasper: false, genscript: 'AI thumbnail creation' },
    { feature: 'PVSS Framework', jasper: false, genscript: 'Built-in viral structure' },
    { feature: 'YouTube Analytics', jasper: false, genscript: 'Real-time insights' },
    { feature: 'Fact Checking', jasper: false, genscript: 'Automated verification' },
    { feature: 'Creator Community', jasper: 'General users', genscript: 'YouTube creators only' },
    { feature: 'Pricing', jasper: '$39-$125/mo', genscript: '$39-$199/mo' },
    { feature: 'Words/Scripts Limit', jasper: '50K words', genscript: 'Unlimited scripts' },
  ];

  const testimonials = [
    {
      name: 'Michael Chen',
      channel: '@TechReviews',
      subscribers: '3.1M',
      quote: 'Jasper is great for blogs, but for YouTube scripts? Genscript understands video content. My retention went from 40% to 75% in just 2 months.',
      rating: 5,
      previousTool: 'Jasper AI'
    },
    {
      name: 'Lisa Anderson',
      channel: '@CookingMagic',
      subscribers: '890K',
      quote: 'The YouTube-specific features make all the difference. Jasper couldn\'t help with hooks and retention. Genscript turned my channel around.',
      rating: 5,
      previousTool: 'Jasper AI'
    },
    {
      name: 'Ryan Torres',
      channel: '@GamingElite',
      subscribers: '2.5M',
      quote: 'Half the price of Jasper, 10x better for YouTube. The viral framework and hook library are absolute game-changers for my content.',
      rating: 5,
      previousTool: 'Jasper AI'
    }
  ];

  const faqs = [
    {
      question: 'Is Genscript better than Jasper AI for YouTube content?',
      answer: 'Absolutely. While Jasper is a general-purpose AI writer, Genscript is built specifically for YouTube creators. We optimize for viewer retention, engagement, and the YouTube algorithm - things Jasper doesn\'t even consider.'
    },
    {
      question: 'Can I still use Genscript for other content like Jasper?',
      answer: 'Genscript specializes in YouTube scripts, but many creators use the generated content as a foundation for blogs, social media posts, and newsletters. However, if you need primarily blog content, Jasper might be better suited.'
    },
    {
      question: 'How does the pricing compare to Jasper?',
      answer: 'We\'re competitive with Jasper\'s pricing. Our Creator plan at $39/mo and Professional plan at $79/mo offer more YouTube-specific features than Jasper\'s general plans. Plus, we don\'t have word limits - you pay for unlimited script generation.'
    },
    {
      question: 'What about Jasper\'s Chrome extension?',
      answer: 'We offer a YouTube Studio integration that\'s far more useful for creators. It analyzes your existing videos, suggests improvements, and generates optimized scripts right within YouTube\'s interface.'
    },
    {
      question: 'Do you have templates like Jasper?',
      answer: 'Yes, but better! We have 1000+ YouTube-specific templates including viral hooks, retention patterns, and proven frameworks used by top creators. Jasper\'s templates are mostly for written content, not video scripts.'
    }
  ];

  const results = [
    { metric: 'Average View Duration', before: '42%', after: '73%', improvement: '+74%' },
    { metric: 'Click-Through Rate', before: '3.2%', after: '8.7%', improvement: '+172%' },
    { metric: 'Revenue per Mille', before: '$2.80', after: '$6.40', improvement: '+128%' },
    { metric: 'Subscriber Growth', before: '1.2K/mo', after: '4.8K/mo', improvement: '+300%' },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Genscript",
    "applicationCategory": "YouTube Script Generator",
    "operatingSystem": "Web",
    "alternativeOf": {
      "@type": "SoftwareApplication",
      "name": "Jasper AI"
    },
    "offers": {
      "@type": "Offer",
      "price": "39.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2500"
    },
    "featureList": [
      "AI YouTube script generation",
      "70%+ retention optimization",
      "Voice matching technology",
      "Built-in fact checking",
      "PVSS viral framework",
      "Psychographic targeting"
    ]
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="jasper-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Youtube className="w-4 h-4 mr-1" />
              Built Exclusively for YouTube Creators
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Jasper Alternative for YouTube Script Generation with Viral Frameworks
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Jasper writes blogs. Genscript writes videos that keep viewers watching. Get <span className="font-semibold text-foreground">YouTube scripts with 70%+ retention</span>, 
              viral hooks, perfect pacing, and audience-specific optimization.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-600">
                Try Free - No Credit Card
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                See Results From Ex-Jasper Users
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>50% Cheaper than Jasper</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>3x Better Results</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Setup in 2 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-red-600">
                The Problem with Jasper for YouTube
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>Generic content not optimized for video retention</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>No understanding of YouTube algorithm or metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>Blog-focused templates don't work for videos</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>Expensive pricing with word limits</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                Genscript's YouTube-First Solution
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Scripts optimized for 70%+ viewer retention</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>1000+ viral hooks tested on real YouTube data</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>PVSS framework for maximum engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Unlimited scripts at half the price</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-gradient-to-b from-white to-red-50 dark:from-background dark:to-red-950/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Real Results from Creators Who Switched from Jasper
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Average improvements after 60 days of using Genscript
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {results.map((result, idx) => (
              <Card key={idx} className="text-center">
                <CardHeader>
                  <CardDescription>{result.metric}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {result.improvement}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.before} → {result.after}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 border-red-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Why These Results Matter
              </h3>
              <p className="text-lg mb-6 max-w-3xl mx-auto">
                Higher retention means YouTube promotes your videos more. Better CTR means more views. 
                Combined, this leads to exponential channel growth that Jasper simply can't deliver.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-600">
                Get These Results for Your Channel
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Jasper AI vs Genscript: YouTube Features
          </h2>
          
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Feature</th>
                    <th className="text-center p-4">Jasper AI</th>
                    <th className="text-center p-4 bg-red-50 dark:bg-red-950/20">Genscript</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        {typeof row.jasper === 'boolean' ? (
                          row.jasper ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.jasper}</span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-red-50 dark:bg-red-950/20">
                        {typeof row.genscript === 'boolean' ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">{row.genscript}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-600">
              Switch & Save 50% vs Jasper
              <DollarSign className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-white to-red-50 dark:from-background dark:to-red-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Success Stories from Ex-Jasper Users
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Real creators who made the switch and saw real results
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge variant="outline" className="mb-2 w-fit">
                    Previously used {testimonial.previousTool}
                  </Badge>
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

          {/* Video Testimonial CTA */}
          <Card className="mt-12 border-red-200 dark:border-red-800">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    Watch: How Michael Grew from 50K to 3.1M Subscribers
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    See the exact scripts and strategies that transformed his channel after switching from Jasper AI
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Youtube className="w-5 h-5 mr-2" />
                    Watch 5-Min Case Study
                  </Button>
                </div>
                <div className="bg-muted rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Views</span>
                      <span className="font-bold">450K → 12M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue</span>
                      <span className="font-bold">$800 → $28,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time to Results</span>
                      <span className="font-bold">8 weeks</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions About Switching from Jasper
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
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            SPECIAL OFFER FOR JASPER USERS
          </Badge>
          
          <h2 className="text-4xl font-bold mb-6">
            Get 3 Months Free When You Switch from Jasper
          </h2>
          <p className="text-xl mb-8 opacity-90">
            We're so confident you'll love Genscript's YouTube-focused platform that we'll give you 3 months free
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-6">Your Jasper Switch Benefits:</h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5" />
                  <span>3 months completely free</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5" />
                  <span>Personal onboarding session</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5" />
                  <span>Import your Jasper templates</span>
                </li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5" />
                  <span>YouTube growth consultation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5" />
                  <span>Priority support access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5" />
                  <span>Cancel anytime, no questions</span>
                </li>
              </ul>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Claim 3 Months Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                Compare Plans
              </Button>
            </div>
          </div>

          <div className="text-sm opacity-75">
            No payment required for 90 days • Instant access • 5 minute setup
          </div>
        </div>
      </section>
    </>
  );
}