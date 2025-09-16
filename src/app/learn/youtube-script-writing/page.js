'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Zap, 
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
  FileText,
  Users,
  BarChart3,
  Brain,
  Shield
} from 'lucide-react';
import {
  MarketingHero,
  MarketingSection,
  MarketingCard,
  FeatureGrid,
  ComparisonSection,
  TestimonialSection,
  CTASection,
  FAQSection,
  StatsBar
} from '@/components/marketing/MarketingLayout';
import { MarketingButton } from '@/components/marketing/MarketingButton';

export default function YouTubeScriptWritingGuide() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const scriptStructure = [
    {
      phase: 'Hook',
      duration: '0-15 seconds',
      purpose: 'Grab attention immediately',
      retention: '95%',
      tips: 'Use pattern interrupts, questions, or bold statements'
    },
    {
      phase: 'Promise',
      duration: '15-30 seconds',
      purpose: 'Tell viewers what they\'ll gain',
      retention: '85%',
      tips: 'Be specific about the value and transformation'
    },
    {
      phase: 'Content',
      duration: '30s-8min',
      purpose: 'Deliver value systematically',
      retention: '70%',
      tips: 'Use lists, stories, and examples to maintain engagement'
    },
    {
      phase: 'CTA',
      duration: '15-30 seconds',
      purpose: 'Drive specific action',
      retention: '65%',
      tips: 'Single clear action with a reason why'
    },
    {
      phase: 'End Screen',
      duration: '20 seconds',
      purpose: 'Maximize session duration',
      retention: '60%',
      tips: 'Tease next video or playlist'
    }
  ];

  const hookFormulas = [
    {
      icon: Brain,
      title: 'Question Hook',
      description: 'What if I told you 90% of YouTubers write scripts completely wrong?',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Zap,
      title: 'Mistake Hook',
      description: 'Stop writing your scripts word-for-word! Here\'s what actually works...',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Transformation Hook',
      description: 'How I went from 0 to 100K subscribers in 90 days using this script formula',
      gradient: 'from-green-500/20 to-emerald-500/20'
    }
  ];

  const frameworks = [
    {
      name: 'PVSS Framework',
      description: 'Pattern → Value → Story → Surprise',
      retention: '68%+ average',
      steps: [
        'Pattern: Identify viewer\'s current behavior',
        'Value: Promise specific transformation',
        'Story: Deliver through narrative',
        'Surprise: Add unexpected twist or bonus'
      ]
    },
    {
      name: 'AIDA Model',
      description: 'Attention → Interest → Desire → Action',
      retention: '65%+ average',
      steps: [
        'Attention: Strong hook in first 5 seconds',
        'Interest: Build curiosity with benefits',
        'Desire: Show transformation possible',
        'Action: Clear next step'
      ]
    },
    {
      name: 'Problem-Agitate-Solve',
      description: 'Identify problem → Make it urgent → Provide solution',
      retention: '71%+ average',
      steps: [
        'Problem: Identify pain point clearly',
        'Agitate: Show consequences of not solving',
        'Solve: Present your unique solution'
      ]
    }
  ];

  const examples = [
    {
      title: 'Tech Review Script',
      views: '2.3M views',
      retention: '74%',
      channel: 'TechExplained',
      snippet: 'Everyone\'s been asking me about the new iPhone, but what if I told you there\'s a $200 phone that does everything better?'
    },
    {
      title: 'Educational Script',
      views: '890K views',
      retention: '68%',
      channel: 'LearnFast',
      snippet: 'You\'re learning languages wrong. I know because I wasted 5 years doing it the traditional way.'
    },
    {
      title: 'Entertainment Script',
      views: '5.1M views',
      retention: '71%',
      channel: 'StoryTime',
      snippet: 'I accidentally became a millionaire at 19. It started when I was broke, living in my car...'
    }
  ];

  const stats = [
    { value: '68%', label: 'Avg Retention' },
    { value: '3.2x', label: 'More Views' },
    { value: '89%', label: 'Like Ratio' },
    { value: '2.5x', label: 'Watch Time' }
  ];

  const faqs = [
    {
      question: 'Should I script word-for-word or use bullet points?',
      answer: 'It depends on your experience level. Beginners should script word-for-word for the hook and CTA, but use bullet points for the main content. This ensures key moments are perfect while maintaining natural delivery.'
    },
    {
      question: 'How long should my YouTube script be?',
      answer: 'Aim for 150-160 words per minute of video. A 10-minute video needs roughly 1,500-1,600 words. However, retention matters more than length - a engaging 5-minute video beats a boring 20-minute one.'
    },
    {
      question: 'What\'s the most important part of a YouTube script?',
      answer: 'The first 15 seconds (the hook) determines whether viewers stay or leave. Spend 50% of your scripting time perfecting the hook. If you lose them here, nothing else matters.'
    },
    {
      question: 'How do I make my scripts sound natural?',
      answer: 'Write like you talk. Read your script out loud while writing, use contractions, add personality phrases you actually say, and include planned "mistakes" or tangents that feel authentic.'
    },
    {
      question: 'Should I use the same script structure for every video?',
      answer: 'Use a consistent framework but adapt it to your content type. Educational videos need more structure, vlogs can be looser, and stories benefit from narrative arcs. Test and refine based on your retention graphs.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <MarketingHero
        badge={
          <>
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Complete Script Writing Guide</span>
          </>
        }
        title="The Complete YouTube Script Writing Guide for 2025"
        subtitle="Learn the exact script formulas used by top creators to get 68%+ retention rates. Includes proven templates, real examples, and AI-powered tools."
        primaryCTA={
          <MarketingButton href="/signup" size="large" icon={Download} iconRight>
            Get Free Templates
          </MarketingButton>
        }
        secondaryCTA={
          <MarketingButton variant="secondary" size="large" href="/dashboard">
            Try AI Script Writer
          </MarketingButton>
        }
      >
        <div className="mt-12">
          <StatsBar stats={stats} />
        </div>
      </MarketingHero>

      {/* Script Structure Section */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            The Perfect YouTube Script Structure
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Follow this proven 5-phase structure to maximize retention and engagement
          </p>
        </div>

        <div className="space-y-6">
          {scriptStructure.map((phase, idx) => (
            <MarketingCard key={idx}>
              <div className="grid md:grid-cols-5 gap-6 items-center p-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-xl text-white">{phase.phase}</h3>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Duration</div>
                  <div className="font-semibold text-white">{phase.duration}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Avg Retention</div>
                  <div className="font-semibold text-green-400">{phase.retention}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Purpose</div>
                  <div className="text-white">{phase.purpose}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Pro Tip</div>
                  <div className="text-sm text-gray-300">{phase.tips}</div>
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Hook Formulas */}
      <MarketingSection className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            5 Viral Hook Formulas That Actually Work
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            These hooks have been tested across thousands of videos
          </p>
        </div>
        <FeatureGrid features={hookFormulas} columns={3} />
      </MarketingSection>

      {/* Frameworks Section */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Proven Script Frameworks
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Battle-tested frameworks that consistently deliver high retention
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {frameworks.map((framework, idx) => (
            <MarketingCard key={idx}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{framework.name}</h3>
                <p className="text-gray-400 mb-3">{framework.description}</p>
                <div className="inline-block px-3 py-1 bg-green-500/20 rounded-full text-sm font-medium text-green-400 mb-4">
                  {framework.retention}
                </div>
                <div className="space-y-2">
                  {framework.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Real Examples */}
      <MarketingSection className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Real Script Examples That Went Viral
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Analyze these successful scripts to understand what works
          </p>
        </div>

        <div className="space-y-6">
          {examples.map((example, idx) => (
            <MarketingCard key={idx}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-white">{example.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>@{example.channel}</span>
                      <span>•</span>
                      <span>{example.views}</span>
                      <span>•</span>
                      <span className="text-green-400 font-semibold">{example.retention} retention</span>
                    </div>
                  </div>
                  <MarketingButton variant="secondary" size="small" icon={Play}>
                    Watch Video
                  </MarketingButton>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300 italic">"{example.snippet}"</p>
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* FAQ Section */}
      <FAQSection 
        title="Frequently Asked Questions"
        faqs={faqs}
      />

      {/* CTA Section */}
      <CTASection
        title="Ready to Write Scripts That Get Views?"
        subtitle="Stop guessing what works. Use our AI-powered script writer to create retention-optimized scripts in 30 seconds."
        primaryButton={
          <MarketingButton href="/signup" size="large" icon={ArrowRight} iconRight>
            Try AI Script Writer Free
          </MarketingButton>
        }
        secondaryButton={
          <MarketingButton variant="secondary" size="large" icon={Download} iconRight>
            Download Templates
          </MarketingButton>
        }
        badge={
          <>
            <span className="text-sm text-gray-400">No credit card required • 68% average retention • 127K+ creators</span>
          </>
        }
      />
    </>
  );
}