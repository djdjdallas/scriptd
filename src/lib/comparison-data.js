// Centralized comparison data structure for easy database storage and updates

export const competitorData = {
  vidiq: {
    name: 'VidIQ',
    slug: 'vidiq',
    category: 'YouTube SEO Tool',
    mainFocus: 'Discovery & SEO',
    pricing: {
      starter: 7.50,
      pro: 39,
      enterprise: 'Custom'
    },
    strengths: [
      'Keyword research',
      'SEO optimization',
      'Competitor analysis',
      'Chrome extension'
    ],
    weaknesses: [
      'No retention optimization',
      'Template-based scripts',
      'No voice matching',
      'Limited AI capabilities'
    ],
    features: {
      retentionOptimization: false,
      voiceMatching: false,
      factChecking: false,
      pvssFramework: false,
      psychographicTargeting: 'Basic',
      scriptGeneration: 'Templates only',
      qualityTiers: false,
      seoOptimization: true,
      thumbnailAnalysis: true,
      hookLibrary: 50,
      customVoiceTraining: false,
      abTesting: false,
      apiAccess: true,
      support: 'Email only'
    }
  },
  
  subscribrAI: {
    name: 'Subscribr AI',
    slug: 'subscribr-ai',
    category: 'AI Script Generator',
    mainFocus: 'Script Generation',
    pricing: {
      starter: 29,
      pro: 59,
      enterprise: 99
    },
    strengths: [
      'AI-powered scripts',
      'Multiple templates',
      'Quick generation',
      'User-friendly'
    ],
    weaknesses: [
      'Generic output',
      'Limited customization',
      'No psychographic analysis',
      'Basic retention focus'
    ],
    features: {
      retentionOptimization: '50% AVD target',
      voiceMatching: 'Basic templates',
      factChecking: false,
      pvssFramework: false,
      psychographicTargeting: false,
      scriptGeneration: 'AI-powered',
      qualityTiers: 'One size fits all',
      seoOptimization: true,
      thumbnailAnalysis: false,
      hookLibrary: 100,
      customVoiceTraining: false,
      abTesting: false,
      apiAccess: 'Enterprise only',
      support: 'Email only'
    }
  },
  
  jasperAI: {
    name: 'Jasper AI',
    slug: 'jasper-ai',
    category: 'General AI Writer',
    mainFocus: 'Blog & Marketing Content',
    pricing: {
      creator: 39,
      teams: 99,
      business: 125
    },
    strengths: [
      'Versatile content types',
      'Brand voice',
      'Chrome extension',
      'Large template library'
    ],
    weaknesses: [
      'Not YouTube-specific',
      'No video optimization',
      'Generic for scripts',
      'Word limits'
    ],
    features: {
      retentionOptimization: false,
      voiceMatching: 'Brand voice only',
      factChecking: false,
      pvssFramework: false,
      psychographicTargeting: false,
      scriptGeneration: 'Generic AI',
      qualityTiers: false,
      seoOptimization: true,
      thumbnailAnalysis: false,
      hookLibrary: 50,
      customVoiceTraining: false,
      abTesting: false,
      apiAccess: true,
      support: 'Chat support',
      wordLimit: '50K words/mo'
    }
  },
  
  ourPlatform: {
    name: 'Subscribr',
    slug: 'subscribr',
    category: 'YouTube Script Optimizer',
    mainFocus: 'Retention & Virality',
    pricing: {
      starter: 19,
      professional: 49,
      enterprise: 79
    },
    strengths: [
      '70%+ retention optimization',
      'Personal voice matching',
      'PVSS viral framework',
      'Psychographic targeting',
      'Fact-checking built-in',
      '1000+ viral hooks',
      'YouTube-specific',
      'Unlimited scripts'
    ],
    features: {
      retentionOptimization: '70%+ AVD targeting',
      voiceMatching: 'Advanced AI matching',
      factChecking: 'Built-in verification',
      pvssFramework: 'Proven viral framework',
      psychographicTargeting: 'Advanced AI analysis',
      scriptGeneration: 'Full AI generation',
      qualityTiers: 'Fast/Balanced/Premium',
      seoOptimization: true,
      thumbnailAnalysis: 'AI-powered creation',
      hookLibrary: 1000,
      customVoiceTraining: true,
      abTesting: true,
      apiAccess: 'All paid plans',
      support: '24/7 live chat',
      wordLimit: 'Unlimited'
    }
  }
};

// A/B Testing Variations for Headlines
export const headlineVariations = {
  vidiq: [
    {
      id: 'v1',
      headline: 'Looking for a VidIQ Alternative That Actually Improves Retention?',
      subheadline: 'While VidIQ focuses on SEO, we optimize your scripts for 70%+ viewer retention.'
    },
    {
      id: 'v2',
      headline: 'The VidIQ Alternative That Keeps Viewers Watching',
      subheadline: 'Stop optimizing for clicks. Start optimizing for retention with AI-powered scripts.'
    },
    {
      id: 'v3',
      headline: 'Better Than VidIQ: Scripts That Get 70%+ Retention',
      subheadline: 'Join 15,000+ creators who switched from VidIQ for better results.'
    }
  ],
  
  subscribrAI: [
    {
      id: 's1',
      headline: 'The Subscribr AI Alternative That Actually Understands Your Audience',
      subheadline: 'Go beyond basic templates with psychographic targeting and custom voice training.'
    },
    {
      id: 's2',
      headline: '30% More Features, 30% Less Cost Than Subscribr AI',
      subheadline: 'Advanced AI script generation with guaranteed 70%+ retention.'
    },
    {
      id: 's3',
      headline: 'Why Pay More for Less? Switch from Subscribr AI Today',
      subheadline: 'Better scripts, lower price, more features. See the difference.'
    }
  ],
  
  jasperAI: [
    {
      id: 'j1',
      headline: 'The Jasper AI Alternative That Actually Understands YouTube',
      subheadline: 'Jasper writes generic content. We create YouTube scripts that get 70%+ retention.'
    },
    {
      id: 'j2',
      headline: 'Built for YouTube, Not Blogs: The Jasper Alternative You Need',
      subheadline: 'Specialized script generation at half the price of Jasper.'
    },
    {
      id: 'j3',
      headline: 'Stop Using Blog Tools for YouTube: Switch from Jasper',
      subheadline: 'YouTube-specific features that Jasper can\'t match.'
    }
  ]
};

// CTA Button Variations
export const ctaVariations = {
  primary: [
    'Start Free Trial',
    'Try Free for 14 Days',
    'Get Started Free',
    'Start Creating Better Scripts',
    'Claim Your Free Trial'
  ],
  
  secondary: [
    'See Full Comparison',
    'Watch Demo',
    'View Results',
    'Compare Features',
    'See Success Stories'
  ],
  
  urgency: [
    'Get 50% Off Today',
    'Limited Time: 3 Months Free',
    'Claim Your Discount',
    'Switch & Save 50%',
    'Special Offer Expires Soon'
  ]
};

// Social Proof Data
export const socialProofData = {
  metrics: {
    totalUsers: 15000,
    averageRetention: 72,
    viewsGenerated: '2.5B',
    averageROI: 3.2,
    rating: 4.9,
    reviewCount: 2847
  },
  
  testimonials: {
    vidiq: [
      {
        name: 'Alex Chen',
        channel: '@TechExplained',
        subscribers: '450K',
        quote: 'Switched from VidIQ 3 months ago. My average view duration went from 35% to 72%.',
        rating: 5,
        verified: true
      }
    ],
    // Add more testimonials...
  }
};

// Migration Offers
export const migrationOffers = {
  vidiq: {
    discount: 50,
    duration: 3,
    features: [
      'Free migration assistance',
      'Import your templates',
      '1-on-1 onboarding',
      '30-day money-back guarantee'
    ]
  },
  
  subscribrAI: {
    discount: 50,
    duration: 3,
    features: [
      'Template import tool',
      'Voice profile setup',
      'Priority support',
      'Success manager'
    ]
  },
  
  jasperAI: {
    freeMonths: 3,
    features: [
      'Jasper template import',
      'YouTube growth consultation',
      'Personal onboarding',
      'No payment for 90 days'
    ]
  }
};

// SEO Meta Data
export const seoData = {
  vidiq: {
    title: 'VidIQ Alternative - Better YouTube Scripts with 70%+ Retention | Subscribr',
    description: 'Looking for a VidIQ alternative? Subscribr optimizes scripts for 70%+ viewer retention, not just SEO. See why 15,000+ creators switched. Try free for 14 days.',
    keywords: ['vidiq alternative', 'vidiq competitor', 'youtube script generator', 'retention optimization', 'youtube tools'],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Subscribr',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '19.00',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '2847'
      }
    }
  }
  // Add more SEO data for other competitors...
};

// Tracking Events
export const trackingEvents = {
  pageView: 'alternative_page_view',
  ctaClick: 'alternative_cta_click',
  comparisonView: 'comparison_table_view',
  testimonialView: 'testimonial_carousel_view',
  faqOpen: 'faq_question_opened',
  videoPlay: 'case_study_video_play',
  signupStart: 'trial_signup_started',
  signupComplete: 'trial_signup_completed'
};

// Export utility functions
export const getCompetitorData = (slug) => {
  return competitorData[slug] || null;
};

export const getHeadlineVariation = (competitor, variantId) => {
  const variations = headlineVariations[competitor];
  return variations?.find(v => v.id === variantId) || variations?.[0];
};

export const trackEvent = (eventName, data) => {
  // Implementation for tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, data);
  }
  
  // Also send to internal analytics
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventName, ...data })
  });
};