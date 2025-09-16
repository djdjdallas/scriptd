'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, Star, Zap, TrendingUp, Brain, Target, 
  Youtube, Infinity, CreditCard, FileText, Video,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ComparisonTable from '@/components/comparison/ComparisonTable';
import MigrationOffer from '@/components/comparison/MigrationOffer';
import TestimonialCarousel from '@/components/comparison/TestimonialCarousel';
import { competitorData, socialProofData, migrationOffers } from '@/lib/comparison-data';

export default function WritesonicAlternativePage() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [creditUsage, setCreditUsage] = useState(75);

  useEffect(() => {
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'writesonic-alternative',
        referrer: document.referrer 
      })
    });
  }, []);

  const writesonic = competitorData.writesonic;
  const subscribr = competitorData.ourPlatform;
  const migration = migrationOffers.writesonic;

  const comparisonFeatures = [
    { label: 'YouTube Specialization', competitorValue: false, ourValue: 'Built for YouTube' },
    { label: 'Retention Optimization', competitorValue: false, ourValue: '68%+ AVD Targeting' },
    { label: 'Script Generation', competitorValue: 'Basic templates', ourValue: 'Advanced AI Scripts' },
    { label: 'Voice Matching', competitorValue: 'Basic tone', ourValue: 'Authentic Voice AI' },
    { label: 'Content Limits', competitorValue: '100K words/mo', ourValue: 'Unlimited Scripts' },
    { label: 'Quality Tiers', competitorValue: 'Credit-based', ourValue: 'Fast/Balanced/Premium' },
    { label: 'Hook Library', competitorValue: '25 hooks', ourValue: '1000+ Viral Hooks' },
    { label: 'Fact Checking', competitorValue: false, ourValue: 'Real-time Verification' },
    { label: 'PVSS Framework', competitorValue: false, ourValue: 'Viral Structure' },
    { label: 'API Access', competitorValue: 'Pro only', ourValue: 'All Paid Plans' },
    { label: 'Pricing', competitorValue: '$13-$500/mo', ourValue: '$19-$79/mo' },
    { label: 'Support', competitorValue: 'Chat support', ourValue: '24/7 Priority Support' }
  ];

  const testimonials = [
    {
      name: 'David Park',
      channel: '@BusinessTips',
      subscribers: '5K',
      quote: 'Writesonic was too generic for YouTube. Subscribr understands exactly what keeps viewers watching and creates scripts that actually work.',
      rating: 5,
      verified: true,
      metrics: { retention: 71, growth: 4, timeframe: '6 weeks' }
    },
    {
      name: 'Lisa Chang',
      channel: '@BeautyTutorials',
      subscribers: '12K',
      quote: 'No more worrying about word limits! I can create as many scripts as I need without counting credits. Game changer for daily uploaders.',
      rating: 5,
      verified: true
    },
    {
      name: 'Marcus Brown',
      channel: '@FitnessCoach',
      subscribers: '8K',
      quote: 'Writesonic gave me blog-style content. Subscribr gives me engaging YouTube scripts that my audience loves.',
      rating: 5,
      verified: true
    }
  ];

  const faqs = [
    {
      question: 'Why is Subscribr better than Writesonic for YouTube?',
      answer: 'Writesonic is a general-purpose AI writer designed for blogs, ads, and marketing copy. Subscribr is specifically built for YouTube creators, with features like retention optimization, viral hooks, and video-specific formatting that Writesonic doesn\'t offer.'
    },
    {
      question: 'What about Writesonic\'s word limits?',
      answer: 'Writesonic limits you to 100K words per month on their professional plan. With Subscribr, you get unlimited script generation on all paid plans. Create as much content as you need without worrying about running out of credits.'
    },
    {
      question: 'Can I import my Writesonic templates?',
      answer: 'Yes! Our migration team will help you convert your Writesonic templates into Subscribr\'s format. We\'ll also analyze your best content to train our AI on your unique style.'
    },
    {
      question: 'How does the pricing compare?',
      answer: 'Writesonic charges $13-$500/month with word limits. Subscribr offers unlimited scripts for $19-$79/month. You get more features, better results, and no limits for a fraction of the cost.'
    },
    {
      question: 'Do you support multiple languages like Writesonic?',
      answer: 'Currently, we focus on English to ensure the highest quality retention optimization. Multi-language support is coming soon, with the same attention to viewer retention in each language.'
    }
  ];

  return (
    <>
      <head>
        <title>Writesonic Alternative - YouTube-Specific AI Scripts | Subscribr</title>
        <meta name="description" content="Writesonic creates generic content. Subscribr creates YouTube scripts with 68%+ retention. Unlimited scripts, no word limits. Try free for 14 days." />
        <meta name="keywords" content="writesonic alternative, writesonic competitor, youtube script ai, unlimited scripts, content creation" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Infinity className="w-4 h-4 mr-1" />
              Unlimited Scripts vs Word Limits
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              The Writesonic Alternative Built Exclusively for YouTube
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Stop using generic AI writers for YouTube. Get <span className="font-semibold text-foreground">unlimited scripts</span> 
              optimized for <span className="font-semibold text-foreground">{socialProofData.metrics.averageRetention}%+ retention</span>, 
              not blog posts.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                Get Unlimited Scripts Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                Compare Features
                <FileText className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                <span>YouTube-Specific</span>
              </div>
              <div className="flex items-center gap-1">
                <Infinity className="w-4 h-4" />
                <span>No Word Limits</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>{socialProofData.metrics.rating}/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Comparison Visual */}
      <section className="py-16 bg-white dark:bg-background border-y">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-8">
            The Writesonic Credit Problem
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Writesonic Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Monthly Credits Used</span>
                      <span className="text-sm font-bold">{creditUsage}%</span>
                    </div>
                    <Progress value={creditUsage} className="h-3 bg-red-100" />
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      ⚠️ Only 25% of credits remaining
                    </p>
                    <p className="text-xs mt-1">
                      10 scripts = 50,000 words used
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span>Pay more for extra credits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span>Quality decreases to save credits</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Subscribr Unlimited
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Scripts Created This Month</span>
                      <span className="text-sm font-bold">∞</span>
                    </div>
                    <div className="h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Create unlimited scripts
                    </p>
                    <p className="text-xs mt-1">
                      No limits, no credits, no worries
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Infinity className="w-4 h-4 text-green-500" />
                      <span>Unlimited script generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span>Always use highest quality</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            YouTube Scripts vs Generic Content
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See why YouTube creators choose purpose-built tools over generic AI writers
          </p>
          
          <ComparisonTable 
            competitor={writesonic}
            ourPlatform={subscribr}
            features={comparisonFeatures}
          />
          
          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600">
              Switch to Unlimited YouTube Scripts
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* YouTube-Specific Features */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Built for YouTube, Not Blogs
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Features Writesonic doesn't have because they're not YouTube-focused
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <Youtube className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Video Hooks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  1000+ tested hooks that work specifically for YouTube, not blog intros.
                </p>
                <Badge variant="secondary">YouTube-Specific</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Retention Curves</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Scripts structured to maintain viewer attention throughout the video.
                </p>
                <Badge variant="secondary">68%+ AVD</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <Brain className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Pattern Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  AI trained on viral YouTube videos, not blog posts or articles.
                </p>
                <Badge variant="secondary">Viral Training</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Creators Who Switched from Writesonic
          </h2>
          
          <TestimonialCarousel testimonials={testimonials} />
          
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Join {socialProofData.metrics.totalUsers}+ creators getting better results
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Migration Offer */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <MigrationOffer
            competitor="Writesonic"
            discount={migration.discount}
            duration={migration.duration}
            features={migration.features}
            onClaim={() => window.location.href = '/signup?ref=writesonic-migration'}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions About Switching?
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
          <h2 className="text-4xl font-bold mb-6">
            Stop Counting Words. Start Creating Videos.
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Unlimited YouTube scripts with {socialProofData.metrics.averageRetention}%+ retention. 
            No credits, no limits, just results.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Get Unlimited Scripts Now
              <Infinity className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              See Pricing
            </Button>
          </div>
          
          <p className="text-sm mt-6 opacity-75">
            14-day free trial • No credit card • Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
}