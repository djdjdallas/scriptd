'use client';

/**
 * YouTube Shorts Script Generator Page
 *
 * SEO landing page for "youtube shorts script generator" keyword.
 * Focus on short-form content, hooks, and quick engagement.
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
  Timer,
  Eye,
  ThumbsUp,
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

// Shorts formats
const shortsFormats = [
  {
    duration: '15s',
    title: 'Quick Hook',
    description: 'Single punchy insight or reveal',
    structure: 'Hook → Payoff',
    bestFor: 'Viral moments, quick tips, reactions'
  },
  {
    duration: '30s',
    title: 'Mini Story',
    description: 'Setup, tension, resolution',
    structure: 'Hook → Build → Payoff',
    bestFor: 'How-tos, transformations, reveals'
  },
  {
    duration: '60s',
    title: 'Full Arc',
    description: 'Complete narrative with depth',
    structure: 'Hook → Context → Build → Payoff → CTA',
    bestFor: 'Tutorials, stories, educational content'
  }
];

// What makes Shorts different
const shortsDifference = [
  {
    icon: Timer,
    title: 'First 3 Seconds Matter',
    description: 'Viewers swipe in under 2 seconds. Your hook must be immediate -no intros, no logos, straight to value.',
    stat: '2s',
    statLabel: 'avg decision time'
  },
  {
    icon: Eye,
    title: 'Vertical Thinking',
    description: 'Shorts aren\'t just short videos. They need visual hooks, text overlays, and pacing designed for thumb-stopping.',
    stat: '9:16',
    statLabel: 'aspect ratio'
  },
  {
    icon: TrendingUp,
    title: 'Loop Potential',
    description: 'The best Shorts make viewers watch again. Our scripts are designed with seamless endings that drive rewatches.',
    stat: '3x',
    statLabel: 'loop boost'
  },
  {
    icon: ThumbsUp,
    title: 'Engagement Hooks',
    description: 'Comments drive reach. We include engagement triggers -questions, debates, save-worthy tips -in every script.',
    stat: '40%',
    statLabel: 'more comments'
  }
];

// Hook styles for Shorts
const hookStyles = [
  {
    name: 'Pattern Interrupt',
    example: '"Stop scrolling if you..."',
    when: 'Breaking mindless scrolling'
  },
  {
    name: 'Instant Value',
    example: '"Here\'s a trick that..."',
    when: 'Educational quick tips'
  },
  {
    name: 'Curiosity Gap',
    example: '"This shouldn\'t work but..."',
    when: 'Surprising revelations'
  },
  {
    name: 'Direct Address',
    example: '"You\'re doing this wrong..."',
    when: 'Correcting misconceptions'
  },
  {
    name: 'Before/After',
    example: '"Watch this transformation..."',
    when: 'Visual transformations'
  },
  {
    name: 'Controversy',
    example: '"Unpopular opinion:..."',
    when: 'Sparking engagement'
  }
];

// Shorts-specific features
const shortsFeatures = [
  {
    icon: Zap,
    title: 'Instant Hook Library',
    description: '500+ scroll-stopping hooks specifically designed for vertical short-form content.',
    gradient: 'from-yellow-500/20 to-orange-500/20'
  },
  {
    icon: Target,
    title: 'Format Templates',
    description: 'Proven structures for 15s, 30s, and 60s formats. No guessing what works.',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: Shield,
    title: 'Compliance Ready',
    description: 'Even Shorts need compliance. We check every script against YouTube\'s policies.',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Sparkles,
    title: 'Series Mode',
    description: 'Generate connected Shorts series that keep viewers coming back for more.',
    gradient: 'from-purple-500/20 to-pink-500/20'
  }
];

// FAQs
const faqs = [
  {
    question: 'Are YouTube Shorts scripts different from regular video scripts?',
    answer: 'Very different. Shorts need immediate hooks (within 0.5 seconds), tighter pacing, visual cue markers, and engagement triggers placed throughout. Our Shorts generator uses completely different templates than our long-form script generator.'
  },
  {
    question: 'What length should I choose?',
    answer: 'It depends on your content. 15s works for single reveals or quick tips. 30s is ideal for mini-tutorials or transformations. 60s gives you room for full narratives. Start with 30s -it\'s the sweet spot for most niches.'
  },
  {
    question: 'Can I use the same script for TikTok and Shorts?',
    answer: 'Mostly yes. The formats are similar, though YouTube Shorts tends to favor slightly longer content (30-60s) while TikTok often rewards 15-30s. Our scripts work on both platforms, and you can adjust length easily.'
  },
  {
    question: 'Do Shorts need compliance checking?',
    answer: 'Yes. YouTube\'s authenticity policy applies to all content, including Shorts. In fact, Shorts face more scrutiny because they\'re often more formulaic. Our compliance checker ensures your Shorts don\'t trigger AI content flags.'
  },
  {
    question: 'How many Shorts should I post?',
    answer: 'Consistency beats volume. 1-2 high-quality Shorts per day outperforms 10 mediocre ones. Our Shorts generator helps you maintain quality at volume -batch generate a week\'s worth of scripts in one session.'
  },
  {
    question: 'Can I batch generate Shorts scripts?',
    answer: 'Absolutely. Use our series mode to generate 5-10 connected Shorts around a theme. This is great for building anticipation and driving viewers to your full channel.'
  }
];

export default function YouTubeShortsScriptGeneratorPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <MarketingHero
        badge={
          <>
            <Play className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-300">Shorts-Optimized Scripts</span>
          </>
        }
        title={
          <>
            YouTube Shorts
            <br />
            <span className="text-3xl md:text-5xl text-gray-400">Script Generator</span>
          </>
        }
        subtitle="Generate scroll-stopping Shorts scripts in 15s, 30s, or 60s formats. Hooks that capture attention in under 2 seconds."
        primaryCTA={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
              Generate Shorts Scripts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryCTA={
          <Link href="/tools/youtube-script-generator">
            <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
              <FileText className="w-4 h-4 mr-2" />
              Long-Form Scripts
            </Button>
          </Link>
        }
        metrics={[
          { icon: Users, label: '5,000+ Shorts creators' },
          { icon: TrendingUp, label: '10M+ views generated' },
          { icon: Star, label: '4.9/5 rating' }
        ]}
      />

      {/* Format Selector */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Format</h2>
          <p className="text-xl text-gray-400">Optimized templates for every Shorts length</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {shortsFormats.map((format, idx) => (
            <MarketingCard key={idx} className="p-6 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {format.duration}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{format.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{format.description}</p>
              <div className="p-3 bg-purple-500/10 rounded-lg mb-4">
                <div className="text-xs text-gray-500 mb-1">Structure</div>
                <div className="text-sm text-purple-300">{format.structure}</div>
              </div>
              <div className="text-xs text-gray-500">
                <strong className="text-gray-400">Best for:</strong> {format.bestFor}
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* What Makes Shorts Different */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Shorts Are a Different Game</h2>
          <p className="text-xl text-gray-400">Why you need a specialized script generator</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {shortsDifference.map((item, idx) => (
            <MarketingCard key={idx} className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{item.stat}</div>
              <div className="text-xs text-purple-400 mb-3">{item.statLabel}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Hook Styles */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Scroll-Stopping Hook Styles</h2>
          <p className="text-xl text-gray-400">500+ proven hooks across 6 engagement patterns</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {hookStyles.map((hook, idx) => (
            <MarketingCard key={idx} className="p-4">
              <div className="font-semibold text-white mb-2">{hook.name}</div>
              <div className="text-sm text-purple-400 italic mb-2">&quot;{hook.example}&quot;</div>
              <div className="text-xs text-gray-500">Best when: {hook.when}</div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Shorts Features */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Built for Short-Form Success</h2>
          <p className="text-xl text-gray-400">Features designed specifically for Shorts creators</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {shortsFeatures.map((feature, idx) => (
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

      {/* Example Script */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Example: 30-Second Script</h2>
          <p className="text-xl text-gray-400">See what a GenScript Shorts script looks like</p>
        </div>

        <MarketingCard className="max-w-2xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-red-400" />
              <span className="text-white font-semibold">30s Tutorial Short</span>
            </div>
            <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
              Compliance: 92
            </span>
          </div>

          <div className="space-y-4 text-gray-300">
            <div className="p-3 bg-purple-500/10 rounded-lg border-l-4 border-purple-500">
              <div className="text-xs text-purple-400 mb-1">HOOK (0-3s)</div>
              <p className="text-white">&quot;Stop doing this with your iPhone.&quot;</p>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">PROBLEM (3-8s)</div>
              <p>&quot;That double-tap screenshot thing? It&apos;s been saving to the wrong album this whole time.&quot;</p>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">SOLUTION (8-25s)</div>
              <p>&quot;Here&apos;s the fix -takes 10 seconds. Settings, Accessibility, Touch, Back Tap, Double Tap, and change it to Screenshot. Now watch...&quot;</p>
            </div>

            <div className="p-3 bg-green-500/10 rounded-lg border-l-4 border-green-500">
              <div className="text-xs text-green-400 mb-1">CTA (25-30s)</div>
              <p className="text-white">&quot;Follow for more iPhone tricks you didn&apos;t know existed.&quot;</p>
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
        title="Start Creating Viral Shorts"
        subtitle="50 free credits. Generate dozens of Shorts scripts to test. No credit card required."
        badge={
          <>
            <Play className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-300">Shorts-Optimized</span>
          </>
        }
        features={[
          '15s, 30s, 60s formats',
          '500+ scroll-stopping hooks',
          'Series mode for batch creation',
          'Compliance checking included'
        ]}
        primaryButton={
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
              Generate Shorts Scripts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
        secondaryButton={
          <Link href="/tools/youtube-script-generator">
            <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
              Long-Form Scripts
            </Button>
          </Link>
        }
      />
    </div>
  );
}
