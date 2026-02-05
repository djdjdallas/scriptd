'use client';

import { useState } from 'react';
import {
  Zap, TrendingUp, Sparkles, Target, Rocket, BarChart3,
  ArrowRight, CheckCircle2, PlayCircle, Award, Users, Flame, Video
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function PVSSMethodologyPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What exactly is the PVSS framework?",
      answer: "PVSS stands for Problem, Value, Solution, Success. It's a proven viral content framework that creates emotional engagement by presenting a relatable problem, demonstrating value, offering a solution, and showing success stories. This psychological structure triggers sharing behavior."
    },
    {
      question: "Why does PVSS create viral content?",
      answer: "PVSS works because it follows the viewer's emotional journey. It creates tension (Problem), builds desire (Value), provides relief (Solution), and offers social proof (Success). This narrative arc is hardwired into human psychology and triggers sharing."
    },
    {
      question: "Does PVSS work for all niches?",
      answer: "Yes! PVSS is adaptable to any niche. Whether you're teaching, entertaining, or selling, the framework scales. We have specific templates for education, entertainment, business, lifestyle, gaming, and more."
    },
    {
      question: "How fast can I see results with PVSS?",
      answer: "Most creators see 2-3x increase in views within their first 5 PVSS videos. The framework is designed to trigger YouTube's algorithm signals: high CTR, long watch time, and engagement."
    },
    {
      question: "Can I use PVSS for shorts and long-form?",
      answer: "Absolutely! We have PVSS templates for 15-second shorts, 60-second shorts, and 10+ minute long-form content. The framework scales perfectly to any video length."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Genscript PVSS Viral Methodology Generator",
    "description": "Viral YouTube script generator using the proven PVSS framework",
    "applicationCategory": "Content Strategy Tools",
    "offers": {
      "@type": "Offer",
      "price": "79.00",
      "priceCurrency": "USD"
    }
  };

  const viralExamples = [
    { channel: "MrBeast", views: "142M", title: "I Survived 50 Hours In Antarctica", pvss: "P: Extreme cold survival, V: $10,000 prize, S: Strategic shelter building, S: Inspiring perseverance" },
    { channel: "Mark Rober", views: "86M", title: "Glitter Bomb Trap Catches Package Thieves", pvss: "P: Package theft epidemic, V: Justice served, S: Engineering revenge device, S: Thieves caught on camera" },
    { channel: "Yes Theory", views: "31M", title: "Asking Strangers to Travel the World", pvss: "P: Fear of spontaneity, V: Life-changing adventure, S: Just say yes, S: Incredible journey unfolds" }
  ];

  return (
    <div className="min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <Badge className="mb-4 bg-orange-500/20 text-orange-400">
            <Flame className="w-4 h-4 mr-1" />
            Viral Framework
          </Badge>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            PVSS Viral Methodology Script Generator - Engineer Virality Into Every Video
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl">
            Stop hoping for viral videos. Start engineering them. The PVSS framework has generated{' '}
            <span className="font-bold text-white">2.3 billion views</span> across 10,000+ videos.
            Now it's your turn to go viral - predictably and repeatedly.
          </p>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 max-w-4xl">
            <h3 className="font-bold text-lg mb-4 text-white">The PVSS Viral Formula</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-red-400">P</span>
                </div>
                <div className="font-semibold text-white">Problem</div>
                <div className="text-xs text-gray-500">Hook with pain</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-blue-400">V</span>
                </div>
                <div className="font-semibold text-white">Value</div>
                <div className="text-xs text-gray-500">Promise transformation</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-green-400">S</span>
                </div>
                <div className="font-semibold text-white">Solution</div>
                <div className="text-xs text-gray-500">Deliver method</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-purple-400">S</span>
                </div>
                <div className="font-semibold text-white">Success</div>
                <div className="text-xs text-gray-500">Prove results</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-400">73%</div>
                <div className="text-sm text-gray-400">Higher CTR</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-pink-400">4.2x</div>
                <div className="text-sm text-gray-400">More Shares</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-400">89%</div>
                <div className="text-sm text-gray-400">Watch Time</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Generate My First Viral Script <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#examples">
              <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800 text-gray-300">
                See PVSS in Action
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="examples" className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            How Top Creators Use PVSS to Go Viral
          </h2>

          <div className="space-y-6">
            {viralExamples.map((example, index) => (
              <Card key={index} className="overflow-hidden bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge className="mb-2 bg-purple-500/20 text-purple-400">{example.channel}</Badge>
                      <h3 className="text-xl font-bold text-white">{example.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{example.views}</div>
                      <div className="text-sm text-gray-500">views</div>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded p-4 border border-gray-700">
                    <p className="text-sm font-semibold mb-2 text-gray-300">PVSS Breakdown:</p>
                    <p className="text-sm text-gray-400">{example.pvss}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-500/30">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-white">
                The Secret: Emotional Journey Mapping
              </h3>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                PVSS works because it maps perfectly to the viewer's emotional journey - from
                tension to relief, from problem to transformation. This psychological arc
                triggers the sharing instinct that creates virality.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center text-white">
            Master Each Element of PVSS
          </h2>
          <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">
            Deep dive into each component of the viral framework
          </p>

          <Tabs defaultValue="research" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800">
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="value">Value</TabsTrigger>
              <TabsTrigger value="solution">Solution</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Video className="w-8 h-8 text-green-400" />
                    <h3 className="text-2xl font-bold text-white">Viral Video Analysis</h3>
                  </div>
                  <p className="mb-6 text-gray-300">
                    Extract and analyze transcripts from viral videos to reverse-engineer their PVSS structure:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Transcript Extraction</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Pull transcripts from any viral YouTube video</li>
                        <li>• AI identifies PVSS framework elements</li>
                        <li>• Study viral hooks and patterns</li>
                        <li>• 10x faster competitive research</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-white">PVSS Pattern Recognition</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Auto-detect Problem hooks in transcripts</li>
                        <li>• Extract Value propositions used</li>
                        <li>• Identify Solution delivery methods</li>
                        <li>• Analyze Success story structures</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="problem" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-red-400">
                    Problem: The Viral Hook (0-5 seconds)
                  </h3>
                  <p className="mb-6 text-gray-300">
                    Start with a problem that triggers immediate emotional response. This creates the
                    "curiosity gap" that forces viewers to keep watching.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Emotional Triggers</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Fear of missing out (FOMO)</li>
                        <li>• Frustration with status quo</li>
                        <li>• Curiosity about the unknown</li>
                        <li>• Desire for transformation</li>
                        <li>• Social comparison anxiety</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Problem Templates</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• "Why 99% of people fail at..."</li>
                        <li>• "The hidden reason you can't..."</li>
                        <li>• "What nobody tells you about..."</li>
                        <li>• "The biggest mistake that..."</li>
                        <li>• "How I lost everything by..."</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-red-500/10 rounded border border-red-500/30">
                    <p className="text-sm text-red-300">
                      <strong>Pro Tip:</strong> The problem must be felt within 3 seconds or you lose 60% of viewers
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="value" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">
                    Value: The Transformation Promise (5-15 seconds)
                  </h3>
                  <p className="mb-6 text-gray-300">
                    Show the viewer what's possible. Paint a picture of their transformed reality
                    after watching your video.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Value Amplifiers</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Specific measurable outcomes</li>
                        <li>• Time-bound results</li>
                        <li>• Social proof elements</li>
                        <li>• Contrast with current state</li>
                        <li>• Exclusive insider knowledge</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Value Statements</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• "In just X minutes, you'll..."</li>
                        <li>• "This simple trick will..."</li>
                        <li>• "Master the exact method..."</li>
                        <li>• "Join thousands who've..."</li>
                        <li>• "The secret that changed..."</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-500/10 rounded border border-blue-500/30">
                    <p className="text-sm text-blue-300">
                      <strong>Pro Tip:</strong> Stack 3 specific benefits to create overwhelming value perception
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solution" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-green-400">
                    Solution: The Method Reveal (Main Content)
                  </h3>
                  <p className="mb-6 text-gray-300">
                    Deliver on your promise with a clear, actionable solution. This is where you
                    provide the meat of your content.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Solution Structure</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Step-by-step breakdown</li>
                        <li>• Visual demonstrations</li>
                        <li>• Common mistake warnings</li>
                        <li>• Pro tips and shortcuts</li>
                        <li>• Alternative approaches</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Delivery Patterns</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Numbered list format</li>
                        <li>• Before/after comparison</li>
                        <li>• Story-based teaching</li>
                        <li>• Challenge progression</li>
                        <li>• Expert interview style</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-500/10 rounded border border-green-500/30">
                    <p className="text-sm text-green-300">
                      <strong>Pro Tip:</strong> Break complex solutions into 3-5 digestible chunks with mini-payoffs
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="success" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">
                    Success: The Proof & Call to Action (Final 20%)
                  </h3>
                  <p className="mb-6 text-gray-300">
                    Show real results and inspire action. This creates the emotional peak that
                    triggers sharing and subscribing.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Success Elements</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Real transformation stories</li>
                        <li>• Data and metrics</li>
                        <li>• Testimonials and reviews</li>
                        <li>• Personal breakthrough moment</li>
                        <li>• Community achievements</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Action Triggers</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• "Your turn to..."</li>
                        <li>• "Join 10,000+ who..."</li>
                        <li>• "Start your journey..."</li>
                        <li>• "Don't wait, because..."</li>
                        <li>• "Comment below if..."</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-purple-500/10 rounded border border-purple-500/30">
                    <p className="text-sm text-purple-300">
                      <strong>Pro Tip:</strong> End with an open loop to your next video for binge sessions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            PVSS Templates for Every Niche
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Badge className="mb-2 bg-blue-500/20 text-blue-400">Education</Badge>
                <CardTitle className="text-white">Tutorial PVSS</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li><strong className="text-white">P:</strong> Struggling with [skill]?</li>
                  <li><strong className="text-white">V:</strong> Master it in 10 minutes</li>
                  <li><strong className="text-white">S:</strong> Step-by-step method</li>
                  <li><strong className="text-white">S:</strong> Student results showcase</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Badge className="mb-2 bg-pink-500/20 text-pink-400">Entertainment</Badge>
                <CardTitle className="text-white">Challenge PVSS</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li><strong className="text-white">P:</strong> Impossible challenge</li>
                  <li><strong className="text-white">V:</strong> Epic reward/consequence</li>
                  <li><strong className="text-white">S:</strong> Attempts and struggles</li>
                  <li><strong className="text-white">S:</strong> Dramatic finale</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Badge className="mb-2 bg-green-500/20 text-green-400">Business</Badge>
                <CardTitle className="text-white">Case Study PVSS</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li><strong className="text-white">P:</strong> Business was failing</li>
                  <li><strong className="text-white">V:</strong> 10x growth possible</li>
                  <li><strong className="text-white">S:</strong> Exact strategies used</li>
                  <li><strong className="text-white">S:</strong> Revenue screenshots</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Badge className="mb-2 bg-purple-500/20 text-purple-400">Lifestyle</Badge>
                <CardTitle className="text-white">Transformation PVSS</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li><strong className="text-white">P:</strong> Unhappy with life</li>
                  <li><strong className="text-white">V:</strong> Complete transformation</li>
                  <li><strong className="text-white">S:</strong> Daily routine changes</li>
                  <li><strong className="text-white">S:</strong> Before/after reveal</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Badge className="mb-2 bg-red-500/20 text-red-400">Gaming</Badge>
                <CardTitle className="text-white">Strategy PVSS</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li><strong className="text-white">P:</strong> Stuck at low rank</li>
                  <li><strong className="text-white">V:</strong> Pro-level gameplay</li>
                  <li><strong className="text-white">S:</strong> Secret techniques</li>
                  <li><strong className="text-white">S:</strong> Rank up montage</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Badge className="mb-2 bg-cyan-500/20 text-cyan-400">Tech</Badge>
                <CardTitle className="text-white">Review PVSS</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li><strong className="text-white">P:</strong> Wasting money on tech</li>
                  <li><strong className="text-white">V:</strong> Perfect setup revealed</li>
                  <li><strong className="text-white">S:</strong> Detailed comparison</li>
                  <li><strong className="text-white">S:</strong> Performance tests</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Real Results from PVSS Users
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white">From 1K to 1M Views</h3>
                    <p className="text-gray-400 mb-4">
                      "My average views were 1-2K. First PVSS video hit 1.2M. The framework
                      is like a cheat code for the algorithm."
                    </p>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-300">@TechExplained</span>
                      <span className="text-gray-500"> • 450K subscribers</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white">3 Videos = 100K Subs</h3>
                    <p className="text-gray-400 mb-4">
                      "PVSS helped me crack the code. Three viral videos in a row, gained
                      100K subscribers in one month."
                    </p>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-300">@FitnessJourney</span>
                      <span className="text-gray-500"> • 230K subscribers</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white">Consistent Viral Hits</h3>
                    <p className="text-gray-400 mb-4">
                      "5 out of my last 7 videos went viral using PVSS. It's not luck anymore,
                      it's a system."
                    </p>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-300">@BusinessMentor</span>
                      <span className="text-gray-500"> • 890K subscribers</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white">10x Revenue Increase</h3>
                    <p className="text-gray-400 mb-4">
                      "PVSS videos get 10x more views, which means 10x ad revenue. Best
                      investment for my channel."
                    </p>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-300">@CookingMagic</span>
                      <span className="text-gray-500"> • 1.2M subscribers</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Start Creating Viral Content Today
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Creator</CardTitle>
                <div className="text-3xl font-bold text-white">$39/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>✓ 20 PVSS scripts/month</li>
                  <li>✓ Basic viral templates</li>
                  <li>✓ Niche customization</li>
                  <li>✓ Email support</li>
                </ul>
                <Link href="/signup?plan=creator">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-purple-500/50 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                Go Viral
              </Badge>
              <CardHeader>
                <CardTitle className="text-white">Professional</CardTitle>
                <div className="text-3xl font-bold text-white">$79/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>✓ Unlimited PVSS scripts</li>
                  <li>✓ Advanced viral analysis</li>
                  <li>✓ A/B testing tools</li>
                  <li>✓ Trend predictions</li>
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
                  <li>✓ Custom viral formulas</li>
                  <li>✓ 1-on-1 coaching</li>
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
          <Zap className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">
            Stop Hoping. Start Going Viral.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 10,000+ creators using PVSS to predictably create viral content
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Generate Your First Viral Script <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-800">
                Watch PVSS Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            7-day free trial • No credit card required • Viral or refund guarantee
          </p>
        </div>
      </section>
    </div>
  );
}