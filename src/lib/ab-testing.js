// A/B Testing Configuration and Utilities

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (ensure environment variables are set)
const supabase = typeof window !== 'undefined' ? 
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  ) : null;

// A/B Test Configurations
export const abTests = {
  landingPageHeadline: {
    id: 'landing_headline_test',
    name: 'Landing Page Headline Test',
    status: 'active',
    traffic: 0.5, // 50% of traffic gets tested
    variants: {
      control: {
        weight: 0.5,
        headline: 'Looking for a {competitor} Alternative That Actually Improves Retention?',
        subheadline: 'While {competitor} focuses on {their_focus}, we optimize your scripts for 70%+ viewer retention.'
      },
      variant_a: {
        weight: 0.25,
        headline: 'The {competitor} Alternative That Keeps Viewers Watching',
        subheadline: 'Stop optimizing for clicks. Start optimizing for retention with AI-powered scripts.'
      },
      variant_b: {
        weight: 0.25,
        headline: 'Better Than {competitor}: Scripts That Get 70%+ Retention',
        subheadline: 'Join 15,000+ creators who switched from {competitor} for better results.'
      }
    }
  },
  
  ctaButton: {
    id: 'cta_button_test',
    name: 'CTA Button Text Test',
    status: 'active',
    traffic: 1.0, // Test all traffic
    variants: {
      control: {
        weight: 0.2,
        text: 'Start Free Trial',
        color: 'gradient'
      },
      variant_a: {
        weight: 0.2,
        text: 'Try Free for 14 Days',
        color: 'gradient'
      },
      variant_b: {
        weight: 0.2,
        text: 'Get Started Free',
        color: 'gradient'
      },
      variant_c: {
        weight: 0.2,
        text: 'Start Creating Better Scripts',
        color: 'gradient'
      },
      variant_d: {
        weight: 0.2,
        text: 'Claim Your Free Trial',
        color: 'gradient'
      }
    }
  },
  
  socialProofPlacement: {
    id: 'social_proof_test',
    name: 'Social Proof Placement Test',
    status: 'active',
    traffic: 0.3,
    variants: {
      control: {
        weight: 0.5,
        placement: 'after_hero',
        style: 'cards'
      },
      variant_a: {
        weight: 0.5,
        placement: 'in_hero',
        style: 'inline_metrics'
      }
    }
  },
  
  pricingEmphasis: {
    id: 'pricing_emphasis_test',
    name: 'Pricing Emphasis Test',
    status: 'active',
    traffic: 0.5,
    variants: {
      control: {
        weight: 0.33,
        emphasis: 'savings',
        message: '50% cheaper than {competitor}'
      },
      variant_a: {
        weight: 0.33,
        emphasis: 'value',
        message: 'More features for less'
      },
      variant_b: {
        weight: 0.34,
        emphasis: 'free_trial',
        message: 'Try free for 14 days'
      }
    }
  },
  
  urgencyMessaging: {
    id: 'urgency_test',
    name: 'Urgency Messaging Test',
    status: 'active',
    traffic: 0.4,
    variants: {
      control: {
        weight: 0.25,
        show: false
      },
      variant_a: {
        weight: 0.25,
        show: true,
        message: 'Limited Time: 50% Off',
        type: 'discount'
      },
      variant_b: {
        weight: 0.25,
        show: true,
        message: 'Only 48 hours left',
        type: 'time'
      },
      variant_c: {
        weight: 0.25,
        show: true,
        message: 'Join 127 creators today',
        type: 'social'
      }
    }
  }
};

// Get user's test variant
export const getVariant = (testId, userId) => {
  const test = abTests[testId];
  if (!test || test.status !== 'active') {
    return 'control';
  }
  
  // Check if user should be in test
  const inTest = Math.random() < test.traffic;
  if (!inTest) {
    return 'control';
  }
  
  // Determine variant based on weights
  const random = Math.random();
  let cumulative = 0;
  
  for (const [variantId, variant] of Object.entries(test.variants)) {
    cumulative += variant.weight;
    if (random < cumulative) {
      return variantId;
    }
  }
  
  return 'control';
};

// Track test exposure
export const trackExposure = async (testId, variantId, userId, metadata = {}) => {
  if (!supabase) return;
  
  try {
    await supabase.from('ab_test_exposures').insert({
      test_id: testId,
      variant_id: variantId,
      user_id: userId,
      metadata,
      exposed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track exposure:', error);
  }
};

// Track conversion
export const trackConversion = async (testId, variantId, userId, conversionType = 'signup', value = null) => {
  if (!supabase) return;
  
  try {
    await supabase.from('ab_test_conversions').insert({
      test_id: testId,
      variant_id: variantId,
      user_id: userId,
      conversion_type: conversionType,
      conversion_value: value,
      converted_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track conversion:', error);
  }
};

// Get test results
export const getTestResults = async (testId) => {
  if (!supabase) return null;
  
  try {
    // Get exposures
    const { data: exposures } = await supabase
      .from('ab_test_exposures')
      .select('variant_id')
      .eq('test_id', testId);
    
    // Get conversions
    const { data: conversions } = await supabase
      .from('ab_test_conversions')
      .select('variant_id, conversion_type, conversion_value')
      .eq('test_id', testId);
    
    // Calculate results per variant
    const results = {};
    const test = abTests[testId];
    
    for (const variantId of Object.keys(test.variants)) {
      const variantExposures = exposures?.filter(e => e.variant_id === variantId) || [];
      const variantConversions = conversions?.filter(c => c.variant_id === variantId) || [];
      
      results[variantId] = {
        exposures: variantExposures.length,
        conversions: variantConversions.length,
        conversionRate: variantExposures.length > 0 
          ? (variantConversions.length / variantExposures.length * 100).toFixed(2)
          : 0,
        avgValue: variantConversions.length > 0
          ? variantConversions.reduce((sum, c) => sum + (c.conversion_value || 0), 0) / variantConversions.length
          : 0
      };
    }
    
    return results;
  } catch (error) {
    console.error('Failed to get test results:', error);
    return null;
  }
};

// React Hook for A/B Testing
export const useABTest = (testId, userId) => {
  const [variant, setVariant] = useState('control');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadVariant = async () => {
      // Check if variant is stored in localStorage
      const storageKey = `ab_test_${testId}_${userId}`;
      const storedVariant = localStorage.getItem(storageKey);
      
      if (storedVariant) {
        setVariant(storedVariant);
      } else {
        // Assign new variant
        const newVariant = getVariant(testId, userId);
        setVariant(newVariant);
        localStorage.setItem(storageKey, newVariant);
        
        // Track exposure
        await trackExposure(testId, newVariant, userId);
      }
      
      setIsLoading(false);
    };
    
    loadVariant();
  }, [testId, userId]);
  
  const trackEvent = async (eventType, value = null) => {
    await trackConversion(testId, variant, userId, eventType, value);
  };
  
  return { variant, isLoading, trackEvent };
};

// Multivariate Testing Utility
export const multivariateTest = (tests, userId) => {
  const results = {};
  
  for (const [testName, testId] of Object.entries(tests)) {
    results[testName] = getVariant(testId, userId);
  }
  
  return results;
};

// Statistical Significance Calculator
export const calculateSignificance = (controlConversions, controlExposures, variantConversions, variantExposures) => {
  const controlRate = controlConversions / controlExposures;
  const variantRate = variantConversions / variantExposures;
  
  // Standard error
  const se = Math.sqrt(
    (controlRate * (1 - controlRate) / controlExposures) +
    (variantRate * (1 - variantRate) / variantExposures)
  );
  
  // Z-score
  const z = (variantRate - controlRate) / se;
  
  // P-value (two-tailed)
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));
  
  return {
    controlRate: (controlRate * 100).toFixed(2),
    variantRate: (variantRate * 100).toFixed(2),
    uplift: ((variantRate - controlRate) / controlRate * 100).toFixed(2),
    pValue: pValue.toFixed(4),
    isSignificant: pValue < 0.05,
    confidence: ((1 - pValue) * 100).toFixed(1)
  };
};

// Normal CDF approximation
const normalCDF = (z) => {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);
  
  const t = 1 / (1 + p * z);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;
  
  const y = 1 - ((((a5 * t5 + a4 * t4 + a3 * t3 + a2 * t2 + a1 * t) * Math.exp(-z * z)));
  
  return 0.5 * (1 + sign * y);
};

export default {
  abTests,
  getVariant,
  trackExposure,
  trackConversion,
  getTestResults,
  useABTest,
  multivariateTest,
  calculateSignificance
};