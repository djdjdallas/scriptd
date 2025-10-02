import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const ctaByCreatorType = {
  developers: {
    headline: 'Start Creating Better Coding Tutorials Today',
    subtext: 'Join 2,500+ developer YouTubers using GenScript to grow their channels'
  },
  'business-educators': {
    headline: 'Transform Your Business Education Content',
    subtext: 'Join 1,800+ business educators building authority and converting viewers'
  },
  'faceless-channels': {
    headline: 'Scale Your Faceless Channel Empire',
    subtext: 'Join 5,000+ creators automating profitable faceless YouTube channels'
  },
  'gaming-creators': {
    headline: 'Level Up Your Gaming Content',
    subtext: 'Join 3,200+ gaming creators with higher engagement and retention'
  },
  'lifestyle-vloggers': {
    headline: 'Create More Authentic, Engaging Vlogs',
    subtext: 'Join 4,100+ lifestyle creators attracting better sponsors and growing faster'
  }
};

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

export default function CreatorCTA({ type, competitor }) {
  const cta = ctaByCreatorType[type] || ctaByCreatorType['developers'];
  const competitorName = formatCompetitor(competitor);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          {cta.headline}
        </h2>
        <p className="text-xl mb-8 text-purple-100">
          {cta.subtext}
        </p>
        <p className="text-lg mb-8 text-purple-100">
          Free 7-day trial • No credit card required • Better than {competitorName}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 bg-transparent text-white border-white hover:bg-white hover:text-purple-600">
              View Pricing
            </Button>
          </Link>
        </div>
        <p className="mt-8 text-sm text-purple-200">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
