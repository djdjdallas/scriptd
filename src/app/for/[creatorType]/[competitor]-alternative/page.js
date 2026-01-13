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

const formatCreatorTypeStatic = (type) => {
  const formats = {
    'developers': 'Developer YouTubers',
    'business-educators': 'Business Educators',
    'faceless-channels': 'Faceless Channels',
    'gaming-creators': 'Gaming Creators',
    'lifestyle-vloggers': 'Lifestyle Vloggers'
  };
  return formats[type] || type;
};

const formatCompetitorStatic = (competitor) => {
  const formats = {
    'chatgpt': 'ChatGPT',
    'jasper': 'Jasper AI',
    'writesonic': 'Writesonic',
    'copy-ai': 'Copy.ai',
    'rytr': 'Rytr'
  };
  return formats[competitor] || competitor;
};

const allTemplates = {
  // DEVELOPERS
  'developers-chatgpt': {
    title: 'ChatGPT Alternative for Developer YouTubers - Code-Optimized Scripts | GenScript',
    description: 'Developer-focused YouTube script generator. Better than ChatGPT for programming tutorials with code formatting, technical accuracy, and 72% retention.',
    h1: 'ChatGPT Alternative Built for Developer Content Creators',
    subheading: 'Generate technical tutorials that actually teach—with proper code formatting, zero hallucinations, and 72% retention rates.',
    stats: { retention: '72%', accuracy: '99.8%', generation: '45 sec', creators: '2.5K+' }
  },
  'developers-jasper': {
    title: 'Jasper AI Alternative for Developer YouTubers - Technical Script Generator | GenScript',
    description: 'Jasper alternative built for coding tutorials. Generate developer YouTube scripts with syntax highlighting, API documentation, and technical accuracy.',
    h1: 'Jasper AI Alternative for Programming Tutorial Creators',
    subheading: 'Create coding tutorials that developers actually want to watch—with accurate syntax, clear explanations, and 70% retention.',
    stats: { retention: '70%', accuracy: '99.5%', generation: '40 sec', creators: '2.1K+' }
  },
  'developers-writesonic': {
    title: 'Writesonic Alternative for Developer YouTubers - Code Tutorial Scripts | GenScript',
    description: 'Writesonic alternative for tech content creators. Generate programming tutorials with proper code blocks, debugging walkthroughs, and technical depth.',
    h1: 'Writesonic Alternative for Tech Tutorial Creators',
    subheading: 'Build coding content that teaches effectively—with structured explanations, code examples, and developer-focused retention optimization.',
    stats: { retention: '69%', codeAccuracy: '99.2%', generation: '35 sec', creators: '1.9K+' }
  },
  'developers-copy-ai': {
    title: 'Copy.ai Alternative for Developer YouTubers - Programming Scripts | GenScript',
    description: 'Copy.ai alternative designed for developers. Create YouTube scripts for coding tutorials, tech reviews, and software walkthroughs with technical precision.',
    h1: 'Copy.ai Alternative for Software Development Creators',
    subheading: 'Generate programming content that resonates with developers—featuring accurate terminology, best practices, and 68% average retention.',
    stats: { retention: '68%', techAccuracy: '99.3%', generation: '38 sec', creators: '1.7K+' }
  },
  'developers-rytr': {
    title: 'Rytr Alternative for Developer YouTubers - Technical Content Scripts | GenScript',
    description: 'Rytr alternative for programming content. Generate developer-focused YouTube scripts with code snippets, technical accuracy, and engagement optimization.',
    h1: 'Rytr Alternative for Developer Content Creators',
    subheading: 'Create technical tutorials that keep developers engaged—with clean code examples, debugging tips, and 67% retention rates.',
    stats: { retention: '67%', accuracy: '99.1%', generation: '32 sec', creators: '1.5K+' }
  },

  // BUSINESS EDUCATORS
  'business-educators-chatgpt': {
    title: 'ChatGPT Alternative for Business Educators - Professional YouTube Scripts | GenScript',
    description: 'ChatGPT alternative for business content. Generate professional YouTube scripts with case studies, data-driven insights, and executive credibility.',
    h1: 'ChatGPT Alternative for Business Education Channels',
    subheading: 'Create business content that builds authority—with real case studies, market data, and 69% average viewer retention.',
    stats: { retention: '69%', conversion: '11%', generation: '35 sec', creators: '2.0K+' }
  },
  'business-educators-jasper': {
    title: 'Jasper Alternative for Business Educators - Professional YouTube Scripts | GenScript',
    description: 'Business educator YouTube scripts that convert. Jasper alternative with case studies, data visualization, and professional credibility.',
    h1: 'Jasper Alternative for Business Education YouTube Channels',
    subheading: 'Create business content that builds authority, converts viewers to customers, and scales your education empire.',
    stats: { retention: '68%', conversion: '12%', generation: '30 sec', creators: '1.8K+' }
  },
  'business-educators-writesonic': {
    title: 'Writesonic Alternative for Business Educators - Executive Content Scripts | GenScript',
    description: 'Writesonic alternative for business YouTube. Generate professional scripts with industry insights, ROI frameworks, and thought leadership positioning.',
    h1: 'Writesonic Alternative for Business Content Creators',
    subheading: 'Build business education content that establishes expertise—with data-backed insights, frameworks, and 67% retention.',
    stats: { retention: '67%', leads: '+35%', generation: '32 sec', creators: '1.6K+' }
  },
  'business-educators-copy-ai': {
    title: 'Copy.ai Alternative for Business Educators - B2B YouTube Scripts | GenScript',
    description: 'Copy.ai alternative for business educators. Create YouTube scripts with market analysis, strategy frameworks, and professional credibility.',
    h1: 'Copy.ai Alternative for B2B Education Creators',
    subheading: 'Generate business education content that converts viewers into clients—with proven frameworks and 66% retention rates.',
    stats: { retention: '66%', clientConversion: '9%', generation: '33 sec', creators: '1.4K+' }
  },
  'business-educators-rytr': {
    title: 'Rytr Alternative for Business Educators - Professional YouTube Content | GenScript',
    description: 'Rytr alternative for business YouTube channels. Generate scripts with industry expertise, actionable strategies, and thought leadership.',
    h1: 'Rytr Alternative for Business Education YouTubers',
    subheading: 'Create professional business content that builds your brand—with strategic insights and 65% viewer retention.',
    stats: { retention: '65%', authority: '+40%', generation: '28 sec', creators: '1.3K+' }
  },

  // FACELESS CHANNELS
  'faceless-channels-chatgpt': {
    title: 'ChatGPT Alternative for Faceless YouTube Channels - Bulk Script Generator | GenScript',
    description: 'ChatGPT alternative for faceless YouTube automation. Generate bulk scripts optimized for monetization, with proven hooks and 71% retention.',
    h1: 'ChatGPT Alternative for Faceless Channel Automation',
    subheading: 'Scale your faceless empire with AI scripts optimized for the algorithm—bulk generation, proven niches, and maximum RPM.',
    stats: { retention: '71%', rpm: '$9-14', generation: '15 sec', creators: '6K+' }
  },
  'faceless-channels-jasper': {
    title: 'Jasper Alternative for Faceless YouTube Channels - Automated Scripts | GenScript',
    description: 'Jasper alternative for faceless content automation. Bulk script generation with voiceover optimization, trending topics, and monetization focus.',
    h1: 'Jasper Alternative for Faceless YouTube Automation',
    subheading: 'Automate your faceless content pipeline—with scripts optimized for text-to-speech, viral potential, and 69% retention.',
    stats: { retention: '69%', rpm: '$7-11', generation: '18 sec', creators: '4.5K+' }
  },
  'faceless-channels-writesonic': {
    title: 'Writesonic Alternative for Faceless Channels - Automated YouTube Scripts | GenScript',
    description: 'Writesonic alternative for faceless YouTube automation. Bulk script generation, proven niches, 70% retention for maximum monetization.',
    h1: 'Writesonic Alternative for Profitable Faceless YouTube Channels',
    subheading: 'Automate your faceless channel empire with scripts optimized for 70%+ retention and maximum RPM.',
    stats: { retention: '70%', rpm: '$8-12', generation: '20 sec', creators: '5K+' }
  },
  'faceless-channels-copy-ai': {
    title: 'Copy.ai Alternative for Faceless YouTube Channels - Bulk Content Scripts | GenScript',
    description: 'Copy.ai alternative for faceless YouTube. Mass produce monetization-ready scripts with trending topics, viral hooks, and algorithm optimization.',
    h1: 'Copy.ai Alternative for Faceless Channel Monetization',
    subheading: 'Build your faceless content machine—with scripts designed for passive income, bulk production, and 68% retention.',
    stats: { retention: '68%', rpm: '$7-10', generation: '22 sec', creators: '3.8K+' }
  },
  'faceless-channels-rytr': {
    title: 'Rytr Alternative for Faceless YouTube Channels - Automated Content | GenScript',
    description: 'Rytr alternative for faceless YouTube automation. Generate scripts for compilation channels, list videos, and evergreen content at scale.',
    h1: 'Rytr Alternative for Faceless YouTube Automation',
    subheading: 'Scale faceless content production—with voiceover-optimized scripts, trending formats, and 67% average retention.',
    stats: { retention: '67%', rpm: '$6-9', generation: '25 sec', creators: '3.2K+' }
  },

  // GAMING CREATORS
  'gaming-creators-chatgpt': {
    title: 'ChatGPT Alternative for Gaming YouTubers - Gameplay Scripts | GenScript',
    description: 'Gaming-focused YouTube scripts. Better than ChatGPT with game-specific terminology, commentary pacing, and community engagement.',
    h1: 'ChatGPT Alternative for Gaming Content Creators',
    subheading: 'Level up your gaming content with scripts that capture epic moments, build community, and boost engagement.',
    stats: { retention: '75%', engagement: '8.5%', generation: '30 sec', creators: '3.2K+' }
  },
  'gaming-creators-jasper': {
    title: 'Jasper Alternative for Gaming YouTubers - Game Commentary Scripts | GenScript',
    description: 'Jasper alternative for gaming content. Generate scripts for gameplay, reviews, and esports coverage with authentic gamer voice.',
    h1: 'Jasper Alternative for Gaming Content Creators',
    subheading: 'Create gaming content that resonates—with authentic commentary, hype moments, and 73% viewer retention.',
    stats: { retention: '73%', engagement: '7.8%', generation: '28 sec', creators: '2.8K+' }
  },
  'gaming-creators-writesonic': {
    title: 'Writesonic Alternative for Gaming YouTubers - Gameplay Commentary | GenScript',
    description: 'Writesonic alternative for gaming channels. Generate scripts for let\'s plays, game reviews, and esports content with community-first language.',
    h1: 'Writesonic Alternative for Gaming YouTubers',
    subheading: 'Build gaming content that builds community—with authentic reactions, meta references, and 72% retention rates.',
    stats: { retention: '72%', subscribers: '+45%', generation: '25 sec', creators: '2.5K+' }
  },
  'gaming-creators-copy-ai': {
    title: 'Copy.ai Alternative for Gaming YouTubers - Game Review Scripts | GenScript',
    description: 'Copy.ai alternative for gaming content. Create scripts for gameplay commentary, reviews, and streaming highlights with gamer authenticity.',
    h1: 'Copy.ai Alternative for Gaming Channel Creators',
    subheading: 'Generate gaming scripts that speak gamer—with genre-specific language, community references, and 71% retention.',
    stats: { retention: '71%', comments: '+60%', generation: '27 sec', creators: '2.2K+' }
  },
  'gaming-creators-rytr': {
    title: 'Rytr Alternative for Gaming YouTubers - Let\'s Play Scripts | GenScript',
    description: 'Rytr alternative for gaming YouTube. Generate scripts for gameplay videos, tier lists, and gaming news with authentic community voice.',
    h1: 'Rytr Alternative for Gaming Content Creators',
    subheading: 'Create gaming content that gamers love—with meta awareness, community humor, and 70% average retention.',
    stats: { retention: '70%', shares: '+50%', generation: '24 sec', creators: '1.9K+' }
  },

  // LIFESTYLE VLOGGERS
  'lifestyle-vloggers-chatgpt': {
    title: 'ChatGPT Alternative for Lifestyle Vloggers - Authentic Script Generator | GenScript',
    description: 'ChatGPT alternative for lifestyle content. Generate vlog scripts with personal storytelling, brand-friendly language, and authentic connection.',
    h1: 'ChatGPT Alternative for Lifestyle Content Creators',
    subheading: 'Create vlogs that feel genuinely you—with natural storytelling, sponsor integration, and 66% viewer retention.',
    stats: { retention: '66%', sponsorships: '+40%', generation: '28 sec', creators: '3.8K+' }
  },
  'lifestyle-vloggers-jasper': {
    title: 'Jasper Alternative for Lifestyle Vloggers - Authentic Scripts | GenScript',
    description: 'Lifestyle vlogger scripts that feel authentic. Jasper alternative with personal storytelling, brand integration, and audience connection.',
    h1: 'Jasper Alternative for Lifestyle Content Creators',
    subheading: 'Create authentic vlogs that connect with your audience, attract sponsors, and grow your personal brand.',
    stats: { retention: '65%', sponsorships: '+45%', generation: '25 sec', creators: '4.1K+' }
  },
  'lifestyle-vloggers-writesonic': {
    title: 'Writesonic Alternative for Lifestyle Vloggers - Personal Brand Scripts | GenScript',
    description: 'Writesonic alternative for lifestyle content. Generate vlog scripts that maintain your voice, integrate sponsors naturally, and build community.',
    h1: 'Writesonic Alternative for Lifestyle YouTubers',
    subheading: 'Build your personal brand with scripts that sound like you—authentic storytelling, natural sponsorships, and 64% retention.',
    stats: { retention: '64%', brandDeals: '+38%', generation: '26 sec', creators: '3.5K+' }
  },
  'lifestyle-vloggers-copy-ai': {
    title: 'Copy.ai Alternative for Lifestyle Vloggers - Authentic Content Scripts | GenScript',
    description: 'Copy.ai alternative for lifestyle creators. Create vlog scripts with genuine personality, audience connection, and sponsor-friendly structure.',
    h1: 'Copy.ai Alternative for Lifestyle Content Creators',
    subheading: 'Generate lifestyle content that builds real connection—with authentic voice, brand partnerships, and 63% retention.',
    stats: { retention: '63%', engagement: '+35%', generation: '24 sec', creators: '3.0K+' }
  },
  'lifestyle-vloggers-rytr': {
    title: 'Rytr Alternative for Lifestyle Vloggers - Personal Storytelling Scripts | GenScript',
    description: 'Rytr alternative for lifestyle YouTubers. Generate vlog scripts with personal narratives, day-in-the-life structure, and sponsor integration.',
    h1: 'Rytr Alternative for Lifestyle Vloggers',
    subheading: 'Create lifestyle vlogs that feel authentic—with personal storytelling, natural flow, and 62% viewer retention.',
    stats: { retention: '62%', community: '+30%', generation: '22 sec', creators: '2.7K+' }
  }
};

export async function generateMetadata({ params }) {
  const { creatorType, competitor } = params;
  const key = `${creatorType}-${competitor}`;
  const content = allTemplates[key];

  if (!content) {
    return {
      title: `${formatCompetitorStatic(competitor)} Alternative for ${formatCreatorTypeStatic(creatorType)} | GenScript`,
      description: `Specialized YouTube script generator for ${formatCreatorTypeStatic(creatorType)}. Better than ${formatCompetitorStatic(competitor)} with niche-specific optimization.`,
    };
  }

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: `https://genscript.io/for/${creatorType}/${competitor}-alternative`,
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: `https://genscript.io/for/${creatorType}/${competitor}-alternative`,
      siteName: 'GenScript',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
    },
  };
}

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
  const key = `${creatorType}-${competitor}`;
  return allTemplates[key] || {
    title: `${formatCompetitor(competitor)} Alternative for ${formatCreatorType(creatorType)} | GenScript`,
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