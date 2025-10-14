/**
 * Intelligent Script Expansion Handler
 *
 * Expands short scripts by identifying gaps and generating targeted content,
 * rather than blindly regenerating the entire script.
 */

/**
 * Analyze script to identify content gaps and under-developed sections
 */
function analyzeContentGaps(script, contentPoints, targetWords) {
  const currentWords = script.split(/\s+/).length;
  const wordsNeeded = targetWords - currentWords;

  const gaps = [];

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
        // Rough heuristic: find section and estimate its length
        const pointRegex = new RegExp(`${pointTitle}[\\s\\S]{0,1000}`, 'i');
        const pointMatch = script.match(pointRegex);

        if (pointMatch && pointMatch[0].split(/\s+/).length < expectedWordsPerPoint * 0.5) {
          gaps.push({
            type: 'underdeveloped_section',
            title: pointTitle,
            description: point.description || '',
            priority: 'medium',
            estimatedWords: Math.floor(expectedWordsPerPoint * 0.5)
          });
        }
      }
    });
  }

  // Check for missing structural elements
  if (!script.includes('## Description')) {
    gaps.push({
      type: 'missing_description',
      title: 'Video Description',
      description: 'Complete description with timestamps',
      priority: 'high',
      estimatedWords: 150
    });
  }

  if (!script.includes('## Tags')) {
    gaps.push({
      type: 'missing_tags',
      title: 'Tags Section',
      description: '20+ relevant tags',
      priority: 'medium',
      estimatedWords: 50
    });
  }

  // Sort gaps by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
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
async function generateExpansion(script, gapAnalysis, research, apiKey, model = 'claude-3-5-sonnet-20241022') {
  const { gaps, wordsNeeded, currentWords, targetWords } = gapAnalysis;

  if (gaps.length === 0) {
    console.log('No gaps identified, cannot expand');
    return null;
  }

  // Take top 3 gaps to focus on
  const topGaps = gaps.slice(0, 3);
  const wordsPerGap = Math.floor(wordsNeeded / topGaps.length);

  console.log(`📝 Generating expansion for ${topGaps.length} gaps (${wordsNeeded} words needed)`);

  const expansionPrompt = `You are expanding a YouTube script that is currently ${currentWords} words but needs to be ${targetWords} words.

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
Write ${wordsNeeded} additional words to fill these gaps. For each gap:

1. **${topGaps[0]?.title}** - Write ${topGaps[0]?.estimatedWords || wordsPerGap} words
   ${topGaps[0]?.type === 'missing_section' ? 'Create this entire section from scratch with full details.' : 'Expand on this section with more examples, explanations, and details.'}

${topGaps[1] ? `2. **${topGaps[1].title}** - Write ${topGaps[1].estimatedWords || wordsPerGap} words
   ${topGaps[1].type === 'missing_section' ? 'Create this entire section from scratch with full details.' : 'Expand on this section with more examples, explanations, and details.'}` : ''}

${topGaps[2] ? `3. **${topGaps[2].title}** - Write ${topGaps[2].estimatedWords || wordsPerGap} words
   ${topGaps[2].type === 'missing_section' ? 'Create this entire section from scratch with full details.' : 'Expand on this section with more examples, explanations, and details.'}` : ''}

REQUIREMENTS:
- Write ONLY the new content (don't rewrite existing script)
- Label each section clearly (e.g., "### ${topGaps[0]?.title}")
- Be specific and detailed
- Include examples and explanations
- Maintain the same tone and style as the original
- Write ALL ${wordsNeeded} words needed

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
        max_tokens: Math.min(8192, Math.ceil(wordsNeeded * 1.5)), // Generous token allowance
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: expansionPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expansion API error:', errorText);
      return null;
    }

    const data = await response.json();
    const expansionContent = data.content?.[0]?.text || '';

    const expansionWords = expansionContent.split(/\s+/).length;
    console.log(`✅ Expansion generated: ${expansionWords} words`);

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

  // Split expansion into sections if it has headers
  const sections = expansionContent.split(/###\s+/);

  let enhancedScript = originalScript;

  // Try to insert each section in the appropriate place
  gapAnalysis.gaps.forEach((gap, index) => {
    if (index >= sections.length) return;

    const section = sections[index + 1] || sections[index]; // sections[0] might be empty
    if (!section) return;

    const sectionWithHeader = `\n\n### ${section}`;

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
      // Insert at the very end
      enhancedScript += `\n\n${sectionWithHeader}`;
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
async function expandShortScript(script, contentPoints, targetWords, research, apiKey, model) {
  console.log('🔍 Analyzing script for expansion opportunities...');

  // Analyze what's missing
  const gapAnalysis = analyzeContentGaps(script, contentPoints, targetWords);

  console.log(`📊 Gap analysis complete:`, {
    currentWords: gapAnalysis.currentWords,
    targetWords: gapAnalysis.targetWords,
    wordsNeeded: gapAnalysis.wordsNeeded,
    gapsFound: gapAnalysis.gapCount
  });

  if (gapAnalysis.wordsNeeded <= 0) {
    console.log('✅ Script already meets target word count');
    return script;
  }

  if (gapAnalysis.gapCount === 0) {
    console.log('⚠️ No specific gaps identified, script is short but complete');
    return script;
  }

  // Generate expansion content
  const expansionContent = await generateExpansion(script, gapAnalysis, research, apiKey, model);

  if (!expansionContent) {
    console.log('❌ Failed to generate expansion content');
    return script;
  }

  // Insert expansion into script
  const enhancedScript = insertExpansion(script, expansionContent, gapAnalysis);

  const finalWords = enhancedScript.split(/\s+/).length;
  console.log(`✅ Script expanded: ${gapAnalysis.currentWords} → ${finalWords} words`);

  return enhancedScript;
}

module.exports = {
  analyzeContentGaps,
  generateExpansion,
  insertExpansion,
  expandShortScript
};
