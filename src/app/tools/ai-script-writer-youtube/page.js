'use client';

/**
 * AI Script Writer for YouTube Page
 *
 * SEO landing page for "ai script writer youtube" keyword.
 * Focus on AI capabilities and compliance/voice matching.
 */

import Link from 'next/link';
import {
  Brain,
  Shield,
  Wand2,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  FileText,
  Sparkles,
  Users,
  Mic,
  RefreshCw,
  AlertTriangle,
  Zap,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MarketingSection,
  MarketingCard,
  MarketingHero,
  CTASection,
  FAQSection
} from '@/components/marketing/MarketingLayout';

// Why AI for YouTube scripts
const whyAI = [
  {
    icon: Brain,
    title: 'Trained on Viral Content',
    description: 'Our AI has analyzed millions of successful YouTube videos to understand what keeps viewers watching.',
    stat: '10M+',
    statLabel: 'videos analyzed'
  },
  {
    icon: Shield,
    title: 'Compliance Aware',
    description: 'The only AI that understands YouTube\'s 2025 authenticity policy and generates accordingly.',
    stat: '95%',
    statLabel: 'compliance pass rate'
  },
  {
    icon: Mic,
    title: 'Voice Cloning',
    description: 'Upload samples and our AI learns your unique style -word choices, rhythm, personality.',
    stat: '99%',
    statLabel: 'voice accuracy'
  },
  {
    icon: TrendingUp,
    title: 'Retention Optimized',
    description: 'Every script uses proven structures that maximize average view duration and engagement.',
    stat: '68%+',
    statLabel: 'avg retention'
  }
];

// AI vs manual comparison
const aiVsManual = [
  {
    aspect: 'Time to first draft',
    manual: '2-4 hours',
    ai: '30 seconds'
  },
  {
    aspect: 'Compliance checking',
    manual: 'Manual review (if any)',
    ai: 'Real-time automated'
  },
  {
    aspect: 'Structure optimization',
    manual: 'Trial and error',
    ai: 'Proven patterns built-in'
  },
  {
    aspect: 'Voice consistency',
    manual: 'Varies by day/mood',
    ai: 'AI-matched every time'
  },
  {
    aspect: 'Hook library',
    manual: 'Research yourself',
    ai: '1000+ proven hooks'
  },
  {
    aspect: 'Cost per script',
    manual: '2-4 hours of time',
    ai: '$0.10-0.50 per script'
  }
];

// The GenScript AI difference
const aiDifference = [
  {
    title: 'Not Just Another ChatGPT Wrapper',
    description: 'Generic AI tools don\'t understand YouTube. GenScript\'s AI is purpose-built for video scripts with retention psychology, compliance awareness, and platform-specific optimization.',
    icon: Brain
  },
  {
    title: 'Your Voice, Amplified',
    description: 'We don\'t replace your creativity -we amplify it. Upload your best content and our AI captures your unique voice, then generates scripts that sound like you on your best day.',
    icon: Mic
  },
  {
    title: 'Policy-Proof by Design',
    description: 'Every AI output is analyzed against YouTube\'s content guidelines. We flag potential issues and suggest fixes before you hit publish, not after you get demonetized.',
    icon: Shield
  }
];

// FAQs
const faqs = [
  {
    question: 'Is AI-written content allowed on YouTube?',
    answer: 'Yes, YouTube explicitly allows AI-assisted content creation. What they prohibit is content that lacks "meaningful human contribution." GenScript\'s compliance checker helps ensure your scripts include the original insight and personal touch that YouTube requires.'
  },
  {
    question: 'How does the AI voice matching work?',
    answer: 'Upload 3-5 samples of your existing content (scripts, blog posts, or transcripts). Our AI analyzes your vocabulary, sentence structure, humor style, and personality markers. Future scripts are generated to match these patterns while maintaining compliance.'
  },
  {
    question: 'Will my scripts sound robotic?',
    answer: 'No. GenScript is specifically designed to avoid AI patterns that sound robotic -hedging language, formulaic transitions, and overly formal tone. Our compliance checker actively flags these issues and suggests natural alternatives.'
  },
  {
    question: 'Can I use this for faceless channels?',
    answer: 'Absolutely. Many of our users run faceless channels. The AI generates scripts optimized for voiceover delivery, and compliance checking is even more important for faceless content where personal presence isn\'t visible.'
  },
  {
    question: 'How does pricing work?',
    answer: 'You get 50 free credits to start. Paid plans start at $39/month for 300 credits. Each script uses 1-3 credits depending on length and complexity. A typical 10-minute video script uses 1-2 credits.'
  },
  {
    question: 'Is my content data secure?',
    answer: 'Yes. Your scripts and voice samples are encrypted and never used to train our public models. Your content remains yours. We\'re GDPR compliant and offer data deletion on request.'
  }
];

export default function AIScriptWriterYouTubePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <MarketingHero
        badge={
          <>
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">AI-Powered Script Writing</span>
          </>
        }
        title={
          <>
            AI Script Writer
            <br />
            <span className="text-3xl md:text-5xl text-gray-400">Built for YouTube</span>
          </>
        }
        subtitle="The only AI script writer that understands YouTube's policies, matches your voice, and optimizes for retention. Not a generic tool -a YouTube specialist."
        primaryCTA={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
              Try AI Script Writer Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryCTA={
          <Link href="/compare/genscript-vs-chatgpt">
            <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              See ChatGPT Comparison
            </Button>
          </Link>
        }
        metrics={[
          { icon: Users, label: '10,000+ creators' },
          { icon: Shield, label: 'Compliance checked' },
          { icon: Star, label: '4.9/5 rating' }
        ]}
      />

      {/* Why AI for YouTube */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Why Use AI for YouTube Scripts?</h2>
          <p className="text-xl text-gray-400">Purpose-built AI that understands the platform</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {whyAI.map((item, idx) => (
            <MarketingCard key={idx} className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{item.stat}</div>
              <div className="text-sm text-purple-400 mb-3">{item.statLabel}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* AI vs Manual */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">AI vs Manual Script Writing</h2>
          <p className="text-xl text-gray-400">See what you gain by switching to AI</p>
        </div>

        <MarketingCard className="max-w-3xl mx-auto overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Aspect</th>
                  <th className="text-center py-4 px-6 text-gray-400 font-medium">Manual Writing</th>
                  <th className="text-center py-4 px-6 text-purple-400 font-medium">GenScript AI</th>
                </tr>
              </thead>
              <tbody>
                {aiVsManual.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-800">
                    <td className="py-4 px-6 text-white font-medium">{row.aspect}</td>
                    <td className="py-4 px-6 text-center text-gray-400">{row.manual}</td>
                    <td className="py-4 px-6 text-center text-green-400 bg-purple-500/5">{row.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* The GenScript Difference */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">The GenScript AI Difference</h2>
          <p className="text-xl text-gray-400">What makes our AI different from generic tools</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {aiDifference.map((item, idx) => (
            <MarketingCard key={idx} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Compliance Warning */}
      <MarketingSection>
        <MarketingCard className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Warning: Not All AI Script Writers Are Safe
              </h2>
              <p className="text-gray-300 mb-4">
                Generic AI tools like ChatGPT don&apos;t understand YouTube&apos;s 2025 authenticity policy.
                Scripts generated without compliance checking can result in demonetization, reduced reach,
                or even channel strikes. GenScript is the only AI script writer with built-in policy compliance.
              </p>
              <Link href="/compliance-check">
                <Button variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                  Check Any Script for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* FAQs */}
      <FAQSection
        title="Frequently Asked Questions"
        faqs={faqs}
      />

      {/* Final CTA */}
      <CTASection
        title="Try AI Script Writing Today"
        subtitle="50 free credits. No credit card required. See the difference AI can make."
        badge={
          <>
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">YouTube-Specialized AI</span>
          </>
        }
        features={[
          'Voice matching included',
          'Real-time compliance checking',
          'Retention optimization',
          'Free to try'
        ]}
        primaryButton={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
              Start Writing with AI
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryButton={
          <Link href="/tools/youtube-script-generator">
            <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
              Learn More
            </Button>
          </Link>
        }
      />
    </div>
  );
}
