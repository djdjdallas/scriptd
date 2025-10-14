'use client';

import { useState } from 'react';
import {
  Check, X, ArrowRight, Star, TrendingUp, Clock, Users,
  Shield, Zap, ChevronRight, Brain, Timer, MessageSquare, FileText
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
import { competitorData, socialProofData, migrationOffers } from '@/lib/comparison-data';

export default function ChatGPTAlternativePage() {
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);
  const [showPromptComparison, setShowPromptComparison] = useState(false);

  const competitor = competitorData.chatgpt;
  const ourPlatform = competitorData.ourPlatform;
  const migration = migrationOffers.chatgpt;

  const comparisonFeatures = [
    {
      feature: 'Transcript Extraction',
      competitor: '✗ Not available',
      genscript: 'AI-powered competitive research'
    },
    {
      feature: 'YouTube Specialization',
      competitor: '✗ General purpose AI',
      genscript: 'Built exclusively for YouTube'
    },
    {
      feature: 'Retention Optimization',
      competitor: '✗ No retention focus',
      genscript: '68%+ AVD targeting'
    },
    { 
      feature: 'Script Structure', 
      competitor: 'Requires manual prompting', 
      genscript: 'Auto-structured for video'
    },
    { 
      feature: 'Consistency', 
      competitor: 'Variable output quality', 
      genscript: 'Consistent high quality'
    },
    { 
      feature: 'Voice Matching', 
      competitor: '✗ Generic responses', 
      genscript: 'Personal AI voice cloning'
    },
    { 
      feature: 'Fact Checking', 
      competitor: 'Limited verification', 
      genscript: 'Full automated verification'
    },
    { 
      feature: 'Hook Library', 
      competitor: '✗ No hook system', 
      genscript: '1000+ viral hooks'
    },
    { 
      feature: 'PVSS Framework', 
      competitor: '✗ Not available', 
      genscript: 'Built-in viral structure'
    },
    { 
      feature: 'Time to Results', 
      competitor: '30+ minutes of prompting', 
      genscript: '30 seconds to perfect script'
    },
    { 
      feature: 'Support', 
      competitor: 'Community forums only', 
      genscript: '24/7 expert support'
    }
  ];

  const keyDifferentiators = [
    {
      icon: Timer,
      title: '30 Seconds vs 30 Minutes',
      description: 'Stop spending hours prompting ChatGPT. Get perfect YouTube scripts optimized for retention in under a minute.',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: Brain,
      title: 'YouTube-Trained AI',
      description: 'ChatGPT is trained on the web. We\'re trained exclusively on viral YouTube videos for maximum engagement.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Shield,
      title: 'Consistent Quality',
      description: 'No more hit-or-miss results. Every script follows proven retention patterns that keep viewers watching.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    }
  ];

  const testimonials = [
    {
      name: 'Lisa Martinez',
      channel: '@FitnessFirst',
      subscribers: '180K',
      quote: 'ChatGPT required hours of prompting. Now I get perfect YouTube scripts in one click that keep viewers watching.',
      beforeAfter: {
        before: '30% retention',
        after: '70% retention'
      }
    },
    {
      name: 'Tom Wilson',
      channel: '@CodingTutorials',
      subscribers: '75K',
      quote: 'I spent 2-3 hours per script with ChatGPT. Now it takes 30 seconds and the retention is incredible.',
      beforeAfter: {
        before: '35% retention',
        after: '68% retention'
      }
    },
    {
      name: 'Rachel Green',
      channel: '@DIYCrafts',
      subscribers: '220K',
      quote: 'ChatGPT is great for many things, but for YouTube? This is in a completely different league.',
      beforeAfter: {
        before: '42% retention',
        after: '74% retention'
      }
    }
  ];

  const migrationSteps = [
    'Stop wasting time on complex ChatGPT prompts',
    'Sign up with code NOPROMPTS for instant access',
    'Upload a sample of your content for voice matching',
    'Generate perfect scripts in 30 seconds instead of 30 minutes'
  ];

  const stats = [
    { value: '60x', label: 'Faster Results' },
    { value: '68%+', label: 'Avg. Retention' },
    { value: '30 sec', label: 'Script Generation' },
    { value: '100%', label: 'Consistent Quality' }
  ];

  const promptComparison = {
    chatgpt: `You: Write a YouTube script about productivity tips
ChatGPT: Here's a script about productivity...
You: Make it more engaging
ChatGPT: Here's a revised version...
You: Add a hook at the beginning
ChatGPT: Updated with a hook...
You: Structure it for better retention
ChatGPT: Here's a restructured version...
You: Make it sound more like my style
ChatGPT: I'll try to adjust the tone...
[Continue refining for 30+ minutes]`,
    
    genscript: `You: Create a script about productivity tips
GenScript: ✓ Analyzed 10,000+ productivity videos
✓ Generated 68%+ retention structure
✓ Matched your voice profile
✓ Added viral hooks
✓ Fact-checked all claims
✓ Optimized for 10-minute format
[Complete script ready in 30 seconds]`
  };

  const faqs = [
    {
      question: 'How easy is it to switch from ChatGPT?',
      answer: 'Extremely easy. No complex prompts needed - just tell us your topic and get a perfect script in 30 seconds. Our migration assistant helps you set up voice matching based on your existing content.'
    },
    {
      question: 'Why can\'t I just use better prompts with ChatGPT?',
      answer: 'Even with perfect prompts, ChatGPT lacks YouTube-specific training data and retention optimization. We analyze millions of viral videos to understand what keeps viewers watching - something generic AI can\'t replicate.'
    },
    {
      question: 'Do you use ChatGPT technology?',
      answer: 'We use advanced AI models including GPT-4 and Claude, but fine-tuned specifically for YouTube. Our proprietary PVSS framework and retention optimization layer ensures every script maximizes watch time.'
    },
    {
      question: 'What about ChatGPT\'s free tier?',
      answer: 'Time spent prompting and refining ChatGPT scripts often costs more in lost productivity than our subscription. Plus, you get consistent quality and YouTube optimization that free ChatGPT can\'t provide.'
    },
    {
      question: 'Can I use both tools together?',
      answer: 'Many creators use ChatGPT for general tasks and GenScript specifically for YouTube scripts. However, most find our platform handles all their YouTube content needs more efficiently.'
    },
    {
      question: 'How much time will I actually save?',
      answer: 'Users report saving 2-3 hours per script. Instead of 30+ minutes of prompting and refining with ChatGPT, you get a retention-optimized script in under 30 seconds.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <MarketingHero
        badge={
          <>
            <Timer className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">30 Seconds vs 30 Minutes</span>
          </>
        }
        title="The ChatGPT Alternative That Actually Understands YouTube"
        subtitle={`Stop spending hours prompting ChatGPT. Get perfect YouTube scripts with ${socialProofData.metrics.averageRetention}% retention in one click. See why ${socialProofData.metrics.totalUsers}+ creators made the switch.`}
        primaryCTA={
          <MarketingButton href="/signup?source=chatgpt&offer=noprompts" size="large" icon={ArrowRight} iconRight>
            Create Scripts in 30 Seconds
          </MarketingButton>
        }
        secondaryCTA={
          <MarketingButton variant="secondary" size="large" onClick={() => setShowPromptComparison(true)}>
            See The Difference →
          </MarketingButton>
        }
      >
        <div className="mt-12">
          <StatsBar stats={stats} />
        </div>
      </MarketingHero>

      {/* Prompt Comparison Modal */}
      {showPromptComparison && (
        <MarketingSection className="bg-gradient-to-b from-purple-900/20 to-transparent">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              The Prompting Problem vs One-Click Solution
            </h2>
            <p className="text-xl text-gray-400">See the difference between ChatGPT and purpose-built YouTube AI</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <MarketingCard className="border-red-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <X className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-bold text-white">ChatGPT Process</h3>
                </div>
                <pre className="text-xs text-gray-300 bg-gray-800/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {promptComparison.chatgpt}
                </pre>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-sm text-red-400">⏱️ Average time: 30-45 minutes</p>
                  <p className="text-xs text-gray-400 mt-1">Still no retention optimization</p>
                </div>
              </div>
            </MarketingCard>

            <MarketingCard className="border-green-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">GenScript Process</h3>
                </div>
                <pre className="text-xs text-gray-300 bg-gray-800/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {promptComparison.genscript}
                </pre>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-green-400">⏱️ Average time: 30 seconds</p>
                  <p className="text-xs text-gray-400 mt-1">Optimized for 68%+ retention</p>
                </div>
              </div>
            </MarketingCard>
          </div>

          <div className="text-center mt-8">
            <MarketingButton onClick={() => setShowPromptComparison(false)} variant="secondary">
              Close Comparison
            </MarketingButton>
          </div>
        </MarketingSection>
      )}

      {/* Comparison Section */}
      <ComparisonSection
        title="Side-by-Side Comparison"
        subtitle="See exactly why creators choose us over ChatGPT"
        competitor="ChatGPT"
        features={comparisonFeatures}
      />

      {/* Key Differentiators */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Creators Choose Us Over ChatGPT
          </h2>
        </div>
        <FeatureGrid features={keyDifferentiators} columns={3} />
      </MarketingSection>

      {/* Testimonials */}
      <TestimonialSection
        title="Creators Who Switched From ChatGPT"
        subtitle="Real results from real creators who stopped prompting and started creating"
        testimonials={testimonials}
      />

      {/* Migration Process */}
      <MarketingSection className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Switch in Under 2 Minutes
          </h2>
          <p className="text-xl text-gray-400">No more complex prompts, just perfect scripts</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <MarketingCard>
            <div className="space-y-6">
              {migrationSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Step {idx + 1}</h4>
                    <p className="text-gray-400">{step}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <MarketingButton href="/signup?source=chatgpt&offer=noprompts" icon={ArrowRight} iconRight>
                Stop Prompting, Start Creating
              </MarketingButton>
            </div>
          </MarketingCard>
        </div>
      </MarketingSection>

      {/* FAQ Section */}
      <FAQSection 
        title="Common Questions From ChatGPT Users"
        faqs={faqs}
      />

      {/* Final CTA */}
      <CTASection
        title="Ready to Stop Prompting and Start Creating?"
        subtitle={`Join ${socialProofData.metrics.totalUsers}+ creators who switched to 30-second scripts that actually work.`}
        primaryButton={
          <MarketingButton href="/signup?source=chatgpt&offer=noprompts" size="large" icon={ArrowRight} iconRight>
            Create Your First Script Now
          </MarketingButton>
        }
        badge={
          <>
            <span className="text-sm text-gray-400">No credit card required • 14-day free trial • Cancel anytime</span>
          </>
        }
      />

      {/* Migration Wizard Modal */}
      {showMigrationWizard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <MarketingCard className="max-w-2xl w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Migration Wizard</h3>
            
            <div className="space-y-4">
              {migrationSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Step {idx + 1}</h4>
                    <p className="text-gray-400 text-sm">{step}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <MarketingButton href="/signup?source=chatgpt&offer=noprompts" className="flex-1">
                Start Now
              </MarketingButton>
              <MarketingButton variant="secondary" onClick={() => setShowMigrationWizard(false)}>
                Close
              </MarketingButton>
            </div>
          </MarketingCard>
        </div>
      )}
    </>
  );
}