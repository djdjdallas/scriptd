'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Zap, Target, Brain, Shield, Star } from 'lucide-react';

const InternalLinkingSection = ({ currentPage }) => {
  const features = [
    {
      icon: Users,
      title: 'Voice Matching Technology',
      description: 'Scripts that sound authentically you',
      href: '/features/voice-matching',
      keywords: 'AI voice cloning, authentic creator voice'
    },
    {
      icon: Target,
      title: 'Retention Optimization',
      description: 'Keep viewers watching until the end',
      href: '/features/retention-optimization',
      keywords: '70%+ retention, viewer engagement'
    },
    {
      icon: Brain,
      title: 'Psychographic Targeting',
      description: 'Connect with your audience psychology',
      href: '/features/psychographic-targeting',
      keywords: 'audience analysis, emotional triggers'
    },
    {
      icon: Zap,
      title: 'PVSS Viral Framework',
      description: 'Proven structure for viral content',
      href: '/features/pvss-framework',
      keywords: 'viral methodology, content structure'
    },
    {
      icon: Shield,
      title: 'Built-in Fact Checking',
      description: 'Never publish misinformation',
      href: '/features/fact-checking',
      keywords: 'accuracy verification, trusted sources'
    },
    {
      icon: Star,
      title: 'Quality Tiers',
      description: 'Fast, Balanced, or Premium generation',
      href: '/features/quality-tiers',
      keywords: 'generation speed, quality options'
    }
  ];

  const useCases = [
    {
      title: 'For Faceless Channels',
      description: 'Perfect scripts without showing your face',
      href: '/for/faceless-channels',
      highlight: 'Most Popular'
    },
    {
      title: 'For Business Educators',
      description: 'Professional educational content',
      href: '/for/business-educators'
    },
    {
      title: 'For Gaming Channels',
      description: 'Engaging gaming commentary',
      href: '/for/gaming-channels'
    },
    {
      title: 'For News & Commentary',
      description: 'Timely, factual scripts',
      href: '/for/news-commentary'
    }
  ];

  const alternatives = [
    { name: 'VidIQ', href: '/alternatives/vidiq' },
    { name: 'TubeBuddy', href: '/alternatives/tubebuddy' },
    { name: 'ChatGPT', href: '/alternatives/chatgpt' },
    { name: 'Jasper AI', href: '/alternatives/jasper-ai' },
    { name: 'Writesonic', href: '/alternatives/writesonic' },
    { name: 'Copy.ai', href: '/alternatives/copy-ai' }
  ].filter(alt => !alt.href.includes(currentPage));

  return (
    <section className="py-20 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Core Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">
            YouTube Script Generator Features That Set Us Apart
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Explore the advanced features that make Genscript the preferred YouTube script generator 
            for professional creators worldwide.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Link key={idx} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <feature.icon className="w-10 h-10 text-purple-600 mb-2" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {feature.description}
                    </p>
                    <p className="text-xs text-purple-600">
                      Learn more →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            YouTube Script Generator for Every Creator Type
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((useCase, idx) => (
              <Link key={idx} href={useCase.href}>
                <Card className="h-full hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    {useCase.highlight && (
                      <div className="text-xs font-semibold text-purple-600 mb-1">
                        {useCase.highlight}
                      </div>
                    )}
                    <h4 className="font-semibold mb-1">{useCase.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {useCase.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Compare Other Alternatives */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Compare with Other YouTube Script Generator Alternatives
          </h3>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {alternatives.map((alt, idx) => (
              <Link key={idx} href={`${alt.href}?utm_source=internal&utm_medium=link&utm_campaign=alternatives`}>
                <Button variant="outline" size="sm">
                  {alt.name} Alternative
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/50 dark:to-pink-950/50 border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Create YouTube Scripts with 70%+ Retention?
            </h3>
            <p className="mb-6 max-w-2xl mx-auto">
              Join thousands of creators using our YouTube script generator with psychographic 
              targeting, PVSS viral framework, and voice matching technology.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup?utm_source=alternatives&utm_medium=internal&utm_campaign=footer">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Start Creating Scripts in 30 Seconds
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-purple-200 dark:border-purple-700">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <Link href="/blog/youtube-script-generator-guide" className="hover:text-purple-600">
                  📚 Complete Guide to YouTube Script Generation
                </Link>
                <Link href="/blog/retention-optimization-tips" className="hover:text-purple-600">
                  📈 Retention Optimization Best Practices
                </Link>
                <Link href="/blog/pvss-framework-explained" className="hover:text-purple-600">
                  🎯 PVSS Framework Masterclass
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default InternalLinkingSection;