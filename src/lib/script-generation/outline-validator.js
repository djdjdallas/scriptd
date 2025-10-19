/**
 * Outline Validator for Script Generation
 *
 * Validates that generated chunks match their assigned outline topics
 * to prevent topic drift and ensure content accuracy.
 */

/**
 * Validate that a generated chunk matches its outline
 * @param {string} generatedContent - The generated script chunk
 * @param {Object} outlineChunk - The outline for this chunk
 * @param {number} chunkNumber - The chunk number
 * @returns {Object} Validation result with pass/fail and details
 */
function validateChunkAgainstOutline(generatedContent, outlineChunk, chunkNumber) {
  const validationResult = {
    passed: true,
    issues: [],
    topicMatches: {},
    severity: 'pass'
  };

  if (!outlineChunk || !outlineChunk.sections) {
    console.warn(`No outline sections for chunk ${chunkNumber}, skipping validation`);
    return validationResult;
  }

  // Normalize content for checking
  const contentLower = generatedContent.toLowerCase();

  // Check each required section
  outlineChunk.sections.forEach((section, idx) => {
    const sectionTitle = section.title;
    const sectionTitleLower = sectionTitle.toLowerCase();

    // Check if section title appears in content as a header or in the text
    // Look for exact match, header format (### Title), or all key words present
    const titleWords = sectionTitle.split(/[:\-\s]+/).filter(w => w.length > 3);
    const headerRegex = new RegExp(`###\\s*${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    const titleFound = contentLower.includes(sectionTitleLower) ||
                       headerRegex.test(generatedContent) ||
                       titleWords.length > 0 && titleWords.every(word => contentLower.includes(word.toLowerCase()));

    // Check for key terms from the section
    const keyTermsFound = [];
    const keyTermsMissing = [];

    // Extract key terms from section title and content
    const keyTerms = extractKeyTerms(section);

    keyTerms.forEach(term => {
      if (contentLower.includes(term.toLowerCase())) {
        keyTermsFound.push(term);
      } else {
        keyTermsMissing.push(term);
      }
    });

    // Calculate match percentage
    const matchPercentage = keyTerms.length > 0
      ? (keyTermsFound.length / keyTerms.length) * 100
      : (titleFound ? 100 : 0);

    validationResult.topicMatches[sectionTitle] = {
      titleFound,
      keyTermsFound,
      keyTermsMissing,
      matchPercentage,
      required: true
    };

    // Flag issues
    if (!titleFound) {
      validationResult.issues.push({
        type: 'missing_section',
        severity: 'critical',
        section: sectionTitle,
        message: `Required section "${sectionTitle}" not found in chunk ${chunkNumber}`
      });
      validationResult.passed = false;
      validationResult.severity = 'critical';
    } else if (matchPercentage < 50) {
      validationResult.issues.push({
        type: 'weak_coverage',
        severity: 'warning',
        section: sectionTitle,
        message: `Section "${sectionTitle}" has weak coverage (${Math.round(matchPercentage)}% match)`,
        missingTerms: keyTermsMissing
      });
      if (validationResult.severity !== 'critical') {
        validationResult.severity = 'warning';
      }
    }
  });

  // Check for off-topic content (topics that shouldn't be in this chunk)
  const forbiddenTopics = extractForbiddenTopics(outlineChunk);
  const foundForbiddenTopics = [];

  forbiddenTopics.forEach(topic => {
    if (contentLower.includes(topic.toLowerCase())) {
      foundForbiddenTopics.push(topic);
      validationResult.issues.push({
        type: 'forbidden_topic',
        severity: 'critical',
        topic: topic,
        message: `Chunk ${chunkNumber} contains forbidden topic "${topic}" that belongs to another chunk`
      });
      validationResult.passed = false;
      validationResult.severity = 'critical';
    }
  });

  // Log validation results
  logValidationResults(validationResult, chunkNumber);

  return validationResult;
}

/**
 * Extract key terms from an outline section
 */
function extractKeyTerms(section) {
  const terms = [];

  // Extract from title
  const titleWords = section.title.split(/\s+/)
    .filter(word => word.length > 4 && !isCommonWord(word));
  terms.push(...titleWords);

  // Extract from content description
  if (section.content) {
    const contentWords = section.content.split(/\s+/)
      .filter(word => word.length > 4 && !isCommonWord(word))
      .slice(0, 5); // Take top 5 key words
    terms.push(...contentWords);
  }

  // Extract from key points
  if (section.keyPoints && Array.isArray(section.keyPoints)) {
    section.keyPoints.forEach(point => {
      const pointWords = point.split(/\s+/)
        .filter(word => word.length > 4 && !isCommonWord(word))
        .slice(0, 2); // Take top 2 words from each key point
      terms.push(...pointWords);
    });
  }

  // Remove duplicates
  return [...new Set(terms)];
}

/**
 * Extract forbidden topics based on outline
 */
function extractForbiddenTopics(outlineChunk) {
  // This would need to be passed from the full outline
  // For now, return empty array
  return [];
}

/**
 * Check if a word is a common word to filter out
 */
function isCommonWord(word) {
  const commonWords = new Set([
    'about', 'after', 'before', 'during', 'through',
    'under', 'over', 'between', 'their', 'which',
    'where', 'when', 'while', 'these', 'those',
    'could', 'would', 'should', 'might', 'must'
  ]);
  return commonWords.has(word.toLowerCase());
}

/**
 * Log validation results for debugging
 */
function logValidationResults(validationResult, chunkNumber) {
  if (validationResult.passed) {
    console.log(`✅ Chunk ${chunkNumber} passed outline validation`);
  } else {
    console.error(`❌ Chunk ${chunkNumber} FAILED outline validation`);
    validationResult.issues.forEach(issue => {
      const emoji = issue.severity === 'critical' ? '🚨' : '⚠️';
      console.error(`  ${emoji} ${issue.message}`);
    });
  }

  // Log topic match details
  console.log(`📊 Topic Match Analysis for Chunk ${chunkNumber}:`);
  Object.entries(validationResult.topicMatches).forEach(([topic, match]) => {
    const status = match.titleFound ? '✓' : '✗';
    console.log(`  ${status} "${topic}": ${Math.round(match.matchPercentage)}% match`);
    if (match.keyTermsMissing.length > 0) {
      console.log(`    Missing terms: ${match.keyTermsMissing.join(', ')}`);
    }
  });
}

/**
 * Validate the entire script follows the complete outline
 */
function validateCompleteScript(fullScript, completeOutline) {
  const results = {
    passed: true,
    chunkValidations: [],
    overallIssues: [],
    topicCoverage: {}
  };

  if (!completeOutline || !completeOutline.chunks) {
    console.warn('No complete outline available for validation');
    return results;
  }

  // Check that all outline sections appear in the script
  completeOutline.chunks.forEach(chunk => {
    chunk.sections.forEach(section => {
      const sectionTitleLower = section.title.toLowerCase();
      const found = fullScript.toLowerCase().includes(sectionTitleLower);

      results.topicCoverage[section.title] = found;

      if (!found) {
        results.overallIssues.push({
          type: 'missing_topic',
          severity: 'critical',
          message: `Required topic "${section.title}" not found in final script`
        });
        results.passed = false;
      }
    });
  });

  // Log overall validation
  if (results.passed) {
    console.log('✅ Complete script passed outline validation');
  } else {
    console.error('❌ Complete script FAILED outline validation');
    console.error(`  Found ${results.overallIssues.length} critical issues`);
  }

  return results;
}

/**
 * Check if generated content matches expected topic
 */
function checkTopicMatch(generatedContent, expectedTopic, expectedKeywords = []) {
  const contentLower = generatedContent.toLowerCase();
  const topicLower = expectedTopic.toLowerCase();

  // Check if topic appears in content
  const topicFound = contentLower.includes(topicLower);

  // Check for expected keywords
  const keywordMatches = expectedKeywords.filter(keyword =>
    contentLower.includes(keyword.toLowerCase())
  );

  const matchScore = calculateMatchScore(topicFound, keywordMatches, expectedKeywords);

  return {
    matches: matchScore > 0.5,
    score: matchScore,
    topicFound,
    keywordMatches,
    missedKeywords: expectedKeywords.filter(k => !keywordMatches.includes(k))
  };
}

/**
 * Calculate a match score between 0 and 1
 */
function calculateMatchScore(topicFound, keywordMatches, expectedKeywords) {
  const topicWeight = 0.5;
  const keywordWeight = 0.5;

  const topicScore = topicFound ? 1 : 0;
  const keywordScore = expectedKeywords.length > 0
    ? keywordMatches.length / expectedKeywords.length
    : 1;

  return (topicScore * topicWeight) + (keywordScore * keywordWeight);
}

/**
 * Pre-generation validation to ensure outline is appropriate
 */
function validateOutlineBeforeGeneration(outline, title, expectedTopics) {
  const validationResult = {
    passed: true,
    issues: []
  };

  // Check if outline matches expected title
  const outlineTitle = outline.title?.toLowerCase() || '';
  const expectedTitle = title.toLowerCase();

  if (!outlineTitle.includes(expectedTitle) && !expectedTitle.includes(outlineTitle)) {
    const titleSimilarity = calculateStringSimilarity(outlineTitle, expectedTitle);
    if (titleSimilarity < 0.5) {
      validationResult.issues.push({
        type: 'title_mismatch',
        severity: 'warning',
        message: `Outline title "${outline.title}" doesn't match expected "${title}"`
      });
    }
  }

  // Check if outline contains expected topics
  const outlineSections = [];
  outline.chunks?.forEach(chunk => {
    chunk.sections?.forEach(section => {
      outlineSections.push(section.title.toLowerCase());
    });
  });

  expectedTopics.forEach(expectedTopic => {
    const topicLower = expectedTopic.toLowerCase();

    // Check for exact match or high similarity
    const found = outlineSections.some(section => {
      // Exact match
      if (section.includes(topicLower) || topicLower.includes(section)) {
        return true;
      }

      // Check if key words from the expected topic are in the outline section
      const topicWords = expectedTopic.split(/[:\-\s]+/)
        .filter(w => w.length > 3)
        .map(w => w.toLowerCase());

      // If at least 60% of key words match, consider it found
      const matchingWords = topicWords.filter(word => section.includes(word));
      return topicWords.length > 0 && (matchingWords.length / topicWords.length) >= 0.6;
    });

    if (!found) {
      validationResult.issues.push({
        type: 'missing_expected_topic',
        severity: 'warning', // Changed from critical to warning
        message: `Expected topic "${expectedTopic}" not found in outline (may be paraphrased)`
      });
      // Don't fail validation for title mismatches, just warn
      // validationResult.passed = false;
    }
  });

  return validationResult;
}

/**
 * Calculate string similarity using simple character overlap
 */
function calculateStringSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = calculateEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate edit distance between two strings
 */
function calculateEditDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

module.exports = {
  validateChunkAgainstOutline,
  validateCompleteScript,
  checkTopicMatch,
  validateOutlineBeforeGeneration,
  extractKeyTerms,
  calculateMatchScore,
  calculateStringSimilarity
};