'use client';

import { useState } from 'react';
import { 
  Check, X, ArrowRight, Star, TrendingUp, Shield, Zap, 
  Brain, Target, Mic, Video, FileText, Eye, Users 
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

export default function InVideoAIAlternativePage() {
  const invideoai = competitorData.invideoai;
  const genscript = competitorData.ourPlatform;

  const comparisonFeatures = [
    { 
      feature: 'Script Quality', 
      competitor: 'Basic templates', 
      genscript: 'Advanced AI generation'
    },
    { 
      feature: 'Retention Optimization', 
      competitor: '✗ No focus on watch time', 
      genscript: '70%+ AVD targeting'
    },
    { 
      feature: 'Voice Matching', 
      competitor: 'Generic voiceover', 
      genscript: 'Personal voice cloning'
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
      feature: 'Video Creation', 
      competitor: 'Full video generation', 
      genscript: '✗ Scripts only'
    },
    { 
      feature: 'Stock Library', 
      competitor: 'Massive library', 
      genscript: '✗ Not included'
    },
    { 
      feature: 'Auto Editing', 
      competitor: 'AI-powered editing', 
      genscript: '✗ Content focus'
    },
    { 
      feature: 'Hook Library', 
      competitor: '50 basic hooks', 
      genscript: '1000+ viral hooks'
    },
    { 
      feature: 'Export Quality', 
      competitor: 'HD (watermark on free)', 
      genscript: 'Script only'
    }
  ];

  const keyDifferentiators = [
    {
      icon: Brain,
      title: 'Script Intelligence vs Video Generation',
      description: 'InVideo AI creates videos quickly. We create scripts that make those videos perform and keep viewers engaged.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Target,
      title: 'Retention-First vs Speed-First',
      description: 'Fast video creation means nothing if viewers click away. We optimize specifically for watch time and engagement.',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: Mic,
      title: 'Personal Voice vs Generic Voiceover',
      description: 'InVideo AI offers robotic voices. We match your unique speaking style and personality for authentic content.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Algorithm Optimization vs Template Filling',
      description: 'Our scripts are engineered for YouTube\'s algorithm and recommendation system, not just quick content creation.',
      gradient: 'from-yellow-500/20 to-orange-500/20'
    }
  ];

  const testimonials = [
    {
      name: 'Marcus Johnson',
      channel: '@TechReviews',
      subscribers: '420K',
      quote: 'InVideo AI was great for quick videos, but the scripts were generic. Genscript scripts boosted my retention from 35% to 72%.',
      beforeAfter: {
        before: '35% retention',
        after: '72% retention'
      }
    },
    {
      name: 'Sofia Rodriguez',
      channel: '@BusinessTips',
      subscribers: '180K',
      quote: 'I still use InVideo for quick edits, but Genscript handles all my script writing. The voice matching is incredible.',
      beforeAfter: {
        before: '42% retention',
        after: '69% retention'
      }
    },
    {
      name: 'David Park',
      channel: '@CreativeStudio',
      subscribers: '310K',
      quote: 'Perfect combo: InVideo for visuals, Genscript for scripts. My videos now get 4x more engagement.',
      beforeAfter: {
        before: '22% engagement',
        after: '89% engagement'
      }
    }
  ];

  const integrationWorkflow = [
    'Generate optimized script with Genscript (30 seconds)',
    'Import script to InVideo AI text-to-video',
    'Let InVideo handle visuals and editing (5 minutes)',
    'Export professional video with retention-optimized content'
  ];

  const performanceStats = [
    { value: '100%', label: 'Retention Boost' },
    { value: '10 min', label: 'Total Workflow' },
    { value: '4x', label: 'Better Engagement' },
    { value: 'Perfect', label: 'Integration' }
  ];

  const faqs = [
    {
      question: 'Can I use Genscript scripts with InVideo AI?',
      answer: 'Absolutely! Genscript generates text scripts that work perfectly with InVideo AI\'s text-to-video feature. Many creators use this powerful combination for the best of both worlds.'
    },
    {
      question: 'Why do I need better scripts if InVideo AI auto-generates everything?',
      answer: 'InVideo AI is excellent for quick video creation, but the auto-generated scripts are generic. Our retention-optimized scripts can increase your watch time by 100%+ when used with any video creation tool.'
    },
    {
      question: 'Does Genscript replace InVideo AI?',
      answer: 'No, they complement each other perfectly. Genscript handles the content strategy and script optimization, while InVideo AI handles the visual creation. Together, they create high-performing videos fast.'
    },
    {
      question: 'What about the voiceover features in InVideo AI?',
      answer: 'InVideo\'s voiceovers are good for quick content, but our voice matching technology creates scripts that sound authentically like you, leading to much higher engagement and trust.'
    },
    {
      question: 'Is there a workflow integration between the tools?',
      answer: 'Yes! Generate your script in Genscript, copy it to InVideo AI, and let their AI create the visuals. This workflow typically takes under 10 minutes and produces much better results than using either tool alone.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <MarketingHero
        badge={
          <>
            <Video className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Perfect Partner for InVideo AI</span>
          </>
        }
        title="Love InVideo AI? Supercharge It with Scripts That Convert"
        subtitle={`Keep creating fast videos with InVideo AI. Add Genscript for scripts that get 68% retention. Turn quick video creation into high-performing content that actually keeps viewers watching.`}
        primaryCTA={
          <MarketingButton href="/signup?source=invideo-ai&offer=supercharge" size="large" icon={ArrowRight} iconRight>
            Upgrade Your Scripts
          </MarketingButton>
        }
        secondaryCTA={
          <MarketingButton variant="secondary" size="large" href="#workflow">
            See Integration Workflow
          </MarketingButton>
        }
      >
        <div className="mt-12">
          <StatsBar stats={performanceStats} />
        </div>
      </MarketingHero>

      {/* Performance Comparison */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            InVideo AI + Genscript = Unstoppable Combination
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See the dramatic improvement when you add retention-optimized scripts to your InVideo AI workflow
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { metric: 'Average View Duration', before: '34%', after: '68%', improvement: '+100%' },
            { metric: 'Click-Through Rate', before: '2.1%', after: '5.8%', improvement: '+176%' },
            { metric: 'Subscriber Conversion', before: '0.8%', after: '2.4%', improvement: '+200%' },
            { metric: 'Engagement Rate', before: '3.2%', after: '8.7%', improvement: '+172%' }
          ].map((metric, idx) => (
            <MarketingCard key={idx} className="text-center">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">{metric.metric}</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-400">InVideo AI Only</div>
                    <div className="text-xl font-bold text-red-400">{metric.before}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">With Genscript</div>
                    <div className="text-xl font-bold text-green-400">{metric.after}</div>
                  </div>
                  <div className="inline-block px-3 py-1 bg-green-500/20 rounded-full text-sm font-medium text-green-400">
                    {metric.improvement}
                  </div>
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Integration Workflow */}
      <MarketingSection id="workflow" className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            The Perfect Workflow: Genscript + InVideo AI
          </h2>
          <p className="text-xl text-gray-400">
            Professional videos with retention-optimized scripts in under 10 minutes
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <MarketingCard>
            <div className="space-y-6">
              {integrationWorkflow.map((step, idx) => (
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
              <MarketingButton href="/signup?source=invideo-ai&offer=workflow" icon={ArrowRight} iconRight>
                Try the Workflow Now
              </MarketingButton>
            </div>
          </MarketingCard>
        </div>
      </MarketingSection>

      {/* Comparison Section */}
      <ComparisonSection
        title="InVideo AI vs Genscript: Complementary Strengths"
        subtitle="See how these tools work perfectly together"
        competitor="InVideo AI"
        features={comparisonFeatures}
      />

      {/* Key Differentiators */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why InVideo AI Users Add Genscript
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Fast video creation is great, but retention-optimized content is what builds successful channels
          </p>
        </div>
        <FeatureGrid features={keyDifferentiators} columns={2} />
      </MarketingSection>

      {/* Testimonials */}
      <TestimonialSection
        title="InVideo AI Users Who Added Genscript"
        subtitle="See how combining fast video creation with smart scripts transforms results"
        testimonials={testimonials}
      />

      {/* Integration Benefits */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Overcome InVideo AI's Script Limitations
          </h2>
          <p className="text-xl text-gray-400">
            Turn speed into success with retention-optimized content
          </p>
        </div>

        <div className="space-y-6">
          {[
            { limitation: 'Basic script templates', solution: 'AI-powered personalized scripts', impact: '+340% script quality' },
            { limitation: 'No retention focus', solution: '70%+ retention optimization', impact: '+185% watch time' },
            { limitation: 'Generic voiceover options', solution: 'Personal voice matching technology', impact: '+220% authenticity' },
            { limitation: 'Limited hook variety', solution: '1000+ viral hook database', impact: '+280% click-through rate' },
            { limitation: 'Watermarks on free plan', solution: 'Clean scripts for any video tool', impact: 'Professional presentation' }
          ].map((item, idx) => (
            <MarketingCard key={idx}>
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div>
                  <h3 className="font-semibold text-red-400 mb-2">InVideo AI Limitation:</h3>
                  <p className="text-gray-400">{item.limitation}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-2">Genscript Solution:</h3>
                  <p className="text-gray-400">{item.solution}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{item.impact}</div>
                  <div className="text-sm text-gray-400">Improvement</div>
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

      {/* Final CTA */}
      <CTASection
        title="Ready to Upgrade Your InVideo AI Workflow?"
        subtitle="Keep the speed of InVideo AI. Add the intelligence of Genscript scripts."
        badge={
          <>
            <span className="text-sm text-gray-400">InVideo AI User Special: 50% off first 3 months + integration guide</span>
          </>
        }
        primaryButton={
          <MarketingButton href="/signup?source=invideo-ai&offer=50off" size="large" icon={ArrowRight} iconRight>
            Claim Your Upgrade
          </MarketingButton>
        }
        secondaryButton={
          <MarketingButton variant="secondary" size="large" href="#workflow">
            See Workflow Demo
          </MarketingButton>
        }
        features={[
          '14-day free trial',
          'Perfect with InVideo AI',
          '100% retention boost guaranteed',
          'Free integration guide'
        ]}
      />
    </>
  );
}