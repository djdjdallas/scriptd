'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowRight, Zap, TrendingUp, Shield, Users, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';
import InternalLinkingSection from '@/components/alternatives/InternalLinkingSection';

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
    { feature: 'Transcript Extraction', vidiq: false, genscript: 'AI-powered competitive research' },
    { feature: 'Retention Optimization', vidiq: false, genscript: '70%+ AVD targeting' },
    { feature: 'Voice Matching', vidiq: false, genscript: 'Authentic creator voice' },
    { feature: 'Fact Checking', vidiq: false, genscript: 'Built-in verification' },
    { feature: 'PVSS Structure', vidiq: false, genscript: 'Proven viral framework' },
    { feature: 'Psychographic Targeting', vidiq: 'Basic', genscript: 'Advanced AI analysis' },
    { feature: 'Script Generation', vidiq: 'Templates only', genscript: 'Full AI generation' },
    { feature: 'Quality Tiers', vidiq: false, genscript: 'Fast/Balanced/Premium' },
    { feature: 'SEO Optimization', vidiq: true, genscript: true },
    { feature: 'Thumbnail Analysis', vidiq: true, genscript: 'AI-powered creation' },
    { feature: 'Pricing', vidiq: '$7.50-$39/mo', genscript: '$39-$199/mo' },
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
      question: 'Is there a VidIQ alternative that actually writes scripts?',
      answer: 'Yes! Genscript is specifically designed for YouTube script generation, unlike VidIQ which focuses on SEO and analytics. We create complete, retention-optimized scripts in 30 seconds with voice matching and fact-checking built in.'
    },
    {
      question: 'How does Genscript compare to VidIQ for YouTube retention optimization?',
      answer: 'While VidIQ provides analytics and SEO tools, Genscript actively optimizes your scripts for 70%+ retention using AI trained on millions of viral videos. Our users report 2x higher retention rates compared to traditional scripting methods.'
    },
    {
      question: 'Can I use Genscript as a VidIQ alternative for keyword research and script writing?',
      answer: 'Absolutely! Genscript includes keyword optimization features plus advanced script generation that VidIQ lacks. Many creators use both tools together - VidIQ for research and Genscript for creating the actual content.'
    },
    {
      question: 'What makes Genscript better than VidIQ for faceless YouTube channels?',
      answer: 'Faceless channels rely entirely on script quality to keep viewers engaged. Genscript\'s retention optimization, voice matching, and PVSS framework create scripts specifically designed for faceless content, unlike VidIQ\'s generic SEO approach.'
    },
    {
      question: 'How easy is it to switch from VidIQ?',
      answer: 'Extremely easy! You can start using Genscript immediately - no data migration needed. Our onboarding team provides free setup assistance for all new users switching from VidIQ.'
    },
    {
      question: 'Is the pricing worth it compared to VidIQ?',
      answer: 'While our starting price is slightly higher, users report 3-5x ROI within the first month through improved retention and monetization. We also offer a 14-day free trial.'
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Genscript",
    "applicationCategory": "YouTube Script Generator",
    "operatingSystem": "Web",
    "alternativeOf": {
      "@type": "SoftwareApplication",
      "name": "VidIQ"
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
        id="vidiq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Star className="w-4 h-4 mr-1" />
              Trusted by 200+ Creators
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              VidIQ Alternative for YouTube Script Generation with Retention Optimization
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              While VidIQ focuses on SEO, we optimize your scripts for <span className="font-semibold text-foreground">70%+ viewer retention</span>. 
              See why thousands of creators switched to Genscript for viral-ready content.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Start Creating YouTube Scripts with 70%+ Retention
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
            VidIQ vs Specialized YouTube Script Generator: Feature Comparison
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
              Switch from VidIQ to Specialized YouTube Tools
              <Zap className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Unique Value Props */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why Genscript is the Best VidIQ Alternative for Script Writing in 2025
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            VidIQ helps you get discovered. We help you keep viewers watching with retention-optimized scripts.
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

      {/* VidIQ Alternative with Fact Checking Section */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            VidIQ Alternative with Built-in Fact Checking and Voice Matching
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Unlike VidIQ's SEO-only approach, Genscript ensures every script is factually accurate and matches your unique voice
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <Shield className="w-12 h-12 text-purple-600 mb-3" />
                <CardTitle className="text-xl">YouTube Script Generator with Built-in Fact Checker 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Never publish misinformation again. Unlike VidIQ, which focuses on keywords, Genscript verifies every 
                  claim and statistic in your scripts with real-time fact-checking powered by trusted sources.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Automatic source verification for all claims</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Real-time fact-checking during generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Citation links included for transparency</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <Users className="w-12 h-12 text-purple-600 mb-3" />
                <CardTitle className="text-xl">AI Script Writer That Adapts to Creator Voice Style</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Your scripts sound authentically you. Our voice matching technology analyzes your existing content 
                  to maintain consistency, something VidIQ's keyword tools can't provide.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Analyzes your speaking patterns and vocabulary</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Maintains your unique storytelling style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Perfect for maintaining brand consistency</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Switch from SEO to Retention Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Switch from VidIQ SEO to Retention-First YouTube Scripts
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Retention Analytics vs SEO: Why Scripts Matter More Than Keywords
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl font-bold text-purple-600 mb-2">35%</div>
                <CardTitle className="text-lg">VidIQ SEO Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Average retention with keyword-focused content
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-purple-500">
              <CardHeader>
                <div className="text-4xl font-bold text-purple-600 mb-2">72%</div>
                <CardTitle className="text-lg">Genscript Scripts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Average retention with psychology-optimized scripts
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl font-bold text-purple-600 mb-2">3.2x</div>
                <CardTitle className="text-lg">Revenue Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Higher monetization from better watch time
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">VidIQ Alternative for Faceless YouTube Automation</h3>
              <p className="mb-6">
                Running a faceless channel? Your script IS your content. While VidIQ helps with discovery, 
                Genscript ensures viewers stay engaged without on-camera charisma. Our PVSS framework and 
                psychographic targeting create scripts that hook viewers from second one.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Perfect for:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Educational content channels</li>
                    <li>• Documentary-style videos</li>
                    <li>• Explainer and how-to content</li>
                    <li>• News and commentary channels</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Benefits:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• No personality needed - script does the work</li>
                    <li>• Consistent quality across all videos</li>
                    <li>• Scale content production efficiently</li>
                    <li>• Maintain high retention without face reveal</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/for/faceless-channels">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Learn More About Faceless Channel Scripts
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
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
              Join 200+ Creators Getting Better Results
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
              Generate Your First Viral Script in 30 Seconds
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Psychographic and Multi-Tier Features */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">YouTube Script Generator with Psychographic Analysis</h3>
              <p className="text-muted-foreground mb-6">
                Unlike VidIQ, Genscript analyzes your audience's psychology to create scripts that resonate on a deeper level. 
                We go beyond demographics to understand what truly motivates your viewers.
              </p>
              <Card className="border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-3">Psychographic Targeting Includes:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Emotional trigger identification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Value system alignment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Interest and passion mapping</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Behavioral pattern analysis</span>
                    </li>
                  </ul>
                  <div className="mt-4">
                    <Link href="/features/psychographic-targeting">
                      <Button variant="outline" size="sm">
                        Learn More About Psychographic Targeting
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">Fast, Premium, Balanced: YouTube Script Generator Quality Tiers</h3>
              <p className="text-muted-foreground mb-6">
                Choose your speed and quality preference. VidIQ gives you templates; we give you flexibility with three 
                generation modes tailored to your needs.
              </p>
              <div className="space-y-3">
                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-green-600">Fast Mode</h5>
                      <p className="text-sm text-muted-foreground">30 seconds • Good for daily content</p>
                    </div>
                    <Zap className="w-6 h-6 text-green-500" />
                  </CardContent>
                </Card>
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-blue-600">Balanced Mode</h5>
                      <p className="text-sm text-muted-foreground">2 minutes • Optimal quality/speed</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </CardContent>
                </Card>
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-purple-600">Premium Mode</h5>
                      <p className="text-sm text-muted-foreground">5 minutes • Maximum retention</p>
                    </div>
                    <Star className="w-6 h-6 text-purple-500" />
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4">
                <Link href="/features/quality-tiers">
                  <Button variant="outline" size="sm">
                    Compare Quality Tiers
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* PVSS Methodology Section */}
          <Card className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">PVSS Structure YouTube Script Generator Tool</h3>
              <p className="mb-6">
                Scripts built on proven viral content frameworks. The PVSS (Pattern-Value-Story-Surprise) methodology 
                has generated over 2.5 billion views for our users - something VidIQ's keyword tools alone can't achieve.
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-white dark:bg-background rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-purple-600">P</div>
                  </div>
                  <h5 className="font-semibold">Pattern</h5>
                  <p className="text-sm text-muted-foreground">Hook with familiar concepts</p>
                </div>
                <div className="text-center">
                  <div className="bg-white dark:bg-background rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-purple-600">V</div>
                  </div>
                  <h5 className="font-semibold">Value</h5>
                  <p className="text-sm text-muted-foreground">Deliver immediate benefit</p>
                </div>
                <div className="text-center">
                  <div className="bg-white dark:bg-background rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-purple-600">S</div>
                  </div>
                  <h5 className="font-semibold">Story</h5>
                  <p className="text-sm text-muted-foreground">Engage with narrative</p>
                </div>
                <div className="text-center">
                  <div className="bg-white dark:bg-background rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-purple-600">S</div>
                  </div>
                  <h5 className="font-semibold">Surprise</h5>
                  <p className="text-sm text-muted-foreground">Twist for memorability</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/features/pvss-framework">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Learn the PVSS Framework
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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

      {/* Internal Linking Section */}
      <InternalLinkingSection currentPage="vidiq" />

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
                Get the YouTube Script Generator Built for Retention
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