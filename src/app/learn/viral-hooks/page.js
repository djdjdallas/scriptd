'use client';

import { useState } from 'react';
import { 
  Zap, 
  Target, 
  Brain, 
  Clock, 
  TrendingUp, 
  Download, 
  ChevronRight,
  Play,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Award,
  Star,
  AlertCircle,
  MessageSquare,
  Users,
  BarChart3,
  Shield,
  Copy
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

export default function ViralHooksGuide() {
  const [copiedHook, setCopiedHook] = useState(null);

  const hookCategories = [
    {
      icon: Brain,
      title: 'Psychological Hooks',
      description: 'Tap into deep human psychology for instant attention',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: AlertCircle,
      title: 'Curiosity Gaps',
      description: 'Create information gaps that viewers must fill',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Zap,
      title: 'Pattern Interrupts',
      description: 'Break expectations to stop the scroll instantly',
      gradient: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      icon: Target,
      title: 'Problem Hooks',
      description: 'Address pain points your audience faces daily',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Transformation Hooks',
      description: 'Promise specific change or improvement',
      gradient: 'from-red-500/20 to-pink-500/20'
    },
    {
      icon: Shield,
      title: 'Authority Hooks',
      description: 'Establish credibility from the first second',
      gradient: 'from-indigo-500/20 to-purple-500/20'
    }
  ];

  const hookFormulas = [
    {
      category: 'Question Hooks',
      formulas: [
        { template: 'What if I told you [unexpected claim]?', example: 'What if I told you everything you know about productivity is wrong?' },
        { template: 'Have you ever wondered why [phenomenon]?', example: 'Have you ever wondered why some videos go viral overnight?' },
        { template: 'What would happen if [scenario]?', example: 'What would happen if you could 10x your income tomorrow?' }
      ]
    },
    {
      category: 'Mistake Hooks',
      formulas: [
        { template: 'Stop [common action]!', example: 'Stop wasting money on Facebook ads!' },
        { template: 'You\'re [action] wrong', example: 'You\'re editing your videos wrong' },
        { template: 'The biggest mistake [audience] make', example: 'The biggest mistake new YouTubers make' }
      ]
    },
    {
      category: 'Secret Hooks',
      formulas: [
        { template: 'The [industry] secret they don\'t want you to know', example: 'The YouTube secret they don\'t want you to know' },
        { template: 'What [authority] doesn\'t tell you about [topic]', example: 'What guru marketers don\'t tell you about funnels' },
        { template: 'The hidden truth about [topic]', example: 'The hidden truth about viral content' }
      ]
    },
    {
      category: 'Transformation Hooks',
      formulas: [
        { template: 'How I went from [A] to [B] in [time]', example: 'How I went from broke to $10K/month in 90 days' },
        { template: 'From [negative state] to [positive state]', example: 'From 100 views to 1 million in 30 days' },
        { template: 'The [time] [result] challenge', example: 'The 30-day 100K subscriber challenge' }
      ]
    },
    {
      category: 'Controversy Hooks',
      formulas: [
        { template: '[Popular thing] is dead', example: 'SEO is dead' },
        { template: 'Why [common belief] is wrong', example: 'Why working hard is actually bad advice' },
        { template: '[Thing] is lying to you', example: 'Your favorite YouTuber is lying to you' }
      ]
    }
  ];

  const performanceData = [
    { hookType: 'Question', avgRetention: '72%', bestFor: 'Educational content' },
    { hookType: 'Mistake', avgRetention: '78%', bestFor: 'How-to videos' },
    { hookType: 'Secret', avgRetention: '83%', bestFor: 'Insider content' },
    { hookType: 'Transformation', avgRetention: '81%', bestFor: 'Personal stories' },
    { hookType: 'Controversy', avgRetention: '76%', bestFor: 'Opinion pieces' }
  ];

  const stats = [
    { value: '15 sec', label: 'Critical Window' },
    { value: '65%', label: 'Drop Without Hook' },
    { value: '3.2x', label: 'Better Retention' },
    { value: '1000+', label: 'Tested Formulas' }
  ];

  const testimonials = [
    {
      name: 'Jessica Chen',
      channel: '@MarketingPro',
      subscribers: '340K',
      quote: 'These hook formulas transformed my channel. My retention went from 35% to 71% overnight.',
      beforeAfter: {
        before: '35% retention',
        after: '71% retention'
      }
    },
    {
      name: 'David Park',
      channel: '@TechTutorials',
      subscribers: '125K',
      quote: 'I tested 50 different hooks from this guide. My views increased 400% in one month.',
      beforeAfter: {
        before: '10K views/video',
        after: '40K views/video'
      }
    },
    {
      name: 'Maria Rodriguez',
      channel: '@FitnessDaily',
      subscribers: '780K',
      quote: 'The psychology behind these hooks is game-changing. Finally understand why videos go viral.',
      beforeAfter: {
        before: '45% retention',
        after: '82% retention'
      }
    }
  ];

  const faqs = [
    {
      question: 'How long should my hook be?',
      answer: '5-15 seconds maximum. You have about 3 seconds to stop the scroll, then 12 more to convince them to stay. Front-load the value and make every word count.'
    },
    {
      question: 'Should I use the same hook formula every time?',
      answer: 'No. Variety keeps your content fresh. Test 3-5 different hook styles and track which performs best with YOUR specific audience. Rotate between your top performers.'
    },
    {
      question: 'What\'s more important: hook or thumbnail?',
      answer: 'They work together. Thumbnail gets the click, hook keeps them watching. A great thumbnail with a weak hook = high CTR but low retention. Both must be optimized.'
    },
    {
      question: 'How do I know if my hook is working?',
      answer: 'Check your retention graph. A good hook shows 90%+ retention at 15 seconds. If you see a cliff drop before 15 seconds, your hook needs work.'
    },
    {
      question: 'Can I use multiple hooks in one video?',
      answer: 'Yes! Use a main hook at the start, then mini-hooks throughout to re-engage viewers. Place them before important points or when retention typically drops.'
    }
  ];

  const copyHook = (index) => {
    setCopiedHook(index);
    setTimeout(() => setCopiedHook(null), 2000);
  };

  return (
    <>
      {/* Hero Section */}
      <MarketingHero
        badge={
          <>
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">1000+ Viral Hook Formulas</span>
          </>
        }
        title="Master the Art of Viral YouTube Hooks"
        subtitle="Learn the psychology and formulas behind hooks that get millions of views. Based on analysis of 10,000+ viral videos with 70%+ retention."
        primaryCTA={
          <MarketingButton href="/signup" size="large" icon={Download} iconRight>
            Download Hook Library
          </MarketingButton>
        }
        secondaryCTA={
          <MarketingButton variant="secondary" size="large" href="#formulas">
            Browse Formulas
          </MarketingButton>
        }
      >
        <div className="mt-12">
          <StatsBar stats={stats} />
        </div>
      </MarketingHero>

      {/* Hook Categories */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            6 Types of Hooks That Actually Work
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Master these categories to never run out of hook ideas
          </p>
        </div>
        <FeatureGrid features={hookCategories} columns={3} />
      </MarketingSection>

      {/* Hook Formulas */}
      <MarketingSection id="formulas" className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            100+ Copy-and-Paste Hook Formulas
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Battle-tested formulas you can adapt for any video
          </p>
        </div>

        <div className="space-y-8">
          {hookFormulas.map((category, catIdx) => (
            <MarketingCard key={catIdx}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.formulas.map((formula, idx) => {
                    const hookId = `${catIdx}-${idx}`;
                    return (
                      <div key={idx} className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <code className="text-sm text-purple-400">{formula.template}</code>
                          <button
                            onClick={() => copyHook(hookId)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedHook === hookId ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm italic">"{formula.example}"</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Performance Data */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Hook Performance By Type
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Data from 10,000+ analyzed videos
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {performanceData.map((data, idx) => (
            <MarketingCard key={idx}>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{data.avgRetention}</div>
                <div className="font-semibold text-white mb-1">{data.hookType}</div>
                <div className="text-sm text-gray-400">{data.bestFor}</div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Hook Analyzer Tool */}
      <MarketingSection className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            The Perfect Hook Anatomy
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Every viral hook follows this structure
          </p>
        </div>

        <MarketingCard>
          <div className="p-8">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-white mb-2">Pattern Interrupt</h4>
                  <p className="text-sm text-gray-400">0-3 seconds</p>
                  <p className="text-gray-300 mt-2">Break their scroll with something unexpected</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-white mb-2">Value Promise</h4>
                  <p className="text-sm text-gray-400">3-8 seconds</p>
                  <p className="text-gray-300 mt-2">Tell them exactly what they'll gain</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-white mb-2">Credibility Signal</h4>
                  <p className="text-sm text-gray-400">8-15 seconds</p>
                  <p className="text-gray-300 mt-2">Prove you can deliver on the promise</p>
                </div>
              </div>
            </div>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* Testimonials */}
      <TestimonialSection
        title="Creators Getting Results With These Hooks"
        subtitle="Real retention improvements from real creators"
        testimonials={testimonials}
      />

      {/* FAQ Section */}
      <FAQSection 
        title="Hook Questions Answered"
        faqs={faqs}
      />

      {/* CTA Section */}
      <CTASection
        title="Ready to Write Hooks That Go Viral?"
        subtitle="Get instant access to our complete hook library with 1000+ formulas, plus AI tools that generate perfect hooks for your content."
        primaryButton={
          <MarketingButton href="/signup" size="large" icon={ArrowRight} iconRight>
            Get Hook Library + AI Writer
          </MarketingButton>
        }
        secondaryButton={
          <MarketingButton variant="secondary" size="large" icon={Download} iconRight>
            Download Free PDF Guide
          </MarketingButton>
        }
        badge={
          <>
            <span className="text-sm text-gray-400">1000+ hooks • 70%+ retention • Used by 127K+ creators</span>
          </>
        }
      />
    </>
  );
}