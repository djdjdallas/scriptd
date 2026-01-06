/**
 * Quality Gates Integration Module
 * Orchestrates all quality checks and improvements for script generation
 */

import { verifyFacts, autoCorrectFacts, generateFactReport } from './fact-checker.js';
import { analyzeRepetition, applyDeduplication } from './deduplication-engine.js';
import { checkVisualFeasibility, applyVisualCorrections } from './visual-feasibility.js';
import { optimizeScriptLength, calculateDuration } from './length-optimizer.js';
import { analyzeTechnicalConsistency, applyNormalization } from './technical-normalizer.js';

/**
 * Quality Gate Configuration
 */
export const QUALITY_GATES_CONFIG = {
  enabled: true,

  factChecking: {
    enabled: true,
    minAccuracy: 0.85,
    autoCorrect: true,
    requireSource: true
  },

  deduplication: {
    enabled: true,
    maxRepetitions: 2,
    autoRemove: true,
    preserveFirstOccurrence: true
  },

  visualFeasibility: {
    enabled: true,
    autoReplace: true,
    maxComplexity: 'MEDIUM',
    requireAlternatives: true
  },

  lengthOptimization: {
    enabled: true,
    targetMinutes: 30,
    allowedVariance: 0.1,
    speakingRate: 'normal',
    autoOptimize: false  // Manual review recommended
  },

  technicalConsistency: {
    enabled: true,
    targetLevel: 'INTERMEDIATE',
    allowedVariance: 1,
    autoNormalize: false  // Requires rewriting
  },

  // Quality thresholds for passing
  thresholds: {
    minOverallScore: 0.8,
    criticalFailures: ['factAccuracy < 0.7', 'impossibleVisuals > 0', 'lengthVariance > 0.3']
  }
};

/**
 * Main quality gates pipeline
 * @param {string} scriptContent - Generated script
 * @param {Array} researchSources - Research sources for fact checking
 * @param {Object} config - Configuration overrides
 * @returns {Object} Quality-improved script and detailed report
 */
export async function runQualityGates(scriptContent, researchSources, config = {}) {
  const settings = { ...QUALITY_GATES_CONFIG, ...config };
  let improvedScript = scriptContent;

  const results = {
    original: scriptContent,
    improved: scriptContent,
    stages: {},
    metrics: {},
    report: '',
    passed: true,
    score: 0
  };

  // Stage 1: Fact Checking
  if (settings.factChecking.enabled) {
    const factResults = await verifyFacts(improvedScript, researchSources);
    results.stages.factChecking = factResults;

    if (factResults.metrics.accuracy < settings.factChecking.minAccuracy) {
      if (settings.factChecking.autoCorrect && factResults.corrections.length > 0) {
        improvedScript = autoCorrectFacts(improvedScript, factResults.corrections);
      }
    }

    results.metrics.factAccuracy = factResults.metrics.accuracy;
  }

  // Stage 2: Deduplication
  if (settings.deduplication.enabled) {
    const deduplicationResults = analyzeRepetition(improvedScript);
    results.stages.deduplication = deduplicationResults;

    const highPrioritySuggestions = deduplicationResults.suggestions.filter(s => s.priority === 'high');

    if (highPrioritySuggestions.length > 0) {
      if (settings.deduplication.autoRemove) {
        const deduped = applyDeduplication(improvedScript, highPrioritySuggestions);
        improvedScript = deduped.content;
      }
    }

    results.metrics.repetitionScore = deduplicationResults.metrics.totalRepetitions;
  }

  // Stage 3: Visual Feasibility
  if (settings.visualFeasibility.enabled) {
    const visualResults = checkVisualFeasibility(improvedScript);
    results.stages.visualFeasibility = visualResults;

    if (visualResults.metrics.impossibleCount > 0) {
      if (settings.visualFeasibility.autoReplace) {
        const corrected = applyVisualCorrections(improvedScript, visualResults.suggestions);
        improvedScript = corrected.content;
      }
    }

    results.metrics.visualFeasibility = visualResults.metrics.overallFeasibility;
    results.metrics.impossibleVisuals = visualResults.metrics.impossibleCount;
  }

  // Stage 4: Length Optimization
  if (settings.lengthOptimization.enabled) {
    const lengthResults = optimizeScriptLength(
      improvedScript,
      settings.lengthOptimization.targetMinutes,
      settings.lengthOptimization
    );
    results.stages.lengthOptimization = lengthResults;

    const variance = Math.abs(
      lengthResults.finalMetrics.minutes - settings.lengthOptimization.targetMinutes
    ) / settings.lengthOptimization.targetMinutes;

    if (variance > settings.lengthOptimization.allowedVariance) {
      if (settings.lengthOptimization.autoOptimize) {
        improvedScript = lengthResults.content;
      }
    }

    results.metrics.lengthVariance = variance;
    results.metrics.duration = lengthResults.finalMetrics.minutes;
  }

  // Stage 5: Technical Consistency
  if (settings.technicalConsistency.enabled) {
    const consistencyResults = analyzeTechnicalConsistency(improvedScript, settings.technicalConsistency);
    results.stages.technicalConsistency = consistencyResults;

    if (consistencyResults.metrics.consistencyScore < 0.7) {
      if (settings.technicalConsistency.autoNormalize) {
        const normalized = applyNormalization(improvedScript, consistencyResults.suggestions);
        if (!normalized.requiresRewrite) {
          improvedScript = normalized.content;
        }
      }
    }

    results.metrics.technicalConsistency = consistencyResults.metrics.consistencyScore;
  }

  // Calculate overall quality score
  results.score = calculateOverallScore(results.metrics);
  results.passed = evaluateQualityGates(results.metrics, settings.thresholds);
  results.improved = improvedScript;

  // Generate comprehensive report
  results.report = generateQualityReport(results, settings);

  return results;
}

/**
 * Calculate overall quality score
 * @param {Object} metrics - Individual metrics from each stage
 * @returns {number} Overall score (0-1)
 */
function calculateOverallScore(metrics) {
  const weights = {
    factAccuracy: 0.3,
    visualFeasibility: 0.2,
    technicalConsistency: 0.2,
    lengthCompliance: 0.15,
    minimalRepetition: 0.15
  };

  // Calculate length compliance score
  const lengthCompliance = metrics.lengthVariance
    ? Math.max(0, 1 - metrics.lengthVariance)
    : 1;

  // Calculate repetition score (inverse of repetitions)
  const minimalRepetition = metrics.repetitionScore
    ? Math.max(0, 1 - (metrics.repetitionScore / 100))
    : 1;

  const scores = {
    factAccuracy: metrics.factAccuracy || 1,
    visualFeasibility: metrics.visualFeasibility || 1,
    technicalConsistency: metrics.technicalConsistency || 1,
    lengthCompliance,
    minimalRepetition
  };

  // Weighted average
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(scores).forEach(([key, score]) => {
    if (weights[key]) {
      totalScore += score * weights[key];
      totalWeight += weights[key];
    }
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Evaluate if script passes quality gates
 * @param {Object} metrics - Quality metrics
 * @param {Object} thresholds - Pass/fail thresholds
 * @returns {boolean} Pass/fail result
 */
function evaluateQualityGates(metrics, thresholds) {
  // Check critical failures
  if (metrics.factAccuracy < 0.7) return false;
  if (metrics.impossibleVisuals > 0) return false;
  if (metrics.lengthVariance > 0.3) return false;

  // Check overall score
  const overallScore = calculateOverallScore(metrics);
  return overallScore >= (thresholds.minOverallScore || 0.8);
}

/**
 * Generate comprehensive quality report
 * @param {Object} results - Results from all stages
 * @param {Object} settings - Configuration settings
 * @returns {string} Formatted report
 */
function generateQualityReport(results, settings) {
  let report = '# Script Quality Report\n\n';

  // Executive Summary
  report += '## Executive Summary\n';
  report += `- **Overall Score:** ${(results.score * 100).toFixed(1)}%\n`;
  report += `- **Status:** ${results.passed ? 'PASSED' : 'FAILED'}\n`;
  report += `- **Original Length:** ${results.original.length} characters\n`;
  report += `- **Improved Length:** ${results.improved.length} characters\n`;
  report += `- **Improvements Made:** ${countImprovements(results)} changes\n\n`;

  // Stage-by-Stage Results
  report += '## Quality Gates Results\n\n';

  // Fact Checking
  if (results.stages.factChecking) {
    report += '### 1. Fact Verification\n';
    report += `- **Accuracy:** ${(results.metrics.factAccuracy * 100).toFixed(1)}%\n`;
    report += `- **Verified Claims:** ${results.stages.factChecking.metrics.supportedCount}\n`;
    report += `- **Corrections Applied:** ${results.stages.factChecking.corrections?.length || 0}\n\n`;
  }

  // Deduplication
  if (results.stages.deduplication) {
    report += '### 2. Content Deduplication\n';
    report += `- **Total Repetitions:** ${results.metrics.repetitionScore}\n`;
    report += `- **Unique Items:** ${results.stages.deduplication.metrics.uniqueItems}\n`;
    report += `- **Removed:** ${results.stages.deduplication.suggestions?.filter(s => s.priority === 'high').length || 0} items\n\n`;
  }

  // Visual Feasibility
  if (results.stages.visualFeasibility) {
    report += '### 3. Visual Feasibility\n';
    report += `- **Feasibility:** ${(results.metrics.visualFeasibility * 100).toFixed(1)}%\n`;
    report += `- **Impossible Visuals:** ${results.metrics.impossibleVisuals}\n`;
    report += `- **Replacements:** ${results.stages.visualFeasibility.suggestions?.filter(s => s.priority === 'high').length || 0}\n\n`;
  }

  // Length Optimization
  if (results.stages.lengthOptimization) {
    report += '### 4. Length Optimization\n';
    report += `- **Target:** ${settings.lengthOptimization.targetMinutes} minutes\n`;
    report += `- **Actual:** ${results.metrics.duration.toFixed(1)} minutes\n`;
    report += `- **Variance:** ${(results.metrics.lengthVariance * 100).toFixed(1)}%\n\n`;
  }

  // Technical Consistency
  if (results.stages.technicalConsistency) {
    report += '### 5. Technical Consistency\n';
    report += `- **Consistency Score:** ${(results.metrics.technicalConsistency * 100).toFixed(1)}%\n`;
    report += `- **Target Level:** ${settings.technicalConsistency.targetLevel}\n`;
    report += `- **Issues Found:** ${results.stages.technicalConsistency.issues?.length || 0}\n\n`;
  }

  // Key Issues
  const issues = collectAllIssues(results);
  if (issues.length > 0) {
    report += '## Key Issues Identified\n';
    issues.slice(0, 10).forEach((issue, idx) => {
      report += `${idx + 1}. ${issue}\n`;
    });
    report += '\n';
  }

  // Recommendations
  report += '## Recommendations\n';
  report += generateRecommendations(results, settings);

  return report;
}

/**
 * Helper: Count total improvements made
 */
function countImprovements(results) {
  let count = 0;

  if (results.stages.factChecking?.corrections) {
    count += results.stages.factChecking.corrections.length;
  }

  if (results.stages.deduplication?.suggestions) {
    count += results.stages.deduplication.suggestions.filter(s => s.priority === 'high').length;
  }

  if (results.stages.visualFeasibility?.suggestions) {
    count += results.stages.visualFeasibility.suggestions.filter(s => s.priority === 'high').length;
  }

  return count;
}

/**
 * Helper: Collect all issues from stages
 */
function collectAllIssues(results) {
  const issues = [];

  if (results.stages.factChecking?.unsupportedClaims) {
    results.stages.factChecking.unsupportedClaims.slice(0, 3).forEach(claim => {
      issues.push(`Unsupported fact: "${claim.text.substring(0, 50)}..."`);
    });
  }

  if (results.stages.deduplication?.metrics.worstOffenders) {
    results.stages.deduplication.metrics.worstOffenders.slice(0, 3).forEach(item => {
      issues.push(`Repeated ${item.count} times: "${item.value}"`);
    });
  }

  if (results.stages.visualFeasibility?.suggestions) {
    results.stages.visualFeasibility.suggestions
      .filter(s => s.priority === 'high')
      .slice(0, 3)
      .forEach(visual => {
        issues.push(`Impossible visual: "${visual.original.substring(0, 50)}..."`);
      });
  }

  return issues;
}

/**
 * Helper: Generate recommendations
 */
function generateRecommendations(results, settings) {
  const recommendations = [];

  if (results.metrics.factAccuracy < 0.9) {
    recommendations.push('- Review and verify factual claims against primary sources');
  }

  if (results.metrics.repetitionScore > 50) {
    recommendations.push('- Consolidate repetitive information into dedicated sections');
  }

  if (results.metrics.impossibleVisuals > 0) {
    recommendations.push('- Replace complex visual requests with producible alternatives');
  }

  if (results.metrics.lengthVariance > 0.15) {
    recommendations.push('- Adjust content length to better match target duration');
  }

  if (results.metrics.technicalConsistency < 0.8) {
    recommendations.push('- Normalize technical complexity throughout the script');
  }

  if (!results.passed) {
    recommendations.push('- **Critical: Address failing quality gates before production**');
  }

  return recommendations.join('\n');
}

/**
 * Simplified quality check for quick validation
 * @param {string} scriptContent - Script to check
 * @param {number} targetMinutes - Target duration
 * @returns {Object} Quick quality metrics
 */
export function quickQualityCheck(scriptContent, targetMinutes = 30) {
  const duration = calculateDuration(scriptContent);
  const visualCount = (scriptContent.match(/\[Visual:/gi) || []).length;
  const repetitions = (scriptContent.match(/(\b\w+\b)(?=.*\b\1\b)/gi) || []).length;

  const lengthVariance = Math.abs(duration.minutes - targetMinutes) / targetMinutes;

  return {
    duration: duration.minutes,
    targetMinutes,
    lengthVariance,
    visualCount,
    estimatedRepetitions: repetitions,
    quickScore: Math.max(0, 1 - lengthVariance - (repetitions / 100)),
    recommendation: lengthVariance > 0.2 ? 'Review length' : 'Good to go'
  };
}

export default {
  runQualityGates,
  quickQualityCheck,
  calculateOverallScore,
  QUALITY_GATES_CONFIG
};
