'use client';

import { useState } from 'react';
import { 
  Shield, CheckCircle2, AlertTriangle, BookOpen, Search,
  Award, Lock, Users, ArrowRight, BadgeCheck, Info
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <Badge className="mb-4">
            <Shield className="w-4 h-4 mr-1" />
            Verified Accuracy
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            AI Script Writer with Built-In Fact Checking - Never Publish Misinformation
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl">
            The only YouTube script generator that{' '}
            <span className="font-bold text-gray-900">verifies every fact</span> before you publish. 
            Protect your credibility, avoid strikes, and build trust with automated fact-checking powered by 
            trusted sources.
          </p>

          <Alert className="mb-8 border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              <strong>Trust Score: 99.7%</strong> - Average accuracy rate across 50,000+ fact-checked scripts
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-600">5M+</div>
                <div className="text-sm text-gray-600">Facts Verified</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">99.7%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Strikes from Misinfo</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">10K+</div>
                <div className="text-sm text-gray-600">Trusted Creators</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Writing Verified Scripts <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline">
                See Fact-Checking Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            The Cost of Getting Facts Wrong on YouTube
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <CardTitle className="text-red-800">Channel Strikes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Spreading misinformation can lead to strikes, demonetization, or channel termination
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <Users className="w-8 h-8 text-orange-600 mb-2" />
                <CardTitle className="text-orange-800">Lost Credibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  One factual error can destroy years of audience trust and tank your reputation
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <Search className="w-8 h-8 text-yellow-600 mb-2" />
                <CardTitle className="text-yellow-800">Algorithm Penalty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  YouTube's algorithm suppresses content flagged for misinformation
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-12 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-8 text-center">
              <BadgeCheck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Build Unshakeable Trust with Every Video
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our fact-checking AI ensures every claim is accurate, every statistic is current, 
                and every quote is properly attributed. Publish with confidence.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="demo" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            See Real-Time Fact Checking in Action
          </h2>
          
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Example: Health & Wellness Script</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded border">
                  <p className="mb-2">
                    "Studies show that drinking green tea can boost metabolism by up to 4%..."
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-semibold">Verified</span>
                    <span className="text-gray-500">• Source: American Journal of Clinical Nutrition (2023)</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded border">
                  <p className="mb-2">
                    "90% of people are vitamin D deficient..."
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-600 font-semibold">Needs Correction</span>
                    <span className="text-gray-500">• Actual: 41.6% (NIH, 2024)</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded border">
                  <p className="mb-2">
                    "The Mediterranean diet reduces heart disease risk by 30%..."
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-semibold">Verified</span>
                    <span className="text-gray-500">• Source: PREDIMED Study, NEJM (2023)</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded border">
                  <p className="mb-2">
                    "Intermittent fasting cures diabetes..."
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 font-semibold">False Claim</span>
                    <span className="text-gray-500">• Suggested: "may help manage blood sugar"</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Script Accuracy Score: 94%</p>
                    <p className="text-sm text-gray-600">2 corrections needed before publishing</p>
                  </div>
                  <Button>Apply Corrections</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Comprehensive Fact-Checking Features
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Every tool you need to create accurate, trustworthy content
          </p>

          <Tabs defaultValue="verification" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="protection">Protection</TabsTrigger>
            </TabsList>

            <TabsContent value="verification" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Multi-Layer Verification System</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Statistical Verification</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Real-time data validation</li>
                        <li>• Historical trend checking</li>
                        <li>• Margin of error analysis</li>
                        <li>• Sample size verification</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Claim Verification</h4>
                      <ul className="space-y-2 text-gray-600">
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
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Premium Source Database</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded">
                      <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
                      <h4 className="font-semibold">Academic</h4>
                      <p className="text-sm text-gray-600">PubMed, JSTOR, arXiv, Google Scholar</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                      <Shield className="w-6 h-6 text-green-600 mb-2" />
                      <h4 className="font-semibold">News</h4>
                      <p className="text-sm text-gray-600">Reuters, AP, BBC, NPR</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                      <Award className="w-6 h-6 text-purple-600 mb-2" />
                      <h4 className="font-semibold">Official</h4>
                      <p className="text-sm text-gray-600">WHO, CDC, NASA, World Bank</p>
                    </div>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      All sources are continuously updated and rated for credibility using our proprietary trust algorithm
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Platform Compliance Tools</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>YouTube Policy Checker</strong>
                        <p className="text-gray-600">Ensures compliance with YouTube's misinformation policies</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>YMYL Content Guidelines</strong>
                        <p className="text-gray-600">Special verification for health, finance, and safety content</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Medical Disclaimer Generator</strong>
                        <p className="text-gray-600">Automatic disclaimers for health-related content</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Copyright Attribution</strong>
                        <p className="text-gray-600">Proper citation formatting for all sources</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="protection" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Creator Protection Features</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Lock className="w-8 h-8 text-blue-600 mb-3" />
                      <h4 className="font-semibold mb-2">Legal Protection</h4>
                      <p className="text-gray-600">
                        Avoid defamation claims with automated legal review of potentially problematic statements
                      </p>
                    </div>
                    <div>
                      <Shield className="w-8 h-8 text-green-600 mb-3" />
                      <h4 className="font-semibold mb-2">Strike Prevention</h4>
                      <p className="text-gray-600">
                        Pre-emptively identify content that could trigger community guideline strikes
                      </p>
                    </div>
                    <div>
                      <BadgeCheck className="w-8 h-8 text-purple-600 mb-3" />
                      <h4 className="font-semibold mb-2">Credibility Score</h4>
                      <p className="text-gray-600">
                        Build audience trust with transparency reports showing your accuracy rate
                      </p>
                    </div>
                    <div>
                      <AlertTriangle className="w-8 h-8 text-orange-600 mb-3" />
                      <h4 className="font-semibold mb-2">Controversy Alerts</h4>
                      <p className="text-gray-600">
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

      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Trusted by Educational Creators & News Channels
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Education</Badge>
                  <Badge>2.3M Subs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic mb-4">
                  "As a science educator, accuracy is everything. Genscript's fact-checking has saved 
                  me from countless errors and given me confidence in my content."
                </p>
                <div className="text-sm text-gray-600">
                  <div>Channel: SciShow Extra</div>
                  <div>Accuracy Rate: 99.8%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Health</Badge>
                  <Badge>890K Subs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic mb-4">
                  "Medical misinformation can be dangerous. This tool ensures every health claim I make 
                  is backed by peer-reviewed research."
                </p>
                <div className="text-sm text-gray-600">
                  <div>Channel: Dr. Mike Explains</div>
                  <div>Zero Strikes in 3 Years</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">Finance</Badge>
                  <Badge>1.5M Subs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic mb-4">
                  "Financial advice requires extreme accuracy. The fact-checker catches outdated laws 
                  and ensures compliance with regulations."
                </p>
                <div className="text-sm text-gray-600">
                  <div>Channel: Money Matters Daily</div>
                  <div>100% Compliance Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Pricing for Responsible Creators
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <div className="text-3xl font-bold">$59/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ 30 fact-checked scripts/mo</li>
                  <li>✓ Basic source verification</li>
                  <li>✓ Accuracy reports</li>
                  <li>✓ Email support</li>
                </ul>
                <Link href="/signup?plan=starter">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-emerald-500 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Trusted
              </Badge>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <div className="text-3xl font-bold">$119/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ Unlimited fact-checking</li>
                  <li>✓ Premium source access</li>
                  <li>✓ Legal review included</li>
                  <li>✓ Controversy alerts</li>
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
                <CardTitle>Enterprise</CardTitle>
                <div className="text-3xl font-bold">$399/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Custom source integration</li>
                  <li>✓ Team collaboration</li>
                  <li>✓ Compliance training</li>
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

      <section className="py-20 px-4 bg-gradient-to-b from-emerald-600 to-emerald-800 text-white">
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
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-emerald-800">
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            14-day free trial • No credit card required • 99.7% accuracy guaranteed
          </p>
        </div>
      </section>
    </>
  );
}