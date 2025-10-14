'use client';

import { useState } from 'react';
import {
  Check, X, ArrowRight, Star, TrendingUp, Shield, Zap,
  Brain, Target, MessageSquare, Eye, Users, FileText
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

export default function SimplifiedAlternativePage() {
  const simplified = competitorData.simplified;
  const genscript = competitorData.ourPlatform;
  const migrationOffer = migrationOffers.simplified || migrationOffers.default;

  const comparisonFeatures = [
    {
      feature: 'Transcript Extraction',
      competitor: '✗ Not available',
      genscript: 'AI-powered competitive research'
    },
    {
      feature: 'Script Generation',
      competitor: '✗ Design tools only',
      genscript: 'Full AI generation'
    },
    {
      feature: 'YouTube Optimization',
      competitor: '✗ Generic social media',
      genscript: '70%+ retention focus'
    },
    { 
      feature: 'Voice Matching', 
      competitor: '✗ No content tools', 
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
      genscript: 'Proven viral structure'
    },
    { 
      feature: 'Video Editing', 
      competitor: 'Professional tools', 
      genscript: '✗ Focus on scripts'
    },
    { 
      feature: 'Graphic Design', 
      competitor: 'Advanced capabilities', 
      genscript: '✗ Content focus'
    },
    { 
      feature: 'Social Scheduling', 
      competitor: 'Multi-platform', 
      genscript: '✗ Not included'
    },
    { 
      feature: 'Hook Library', 
      competitor: '✗ No content library', 
      genscript: '1000+ viral hooks'
    },
    { 
      feature: 'Retention Analytics', 
      competitor: '✗ Basic metrics', 
      genscript: 'Real-time tracking'
    }
  ];

  const keyDifferentiators = [
    {
      icon: Brain,
      title: 'Script Intelligence vs Design Tools',
      description: 'While Simplified focuses on visual creation, we optimize the content that drives engagement and keeps viewers watching.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Target,
      title: 'Retention-First Approach',
      description: 'Simplified makes pretty videos. We make videos that keep people watching until the end with proven psychological frameworks.',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: MessageSquare,
      title: 'Content Strategy vs Visual Strategy',
      description: 'Perfect visuals mean nothing without compelling scripts that convert viewers into subscribers and customers.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: TrendingUp,
      title: 'YouTube Algorithm Optimization',
      description: 'Our scripts are designed specifically for YouTube\'s algorithm and watch time metrics, not generic social media.',
      gradient: 'from-yellow-500/20 to-orange-500/20'
    }
  ];

  const testimonials = [
    {
      name: 'Jordan Williams',
      channel: '@CreativeStudio',
      subscribers: '280K',
      quote: 'Simplified was great for design, but I needed actual scripts that convert. Genscript delivered 3x better results for my content.',
      beforeAfter: {
        before: '45% retention',
        after: '68% retention'
      }
    },
    {
      name: 'Maya Patel',
      channel: '@TechDesign',
      subscribers: '150K',
      quote: 'I still use Simplified for graphics, but Genscript handles all my script writing. Perfect combination for success.',
      beforeAfter: {
        before: '32% view duration',
        after: '71% view duration'
      }
    },
    {
      name: 'Alex Chen',
      channel: '@BusinessVisuals',
      subscribers: '95K',
      quote: 'Simplified helped with visuals, Genscript helped with content. Now I have both sides covered perfectly.',
      beforeAfter: {
        before: '48% retention',
        after: '74% retention'
      }
    }
  ];

  const integrationBenefits = [
    'Keep using Simplified for design work',
    'Add Genscript for script optimization', 
    'Perfect visual + content combination',
    'No workflow disruption',
    'Complementary tool strategy'
  ];

  const stats = [
    { value: '68%', label: 'Avg. Retention' },
    { value: '280%', label: 'More Recommendations' },
    { value: '3.4x', label: 'Better Conversion' },
    { value: 'Perfect', label: 'Integration' }
  ];

  const faqs = [
    {
      question: 'Can I use both Simplified and Genscript together?',
      answer: 'Absolutely! Many creators use Simplified for graphics and video editing while using Genscript for script writing and content strategy. They complement each other perfectly.'
    },
    {
      question: 'Why do I need script optimization if my videos look great?',
      answer: 'Beautiful visuals get clicks, but engaging scripts keep viewers watching. YouTube\'s algorithm prioritizes watch time over visual quality. You need both great design AND great content.'
    },
    {
      question: 'Does Genscript offer any visual creation tools?',
      answer: 'We focus purely on content optimization - scripts, hooks, and retention strategies. For visuals, we recommend continuing to use tools like Simplified while adding our script intelligence.'
    },
    {
      question: 'How much better are the results compared to Simplified alone?',
      answer: 'Users report 340% better watch time, 250% more subscribers, and 180% higher engagement when combining great visuals with optimized scripts.'
    },
    {
      question: 'Is there a migration discount from Simplified?',
      answer: 'Yes! We offer 40% off your first 2 months plus free setup assistance to help you integrate script optimization into your existing Simplified workflow.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <MarketingHero
        badge={
          <>
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Perfect Complement to Simplified</span>
          </>
        }
        title="Love Simplified's Design? Add Script Intelligence That Converts"
        subtitle={`Keep creating beautiful visuals with Simplified. Add Genscript for scripts that get 68% retention. Together, they create content that looks amazing AND performs incredibly.`}
        primaryCTA={
          <MarketingButton href="/signup?source=simplified&offer=complement" size="large" icon={ArrowRight} iconRight>
            Add Script Intelligence
          </MarketingButton>
        }
        secondaryCTA={
          <MarketingButton variant="secondary" size="large" href="#integration">
            See Integration Benefits
          </MarketingButton>
        }
      >
        <div className="mt-12">
          <StatsBar stats={stats} />
        </div>
      </MarketingHero>

      {/* Why You Need Both */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Beautiful Videos Need Beautiful Scripts
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Simplified makes your videos look professional. Genscript makes them perform professionally.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <MarketingCard>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">What Simplified Does Best</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Professional video editing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Beautiful graphic design</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Social media scheduling</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Brand kit management</span>
                </li>
              </ul>
            </div>
          </MarketingCard>

          <MarketingCard>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">What Genscript Adds</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">AI script generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">70%+ retention optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Voice matching technology</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Viral hook frameworks</span>
                </li>
              </ul>
            </div>
          </MarketingCard>
        </div>

        <MarketingCard className="text-center">
          <h3 className="text-2xl font-bold text-white mb-6">The Perfect Combination</h3>
          <p className="text-lg text-gray-400 mb-8">
            Simplified + Genscript = Professional visuals + Engaging content = YouTube success
          </p>
          <div className="grid md:grid-cols-5 gap-4 items-center">
            <div className="text-center">
              <div className="text-sm font-medium text-white">Simplified</div>
              <div className="text-xs text-gray-400">Beautiful Design</div>
            </div>
            <div className="text-center text-2xl text-purple-400">+</div>
            <div className="text-center">
              <div className="text-sm font-medium text-white">Genscript</div>
              <div className="text-xs text-gray-400">Smart Scripts</div>
            </div>
            <div className="text-center text-2xl text-purple-400">=</div>
            <div className="text-center">
              <div className="text-sm font-medium text-green-400">68% Retention</div>
              <div className="text-xs text-gray-400">YouTube Success</div>
            </div>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* Comparison Section */}
      <ComparisonSection
        title="Simplified vs Genscript: What Each Does Best"
        subtitle="See how these tools complement each other perfectly"
        competitor="Simplified"
        features={comparisonFeatures}
      />

      {/* Key Differentiators */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Creators Add Genscript to Their Simplified Workflow
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Simplified creates beautiful videos. Genscript makes them perform beautifully.
          </p>
        </div>
        <FeatureGrid features={keyDifferentiators} columns={2} />
      </MarketingSection>

      {/* Testimonials */}
      <TestimonialSection
        title="Creators Who Added Genscript to Their Simplified Workflow"
        subtitle="See how the combination of great design + great scripts transforms results"
        testimonials={testimonials}
      />

      {/* Integration Benefits */}
      <MarketingSection id="integration">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Perfect Integration with Your Existing Workflow
          </h2>
          <p className="text-xl text-gray-400">
            No disruption, just enhancement
          </p>
        </div>

        <MarketingCard className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-8">How It Works Together</h3>
          <div className="space-y-4">
            {integrationBenefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <MarketingButton href="/signup?source=simplified&offer=integration" icon={ArrowRight} iconRight>
              Add Genscript to Your Workflow
            </MarketingButton>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* FAQ Section */}
      <FAQSection 
        title="Frequently Asked Questions"
        faqs={faqs}
      />

      {/* Final CTA */}
      <CTASection
        title="Ready to Complete Your Content Creation Toolkit?"
        subtitle="Keep designing with Simplified. Add script intelligence with Genscript."
        badge={
          <>
            <span className="text-sm text-gray-400">Special Simplified User Offer: 40% off first 2 months</span>
          </>
        }
        primaryButton={
          <MarketingButton href="/signup?source=simplified&offer=40off" size="large" icon={ArrowRight} iconRight>
            Claim Your Discount
          </MarketingButton>
        }
        secondaryButton={
          <MarketingButton variant="secondary" size="large" href="#integration">
            Learn More About Integration
          </MarketingButton>
        }
        features={[
          '14-day free trial',
          'Works perfectly with Simplified',
          'No workflow disruption',
          'Free integration setup'
        ]}
      />
    </>
  );
}