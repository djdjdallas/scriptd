/**
 * Visual Feasibility Checker
 * Validates that requested visuals in scripts are actually producible
 */

/**
 * Visual categories by difficulty/feasibility
 */
const VISUAL_CATEGORIES = {
  EASY: {
    items: [
      'text overlay', 'title card', 'quote display', 'bullet points',
      'simple infographic', 'bar chart', 'pie chart', 'line graph',
      'timeline', 'map highlight', 'logo display', 'icon animation',
      'number counter', 'percentage display', 'comparison table',
      'screenshot', 'website display', 'social media post'
    ],
    productionTime: '5-15 minutes',
    cost: '$',
    feasibility: 0.95
  },

  MEDIUM: {
    items: [
      'animated infographic', 'data visualization', 'flowchart',
      'process diagram', 'network diagram', 'heat map',
      'mock interface', 'ui mockup', 'dashboard recreation',
      'simple 3d model', 'photo montage', 'collage',
      'animated timeline', 'animated map', 'transition effects',
      'split screen', 'picture in picture', 'multi-layer composition'
    ],
    productionTime: '30-60 minutes',
    cost: '$$',
    feasibility: 0.85
  },

  HARD: {
    items: [
      'complex animation', '3d animation', 'character animation',
      'realistic simulation', 'particle effects', 'motion graphics',
      'reconstructed scene', 'virtual environment', 'cgi elements',
      'custom illustration', 'detailed technical diagram',
      'interactive visualization', 'augmented reality overlay'
    ],
    productionTime: '2-8 hours',
    cost: '$$$',
    feasibility: 0.60
  },

  STOCK_AVAILABLE: {
    items: [
      'stock footage', 'stock photo', 'archive footage',
      'news footage', 'generic office', 'generic city',
      'nature footage', 'technology visuals', 'abstract backgrounds',
      'countdown timer', 'loading animation', 'transition wipes'
    ],
    productionTime: '5 minutes',
    cost: '$',
    feasibility: 0.99
  },

  IMPOSSIBLE: {
    items: [
      'brain scan', 'mri scan', 'medical imaging', 'x-ray',
      'courtroom sketch', 'specific person photo', 'private footage',
      'classified material', 'proprietary interface', 'internal documents',
      'real crime scene', 'actual evidence', 'surveillance footage',
      'specific building interior', 'private property', 'confidential data',
      'live footage', 'real-time data', 'actual hacking', 'illegal content'
    ],
    productionTime: 'N/A',
    cost: 'N/A',
    feasibility: 0
  }
};

/**
 * Alternative suggestions for impossible visuals
 */
const ALTERNATIVE_SUGGESTIONS = {
  'brain scan': ['animated brain illustration', 'neural network visualization', 'mind map diagram'],
  'mri scan': ['3D brain model', 'medical illustration', 'anatomical diagram'],
  'courtroom sketch': ['courthouse exterior stock footage', 'gavel stock footage', 'legal scales animation'],
  'specific person photo': ['silhouette representation', 'avatar illustration', 'anonymous figure graphic'],
  'surveillance footage': ['security camera stock footage', 'CCTV-style filter effect', 'monitoring interface mockup'],
  'classified material': ['redacted document effect', 'confidential stamp animation', 'folder marked classified'],
  'proprietary interface': ['generic dashboard mockup', 'UI wireframe', 'blurred interface suggestion'],
  'real crime scene': ['police tape stock footage', 'evidence markers illustration', 'investigation infographic'],
  'live footage': ['simulated live indicator', 'recorded with live-style graphics', 'news-style presentation'],
  'actual hacking': ['code visualization', 'terminal window animation', 'cyber security graphics'],
  'internal documents': ['document icon animation', 'paper stack visualization', 'folder structure diagram']
};

/**
 * Main visual feasibility check function
 * @param {string} scriptContent - The script containing visual descriptions
 * @returns {Object} Feasibility analysis results
 */
export function checkVisualFeasibility(scriptContent) {
  console.log('🎬 Checking visual feasibility...');

  // Extract visual requests from script
  const visualRequests = extractVisualRequests(scriptContent);
  console.log(`  📊 Found ${visualRequests.length} visual requests`);

  // Analyze each visual request
  const analysis = visualRequests.map(request => analyzeVisualRequest(request));

  // Calculate metrics
  const metrics = calculateFeasibilityMetrics(analysis);

  // Generate suggestions for problematic visuals
  const suggestions = generateVisualSuggestions(analysis);

  console.log('📊 Visual feasibility check complete:', {
    total: visualRequests.length,
    feasible: metrics.feasibleCount,
    problematic: metrics.impossibleCount,
    feasibilityRate: `${(metrics.overallFeasibility * 100).toFixed(1)}%`
  });

  return {
    requests: analysis,
    metrics,
    suggestions,
    report: generateFeasibilityReport(analysis, metrics, suggestions)
  };
}

/**
 * Extract visual requests from script
 * @param {string} scriptContent - Script text
 * @returns {Array} Array of visual request objects
 */
function extractVisualRequests(scriptContent) {
  const visualRequests = [];

  // Common visual markers in scripts
  const visualPatterns = [
    /\[Visual:\s*([^\]]+)\]/gi,
    /\[Scene:\s*([^\]]+)\]/gi,
    /\[Show:\s*([^\]]+)\]/gi,
    /\[Display:\s*([^\]]+)\]/gi,
    /\[Animation:\s*([^\]]+)\]/gi,
    /\[Graphic:\s*([^\]]+)\]/gi,
    /\[Cut to:\s*([^\]]+)\]/gi,
    /Visual:\s*([^\n]+)/gi
  ];

  visualPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(scriptContent)) !== null) {
      visualRequests.push({
        fullText: match[0],
        description: match[1].trim(),
        position: match.index,
        context: extractContext(scriptContent, match.index)
      });
    }
  });

  // Also look for implicit visual descriptions
  const implicitPatterns = [
    /show(?:s|ing)?\s+(?:a|an|the)\s+([^.]+)/gi,
    /display(?:s|ing)?\s+(?:a|an|the)\s+([^.]+)/gi,
    /see(?:s|ing)?\s+(?:a|an|the)\s+([^.]+)/gi,
    /reveal(?:s|ing)?\s+(?:a|an|the)\s+([^.]+)/gi
  ];

  implicitPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(scriptContent)) !== null) {
      // Avoid duplicates
      const isDuplicate = visualRequests.some(r =>
        Math.abs(r.position - match.index) < 20
      );

      if (!isDuplicate) {
        visualRequests.push({
          fullText: match[0],
          description: match[1].trim(),
          position: match.index,
          context: extractContext(scriptContent, match.index),
          implicit: true
        });
      }
    }
  });

  return visualRequests.sort((a, b) => a.position - b.position);
}

/**
 * Analyze a single visual request
 * @param {Object} request - Visual request object
 * @returns {Object} Analysis results
 */
function analyzeVisualRequest(request) {
  const description = request.description.toLowerCase();
  let category = null;
  let feasibility = 0.5; // Default moderate feasibility
  let matchedItems = [];
  let issues = [];
  let alternatives = [];

  // Check each category
  for (const [categoryName, categoryData] of Object.entries(VISUAL_CATEGORIES)) {
    for (const item of categoryData.items) {
      if (description.includes(item.toLowerCase())) {
        category = categoryName;
        feasibility = categoryData.feasibility;
        matchedItems.push(item);
        break;
      }
    }
    if (category) break;
  }

  // If no category matched, analyze complexity
  if (!category) {
    category = estimateCategory(description);
    feasibility = VISUAL_CATEGORIES[category].feasibility;
  }

  // Check for specific problems
  const problems = checkForProblems(description);
  issues.push(...problems.issues);

  // Adjust feasibility based on problems
  if (problems.issues.length > 0) {
    feasibility = Math.max(0, feasibility - (problems.issues.length * 0.2));
  }

  // Get alternatives if needed
  if (category === 'IMPOSSIBLE' || feasibility < 0.5) {
    alternatives = getAlternatives(description, matchedItems);
  }

  return {
    ...request,
    category,
    feasibility,
    matchedItems,
    issues,
    alternatives,
    productionTime: VISUAL_CATEGORIES[category]?.productionTime || 'Unknown',
    estimatedCost: VISUAL_CATEGORIES[category]?.cost || 'Unknown'
  };
}

/**
 * Helper: Extract context around a position
 */
function extractContext(text, position, length = 100) {
  const start = Math.max(0, position - 50);
  const end = Math.min(text.length, position + length);
  return text.substring(start, end).replace(/\n/g, ' ');
}

/**
 * Helper: Estimate category based on description complexity
 */
function estimateCategory(description) {
  const words = description.split(/\s+/);

  // Check for impossible keywords
  const impossibleKeywords = ['actual', 'real', 'live', 'specific', 'proprietary', 'classified', 'confidential', 'private'];
  if (impossibleKeywords.some(keyword => description.includes(keyword))) {
    return 'IMPOSSIBLE';
  }

  // Estimate based on complexity indicators
  const complexityIndicators = {
    simple: ['simple', 'basic', 'text', 'title', 'number', 'chart'],
    medium: ['animated', 'diagram', 'mockup', 'visualization', 'interface'],
    hard: ['complex', 'realistic', '3d', 'simulation', 'reconstruction', 'detailed']
  };

  for (const indicator of complexityIndicators.simple) {
    if (description.includes(indicator)) return 'EASY';
  }

  for (const indicator of complexityIndicators.hard) {
    if (description.includes(indicator)) return 'HARD';
  }

  // Default to medium
  return 'MEDIUM';
}

/**
 * Helper: Check for specific problems
 */
function checkForProblems(description) {
  const issues = [];

  // Check for specificity problems
  if (description.includes('specific') || description.includes('exact')) {
    issues.push('Requires specific/exact visual that may not be available');
  }

  // Check for legal/ethical issues
  const legalKeywords = ['copyright', 'proprietary', 'confidential', 'private', 'classified'];
  if (legalKeywords.some(keyword => description.includes(keyword))) {
    issues.push('Potential legal/ethical concerns');
  }

  // Check for technical impossibilities
  const impossibleTech = ['real-time', 'live feed', 'actual footage', 'surveillance'];
  if (impossibleTech.some(keyword => description.includes(keyword))) {
    issues.push('Technical impossibility or unavailable footage');
  }

  // Check for resource intensity
  if (description.length > 100 || description.includes('detailed') || description.includes('complex')) {
    issues.push('Resource-intensive production required');
  }

  return { issues };
}

/**
 * Helper: Get alternatives for problematic visuals
 */
function getAlternatives(description, matchedItems) {
  const alternatives = [];

  // Check predefined alternatives
  for (const [problem, alts] of Object.entries(ALTERNATIVE_SUGGESTIONS)) {
    if (description.includes(problem) || matchedItems.includes(problem)) {
      alternatives.push(...alts);
    }
  }

  // Generate generic alternatives if none found
  if (alternatives.length === 0) {
    alternatives.push(
      'Generic stock footage with relevant theme',
      'Animated infographic representation',
      'Symbolic visualization',
      'Text-based presentation with design elements'
    );
  }

  return alternatives;
}

/**
 * Calculate feasibility metrics
 */
function calculateFeasibilityMetrics(analysis) {
  const total = analysis.length;
  if (total === 0) {
    return {
      overallFeasibility: 1,
      feasibleCount: 0,
      problematicCount: 0,
      impossibleCount: 0,
      byCategory: {}
    };
  }

  const feasible = analysis.filter(a => a.feasibility >= 0.7);
  const problematic = analysis.filter(a => a.feasibility < 0.7 && a.feasibility > 0);
  const impossible = analysis.filter(a => a.feasibility === 0);

  const totalFeasibility = analysis.reduce((sum, a) => sum + a.feasibility, 0);

  // Count by category
  const byCategory = {};
  analysis.forEach(a => {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  });

  return {
    overallFeasibility: totalFeasibility / total,
    feasibleCount: feasible.length,
    problematicCount: problematic.length,
    impossibleCount: impossible.length,
    byCategory,

    estimatedTotalTime: estimateProductionTime(analysis),
    estimatedTotalCost: estimateProductionCost(analysis)
  };
}

/**
 * Helper: Estimate total production time
 */
function estimateProductionTime(analysis) {
  const timeMap = {
    'EASY': 10,           // 10 minutes average
    'MEDIUM': 45,         // 45 minutes average
    'HARD': 300,          // 5 hours average
    'STOCK_AVAILABLE': 5, // 5 minutes to find/implement
    'IMPOSSIBLE': 0       // Can't produce
  };

  const totalMinutes = analysis.reduce((sum, a) => {
    return sum + (timeMap[a.category] || 30);
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

/**
 * Helper: Estimate production cost
 */
function estimateProductionCost(analysis) {
  const costMap = {
    'EASY': 1,
    'MEDIUM': 2,
    'HARD': 3,
    'STOCK_AVAILABLE': 1,
    'IMPOSSIBLE': 0
  };

  const totalCost = analysis.reduce((sum, a) => {
    return sum + (costMap[a.category] || 1);
  }, 0);

  if (totalCost <= analysis.length) return '$';
  if (totalCost <= analysis.length * 2) return '$$';
  return '$$$';
}

/**
 * Generate visual suggestions
 */
function generateVisualSuggestions(analysis) {
  const suggestions = [];

  analysis.forEach(visual => {
    if (visual.feasibility < 0.7) {
      suggestions.push({
        original: visual.description,
        issues: visual.issues,
        alternatives: visual.alternatives,
        priority: visual.feasibility === 0 ? 'high' : 'medium',
        recommendation: generateRecommendation(visual)
      });
    }
  });

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Helper: Generate specific recommendation
 */
function generateRecommendation(visual) {
  if (visual.feasibility === 0) {
    return `Replace "${visual.description}" with one of: ${visual.alternatives.slice(0, 2).join(' or ')}`;
  }

  if (visual.issues.length > 0) {
    return `Simplify "${visual.description}" to address: ${visual.issues[0]}`;
  }

  return `Consider simplifying "${visual.description}" for easier production`;
}

/**
 * Generate feasibility report
 */
function generateFeasibilityReport(analysis, metrics, suggestions) {
  let report = '# Visual Feasibility Report\n\n';

  report += '## Summary\n';
  report += `- **Total Visuals:** ${analysis.length}\n`;
  report += `- **Overall Feasibility:** ${(metrics.overallFeasibility * 100).toFixed(1)}%\n`;
  report += `- **Feasible:** ${metrics.feasibleCount} visuals\n`;
  report += `- **Problematic:** ${metrics.problematicCount} visuals\n`;
  report += `- **Impossible:** ${metrics.impossibleCount} visuals\n`;
  report += `- **Estimated Production Time:** ${metrics.estimatedTotalTime}\n`;
  report += `- **Estimated Cost:** ${metrics.estimatedTotalCost}\n\n`;

  report += '## Breakdown by Category\n';
  for (const [category, count] of Object.entries(metrics.byCategory)) {
    report += `- **${category}:** ${count} visuals\n`;
  }
  report += '\n';

  if (suggestions.length > 0) {
    report += '## Required Changes\n';

    const highPriority = suggestions.filter(s => s.priority === 'high');
    if (highPriority.length > 0) {
      report += '### Must Replace (Impossible)\n';
      highPriority.forEach(s => {
        report += `- **"${s.original.substring(0, 50)}..."**\n`;
        report += `  - ${s.recommendation}\n`;
      });
      report += '\n';
    }

    const mediumPriority = suggestions.filter(s => s.priority === 'medium');
    if (mediumPriority.length > 0) {
      report += '### Should Simplify (Problematic)\n';
      mediumPriority.forEach(s => {
        report += `- **"${s.original.substring(0, 50)}..."**\n`;
        report += `  - ${s.recommendation}\n`;
      });
    }
  }

  return report;
}

/**
 * Apply visual suggestions to script
 */
export function applyVisualCorrections(scriptContent, suggestions) {
  let correctedScript = scriptContent;
  let changeLog = [];

  console.log(`🎬 Applying ${suggestions.length} visual corrections...`);

  suggestions.forEach(suggestion => {
    if (suggestion.priority === 'high' && suggestion.alternatives.length > 0) {
      // Replace impossible visuals with first alternative
      const original = `[Visual: ${suggestion.original}]`;
      const replacement = `[Visual: ${suggestion.alternatives[0]}]`;

      if (correctedScript.includes(original)) {
        correctedScript = correctedScript.replace(original, replacement);
        changeLog.push({
          original: suggestion.original,
          replacement: suggestion.alternatives[0],
          reason: 'Impossible visual replaced'
        });
        console.log(`  ✓ Replaced: "${suggestion.original.substring(0, 30)}..."`);
      }
    }
  });

  console.log(`  ✓ Applied ${changeLog.length} visual corrections`);

  return {
    content: correctedScript,
    changeLog,
    improvementScore: (changeLog.length / suggestions.length) * 100
  };
}

export default {
  checkVisualFeasibility,
  applyVisualCorrections,
  VISUAL_CATEGORIES,
  ALTERNATIVE_SUGGESTIONS
};