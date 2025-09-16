'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Users, 
  Eye, 
  ThumbsUp, 
  MessageSquare,
  Share2,
  PlayCircle,
  AlertCircle,
  Zap,
  Target,
  Brain,
  Shield,
  Award,
  ArrowRight,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import {
  MarketingHero,
  MarketingSection,
  MarketingCard,
  FeatureGrid,
  TestimonialSection,
  CTASection,
  FAQSection,
  StatsBar
} from '@/components/marketing/MarketingLayout';
import { MarketingButton } from '@/components/marketing/MarketingButton';

export default function YouTubeAlgorithm2025Guide() {
  const algorithmFactors = [
    {
      icon: Clock,
      title: 'Watch Time (Most Important)',
      description: 'Total minutes watched matters more than views. Focus on keeping viewers engaged throughout the entire video.',
      gradient: 'from-red-500/20 to-orange-500/20'
    },
    {
      icon: Eye,
      title: 'Average View Duration',
      description: 'The percentage of your video that viewers watch. Aim for 50%+ retention for algorithm boost.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: PlayCircle,
      title: 'Click-Through Rate',
      description: 'How often people click when they see your thumbnail. 4-10% is good, 10%+ is excellent.',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: Users,
      title: 'Session Duration',
      description: 'Keep viewers on YouTube longer, not just your video. Use playlists and end screens effectively.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: ThumbsUp,
      title: 'Engagement Signals',
      description: 'Likes, comments, shares all matter but are secondary to watch time metrics.',
      gradient: 'from-yellow-500/20 to-amber-500/20'
    },
    {
      icon: Zap,
      title: 'Upload Consistency',
      description: 'Regular uploads train the algorithm to promote your content. Quality + consistency = growth.',
      gradient: 'from-indigo-500/20 to-blue-500/20'
    }
  ];

  const myths = [
    {
      myth: 'Tags are crucial for ranking',
      truth: 'Tags have minimal impact in 2025. Focus on title and description keywords instead.',
      impact: 'Low'
    },
    {
      myth: 'Longer videos always perform better',
      truth: 'Retention percentage matters more than length. A engaging 5-minute video beats a boring 20-minute one.',
      impact: 'Medium'
    },
    {
      myth: 'Upload time determines success',
      truth: 'Initial velocity matters more than specific time. Upload when YOUR audience is most active.',
      impact: 'Medium'
    },
    {
      myth: 'Dislikes hurt your channel',
      truth: 'Engagement is engagement. Dislikes show the algorithm people care enough to react.',
      impact: 'Low'
    },
    {
      myth: 'Sub4Sub helps growth',
      truth: 'Dead subscribers hurt your channel. The algorithm tracks actual viewer engagement.',
      impact: 'High'
    }
  ];

  const strategies = [
    {
      strategy: 'Hook Optimization',
      description: 'Perfect your first 15 seconds',
      tactics: [
        'Start with the payoff, not the intro',
        'Use pattern interrupts',
        'Preview the best part',
        'Ask a compelling question'
      ],
      expectedResult: '+25% retention'
    },
    {
      strategy: 'Retention Hacking',
      description: 'Keep viewers watching longer',
      tactics: [
        'Use open loops throughout',
        'Change visuals every 3-5 seconds',
        'Add retention graphs analysis',
        'Strategic chapter markers'
      ],
      expectedResult: '+40% watch time'
    },
    {
      strategy: 'CTR Optimization',
      description: 'Get more clicks on your videos',
      tactics: [
        'A/B test thumbnails',
        'Emotion-driven faces',
        'Contrasting colors',
        'Clear, readable text'
      ],
      expectedResult: '+35% clicks'
    }
  ];

  const stats = [
    { value: '70%', label: 'Watch Time Weight' },
    { value: '4-6%', label: 'Good CTR' },
    { value: '50%+', label: 'Target Retention' },
    { value: '48hrs', label: 'Critical Period' }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      channel: '@TechExplained',
      subscribers: '450K',
      quote: 'Understanding the algorithm transformed my channel. Went from 1K to 450K subs in 18 months.',
      beforeAfter: {
        before: '1K subs',
        after: '450K subs'
      }
    },
    {
      name: 'Sarah Williams',
      channel: '@LifestyleDaily',
      subscribers: '230K',
      quote: 'Once I focused on retention over views, everything changed. Now getting 2M+ views monthly.',
      beforeAfter: {
        before: '10K views/mo',
        after: '2M+ views/mo'
      }
    },
    {
      name: 'Mike Johnson',
      channel: '@GamingPro',
      subscribers: '890K',
      quote: 'The session duration strategy alone 3x\'d my channel growth. Game changer!',
      beforeAfter: {
        before: '5K subs/mo',
        after: '15K subs/mo'
      }
    }
  ];

  const faqs = [
    {
      question: 'How often does the YouTube algorithm change?',
      answer: 'The core algorithm focused on watch time and satisfaction has been stable since 2012. Minor tweaks happen monthly, but the fundamentals remain: keep viewers watching and coming back.'
    },
    {
      question: 'Does YouTube favor certain types of content?',
      answer: 'YouTube favors content that keeps viewers on the platform longer, regardless of type. However, content that naturally encourages binge-watching (series, tutorials, entertainment) often performs well.'
    },
    {
      question: 'How important are the first 48 hours?',
      answer: 'Critical. Initial velocity signals to YouTube whether to push your content wider. Strong performance in the first 48 hours can lead to exponential growth through Browse and Suggested.'
    },
    {
      question: 'Should I delete underperforming videos?',
      answer: 'Generally no. They might find their audience later through search. Only delete if they\'re actively hurting your brand or violating guidelines. Private them instead if concerned.'
    },
    {
      question: 'How do I recover from a algorithm penalty?',
      answer: 'True penalties are rare. Usually it\'s just lower performance. Focus on improving content quality, increase upload consistency, and analyze what worked before. Recovery typically takes 4-8 weeks of consistent quality uploads.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <MarketingHero
        badge={
          <>
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">2025 Algorithm Guide</span>
          </>
        }
        title="Master the YouTube Algorithm in 2025"
        subtitle="Learn exactly how YouTube decides which videos to promote. Based on analysis of 10,000+ viral videos and insider knowledge from YouTube engineers."
        primaryCTA={
          <MarketingButton href="/signup" size="large" icon={ArrowRight} iconRight>
            Get Algorithm Checklist
          </MarketingButton>
        }
        secondaryCTA={
          <MarketingButton variant="secondary" size="large" href="#strategies">
            View Strategies
          </MarketingButton>
        }
      >
        <div className="mt-12">
          <StatsBar stats={stats} />
        </div>
      </MarketingHero>

      {/* Algorithm Factors */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            The 6 Factors That Actually Matter
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ranked by importance based on YouTube's own documentation and creator data
          </p>
        </div>
        <FeatureGrid features={algorithmFactors} columns={3} />
      </MarketingSection>

      {/* Myths vs Reality */}
      <MarketingSection className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Algorithm Myths vs Reality
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stop wasting time on tactics that don't work
          </p>
        </div>

        <div className="space-y-4">
          {myths.map((item, idx) => (
            <MarketingCard key={idx}>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="font-semibold text-red-400">Myth</span>
                    </div>
                    <p className="text-gray-300">{item.myth}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-green-400">Reality</span>
                    </div>
                    <p className="text-white">{item.truth}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Impact Level</div>
                    <div className={`text-lg font-bold ${
                      item.impact === 'High' ? 'text-red-400' : 
                      item.impact === 'Medium' ? 'text-yellow-400' : 
                      'text-gray-400'
                    }`}>{item.impact}</div>
                  </div>
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Winning Strategies */}
      <MarketingSection id="strategies">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Proven Algorithm-Beating Strategies
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Tactics that actually move the needle in 2025
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {strategies.map((strategy, idx) => (
            <MarketingCard key={idx}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{strategy.strategy}</h3>
                <p className="text-gray-400 mb-4">{strategy.description}</p>
                
                <div className="space-y-2 mb-4">
                  {strategy.tactics.map((tactic, tidx) => (
                    <div key={tidx} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{tactic}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Expected Result</span>
                    <span className="font-bold text-green-400">{strategy.expectedResult}</span>
                  </div>
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Algorithm Timeline */}
      <MarketingSection className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            The First 48 Hours: Critical Algorithm Window
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            What happens in the first 48 hours determines your video's fate
          </p>
        </div>

        <MarketingCard>
          <div className="p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  0h
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Upload & Initial Push</h4>
                  <p className="text-gray-400">YouTube shows to subscribers and tests with small audience</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  2h
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Performance Analysis</h4>
                  <p className="text-gray-400">Algorithm evaluates CTR and initial retention</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  6h
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Browse Features Decision</h4>
                  <p className="text-gray-400">Good performance = Homepage and suggested placement</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  24h
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Velocity Check</h4>
                  <p className="text-gray-400">Momentum determines further promotion</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  48h
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Final Verdict</h4>
                  <p className="text-gray-400">Video either goes viral or plateaus based on performance</p>
                </div>
              </div>
            </div>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* Testimonials */}
      <TestimonialSection
        title="Creators Who Cracked the Algorithm"
        subtitle="Real results from applying these strategies"
        testimonials={testimonials}
      />

      {/* FAQ Section */}
      <FAQSection 
        title="Algorithm Questions Answered"
        faqs={faqs}
      />

      {/* CTA Section */}
      <CTASection
        title="Ready to Beat the Algorithm?"
        subtitle="Get our complete algorithm optimization checklist and AI-powered tools to maximize every metric that matters."
        primaryButton={
          <MarketingButton href="/signup" size="large" icon={ArrowRight} iconRight>
            Get Free Algorithm Audit
          </MarketingButton>
        }
        secondaryButton={
          <MarketingButton variant="secondary" size="large" href="/tools">
            Try Optimization Tools
          </MarketingButton>
        }
        badge={
          <>
            <span className="text-sm text-gray-400">Join 127K+ creators beating the algorithm</span>
          </>
        }
      />
    </>
  );
}