/**
 * Comprehensive Outline Generator for Long-Form Scripts
 * TypeScript port for Supabase Edge Functions (Deno runtime)
 *
 * Ported from: src/lib/script-generation/outline-generator.js
 * Purpose: Generates detailed outlines for 30+ minute videos BEFORE chunk generation
 *          to ensure perfect coordination and eliminate duplicates
 */

import { ContentPoint } from './prompt-generator.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface OutlineSection {
  timestamp: string;
  title: string;
  duration: number;
  content: string;
  keyPoints?: string[];
  visualCues?: string;
  narrativeNote?: string;
}

export interface OutlineChunk {
  chunkNumber: number;
  timeRange: string;
  theme?: string;
  sections: OutlineSection[];
  transitionToNext?: string;
}

export interface ComprehensiveOutline {
  title: string;
  totalMinutes: number;
  overview: string;
  chunks: OutlineChunk[];
  keyTakeaways: string[];
}

export interface ChunkSections {
  sections: OutlineSection[];
  theme?: string;
  transitionToNext?: string;
  timeRange: string;
}

export interface ForbiddenSection {
  title: string;
  assignedToChunk: number;
  timeRange: string;
}

export interface OutlineGenerationParams {
  title: string;
  topic: string;
  contentPoints?: ContentPoint[];
  totalMinutes: number;
  chunkCount: number;
  research?: {
    summary?: string;
    sources?: Array<{
      source_title?: string;
      source_content?: string;
    }>;
  };
  hook?: string;
  targetAudience?: string;
  tone?: string;
  apiKey: string;
  model?: string;
}

// ============================================================================
// MAIN OUTLINE GENERATION
// ============================================================================

/**
 * Generate a comprehensive outline for the entire video
 */
export async function generateComprehensiveOutline(
  params: OutlineGenerationParams
): Promise<ComprehensiveOutline | null> {
  const {
    title,
    topic,
    contentPoints = [],
    totalMinutes,
    chunkCount,
    research,
    hook,
    targetAudience,
    tone,
    apiKey,
    model = Deno.env.get('BALANCED_MODEL') || 'claude-sonnet-4-5-20250929'
  } = params;

  console.log('📝 Generating comprehensive outline for entire video...');
  console.log(`   Total duration: ${totalMinutes} minutes across ${chunkCount} chunks`);

  const minutesPerChunk = Math.ceil(totalMinutes / chunkCount);

  // Create the outline generation prompt
  const outlinePrompt = `You are creating a DETAILED OUTLINE for a ${totalMinutes}-minute YouTube video that will be generated in ${chunkCount} chunks.

VIDEO DETAILS:
- Title: ${title}
- Topic: ${topic}
- Target Audience: ${targetAudience || 'General YouTube viewers'}
- Tone: ${tone || 'Informative and engaging'}
- Hook: ${hook || 'Create compelling hook'}

CONTENT POINTS TO COVER:
${contentPoints && contentPoints.length > 0 ?
  contentPoints.map((point, idx) => `
${idx + 1}. ${point.title || point.name || 'Topic ' + idx}
   - Description: ${point.description || 'N/A'}
   - Duration: ${point.duration ? Math.ceil(point.duration / 60) + ' minutes' : 'Flexible'}
   - Key Takeaway: ${point.keyTakeaway || 'N/A'}`
  ).join('') :
  'No specific content points provided - create logical sections based on the topic.'}

CHUNK STRUCTURE:
${Array.from({ length: chunkCount }, (_, i) => {
  const startTime = i * minutesPerChunk;
  const endTime = Math.min((i + 1) * minutesPerChunk, totalMinutes);
  return `Chunk ${i + 1}: Minutes ${startTime}-${endTime} (${endTime - startTime} minutes)`;
}).join('\n')}

YOUR TASK:
Create a DETAILED outline that:
1. Assigns each content point to EXACTLY ONE chunk (no duplicates!)
2. **MUST USE THE EXACT TITLES FROM CONTENT POINTS ABOVE** - DO NOT MODIFY OR PARAPHRASE THEM!
3. Includes specific timestamps for each section
4. Provides clear transitions between chunks
5. Balances content across chunks
6. Ensures logical narrative flow

⚠️ CRITICAL TITLE REQUIREMENT:
You MUST use the EXACT titles from the content points list above as your section titles.
DO NOT create your own variations or paraphrases.
For example, if the content point says "20 Minutes to Breach: The AWS Server That Exposed .gov Personnel",
your section title MUST be EXACTLY "20 Minutes to Breach: The AWS Server That Exposed .gov Personnel"
NOT "The 20-Minute Government Data Breach" or any other variation!

CRITICAL REQUIREMENTS:
- **USE EXACT TITLES FROM CONTENT POINTS** (word-for-word, including punctuation)
- Each section must appear in ONLY ONE chunk
- Include transition notes between chunks
- Chunk 1 must have introduction/hook
- Last chunk must have conclusion/CTA
- Each chunk should be roughly equal in content density

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Full Video Title",
  "totalMinutes": ${totalMinutes},
  "overview": "One paragraph summary of entire video",
  "chunks": [
    {
      "chunkNumber": 1,
      "timeRange": "0:00-${minutesPerChunk}:00",
      "theme": "Opening theme/focus",
      "sections": [
        {
          "timestamp": "0:00",
          "title": "EXACT TITLE FROM CONTENT POINTS - USE VERBATIM",
          "duration": 3,
          "content": "What to cover in this section",
          "keyPoints": [
            "Specific point 1",
            "Specific point 2"
          ],
          "visualCues": "[Visual: Description]",
          "narrativeNote": "How to present this"
        }
      ],
      "transitionToNext": "How to bridge to chunk 2"
    }
  ],
  "keyTakeaways": [
    "Main takeaway 1",
    "Main takeaway 2",
    "Main takeaway 3"
  ]
}

CONTENT EXPANSION GUIDELINES:
For each section, specify:
- Opening hook or dramatic statement
- Key statistics to cite
- Specific examples or case studies to include
- Technical details to explain
- Historical context to provide
- Expert perspectives to reference
- Visual descriptions for engagement

Remember:
- Be VERY specific with section titles (they will be enforced)
- Provide DETAILED content descriptions (not just topics)
- Each section needs 500-800 words of content guidance
- Include specific examples, not general topics
- Transitions are critical for flow between chunks`;

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
        max_tokens: 4096,
        temperature: 0.3, // Lower temperature for consistent structure
        messages: [{
          role: 'user',
          content: outlinePrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Outline generation API error:', errorText);
      return null;
    }

    const data = await response.json();
    const outlineText = data.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = outlineText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse outline JSON from response');
      return null;
    }

    try {
      const outline = JSON.parse(jsonMatch[0]) as ComprehensiveOutline;

      // Validate outline structure
      if (!validateOutlineStructure(outline)) {
        console.error('Invalid outline structure');
        return null;
      }

      // Log the outline summary
      logOutlineSummary(outline);

      return outline;
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Raw response:', outlineText.substring(0, 500));
      return null;
    }
  } catch (error) {
    console.error('Outline generation error:', error);
    return null;
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that the outline has the correct structure
 */
export function validateOutlineStructure(outline: any): outline is ComprehensiveOutline {
  if (!outline || typeof outline !== 'object') return false;
  if (!outline.chunks || !Array.isArray(outline.chunks)) return false;
  if (!outline.totalMinutes || typeof outline.totalMinutes !== 'number') return false;

  // Validate each chunk
  for (const chunk of outline.chunks) {
    if (!chunk.chunkNumber || !chunk.sections || !Array.isArray(chunk.sections)) {
      return false;
    }

    // Validate sections
    for (const section of chunk.sections) {
      if (!section.title || !section.timestamp || !section.content) {
        return false;
      }
    }
  }

  return true;
}

// ============================================================================
// LOGGING AND DEBUGGING
// ============================================================================

/**
 * Log a summary of the generated outline
 */
export function logOutlineSummary(outline: ComprehensiveOutline): void {
  console.log('\n📋 OUTLINE GENERATED SUCCESSFULLY:');
  console.log('='.repeat(60));
  console.log(`Title: ${outline.title}`);
  console.log(`Duration: ${outline.totalMinutes} minutes`);
  console.log(`Chunks: ${outline.chunks.length}`);

  outline.chunks.forEach(chunk => {
    console.log(`\n📌 Chunk ${chunk.chunkNumber} (${chunk.timeRange}):`);
    if (chunk.theme) {
      console.log(`   Theme: ${chunk.theme}`);
    }
    chunk.sections.forEach(section => {
      console.log(`   [${section.timestamp}] ${section.title} (${section.duration}min)`);
    });
    if (chunk.transitionToNext) {
      console.log(`   → Transition: ${chunk.transitionToNext}`);
    }
  });

  console.log('\n' + '='.repeat(60));
}

// ============================================================================
// OUTLINE EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract sections for a specific chunk from the outline
 */
export function getChunkSections(
  outline: ComprehensiveOutline | null,
  chunkNumber: number
): ChunkSections | null {
  if (!outline || !outline.chunks) return null;

  const chunk = outline.chunks.find(c => c.chunkNumber === chunkNumber);
  if (!chunk) return null;

  return {
    sections: chunk.sections,
    theme: chunk.theme,
    transitionToNext: chunk.transitionToNext,
    timeRange: chunk.timeRange
  };
}

/**
 * Get forbidden sections for a chunk (sections assigned to other chunks)
 */
export function getForbiddenSections(
  outline: ComprehensiveOutline | null,
  chunkNumber: number
): ForbiddenSection[] {
  if (!outline || !outline.chunks) return [];

  const forbiddenSections: ForbiddenSection[] = [];

  outline.chunks.forEach(chunk => {
    if (chunk.chunkNumber !== chunkNumber) {
      chunk.sections.forEach(section => {
        forbiddenSections.push({
          title: section.title,
          assignedToChunk: chunk.chunkNumber,
          timeRange: chunk.timeRange
        });
      });
    }
  });

  return forbiddenSections;
}

// ============================================================================
// PROMPT FORMATTING
// ============================================================================

/**
 * Format outline sections for inclusion in chunk prompt
 */
export function formatOutlineForPrompt(
  outline: ComprehensiveOutline | null,
  chunkNumber: number
): string {
  const chunkData = getChunkSections(outline, chunkNumber);
  const forbiddenSections = getForbiddenSections(outline, chunkNumber);

  if (!chunkData) return '';

  let prompt = `
🚨🚨🚨 MANDATORY OUTLINE FOR CHUNK ${chunkNumber} - TOPIC ENFORCEMENT 🚨🚨🚨
${'='.repeat(60)}

⚡ CRITICAL TOPIC ENFORCEMENT:
You MUST write about the EXACT topics specified below. Any deviation from these topics will result in IMMEDIATE REJECTION.

📋 YOUR EXACT OUTLINE FOR CHUNK ${chunkNumber}:
${'='.repeat(60)}

Time Range: ${chunkData.timeRange}
${chunkData.theme ? `MANDATORY THEME: ${chunkData.theme}` : ''}

✅ SECTIONS YOU MUST WRITE (NO SUBSTITUTIONS):
${chunkData.sections.map((section, idx) => {
  const sectionWords = Math.ceil(section.duration * 130);
  return `
${idx + 1}. [${section.timestamp}] "${section.title}" (${section.duration} minutes)

   🔴 MANDATORY: Start this section with the EXACT header:
   ### ${section.title}

   📊 WORD COUNT: This section MUST be ${sectionWords}+ words (${section.duration} min × 130 WPM)

   ⚡ MANDATORY CONTENT: ${section.content}
   ${section.keyPoints && section.keyPoints.length > 0 ?
     `⚡ REQUIRED KEY POINTS:\n${section.keyPoints.map(point => `   ✓ ${point}`).join('\n')}` : ''}
   ${section.visualCues ? `📺 REQUIRED VISUAL: ${section.visualCues}` : ''}
   ${section.narrativeNote ? `📝 NARRATIVE INSTRUCTION: ${section.narrativeNote}` : ''}

   📝 EXPANSION REQUIREMENTS:
   - Provide DETAILED explanations for each point
   - Include SPECIFIC examples and case studies
   - Add RELEVANT statistics and data
   - Expand with CONTEXT and background
   - DO NOT rush through points - elaborate thoroughly

   ⛔ DO NOT: Write about any other topic instead of "${section.title}"
   ⛔ DO NOT: Skip or replace this section
   ⛔ DO NOT: Merge with other sections
   ⛔ DO NOT: Use a different title - MUST use exactly: "${section.title}"
   ⛔ DO NOT: Write less than ${sectionWords} words for this section`;
}).join('\n')}

${chunkData.transitionToNext ? `
🔄 MANDATORY TRANSITION TO NEXT CHUNK:
${chunkData.transitionToNext}
` : ''}

❌ ABSOLUTELY FORBIDDEN TOPICS (WILL CAUSE REJECTION):
${forbiddenSections.map(forbidden =>
  `🚫 "${forbidden.title}" - Reserved for Chunk ${forbidden.assignedToChunk} ONLY`
).join('\n')}

${'='.repeat(60)}
⚡⚡⚡ ENFORCEMENT RULES:
1. You MUST write about EVERY section listed above IN ORDER
2. Each section MUST start with ### followed by the EXACT title given
3. Each section MUST match its content description EXACTLY
4. You MUST NOT write about topics from other chunks
5. You MUST include ALL key points specified
6. NEVER paraphrase or modify section titles - use them VERBATIM
7. Each section MUST meet its individual word count requirement
8. Total chunk MUST be ${Math.ceil(chunkData.sections.reduce((sum, s) => sum + s.duration, 0) * 130)} words MINIMUM
9. Deviation from this outline = IMMEDIATE REJECTION

TOPIC CHECK: This chunk is about "${chunkData.theme || 'the assigned topics'}" - NOT about any other topic!
${'='.repeat(60)}
`;

  return prompt;
}

// ============================================================================
// DATABASE STORAGE (for Edge Functions)
// ============================================================================

/**
 * Save outline to database for debugging and retrieval
 * (Replaces filesystem storage from original implementation)
 */
export async function saveOutlineToDatabase(
  supabaseClient: any,
  workflowId: string,
  outline: ComprehensiveOutline
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('script_outlines')
      .upsert({
        workflow_id: workflowId,
        outline_data: outline,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to save outline to database:', error);
      return false;
    }

    console.log(`💾 Outline saved to database for workflow: ${workflowId}`);
    return true;
  } catch (error) {
    console.error('Error saving outline to database:', error);
    return false;
  }
}

/**
 * Load outline from database
 */
export async function loadOutlineFromDatabase(
  supabaseClient: any,
  workflowId: string
): Promise<ComprehensiveOutline | null> {
  try {
    const { data, error } = await supabaseClient
      .from('script_outlines')
      .select('outline_data')
      .eq('workflow_id', workflowId)
      .single();

    if (error || !data) {
      console.error('Failed to load outline from database:', error);
      return null;
    }

    console.log(`📂 Outline loaded from database for workflow: ${workflowId}`);
    return data.outline_data as ComprehensiveOutline;
  } catch (error) {
    console.error('Error loading outline from database:', error);
    return null;
  }
}
