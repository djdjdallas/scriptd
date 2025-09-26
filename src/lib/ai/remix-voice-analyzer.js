import Anthropic from '@anthropic-ai/sdk';
import { getChannelVideos } from '@/lib/youtube/channel';
import { getVideoTranscript } from '@/lib/youtube/video';
import { analyzeVoiceStyle } from '@/lib/youtube/voice-analyzer';
import { analyzeVoiceStyleAdvanced } from '@/lib/youtube/voice-analyzer-v2';

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use VOICE_MODEL for voice analysis (Sonnet provides excellent results at lower cost)
const VOICE_MODEL = process.env.VOICE_MODEL || process.env.PREMIUM_MODEL || 'claude-sonnet-4-20250514';

/**
 * Analyze transcript voice with deep linguistic profiling
 */
async function analyzeTranscriptVoice(transcripts, channelName) {
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

Return a detailed JSON voice profile with ALL these categories filled with specific examples from the transcripts. Include:
- Exact quoted examples for each pattern identified
- Frequency metrics where applicable
- Confidence scores for each finding
- Specific implementation notes for replication`;

  const response = await anthropic.messages.create({
    model: VOICE_MODEL,
    max_tokens: 4000,
    temperature: 0.3,
    system: "You are an expert linguistic analyst specializing in YouTube content creator voice patterns. Provide detailed, actionable analysis with specific examples.",
    messages: [{
      role: 'user',
      content: enhancedPrompt
    }]
  });

  return parseEnhancedVoiceAnalysis(response.content[0].text);
}

// Parse enhanced voice analysis
function parseEnhancedVoiceAnalysis(analysisText) {
  try {
    const parsed = JSON.parse(analysisText);
    
    // Ensure all required deep analysis fields are present
    const enhancedProfile = {
      // Core voice characteristics (existing)
      tone: parsed.tone || [],
      style: parsed.style || [],
      pace: parsed.pace || 'moderate',
      energy: parsed.energy || 'medium',
      personality: parsed.personality || [],
      
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
      confidenceScores: parsed.confidenceScores || {},
      
      // Backwards compatibility
      dos: parsed.dos || [],
      donts: parsed.donts || [],
      vocabulary: parsed.vocabulary || '',
      sentenceStructure: parsed.sentenceStructure || '',
      hooks: parsed.hooks || '',
      transitions: parsed.transitions || '',
      engagement: parsed.engagement || '',
      humor: parsed.humor || '',
      signature_phrases: parsed.signature_phrases || [],
      summary: parsed.summary || ''
    };
    
    return enhancedProfile;
    
  } catch (error) {
    console.error('Error parsing enhanced voice analysis:', error);
    // Return a default structure if parsing fails
    return generateDefaultEnhancedProfile();
  }
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
    summary: 'Standard conversational style'
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
        source = 'youtube-transcripts';
        
        console.log(`  ✅ Successfully analyzed voice from ${transcripts.length} videos`);
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

Format as JSON.`;

    const response = await anthropic.messages.create({
      model: VOICE_MODEL,
      max_tokens: 4000,
      temperature: 0.7,
      system: "You are an expert at analyzing and combining speaking styles based on real transcript data. Create authentic, data-driven voice profiles with deep linguistic patterns.",
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