'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Target,
  BarChart3,
  BookOpen,
  Lightbulb,
  Shield,
  Zap,
  Clock,
  Star,
  MessageSquare,
  Play,
  Award,
  Video
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';

export default function BusinessEducatorSuite() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'business-educators',
        referrer: document.referrer 
      })
    });
  }, []);

  const features = [
    {
      icon: Video,
      title: 'Competitive Research & Analysis',
      description: 'Extract and analyze transcripts from industry leaders. Study what works and apply proven patterns.',
      benefit: '10x faster market research'
    },
    {
      icon: Target,
      title: 'Business-Focused Script Templates',
      description: 'Pre-built frameworks for case studies, tutorials, thought leadership, and client testimonials',
      benefit: 'Save 80% script writing time'
    },
    {
      icon: Users,
      title: 'Authority Positioning System',
      description: 'Scripts that establish credibility and expertise in your industry niche',
      benefit: 'Build trust with prospects'
    },
    {
      icon: DollarSign,
      title: 'Revenue-Optimized CTAs',
      description: 'Conversion-tested calls-to-action for lead generation and sales',
      benefit: '3x higher conversion rates'
    },
    {
      icon: BookOpen,
      title: 'Educational Content Framework',
      description: 'Proven structures for teaching complex business concepts clearly',
      benefit: '68% average retention'
    },
    {
      icon: Shield,
      title: 'Fact-Checking for Business Claims',
      description: 'Verify statistics, market data, and business claims automatically',
      benefit: 'Protect your reputation'
    },
    {
      icon: Briefcase,
      title: 'Professional Voice Matching',
      description: 'Maintain executive presence while staying authentic and relatable',
      benefit: 'Sound like a thought leader'
    }
  ];

  const useCases = [
    {
      title: 'Course Launch Videos',
      description: 'High-converting sales videos that pre-sell your online courses',
      metrics: '+215% enrollment rate',
      example: 'From course outline to compelling sales narrative'
    },
    {
      title: 'Client Case Studies',
      description: 'Professional stories showcasing your business results',
      metrics: '+340% lead quality',
      example: 'Transform client success into social proof'
    },
    {
      title: 'Thought Leadership Content',
      description: 'Industry insights and trends that position you as an expert',
      metrics: '+180% LinkedIn engagement',
      example: 'Market analysis to viral business content'
    },
    {
      title: 'Webinar Presentations',
      description: 'Engaging educational content that drives attendee action',
      metrics: '+125% webinar conversion',
      example: 'Educational value to sales conversion'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Martinez',
      title: 'Business Coach',
      company: 'Scale Academy',
      revenue: '$2.3M ARR',
      quote: 'Subscribr helped me scale from 5K to 450K subscribers. My course sales increased 340% after optimizing my video scripts.',
      beforeAfter: {
        before: '12% course conversion',
        after: '41% course conversion'
      }
    },
    {
      name: 'David Chen',
      title: 'Marketing Consultant',
      company: 'Growth Partners',
      revenue: '$890K ARR',
      quote: 'The authority positioning scripts transformed how clients perceive my expertise. Doubled my consulting rates.',
      beforeAfter: {
        before: '$2,500 per project',
        after: '$5,000 per project'
      }
    },
    {
      name: 'Jennifer Park',
      title: 'SaaS Educator',
      company: 'TechMastery',
      revenue: '$1.8M ARR',
      quote: 'My B2B content now gets enterprise leads. The professional voice matching keeps me authoritative yet approachable.',
      beforeAfter: {
        before: 'SMB leads only',
        after: 'Enterprise clients'
      }
    }
  ];

  const contentTypes = [
    {
      type: 'Course Marketing',
      templates: 12,
      retention: '71%',
      conversion: '+240%',
      examples: ['Course previews', 'Student testimonials', 'Transformation stories']
    },
    {
      type: 'Case Studies',
      templates: 8,
      retention: '69%',
      conversion: '+185%',
      examples: ['Client results', 'Before/after stories', 'ROI demonstrations']
    },
    {
      type: 'Thought Leadership',
      templates: 15,
      retention: '68%',
      conversion: '+160%',
      examples: ['Industry insights', 'Trend analysis', 'Expert commentary']
    },
    {
      type: 'Tutorial Content',
      templates: 20,
      retention: '72%',
      conversion: '+195%',
      examples: ['How-to guides', 'Best practices', 'Tool tutorials']
    }
  ];

  const businessMetrics = [
    { metric: 'Lead Generation', improvement: '+280%', description: 'More qualified prospects' },
    { metric: 'Course Sales', improvement: '+340%', description: 'Higher conversion rates' },
    { metric: 'Consulting Rates', improvement: '+150%', description: 'Premium positioning' },
    { metric: 'Brand Authority', improvement: '+220%', description: 'Industry recognition' }
  ];

  const faqs = [
    {
      question: 'How does this differ from general YouTube tools?',
      answer: 'Our Business Educator Suite is specifically designed for professional content creators. We understand business terminology, industry contexts, and professional presentation requirements that general tools miss.'
    },
    {
      question: 'Can I maintain my professional brand voice?',
      answer: 'Absolutely. Our voice matching technology learns your professional communication style and ensures all scripts maintain your executive presence while improving engagement.'
    },
    {
      question: 'What about fact-checking business claims?',
      answer: 'We have specialized databases for business statistics, market data, and industry claims. Every script is verified for accuracy to protect your professional reputation.'
    },
    {
      question: 'How quickly can I see ROI on my content?',
      answer: 'Most business educators see improvements within 30 days. Our users typically report 2-3x ROI through increased course sales, higher consulting rates, and better lead quality.'
    },
    {
      question: 'Do you support different business niches?',
      answer: 'Yes, we have specialized templates for marketing, sales, leadership, finance, technology, and general business education. The AI adapts to your specific industry context.'
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Business Educator Suite - Professional YouTube Scripts for Course Creators | Subscribr</title>
        <meta name="description" content="Transform your business education content with AI scripts designed for course creators, consultants, and thought leaders. 68% retention, 3x conversion rates." />
        <meta name="keywords" content="business educator, course creator, YouTube scripts, business content, online education, professional videos" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <GraduationCap className="w-4 h-4 mr-1" />
              For Business Educators & Course Creators
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Professional YouTube Scripts That Convert Viewers into Customers
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Built specifically for business educators, consultants, and course creators. 
              Create authoritative content that drives <span className="font-semibold text-foreground">3x higher conversions</span> 
              while maintaining professional credibility.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>127 Active Educators</span>
              </div>
              <div>68% Average Retention</div>
              <div>$2.8M+ Revenue Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Results */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Real Results from Business Educators
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See how course creators and business educators use our scripts to grow their revenue
          </p>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {businessMetrics.map((metric, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{metric.improvement}</div>
                  <div className="font-semibold mb-1">{metric.metric}</div>
                  <div className="text-sm text-muted-foreground">{metric.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>
                    {testimonial.title} • {testimonial.company}
                  </CardDescription>
                  <Badge variant="secondary" className="w-fit">
                    {testimonial.revenue} Revenue
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic mb-4">"{testimonial.quote}"</p>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs font-medium mb-1">Results:</div>
                    <div className="text-xs text-red-600">Before: {testimonial.beforeAfter.before}</div>
                    <div className="text-xs text-green-600">After: {testimonial.beforeAfter.after}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Built for Professional Content Creators
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Every feature designed specifically for business educators who need to balance authority with engagement
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{feature.description}</p>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-600">{feature.benefit}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Specialized Templates for Every Business Content Type
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {contentTypes.map((content, idx) => (
              <Card key={idx} className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{content.type}</CardTitle>
                    <Badge variant="secondary">{content.templates} templates</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{content.retention}</div>
                      <div className="text-xs text-muted-foreground">Retention</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{content.conversion}</div>
                      <div className="text-xs text-muted-foreground">Conversion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{content.templates}</div>
                      <div className="text-xs text-muted-foreground">Templates</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Examples:</div>
                    <div className="flex flex-wrap gap-1">
                      {content.examples.map((example, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Transform Your Business Content Strategy
          </h2>

          <div className="space-y-8">
            {useCases.map((useCase, idx) => (
              <Card key={idx} className="border-l-4 border-l-blue-500">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                      <p className="text-muted-foreground">{useCase.description}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">{useCase.metrics}</div>
                      <div className="text-sm text-muted-foreground">Average improvement</div>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm font-medium mb-1">Example transformation:</div>
                      <div className="text-sm text-muted-foreground">{useCase.example}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-center mb-6">
              Calculate Your Potential ROI
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              See how much revenue you could generate with optimized business content
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">$4,200</div>
                <div className="text-sm text-muted-foreground">Monthly course sales increase</div>
                <div className="text-xs text-muted-foreground mt-1">(Based on 340% conversion improvement)</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">$2,800</div>
                <div className="text-sm text-muted-foreground">Higher consulting rates</div>
                <div className="text-xs text-muted-foreground mt-1">(150% rate increase)</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">$1,900</div>
                <div className="text-sm text-muted-foreground">Additional lead value</div>
                <div className="text-xs text-muted-foreground mt-1">(280% lead generation boost)</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Potential Monthly ROI: $8,900</div>
              <div className="text-sm text-muted-foreground mb-6">
                Investment: $79/month • Return: 11,200% ROI
              </div>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Business Education Content?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 127 business educators already growing their revenue with professional YouTube scripts.
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-4">Special Launch Offer</h3>
            <p className="text-lg mb-6">
              Get the Business Educator Suite for 50% off your first 3 months + 1-on-1 strategy session
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Claim Your Discount
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                Schedule Demo
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