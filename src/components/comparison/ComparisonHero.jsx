'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, Clock } from 'lucide-react';
import { useABTest } from '@/lib/ab-testing';
import { useEffect, useState } from 'react';

export default function ComparisonHero({ 
  competitor, 
  competitorData,
  userId,
  customHeadline,
  customSubheadline 
}) {
  const { variant, trackEvent } = useABTest('landing_headline_test', userId);
  const { variant: ctaVariant, trackEvent: trackCtaEvent } = useABTest('cta_button_test', userId);
  
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('Start Free Trial');
  
  useEffect(() => {
    // Set headlines based on A/B test variant
    if (customHeadline) {
      setHeadline(customHeadline);
    } else {
      const headlineTemplates = {
        control: `Looking for a ${competitorData.name} Alternative That Actually Improves Retention?`,
        variant_a: `The ${competitorData.name} Alternative That Keeps Viewers Watching`,
        variant_b: `Better Than ${competitorData.name}: Scripts That Get 70%+ Retention`
      };
      setHeadline(headlineTemplates[variant] || headlineTemplates.control);
    }
    
    if (customSubheadline) {
      setSubheadline(customSubheadline);
    } else {
      const subheadlineTemplates = {
        control: `While ${competitorData.name} focuses on ${competitorData.mainFocus}, we optimize your scripts for 70%+ viewer retention.`,
        variant_a: 'Stop optimizing for clicks. Start optimizing for retention with AI-powered scripts.',
        variant_b: `Join 15,000+ creators who switched from ${competitorData.name} for better results.`
      };
      setSubheadline(subheadlineTemplates[variant] || subheadlineTemplates.control);
    }
    
    // Set CTA text based on variant
    const ctaTexts = {
      control: 'Start Free Trial',
      variant_a: 'Try Free for 14 Days',
      variant_b: 'Get Started Free',
      variant_c: 'Start Creating Better Scripts',
      variant_d: 'Claim Your Free Trial'
    };
    setCtaText(ctaTexts[ctaVariant] || 'Start Free Trial');
  }, [variant, ctaVariant, competitorData, customHeadline, customSubheadline]);
  
  const handleCtaClick = async (ctaType) => {
    // Track both headline and CTA test conversions
    await trackEvent('cta_click', 1);
    await trackCtaEvent('cta_click', 1);
    
    // Track specific CTA type
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'hero_cta_click', {
        competitor: competitor,
        cta_type: ctaType,
        headline_variant: variant,
        cta_variant: ctaVariant
      });
    }
  };
  
  return (
    <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center">
          {/* Trust Badge */}
          <Badge className="mb-4" variant="secondary">
            <Star className="w-4 h-4 mr-1" />
            Trusted by 15,000+ Creators
          </Badge>
          
          {/* Dynamic Headline */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {headline}
          </h1>
          
          {/* Dynamic Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {subheadline}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => handleCtaClick('primary')}
            >
              {ctaText}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => handleCtaClick('secondary')}
            >
              See Full Comparison
            </Button>
          </div>
          
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>15,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Setup in 2 minutes</span>
            </div>
            <div>No credit card required</div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      </div>
    </section>
  );
}