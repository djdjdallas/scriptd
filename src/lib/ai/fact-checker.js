/**
 * Fact Verification System
 * Validates script content against research sources to ensure accuracy
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Main fact verification function
 * @param {string} scriptContent - The generated script text
 * @param {Array} researchSources - Array of research source objects
 * @returns {Promise<Object>} Verification results with accuracy metrics
 */
export async function verifyFacts(scriptContent, researchSources) {
  console.log('🔍 Starting fact verification...');

  // Extract factual claims from the script
  const claims = await extractClaims(scriptContent);
  console.log(`  📊 Extracted ${claims.length} factual claims`);

  // Prepare source content for verification
  const sourceContent = prepareSourceContent(researchSources);

  // Verify each claim against sources
  const verifiedClaims = [];
  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    console.log(`  ✓ Verifying claim ${i + 1}/${claims.length}: "${claim.text.substring(0, 50)}..."`);

    const verification = await verifyClaim(claim, sourceContent, researchSources);
    verifiedClaims.push({
      ...claim,
      ...verification
    });

    // Log issues
    if (!verification.supported) {
      console.warn(`  ⚠️ Unsupported claim: "${claim.text}"`);
      if (verification.correction) {
        console.log(`  💡 Suggested correction: "${verification.correction}"`);
      }
    }
  }

  // Calculate metrics
  const metrics = calculateVerificationMetrics(verifiedClaims);

  console.log('📊 Fact verification complete:', {
    accuracy: `${(metrics.accuracy * 100).toFixed(1)}%`,
    verified: metrics.supportedCount,
    unverified: metrics.unsupportedCount,
    corrected: metrics.correctionsCount
  });

  return {
    claims: verifiedClaims,
    metrics,
    unsupportedClaims: verifiedClaims.filter(c => !c.supported),
    corrections: verifiedClaims.filter(c => c.correction).map(c => ({
      original: c.text,
      correction: c.correction,
      source: c.sourceTitle
    }))
  };
}

/**
 * Extract factual claims from script content using AI
 * @param {string} scriptContent - The script text
 * @returns {Promise<Array>} Array of extracted claims
 */
async function extractClaims(scriptContent) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const prompt = `Extract all factual claims from this script. Focus on:
- Specific numbers (amounts, percentages, counts)
- Dates and timeframes
- Names (people, companies, places)
- Events and actions
- Technical specifications
- Legal outcomes

Script content:
${scriptContent}

Return as JSON array:
[
  {
    "text": "exact claim as written",
    "type": "statistic|date|name|event|technical|legal",
    "context": "surrounding sentence for context"
  }
]

Only return the JSON array, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = response.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to extract claims JSON');
      return [];
    }

    const claims = JSON.parse(jsonMatch[0]);

    // Deduplicate similar claims
    return deduplicateClaims(claims);
  } catch (error) {
    console.error('Error extracting claims:', error);
    return [];
  }
}

/**
 * Verify a single claim against source content
 * @param {Object} claim - The claim to verify
 * @param {string} sourceContent - Combined source content
 * @param {Array} sources - Individual source objects
 * @returns {Promise<Object>} Verification result
 */
async function verifyClaim(claim, sourceContent, sources) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const prompt = `Verify this factual claim against the provided sources:

CLAIM: "${claim.text}"
TYPE: ${claim.type}
CONTEXT: "${claim.context}"

SOURCES:
${sourceContent.substring(0, 50000)} // Limit to prevent token overflow

Instructions:
1. Search for evidence supporting or contradicting this claim
2. If found, quote the exact supporting text
3. If not found but similar information exists, suggest a correction
4. Rate confidence (0-1) based on evidence strength

Return JSON:
{
  "supported": true/false,
  "confidence": 0.0-1.0,
  "evidence": "exact quote from source or null",
  "sourceTitle": "source title or null",
  "correction": "corrected claim if needed or null",
  "explanation": "brief explanation"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        supported: false,
        confidence: 0,
        evidence: null,
        sourceTitle: null,
        correction: null,
        explanation: 'Verification failed'
      };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error verifying claim:', error);
    return {
      supported: false,
      confidence: 0,
      evidence: null,
      sourceTitle: null,
      correction: null,
      explanation: 'Verification error'
    };
  }
}

/**
 * Prepare source content for verification
 * @param {Array} sources - Research sources
 * @returns {string} Combined source content
 */
function prepareSourceContent(sources) {
  return sources
    .filter(s => s.source_content && s.source_content.length > 100)
    .map(s => `
SOURCE: ${s.source_title}
URL: ${s.source_url}
CONTENT:
${s.source_content}
---
`)
    .join('\n');
}

/**
 * Deduplicate similar claims
 * @param {Array} claims - Array of claims
 * @returns {Array} Deduplicated claims
 */
function deduplicateClaims(claims) {
  const seen = new Set();
  const unique = [];

  for (const claim of claims) {
    // Create a normalized key
    const key = claim.text.toLowerCase().trim().replace(/[^\w\s]/g, '');

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(claim);
    }
  }

  return unique;
}

/**
 * Calculate verification metrics
 * @param {Array} verifiedClaims - Array of verified claims
 * @returns {Object} Metrics object
 */
function calculateVerificationMetrics(verifiedClaims) {
  const total = verifiedClaims.length;
  if (total === 0) {
    return {
      accuracy: 0,
      supportedCount: 0,
      unsupportedCount: 0,
      correctionsCount: 0,
      averageConfidence: 0
    };
  }

  const supported = verifiedClaims.filter(c => c.supported);
  const corrections = verifiedClaims.filter(c => c.correction);

  const totalConfidence = verifiedClaims.reduce((sum, c) => sum + (c.confidence || 0), 0);

  return {
    accuracy: supported.length / total,
    supportedCount: supported.length,
    unsupportedCount: total - supported.length,
    correctionsCount: corrections.length,
    averageConfidence: totalConfidence / total,

    // Breakdown by type
    byType: groupByType(verifiedClaims)
  };
}

/**
 * Group claims by type with metrics
 * @param {Array} claims - Verified claims
 * @returns {Object} Claims grouped by type
 */
function groupByType(claims) {
  const types = {};

  for (const claim of claims) {
    const type = claim.type || 'unknown';
    if (!types[type]) {
      types[type] = {
        total: 0,
        supported: 0,
        accuracy: 0
      };
    }

    types[type].total++;
    if (claim.supported) {
      types[type].supported++;
    }
  }

  // Calculate accuracy per type
  for (const type in types) {
    types[type].accuracy = types[type].supported / types[type].total;
  }

  return types;
}

/**
 * Auto-correct facts in script based on verification results
 * @param {string} scriptContent - Original script
 * @param {Array} corrections - Array of corrections
 * @returns {string} Corrected script
 */
export function autoCorrectFacts(scriptContent, corrections) {
  let correctedScript = scriptContent;

  console.log(`📝 Applying ${corrections.length} fact corrections...`);

  for (const correction of corrections) {
    // Use exact string replacement
    if (correctedScript.includes(correction.original)) {
      correctedScript = correctedScript.replace(
        correction.original,
        correction.correction
      );
      console.log(`  ✓ Corrected: "${correction.original.substring(0, 50)}..."`);
    }
  }

  return correctedScript;
}

/**
 * Generate a fact verification report
 * @param {Object} verificationResults - Results from verifyFacts
 * @returns {string} Formatted report
 */
export function generateFactReport(verificationResults) {
  const { metrics, unsupportedClaims, corrections } = verificationResults;

  let report = `# Fact Verification Report\n\n`;
  report += `## Summary\n`;
  report += `- **Accuracy**: ${(metrics.accuracy * 100).toFixed(1)}%\n`;
  report += `- **Verified Claims**: ${metrics.supportedCount}/${metrics.supportedCount + metrics.unsupportedCount}\n`;
  report += `- **Average Confidence**: ${(metrics.averageConfidence * 100).toFixed(1)}%\n`;
  report += `- **Corrections Available**: ${metrics.correctionsCount}\n\n`;

  if (metrics.byType) {
    report += `## Accuracy by Type\n`;
    for (const [type, data] of Object.entries(metrics.byType)) {
      report += `- **${type}**: ${(data.accuracy * 100).toFixed(1)}% (${data.supported}/${data.total})\n`;
    }
    report += `\n`;
  }

  if (unsupportedClaims.length > 0) {
    report += `## Unsupported Claims\n`;
    for (const claim of unsupportedClaims.slice(0, 10)) { // Limit to 10
      report += `- "${claim.text}"\n`;
      if (claim.explanation) {
        report += `  - ${claim.explanation}\n`;
      }
    }
    report += `\n`;
  }

  if (corrections.length > 0) {
    report += `## Suggested Corrections\n`;
    for (const correction of corrections.slice(0, 10)) { // Limit to 10
      report += `- **Original**: "${correction.original}"\n`;
      report += `  **Correction**: "${correction.correction}"\n`;
      report += `  **Source**: ${correction.source}\n\n`;
    }
  }

  return report;
}

/**
 * Check if script meets quality thresholds
 * @param {Object} metrics - Verification metrics
 * @param {Object} thresholds - Quality thresholds
 * @returns {boolean} Whether script passes quality checks
 */
export function meetsQualityThresholds(metrics, thresholds = {}) {
  const defaults = {
    minAccuracy: 0.85,
    minConfidence: 0.70,
    maxUnsupported: 5
  };

  const thresh = { ...defaults, ...thresholds };

  return (
    metrics.accuracy >= thresh.minAccuracy &&
    metrics.averageConfidence >= thresh.minConfidence &&
    metrics.unsupportedCount <= thresh.maxUnsupported
  );
}

export default {
  verifyFacts,
  autoCorrectFacts,
  generateFactReport,
  meetsQualityThresholds
};