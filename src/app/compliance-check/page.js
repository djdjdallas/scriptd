'use client';

/**
 * Compliance Check Page
 *
 * Full-page YouTube script compliance checking tool with
 * educational content about YouTube's authenticity policy.
 */

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ComplianceChecker } from '@/components/compliance';
import {
  Shield, ArrowRight, CheckCircle, AlertTriangle, XCircle,
  Lightbulb, BookOpen, FileText, Sparkles, ChevronRight
} from 'lucide-react';

const BEST_PRACTICES = [
  {
    title: 'Add Personal Perspective',
    description: 'Include first-person statements like "I think", "In my experience", or "What I\'ve found is" to show authentic viewpoint.',
    icon: Lightbulb
  },
  {
    title: 'Remove AI Phrases',
    description: 'Delete generic phrases like "In today\'s video", "Let\'s dive in", or "Without further ado" that signal AI-generated content.',
    icon: XCircle
  },
  {
    title: 'Use Contractions',
    description: 'Replace formal language with contractions (don\'t, can\'t, won\'t) for a natural, conversational tone.',
    icon: CheckCircle
  },
  {
    title: 'Include Specific Details',
    description: 'Add real numbers, dates, specific examples, and personal stories to demonstrate genuine expertise.',
    icon: FileText
  }
];

const COMPLIANCE_CATEGORIES = [
  {
    name: 'Repetitiveness',
    description: 'Checks for repeated phrases, similar sentence structures, and vocabulary diversity.',
    weight: '30%'
  },
  {
    name: 'Original Insight',
    description: 'Detects personal perspective markers, opinion statements, and specific details.',
    weight: '25%'
  },
  {
    name: 'AI Patterns',
    description: 'Identifies AI-typical phrases, hedging language, and formal patterns.',
    weight: '25%'
  },
  {
    name: 'Structure Quality',
    description: 'Evaluates hook strength, sentence variety, and call-to-action presence.',
    weight: '20%'
  }
];

const FAQ_ITEMS = [
  {
    question: 'What is YouTube\'s 2025 authenticity policy?',
    answer: 'YouTube\'s July 2025 policy update introduced stricter rules against "inauthentic content." Videos that appear to be mass-produced using AI without meaningful human input can be demonetized or removed. The policy targets content that lacks original insight, uses repetitive templates, or shows clear AI-generation patterns.'
  },
  {
    question: 'Will YouTube know I used AI?',
    answer: 'YouTube doesn\'t ban AI-assisted content. The policy targets content that lacks authenticity and original perspective. Scripts that include personal insights, specific examples, and genuine expertise can use AI assistance while remaining compliant. Our tool helps ensure your AI-assisted scripts meet authenticity requirements.'
  },
  {
    question: 'How does the compliance checker work?',
    answer: 'Our checker analyzes your script across four categories: repetitiveness (vocabulary diversity, repeated phrases), original insight (personal perspective markers), AI patterns (generic phrases, formal language), and structure (hooks, variety, CTAs). Each category is scored, and we provide specific suggestions for improvement.'
  },
  {
    question: 'What score should I aim for?',
    answer: 'We recommend aiming for 80+ to be safely in the "approved" range. Scripts scoring 60-79 should be reviewed and improved. Below 60 indicates significant compliance risks that should be addressed before publishing. Higher scores don\'t guarantee compliance but significantly reduce risk.'
  },
  {
    question: 'Can I still use GenScript for my videos?',
    answer: 'Absolutely! GenScript is designed specifically to help you create compliant content. Our scripts include personal perspective prompts, avoid AI-typical phrases, and encourage authentic voice. Plus, every script can be checked with this compliance tool before publishing.'
  }
];

export default function ComplianceCheckPage() {
  const [activeQuestion, setActiveQuestion] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            GenScript
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/tools" className="text-sm text-gray-400 hover:text-white transition-colors">
              Free Tools
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Free Compliance Tool</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            YouTube Script{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Compliance Checker
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Check if your YouTube script meets YouTube&apos;s 2025 authenticity policy.
            Detect AI patterns, verify original content markers, and protect your monetization.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Instant results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Checker Tool */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <ComplianceChecker
              autoAnalyze={true}
              debounceMs={500}
              showDetailedReport={true}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              How the Compliance Checker Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our algorithm analyzes your script across four key categories that YouTube&apos;s
              systems use to detect inauthentic content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {COMPLIANCE_CATEGORIES.map((category, idx) => (
              <div
                key={category.name}
                className="glass-card rounded-xl p-6 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {category.name}
                  </h3>
                  <span className="text-sm font-mono text-purple-400">
                    {category.weight}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="px-4 py-16 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Best Practices for Compliance
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Follow these tips to ensure your scripts pass YouTube&apos;s authenticity checks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {BEST_PRACTICES.map((practice) => {
              const Icon = practice.icon;
              return (
                <div
                  key={practice.title}
                  className="flex items-start gap-4 glass-card rounded-xl p-6"
                >
                  <div className="p-2 rounded-lg bg-purple-500/20 flex-shrink-0">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      {practice.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {practice.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* YouTube Policy Explanation */}
      <section className="px-4 py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 rounded-xl bg-yellow-500/20 flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Understanding YouTube&apos;s 2025 Policy
              </h2>
              <p className="text-gray-400">
                What creators need to know about the authenticity guidelines.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-gray-300">
            <p>
              YouTube&apos;s July 2025 policy update significantly expanded the definition of
              &quot;inauthentic content.&quot; While the platform has always had rules against spam and
              misleading content, the new guidelines specifically target AI-generated content
              that lacks genuine human insight.
            </p>

            <div className="glass-card rounded-xl p-6 border-l-4 border-yellow-500">
              <h3 className="font-semibold text-white mb-3">What Gets Flagged</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Repetitive, template-based content with minimal variation</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Scripts lacking personal perspective or original insight</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Mass-produced content using AI without meaningful human input</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Generic compilations without added value or commentary</span>
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-6 border-l-4 border-green-500">
              <h3 className="font-semibold text-white mb-3">What&apos;s Still Allowed</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>AI-assisted scriptwriting with human editing and insight</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Content that includes genuine personal perspective</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>AI tools for research, editing, and production enhancement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Scripts with proper disclosure when AI is prominently featured</span>
                </li>
              </ul>
            </div>

            <p>
              The key distinction is <strong className="text-white">authenticity</strong>.
              YouTube isn&apos;t banning AI—they&apos;re targeting content that could have been created
              by anyone because it lacks unique human perspective. Your scripts should reflect
              your genuine expertise, opinions, and experiences.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveQuestion(activeQuestion === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white pr-4">{item.question}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      activeQuestion === idx ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeQuestion === idx && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-gray-400 text-sm">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Generate Compliant Scripts</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Want Scripts That Pass Automatically?
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            GenScript generates YouTube scripts with built-in compliance checking.
            Every script includes authentic voice matching and passes our compliance tests.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
                Start Writing Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/tools">
              <Button size="lg" variant="outline" className="border-gray-700">
                Explore Free Tools
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            No credit card required • 50 free credits • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} GenScript. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/tools" className="hover:text-white transition-colors">
              Tools
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
