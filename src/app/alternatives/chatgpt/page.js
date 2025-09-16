'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, Star, Zap, TrendingUp, Brain, Target, 
  Youtube, MessageSquare, Sparkles, BarChart3, Timer,
  CheckCircle2, XCircle, AlertCircle, Cpu, PlayCircle
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ComparisonTable from '@/components/comparison/ComparisonTable';
import MigrationOffer from '@/components/comparison/MigrationOffer';
import TestimonialCarousel from '@/components/comparison/TestimonialCarousel';
import RetentionChart from '@/components/comparison/RetentionChart';
import { competitorData, socialProofData, migrationOffers } from '@/lib/comparison-data';

export default function ChatGPTAlternativePage() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'chatgpt-alternative',
        referrer: document.referrer 
      })
    });
  }, []);

  const chatgpt = competitorData.chatgpt;
  const subscribr = competitorData.ourPlatform;
  const migration = migrationOffers.chatgpt;

  const comparisonFeatures = [
    { label: 'YouTube Specialization', competitorValue: false, ourValue: 'Purpose-Built' },
    { label: 'Retention Optimization', competitorValue: false, ourValue: '68%+ AVD' },
    { label: 'Script Structure', competitorValue: 'Manual prompting', ourValue: 'Auto-Structured' },
    { label: 'Consistency', competitorValue: 'Variable output', ourValue: 'Consistent Quality' },
    { label: 'Voice Matching', competitorValue: false, ourValue: 'Personal AI Voice' },
    { label: 'Fact Checking', competitorValue: 'Limited', ourValue: 'Full Verification' },
    { label: 'Hook Library', competitorValue: 0, ourValue: '1000+ Hooks' },
    { label: 'PVSS Framework', competitorValue: false, ourValue: 'Built-in' },
    { label: 'Output Format', competitorValue: 'Generic text', ourValue: 'Video-Ready Scripts' },
    { label: 'Analytics', competitorValue: false, ourValue: 'Performance Tracking' },
    { label: 'Pricing', competitorValue: '$0-$30/mo', ourValue: '$19-$79/mo' },
    { label: 'Support', competitorValue: 'Community only', ourValue: '24/7 Expert Support' }
  ];

  const testimonials = [
    {
      name: 'Lisa Martinez',
      channel: '@FitnessFirst',
      subscribers: '18K',
      quote: 'ChatGPT required too much prompting and the output was inconsistent. Subscribr just gets it right every time - perfect YouTube scripts in one click.',
      rating: 5,
      verified: true,
      metrics: { retention: 70, growth: 3.2, timeframe: '5 weeks' }
    },
    {
      name: 'Tom Wilson',
      channel: '@CodingTutorials',
      subscribers: '7K',
      quote: 'I spent hours crafting ChatGPT prompts. Now I just tell Subscribr my topic and get a retention-optimized script instantly.',
      rating: 5,
      verified: true
    },
    {
      name: 'Rachel Green',
      channel: '@DIYCrafts',
      subscribers: '22K',
      quote: 'ChatGPT is great for many things, but for YouTube scripts? Subscribr is in a different league. My retention went from 30% to 65%!',
      rating: 5,
      verified: true,
      metrics: { retention: 65, growth: 2.8, timeframe: '1 month' }
    }
  ];

  const promptComparison = {
    chatgpt: `You: Write a YouTube script about productivity tips
ChatGPT: Here's a script about productivity...
You: Make it more engaging
ChatGPT: Here's a revised version...
You: Add a hook at the beginning
ChatGPT: Updated with a hook...
You: Structure it for better retention
ChatGPT: Here's a restructured version...
You: Make it sound more like my style
ChatGPT: I'll try to adjust the tone...
[Continue refining for 30+ minutes]`,
    
    subscribr: `You: Create a script about productivity tips
Subscribr: ✓ Analyzed 10,000+ productivity videos
✓ Generated 68%+ retention structure
✓ Matched your voice profile
✓ Added viral hooks
✓ Fact-checked all claims
✓ Optimized for 10-minute format
[Complete script ready in 30 seconds]`
  };

  const faqs = [
    {
      question: 'Why use Subscribr instead of ChatGPT for YouTube scripts?',
      answer: 'ChatGPT is a general-purpose AI that requires extensive prompting to create YouTube content. Subscribr is specifically trained on viral YouTube videos and automatically structures scripts for maximum retention without needing complex prompts.'
    },
    {
      question: 'Can\'t I just give ChatGPT better prompts?',
      answer: 'Even with perfect prompts, ChatGPT lacks YouTube-specific training data and retention optimization algorithms. Subscribr analyzes millions of successful videos to understand what keeps viewers watching, something generic AI can\'t replicate.'
    },
    {
      question: 'Is Subscribr based on ChatGPT technology?',
      answer: 'We use advanced AI models including GPT-4 and Claude, but we\'ve fine-tuned them specifically for YouTube content creation. Our proprietary retention optimization layer ensures every script maximizes watch time.'
    },
    {
      question: 'What about ChatGPT\'s free tier?',
      answer: 'While ChatGPT offers a free tier, the time spent prompting, refining, and structuring scripts often costs more in lost productivity than our subscription. Plus, free ChatGPT has limited availability and no YouTube optimization.'
    },
    {
      question: 'Can I use both ChatGPT and Subscribr?',
      answer: 'Many creators use ChatGPT for general tasks and Subscribr specifically for YouTube scripts. However, most find that Subscribr handles all their YouTube content needs more efficiently.'
    },
    {
      question: 'How much time will I save vs ChatGPT?',
      answer: 'Users report saving 2-3 hours per script compared to ChatGPT. Instead of 30+ minutes of prompting and refining, you get a perfect script in under a minute.'
    }
  ];

  return (
    <>
      <head>
        <title>ChatGPT Alternative for YouTube Scripts - One-Click Scripts | Subscribr</title>
        <meta name="description" content="Stop prompting ChatGPT for hours. Get YouTube-optimized scripts with 68%+ retention in one click. Purpose-built for creators. Try free." />
        <meta name="keywords" content="chatgpt alternative, chatgpt for youtube, ai youtube scripts, script generator, content creation ai" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Timer className="w-4 h-4 mr-1" />
              30 Seconds vs 30 Minutes
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              The ChatGPT Alternative That Actually Understands YouTube
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Stop spending hours prompting ChatGPT. Get <span className="font-semibold text-foreground">perfect YouTube scripts</span> with 
              <span className="font-semibold text-foreground"> {socialProofData.metrics.averageRetention}%+ retention</span> in one click.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600">
                Create Your First Script Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowComparison(!showComparison)}>
                See The Difference
                <MessageSquare className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Youtube className="w-4 h-4" />
                <span>YouTube-Specific AI</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>One-Click Scripts</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span>No Prompting Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prompt Comparison */}
      {showComparison && (
        <section className="py-16 bg-white dark:bg-background border-y">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold text-center mb-8">
              The Prompting Problem: 30 Minutes vs 30 Seconds
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    ChatGPT Process
                  </CardTitle>
                  <CardDescription>Multiple prompts, constant refinement</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {promptComparison.chatgpt}
                  </pre>
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      ⏱️ Average time: 30-45 minutes
                    </p>
                    <p className="text-xs mt-1">Still no retention optimization</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Subscribr Process
                  </CardTitle>
                  <CardDescription>One input, perfect output</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {promptComparison.subscribr}
                  </pre>
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ⏱️ Average time: 30 seconds
                    </p>
                    <p className="text-xs mt-1">Optimized for 68%+ retention</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Key Differentiators */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50 dark:from-background dark:to-green-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why YouTube Creators Choose Subscribr Over ChatGPT
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Purpose-built features that generic AI can't match
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <PlayCircle className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle className="text-lg">Zero Prompting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Just enter your topic. No complex prompts, no refinement needed.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle className="text-lg">Consistent Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every script follows proven retention patterns, not random generation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <Cpu className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle className="text-lg">YouTube Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI trained on viral videos, not Wikipedia and blog posts.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <Target className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle className="text-lg">Format Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Scripts formatted for teleprompters and video production.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            ChatGPT vs Subscribr: Full Comparison
          </h2>
          
          <ComparisonTable 
            competitor={chatgpt}
            ourPlatform={subscribr}
            features={comparisonFeatures}
          />
          
          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600">
              Stop Prompting, Start Creating
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50 dark:from-background dark:to-green-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Real Results from ChatGPT Switchers
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <RetentionChart 
              competitorName="ChatGPT Users"
              competitorRetention={30}
              ourRetention={68}
            />
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardHeader>
                <CardTitle>Time Saved Per Script</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">ChatGPT Process</span>
                      <span className="text-sm text-muted-foreground">30-45 min</span>
                    </div>
                    <div className="h-3 bg-red-200 dark:bg-red-900/30 rounded-full" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Subscribr Process</span>
                      <span className="text-sm font-bold text-green-600">30 sec</span>
                    </div>
                    <div className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-1/12" />
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">60x Faster</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Plus better retention results
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </div>
      </section>

      {/* Migration Offer */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <MigrationOffer
            competitor="ChatGPT"
            discount={migration.discount}
            duration={migration.duration}
            features={migration.features}
            onClaim={() => window.location.href = '/signup?ref=chatgpt-migration'}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50 dark:from-background dark:to-green-950/20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common Questions from ChatGPT Users
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
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Stop Prompting. Start Publishing.
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Get YouTube-optimized scripts in 30 seconds, not 30 minutes. 
            Join {socialProofData.metrics.totalUsers}+ creators getting {socialProofData.metrics.averageRetention}%+ retention.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Create Your First Script Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              Watch Demo
            </Button>
          </div>
          
          <p className="text-sm mt-6 opacity-75">
            No credit card • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
}