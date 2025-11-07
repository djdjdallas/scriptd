import Anthropic from '@anthropic-ai/sdk';
import { getChannelVideos } from '@/lib/youtube/channel';
import { getVideoTranscript } from '@/lib/youtube/video';
import { analyzeVoiceStyle } from '@/lib/youtube/voice-analyzer';
import { analyzeVoiceStyleAdvanced } from '@/lib/youtube/voice-analyzer-v2';
import {
  calculateAllConfidenceScores,
  calculateLinguisticConsistency,
  calculateDataQuality
} from './pattern-analyzer';
import {
  analyzeVideoPerformance,
  correlateVoiceWithPerformance,
  extractHighPerformerPatterns
} from './performance-analyzer';

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use VOICE_MODEL for voice analysis (Sonnet provides excellent results at lower cost)
const VOICE_MODEL = process.env.VOICE_MODEL || process.env.PREMIUM_MODEL || 'claude-sonnet-4-5-20250929';

/**
 * Analyze transcript voice with deep linguistic profiling
 */
async function analyzeTranscriptVoice(transcripts, channelName) {
  // Calculate real confidence scores from patterns FIRST
  const realConfidenceScores = calculateAllConfidenceScores(transcripts);
  const linguisticConsistency = calculateLinguisticConsistency(transcripts);

  const transcriptText = transcripts.map(t => t.text).join('\n\n');

  const enhancedPrompt = `Analyze this YouTube channel's speaking voice and create a comprehensive linguistic profile.
Channel: ${channelName}

DEEP ANALYSIS REQUIREMENTS:

1. LINGUISTIC FINGERPRINTS
- Signature opening patterns (exact phrases they use to start videos)
- Transition phrases between topics (specific words/phrases)
- Closing patterns (how they end videos)
- Filler words and their frequency
- Unique idioms or catchphrases
- Question patterns (rhetorical vs engaging)

2. NARRATIVE STRUCTURE
- Story arc patterns (how they build narratives)
- Information revelation style (dramatic vs methodical)
- Example/evidence presentation patterns
- Personal anecdote frequency and placement
- Cliffhanger and hook placement patterns

3. EMOTIONAL DYNAMICS
- Energy curve throughout videos (opening energy vs middle vs end)
- Emotional beat patterns (e.g., serious→humorous→serious)
- Authenticity markers (when they're most genuine)
- Passion indicators (topics that elevate energy)
- Vulnerability moments and frequency

4. CONTENT POSITIONING
- Self-reference patterns (how often they mention personal experience)
- Audience relationship (teacher, friend, fellow learner, critic)
- Authority stance (expert vs explorer vs commentator)
- Value proposition style (educate vs entertain vs inspire)

5. CULTURAL & TOPICAL REFERENCES
- Types of examples used (pop culture, history, science, etc.)
- Metaphor categories preferred
- Current events integration style
- Meme/internet culture usage
- Academic vs colloquial balance

6. TECHNICAL PATTERNS
- Average words per sentence
- Paragraph/section length patterns
- Vocabulary complexity distribution
- Technical jargon frequency and explanation style
- Data/statistics presentation style

7. ENGAGEMENT TECHNIQUES
- Direct address frequency ("you" usage)
- Inclusive language patterns ("we" vs "I" vs "you")
- Call-to-action style and placement
- Question deployment strategy
- Community building language

8. PACING DYNAMICS
- Speed variations and triggers
- Pause patterns and purposes
- Emphasis techniques (repetition, volume, speed)
- Breathing patterns affecting delivery
- Edit rhythm preferences

TRANSCRIPTS TO ANALYZE:
${transcriptText}

Return ONLY valid JSON (no markdown, no code blocks, just pure JSON). 

CRITICAL JSON RULES:
- All quotes inside string values MUST be escaped with backslash (\")
- All newlines in strings must be escaped as \\n
- No trailing commas in arrays or objects
- All string values must be properly quoted

Create a detailed voice profile with these categories, using specific examples from the transcripts. Include frequency metrics and confidence scores where applicable.

IMPORTANT: When including example phrases, ensure all quotes are properly escaped. For example:
Instead of: "She said "hello""
Use: "She said \\"hello\\""

CRITICAL JSON RULES:
- Respond ONLY with valid JSON (no markdown, no code blocks)
- Never use empty keys (all keys must be non-empty strings)
- Ensure all quotes are properly escaped
- No trailing commas
- Validate the JSON structure before responding`;

  const response = await anthropic.messages.create({
    model: VOICE_MODEL,
    max_tokens: 8000, // Increased from 4000 to prevent truncation
    temperature: 0.3,
    system: "You are an expert linguistic analyst specializing in YouTube content creator voice patterns. Provide detailed, actionable analysis with specific examples. CRITICAL: Respond ONLY with valid JSON. Never use empty keys like \"\": \"value\". Ensure all property names are non-empty strings. Double-check JSON syntax before responding.",
    messages: [{
      role: 'user',
      content: enhancedPrompt
    }]
  });

  return parseEnhancedVoiceAnalysis(response.content[0].text, realConfidenceScores, linguisticConsistency);
}

// Extract partial data from malformed JSON
function extractPartialData(text) {
  const result = {};

  // Try to extract key-value pairs using regex patterns
  const patterns = [
    // String properties: "key": "value"
    /"(\w+)":\s*"([^"]*)"/g,
    // Array properties: "key": ["value1", "value2"]
    /"(\w+)":\s*\[([^\]]*)\]/g,
    // Object properties: "key": {...}
    /"(\w+)":\s*\{([^}]*)\}/g,
    // Number properties: "key": 123
    /"(\w+)":\s*(\d+(?:\.\d+)?)/g,
    // Boolean properties: "key": true/false
    /"(\w+)":\s*(true|false)/g,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [_, key, value] = match;
      if (key && value && !result[key]) {
        // Try to parse the value appropriately
        if (value.startsWith('[') || value.includes(',')) {
          // Array-like value
          try {
            result[key] = JSON.parse('[' + value + ']');
          } catch {
            result[key] = value.split(',').map(v => v.trim().replace(/["\[\]]/g, ''));
          }
        } else if (value === 'true' || value === 'false') {
          result[key] = value === 'true';
        } else if (/^\d+(\.\d+)?$/.test(value)) {
          result[key] = parseFloat(value);
        } else {
          result[key] = value;
        }
      }
    }
  });

  // Ensure we have some critical fields
  const criticalFields = ['tone', 'style', 'pace', 'energy', 'personality'];
  let hasCriticalFields = false;

  criticalFields.forEach(field => {
    if (result[field]) {
      hasCriticalFields = true;
    }
  });

  return hasCriticalFields ? result : null;
}

// Parse enhanced voice analysis with improved JSON fixing
function parseEnhancedVoiceAnalysis(analysisText, realConfidenceScores, linguisticConsistency) {
  try {
    // Clean up markdown code blocks if present
    let cleanedText = analysisText;
    if (analysisText.includes('```')) {
      // Remove markdown code blocks
      cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Trim any whitespace
    cleanedText = cleanedText.trim();
    
    // Try to fix common JSON issues
    try {
      // First attempt: direct parse
      const parsed = JSON.parse(cleanedText);
      return processEnhancedProfile(parsed, realConfidenceScores, linguisticConsistency);
    } catch (e) {
      console.error('Initial parse failed, attempting comprehensive fixes...');
      
      // Advanced JSON repair strategy
      let fixedText = cleanedText;
      
      // Step 1: Protect already escaped quotes
      fixedText = fixedText.replace(/\\"/g, '\u0001ESCAPEDQUOTE\u0001');
      
      // Step 2: Fix quotes in string values more carefully
      // This handles cases like: "example": "She said "hello" to him"
      fixedText = fixedText.replace(
        /"([^":\\,\[\]{}]+)":\s*"([^"]*)"/g,
        (match, key, value) => {
          // Escape any unescaped quotes in the value
          let fixedValue = value.replace(/"/g, '\\"');
          return `"${key}": "${fixedValue}"`;
        }
      );
      
      // Step 3: Fix quotes in array string elements
      // Handle: ["item1", "She said "hello"", "item3"]
      fixedText = fixedText.replace(
        /\[([^\]]*)\]/g,
        (match, content) => {
          // Split by comma but respect quotes
          const items = [];
          let current = '';
          let inQuotes = false;
          let escapeNext = false;
          
          for (let i = 0; i < content.length; i++) {
            const char = content[i];
            
            if (escapeNext) {
              current += char;
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              current += char;
              continue;
            }
            
            if (char === '"') {
              inQuotes = !inQuotes;
            }
            
            if (char === ',' && !inQuotes) {
              items.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          if (current.trim()) {
            items.push(current.trim());
          }
          
          // Fix each item
          const fixedItems = items.map(item => {
            if (item.startsWith('"') && item.endsWith('"')) {
              // It's a string, fix internal quotes
              const inner = item.slice(1, -1);
              // Count quotes - if odd number, we have unescaped quotes
              const quoteCount = (inner.match(/"/g) || []).length;
              const escapedQuoteCount = (inner.match(/\\"/g) || []).length;
              
              if (quoteCount > escapedQuoteCount) {
                // We have unescaped quotes
                const fixed = inner.replace(/(?<!\\)"/g, '\\"');
                return `"${fixed}"`;
              }
            }
            return item;
          });
          
          return '[' + fixedItems.join(', ') + ']';
        }
      );
      
      // Step 4: Restore protected escaped quotes
      fixedText = fixedText.replace(/\u0001ESCAPEDQUOTE\u0001/g, '\\"');
      
      // Step 5: Fix newlines and other control characters in strings
      fixedText = fixedText.replace(
        /"([^"]*)"/g,
        (match, content) => {
          // Only fix if we find unescaped newlines or control chars
          if (content.includes('\n') || content.includes('\r') || content.includes('\t')) {
            const fixed = content
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
            return `"${fixed}"`;
          }
          return match;
        }
      );
      
      // Step 6: Fix unterminated strings and incomplete arrays
      // This is critical for the current error where array elements are incomplete
      let depth = 0;
      let inString = false;
      let escapeNext = false;
      let lastValidPos = 0;

      for (let i = 0; i < fixedText.length; i++) {
        const char = fixedText[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inString = !inString;
        }

        if (!inString) {
          if (char === '{' || char === '[') depth++;
          if (char === '}' || char === ']') {
            depth--;
            if (depth === 0) lastValidPos = i;
          }
        }
      }

      // If we have unclosed structures, try to close them properly
      if (depth > 0) {
        console.log(`Detected ${depth} unclosed structures, attempting to fix...`);

        // Close any open strings first
        if (inString) {
          fixedText += '"';
        }

        // Close open structures
        while (depth > 0) {
          // Check if we need to close an array or object
          // Look back to see what was opened last
          let needsComma = false;
          const lastContent = fixedText.slice(-50).trim();

          if (lastContent && !lastContent.endsWith(',') &&
              !lastContent.endsWith('{') && !lastContent.endsWith('[')) {
            needsComma = true;
          }

          // Determine what to close based on the text pattern
          if (fixedText.lastIndexOf('[') > fixedText.lastIndexOf('{')) {
            fixedText += ']';
          } else {
            fixedText += '}';
          }
          depth--;
        }
      }

      // Step 7: Fix empty keys and malformed properties
      // Remove properties with empty keys like "": "value"
      fixedText = fixedText.replace(/,?\s*""\s*:\s*"[^"]*"/g, '');
      fixedText = fixedText.replace(/,?\s*""\s*:\s*\{[^}]*\}/g, '');
      fixedText = fixedText.replace(/,?\s*""\s*:\s*\[[^\]]*\]/g, '');

      // Fix incomplete array elements (specifically for data_presentation issue)
      fixedText = fixedText.replace(/,\s*,/g, ',');
      fixedText = fixedText.replace(/\[\s*,/g, '[');
      fixedText = fixedText.replace(/,\s*\]/g, ']');

      // Step 8: Fix structural issues
      // Remove trailing commas
      fixedText = fixedText.replace(/,(\s*[}\]])/g, '$1');

      // Add missing commas between properties
      fixedText = fixedText.replace(/([}\]])(\s*)("[^"]+":)/g, '$1,$2$3');
      fixedText = fixedText.replace(/("|\d|true|false|null)(\s+)("[^"]+":)/g, '$1,$2$3');

      // Clean up any double commas created by removing empty keys
      fixedText = fixedText.replace(/,\s*,+/g, ',');
      // Remove leading commas after opening braces/brackets
      fixedText = fixedText.replace(/\{\s*,/g, '{');
      fixedText = fixedText.replace(/\[\s*,/g, '[');

      // Try parsing the fixed version
      try {
        const parsed = JSON.parse(fixedText);
        console.log('Successfully parsed after comprehensive fixes');
        return processEnhancedProfile(parsed, realConfidenceScores, linguisticConsistency);
      } catch (e2) {
        console.error('Parse failed even after fixes:', e2.message);

        // Log debugging info
        const match = e2.message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          const start = Math.max(0, pos - 150);
          const end = Math.min(fixedText.length, pos + 150);
          console.error('Text around error position:', fixedText.substring(start, end));
        }

        // Attempt to extract partial data
        console.log('Attempting to extract partial data...');
        const partialData = extractPartialData(fixedText);

        if (partialData && Object.keys(partialData).length > 5) {
          console.log(`Extracted ${Object.keys(partialData).length} fields from partial data`);
          return processEnhancedProfile(partialData, realConfidenceScores, linguisticConsistency);
        }

        // Return a fallback structure with real confidence scores
        console.log('Returning enhanced fallback structure');
        const fallback = getFallbackVoiceProfile();

        // Add real calculated scores to the fallback
        if (realConfidenceScores) {
          fallback.confidenceScores = realConfidenceScores;
        }
        if (linguisticConsistency) {
          fallback.linguisticConsistency = linguisticConsistency;
        }

        // Mark as fallback so we can track it
        fallback._isFallback = true;
        fallback._parseError = e2.message;

        return fallback;
      }
    }
  } catch (error) {
    console.error('Error in parseEnhancedVoiceAnalysis:', error);
    return getFallbackVoiceProfile();
  }
}

// Process the parsed enhanced profile
function processEnhancedProfile(parsed, realConfidenceScores, linguisticConsistency) {
  // Ensure all required deep analysis fields are present
  const enhancedProfile = {
    // Core voice characteristics (existing)
    tone: parsed.tone?.length > 0 ? parsed.tone : null,
    style: parsed.style?.length > 0 ? parsed.style : null,
    pace: parsed.pace || 'moderate',
    energy: parsed.energy || 'medium',
    personality: parsed.personality?.length > 0 ? parsed.personality : null,
    
    // Enhanced linguistic patterns (new)
    linguisticFingerprints: {
      openingPatterns: parsed.linguisticFingerprints?.openingPatterns || [],
      transitionPhrases: parsed.linguisticFingerprints?.transitionPhrases || [],
      closingPatterns: parsed.linguisticFingerprints?.closingPatterns || [],
      fillerWords: parsed.linguisticFingerprints?.fillerWords || {},
      signaturePhrases: parsed.linguisticFingerprints?.signaturePhrases || [],
      questionPatterns: parsed.linguisticFingerprints?.questionPatterns || {}
    },
    
    narrativeStructure: {
      storyArcPattern: parsed.narrativeStructure?.storyArcPattern || '',
      informationFlow: parsed.narrativeStructure?.informationFlow || '',
      exampleStyle: parsed.narrativeStructure?.exampleStyle || '',
      anecdoteUsage: parsed.narrativeStructure?.anecdoteUsage || {},
      hookPlacement: parsed.narrativeStructure?.hookPlacement || []
    },
    
    emotionalDynamics: {
      energyCurve: parsed.emotionalDynamics?.energyCurve || [],
      emotionalBeats: parsed.emotionalDynamics?.emotionalBeats || [],
      authenticityMarkers: parsed.emotionalDynamics?.authenticityMarkers || [],
      passionTriggers: parsed.emotionalDynamics?.passionTriggers || [],
      vulnerabilityPattern: parsed.emotionalDynamics?.vulnerabilityPattern || ''
    },
    
    contentPositioning: {
      selfReferenceRate: parsed.contentPositioning?.selfReferenceRate || 0,
      audienceRelationship: parsed.contentPositioning?.audienceRelationship || '',
      authorityStance: parsed.contentPositioning?.authorityStance || '',
      valueProposition: parsed.contentPositioning?.valueProposition || ''
    },
    
    culturalReferences: {
      exampleCategories: parsed.culturalReferences?.exampleCategories || [],
      metaphorTypes: parsed.culturalReferences?.metaphorTypes || [],
      currentEventsStyle: parsed.culturalReferences?.currentEventsStyle || '',
      internetCultureUsage: parsed.culturalReferences?.internetCultureUsage || '',
      formalityBalance: parsed.culturalReferences?.formalityBalance || ''
    },
    
    technicalPatterns: {
      avgWordsPerSentence: parsed.technicalPatterns?.avgWordsPerSentence || 15,
      vocabularyComplexity: parsed.technicalPatterns?.vocabularyComplexity || '',
      jargonUsage: parsed.technicalPatterns?.jargonUsage || {},
      dataPresentation: parsed.technicalPatterns?.dataPresentation || ''
    },
    
    engagementTechniques: {
      directAddressFrequency: parsed.engagementTechniques?.directAddressFrequency || 0,
      pronounUsage: parsed.engagementTechniques?.pronounUsage || {},
      ctaStyle: parsed.engagementTechniques?.ctaStyle || '',
      questionStrategy: parsed.engagementTechniques?.questionStrategy || '',
      communityLanguage: parsed.engagementTechniques?.communityLanguage || []
    },
    
    pacingDynamics: {
      speedVariations: parsed.pacingDynamics?.speedVariations || [],
      pausePatterns: parsed.pacingDynamics?.pausePatterns || {},
      emphasisTechniques: parsed.pacingDynamics?.emphasisTechniques || [],
      rhythmPreferences: parsed.pacingDynamics?.rhythmPreferences || ''
    },
    
    // Implementation guidance
    implementationNotes: parsed.implementationNotes || {},
    // Use REAL calculated confidence scores instead of AI-generated ones
    confidenceScores: realConfidenceScores || {},
    linguisticConsistency: linguisticConsistency || {},

    // Backwards compatibility (use null instead of empty strings)
    dos: parsed.dos?.length > 0 ? parsed.dos : null,
    donts: parsed.donts?.length > 0 ? parsed.donts : null,
    vocabulary: parsed.vocabulary || null,
    sentenceStructure: parsed.sentenceStructure || null,
    hooks: parsed.hooks || null,
    transitions: parsed.transitions || null,
    engagement: parsed.engagement || null,
    humor: parsed.humor || null,
    signature_phrases: parsed.signature_phrases?.length > 0 ? parsed.signature_phrases : null,
    summary: parsed.summary || null
  };

  // Add data quality indicators
  enhancedProfile._dataQuality = calculateDataQuality(enhancedProfile);

  return enhancedProfile;
}

// Get fallback voice profile
function getFallbackVoiceProfile() {
  return generateDefaultEnhancedProfile();
}

// Generate default enhanced profile structure
function generateDefaultEnhancedProfile() {
  return {
    tone: ['conversational'],
    style: ['informal'],
    pace: 'moderate',
    energy: 'medium',
    personality: ['engaging'],
    linguisticFingerprints: {
      openingPatterns: [],
      transitionPhrases: [],
      closingPatterns: [],
      fillerWords: {},
      signaturePhrases: [],
      questionPatterns: {}
    },
    narrativeStructure: {
      storyArcPattern: 'linear',
      informationFlow: 'sequential',
      exampleStyle: 'illustrative',
      anecdoteUsage: { frequency: 'moderate' },
      hookPlacement: ['beginning']
    },
    emotionalDynamics: {
      energyCurve: ['steady'],
      emotionalBeats: [],
      authenticityMarkers: [],
      passionTriggers: [],
      vulnerabilityPattern: 'occasional'
    },
    contentPositioning: {
      selfReferenceRate: 0.1,
      audienceRelationship: 'educator',
      authorityStance: 'knowledgeable',
      valueProposition: 'informative'
    },
    culturalReferences: {
      exampleCategories: ['general'],
      metaphorTypes: ['common'],
      currentEventsStyle: 'occasional',
      internetCultureUsage: 'minimal',
      formalityBalance: 'balanced'
    },
    technicalPatterns: {
      avgWordsPerSentence: 15,
      vocabularyComplexity: 'moderate',
      jargonUsage: { frequency: 'low' },
      dataPresentation: 'simplified'
    },
    engagementTechniques: {
      directAddressFrequency: 0.2,
      pronounUsage: { you: 40, we: 30, i: 30 },
      ctaStyle: 'gentle',
      questionStrategy: 'occasional',
      communityLanguage: []
    },
    pacingDynamics: {
      speedVariations: ['consistent'],
      pausePatterns: { frequency: 'natural' },
      emphasisTechniques: ['repetition'],
      rhythmPreferences: 'steady'
    },
    implementationNotes: {},
    confidenceScores: {},
    dos: [],
    donts: [],
    vocabulary: 'accessible',
    sentenceStructure: 'varied',
    hooks: 'topical',
    transitions: 'smooth',
    engagement: 'moderate',
    humor: 'occasional',
    signature_phrases: [],
    summary: 'Standard conversational style',
    // Performance metrics placeholder
    performanceMetrics: { hasData: false },
    performanceCorrelation: { hasCorrelation: false, recommendations: [] }
  };
}

/**
 * Fetch and analyze actual transcripts from YouTube channels
 * This provides real voice analysis instead of theoretical blending
 */
export async function analyzeChannelVoicesFromYouTube(channels, config) {
  const channelAnalyses = [];
  
  for (const channel of channels) {
    console.log(`\n📺 Analyzing voice for channel: ${channel.title || channel.name}`);
    
    try {
      // Extract YouTube channel ID from various possible fields
      const youtubeChannelId = channel.youtube_channel_id || 
                              channel.channelId || 
                              channel.youtubeChannelId ||
                              channel.channel_id;
      
      console.log(`  YouTube Channel ID: ${youtubeChannelId || 'NOT FOUND'}`);
      
      // Skip if not a real YouTube channel (e.g., custom/remix channels)
      if (!youtubeChannelId || youtubeChannelId.startsWith('remix_')) {
        console.log(`  ⚠️ Skipping non-YouTube channel: ${channel.title} (no valid YouTube ID)`);
        channelAnalyses.push({
          channel: channel,
          voiceAnalysis: null,
          source: 'skipped',
          error: 'Not a YouTube channel'
        });
        continue;
      }

      // Check if channel already has a trained voice profile
      if (channel.voice_profile && Object.keys(channel.voice_profile).length > 0) {
        console.log(`  ✓ Using existing voice profile for ${channel.title}`);
        channelAnalyses.push({
          channel: channel,
          voiceAnalysis: channel.voice_profile,
          source: 'existing',
          videosAnalyzed: 0
        });
        continue;
      }

      // Fetch videos from the channel
      console.log(`  🔍 Fetching videos from YouTube channel: ${youtubeChannelId}`);
      const videos = await getChannelVideos(youtubeChannelId, 10);
      
      if (!videos || videos.length === 0) {
        console.log(`  ⚠️ No videos found for channel: ${channel.title}`);
        channelAnalyses.push({
          channel: channel,
          voiceAnalysis: null,
          source: 'no-videos',
          error: 'No videos found'
        });
        continue;
      }

      // Fetch transcripts from videos
      const transcripts = [];
      const analyzedVideos = [];
      const maxTranscripts = 5; // Analyze up to 5 videos per channel for remix
      
      console.log(`  📝 Attempting to fetch transcripts from ${videos.length} videos...`);
      
      for (const video of videos) {
        if (transcripts.length >= maxTranscripts) break;
        
        try {
          const transcript = await getVideoTranscript(video.id);
          
          if (transcript.hasTranscript && transcript.fullText) {
            transcripts.push(transcript.fullText);
            analyzedVideos.push({
              id: video.id,
              title: video.snippet.title,
              publishedAt: video.snippet.publishedAt
            });
            console.log(`    ✓ Got transcript: ${video.snippet.title.substring(0, 50)}...`);
          } else {
            console.log(`    ✗ No transcript: ${video.snippet.title.substring(0, 50)}...`);
          }
        } catch (error) {
          console.log(`    ✗ Error: ${error.message}`);
        }
      }

      // Analyze the transcripts if we have any
      let voiceAnalysis = null;
      let source = 'none';
      
      if (transcripts.length > 0) {
        console.log(`  🧠 Analyzing ${transcripts.length} transcripts with enhanced profiling...`);
        
        // Prepare transcript data for enhanced analysis
        const transcriptData = transcripts.map((text, index) => ({
          text: text,
          videoTitle: analyzedVideos[index]?.title || `Video ${index + 1}`
        }));
        
        // Run enhanced linguistic analysis
        const enhancedAnalysis = await analyzeTranscriptVoice(transcriptData, channel.title || channel.name);
        
        // Also run basic and advanced analysis for backwards compatibility
        const basicAnalysis = await analyzeVoiceStyle(transcripts);
        const advancedAnalysis = await analyzeVoiceStyleAdvanced(transcripts);
        
        voiceAnalysis = {
          ...enhancedAnalysis,
          basic: basicAnalysis,
          advanced: advancedAnalysis,
          analyzedVideos: analyzedVideos,
          transcriptCount: transcripts.length
        };

        // Add performance analysis
        console.log(`  📊 Analyzing video performance metrics...`);
        const performanceAnalysis = analyzeVideoPerformance(videos);
        const performanceCorrelation = correlateVoiceWithPerformance(
          voiceAnalysis,
          performanceAnalysis,
          transcriptData
        );
        const highPerformerPatterns = extractHighPerformerPatterns(
          performanceAnalysis.highPerformers?.videos || [],
          transcriptData
        );

        voiceAnalysis.performanceMetrics = performanceAnalysis;
        voiceAnalysis.performanceCorrelation = performanceCorrelation;
        voiceAnalysis.highPerformerPatterns = highPerformerPatterns;

        console.log(`  📈 Performance analysis complete:`);
        console.log(`     • High performers avg views: ${performanceAnalysis.highPerformers?.avgViews || 'N/A'}`);
        console.log(`     • Low performers avg views: ${performanceAnalysis.lowPerformers?.avgViews || 'N/A'}`);
        console.log(`     • ${performanceCorrelation.recommendations?.length || 0} recommendations generated`);

        source = 'youtube-transcripts';

        console.log(`  ✅ Successfully analyzed voice from ${transcripts.length} videos with performance metrics`);
      } else {
        // Fallback to metadata analysis if no transcripts
        console.log(`  ⚠️ No transcripts available, using video metadata...`);
        const videoTexts = videos.slice(0, 3).map(v => 
          `${v.snippet.title}. ${v.snippet.description}`
        );
        
        voiceAnalysis = await analyzeVoiceStyle(videoTexts);
        source = 'metadata';
      }

      channelAnalyses.push({
        channel: channel,
        voiceAnalysis: voiceAnalysis,
        source: source,
        videosAnalyzed: analyzedVideos.length,
        videos: analyzedVideos
      });

    } catch (error) {
      console.error(`  ❌ Error analyzing channel ${channel.title}:`, error.message);
      channelAnalyses.push({
        channel: channel,
        voiceAnalysis: null,
        source: 'error',
        error: error.message
      });
    }
  }

  return channelAnalyses;
}

/**
 * Combine real voice analyses from multiple channels
 * This creates a data-driven remix instead of theoretical
 */
export async function combineRealVoiceAnalyses(channelAnalyses, config) {
  // Filter out channels without voice analysis
  const validAnalyses = channelAnalyses.filter(ca => ca.voiceAnalysis);
  
  if (validAnalyses.length === 0) {
    console.log('⚠️ No valid voice analyses to combine');
    return {
      success: false,
      error: 'No voice analyses available',
      fallback: generateDefaultEnhancedProfile()
    };
  }

  try {
    // Prepare data for Claude to combine
    const analysisData = validAnalyses.map(ca => ({
      channelName: ca.channel.title || ca.channel.name,
      weight: config.weights?.[ca.channel.id] || (1 / validAnalyses.length),
      voiceAnalysis: ca.voiceAnalysis,
      source: ca.source,
      videosAnalyzed: ca.videosAnalyzed
    }));

    const enhancedCombinationPrompt = `You are an expert voice coach and linguistic analyst. You need to create a COMBINED voice profile from these enhanced voice analyses of YouTube channels.

ANALYZED CHANNELS:
${analysisData.map((data, i) => `
Channel ${i + 1}: ${data.channelName}
Weight: ${Math.round(data.weight * 100)}%
Videos Analyzed: ${data.videosAnalyzed}
Source: ${data.source}

Voice Analysis:
${JSON.stringify(data.voiceAnalysis, null, 2)}
`).join('\n---\n')}

REMIX CONFIGURATION:
- Channel Name: ${config.name}
- Description: ${config.description || 'Not provided'}

Create a UNIFIED ENHANCED voice profile that:
1. Preserves the strongest linguistic fingerprints from each source
2. Identifies complementary narrative structures
3. Merges emotional dynamics based on weights
4. Creates hybrid engagement techniques
5. Balances technical patterns appropriately
6. Combines ALL deep linguistic patterns weighted by importance

The combined voice should feel natural and authentic, drawing from all sources.

Include in your response ALL of these categories:

BASIC PROFILE:
- tone, style, personality, pace, energy
- vocabulary, sentenceStructure, hooks, transitions
- engagement, humor, signature_phrases
- dos, donts, summary

ENHANCED PROFILE:
- linguisticFingerprints: (openingPatterns, transitionPhrases, closingPatterns, fillerWords, signaturePhrases, questionPatterns)
- narrativeStructure: (storyArcPattern, informationFlow, exampleStyle, anecdoteUsage, hookPlacement)
- emotionalDynamics: (energyCurve, emotionalBeats, authenticityMarkers, passionTriggers, vulnerabilityPattern)
- contentPositioning: (selfReferenceRate, audienceRelationship, authorityStance, valueProposition)
- culturalReferences: (exampleCategories, metaphorTypes, currentEventsStyle, internetCultureUsage, formalityBalance)
- technicalPatterns: (avgWordsPerSentence, vocabularyComplexity, jargonUsage, dataPresentation)
- engagementTechniques: (directAddressFrequency, pronounUsage, ctaStyle, questionStrategy, communityLanguage)
- pacingDynamics: (speedVariations, pausePatterns, emphasisTechniques, rhythmPreferences)
- implementationNotes: Specific instructions for replicating each pattern
- confidenceScores: Confidence levels for each finding

Create a cohesive enhanced voice profile that can generate authentic-sounding content.
Include specific implementation instructions for each pattern.

CRITICAL JSON RULES:
- Respond ONLY with valid JSON (no markdown, no code blocks)
- Never use empty keys (all keys must be non-empty strings)
- All property names must be descriptive and non-empty
- Ensure all quotes are properly escaped
- No trailing commas
- Validate JSON structure before responding`;

    const response = await anthropic.messages.create({
      model: VOICE_MODEL,
      max_tokens: 4000,
      temperature: 0.7,
      system: "You are an expert at analyzing and combining speaking styles based on real transcript data. Create authentic, data-driven voice profiles with deep linguistic patterns. CRITICAL: Respond ONLY with valid JSON. Never use empty keys like \"\": \"value\". All property names must be non-empty strings. Validate JSON syntax before responding.",
      messages: [
        {
          role: 'user',
          content: enhancedCombinationPrompt
        }
      ]
    });

    // Parse the response
    const content = response.content[0].text;
    let combinedProfile;
    
    try {
      combinedProfile = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        combinedProfile = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse combined voice profile');
      }
    }

    // Replace AI-generated confidence scores with averaged real confidence scores from individual analyses
    const allConfidenceScores = validAnalyses
      .filter(ca => ca.voiceAnalysis?.confidenceScores)
      .map(ca => ca.voiceAnalysis.confidenceScores);

    if (allConfidenceScores.length > 0) {
      // Average the real confidence scores from individual analyses
      const mergedScores = {};
      const scoreKeys = Object.keys(allConfidenceScores[0]);

      scoreKeys.forEach(key => {
        const values = allConfidenceScores
          .map(scores => scores[key]?.confidence || scores[key] || 0)
          .filter(v => typeof v === 'number');

        if (values.length > 0) {
          mergedScores[key] = values.reduce((a, b) => a + b, 0) / values.length;
        }
      });

      combinedProfile.confidenceScores = mergedScores;
    }

    // Calculate data quality for the combined profile
    combinedProfile._dataQuality = calculateDataQuality(combinedProfile);

    // Merge performance metrics if available
    const performanceMetrics = validAnalyses
      .filter(ca => ca.voiceAnalysis?.performanceMetrics)
      .map(ca => ca.voiceAnalysis.performanceMetrics);

    if (performanceMetrics.length > 0) {
      // Average the performance metrics across channels
      const avgHighPerformerViews = performanceMetrics.reduce((sum, pm) =>
        sum + (pm.highPerformers?.avgViews || 0), 0) / performanceMetrics.length;

      const avgLowPerformerViews = performanceMetrics.reduce((sum, pm) =>
        sum + (pm.lowPerformers?.avgViews || 0), 0) / performanceMetrics.length;

      combinedProfile.performanceInsights = {
        avgHighPerformerViews: Math.round(avgHighPerformerViews),
        avgLowPerformerViews: Math.round(avgLowPerformerViews),
        performanceRatio: avgLowPerformerViews > 0 ? (avgHighPerformerViews / avgLowPerformerViews) : 0,
        recommendations: validAnalyses
          .filter(ca => ca.voiceAnalysis?.performanceCorrelation?.recommendations)
          .flatMap(ca => ca.voiceAnalysis.performanceCorrelation.recommendations)
          .slice(0, 5)  // Top 5 recommendations
      };
    }

    // Add metadata about the analysis
    combinedProfile.metadata = {
      channelsAnalyzed: validAnalyses.length,
      totalVideosAnalyzed: validAnalyses.reduce((sum, ca) => sum + (ca.videosAnalyzed || 0), 0),
      sources: validAnalyses.map(ca => ({
        channel: ca.channel.title,
        videosAnalyzed: ca.videosAnalyzed,
        source: ca.source
      })),
      createdAt: new Date().toISOString(),
      basedOnRealData: true
    };

    return {
      success: true,
      voiceProfile: combinedProfile,
      channelAnalyses: validAnalyses
    };

  } catch (error) {
    console.error('Error combining voice analyses:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackVoiceProfile()
    };
  }
}

/**
 * Generate a fallback voice profile (redirects to enhanced version)
 */
function generateFallbackVoiceProfile() {
  return generateDefaultEnhancedProfile();
}

/**
 * Generate script using enhanced voice patterns
 */
export async function generateScriptWithEnhancedVoice(channel, topic, options = {}) {
  const { generateScript } = await import('../prompts/enhanced-script-generation.js');
  
  // Ensure channel has enhanced voice profile
  if (!channel.voice_profile?.linguisticFingerprints) {
    console.warn('Channel missing enhanced voice profile, attempting to generate...');
    // You would need to implement fetchChannelTranscripts based on your data model
    // For now, use basic generation as fallback
    return generateScript({
      channel: {
        ...channel,
        voice_profile: generateDefaultEnhancedProfile()
      },
      topic,
      tier: options.tier || 'balanced',
      features: options.features || {}
    });
  }
  
  // Generate script using enhanced voice patterns
  const script = await generateScript({
    channel,
    topic,
    tier: options.tier || 'balanced',
    features: options.features || {}
  });
  
  return script;
}