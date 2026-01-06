/**
 * Intelligent Script Expansion Handler
 *
 * Expands short scripts by identifying gaps and generating targeted content,
 * rather than blindly regenerating the entire script.
 */

/**
 * Analyze script to identify content gaps and under-developed sections
 */
function analyzeContentGaps(script, contentPoints, targetWords, chunkInfo = null) {
  const currentWords = script.split(/\s+/).length;
  const wordsNeeded = targetWords - currentWords;

  const gaps = [];

  // If this is the last chunk, prioritize Description and Tags
  const isLastChunk = chunkInfo && chunkInfo.isLast;

  // Check if each content point is adequately covered
  if (contentPoints && contentPoints.length > 0) {
    contentPoints.forEach((point, index) => {
      const pointTitle = point.title || point.name || `Point ${index + 1}`;
      const expectedWordsPerPoint = Math.floor(targetWords / contentPoints.length);

      // Check if this point appears in the script
      const hasPoint = script.toLowerCase().includes(pointTitle.toLowerCase());

      if (!hasPoint) {
        gaps.push({
          type: 'missing_section',
          title: pointTitle,
          description: point.description || '',
          priority: 'high',
          estimatedWords: expectedWordsPerPoint
        });
      } else {
        // Check if point is developed enough
        // Find the full section (from this title to next ### or ## header)
        const escapedTitle = pointTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const sectionRegex = new RegExp(
          `###\\s+.*?${escapedTitle}.*?(?=\\n###|\\n##|$)`,
          'is'
        );
        const sectionMatch = script.match(sectionRegex);

        if (sectionMatch) {
          const sectionWords = sectionMatch[0].split(/\s+/).length;
          // Only flag as underdeveloped if less than 40% of expected words
          // (previously was 50%, which was too aggressive)
          if (sectionWords < expectedWordsPerPoint * 0.4) {
            gaps.push({
              type: 'underdeveloped_section',
              title: pointTitle,
              description: point.description || '',
              priority: 'medium',
              estimatedWords: Math.floor(expectedWordsPerPoint * 0.4)
            });
          }
        }
      }
    });
  }

  // Check for missing structural elements - ONLY for last chunk
  if (isLastChunk) {
    if (!script.includes('## Description')) {
      gaps.push({
        type: 'missing_description',
        title: 'Video Description',
        description: 'Complete description with timestamps for ENTIRE video',
        priority: 'critical',  // Critical for last chunk
        estimatedWords: 150
      });
    }

    if (!script.includes('## Tags')) {
      gaps.push({
        type: 'missing_tags',
        title: 'Tags Section',
        description: '20+ relevant tags separated by commas - NO placeholders, NO brackets',
        priority: 'critical',  // Critical for last chunk
        estimatedWords: 50
      });
    }
  }

  // If no gaps found but script is short, add a general expansion gap
  if (gaps.length === 0 && wordsNeeded > 50) {  // Lower threshold from 100 to 50
    // Find all existing sections to expand
    const sectionMatches = script.match(/###\s+[^\n]+/g) || [];

    if (sectionMatches.length > 0) {
      // Add general expansion for existing sections
      const wordsPerSection = Math.ceil(wordsNeeded / sectionMatches.length);

      gaps.push({
        type: 'general_expansion',
        title: 'Expand All Sections',
        description: `Add more details, examples, statistics, and explanations to ALL existing sections. Target: ${wordsPerSection} additional words per section. Be specific and detailed.`,
        priority: 'critical',  // Changed from 'high' to 'critical' for urgency
        estimatedWords: wordsNeeded,
        sectionCount: sectionMatches.length
      });
    } else {
      // No sections found, add content expansion
      gaps.push({
        type: 'content_expansion',
        title: 'Expand Script Content',
        description: 'Add more comprehensive details, specific examples, case studies, statistics with sources, deeper technical explanations, and additional context throughout the script',
        priority: 'critical',  // Changed from 'high' to 'critical'
        estimatedWords: wordsNeeded
      });
    }
  }

  // Sort gaps by priority (critical first)
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    gaps,
    wordsNeeded,
    currentWords,
    targetWords,
    gapCount: gaps.length
  };
}

/**
 * Generate expansion content for identified gaps
 */
async function generateExpansion(script, gapAnalysis, research, apiKey, model = process.env.BALANCED_MODEL || 'claude-sonnet-4-5-20250929', chunkInfo = null) {
  const { gaps, wordsNeeded } = gapAnalysis;

  if (gaps.length === 0) {
    return null;
  }

  // Take top 3 gaps to focus on
  const topGaps = gaps.slice(0, 3);
  const wordsPerGap = Math.floor(wordsNeeded / topGaps.length);

  // Add chunk-specific context if provided
  const chunkContext = chunkInfo ? `
IMPORTANT CONTEXT:
- This is chunk ${chunkInfo.chunkNumber} of ${chunkInfo.totalChunks}
- Time segment: minutes ${chunkInfo.startTime}-${chunkInfo.endTime}
- ${chunkInfo.isLast ? 'This is the FINAL chunk - MUST include ## Description and ## Tags sections!' : ''}
- ${chunkInfo.isFirst ? 'This is the FIRST chunk - focus on introduction and setup' : ''}
${chunkInfo.previouslyCoveredSections ? `
DO NOT ADD CONTENT FOR THESE SECTIONS (already covered in previous chunks):
${chunkInfo.previouslyCoveredSections.join('\n- ')}` : ''}
` : '';

  const expansionPrompt = `You are expanding a YouTube script that is currently ${gapAnalysis.currentWords} words but needs to be ${gapAnalysis.targetWords} words.
${chunkContext}
CURRENT SCRIPT (DO NOT REWRITE THIS):
${script}

GAPS IDENTIFIED:
${topGaps.map((gap, i) => `
${i + 1}. ${gap.title} (${gap.type})
   Description: ${gap.description}
   Needs: ~${gap.estimatedWords} words
   Priority: ${gap.priority}
`).join('\n')}

YOUR TASK:
Write EXACTLY ${wordsNeeded} words (NO LESS!) to fill these gaps.

ABSOLUTE REQUIREMENT: ${wordsNeeded} WORDS
MANDATORY: You MUST write ${wordsNeeded} words of NEW content
CRITICAL: Scripts shorter than ${wordsNeeded} words will be REJECTED
COUNT YOUR WORDS: Keep track as you write to ensure you meet the requirement

This is NON-NEGOTIABLE. Write detailed, comprehensive, expansive content.
DO NOT stop early. DO NOT say "continuing..." or use placeholders.

For each gap:

1. **${topGaps[0]?.title}** - Write ${topGaps[0]?.estimatedWords || wordsPerGap} words
   ${topGaps[0]?.type === 'missing_section'
     ? 'Create this entire section from scratch with full details.'
     : topGaps[0]?.type === 'underdeveloped_section'
       ? 'EXPAND the existing section with additional details - do NOT create a duplicate section header. Add content that builds on what\'s already there.'
       : topGaps[0]?.type === 'general_expansion'
         ? `EXPAND ALL EXISTING SECTIONS: You MUST add ${Math.ceil(topGaps[0].estimatedWords / (topGaps[0].sectionCount || 4))} words to EACH section.

           FOR EACH EXISTING SECTION, ADD ALL OF THE FOLLOWING:
           - 2-3 specific examples with real names, dates, locations, and numbers
           - 3-4 relevant statistics with percentages and data sources
           - Step-by-step technical breakdowns and explanations
           - A detailed case study or real-world scenario (100+ words)
           - Expert quotes, testimonials, or industry analysis
           - Historical context, timeline, or background information
           - Visual descriptions ("imagine...", "picture this...", "visualize...")
           - Common misconceptions and clarifications
           - Comparisons and analogies to make concepts clearer
           - Potential implications and future considerations

           CRITICAL: You MUST expand EVERY section that exists. DO NOT skip any section.
           DO NOT create new sections - expand what exists!
           Each section needs ${Math.ceil(topGaps[0].estimatedWords / (topGaps[0].sectionCount || 4))} MORE words.`
         : topGaps[0]?.type === 'content_expansion'
           ? `ADD ${topGaps[0].estimatedWords} WORDS throughout the entire script:

             MANDATORY ADDITIONS (include ALL):
             - Expand introduction: Add 150+ words with compelling hook, shocking statistics, preview of key points
             - For EACH main point: Add 200+ words including:
               - Detailed explanation with technical depth
               - 2-3 specific real-world examples
               - Supporting data and statistics
               - Expert perspective or quote
               - Common mistakes to avoid
               - Actionable tips and implementation steps
             - Add transition paragraphs: 50+ words between major sections
             - Include storytelling: Personal anecdotes, case studies, success/failure stories
             - Add visual cues: "Imagine...", "Picture this...", "Let me paint you a picture..."
             - Expand conclusion: 150+ words with summary, key takeaways, call-to-action

             TOTAL REQUIRED: ${topGaps[0].estimatedWords} additional words
             Write DETAILED, COMPREHENSIVE expansions. Do NOT use placeholders.`
           : 'Expand on this section with more examples, explanations, and details.'}

${topGaps[1] ? `2. **${topGaps[1].title}** - Write ${topGaps[1].estimatedWords || wordsPerGap} words
   ${topGaps[1].type === 'missing_section'
     ? 'Create this entire section from scratch with full details.'
     : topGaps[1].type === 'underdeveloped_section'
       ? 'EXPAND the existing section with additional details - do NOT create a duplicate section header. Add content that builds on what\'s already there.'
       : 'Expand on this section with more examples, explanations, and details.'}` : ''}

${topGaps[2] ? `3. **${topGaps[2].title}** - Write ${topGaps[2].estimatedWords || wordsPerGap} words
   ${topGaps[2].type === 'missing_section'
     ? 'Create this entire section from scratch with full details.'
     : topGaps[2].type === 'underdeveloped_section'
       ? 'EXPAND the existing section with additional details - do NOT create a duplicate section header. Add content that builds on what\'s already there.'
       : 'Expand on this section with more examples, explanations, and details.'}` : ''}

REQUIREMENTS:
- Write ONLY the new content (don't rewrite existing script)
- Label each section with proper headers:
  * Use "## Tags" for tags section (NOT "### Tags" or "Tags Section")
  * Use "## Description" for description section
  * Use "###" for other content sections
- Be specific and detailed
- Include examples and explanations
- Maintain the same tone and style as the original
- Write ALL ${wordsNeeded} words needed

CRITICAL TAGS FORMATTING (if generating tags):
- Use EXACTLY this format: ## Tags
- Then list 20+ comma-separated tags with NO brackets, NO placeholders
- Example: cyber attacks, hacktivism, India Pakistan, border tensions, cybersecurity
- DO NOT write: [tag1, tag2, ...] or [20+ tags here]

${chunkInfo && chunkInfo.isLast ? `
FINAL CHUNK CRITICAL REQUIREMENT:
You MUST include BOTH:
1. ## Description section with complete video description and timestamps for ENTIRE video
2. ## Tags section with 20+ actual tags (no placeholders)

These are MANDATORY for the last chunk. The script will be rejected if these are missing!` : ''}

${research?.sources ? `
RESEARCH SOURCES TO USE:
${research.sources.slice(0, 5).map(s => `- ${s.source_title}: ${s.source_content?.substring(0, 200)}...`).join('\n')}
` : ''}

Write the expansion content now:`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: Math.min(8192, Math.ceil(wordsNeeded * 2.0)), // More generous token allowance
        temperature: 0.8, // Higher temp for more detailed expansion
        messages: [{
          role: 'user',
          content: expansionPrompt
        }]
      })
    });

    if (!response.ok) {
      console.error('Expansion API error:', await response.text());
      return null;
    }

    const data = await response.json();
    let expansionContent = data.content?.[0]?.text || '';

    // Filter out meta-commentary that shouldn't appear in final script
    expansionContent = expansionContent
      .replace(/^I'll expand.*?(?:additional words?|content|sections?):\s*/gim, '')
      .replace(/^\[?Continuing from.*?\]\.?\.\.\s*/gim, '')
      .replace(/^Here'?s? the (additional|expanded|new) .*?:\s*/gim, '')
      .replace(/^Let me (expand|add|continue).*?:\s*/gim, '')
      .trim();

    return expansionContent;
  } catch (error) {
    console.error('Error generating expansion:', error);
    return null;
  }
}

/**
 * Intelligently insert expansion content into the script
 */
function insertExpansion(originalScript, expansionContent, gapAnalysis) {
  if (!expansionContent) {
    return originalScript;
  }

  // Check if this is a general expansion (needs special handling)
  const isGeneralExpansion = gapAnalysis.gaps.some(g =>
    g.type === 'general_expansion' || g.type === 'content_expansion'
  );

  if (isGeneralExpansion) {
    // For general expansions, the content should be merged more intelligently
    // If the expansion has section headers, try to merge with existing sections
    const expansionSections = expansionContent.split(/(?=###\s+)/);
    let enhancedScript = originalScript;

    expansionSections.forEach(section => {
      if (section.trim()) {
        // Extract section title if it exists
        const titleMatch = section.match(/###\s+(.+?)(?:\n|$)/);

        if (titleMatch) {
          const sectionTitle = titleMatch[1].trim();
          const sectionContent = section.replace(titleMatch[0], '').trim();

          // Find matching section in original script
          const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const existingRegex = new RegExp(`(###\\s+${escapedTitle}[^\n]*)([^#]+?)(?=###|##|$)`, 'is');

          if (existingRegex.test(enhancedScript)) {
            // Merge with existing section
            enhancedScript = enhancedScript.replace(existingRegex, (match, header, content) => {
              return header + content + '\n\n' + sectionContent + '\n';
            });
          } else {
            // Add as new content before Description/Tags
            const insertPoint = enhancedScript.indexOf('## Description') !== -1
              ? enhancedScript.indexOf('## Description')
              : enhancedScript.indexOf('## Tags') !== -1
              ? enhancedScript.indexOf('## Tags')
              : enhancedScript.length;

            enhancedScript = enhancedScript.slice(0, insertPoint) +
                           '\n\n' + section +
                           enhancedScript.slice(insertPoint);
          }
        } else {
          // No section header, append the content before Description/Tags
          const insertPoint = enhancedScript.indexOf('## Description') !== -1
            ? enhancedScript.indexOf('## Description')
            : enhancedScript.indexOf('## Tags') !== -1
            ? enhancedScript.indexOf('## Tags')
            : enhancedScript.length;

          enhancedScript = enhancedScript.slice(0, insertPoint) +
                         '\n\n' + section +
                         enhancedScript.slice(insertPoint);
        }
      }
    });

    return enhancedScript;
  }

  // Check if expansion already has proper ## headers (for tags/description)
  const hasProperHeaders = /^##\s+(Tags|Description)/m.test(expansionContent);

  if (hasProperHeaders) {
    // Expansion already has correct formatting, append directly
    return originalScript + '\n\n' + expansionContent;
  }

  // Split expansion into sections if it has ### headers
  const sections = expansionContent.split(/###\s+/);

  let enhancedScript = originalScript;

  // Try to insert each section in the appropriate place
  gapAnalysis.gaps.forEach((gap, index) => {
    if (index >= sections.length) return;

    const section = sections[index + 1] || sections[index]; // sections[0] might be empty
    if (!section) return;

    // Check if this section already exists in the script (to prevent duplicates)
    const existingSectionRegex = new RegExp(`###\\s+${gap.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    const sectionExists = existingSectionRegex.test(enhancedScript);

    // Use proper header format based on gap type
    let sectionWithHeader;
    if (gap.type === 'missing_tags') {
      // Tags needs ## header, not ###
      sectionWithHeader = `\n\n## Tags\n${section}`;
    } else if (gap.type === 'missing_description') {
      // Description needs ## header
      sectionWithHeader = `\n\n## Description\n${section}`;
    } else if (sectionExists && gap.type === 'underdeveloped_section') {
      // Section exists but is underdeveloped - merge content instead of creating duplicate
      // Find the section and append content after it (before next ### or ## header)
      const sectionMatch = enhancedScript.match(new RegExp(
        `(###\\s+${gap.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?)(?=\\n###|\\n##|$)`,
        'is'
      ));

      if (sectionMatch) {
        const existingSection = sectionMatch[1];
        const expandedSection = existingSection + '\n\n' + section.trim();
        enhancedScript = enhancedScript.replace(existingSection, expandedSection);
      } else {
        // Fallback to simple replacement if regex fails
        enhancedScript = enhancedScript.replace(
          existingSectionRegex,
          `$&\n\n${section.trim()}`
        );
      }
      return; // Skip the normal insertion logic below
    } else if (!sectionExists) {
      // Only add new section if it doesn't exist
      // Regular content uses ###
      sectionWithHeader = `\n\n### ${section}`;
    } else {
      // Section exists but gap type isn't underdeveloped - skip to avoid duplicates
      return;
    }

    if (gap.type === 'missing_description') {
      // Insert before any existing ## Description or at the end
      if (enhancedScript.includes('## Description')) {
        enhancedScript = enhancedScript.replace('## Description', `${sectionWithHeader}\n\n## Description`);
      } else if (enhancedScript.includes('## Tags')) {
        enhancedScript = enhancedScript.replace('## Tags', `${sectionWithHeader}\n\n## Tags`);
      } else {
        enhancedScript += sectionWithHeader;
      }
    } else if (gap.type === 'missing_tags') {
      // Insert at the very end (tags are always last)
      enhancedScript += sectionWithHeader;
    } else {
      // Insert near related content or at the end of main content
      const insertPoint = enhancedScript.indexOf('## Description') !== -1
        ? enhancedScript.indexOf('## Description')
        : enhancedScript.indexOf('## Tags') !== -1
        ? enhancedScript.indexOf('## Tags')
        : enhancedScript.length;

      enhancedScript =
        enhancedScript.slice(0, insertPoint) +
        sectionWithHeader +
        '\n\n' +
        enhancedScript.slice(insertPoint);
    }
  });

  return enhancedScript;
}

/**
 * Main function: Expand a short script intelligently
 */
async function expandShortScript(script, contentPoints, targetWords, research, apiKey, model, chunkInfo = null) {
  // Analyze what's missing (with chunk context)
  const gapAnalysis = analyzeContentGaps(script, contentPoints, targetWords, chunkInfo);

  if (gapAnalysis.wordsNeeded <= 0) {
    return script;
  }

  if (gapAnalysis.gapCount === 0) {
    return script;
  }

  // Generate expansion content with chunk context
  const expansionContent = await generateExpansion(script, gapAnalysis, research, apiKey, model, chunkInfo);

  if (!expansionContent) {
    return script;
  }

  // Insert expansion into script
  const enhancedScript = insertExpansion(script, expansionContent, gapAnalysis);

  return enhancedScript;
}

module.exports = {
  analyzeContentGaps,
  generateExpansion,
  insertExpansion,
  expandShortScript
};
