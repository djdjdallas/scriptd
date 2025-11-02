/**
 * Pattern Analysis Utilities
 * Calculates real statistics from transcript patterns instead of AI-generated scores
 */

/**
 * Calculate confidence score based on pattern frequency and consistency
 */
export function calculatePatternConfidence(patterns, totalSamples) {
  if (!patterns || patterns.length === 0 || totalSamples === 0) {
    return {
      confidence: 0,
      frequency: 0,
      consistency: 0,
      sampleSize: 0
    };
  }

  // Count occurrences of each pattern
  const patternCounts = {};
  patterns.forEach(pattern => {
    patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
  });

  // Calculate frequency (how often patterns appear)
  const frequency = patterns.length / totalSamples;

  // Calculate consistency (how similar patterns are to each other)
  const uniquePatterns = Object.keys(patternCounts).length;
  const consistency = uniquePatterns === 0 ? 0 : 1 - (uniquePatterns - 1) / patterns.length;

  // Calculate variance for more accurate confidence
  const variance = calculatePatternVariance(patternCounts, patterns.length);

  // Weighted confidence score
  const confidence = (
    frequency * 0.3 +           // How often patterns appear
    consistency * 0.4 +          // How consistent patterns are
    (1 - variance) * 0.3         // How little variation exists
  );

  return {
    confidence: Math.round(confidence * 1000) / 1000,  // Round to 3 decimals
    frequency: Math.round(frequency * 1000) / 1000,
    consistency: Math.round(consistency * 1000) / 1000,
    variance: Math.round(variance * 1000) / 1000,
    sampleSize: totalSamples,
    uniquePatterns,
    totalOccurrences: patterns.length
  };
}

/**
 * Calculate variance of pattern distribution
 */
function calculatePatternVariance(patternCounts, total) {
  if (total === 0) return 1;

  const counts = Object.values(patternCounts);
  const mean = total / counts.length;

  const squaredDifferences = counts.map(count => Math.pow(count - mean, 2));
  const variance = squaredDifferences.reduce((a, b) => a + b, 0) / counts.length;

  // Normalize variance to 0-1 range
  const normalizedVariance = variance / (total * total);
  return Math.min(1, normalizedVariance);
}

/**
 * Extract patterns from transcript text
 */
export function extractPatterns(transcript, patternType) {
  const patterns = [];

  switch (patternType) {
    case 'openings':
      patterns.push(...extractOpeningPatterns(transcript));
      break;
    case 'transitions':
      patterns.push(...extractTransitionPatterns(transcript));
      break;
    case 'hooks':
      patterns.push(...extractHookPatterns(transcript));
      break;
    case 'closings':
      patterns.push(...extractClosingPatterns(transcript));
      break;
    case 'fillers':
      patterns.push(...extractFillerPatterns(transcript));
      break;
    default:
      break;
  }

  return patterns;
}

/**
 * Extract opening patterns from transcript
 */
function extractOpeningPatterns(transcript) {
  const patterns = [];
  const openingRegexes = [
    /^(hey|hi|hello|welcome|what's up)[^.!?]{0,50}/gi,
    /^(today|in this video|we're going to)[^.!?]{0,50}/gi,
    /^(let's|we'll|i'll|i'm going to)[^.!?]{0,50}/gi,
    /^(have you ever|did you know|imagine)[^.!?]{0,50}/gi,
    /^(according to|studies show|research indicates)[^.!?]{0,50}/gi
  ];

  const firstLines = transcript.split(/[.!?]/).slice(0, 3).join(' ');

  openingRegexes.forEach(regex => {
    const matches = firstLines.match(regex);
    if (matches) {
      patterns.push(...matches.map(m => m.toLowerCase().trim()));
    }
  });

  return patterns;
}

/**
 * Extract transition patterns from transcript
 */
function extractTransitionPatterns(transcript) {
  const patterns = [];
  const transitionRegexes = [
    /(but|however|although|though|yet)\s+[^.!?]{0,30}/gi,
    /(first|second|third|next|then|finally)\s+[^.!?]{0,30}/gi,
    /(meanwhile|moreover|furthermore|additionally)\s+[^.!?]{0,30}/gi,
    /(on the other hand|in contrast|similarly)\s+[^.!?]{0,30}/gi,
    /(let's|now let's|moving on|speaking of)\s+[^.!?]{0,30}/gi
  ];

  transitionRegexes.forEach(regex => {
    const matches = transcript.match(regex);
    if (matches) {
      patterns.push(...matches.slice(0, 10).map(m => m.toLowerCase().trim()));
    }
  });

  return patterns;
}

/**
 * Extract hook patterns from transcript
 */
function extractHookPatterns(transcript) {
  const patterns = [];
  const hookRegexes = [
    /\d+\s*(percent|million|billion|thousand)/gi,
    /(shocking|incredible|unbelievable|amazing|insane)/gi,
    /(secret|hidden|unknown|revealed|exposed)/gi,
    /(never|always|every|nobody|everyone)/gi,
    /\?[^.!?]{0,50}/g  // Questions
  ];

  const firstParagraph = transcript.split(/\n\n/)[0] || transcript.slice(0, 500);

  hookRegexes.forEach(regex => {
    const matches = firstParagraph.match(regex);
    if (matches) {
      patterns.push(...matches.slice(0, 5).map(m => m.toLowerCase().trim()));
    }
  });

  return patterns;
}

/**
 * Extract closing patterns from transcript
 */
function extractClosingPatterns(transcript) {
  const patterns = [];
  const closingRegexes = [
    /(thanks for|thank you for|appreciate)[^.!?]{0,50}/gi,
    /(subscribe|like|comment|share|notification)[^.!?]{0,50}/gi,
    /(see you|catch you|talk to you)[^.!?]{0,50}/gi,
    /(next time|next video|next week)[^.!?]{0,50}/gi,
    /(let me know|tell me|leave)[^.!?]{0,50}/gi
  ];

  const lastLines = transcript.split(/[.!?]/).slice(-5).join(' ');

  closingRegexes.forEach(regex => {
    const matches = lastLines.match(regex);
    if (matches) {
      patterns.push(...matches.map(m => m.toLowerCase().trim()));
    }
  });

  return patterns;
}

/**
 * Extract filler patterns from transcript
 */
function extractFillerPatterns(transcript) {
  const patterns = [];
  const fillerRegexes = [
    /\b(um|uh|er|ah|oh)\b/gi,
    /\b(like|you know|i mean|actually|basically|literally)\b/gi,
    /\b(sort of|kind of|pretty much|or something)\b/gi,
    /\b(right|okay|so|well|now)\b/gi
  ];

  fillerRegexes.forEach(regex => {
    const matches = transcript.match(regex);
    if (matches) {
      // Count frequency of each filler
      const fillerCounts = {};
      matches.forEach(match => {
        const filler = match.toLowerCase();
        fillerCounts[filler] = (fillerCounts[filler] || 0) + 1;
      });

      // Add high-frequency fillers as patterns
      Object.entries(fillerCounts).forEach(([filler, count]) => {
        if (count > 2) {  // Only track fillers used more than twice
          patterns.push(`${filler} (${count}x)`);
        }
      });
    }
  });

  return patterns;
}

/**
 * Calculate confidence scores for all pattern types
 */
export function calculateAllConfidenceScores(transcripts) {
  const patternTypes = ['openings', 'transitions', 'hooks', 'closings', 'fillers'];
  const scores = {};

  patternTypes.forEach(type => {
    const allPatterns = [];
    transcripts.forEach(transcript => {
      if (transcript && transcript.text) {
        allPatterns.push(...extractPatterns(transcript.text, type));
      }
    });

    scores[type] = calculatePatternConfidence(allPatterns, transcripts.length);
  });

  // Calculate overall confidence
  const validScores = Object.values(scores).filter(s => s.confidence > 0);
  const overallConfidence = validScores.length > 0
    ? validScores.reduce((sum, s) => sum + s.confidence, 0) / validScores.length
    : 0;

  return {
    ...scores,
    overall: {
      confidence: Math.round(overallConfidence * 1000) / 1000,
      basedOnVideos: transcripts.length,
      patternTypes: Object.keys(scores).filter(k => scores[k].confidence > 0).length
    }
  };
}

/**
 * Calculate linguistic consistency score
 */
export function calculateLinguisticConsistency(transcripts) {
  if (!transcripts || transcripts.length === 0) {
    return {
      consistency: 0,
      metrics: {}
    };
  }

  const metrics = {
    sentenceLengths: [],
    vocabularySizes: [],
    paragraphLengths: [],
    questionFrequencies: []
  };

  transcripts.forEach(transcript => {
    if (transcript && transcript.text) {
      const text = transcript.text;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/);
      const paragraphs = text.split(/\n\n+/);
      const questions = (text.match(/\?/g) || []).length;

      metrics.sentenceLengths.push(sentences.length > 0 ? words.length / sentences.length : 0);
      metrics.vocabularySizes.push(new Set(words.map(w => w.toLowerCase())).size);
      metrics.paragraphLengths.push(paragraphs.length > 0 ? words.length / paragraphs.length : 0);
      metrics.questionFrequencies.push(questions / sentences.length);
    }
  });

  // Calculate consistency for each metric
  const consistencyScores = {};
  Object.entries(metrics).forEach(([key, values]) => {
    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = mean === 0 ? 1 : stdDev / mean;

      // Lower coefficient of variation = higher consistency
      consistencyScores[key] = Math.max(0, 1 - Math.min(1, coefficientOfVariation));
    } else {
      consistencyScores[key] = 0;
    }
  });

  // Overall consistency
  const overallConsistency = Object.values(consistencyScores).reduce((a, b) => a + b, 0) / Object.values(consistencyScores).length;

  return {
    consistency: Math.round(overallConsistency * 1000) / 1000,
    metrics: consistencyScores,
    sampleSize: transcripts.length
  };
}

/**
 * Calculate data quality score for voice profile
 */
export function calculateDataQuality(profile) {
  const requiredFields = [
    'tone', 'style', 'pace', 'energy', 'personality',
    'hooks', 'transitions', 'engagement', 'vocabulary',
    'sentenceStructure', 'dos', 'donts', 'summary'
  ];

  const enhancedFields = [
    'linguisticFingerprints', 'narrativeStructure', 'emotionalDynamics',
    'contentPositioning', 'culturalReferences', 'technicalPatterns',
    'engagementTechniques', 'pacingDynamics'
  ];

  let populatedRequired = 0;
  let populatedEnhanced = 0;

  // Check required fields
  requiredFields.forEach(field => {
    const value = profile[field];
    if (value !== null && value !== undefined && value !== '' &&
        (!Array.isArray(value) || value.length > 0) &&
        (typeof value !== 'object' || Object.keys(value).length > 0)) {
      populatedRequired++;
    }
  });

  // Check enhanced fields
  enhancedFields.forEach(field => {
    const value = profile[field];
    if (value && typeof value === 'object' && Object.keys(value).length > 0) {
      // Check if the object has meaningful data
      const hasData = Object.values(value).some(v =>
        v !== null && v !== undefined && v !== '' &&
        (!Array.isArray(v) || v.length > 0) &&
        (typeof v !== 'object' || Object.keys(v).length > 0)
      );
      if (hasData) {
        populatedEnhanced++;
      }
    }
  });

  const requiredCompleteness = populatedRequired / requiredFields.length;
  const enhancedCompleteness = populatedEnhanced / enhancedFields.length;
  const overallCompleteness = (requiredCompleteness * 0.6 + enhancedCompleteness * 0.4);

  return {
    completeness: Math.round(overallCompleteness * 1000) / 1000,
    requiredFields: {
      populated: populatedRequired,
      total: requiredFields.length,
      percentage: Math.round(requiredCompleteness * 100)
    },
    enhancedFields: {
      populated: populatedEnhanced,
      total: enhancedFields.length,
      percentage: Math.round(enhancedCompleteness * 100)
    },
    hasRealData: profile.metadata?.basedOnRealData || false,
    lastUpdated: profile.metadata?.createdAt || new Date().toISOString()
  };
}