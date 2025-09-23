'use client';

import { useState } from 'react';
import { 
  Check, X, ArrowRight, Star, TrendingUp, Shield, Zap, 
  Brain, Target, BarChart3, Users, Youtube, Sparkles, Award,
  CheckCircle2
} from 'lucide-react';
import {
  MarketingHero,
  MarketingSection,
  MarketingCard,
  FeatureGrid,
  ComparisonSection,
  TestimonialSection,
  CTASection,
  FAQSection,
  StatsBar
} from '@/components/marketing/MarketingLayout';
import { MarketingButton } from '@/components/marketing/MarketingButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ROICalculator from '@/components/comparison/ROICalculator';
import RetentionChart from '@/components/comparison/RetentionChart';
import MigrationOffer from '@/components/comparison/MigrationOffer';
import { competitorData, socialProofData, migrationOffers } from '@/lib/comparison-data';

export default function TubeBuddyAlternativePage() {
  const [activeTab, setActiveTab] = useState('comparison');
  const [openFAQ, setOpenFAQ] = useState(null);
  
  const tubebuddy = competitorData.tubebuddy;
  const genscript = competitorData.ourPlatform;
  const migration = migrationOffers.tubebuddy;

  const comparisonFeatures = [
    { 
      feature: 'Script Generation', 
      competitor: '✗ No script tools', 
      genscript: 'Full AI generation'
    },
    { 
      feature: 'Retention Optimization', 
      competitor: '✗ SEO focus only', 
      genscript: '68%+ AVD targeting'
    },
    { 
      feature: 'Voice Matching', 
      competitor: '✗ Not available', 
      genscript: 'Authentic creator voice'
    },
    { 
      feature: 'Fact Checking', 
      competitor: '✗ Not available', 
      genscript: 'Built-in verification'
    },
    { 
      feature: 'PVSS Framework', 
      competitor: '✗ Not available', 
      genscript: 'Proven viral structure'
    },
    { 
      feature: 'Keyword Research', 
      competitor: 'Core feature', 
      genscript: 'Included + retention focus'
    },
    { 
      feature: 'SEO Optimization', 
      competitor: 'Advanced tools', 
      genscript: 'YouTube algorithm focus'
    },
    { 
      feature: 'Thumbnail Testing', 
      competitor: 'A/B testing', 
      genscript: 'AI-powered creation'
    },
    { 
      feature: 'Hook Library', 
      competitor: '✗ No content library', 
      genscript: '1000+ tested hooks'
    },
    { 
      feature: 'Support', 
      competitor: 'Email only', 
      genscript: '24/7 live chat'
    }
  ];

  const testimonials = [
    {
      name: 'Mike Johnson',
      channel: '@GamingHub',
      subscribers: '25K',
      quote: 'TubeBuddy was great for keywords, but I needed actual scripts. Genscript delivers exactly what I need - engaging content that keeps viewers watching.',
      rating: 5,
      verified: true,
      metrics: { retention: 72, growth: 3.5, timeframe: '2 months' }
    },
    {
      name: 'Emma Davis',
      channel: '@CookingMagic',
      subscribers: '15K',
      quote: 'Switched from TubeBuddy and my watch time doubled in 2 weeks! The script generation saves me hours every day.',
      rating: 5,
      verified: true,
      metrics: { retention: 65, growth: 2, timeframe: '2 weeks' }
    },
    {
      name: 'Ryan Chen',
      channel: '@TechTutorials',
      subscribers: '8K',
      quote: 'I was spending hours writing scripts after doing keyword research in TubeBuddy. Now Genscript does both - but better!',
      rating: 5,
      verified: true
    }
  ];

  const faqs = [
    {
      question: 'How is Genscript different from TubeBuddy?',
      answer: 'While TubeBuddy focuses on keyword research and SEO optimization, Genscript specializes in creating high-retention scripts using AI. We help you create content that not only gets discovered but keeps viewers watching until the end.'
    },
    {
      question: 'Can I use both TubeBuddy and Genscript together?',
      answer: 'Absolutely! Many creators use TubeBuddy for keyword research and Genscript for script generation. They complement each other perfectly. However, Genscript also includes essential SEO features, so you might find you don\'t need both.'
    },
    {
      question: 'Do you have keyword research like TubeBuddy?',
      answer: 'Yes! While our focus is on retention-optimized scripts, we include keyword research and SEO optimization in all our plans. Our approach is to find keywords that not only have search volume but also align with high-retention content strategies.'
    },
    {
      question: 'Why is your starting price higher than TubeBuddy?',
      answer: 'Our AI script generation technology requires more advanced infrastructure than basic keyword tools. However, the time saved and results achieved (68%+ average retention) provide significantly better ROI. Most users report 3-5x return on their investment.'
    },
    {
      question: 'Can you import my TubeBuddy data?',
      answer: 'Yes! Our migration team helps you transfer your keyword lists, tags, and optimization settings. We\'ll also analyze your best-performing content to train our AI on your unique style.'
    },
    {
      question: 'What about TubeBuddy\'s browser extension?',
      answer: 'We offer a web-based platform that\'s accessible from any device. While we don\'t have a browser extension yet, our interface is optimized for quick script generation and you can easily copy content directly to YouTube.'
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>TubeBuddy Alternative - AI Script Generation with 68%+ Retention | Genscript</title>
        <meta name="description" content="Looking for a TubeBuddy alternative that does more than keywords? Genscript creates AI-powered scripts with 68%+ viewer retention. Try free for 14 days." />
        <meta name="keywords" content="tubebuddy alternative, tubebuddy competitor, youtube script generator, ai script writing, youtube retention" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Award className="w-4 h-4 mr-1" />
              Join {socialProofData.metrics.totalUsers}+ Creators Who Switched
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              The TubeBuddy Alternative That Actually Creates Your Scripts
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              TubeBuddy helps you find keywords. We help you create <span className="font-semibold text-foreground">viral scripts with {socialProofData.metrics.averageRetention}%+ retention</span> 
              using those keywords. Stop spending hours writing - let AI do it better.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Start Free 14-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                Watch 2-Min Demo
                <Youtube className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>{socialProofData.metrics.rating}/5 ({socialProofData.metrics.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{socialProofData.metrics.viewsGenerated} views generated</span>
              </div>
              <div>No credit card required</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 bg-white dark:bg-background border-y">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-8">
            The TubeBuddy Problem: Keywords Don't Write Scripts
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">⏰</div>
                <CardTitle>Hours Writing Scripts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Finding keywords is easy. Writing engaging scripts takes hours.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">📉</div>
                <CardTitle>Poor Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Great SEO means nothing if viewers click away after 30 seconds.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">🤖</div>
                <CardTitle>No AI Help</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  TubeBuddy doesn't create content - you're still on your own.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
              <TabsTrigger value="comparison">Compare</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="testimonials">Reviews</TabsTrigger>
              <TabsTrigger value="roi">ROI</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                  TubeBuddy vs Genscript: Complete Comparison
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  See why creators are switching from keyword research to AI-powered script generation
                </p>
              </div>
              
              <ComparisonSection 
                title="TubeBuddy vs Subscribr"
                subtitle="See why creators are switching from keyword research to AI-powered script generation"
                competitor="TubeBuddy"
                features={comparisonFeatures}
              />
              
              <div className="text-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Get Better Than Keywords - Get Scripts
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                  Features TubeBuddy Can't Match
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Go beyond optimization - create content that captivates
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <Brain className="w-10 h-10 text-purple-600 mb-2" />
                    <CardTitle>AI Script Generation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Turn any topic into a complete, engaging script in minutes. Our AI analyzes 
                      millions of viral videos to create content that hooks viewers instantly.
                    </p>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm font-medium mb-2">Time Saved:</div>
                      <div className="text-2xl font-bold text-purple-600">3-4 hours per video</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <Target className="w-10 h-10 text-purple-600 mb-2" />
                    <CardTitle>68%+ Retention Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Every script is optimized for maximum watch time. We structure content to 
                      maintain viewer interest from intro to outro.
                    </p>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm font-medium mb-2">Average Result:</div>
                      <div className="text-2xl font-bold text-purple-600">2x Watch Time</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <Sparkles className="w-10 h-10 text-purple-600 mb-2" />
                    <CardTitle>Voice Matching Technology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Scripts that sound like YOU wrote them. Our AI learns your style and creates 
                      authentic content that resonates with your audience.
                    </p>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm font-medium mb-2">Authenticity Score:</div>
                      <div className="text-2xl font-bold text-purple-600">95%+ Match</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <Shield className="w-10 h-10 text-purple-600 mb-2" />
                    <CardTitle>Fact-Checking Built In</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Never worry about misinformation. Every script includes automatic 
                      fact-checking and source verification.
                    </p>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm font-medium mb-2">Accuracy Rate:</div>
                      <div className="text-2xl font-bold text-purple-600">100% Verified</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="testimonials" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                  Creators Who Switched from TubeBuddy
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Real results from real creators who made the switch
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <TestimonialSection testimonials={testimonials} />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {socialProofData.metrics.averageRetention}%
                    </div>
                    <p className="text-sm text-muted-foreground">Average Retention</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {socialProofData.metrics.averageROI}x
                    </div>
                    <p className="text-sm text-muted-foreground">Average ROI</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {socialProofData.metrics.totalUsers}+
                    </div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="roi" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                  Calculate Your Potential Return
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  See how much you could gain by switching from TubeBuddy to Genscript
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <ROICalculator />
                <RetentionChart 
                  competitorName="TubeBuddy Users"
                  competitorRetention={35}
                  ourRetention={68}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Migration Offer */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <MigrationOffer
            competitor="TubeBuddy"
            discount={migration.discount}
            duration={migration.duration}
            features={migration.features}
            onClaim={() => window.location.href = '/signup?ref=tubebuddy-migration'}
          />
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
            Stop Researching. Start Creating.
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            TubeBuddy shows you what to create. Genscript actually creates it for you - 
            with {socialProofData.metrics.averageRetention}%+ retention guaranteed.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}