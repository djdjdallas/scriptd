'use client';

import { useState } from 'react';
import { 
  Check, X, ArrowRight, Star, TrendingUp, Shield, Zap, 
  Brain, Target, Mic, Video, FileText, BookOpen, Eye, Users 
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

export default function PictoryAlternativePage() {
  const pictory = competitorData.pictory;
  const genscript = competitorData.ourPlatform;

  const comparisonFeatures = [
    {
      feature: 'Transcript Extraction',
      competitor: '✗ Not available',
      genscript: 'AI-powered competitive research'
    },
    {
      feature: 'Script Writing',
      competitor: '✗ No script generation',
      genscript: 'AI-powered generation'
    },
    {
      feature: 'Retention Optimization',
      competitor: '✗ No retention focus',
      genscript: '70%+ AVD targeting'
    },
    { 
      feature: 'Voice Matching', 
      competitor: '✗ Generic voices only', 
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
      feature: 'Blog-to-Video', 
      competitor: 'Automated conversion', 
      genscript: '✗ Scripts only'
    },
    { 
      feature: 'Auto Subtitles', 
      competitor: 'Built-in feature', 
      genscript: '✗ Not included'
    },
    { 
      feature: 'Stock Footage', 
      competitor: 'Large library', 
      genscript: '✗ Content focus'
    },
    { 
      feature: 'Text-to-Video', 
      competitor: 'Core feature', 
      genscript: '✗ Scripts only'
    },
    { 
      feature: 'Hook Library', 
      competitor: '✗ No hook system', 
      genscript: '1000+ viral hooks'
    },
    { 
      feature: 'YouTube Optimization', 
      competitor: '✗ Generic approach', 
      genscript: 'Algorithm-focused'
    }
  ];

  const keyDifferentiators = [
    {
      icon: Brain,
      title: 'Content Strategy vs Content Conversion',
      description: 'Pictory converts existing content to video. We create content designed to perform from the ground up with psychological frameworks.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Target,
      title: 'Retention Focus vs Production Focus',
      description: 'Fast video production means nothing if viewers don\'t watch. We optimize for engagement and watch time first.',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: Mic,
      title: 'Voice Authenticity vs Generic Voiceover',
      description: 'Pictory offers robotic voices. We create scripts that sound authentically like you for genuine connection.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: TrendingUp,
      title: 'YouTube Algorithm vs Generic Video',
      description: 'Our scripts are engineered specifically for YouTube\'s recommendation algorithm and watch time metrics.',
      gradient: 'from-yellow-500/20 to-orange-500/20'
    }
  ];

  const testimonials = [
    {
      name: 'Rachel Martinez',
      channel: '@ContentCreator',
      subscribers: '350K',
      quote: 'Pictory was perfect for converting my blogs to videos, but the scripts were boring. Genscript made them engaging!',
      beforeAfter: {
        before: '28% retention',
        after: '71% retention'
      }
    },
    {
      name: 'James Wilson',
      channel: '@BusinessInsights',
      subscribers: '240K',
      quote: 'I use Pictory for quick video creation and Genscript for script optimization. Together they\'re unstoppable.',
      beforeAfter: {
        before: '35% retention',
        after: '68% retention'
      }
    },
    {
      name: 'Emily Chen',
      channel: '@TechTalks',
      subscribers: '180K',
      quote: 'Pictory handles my visuals, Genscript handles my scripts. My watch time tripled when I started using both.',
      beforeAfter: {
        before: '2.1 min watch time',
        after: '6.8 min watch time'
      }
    }
  ];

  const perfectWorkflow = [
    'Generate retention-optimized script with Genscript (30 seconds)',
    'Import script to Pictory\'s text-to-video feature',  
    'Let Pictory handle visuals, subtitles, and editing (5 minutes)',
    'Upload professional video with retention-optimized content'
  ];

  const contentTypeComparison = [
    { type: 'Blog Conversion', improvement: '+320% engagement', description: 'Transform blog content for video retention' },
    { type: 'Educational Content', improvement: '+185% completion', description: 'PVSS framework for maximum learning retention' },
    { type: 'Marketing Videos', improvement: '+240% conversion', description: 'Psychological triggers and conversion optimization' },
    { type: 'Explainer Videos', improvement: '+280% retention', description: 'Engagement-first explanations with hook sequences' }
  ];

  const performanceStats = [
    { value: '320%', label: 'Engagement Boost' },
    { value: '8 min', label: 'Total Workflow' },
    { value: '3x', label: 'Watch Time' },
    { value: 'Perfect', label: 'Integration' }
  ];

  const faqs = [
    {
      question: 'Can I use Genscript scripts with Pictory\'s text-to-video feature?',
      answer: 'Yes! This is the perfect combination. Generate retention-optimized scripts with Genscript, then use them as input for Pictory\'s text-to-video conversion. You get engaging content AND professional video production.'
    },
    {
      question: 'Why do I need script optimization if Pictory handles everything?',
      answer: 'Pictory excels at converting text to video, but the input text quality determines your video\'s performance. Generic blog content converted to video typically gets 28% retention. Optimized scripts get 70%+ retention.'
    },
    {
      question: 'Does Genscript replace Pictory?',
      answer: 'No, they work perfectly together. Genscript optimizes the content strategy and script quality, while Pictory handles the video production. Together, you get both high-quality content AND efficient production.'
    },
    {
      question: 'What about Pictory\'s blog-to-video feature?',
      answer: 'It\'s great for quick conversions, but blogs aren\'t written for video retention. We can transform your blog content into video-optimized scripts that maintain the information while adding engagement elements.'
    },
    {
      question: 'How does this workflow save time compared to using either tool alone?',
      answer: 'You get the speed of Pictory\'s video creation with the performance of optimized scripts. Instead of creating multiple videos to find what works, your first video performs because the script is already optimized.'
    }
  ];

  const migrationBenefits = [
    'Keep using Pictory for video production',
    'Add Genscript for script optimization',
    'Transform existing blog content for video',
    'Integrate seamlessly into current workflow',
    'No learning curve - familiar tools, better results'
  ];

  return (
    <>
      {/* Hero Section */}
      <MarketingHero
        badge={
          <>
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Perfect Partner for Pictory</span>
          </>
        }
        title="Love Pictory? Supercharge Your Scripts for 70%+ Retention"
        subtitle={`Keep creating videos with Pictory. Add Genscript for scripts that get 68% retention. Transform your blog-to-video conversion from informational to absolutely engaging.`}
        primaryCTA={
          <MarketingButton href="/signup?source=pictory&offer=supercharge" size="large" icon={ArrowRight} iconRight>
            Upgrade Your Scripts
          </MarketingButton>
        }
        secondaryCTA={
          <MarketingButton variant="secondary" size="large" href="#workflow">
            See Perfect Workflow
          </MarketingButton>
        }
      >
        <div className="mt-12">
          <StatsBar stats={performanceStats} />
        </div>
      </MarketingHero>

      {/* Why You Need Both */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pictory Creates Videos. Genscript Makes Them Captivating.
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Blog-to-video conversion is powerful, but only if the content keeps viewers watching
          </p>
        </div>

        <div className="space-y-6">
          {[
            { strength: 'Blog-to-video conversion', limitation: 'Scripts lack engagement hooks', solution: 'Transform blog content into retention-optimized scripts', result: '+285% engagement' },
            { strength: 'Auto subtitle generation', limitation: 'No script optimization for retention', solution: 'Optimize text before video creation for maximum impact', result: '+340% watch time' },
            { strength: 'Stock footage library', limitation: 'Generic, template-based narration', solution: 'Personal voice matching for authentic delivery', result: '+220% connection' },
            { strength: 'Quick video production', limitation: 'No YouTube algorithm focus', solution: 'Algorithm-optimized scripts that get recommended', result: '+180% organic reach' }
          ].map((item, idx) => (
            <MarketingCard key={idx}>
              <div className="grid md:grid-cols-4 gap-6 items-center">
                <div>
                  <h3 className="font-semibold text-green-400 mb-2">Pictory Strength:</h3>
                  <p className="text-gray-400 text-sm">{item.strength}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-red-400 mb-2">Current Limitation:</h3>
                  <p className="text-gray-400 text-sm">{item.limitation}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-2">Genscript Solution:</h3>
                  <p className="text-gray-400 text-sm">{item.solution}</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{item.result}</div>
                  <div className="text-xs text-gray-400">Average boost</div>
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Perfect Workflow */}
      <MarketingSection id="workflow" className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            The Perfect Workflow: Genscript → Pictory → YouTube Success
          </h2>
          <p className="text-xl text-gray-400">
            From script generation to uploaded video with 70%+ retention potential in under 8 minutes
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <MarketingCard>
            <div className="space-y-6">
              {perfectWorkflow.map((step, idx) => (
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
              <MarketingButton href="/signup?source=pictory&offer=workflow" icon={ArrowRight} iconRight>
                Try the Workflow Now
              </MarketingButton>
            </div>
          </MarketingCard>
        </div>
      </MarketingSection>

      {/* Content Type Comparison */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Transform Every Content Type for Maximum Engagement
          </h2>
          <p className="text-xl text-gray-400">
            See how Genscript optimizes different content types for video success
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {contentTypeComparison.map((content, idx) => (
            <MarketingCard key={idx}>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">{content.type}</h3>
                <p className="text-gray-400">{content.description}</p>
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{content.improvement}</div>
                  <div className="text-xs text-gray-400">Performance improvement</div>
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {/* Comparison Section */}
      <ComparisonSection
        title="Pictory vs Genscript: Complementary Strengths"
        subtitle="See how these tools work perfectly together"
        competitor="Pictory"
        features={comparisonFeatures}
      />

      {/* Key Differentiators */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Pictory Users Add Genscript
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Video production is half the battle. Engaging content is what wins viewers.
          </p>
        </div>
        <FeatureGrid features={keyDifferentiators} columns={2} />
      </MarketingSection>

      {/* Testimonials */}
      <TestimonialSection
        title="Pictory Users Who Added Genscript"
        subtitle="See how combining efficient video production with engaging scripts transforms results"
        testimonials={testimonials}
      />

      {/* Integration Benefits */}
      <MarketingSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Seamless Integration with Your Existing Workflow
          </h2>
          <p className="text-xl text-gray-400">
            No disruption, just enhancement
          </p>
        </div>

        <MarketingCard className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">How It Works Together</h3>
          <div className="space-y-4">
            {migrationBenefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <MarketingButton href="/signup?source=pictory&offer=integration" icon={ArrowRight} iconRight>
              Enhance Your Pictory Workflow
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
        title="Ready to Transform Your Blog-to-Video Strategy?"
        subtitle="Keep the efficiency of Pictory. Add the engagement of Genscript scripts."
        badge={
          <>
            <span className="text-sm text-gray-400">Pictory User Special: 40% off first 2 months + blog optimization guide</span>
          </>
        }
        primaryButton={
          <MarketingButton href="/signup?source=pictory&offer=40off" size="large" icon={ArrowRight} iconRight>
            Claim Your Enhancement
          </MarketingButton>
        }
        secondaryButton={
          <MarketingButton variant="secondary" size="large" href="#workflow">
            See Workflow Demo
          </MarketingButton>
        }
        features={[
          '14-day free trial',
          'Perfect with Pictory',
          '320% engagement boost guaranteed',
          'Blog optimization guide included'
        ]}
      />
    </>
  );
}