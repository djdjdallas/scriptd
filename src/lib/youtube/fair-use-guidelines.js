/**
 * Fair Use Guidelines for YouTube Video References
 *
 * This module provides educational information about fair use principles
 * and helps users understand how to properly reference YouTube videos
 * in their content while respecting copyright law.
 *
 * ⚠️ DISCLAIMER: This is educational information, not legal advice.
 * Consult a legal professional for specific copyright questions.
 */

/**
 * Fair Use Guidelines for Video References
 *
 * These guidelines help content creators understand the principles of fair use
 * when referencing YouTube videos in commentary, criticism, or educational content.
 */
export const FAIR_USE_GUIDELINES = {
  /**
   * Practices that typically support fair use claims
   */
  allowed: [
    {
      practice: 'Commentary',
      description: 'Discussing and analyzing video content with your own original commentary',
      example: 'Providing critique, analysis, or discussion about a video\'s arguments or presentation',
      requirement: 'Add substantial original commentary - don\'t just describe what happens'
    },
    {
      practice: 'Criticism',
      description: 'Critical analysis of video content, arguments, or production',
      example: 'Analyzing the strengths and weaknesses of arguments presented in a video',
      requirement: 'Focus on analytical critique rather than reproduction'
    },
    {
      practice: 'Educational Use',
      description: 'Using references for teaching, explanation, or educational purposes',
      example: 'Referencing a video to teach a concept or demonstrate a principle',
      requirement: 'Must be transformative and add educational value'
    },
    {
      practice: 'Minimal Use',
      description: 'Using only what is necessary to make your point',
      example: 'Referencing specific timestamps or chapters rather than entire videos',
      requirement: 'Use the smallest amount necessary for your purpose'
    },
    {
      practice: 'Attribution',
      description: 'Always credit the original creator with links to their content',
      example: 'Including video title, channel name, and direct link in your references',
      requirement: 'Always provide complete attribution - it\'s both ethical and required'
    }
  ],

  /**
   * Practices that typically do NOT qualify as fair use
   */
  notAllowed: [
    {
      practice: 'Reproduction',
      description: 'Copying or reproducing video content without transformation',
      example: 'Re-uploading someone else\'s video or large portions of it',
      why: 'No transformation or added value'
    },
    {
      practice: 'Re-uploading',
      description: 'Downloading and uploading videos to your own channel',
      example: 'Taking someone\'s tutorial and posting it as your own',
      why: 'Violates creator\'s exclusive right to distribute'
    },
    {
      practice: 'No Credit',
      description: 'Using content without attribution to the original creator',
      example: 'Discussing video content without mentioning source',
      why: 'Unethical and undermines fair use defense'
    },
    {
      practice: 'Market Harm',
      description: 'Using content in a way that harms the original creator\'s market',
      example: 'Creating competing content that replaces the original',
      why: 'One of the four factors courts consider in fair use'
    },
    {
      practice: 'Wholesale Copying',
      description: 'Using entire works or substantial portions without transformation',
      example: 'Embedding full videos without adding commentary',
      why: 'Amount used is a key fair use factor'
    }
  ],

  /**
   * Four factors courts consider when evaluating fair use
   */
  fourFactors: [
    {
      factor: 'Purpose and Character',
      description: 'Is the use transformative? Does it add new meaning or value?',
      favorable: 'Commentary, criticism, education, parody',
      unfavorable: 'Simple reproduction, commercial exploitation'
    },
    {
      factor: 'Nature of Original Work',
      description: 'What type of work is being used?',
      favorable: 'Factual, published works',
      unfavorable: 'Creative, unpublished works'
    },
    {
      factor: 'Amount Used',
      description: 'How much of the original work is used?',
      favorable: 'Small portions necessary for purpose',
      unfavorable: 'Large portions or entire work'
    },
    {
      factor: 'Effect on Market',
      description: 'Does the use harm the market for the original?',
      favorable: 'No market substitution or harm',
      unfavorable: 'Replaces original or harms creator\'s revenue'
    }
  ],

  /**
   * Best practices for video references
   */
  bestPractices: [
    'Always provide attribution with channel name, video title, and URL',
    'Use references to support your own original analysis or commentary',
    'Link to the original video so viewers can watch the full context',
    'Be transparent about your sources and give credit generously',
    'Consider reaching out to creators for permission when possible',
    'Use only what you need - reference specific moments, not entire videos',
    'Add substantial original content and perspective',
    'Respect takedown requests and resolve disputes professionally',
    'Keep records of your reasoning for referencing each video',
    'When in doubt, consult a legal professional'
  ]
};

/**
 * Attribution Templates
 *
 * Pre-formatted templates for properly attributing YouTube videos
 */
export const ATTRIBUTION_TEMPLATES = {
  /**
   * Minimal attribution (for inline references)
   */
  minimal: (video) => {
    return `"${video.title}" by ${video.channelTitle} (${video.url})`;
  },

  /**
   * Standard attribution (for reference lists)
   */
  standard: (video) => {
    const publishedYear = video.publishedAt ? new Date(video.publishedAt).getFullYear() : 'n.d.';
    return `${video.channelTitle}. "${video.title}." YouTube video, ${video.duration}. ${publishedYear}. ${video.url}`;
  },

  /**
   * Detailed attribution (for academic or formal use)
   */
  detailed: (video) => {
    const publishedDate = video.publishedAt
      ? new Date(video.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'n.d.';

    return `${video.channelTitle}. "${video.title}." YouTube video, ${video.duration}. Published ${publishedDate}. ${video.url}. ${video.license === 'Creative Commons' ? 'Licensed under Creative Commons.' : ''}`;
  },

  /**
   * Timestamp reference (for specific moments)
   */
  timestamp: (video, timestamp, description) => {
    return `${video.channelTitle}'s "${video.title}" at ${timestamp} (${description}) - ${video.url}&t=${timestamp}`;
  },

  /**
   * Commentary reference (for scripts with commentary)
   */
  commentary: (video, yourCommentary) => {
    return `In the video "${video.title}", ${video.channelTitle} discusses [topic]. ${yourCommentary} (Source: ${video.url})`;
  }
};

/**
 * Generate proper attribution for a video
 *
 * @param {Object} video - Video object with metadata
 * @param {string} style - Attribution style: 'minimal', 'standard', 'detailed', 'timestamp', 'commentary'
 * @param {Object} options - Additional options (timestamp, description, commentary)
 * @returns {string} - Formatted attribution string
 */
export function generateAttribution(video, style = 'standard', options = {}) {
  if (!video) {
    return 'Attribution information not available';
  }

  const template = ATTRIBUTION_TEMPLATES[style] || ATTRIBUTION_TEMPLATES.standard;

  try {
    if (style === 'timestamp') {
      return template(video, options.timestamp, options.description);
    } else if (style === 'commentary') {
      return template(video, options.commentary);
    } else {
      return template(video);
    }
  } catch (error) {
    console.error('Error generating attribution:', error);
    return ATTRIBUTION_TEMPLATES.minimal(video);
  }
}

/**
 * Assess fair use compliance for a planned video reference
 *
 * This provides a basic assessment to help users think through fair use factors.
 * NOT a legal determination - consult a lawyer for legal advice.
 *
 * @param {Object} usage - Planned usage details
 * @param {string} usage.purpose - Purpose: 'commentary', 'criticism', 'education', 'entertainment'
 * @param {boolean} usage.transformative - Will you add original commentary/analysis?
 * @param {string} usage.amount - Amount to use: 'minimal', 'moderate', 'substantial'
 * @param {boolean} usage.attribution - Will you provide attribution?
 * @param {boolean} usage.commercial - Is this for commercial purposes?
 * @param {boolean} usage.marketHarm - Could this harm the original creator's market?
 * @returns {{score: number, assessment: string, recommendations: Array}}
 */
export function assessFairUse(usage) {
  let score = 0;
  const recommendations = [];

  // Purpose and character (transformative use)
  if (['commentary', 'criticism', 'education'].includes(usage.purpose)) {
    score += 25;
  } else if (usage.purpose === 'entertainment') {
    score += 10;
    recommendations.push('Entertainment use is weaker for fair use - ensure it\'s highly transformative');
  } else {
    recommendations.push('Consider using the reference for commentary, criticism, or education');
  }

  // Transformative nature
  if (usage.transformative) {
    score += 25;
  } else {
    score += 5;
    recommendations.push('⚠️ Critical: Add substantial original commentary or analysis to make the use transformative');
  }

  // Amount used
  if (usage.amount === 'minimal') {
    score += 20;
  } else if (usage.amount === 'moderate') {
    score += 10;
    recommendations.push('Use only the minimum necessary to support your point');
  } else {
    score += 0;
    recommendations.push('⚠️ Using substantial portions weakens fair use - consider using less');
  }

  // Attribution
  if (usage.attribution) {
    score += 15;
  } else {
    score += 0;
    recommendations.push('⚠️ Always provide attribution - it\'s ethical and strengthens your fair use claim');
  }

  // Commercial nature
  if (!usage.commercial) {
    score += 10;
  } else {
    score += 5;
    recommendations.push('Commercial use receives less fair use protection - ensure highly transformative');
  }

  // Market harm
  if (!usage.marketHarm) {
    score += 15;
  } else {
    score += 0;
    recommendations.push('⚠️ If your use could harm the original creator\'s market, fair use is unlikely');
  }

  // Assessment
  let assessment = '';
  if (score >= 80) {
    assessment = 'Strong fair use case - Your planned use appears to align well with fair use principles.';
  } else if (score >= 60) {
    assessment = 'Moderate fair use case - Your use has some fair use support but could be strengthened.';
  } else if (score >= 40) {
    assessment = 'Weak fair use case - Your use may not qualify as fair use. Review recommendations carefully.';
  } else {
    assessment = 'Very weak fair use case - This use is unlikely to qualify as fair use. Consider a different approach.';
  }

  // Always add disclaimer
  recommendations.push('⚠️ This is not legal advice. Consult a lawyer for specific copyright questions.');

  return {
    score,
    assessment,
    recommendations,
    breakdown: {
      purpose: usage.purpose,
      transformative: usage.transformative,
      amount: usage.amount,
      attribution: usage.attribution,
      commercial: usage.commercial,
      marketHarm: usage.marketHarm
    }
  };
}

/**
 * Get Creative Commons license explanation
 */
export const CREATIVE_COMMONS_INFO = {
  description: 'Creative Commons licenses allow creators to grant specific usage rights to their work.',
  advantages: [
    'More permissive than standard copyright',
    'Clear usage terms specified by creator',
    'Still requires attribution in most cases',
    'Can be safer for certain uses'
  ],
  important: [
    'Always check the specific license terms (CC BY, CC BY-SA, etc.)',
    'Attribution is still required for most CC licenses',
    'Some CC licenses prohibit commercial use (NC)',
    'Some prohibit derivative works (ND)',
    'Read the license before using content'
  ],
  licenseTypes: [
    {
      name: 'CC BY',
      description: 'Attribution required - Most permissive',
      allows: 'Commercial use, modifications, distribution',
      requires: 'Credit to creator'
    },
    {
      name: 'CC BY-SA',
      description: 'Attribution + Share Alike',
      allows: 'Commercial use, modifications, distribution',
      requires: 'Credit to creator, same license for derivatives'
    },
    {
      name: 'CC BY-NC',
      description: 'Attribution + Non-Commercial',
      allows: 'Modifications, distribution for non-commercial use',
      requires: 'Credit to creator, non-commercial use only'
    },
    {
      name: 'CC BY-ND',
      description: 'Attribution + No Derivatives',
      allows: 'Distribution in original form',
      requires: 'Credit to creator, no modifications'
    }
  ]
};

/**
 * Export a comprehensive fair use guide for display in UI
 */
export function getFairUseGuide() {
  return {
    title: 'Fair Use Guidelines for Video References',
    disclaimer: '⚠️ This is educational information, not legal advice. Consult a lawyer for specific situations.',
    sections: [
      {
        title: 'What is Fair Use?',
        content: 'Fair use is a legal doctrine that allows limited use of copyrighted material without permission for purposes like commentary, criticism, education, and parody. It balances creators\' rights with the public\'s interest in accessing information.'
      },
      {
        title: 'The Four Factors',
        content: FAIR_USE_GUIDELINES.fourFactors
      },
      {
        title: 'Best Practices',
        content: FAIR_USE_GUIDELINES.bestPractices
      },
      {
        title: 'What You Can Do',
        content: FAIR_USE_GUIDELINES.allowed
      },
      {
        title: 'What to Avoid',
        content: FAIR_USE_GUIDELINES.notAllowed
      },
      {
        title: 'Creative Commons',
        content: CREATIVE_COMMONS_INFO
      }
    ]
  };
}

/**
 * Quick reference: Copyright warning for display in UI
 */
export const COPYRIGHT_WARNING = {
  short: '⚠️ Videos are for REFERENCE ONLY. Always provide attribution and follow fair use guidelines.',
  detailed: `⚠️ COPYRIGHT NOTICE: Videos found through this search are for reference purposes only. When referencing videos in your content:

✅ DO: Add original commentary, provide attribution, use minimal portions, link to original
❌ DON'T: Download, reproduce, re-upload, or use without credit

Fair use protects commentary, criticism, and educational use - but you must be transformative and give credit.`,
  bullets: [
    'Reference for commentary and analysis only',
    'Always provide attribution (channel, title, URL)',
    'Use only what you need to make your point',
    'Add substantial original commentary',
    'Link to the original video',
    'Respect takedown requests'
  ]
};
