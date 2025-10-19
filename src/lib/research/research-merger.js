/**
 * Research Merger for Hybrid Research Sources
 *
 * Intelligently merges web research and user-uploaded documents,
 * detecting and removing duplicates while prioritizing quality sources.
 */

const { calculateSourceQuality } = require('../script-generation/research-validator');

/**
 * Merge web research and user documents into unified research set
 */
async function mergeResearchSources(webResearch, userDocuments, options = {}) {
  const {
    removeDuplicates = true,
    prioritizeDocuments = true,
    maxSources = 50
  } = options;

  console.log(`📚 Merging research: ${webResearch.length} web sources + ${userDocuments.length} documents`);

  // 1. Extract and normalize all sources
  const webSources = normalizeWebSources(webResearch);
  const docSources = normalizeDocumentSources(userDocuments);

  // 2. Detect duplicates if enabled
  let duplicates = [];
  if (removeDuplicates) {
    duplicates = findDuplicateContent(webSources, docSources);
    console.log(`🔍 Found ${duplicates.length} potential duplicates`);
  }

  // 3. Merge and deduplicate
  const merged = deduplicateAndMerge(webSources, docSources, duplicates, {
    prioritizeDocuments
  });

  // 4. Calculate quality scores for all sources
  const scored = merged.map(source => ({
    ...source,
    quality_score: calculateSourceQuality(source)
  }));

  // 5. Sort by quality and relevance
  const prioritized = prioritizeSources(scored);

  // 6. Limit to max sources if specified
  const final = maxSources ? prioritized.slice(0, maxSources) : prioritized;

  // 7. Generate statistics
  const stats = generateMergeStats(webSources, docSources, duplicates, final);

  console.log(`✅ Merge complete: ${final.length} sources (removed ${duplicates.length} duplicates)`);

  return {
    sources: final,
    stats,
    duplicatesRemoved: duplicates
  };
}

/**
 * Normalize web research sources
 */
function normalizeWebSources(webSources) {
  return webSources.map(source => ({
    ...source,
    origin: 'web',
    normalized_content: normalizeText(source.source_content || ''),
    fingerprint: createContentFingerprint(source.source_content || '')
  }));
}

/**
 * Normalize user document sources
 */
function normalizeDocumentSources(documents) {
  return documents.map(doc => ({
    ...doc,
    source_type: 'document',
    origin: 'user',
    normalized_content: normalizeText(doc.source_content || ''),
    fingerprint: createContentFingerprint(doc.source_content || ''),
    is_starred: true, // User documents are automatically starred
    fact_check_status: 'user-provided'
  }));
}

/**
 * Normalize text for comparison
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Create content fingerprint for duplicate detection
 */
function createContentFingerprint(content) {
  if (!content || content.length < 50) return '';

  // Take first 300 chars and last 300 chars, normalize
  const normalized = normalizeText(content);
  const start = normalized.substring(0, 300);
  const end = normalized.length > 300 ? normalized.substring(normalized.length - 300) : '';

  return `${start}|||${end}`;
}

/**
 * Find duplicate content between web and document sources
 */
function findDuplicateContent(webSources, docSources) {
  const duplicates = [];

  // Compare each document against web sources
  docSources.forEach(doc => {
    webSources.forEach(web => {
      const similarity = calculateContentSimilarity(doc, web);

      if (similarity > 0.7) {
        duplicates.push({
          type: similarity > 0.9 ? 'exact' : 'high',
          source1: {
            title: doc.source_title,
            type: 'document',
            id: doc.id
          },
          source2: {
            title: web.source_title,
            type: 'web',
            id: web.id
          },
          similarity: similarity.toFixed(2),
          action: 'keep_document', // Prefer user documents
          reason: similarity > 0.9 ? 'Content is nearly identical' : 'Significant content overlap'
        });
      }
    });
  });

  // Also check within web sources
  for (let i = 0; i < webSources.length; i++) {
    for (let j = i + 1; j < webSources.length; j++) {
      const similarity = calculateContentSimilarity(webSources[i], webSources[j]);

      if (similarity > 0.8) {
        // Keep the higher quality source
        const keepSource = webSources[i].quality_score > webSources[j].quality_score ? i : j;
        const removeSource = keepSource === i ? j : i;

        duplicates.push({
          type: 'web_duplicate',
          source1: {
            title: webSources[i].source_title,
            type: 'web',
            id: webSources[i].id
          },
          source2: {
            title: webSources[j].source_title,
            type: 'web',
            id: webSources[j].id
          },
          similarity: similarity.toFixed(2),
          action: `keep_source_${keepSource + 1}`,
          reason: 'Duplicate web content - keeping higher quality'
        });
      }
    }
  }

  return duplicates;
}

/**
 * Calculate similarity between two sources
 */
function calculateContentSimilarity(source1, source2) {
  // Use fingerprints for quick comparison
  if (source1.fingerprint && source2.fingerprint) {
    const fp1Parts = source1.fingerprint.split('|||');
    const fp2Parts = source2.fingerprint.split('|||');

    const startSim = calculateTextSimilarity(fp1Parts[0], fp2Parts[0]);
    const endSim = fp1Parts[1] && fp2Parts[1] ? calculateTextSimilarity(fp1Parts[1], fp2Parts[1]) : startSim;

    return (startSim + endSim) / 2;
  }

  // Fallback to full content comparison
  return calculateTextSimilarity(
    source1.normalized_content || '',
    source2.normalized_content || ''
  );
}

/**
 * Calculate text similarity using Jaccard coefficient
 */
function calculateTextSimilarity(text1, text2) {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Deduplicate and merge sources
 */
function deduplicateAndMerge(webSources, docSources, duplicates, options) {
  const { prioritizeDocuments } = options;

  // Create set of IDs to remove based on duplicates
  const idsToRemove = new Set();

  duplicates.forEach(dup => {
    if (dup.action === 'keep_document') {
      // Remove the web source
      idsToRemove.add(dup.source2.id);
    } else if (dup.action.startsWith('keep_source_')) {
      // For web duplicates, remove the lower quality one
      const keepIdx = parseInt(dup.action.split('_')[2]) - 1;
      const removeSource = keepIdx === 0 ? dup.source2 : dup.source1;
      idsToRemove.add(removeSource.id);
    }
  });

  // Filter out duplicates
  const filteredWeb = webSources.filter(s => !idsToRemove.has(s.id));
  const filteredDocs = docSources.filter(s => !idsToRemove.has(s.id));

  console.log(`Filtered: ${webSources.length - filteredWeb.length} web sources, ${docSources.length - filteredDocs.length} documents`);

  // Merge arrays
  if (prioritizeDocuments) {
    return [...filteredDocs, ...filteredWeb];
  } else {
    return [...filteredWeb, ...filteredDocs];
  }
}

/**
 * Prioritize sources by quality and relevance
 */
function prioritizeSources(sources) {
  return sources.sort((a, b) => {
    // First, sort by starred status
    if (a.is_starred !== b.is_starred) {
      return b.is_starred ? 1 : -1;
    }

    // Then by source type (documents > synthesis > web)
    const typeOrder = { document: 3, synthesis: 2, web: 1 };
    const aTypeScore = typeOrder[a.source_type] || 0;
    const bTypeScore = typeOrder[b.source_type] || 0;

    if (aTypeScore !== bTypeScore) {
      return bTypeScore - aTypeScore;
    }

    // Then by quality score
    const aQuality = a.quality_score || 0.5;
    const bQuality = b.quality_score || 0.5;

    if (Math.abs(aQuality - bQuality) > 0.05) {
      return bQuality - aQuality;
    }

    // Finally by word count
    const aWords = a.word_count || 0;
    const bWords = b.word_count || 0;

    return bWords - aWords;
  });
}

/**
 * Generate merge statistics
 */
function generateMergeStats(webSources, docSources, duplicates, final) {
  const totalWords = final.reduce((sum, s) => sum + (s.word_count || 0), 0);
  const totalChars = final.reduce((sum, s) => sum + (s.content_length || 0), 0);

  return {
    input: {
      webSources: webSources.length,
      documents: docSources.length,
      total: webSources.length + docSources.length
    },
    processing: {
      duplicatesFound: duplicates.length,
      exactDuplicates: duplicates.filter(d => d.type === 'exact').length,
      highSimilarity: duplicates.filter(d => d.type === 'high').length,
      webDuplicates: duplicates.filter(d => d.type === 'web_duplicate').length
    },
    output: {
      totalSources: final.length,
      documents: final.filter(s => s.source_type === 'document').length,
      synthesis: final.filter(s => s.source_type === 'synthesis').length,
      web: final.filter(s => s.source_type === 'web').length,
      starred: final.filter(s => s.is_starred).length,
      verified: final.filter(s => s.fact_check_status === 'verified').length
    },
    content: {
      totalWords,
      totalChars,
      averageWordsPerSource: Math.round(totalWords / final.length),
      averageQuality: (final.reduce((sum, s) => sum + (s.quality_score || 0.5), 0) / final.length).toFixed(2)
    }
  };
}

/**
 * Validate merged research meets requirements
 */
function validateMergedResearch(mergedResult, targetDuration) {
  const { sources, stats } = mergedResult;

  const requirements = {
    35: { minWords: 7000, minSources: 10 },
    40: { minWords: 8500, minSources: 12 },
    45: { minWords: 10000, minSources: 15 },
    50: { minWords: 11500, minSources: 17 },
    60: { minWords: 13000, minSources: 20 }
  };

  const duration = Math.ceil(targetDuration / 60);
  const threshold = Object.keys(requirements).map(Number).find(t => duration <= t) || 60;
  const reqs = requirements[threshold];

  return {
    meetsRequirements: stats.content.totalWords >= reqs.minWords && stats.output.totalSources >= reqs.minSources,
    requirements: reqs,
    actual: {
      words: stats.content.totalWords,
      sources: stats.output.totalSources
    },
    gaps: {
      words: Math.max(0, reqs.minWords - stats.content.totalWords),
      sources: Math.max(0, reqs.minSources - stats.output.totalSources)
    }
  };
}

module.exports = {
  mergeResearchSources,
  findDuplicateContent,
  validateMergedResearch,
  prioritizeSources
};
