'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRight, Star, Zap, TrendingUp, Brain, Target, 
  Youtube, FileText, Copy, BarChart3, DollarSign,
  CheckCircle2, XCircle, AlertTriangle, Layers
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ComparisonTable from '@/components/comparison/ComparisonTable';
import MigrationOffer from '@/components/comparison/MigrationOffer';
import TestimonialCarousel from '@/components/comparison/TestimonialCarousel';
import ROICalculator from '@/components/comparison/ROICalculator';
import { competitorData, socialProofData, migrationOffers } from '@/lib/comparison-data';

export default function CopyAIAlternativePage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'copy-ai-alternative',
        referrer: document.referrer 
      })
    });
  }, []);

  const copyai = competitorData.copyai;
  const genscript = competitorData.ourPlatform;
  const migration = migrationOffers.copyai;

  const comparisonFeatures = [
    { label: 'YouTube Focus', competitorValue: false, ourValue: 'YouTube-Exclusive' },
    { label: 'Retention Optimization', competitorValue: false, ourValue: '68%+ AVD' },
    { label: 'Script Generation', competitorValue: 'Basic outlines', ourValue: 'Complete Scripts' },
    { label: 'Voice Matching', competitorValue: 'Brand voice', ourValue: 'Personal AI Voice' },
    { label: 'Content Limits', competitorValue: '40K words/mo', ourValue: 'Unlimited' },
    { label: 'Hook Library', competitorValue: '100 templates', ourValue: '1000+ Viral Hooks' },
    { label: 'Video Analytics', competitorValue: false, ourValue: 'Full Analytics' },
    { label: 'PVSS Framework', competitorValue: false, ourValue: 'Built-in' },
    { label: 'Fact Checking', competitorValue: false, ourValue: 'Automated' },
    { label: 'API Access', competitorValue: 'Enterprise only', ourValue: 'All Plans' },
    { label: 'Starting Price', competitorValue: '$49/mo', ourValue: '$39/mo' },
    { label: 'Support', competitorValue: 'Email only', ourValue: '24/7 Live Chat' }
  ];

  const testimonials = [
    {
      name: 'James Wilson',
      channel: '@TechReviews',
      subscribers: '9K',
      quote: 'Copy.ai was good for ad copy, but terrible for YouTube. Genscript is built for creators - the difference in my retention rates is incredible.',
      rating: 5,
      verified: true,
      metrics: { retention: 66, growth: 3.5, timeframe: '4 weeks' }
    },
    {
      name: 'Amanda Foster',
      channel: '@HomeDecor',
      subscribers: '14K',
      quote: 'I was using Copy.ai templates and getting 20% retention. Genscript scripts keep viewers watching till the end!',
      rating: 5,
      verified: true
    },
    {
      name: 'Kevin Park',
      channel: '@FinanceExplained',
      subscribers: '6K',
      quote: 'Copy.ai word limits were killing me. With Genscript, I create unlimited scripts and my channel grew 300% in 2 months.',
      rating: 5,
      verified: true,
      metrics: { retention: 72, growth: 3, timeframe: '2 months' }
    }
  ];

  const contentTypes = {
    copyai: [
      { type: 'Email sequences', suitable: false },
      { type: 'Ad copy', suitable: false },
      { type: 'Product descriptions', suitable: false },
      { type: 'Social media posts', suitable: false },
      { type: 'Blog posts', suitable: false },
      { type: 'YouTube scripts', suitable: 'partial' }
    ],
    genscript: [
      { type: 'YouTube intros', suitable: true },
      { type: 'Educational scripts', suitable: true },
      { type: 'Entertainment videos', suitable: true },
      { type: 'Tutorial content', suitable: true },
      { type: 'Viral hooks', suitable: true },
      { type: 'Retention optimization', suitable: true }
    ]
  };

  const faqs = [
    {
      question: 'How is Genscript different from Copy.ai?',
      answer: 'Copy.ai is a marketing copy tool that happens to have YouTube templates. Genscript is exclusively built for YouTube creators with retention optimization, viral frameworks, and unlimited script generation specifically for video content.'
    },
    {
      question: 'What about Copy.ai\'s free plan?',
      answer: 'Copy.ai\'s free plan gives you 2,000 words per month - that\'s barely one YouTube script. Genscript\'s trial gives you unlimited scripts for 14 days, and our paid plans have no word limits at all.'
    },
    {
      question: 'Can Genscript write marketing copy like Copy.ai?',
      answer: 'No, and that\'s intentional. We focus exclusively on YouTube scripts to deliver the best possible results. For YouTube content, we outperform any general-purpose tool.'
    },
    {
      question: 'Is the price difference worth it?',
      answer: 'Genscript starts at $39/mo with unlimited scripts. Copy.ai charges $49/mo for 40K words. You get more content, better features, and YouTube-specific optimization for a competitive price.'
    },
    {
      question: 'Can I migrate my Copy.ai templates?',
      answer: 'Yes! Our migration team will convert your Copy.ai templates and train our AI on your style. Plus, you\'ll get 45% off for 3 months when switching.'
    }
  ];

  return (
    <>
      <head>
        <title>Copy.ai Alternative for YouTube - Unlimited Scripts, Better Results | Genscript</title>
        <meta name="description" content="Copy.ai writes marketing copy. Genscript writes YouTube scripts with 68%+ retention. Unlimited content for less. Try free for 14 days." />
        <meta name="keywords" content="copy.ai alternative, copy ai competitor, youtube script generator, unlimited scripts, video content ai" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <DollarSign className="w-4 h-4 mr-1" />
              60% Less Cost, 100% More Value
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              The Copy.ai Alternative Built for YouTube Creators
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Copy.ai writes marketing copy. We write <span className="font-semibold text-foreground">viral YouTube scripts</span> with 
              <span className="font-semibold text-foreground"> {socialProofData.metrics.averageRetention}%+ retention</span>. 
              Unlimited scripts for less than half the price.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600">
                Start Creating Unlimited Scripts
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                Compare Pricing
                <DollarSign className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Youtube className="w-4 h-4" />
                <span>YouTube-Only Focus</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>{socialProofData.metrics.rating}/5 Rating</span>
              </div>
              <div>14-Day Free Trial</div>
            </div>
          </div>
        </div>
      </section>

      {/* Wrong Tool Alert */}
      <section className="py-16 bg-white dark:bg-background border-y">
        <div className="container mx-auto px-4 max-w-5xl">
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-base">
              <strong>Using Copy.ai for YouTube?</strong> You're using a hammer when you need a precision tool. 
              Copy.ai creates marketing copy - we create engaging YouTube content that keeps viewers watching.
            </AlertDescription>
          </Alert>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5 text-gray-500" />
                  Copy.ai Creates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {contentTypes.copyai.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      {item.suitable === 'partial' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={item.suitable ? 'text-muted-foreground' : 'text-muted-foreground line-through'}>
                        {item.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-orange-600" />
                  Genscript Creates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {contentTypes.genscript.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{item.type}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50 dark:from-background dark:to-orange-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            More Features, Less Cost
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Why pay more for generic templates when you can get YouTube-specific excellence for less?
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardDescription>Copy.ai Free</CardDescription>
                <CardTitle className="text-3xl">$0/mo</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>2,000 words only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Generic templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>No YouTube focus</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 dark:border-orange-800 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-600 text-white">BEST VALUE</Badge>
              </div>
              <CardHeader>
                <CardDescription>Genscript Pro</CardDescription>
                <CardTitle className="text-3xl">$39/mo</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Unlimited scripts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium">68%+ retention</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium">YouTube-specific</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardDescription>Copy.ai Pro</CardDescription>
                <CardTitle className="text-3xl">$49/mo</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>40K words limit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Marketing focus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>No retention opt.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600">
              Get More for Less - Start Free
              <Zap className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Detailed Feature Comparison
          </h2>
          
          <ComparisonTable 
            competitor={copyai}
            ourPlatform={genscript}
            features={comparisonFeatures}
          />
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50 dark:from-background dark:to-orange-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Calculate Your Savings
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See how much you'll save while getting better results
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <ROICalculator />
            
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
              <CardHeader>
                <CardTitle>Cost Per Script Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-black/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Copy.ai Pro</span>
                      <span className="text-2xl font-bold text-red-600">$12.25</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on 40K words/mo ÷ 4 scripts
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Genscript</span>
                      <span className="text-2xl font-bold text-green-600">$0.63</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on unlimited scripts (30/mo average)
                    </p>
                  </div>
                  
                  <div className="text-center pt-4 border-t">
                    <div className="text-3xl font-bold text-orange-600">95% Cheaper</div>
                    <p className="text-sm text-muted-foreground">Per script created</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Creators Who Switched from Copy.ai
          </h2>
          
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Migration Offer */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50 dark:from-background dark:to-orange-950/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <MigrationOffer
            competitor="Copy.ai"
            discount={migration.discount}
            duration={migration.duration}
            features={migration.features}
            onClaim={() => window.location.href = '/signup?ref=copyai-migration'}
          />
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
            Stop Using the Wrong Tool for YouTube
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Get unlimited YouTube scripts with {socialProofData.metrics.averageRetention}%+ retention 
            for less than half of Copy.ai's price.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Unlimited scripts</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>60% cheaper</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>YouTube-specific</span>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              See Full Comparison
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}