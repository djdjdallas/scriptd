'use client';

/**
 * YouTube Script Generator Page
 *
 * Primary SEO landing page for "youtube script generator" keyword.
 * Educational content + tool preview + CTAs.
 */

import Link from 'next/link';
import {
  Zap,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Play,
  FileText,
  Sparkles,
  Users,
  Target,
  Wand2,
  RefreshCw,
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

// How it works steps
const howItWorks = [
  {
    step: 1,
    title: 'Enter Your Topic',
    description: 'Type your video idea, paste a title, or describe what you want to cover. Our AI understands context.',
    icon: FileText
  },
  {
    step: 2,
    title: 'Choose Your Style',
    description: 'Select from proven script structures optimized for different content types and retention goals.',
    icon: Target
  },
  {
    step: 3,
    title: 'Generate & Refine',
    description: 'Get a complete script in 30 seconds. Edit in-place with real-time compliance feedback.',
    icon: Wand2
  },
  {
    step: 4,
    title: 'Export & Publish',
    description: 'Download your script in any format. Copy to teleprompter, share with editors, or export to docs.',
    icon: ArrowRight
  }
];

// Key features
const features = [
  {
    icon: Shield,
    title: 'Compliance-First',
    description: 'Every script is checked against YouTube\'s 2025 authenticity policy. No more demonetization surprises.',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: TrendingUp,
    title: 'Retention Optimized',
    description: 'Scripts structured using proven patterns that achieve 68%+ average view duration.',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Sparkles,
    title: 'Voice Matching',
    description: 'Upload samples of your content and our AI learns your unique writing style and personality.',
    gradient: 'from-violet-500/10 to-cyan-500/20'
  },
  {
    icon: Zap,
    title: '30-Second Scripts',
    description: 'No more hours of writing. Generate complete, polished scripts in under a minute.',
    gradient: 'from-yellow-500/20 to-orange-500/20'
  }
];

// Script types we support
const scriptTypes = [
  { name: 'Educational', description: 'Tutorials, how-tos, explainers' },
  { name: 'Entertainment', description: 'Vlogs, stories, commentary' },
  { name: 'Product Reviews', description: 'Unboxings, comparisons, roundups' },
  { name: 'Listicles', description: 'Top 10s, rankings, compilations' },
  { name: 'News & Commentary', description: 'Current events, reactions' },
  { name: 'Shorts', description: '15s, 30s, 60s vertical content' }
];

// FAQs
const faqs = [
  {
    question: 'Is this YouTube script generator free?',
    answer: 'Yes! You get 50 free credits when you sign up -no credit card required. Each script uses 1-3 credits depending on length and complexity. That\'s enough for dozens of scripts to try the platform.'
  },
  {
    question: 'How is this different from ChatGPT?',
    answer: 'ChatGPT is a general-purpose AI that requires complex prompting and doesn\'t understand YouTube\'s policies. GenScript is built specifically for YouTube with retention optimization, compliance checking, and voice matching built in. It\'s also 60x faster.'
  },
  {
    question: 'Will YouTube know my script is AI-generated?',
    answer: 'GenScript scripts are designed to pass YouTube\'s authenticity review. Our compliance checker identifies AI patterns and suggests how to add original insight -the exact things YouTube looks for when evaluating content authenticity.'
  },
  {
    question: 'What video lengths does it support?',
    answer: 'Everything from 15-second Shorts to 30-minute long-form videos. The AI adjusts structure, pacing, and hook patterns based on your target length. Longer scripts use more credits but follow the same quality standards.'
  },
  {
    question: 'Can I edit the generated scripts?',
    answer: 'Absolutely. Every script opens in our editor where you can make changes with real-time compliance feedback. We encourage adding personal stories and opinions -that\'s what makes scripts pass YouTube\'s authenticity review.'
  },
  {
    question: 'Does it work for any niche?',
    answer: 'Yes. Our AI is trained on viral content across all major YouTube categories including tech, finance, fitness, gaming, beauty, education, entertainment, and more. You can also train it on your specific niche by uploading sample scripts.'
  }
];

export default function YouTubeScriptGeneratorPage() {
  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Hero */}
      <MarketingHero
        badge={
          <>
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">AI-Powered Script Generation</span>
          </>
        }
        title={<span className="font-display">YouTube Script Generator</span>}
        subtitle="Generate engaging, retention-optimized YouTube scripts in 30 seconds. With built-in compliance checking for YouTube's 2025 authenticity policy."
        primaryCTA={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-violet-700 to-cyan-700 hover:from-violet-700 hover:to-cyan-700 text-white px-8">
              Generate Your First Script
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryCTA={
          <Link href="/compliance-check">
            <Button size="lg" variant="outline" className="border-white/5 hover:bg-white/[0.06]">
              <Shield className="w-4 h-4 mr-2" />
              Try Compliance Checker
            </Button>
          </Link>
        }
        metrics={[
          { icon: Users, label: '10,000+ creators' },
          { icon: FileText, label: '500K+ scripts generated' },
          { icon: Star, label: '4.9/5 rating' }
        ]}
      />

      {/* Trust Bar */}
      <MarketingSection>
        <MarketingCard className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                30s
              </div>
              <div className="text-sm text-gray-400 mt-1">Average generation time</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                68%+
              </div>
              <div className="text-sm text-gray-400 mt-1">Avg view duration</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                95%
              </div>
              <div className="text-sm text-gray-400 mt-1">Compliance pass rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Free
              </div>
              <div className="text-sm text-gray-400 mt-1">50 credits to start</div>
            </div>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* How It Works */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-display text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-400">From idea to polished script in 4 simple steps</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {howItWorks.map((step, idx) => (
            <div key={idx} className="relative">
              <MarketingCard className="p-6 h-full">
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-violet-400" />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
              </MarketingCard>
              {idx < howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-gray-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </MarketingSection>

      {/* Features */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-display text-white mb-4">Why Creators Choose GenScript</h2>
          <p className="text-xl text-gray-400">Features that set us apart from generic AI tools</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, idx) => (
            <MarketingCard key={idx} className="p-6">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-r ${feature.gradient}`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Script Types */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-display text-white mb-4">Scripts for Every Format</h2>
          <p className="text-xl text-gray-400">Optimized templates for all YouTube content types</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {scriptTypes.map((type, idx) => (
            <MarketingCard key={idx} className="p-4 text-center">
              <div className="font-semibold text-white mb-1">{type.name}</div>
              <div className="text-sm text-gray-500">{type.description}</div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Compliance Section */}
      <MarketingSection>
        <MarketingCard className="p-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-white mb-3">
                Built for YouTube&apos;s 2025 Authenticity Policy
              </h2>
              <p className="text-gray-300 mb-4">
                YouTube&apos;s new policy targets AI-generated content that lacks original value. Every GenScript
                script is analyzed in real-time against compliance criteria -repetitiveness, original insight,
                AI patterns, and structure. You see potential issues before publishing, not after demonetization.
              </p>
              <Link href="/resources/youtube-compliance-whitepaper">
                <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                  Learn About Our Compliance Framework
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
        title="Ready to Generate Your First Script?"
        subtitle="Join 10,000+ creators using GenScript to produce YouTube content faster."
        badge={
          <>
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">50 Free Credits</span>
          </>
        }
        features={[
          '30-second script generation',
          'Built-in compliance checking',
          'Voice matching included',
          'No credit card required'
        ]}
        primaryButton={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-violet-700 to-cyan-700 hover:from-violet-700 hover:to-cyan-700 text-white px-8">
              Generate Your First Script
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryButton={
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-white/5 hover:bg-white/[0.06]">
              View Pricing
            </Button>
          </Link>
        }
      />
    </div>
  );
}
