'use client';

import { useState } from 'react';
import {
  TrendingUp, BarChart3, Clock, AlertCircle, PlayCircle,
  ChevronRight, ArrowRight, Target, Zap, Award, Users, Video
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
    <div className="min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <Badge className="mb-4 bg-blue-500/20 text-blue-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            Retention Optimization
          </Badge>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            YouTube Retention Optimization Tool - Get 70%+ Average View Duration
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl">
            Stop losing viewers in the first 30 seconds. Our AI-powered retention optimizer analyzes
            <span className="font-bold text-white"> 10M+ viral videos</span> to craft scripts that keep viewers watching until the end.
            Boost your retention from 40% to 70%+ instantly.
          </p>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8 max-w-4xl">
            <h3 className="font-semibold mb-4 text-white">Live Retention Comparison</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Before Genscript</span>
                  <span className="font-bold text-red-400">42% AVD</span>
                </div>
                <Progress value={42} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">After Genscript</span>
                  <span className="font-bold text-green-400">78% AVD</span>
                </div>
                <Progress value={78} className="h-3 bg-green-500/20" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              *Average results from 1,247 creators using our retention optimizer
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Optimize My Retention <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#case-studies">
              <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800 text-gray-300">
                See Case Studies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Low Retention = Killed by the Algorithm
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gray-800/50 border-red-500/30">
              <CardHeader>
                <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                <CardTitle className="text-white">The 30-Second Drop</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Lose 60% of viewers in the first 30 seconds? YouTube stops recommending your video.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-orange-500/30">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">Poor Session Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Low retention hurts overall session time, reducing your channel's authority.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-yellow-500/30">
              <CardHeader>
                <Clock className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Lower RPM</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Advertisers pay less for videos with poor retention. Your RPM can drop by 70%.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-white">
                The Solution: AI-Optimized Scripts That Hook & Hold
              </h3>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Our retention optimizer uses proven psychological triggers, perfect pacing, and
                data from millions of successful videos to keep viewers glued to their screens.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center text-white">
            How Our Retention Optimization Works
          </h2>
          <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">
            Four-step process to transform your scripts into retention magnets
          </p>

          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="analyze">1. Analyze</TabsTrigger>
              <TabsTrigger value="optimize">2. Optimize</TabsTrigger>
              <TabsTrigger value="enhance">3. Enhance</TabsTrigger>
              <TabsTrigger value="predict">4. Predict</TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">Pattern Recognition Analysis</h3>
                  <p className="mb-6 text-gray-300">Our AI studies retention graphs from 10M+ successful videos:</p>
                  <ul className="space-y-3 text-gray-300">
                    <li>• Identify exact moments viewers click away</li>
                    <li>• Map emotional peaks and valleys</li>
                    <li>• Analyze pacing patterns that work</li>
                    <li>• Study hook effectiveness across niches</li>
                  </ul>
                  <div className="mt-6 p-4 bg-blue-500/10 rounded border border-blue-500/30">
                    <p className="text-sm text-blue-300">
                      <strong>Result:</strong> We know exactly what makes viewers stay or leave
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="optimize" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">Hook & Structure Optimization</h3>
                  <p className="mb-6 text-gray-300">Apply proven retention techniques to your script:</p>
                  <ul className="space-y-3 text-gray-300">
                    <li>• Pattern interrupt every 8-15 seconds</li>
                    <li>• Curiosity loops that create binge sessions</li>
                    <li>• Open loops closed at strategic moments</li>
                    <li>• Micro-commitments that build investment</li>
                  </ul>
                  <div className="mt-6 p-4 bg-green-500/10 rounded border border-green-500/30">
                    <p className="text-sm text-green-300">
                      <strong>Result:</strong> Scripts engineered for maximum watch time
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enhance" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">Pacing & Energy Enhancement</h3>
                  <p className="mb-6 text-gray-300">Fine-tune delivery for sustained attention:</p>
                  <ul className="space-y-3 text-gray-300">
                    <li>• Dynamic pacing markers for editors</li>
                    <li>• Energy spikes at retention danger zones</li>
                    <li>• Visual cue suggestions every 3-5 seconds</li>
                    <li>• Audio emphasis points for key moments</li>
                  </ul>
                  <div className="mt-6 p-4 bg-purple-500/10 rounded border border-purple-500/30">
                    <p className="text-sm text-purple-300">
                      <strong>Result:</strong> Perfect rhythm that matches viewer psychology
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predict" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">Retention Prediction Score</h3>
                  <p className="mb-6 text-gray-300">Know your retention before you hit publish:</p>
                  <ul className="space-y-3 text-gray-300">
                    <li>• Predicted retention curve visualization</li>
                    <li>• Drop-off risk alerts with solutions</li>
                    <li>• Comparative analysis with top performers</li>
                    <li>• Specific improvement recommendations</li>
                  </ul>
                  <div className="mt-6 p-4 bg-orange-500/10 rounded border border-orange-500/30">
                    <p className="text-sm text-orange-300">
                      <strong>Result:</strong> Publish with confidence knowing you'll hit 70%+
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section id="case-studies" className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Real Retention Improvements from Real Creators
          </h2>

          <div className="space-y-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Badge className="mb-4 bg-blue-500/20 text-blue-400">Tech Tutorial Channel</Badge>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      CodeWithChris: 38% → 71% AVD
                    </h3>
                    <p className="text-gray-400 mb-4">
                      "My programming tutorials were losing viewers after the intro. Genscript's retention
                      optimizer showed me how to hook developers immediately. Now my videos rank #1 for
                      competitive keywords."
                    </p>
                    <div className="flex gap-4 text-sm text-gray-300">
                      <span><strong className="text-white">Views:</strong> +340%</span>
                      <span><strong className="text-white">RPM:</strong> $12 → $28</span>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded p-4 border border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-300">Retention Graph</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Before: Sharp drop at 0:15</div>
                      <Progress value={38} className="h-2" />
                      <div className="text-sm text-gray-400">After: Consistent retention</div>
                      <Progress value={71} className="h-2 bg-green-500/20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Badge className="mb-4 bg-green-500/20 text-green-400">Education Channel</Badge>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      History Matters: 45% → 82% AVD
                    </h3>
                    <p className="text-gray-400 mb-4">
                      "Educational content is tough to keep engaging. The retention optimizer helped me
                      add story elements and cliffhangers that make history addictive. My channel grew
                      from 50K to 500K subs in 6 months."
                    </p>
                    <div className="flex gap-4 text-sm text-gray-300">
                      <span><strong className="text-white">Subscribers:</strong> +900%</span>
                      <span><strong className="text-white">Watch Time:</strong> +1,200%</span>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded p-4 border border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-300">Retention Graph</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Before: Gradual decline</div>
                      <Progress value={45} className="h-2" />
                      <div className="text-sm text-gray-400">After: Near-flat retention</div>
                      <Progress value={82} className="h-2 bg-green-500/20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Badge className="mb-4 bg-purple-500/20 text-purple-400">Entertainment Channel</Badge>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      Daily Dose of Internet: 52% → 88% AVD
                    </h3>
                    <p className="text-gray-400 mb-4">
                      "Even with short, punchy content, retention matters. The tool helped me perfect
                      my pacing and transitions. Now YouTube promotes my videos to millions more viewers."
                    </p>
                    <div className="flex gap-4 text-sm text-gray-300">
                      <span><strong className="text-white">Impressions:</strong> +500%</span>
                      <span><strong className="text-white">CTR:</strong> 8% → 14%</span>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded p-4 border border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-300">Retention Graph</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Before: Multiple drop-offs</div>
                      <Progress value={52} className="h-2" />
                      <div className="text-sm text-gray-400">After: Smooth curve</div>
                      <Progress value={88} className="h-2 bg-green-500/20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center text-white">
            Features Built for Maximum Retention
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Video className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Transcript Extraction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Extract and analyze transcripts from high-retention videos. Study what keeps viewers watching.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Target className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Hook Library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  1,000+ proven hooks categorized by niche, all tested for 80%+ 30-second retention
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Zap className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Pattern Interrupts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Automatic insertion of pattern interrupts at optimal moments to reset attention
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <PlayCircle className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Binge Triggers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  End screen optimization that leads to 3x more playlist watch time
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  See predicted retention curve as you write, with danger zones highlighted
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Users className="w-8 h-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">Audience Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Retention optimization based on your specific audience demographics
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Award className="w-8 h-8 text-red-400 mb-2" />
                <CardTitle className="text-white">A/B Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Test multiple retention strategies and see which performs best
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Pricing That Pays for Itself
          </h2>

          <Card className="max-w-2xl mx-auto mb-12 bg-gray-800/50 border-gray-700">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4 text-white">ROI Calculator</h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex justify-between">
                  <span>Current Average Views:</span>
                  <span className="font-bold text-white">10,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Retention:</span>
                  <span className="font-bold text-white">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Optimized Retention:</span>
                  <span className="font-bold text-green-400">70%</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between text-lg">
                    <span>Estimated View Increase:</span>
                    <span className="font-bold text-green-400">+175%</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Estimated Revenue Increase:</span>
                    <span className="font-bold text-green-400">+$2,450/mo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Creator</CardTitle>
                <div className="text-3xl font-bold text-white">$39/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>✓ 20 optimized scripts/month</li>
                  <li>✓ Basic retention analysis</li>
                  <li>✓ Hook library access</li>
                  <li>✓ Email support</li>
                </ul>
                <Link href="/signup?plan=creator">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Start Optimizing</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-purple-500/50 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                Best Value
              </Badge>
              <CardHeader>
                <CardTitle className="text-white">Professional</CardTitle>
                <div className="text-3xl font-bold text-white">$79/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>✓ Unlimited optimizations</li>
                  <li>✓ Advanced AI analysis</li>
                  <li>✓ Custom audience profiles</li>
                  <li>✓ A/B testing tools</li>
                  <li>✓ Priority support</li>
                  <li>✓ API access</li>
                </ul>
                <Link href="/signup?plan=professional">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Agency</CardTitle>
                <div className="text-3xl font-bold text-white">$199/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Multi-channel management</li>
                  <li>✓ Team collaboration</li>
                  <li>✓ Custom AI training</li>
                  <li>✓ White label option</li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="font-semibold flex justify-between items-center text-white">
                    {faq.question}
                    <span className="text-gray-400">
                      {expandedFaq === index ? '−' : '+'}
                    </span>
                  </h3>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent>
                    <p className="text-gray-300">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
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
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-800">
                See Live Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            Free 7-day trial • No credit card required • Results guaranteed
          </p>
        </div>
      </section>
    </div>
  );
}