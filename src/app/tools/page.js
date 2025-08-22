// Free Tools Landing Page

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  FileText, 
  TrendingUp, 
  Hash,
  Image,
  Clock,
  Zap,
  ArrowRight
} from 'lucide-react';

const tools = [
  {
    id: 'title-generator',
    title: 'YouTube Title Generator',
    description: 'Create click-worthy titles that rank well in YouTube search',
    icon: FileText,
    badge: 'Most Popular',
    features: ['SEO optimized', 'A/B testing ready', 'Character counter'],
    href: '/tools/title-generator'
  },
  {
    id: 'hook-generator',
    title: 'Hook Generator',
    description: 'Generate compelling hooks that grab attention in the first 15 seconds',
    icon: Zap,
    badge: 'New',
    features: ['Multiple styles', 'Engagement focused', 'Time-tested formulas'],
    href: '/tools/hook-generator'
  },
  {
    id: 'idea-generator',
    title: 'Video Idea Generator',
    description: 'Never run out of content ideas with AI-powered suggestions',
    icon: Lightbulb,
    features: ['Niche specific', 'Trending topics', 'Competition analysis'],
    href: '/tools/idea-generator'
  },
  {
    id: 'hashtag-generator',
    title: 'Hashtag Generator',
    description: 'Find the perfect hashtags to increase your video discoverability',
    icon: Hash,
    features: ['Relevance scoring', 'Competition level', 'Trending tags'],
    href: '/tools/hashtag-generator'
  },
  {
    id: 'thumbnail-ideas',
    title: 'Thumbnail Idea Generator',
    description: 'Get creative thumbnail concepts that boost click-through rates',
    icon: Image,
    features: ['Style suggestions', 'Color psychology', 'Text overlay ideas'],
    href: '/tools/thumbnail-ideas'
  },
  {
    id: 'length-calculator',
    title: 'Script Length Calculator',
    description: 'Calculate the perfect script length for your target video duration',
    icon: Clock,
    features: ['Speaking pace options', 'Word count', 'Read time estimate'],
    href: '/tools/length-calculator'
  }
];

export default function ToolsPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <Badge variant="secondary" className="mb-4">
          100% Free • No Sign-up Required
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold">
          Free YouTube Script Tools
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional tools to help you create better YouTube content, faster. 
          Used by 50,000+ creators worldwide.
        </p>
      </section>

      {/* Tools Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} href={tool.href}>
              <Card className="h-full hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {tool.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary">
                    Try it free
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Stats Section */}
      <section className="grid gap-4 md:grid-cols-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">50K+</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">1M+</p>
            <p className="text-sm text-muted-foreground">Scripts Generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">4.8</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">100%</p>
            <p className="text-sm text-muted-foreground">Free Forever</p>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Are these tools really free?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! All tools on this page are 100% free to use without any sign-up required. 
                We offer premium features for power users, but these tools will always remain free.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How accurate are the AI suggestions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our AI is trained on millions of successful YouTube videos and continuously 
                improves. While results may vary, our tools consistently help creators improve 
                their content performance.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I use these for commercial purposes?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Absolutely! All content generated by our free tools is yours to use however 
                you like, including for commercial YouTube channels and business purposes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}