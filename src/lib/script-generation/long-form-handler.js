/**
 * Long-form Script Generation Handler
 * Handles scripts over 30 minutes by splitting generation into chunks
 */

import fs from 'fs';
import path from 'path';

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
      frame
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
          contentPoints: chunkPoints,
          targetAudience,
          tone,
          research,
          frame
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

    // Log voice profile and target audience details (only for first chunk to avoid spam)
    if (isFirst) {
      const logFile = path.join(process.cwd(), 'voice-profile-log.txt');

      let logContent = '\n\n';
      logContent += '═══════════════════════════════════════════════════════════\n';
      logContent += '📝 VOICE PROFILE & TARGET AUDIENCE LOG\n';
      logContent += `Generated: ${new Date().toISOString()}\n`;
      logContent += '═══════════════════════════════════════════════════════════\n\n';

      console.log('\n');
      console.log('═════════════════════════════════════════════════════════════');
      console.log('👥 TARGET AUDIENCE DETAILS (CHUNK GENERATION):');
      console.log('═════════════════════════════════════════════════════════════');

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
          } catch (e) {
            // Not JSON, use as-is
            isRichData = false;
          }
        } else if (typeof audienceData === 'object') {
          isRichData = true;
        }

        if (isRichData && audienceData.demographic_profile) {
          // Log rich audience analysis data
          console.log('🎯 RICH AUDIENCE ANALYSIS DATA FOUND:');
          logContent += '🎯 RICH AUDIENCE ANALYSIS DATA:\n\n';

          if (audienceData.demographic_profile) {
            console.log('\n📊 DEMOGRAPHIC PROFILE:');
            logContent += '📊 DEMOGRAPHIC PROFILE:\n';

            const demo = audienceData.demographic_profile;
            if (demo.age_distribution) {
              console.log('  Age Distribution:');
              logContent += '  Age Distribution:\n';
              Object.entries(demo.age_distribution).forEach(([range, percent]) => {
                console.log(`    ${range}: ${percent}`);
                logContent += `    ${range}: ${percent}\n`;
              });
            }
            if (demo.gender_distribution) {
              console.log('  Gender Distribution:');
              logContent += '  Gender Distribution:\n';
              Object.entries(demo.gender_distribution).forEach(([g, percent]) => {
                console.log(`    ${g}: ${percent}`);
                logContent += `    ${g}: ${percent}\n`;
              });
            }
            if (demo.education_income) {
              if (demo.education_income.education_level) {
                console.log('  Education Level:');
                logContent += '  Education Level:\n';
                Object.entries(demo.education_income.education_level).forEach(([level, percent]) => {
                  console.log(`    ${level}: ${percent}`);
                  logContent += `    ${level}: ${percent}\n`;
                });
              }
              if (demo.education_income.income_brackets) {
                console.log('  Income Brackets:');
                logContent += '  Income Brackets:\n';
                Object.entries(demo.education_income.income_brackets).forEach(([bracket, percent]) => {
                  console.log(`    ${bracket}: ${percent}`);
                  logContent += `    ${bracket}: ${percent}\n`;
                });
              }
            }
            if (demo.geographic_distribution) {
              console.log('  Geographic Distribution:');
              logContent += '  Geographic Distribution:\n';
              Object.entries(demo.geographic_distribution).forEach(([country, percent]) => {
                console.log(`    ${country}: ${percent}`);
                logContent += `    ${country}: ${percent}\n`;
              });
            }
          }

          if (audienceData.psychographic_analysis) {
            console.log('\n🧠 PSYCHOGRAPHIC ANALYSIS:');
            logContent += '\n🧠 PSYCHOGRAPHIC ANALYSIS:\n';

            const psycho = audienceData.psychographic_analysis;
            if (psycho.values && psycho.values.length > 0) {
              console.log('  Values:');
              logContent += '  Values:\n';
              psycho.values.forEach((v, i) => {
                console.log(`    ${i + 1}. ${v}`);
                logContent += `    ${i + 1}. ${v}\n`;
              });
            }
            if (psycho.aspirations && psycho.aspirations.length > 0) {
              console.log('  Aspirations:');
              logContent += '  Aspirations:\n';
              psycho.aspirations.forEach((a, i) => {
                console.log(`    ${i + 1}. ${a}`);
                logContent += `    ${i + 1}. ${a}\n`;
              });
            }
            if (psycho.pain_points && psycho.pain_points.length > 0) {
              console.log('  Pain Points:');
              logContent += '  Pain Points:\n';
              psycho.pain_points.forEach((p, i) => {
                console.log(`    ${i + 1}. ${p}`);
                logContent += `    ${i + 1}. ${p}\n`;
              });
            }
          }

          if (audienceData.engagement_drivers) {
            console.log('\n🎯 ENGAGEMENT DRIVERS:');
            logContent += '\n🎯 ENGAGEMENT DRIVERS:\n';

            const drivers = audienceData.engagement_drivers;
            if (drivers.comment_triggers && drivers.comment_triggers.length > 0) {
              console.log('  Comment Triggers:');
              logContent += '  Comment Triggers:\n';
              drivers.comment_triggers.forEach((t, i) => {
                console.log(`    ${i + 1}. ${t}`);
                logContent += `    ${i + 1}. ${t}\n`;
              });
            }
            if (drivers.loyalty_builders && drivers.loyalty_builders.length > 0) {
              console.log('  Loyalty Builders:');
              logContent += '  Loyalty Builders:\n';
              drivers.loyalty_builders.forEach((l, i) => {
                console.log(`    ${i + 1}. ${l}`);
                logContent += `    ${i + 1}. ${l}\n`;
              });
            }
            if (drivers.sharing_motivations && drivers.sharing_motivations.length > 0) {
              console.log('  Sharing Motivations:');
              logContent += '  Sharing Motivations:\n';
              drivers.sharing_motivations.forEach((s, i) => {
                console.log(`    ${i + 1}. ${s}`);
                logContent += `    ${i + 1}. ${s}\n`;
              });
            }
          }

          if (audienceData.content_consumption_patterns) {
            console.log('\n📺 CONTENT CONSUMPTION PATTERNS:');
            logContent += '\n📺 CONTENT CONSUMPTION PATTERNS:\n';

            const patterns = audienceData.content_consumption_patterns;
            if (patterns.preferred_video_length) {
              // Handle preferred_video_length as an object
              if (typeof patterns.preferred_video_length === 'object') {
                if (patterns.preferred_video_length.optimal_range) {
                  console.log(`  Preferred Video Length: ${patterns.preferred_video_length.optimal_range}`);
                  logContent += `  Preferred Video Length: ${patterns.preferred_video_length.optimal_range}\n`;
                }
                if (patterns.preferred_video_length.tolerance) {
                  console.log(`  Tolerance: ${patterns.preferred_video_length.tolerance}`);
                  logContent += `  Tolerance: ${patterns.preferred_video_length.tolerance}\n`;
                }
                if (patterns.preferred_video_length.minimum_threshold) {
                  console.log(`  Minimum Threshold: ${patterns.preferred_video_length.minimum_threshold}`);
                  logContent += `  Minimum Threshold: ${patterns.preferred_video_length.minimum_threshold}\n`;
                }
              } else {
                // If it's a string, log it directly
                console.log(`  Preferred Video Length: ${patterns.preferred_video_length}`);
                logContent += `  Preferred Video Length: ${patterns.preferred_video_length}\n`;
              }
            }
            if (patterns.watch_time_preference) {
              console.log(`  Watch Time Preference: ${patterns.watch_time_preference}`);
              logContent += `  Watch Time Preference: ${patterns.watch_time_preference}\n`;
            }
            if (patterns.device_usage && patterns.device_usage.length > 0) {
              console.log('  Device Usage:');
              logContent += '  Device Usage:\n';
              patterns.device_usage.forEach((d, i) => {
                console.log(`    ${i + 1}. ${d}`);
                logContent += `    ${i + 1}. ${d}\n`;
              });
            }
          }
        } else {
          // Simple string audience description
          console.log('Full audience description being sent to Claude:');
          console.log('"' + context.targetAudience + '"');
          console.log('Character count:', context.targetAudience.length);
          console.log('Will appear in prompt as: <audience>' + context.targetAudience + '</audience>');

          logContent += `Full audience description: "${context.targetAudience}"\n`;
          logContent += `Character count: ${context.targetAudience.length}\n`;
        }
      } else {
        console.log('No target audience specified - will use default: "General audience interested in the topic"');
        logContent += 'No target audience specified\n';
      }
      console.log('═════════════════════════════════════════════════════════════');
      logContent += '═════════════════════════════════════════════════════════════\n\n';

      console.log('\n');
      console.log('═════════════════════════════════════════════════════════════');
      console.log('🎤 VOICE PROFILE DETAILS (CHUNK GENERATION):');
      console.log('═════════════════════════════════════════════════════════════');

      logContent += '🎤 VOICE PROFILE DETAILS:\n';
      logContent += '═════════════════════════════════════════════════════════════\n';

      if (context.voiceProfile) {
        const voiceProfile = context.voiceProfile;
        const profileName = voiceProfile.profile_name || voiceProfile.name || 'Unknown';
        console.log('Voice profile name:', profileName);
        logContent += `Voice profile name: ${profileName}\n`;

        // Log raw structure for debugging
        console.log('\n🔍 DEBUG - Voice Profile Structure:');
        logContent += '\n🔍 DEBUG - Voice Profile Structure:\n';
        console.log('Has basicProfile:', !!voiceProfile.basicProfile);
        console.log('Has enhancedProfile:', !!voiceProfile.enhancedProfile);
        console.log('Has voiceProfileData:', !!voiceProfile.voiceProfileData);
        console.log('Has metadata:', !!voiceProfile.metadata);
        console.log('basedOnRealData:', voiceProfile.basedOnRealData);
        console.log('All keys:', Object.keys(voiceProfile));
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
          console.log('\n📝 VOICE CHARACTERISTICS:');
          logContent += '\n📝 VOICE CHARACTERISTICS:\n';

          // Log actual fields from basicProfile
          console.log('  Tone:', params.tone?.join(', ') || 'not set');
          console.log('  Style:', params.style?.join(', ') || 'not set');
          console.log('  Pace:', params.pace || 'not set');
          console.log('  Energy:', params.energy || 'not set');
          console.log('  Humor:', params.humor || 'not set');
          console.log('  Vocabulary:', params.vocabulary || 'not set');
          console.log('  Sentence Structure:', params.sentenceStructure || 'not set');

          logContent += `  Tone: ${params.tone?.join(', ') || 'not set'}\n`;
          logContent += `  Style: ${params.style?.join(', ') || 'not set'}\n`;
          logContent += `  Pace: ${params.pace || 'not set'}\n`;
          logContent += `  Energy: ${params.energy || 'not set'}\n`;
          logContent += `  Humor: ${params.humor || 'not set'}\n`;
          logContent += `  Vocabulary: ${params.vocabulary || 'not set'}\n`;
          logContent += `  Sentence Structure: ${params.sentenceStructure || 'not set'}\n`;

          // Log DOs and DONTs
          if (params.dos && params.dos.length > 0) {
            console.log('\n✅ DO:');
            logContent += '\n✅ DO:\n';
            params.dos.slice(0, 5).forEach((item, i) => {
              console.log(`  ${i + 1}. ${item}`);
              logContent += `  ${i + 1}. ${item}\n`;
            });
          }

          if (params.donts && params.donts.length > 0) {
            console.log('\n❌ DON\'T:');
            logContent += '\n❌ DON\'T:\n';
            params.donts.slice(0, 5).forEach((item, i) => {
              console.log(`  ${i + 1}. ${item}`);
              logContent += `  ${i + 1}. ${item}\n`;
            });
          }

          // Log signature phrases
          console.log('\n💬 SIGNATURE PHRASES:');
          logContent += '\n💬 SIGNATURE PHRASES:\n';
          if (params.signaturePhrases && params.signaturePhrases.length > 0) {
            params.signaturePhrases.slice(0, 8).forEach((phrase, i) => {
              console.log(`  ${i + 1}. "${phrase}"`);
              logContent += `  ${i + 1}. "${phrase}"\n`;
            });
          } else {
            console.log('  (None specified)');
            logContent += '  (None specified)\n';
          }

          // Log hooks and transitions
          console.log('\n🎣 HOOK STYLE:');
          logContent += '\n🎣 HOOK STYLE:\n';
          console.log(`  ${params.hooks || 'not specified'}`);
          logContent += `  ${params.hooks || 'not specified'}\n`;

          console.log('\n🔄 TRANSITIONS:');
          logContent += '\n🔄 TRANSITIONS:\n';
          console.log(`  ${params.transitions || 'not specified'}`);
          logContent += `  ${params.transitions || 'not specified'}\n`;

          console.log('\n👥 ENGAGEMENT:');
          logContent += '\n👥 ENGAGEMENT:\n';
          console.log(`  ${params.engagement || 'not specified'}`);
          logContent += `  ${params.engagement || 'not specified'}\n`;

          // Advanced features
          if (params.prosody && Object.keys(params.prosody).length > 0) {
            console.log('\n🎯 PROSODY (Advanced):');
            logContent += '\n🎯 PROSODY (Advanced):\n';
            Object.entries(params.prosody).forEach(([key, value]) => {
              console.log(`  ${key}: ${JSON.stringify(value)}`);
              logContent += `  ${key}: ${JSON.stringify(value)}\n`;
            });
          }
        }

        if (trainingData) {
          console.log('\n📊 TRAINING METADATA:');
          logContent += '\n📊 TRAINING METADATA:\n';
          console.log('  Sample Count:', trainingData.sampleCount || 'not set');
          console.log('  Total Words:', trainingData.totalWords || 'not set');
          console.log('  Source:', trainingData.source || 'not set');
          console.log('  Processed At:', trainingData.processed_at || 'not set');

          logContent += `  Sample Count: ${trainingData.sampleCount || 'not set'}\n`;
          logContent += `  Total Words: ${trainingData.totalWords || 'not set'}\n`;
          logContent += `  Source: ${trainingData.source || 'not set'}\n`;
          logContent += `  Processed At: ${trainingData.processed_at || 'not set'}\n`;
        }

        // Log advanced analysis if available (from channels.voice_profile.advanced)
        if (advanced && Object.keys(advanced).length > 0) {
          console.log('\n🎯 ADVANCED ANALYSIS:');
          logContent += '\n🎯 ADVANCED ANALYSIS:\n';

          if (advanced.prosody) {
            console.log('  Prosody:');
            logContent += '  Prosody:\n';
            if (advanced.prosody.energyLevel) {
              console.log(`    Energy Level: ${advanced.prosody.energyLevel.level} (score: ${advanced.prosody.energyLevel.score})`);
              logContent += `    Energy Level: ${advanced.prosody.energyLevel.level} (score: ${advanced.prosody.energyLevel.score})\n`;
            }
            if (advanced.prosody.speechTempo) {
              console.log(`    Speech Tempo: ${advanced.prosody.speechTempo.pace} (${advanced.prosody.speechTempo.wordsPerMinute} WPM)`);
              logContent += `    Speech Tempo: ${advanced.prosody.speechTempo.pace} (${advanced.prosody.speechTempo.wordsPerMinute} WPM)\n`;
            }
          }

          if (advanced.personality) {
            console.log('  Personality:');
            logContent += '  Personality:\n';
            if (advanced.personality.formalityScore) {
              console.log(`    Formality: ${advanced.personality.formalityScore.level}`);
              logContent += `    Formality: ${advanced.personality.formalityScore.level}\n`;
            }
            if (advanced.personality.humorFrequency) {
              console.log(`    Humor: ${advanced.personality.humorFrequency.level}`);
              logContent += `    Humor: ${advanced.personality.humorFrequency.level}\n`;
            }
            if (advanced.personality.storytellingStyle) {
              console.log(`    Storytelling: ${advanced.personality.storytellingStyle.primaryStyle}`);
              logContent += `    Storytelling: ${advanced.personality.storytellingStyle.primaryStyle}\n`;
            }
          }

          if (advanced.quality) {
            console.log('  Quality Metrics:');
            logContent += '  Quality Metrics:\n';
            if (advanced.quality.fillerWordUsage) {
              console.log(`    Filler Words: ${advanced.quality.fillerWordUsage.level} (${advanced.quality.fillerWordUsage.density}% density)`);
              logContent += `    Filler Words: ${advanced.quality.fillerWordUsage.level} (${advanced.quality.fillerWordUsage.density}% density)\n`;
              if (advanced.quality.fillerWordUsage.fillers) {
                console.log('    Top Fillers:');
                logContent += '    Top Fillers:\n';
                Object.entries(advanced.quality.fillerWordUsage.fillers).slice(0, 5).forEach(([word, count]) => {
                  console.log(`      "${word}": ${count} uses`);
                  logContent += `      "${word}": ${count} uses\n`;
                });
              }
            }
            if (advanced.quality.vocabularyDiversity) {
              console.log(`    Vocabulary Diversity: ${advanced.quality.vocabularyDiversity.level} (${advanced.quality.vocabularyDiversity.uniqueWords} unique words)`);
              logContent += `    Vocabulary Diversity: ${advanced.quality.vocabularyDiversity.level} (${advanced.quality.vocabularyDiversity.uniqueWords} unique words)\n`;
            }
          }

          if (advanced.creatorPatterns) {
            console.log('  Creator Patterns:');
            logContent += '  Creator Patterns:\n';
            if (advanced.creatorPatterns.introStyle) {
              console.log(`    Intro Style: ${advanced.creatorPatterns.introStyle.style}`);
              logContent += `    Intro Style: ${advanced.creatorPatterns.introStyle.style}\n`;
            }
            if (advanced.creatorPatterns.ctaPatterns) {
              const ctas = [];
              if (advanced.creatorPatterns.ctaPatterns.subscribe?.present) ctas.push('subscribe');
              if (advanced.creatorPatterns.ctaPatterns.like?.present) ctas.push('like');
              if (advanced.creatorPatterns.ctaPatterns.comment?.present) ctas.push('comment');
              if (ctas.length > 0) {
                console.log(`    CTAs Used: ${ctas.join(', ')}`);
                logContent += `    CTAs Used: ${ctas.join(', ')}\n`;
              }
            }
          }
        }
      } else {
        console.log('No voice profile provided');
        logContent += 'No voice profile provided\n';
      }
      console.log('═════════════════════════════════════════════════════════════\n');
      logContent += '═════════════════════════════════════════════════════════════\n';

      // Write to file
      try {
        fs.appendFileSync(logFile, logContent, 'utf8');
        console.log(`\n✅ Voice profile details saved to: ${logFile}\n`);
      } catch (error) {
        console.error('❌ Failed to write voice profile log:', error.message);
      }
    }

    // Calculate target words (using 130 WPM standard)
    const targetWords = duration * 130;
    const bufferWords = Math.ceil(targetWords * 1.10); // 10% buffer for quality

    let prompt = `Generate PART ${chunkNumber} of ${totalChunks} for a YouTube script.

CRITICAL: You MUST write AT LEAST ${bufferWords} words for this section. Be VERBOSE and DETAILED.

VIDEO CONTEXT:
- Title: ${context.title}
- Topic: ${context.topic}
- This section: Minutes ${startTime}-${endTime} (${duration} minutes)
- Script type: FULL DETAILED SCRIPT with complete narration
- Target length: ${targetWords} words (aim for ${bufferWords}+ to ensure quality)

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
          if (basicProfile.tone && basicProfile.tone.length > 0) {
            prompt += `• Tone: ${basicProfile.tone.join(', ')} - MAINTAIN THIS THROUGHOUT\n`;
          }
          if (basicProfile.style && basicProfile.style.length > 0) {
            prompt += `• Style: ${basicProfile.style.join(', ')} - USE THIS STYLE CONSISTENTLY\n`;
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

          if (basicProfile.hooks) {
            prompt += `\n🎣 OPENING HOOK STYLE (REQUIRED):\n${basicProfile.hooks}\n`;
          }
          if (basicProfile.transitions) {
            prompt += `\n🔄 TRANSITION STYLE (REQUIRED):\n${basicProfile.transitions}\n`;
          }
          if (basicProfile.engagement) {
            prompt += `\n👥 AUDIENCE ENGAGEMENT (REQUIRED):\n${basicProfile.engagement}\n`;
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
- Include a strong conclusion summarizing key points
- Add a compelling call-to-action
- Include next video teaser
- End on a high note to encourage engagement
- Include timestamps from [${startTime}:00] to [${endTime}:00]

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

    // Add research sources if available
    if (context.research?.sources && context.research.sources.length > 0) {
      // Filter out web search snippets - only include sources with substantial content
      const isWebSearchSnippet = (source) => {
        const content = source.source_content || '';
        return content.includes('Source found via web search. Page last updated:') && content.length < 100;
      };

      const substantiveSources = context.research.sources.filter(s =>
        s.source_type === 'synthesis' || (s.source_content && s.source_content.length > 500 && !isWebSearchSnippet(s))
      );

      console.log(`📚 Adding ${substantiveSources.length} research sources to chunk ${chunkNumber} prompt (filtered ${context.research.sources.length - substantiveSources.length} web search snippets)`);
      const verifiedSources = substantiveSources.filter(s => s.fact_check_status === 'verified' || s.fact_check_status === 'perplexity-verified');
      const starredSources = substantiveSources.filter(s => s.is_starred);
      const synthesisSources = substantiveSources.filter(s => s.source_type === 'synthesis');
      console.log(`  - Synthesis: ${synthesisSources.length}, Starred: ${starredSources.length}, Verified: ${verifiedSources.length}`);

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
CRITICAL RULES:
- Write AT LEAST ${bufferWords} words (TARGET - this is ${duration} minutes of content with quality buffer)
- You MUST reach the minimum word count - shorter responses will be rejected
- Count your words as you write and ensure you meet the ${bufferWords} word target
- Include specific timestamps throughout from [${startTime}:00] to [${endTime}:00]
- NO placeholders or shortcuts - write everything in full detail
- Maintain engaging, conversational tone with rich descriptions
- Include [Visual: ...] cues for production
- Expand on each point thoroughly - don't rush through topics
- ${isFirst ? 'Start strong with the hook and set up the entire video' : ''}
- ${isLast ? `End with a powerful conclusion and CTA
- MUST include ## Description section with full timestamps for ENTIRE video
- MUST include ## Tags section with 20+ real tags (no placeholders)` : ''}

WORD COUNT REQUIREMENT: Write AT LEAST ${bufferWords} words. This is mandatory.

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
    const processedChunks = chunks.map((chunk, index) => {
      if (index === 0) return chunk; // Keep first chunk as-is

      // Remove any duplicate title or metadata from subsequent chunks
      let processed = chunk;

      // Remove lines that look like headers (start with #) or meta-commentary
      if (index > 0) {
        const lines = processed.split('\n');
        const filteredLines = lines.filter((line, idx) => {
          // Skip the first few lines if they're headers
          if (idx < 5 && line.startsWith('#')) return false;

          // Remove meta-commentary patterns
          const metaPatterns = [
            /here's.*word.*expansion/i,
            /this.*\d+.*word.*expansion/i,
            /maintains.*style.*tone/i,
            /filling in.*details/i,
            /note:/i,
            /^###.*expansion/i,
            /to meet.*word.*count/i,
            /word count.*requirement/i
          ];

          if (metaPatterns.some(pattern => pattern.test(line))) {
            console.log(`🧹 Removing meta-commentary: "${line}"`);
            return false;
          }

          return true;
        });
        processed = filteredLines.join('\n');
      }

      return processed;
    });

    // Join with smooth transitions
    let stitched = processedChunks.join('\n\n---\n\n');

    // Final cleanup: Remove any remaining meta-commentary blocks
    const metaBlockPatterns = [
      /###\s*Here's.*?(?=\n\[|\n##|\n$)/gis,
      /###\s*Note:.*?(?=\n\[|\n##|\n$)/gis,
      /###\s*\d+.*word.*expansion.*?(?=\n\[|\n##|\n$)/gis
    ];

    metaBlockPatterns.forEach(pattern => {
      if (pattern.test(stitched)) {
        console.log('🧹 Removing meta-commentary block');
        stitched = stitched.replace(pattern, '');
      }
    });

    return stitched;
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
}

// Support both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LongFormScriptHandler };
  module.exports.default = LongFormScriptHandler;
}

export default LongFormScriptHandler;