'use client';

import { useState } from 'react';
import Script from 'next/script';
import { 
  Check, X, ArrowRight, Star, TrendingUp, Clock, Users, 
  Shield, Zap, ChevronRight, Infinity, Target
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

export default function WritesonicAlternativePage() {
  // SEO Meta Tags will be added to return statement
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);

  const competitor = competitorData.writesonic;
  const ourPlatform = competitorData.ourPlatform;
  const migration = migrationOffers.writesonic;

  const priceSavings = competitor.pricing.pro - ourPlatform.pricing.professional;
  const yearlyDifference = priceSavings * 12;

  const comparisonFeatures = [
    { 
      feature: 'YouTube Specialization', 
      competitor: '✗ Generic content', 
      genscript: 'Built exclusively for YouTube'
    },
    { 
      feature: 'Retention Optimization', 
      competitor: '✗ No retention focus', 
      genscript: '68%+ AVD targeting'
    },
    { 
      feature: 'Script Generation', 
      competitor: 'Basic templates', 
      genscript: 'Advanced AI with PVSS framework'
    },
    { 
      feature: 'Voice Matching', 
      competitor: 'Generic tone options', 
      genscript: 'Authentic creator voice AI'
    },
    { 
      feature: 'Content Limits', 
      competitor: '100K words/month', 
      genscript: 'Unlimited generation'
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
      feature: 'Hook Library', 
      competitor: '25 basic hooks', 
      genscript: '1000+ tested viral hooks'
    },
    { 
      feature: 'Pricing', 
      competitor: '$13-$500/month', 
      genscript: '$39-$199/month'
    },
    { 
      feature: 'API Access', 
      competitor: 'Pro plans only', 
      genscript: 'All paid plans'
    }
  ];

  const keyDifferentiators = [
    {
      icon: Infinity,
      title: 'Unlimited vs Word Limits',
      description: 'While Writesonic caps you at 100K words per month, we give you unlimited script generation. Create as much content as you need.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Target,
      title: 'YouTube-Specific AI',
      description: 'Writesonic is trained on blog posts. We\'re trained exclusively on viral YouTube videos for maximum retention.',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Retention Optimization',
      description: 'Every script is optimized for 68%+ retention using our PVSS framework. Writesonic doesn\'t even track viewer retention.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    }
  ];

  const testimonials = [
    {
      name: 'David Park',
      channel: '@BusinessTips',
      subscribers: '156K',
      quote: 'Writesonic was too generic for YouTube. The unlimited scripts and retention focus here tripled my views in 6 weeks.',
      beforeAfter: {
        before: '42% retention',
        after: '71% retention'
      }
    },
    {
      name: 'Lisa Chang',
      channel: '@BeautyTutorials',
      subscribers: '89K',
      quote: 'No more word limits killing my budget. I can test unlimited scripts and my channel growth exploded.',
      beforeAfter: {
        before: '35% retention',
        after: '68% retention'
      }
    },
    {
      name: 'Marcus Brown',
      channel: '@FitnessCoach',
      subscribers: '234K',
      quote: 'Writesonic gave me blog content. This gives me engaging YouTube scripts that actually keep viewers watching.',
      beforeAfter: {
        before: '38% retention',
        after: '74% retention'
      }
    }
  ];

  const migrationSteps = [
    'Export your templates from Writesonic\'s workspace',
    'Sign up with code SWITCH50 for unlimited access',
    'Import your data - we\'ll optimize it for YouTube',
    'Start generating unlimited retention-optimized scripts'
  ];

  const stats = [
    { value: `$${yearlyDifference}`, label: 'Yearly Savings' },
    { value: '68%+', label: 'Avg. Retention' },
    { value: 'Unlimited', label: 'Scripts/Month' },
    { value: '3.4x', label: 'Better ROI' }
  ];

  const faqs = [
    {
      question: 'How easy is it to switch from Writesonic?',
      answer: 'Extremely easy. Our migration wizard imports your templates and content style in under 5 minutes. Plus, you get unlimited scripts vs Writesonic\'s word limits.'
    },
    {
      question: 'What about my remaining Writesonic credits?',
      answer: 'We\'ll match your remaining word count and convert it to unlimited generation for the equivalent time period. No credits lost in the switch.'
    },
    {
      question: 'Do you really have unlimited scripts?',
      answer: 'Yes, truly unlimited. No word counts, no caps, no throttling. Generate as many YouTube scripts as you need without worrying about running out.'
    },
    {
      question: 'How is your YouTube focus better than Writesonic?',
      answer: 'We use retention optimization, viral frameworks, and YouTube-specific training data. Writesonic is trained on blogs and marketing copy - we\'re trained on viral videos.'
    },
    {
      question: 'Can I keep my current workflow?',
      answer: 'Yes, and improve it dramatically. We support all the same export formats, but with YouTube-optimized content that gets 68%+ retention vs generic blog-style scripts.'
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Genscript",
    "applicationCategory": "YouTube Script Generator",
    "operatingSystem": "Web",
    "alternativeOf": {
      "@type": "SoftwareApplication",
      "name": "Writesonic"
    },
    "offers": {
      "@type": "Offer",
      "price": "39.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2500"
    },
    "featureList": [
      "AI YouTube script generation",
      "68%+ retention optimization",
      "Voice matching technology",
      "Built-in fact checking",
      "PVSS viral framework",
      "Psychographic targeting"
    ]
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="writesonic-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      {/* Hero Section */}
      <MarketingHero
        badge={
          <>
            <Infinity className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Unlimited Scripts vs Word Limits</span>
          </>
        }
        title="Writesonic vs Specialized YouTube Script Generator for Content Creators"
        subtitle={`While Writesonic caps you at 100K words, we give you unlimited YouTube scripts with ${socialProofData.metrics.averageRetention}% retention. See why ${socialProofData.metrics.totalUsers}+ creators switched from generic AI to YouTube-specific intelligence.`}
        primaryCTA={
          <MarketingButton href="/signup?source=writesonic&offer=unlimited" size="large" icon={ArrowRight} iconRight>
            Get Unlimited Scripts Free
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
        subtitle="See exactly how we outperform Writesonic for YouTube"
        competitor="Writesonic"
        features={comparisonFeatures}
      />

      {/* Key Differentiators */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            What Writesonic Can't Do (But We Can)
          </h2>
        </div>
        <FeatureGrid features={keyDifferentiators} columns={3} />
      </MarketingSection>

      {/* Testimonials */}
      <TestimonialSection
        title="Creators Who Switched From Writesonic"
        subtitle="Real results from real creators who made the switch"
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
              <MarketingButton href="/signup?source=writesonic&offer=unlimited" icon={ArrowRight} iconRight>
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
              <p className="text-gray-400 text-sm mb-2">Writesonic Pro</p>
              <p className="text-3xl font-bold text-red-400">${competitor.pricing.pro}/mo</p>
              <p className="text-xs text-gray-400">100K word limit</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">GenScript Pro</p>
              <p className="text-3xl font-bold text-green-400">${ourPlatform.pricing.professional}/mo</p>
              <p className="text-xs text-gray-400">Unlimited scripts</p>
            </div>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="text-2xl font-bold text-green-400">
              Save ${yearlyDifference}/year + get unlimited scripts
            </p>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* FAQ Section */}
      <FAQSection 
        title="Common Questions From Writesonic Users"
        faqs={faqs}
      />

      {/* Final CTA */}
      <CTASection
        title="Ready to Break Free From Word Limits?"
        subtitle={`Join ${socialProofData.metrics.totalUsers}+ creators who switched to unlimited scripts and never looked back.`}
        primaryButton={
          <MarketingButton href="/signup?source=writesonic&offer=unlimited" size="large" icon={ArrowRight} iconRight>
            Get Unlimited Scripts Now
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
              <MarketingButton href="/signup?source=writesonic&offer=unlimited" className="flex-1">
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