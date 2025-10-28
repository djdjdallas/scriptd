/**
 * Deduplication Engine
 * Identifies and consolidates repetitive content in scripts
 */

/**
 * Main deduplication function
 * @param {string} scriptContent - The generated script text
 * @param {Object} options - Configuration options
 * @returns {Object} Deduplication analysis and suggestions
 */
export function analyzeRepetition(scriptContent, options = {}) {
  const config = {
    maxRepetitions: 2,
    minPhraseLength: 3,
    trackNumbers: true,
    trackNames: true,
    trackPhrases: true,
    ...options
  };

  console.log('🔍 Analyzing content repetition...');

  // Split into sections
  const sections = splitIntoSections(scriptContent);

  // Track different types of repetition
  const analysis = {
    numbers: config.trackNumbers ? findRepeatedNumbers(sections) : [],
    names: config.trackNames ? findRepeatedNames(sections) : [],
    phrases: config.trackPhrases ? findRepeatedPhrases(sections, config.minPhraseLength) : [],
    facts: findRepeatedFacts(sections),
    sections: sections.length
  };

  // Calculate metrics
  const metrics = calculateRepetitionMetrics(analysis);

  // Generate suggestions
  const suggestions = generateDeduplicationSuggestions(analysis, config.maxRepetitions);

  console.log('📊 Repetition analysis complete:', {
    totalRepetitions: metrics.totalRepetitions,
    uniqueItems: metrics.uniqueItems,
    worstOffenders: metrics.worstOffenders.slice(0, 3)
  });

  return {
    analysis,
    metrics,
    suggestions,
    report: generateRepetitionReport(analysis, metrics, suggestions)
  };
}

/**
 * Split script into logical sections
 * @param {string} scriptContent - Script text
 * @returns {Array} Array of section objects
 */
function splitIntoSections(scriptContent) {
  const sections = [];

  // Try to split by common section markers
  const sectionMarkers = [
    /^#{1,3}\s+/m,  // Markdown headers
    /^\[.*?\]/m,     // Visual markers
    /^\d+:\d+/m,     // Timestamps
    /^---+$/m        // Dividers
  ];

  let currentSection = '';
  let sectionIndex = 0;
  const lines = scriptContent.split('\n');

  for (const line of lines) {
    const isNewSection = sectionMarkers.some(marker => marker.test(line));

    if (isNewSection && currentSection.trim()) {
      sections.push({
        index: sectionIndex++,
        content: currentSection.trim(),
        title: line.replace(/^#+\s*/, '').replace(/^\[.*?\]\s*/, '').trim(),
        wordCount: currentSection.split(/\s+/).length
      });
      currentSection = line + '\n';
    } else {
      currentSection += line + '\n';
    }
  }

  // Add final section
  if (currentSection.trim()) {
    sections.push({
      index: sectionIndex,
      content: currentSection.trim(),
      title: `Section ${sectionIndex + 1}`,
      wordCount: currentSection.split(/\s+/).length
    });
  }

  return sections;
}

/**
 * Find repeated numbers across sections
 * @param {Array} sections - Array of section objects
 * @returns {Array} Array of repeated number objects
 */
function findRepeatedNumbers(sections) {
  const numberPattern = /\b(\$?[\d,]+\.?\d*\s*(?:million|billion|thousand|%|M|B|K)?)\b/gi;
  const numberOccurrences = new Map();

  sections.forEach((section, sectionIdx) => {
    const matches = section.content.match(numberPattern) || [];

    matches.forEach(match => {
      const normalized = normalizeNumber(match);
      if (!numberOccurrences.has(normalized)) {
        numberOccurrences.set(normalized, []);
      }

      numberOccurrences.get(normalized).push({
        section: sectionIdx,
        sectionTitle: section.title,
        context: extractContext(section.content, match),
        exact: match
      });
    });
  });

  // Filter to only repeated numbers
  return Array.from(numberOccurrences.entries())
    .filter(([_, occurrences]) => occurrences.length > 1)
    .map(([number, occurrences]) => ({
      value: number,
      count: occurrences.length,
      occurrences,
      type: 'number'
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Find repeated names (people, companies) across sections
 * @param {Array} sections - Array of section objects
 * @returns {Array} Array of repeated name objects
 */
function findRepeatedNames(sections) {
  // Pattern for proper nouns (capitalized words, potentially multi-word)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  const nameOccurrences = new Map();

  // Common words to exclude
  const excludeWords = new Set([
    'The', 'This', 'That', 'These', 'Those', 'When', 'Where', 'What', 'Why', 'How',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]);

  sections.forEach((section, sectionIdx) => {
    const matches = section.content.match(namePattern) || [];

    matches.forEach(match => {
      if (!excludeWords.has(match) && match.length > 3) {
        if (!nameOccurrences.has(match)) {
          nameOccurrences.set(match, []);
        }

        nameOccurrences.get(match).push({
          section: sectionIdx,
          sectionTitle: section.title,
          context: extractContext(section.content, match)
        });
      }
    });
  });

  return Array.from(nameOccurrences.entries())
    .filter(([_, occurrences]) => occurrences.length > 2) // Names need 3+ occurrences
    .map(([name, occurrences]) => ({
      value: name,
      count: occurrences.length,
      occurrences,
      type: 'name'
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Find repeated phrases across sections
 * @param {Array} sections - Array of section objects
 * @param {number} minLength - Minimum phrase length in words
 * @returns {Array} Array of repeated phrase objects
 */
function findRepeatedPhrases(sections, minLength = 3) {
  const phraseOccurrences = new Map();

  sections.forEach((section, sectionIdx) => {
    const words = section.content.toLowerCase().split(/\s+/);

    // Generate all possible phrases of minLength to minLength+2
    for (let length = minLength; length <= minLength + 2 && length <= words.length; length++) {
      for (let i = 0; i <= words.length - length; i++) {
        const phrase = words.slice(i, i + length).join(' ');

        // Skip phrases that are mostly common words
        if (!isSignificantPhrase(phrase)) continue;

        if (!phraseOccurrences.has(phrase)) {
          phraseOccurrences.set(phrase, []);
        }

        phraseOccurrences.get(phrase).push({
          section: sectionIdx,
          sectionTitle: section.title,
          position: i
        });
      }
    }
  });

  // Filter and deduplicate overlapping phrases
  const significantPhrases = Array.from(phraseOccurrences.entries())
    .filter(([_, occurrences]) => occurrences.length > 2)
    .map(([phrase, occurrences]) => ({
      value: phrase,
      count: occurrences.length,
      occurrences: consolidateOccurrences(occurrences),
      type: 'phrase'
    }))
    .sort((a, b) => b.count - a.count);

  // Remove subphrases that are part of longer phrases
  return removeSubphrases(significantPhrases);
}

/**
 * Find repeated facts (complete statements)
 * @param {Array} sections - Array of section objects
 * @returns {Array} Array of repeated fact objects
 */
function findRepeatedFacts(sections) {
  const factOccurrences = new Map();

  sections.forEach((section, sectionIdx) => {
    // Split into sentences
    const sentences = section.content.match(/[^.!?]+[.!?]+/g) || [];

    sentences.forEach(sentence => {
      const normalized = normalizeSentence(sentence);

      if (normalized.length < 20) return; // Skip very short sentences

      if (!factOccurrences.has(normalized)) {
        factOccurrences.set(normalized, []);
      }

      factOccurrences.get(normalized).push({
        section: sectionIdx,
        sectionTitle: section.title,
        original: sentence.trim()
      });
    });
  });

  return Array.from(factOccurrences.entries())
    .filter(([_, occurrences]) => occurrences.length > 1)
    .map(([fact, occurrences]) => ({
      value: occurrences[0].original,
      normalized: fact,
      count: occurrences.length,
      occurrences,
      type: 'fact'
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Helper: Normalize number representations
 */
function normalizeNumber(numberStr) {
  return numberStr
    .toLowerCase()
    .replace(/[$,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper: Extract context around a match
 */
function extractContext(text, match, contextLength = 50) {
  const index = text.indexOf(match);
  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + match.length + contextLength);

  return '...' + text.substring(start, end).replace(/\n/g, ' ') + '...';
}

/**
 * Helper: Check if phrase is significant
 */
function isSignificantPhrase(phrase) {
  const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were']);
  const words = phrase.split(' ');
  const significantWords = words.filter(w => !commonWords.has(w));

  return significantWords.length >= Math.ceil(words.length * 0.4);
}

/**
 * Helper: Consolidate nearby occurrences
 */
function consolidateOccurrences(occurrences) {
  const consolidated = [];
  let lastSection = -1;

  for (const occ of occurrences) {
    if (occ.section !== lastSection) {
      consolidated.push(occ);
      lastSection = occ.section;
    }
  }

  return consolidated;
}

/**
 * Helper: Remove subphrases
 */
function removeSubphrases(phrases) {
  const filtered = [];

  for (let i = 0; i < phrases.length; i++) {
    let isSubphrase = false;

    for (let j = 0; j < phrases.length; j++) {
      if (i !== j && phrases[j].value.includes(phrases[i].value) && phrases[j].value !== phrases[i].value) {
        isSubphrase = true;
        break;
      }
    }

    if (!isSubphrase) {
      filtered.push(phrases[i]);
    }
  }

  return filtered;
}

/**
 * Helper: Normalize sentence for comparison
 */
function normalizeSentence(sentence) {
  return sentence
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate repetition metrics
 */
function calculateRepetitionMetrics(analysis) {
  const allRepetitions = [
    ...analysis.numbers,
    ...analysis.names,
    ...analysis.phrases,
    ...analysis.facts
  ];

  const totalRepetitions = allRepetitions.reduce((sum, item) => sum + item.count, 0);
  const uniqueItems = allRepetitions.length;

  const worstOffenders = allRepetitions
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(item => ({
      value: item.value.substring(0, 50),
      count: item.count,
      type: item.type
    }));

  return {
    totalRepetitions,
    uniqueItems,
    worstOffenders,
    averageRepetition: uniqueItems > 0 ? (totalRepetitions / uniqueItems).toFixed(1) : 0,

    byType: {
      numbers: analysis.numbers.length,
      names: analysis.names.length,
      phrases: analysis.phrases.length,
      facts: analysis.facts.length
    }
  };
}

/**
 * Generate deduplication suggestions
 */
function generateDeduplicationSuggestions(analysis, maxRepetitions) {
  const suggestions = [];

  // Check numbers
  analysis.numbers.forEach(item => {
    if (item.count > maxRepetitions) {
      suggestions.push({
        type: 'number',
        value: item.value,
        count: item.count,
        suggestion: `The number "${item.value}" appears ${item.count} times. Consider mentioning it once prominently and using pronouns or variations elsewhere.`,
        sections: item.occurrences.map(o => o.sectionTitle),
        priority: item.count > 5 ? 'high' : 'medium'
      });
    }
  });

  // Check names
  analysis.names.forEach(item => {
    if (item.count > maxRepetitions + 2) { // Allow more repetition for names
      suggestions.push({
        type: 'name',
        value: item.value,
        count: item.count,
        suggestion: `"${item.value}" is mentioned ${item.count} times. After initial introduction, consider using pronouns (they/them) or shorter references.`,
        sections: item.occurrences.map(o => o.sectionTitle),
        priority: item.count > 8 ? 'high' : 'medium'
      });
    }
  });

  // Check phrases
  analysis.phrases.forEach(item => {
    if (item.count > maxRepetitions) {
      suggestions.push({
        type: 'phrase',
        value: item.value,
        count: item.count,
        suggestion: `The phrase "${item.value}" is repeated ${item.count} times. Vary your language or consolidate these mentions.`,
        sections: [...new Set(item.occurrences.map(o => o.sectionTitle))],
        priority: 'low'
      });
    }
  });

  // Check facts
  analysis.facts.forEach(item => {
    if (item.count > 1) {
      suggestions.push({
        type: 'fact',
        value: item.value.substring(0, 100) + '...',
        count: item.count,
        suggestion: `This fact appears ${item.count} times. State it once clearly and reference it later if needed.`,
        sections: item.occurrences.map(o => o.sectionTitle),
        priority: 'high'
      });
    }
  });

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate a human-readable report
 */
function generateRepetitionReport(analysis, metrics, suggestions) {
  let report = '# Content Repetition Analysis\n\n';

  report += '## Summary\n';
  report += `- **Total Repetitions:** ${metrics.totalRepetitions}\n`;
  report += `- **Unique Repeated Items:** ${metrics.uniqueItems}\n`;
  report += `- **Average Repetition:** ${metrics.averageRepetition} times per item\n\n`;

  report += '## Repetition by Type\n';
  report += `- **Numbers:** ${metrics.byType.numbers} repeated\n`;
  report += `- **Names:** ${metrics.byType.names} repeated\n`;
  report += `- **Phrases:** ${metrics.byType.phrases} repeated\n`;
  report += `- **Facts:** ${metrics.byType.facts} repeated\n\n`;

  if (metrics.worstOffenders.length > 0) {
    report += '## Most Repeated Content\n';
    metrics.worstOffenders.forEach((item, idx) => {
      report += `${idx + 1}. "${item.value}" - ${item.count} times (${item.type})\n`;
    });
    report += '\n';
  }

  if (suggestions.length > 0) {
    report += '## Recommendations\n';

    const highPriority = suggestions.filter(s => s.priority === 'high');
    if (highPriority.length > 0) {
      report += '### High Priority\n';
      highPriority.forEach(s => {
        report += `- ${s.suggestion}\n`;
      });
      report += '\n';
    }

    const mediumPriority = suggestions.filter(s => s.priority === 'medium');
    if (mediumPriority.length > 0) {
      report += '### Medium Priority\n';
      mediumPriority.forEach(s => {
        report += `- ${s.suggestion}\n`;
      });
    }
  }

  return report;
}

/**
 * Apply deduplication suggestions to script
 */
export function applyDeduplication(scriptContent, suggestions, options = {}) {
  const config = {
    autoReplace: false,
    consolidateFacts: true,
    usePronouns: true,
    ...options
  };

  let modifiedScript = scriptContent;
  let changeLog = [];

  console.log(`📝 Applying ${suggestions.length} deduplication suggestions...`);

  suggestions.forEach(suggestion => {
    if (suggestion.priority === 'high' || config.autoReplace) {
      const change = applySingleSuggestion(modifiedScript, suggestion, config);
      if (change.modified) {
        modifiedScript = change.content;
        changeLog.push(change.log);
      }
    }
  });

  console.log(`  ✓ Applied ${changeLog.length} deduplication changes`);

  return {
    content: modifiedScript,
    changeLog,
    improvementScore: calculateImprovementScore(scriptContent, modifiedScript)
  };
}

/**
 * Helper: Apply a single suggestion
 */
function applySingleSuggestion(content, suggestion, config) {
  // This is a simplified implementation
  // In production, you'd want more sophisticated replacement logic

  if (suggestion.type === 'fact' && config.consolidateFacts) {
    // Remove duplicate facts, keeping only the first occurrence
    const occurrences = content.split(suggestion.value);
    if (occurrences.length > 2) {
      const modified = occurrences[0] + suggestion.value + occurrences.slice(1).join('');
      return {
        modified: true,
        content: modified,
        log: `Removed ${occurrences.length - 2} duplicate occurrences of fact`
      };
    }
  }

  return { modified: false };
}

/**
 * Helper: Calculate improvement score
 */
function calculateImprovementScore(original, modified) {
  const originalWords = original.split(/\s+/).length;
  const modifiedWords = modified.split(/\s+/).length;
  const reduction = originalWords - modifiedWords;
  const percentReduction = (reduction / originalWords) * 100;

  return {
    wordsRemoved: reduction,
    percentReduction: percentReduction.toFixed(1),
    originalLength: originalWords,
    newLength: modifiedWords
  };
}

export default {
  analyzeRepetition,
  applyDeduplication
};