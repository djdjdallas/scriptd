/**
 * Long-form Script Generation Handler
 * Handles scripts over 30 minutes by splitting generation into chunks
 */

import fs from 'fs';
import path from 'path';
import { formatOutlineForPrompt } from './outline-generator';
import { validateChunkAgainstOutline, checkTopicMatch } from './outline-validator';

export class LongFormScriptHandler {
  /**
   * Determines if a script needs chunked generation
   * Based on token limits: ~150 words/minute * 1.33 tokens/word = ~200 tokens/minute
   * With 8192 token limit, we can handle up to ~40 minutes in one go
   * But we still chunk at 20+ minutes for better quality and control
   * @param {number} durationInSeconds - Total script duration
   * @returns {boolean}
   */
  static needsChunking(durationInSeconds) {
    const minutes = Math.ceil(durationInSeconds / 60);
    // Use chunking for scripts 20 minutes or longer for better quality
    // Even though we could technically handle up to 40 minutes with 8192 tokens
    return minutes >= 20;
  }

  /**
   * Calculates optimal chunk size for generation
   * With 8192 tokens, each chunk can handle ~30-35 minutes of content
   * But we keep chunks at 15-20 minutes for better quality and control
   * @param {number} totalMinutes - Total script duration in minutes
   * @returns {Object} Chunk configuration
   */
  static getChunkConfig(totalMinutes) {
    if (totalMinutes < 20) {
      // Single chunk for scripts under 20 minutes
      return { chunks: 1, minutesPerChunk: totalMinutes };
    } else if (totalMinutes <= 30) {
      // 2 chunks for 20-30 minute scripts
      return { chunks: 2, minutesPerChunk: Math.ceil(totalMinutes / 2) };
    } else if (totalMinutes <= 45) {
      // 3 chunks for 30-45 minute scripts (15 min each)
      return { chunks: 3, minutesPerChunk: 15 };
    } else if (totalMinutes <= 60) {
      // 4 chunks for 45-60 minute scripts (15 min each)
      return { chunks: 4, minutesPerChunk: 15 };
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
      voiceProfile,
      targetAudience,
      tone,
      research,
      frame,
      sponsor, // ✅ ADD SPONSOR PARAMETER
      contentPlan,
      comprehensiveOutline
    } = config;

    const chunkConfig = this.getChunkConfig(totalMinutes);
    const prompts = [];

    // Distribute content points across chunks
    const pointsPerChunk = Math.ceil(contentPoints.length / chunkConfig.chunks);

    for (let i = 0; i < chunkConfig.chunks; i++) {
      const chunkStart = i * chunkConfig.minutesPerChunk;
      const chunkEnd = Math.min((i + 1) * chunkConfig.minutesPerChunk, totalMinutes);

      // Use content plan if available, otherwise mechanical distribution
      let chunkPoints;
      let previouslyCoveredSections;
      let outlineForChunk = null;

      // PRIORITY 1: Use comprehensive outline for 30+ minute scripts
      if (comprehensiveOutline && comprehensiveOutline.chunks && comprehensiveOutline.chunks[i]) {

        // Get outline sections for this chunk
        const outlineChunk = comprehensiveOutline.chunks[i];
        outlineForChunk = outlineChunk;

        // Map outline sections to content points if possible
        if (contentPoints.length > 0) {
          chunkPoints = contentPoints.filter(point => {
            const pointTitle = point.title || point.name || '';
            // Check if this point matches any section in the outline
            return outlineChunk.sections.some(section =>
              section.title.toLowerCase().includes(pointTitle.toLowerCase()) ||
              pointTitle.toLowerCase().includes(section.title.toLowerCase())
            );
          });
        } else {
          // No content points, just use outline
          chunkPoints = [];
        }

        // Get all previously covered sections from outline
        previouslyCoveredSections = comprehensiveOutline.chunks
          .slice(0, i)
          .flatMap(c => c.sections.map(s => s.title));

      } else if (contentPlan && contentPlan.chunks && contentPlan.chunks[i]) {
        // Use planned distribution
        const plannedChunk = contentPlan.chunks[i];
        const assignedTitles = plannedChunk.assignedSections.map(s => s.title);

        // Find content points that match the assigned titles
        chunkPoints = contentPoints.filter(point => {
          const pointTitle = point.title || point.name || '';
          return assignedTitles.some(title =>
            title.toLowerCase() === pointTitle.toLowerCase()
          );
        });

        // Get all sections from previous chunks in the plan
        previouslyCoveredSections = contentPlan.chunks
          .slice(0, i)
          .flatMap(c => c.assignedSections.map(s => s.title));

      } else {
        // Fallback to mechanical slicing
        chunkPoints = contentPoints.slice(
          i * pointsPerChunk,
          (i + 1) * pointsPerChunk
        );

        // Get previously covered points mechanically
        previouslyCoveredSections = i > 0 ?
          contentPoints.slice(0, i * pointsPerChunk)
            .map(p => p.title || p.name || 'Section')
            .filter(Boolean) : [];

      }

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
          contentPoints: chunkPoints,
          targetAudience,
          tone,
          research,
          frame,
          sponsor // ✅ ADD SPONSOR TO CONTEXT
        },
        outline: outlineForChunk, // Add outline for this specific chunk
        comprehensiveOutline: comprehensiveOutline // Add full outline for reference
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
        // Use the previouslyCoveredSections we calculated above (either from plan or mechanical)
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

        // Use the calculated previouslyCoveredSections
        chunkPrompt.previouslyCoveredSections = previouslyCoveredSections;
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
      previousChunkSummary,
      outline,
      comprehensiveOutline
    } = chunk;

    // Log voice profile and target audience details (only for first chunk to avoid spam)
    if (isFirst) {
      const logFile = path.join(process.cwd(), 'voice-profile-log.txt');

      let logContent = '\n\n';
      logContent += '═══════════════════════════════════════════════════════════\n';
      logContent += '📝 VOICE PROFILE & TARGET AUDIENCE LOG\n';
      logContent += `Generated: ${new Date().toISOString()}\n`;
      logContent += '═══════════════════════════════════════════════════════════\n\n';

      logContent += '👥 TARGET AUDIENCE DETAILS:\n';
      logContent += '═════════════════════════════════════════════════════════════\n';

      // Check if we have targetAudience
      if (context.targetAudience) {
        // Check if it's a simple string or rich JSON
        let audienceData = context.targetAudience;
        let isRichData = false;

        // Try to parse if it looks like JSON
        if (typeof audienceData === 'string' && (audienceData.startsWith('{') || audienceData.startsWith('['))) {
          try {
            audienceData = JSON.parse(audienceData);
            isRichData = true;
          } catch {
            // Not JSON, use as-is
            isRichData = false;
          }
        } else if (typeof audienceData === 'object') {
          isRichData = true;
        }

        if (isRichData && audienceData.demographic_profile) {
          // Log rich audience analysis data
          logContent += '🎯 RICH AUDIENCE ANALYSIS DATA:\n\n';

          if (audienceData.demographic_profile) {
            logContent += '📊 DEMOGRAPHIC PROFILE:\n';

            const demo = audienceData.demographic_profile;
            if (demo.age_distribution) {
              logContent += '  Age Distribution:\n';
              Object.entries(demo.age_distribution).forEach(([range, percent]) => {
                logContent += `    ${range}: ${percent}\n`;
              });
            }
            if (demo.gender_distribution) {
              logContent += '  Gender Distribution:\n';
              Object.entries(demo.gender_distribution).forEach(([g, percent]) => {
                logContent += `    ${g}: ${percent}\n`;
              });
            }
            if (demo.education_income) {
              if (demo.education_income.education_level) {
                logContent += '  Education Level:\n';
                Object.entries(demo.education_income.education_level).forEach(([level, percent]) => {
                  logContent += `    ${level}: ${percent}\n`;
                });
              }
              if (demo.education_income.income_brackets) {
                logContent += '  Income Brackets:\n';
                Object.entries(demo.education_income.income_brackets).forEach(([bracket, percent]) => {
                  logContent += `    ${bracket}: ${percent}\n`;
                });
              }
            }
            if (demo.geographic_distribution) {
              logContent += '  Geographic Distribution:\n';
              Object.entries(demo.geographic_distribution).forEach(([country, percent]) => {
                logContent += `    ${country}: ${percent}\n`;
              });
            }
          }

          if (audienceData.psychographic_analysis) {
            logContent += '\n🧠 PSYCHOGRAPHIC ANALYSIS:\n';

            const psycho = audienceData.psychographic_analysis;
            if (psycho.values && psycho.values.length > 0) {
              logContent += '  Values:\n';
              psycho.values.forEach((v, i) => {
                logContent += `    ${i + 1}. ${v}\n`;
              });
            }
            if (psycho.aspirations && psycho.aspirations.length > 0) {
              logContent += '  Aspirations:\n';
              psycho.aspirations.forEach((a, i) => {
                logContent += `    ${i + 1}. ${a}\n`;
              });
            }
            if (psycho.pain_points && psycho.pain_points.length > 0) {
              logContent += '  Pain Points:\n';
              psycho.pain_points.forEach((p, i) => {
                logContent += `    ${i + 1}. ${p}\n`;
              });
            }
          }

          if (audienceData.engagement_drivers) {
            logContent += '\n🎯 ENGAGEMENT DRIVERS:\n';

            const drivers = audienceData.engagement_drivers;
            if (drivers.comment_triggers && drivers.comment_triggers.length > 0) {
              logContent += '  Comment Triggers:\n';
              drivers.comment_triggers.forEach((t, i) => {
                logContent += `    ${i + 1}. ${t}\n`;
              });
            }
            if (drivers.loyalty_builders && drivers.loyalty_builders.length > 0) {
              logContent += '  Loyalty Builders:\n';
              drivers.loyalty_builders.forEach((l, i) => {
                logContent += `    ${i + 1}. ${l}\n`;
              });
            }
            if (drivers.sharing_motivations && drivers.sharing_motivations.length > 0) {
              logContent += '  Sharing Motivations:\n';
              drivers.sharing_motivations.forEach((s, i) => {
                logContent += `    ${i + 1}. ${s}\n`;
              });
            }
          }

          if (audienceData.content_consumption_patterns) {
            logContent += '\n📺 CONTENT CONSUMPTION PATTERNS:\n';

            const patterns = audienceData.content_consumption_patterns;
            if (patterns.preferred_video_length) {
              // Handle preferred_video_length as an object
              if (typeof patterns.preferred_video_length === 'object') {
                if (patterns.preferred_video_length.optimal_range) {
                  logContent += `  Preferred Video Length: ${patterns.preferred_video_length.optimal_range}\n`;
                }
                if (patterns.preferred_video_length.tolerance) {
                  logContent += `  Tolerance: ${patterns.preferred_video_length.tolerance}\n`;
                }
                if (patterns.preferred_video_length.minimum_threshold) {
                  logContent += `  Minimum Threshold: ${patterns.preferred_video_length.minimum_threshold}\n`;
                }
              } else {
                // If it's a string, log it directly
                logContent += `  Preferred Video Length: ${patterns.preferred_video_length}\n`;
              }
            }
            if (patterns.watch_time_preference) {
              logContent += `  Watch Time Preference: ${patterns.watch_time_preference}\n`;
            }
            if (patterns.device_usage && patterns.device_usage.length > 0) {
              logContent += '  Device Usage:\n';
              patterns.device_usage.forEach((d, i) => {
                logContent += `    ${i + 1}. ${d}\n`;
              });
            }
          }
        } else {
          // Simple string audience description
          logContent += `Full audience description: "${context.targetAudience}"\n`;
          logContent += `Character count: ${context.targetAudience.length}\n`;
        }
      } else {
        logContent += 'No target audience specified\n';
      }
      logContent += '═════════════════════════════════════════════════════════════\n\n';

      logContent += '🎤 VOICE PROFILE DETAILS:\n';
      logContent += '═════════════════════════════════════════════════════════════\n';

      if (context.voiceProfile) {
        const voiceProfile = context.voiceProfile;
        const profileName = voiceProfile.profile_name || voiceProfile.name || 'Unknown';
        logContent += `Voice profile name: ${profileName}\n`;

        // Log raw structure for debugging
        logContent += '\n🔍 DEBUG - Voice Profile Structure:\n';
        logContent += `Has basicProfile: ${!!voiceProfile.basicProfile}\n`;
        logContent += `Has enhancedProfile: ${!!voiceProfile.enhancedProfile}\n`;
        logContent += `Has voiceProfileData: ${!!voiceProfile.voiceProfileData}\n`;
        logContent += `Has metadata: ${!!voiceProfile.metadata}\n`;
        logContent += `basedOnRealData: ${voiceProfile.basedOnRealData}\n`;

        // Support new structure: basicProfile and enhancedProfile
        // Fallback to old structure for backwards compatibility
        const params = voiceProfile.basicProfile || voiceProfile.parameters || voiceProfile.basic;
        const trainingData = voiceProfile.voiceProfileData || voiceProfile.training_data;
        const advanced = voiceProfile.enhancedProfile || voiceProfile.advanced;

        if (params) {
          logContent += '\n📝 VOICE CHARACTERISTICS:\n';

          // Helper to safely convert arrays or strings
          const formatField = (field) => {
            if (!field) return 'not set';
            return Array.isArray(field) ? field.join(', ') : field;
          };

          logContent += `  Tone: ${formatField(params.tone)}\n`;
          logContent += `  Style: ${formatField(params.style)}\n`;
          logContent += `  Pace: ${params.pace || 'not set'}\n`;
          logContent += `  Energy: ${params.energy || 'not set'}\n`;
          logContent += `  Humor: ${params.humor || 'not set'}\n`;
          logContent += `  Vocabulary: ${params.vocabulary || 'not set'}\n`;
          logContent += `  Sentence Structure: ${params.sentenceStructure || 'not set'}\n`;

          // Log DOs and DONTs
          if (params.dos && params.dos.length > 0) {
            logContent += '\n✅ DO:\n';
            params.dos.slice(0, 5).forEach((item, i) => {
              logContent += `  ${i + 1}. ${item}\n`;
            });
          }

          if (params.donts && params.donts.length > 0) {
            logContent += '\n❌ DON\'T:\n';
            params.donts.slice(0, 5).forEach((item, i) => {
              logContent += `  ${i + 1}. ${item}\n`;
            });
          }

          // Log signature phrases (check both snake_case and camelCase)
          logContent += '\n💬 SIGNATURE PHRASES:\n';
          const signaturePhrases = voiceProfile.signature_phrases || params.signature_phrases ||
                                   voiceProfile.signaturePhrases || params.signaturePhrases;
          if (signaturePhrases && signaturePhrases.length > 0) {
            signaturePhrases.slice(0, 8).forEach((phrase, i) => {
              logContent += `  ${i + 1}. "${phrase}"\n`;
            });
          } else {
            logContent += '  (None specified)\n';
          }

          // Log hooks and transitions (check both top-level and params)
          logContent += '\n🎣 HOOK STYLE:\n';
          const hooks = voiceProfile.hooks || voiceProfile.voiceProfileData?.hooks || params.hooks || 'not specified';
          logContent += `  ${hooks}\n`;

          logContent += '\n🔄 TRANSITIONS:\n';
          const transitions = voiceProfile.transitions || voiceProfile.voiceProfileData?.transitions || params.transitions || 'not specified';
          logContent += `  ${transitions}\n`;

          logContent += '\n👥 ENGAGEMENT:\n';
          const engagement = voiceProfile.engagement || voiceProfile.voiceProfileData?.engagement || params.engagement || 'not specified';
          logContent += `  ${engagement}\n`;

          // Advanced features
          if (params.prosody && Object.keys(params.prosody).length > 0) {
            logContent += '\n🎯 PROSODY (Advanced):\n';
            Object.entries(params.prosody).forEach(([key, value]) => {
              logContent += `  ${key}: ${JSON.stringify(value)}\n`;
            });
          }
        }

        if (trainingData) {
          logContent += '\n📊 TRAINING METADATA:\n';
          logContent += `  Sample Count: ${trainingData.sampleCount || 'not set'}\n`;
          logContent += `  Total Words: ${trainingData.totalWords || 'not set'}\n`;
          logContent += `  Source: ${trainingData.source || 'not set'}\n`;
          logContent += `  Processed At: ${trainingData.processed_at || 'not set'}\n`;
        }

        // Log advanced analysis if available (from channels.voice_profile.advanced)
        if (advanced && Object.keys(advanced).length > 0) {
          logContent += '\n🎯 ADVANCED ANALYSIS:\n';

          if (advanced.prosody) {
            logContent += '  Prosody:\n';
            if (advanced.prosody.energyLevel) {
              logContent += `    Energy Level: ${advanced.prosody.energyLevel.level} (score: ${advanced.prosody.energyLevel.score})\n`;
            }
            if (advanced.prosody.speechTempo) {
              logContent += `    Speech Tempo: ${advanced.prosody.speechTempo.pace} (${advanced.prosody.speechTempo.wordsPerMinute} WPM)\n`;
            }
          }

          if (advanced.personality) {
            logContent += '  Personality:\n';
            if (advanced.personality.formalityScore) {
              logContent += `    Formality: ${advanced.personality.formalityScore.level}\n`;
            }
            if (advanced.personality.humorFrequency) {
              logContent += `    Humor: ${advanced.personality.humorFrequency.level}\n`;
            }
            if (advanced.personality.storytellingStyle) {
              logContent += `    Storytelling: ${advanced.personality.storytellingStyle.primaryStyle}\n`;
            }
          }

          if (advanced.quality) {
            logContent += '  Quality Metrics:\n';
            if (advanced.quality.fillerWordUsage) {
              logContent += `    Filler Words: ${advanced.quality.fillerWordUsage.level} (${advanced.quality.fillerWordUsage.density}% density)\n`;
              if (advanced.quality.fillerWordUsage.fillers) {
                logContent += '    Top Fillers:\n';
                Object.entries(advanced.quality.fillerWordUsage.fillers).slice(0, 5).forEach(([word, count]) => {
                  logContent += `      "${word}": ${count} uses\n`;
                });
              }
            }
            if (advanced.quality.vocabularyDiversity) {
              logContent += `    Vocabulary Diversity: ${advanced.quality.vocabularyDiversity.level} (${advanced.quality.vocabularyDiversity.uniqueWords} unique words)\n`;
            }
          }

          if (advanced.creatorPatterns) {
            logContent += '  Creator Patterns:\n';
            if (advanced.creatorPatterns.introStyle) {
              logContent += `    Intro Style: ${advanced.creatorPatterns.introStyle.style}\n`;
            }
            if (advanced.creatorPatterns.ctaPatterns) {
              const ctas = [];
              if (advanced.creatorPatterns.ctaPatterns.subscribe?.present) ctas.push('subscribe');
              if (advanced.creatorPatterns.ctaPatterns.like?.present) ctas.push('like');
              if (advanced.creatorPatterns.ctaPatterns.comment?.present) ctas.push('comment');
              if (ctas.length > 0) {
                logContent += `    CTAs Used: ${ctas.join(', ')}\n`;
              }
            }
          }
        }
      } else {
        logContent += 'No voice profile provided\n';
      }
      logContent += '═════════════════════════════════════════════════════════════\n';

      // Write to file
      try {
        fs.appendFileSync(logFile, logContent, 'utf8');
      } catch {
        // Silently fail - file logging is not critical
      }
    }

    // Calculate target words (using 130 WPM standard)
    const targetWords = duration * 130;
    const bufferWords = Math.ceil(targetWords * 1.10); // 10% buffer for quality

    // START WITH OUTLINE IF AVAILABLE - THIS IS THE MOST CRITICAL
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

    // THEN ADD STRICT CONTENT BOUNDARIES
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

    // Add voice profile details if available
    if (context.voiceProfile) {
      const vp = context.voiceProfile;
      const basicProfile = vp.basicProfile || vp.parameters || vp.basic;
      const enhancedProfile = vp.enhancedProfile || vp.advanced;

      if (basicProfile || enhancedProfile) {
        prompt += `
VOICE PROFILE & STYLE GUIDELINES:
Profile: ${vp.profile_name || vp.name || 'Custom Voice'}
${vp.basedOnRealData ? '✓ Based on real channel analysis' : ''}

`;

        if (basicProfile) {
          prompt += `
🎤 MANDATORY VOICE PROFILE - YOU MUST FOLLOW THESE EXACTLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
          if (basicProfile.summary) {
            prompt += `📋 VOICE SUMMARY:\n${basicProfile.summary}\n\n`;
          }

          prompt += `🎯 REQUIRED CHARACTERISTICS:\n`;
          if (basicProfile.tone) {
            const toneStr = Array.isArray(basicProfile.tone) ? basicProfile.tone.join(', ') : basicProfile.tone;
            if (toneStr && toneStr.length > 0) {
              prompt += `• Tone: ${toneStr} - MAINTAIN THIS THROUGHOUT\n`;
            }
          }
          if (basicProfile.style) {
            const styleStr = Array.isArray(basicProfile.style) ? basicProfile.style.join(', ') : basicProfile.style;
            if (styleStr && styleStr.length > 0) {
              prompt += `• Style: ${styleStr} - USE THIS STYLE CONSISTENTLY\n`;
            }
          }
          if (basicProfile.pace) {
            prompt += `• Pacing: ${basicProfile.pace} - MATCH THIS RHYTHM\n`;
          }
          if (basicProfile.energy) {
            prompt += `• Energy Level: ${basicProfile.energy} - SUSTAIN THIS ENERGY\n`;
          }
          if (basicProfile.humor) {
            prompt += `• Humor: ${basicProfile.humor} - FOLLOW THIS APPROACH\n`;
          }
          if (basicProfile.vocabulary) {
            prompt += `• Vocabulary: ${basicProfile.vocabulary}\n`;
          }
          if (basicProfile.sentenceStructure) {
            prompt += `• Sentence Structure: ${basicProfile.sentenceStructure}\n`;
            prompt += `  → Target average: 13-14 words per sentence\n`;
            prompt += `  → Vary between 8-20 words for rhythm\n`;
          }

          if (basicProfile.dos && basicProfile.dos.length > 0) {
            prompt += `\n✅ MANDATORY RULES - YOU MUST:\n`;
            basicProfile.dos.forEach(d => prompt += `  • ${d}\n`);
          }

          if (basicProfile.donts && basicProfile.donts.length > 0) {
            prompt += `\n❌ FORBIDDEN - YOU MUST NOT:\n`;
            basicProfile.donts.forEach(d => prompt += `  • ${d}\n`);
          }

          if (basicProfile.signaturePhrases && basicProfile.signaturePhrases.length > 0) {
            const phrasesToUse = basicProfile.signaturePhrases.slice(0, 8);
            const targetUsage = Math.ceil((context.contentPoints?.length || 5) / 2); // ~3-5 times
            prompt += `\n💬 SIGNATURE PHRASES - REQUIRED USAGE:\n`;
            prompt += `YOU MUST naturally incorporate ${targetUsage} of these phrases throughout the script:\n`;
            phrasesToUse.forEach(p => prompt += `  • "${p}"\n`);
            prompt += `\nUSAGE REQUIREMENT: Use at least ${targetUsage} different signature phrases naturally integrated into your narration.\n`;
          }

          // Check basicProfile first, then fall back to voiceProfileData
          const hookStyle = basicProfile.hooks || vp.voiceProfileData?.hooks || vp.hooks;
          const transitionStyle = basicProfile.transitions || vp.voiceProfileData?.transitions || vp.transitions;
          const engagementStyle = basicProfile.engagement || vp.voiceProfileData?.engagement || vp.engagement;

          if (hookStyle) {
            prompt += `\n🎣 OPENING HOOK STYLE (REQUIRED):\n${hookStyle}\n`;
          }
          if (transitionStyle) {
            prompt += `\n🔄 TRANSITION STYLE (REQUIRED):\n${transitionStyle}\n`;
          }
          if (engagementStyle) {
            prompt += `\n👥 AUDIENCE ENGAGEMENT (REQUIRED):\n${engagementStyle}\n`;
          }

          prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        }

        if (enhancedProfile) {
          if (enhancedProfile.contentPositioning) {
            const cp = enhancedProfile.contentPositioning;
            if (cp.authorityStance) prompt += `\nAuthority Stance: ${cp.authorityStance}\n`;
            if (cp.valueProposition) prompt += `Value Proposition: ${cp.valueProposition}\n`;
          }

          if (enhancedProfile.narrativeStructure) {
            const ns = enhancedProfile.narrativeStructure;
            if (ns.informationFlow) prompt += `Information Flow: ${ns.informationFlow}\n`;
            if (ns.exampleStyle) prompt += `Example Style: ${ns.exampleStyle}\n`;
          }

          if (enhancedProfile.technicalPatterns) {
            const tp = enhancedProfile.technicalPatterns;
            if (tp.dataPresentation) prompt += `Data Presentation: ${tp.dataPresentation}\n`;
          }
        }

        prompt += `\n`;
      }
    }

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
- Include timestamps from [${startTime}:00] to [${endTime}:00]

🎬 POWERFUL CONCLUSION REQUIREMENTS (MANDATORY):
Your conclusion MUST include ALL of these elements:
1. **Summary Hook** - Start with a powerful statement that encapsulates the entire story
2. **Three Key Takeaways** - Explicitly state "Here are the three things you need to remember..."
3. **Future Implications** - "What does this mean for the future? [specific prediction]"
4. **Personal Reflection** - Share what this story means for viewers personally
5. **Strong CTA** - Choose one of these formats:
   - "If this story shocked you, you need to see [next topic]..."
   - "Before you click away, ask yourself this one question..."
   - "Your action today could prevent the next [incident type]..."
   - "Share this with someone who needs to know about [key issue]..."
6. **Next Video Teaser** - "In our next investigation, we reveal..."
7. **Final Power Statement** - End with a memorable quote or provocative question

Example conclusion structure:
"[Powerful summary statement]. Here are the three things you absolutely need to remember from this investigation: First, [takeaway 1]. Second, [takeaway 2]. Third, [takeaway 3].

What does this mean for your future? [Specific prediction with timeline].

[Personal reflection on why this matters to each viewer].

[Strong CTA with specific action].

In our next video, we'll expose [compelling teaser].

[Final memorable statement or question that lingers]."

ALSO INCLUDE AT THE END:
## Description
Write an engaging description of the entire video (2-3 paragraphs)

TIMESTAMPS:
0:00 Introduction
(Add all major section timestamps for the ENTIRE video here, e.g., 5:00 Topic 1, 10:00 Topic 2, etc.)
${endTime}:00 Conclusion

Links:
(Add any relevant source links here)

## Tags
CRITICAL: You MUST generate 20+ actual tags as a comma-separated list with NO brackets or placeholders.
Format: tag1, tag2, tag3, tag4, ... (20+ tags total)
Example tags to include: youtube, video essay, documentary, ${context.topic}, current events, analysis, etc.
`;
    } else {
      prompt += `
SECTION REQUIREMENTS:
- This is the MIDDLE section (minutes ${startTime}-${endTime})
- Continue naturally from the previous section
${previousChunkSummary ? `- ${previousChunkSummary.timeMarker}
- Last topic covered: "${previousChunkSummary.lastTopic}"
- Transition guidance: ${previousChunkSummary.transitionNote}
- Continuity: ${previousChunkSummary.continuityCheck}
- ⚠️ CRITICAL WARNING: ${previousChunkSummary.criticalWarning || 'DO NOT repeat any content from previous chunks'}` : ''}
- Maintain consistent tone and pacing
- Include timestamps from [${startTime}:00] to [${endTime}:00]
- Include smooth transitions between topics
`;
    }

    // Previously covered content warning - already handled in boundaries section at top

    // Content points already specified in strict boundaries section at top

    // Add research sources if available
    if (context.research?.sources && context.research.sources.length > 0) {
      // Filter out web search snippets - only include sources with substantial content
      // IMPROVED: More strict filtering to exclude low-quality snippets
      const isWebSearchSnippet = (source) => {
        const content = source.source_content || '';

        // Check for snippet indicators
        const hasSnippetMarkers = content.includes('Source found via web search') ||
                                  content.includes('Page last updated:');

        // Check for very short content (< 300 chars is usually just metadata)
        const isTooShort = content.length < 300;

        // Check word count - snippets typically have < 50 meaningful words
        const words = content.split(/\s+/).filter(w => w.length > 3);
        const hasLowWordCount = words.length < 50;

        return (hasSnippetMarkers && isTooShort) || hasLowWordCount;
      };

      // Prioritize synthesis and substantive sources
      // Synthesis sources = comprehensive research summaries (ALWAYS include)
      // Substantive = verified/starred OR has >500 chars AND not a snippet
      const substantiveSources = context.research.sources.filter(s => {
        if (s.source_type === 'synthesis') return true; // Always include synthesis
        if (isWebSearchSnippet(s)) return false; // Exclude snippets
        if (s.source_content && s.source_content.length > 500) return true; // Include long content
        if (s.fact_check_status === 'verified' || s.fact_check_status === 'perplexity-verified') return true; // Include verified
        if (s.is_starred) return true; // Include starred
        return false; // Exclude everything else
      });

      const verifiedSources = substantiveSources.filter(s => s.fact_check_status === 'verified' || s.fact_check_status === 'perplexity-verified');
      const starredSources = substantiveSources.filter(s => s.is_starred);
      const synthesisSources = substantiveSources.filter(s => s.source_type === 'synthesis');

      prompt += `
RESEARCH SOURCES (USE THESE FOR FACTUAL ACCURACY):
`;

      // Add synthesis sources first (comprehensive overviews)
      if (synthesisSources.length > 0) {
        prompt += `
📚 COMPREHENSIVE RESEARCH SUMMARIES:
${synthesisSources.map(s =>
  `- ${s.source_title}
  ${s.source_content.substring(0, 1000)}...
`).join('\n')}
`;
      }

      // Add starred sources (high priority)
      if (starredSources.length > 0) {
        prompt += `
⭐ HIGH-PRIORITY SOURCES:
${starredSources.slice(0, 5).map(s =>
  `- ${s.source_title}
  ${s.source_content.substring(0, 500)}...
`).join('\n')}
`;
      }

      // Add verified sources
      if (verifiedSources.length > 0) {
        prompt += `
✅ VERIFIED FACTS & CITATIONS:
${verifiedSources.slice(0, 5).map(s =>
  `- ${s.source_title}: ${s.source_content.substring(0, 400)}...`
).join('\n')}
`;
      }

      prompt += `
Total substantive sources available: ${substantiveSources.length} (excluded ${context.research.sources.length - substantiveSources.length} web search snippets)
Use these sources to provide specific facts, statistics, quotes, and examples in your script.
`;
    }

    prompt += `
TRANSITION VARIETY (CRITICAL - DON'T BE REPETITIVE):
⛔ FORBIDDEN TRANSITIONS (DO NOT USE MORE THAN ONCE):
- "Now" to start a sentence (maximum 2 uses in entire script)
- "This brings us to..." (maximum 1 use)
- "Let's examine/look at/explore..." (maximum 1 use total)
- "Moving on to..." (maximum 1 use)

✅ REQUIRED VARIETY - Use at least 8 DIFFERENT transition styles:
- "Here's where the story takes an unexpected turn..."
- "But that's only half the picture..."
- "What happened next shocked even security experts..."
- "The implications go far deeper than initially apparent..."
- "Consider what this means in practice..."
- "The real breakthrough came when..."
- "Behind the scenes, something remarkable was happening..."
- "Against this backdrop, a pattern emerged..."
- "The evidence points to something more troubling..."
- "Digging deeper reveals..."
- "The turning point arrived when..."
- "This sets the stage for what came next..."
- "Beneath the surface lurked..."
- "The ripple effects spread quickly..."
- "Investigators uncovered something unexpected..."
- "The timeline reveals a crucial detail..."

Each transition MUST feel natural and advance the narrative. Mechanical transitions will be rejected.

CRITICAL RULES:
- Write AT LEAST ${bufferWords} words (TARGET - this is ${duration} minutes of content with quality buffer)
- You MUST reach the minimum word count - shorter responses will be rejected
- Count your words as you write and ensure you meet the ${bufferWords} word target
- Include specific timestamps throughout from [${startTime}:00] to [${endTime}:00]
- NO placeholders or shortcuts - write everything in full detail
- Maintain engaging, conversational tone with rich descriptions
- Expand on each point thoroughly - don't rush through topics
- VARY YOUR TRANSITIONS - each transition should be unique and different from the last

🎯 FILLER WORD REDUCTION (MANDATORY - TARGET: <2%):
Minimize filler words and weak qualifiers. Your script must be direct and confident.

❌ FORBIDDEN/MINIMIZE THESE FILLER WORDS:
- "kind of", "sort of" - Use specific language instead
- "really", "very" - Use stronger adjectives instead
- "actually", "basically" - Usually unnecessary
- "literally" - Only use when literally appropriate
- "just" - Often weakens the statement
- "like" (as filler) - Acceptable in quotes, not narration
- "you know", "I mean" - Never acceptable in written scripts
- "somewhat", "rather", "quite" - Use precise terms
- "perhaps", "maybe", "possibly" (overuse) - Be more definitive
- "seem/seems" - State facts directly when possible

✅ INSTEAD USE:
- Strong, specific verbs and adjectives
- Confident, declarative statements
- Precise technical terms
- Active voice construction

Example transformations:
❌ "This attack was really quite sophisticated and kind of unprecedented"
✅ "This attack demonstrated unprecedented sophistication"

❌ "The hackers basically just exploited a very simple vulnerability"
✅ "The hackers exploited a simple SQL injection vulnerability"

REQUIREMENT: Filler word count must be <2% of total words. Calculate this in Card 4.

📺 VISUAL CUE REQUIREMENTS (MANDATORY):
- Include [Visual: ...] markers at LEAST every 60-90 seconds (minimum 10 per 15-minute chunk)
- Each visual cue must be specific and production-ready:
  ✅ Good: "[Visual: Split-screen showing AWS dashboard with red security alerts]"
  ❌ Bad: "[Visual: Something about security]"
- Required visual types to include:
  1. Opening visual for each major section
  2. Data visualizations for statistics
  3. Diagrams for technical explanations
  4. Timeline graphics for sequences
  5. Comparison graphics for before/after
  6. Human element visuals (photos, avatars, office scenes)
- Format: Always use [Visual: description] at the start of a paragraph where the visual appears
- ${isFirst ? 'Start strong with the hook and set up the entire video' : ''}
- ${isLast ? `End with a powerful conclusion and CTA

🚨 MANDATORY METADATA SECTIONS (MUST BE IN THIS EXACT ORDER):

1. ## Description section (with full timestamps for ENTIRE video)
2. ## Tags section (20+ comma-separated tags, NO placeholders or brackets)
3. Then the 4 mandatory cards below

🚨 MANDATORY 4-CARD STRUCTURE (SCRIPT WILL BE REJECTED WITHOUT ALL 4):
After the Description and Tags sections, you MUST include these 4 cards:

## Card 1: Research & Verification
[List all sources used with URLs]
[Add verification status for each major claim]
Format:
### Sources Used:
1. [Source Title] - [URL] - [VERIFIED/UNVERIFIED]
2. [Source Title] - [URL] - [VERIFIED/UNVERIFIED]
...

### Fact-Check Notes:
- [Major Claim 1]: [VERIFIED/UNVERIFIED] - Source: [citation]
- [Major Claim 2]: [VERIFIED/UNVERIFIED] - Source: [citation]
...

## Card 2: Production Guide
[Provide B-roll suggestions and visual production notes]
Format:
### B-Roll Suggestions:
- [Timestamp]: [Specific B-roll footage needed]
- [Timestamp]: [Specific B-roll footage needed]
...

### Key Visual Moments:
- [Timestamp]: [Important visual element description]
...

### Graphics Needed:
- [Title/description of graphic]
- [Title/description of graphic]
...

## Card 3: Metadata & Optimization
[Provide performance predictions and optimization recommendations]
Format:
### Performance Predictions:
- Estimated CTR: [X-Y%] - [Reasoning]
- Estimated Retention: [X-Y%] - [Reasoning]
- Target Audience: [Demographics and interests]

### SEO Recommendations:
- Primary Keywords: [list]
- Secondary Keywords: [list]
- Suggested Title Variations: [3 variations]
- Thumbnail Concepts: [2-3 concepts]

### Engagement Optimization:
- Predicted Hook Performance: [High/Medium/Low] - [Why]
- Best Upload Time: [Day/Time recommendation]
- Playlist Suggestions: [Related topics]

## Card 4: Script Quality Metrics
[Provide factual accuracy and quality metrics]
Format:
### Filler Word Analysis:
- Total Word Count: [X words]
- Filler Words Found: [X instances] ([Y%])
- Target: <2% filler words
- Status: [PASS/FAIL]

### Factual Accuracy:
- Total Claims Made: [X]
- Verified Claims: [X] ([Y%])
- Unverified Claims: [X] ([Y%])
- Hypothetical Scenarios: [X] (properly labeled: YES/NO)

### Voice Profile Adherence:
- Tone Match: [Excellent/Good/Needs Work]
- Style Consistency: [Excellent/Good/Needs Work]
- Signature Phrases Used: [X out of Y required]

ALL 4 CARDS ARE MANDATORY - Missing any card = AUTOMATIC REJECTION` : ''}
${!isFirst ? `
⚠️ CHUNK SEPARATION RULE:
This is chunk ${chunkNumber} of ${totalChunks}. You are ONLY responsible for minutes ${startTime}-${endTime}.
DO NOT attempt to cover content from other time segments. Each chunk covers DIFFERENT topics.
If you generate content that belongs to another chunk, your response will be rejected.` : ''}

SPECIFIC EXAMPLES REQUIRED (NO GENERIC TEMPLATES):
- NEVER use generic placeholders like "Company X" or "a major tech company"
- ALWAYS use real, specific examples with names, dates, and numbers
- Instead of: "Many companies have been affected..."
  Write: "In March 2024, Microsoft disclosed that 245 of their enterprise customers..."
- Instead of: "Attacks can cost millions..."
  Write: "The Equifax breach in 2017 resulted in $1.4 billion in total costs, including $425 million in consumer relief..."
- Include specific technical details: exact CVE numbers, specific malware variants, real IP addresses (when appropriate)
- Use concrete case studies from the research sources provided
- Every major point should have at least ONE specific, named example with quantifiable details

👥 HUMAN ELEMENT REQUIREMENTS (MANDATORY):
You MUST include at least 3 human-interest elements per chunk:
1. **Personal Impact Stories** - Reference specific people affected (even if anonymized)
   Example: "Sarah Martinez, a federal contractor from Virginia, discovered her security clearance data..."
2. **Expert Quotes** - Include at least 2 expert opinions with attribution
   Example: "As Dr. James Chen from MIT's Cybersecurity Lab explains, 'This wasn't just a breach...'"
3. **Emotional Stakes** - Connect technical details to human consequences
   Example: "For the 15,000 government employees affected, this meant sleepless nights wondering..."
4. **Relatable Comparisons** - Use everyday analogies people understand
   Example: "Imagine if someone not only had your house key, but also knew exactly when you'd be away..."
5. **Individual Decisions** - Highlight specific choices made by real people
   Example: "The security researcher who discovered the breach faced an ethical dilemma..."

Make the story HUMAN, not just technical. Viewers need to feel the impact, not just understand it.

FACTUAL ACCURACY REQUIREMENTS:
- When discussing hypothetical scenarios, theoretical attacks, or illustrative examples, CLEARLY label them as such
- Use phrases like "In this hypothetical scenario...", "Based on known vulnerabilities...", or "To illustrate how this could work..."
- Distinguish between confirmed incidents and illustrative examples
- Never present fictional entities or alliances as confirmed real organizations without explicit disclaimer
- If combining multiple real incidents into a narrative, acknowledge this is for educational purposes

🔍 MANDATORY VERIFICATION & CITATION SYSTEM:
Every factual claim in the script MUST be tagged and cited:

1. **Verification Tags** - Add after every factual statement:
   - [VERIFIED] - For facts confirmed by multiple reliable sources
   - [UNVERIFIED] - For claims from single sources or requiring additional confirmation

   Examples:
   ✅ "In March 2024, Microsoft reported 245 enterprise breaches [VERIFIED]"
   ✅ "Some experts estimate the dark web market exceeds $1 trillion [UNVERIFIED]"

2. **HTML Source Citations** - Add immediately after tagged claims:
   Format: <!-- Source: [Source Name], [URL or Document Reference], [Date] -->

   Examples:
   ✅ "The FBI recovered $2.3 million in cryptocurrency [VERIFIED]
       <!-- Source: FBI Press Release, fbi.gov/news/2024/crypto-recovery, March 15 2024 -->"

   ✅ "Attackers used a novel SQL injection technique [VERIFIED]
       <!-- Source: CISA Advisory AA24-073A, cisa.gov/advisories, March 2024 -->"

3. **Citation Requirements**:
   - EVERY statistic must have a source citation
   - EVERY direct quote must have a source citation
   - EVERY technical claim must have a source citation
   - General knowledge statements do not need citations
   - Hypothetical scenarios should be labeled but don't need citations

4. **Citation Placement**:
   - Place citation HTML comment on the line immediately following the claim
   - Keep citations close to the facts they support
   - Don't let citations disrupt the narrative flow (they're hidden in HTML)

AUDIO-FIRST GUIDELINES:
- When using [Visual: X] markers, ALWAYS describe what's shown in the narration as well
- Make content fully comprehensible without seeing any visuals
- Example: Instead of just "[Visual: Chart showing costs]", write "As shown in this data visualization, breach costs have increased by 45% year-over-year, rising from $3.2 million to $4.6 million on average..."
- Audio-only listeners should get the same educational value as visual viewers
- Describe graphs, charts, and diagrams in the narration, not just in visual cues

WORD COUNT REQUIREMENT: Write AT LEAST ${bufferWords} words. This is mandatory.

${context.sponsor ? `
💰 SPONSOR INTEGRATION:
Sponsor: ${context.sponsor.sponsor_name}
Product: ${context.sponsor.sponsor_product}
Call-to-Action: ${context.sponsor.sponsor_cta}
${context.sponsor.sponsor_key_points?.length > 0 ? `Key Points to Mention:
${context.sponsor.sponsor_key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}
Duration: Approximately ${context.sponsor.sponsor_duration || 30} seconds
Placement: ${context.sponsor.placement_preference === 'auto' ? 'Optimal point (typically 25-35% into video)' :
            context.sponsor.placement_preference === 'early' ? 'Early in video (after hook)' :
            context.sponsor.placement_preference === 'mid' ? 'Middle of video' :
            context.sponsor.placement_preference === 'late' ? 'Near end (before conclusion)' :
            `Custom timing at ${context.sponsor.custom_placement_time} seconds`}
Transition Style: ${context.sponsor.transition_style === 'natural' ? 'Smooth, natural segue' :
                   context.sponsor.transition_style === 'direct' ? 'Quick, straightforward' :
                   'Thematic bridge'}
${context.sponsor.include_disclosure !== false ? `Disclosure Required: Include FTC-compliant disclosure (e.g., "This video is sponsored by ${context.sponsor.sponsor_name}")` : ''}

IMPORTANT: Integrate this sponsor segment naturally into the script. Make it feel authentic and maintain viewer engagement. Use [SPONSOR SEGMENT START] and [SPONSOR SEGMENT END] markers.
` : ''}

⚠️ IMPORTANT: Write ONLY the script content. DO NOT include any meta-commentary, explanations about word counts, notes about expansions, or any text that isn't part of the actual script. Just write the script itself.

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
    const seenSectionHeaders = new Set();
    const seenSectionContent = new Map(); // Track content fingerprints

    const processedChunks = chunks.map((chunk, index) => {
      if (index === 0) {
        // Track section headers and content in first chunk
        const sections = chunk.split(/^###\s+/gm);
        sections.forEach((section, idx) => {
          if (idx === 0) return; // Skip content before first header

          const lines = section.split('\n');
          const headerLine = lines[0];
          const headerText = headerLine.toLowerCase().trim();
          seenSectionHeaders.add(headerText);

          // Track content fingerprint (first 100 words)
          const contentText = lines.slice(1).join(' ').replace(/\s+/g, ' ').trim();
          const fingerprint = contentText.substring(0, 500).toLowerCase();
          seenSectionContent.set(headerText, fingerprint);
        });
        return chunk; // Keep first chunk as-is
      }

      // Remove any duplicate title or metadata from subsequent chunks
      let processed = chunk;

      // Split into sections and check each one
      if (index > 0) {
        const sections = processed.split(/^###\s+/gm);
        const filteredSections = sections.map((section, sectionIdx) => {
          if (sectionIdx === 0) {
            // Content before first header - keep but filter lines
            const lines = section.split('\n');
            return lines.filter((line, idx) => {
              // Skip initial headers
              if (idx < 5 && line.startsWith('#')) return false;

              // Remove meta-commentary
              const metaPatterns = [
                /here's.*word.*expansion/i,
                /this.*\d+.*word.*expansion/i,
                /maintains.*style.*tone/i,
                /filling in.*details/i,
                /note:/i,
                /to meet.*word.*count/i,
                /word count.*requirement/i
              ];
              if (metaPatterns.some(pattern => pattern.test(line))) {
                return false;
              }
              return true;
            }).join('\n');
          }

          // This is a section with a header
          const lines = section.split('\n');
          const headerLine = lines[0];
          const headerText = headerLine.toLowerCase().trim();
          const contentText = lines.slice(1).join(' ').replace(/\s+/g, ' ').trim();
          const fingerprint = contentText.substring(0, 500).toLowerCase();

          // Check for duplicate header
          if (seenSectionHeaders.has(headerText)) {
            return null; // Skip this entire section
          }

          // Check for exact match first (100% duplicate)
          const existingFingerprint = seenSectionContent.get(headerText);
          if (existingFingerprint && fingerprint) {
            // Exact match check
            if (existingFingerprint === fingerprint) {
              return null;
            }

            // Then check similarity (>80% match)
            const similarity = this.calculateSimilarity(existingFingerprint, fingerprint);
            if (similarity > 0.8) {
              return null;
            }
          }

          // Track this section
          seenSectionHeaders.add(headerText);
          seenSectionContent.set(headerText, fingerprint);

          // Return section with header
          return '### ' + section;
        }).filter(s => s !== null);

        processed = filteredSections.join('\n\n');
      }

      return processed;
    });

    // Join with smooth transitions
    let stitched = processedChunks.join('\n\n---\n\n');

    // Final cleanup: Remove any remaining meta-commentary blocks
    // NOTE: DO NOT use 's' flag - it makes '.' match newlines and causes massive over-matching
    const metaBlockPatterns = [
      /###\s*Here's.*word.*expansion.*$/gim,  // "### Here's a 500-word expansion"
      /###\s*Note:.*$/gim,                     // "### Note: ..."
      /\[Total word count added:.*?\]/gi,     // "[Total word count added: 551]"
      /\[Word count:.*?\]/gi,                 // "[Word count: ...]"
      /\[.*?\d+.*?words.*?added.*?\]/gi       // "[...X words added...]"
    ];

    metaBlockPatterns.forEach((pattern) => {
      stitched = stitched.replace(pattern, '');
    });

    // CRITICAL: Final deduplication pass to catch duplicates within chunks
    // The previous deduplication only works between chunks, not within them
    stitched = this.removeDuplicateSections(stitched);

    return stitched;
  }

  /**
   * Remove duplicate sections from the complete script
   * This catches duplicates that appear within the same chunk
   * @param {string} script - The complete script
   * @returns {string} Script with duplicates removed
   */
  static removeDuplicateSections(script) {
    const lines = script.split('\n');

    // First, map out all sections with their content
    const sections = [];
    let currentSection = null;
    let currentContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const sectionMatch = line.match(/^(###|##)\s+(.+)$/);

      if (sectionMatch) {
        // Save previous section if exists
        if (currentSection) {
          sections.push({
            header: currentSection.header,
            headerLine: currentSection.headerLine,
            headerKey: currentSection.headerKey,
            content: currentContent,
            wordCount: currentContent.join(' ').split(/\s+/).filter(w => w.length > 0).length
          });
        }

        // Start new section
        currentSection = {
          header: sectionMatch[2],
          headerLine: line,
          headerKey: sectionMatch[2].toLowerCase().trim()
        };
        currentContent = [];
      } else if (currentSection) {
        // Add line to current section
        currentContent.push(line);
      } else {
        // Content before any section
        sections.push({
          header: null,
          headerLine: null,
          headerKey: null,
          content: [line],
          wordCount: line.split(/\s+/).filter(w => w.length > 0).length
        });
      }
    }

    // Don't forget the last section
    if (currentSection) {
      sections.push({
        header: currentSection.header,
        headerLine: currentSection.headerLine,
        headerKey: currentSection.headerKey,
        content: currentContent,
        wordCount: currentContent.join(' ').split(/\s+/).filter(w => w.length > 0).length
      });
    }

    // Now identify and remove duplicates
    const seenHeaders = new Set();
    const result = [];
    for (const section of sections) {
      if (section.headerKey && seenHeaders.has(section.headerKey)) {
        // This is a duplicate - skip it
      } else {
        // Keep this section
        if (section.headerKey) {
          seenHeaders.add(section.headerKey);
        }

        // Add header if exists
        if (section.headerLine) {
          result.push(section.headerLine);
        }

        // Add content
        result.push(...section.content);
      }
    }

    return result.join('\n');
  }

  /**
   * Calculate similarity between two strings using a simple word overlap ratio
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  static calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    // Normalize and split into words
    const words1 = str1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const words2 = str2.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    if (words1.length === 0 || words2.length === 0) return 0;

    // Count matching words
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(w => set2.has(w)));

    // Calculate Jaccard similarity
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  /**
   * Validates that a complete script meets requirements
   * @param {string} script - Complete script
   * @param {number} targetMinutes - Target duration
   * @returns {Object} Validation result
   */
  static validateCompleteness(script, targetMinutes, wordsPerMinute = 130) {
    const wordCount = script.split(/\s+/).length;
    const expectedWords = targetMinutes * wordsPerMinute;
    
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

    // Check for tags section specifically - extract tags section and check for placeholders
    const tagsMatch = script.match(/## Tags\s*\n([^\n#]+)/);
    const hasTags = tagsMatch &&
                    tagsMatch[1].trim().length > 20 && // Must have actual content
                    !tagsMatch[1].includes('[') &&      // No brackets in tags
                    !tagsMatch[1].includes('...') &&    // No ellipsis placeholders
                    tagsMatch[1].split(',').length >= 10; // At least 10 comma-separated tags
    
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

  /**
   * Validates a generated chunk against its outline
   * @param {string} chunkContent - The generated chunk content
   * @param {Object} outlineChunk - The outline for this chunk
   * @param {number} chunkNumber - The chunk number (1-based)
   * @returns {Object} Validation result
   */
  static validateChunk(chunkContent, outlineChunk, chunkNumber) {
    return validateChunkAgainstOutline(chunkContent, outlineChunk, chunkNumber);
  }

  /**
   * Checks if content matches the expected topic
   * @param {string} content - The content to check
   * @param {string} expectedTopic - The expected topic
   * @param {Array} keywords - Optional keywords to check
   * @returns {Object} Match result
   */
  static checkTopicMatch(content, expectedTopic, keywords = []) {
    return checkTopicMatch(content, expectedTopic, keywords);
  }
}

// Support both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LongFormScriptHandler };
  module.exports.default = LongFormScriptHandler;
}

export default LongFormScriptHandler;