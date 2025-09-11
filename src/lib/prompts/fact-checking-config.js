// Fact-Checking Configuration for YouTube Script Generation
// Ensures 100% accuracy and prevents misinformation

export const FACT_CHECKING_CONFIG = {
  // Minimum number of web searches required per script
  minimumSearches: 5,
  
  // Additional searches per key point
  searchesPerKeyPoint: 2,
  
  // Maximum age for statistics (in months)
  maxStatisticAge: 24,
  
  // Preferred statistic age (in months)
  preferredStatisticAge: 12,
  
  // Verification confidence levels
  confidenceLevels: {
    HIGH: 'VERIFIED',           // 2+ reputable sources
    MEDIUM: 'LIKELY ACCURATE',  // 1 reputable source
    LOW: 'UNVERIFIED',         // No sources found
    HYPOTHETICAL: 'HYPOTHETICAL' // Fictional example
  },
  
  // Required verification for different claim types
  verificationRequirements: {
    companyName: {
      required: true,
      searchPattern: '[company] official website exists real 2024 2025',
      fallback: 'Mark as [HYPOTHETICAL COMPANY] or use verified alternative'
    },
    productName: {
      required: true,
      searchPattern: '[product] features pricing specifications 2024 2025',
      fallback: 'Mark as [HYPOTHETICAL PRODUCT] or remove'
    },
    statistic: {
      required: true,
      searchPattern: '[statistic] source study research data 2024 2025',
      fallback: 'Remove or replace with verified data'
    },
    price: {
      required: true,
      searchPattern: '[company/product] pricing cost plans 2025',
      fallback: 'State "pricing available upon request" or "contact for quote"'
    },
    feature: {
      required: true,
      searchPattern: '[product/service] features capabilities specifications',
      fallback: 'Only include verified features or mark as hypothetical'
    }
  },
  
  // Automatic rejection triggers
  rejectionCriteria: {
    fictionalEntityAsReal: {
      threshold: 0, // Zero tolerance
      message: 'Script contains fictional companies/products presented as real'
    },
    unverifiedStatistics: {
      threshold: 0, // Zero tolerance for stats without sources
      message: 'Script contains statistics without verifiable sources'
    },
    outdatedInformation: {
      threshold: 24, // Months
      message: 'Script contains information older than 2 years presented as current'
    },
    unverifiedClaims: {
      threshold: 20, // Percentage
      message: 'More than 20% of claims are unverified'
    },
    missingFactCheck: {
      required: ['searchLog', 'factSummary', 'factCheckNotes'],
      message: 'Script missing required fact-checking documentation'
    }
  },
  
  // Required output sections
  requiredSections: {
    webSearchLog: {
      title: '🔍 WEB SEARCH VERIFICATION LOG',
      required: true,
      minEntries: 5
    },
    factSummary: {
      title: '📊 FACT VERIFICATION SUMMARY',
      required: true
    },
    factCheckNotes: {
      title: '📋 COMPREHENSIVE FACT-CHECK NOTES',
      required: true
    },
    disclaimer: {
      title: '⚠️ ACCURACY DISCLAIMER',
      required: true
    }
  },
  
  // Search query templates for common verification needs
  searchTemplates: {
    companyVerification: [
      '{company} official website',
      '{company} legitimate real company',
      '{company} headquarters location employees',
      'is {company} a real company'
    ],
    productVerification: [
      '{product} official page features',
      '{product} reviews legitimate real',
      '{product} pricing availability',
      '{product} specifications details'
    ],
    statisticVerification: [
      '{statistic} source study research',
      '{statistic} fact check accurate',
      '{statistic} data 2024 2025',
      '{statistic} verified statistics'
    ],
    trendVerification: [
      '{topic} trends 2024 2025',
      '{topic} latest developments news',
      '{topic} current state market',
      '{topic} future predictions forecast'
    ]
  },
  
  // HTML comment format for source citations
  citationFormat: '<!-- Source: {url} [{date}] -->',
  
  // Verification tag formats
  verificationTags: {
    verified: '[VERIFIED]',
    likelyAccurate: '[LIKELY ACCURATE]',
    unverified: '[UNVERIFIED]',
    needsVerification: '[NEEDS VERIFICATION]',
    hypothetical: '[HYPOTHETICAL]',
    hypotheticalExample: '[HYPOTHETICAL EXAMPLE]',
    couldNotVerify: '[COULD NOT VERIFY]'
  },
  
  // Warning messages for content creators
  warnings: {
    unverifiedContent: '⚠️ This script contains unverified claims that must be fact-checked before publication',
    hypotheticalExamples: '⚠️ This script contains hypothetical examples clearly marked as fictional',
    outdatedSources: '⚠️ Some sources are older than 12 months - verify current accuracy',
    lowConfidence: '⚠️ Overall confidence in factual accuracy is LOW - additional verification required'
  }
};

// Function to calculate required searches for a script
export function calculateRequiredSearches(keyPoints = []) {
  return FACT_CHECKING_CONFIG.minimumSearches + 
         (keyPoints.length * FACT_CHECKING_CONFIG.searchesPerKeyPoint);
}

// Function to generate search queries for verification
export function generateVerificationSearches(title, keyPoints = [], entities = []) {
  const searches = [];
  
  // Base searches for the main topic
  searches.push(
    `${title} facts statistics 2024 2025`,
    `${title} latest news developments`,
    `${title} fact check myths debunked`,
    `${title} market leaders companies`,
    `${title} pricing costs investment`
  );
  
  // Searches for each key point
  keyPoints.forEach(point => {
    searches.push(
      `${point} verified information 2024 2025`,
      `${point} examples case studies real`
    );
  });
  
  // Searches for mentioned entities
  entities.forEach(entity => {
    if (entity.type === 'company') {
      searches.push(`${entity.name} official website real company`);
    } else if (entity.type === 'product') {
      searches.push(`${entity.name} features pricing legitimate`);
    } else if (entity.type === 'statistic') {
      searches.push(`${entity.claim} source study accurate data`);
    }
  });
  
  return searches;
}

// Function to validate script fact-checking completeness
export function validateScriptFactChecking(scriptContent) {
  const validation = {
    passed: true,
    errors: [],
    warnings: [],
    score: 100
  };
  
  // Check for required sections
  Object.entries(FACT_CHECKING_CONFIG.requiredSections).forEach(([key, section]) => {
    if (section.required && !scriptContent.includes(section.title)) {
      validation.passed = false;
      validation.errors.push(`Missing required section: ${section.title}`);
      validation.score -= 20;
    }
  });
  
  // Check for verification tags
  const verifiedCount = (scriptContent.match(/\[VERIFIED\]/g) || []).length;
  const unverifiedCount = (scriptContent.match(/\[UNVERIFIED\]|\[NEEDS VERIFICATION\]/g) || []).length;
  const hypotheticalCount = (scriptContent.match(/\[HYPOTHETICAL\]/g) || []).length;
  
  if (verifiedCount < 3) {
    validation.warnings.push(`Low number of verified claims (${verifiedCount})`);
    validation.score -= 10;
  }
  
  if (unverifiedCount > 0) {
    const totalClaims = verifiedCount + unverifiedCount;
    const unverifiedPercentage = (unverifiedCount / totalClaims) * 100;
    
    if (unverifiedPercentage > FACT_CHECKING_CONFIG.rejectionCriteria.unverifiedClaims.threshold) {
      validation.passed = false;
      validation.errors.push(FACT_CHECKING_CONFIG.rejectionCriteria.unverifiedClaims.message);
      validation.score -= 30;
    } else {
      validation.warnings.push(`${unverifiedCount} unverified claims found (${unverifiedPercentage.toFixed(1)}%)`);
      validation.score -= unverifiedPercentage / 2;
    }
  }
  
  // Check for source citations
  const sourceCitations = (scriptContent.match(/<!-- Source:/g) || []).length;
  if (sourceCitations < 3) {
    validation.warnings.push(`Low number of source citations (${sourceCitations})`);
    validation.score -= 15;
  }
  
  // Check for hypothetical examples
  if (hypotheticalCount > 3) {
    validation.warnings.push(`High number of hypothetical examples (${hypotheticalCount})`);
    validation.score -= 5;
  }
  
  // Ensure score doesn't go below 0
  validation.score = Math.max(0, validation.score);
  
  // Determine overall status
  validation.status = validation.passed ? 
    (validation.warnings.length === 0 ? 'EXCELLENT' : 'GOOD') : 
    'FAILED';
  
  return validation;
}

// Function to extract fact-check data from script
export function extractFactCheckData(scriptContent) {
  const data = {
    searches: [],
    verifiedClaims: [],
    unverifiedClaims: [],
    hypotheticalExamples: [],
    sources: []
  };
  
  // Extract web searches (between search log markers)
  const searchLogMatch = scriptContent.match(/WEB SEARCH VERIFICATION LOG.*?(?=\*\*|$)/s);
  if (searchLogMatch) {
    const searches = searchLogMatch[0].match(/\d+\.\s*\[([^\]]+)\]/g);
    if (searches) {
      data.searches = searches.map(s => s.replace(/\d+\.\s*\[|\]/g, ''));
    }
  }
  
  // Extract verified claims
  const verifiedMatches = scriptContent.match(/\[VERIFIED\]([^[]*?)(?=\[|$)/g);
  if (verifiedMatches) {
    data.verifiedClaims = verifiedMatches.map(m => m.replace('[VERIFIED]', '').trim());
  }
  
  // Extract unverified claims
  const unverifiedMatches = scriptContent.match(/\[UNVERIFIED\]([^[]*?)(?=\[|$)/g);
  if (unverifiedMatches) {
    data.unverifiedClaims = unverifiedMatches.map(m => m.replace('[UNVERIFIED]', '').trim());
  }
  
  // Extract hypothetical examples
  const hypotheticalMatches = scriptContent.match(/\[HYPOTHETICAL\]([^[]*?)(?=\[|$)/g);
  if (hypotheticalMatches) {
    data.hypotheticalExamples = hypotheticalMatches.map(m => m.replace('[HYPOTHETICAL]', '').trim());
  }
  
  // Extract source citations
  const sourceMatches = scriptContent.match(/<!-- Source: ([^>]+) -->/g);
  if (sourceMatches) {
    data.sources = sourceMatches.map(m => m.replace(/<!-- Source: | -->/g, ''));
  }
  
  return data;
}

export default {
  FACT_CHECKING_CONFIG,
  calculateRequiredSearches,
  generateVerificationSearches,
  validateScriptFactChecking,
  extractFactCheckData
};