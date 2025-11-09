/**
 * Long-form Script Generation Handler
 * TypeScript port for Supabase Edge Functions (Deno runtime)
 *
 * Ported from: src/lib/script-generation/long-form-handler.js
 * Purpose: Handles scripts over 20 minutes by splitting generation into chunks
 *
 * KEY CHANGE: All filesystem logging removed - Edge Functions log to Supabase automatically
 */

import { formatOutlineForPrompt, ComprehensiveOutline, OutlineChunk } from './outline-generator.ts';
import { ContentPoint, VoiceProfile, TargetAudience } from './prompt-generator.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ChunkConfig {
  chunks: number;
  minutesPerChunk: number;
}

export interface Sponsor {
  sponsor_name?: string;
  sponsor_product?: string;
  placement_preference?: string;
  sponsor_duration?: number;
  sponsor_message?: string;
  cta?: string;
  talking_points?: string[];
  ftc_disclosure?: string;
}

export interface ChunkContext {
  title: string;
  topic: string;
  type?: string;
  voiceProfile?: VoiceProfile | null;
  contentPoints: ContentPoint[];
  targetAudience?: string | TargetAudience | null;
  tone?: string;
  research?: any;
  frame?: string;
  sponsor?: Sponsor | null;
}

export interface ChunkPrompt {
  chunkNumber: number;
  totalChunks: number;
  startTime: number;
  endTime: number;
  duration: number;
  isFirst: boolean;
  isLast: boolean;
  context: ChunkContext;
  outline?: OutlineChunk | null;
  comprehensiveOutline?: ComprehensiveOutline | null;
  includeIntro?: boolean;
  includeConclusion?: boolean;
  hook?: string;
  previousChunkSummary?: {
    timeMarker: string;
    lastTopic: string;
    transitionNote: string;
    continuityCheck: string;
    criticalWarning: string;
  };
  previouslyCoveredSections?: string[];
}

export interface ContentPlan {
  chunks: Array<{
    assignedSections: Array<{ title: string }>;
  }>;
}

export interface GenerationConfig {
  totalMinutes: number;
  title: string;
  topic: string;
  contentPoints?: ContentPoint[];
  type?: string;
  hook?: string;
  voiceProfile?: VoiceProfile;
  targetAudience?: string | TargetAudience;
  tone?: string;
  research?: any;
  frame?: string;
  sponsor?: Sponsor;
  contentPlan?: ContentPlan;
  comprehensiveOutline?: ComprehensiveOutline;
}

export interface ValidationResult {
  isValid: boolean;
  wordCount: number;
  expectedWords: number;
  percentComplete: number;
  hasPlaceholders: boolean;
  hasTimestamps: boolean;
  hasDescription: boolean;
  hasTags: boolean;
  issues: string[];
}

// ============================================================================
// MAIN HANDLER CLASS
// ============================================================================

export class LongFormScriptHandler {
  /**
   * Determines if a script needs chunked generation
   */
  static needsChunking(durationInSeconds: number): boolean {
    const minutes = Math.ceil(durationInSeconds / 60);
    // Use chunking for scripts 20 minutes or longer for better quality
    return minutes >= 20;
  }

  /**
   * Calculates optimal chunk size for generation
   */
  static getChunkConfig(totalMinutes: number): ChunkConfig {
    if (totalMinutes < 20) {
      return { chunks: 1, minutesPerChunk: totalMinutes };
    } else if (totalMinutes <= 30) {
      return { chunks: 2, minutesPerChunk: Math.ceil(totalMinutes / 2) };
    } else if (totalMinutes <= 45) {
      return { chunks: 3, minutesPerChunk: 15 };
    } else if (totalMinutes <= 60) {
      return { chunks: 4, minutesPerChunk: 15 };
    } else {
      const chunks = Math.ceil(totalMinutes / 15);
      return { chunks, minutesPerChunk: 15 };
    }
  }

  /**
   * Generates prompts for each chunk
   */
  static generateChunkPrompts(config: GenerationConfig): string[] {
    const {
      totalMinutes,
      title,
      topic,
      contentPoints = [],
      type,
      hook,
      voiceProfile,
      targetAudience,
      tone,
      research,
      frame,
      sponsor,
      contentPlan,
      comprehensiveOutline
    } = config;

    const chunkConfig = this.getChunkConfig(totalMinutes);
    const prompts: ChunkPrompt[] = [];

    const pointsPerChunk = Math.ceil(contentPoints.length / chunkConfig.chunks);

    console.log(`📊 Content Distribution: ${contentPoints.length} points across ${chunkConfig.chunks} chunks`);
    console.log(`📊 Points per chunk: ${pointsPerChunk}`);

    if (sponsor) {
      console.log(`💰 SPONSOR DATA IN CHUNK HANDLER:`);
      console.log(`   Sponsor: ${sponsor.sponsor_name}`);
      console.log(`   Product: ${sponsor.sponsor_product}`);
      console.log(`   Placement: ${sponsor.placement_preference}`);
      console.log(`   Duration: ${sponsor.sponsor_duration}s`);
    }

    for (let i = 0; i < chunkConfig.chunks; i++) {
      const chunkStart = i * chunkConfig.minutesPerChunk;
      const chunkEnd = Math.min((i + 1) * chunkConfig.minutesPerChunk, totalMinutes);

      let chunkPoints: ContentPoint[];
      let previouslyCoveredSections: string[] = [];
      let outlineForChunk: OutlineChunk | null = null;

      // PRIORITY 1: Use comprehensive outline for 30+ minute scripts
      if (comprehensiveOutline && comprehensiveOutline.chunks && comprehensiveOutline.chunks[i]) {
        console.log(`📝 Chunk ${i + 1} using COMPREHENSIVE OUTLINE`);

        const outlineChunk = comprehensiveOutline.chunks[i];
        outlineForChunk = outlineChunk;

        if (contentPoints.length > 0) {
          chunkPoints = contentPoints.filter(point => {
            const pointTitle = point.title || point.name || '';
            return outlineChunk.sections.some(section =>
              section.title.toLowerCase().includes(pointTitle.toLowerCase()) ||
              pointTitle.toLowerCase().includes(section.title.toLowerCase())
            );
          });
        } else {
          chunkPoints = [];
        }

        previouslyCoveredSections = comprehensiveOutline.chunks
          .slice(0, i)
          .flatMap(c => c.sections.map(s => s.title));

      } else if (contentPlan && contentPlan.chunks && contentPlan.chunks[i]) {
        const plannedChunk = contentPlan.chunks[i];
        const assignedTitles = plannedChunk.assignedSections.map(s => s.title);

        chunkPoints = contentPoints.filter(point => {
          const pointTitle = point.title || point.name || '';
          return assignedTitles.some(title =>
            title.toLowerCase() === pointTitle.toLowerCase()
          );
        });

        previouslyCoveredSections = contentPlan.chunks
          .slice(0, i)
          .flatMap(c => c.assignedSections.map(s => s.title));

        console.log(`📋 Chunk ${i + 1} using PLANNED distribution: ${chunkPoints.length} sections`);
      } else {
        chunkPoints = contentPoints.slice(
          i * pointsPerChunk,
          (i + 1) * pointsPerChunk
        );

        previouslyCoveredSections = i > 0 ?
          contentPoints.slice(0, i * pointsPerChunk)
            .map(p => p.title || p.name || 'Section')
            .filter(Boolean) : [];

        console.log(`📊 Chunk ${i + 1} using MECHANICAL distribution: ${chunkPoints.length} sections`);
      }

      console.log(`📊 Chunk ${i + 1} assigned ${chunkPoints.length} content points for minutes ${chunkStart}-${chunkEnd}`);

      const chunkPrompt: ChunkPrompt = {
        chunkNumber: i + 1,
        totalChunks: chunkConfig.chunks,
        startTime: chunkStart,
        endTime: chunkEnd,
        duration: chunkEnd - chunkStart,
        isFirst: i === 0,
        isLast: i === chunkConfig.chunks - 1,
        context: {
          title,
          topic,
          type,
          voiceProfile,
          contentPoints: chunkPoints,
          targetAudience,
          tone,
          research,
          frame,
          sponsor
        },
        outline: outlineForChunk,
        comprehensiveOutline: comprehensiveOutline
      };

      if (i === 0) {
        chunkPrompt.includeIntro = true;
        chunkPrompt.hook = hook;
      }

      if (i === chunkConfig.chunks - 1) {
        chunkPrompt.includeConclusion = true;
      }

      if (i > 0) {
        const lastTopicCovered = previouslyCoveredSections.length > 0
          ? previouslyCoveredSections[previouslyCoveredSections.length - 1]
          : 'Previous discussion';

        chunkPrompt.previousChunkSummary = {
          timeMarker: `Continue from minute ${chunkStart}`,
          lastTopic: lastTopicCovered,
          transitionNote: 'Smoothly transition from the previous section without repeating covered points',
          continuityCheck: 'Ensure narrative flow and avoid starting from scratch - build on what came before',
          criticalWarning: `DO NOT repeat ANY content from the ${i} previous chunk${i > 1 ? 's' : ''}. Start with completely NEW content only.`
        };

        chunkPrompt.previouslyCoveredSections = previouslyCoveredSections;
      }

      prompts.push(chunkPrompt);
    }

    return prompts.map(p => this.formatChunkPrompt(p));
  }

  /**
   * Formats a chunk prompt for the AI
   */
  static formatChunkPrompt(chunk: ChunkPrompt): string {
    const {
      chunkNumber,
      totalChunks,
      startTime,
      endTime,
      duration,
      isFirst,
      isLast,
      context,
      includeIntro,
      includeConclusion,
      hook,
      previousChunkSummary,
      outline,
      comprehensiveOutline
    } = chunk;

    // Log voice profile and target audience details (only for first chunk to avoid spam)
    if (isFirst) {
      this.logVoiceProfileAndAudience(context);
    }

    // Calculate target words (using 130 WPM standard)
    const targetWords = duration * 130;
    const bufferWords = Math.ceil(targetWords * 1.10); // 10% buffer for quality

    // START WITH OUTLINE IF AVAILABLE
    let prompt = '';

    if (outline && comprehensiveOutline) {
      prompt = `${formatOutlineForPrompt(comprehensiveOutline, chunkNumber)}

⚡⚡⚡ CRITICAL: THE OUTLINE ABOVE IS MANDATORY ⚡⚡⚡
You MUST write EXACTLY what the outline specifies. ANY deviation = REJECTION.

🔴🔴🔴 ABSOLUTE WORD COUNT REQUIREMENT 🔴🔴🔴
This chunk MUST be AT LEAST ${bufferWords} words.
CURRENT REQUIREMENT: ${bufferWords} WORDS MINIMUM
THIS IS NOT OPTIONAL - WRITE ${bufferWords}+ WORDS OR THE SCRIPT WILL BE REJECTED!

Each section has a SPECIFIC word count requirement - MEET OR EXCEED IT:
- Look at the word count for EACH section in the outline
- Write AT LEAST that many words for each section
- Total must be ${bufferWords}+ words

DO NOT rush or summarize - EXPAND each point with:
• Detailed explanations (100+ words per main point)
• Specific examples and case studies (50-100 words each)
• Statistics and data (25-50 words per stat)
• Historical context (50-100 words)
• Expert analysis (50-100 words)
• Visual descriptions (25-50 words)
• Smooth transitions (25-50 words)

`;
    }

    // ADD STRICT CONTENT BOUNDARIES
    prompt += `🚨🚨🚨 STRICT CONTENT BOUNDARIES FOR CHUNK ${chunkNumber}/${totalChunks} 🚨🚨🚨

====================================================================
CHUNK ${chunkNumber} MUST COVER THESE TOPICS (AND ONLY THESE):
====================================================================
${context.contentPoints && context.contentPoints.length > 0 ?
  context.contentPoints.map((point, idx) =>
    `✅ SECTION ${idx + 1}: "${point.title || point.name || 'Topic ' + (idx + 1)}"
   - Description: ${point.description || 'Cover this topic thoroughly'}
   - Duration: ~${Math.ceil((point.duration || duration * 60 / context.contentPoints.length) / 60)} minutes
   - Key focus: ${point.keyTakeaway || 'Explain in detail'}`
  ).join('\n\n') :
  outline ? '✅ Follow the outline sections specified above EXACTLY' :
  `✅ Content for minutes ${startTime}-${endTime} of the video`}

====================================================================
CHUNK ${chunkNumber} MUST NOT COVER (ABSOLUTELY FORBIDDEN):
====================================================================
${chunk.previouslyCoveredSections && chunk.previouslyCoveredSections.length > 0 ?
  chunk.previouslyCoveredSections.map((section, idx) =>
    `❌ DO NOT WRITE ABOUT: "${section}"
   ⚠️ Status: Already covered in chunk ${idx + 1 < chunkNumber ? idx + 1 : 'previous'}
   ⚠️ Violation consequence: IMMEDIATE REJECTION`
  ).join('\n\n') :
  '(No previous content - this is the first chunk)'}

⚡ ENFORCEMENT RULES:
1. If you write ANY content about topics marked with ❌, your response will be REJECTED
2. You MUST write about ALL topics marked with ✅
3. Stay STRICTLY within your assigned boundaries
4. Each ✅ topic needs substantial coverage (${Math.floor(targetWords / (context.contentPoints?.length || 1))} words minimum)

====================================================================
Now generate PART ${chunkNumber} of ${totalChunks} for this YouTube script.

CRITICAL: You MUST write AT LEAST ${bufferWords} words for this section. Be VERBOSE and DETAILED.

VIDEO CONTEXT:
- Title: ${context.title}
- Topic: ${context.topic}
- This section: Minutes ${startTime}-${endTime} (${duration} minutes)
- Script type: FULL DETAILED SCRIPT with complete narration
- Target length: ${targetWords} words (aim for ${bufferWords}+ to ensure quality)

⚖️ CHUNK BALANCING REQUIREMENT:
${totalChunks > 1 ? `This is a multi-part script. ALL chunks must be similar in length.
- Each chunk should be approximately ${targetWords} words
- Do NOT write significantly more or less than ${bufferWords} words
- Maintain consistency with other sections - avoid one chunk being 50%+ longer than others
- If you're in the middle of explaining something at ${bufferWords} words, wrap it up gracefully` : ''}

`;

    // Add voice profile if available (simplified - no filesystem logging)
    if (context.voiceProfile) {
      prompt += this.formatVoiceProfileForPrompt(context.voiceProfile);
    }

    // Add target audience if available
    if (context.targetAudience) {
      prompt += this.formatTargetAudienceForPrompt(context.targetAudience);
    }

    // Add sponsor if available
    if (context.sponsor) {
      prompt += this.formatSponsorForPrompt(context.sponsor);
    }

    // Add research if available
    if (context.research) {
      prompt += this.formatResearchForPrompt(context.research);
    }

    // Add conclusion requirements for last chunk
    if (isLast) {
      prompt += `
🎬 FINAL CHUNK REQUIREMENTS:
- Include compelling conclusion summarizing key points
- Add clear call-to-action
- Include ## Description section with complete video description
- Include ## Tags section with 20+ actual tags (no placeholders)
`;
    }

    return prompt;
  }

  /**
   * Log voice profile and target audience details (console only - no filesystem)
   */
  private static logVoiceProfileAndAudience(context: ChunkContext): void {
    console.log('\n═════════════════════════════════════════════════════════════');
    console.log('👥 TARGET AUDIENCE DETAILS:');
    console.log('═════════════════════════════════════════════════════════════');

    if (context.targetAudience) {
      let audienceData = context.targetAudience;

      if (typeof audienceData === 'string' && (audienceData.startsWith('{') || audienceData.startsWith('['))) {
        try {
          audienceData = JSON.parse(audienceData);
        } catch (e) {
          // Not JSON, use as-is
        }
      }

      if (typeof audienceData === 'object' && audienceData !== null) {
        console.log('🎯 RICH AUDIENCE ANALYSIS DATA');
        console.log(JSON.stringify(audienceData, null, 2));
      } else {
        console.log(`Audience: "${audienceData}"`);
      }
    } else {
      console.log('No target audience specified');
    }

    console.log('\n═════════════════════════════════════════════════════════════');
    console.log('🎤 VOICE PROFILE DETAILS:');
    console.log('═════════════════════════════════════════════════════════════');

    if (context.voiceProfile) {
      const vp = context.voiceProfile;
      console.log(`Profile: ${vp.profile_name || vp.name || 'Unknown'}`);
      console.log('Voice Profile Data:', JSON.stringify(vp, null, 2));
    } else {
      console.log('No voice profile provided');
    }

    console.log('═════════════════════════════════════════════════════════════\n');
  }

  /**
   * Format voice profile for prompt
   */
  private static formatVoiceProfileForPrompt(vp: VoiceProfile): string {
    const basic = vp.basic || vp.training_data?.basic;
    const enhanced = vp.enhanced || vp.training_data?.enhanced;

    if (!basic && !enhanced) return '';

    let prompt = `
VOICE PROFILE & STYLE GUIDELINES:
Profile: ${vp.profile_name || vp.name || 'Custom Voice'}

`;

    if (basic) {
      prompt += `VOICE CHARACTERISTICS:
- Tone: ${basic.tone || 'not specified'}
- Style: ${basic.style || 'not specified'}
- Pace: ${basic.pace || 'not specified'}
- Energy: ${basic.energy || 'not specified'}
- Vocabulary: ${basic.vocabulary || 'not specified'}

`;

      if (basic.dos && basic.dos.length > 0) {
        prompt += `DO:\n${basic.dos.map(d => `- ${d}`).join('\n')}\n\n`;
      }

      if (basic.donts && basic.donts.length > 0) {
        prompt += `DON'T:\n${basic.donts.map(d => `- ${d}`).join('\n')}\n\n`;
      }

      if (basic.signature_phrases && basic.signature_phrases.length > 0) {
        prompt += `SIGNATURE PHRASES:\n${basic.signature_phrases.map(p => `- "${p}"`).join('\n')}\n\n`;
      }
    }

    return prompt;
  }

  /**
   * Format target audience for prompt
   */
  private static formatTargetAudienceForPrompt(audience: string | TargetAudience): string {
    if (typeof audience === 'string') {
      return `\nTARGET AUDIENCE:\n${audience}\n\n`;
    }

    return `\nTARGET AUDIENCE:\n${JSON.stringify(audience, null, 2)}\n\n`;
  }

  /**
   * Format sponsor for prompt
   */
  private static formatSponsorForPrompt(sponsor: Sponsor): string {
    return `
SPONSOR INTEGRATION:
- Sponsor: ${sponsor.sponsor_name}
- Product: ${sponsor.sponsor_product}
- Placement: ${sponsor.placement_preference}
- Duration: ${sponsor.sponsor_duration} seconds
- Message: ${sponsor.sponsor_message || 'not specified'}
- FTC Disclosure: Required

`;
  }

  /**
   * Format research for prompt
   */
  private static formatResearchForPrompt(research: any): string {
    if (!research || !research.sources || research.sources.length === 0) {
      return '';
    }

    const sources = research.sources.slice(0, 5);
    return `
RESEARCH SOURCES:
${sources.map((s: any, i: number) =>
  `${i + 1}. ${s.source_title || 'Source'}: ${(s.source_content || '').substring(0, 200)}...`
).join('\n')}

`;
  }

  /**
   * Stitch chunks together
   */
  static stitchChunks(chunks: string[]): string {
    // Remove meta-commentary from each chunk
    const processedChunks = chunks.map(chunk => {
      let processed = chunk;

      // Remove common meta-commentary patterns
      processed = processed
        .replace(/^I'll (expand|add|continue).*?:\s*/gim, '')
        .replace(/^Here'?s? (the|my|a).*?:\s*/gim, '')
        .replace(/^\[?Continuing.*?\]\.?\.\.\s*/gim, '');

      // Remove duplicate sections within chunk
      const sections = processed.split(/(?=###\s+)/);
      const seenSectionHeaders = new Set<string>();
      const seenSectionContent = new Map<string, string>();

      const filteredSections = sections.map(section => {
        if (!section.trim()) return null;

        const headerMatch = section.match(/^###\s+(.+?)(?:\n|$)/);
        if (!headerMatch) return section;

        const headerLine = headerMatch[1].trim();
        const headerText = headerLine.toLowerCase();
        const contentText = section.substring(headerMatch[0].length).trim();
        const fingerprint = contentText.substring(0, 500).toLowerCase();

        if (seenSectionHeaders.has(headerText)) {
          console.log(`🧹 Removing duplicate section: "### ${headerLine}"`);
          return null;
        }

        const existingFingerprint = seenSectionContent.get(headerText);
        if (existingFingerprint && fingerprint) {
          if (existingFingerprint === fingerprint) {
            console.log(`🧹 Removing exact duplicate section: "### ${headerLine}"`);
            return null;
          }

          const similarity = this.calculateSimilarity(existingFingerprint, fingerprint);
          if (similarity > 0.8) {
            console.log(`🧹 Removing duplicate content for section "### ${headerLine}" (${Math.round(similarity * 100)}% similar)`);
            return null;
          }
        }

        seenSectionHeaders.add(headerText);
        seenSectionContent.set(headerText, fingerprint);

        return '### ' + section;
      }).filter(s => s !== null);

      processed = filteredSections.join('\n\n');
      return processed;
    });

    let stitched = processedChunks.join('\n\n---\n\n');

    // Final cleanup
    const metaBlockPatterns = [
      /###\s*Here's.*word.*expansion.*$/gim,
      /###\s*Note:.*$/gim,
      /\[Total word count added:.*?\]/gi,
      /\[Word count:.*?\]/gi,
      /\[.*?\d+.*?words.*?added.*?\]/gi
    ];

    metaBlockPatterns.forEach((pattern, index) => {
      const before = stitched.length;
      stitched = stitched.replace(pattern, '');
      const after = stitched.length;
      if (before !== after) {
        console.log(`🧹 Removing meta-commentary block (pattern ${index + 1}, removed ${before - after} chars)`);
      }
    });

    // Final deduplication pass
    console.log('🔍 Running final deduplication pass on complete script...');
    stitched = this.removeDuplicateSections(stitched);

    return stitched;
  }

  /**
   * Remove duplicate sections from complete script
   */
  static removeDuplicateSections(script: string): string {
    const lines = script.split('\n');
    const sections: Array<{
      header: string | null;
      headerLine: string | null;
      headerKey: string | null;
      content: string[];
      wordCount: number;
    }> = [];

    let currentSection: { header: string; headerLine: string; headerKey: string } | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const sectionMatch = line.match(/^(###|##)\s+(.+)$/);

      if (sectionMatch) {
        if (currentSection) {
          sections.push({
            header: currentSection.header,
            headerLine: currentSection.headerLine,
            headerKey: currentSection.headerKey,
            content: currentContent,
            wordCount: currentContent.join(' ').split(/\s+/).filter(w => w.length > 0).length
          });
        }

        currentSection = {
          header: sectionMatch[2],
          headerLine: line,
          headerKey: sectionMatch[2].toLowerCase().trim()
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      } else {
        sections.push({
          header: null,
          headerLine: null,
          headerKey: null,
          content: [line],
          wordCount: line.split(/\s+/).filter(w => w.length > 0).length
        });
      }
    }

    if (currentSection) {
      sections.push({
        header: currentSection.header,
        headerLine: currentSection.headerLine,
        headerKey: currentSection.headerKey,
        content: currentContent,
        wordCount: currentContent.join(' ').split(/\s+/).filter(w => w.length > 0).length
      });
    }

    const seenHeaders = new Set<string>();
    const result: string[] = [];
    let removedCount = 0;
    let removedWords = 0;

    for (const section of sections) {
      if (section.headerKey && seenHeaders.has(section.headerKey)) {
        console.log(`🧹 Final pass: Removing duplicate section "${section.header}" (${section.wordCount} words)`);
        removedCount++;
        removedWords += section.wordCount;
      } else {
        if (section.headerKey) {
          seenHeaders.add(section.headerKey);
        }

        if (section.headerLine) {
          result.push(section.headerLine);
        }

        result.push(...section.content);
      }
    }

    if (removedCount > 0) {
      console.log(`✅ Final deduplication pass removed ${removedCount} duplicate section(s) (${removedWords} words)`);
    } else {
      console.log(`✅ Final deduplication pass: No duplicates found`);
    }

    return result.join('\n');
  }

  /**
   * Calculate similarity between two strings
   */
  static calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const words1 = str1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const words2 = str2.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(w => set2.has(w)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Validates that a complete script meets requirements
   */
  static validateCompleteness(script: string, targetMinutes: number, wordsPerMinute: number = 130): ValidationResult {
    const wordCount = script.split(/\s+/).length;
    const expectedWords = targetMinutes * wordsPerMinute;

    const placeholderPatterns = [
      /\[continue.*\]/i,
      /\[Rest of.*\]/i,
      /\[Add more.*\]/i,
      /\[.*remaining.*\]/i,
      /\.\.\.\]$/,
      /etc\.\]$/,
      /\[Insert.*\]/i,
      /\[Include.*here\]/i,
      /to be continued/i,
      /\[10-15.*tags\]/i,
      /\[2-3 options\]/i
    ];

    const hasPlaceholders = placeholderPatterns.some(pattern => pattern.test(script));
    const hasTimestamps = /\d{1,2}:\d{2}/.test(script);
    const hasDescription = script.includes('## Description') && script.includes('TIMESTAMPS:');

    const tagsMatch = script.match(/## Tags\s*\n([^\n#]+)/);
    const hasTags = tagsMatch &&
      tagsMatch[1].trim().length > 20 &&
      !tagsMatch[1].includes('[') &&
      !tagsMatch[1].includes('...') &&
      tagsMatch[1].split(',').length >= 10;

    return {
      isValid: wordCount >= expectedWords * 0.8 && !hasPlaceholders && hasTimestamps && hasDescription && hasTags,
      wordCount,
      expectedWords,
      percentComplete: Math.round((wordCount / expectedWords) * 100),
      hasPlaceholders,
      hasTimestamps,
      hasDescription,
      hasTags,
      issues: [
        wordCount < expectedWords * 0.8 ? `Script too short: ${wordCount}/${expectedWords} words` : null,
        hasPlaceholders ? 'Contains placeholder text' : null,
        !hasTimestamps ? 'Missing timestamps' : null,
        !hasDescription ? 'Missing complete description section' : null,
        !hasTags ? 'Missing or incomplete tags section' : null
      ].filter(Boolean) as string[]
    };
  }
}
