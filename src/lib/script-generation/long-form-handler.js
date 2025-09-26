/**
 * Long-form Script Generation Handler
 * Handles scripts over 30 minutes by splitting generation into chunks
 */

export class LongFormScriptHandler {
  /**
   * Determines if a script needs chunked generation
   * @param {number} durationInSeconds - Total script duration
   * @returns {boolean}
   */
  static needsChunking(durationInSeconds) {
    const minutes = Math.ceil(durationInSeconds / 60);
    return minutes > 30;
  }

  /**
   * Calculates optimal chunk size for generation
   * @param {number} totalMinutes - Total script duration in minutes
   * @returns {Object} Chunk configuration
   */
  static getChunkConfig(totalMinutes) {
    if (totalMinutes <= 30) {
      return { chunks: 1, minutesPerChunk: totalMinutes };
    } else if (totalMinutes <= 45) {
      return { chunks: 2, minutesPerChunk: Math.ceil(totalMinutes / 2) };
    } else if (totalMinutes <= 60) {
      return { chunks: 3, minutesPerChunk: 20 };
    } else {
      // For 60+ minute scripts, use 15-minute chunks
      const chunks = Math.ceil(totalMinutes / 15);
      return { chunks, minutesPerChunk: 15 };
    }
  }

  /**
   * Generates prompts for each chunk
   * @param {Object} config - Generation configuration
   * @returns {Array} Array of chunk prompts
   */
  static generateChunkPrompts(config) {
    const { 
      totalMinutes, 
      title, 
      topic,
      contentPoints = [],
      type,
      hook,
      voiceProfile
    } = config;

    const chunkConfig = this.getChunkConfig(totalMinutes);
    const prompts = [];
    
    // Distribute content points across chunks
    const pointsPerChunk = Math.ceil(contentPoints.length / chunkConfig.chunks);
    
    for (let i = 0; i < chunkConfig.chunks; i++) {
      const chunkStart = i * chunkConfig.minutesPerChunk;
      const chunkEnd = Math.min((i + 1) * chunkConfig.minutesPerChunk, totalMinutes);
      const chunkPoints = contentPoints.slice(
        i * pointsPerChunk, 
        (i + 1) * pointsPerChunk
      );

      let chunkPrompt = {
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
          contentPoints: chunkPoints
        }
      };

      // First chunk includes intro and hook
      if (i === 0) {
        chunkPrompt.includeIntro = true;
        chunkPrompt.hook = hook;
      }

      // Last chunk includes conclusion and CTA
      if (i === chunkConfig.chunks - 1) {
        chunkPrompt.includeConclusion = true;
      }

      // Middle chunks need context from previous
      if (i > 0) {
        chunkPrompt.previousChunkSummary = `Continue from minute ${chunkStart}`;
      }

      prompts.push(this.formatChunkPrompt(chunkPrompt));
    }

    return prompts;
  }

  /**
   * Formats a chunk prompt for the AI
   * @param {Object} chunk - Chunk configuration
   * @returns {string} Formatted prompt
   */
  static formatChunkPrompt(chunk) {
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
      previousChunkSummary
    } = chunk;

    let prompt = `Generate PART ${chunkNumber} of ${totalChunks} for a YouTube script.
    
VIDEO CONTEXT:
- Title: ${context.title}
- Topic: ${context.topic}
- This section: Minutes ${startTime}-${endTime} (${duration} minutes)
- Type: ${context.type === 'outline' ? 'Detailed outline' : 'Full script'}
${context.voiceProfile ? `- Voice Style: ${context.voiceProfile.name}` : ''}

`;

    if (isFirst) {
      prompt += `
SECTION REQUIREMENTS:
- Start with a compelling introduction and hook
- ${hook ? `Use this hook: ${hook}` : 'Create an engaging opening'}
- Include timestamps starting from [0:00]
- Set up the video's main promise and value proposition
- Preview what's coming in the video
`;
    } else if (isLast) {
      prompt += `
SECTION REQUIREMENTS:
- This is the FINAL section (minutes ${startTime}-${endTime})
- Include a strong conclusion summarizing key points
- Add a compelling call-to-action
- Include next video teaser
- End on a high note to encourage engagement
- Include timestamps from [${startTime}:00] to [${endTime}:00]
`;
    } else {
      prompt += `
SECTION REQUIREMENTS:
- This is the MIDDLE section (minutes ${startTime}-${endTime})
- Continue naturally from the previous section
${previousChunkSummary ? `- Previous section context: ${previousChunkSummary}` : ''}
- Maintain consistent tone and pacing
- Include timestamps from [${startTime}:00] to [${endTime}:00]
- Include smooth transitions between topics
`;
    }

    if (context.contentPoints && context.contentPoints.length > 0) {
      prompt += `
CONTENT TO COVER IN THIS SECTION:
${context.contentPoints.map((point, idx) => 
  `${idx + 1}. ${point.title} (${Math.ceil(point.duration / 60)} min)
   - ${point.description}
   - Key takeaway: ${point.keyTakeaway}`
).join('\n')}
`;
    }

    prompt += `
CRITICAL RULES:
- Write EXACTLY ${duration} minutes of content (approximately ${duration * 150} words)
- Include specific timestamps throughout
- NO placeholders or shortcuts - write everything in full
- Maintain engaging, conversational tone
- Include [Visual: ...] cues for production
- ${isFirst ? 'Start strong with the hook' : ''}
- ${isLast ? 'End with a powerful conclusion and CTA' : ''}

Write the complete section now:`;

    return prompt;
  }

  /**
   * Stitches chunks together into a complete script
   * @param {Array} chunks - Array of generated script chunks
   * @returns {string} Complete script
   */
  static stitchChunks(chunks) {
    // Remove duplicate headers/footers between chunks
    const processedChunks = chunks.map((chunk, index) => {
      if (index === 0) return chunk; // Keep first chunk as-is
      
      // Remove any duplicate title or metadata from subsequent chunks
      let processed = chunk;
      
      // Remove lines that look like headers (start with #)
      if (index > 0) {
        const lines = processed.split('\n');
        const filteredLines = lines.filter((line, idx) => {
          // Skip the first few lines if they're headers
          if (idx < 5 && line.startsWith('#')) return false;
          return true;
        });
        processed = filteredLines.join('\n');
      }
      
      return processed;
    });

    // Join with smooth transitions
    return processedChunks.join('\n\n---\n\n');
  }

  /**
   * Validates that a complete script meets requirements
   * @param {string} script - Complete script
   * @param {number} targetMinutes - Target duration
   * @returns {Object} Validation result
   */
  static validateCompleteness(script, targetMinutes) {
    const wordCount = script.split(/\s+/).length;
    const expectedWords = targetMinutes * 150;
    
    // Comprehensive placeholder patterns
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
      /\[10-15.*tags\]/i,  // Common tag placeholder
      /\[2-3 options\]/i    // Common title placeholder
    ];
    
    const hasPlaceholders = placeholderPatterns.some(pattern => pattern.test(script));
    const hasTimestamps = /\d{1,2}:\d{2}/.test(script);
    const hasDescription = script.includes('## Description') && script.includes('TIMESTAMPS:');
    const hasTags = script.includes('## Tags') && !script.includes('[');
    
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
      ].filter(Boolean)
    };
  }
}

// Support both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LongFormScriptHandler };
  module.exports.default = LongFormScriptHandler;
}

export default LongFormScriptHandler;