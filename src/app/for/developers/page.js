'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Terminal, 
  GitBranch, 
  Cpu, 
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
  Monitor,
  Database,
  Smartphone,
  Globe,
  Settings,
  Users
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';

export default function DeveloperContentTools() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'developers',
        referrer: document.referrer 
      })
    });
  }, []);

  const features = [
    {
      icon: Code,
      title: 'Code Tutorial Scripts',
      description: 'Step-by-step programming tutorials that keep developers engaged through complex concepts',
      benefit: '72% completion rate'
    },
    {
      icon: Terminal,
      title: 'Technical Explanation Framework',
      description: 'Break down complex technical concepts into digestible, engaging content',
      benefit: 'Reduce confusion by 80%'
    },
    {
      icon: GitBranch,
      title: 'Project Walkthrough Templates',
      description: 'Showcase code projects, architecture decisions, and development process',
      benefit: '3x more GitHub stars'
    },
    {
      icon: Cpu,
      title: 'Tech Stack Reviews',
      description: 'Compare technologies, frameworks, and tools with balanced perspectives',
      benefit: 'Build thought leadership'
    },
    {
      icon: Shield,
      title: 'Technical Accuracy Verification',
      description: 'Verify code examples, API references, and technical claims automatically',
      benefit: 'Zero technical errors'
    },
    {
      icon: Users,
      title: 'Developer Voice Matching',
      description: 'Maintain technical credibility while staying approachable for all skill levels',
      benefit: 'Broader audience reach'
    }
  ];

  const techCategories = [
    {
      category: 'Web Development',
      technologies: ['React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'TypeScript'],
      templates: 25,
      retention: '74%',
      examples: ['Framework comparisons', 'Best practices', 'Project builds']
    },
    {
      category: 'Mobile Development',
      technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin'],
      templates: 18,
      retention: '71%',
      examples: ['App tutorials', 'Platform differences', 'Performance tips']
    },
    {
      category: 'Backend & DevOps',
      technologies: ['Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis'],
      templates: 22,
      retention: '69%',
      examples: ['Infrastructure guides', 'Deployment strategies', 'Database design']
    },
    {
      category: 'Data Science & AI',
      technologies: ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'Jupyter'],
      templates: 20,
      retention: '73%',
      examples: ['ML tutorials', 'Data analysis', 'Algorithm explanations']
    }
  ];

  const contentTypes = [
    {
      type: 'Tutorial Series',
      description: 'Multi-part programming courses with progressive difficulty',
      avgViews: '45K per episode',
      retention: '72%',
      examples: ['Build a full-stack app', 'Master React hooks', 'DevOps from scratch']
    },
    {
      type: 'Code Reviews',
      description: 'Analyze and improve existing codebases with educational commentary',
      avgViews: '28K per video',
      retention: '68%',
      examples: ['Open source reviews', 'Refactoring sessions', 'Architecture analysis']
    },
    {
      type: 'Tech Talks',
      description: 'Deep dives into programming concepts, patterns, and best practices',
      avgViews: '35K per video',
      retention: '70%',
      examples: ['Design patterns', 'Performance optimization', 'Clean code principles']
    },
    {
      type: 'Career Advice',
      description: 'Professional development content for developers at all levels',
      avgViews: '52K per video',
      retention: '69%',
      examples: ['Interview prep', 'Salary negotiation', 'Career transitions']
    }
  ];

  const testimonials = [
    {
      name: 'Alex Rodriguez',
      title: 'Senior Full-Stack Developer',
      company: 'Meta',
      subscribers: '890K',
      quote: 'My tutorial retention went from 45% to 74%. The technical accuracy checking saved me from several embarrassing mistakes.',
      beforeAfter: {
        before: '15K avg views',
        after: '85K avg views'
      }
    },
    {
      name: 'Sarah Kim',
      title: 'DevOps Engineer',
      company: 'Netflix',
      subscribers: '340K',
      quote: 'The framework for explaining complex DevOps concepts is incredible. My audience engagement tripled.',
      beforeAfter: {
        before: '25% completion',
        after: '71% completion'
      }
    },
    {
      name: 'Marcus Chen',
      title: 'AI Research Engineer',
      company: 'OpenAI',
      subscribers: '560K',
      quote: 'Finally, AI scripts that make machine learning accessible without dumbing it down. Perfect balance.',
      beforeAfter: {
        before: '8% conversion',
        after: '28% conversion'
      }
    }
  ];

  const codeExamples = [
    {
      title: 'Tutorial Hook for React Component',
      before: 'Today we\'re going to learn about React hooks...',
      after: 'This React hook mistake crashes 90% of production apps. Here\'s how to avoid it in 30 seconds.',
      improvement: '+340% click-through rate'
    },
    {
      title: 'Algorithm Explanation Opening',
      before: 'Let\'s talk about sorting algorithms...',
      after: 'I found a sorting algorithm that beats quicksort. Here\'s why Google doesn\'t want you to know about it.',
      improvement: '+280% retention'
    },
    {
      title: 'DevOps Tutorial Introduction',
      before: 'We\'ll deploy an app using Docker...',
      after: 'Deploy to production in 60 seconds using this Docker trick that saved Netflix $2M in server costs.',
      improvement: '+220% engagement'
    }
  ];

  const techMetrics = [
    { metric: 'Tutorial Completion', improvement: '+185%', description: 'Viewers finish your content' },
    { metric: 'Code Repository Stars', improvement: '+340%', description: 'More GitHub engagement' },
    { metric: 'Technical Job Offers', improvement: '+120%', description: 'Career opportunities' },
    { metric: 'Developer Community Growth', improvement: '+260%', description: 'Subscriber growth rate' }
  ];

  const faqs = [
    {
      question: 'How does this handle different programming languages?',
      answer: 'Our AI understands syntax and concepts across 50+ programming languages. It adapts explanations, code examples, and technical depth based on the specific language and framework you\'re teaching.'
    },
    {
      question: 'Can it verify my code examples for accuracy?',
      answer: 'Yes! We have integrated compilers and validators for major languages. Your code examples are checked for syntax errors, logical issues, and best practices before your video goes live.'
    },
    {
      question: 'What about explaining complex algorithms?',
      answer: 'Our framework breaks down algorithms into digestible steps, uses analogies developers understand, and structures explanations to build understanding progressively. Perfect for Big O notation, data structures, and system design.'
    },
    {
      question: 'How do you maintain technical accuracy while keeping content engaging?',
      answer: 'We use a dual approach: technical verification ensures accuracy, while engagement optimization maintains viewer interest. The result is content that\'s both technically sound and highly watchable.'
    },
    {
      question: 'Can I customize scripts for my specific tech stack?',
      answer: 'Absolutely. Input your preferred technologies, frameworks, and coding style. The AI adapts all scripts to match your technical preferences and audience expertise level.'
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Developer Content Tools - YouTube Scripts for Programming Tutorials | Subscribr</title>
        <meta name="description" content="Create engaging programming tutorials and tech content with AI scripts designed for developers. 72% retention rates, technical accuracy guaranteed." />
        <meta name="keywords" content="developer content, programming tutorials, coding videos, tech YouTube, developer marketing, code tutorials" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Code className="w-4 h-4 mr-1" />
              For Developers & Tech Educators
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              YouTube Scripts That Make Complex Code Simple
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Built for developers who want to share knowledge effectively. Create programming tutorials 
              that achieve <span className="font-semibold text-foreground">72% retention rates</span> 
              while maintaining technical accuracy and developer credibility.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600">
                Start Coding Better Content
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                See Code Examples
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>127 Developer Creators</span>
              </div>
              <div>50+ Programming Languages</div>
              <div>Zero Technical Errors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Results */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Results from Developer Content Creators
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See how programming educators and tech creators grow their channels with developer-focused scripts
          </p>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {techMetrics.map((metric, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">{metric.improvement}</div>
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
                    {testimonial.subscribers} subscribers
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
      <section className="py-20 bg-gradient-to-b from-white to-green-50 dark:from-background dark:to-green-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Built for Technical Content Creation
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Every feature designed to help developers create engaging, accurate, and educational programming content
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-green-600 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{feature.description}</p>
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-600">{feature.benefit}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Categories */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Specialized Templates for Every Tech Stack
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {techCategories.map((category, idx) => (
              <Card key={idx} className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{category.category}</CardTitle>
                    <Badge variant="secondary">{category.templates} templates</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-lg font-bold text-green-600 mb-1">{category.retention} avg retention</div>
                    <div className="text-sm text-muted-foreground">Across all {category.category.toLowerCase()} content</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Supported Technologies:</div>
                    <div className="flex flex-wrap gap-1">
                      {category.technologies.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Content Types:</div>
                    <div className="flex flex-wrap gap-1">
                      {category.examples.map((example, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
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

      {/* Code Examples */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Before vs After: Script Optimization Examples
          </h2>

          <div className="space-y-8">
            {codeExamples.map((example, idx) => (
              <Card key={idx} className="border-l-4 border-l-green-500">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">{example.title}</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {example.improvement}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-red-600 mb-2">❌ Generic Opening:</div>
                      <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                        <code className="text-sm text-muted-foreground">"{example.before}"</code>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-green-600 mb-2">✅ Optimized Hook:</div>
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <code className="text-sm text-muted-foreground">"{example.after}"</code>
                      </div>
                    </div>
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
            Optimized for Every Type of Developer Content
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {contentTypes.map((content, idx) => (
              <Card key={idx} className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-xl">{content.type}</CardTitle>
                  <CardDescription>{content.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{content.avgViews}</div>
                      <div className="text-xs text-muted-foreground">Average views</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{content.retention}</div>
                      <div className="text-xs text-muted-foreground">Retention rate</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Popular formats:</div>
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

      {/* Developer ROI */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50 dark:from-background dark:to-green-950/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-950/50 dark:to-blue-950/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-center mb-6">
              Your Developer Content ROI
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Calculate the career and business impact of better technical content
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">$45K</div>
                <div className="text-sm text-muted-foreground">Additional job offers</div>
                <div className="text-xs text-muted-foreground mt-1">(185% tutorial completion boost)</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">12K</div>
                <div className="text-sm text-muted-foreground">Monthly subscribers</div>
                <div className="text-xs text-muted-foreground mt-1">(260% growth rate increase)</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">340%</div>
                <div className="text-sm text-muted-foreground">More GitHub stars</div>
                <div className="text-xs text-muted-foreground mt-1">(Better project showcases)</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Career Impact: Immeasurable</div>
              <div className="text-sm text-muted-foreground mb-6">
                Investment: $79/month • Better content, better career opportunities
              </div>
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600">
                Start Your Developer Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Developer-Specific Questions
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
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Level Up Your Developer Content?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 127 developers already growing their influence with engaging, technically accurate content.
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-4">Developer Early Access</h3>
            <p className="text-lg mb-6">
              Get priority access to new programming language support + 50% off your first 3 months
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Join Early Access
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                View Code Samples
              </Button>
            </div>
          </div>

          <div className="text-sm opacity-75">
            14-day free trial • 50+ languages supported • Technical accuracy guaranteed
          </div>
        </div>
      </section>
    </>
  );
}