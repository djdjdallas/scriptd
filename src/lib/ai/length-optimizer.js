/**
 * Script Length Optimizer
 * Ensures scripts fit target duration without losing key content
 */

/**
 * Speaking rates for different styles
 */
const SPEAKING_RATES = {
  slow: 120,        // Words per minute (thoughtful, dramatic)
  normal: 150,      // Standard narration pace
  fast: 180,        // Quick, energetic delivery
  veryFast: 200     // Rapid-fire information
};

/**
 * Content priority levels
 */
const CONTENT_PRIORITY = {
  CRITICAL: 1.0,    // Must keep: Key facts, main narrative
  HIGH: 0.8,        // Should keep: Supporting evidence, important details
  MEDIUM: 0.5,      // Nice to have: Additional context, examples
  LOW: 0.2          // Can cut: Repetitive content, tangents
};

/**
 * Main length optimization function
 * @param {string} scriptContent - The generated script
 * @param {number} targetMinutes - Target duration in minutes
 * @param {Object} options - Configuration options
 * @returns {Object} Optimization results
 */
export function optimizeScriptLength(scriptContent, targetMinutes = 30, options = {}) {
  const config = {
    speakingRate: 'normal',
    allowedVariance: 0.1,  // Allow +/-10% of target
    preserveStructure: true,
    prioritizeContent: true,
    ...options
  };

  // Calculate current length
  const currentMetrics = calculateDuration(scriptContent, config.speakingRate);
  const targetWords = targetMinutes * SPEAKING_RATES[config.speakingRate];

  // Check if optimization is needed
  const variance = Math.abs(currentMetrics.wordCount - targetWords) / targetWords;

  if (variance <= config.allowedVariance) {
    return {
      optimized: false,
      content: scriptContent,
      metrics: currentMetrics,
      finalMetrics: currentMetrics,
      suggestions: []
    };
  }

  // Determine optimization strategy
  const strategy = currentMetrics.wordCount > targetWords ? 'trim' : 'expand';

  // Analyze content structure
  const sections = analyzeSections(scriptContent);
  const contentAnalysis = analyzeContentPriority(sections);

  // Generate optimization suggestions
  const suggestions = generateOptimizationSuggestions(
    sections,
    contentAnalysis,
    currentMetrics,
    targetWords,
    strategy
  );

  // Apply optimizations if requested
  let optimizedContent = scriptContent;
  if (config.autoOptimize) {
    optimizedContent = applyOptimizations(scriptContent, suggestions, config);
  }

  const finalMetrics = calculateDuration(optimizedContent, config.speakingRate);

  return {
    optimized: true,
    content: optimizedContent,
    originalMetrics: currentMetrics,
    finalMetrics,
    suggestions,
    report: generateOptimizationReport(currentMetrics, finalMetrics, suggestions, targetMinutes)
  };
}

/**
 * Calculate script duration
 * @param {string} text - Script text
 * @param {string} rate - Speaking rate
 * @returns {Object} Duration metrics
 */
export function calculateDuration(text, rate = 'normal') {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const wordsPerMinute = SPEAKING_RATES[rate] || SPEAKING_RATES.normal;
  const minutes = wordCount / wordsPerMinute;

  // Account for pauses at visual markers
  const visualMarkers = (text.match(/\[.*?\]/g) || []).length;
  const pauseTime = visualMarkers * 2; // 2 seconds per visual

  const totalSeconds = (minutes * 60) + pauseTime;
  const adjustedMinutes = totalSeconds / 60;

  return {
    wordCount,
    characterCount: text.length,
    minutes: adjustedMinutes,
    seconds: Math.round(totalSeconds),
    wordsPerMinute,
    visualPauses: visualMarkers,

    // Breakdown by component
    breakdown: {
      narrationTime: minutes,
      pauseTime: pauseTime / 60,
      totalTime: adjustedMinutes
    }
  };
}

/**
 * Analyze script sections
 * @param {string} scriptContent - Script text
 * @returns {Array} Array of section objects
 */
function analyzeSections(scriptContent) {
  const sections = [];
  const sectionBreaks = /(?:^|\n)(#{1,3}\s+[^\n]+|^\[.*?\]|\d+:\d+)/gm;

  let lastIndex = 0;
  let match;
  let sectionIndex = 0;

  while ((match = sectionBreaks.exec(scriptContent)) !== null) {
    if (lastIndex > 0) {
      const content = scriptContent.substring(lastIndex, match.index).trim();
      if (content) {
        sections.push({
          index: sectionIndex++,
          title: scriptContent.substring(lastIndex, lastIndex + 50).split('\n')[0],
          content,
          wordCount: content.split(/\s+/).length,
          position: lastIndex,
          length: content.length
        });
      }
    }
    lastIndex = match.index;
  }

  // Add final section
  const finalContent = scriptContent.substring(lastIndex).trim();
  if (finalContent) {
    sections.push({
      index: sectionIndex,
      title: 'Final Section',
      content: finalContent,
      wordCount: finalContent.split(/\s+/).length,
      position: lastIndex,
      length: finalContent.length
    });
  }

  return sections;
}

/**
 * Analyze content priority
 * @param {Array} sections - Section objects
 * @returns {Object} Priority analysis
 */
function analyzeContentPriority(sections) {
  const analysis = sections.map((section, idx) => {
    const priority = calculateSectionPriority(section, idx, sections.length);
    const cuttableContent = identifyCuttableContent(section);
    const expandableAreas = identifyExpandableAreas(section);

    return {
      sectionIndex: section.index,
      priority,
      wordCount: section.wordCount,
      cuttableWords: cuttableContent.words,
      expandableWords: expandableAreas.potential,
      suggestions: {
        cuts: cuttableContent.suggestions,
        expansions: expandableAreas.suggestions
      }
    };
  });

  return analysis;
}

/**
 * Calculate section priority
 * @param {Object} section - Section object
 * @param {number} index - Section index
 * @param {number} total - Total sections
 * @returns {number} Priority score
 */
function calculateSectionPriority(section, index, total) {
  let priority = CONTENT_PRIORITY.MEDIUM;

  // Introduction and conclusion are critical
  if (index === 0 || index === total - 1) {
    priority = CONTENT_PRIORITY.CRITICAL;
  }

  // Sections with key information markers
  const keyMarkers = ['important', 'critical', 'key', 'main', 'essential', 'breaking'];
  if (keyMarkers.some(marker => section.content.toLowerCase().includes(marker))) {
    priority = Math.max(priority, CONTENT_PRIORITY.HIGH);
  }

  // Sections with statistics and evidence
  const hasStatistics = /\d+%|\$[\d,]+|million|billion/.test(section.content);
  if (hasStatistics) {
    priority = Math.max(priority, CONTENT_PRIORITY.HIGH);
  }

  // Short sections are often transitions (lower priority)
  if (section.wordCount < 50) {
    priority = Math.min(priority, CONTENT_PRIORITY.MEDIUM);
  }

  return priority;
}

/**
 * Identify cuttable content in a section
 * @param {Object} section - Section object
 * @returns {Object} Cuttable content analysis
 */
function identifyCuttableContent(section) {
  const suggestions = [];
  let cuttableWords = 0;

  // Identify redundant phrases
  const redundantPhrases = [
    /it('s| is) (important|worth noting|interesting) (to note |that )/gi,
    /as we (mentioned|discussed|saw) (earlier|before|previously)/gi,
    /in other words,? /gi,
    /basically,? |essentially,? |fundamentally,? /gi,
    /the fact (of the matter |)is /gi,
    /at the end of the day,? /gi
  ];

  redundantPhrases.forEach(pattern => {
    const matches = section.content.match(pattern) || [];
    if (matches.length > 0) {
      cuttableWords += matches.join(' ').split(/\s+/).length;
      suggestions.push({
        type: 'redundant_phrase',
        examples: matches.slice(0, 2),
        words: matches.join(' ').split(/\s+/).length
      });
    }
  });

  // Identify excessive examples
  const examplePattern = /(?:for (?:example|instance)|such as|like|including)[^.!?]+[.!?]/gi;
  const examples = section.content.match(examplePattern) || [];
  if (examples.length > 2) {
    const excessExamples = examples.slice(2);
    cuttableWords += excessExamples.join(' ').split(/\s+/).length;
    suggestions.push({
      type: 'excess_examples',
      count: excessExamples.length,
      words: excessExamples.join(' ').split(/\s+/).length
    });
  }

  // Identify verbose constructions
  const verbosePatterns = [
    { pattern: /due to the fact that/gi, replacement: 'because' },
    { pattern: /in order to/gi, replacement: 'to' },
    { pattern: /at this point in time/gi, replacement: 'now' },
    { pattern: /in the event that/gi, replacement: 'if' },
    { pattern: /for the purpose of/gi, replacement: 'to' }
  ];

  verbosePatterns.forEach(({ pattern, replacement }) => {
    const matches = section.content.match(pattern) || [];
    if (matches.length > 0) {
      const savedWords = matches.length * (matches[0].split(/\s+/).length - replacement.split(/\s+/).length);
      cuttableWords += savedWords;
      suggestions.push({
        type: 'verbose_construction',
        original: matches[0],
        replacement,
        words: savedWords
      });
    }
  });

  return { words: cuttableWords, suggestions };
}

/**
 * Identify expandable areas in a section
 * @param {Object} section - Section object
 * @returns {Object} Expansion opportunities
 */
function identifyExpandableAreas(section) {
  const suggestions = [];
  let potential = 0;

  // Check for unexplained statistics
  const statistics = section.content.match(/\d+%|\$[\d,]+|[\d,]+ (?:million|billion)/g) || [];
  const unexplained = statistics.filter(stat => {
    const context = section.content.substring(
      Math.max(0, section.content.indexOf(stat) - 100),
      Math.min(section.content.length, section.content.indexOf(stat) + 100)
    );
    return !context.includes('because') && !context.includes('due to') && !context.includes('result');
  });

  if (unexplained.length > 0) {
    potential += unexplained.length * 20; // ~20 words to explain each
    suggestions.push({
      type: 'unexplained_statistics',
      items: unexplained,
      potentialWords: unexplained.length * 20
    });
  }

  // Check for missing transitions
  const sentences = section.content.split(/[.!?]+/);
  const abruptTransitions = sentences.filter((sentence, idx) => {
    if (idx === 0) return false;
    const hasTransition = /^(however|therefore|moreover|furthermore|additionally|consequently)/i.test(sentence.trim());
    return !hasTransition && sentence.trim().length > 20;
  });

  if (abruptTransitions.length > 2) {
    potential += abruptTransitions.length * 5; // ~5 words per transition
    suggestions.push({
      type: 'missing_transitions',
      count: abruptTransitions.length,
      potentialWords: abruptTransitions.length * 5
    });
  }

  // Check for incomplete descriptions
  const briefDescriptions = section.content.match(/[A-Z][^.!?]{10,30}[.!?]/g) || [];
  const tooBrief = briefDescriptions.filter(desc => {
    return !desc.includes(',') && !desc.includes('and') && !desc.includes('but');
  });

  if (tooBrief.length > 0) {
    potential += tooBrief.length * 15; // ~15 words to expand each
    suggestions.push({
      type: 'brief_descriptions',
      count: tooBrief.length,
      potentialWords: tooBrief.length * 15
    });
  }

  return { potential, suggestions };
}

/**
 * Generate optimization suggestions
 */
function generateOptimizationSuggestions(sections, analysis, currentMetrics, targetWords, strategy) {
  const suggestions = [];
  const wordDiff = Math.abs(currentMetrics.wordCount - targetWords);

  if (strategy === 'trim') {
    // Need to cut content
    // Sort sections by priority (lowest first for cutting)
    const cuttableSections = analysis
      .filter(a => a.priority < CONTENT_PRIORITY.CRITICAL)
      .sort((a, b) => a.priority - b.priority);

    let wordsToCut = wordDiff;

    // First pass: Remove low-priority content
    cuttableSections.forEach(section => {
      if (wordsToCut <= 0) return;

      section.suggestions.cuts.forEach(cut => {
        if (wordsToCut <= 0) return;

        suggestions.push({
          type: 'cut',
          sectionIndex: section.sectionIndex,
          target: cut.type,
          words: Math.min(cut.words, wordsToCut),
          priority: section.priority < CONTENT_PRIORITY.MEDIUM ? 'high' : 'medium',
          description: generateCutDescription(cut)
        });

        wordsToCut -= cut.words;
      });
    });

    // Second pass: Trim verbose sections
    if (wordsToCut > 0) {
      sections
        .filter(s => s.wordCount > 200)
        .forEach(section => {
          const trimAmount = Math.min(section.wordCount * 0.2, wordsToCut);
          if (trimAmount > 10) {
            suggestions.push({
              type: 'trim',
              sectionIndex: section.index,
              target: 'general_verbosity',
              words: trimAmount,
              priority: 'low',
              description: `Trim verbose content in section ${section.index + 1}`
            });
            wordsToCut -= trimAmount;
          }
        });
    }
  } else {
    // Need to expand content
    const expandableSections = analysis
      .filter(a => a.expandableWords > 0)
      .sort((a, b) => b.priority - a.priority);

    let wordsToAdd = wordDiff;

    expandableSections.forEach(section => {
      if (wordsToAdd <= 0) return;

      section.suggestions.expansions.forEach(expansion => {
        if (wordsToAdd <= 0) return;

        suggestions.push({
          type: 'expand',
          sectionIndex: section.sectionIndex,
          target: expansion.type,
          words: Math.min(expansion.potentialWords, wordsToAdd),
          priority: section.priority > CONTENT_PRIORITY.MEDIUM ? 'high' : 'medium',
          description: generateExpansionDescription(expansion)
        });

        wordsToAdd -= expansion.potentialWords;
      });
    });
  }

  return suggestions;
}

/**
 * Helper: Generate cut description
 */
function generateCutDescription(cut) {
  const descriptions = {
    redundant_phrase: `Remove redundant phrases like "${cut.examples?.[0] || 'filler words'}"`,
    excess_examples: `Reduce examples (keep 2 most relevant)`,
    verbose_construction: `Simplify verbose phrases`,
    general_verbosity: `Tighten prose and remove unnecessary words`
  };

  return descriptions[cut.type] || 'Reduce content';
}

/**
 * Helper: Generate expansion description
 */
function generateExpansionDescription(expansion) {
  const descriptions = {
    unexplained_statistics: `Add context for ${expansion.items?.length || 'statistics'}`,
    missing_transitions: `Add transition phrases for better flow`,
    brief_descriptions: `Expand brief descriptions with more detail`,
    general_expansion: `Add supporting detail and context`
  };

  return descriptions[expansion.type] || 'Expand content';
}

/**
 * Apply optimizations to script
 */
export function applyOptimizations(scriptContent, suggestions, config = {}) {
  let optimized = scriptContent;
  let appliedCount = 0;

  // Group suggestions by type
  const cuts = suggestions.filter(s => s.type === 'cut' || s.type === 'trim');
  const expansions = suggestions.filter(s => s.type === 'expand');

  // Apply cuts
  if (cuts.length > 0 && config.allowCuts !== false) {
    cuts.forEach(cut => {
      if (cut.target === 'redundant_phrase') {
        // Remove common redundant phrases
        const patterns = [
          /it('s| is) (important|worth noting) (to note |that )/gi,
          /basically,? |essentially,? /gi,
          /as we mentioned (earlier|before)/gi
        ];

        patterns.forEach(pattern => {
          const before = optimized.length;
          optimized = optimized.replace(pattern, '');
          if (optimized.length < before) appliedCount++;
        });
      } else if (cut.target === 'verbose_construction') {
        // Simplify verbose constructions
        const replacements = [
          { from: /due to the fact that/gi, to: 'because' },
          { from: /in order to/gi, to: 'to' },
          { from: /at this point in time/gi, to: 'now' }
        ];

        replacements.forEach(({ from, to }) => {
          const before = optimized.length;
          optimized = optimized.replace(from, to);
          if (optimized.length < before) appliedCount++;
        });
      }
    });
  }

  // Note: Expansions would require AI generation, so we just mark where they should go
  if (expansions.length > 0 && config.markExpansions) {
    expansions.forEach(expansion => {
      // Add markers for manual expansion
      const marker = `[EXPAND: ${expansion.description} - Add ~${expansion.words} words]`;
      // This would need more sophisticated logic to insert at the right location
    });
  }

  return optimized;
}

/**
 * Generate optimization report
 */
function generateOptimizationReport(originalMetrics, finalMetrics, suggestions, targetMinutes) {
  let report = '# Script Length Optimization Report\n\n';

  report += '## Summary\n';
  report += `- **Target Duration:** ${targetMinutes} minutes\n`;
  report += `- **Original Duration:** ${originalMetrics.minutes.toFixed(1)} minutes (${originalMetrics.wordCount} words)\n`;
  report += `- **Optimized Duration:** ${finalMetrics.minutes.toFixed(1)} minutes (${finalMetrics.wordCount} words)\n`;
  report += `- **Change:** ${(originalMetrics.wordCount - finalMetrics.wordCount)} words ${originalMetrics.wordCount > finalMetrics.wordCount ? 'removed' : 'added'}\n\n`;

  report += '## Timing Breakdown\n';
  report += `- **Narration Time:** ${finalMetrics.breakdown.narrationTime.toFixed(1)} minutes\n`;
  report += `- **Visual Pauses:** ${finalMetrics.breakdown.pauseTime.toFixed(1)} minutes\n`;
  report += `- **Total Time:** ${finalMetrics.breakdown.totalTime.toFixed(1)} minutes\n\n`;

  if (suggestions.length > 0) {
    report += '## Optimization Suggestions\n';

    const highPriority = suggestions.filter(s => s.priority === 'high');
    const mediumPriority = suggestions.filter(s => s.priority === 'medium');
    const lowPriority = suggestions.filter(s => s.priority === 'low');

    if (highPriority.length > 0) {
      report += '### High Priority\n';
      highPriority.forEach(s => {
        report += `- ${s.description} (${s.words} words)\n`;
      });
      report += '\n';
    }

    if (mediumPriority.length > 0) {
      report += '### Medium Priority\n';
      mediumPriority.forEach(s => {
        report += `- ${s.description} (${s.words} words)\n`;
      });
      report += '\n';
    }

    if (lowPriority.length > 0) {
      report += '### Low Priority\n';
      lowPriority.forEach(s => {
        report += `- ${s.description} (${s.words} words)\n`;
      });
    }
  }

  // Add recommendations
  const variance = Math.abs(finalMetrics.wordCount - (targetMinutes * SPEAKING_RATES.normal)) / (targetMinutes * SPEAKING_RATES.normal);

  report += '\n## Recommendations\n';
  if (variance < 0.05) {
    report += 'Script length is optimal for target duration\n';
  } else if (variance < 0.1) {
    report += 'Script length is within acceptable range\n';
  } else if (finalMetrics.wordCount > targetMinutes * SPEAKING_RATES.normal) {
    report += 'Script is too long. Consider:\n';
    report += '- Removing redundant information\n';
    report += '- Cutting low-priority sections\n';
    report += '- Simplifying verbose language\n';
  } else {
    report += 'Script is too short. Consider:\n';
    report += '- Adding more context to key points\n';
    report += '- Including additional examples\n';
    report += '- Expanding technical explanations\n';
  }

  return report;
}

export default {
  optimizeScriptLength,
  calculateDuration,
  applyOptimizations,
  SPEAKING_RATES,
  CONTENT_PRIORITY
};
