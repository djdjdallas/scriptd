/**
 * Compliance Rules Engine
 *
 * Core text analysis engine for YouTube compliance checking.
 * Analyzes scripts for repetitiveness, original insight markers,
 * AI patterns, and structure quality.
 */

import {
  CATEGORY_WEIGHTS,
  STATUS_THRESHOLDS,
  SEVERITY_LEVELS,
  AI_HEDGING_PHRASES,
  AI_TRANSITION_PHRASES,
  AI_FORMULAIC_PHRASES,
  FORMAL_PATTERNS,
  FIRST_PERSON_MARKERS,
  OPINION_MARKERS,
  ANECDOTE_MARKERS,
  SPECIFICITY_PATTERNS,
  HOOK_PATTERNS,
  CTA_PATTERNS,
  PATTERN_INTERRUPT_MARKERS,
  REPETITION_THRESHOLD,
  MIN_PHRASE_LENGTH,
  MAX_PHRASE_LENGTH,
  SENTENCE_SIMILARITY_THRESHOLD,
  MIN_VOCABULARY_DIVERSITY,
  WARNING_MESSAGES,
  SUGGESTIONS
} from './compliance-constants';

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Main compliance analysis function
 * @param {string} text - The script text to analyze
 * @returns {Object} Complete compliance analysis result
 */
export function analyzeCompliance(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return createEmptyResult();
  }

  const normalizedText = normalizeText(text);
  const sentences = extractSentences(normalizedText);
  const words = extractWords(normalizedText);

  // Run all category analyses
  const repetitiveness = analyzeRepetitiveness(normalizedText, sentences, words);
  const originalInsight = analyzeOriginalInsight(normalizedText, sentences);
  const aiPatterns = detectAIPatterns(normalizedText, sentences);
  const structure = analyzeStructure(normalizedText, sentences);

  // Calculate overall score
  const overallScore = calculateOverallScore({
    repetitiveness,
    originalInsight,
    aiPatterns,
    structure
  });

  // Determine status
  const badge = determineStatus(overallScore);

  // Aggregate warnings from all categories
  const warnings = [
    ...repetitiveness.warnings,
    ...originalInsight.warnings,
    ...aiPatterns.warnings,
    ...structure.warnings
  ].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return {
    overallScore: Math.round(overallScore),
    passed: overallScore >= STATUS_THRESHOLDS.needsReview,
    badge,
    categories: {
      repetitiveness: {
        score: repetitiveness.score,
        issues: repetitiveness.issues,
        suggestions: repetitiveness.suggestions
      },
      originalInsight: {
        score: originalInsight.score,
        issues: originalInsight.issues,
        suggestions: originalInsight.suggestions
      },
      aiPatterns: {
        score: aiPatterns.score,
        issues: aiPatterns.issues,
        suggestions: aiPatterns.suggestions
      },
      structure: {
        score: structure.score,
        issues: structure.issues,
        suggestions: structure.suggestions
      }
    },
    warnings,
    stats: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgSentenceLength: words.length / Math.max(sentences.length, 1),
      uniqueWords: new Set(words.map(w => w.toLowerCase())).size,
      vocabularyDiversity: calculateVocabularyDiversity(words)
    }
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Creates an empty result for invalid input
 */
function createEmptyResult() {
  return {
    overallScore: 0,
    passed: false,
    badge: 'high-risk',
    categories: {
      repetitiveness: { score: 0, issues: [], suggestions: [] },
      originalInsight: { score: 0, issues: [], suggestions: [] },
      aiPatterns: { score: 0, issues: [], suggestions: [] },
      structure: { score: 0, issues: [], suggestions: [] }
    },
    warnings: [],
    stats: {
      wordCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      uniqueWords: 0,
      vocabularyDiversity: 0
    }
  };
}

/**
 * Normalizes text for consistent analysis
 */
function normalizeText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts sentences from text
 */
function extractSentences(text) {
  // Split on sentence endings while preserving edge cases
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return sentences;
}

/**
 * Extracts words from text
 */
function extractWords(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

/**
 * Calculates vocabulary diversity (unique words / total words)
 */
function calculateVocabularyDiversity(words) {
  if (words.length === 0) return 0;
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  return uniqueWords.size / words.length;
}

/**
 * Calculates overall score from category scores
 */
function calculateOverallScore(categories) {
  return (
    categories.repetitiveness.score * CATEGORY_WEIGHTS.repetitiveness +
    categories.originalInsight.score * CATEGORY_WEIGHTS.originalInsight +
    categories.aiPatterns.score * CATEGORY_WEIGHTS.aiPatterns +
    categories.structure.score * CATEGORY_WEIGHTS.structure
  );
}

/**
 * Determines badge status from score
 */
function determineStatus(score) {
  if (score >= STATUS_THRESHOLDS.approved) return 'approved';
  if (score >= STATUS_THRESHOLDS.needsReview) return 'needs-review';
  return 'high-risk';
}

/**
 * Finds all occurrences of a pattern in text with positions
 */
function findPatternOccurrences(text, pattern) {
  const occurrences = [];
  const lowerText = text.toLowerCase();
  const lowerPattern = pattern.toLowerCase();
  let pos = 0;

  while ((pos = lowerText.indexOf(lowerPattern, pos)) !== -1) {
    occurrences.push({
      start: pos,
      end: pos + pattern.length,
      text: text.substring(pos, pos + pattern.length)
    });
    pos += 1;
  }

  return occurrences;
}

/**
 * Calculates Jaccard similarity between two strings
 */
function jaccardSimilarity(str1, str2) {
  const set1 = new Set(str1.toLowerCase().split(/\s+/));
  const set2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

// =============================================================================
// REPETITIVENESS ANALYSIS
// =============================================================================

/**
 * Analyzes text for repetitive content
 */
function analyzeRepetitiveness(text, sentences, words) {
  const issues = [];
  const warnings = [];
  let score = 100;

  // 1. Check vocabulary diversity
  const diversity = calculateVocabularyDiversity(words);
  if (diversity < MIN_VOCABULARY_DIVERSITY) {
    score -= 25;
    issues.push(WARNING_MESSAGES.repetitiveness.lowDiversity(diversity));
    warnings.push({
      severity: SEVERITY_LEVELS.warning,
      type: 'repetitiveness',
      message: WARNING_MESSAGES.repetitiveness.lowDiversity(diversity),
      suggestion: SUGGESTIONS.repetitiveness[0]
    });
  } else if (diversity < 0.4) {
    score -= 10;
  }

  // 2. Check for repeated phrases
  const repeatedPhrases = findRepeatedPhrases(text);
  repeatedPhrases.forEach(({ phrase, count, locations }) => {
    score -= Math.min(15, (count - 2) * 5);
    issues.push(WARNING_MESSAGES.repetitiveness.repeatedPhrase(phrase, count));
    warnings.push({
      severity: count >= 5 ? SEVERITY_LEVELS.critical : SEVERITY_LEVELS.warning,
      type: 'repetitiveness',
      message: WARNING_MESSAGES.repetitiveness.repeatedPhrase(phrase, count),
      suggestion: `Vary how you express "${phrase}"`,
      locations
    });
  });

  // 3. Check for similar sentences
  const similarPairs = findSimilarSentences(sentences);
  if (similarPairs.length > 0) {
    score -= Math.min(20, similarPairs.length * 5);
    issues.push(WARNING_MESSAGES.repetitiveness.similarSentences);
    warnings.push({
      severity: SEVERITY_LEVELS.warning,
      type: 'repetitiveness',
      message: WARNING_MESSAGES.repetitiveness.similarSentences,
      suggestion: SUGGESTIONS.repetitiveness[1]
    });
  }

  // 4. Check for template-like patterns
  if (hasTemplatePatterns(sentences)) {
    score -= 15;
    issues.push(WARNING_MESSAGES.repetitiveness.templateLike);
    warnings.push({
      severity: SEVERITY_LEVELS.info,
      type: 'repetitiveness',
      message: WARNING_MESSAGES.repetitiveness.templateLike,
      suggestion: SUGGESTIONS.repetitiveness[3]
    });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    warnings,
    suggestions: SUGGESTIONS.repetitiveness.slice(0, 2)
  };
}

/**
 * Finds repeated phrases in text
 */
function findRepeatedPhrases(text) {
  const phrases = {};
  const words = text.toLowerCase().split(/\s+/);

  // Generate n-grams of different lengths
  for (let len = MIN_PHRASE_LENGTH; len <= MAX_PHRASE_LENGTH; len++) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');

      // Skip phrases that are mostly stop words
      const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'in', 'on', 'for'];
      const meaningfulWords = phrase.split(' ').filter(w => !stopWords.includes(w));
      if (meaningfulWords.length < len / 2) continue;

      if (!phrases[phrase]) {
        phrases[phrase] = { count: 0, locations: [] };
      }
      phrases[phrase].count++;
      phrases[phrase].locations.push({
        start: text.toLowerCase().indexOf(phrase, phrases[phrase].locations.length > 0
          ? phrases[phrase].locations[phrases[phrase].locations.length - 1].start + 1
          : 0),
        end: 0 // Will be calculated
      });
    }
  }

  // Filter to only repeated phrases
  return Object.entries(phrases)
    .filter(([_, data]) => data.count >= REPETITION_THRESHOLD)
    .map(([phrase, data]) => ({
      phrase,
      count: data.count,
      locations: data.locations.map(loc => ({
        start: loc.start,
        end: loc.start + phrase.length
      }))
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 most repeated
}

/**
 * Finds pairs of similar sentences
 */
function findSimilarSentences(sentences) {
  const similarPairs = [];

  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      const similarity = jaccardSimilarity(sentences[i], sentences[j]);
      if (similarity >= SENTENCE_SIMILARITY_THRESHOLD) {
        similarPairs.push({
          sentence1: sentences[i],
          sentence2: sentences[j],
          similarity
        });
      }
    }
  }

  return similarPairs;
}

/**
 * Checks for template-like patterns in sentences
 */
function hasTemplatePatterns(sentences) {
  // Check if multiple sentences start the same way
  const starters = {};
  sentences.forEach(s => {
    const firstWords = s.split(/\s+/).slice(0, 3).join(' ').toLowerCase();
    starters[firstWords] = (starters[firstWords] || 0) + 1;
  });

  return Object.values(starters).some(count => count >= 3);
}

// =============================================================================
// ORIGINAL INSIGHT ANALYSIS
// =============================================================================

/**
 * Analyzes text for original insight markers
 */
function analyzeOriginalInsight(text, sentences) {
  const issues = [];
  const warnings = [];
  let score = 50; // Start at 50, add points for positive signals
  const lowerText = text.toLowerCase();

  // 1. Check for first-person perspective
  const firstPersonMatches = FIRST_PERSON_MARKERS.filter(marker =>
    lowerText.includes(marker.toLowerCase())
  );

  if (firstPersonMatches.length === 0) {
    score -= 20;
    issues.push(WARNING_MESSAGES.originalInsight.noFirstPerson);
    warnings.push({
      severity: SEVERITY_LEVELS.warning,
      type: 'originalInsight',
      message: WARNING_MESSAGES.originalInsight.noFirstPerson,
      suggestion: SUGGESTIONS.originalInsight[0]
    });
  } else {
    score += Math.min(25, firstPersonMatches.length * 5);
  }

  // 2. Check for opinion statements
  const opinionMatches = OPINION_MARKERS.filter(marker =>
    lowerText.includes(marker.toLowerCase())
  );

  if (opinionMatches.length === 0) {
    score -= 15;
    issues.push(WARNING_MESSAGES.originalInsight.noOpinions);
    warnings.push({
      severity: SEVERITY_LEVELS.info,
      type: 'originalInsight',
      message: WARNING_MESSAGES.originalInsight.noOpinions,
      suggestion: SUGGESTIONS.originalInsight[3]
    });
  } else {
    score += Math.min(15, opinionMatches.length * 5);
  }

  // 3. Check for personal anecdotes
  const anecdoteMatches = ANECDOTE_MARKERS.filter(marker =>
    lowerText.includes(marker.toLowerCase())
  );

  if (anecdoteMatches.length > 0) {
    score += Math.min(15, anecdoteMatches.length * 5);
  }

  // 4. Check for specific details (numbers, dates, data)
  const specificityMatches = SPECIFICITY_PATTERNS.filter(pattern =>
    pattern.test(text)
  );

  if (specificityMatches.length === 0) {
    score -= 10;
    issues.push(WARNING_MESSAGES.originalInsight.noSpecificDetails);
    warnings.push({
      severity: SEVERITY_LEVELS.info,
      type: 'originalInsight',
      message: WARNING_MESSAGES.originalInsight.noSpecificDetails,
      suggestion: SUGGESTIONS.originalInsight[2]
    });
  } else {
    score += Math.min(15, specificityMatches.length * 3);
  }

  // 5. Check for generic statements (negative signal)
  const genericPhrases = [
    'studies show', 'research shows', 'experts say', 'it is known',
    'many people', 'some people say', 'according to experts'
  ];

  const genericCount = genericPhrases.filter(p => lowerText.includes(p)).length;
  if (genericCount >= 3) {
    score -= 10;
    issues.push(WARNING_MESSAGES.originalInsight.generic);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    warnings,
    suggestions: SUGGESTIONS.originalInsight.slice(0, 2),
    markers: {
      firstPerson: firstPersonMatches.length,
      opinions: opinionMatches.length,
      anecdotes: anecdoteMatches.length,
      specifics: specificityMatches.length
    }
  };
}

// =============================================================================
// AI PATTERN DETECTION
// =============================================================================

/**
 * Detects AI-generated content patterns
 */
function detectAIPatterns(text, sentences) {
  const issues = [];
  const warnings = [];
  let score = 100; // Start at 100, deduct for AI patterns found
  const lowerText = text.toLowerCase();

  // 1. Check for hedging phrases
  const hedgingMatches = [];
  AI_HEDGING_PHRASES.forEach(phrase => {
    const occurrences = findPatternOccurrences(text, phrase);
    if (occurrences.length > 0) {
      hedgingMatches.push({ phrase, occurrences });
    }
  });

  if (hedgingMatches.length > 0) {
    score -= Math.min(25, hedgingMatches.length * 5);
    hedgingMatches.forEach(({ phrase, occurrences }) => {
      issues.push(WARNING_MESSAGES.aiPatterns.hedgingDetected(phrase));
      warnings.push({
        severity: SEVERITY_LEVELS.warning,
        type: 'aiPatterns',
        message: WARNING_MESSAGES.aiPatterns.hedgingDetected(phrase),
        suggestion: `Remove or rephrase "${phrase}"`,
        locations: occurrences
      });
    });
  }

  // 2. Check for formulaic phrases
  const formulaicMatches = [];
  AI_FORMULAIC_PHRASES.forEach(phrase => {
    const occurrences = findPatternOccurrences(text, phrase);
    if (occurrences.length > 0) {
      formulaicMatches.push({ phrase, occurrences });
    }
  });

  if (formulaicMatches.length > 0) {
    score -= Math.min(30, formulaicMatches.length * 6);
    formulaicMatches.forEach(({ phrase, occurrences }) => {
      issues.push(WARNING_MESSAGES.aiPatterns.formulaicPhrase(phrase));
      warnings.push({
        severity: SEVERITY_LEVELS.critical,
        type: 'aiPatterns',
        message: WARNING_MESSAGES.aiPatterns.formulaicPhrase(phrase),
        suggestion: 'Use more authentic, conversational language',
        locations: occurrences
      });
    });
  }

  // 3. Check for formal language patterns
  const formalMatches = [];
  FORMAL_PATTERNS.forEach(({ pattern, suggestion }) => {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      formalMatches.push({ formal: matches[0], casual: suggestion, count: matches.length });
    }
  });

  const totalFormal = formalMatches.reduce((sum, m) => sum + m.count, 0);
  if (totalFormal >= 3) {
    score -= Math.min(20, totalFormal * 2);
    formalMatches.slice(0, 3).forEach(({ formal, casual }) => {
      issues.push(WARNING_MESSAGES.aiPatterns.formalLanguage(formal, casual));
    });
    warnings.push({
      severity: SEVERITY_LEVELS.info,
      type: 'aiPatterns',
      message: `Found ${totalFormal} instances of formal language. Consider using contractions.`,
      suggestion: SUGGESTIONS.aiPatterns[0]
    });
  }

  // 4. Check for transition overuse
  const transitionMatches = AI_TRANSITION_PHRASES.filter(phrase =>
    lowerText.includes(phrase.toLowerCase())
  );

  if (transitionMatches.length >= 4) {
    score -= 15;
    issues.push(WARNING_MESSAGES.aiPatterns.transitionOveruse);
    warnings.push({
      severity: SEVERITY_LEVELS.info,
      type: 'aiPatterns',
      message: WARNING_MESSAGES.aiPatterns.transitionOveruse,
      suggestion: SUGGESTIONS.aiPatterns[2]
    });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    warnings,
    suggestions: SUGGESTIONS.aiPatterns.slice(0, 2),
    detected: {
      hedging: hedgingMatches.length,
      formulaic: formulaicMatches.length,
      formal: totalFormal,
      transitions: transitionMatches.length
    }
  };
}

// =============================================================================
// STRUCTURE ANALYSIS
// =============================================================================

/**
 * Analyzes script structure quality
 */
function analyzeStructure(text, sentences) {
  const issues = [];
  const warnings = [];
  let score = 100;

  // 1. Check hook quality (first 50 words or first 2 sentences)
  const hookText = sentences.slice(0, 2).join(' ');
  const hasStrongHook = HOOK_PATTERNS.some(pattern => pattern.test(hookText));

  if (!hasStrongHook) {
    score -= 20;
    issues.push(WARNING_MESSAGES.structure.weakHook);
    warnings.push({
      severity: SEVERITY_LEVELS.warning,
      type: 'structure',
      message: WARNING_MESSAGES.structure.weakHook,
      suggestion: SUGGESTIONS.structure[0]
    });
  }

  // 2. Check for CTA
  const hasCTA = CTA_PATTERNS.some(pattern => pattern.test(text));

  if (!hasCTA) {
    score -= 15;
    issues.push(WARNING_MESSAGES.structure.noCTA);
    warnings.push({
      severity: SEVERITY_LEVELS.info,
      type: 'structure',
      message: WARNING_MESSAGES.structure.noCTA,
      suggestion: SUGGESTIONS.structure[3]
    });
  }

  // 3. Check for pattern interrupts
  const patternInterruptCount = PATTERN_INTERRUPT_MARKERS.filter(marker =>
    text.toLowerCase().includes(marker.toLowerCase())
  ).length;

  if (patternInterruptCount === 0 && sentences.length > 10) {
    score -= 10;
    issues.push(WARNING_MESSAGES.structure.noPatternInterrupts);
    warnings.push({
      severity: SEVERITY_LEVELS.info,
      type: 'structure',
      message: WARNING_MESSAGES.structure.noPatternInterrupts,
      suggestion: SUGGESTIONS.structure[1]
    });
  }

  // 4. Check sentence length variety
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 3 && sentences.length > 5) {
    score -= 10;
    issues.push(WARNING_MESSAGES.structure.monotonousSentences);
    warnings.push({
      severity: SEVERITY_LEVELS.info,
      type: 'structure',
      message: WARNING_MESSAGES.structure.monotonousSentences,
      suggestion: SUGGESTIONS.structure[2]
    });
  }

  // 5. Check paragraph length (based on sentence groupings)
  const paragraphs = text.split(/\n\n+/);
  const longParagraphs = paragraphs.filter(p => p.split(/[.!?]+/).length > 5);

  if (longParagraphs.length > paragraphs.length / 2) {
    score -= 10;
    issues.push(WARNING_MESSAGES.structure.longParagraphs);
    warnings.push({
      severity: SEVERITY_LEVELS.info,
      type: 'structure',
      message: WARNING_MESSAGES.structure.longParagraphs,
      suggestion: SUGGESTIONS.structure[4]
    });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    warnings,
    suggestions: SUGGESTIONS.structure.slice(0, 2),
    metrics: {
      hasHook: hasStrongHook,
      hasCTA,
      patternInterrupts: patternInterruptCount,
      sentenceVariety: stdDev.toFixed(2),
      avgSentenceLength: avgLength.toFixed(1)
    }
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  analyzeRepetitiveness,
  analyzeOriginalInsight,
  detectAIPatterns,
  analyzeStructure,
  calculateVocabularyDiversity,
  findRepeatedPhrases,
  findSimilarSentences,
  jaccardSimilarity
};
