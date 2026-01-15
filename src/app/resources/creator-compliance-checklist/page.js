'use client';

/**
 * Creator Compliance Checklist
 *
 * Scannable 5-point checklist with before/after examples for
 * making AI scripts compliant with YouTube's policy.
 */

import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Download,
  BookOpen,
  User,
  BarChart3,
  MessageSquare,
  Sparkles,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MarketingSection,
  MarketingCard,
  CTASection
} from '@/components/marketing/MarketingLayout';

// The 5 checklist items
const checklistItems = [
  {
    number: 1,
    icon: User,
    title: 'Add a Personal Story',
    description: 'Include at least one personal anecdote, experience, or observation that only you could share.',
    tip: 'Even a quick "When I first tried this..." or "Last week I noticed..." works.',
    before: {
      text: 'Productivity is important for content creators. Many people struggle to stay focused and complete their work on time.',
      issues: ['Generic statement', 'No personal connection', 'Could be written by anyone']
    },
    after: {
      text: 'I used to think I was just lazy. But after tracking my work for 30 days, I realized I was losing 3 hours daily to context switching between tabs.',
      improvements: ['Personal experience', 'Specific timeframe', 'Real data point']
    }
  },
  {
    number: 2,
    icon: BarChart3,
    title: 'Include Specific Numbers',
    description: 'Replace vague claims with concrete data, measurements, or statistics from your own experience.',
    tip: 'Real numbers don\'t have to be impressive—they just need to be specific and true.',
    before: {
      text: 'This strategy can significantly improve your YouTube performance and help you get better results over time.',
      issues: ['Vague "significantly"', 'No measurable claims', 'Generic promise']
    },
    after: {
      text: 'After implementing this, my CTR jumped from 4.2% to 7.1% in 3 weeks. My average view duration increased by 47 seconds.',
      improvements: ['Exact percentages', 'Specific timeframe', 'Multiple data points']
    }
  },
  {
    number: 3,
    icon: MessageSquare,
    title: 'State a Clear Opinion',
    description: 'Take a stance on something. AI models avoid controversy—humans have preferences and hot takes.',
    tip: 'Disagree with common advice, pick favorites, or share unpopular opinions you genuinely hold.',
    before: {
      text: 'There are various approaches to thumbnail design. Different strategies work for different creators and niches.',
      issues: ['Neutral fence-sitting', 'No clear stance', 'AI-like balance']
    },
    after: {
      text: 'Face thumbnails are overrated. I know every guru pushes them, but my faceless thumbnails consistently outperform by 2x. Here\'s why.',
      improvements: ['Strong opinion', 'Contrarian stance', 'Backed by experience']
    }
  },
  {
    number: 4,
    icon: Sparkles,
    title: 'Remove AI Language Patterns',
    description: 'Cut hedging phrases, formulaic transitions, and overly formal language that screams "AI wrote this."',
    tip: 'Read your script aloud. If it sounds like a corporate memo, rewrite it like you\'re texting a friend.',
    before: {
      text: 'Furthermore, it is important to note that this approach can potentially yield beneficial results. Additionally, one might consider...',
      issues: ['"Furthermore"', '"It is important to note"', '"Potentially"', '"One might consider"']
    },
    after: {
      text: 'Here\'s the thing though—this actually works. I was skeptical too until I tried it. Let me show you exactly what happened.',
      improvements: ['Conversational tone', 'Direct language', 'Personality']
    }
  },
  {
    number: 5,
    icon: CheckCircle2,
    title: 'Add a "Mistake I Made" Moment',
    description: 'Share something that went wrong, a lesson learned the hard way, or a misconception you used to have.',
    tip: 'Vulnerability builds trust and proves human authorship. AI doesn\'t have embarrassing failures.',
    before: {
      text: 'Following these best practices will help ensure your success. Apply these proven strategies to achieve optimal results.',
      issues: ['Perfect advice', 'No vulnerability', 'No learning journey']
    },
    after: {
      text: 'I wasted 6 months doing this wrong. I thought posting daily was the answer—turns out I was just burning out while my retention tanked.',
      improvements: ['Admits failure', 'Specific mistake', 'Shows growth']
    }
  }
];

export default function CreatorComplianceChecklist() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <MarketingSection gradient className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Free Checklist</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
            5 Things to Add to Any AI Script
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            A simple checklist to make your AI-assisted scripts compliant with
            YouTube&apos;s 2025 authenticity policy. With real before/after examples.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Checklist
            </Button>
            <Link href="/compliance-check">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Shield className="w-4 h-4 mr-2" />
                Check Your Script
              </Button>
            </Link>
          </div>
        </div>
      </MarketingSection>

      {/* Quick Summary Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <MarketingCard className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Reference</h3>
          <div className="grid sm:grid-cols-5 gap-4">
            {checklistItems.map((item) => (
              <div key={item.number} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-purple-300">{item.number}</span>
                </div>
                <span className="text-sm text-gray-300 truncate">{item.title.replace('Add a ', '').replace('Include ', '').replace('State a ', '').replace('Remove ', '').replace('Add a ', '')}</span>
              </div>
            ))}
          </div>
        </MarketingCard>
      </div>

      {/* Main Checklist */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {checklistItems.map((item) => (
            <div key={item.number} id={`item-${item.number}`} className="print:break-inside-avoid">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-purple-400">#{item.number}</span>
                    <h2 className="text-2xl font-bold text-white">{item.title}</h2>
                  </div>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>

              {/* Tip Box */}
              <div className="ml-16 mb-6">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-300 m-0">{item.tip}</p>
                </div>
              </div>

              {/* Before/After Comparison */}
              <div className="ml-16 grid md:grid-cols-2 gap-4">
                {/* Before */}
                <MarketingCard className="p-5 border-red-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-red-400">Before</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 italic">&quot;{item.before.text}&quot;</p>
                  <div className="space-y-1">
                    {item.before.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-red-400/80">
                        <XCircle className="w-3 h-3" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </MarketingCard>

                {/* After */}
                <MarketingCard className="p-5 border-green-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-400">After</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 italic">&quot;{item.after.text}&quot;</p>
                  <div className="space-y-1">
                    {item.after.improvements.map((improvement, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-green-400/80">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{improvement}</span>
                      </div>
                    ))}
                  </div>
                </MarketingCard>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Printable Checklist Section */}
      <MarketingSection className="print:block">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Your Compliance Checklist
          </h2>

          <MarketingCard className="p-8">
            <div className="space-y-6">
              {checklistItems.map((item) => (
                <div key={item.number} className="flex items-start gap-4">
                  <div className="w-6 h-6 border-2 border-gray-600 rounded flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-sm text-gray-400">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Script Title: _______________________</span>
                <span>Date: __________</span>
              </div>
            </div>
          </MarketingCard>

          <div className="text-center mt-6">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print This Checklist
            </Button>
          </div>
        </div>
      </MarketingSection>

      {/* Bonus Tips Section */}
      <MarketingSection>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Bonus: Quick Fixes for Common Issues
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <MarketingCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Replace These Phrases</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">&quot;It&apos;s important to note...&quot;</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-green-400">&quot;Here&apos;s the thing...&quot;</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">&quot;Additionally...&quot;</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-green-400">&quot;And...&quot; or &quot;Plus...&quot;</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">&quot;In conclusion...&quot;</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-green-400">&quot;So here&apos;s my take...&quot;</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">&quot;It can be said...&quot;</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-green-400">&quot;I think...&quot;</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">&quot;One might consider...&quot;</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-green-400">&quot;Try this...&quot;</span>
                </div>
              </div>
            </MarketingCard>

            <MarketingCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Easy Authenticity Adds</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">&quot;When I first started...&quot;</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">&quot;Last [week/month] I tried...&quot;</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">&quot;My results showed [specific number]...&quot;</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">&quot;I disagree with [common advice] because...&quot;</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">&quot;I made the mistake of...&quot;</span>
                </div>
              </div>
            </MarketingCard>
          </div>
        </div>
      </MarketingSection>

      {/* Related Resources */}
      <MarketingSection>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Continue Learning
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/resources/youtube-compliance-whitepaper" className="block">
              <MarketingCard className="p-6 h-full hover:border-purple-500/50 transition-colors">
                <BookOpen className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  YouTube Compliance Whitepaper
                </h3>
                <p className="text-gray-400 text-sm">
                  Deep dive into YouTube&apos;s 2025 authenticity policy and the technical
                  framework behind our compliance checker.
                </p>
                <div className="mt-4 text-purple-400 text-sm flex items-center gap-1">
                  Read whitepaper <ArrowRight className="w-3 h-3" />
                </div>
              </MarketingCard>
            </Link>

            <Link href="/compliance-check" className="block">
              <MarketingCard className="p-6 h-full hover:border-purple-500/50 transition-colors">
                <Shield className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Free Compliance Checker
                </h3>
                <p className="text-gray-400 text-sm">
                  Paste your script and get instant feedback on compliance issues with
                  specific suggestions for improvement.
                </p>
                <div className="mt-4 text-green-400 text-sm flex items-center gap-1">
                  Check your script <ArrowRight className="w-3 h-3" />
                </div>
              </MarketingCard>
            </Link>
          </div>
        </div>
      </MarketingSection>

      {/* Final CTA */}
      <CTASection
        title="Write Scripts That Stay Monetized"
        subtitle="GenScript generates YouTube scripts with built-in compliance checking."
        badge={
          <>
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Built for YouTube&apos;s 2025 Policy</span>
          </>
        }
        features={[
          'Real-time compliance scoring',
          'AI voice matching',
          'Retention optimization',
          '50 free credits to start'
        ]}
        primaryButton={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
              Start Writing Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryButton={
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
              View Pricing
            </Button>
          </Link>
        }
      />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .glass, .glass-card {
            background: white !important;
            border: 1px solid #ccc !important;
          }
          .text-white, .text-gray-300, .text-gray-400 {
            color: black !important;
          }
          .text-purple-400, .text-green-400, .text-red-400, .text-blue-400 {
            color: #333 !important;
          }
          .bg-gradient-to-r, .bg-gradient-to-br {
            background: white !important;
          }
          button, a[href="/login"], a[href="/pricing"], a[href="/compliance-check"] {
            display: none !important;
          }
          nav, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
