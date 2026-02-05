'use client';

import { useState } from 'react';
import {
  Shield, CheckCircle2, AlertTriangle, BookOpen, Search,
  Award, Lock, Users, ArrowRight, BadgeCheck, Info, Video
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function FactCheckingScriptWriterPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How does the fact-checking system work?",
      answer: "Our AI cross-references every claim in your script against multiple trusted sources including academic databases, verified news outlets, and official statistics. Each fact is marked with confidence levels and source citations."
    },
    {
      question: "What sources do you use for verification?",
      answer: "We use Reuters, AP News, academic journals, government databases, and specialized industry sources. All sources are continuously updated and verified for credibility."
    },
    {
      question: "Can I use this for medical or financial content?",
      answer: "Yes! Our fact-checker is especially valuable for YMYL (Your Money or Your Life) content. We use specialized medical and financial databases to ensure accuracy and compliance."
    },
    {
      question: "What happens if a fact can't be verified?",
      answer: "Unverifiable claims are flagged with alternatives suggested. You'll see a confidence score for each fact, and we provide multiple source options for controversial topics."
    },
    {
      question: "Does it protect against copyright strikes?",
      answer: "Yes, our system checks for potential copyright issues, identifies properly attributed quotes, and ensures you're not accidentally spreading misinformation that could lead to strikes."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Genscript Fact-Checking Script Writer",
    "description": "AI script writer with built-in fact-checking for YouTube creators",
    "applicationCategory": "Content Verification Tools",
    "offers": {
      "@type": "Offer",
      "price": "59.00",
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
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-400">
            <Shield className="w-4 h-4 mr-1" />
            Verified Accuracy
          </Badge>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            AI Script Writer with Built-In Fact Checking - Never Publish Misinformation
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl">
            The only YouTube script generator that{' '}
            <span className="font-bold text-white">verifies every fact</span> before you publish.
            Protect your credibility, avoid strikes, and build trust with automated fact-checking powered by
            trusted sources.
          </p>

          <Alert className="mb-8 border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <AlertDescription className="text-emerald-300">
              <strong>Trust Score: 99.7%</strong> - Average accuracy rate across 50,000+ fact-checked scripts
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-400">5M+</div>
                <div className="text-sm text-gray-400">Facts Verified</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-400">99.7%</div>
                <div className="text-sm text-gray-400">Accuracy Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-400">0</div>
                <div className="text-sm text-gray-400">Strikes from Misinfo</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-400">10K+</div>
                <div className="text-sm text-gray-400">Trusted Creators</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Start Writing Verified Scripts <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800 text-gray-300">
                See Fact-Checking Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            The Cost of Getting Facts Wrong on YouTube
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-red-500/30">
              <CardHeader>
                <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                <CardTitle className="text-white">Channel Strikes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Spreading misinformation can lead to strikes, demonetization, or channel termination
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-orange-500/30">
              <CardHeader>
                <Users className="w-8 h-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">Lost Credibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  One factual error can destroy years of audience trust and tank your reputation
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-yellow-500/30">
              <CardHeader>
                <Search className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Algorithm Penalty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  YouTube's algorithm suppresses content flagged for misinformation
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-12 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
            <CardContent className="p-8 text-center">
              <BadgeCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-white">
                Build Unshakeable Trust with Every Video
              </h3>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Our fact-checking AI ensures every claim is accurate, every statistic is current,
                and every quote is properly attributed. Publish with confidence.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="demo" className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            See Real-Time Fact Checking in Action
          </h2>

          <Card className="max-w-4xl mx-auto bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Example: Health & Wellness Script</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-900 rounded border border-gray-700">
                  <p className="mb-2 text-gray-300">
                    "Studies show that drinking green tea can boost metabolism by up to 4%..."
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">Verified</span>
                    <span className="text-gray-500">• Source: American Journal of Clinical Nutrition (2023)</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-900 rounded border border-gray-700">
                  <p className="mb-2 text-gray-300">
                    "90% of people are vitamin D deficient..."
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">Needs Correction</span>
                    <span className="text-gray-500">• Actual: 41.6% (NIH, 2024)</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-900 rounded border border-gray-700">
                  <p className="mb-2 text-gray-300">
                    "The Mediterranean diet reduces heart disease risk by 30%..."
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">Verified</span>
                    <span className="text-gray-500">• Source: PREDIMED Study, NEJM (2023)</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-900 rounded border border-gray-700">
                  <p className="mb-2 text-gray-300">
                    "Intermittent fasting cures diabetes..."
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-semibold">False Claim</span>
                    <span className="text-gray-500">• Suggested: "may help manage blood sugar"</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-500/10 rounded border border-emerald-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Script Accuracy Score: 94%</p>
                    <p className="text-sm text-gray-400">2 corrections needed before publishing</p>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Apply Corrections</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center text-white">
            Comprehensive Fact-Checking Features
          </h2>
          <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">
            Every tool you need to create accurate, trustworthy content
          </p>

          <Tabs defaultValue="research" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800">
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="protection">Protection</TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Video className="w-8 h-8 text-green-400" />
                    <h3 className="text-2xl font-bold text-white">Transcript Extraction & Analysis</h3>
                  </div>
                  <p className="mb-6 text-gray-300">
                    Extract and verify facts from existing YouTube videos for research:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Extract Transcripts</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Pull transcripts from any YouTube video</li>
                        <li>• AI identifies key claims and statistics</li>
                        <li>• Auto-extracts source attributions</li>
                        <li>• 10x faster competitive research</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Fact Verification</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Cross-check claims from transcripts</li>
                        <li>• Verify statistics and data points</li>
                        <li>• Identify outdated information</li>
                        <li>• Build accurate scripts from research</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">Multi-Layer Verification System</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Statistical Verification</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Real-time data validation</li>
                        <li>• Historical trend checking</li>
                        <li>• Margin of error analysis</li>
                        <li>• Sample size verification</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Claim Verification</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Cross-reference multiple sources</li>
                        <li>• Consensus checking</li>
                        <li>• Expert opinion validation</li>
                        <li>• Logical consistency analysis</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sources" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">Premium Source Database</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-900 rounded border border-gray-700">
                      <BookOpen className="w-6 h-6 text-blue-400 mb-2" />
                      <h4 className="font-semibold text-white">Academic</h4>
                      <p className="text-sm text-gray-400">PubMed, JSTOR, arXiv, Google Scholar</p>
                    </div>
                    <div className="p-4 bg-gray-900 rounded border border-gray-700">
                      <Shield className="w-6 h-6 text-green-400 mb-2" />
                      <h4 className="font-semibold text-white">News</h4>
                      <p className="text-sm text-gray-400">Reuters, AP, BBC, NPR</p>
                    </div>
                    <div className="p-4 bg-gray-900 rounded border border-gray-700">
                      <Award className="w-6 h-6 text-purple-400 mb-2" />
                      <h4 className="font-semibold text-white">Official</h4>
                      <p className="text-sm text-gray-400">WHO, CDC, NASA, World Bank</p>
                    </div>
                  </div>
                  <Alert className="border-gray-700 bg-gray-900">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-gray-300">
                      All sources are continuously updated and rated for credibility using our proprietary trust algorithm
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">Platform Compliance Tools</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">YouTube Policy Checker</strong>
                        <p className="text-gray-400">Ensures compliance with YouTube's misinformation policies</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">YMYL Content Guidelines</strong>
                        <p className="text-gray-400">Special verification for health, finance, and safety content</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Medical Disclaimer Generator</strong>
                        <p className="text-gray-400">Automatic disclaimers for health-related content</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Copyright Attribution</strong>
                        <p className="text-gray-400">Proper citation formatting for all sources</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="protection" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">Creator Protection Features</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Lock className="w-8 h-8 text-blue-400 mb-3" />
                      <h4 className="font-semibold mb-2 text-white">Legal Protection</h4>
                      <p className="text-gray-400">
                        Avoid defamation claims with automated legal review of potentially problematic statements
                      </p>
                    </div>
                    <div>
                      <Shield className="w-8 h-8 text-green-400 mb-3" />
                      <h4 className="font-semibold mb-2 text-white">Strike Prevention</h4>
                      <p className="text-gray-400">
                        Pre-emptively identify content that could trigger community guideline strikes
                      </p>
                    </div>
                    <div>
                      <BadgeCheck className="w-8 h-8 text-purple-400 mb-3" />
                      <h4 className="font-semibold mb-2 text-white">Credibility Score</h4>
                      <p className="text-gray-400">
                        Build audience trust with transparency reports showing your accuracy rate
                      </p>
                    </div>
                    <div>
                      <AlertTriangle className="w-8 h-8 text-orange-400 mb-3" />
                      <h4 className="font-semibold mb-2 text-white">Controversy Alerts</h4>
                      <p className="text-gray-400">
                        Get warned about controversial topics with multiple viewpoint options
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Trusted by Educational Creators & News Channels
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400">Education</Badge>
                  <Badge className="bg-gray-700 text-gray-300">2.3M Subs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic mb-4 text-gray-300">
                  "As a science educator, accuracy is everything. Genscript's fact-checking has saved
                  me from countless errors and given me confidence in my content."
                </p>
                <div className="text-sm text-gray-400">
                  <div>Channel: SciShow Extra</div>
                  <div>Accuracy Rate: 99.8%</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400">Health</Badge>
                  <Badge className="bg-gray-700 text-gray-300">890K Subs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic mb-4 text-gray-300">
                  "Medical misinformation can be dangerous. This tool ensures every health claim I make
                  is backed by peer-reviewed research."
                </p>
                <div className="text-sm text-gray-400">
                  <div>Channel: Dr. Mike Explains</div>
                  <div>Zero Strikes in 3 Years</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-400">Finance</Badge>
                  <Badge className="bg-gray-700 text-gray-300">1.5M Subs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic mb-4 text-gray-300">
                  "Financial advice requires extreme accuracy. The fact-checker catches outdated laws
                  and ensures compliance with regulations."
                </p>
                <div className="text-sm text-gray-400">
                  <div>Channel: Money Matters Daily</div>
                  <div>100% Compliance Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Pricing for Responsible Creators
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Creator</CardTitle>
                <div className="text-3xl font-bold text-white">$39/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>✓ 30 fact-checked scripts/mo</li>
                  <li>✓ Basic source verification</li>
                  <li>✓ Accuracy reports</li>
                  <li>✓ Email support</li>
                </ul>
                <Link href="/signup?plan=creator">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-purple-500/50 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                Most Trusted
              </Badge>
              <CardHeader>
                <CardTitle className="text-white">Professional</CardTitle>
                <div className="text-3xl font-bold text-white">$79/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>✓ Unlimited fact-checking</li>
                  <li>✓ Premium source access</li>
                  <li>✓ Legal review included</li>
                  <li>✓ Controversy alerts</li>
                  <li>✓ API access</li>
                  <li>✓ Priority support</li>
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
                  <li>✓ Custom source integration</li>
                  <li>✓ Team collaboration</li>
                  <li>✓ Compliance training</li>
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
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">
            Build Trust. Avoid Strikes. Grow with Confidence.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 10,000+ creators publishing fact-checked content with zero strikes
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Writing Verified Scripts <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-800">
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            14-day free trial • No credit card required • 99.7% accuracy guaranteed
          </p>
        </div>
      </section>
    </div>
  );
}