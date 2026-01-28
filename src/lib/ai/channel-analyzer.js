import { createClient } from '@supabase/supabase-js';
import { callAIService } from '../ai-service';
import { analyzeTranscriptVoice, generateDefaultEnhancedProfile } from './remix-voice-analyzer';
import { getChannelVideos } from '../youtube/channel';
import { getVideoTranscript } from '../youtube/video';
import { parseAIResponse } from '@/lib/utils/json-parser';
import { analyzeCompleteness } from './completeness-analyzer';
import { VOICE_CONFIG } from '@/lib/config/voice-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Analyze a channel and generate voice profile
 * @param {string} channelId - Channel ID
 * @param {string} userId - User ID
 * @param {Object} options - Analysis options
 * @param {number} options.completenessThreshold - Custom threshold (0-1)
 * @param {string} options.qualityTier - Threshold tier ('minimum', 'recommended', 'premium')
 */
export async function analyzeChannel(channelId, userId, options = {}) {
  try {
    // Step 1: Fetch channel data with videos
    const channelData = await fetchChannelWithVideos(channelId);

    // Step 2: Perform DEEP voice analysis (using enhanced system)
    const voiceAnalysis = await performDeepVoiceAnalysis(channelData, options);
    
    // Step 3: Analyze audience with psychographics
    const audienceAnalysis = await analyzeAudienceWithPsychographics(channelData);
    
    // Step 4: Extract content patterns
    const contentPatterns = await extractContentPatterns(channelData);
    
    // Step 5: Store comprehensive analysis
    const analysis = await storeComprehensiveAnalysis({
      channelId,
      userId,
      channelData,
      voiceAnalysis,
      audienceAnalysis,
      contentPatterns
    });
    
    return analysis;
  } catch (error) {
    console.error('Channel analysis error:', error);
    throw error;
  }
}

async function fetchChannelWithVideos(channelId) {
  // Get channel from database
  const { data: channel, error: channelError } = await supabase
    .from('channels')
    .select('*')
    .eq('id', channelId)
    .single();
    
  if (channelError) throw channelError;
  
  // Get videos from YouTube API
  const videos = await getChannelVideos(channel.youtube_channel_id, 20);
  
  return {
    ...channel,
    videos
  };
}

async function performDeepVoiceAnalysis(channelData, options = {}) {
  const { videos, name } = channelData;

  // Get transcripts from top performing videos
  const transcripts = await getTranscriptsForAnalysis(videos);

  if (transcripts.length < VOICE_CONFIG.analysis.minTranscripts) {
    console.warn('Insufficient transcripts for deep analysis');
    return generateBasicVoiceProfile(channelData);
  }

  // Use the enhanced voice analyzer
  const voiceProfile = await analyzeTranscriptVoice(transcripts, name);

  // Add channel-specific metadata
  voiceProfile.metadata = {
    videosAnalyzed: transcripts.length,
    analysisDate: new Date().toISOString(),
    channelMetrics: {
      subscriberCount: channelData.subscriber_count,
      avgViews: channelData.average_views,
      engagementRate: channelData.engagement_rate
    }
  };

  // Validate completeness using configurable threshold
  const completenessAnalysis = analyzeCompleteness(voiceProfile, {
    tier: options.qualityTier || 'default',
    threshold: options.completenessThreshold
  });

  if (!completenessAnalysis.meetsThreshold) {
    console.warn(`[Voice Profile] Completeness: ${completenessAnalysis.scorePercent}% (threshold: ${completenessAnalysis.thresholdPercent}%)`, {
      status: completenessAnalysis.status,
      missingRequired: completenessAnalysis.required.missing.length,
      missingEnhanced: completenessAnalysis.enhanced.missing.length
    });
  }

  // Attach detailed analysis to profile
  voiceProfile.completenessAnalysis = completenessAnalysis;
  voiceProfile.needsEnhancement = completenessAnalysis.needsEnhancement;

  return voiceProfile;
}

async function getTranscriptsForAnalysis(videos) {
  const maxTranscripts = 10;
  const concurrencyLimit = 5; // Fetch 5 transcripts in parallel

  // Sort videos by performance
  const sortedVideos = [...videos].sort((a, b) =>
    (b.statistics?.viewCount || 0) - (a.statistics?.viewCount || 0)
  );

  const videosToProcess = sortedVideos.slice(0, maxTranscripts);

  // PERFORMANCE FIX: Parallelize transcript fetching with concurrency limit
  // This reduces 20-50s sequential delays to 5-10s parallel fetching
  const transcripts = [];

  // Process in batches of concurrencyLimit
  for (let i = 0; i < videosToProcess.length; i += concurrencyLimit) {
    const batch = videosToProcess.slice(i, i + concurrencyLimit);

    const batchResults = await Promise.allSettled(
      batch.map(async (video) => {
        const transcript = await getVideoTranscript(video.id);
        if (transcript.hasTranscript && transcript.fullText) {
          return {
            text: transcript.fullText,
            videoTitle: video.snippet.title,
            videoId: video.id,
            views: video.statistics?.viewCount
          };
        }
        return null;
      })
    );

    // Collect successful results
    batchResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        transcripts.push(result.value);
      }
    });
  }

  return transcripts;
}

function generateBasicVoiceProfile(channelData) {
  return {
    ...generateDefaultEnhancedProfile(),
    metadata: {
      channelName: channelData.name,
      fallbackProfile: true,
      basedOn: 'channel_metadata'
    }
  };
}

async function analyzeAudienceWithPsychographics(channelData) {
  const { videos, analytics_data, description, name, subscriber_count } = channelData;
  
  // Analyze video topics and themes
  const topicAnalysis = await analyzeVideoTopics(videos);
  
  // Extract audience signals from video metadata
  const videoSignals = extractVideoSignals(videos);
  
  // Build comprehensive audience profile
  const audiencePrompt = `Analyze this YouTube channel's audience based on their content and engagement patterns.

Channel: ${name}
Subscribers: ${subscriber_count}
Description: ${description}

Top Video Topics: ${JSON.stringify(topicAnalysis)}
Video Performance Signals: ${JSON.stringify(videoSignals)}
Analytics Data: ${JSON.stringify(analytics_data)}

Create a detailed audience profile including:

1. DEMOGRAPHICS
- Age distribution with percentages
- Gender distribution
- Geographic distribution
- Education levels
- Income brackets

2. PSYCHOGRAPHICS  
- Core values and beliefs
- Lifestyle preferences
- Pain points and frustrations
- Aspirations and goals
- Content consumption habits

3. BEHAVIORAL PATTERNS
- Viewing times and frequency
- Engagement behaviors
- Sharing motivations
- Community participation level
- Purchase behaviors

4. CONTENT PREFERENCES
- Preferred video length
- Topic interests ranked
- Format preferences
- Personality traits they respond to
- Trigger words and phrases

5. GROWTH OPPORTUNITIES
- Underserved interests
- Expansion topics
- Collaboration opportunities
- Monetization potential

Return as detailed JSON with specific percentages and actionable insights.`;

  const response = await callAIService(audiencePrompt);

  // Parse response using shared utility
  return parseAIResponse(response, {
    fallback: {
      demographics: { age: '18-34', gender: 'mixed' },
      psychographics: { values: ['learning', 'growth'] },
      behavioralPatterns: { viewingTime: 'evening' },
      contentPreferences: { length: '10-15 minutes' },
      growthOpportunities: { topics: ['related topics'] }
    },
    logErrors: true
  });
}

async function analyzeVideoTopics(videos) {
  const topics = {};
  
  videos.forEach(video => {
    const { title, description, tags } = video.snippet;
    const text = `${title} ${description} ${(tags || []).join(' ')}`.toLowerCase();
    
    // Extract common topics
    const topicKeywords = [
      'tutorial', 'review', 'news', 'reaction', 'explained',
      'analysis', 'tips', 'guide', 'story', 'vlog', 'challenge'
    ];
    
    topicKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        topics[keyword] = (topics[keyword] || 0) + 1;
      }
    });
  });
  
  return topics;
}

function extractVideoSignals(videos) {
  const totalViews = videos.reduce((sum, v) => sum + (parseInt(v.statistics?.viewCount) || 0), 0);
  const avgViews = totalViews / videos.length;
  
  return {
    averageViews: Math.round(avgViews),
    highPerformers: videos
      .filter(v => (parseInt(v.statistics?.viewCount) || 0) > avgViews * 1.5)
      .map(v => ({
        title: v.snippet.title,
        views: v.statistics?.viewCount,
        likes: v.statistics?.likeCount
      }))
      .slice(0, 5),
    uploadFrequency: calculateUploadFrequency(videos),
    averageDuration: calculateAverageDuration(videos)
  };
}

function calculateUploadFrequency(videos) {
  if (videos.length < 2) return 'unknown';
  
  const dates = videos
    .map(v => new Date(v.snippet.publishedAt))
    .sort((a, b) => b - a);
    
  const daysBetween = [];
  for (let i = 0; i < dates.length - 1; i++) {
    const days = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
    daysBetween.push(days);
  }
  
  const avgDays = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;
  
  if (avgDays < 1) return 'multiple per day';
  if (avgDays < 3) return 'every 2-3 days';
  if (avgDays < 7) return 'weekly';
  if (avgDays < 14) return 'bi-weekly';
  if (avgDays < 30) return 'monthly';
  return 'irregular';
}

function calculateAverageDuration(videos) {
  const durations = videos
    .map(v => v.contentDetails?.duration)
    .filter(Boolean)
    .map(parseDuration);
    
  if (durations.length === 0) return 'unknown';
  
  const avgSeconds = durations.reduce((a, b) => a + b, 0) / durations.length;
  const avgMinutes = Math.round(avgSeconds / 60);
  
  return `${avgMinutes} minutes`;
}

function parseDuration(duration) {
  // Parse ISO 8601 duration (PT15M33S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

async function extractContentPatterns(channelData) {
  const { videos } = channelData;
  
  // Analyze successful patterns
  const patterns = {
    titleFormulas: extractTitlePatterns(videos),
    hookTypes: extractHookPatterns(videos),
    videoStructures: extractStructurePatterns(videos),
    thumbnailStyles: extractThumbnailPatterns(videos),
    publishingSchedule: extractSchedulePatterns(videos),
    viralFactors: identifyViralFactors(videos)
  };
  
  return patterns;
}

function extractTitlePatterns(videos) {
  const patterns = [];
  const totalViews = videos.reduce((sum, v) => sum + (parseInt(v.statistics?.viewCount) || 0), 0);
  const averageViews = totalViews / videos.length;
  const highPerformers = videos.filter(v => (parseInt(v.statistics?.viewCount) || 0) > averageViews * 1.5);
  
  highPerformers.forEach(video => {
    const title = video.snippet.title;
    
    // Check for common patterns
    if (title.includes('How')) patterns.push('how-to');
    if (/^\d+/.test(title)) patterns.push('numbered-list');
    if (title.includes('?')) patterns.push('question-based');
    if (title.includes('Why')) patterns.push('explanation');
    if (title.includes('Secret') || title.includes('Hidden')) patterns.push('revelation');
    if (title.includes('vs') || title.includes('VS')) patterns.push('comparison');
    if (title.includes('!')) patterns.push('exclamation');
    
    // Extract emotional triggers
    const emotions = ['shocking', 'amazing', 'unbelievable', 'incredible', 'insane', 'crazy'];
    emotions.forEach(emotion => {
      if (title.toLowerCase().includes(emotion)) {
        patterns.push(`emotional-${emotion}`);
      }
    });
  });
  
  // Return pattern frequency
  return countPatternFrequency(patterns);
}

function countPatternFrequency(patterns) {
  const frequency = {};
  patterns.forEach(pattern => {
    frequency[pattern] = (frequency[pattern] || 0) + 1;
  });
  
  // Sort by frequency
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [pattern, count]) => {
      acc[pattern] = count;
      return acc;
    }, {});
}

function extractHookPatterns(videos) {
  // Analyze video descriptions for hook patterns
  const hooks = {};
  
  videos.forEach(video => {
    const desc = video.snippet.description?.substring(0, 200) || '';
    
    if (desc.includes('In this video')) hooks.preview = (hooks.preview || 0) + 1;
    if (desc.includes('You won\'t believe')) hooks.curiosity = (hooks.curiosity || 0) + 1;
    if (desc.includes('TIMESTAMPS')) hooks.structured = (hooks.structured || 0) + 1;
    if (desc.includes('Subscribe')) hooks.cta = (hooks.cta || 0) + 1;
  });
  
  return hooks;
}

function extractStructurePatterns(videos) {
  // Infer structure from video lengths and titles
  const structures = {
    shortForm: 0,
    mediumForm: 0,
    longForm: 0,
    tutorial: 0,
    documentary: 0,
    reaction: 0
  };
  
  videos.forEach(video => {
    const duration = parseDuration(video.contentDetails?.duration || '');
    
    if (duration < 60) structures.shortForm++;
    else if (duration < 600) structures.mediumForm++;
    else structures.longForm++;
    
    const title = video.snippet.title.toLowerCase();
    if (title.includes('tutorial') || title.includes('how to')) structures.tutorial++;
    if (title.includes('documentary') || title.includes('full story')) structures.documentary++;
    if (title.includes('reaction') || title.includes('reacts')) structures.reaction++;
  });
  
  return structures;
}

function extractThumbnailPatterns(videos) {
  // Analyze thumbnail URLs for patterns
  return {
    hasCustomThumbnails: videos.filter(v => v.snippet.thumbnails?.maxres).length,
    thumbnailQuality: videos[0]?.snippet.thumbnails?.maxres ? 'high' : 'standard'
  };
}

function extractSchedulePatterns(videos) {
  const uploadDays = {};
  const uploadHours = {};
  
  videos.forEach(video => {
    const date = new Date(video.snippet.publishedAt);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();
    
    uploadDays[day] = (uploadDays[day] || 0) + 1;
    uploadHours[hour] = (uploadHours[hour] || 0) + 1;
  });
  
  return {
    preferredDays: Object.entries(uploadDays).sort((a, b) => b[1] - a[1]).slice(0, 3),
    preferredHours: Object.entries(uploadHours).sort((a, b) => b[1] - a[1]).slice(0, 3)
  };
}

function identifyViralFactors(videos) {
  const totalViews = videos.reduce((sum, v) => sum + (parseInt(v.statistics?.viewCount) || 0), 0);
  const avgViews = totalViews / videos.length;
  
  const viralVideos = videos.filter(v => (parseInt(v.statistics?.viewCount) || 0) > avgViews * 3);
  
  return {
    viralCount: viralVideos.length,
    viralTitles: viralVideos.map(v => v.snippet.title).slice(0, 5),
    viralTopics: extractCommonTopics(viralVideos)
  };
}

function extractCommonTopics(videos) {
  const topics = {};
  
  videos.forEach(video => {
    const words = video.snippet.title.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 4) {
        topics[word] = (topics[word] || 0) + 1;
      }
    });
  });
  
  return Object.entries(topics)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function validateVoiceProfileCompleteness(profile) {
  const requiredFields = [
    'linguisticFingerprints',
    'narrativeStructure', 
    'emotionalDynamics',
    'contentPositioning',
    'culturalReferences',
    'technicalPatterns',
    'engagementTechniques',
    'pacingDynamics'
  ];
  
  let score = 0;
  requiredFields.forEach(field => {
    if (profile[field] && Object.keys(profile[field]).length > 0) {
      score += 1;
    }
  });
  
  return score / requiredFields.length;
}

export async function analyzeRemixChannel(sourceChannels, remixConfig) {
  // Don't just average - intelligently blend
  const blendedVoice = await intelligentVoiceBlending(sourceChannels, remixConfig);
  const combinedAudience = await combineAudienceSegments(sourceChannels, remixConfig);
  const synergyOpportunities = await identifySynergies(sourceChannels);
  
  return {
    voiceProfile: blendedVoice,
    audienceProfile: combinedAudience,
    synergies: synergyOpportunities,
    contentStrategy: generateRemixStrategy(blendedVoice, combinedAudience, synergyOpportunities)
  };
}

async function intelligentVoiceBlending(channels, config) {
  const weights = config.weights || {};
  
  // Instead of averaging, choose dominant patterns
  const blendedProfile = {
    // Take strongest opening from highest weighted channel
    linguisticFingerprints: {
      openingPatterns: selectDominantPatterns(channels, weights, 'openingPatterns'),
      transitionPhrases: mergeAllPatterns(channels, 'transitionPhrases'),
      closingPatterns: selectDominantPatterns(channels, weights, 'closingPatterns'),
      signaturePhrases: mergeUniquePatterns(channels, 'signaturePhrases'),
      fillerWords: mergeFillerWords(channels, weights),
      questionPatterns: blendQuestionPatterns(channels, weights)
    },
    
    // Blend narrative structures based on compatibility
    narrativeStructure: blendNarrativeStructures(channels, weights),
    
    // Create hybrid emotional dynamics
    emotionalDynamics: createHybridEmotionalCurve(channels, weights),
    
    // Merge content positioning strategically
    contentPositioning: mergeContentPositioning(channels, weights),
    
    // Combine cultural references
    culturalReferences: mergeCulturalReferences(channels),
    
    // Average technical patterns
    technicalPatterns: averageTechnicalPatterns(channels, weights),
    
    // Blend engagement techniques
    engagementTechniques: blendEngagementTechniques(channels, weights),
    
    // Create hybrid pacing
    pacingDynamics: createHybridPacing(channels, weights)
  };
  
  return blendedProfile;
}

function selectDominantPatterns(channels, weights, patternType) {
  // Get patterns from the most heavily weighted channel for this element
  let maxWeight = 0;
  let dominantPatterns = [];
  
  channels.forEach(channel => {
    const weight = weights[channel.id] || (1 / channels.length);
    if (weight > maxWeight && channel.voice_profile?.linguisticFingerprints?.[patternType]) {
      maxWeight = weight;
      dominantPatterns = channel.voice_profile.linguisticFingerprints[patternType];
    }
  });
  
  return dominantPatterns;
}

function mergeAllPatterns(channels, patternType) {
  const allPatterns = new Set();
  
  channels.forEach(channel => {
    const patterns = channel.voice_profile?.linguisticFingerprints?.[patternType] || [];
    patterns.forEach(p => allPatterns.add(p));
  });
  
  return Array.from(allPatterns);
}

function mergeUniquePatterns(channels, patternType) {
  const patternMap = new Map();
  
  channels.forEach(channel => {
    const patterns = channel.voice_profile?.linguisticFingerprints?.[patternType] || [];
    patterns.forEach(p => {
      if (!patternMap.has(p)) {
        patternMap.set(p, { pattern: p, source: channel.name });
      }
    });
  });
  
  return Array.from(patternMap.values());
}

function mergeFillerWords(channels, weights) {
  const fillerWords = {};
  
  channels.forEach(channel => {
    const weight = weights[channel.id] || (1 / channels.length);
    const channelFillers = channel.voice_profile?.linguisticFingerprints?.fillerWords || {};
    
    Object.entries(channelFillers).forEach(([word, freq]) => {
      fillerWords[word] = (fillerWords[word] || 0) + (freq * weight);
    });
  });
  
  return fillerWords;
}

function blendQuestionPatterns(channels, weights) {
  // Intelligently blend question patterns based on effectiveness
  const patterns = {
    rhetorical: 0,
    engaging: 0,
    educational: 0
  };
  
  channels.forEach(channel => {
    const weight = weights[channel.id] || (1 / channels.length);
    const channelPatterns = channel.voice_profile?.linguisticFingerprints?.questionPatterns || {};
    
    Object.entries(channelPatterns).forEach(([type, value]) => {
      patterns[type] = (patterns[type] || 0) + (value * weight);
    });
  });
  
  return patterns;
}

function blendNarrativeStructures(channels, weights) {
  // Select most effective narrative structure
  const structures = {};
  
  channels.forEach(channel => {
    const weight = weights[channel.id] || (1 / channels.length);
    const structure = channel.voice_profile?.narrativeStructure || {};
    
    if (structure.storyArcPattern) {
      structures[structure.storyArcPattern] = (structures[structure.storyArcPattern] || 0) + weight;
    }
  });
  
  const dominantStructure = Object.entries(structures)
    .sort((a, b) => b[1] - a[1])[0];
  
  return {
    storyArcPattern: dominantStructure?.[0] || 'progressive',
    informationFlow: 'varied',
    exampleStyle: 'mixed',
    anecdoteUsage: { frequency: 'moderate' },
    hookPlacement: ['beginning', 'middle', 'transitions']
  };
}

function createHybridEmotionalCurve(channels, weights) {
  // Create a weighted emotional curve
  const curves = [];
  
  channels.forEach(channel => {
    const weight = weights[channel.id] || (1 / channels.length);
    const dynamics = channel.voice_profile?.emotionalDynamics || {};
    
    if (dynamics.energyCurve) {
      curves.push({ curve: dynamics.energyCurve, weight });
    }
  });
  
  // Blend curves based on weights
  if (curves.length === 0) {
    return { energyCurve: ['steady'] };
  }
  
  // Take the curve from the highest weighted channel
  const dominantCurve = curves.sort((a, b) => b.weight - a.weight)[0];
  
  return {
    energyCurve: dominantCurve.curve,
    emotionalBeats: mergeEmotionalBeats(channels),
    authenticityMarkers: mergeAuthenticityMarkers(channels),
    passionTriggers: mergePassionTriggers(channels),
    vulnerabilityPattern: 'selective'
  };
}

function mergeEmotionalBeats(channels) {
  const beats = new Set();
  channels.forEach(channel => {
    const channelBeats = channel.voice_profile?.emotionalDynamics?.emotionalBeats || [];
    channelBeats.forEach(beat => beats.add(beat));
  });
  return Array.from(beats);
}

function mergeAuthenticityMarkers(channels) {
  const markers = new Set();
  channels.forEach(channel => {
    const channelMarkers = channel.voice_profile?.emotionalDynamics?.authenticityMarkers || [];
    channelMarkers.forEach(marker => markers.add(marker));
  });
  return Array.from(markers);
}

function mergePassionTriggers(channels) {
  const triggers = new Set();
  channels.forEach(channel => {
    const channelTriggers = channel.voice_profile?.emotionalDynamics?.passionTriggers || [];
    channelTriggers.forEach(trigger => triggers.add(trigger));
  });
  return Array.from(triggers);
}

function mergeContentPositioning(channels, weights) {
  // Create weighted average of positioning
  let totalWeight = 0;
  let selfReferenceRate = 0;
  const relationships = {};
  const stances = {};
  
  channels.forEach(channel => {
    const weight = weights[channel.id] || (1 / channels.length);
    const positioning = channel.voice_profile?.contentPositioning || {};
    
    totalWeight += weight;
    selfReferenceRate += (positioning.selfReferenceRate || 0.1) * weight;
    
    if (positioning.audienceRelationship) {
      relationships[positioning.audienceRelationship] = 
        (relationships[positioning.audienceRelationship] || 0) + weight;
    }
    
    if (positioning.authorityStance) {
      stances[positioning.authorityStance] = 
        (stances[positioning.authorityStance] || 0) + weight;
    }
  });
  
  return {
    selfReferenceRate: selfReferenceRate / totalWeight,
    audienceRelationship: Object.entries(relationships).sort((a, b) => b[1] - a[1])[0]?.[0] || 'educator',
    authorityStance: Object.entries(stances).sort((a, b) => b[1] - a[1])[0]?.[0] || 'knowledgeable',
    valueProposition: 'hybrid'
  };
}

function mergeCulturalReferences(channels) {
  const allCategories = new Set();
  const allMetaphors = new Set();
  
  channels.forEach(channel => {
    const refs = channel.voice_profile?.culturalReferences || {};
    (refs.exampleCategories || []).forEach(cat => allCategories.add(cat));
    (refs.metaphorTypes || []).forEach(met => allMetaphors.add(met));
  });
  
  return {
    exampleCategories: Array.from(allCategories),
    metaphorTypes: Array.from(allMetaphors),
    currentEventsStyle: 'selective',
    internetCultureUsage: 'moderate',
    formalityBalance: 'adaptive'
  };
}

function averageTechnicalPatterns(channels, weights) {
  let totalWeight = 0;
  let avgWords = 0;
  const complexities = {};
  
  channels.forEach(channel => {
    const weight = weights[channel.id] || (1 / channels.length);
    const patterns = channel.voice_profile?.technicalPatterns || {};
    
    totalWeight += weight;
    avgWords += (patterns.avgWordsPerSentence || 15) * weight;
    
    if (patterns.vocabularyComplexity) {
      complexities[patterns.vocabularyComplexity] = 
        (complexities[patterns.vocabularyComplexity] || 0) + weight;
    }
  });
  
  return {
    avgWordsPerSentence: Math.round(avgWords / totalWeight),
    vocabularyComplexity: Object.entries(complexities).sort((a, b) => b[1] - a[1])[0]?.[0] || 'moderate',
    jargonUsage: { frequency: 'contextual' },
    dataPresentation: 'varied'
  };
}

function blendEngagementTechniques(channels, weights) {
  let totalWeight = 0;
  let directAddress = 0;
  const pronounUsage = { you: 0, we: 0, i: 0 };
  
  channels.forEach(channel => {
    const weight = weights[channel.id] || (1 / channels.length);
    const techniques = channel.voice_profile?.engagementTechniques || {};
    
    totalWeight += weight;
    directAddress += (techniques.directAddressFrequency || 0.2) * weight;
    
    const usage = techniques.pronounUsage || { you: 40, we: 30, i: 30 };
    pronounUsage.you += usage.you * weight;
    pronounUsage.we += usage.we * weight;
    pronounUsage.i += usage.i * weight;
  });
  
  const totalPronouns = pronounUsage.you + pronounUsage.we + pronounUsage.i;
  
  return {
    directAddressFrequency: directAddress / totalWeight,
    pronounUsage: {
      you: Math.round((pronounUsage.you / totalPronouns) * 100),
      we: Math.round((pronounUsage.we / totalPronouns) * 100),
      i: Math.round((pronounUsage.i / totalPronouns) * 100)
    },
    ctaStyle: 'adaptive',
    questionStrategy: 'mixed',
    communityLanguage: mergeCommunityLanguage(channels)
  };
}

function mergeCommunityLanguage(channels) {
  const language = new Set();
  channels.forEach(channel => {
    const communityLang = channel.voice_profile?.engagementTechniques?.communityLanguage || [];
    communityLang.forEach(lang => language.add(lang));
  });
  return Array.from(language);
}

function createHybridPacing(channels, weights) {
  const variations = new Set();
  const techniques = new Set();
  
  channels.forEach(channel => {
    const pacing = channel.voice_profile?.pacingDynamics || {};
    (pacing.speedVariations || []).forEach(v => variations.add(v));
    (pacing.emphasisTechniques || []).forEach(t => techniques.add(t));
  });
  
  return {
    speedVariations: Array.from(variations),
    pausePatterns: { frequency: 'natural' },
    emphasisTechniques: Array.from(techniques),
    rhythmPreferences: 'varied'
  };
}

async function combineAudienceSegments(channels, config) {
  // Combine audience segments intelligently
  const combinedAudience = {
    demographics: {},
    psychographics: {},
    behavioralPatterns: {},
    contentPreferences: {},
    growthOpportunities: []
  };
  
  // Implementation would analyze and merge audience data
  return combinedAudience;
}

async function identifySynergies(channels) {
  // Identify synergistic opportunities between channels
  const synergies = {
    sharedTopics: [],
    complementaryStrengths: [],
    audienceOverlap: 0,
    collaborationPotential: []
  };
  
  // Implementation would analyze channel relationships
  return synergies;
}

function generateRemixStrategy(voiceProfile, audienceProfile, synergies) {
  return {
    contentPillars: [],
    publishingSchedule: {},
    engagementStrategy: {},
    growthTactics: []
  };
}

// NEW ENRICHMENT FUNCTIONS
function enrichVoiceWithAudienceInsights(voiceAnalysis, audienceAnalysis, channelData) {
  // Start with the original voice analysis
  const enrichedVoice = { ...voiceAnalysis };

  // Add signature phrases from channel keywords
  if (!enrichedVoice.linguisticFingerprints) {
    enrichedVoice.linguisticFingerprints = {};
  }

  enrichedVoice.linguisticFingerprints = {
    ...enrichedVoice.linguisticFingerprints,
    signaturePhrases: enrichedVoice.linguisticFingerprints?.signaturePhrases || [],
    topicKeywords: extractTopicKeywords(audienceAnalysis, channelData)
  };

  // Add emotional dynamics from audience psychographics
  if (!enrichedVoice.emotionalDynamics) {
    enrichedVoice.emotionalDynamics = {};
  }

  enrichedVoice.emotionalDynamics = {
    ...enrichedVoice.emotionalDynamics,
    audience_aligned_tone: determineAudienceAlignedTone(audienceAnalysis),
    vulnerability_required: checkVulnerabilityRequirement(audienceAnalysis),
    validation_required: checkValidationRequirement(audienceAnalysis),
    empathy_markers: extractEmpathyMarkers(audienceAnalysis)
  };

  // Add content positioning from audience values
  if (!enrichedVoice.contentPositioning) {
    enrichedVoice.contentPositioning = {};
  }

  enrichedVoice.contentPositioning = {
    ...enrichedVoice.contentPositioning,
    mission: extractMissionFromDescription(channelData.description),
    core_values: audienceAnalysis.psychographics?.values || [],
    audience_relationship: determineAudienceRelationship(audienceAnalysis),
    value_proposition: extractValueProposition(audienceAnalysis, channelData)
  };

  // Add audience engagement drivers
  enrichedVoice.engagementDrivers = {
    comment_triggers: audienceAnalysis.engagement_drivers?.comment_triggers || [],
    loyalty_builders: audienceAnalysis.engagement_drivers?.loyalty_builders || [],
    share_motivators: audienceAnalysis.engagement_drivers?.share_motivators || []
  };

  return enrichedVoice;
}

function extractTopicKeywords(audienceAnalysis, channelData) {
  const keywords = new Set();

  // Extract from audience interests
  if (audienceAnalysis.contentPreferences?.topicInterests) {
    Object.keys(audienceAnalysis.contentPreferences.topicInterests).forEach(topic => {
      keywords.add(topic.toLowerCase());
    });
  }

  // Extract from channel topics
  if (channelData.topics) {
    channelData.topics.forEach(topic => {
      keywords.add(topic.toLowerCase());
    });
  }

  return Array.from(keywords).slice(0, 10);
}

function determineAudienceAlignedTone(audienceAnalysis) {
  const commentTriggers = audienceAnalysis.engagement_drivers?.comment_triggers ||
                          audienceAnalysis.behavioralPatterns?.engagementBehaviors || [];

  const triggers = Array.isArray(commentTriggers) ? commentTriggers :
                   typeof commentTriggers === 'string' ? [commentTriggers] : [];

  const triggerText = triggers.join(' ').toLowerCase();

  if (triggerText.includes('vulnerability') || triggerText.includes('personal')) {
    return 'vulnerable_empathetic';
  }
  if (triggerText.includes('validation') || triggerText.includes('support')) {
    return 'validating_supportive';
  }
  if (triggerText.includes('education') || triggerText.includes('learn')) {
    return 'educational_supportive';
  }
  return 'balanced_engaging';
}

function checkVulnerabilityRequirement(audienceAnalysis) {
  const triggers = audienceAnalysis.engagement_drivers?.comment_triggers || [];
  const values = audienceAnalysis.psychographics?.values || [];

  const triggerText = (Array.isArray(triggers) ? triggers : [triggers]).join(' ').toLowerCase();
  const valueText = (Array.isArray(values) ? values : [values]).join(' ').toLowerCase();

  return triggerText.includes('vulnerability') ||
         triggerText.includes('personal') ||
         valueText.includes('authentic') ||
         valueText.includes('genuine');
}

function checkValidationRequirement(audienceAnalysis) {
  const triggers = audienceAnalysis.engagement_drivers?.comment_triggers || [];
  const painPoints = audienceAnalysis.psychographics?.painPoints || [];

  const triggerText = (Array.isArray(triggers) ? triggers : [triggers]).join(' ').toLowerCase();
  const painText = (Array.isArray(painPoints) ? painPoints : [painPoints]).join(' ').toLowerCase();

  return triggerText.includes('validation') ||
         triggerText.includes('understanding') ||
         painText.includes('isolated') ||
         painText.includes('misunderstood');
}

function extractEmpathyMarkers(audienceAnalysis) {
  const markers = [];
  const painPoints = audienceAnalysis.psychographics?.painPoints || [];

  if (Array.isArray(painPoints)) {
    painPoints.forEach(pain => {
      if (typeof pain === 'string' && pain.toLowerCase().includes('struggle')) {
        markers.push('acknowledge_struggles');
      }
      if (typeof pain === 'string' && pain.toLowerCase().includes('pain')) {
        markers.push('validate_pain');
      }
    });
  }

  return markers.length > 0 ? markers : ['general_understanding'];
}

function extractMissionFromDescription(description) {
  if (!description) return 'educate_and_inspire';

  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('help') && lowerDesc.includes('overcome')) {
    return 'help_overcome_challenges';
  }
  if (lowerDesc.includes('heal')) {
    return 'facilitate_healing';
  }
  if (lowerDesc.includes('teach') || lowerDesc.includes('educate')) {
    return 'educate_and_empower';
  }
  if (lowerDesc.includes('entertain')) {
    return 'entertain_and_engage';
  }
  return 'inform_and_inspire';
}

function determineAudienceRelationship(audienceAnalysis) {
  const loyaltyBuilders = audienceAnalysis.engagement_drivers?.loyalty_builders || [];
  const values = audienceAnalysis.psychographics?.values || [];

  const loyaltyText = (Array.isArray(loyaltyBuilders) ? loyaltyBuilders : [loyaltyBuilders]).join(' ').toLowerCase();
  const valueText = (Array.isArray(values) ? values : [values]).join(' ').toLowerCase();

  if (loyaltyText.includes('friend') || valueText.includes('connection')) {
    return 'friend_and_guide';
  }
  if (loyaltyText.includes('non-judgmental') || loyaltyText.includes('compassion')) {
    return 'compassionate_companion';
  }
  if (loyaltyText.includes('expert') || loyaltyText.includes('authority')) {
    return 'knowledgeable_mentor';
  }
  return 'supportive_educator';
}

function extractValueProposition(audienceAnalysis, channelData) {
  const aspirations = audienceAnalysis.psychographics?.aspirations || [];
  const channelDesc = channelData.description || '';

  const aspirationText = (Array.isArray(aspirations) ? aspirations : [aspirations]).join(' ').toLowerCase();

  if (aspirationText.includes('heal') || aspirationText.includes('overcome')) {
    return 'transformation_through_understanding';
  }
  if (aspirationText.includes('learn') || aspirationText.includes('grow')) {
    return 'growth_through_knowledge';
  }
  if (aspirationText.includes('connect') || aspirationText.includes('community')) {
    return 'connection_through_shared_experience';
  }
  return 'value_through_content';
}

async function storeComprehensiveAnalysis(data) {
  const { channelId, userId, channelData, voiceAnalysis, audienceAnalysis, contentPatterns } = data;

  // ENRICH voice analysis with audience insights
  const enrichedVoiceAnalysis = enrichVoiceWithAudienceInsights(
    voiceAnalysis,
    audienceAnalysis,
    channelData
  );

  // Update channel with ENRICHED voice profile
  const { error: updateError } = await supabase
    .from('channels')
    .update({
      voice_profile: enrichedVoiceAnalysis,  // Use enriched version
      voice_training_status: 'completed',
      last_voice_training: new Date().toISOString(),
      voice_training_progress: 100,
      audience_description: audienceAnalysis.summary || '',
      topics: contentPatterns.viralFactors?.viralTopics || []
    })
    .eq('id', channelId);
    
  if (updateError) {
    console.error('Error updating channel:', updateError);
  }
  
  // Store detailed analysis
  const { error: insertError } = await supabase
    .from('channel_analyses')
    .insert({
      channel_id: channelId,
      user_id: userId,
      analytics_data: {
        ...audienceAnalysis,
        contentPatterns
      },
      audience_persona: audienceAnalysis,
      insights: generateActionableInsights(voiceAnalysis, audienceAnalysis, contentPatterns),
      videos_analyzed: voiceAnalysis.metadata?.videosAnalyzed || 0,
      analysis_date: new Date().toISOString()
    });
    
  if (insertError) {
    console.error('Error storing analysis:', insertError);
  }
    
  // If voice profile table exists, update it
  const { error: profileError } = await supabase
    .from('voice_profiles')
    .upsert({
      channel_id: channelId,
      profile_name: `${channelData.name} Voice`,
      training_data: voiceAnalysis,
      parameters: {
        status: 'completed',
        completeness: validateVoiceProfileCompleteness(voiceAnalysis)
      },
      is_active: true
    });
    
  if (profileError) {
    console.error('Error updating voice profile:', profileError);
  }
    
  return {
    success: true,
    channelId,
    voiceCompleteness: validateVoiceProfileCompleteness(voiceAnalysis),
    audienceSize: audienceAnalysis.estimatedSize || 0
  };
}

function generateActionableInsights(voiceAnalysis, audienceAnalysis, contentPatterns) {
  const insights = [];
  
  // Voice insights
  if (voiceAnalysis.linguisticFingerprints?.signaturePhrases?.length > 0) {
    insights.push({
      type: 'voice',
      priority: 'high',
      insight: `Channel uses ${voiceAnalysis.linguisticFingerprints.signaturePhrases.length} signature phrases consistently`,
      action: 'Incorporate these phrases in generated content for authenticity'
    });
  }
  
  // Audience insights
  if (audienceAnalysis.demographics?.age) {
    insights.push({
      type: 'audience',
      priority: 'medium',
      insight: `Primary audience age: ${audienceAnalysis.demographics.age}`,
      action: 'Tailor content complexity and references to this demographic'
    });
  }
  
  // Content pattern insights
  const topTitlePattern = Object.entries(contentPatterns.titleFormulas || {})[0];
  if (topTitlePattern) {
    insights.push({
      type: 'content',
      priority: 'high',
      insight: `Most successful title format: ${topTitlePattern[0]} (${topTitlePattern[1]} videos)`,
      action: 'Use this title format for higher engagement'
    });
  }
  
  return insights;
}