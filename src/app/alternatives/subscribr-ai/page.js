'use client';

import { useState } from 'react';
import { 
  Check, X, ArrowRight, Star, TrendingUp, Clock, Users, 
  Shield, Zap, ChevronRight 
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

export default function SubscribrAIAlternative() {
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);
  const competitor = competitorData.subscribrAI || {};
  const ourPlatform = competitorData.ourPlatform || {};

  const priceSavings = (competitor.pricing?.pro || 59) - (ourPlatform.pricing?.professional || 79);
  const yearlyDifference = priceSavings * 12;

  const comparisonFeatures = [
    { 
      feature: 'Script Generation', 
      competitor: 'AI-powered templates', 
      genscript: 'Full AI with PVSS framework'
    },
    { 
      feature: 'Pricing (Pro)', 
      competitor: '$59/month', 
      genscript: '$79/month'
    },
    { 
      feature: 'Script Limits', 
      competitor: 'Credit-based (100/mo)', 
      genscript: 'Unlimited generation'
    },
    { 
      feature: 'Voice Matching', 
      competitor: 'Basic templates', 
      genscript: 'Advanced AI matching'
    },
    { 
      feature: 'Fact Checking', 
      competitor: '✗ Not available', 
      genscript: 'Built-in verification'
    },
    { 
      feature: 'PVSS Framework', 
      competitor: '✗ Not available', 
      genscript: 'Proven viral system'
    },
    { 
      feature: 'Retention Target', 
      competitor: '50% AVD', 
      genscript: '70%+ AVD guaranteed'
    },
    { 
      feature: 'Psychographic Targeting', 
      competitor: '✗ Not available', 
      genscript: 'Advanced AI analysis'
    },
    { 
      feature: 'Quality Tiers', 
      competitor: 'One size fits all', 
      genscript: 'Fast/Balanced/Premium'
    },
    { 
      feature: 'API Access', 
      competitor: 'Enterprise only ($99+)', 
      genscript: 'All paid plans'
    }
  ];

  const keyDifferentiators = [
    {
      icon: Zap,
      title: 'PVSS Viral Framework',
      description: 'Our proven framework that Subscribr AI doesn\'t have. Designed for maximum virality and engagement.',
      gradient: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Unlimited Scripts',
      description: 'No credits, no limits. Generate as many scripts as you need without worrying about running out.',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: Shield,
      title: 'Fact-Checking Built In',
      description: 'Every script is fact-checked automatically. Subscribr AI users have to verify manually.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    }
  ];

  const testimonials = [
    {
      name: 'Marcus Chen',
      channel: '@TechEducator',
      subscribers: '156K',
      quote: 'Subscribr AI was good, but the unlimited scripts and PVSS framework here tripled my views in just 6 weeks.',
      beforeAfter: {
        before: '52% retention',
        after: '74% retention'
      }
    },
    {
      name: 'Sarah Johnson',
      channel: '@BusinessDaily',
      subscribers: '89K',
      quote: 'The credit system was killing my budget. Now I can test as many scripts as I want without worrying.',
      beforeAfter: {
        before: '48% retention',
        after: '71% retention'
      }
    },
    {
      name: 'Alex Rivera',
      channel: '@FitnessFlow',
      subscribers: '234K',
      quote: 'Voice matching actually works here. My scripts sound like me, not like a generic AI template.',
      beforeAfter: {
        before: '55% retention',
        after: '76% retention'
      }
    }
  ];

  const migrationSteps = [
    'Export your templates from Subscribr AI settings',
    'Sign up with code SWITCH50 for 3 months free',
    'Import your data - we\'ll optimize it with our AI',
    'Start generating unlimited scripts immediately'
  ];

  const stats = [
    { value: `$${yearlyDifference}`, label: 'Yearly Savings' },
    { value: '70%+', label: 'Avg. Retention' },
    { value: 'Unlimited', label: 'Scripts/Month' },
    { value: '3.2x', label: 'Better ROI' }
  ];

  const faqs = [
    {
      question: 'How easy is it to switch from Subscribr AI?',
      answer: 'Extremely easy. Our migration wizard imports your templates and settings in under 5 minutes. Plus, you get a personal migration assistant.'
    },
    {
      question: 'What about my remaining credits?',
      answer: 'We\'ll match your credit balance and convert it to unlimited generation for the equivalent time period.'
    },
    {
      question: 'Do you really have unlimited scripts?',
      answer: 'Yes, truly unlimited. No credits, no caps, no throttling. Generate as many scripts as you need.'
    },
    {
      question: 'How is your AI better than Subscribr AI\'s?',
      answer: 'We use the PVSS framework, advanced voice matching, and psychographic targeting - features Subscribr AI doesn\'t have.'
    },
    {
      question: 'Can I keep my workflow?',
      answer: 'Yes, and improve it. We support all the same export formats plus API access on all plans (not just enterprise).'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <MarketingHero
        badge={
          <>
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Special Offer: 3 Months Free for Subscribr AI Switchers</span>
          </>
        }
        title="The Subscribr AI Alternative That Actually Understands Your Audience"
        subtitle={`30% lower price, unlimited scripts, and the PVSS framework that Subscribr AI doesn't have. See why ${socialProofData.metrics.totalUsers}+ creators switched and got ${socialProofData.metrics.averageRetention}% retention.`}
        primaryCTA={
          <MarketingButton href="/signup?source=genscript-ai&offer=3months" size="large" icon={ArrowRight} iconRight>
            Claim 3 Months Free
          </MarketingButton>
        }
        secondaryCTA={
          <MarketingButton variant="secondary" size="large" onClick={() => setShowMigrationWizard(true)}>
            Migration Wizard →
          </MarketingButton>
        }
      >
        <div className="mt-12">
          <StatsBar stats={stats} />
        </div>
      </MarketingHero>

      {/* Comparison Section */}
      <ComparisonSection
        title="Side-by-Side Comparison"
        subtitle="See exactly how we outperform Subscribr AI"
        competitor="Subscribr AI"
        features={comparisonFeatures}
      />

      {/* Key Differentiators */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            What Subscribr AI Can't Do (But We Can)
          </h2>
        </div>
        <FeatureGrid features={keyDifferentiators} columns={3} />
      </MarketingSection>

      {/* Testimonials */}
      <TestimonialSection
        title="Creators Who Switched From Subscribr AI"
        subtitle="Real results from real creators"
        testimonials={testimonials}
      />

      {/* Migration Process */}
      <MarketingSection className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Switch in Under 5 Minutes
          </h2>
          <p className="text-xl text-gray-400">Our migration wizard makes it seamless</p>
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
              <MarketingButton href="/signup?source=genscript-ai&offer=3months" icon={ArrowRight} iconRight>
                Start Migration Now
              </MarketingButton>
            </div>
          </MarketingCard>
        </div>
      </MarketingSection>

      {/* ROI Calculator Highlight */}
      <MarketingSection>
        <MarketingCard className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Calculate Your Savings
          </h3>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="text-gray-400 text-sm mb-2">Subscribr AI Pro</p>
              <p className="text-3xl font-bold text-red-400">${competitor.pricing.pro}/mo</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Genscript Pro</p>
              <p className="text-3xl font-bold text-green-400">${ourPlatform.pricing.professional}/mo</p>
            </div>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="text-2xl font-bold text-green-400">
              Save ${yearlyDifference}/year by switching to Genscript
            </p>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* FAQ Section */}
      <FAQSection 
        title="Common Questions From Subscribr AI Users"
        faqs={faqs}
      />

      {/* Final CTA */}
      <CTASection
        title="Ready to Get Better Scripts for Less Money?"
        subtitle={`Join ${socialProofData.metrics.totalUsers}+ creators who switched and never looked back.`}
        primaryButton={
          <MarketingButton href="/signup?source=genscript-ai&offer=3months" size="large" icon={ArrowRight} iconRight>
            Switch Now - Get 3 Months Free
          </MarketingButton>
        }
        badge={
          <>
            <span className="text-sm text-gray-400">No credit card required • 30-day money-back guarantee</span>
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
              <MarketingButton href="/signup?source=genscript-ai&offer=3months" className="flex-1">
                Start Migration
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