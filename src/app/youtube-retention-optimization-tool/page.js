'use client';

import { useState } from 'react';
import { 
  TrendingUp, BarChart3, Clock, AlertCircle, PlayCircle,
  ChevronRight, ArrowRight, Target, Zap, Award, Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function RetentionOptimizationToolPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How does the retention optimization tool work?",
      answer: "Our AI analyzes millions of high-performing videos to identify retention patterns. It then applies these patterns to your scripts, optimizing hooks, pacing, and story structure for maximum viewer retention."
    },
    {
      question: "What retention rate can I expect?",
      answer: "Most creators see 70-85% average view duration with our optimized scripts. This is significantly higher than the YouTube average of 50% and directly impacts your video's reach and monetization."
    },
    {
      question: "Does it work for all video types?",
      answer: "Yes! We have retention models for tutorials, entertainment, education, vlogs, and more. The tool adapts its optimization strategy based on your content type and audience."
    },
    {
      question: "How quickly will I see results?",
      answer: "You'll see retention improvements in your very first video. Most creators report 20-30% retention increase within their first 5 videos using our tool."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Genscript Retention Optimization Tool",
    "description": "YouTube retention optimization tool for 70%+ average view duration",
    "applicationCategory": "YouTube Analytics Tools",
    "offers": {
      "@type": "Offer",
      "price": "49.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <Badge className="mb-4">
            <TrendingUp className="w-4 h-4 mr-1" />
            Retention Optimization
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            YouTube Retention Optimization Tool - Get 70%+ Average View Duration
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl">
            Stop losing viewers in the first 30 seconds. Our AI-powered retention optimizer analyzes 
            <span className="font-bold text-gray-900"> 10M+ viral videos</span> to craft scripts that keep viewers watching until the end.
            Boost your retention from 40% to 70%+ instantly.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-4xl">
            <h3 className="font-semibold mb-4">Live Retention Comparison</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Before Genscript</span>
                  <span className="font-bold text-red-600">42% AVD</span>
                </div>
                <Progress value={42} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">After Genscript</span>
                  <span className="font-bold text-green-600">78% AVD</span>
                </div>
                <Progress value={78} className="h-3 bg-green-100" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              *Average results from 1,247 creators using our retention optimizer
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Optimize My Retention <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#case-studies">
              <Button size="lg" variant="outline">
                See Case Studies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Low Retention = Killed by the Algorithm
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-red-200">
              <CardHeader>
                <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
                <CardTitle>The 30-Second Drop</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Lose 60% of viewers in the first 30 seconds? YouTube stops recommending your video.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
                <CardTitle>Poor Session Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Low retention hurts overall session time, reducing your channel's authority.
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader>
                <Clock className="w-8 h-8 text-yellow-600 mb-2" />
                <CardTitle>Lower RPM</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advertisers pay less for videos with poor retention. Your RPM can drop by 70%.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                The Solution: AI-Optimized Scripts That Hook & Hold
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our retention optimizer uses proven psychological triggers, perfect pacing, and 
                data from millions of successful videos to keep viewers glued to their screens.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center">
            How Our Retention Optimization Works
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Four-step process to transform your scripts into retention magnets
          </p>

          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analyze">1. Analyze</TabsTrigger>
              <TabsTrigger value="optimize">2. Optimize</TabsTrigger>
              <TabsTrigger value="enhance">3. Enhance</TabsTrigger>
              <TabsTrigger value="predict">4. Predict</TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Pattern Recognition Analysis</h3>
                  <p className="mb-6">Our AI studies retention graphs from 10M+ successful videos:</p>
                  <ul className="space-y-3">
                    <li>• Identify exact moments viewers click away</li>
                    <li>• Map emotional peaks and valleys</li>
                    <li>• Analyze pacing patterns that work</li>
                    <li>• Study hook effectiveness across niches</li>
                  </ul>
                  <div className="mt-6 p-4 bg-blue-50 rounded">
                    <p className="text-sm">
                      <strong>Result:</strong> We know exactly what makes viewers stay or leave
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="optimize" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Hook & Structure Optimization</h3>
                  <p className="mb-6">Apply proven retention techniques to your script:</p>
                  <ul className="space-y-3">
                    <li>• Pattern interrupt every 8-15 seconds</li>
                    <li>• Curiosity loops that create binge sessions</li>
                    <li>• Open loops closed at strategic moments</li>
                    <li>• Micro-commitments that build investment</li>
                  </ul>
                  <div className="mt-6 p-4 bg-green-50 rounded">
                    <p className="text-sm">
                      <strong>Result:</strong> Scripts engineered for maximum watch time
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enhance" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Pacing & Energy Enhancement</h3>
                  <p className="mb-6">Fine-tune delivery for sustained attention:</p>
                  <ul className="space-y-3">
                    <li>• Dynamic pacing markers for editors</li>
                    <li>• Energy spikes at retention danger zones</li>
                    <li>• Visual cue suggestions every 3-5 seconds</li>
                    <li>• Audio emphasis points for key moments</li>
                  </ul>
                  <div className="mt-6 p-4 bg-purple-50 rounded">
                    <p className="text-sm">
                      <strong>Result:</strong> Perfect rhythm that matches viewer psychology
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predict" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Retention Prediction Score</h3>
                  <p className="mb-6">Know your retention before you hit publish:</p>
                  <ul className="space-y-3">
                    <li>• Predicted retention curve visualization</li>
                    <li>• Drop-off risk alerts with solutions</li>
                    <li>• Comparative analysis with top performers</li>
                    <li>• Specific improvement recommendations</li>
                  </ul>
                  <div className="mt-6 p-4 bg-orange-50 rounded">
                    <p className="text-sm">
                      <strong>Result:</strong> Publish with confidence knowing you'll hit 70%+
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section id="case-studies" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Real Retention Improvements from Real Creators
          </h2>
          
          <div className="space-y-8">
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Badge className="mb-4">Tech Tutorial Channel</Badge>
                    <h3 className="text-xl font-bold mb-2">
                      CodeWithChris: 38% → 71% AVD
                    </h3>
                    <p className="text-gray-600 mb-4">
                      "My programming tutorials were losing viewers after the intro. Genscript's retention 
                      optimizer showed me how to hook developers immediately. Now my videos rank #1 for 
                      competitive keywords."
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span><strong>Views:</strong> +340%</span>
                      <span><strong>RPM:</strong> $12 → $28</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-4">
                    <h4 className="font-semibold mb-2">Retention Graph</h4>
                    <div className="space-y-2">
                      <div className="text-sm">Before: Sharp drop at 0:15</div>
                      <Progress value={38} className="h-2" />
                      <div className="text-sm">After: Consistent retention</div>
                      <Progress value={71} className="h-2 bg-green-100" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Badge className="mb-4">Education Channel</Badge>
                    <h3 className="text-xl font-bold mb-2">
                      History Matters: 45% → 82% AVD
                    </h3>
                    <p className="text-gray-600 mb-4">
                      "Educational content is tough to keep engaging. The retention optimizer helped me 
                      add story elements and cliffhangers that make history addictive. My channel grew 
                      from 50K to 500K subs in 6 months."
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span><strong>Subscribers:</strong> +900%</span>
                      <span><strong>Watch Time:</strong> +1,200%</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-4">
                    <h4 className="font-semibold mb-2">Retention Graph</h4>
                    <div className="space-y-2">
                      <div className="text-sm">Before: Gradual decline</div>
                      <Progress value={45} className="h-2" />
                      <div className="text-sm">After: Near-flat retention</div>
                      <Progress value={82} className="h-2 bg-green-100" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Badge className="mb-4">Entertainment Channel</Badge>
                    <h3 className="text-xl font-bold mb-2">
                      Daily Dose of Internet: 52% → 88% AVD
                    </h3>
                    <p className="text-gray-600 mb-4">
                      "Even with short, punchy content, retention matters. The tool helped me perfect 
                      my pacing and transitions. Now YouTube promotes my videos to millions more viewers."
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span><strong>Impressions:</strong> +500%</span>
                      <span><strong>CTR:</strong> 8% → 14%</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-4">
                    <h4 className="font-semibold mb-2">Retention Graph</h4>
                    <div className="space-y-2">
                      <div className="text-sm">Before: Multiple drop-offs</div>
                      <Progress value={52} className="h-2" />
                      <div className="text-sm">After: Smooth curve</div>
                      <Progress value={88} className="h-2 bg-green-100" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Features Built for Maximum Retention
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Hook Library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  1,000+ proven hooks categorized by niche, all tested for 80%+ 30-second retention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-yellow-600 mb-2" />
                <CardTitle>Pattern Interrupts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automatic insertion of pattern interrupts at optimal moments to reset attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <PlayCircle className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Binge Triggers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  End screen optimization that leads to 3x more playlist watch time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  See predicted retention curve as you write, with danger zones highlighted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-orange-600 mb-2" />
                <CardTitle>Audience Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Retention optimization based on your specific audience demographics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="w-8 h-8 text-red-600 mb-2" />
                <CardTitle>A/B Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Test multiple retention strategies and see which performs best
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Pricing That Pays for Itself
          </h2>
          
          <Card className="max-w-2xl mx-auto mb-12">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">ROI Calculator</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Current Average Views:</span>
                  <span className="font-bold">10,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Retention:</span>
                  <span className="font-bold">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Optimized Retention:</span>
                  <span className="font-bold text-green-600">70%</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span>Estimated View Increase:</span>
                    <span className="font-bold text-green-600">+175%</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Estimated Revenue Increase:</span>
                    <span className="font-bold text-green-600">+$2,450/mo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <div className="text-3xl font-bold">$49/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ 20 optimized scripts/month</li>
                  <li>✓ Basic retention analysis</li>
                  <li>✓ Hook library access</li>
                  <li>✓ Email support</li>
                </ul>
                <Link href="/signup?plan=starter">
                  <Button className="w-full">Start Optimizing</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-blue-500 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Best Value
              </Badge>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <div className="text-3xl font-bold">$99/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ Unlimited optimizations</li>
                  <li>✓ Advanced AI analysis</li>
                  <li>✓ Custom audience profiles</li>
                  <li>✓ A/B testing tools</li>
                  <li>✓ Priority support</li>
                  <li>✓ API access</li>
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
                  <li>✓ Multi-channel management</li>
                  <li>✓ Team collaboration</li>
                  <li>✓ Custom AI training</li>
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

      <section className="py-16 px-4 bg-gray-50">
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

      <section className="py-20 px-4 bg-gradient-to-b from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">
            Stop Losing Viewers. Start Growing.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 2,000+ creators achieving 70%+ retention with every video
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Optimize My Retention Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-800">
                See Live Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            Free 7-day trial • No credit card required • Results guaranteed
          </p>
        </div>
      </section>
    </>
  );
}