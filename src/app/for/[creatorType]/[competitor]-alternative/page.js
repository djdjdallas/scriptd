'use client';

import { useState } from 'react';
import { 
  ArrowRight, CheckCircle2, Users, Target, Zap, BarChart3,
  Award, Shield, Clock, TrendingUp, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CreatorPainPoints from '@/components/programmatic/CreatorPainPoints';
import CompetitorComparison from '@/components/programmatic/CompetitorComparison';
import CreatorFeatures from '@/components/programmatic/CreatorFeatures';
import CreatorTestimonials from '@/components/programmatic/CreatorTestimonials';
import CreatorCTA from '@/components/programmatic/CreatorCTA';

export async function generateStaticParams() {
  const creatorTypes = [
    'developers',
    'business-educators', 
    'faceless-channels',
    'gaming-creators',
    'lifestyle-vloggers'
  ];
  
  const competitors = [
    'chatgpt',
    'jasper',
    'writesonic',
    'copy-ai',
    'rytr'
  ];
  
  const paths = [];
  creatorTypes.forEach(creator => {
    competitors.forEach(competitor => {
      paths.push({
        creatorType: creator,
        competitor: competitor
      });
    });
  });
  
  return paths;
}

function formatCreatorType(type) {
  const formats = {
    'developers': 'Developer YouTubers',
    'business-educators': 'Business Educators',
    'faceless-channels': 'Faceless Channels',
    'gaming-creators': 'Gaming Creators',
    'lifestyle-vloggers': 'Lifestyle Vloggers'
  };
  return formats[type] || type;
}

function formatCompetitor(competitor) {
  const formats = {
    'chatgpt': 'ChatGPT',
    'jasper': 'Jasper AI',
    'writesonic': 'Writesonic',
    'copy-ai': 'Copy.ai',
    'rytr': 'Rytr'
  };
  return formats[competitor] || competitor;
}

function getContentForCombination(creatorType, competitor) {
  const templates = {
    'developers-chatgpt': {
      title: 'ChatGPT Alternative for Developer YouTubers - Code-Optimized Scripts | Genscript',
      description: 'Developer-focused YouTube script generator. Better than ChatGPT for programming tutorials with code formatting, technical accuracy, and 72% retention.',
      h1: 'ChatGPT Alternative Built for Developer Content Creators',
      subheading: 'Generate technical tutorials that actually teach—with proper code formatting, zero hallucinations, and 72% retention rates.',
      stats: {
        retention: '72%',
        accuracy: '99.8%',
        generation: '45 sec',
        creators: '2.5K+'
      }
    },
    'business-educators-jasper': {
      title: 'Jasper Alternative for Business Educators - Professional YouTube Scripts | Genscript',
      description: 'Business educator YouTube scripts that convert. Jasper alternative with case studies, data visualization, and professional credibility.',
      h1: 'Jasper Alternative for Business Education YouTube Channels',
      subheading: 'Create business content that builds authority, converts viewers to customers, and scales your education empire.',
      stats: {
        retention: '68%',
        conversion: '12%',
        generation: '30 sec',
        creators: '1.8K+'
      }
    },
    'faceless-channels-writesonic': {
      title: 'Writesonic Alternative for Faceless Channels - Automated YouTube Scripts | Genscript',
      description: 'Writesonic alternative for faceless YouTube automation. Bulk script generation, proven niches, 70% retention for maximum monetization.',
      h1: 'Writesonic Alternative for Profitable Faceless YouTube Channels',
      subheading: 'Automate your faceless channel empire with scripts optimized for 70%+ retention and maximum RPM.',
      stats: {
        retention: '70%',
        rpm: '$8-12',
        generation: '20 sec',
        creators: '5K+'
      }
    },
    'gaming-creators-chatgpt': {
      title: 'ChatGPT Alternative for Gaming YouTubers - Gameplay Scripts | Genscript',
      description: 'Gaming-focused YouTube scripts. Better than ChatGPT with game-specific terminology, commentary pacing, and community engagement.',
      h1: 'ChatGPT Alternative for Gaming Content Creators',
      subheading: 'Level up your gaming content with scripts that capture epic moments, build community, and boost engagement.',
      stats: {
        retention: '75%',
        engagement: '8.5%',
        generation: '30 sec',
        creators: '3.2K+'
      }
    },
    'lifestyle-vloggers-jasper': {
      title: 'Jasper Alternative for Lifestyle Vloggers - Authentic Scripts | Genscript',
      description: 'Lifestyle vlogger scripts that feel authentic. Jasper alternative with personal storytelling, brand integration, and audience connection.',
      h1: 'Jasper Alternative for Lifestyle Content Creators',
      subheading: 'Create authentic vlogs that connect with your audience, attract sponsors, and grow your personal brand.',
      stats: {
        retention: '65%',
        sponsorships: '+45%',
        generation: '25 sec',
        creators: '4.1K+'
      }
    }
  };
  
  const key = `${creatorType}-${competitor}`;
  return templates[key] || {
    title: `${formatCompetitor(competitor)} Alternative for ${formatCreatorType(creatorType)} | Genscript`,
    description: `Specialized YouTube script generator for ${formatCreatorType(creatorType)}. Better than ${formatCompetitor(competitor)} with niche-specific optimization.`,
    h1: `${formatCompetitor(competitor)} Alternative for ${formatCreatorType(creatorType)}`,
    subheading: 'Create YouTube scripts optimized for your specific content niche and audience.',
    stats: {
      retention: '70%+',
      accuracy: '99%',
      generation: '30 sec',
      creators: '10K+'
    }
  };
}

export default function CreatorCompetitorAlternativePage({ params }) {
  const { creatorType, competitor } = params;
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const content = getContentForCombination(creatorType, competitor);
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `Genscript - ${formatCompetitor(competitor)} Alternative for ${formatCreatorType(creatorType)}`,
    "description": content.description,
    "applicationCategory": "YouTube Script Generation",
    "offers": {
      "@type": "Offer",
      "price": "39.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <Badge className="mb-4">
            <Users className="w-4 h-4 mr-1" />
            {formatCreatorType(creatorType)}
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {content.h1}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl">
            {content.subheading}
          </p>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{content.stats.retention}</div>
                <div className="text-sm text-gray-600">Avg Retention</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {content.stats.accuracy || content.stats.conversion || content.stats.rpm || content.stats.engagement || content.stats.sponsorships}
                </div>
                <div className="text-sm text-gray-600">
                  {content.stats.accuracy && 'Accuracy'}
                  {content.stats.conversion && 'Conversion'}
                  {content.stats.rpm && 'Avg RPM'}
                  {content.stats.engagement && 'Engagement'}
                  {content.stats.sponsorships && 'Sponsorships'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{content.stats.generation}</div>
                <div className="text-sm text-gray-600">Generation Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{content.stats.creators}</div>
                <div className="text-sm text-gray-600">Active Creators</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Creating Better Scripts <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href={`/alternatives/${competitor}`}>
              <Button size="lg" variant="outline">
                Full {formatCompetitor(competitor)} Comparison
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CreatorPainPoints type={creatorType} />
      
      <CompetitorComparison 
        competitor={competitor} 
        creatorType={creatorType} 
      />
      
      <CreatorFeatures type={creatorType} />
      
      <CreatorTestimonials type={creatorType} />

      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Why {formatCreatorType(creatorType)} Switch from {formatCompetitor(competitor)}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Niche-Specific Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Unlike {formatCompetitor(competitor)}'s generic approach, we're trained specifically 
                  on successful {formatCreatorType(creatorType).toLowerCase()} content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-yellow-600 mb-2" />
                <CardTitle>YouTube Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built for video scripts, not blog posts. Every script is optimized for 
                  retention, not just readability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Proven Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {content.stats.creators} {formatCreatorType(creatorType).toLowerCase()} seeing 
                  real growth with our specialized scripts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Pricing for {formatCreatorType(creatorType)}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <div className="text-3xl font-bold">$39/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ 50 scripts/month</li>
                  <li>✓ {formatCreatorType(creatorType)} templates</li>
                  <li>✓ Basic optimization</li>
                  <li>✓ Email support</li>
                </ul>
                <Link href="/signup?plan=starter">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-purple-500 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <div className="text-3xl font-bold">$99/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ Unlimited scripts</li>
                  <li>✓ All creator templates</li>
                  <li>✓ Advanced AI optimization</li>
                  <li>✓ Analytics & insights</li>
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
                <CardTitle>Agency</CardTitle>
                <div className="text-3xl font-bold">$299/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Multi-channel management</li>
                  <li>✓ Custom AI training</li>
                  <li>✓ Team collaboration</li>
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

      <CreatorCTA type={creatorType} competitor={competitor} />
    </>
  );
}