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
import {
  getCachedVoiceAnalysis,
  setCachedVoiceAnalysis
} from './voice-analysis-cache';

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use VOICE_MODEL for voice analysis (Sonnet provides excellent results at lower cost)
const VOICE_MODEL = process.env.VOICE_MODEL || process.env.PREMIUM_MODEL || 'claude-sonnet-4-5-20250929';

/**
 * Detect the primary niche/content type from transcript content
 * Returns niche-specific analysis guidance
 */
function detectContentNiche(transcriptText) {
  const text = transcriptText.toLowerCase();

  // Niche detection patterns with associated analysis guidance
  const nichePatterns = {
    'psychology': {
      keywords: ['psychology', 'mental', 'brain', 'behavior', 'cognitive', 'therapy', 'mindset', 'emotion', 'trauma', 'healing', 'anxiety', 'relationship', 'attachment', 'narcissist', 'depression', 'self-esteem'],
      analysisGuidance: {
        emotionalDynamics: `- Vulnerability frequency (how often they share struggles/admit difficulty)
- Validation patterns ("this is normal", "you're not alone", "it's okay to feel")
- Empathy expression (acknowledging pain, normalizing experiences)
- Empowerment progression (understanding → validation → action)`,
        contentPositioning: `- Creator identity (student/guide/fellow traveler/expert)
- Relationship to audience (friend, mentor, therapist-like, peer)
- Mission-driven language (helping, healing, overcoming)
- Authority display (research-backed vs experiential)`,
        culturalReferences: `- Psychology research citations
- Personal growth journey metaphors
- Recovery/healing journey references`,
        technicalPatterns: `- Psychology terminology usage and simplification`,
        engagementTechniques: `- Validation techniques ("If this resonates with you...")
- Permission-giving language ("It's okay to...")
- Normalization patterns ("Many of us...")`,
        pacingDynamics: `- Calm, therapeutic pacing during vulnerable topics
- Strategic pauses for emotional processing`
      }
    },
    'cooking': {
      keywords: ['recipe', 'cook', 'food', 'kitchen', 'chef', 'meal', 'ingredient', 'bake', 'cuisine', 'dish', 'flavor', 'taste', 'delicious'],
      analysisGuidance: {
        emotionalDynamics: `- Enthusiasm peaks during taste tests and reveals
- Comfort and nostalgia triggers (family recipes, cultural connections)
- Frustration/patience during technique demonstrations`,
        contentPositioning: `- Teaching style (step-by-step vs intuitive cooking)
- Expertise display (professional vs home cook perspective)
- Cultural authority (authentic traditions vs fusion creativity)`,
        culturalReferences: `- Cultural food traditions and history
- Family stories and heritage connections
- Restaurant/chef industry references`,
        technicalPatterns: `- Culinary terminology and when it's explained
- Measurement precision vs "to taste" flexibility`,
        engagementTechniques: `- Sensory descriptions ("you'll smell...", "look for...")
- Interactive prompts ("let me know your variations")
- Recipe customization encouragement`,
        pacingDynamics: `- Time-lapse during waiting periods
- Real-time demonstration for techniques`
      }
    },
    'fitness': {
      keywords: ['workout', 'fitness', 'exercise', 'gym', 'muscle', 'strength', 'cardio', 'training', 'health', 'body', 'weight', 'reps', 'sets'],
      analysisGuidance: {
        emotionalDynamics: `- Motivational energy spikes
- Empathy for struggle ("I know this burns")
- Celebration of progress and achievements`,
        contentPositioning: `- Coach vs workout buddy dynamic
- Science-backed vs experience-based authority
- Transformation promise style`,
        culturalReferences: `- Fitness industry trends and debates
- Athletic/sports references
- Body positivity or aesthetic goal framing`,
        technicalPatterns: `- Exercise terminology and form cues
- Rep/set counting patterns`,
        engagementTechniques: `- Real-time workout cues and countdowns
- Progress tracking encouragement
- Community challenge invitations`,
        pacingDynamics: `- High energy during active portions
- Rest period pacing and recovery talk`
      }
    },
    'personal development': {
      keywords: ['growth', 'mindset', 'motivation', 'success', 'habit', 'productivity', 'self-improvement', 'goal', 'discipline', 'potential', 'achieve'],
      analysisGuidance: {
        emotionalDynamics: `- Inspirational peaks and story climaxes
- Vulnerability in sharing failures/setbacks
- Empowerment crescendos`,
        contentPositioning: `- Mentor vs fellow traveler positioning
- Success story authority vs relatable journey
- Framework/system creator identity`,
        culturalReferences: `- Success story examples (business, sports, history)
- Book and thought leader references
- Scientific study citations`,
        technicalPatterns: `- Framework and acronym usage
- Step-by-step methodology presentation`,
        engagementTechniques: `- Journaling/reflection prompts
- Action step challenges
- Accountability encouragement`,
        pacingDynamics: `- Dramatic pauses for key insights
- Building intensity toward calls-to-action`
      }
    },
    'technology': {
      keywords: ['tech', 'software', 'code', 'programming', 'ai', 'computer', 'app', 'digital', 'startup', 'innovation', 'developer'],
      analysisGuidance: {
        emotionalDynamics: `- Excitement during breakthrough reveals
- Frustration acknowledgment in debugging/troubleshooting
- Wonder at technological possibilities`,
        contentPositioning: `- Expert educator vs curious explorer
- Industry insider vs independent reviewer
- Tutorial instructor vs thought leader`,
        culturalReferences: `- Tech industry news and personalities
- Startup and Silicon Valley culture
- Programming community references`,
        technicalPatterns: `- Technical jargon density and explanation depth
- Code/demo walkthrough pacing`,
        engagementTechniques: `- "Try this yourself" prompts
- Code challenge invitations
- Community feedback requests`,
        pacingDynamics: `- Screen share and demonstration rhythm
- Explanation depth variation based on complexity`
      }
    },
    'true crime': {
      keywords: ['murder', 'killer', 'crime', 'detective', 'investigation', 'case', 'criminal', 'death', 'victim', 'suspect', 'evidence'],
      analysisGuidance: {
        emotionalDynamics: `- Tension building and suspense creation
- Empathy for victims and families
- Dramatic revelation timing`,
        contentPositioning: `- Investigative journalist vs storyteller
- Respectful vs sensational approach
- Advocacy vs entertainment balance`,
        culturalReferences: `- Legal system and law enforcement references
- Historical crime case comparisons
- Media coverage analysis`,
        technicalPatterns: `- Forensic and legal terminology
- Timeline and evidence presentation`,
        engagementTechniques: `- Cliffhanger and mystery hooks
- Viewer theory invitations
- Case update promises`,
        pacingDynamics: `- Slow burn tension building
- Strategic information reveals`
      }
    },
    'education': {
      keywords: ['learn', 'teach', 'tutorial', 'explain', 'course', 'lesson', 'study', 'education', 'knowledge', 'understand', 'concept'],
      analysisGuidance: {
        emotionalDynamics: `- "Aha moment" celebration
- Patience with complex concepts
- Encouragement during difficulty`,
        contentPositioning: `- Expert teacher vs learning companion
- Academic vs practical approach
- Comprehensive vs focused teaching`,
        culturalReferences: `- Academic and research citations
- Real-world application examples
- Historical context and origins`,
        technicalPatterns: `- Progressive complexity building
- Terminology introduction and reinforcement`,
        engagementTechniques: `- Knowledge check questions
- Practice exercise prompts
- Resource and further learning suggestions`,
        pacingDynamics: `- Concept explanation depth variation
- Review and summary pacing`
      }
    },
    'entertainment': {
      keywords: ['funny', 'comedy', 'react', 'challenge', 'prank', 'viral', 'trending', 'celebrity', 'movie', 'show', 'review'],
      analysisGuidance: {
        emotionalDynamics: `- Comedic timing and punchline delivery
- Authentic reaction expressions
- Energy level variations for effect`,
        contentPositioning: `- Entertainer vs commentator
- Relatable everyperson vs personality brand
- Reaction authenticity positioning`,
        culturalReferences: `- Pop culture and meme references
- Trending topic commentary
- Celebrity and media industry knowledge`,
        technicalPatterns: `- Editing rhythm and cut timing
- Sound effect and music usage patterns`,
        engagementTechniques: `- Subscription and like reminders
- Comment section engagement
- Challenge participation invites`,
        pacingDynamics: `- Fast-paced editing and transitions
- Comedic pause timing`
      }
    }
  };

  // Score each niche
  let bestNiche = null;
  let bestScore = 0;

  for (const [niche, config] of Object.entries(nichePatterns)) {
    const score = config.keywords.filter(kw => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestNiche = niche;
    }
  }

  // Return guidance for detected niche, or generic guidance if none detected
  if (bestNiche && bestScore >= 2) {
    return {
      detectedNiche: bestNiche,
      confidence: Math.min(bestScore / 5, 1),
      guidance: nichePatterns[bestNiche].analysisGuidance
    };
  }

  // Generic guidance for undetected niches
  return {
    detectedNiche: 'general',
    confidence: 0,
    guidance: {
      emotionalDynamics: '',
      contentPositioning: '',
      culturalReferences: '',
      technicalPatterns: '',
      engagementTechniques: '',
      pacingDynamics: ''
    }
  };
}

/**
 * Analyze transcript voice with deep linguistic profiling
 */
async function analyzeTranscriptVoice(transcripts, channelName) {
  // Calculate real confidence scores from patterns FIRST
  const realConfidenceScores = calculateAllConfidenceScores(transcripts);
  const linguisticConsistency = calculateLinguisticConsistency(transcripts);

  const transcriptText = transcripts.map(t => t.text).join('\n\n');

  // Detect content niche for specialized analysis
  const nicheInfo = detectContentNiche(transcriptText);
  const nicheGuidance = nicheInfo.guidance;

  const enhancedPrompt = `Analyze this YouTube channel's speaking voice and create a comprehensive linguistic profile.
Channel: ${channelName}
${nicheInfo.detectedNiche !== 'general' ? `Detected Content Niche: ${nicheInfo.detectedNiche} (confidence: ${Math.round(nicheInfo.confidence * 100)}%)` : ''}

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
${nicheGuidance.emotionalDynamics || ''}

4. CONTENT POSITIONING
- Self-reference patterns (how often they mention personal experience)
- Audience relationship (teacher, friend, fellow learner, critic)
- Authority stance (expert vs explorer vs commentator)
- Value proposition style (educate vs entertain vs inspire)
${nicheGuidance.contentPositioning || ''}

5. CULTURAL & TOPICAL REFERENCES
- Types of examples used (pop culture, history, science, etc.)
- Metaphor categories preferred
- Current events integration style
- Meme/internet culture usage
- Academic vs colloquial balance
${nicheGuidance.culturalReferences || ''}

6. TECHNICAL PATTERNS
- Average words per sentence
- Paragraph/section length patterns
- Vocabulary complexity distribution
- Technical jargon frequency and explanation style
- Data/statistics presentation style
${nicheGuidance.technicalPatterns || ''}

7. ENGAGEMENT TECHNIQUES
- Direct address frequency ("you" usage)
- Inclusive language patterns ("we" vs "I" vs "you")
- Call-to-action style and placement
- Question deployment strategy
- Community building language
${nicheGuidance.engagementTechniques || ''}

8. PACING DYNAMICS
- Speed variations and triggers
- Pause patterns and purposes
- Emphasis techniques (repetition, volume, speed)
- Breathing patterns affecting delivery
- Edit rhythm preferences
${nicheGuidance.pacingDynamics || ''}

9. CORE VOICE CHARACTERISTICS
Based on your analysis above, distill the channel's voice into these fundamental descriptors:
- Tone: 3-5 adjectives describing the overall emotional quality (e.g., "authoritative", "conversational", "urgent", "empathetic")
- Style: 3-5 adjectives describing the presentation approach (e.g., "investigative", "tutorial-based", "storytelling", "documentary")
- Pace: overall speaking pace (slow/moderate/fast)
- Energy: overall energy level (calm/medium/high)
- Personality: 5-7 traits that come through in their content
- Humor: humor style and frequency (none/rare/occasional/frequent + style description)

10. IMPLEMENTATION GUIDANCE
- Summary: A 2-3 sentence summary of the creator's overall voice
- Dos: 5 specific things to do when writing in this voice
- Don'ts: 5 specific things to avoid
- Hooks: How this creator opens videos (specific patterns)
- Transitions: How they move between topics
- Engagement: How they keep viewers watching
- Signature phrases: 3-5 exact phrases or patterns they frequently use

TRANSCRIPTS TO ANALYZE:
${transcriptText}

Return ONLY valid JSON with the following top-level structure. Include ALL fields:

{
  "tone": ["adjective1", "adjective2", "adjective3"],
  "style": ["adjective1", "adjective2", "adjective3"],
  "pace": "moderate",
  "energy": "medium",
  "personality": ["trait1", "trait2", "trait3"],
  "humor": "occasional - description of humor style",
  "summary": "2-3 sentence voice summary",
  "dos": ["do1", "do2", "do3", "do4", "do5"],
  "donts": ["dont1", "dont2", "dont3", "dont4", "dont5"],
  "hooks": "Description of opening patterns",
  "transitions": "Description of transition style",
  "engagement": "Description of engagement techniques",
  "signature_phrases": ["phrase1", "phrase2", "phrase3"],
  "linguisticFingerprints": { "openingPatterns": [], "transitionPhrases": [], "closingPatterns": [], "fillerWords": {}, "signaturePhrases": [], "questionPatterns": {} },
  "narrativeStructure": { "storyArcPattern": "", "informationFlow": "", "exampleStyle": "", "anecdoteUsage": {}, "hookPlacement": [] },
  "emotionalDynamics": { "energyCurve": [], "emotionalBeats": [], "authenticityMarkers": [], "passionTriggers": [], "vulnerabilityPattern": "" },
  "contentPositioning": { "selfReferenceRate": 0, "audienceRelationship": "", "authorityStance": "", "valueProposition": "" },
  "culturalReferences": { "exampleCategories": [], "metaphorTypes": [], "currentEventsStyle": "", "internetCultureUsage": "", "formalityBalance": "" },
  "technicalPatterns": { "avgWordsPerSentence": 15, "vocabularyComplexity": "", "jargonUsage": {}, "dataPresentation": "" },
  "engagementTechniques": { "directAddressFrequency": 0, "pronounUsage": {}, "ctaStyle": "", "questionStrategy": "", "communityLanguage": [] },
  "pacingDynamics": { "speedVariations": [], "pausePatterns": {}, "emphasisTechniques": [], "rhythmPreferences": "" }
}

CRITICAL JSON RULES:
- Respond ONLY with valid JSON (no markdown, no code blocks)
- All quotes inside string values MUST be escaped with backslash (\")
- All newlines in strings must be escaped as \\n
- No trailing commas in arrays or objects
- Never use empty keys (all keys must be non-empty strings)
- When including example phrases, escape quotes: "She said \\"hello\\""
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

/**
 * Pre-analyze metadata to extract quantifiable patterns
 * This helps Claude make better inferences
 */
function analyzeMetadataPatterns(videos) {
  const patterns = {
    titlePatterns: {
      avgLength: 0,
      capsUsage: 0,
      questionFrequency: 0,
      exclamationFrequency: 0,
      emojiUsage: 0,
      numbersInTitles: 0,
      commonStartWords: [],
      commonEndWords: []
    },
    descriptionPatterns: {
      avgLength: 0,
      linkFrequency: 0,
      emojiUsage: 0,
      personalPronounUsage: 0,
      ctaPresence: 0
    },
    engagementPatterns: {
      highPerformers: [],
      lowPerformers: [],
      avgEngagementRate: 0
    },
    contentPatterns: {
      avgDuration: 0,
      durationVariation: 'consistent',
      publishingConsistency: 'regular'
    },
    tagPatterns: {
      commonTags: [],
      technicalTermFrequency: 0
    }
  };

  if (!videos || videos.length === 0) return patterns;

  // Analyze titles
  let totalTitleLength = 0;
  let capsCount = 0;
  let questionCount = 0;
  let exclamationCount = 0;
  let emojiCount = 0;
  let numbersCount = 0;
  const startWords = {};
  const endWords = {};

  videos.forEach(v => {
    const title = v.snippet?.title || '';
    totalTitleLength += title.length;

    // Count caps
    const capsMatches = title.match(/[A-Z]/g);
    if (capsMatches) capsCount += capsMatches.length;

    // Count questions and exclamations
    if (title.includes('?')) questionCount++;
    if (title.includes('!')) exclamationCount++;

    // Count emojis (basic detection)
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const emojiMatches = title.match(emojiRegex);
    if (emojiMatches) emojiCount += emojiMatches.length;

    // Count numbers
    if (/\d/.test(title)) numbersCount++;

    // Track start/end words
    const words = title.split(/\s+/);
    if (words.length > 0) {
      const start = words[0].toLowerCase();
      const end = words[words.length - 1].toLowerCase();
      startWords[start] = (startWords[start] || 0) + 1;
      endWords[end] = (endWords[end] || 0) + 1;
    }
  });

  patterns.titlePatterns.avgLength = Math.round(totalTitleLength / videos.length);
  patterns.titlePatterns.capsUsage = Math.round((capsCount / (totalTitleLength || 1)) * 100);
  patterns.titlePatterns.questionFrequency = Math.round((questionCount / videos.length) * 100);
  patterns.titlePatterns.exclamationFrequency = Math.round((exclamationCount / videos.length) * 100);
  patterns.titlePatterns.emojiUsage = Math.round((emojiCount / videos.length) * 100);
  patterns.titlePatterns.numbersInTitles = Math.round((numbersCount / videos.length) * 100);

  // Get top 3 start/end words
  patterns.titlePatterns.commonStartWords = Object.entries(startWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
  patterns.titlePatterns.commonEndWords = Object.entries(endWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  // Analyze descriptions
  let totalDescLength = 0;
  let linkCount = 0;
  let descEmojiCount = 0;
  let personalPronounCount = 0;
  let ctaCount = 0;

  videos.forEach(v => {
    const desc = v.snippet?.description || '';
    totalDescLength += desc.length;

    // Count links
    const linkMatches = desc.match(/https?:\/\//g);
    if (linkMatches) linkCount += linkMatches.length;

    // Count emojis
    const emojiMatches = desc.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu);
    if (emojiMatches) descEmojiCount += emojiMatches.length;

    // Count personal pronouns
    const pronounMatches = desc.toLowerCase().match(/\b(i|me|my|we|us|our)\b/g);
    if (pronounMatches) personalPronounCount += pronounMatches.length;

    // Check for CTA keywords
    if (/subscribe|like|comment|share|follow|check out|link in/i.test(desc)) ctaCount++;
  });

  patterns.descriptionPatterns.avgLength = Math.round(totalDescLength / videos.length);
  patterns.descriptionPatterns.linkFrequency = Math.round((linkCount / videos.length) * 10) / 10;
  patterns.descriptionPatterns.emojiUsage = Math.round((descEmojiCount / videos.length) * 10) / 10;
  patterns.descriptionPatterns.personalPronounUsage = Math.round((personalPronounCount / (totalDescLength / 100)) * 10) / 10;
  patterns.descriptionPatterns.ctaPresence = Math.round((ctaCount / videos.length) * 100);

  // Analyze engagement
  const engagementRates = videos.map(v => {
    const views = parseInt(v.statistics?.viewCount || 0);
    const likes = parseInt(v.statistics?.likeCount || 0);
    const comments = parseInt(v.statistics?.commentCount || 0);
    const rate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    return { video: v, rate, views };
  }).sort((a, b) => b.rate - a.rate);

  patterns.engagementPatterns.highPerformers = engagementRates.slice(0, 3).map(e => ({
    title: e.video.snippet?.title,
    engagementRate: Math.round(e.rate * 100) / 100,
    views: e.views
  }));
  patterns.engagementPatterns.lowPerformers = engagementRates.slice(-3).map(e => ({
    title: e.video.snippet?.title,
    engagementRate: Math.round(e.rate * 100) / 100,
    views: e.views
  }));
  patterns.engagementPatterns.avgEngagementRate = Math.round((engagementRates.reduce((sum, e) => sum + e.rate, 0) / engagementRates.length) * 100) / 100;

  // Analyze content patterns
  const durations = videos.map(v => {
    const duration = v.contentDetails?.duration || 'PT0S';
    return parseDuration(duration);
  }).filter(d => d > 0);

  if (durations.length > 0) {
    patterns.contentPatterns.avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const maxDur = Math.max(...durations);
    const minDur = Math.min(...durations);
    patterns.contentPatterns.durationVariation = (maxDur - minDur) < 300 ? 'consistent' : 'varied';
  }

  // Analyze tags
  const allTags = videos.flatMap(v => v.snippet?.tags || []);
  const tagCounts = {};
  allTags.forEach(tag => {
    const normalized = tag.toLowerCase();
    tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
  });
  patterns.tagPatterns.commonTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  return patterns;
}

/**
 * Parse ISO 8601 duration to seconds
 */
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Generate enhanced fallback profile based on metadata patterns
 * This provides much more depth than the old basic fallback
 */
function generateEnhancedMetadataFallback(metadataPatterns) {
  // Infer tone from patterns
  const tone = [];
  if (metadataPatterns.titlePatterns.exclamationFrequency > 30) tone.push('energetic', 'enthusiastic');
  else if (metadataPatterns.titlePatterns.exclamationFrequency > 10) tone.push('engaging');
  else tone.push('professional', 'measured');

  if (metadataPatterns.descriptionPatterns.personalPronounUsage > 5) tone.push('personal', 'conversational');
  else tone.push('objective', 'informative');

  // Infer style
  const style = [];
  if (metadataPatterns.titlePatterns.questionFrequency > 30) style.push('interrogative', 'thought-provoking');
  if (metadataPatterns.descriptionPatterns.linkFrequency > 3) style.push('resource-rich');
  if (metadataPatterns.titlePatterns.numbersInTitles > 40) style.push('list-based', 'structured');
  if (metadataPatterns.descriptionPatterns.emojiUsage > 2) style.push('visual', 'expressive');
  else style.push('text-focused', 'straightforward');

  // Infer pace
  let pace = 'moderate';
  const avgDuration = metadataPatterns.contentPatterns.avgDuration;
  if (avgDuration < 600) pace = 'fast';
  else if (avgDuration > 1200) pace = 'deliberate';

  // Infer energy
  let energy = 'medium';
  const capsUsage = metadataPatterns.titlePatterns.capsUsage;
  const exclamationFreq = metadataPatterns.titlePatterns.exclamationFrequency;
  if (capsUsage > 15 || exclamationFreq > 40) energy = 'high';
  else if (capsUsage < 8 && exclamationFreq < 10) energy = 'calm';

  // Infer personality
  const personality = [];
  if (metadataPatterns.descriptionPatterns.personalPronounUsage > 5) personality.push('relatable', 'approachable');
  if (metadataPatterns.engagementPatterns.avgEngagementRate > 3) personality.push('engaging', 'compelling');
  if (metadataPatterns.tagPatterns.commonTags.length > 7) personality.push('organized', 'strategic');
  if (metadataPatterns.titlePatterns.questionFrequency > 20) personality.push('inquisitive', 'analytical');
  if (metadataPatterns.titlePatterns.numbersInTitles > 30) personality.push('data-oriented', 'systematic');

  return {
    tone: tone.slice(0, 5),
    style: style.slice(0, 5),
    pace,
    energy,
    personality: personality.slice(0, 7),

    linguisticFingerprints: {
      openingPatterns: metadataPatterns.titlePatterns.commonStartWords,
      transitionPhrases: ['Content flow inferred from metadata'],
      closingPatterns: metadataPatterns.titlePatterns.commonEndWords,
      fillerWords: {},
      signaturePhrases: ['Patterns detected from title analysis'],
      questionPatterns: {
        frequency: metadataPatterns.titlePatterns.questionFrequency > 20 ? 'high' : 'moderate',
        style: 'engaging'
      }
    },

    narrativeStructure: {
      storyArcPattern: metadataPatterns.contentPatterns.durationVariation === 'consistent' ? 'structured' : 'varied',
      informationFlow: metadataPatterns.descriptionPatterns.avgLength > 500 ? 'detailed' : 'concise',
      exampleStyle: metadataPatterns.titlePatterns.numbersInTitles > 30 ? 'data-driven' : 'narrative',
      anecdoteUsage: {
        frequency: metadataPatterns.descriptionPatterns.personalPronounUsage > 5 ? 'frequent' : 'occasional'
      },
      hookPlacement: ['title-driven', 'opening-focused']
    },

    emotionalDynamics: {
      energyCurve: energy === 'high' ? ['energetic-start', 'sustained-energy'] : ['steady', 'professional'],
      emotionalBeats: tone,
      authenticityMarkers: metadataPatterns.descriptionPatterns.personalPronounUsage > 5 ? ['personal-pronouns', 'direct-address'] : ['professional-distance'],
      passionTriggers: metadataPatterns.engagementPatterns.highPerformers.map(p => p.title),
      vulnerabilityPattern: metadataPatterns.descriptionPatterns.personalPronounUsage > 7 ? 'open' : 'reserved'
    },

    contentPositioning: {
      selfReferenceRate: metadataPatterns.descriptionPatterns.personalPronounUsage / 100,
      audienceRelationship: metadataPatterns.titlePatterns.questionFrequency > 20 ? 'educator' : 'entertainer',
      authorityStance: metadataPatterns.tagPatterns.commonTags.length > 8 ? 'expert' : 'explorer',
      valueProposition: `${metadataPatterns.contentPatterns.avgDuration > 600 ? 'In-depth' : 'Quick'} content with ${metadataPatterns.engagementPatterns.avgEngagementRate > 3 ? 'high' : 'moderate'} engagement`
    },

    culturalReferences: {
      exampleCategories: metadataPatterns.tagPatterns.commonTags.slice(0, 5),
      metaphorTypes: ['Inferred from metadata patterns'],
      currentEventsStyle: 'moderate',
      internetCultureUsage: metadataPatterns.descriptionPatterns.emojiUsage > 2 ? 'frequent' : 'minimal',
      formalityBalance: metadataPatterns.descriptionPatterns.personalPronounUsage > 5 ? 'casual' : 'professional'
    },

    technicalPatterns: {
      avgWordsPerSentence: Math.round(metadataPatterns.descriptionPatterns.avgLength / 10),
      vocabularyComplexity: metadataPatterns.tagPatterns.commonTags.some(t => t.length > 12) ? 'advanced' : 'accessible',
      jargonUsage: {
        frequency: metadataPatterns.tagPatterns.commonTags.length > 8 ? 'moderate' : 'low',
        types: metadataPatterns.tagPatterns.commonTags.slice(0, 5)
      },
      dataPresentation: metadataPatterns.titlePatterns.numbersInTitles > 30 ? 'data-focused' : 'narrative-focused'
    },

    engagementTechniques: {
      directAddressFrequency: metadataPatterns.descriptionPatterns.personalPronounUsage / 100,
      pronounUsage: {
        you: metadataPatterns.descriptionPatterns.ctaPresence,
        we: metadataPatterns.descriptionPatterns.personalPronounUsage,
        i: metadataPatterns.descriptionPatterns.personalPronounUsage / 2
      },
      ctaStyle: metadataPatterns.descriptionPatterns.ctaPresence > 70 ? 'direct' : 'subtle',
      questionStrategy: metadataPatterns.titlePatterns.questionFrequency > 20 ? 'frequent' : 'occasional',
      communityLanguage: metadataPatterns.descriptionPatterns.ctaPresence > 50 ? ['subscribe', 'join', 'community'] : []
    },

    pacingDynamics: {
      speedVariations: [metadataPatterns.contentPatterns.durationVariation],
      pausePatterns: { frequency: 'moderate' },
      emphasisTechniques: capsUsage > 15 ? ['CAPITALIZATION', 'punctuation!!!'] : ['subtle'],
      rhythmPreferences: metadataPatterns.contentPatterns.durationVariation === 'consistent' ? 'steady' : 'varied'
    },

    implementationNotes: {
      titleFormula: `Avg ${metadataPatterns.titlePatterns.avgLength} chars, ${metadataPatterns.titlePatterns.questionFrequency}% questions`,
      descriptionTemplate: `Avg ${metadataPatterns.descriptionPatterns.avgLength} chars, ${metadataPatterns.descriptionPatterns.ctaPresence}% with CTA`,
      contentAngles: ['Identified from high-performing content'],
      brandingElements: metadataPatterns.tagPatterns.commonTags.slice(0, 3)
    },

    confidenceScores: {
      overall: 0.60,
      tone: 0.65,
      style: 0.70,
      personality: 0.55,
      note: 'Enhanced metadata-based fallback - using quantifiable patterns'
    },

    dos: [
      `Use titles around ${metadataPatterns.titlePatterns.avgLength} characters`,
      `Maintain ${metadataPatterns.contentPatterns.avgDuration / 60} minute average video length`,
      `Include CTAs in descriptions (${metadataPatterns.descriptionPatterns.ctaPresence}% current rate)`,
      'Focus on topics from high-performing videos',
      'Maintain consistent publishing schedule'
    ],

    donts: [
      'Deviate significantly from proven title patterns',
      'Skip video descriptions or CTAs',
      'Ignore engagement patterns from successful content',
      'Change content duration drastically',
      'Abandon successful topic themes'
    ],

    vocabulary: metadataPatterns.descriptionPatterns.avgLength > 500 ? 'detailed' : 'concise',
    sentenceStructure: metadataPatterns.titlePatterns.avgLength > 60 ? 'complex' : 'direct',
    hooks: `${metadataPatterns.titlePatterns.numbersInTitles}% use numbers, ${metadataPatterns.titlePatterns.questionFrequency}% use questions`,
    transitions: 'Inferred from content flow patterns',
    engagement: metadataPatterns.engagementPatterns.avgEngagementRate > 3 ? 'high' : 'moderate',
    humor: metadataPatterns.descriptionPatterns.emojiUsage > 2 ? 'present' : 'minimal',
    signature_phrases: metadataPatterns.titlePatterns.commonStartWords,
    summary: `${energy} energy, ${pace} paced content with ${metadataPatterns.engagementPatterns.avgEngagementRate.toFixed(2)}% engagement rate. Strong focus on ${metadataPatterns.tagPatterns.commonTags[0] || 'diverse topics'}.`,

    _metadataPatterns: metadataPatterns,
    _generatedBy: 'enhanced-metadata-fallback'
  };
}

/**
 * Analyze voice and style from metadata when transcripts are unavailable
 * ENHANCED VERSION: Extracts deep patterns from titles, descriptions, tags, and engagement metrics
 * Returns structure similar to full transcript analysis for consistency
 */
async function analyzeVoiceStyleFromMetadata(channelContext, videos) {

  // Pre-analyze metadata patterns for better prompting
  const metadataPatterns = analyzeMetadataPatterns(videos);

  const prompt = `You are analyzing a YouTube channel's voice and style WITHOUT transcripts. Use the metadata patterns below to create a COMPREHENSIVE voice profile.

${channelContext}

ANALYZED METADATA PATTERNS:
${JSON.stringify(metadataPatterns, null, 2)}

Create a COMPREHENSIVE voice profile that mirrors the depth of transcript-based analysis:

CRITICAL: Return a structure that matches the full transcript analysis format, including:

{
  "tone": ["3-5 tone descriptors inferred from title style, capitalization, punctuation"],
  "style": ["3-5 style descriptors based on description formality, emoji usage, technical language"],
  "pace": "fast/moderate/slow (inferred from title urgency, video length patterns)",
  "energy": "high/medium/low (inferred from punctuation, capitalization, emoji frequency)",
  "personality": ["5-7 personality traits evident from writing style and content patterns"],

  "linguisticFingerprints": {
    "openingPatterns": ["common title opening words/phrases"],
    "transitionPhrases": ["inferred from title progression patterns"],
    "closingPatterns": ["common ending patterns in titles"],
    "fillerWords": {"estimated from description style": "frequency estimate"},
    "signaturePhrases": ["unique recurring phrases in titles/descriptions"],
    "questionPatterns": {"rhetorical vs engaging": "based on question marks in titles"}
  },

  "narrativeStructure": {
    "storyArcPattern": "inferred from title sequencing and video series patterns",
    "informationFlow": "inferred from description organization",
    "exampleStyle": "inferred from title references (case studies, examples, etc)",
    "anecdoteUsage": {"frequency": "inferred from personal pronouns in descriptions"},
    "hookPlacement": ["inferred from title structure"]
  },

  "emotionalDynamics": {
    "energyCurve": ["inferred from punctuation and capitalization patterns"],
    "emotionalBeats": ["dramatic, informative, suspenseful based on title patterns"],
    "authenticityMarkers": ["personal pronouns usage, behind-the-scenes content"],
    "passionTriggers": ["topics with highest engagement or most enthusiastic language"],
    "vulnerabilityPattern": "inferred from personal vs impersonal language"
  },

  "contentPositioning": {
    "selfReferenceRate": 0.0-1.0,
    "audienceRelationship": "educator/entertainer/friend/expert based on language",
    "authorityStance": "expert/explorer/commentator/critic",
    "valueProposition": "what value they promise based on titles/descriptions"
  },

  "culturalReferences": {
    "exampleCategories": ["pop culture, tech, history etc from title analysis"],
    "metaphorTypes": ["inferred from descriptive language patterns"],
    "currentEventsStyle": "frequent/occasional/rare based on trending topics",
    "internetCultureUsage": "heavy/moderate/minimal based on memes, emoji, slang",
    "formalityBalance": "academic/professional/casual/street based on vocabulary"
  },

  "technicalPatterns": {
    "avgWordsPerSentence": "estimated from description sentence structure",
    "vocabularyComplexity": "simple/moderate/advanced based on word choice",
    "jargonUsage": {"frequency": "high/medium/low", "types": ["domain-specific terms"]},
    "dataPresentation": "data-heavy/balanced/story-focused"
  },

  "engagementTechniques": {
    "directAddressFrequency": 0.0-1.0,
    "pronounUsage": {"you": 40, "we": 30, "i": 30},
    "ctaStyle": "aggressive/gentle/implicit based on description CTAs",
    "questionStrategy": "frequent/moderate/rare based on question marks",
    "communityLanguage": ["we, us, our, together, community mentions"]
  },

  "pacingDynamics": {
    "speedVariations": ["inferred from video length variation"],
    "pausePatterns": {"frequency": "estimated from content style"},
    "emphasisTechniques": ["CAPS usage, punctuation!!! patterns"],
    "rhythmPreferences": "consistent/varied based on publishing schedule"
  },

  "implementationNotes": {
    "titleFormula": "identified pattern in title construction",
    "descriptionTemplate": "identified structure in descriptions",
    "contentAngles": ["unique perspectives taken on topics"],
    "brandingElements": ["consistent elements across all content"]
  },

  "confidenceScores": {
    "overall": 0.5-0.7,
    "tone": 0.6-0.8,
    "style": 0.6-0.8,
    "personality": 0.4-0.6,
    "note": "Metadata-based analysis - good confidence on observable patterns, lower on unobservable speech patterns"
  },

  "dos": ["3-5 actionable dos based on successful content patterns"],
  "donts": ["3-5 donts based on avoiding unsuccessful patterns"],
  "vocabulary": "accessible/technical/mixed description",
  "sentenceStructure": "short/varied/complex based on descriptions",
  "hooks": "compelling title patterns identified",
  "transitions": "inferred content flow patterns",
  "engagement": "high/medium/low based on metrics",
  "humor": "frequent/occasional/rare based on language patterns",
  "signature_phrases": ["unique recurring phrases"],
  "summary": "2-3 sentence comprehensive summary"
}

IMPORTANT: Be thorough and specific. Use actual patterns from the metadata. This needs to be AS COMPREHENSIVE as transcript analysis.`;

  try {
    const response = await anthropic.messages.create({
      model: VOICE_MODEL,
      max_tokens: 4000,
      temperature: 0.4,
      system: "You are an expert content analyst who can infer creator voice and style from metadata patterns. Be specific and provide actionable insights. Return only valid JSON.",
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0].text;

    // Parse response
    let voiceProfile;
    try {
      // Try direct parse
      voiceProfile = JSON.parse(content);
    } catch {
      // Extract JSON from markdown if present
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;

      // Try to parse
      try {
        voiceProfile = JSON.parse(jsonText);
      } catch (e2) {
        console.error('❌ Failed to parse metadata analysis:', e2.message);
        // Return enhanced fallback using metadata patterns
        voiceProfile = generateEnhancedMetadataFallback(metadataPatterns);
      }
    }

    // Add metadata flag and ensure complete structure
    voiceProfile.basedOn = 'metadata-only';
    voiceProfile.transcriptsAvailable = false;
    voiceProfile._isMetadataOnly = true;

    // Ensure confidence scores exist
    if (!voiceProfile.confidenceScores) {
      voiceProfile.confidenceScores = {
        overall: 0.6,
        tone: 0.65,
        style: 0.70,
        personality: 0.50,
        note: 'Metadata-based analysis - higher confidence on observable patterns'
      };
    }

    return voiceProfile;

  } catch {

    // Return basic fallback on error
    return {
      inferredTone: ['conversational', 'engaging'],
      contentStyle: {
        titleApproach: 'Standard YouTube style',
        consistencyLevel: 'unknown'
      },
      confidence: {
        overall: 0.2,
        note: 'Error occurred during analysis'
      },
      basedOn: 'fallback',
      transcriptsAvailable: false
    };
  }
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
    } catch {
      
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
        return processEnhancedProfile(parsed, realConfidenceScores, linguisticConsistency);
      } catch {
        // Attempt to extract partial data
        const partialData = extractPartialData(fixedText);

        if (partialData && Object.keys(partialData).length > 5) {
          return processEnhancedProfile(partialData, realConfidenceScores, linguisticConsistency);
        }

        // Return a fallback structure with real confidence scores
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
  } catch {
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
 * Merge partial transcript analysis with metadata analysis (Hybrid Mode)
 * Prioritizes transcript-based patterns (direct observation) over metadata inferences
 */
function mergeTranscriptAndMetadata(transcriptAnalysis, metadataAnalysis, transcriptCount) {
  // Calculate confidence weights (more transcripts = higher weight for transcript data)
  const transcriptWeight = Math.min(transcriptCount / 5, 0.8); // Max 80% at 5 transcripts
  const metadataWeight = 1 - transcriptWeight;

  const merged = {
    // Core voice - prefer transcript data
    tone: transcriptAnalysis.tone || metadataAnalysis.tone,
    style: transcriptAnalysis.style || metadataAnalysis.style,
    pace: transcriptAnalysis.pace || metadataAnalysis.pace,
    energy: transcriptAnalysis.energy || metadataAnalysis.energy,
    personality: transcriptAnalysis.personality || metadataAnalysis.personality,

    // Linguistic patterns - transcript only (can't infer from metadata accurately)
    linguisticFingerprints: transcriptAnalysis.linguisticFingerprints || metadataAnalysis.linguisticFingerprints || {},

    // Narrative structure - blend both
    narrativeStructure: {
      storyArcPattern: transcriptAnalysis.narrativeStructure?.storyArcPattern || metadataAnalysis.narrativeStructure?.storyArcPattern,
      informationFlow: transcriptAnalysis.narrativeStructure?.informationFlow || metadataAnalysis.narrativeStructure?.informationFlow,
      exampleStyle: transcriptAnalysis.narrativeStructure?.exampleStyle || metadataAnalysis.narrativeStructure?.exampleStyle,
      anecdoteUsage: transcriptAnalysis.narrativeStructure?.anecdoteUsage || metadataAnalysis.narrativeStructure?.anecdoteUsage,
      hookPlacement: transcriptAnalysis.narrativeStructure?.hookPlacement || metadataAnalysis.narrativeStructure?.hookPlacement
    },

    // Emotional dynamics - transcript preferred
    emotionalDynamics: transcriptAnalysis.emotionalDynamics || metadataAnalysis.emotionalDynamics || {},

    // Content positioning - blend
    contentPositioning: {
      selfReferenceRate: transcriptAnalysis.contentPositioning?.selfReferenceRate ?? metadataAnalysis.contentPositioning?.selfReferenceRate ?? 0,
      audienceRelationship: transcriptAnalysis.contentPositioning?.audienceRelationship || metadataAnalysis.contentPositioning?.audienceRelationship,
      authorityStance: transcriptAnalysis.contentPositioning?.authorityStance || metadataAnalysis.contentPositioning?.authorityStance,
      valueProposition: metadataAnalysis.contentPositioning?.valueProposition || transcriptAnalysis.contentPositioning?.valueProposition // Metadata better for this
    },

    // Cultural references - blend
    culturalReferences: {
      exampleCategories: [...(transcriptAnalysis.culturalReferences?.exampleCategories || []), ...(metadataAnalysis.culturalReferences?.exampleCategories || [])].slice(0, 10),
      metaphorTypes: transcriptAnalysis.culturalReferences?.metaphorTypes || metadataAnalysis.culturalReferences?.metaphorTypes,
      currentEventsStyle: metadataAnalysis.culturalReferences?.currentEventsStyle || transcriptAnalysis.culturalReferences?.currentEventsStyle,
      internetCultureUsage: metadataAnalysis.culturalReferences?.internetCultureUsage || transcriptAnalysis.culturalReferences?.internetCultureUsage,
      formalityBalance: transcriptAnalysis.culturalReferences?.formalityBalance || metadataAnalysis.culturalReferences?.formalityBalance
    },

    // Technical patterns - transcript preferred
    technicalPatterns: transcriptAnalysis.technicalPatterns || metadataAnalysis.technicalPatterns || {},

    // Engagement techniques - blend
    engagementTechniques: {
      directAddressFrequency: transcriptAnalysis.engagementTechniques?.directAddressFrequency ?? metadataAnalysis.engagementTechniques?.directAddressFrequency ?? 0,
      pronounUsage: transcriptAnalysis.engagementTechniques?.pronounUsage || metadataAnalysis.engagementTechniques?.pronounUsage,
      ctaStyle: metadataAnalysis.engagementTechniques?.ctaStyle || transcriptAnalysis.engagementTechniques?.ctaStyle, // Metadata better for this
      questionStrategy: transcriptAnalysis.engagementTechniques?.questionStrategy || metadataAnalysis.engagementTechniques?.questionStrategy,
      communityLanguage: metadataAnalysis.engagementTechniques?.communityLanguage || transcriptAnalysis.engagementTechniques?.communityLanguage
    },

    // Pacing dynamics - transcript preferred
    pacingDynamics: transcriptAnalysis.pacingDynamics || metadataAnalysis.pacingDynamics || {},

    // Implementation notes - metadata better for quantifiable patterns
    implementationNotes: {
      ...metadataAnalysis.implementationNotes,
      ...transcriptAnalysis.implementationNotes,
      mergeNote: `Hybrid analysis: ${transcriptCount} transcripts + metadata enrichment`
    },

    // Confidence scores - blend with weights
    confidenceScores: {
      overall: (transcriptAnalysis.confidenceScores?.overall || 0.5) * transcriptWeight +
               (metadataAnalysis.confidenceScores?.overall || 0.6) * metadataWeight,
      tone: (transcriptAnalysis.confidenceScores?.tone || 0.6) * transcriptWeight +
            (metadataAnalysis.confidenceScores?.tone || 0.65) * metadataWeight,
      style: (transcriptAnalysis.confidenceScores?.style || 0.6) * transcriptWeight +
             (metadataAnalysis.confidenceScores?.style || 0.70) * metadataWeight,
      personality: (transcriptAnalysis.confidenceScores?.personality || 0.5) * transcriptWeight +
                   (metadataAnalysis.confidenceScores?.personality || 0.55) * metadataWeight,
      note: `Hybrid analysis with ${transcriptCount} transcripts (${Math.round(transcriptWeight * 100)}% weight) + metadata (${Math.round(metadataWeight * 100)}% weight)`
    },

    // Backwards compatibility
    dos: transcriptAnalysis.dos || metadataAnalysis.dos,
    donts: transcriptAnalysis.donts || metadataAnalysis.donts,
    vocabulary: transcriptAnalysis.vocabulary || metadataAnalysis.vocabulary,
    sentenceStructure: transcriptAnalysis.sentenceStructure || metadataAnalysis.sentenceStructure,
    hooks: metadataAnalysis.hooks || transcriptAnalysis.hooks, // Metadata better for hooks
    transitions: transcriptAnalysis.transitions || metadataAnalysis.transitions,
    engagement: metadataAnalysis.engagement || transcriptAnalysis.engagement, // Metadata has engagement metrics
    humor: transcriptAnalysis.humor || metadataAnalysis.humor,
    signature_phrases: transcriptAnalysis.signature_phrases || metadataAnalysis.signature_phrases,
    summary: `Hybrid analysis from ${transcriptCount} transcripts + metadata. ${transcriptAnalysis.summary || metadataAnalysis.summary}`,

    // Hybrid metadata
    _isHybrid: true,
    _transcriptCount: transcriptCount,
    _transcriptWeight: transcriptWeight,
    _metadataWeight: metadataWeight,
    _transcriptSource: transcriptAnalysis._generatedBy || 'transcript-analysis',
    _metadataSource: metadataAnalysis._generatedBy || 'metadata-analysis'
  };

  return merged;
}

/**
 * Fetch and analyze actual transcripts from YouTube channels
 * This provides real voice analysis instead of theoretical blending
 * @param {Array} channels - Array of channel objects to analyze
 * @param {Object} options - Optional configuration
 * @param {Function} options.onProgress - Progress callback (progress, message) => void
 */
export async function analyzeChannelVoicesFromYouTube(channels, options = {}) {
  const { onProgress, forceRefresh = false } = options;
  const channelAnalyses = [];
  const totalChannels = channels.length;

  for (let channelIndex = 0; channelIndex < channels.length; channelIndex++) {
    const channel = channels[channelIndex];
    try {
      // Extract YouTube channel ID from various possible fields
      const youtubeChannelId = channel.youtube_channel_id ||
                              channel.channelId ||
                              channel.youtubeChannelId ||
                              channel.channel_id;

      // Skip if not a real YouTube channel (e.g., custom/remix channels)
      if (!youtubeChannelId || youtubeChannelId.startsWith('remix_')) {
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
        channelAnalyses.push({
          channel: channel,
          voiceAnalysis: channel.voice_profile,
          source: 'existing',
          videosAnalyzed: 0
        });
        continue;
      }

      // Get channel name early for logging
      const channelName = channel.title || channel.name || 'Channel';

      // CHECK CACHE before expensive analysis
      if (!forceRefresh) {
        const cached = await getCachedVoiceAnalysis(youtubeChannelId);
        if (cached) {
          console.log(`[Voice Analysis] Cache HIT for ${channelName} (${cached.age} old)`);
          channelAnalyses.push({
            channel: channel,
            voiceAnalysis: cached.data,
            source: `cached_${cached.source}`,
            videosAnalyzed: cached.metadata?.videosAnalyzed || 0,
            videos: [],
            fromCache: true,
            cacheAge: cached.age
          });
          continue;
        }
        console.log(`[Voice Analysis] Cache MISS for ${channelName}`);
      }

      // Update progress: Starting video fetch
      if (onProgress) {
        const baseProgress = 30 + (channelIndex / totalChannels) * 15;
        onProgress(baseProgress, `Fetching videos for ${channelName}...`);
      }

      // Fetch videos from the channel
      const videos = await getChannelVideos(youtubeChannelId, 10);

      if (!videos || videos.length === 0) {
        channelAnalyses.push({
          channel: channel,
          voiceAnalysis: null,
          source: 'no-videos',
          error: 'No videos found'
        });
        continue;
      }

      // Update progress: Starting transcript fetch
      if (onProgress) {
        const baseProgress = 30 + (channelIndex / totalChannels) * 15 + 2;
        onProgress(baseProgress, `Analyzing transcripts for ${channelName}...`);
      }

      // Fetch transcripts SEQUENTIALLY to avoid Supadata 429 rate limit errors
      // Free tier: 1 req/sec, Basic/Pro: 10 req/sec
      const transcripts = [];
      const analyzedVideos = [];
      const idealTranscripts = 5; // Ideal for full analysis
      const minTranscriptsForHybrid = 2; // Minimum for hybrid analysis
      const maxVideosToTry = 20; // Try up to 20 videos to get enough transcripts
      const interRequestDelay = 1000; // 1 second delay between requests

      const videosToProcess = videos.slice(0, maxVideosToTry);

      // Sequential fetch with delay to avoid rate limiting
      for (let i = 0; i < videosToProcess.length && transcripts.length < idealTranscripts; i++) {
        const video = videosToProcess[i];

        // Update progress for each video
        if (onProgress) {
          // Map transcript fetching to 30-55% progress range
          const transcriptProgress = 30 + ((i + 1) / videosToProcess.length) * 25;
          onProgress(
            Math.min(transcriptProgress, 55),
            `Fetching transcript ${i + 1}/${videosToProcess.length} for ${channelName}...`,
            'transcripts'
          );
        }

        try {
          const transcript = await getVideoTranscript(video.id);
          if (transcript?.hasTranscript && transcript?.fullText) {
            transcripts.push(transcript.fullText);
            analyzedVideos.push({
              id: video.id,
              title: video.snippet.title,
              publishedAt: video.snippet.publishedAt
            });
          }
        } catch (error) {
          // Log but continue - some videos may not have transcripts
          console.log(`Transcript fetch failed for video ${video.id}:`, error.message);
        }

        // Add delay between requests to avoid rate limiting (except after last request)
        if (i < videosToProcess.length - 1 && transcripts.length < idealTranscripts) {
          await new Promise(resolve => setTimeout(resolve, interRequestDelay));
        }
      }

      // Analyze based on available data
      let voiceAnalysis = null;
      let source = 'none';

      // DECISION TREE: Full Analysis vs Hybrid vs Metadata-Only
      if (transcripts.length >= idealTranscripts) {
        // FULL TRANSCRIPT ANALYSIS (5+ transcripts)
        
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

        source = 'youtube-transcripts';

      } else if (transcripts.length >= minTranscriptsForHybrid) {
        // HYBRID ANALYSIS (2-4 transcripts + metadata)

        // Prepare transcript data for partial analysis
        const transcriptData = transcripts.map((text, index) => ({
          text: text,
          videoTitle: analyzedVideos[index]?.title || `Video ${index + 1}`
        }));

        // Run partial transcript analysis
        const partialTranscriptAnalysis = await analyzeTranscriptVoice(transcriptData, channel.title || channel.name);

        // Run enhanced metadata analysis
        const videosToAnalyze = videos.slice(0, 15);
        const videoTexts = videosToAnalyze.map((v, index) => {
          const title = v.snippet?.title || '';
          const description = v.snippet?.description?.substring(0, 500) || '';
          const tags = v.snippet?.tags?.slice(0, 10).join(', ') || '';
          const views = v.statistics?.viewCount || 0;
          const likes = v.statistics?.likeCount || 0;
          const comments = v.statistics?.commentCount || 0;
          const engagementRate = views > 0 ? ((parseInt(likes) + parseInt(comments)) / parseInt(views) * 100).toFixed(2) : 0;

          return `VIDEO ${index + 1}:
Title: ${title}
Description: ${description}
Tags: ${tags}
Performance: ${parseInt(views).toLocaleString()} views, ${engagementRate}% engagement
---`;
        }).join('\n\n');

        const channelContext = `
CHANNEL OVERVIEW:
Name: ${channel.title || channel.name}
Description: ${channel.description?.substring(0, 1000) || 'No description'}
Total Videos: ${videosToAnalyze.length} analyzed
Subscriber Count: ${channel.subscriber_count?.toLocaleString() || 'Unknown'}
Transcripts Available: ${transcripts.length}

CONTENT PATTERNS:
${videoTexts}`;

        const metadataAnalysis = await analyzeVoiceStyleFromMetadata(channelContext, videosToAnalyze);

        // MERGE: Prioritize transcript-based patterns, fill gaps with metadata
        voiceAnalysis = mergeTranscriptAndMetadata(partialTranscriptAnalysis, metadataAnalysis, transcripts.length);

        // Add hybrid indicators
        voiceAnalysis.analysisMethod = 'hybrid';
        voiceAnalysis.transcriptCount = transcripts.length;
        voiceAnalysis.metadataVideos = videosToAnalyze.length;
        voiceAnalysis.analyzedVideos = analyzedVideos;

        source = 'hybrid-analysis';

      } else {
        // METADATA-ONLY ANALYSIS (0 transcripts)
        // Use up to 15 videos for better pattern detection
        const videosToAnalyze = videos.slice(0, 15);

        // Build comprehensive metadata text including multiple data sources
        const videoTexts = videosToAnalyze.map((v, index) => {
          const title = v.snippet?.title || '';
          const description = v.snippet?.description?.substring(0, 500) || ''; // First 500 chars
          const tags = v.snippet?.tags?.slice(0, 10).join(', ') || '';
          const views = v.statistics?.viewCount || 0;
          const likes = v.statistics?.likeCount || 0;
          const comments = v.statistics?.commentCount || 0;

          // Include engagement metrics to infer content style
          const engagementRate = views > 0 ? ((parseInt(likes) + parseInt(comments)) / parseInt(views) * 100).toFixed(2) : 0;

          return `VIDEO ${index + 1}:
Title: ${title}
Description: ${description}
Tags: ${tags}
Performance: ${parseInt(views).toLocaleString()} views, ${engagementRate}% engagement
---`;
        }).join('\n\n');

        // Add channel-level context
        const channelContext = `
CHANNEL OVERVIEW:
Name: ${channel.title || channel.name}
Description: ${channel.description?.substring(0, 1000) || 'No description'}
Total Videos: ${videosToAnalyze.length} analyzed
Subscriber Count: ${channel.subscriber_count?.toLocaleString() || 'Unknown'}

CONTENT PATTERNS:
${videoTexts}`;

        // Use enhanced metadata analysis that infers style from titles, descriptions, and patterns
        voiceAnalysis = await analyzeVoiceStyleFromMetadata(channelContext, videosToAnalyze);
        source = 'enhanced-metadata';
      }

      // STORE IN CACHE after fresh analysis
      if (voiceAnalysis) {
        await setCachedVoiceAnalysis(youtubeChannelId, voiceAnalysis, {
          source,
          videosAnalyzed: analyzedVideos.length,
          transcriptsAnalyzed: transcripts.length,
          channelName: channelName,
          analysisVersion: '1.0.0'
        });
      }

      channelAnalyses.push({
        channel: channel,
        voiceAnalysis: voiceAnalysis,
        source: source,
        videosAnalyzed: analyzedVideos.length,
        videos: analyzedVideos,
        fromCache: false
      });

    } catch (error) {
      channelAnalyses.push({
        channel: channel,
        voiceAnalysis: null,
        source: 'error',
        error: error.message,
        fromCache: false
      });
    }
  }

  // Log cache performance metrics
  const cacheHits = channelAnalyses.filter(a => a.fromCache).length;
  const cacheMisses = channelAnalyses.filter(a => !a.fromCache && a.source !== 'existing' && a.source !== 'skipped').length;
  const existingProfiles = channelAnalyses.filter(a => a.source === 'existing').length;
  const skipped = channelAnalyses.filter(a => a.source === 'skipped').length;

  if (cacheHits + cacheMisses > 0) {
    const hitRate = Math.round(cacheHits / (cacheHits + cacheMisses) * 100);
    console.log(`[Voice Analysis] Cache performance: ${cacheHits} hits, ${cacheMisses} misses (${hitRate}% hit rate)`);
    if (existingProfiles > 0) {
      console.log(`[Voice Analysis] Additional: ${existingProfiles} existing profiles, ${skipped} skipped`);
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
    // Use basic generation as fallback
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