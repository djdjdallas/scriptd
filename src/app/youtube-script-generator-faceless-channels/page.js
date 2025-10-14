'use client';

import { useState } from 'react';
import {
  Eye, EyeOff, DollarSign, Clock, Zap, TrendingUp,
  Youtube, Shield, CheckCircle2, ArrowRight, Users, Award, Video
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function FacelessChannelScriptGeneratorPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Do I need to show my face or use my voice?",
      answer: "No! Our scripts are specifically optimized for faceless channels using stock footage and AI voices. Everything is designed for complete anonymity."
    },
    {
      question: "What niches work best for faceless channels?",
      answer: "Psychology facts, history stories, top 10 lists, finance tips, and technology explanations consistently perform best. We have templates for 25+ proven niches."
    },
    {
      question: "How long does it take to see results?",
      answer: "Most channels see improved retention within the first 5 videos. Monetization typically happens within 30-60 days with consistent uploads using our scripts."
    },
    {
      question: "Can I run multiple channels?",
      answer: "Yes! Our Professional plan supports 5 channels, and Agency supports unlimited. Many users successfully run 10+ channels with our bulk generation features."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Genscript Faceless Channel Suite",
    "description": "Automated script generation for faceless YouTube channels",
    "applicationCategory": "YouTube Automation Tools",
    "offers": {
      "@type": "Offer",
      "price": "39.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <Badge className="mb-4">
            <EyeOff className="w-4 h-4 mr-1" />
            Faceless Channel Automation
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            YouTube Script Generator for Faceless Channels That Actually Make Money
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl">
            Built specifically for faceless YouTube automation. Generate unlimited scripts optimized for{' '}
            <span className="font-bold text-gray-900">70%+ retention</span> without showing your face or recording your voice. 
            Join 500+ profitable faceless channels using our AI.
          </p>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">$47K/mo</div>
                <div className="text-sm text-gray-600">Avg Channel Revenue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">70%+</div>
                <div className="text-sm text-gray-600">Viewer Retention</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">30 sec</div>
                <div className="text-sm text-gray-600">Script Generation</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">500+</div>
                <div className="text-sm text-gray-600">Faceless Channels</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Faceless Channel <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#success-stories">
              <Button size="lg" variant="outline">
                View Success Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            The Faceless Channel Problem: Generic Scripts = Low Retention = No Money
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Without Genscript</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <span className="text-red-600">✗</span>
                    Hours writing scripts that sound robotic
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✗</span>
                    30-40% retention kills monetization
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✗</span>
                    Generic content that doesn't convert
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✗</span>
                    Inconsistent quality across videos
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">With Genscript</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    30-second script generation
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    70%+ retention for max RPM
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    Viral hooks that grab attention
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    Consistent quality at scale
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center">
            AI Script Writer Built for Faceless YouTube Channels
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Every feature designed to maximize profits without showing your face
          </p>

          <Tabs defaultValue="research" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="niches">Niches</TabsTrigger>
              <TabsTrigger value="voice">Voice Ready</TabsTrigger>
              <TabsTrigger value="scale">Scale</TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Video className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold">Competitive Research & Analysis</h3>
                  </div>
                  <p className="mb-6">Extract and analyze transcripts from successful faceless channels in your niche:</p>
                  <ul className="space-y-3">
                    <li>• Extract transcripts from any YouTube video in seconds</li>
                    <li>• AI analyzes viral hooks, topics, and patterns</li>
                    <li>• Study what works in your niche without guessing</li>
                    <li>• 10x faster competitive research for faceless channels</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">100% Automated Script Generation</h3>
                  <p className="mb-6">Upload your keyword list, generate unlimited scripts automatically:</p>
                  <ul className="space-y-3">
                    <li>• Bulk script generation (100+ scripts/hour)</li>
                    <li>• Auto-optimization for retention metrics</li>
                    <li>• Direct export to video editors</li>
                    <li>• API access for full automation</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="niches" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Pre-Built Templates for Profitable Niches</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Top Performing:</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ Top 10 Lists</li>
                        <li>✓ Psychology Facts</li>
                        <li>✓ History Stories</li>
                        <li>✓ Technology Explained</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Cash Cow Niches:</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ Finance Tips</li>
                        <li>✓ Health Facts</li>
                        <li>✓ Crime Stories</li>
                        <li>✓ Animal Facts</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Optimized for AI Voice Narration</h3>
                  <p className="mb-6">Scripts formatted perfectly for text-to-speech:</p>
                  <ul className="space-y-3">
                    <li>• Natural pauses and emphasis marks</li>
                    <li>• Pronunciation guides included</li>
                    <li>• ElevenLabs & Murf.ai optimized</li>
                    <li>• Multiple voice style options</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scale" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Scale to Multiple Channels</h3>
                  <p className="mb-6">Built for channel operators running 10+ channels:</p>
                  <ul className="space-y-3">
                    <li>• Team collaboration features</li>
                    <li>• Channel-specific voice profiles</li>
                    <li>• Bulk export and scheduling</li>
                    <li>• Performance tracking across channels</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section id="success-stories" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Faceless Channels Making $10K+ Monthly with Our Scripts
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Psychology Niche</Badge>
                  <Badge>$32K/mo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic mb-4">
                  "Scaled from 0 to 100K subs in 3 months. The scripts keep viewers watching 
                  till the end. My RPM went from $2 to $8."
                </p>
                <div className="text-sm text-gray-600">
                  <div>Channel: Mind Facts Daily</div>
                  <div>Retention: 72%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">History Niche</Badge>
                  <Badge>$18K/mo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic mb-4">
                  "Running 5 channels now. Genscript saves me 40 hours a week. 
                  Best investment for faceless YouTube."
                </p>
                <div className="text-sm text-gray-600">
                  <div>Channels: 5 Active</div>
                  <div>Total Views: 45M+</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Finance Niche</Badge>
                  <Badge>$67K/mo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic mb-4">
                  "The fact-checking feature is crucial for finance content. 
                  Never worried about strikes or misinformation."
                </p>
                <div className="text-sm text-gray-600">
                  <div>Channel: Money Wisdom</div>
                  <div>Subscribers: 890K</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Pricing Built for Faceless Channel Profitability
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            ROI in your first month or money back
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <div className="text-3xl font-bold">$39/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ 50 scripts/month</li>
                  <li>✓ 3 faceless niches</li>
                  <li>✓ Basic automation</li>
                  <li>✓ 1 channel</li>
                </ul>
                <Link href="/signup?plan=starter">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-purple-500 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <div className="text-3xl font-bold">$99/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ Unlimited scripts</li>
                  <li>✓ All niches</li>
                  <li>✓ Full automation</li>
                  <li>✓ 5 channels</li>
                  <li>✓ API access</li>
                  <li>✓ Priority support</li>
                </ul>
                <Link href="/signup?plan=professional">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agency</CardTitle>
                <div className="text-3xl font-bold">$299/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Unlimited channels</li>
                  <li>✓ Team seats</li>
                  <li>✓ Custom training</li>
                  <li>✓ White label option</li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="font-semibold flex justify-between items-center">
                    {faq.question}
                    <span className="text-gray-400">
                      {expandedFaq === index ? '−' : '+'}
                    </span>
                  </h3>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent>
                    <p>{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">
            Start Your Profitable Faceless Channel Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ creators earning $10K+ monthly without showing their face
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free 14-Day Trial <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-800">
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            No credit card required • Cancel anytime • ROI guarantee
          </p>
        </div>
      </section>
    </>
  );
}