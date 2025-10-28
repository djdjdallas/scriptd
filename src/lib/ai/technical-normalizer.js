/**
 * Technical Consistency Normalizer
 * Maintains consistent technical complexity throughout scripts
 */

/**
 * Technical complexity levels
 */
const COMPLEXITY_LEVELS = {
  BEGINNER: {
    level: 1,
    description: 'No prior knowledge required',
    characteristics: [
      'Simple vocabulary',
      'Basic explanations',
      'Common analogies',
      'No jargon'
    ],
    indicators: ['simple', 'basic', 'easy', 'what is', 'how does'],
    vocabularyLevel: 5  // Grade level
  },

  INTERMEDIATE: {
    level: 2,
    description: 'General audience with some familiarity',
    characteristics: [
      'Some technical terms with explanation',
      'Moderate detail',
      'Industry concepts introduced',
      'Balanced complexity'
    ],
    indicators: ['process', 'system', 'method', 'technique', 'approach'],
    vocabularyLevel: 9
  },

  ADVANCED: {
    level: 3,
    description: 'Knowledgeable audience',
    characteristics: [
      'Technical terminology used freely',
      'Detailed explanations',
      'Industry-specific concepts',
      'Assumes background knowledge'
    ],
    indicators: ['algorithm', 'protocol', 'implementation', 'architecture', 'framework'],
    vocabularyLevel: 12
  },

  EXPERT: {
    level: 4,
    description: 'Professional/specialist audience',
    characteristics: [
      'Heavy technical jargon',
      'Deep technical details',
      'Academic/research level',
      'No simplification'
    ],
    indicators: ['paradigm', 'heuristic', 'entropy', 'asymptotic', 'orthogonal'],
    vocabularyLevel: 16
  }
};

/**
 * Common technical terms by complexity
 */
const TECHNICAL_VOCABULARY = {
  crypto: {
    BEGINNER: ['digital money', 'online wallet', 'password', 'code'],
    INTERMEDIATE: ['blockchain', 'cryptocurrency', 'mining', 'wallet address'],
    ADVANCED: ['hash function', 'consensus mechanism', 'smart contract', 'gas fees'],
    EXPERT: ['merkle tree', 'zero-knowledge proof', 'Byzantine fault tolerance', 'sharding']
  },

  general: {
    BEGINNER: ['computer', 'internet', 'website', 'app', 'data'],
    INTERMEDIATE: ['server', 'database', 'API', 'cloud', 'encryption'],
    ADVANCED: ['infrastructure', 'scalability', 'latency', 'throughput', 'microservices'],
    EXPERT: ['distributed systems', 'CAP theorem', 'eventual consistency', 'vector clocks']
  }
};

/**
 * Main technical consistency check
 * @param {string} scriptContent - The script to analyze
 * @param {Object} options - Configuration options
 * @returns {Object} Consistency analysis results
 */
export function analyzeTechnicalConsistency(scriptContent, options = {}) {
  const config = {
    targetLevel: 'INTERMEDIATE',
    allowedVariance: 1,  // Allow ±1 level variation
    domain: 'general',
    normalizeTerms: true,
    ...options
  };

  console.log('🔬 Analyzing technical consistency...');

  // Split into paragraphs for analysis
  const paragraphs = splitIntoParagraphs(scriptContent);

  // Analyze complexity of each paragraph
  const analysis = paragraphs.map((para, idx) => ({
    index: idx,
    content: para,
    complexity: analyzeParagraphComplexity(para, config.domain),
    terms: extractTechnicalTerms(para),
    readability: calculateReadability(para)
  }));

  // Calculate overall metrics
  const metrics = calculateConsistencyMetrics(analysis, config.targetLevel);

  // Identify problematic sections
  const issues = identifyConsistencyIssues(analysis, config);

  // Generate normalization suggestions
  const suggestions = generateNormalizationSuggestions(analysis, issues, config);

  console.log('📊 Technical consistency analysis complete:', {
    averageComplexity: metrics.averageLevel.toFixed(1),
    variance: metrics.variance.toFixed(2),
    consistencyScore: `${(metrics.consistencyScore * 100).toFixed(1)}%`
  });

  return {
    analysis,
    metrics,
    issues,
    suggestions,
    report: generateConsistencyReport(metrics, issues, suggestions)
  };
}

/**
 * Split script into paragraphs
 * @param {string} content - Script content
 * @returns {Array} Array of paragraphs
 */
function splitIntoParagraphs(content) {
  return content
    .split(/\n\n+/)
    .map(para => para.trim())
    .filter(para => para.length > 50); // Filter out short lines
}

/**
 * Analyze paragraph complexity
 * @param {string} paragraph - Paragraph text
 * @param {string} domain - Technical domain
 * @returns {Object} Complexity analysis
 */
function analyzeParagraphComplexity(paragraph, domain = 'general') {
  const words = paragraph.toLowerCase().split(/\s+/);
  const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim());

  // Calculate various complexity indicators
  const metrics = {
    avgWordLength: words.reduce((sum, w) => sum + w.length, 0) / words.length,
    avgSentenceLength: words.length / sentences.length,
    syllablesPerWord: estimateAverageSyllables(words),
    technicalTermCount: 0,
    complexityLevel: null
  };

  // Count technical terms by level
  const termCounts = {
    BEGINNER: 0,
    INTERMEDIATE: 0,
    ADVANCED: 0,
    EXPERT: 0
  };

  // Check domain-specific vocabulary
  const vocabulary = TECHNICAL_VOCABULARY[domain] || TECHNICAL_VOCABULARY.general;

  Object.entries(vocabulary).forEach(([level, terms]) => {
    terms.forEach(term => {
      if (paragraph.toLowerCase().includes(term.toLowerCase())) {
        termCounts[level]++;
        metrics.technicalTermCount++;
      }
    });
  });

  // Check general complexity indicators
  Object.entries(COMPLEXITY_LEVELS).forEach(([level, data]) => {
    data.indicators.forEach(indicator => {
      if (paragraph.toLowerCase().includes(indicator)) {
        termCounts[level]++;
      }
    });
  });

  // Determine overall complexity level
  let maxLevel = 'BEGINNER';
  let maxCount = termCounts.BEGINNER;

  Object.entries(termCounts).forEach(([level, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxLevel = level;
    }
  });

  // Adjust based on readability metrics
  if (metrics.avgSentenceLength > 25) {
    // Long sentences suggest higher complexity
    if (maxLevel === 'BEGINNER') maxLevel = 'INTERMEDIATE';
    if (maxLevel === 'INTERMEDIATE') maxLevel = 'ADVANCED';
  }

  if (metrics.avgWordLength > 6) {
    // Long words suggest higher complexity
    if (maxLevel === 'BEGINNER') maxLevel = 'INTERMEDIATE';
  }

  metrics.complexityLevel = maxLevel;
  metrics.levelScore = COMPLEXITY_LEVELS[maxLevel].level;
  metrics.termCounts = termCounts;

  return metrics;
}

/**
 * Extract technical terms from paragraph
 * @param {string} paragraph - Paragraph text
 * @returns {Array} Array of technical terms found
 */
function extractTechnicalTerms(paragraph) {
  const terms = [];

  // Common technical patterns
  const patterns = [
    /\b[A-Z]{2,}\b/g,  // Acronyms
    /\b\w+(?:chain|coin|ware|base|net|link)\b/gi,  // Compound tech terms
    /\b(?:crypto|cyber|digital|virtual|cloud|web)\w+\b/gi,  // Tech prefixes
  ];

  patterns.forEach(pattern => {
    const matches = paragraph.match(pattern) || [];
    terms.push(...matches);
  });

  // Check against known technical vocabulary
  const allTerms = Object.values(TECHNICAL_VOCABULARY)
    .flatMap(domain => Object.values(domain).flat());

  allTerms.forEach(term => {
    if (paragraph.toLowerCase().includes(term.toLowerCase())) {
      terms.push(term);
    }
  });

  return [...new Set(terms)]; // Remove duplicates
}

/**
 * Calculate readability score
 * @param {string} text - Text to analyze
 * @returns {Object} Readability metrics
 */
function calculateReadability(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  // Flesch Reading Ease
  const fleschScore = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);

  // Flesch-Kincaid Grade Level
  const gradeLevel = 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;

  return {
    fleschScore: Math.max(0, Math.min(100, fleschScore)),
    gradeLevel: Math.max(0, gradeLevel),
    difficulty: getReadingDifficulty(fleschScore)
  };
}

/**
 * Helper: Count syllables in a word
 */
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  let count = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = 'aeiou'.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }

  // Adjust for silent e
  if (word.endsWith('e') && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

/**
 * Helper: Estimate average syllables
 */
function estimateAverageSyllables(words) {
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  return totalSyllables / words.length;
}

/**
 * Helper: Get reading difficulty label
 */
function getReadingDifficulty(fleschScore) {
  if (fleschScore >= 90) return 'Very Easy';
  if (fleschScore >= 80) return 'Easy';
  if (fleschScore >= 70) return 'Fairly Easy';
  if (fleschScore >= 60) return 'Standard';
  if (fleschScore >= 50) return 'Fairly Difficult';
  if (fleschScore >= 30) return 'Difficult';
  return 'Very Difficult';
}

/**
 * Calculate consistency metrics
 */
function calculateConsistencyMetrics(analysis, targetLevel) {
  const levelScores = analysis.map(a => a.complexity.levelScore);
  const targetScore = COMPLEXITY_LEVELS[targetLevel].level;

  // Calculate average level
  const averageLevel = levelScores.reduce((sum, score) => sum + score, 0) / levelScores.length;

  // Calculate variance
  const variance = levelScores.reduce((sum, score) => {
    return sum + Math.pow(score - averageLevel, 2);
  }, 0) / levelScores.length;

  // Calculate consistency score (inverse of normalized variance)
  const maxPossibleVariance = 9; // Maximum possible variance (1 to 4 range)
  const consistencyScore = 1 - (variance / maxPossibleVariance);

  // Calculate distance from target
  const targetDistance = Math.abs(averageLevel - targetScore);

  return {
    averageLevel,
    variance,
    standardDeviation: Math.sqrt(variance),
    consistencyScore,
    targetLevel: targetScore,
    targetDistance,

    distribution: {
      beginner: levelScores.filter(s => s === 1).length,
      intermediate: levelScores.filter(s => s === 2).length,
      advanced: levelScores.filter(s => s === 3).length,
      expert: levelScores.filter(s => s === 4).length
    }
  };
}

/**
 * Identify consistency issues
 */
function identifyConsistencyIssues(analysis, config) {
  const issues = [];
  const targetScore = COMPLEXITY_LEVELS[config.targetLevel].level;

  analysis.forEach((para, idx) => {
    const levelScore = para.complexity.levelScore;
    const deviation = Math.abs(levelScore - targetScore);

    if (deviation > config.allowedVariance) {
      issues.push({
        paragraphIndex: idx,
        currentLevel: para.complexity.complexityLevel,
        targetLevel: config.targetLevel,
        deviation,
        type: levelScore > targetScore ? 'too_complex' : 'too_simple',
        excerpt: para.content.substring(0, 100) + '...'
      });
    }

    // Check for sudden jumps
    if (idx > 0) {
      const prevScore = analysis[idx - 1].complexity.levelScore;
      const jump = Math.abs(levelScore - prevScore);

      if (jump > 1) {
        issues.push({
          paragraphIndex: idx,
          type: 'sudden_jump',
          from: analysis[idx - 1].complexity.complexityLevel,
          to: para.complexity.complexityLevel,
          jump,
          excerpt: para.content.substring(0, 100) + '...'
        });
      }
    }
  });

  return issues;
}

/**
 * Generate normalization suggestions
 */
function generateNormalizationSuggestions(analysis, issues, config) {
  const suggestions = [];
  const targetLevel = config.targetLevel;

  issues.forEach(issue => {
    const para = analysis[issue.paragraphIndex];

    if (issue.type === 'too_complex') {
      suggestions.push({
        paragraphIndex: issue.paragraphIndex,
        type: 'simplify',
        priority: issue.deviation > 2 ? 'high' : 'medium',
        techniques: generateSimplificationTechniques(para, targetLevel),
        terms: identifyComplexTerms(para, targetLevel)
      });
    } else if (issue.type === 'too_simple') {
      suggestions.push({
        paragraphIndex: issue.paragraphIndex,
        type: 'enhance',
        priority: issue.deviation > 2 ? 'high' : 'medium',
        techniques: generateEnhancementTechniques(para, targetLevel),
        terms: suggestTechnicalTerms(para, targetLevel)
      });
    } else if (issue.type === 'sudden_jump') {
      suggestions.push({
        paragraphIndex: issue.paragraphIndex,
        type: 'smooth_transition',
        priority: 'high',
        techniques: ['Add transitional explanation', 'Graduate complexity change', 'Insert bridging paragraph'],
        from: issue.from,
        to: issue.to
      });
    }
  });

  return suggestions;
}

/**
 * Generate simplification techniques
 */
function generateSimplificationTechniques(para, targetLevel) {
  const techniques = [];

  if (para.complexity.avgSentenceLength > 20) {
    techniques.push('Break long sentences into shorter ones');
  }

  if (para.complexity.technicalTermCount > 5) {
    techniques.push('Reduce technical jargon');
    techniques.push('Add explanations for technical terms');
  }

  if (para.readability && para.readability.gradeLevel > 12) {
    techniques.push('Use simpler vocabulary');
    techniques.push('Add analogies or examples');
  }

  techniques.push('Replace complex terms with simpler alternatives');

  return techniques;
}

/**
 * Generate enhancement techniques
 */
function generateEnhancementTechniques(para, targetLevel) {
  const techniques = [];

  if (para.complexity.technicalTermCount < 2) {
    techniques.push('Introduce appropriate technical terminology');
  }

  if (para.complexity.avgSentenceLength < 10) {
    techniques.push('Combine short sentences for better flow');
  }

  techniques.push('Add specific technical details');
  techniques.push('Include industry-standard terminology');

  return techniques;
}

/**
 * Identify complex terms that need simplification
 */
function identifyComplexTerms(para, targetLevel) {
  const complexTerms = [];
  const targetComplexity = COMPLEXITY_LEVELS[targetLevel].level;

  // Check all technical terms against target level
  const terms = para.terms || [];

  terms.forEach(term => {
    // Check if term is above target complexity
    Object.entries(TECHNICAL_VOCABULARY).forEach(([domain, levels]) => {
      Object.entries(levels).forEach(([level, levelTerms]) => {
        if (levelTerms.includes(term) && COMPLEXITY_LEVELS[level].level > targetComplexity) {
          complexTerms.push({
            term,
            currentLevel: level,
            suggestion: findSimpler

Alternative(term, targetLevel, domain)
          });
        }
      });
    });
  });

  return complexTerms;
}

/**
 * Find simpler alternative for a term
 */
function findSimplerAlternative(term, targetLevel, domain) {
  const alternatives = {
    'consensus mechanism': 'agreement system',
    'blockchain': 'digital ledger',
    'cryptocurrency': 'digital currency',
    'smart contract': 'automated agreement',
    'hash function': 'encryption method',
    'distributed system': 'network of computers',
    'API': 'connection point',
    'scalability': 'ability to grow',
    'latency': 'delay',
    'throughput': 'processing speed'
  };

  return alternatives[term.toLowerCase()] || `simpler term for ${term}`;
}

/**
 * Suggest technical terms to add
 */
function suggestTechnicalTerms(para, targetLevel) {
  const suggestions = [];
  const vocabulary = TECHNICAL_VOCABULARY.general[targetLevel] || [];

  // Suggest a few relevant terms
  const relevantTerms = vocabulary.slice(0, 3);

  relevantTerms.forEach(term => {
    if (!para.content.toLowerCase().includes(term.toLowerCase())) {
      suggestions.push(term);
    }
  });

  return suggestions;
}

/**
 * Generate consistency report
 */
function generateConsistencyReport(metrics, issues, suggestions) {
  let report = '# Technical Consistency Report\n\n';

  report += '## Summary\n';
  report += `- **Average Complexity:** ${metrics.averageLevel.toFixed(1)}/4\n`;
  report += `- **Consistency Score:** ${(metrics.consistencyScore * 100).toFixed(1)}%\n`;
  report += `- **Standard Deviation:** ${metrics.standardDeviation.toFixed(2)}\n`;
  report += `- **Target Level:** ${metrics.targetLevel}/4\n`;
  report += `- **Distance from Target:** ${metrics.targetDistance.toFixed(1)}\n\n`;

  report += '## Complexity Distribution\n';
  report += `- **Beginner:** ${metrics.distribution.beginner} paragraphs\n`;
  report += `- **Intermediate:** ${metrics.distribution.intermediate} paragraphs\n`;
  report += `- **Advanced:** ${metrics.distribution.advanced} paragraphs\n`;
  report += `- **Expert:** ${metrics.distribution.expert} paragraphs\n\n`;

  if (issues.length > 0) {
    report += '## Identified Issues\n';

    const complexIssues = issues.filter(i => i.type === 'too_complex');
    const simpleIssues = issues.filter(i => i.type === 'too_simple');
    const jumpIssues = issues.filter(i => i.type === 'sudden_jump');

    if (complexIssues.length > 0) {
      report += `### Too Complex (${complexIssues.length} paragraphs)\n`;
      complexIssues.forEach(issue => {
        report += `- Paragraph ${issue.paragraphIndex + 1}: ${issue.currentLevel} → ${issue.targetLevel}\n`;
      });
      report += '\n';
    }

    if (simpleIssues.length > 0) {
      report += `### Too Simple (${simpleIssues.length} paragraphs)\n`;
      simpleIssues.forEach(issue => {
        report += `- Paragraph ${issue.paragraphIndex + 1}: ${issue.currentLevel} → ${issue.targetLevel}\n`;
      });
      report += '\n';
    }

    if (jumpIssues.length > 0) {
      report += `### Sudden Jumps (${jumpIssues.length} occurrences)\n`;
      jumpIssues.forEach(issue => {
        report += `- Between paragraphs ${issue.paragraphIndex} and ${issue.paragraphIndex + 1}: ${issue.from} → ${issue.to}\n`;
      });
      report += '\n';
    }
  }

  if (suggestions.length > 0) {
    report += '## Normalization Suggestions\n';

    const highPriority = suggestions.filter(s => s.priority === 'high');
    const mediumPriority = suggestions.filter(s => s.priority === 'medium');

    if (highPriority.length > 0) {
      report += '### High Priority\n';
      highPriority.forEach(s => {
        report += `- Paragraph ${s.paragraphIndex + 1}: ${s.type}\n`;
        s.techniques.forEach(t => {
          report += `  - ${t}\n`;
        });
      });
      report += '\n';
    }

    if (mediumPriority.length > 0) {
      report += '### Medium Priority\n';
      mediumPriority.forEach(s => {
        report += `- Paragraph ${s.paragraphIndex + 1}: ${s.type}\n`;
      });
    }
  }

  return report;
}

/**
 * Apply normalization to script
 */
export function applyNormalization(scriptContent, suggestions, options = {}) {
  // Note: This would require AI to rewrite content at appropriate complexity
  // For now, we just mark where changes are needed

  let normalized = scriptContent;
  const markers = [];

  suggestions.forEach(suggestion => {
    if (suggestion.priority === 'high') {
      const marker = `[NORMALIZE: ${suggestion.type} - ${suggestion.techniques[0]}]`;
      markers.push({
        paragraphIndex: suggestion.paragraphIndex,
        marker,
        type: suggestion.type
      });
    }
  });

  console.log(`📝 Marked ${markers.length} sections for normalization`);

  return {
    content: normalized,
    markers,
    requiresRewrite: markers.length > 0
  };
}

export default {
  analyzeTechnicalConsistency,
  applyNormalization,
  COMPLEXITY_LEVELS,
  TECHNICAL_VOCABULARY
};