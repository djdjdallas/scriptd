'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  FileText,
  TrendingUp,
  Hash,
  Image,
  Clock,
  Zap,
  ArrowRight,
  Search,
  Sparkles,
  Star,
  Users,
  ChevronRight,
  Filter,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tools = [
  {
    id: 'transcript-extraction',
    title: 'YouTube Transcript Extraction',
    description: 'Extract and analyze video transcripts in seconds. AI-powered competitive research made easy.',
    icon: Video,
    badge: 'New',
    badgeVariant: 'secondary',
    features: ['Hook analysis', 'Topic extraction', 'Keyword detection', 'Timestamp identification'],
    href: '/signup',
    category: 'research',
    popularity: 5
  },
  {
    id: 'title-generator',
    title: 'YouTube Title Generator',
    description: 'Create click-worthy titles that rank well in YouTube search',
    icon: FileText,
    badge: 'Most Popular',
    badgeVariant: 'default',
    features: ['SEO optimized', 'A/B testing ready', 'Character counter'],
    href: '/tools/title-generator',
    category: 'content',
    popularity: 5
  },
  {
    id: 'hook-generator',
    title: 'Hook Generator',
    description: 'Generate compelling hooks that grab attention in the first 15 seconds',
    icon: Zap,
    badge: 'Trending',
    badgeVariant: 'destructive',
    features: ['Multiple styles', 'Engagement focused', 'Time-tested formulas'],
    href: '/tools/hook-generator',
    category: 'content',
    popularity: 4
  },
  {
    id: 'idea-generator',
    title: 'Video Idea Generator',
    description: 'Never run out of content ideas with AI-powered suggestions',
    icon: Lightbulb,
    features: ['Niche specific', 'Trending topics', 'Competition analysis'],
    href: '/tools/idea-generator',
    category: 'planning',
    popularity: 4
  },
  {
    id: 'hashtag-generator',
    title: 'Hashtag Generator',
    description: 'Find the perfect hashtags to increase your video discoverability',
    icon: Hash,
    features: ['Relevance scoring', 'Competition level', 'Trending tags'],
    href: '/tools/hashtag-generator',
    category: 'seo',
    popularity: 3
  },
  {
    id: 'thumbnail-ideas',
    title: 'Thumbnail Idea Generator',
    description: 'Get creative thumbnail concepts that boost click-through rates',
    icon: Image,
    badge: 'New',
    badgeVariant: 'secondary',
    features: ['Style suggestions', 'Color psychology', 'Text overlay ideas'],
    href: '/tools/thumbnail-ideas',
    category: 'visual',
    popularity: 5
  },
  {
    id: 'length-calculator',
    title: 'Script Length Calculator',
    description: 'Calculate the perfect script length for your target video duration',
    icon: Clock,
    features: ['Speaking pace options', 'Word count', 'Read time estimate'],
    href: '/tools/length-calculator',
    category: 'planning',
    popularity: 3
  }
];

const categories = [
  { id: 'all', label: 'All Tools', icon: Sparkles },
  { id: 'research', label: 'Research & Analysis', icon: Video },
  { id: 'content', label: 'Content Creation', icon: FileText },
  { id: 'planning', label: 'Planning', icon: Lightbulb },
  { id: 'seo', label: 'SEO & Discovery', icon: TrendingUp },
  { id: 'visual', label: 'Visual Design', icon: Image }
];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = searchQuery === '' || 
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pb-12">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/5 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        <div className="relative space-y-8 px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">100% Free Tools</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                YouTube Script Tools
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional tools to help you create better YouTube content, faster. 
                Used by <span className="font-semibold text-foreground">50,000+ creators</span> worldwide.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tools by name, feature, or keyword..."
                  className="pl-10 pr-4 h-12 text-base bg-background/50 backdrop-blur-sm border-muted-foreground/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "gap-2 transition-all",
                        selectedCategory === category.id && "shadow-lg"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                      {category.id === 'all' && (
                        <Badge variant="secondary" className="ml-1">
                          {tools.length}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTools.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} href={tool.href}>
                  <Card 
                    className={cn(
                      "h-full transition-all duration-300 cursor-pointer border-muted-foreground/10",
                      "hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1",
                      hoveredCard === tool.id && "ring-2 ring-primary/20",
                      "animate-in fade-in slide-in-from-bottom-4"
                    )}
                    onMouseEnter={() => setHoveredCard(tool.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      '--animation-delay': `${index * 50}ms`,
                      animationDelay: `var(--animation-delay)`
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn(
                          "p-2.5 rounded-lg transition-colors",
                          hoveredCard === tool.id ? "bg-primary text-primary-foreground" : "bg-primary/10"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {tool.badge && (
                          <Badge 
                            variant={tool.badgeVariant || 'secondary'} 
                            className="animate-pulse"
                          >
                            {tool.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">{tool.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Features */}
                        <ul className="space-y-2">
                          {tool.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className={cn(
                                "h-1.5 w-1.5 rounded-full transition-colors",
                                hoveredCard === tool.id ? "bg-primary" : "bg-primary/60"
                              )} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        {/* Popularity Indicator */}
                        {tool.popularity && (
                          <div className="flex items-center gap-1 pt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3 transition-colors",
                                  i < tool.popularity 
                                    ? "fill-yellow-500 text-yellow-500" 
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              Popular
                            </span>
                          </div>
                        )}
                        
                        {/* CTA */}
                        <div className={cn(
                          "flex items-center text-sm font-medium transition-all",
                          hoveredCard === tool.id ? "text-primary translate-x-1" : "text-primary/70"
                        )}>
                          Try it free
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="space-y-3">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No tools found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Stats Section with Animation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active Users', value: '50K+', icon: Users },
            { label: 'Scripts Generated', value: '1M+', icon: FileText },
            { label: 'Average Rating', value: '4.8', icon: Star },
            { label: 'Free Forever', value: '100%', icon: Sparkles }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden border-muted-foreground/10 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  '--animation-delay': `${index * 100}ms`,
                  animationDelay: `var(--animation-delay)`
                }}
              >
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Icon className="h-16 w-16" />
                </div>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="absolute inset-0 bg-grid-white/5 bg-grid-16" />
          <CardContent className="relative pt-8 pb-8 text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium Features
            </Badge>
            <h3 className="text-2xl font-bold mb-3">
              Ready for More Powerful Features?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Unlock unlimited generations, advanced AI models, team collaboration, 
              and priority support with our Pro plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link href="/sign-up">
                  Get Started Free
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              question: 'Are these tools really free?',
              answer: 'Yes! All tools on this page are 100% free to use without any sign-up required. We offer premium features for power users, but these tools will always remain free.'
            },
            {
              question: 'How accurate are the AI suggestions?',
              answer: 'Our AI is trained on millions of successful YouTube videos and continuously improves. While results may vary, our tools consistently help creators improve their content performance.'
            },
            {
              question: 'Can I use these for commercial purposes?',
              answer: 'Absolutely! All content generated by our free tools is yours to use however you like, including for commercial YouTube channels and business purposes.'
            }
          ].map((faq, index) => (
            <Card key={index} className="border-muted-foreground/10">
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CSS for grid background */}
      <style jsx global>{`
        .bg-grid-16 {
          background-size: 16px 16px;
        }
        
        .bg-grid-white\/5 {
          background-image: linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}