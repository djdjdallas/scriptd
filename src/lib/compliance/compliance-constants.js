/**
 * Compliance Constants
 *
 * Defines all constants used by the YouTube compliance checking engine including:
 * - AI pattern phrases to detect
 * - Scoring weights and thresholds
 * - Warning messages and suggestions
 * - Category definitions
 */

// =============================================================================
// SCORING CONFIGURATION
// =============================================================================

/**
 * Weight distribution for overall compliance score calculation
 * Total must equal 1.0
 */
export const CATEGORY_WEIGHTS = {
  repetitiveness: 0.30,    // 30% - Most detectable by YouTube algorithms
  originalInsight: 0.25,   // 25% - Core authenticity differentiator
  aiPatterns: 0.25,        // 25% - Direct policy concern
  structure: 0.20          // 20% - Quality indicator
};

/**
 * Status thresholds for badge determination
 */
export const STATUS_THRESHOLDS = {
  approved: 80,      // 80-100: Safe to publish
  needsReview: 60,   // 60-79: Needs human review
  highRisk: 0        // 0-59: Significant concerns
};

/**
 * Severity levels for warnings
 */
export const SEVERITY_LEVELS = {
  info: 'info',
  warning: 'warning',
  critical: 'critical'
};

// =============================================================================
// AI PATTERN DETECTION
// =============================================================================

/**
 * Common AI hedging phrases that should be avoided
 * These indicate AI-generated content and lack of confidence
 */
export const AI_HEDGING_PHRASES = [
  "it's important to note",
  "it's worth mentioning",
  "it should be noted",
  "it goes without saying",
  "needless to say",
  "as we all know",
  "it's no secret that",
  "one might argue",
  "some would say",
  "it could be said",
  "arguably",
  "interestingly enough",
  "surprisingly",
  "unsurprisingly",
  "as you might expect"
];

/**
 * Generic AI transition phrases
 * Overuse of formal transitions is a hallmark of AI content
 */
export const AI_TRANSITION_PHRASES = [
  "furthermore",
  "moreover",
  "additionally",
  "in addition to this",
  "on the other hand",
  "having said that",
  "with that being said",
  "that being said",
  "in light of this",
  "taking this into account",
  "in conclusion",
  "to summarize",
  "to sum up",
  "all things considered",
  "in summary"
];

/**
 * Formulaic AI phrases commonly found in AI-generated content
 */
export const AI_FORMULAIC_PHRASES = [
  "in today's video",
  "in this video",
  "without further ado",
  "let's dive in",
  "let's dive right in",
  "let's get into it",
  "let's jump right in",
  "let's get started",
  "before we begin",
  "before we get started",
  "first and foremost",
  "last but not least",
  "in today's fast-paced world",
  "in this day and age",
  "at the end of the day",
  "when it comes to",
  "whether you're a beginner or expert",
  "whether you're new or experienced",
  "the answer may surprise you",
  "here's the thing",
  "here's what you need to know",
  "the truth is",
  "the reality is",
  "the fact of the matter is",
  "let me explain",
  "allow me to explain"
];

/**
 * Overly formal language patterns that AI tends to use
 */
export const FORMAL_PATTERNS = [
  { pattern: /\bdo not\b/gi, suggestion: "don't" },
  { pattern: /\bcannot\b/gi, suggestion: "can't" },
  { pattern: /\bwill not\b/gi, suggestion: "won't" },
  { pattern: /\bshould not\b/gi, suggestion: "shouldn't" },
  { pattern: /\bwould not\b/gi, suggestion: "wouldn't" },
  { pattern: /\bcould not\b/gi, suggestion: "couldn't" },
  { pattern: /\bdoes not\b/gi, suggestion: "doesn't" },
  { pattern: /\bis not\b/gi, suggestion: "isn't" },
  { pattern: /\bare not\b/gi, suggestion: "aren't" },
  { pattern: /\bhas not\b/gi, suggestion: "hasn't" },
  { pattern: /\bhave not\b/gi, suggestion: "haven't" },
  { pattern: /\bhad not\b/gi, suggestion: "hadn't" },
  { pattern: /\bit is\b/gi, suggestion: "it's" },
  { pattern: /\bthat is\b/gi, suggestion: "that's" },
  { pattern: /\bwhat is\b/gi, suggestion: "what's" },
  { pattern: /\bwho is\b/gi, suggestion: "who's" },
  { pattern: /\bthere is\b/gi, suggestion: "there's" },
  { pattern: /\bhere is\b/gi, suggestion: "here's" },
  { pattern: /\blet us\b/gi, suggestion: "let's" },
  { pattern: /\bi am\b/gi, suggestion: "I'm" },
  { pattern: /\byou are\b/gi, suggestion: "you're" },
  { pattern: /\bthey are\b/gi, suggestion: "they're" },
  { pattern: /\bwe are\b/gi, suggestion: "we're" }
];

// =============================================================================
// ORIGINAL INSIGHT DETECTION
// =============================================================================

/**
 * First-person perspective markers indicating personal experience
 */
export const FIRST_PERSON_MARKERS = [
  "i think",
  "i believe",
  "i've found",
  "i've discovered",
  "i've learned",
  "i've noticed",
  "i realized",
  "in my experience",
  "in my opinion",
  "from my perspective",
  "what i've seen",
  "what works for me",
  "personally",
  "for me",
  "i prefer",
  "i recommend",
  "i suggest",
  "my take is",
  "my approach is",
  "the way i see it",
  "i was surprised",
  "i was shocked",
  "i couldn't believe",
  "when i first started",
  "when i tried this",
  "after testing",
  "after experimenting"
];

/**
 * Opinion statement markers showing personal viewpoint
 */
export const OPINION_MARKERS = [
  "the best approach is",
  "the best way to",
  "the most effective",
  "what really works is",
  "the trick is",
  "the secret is",
  "here's my strategy",
  "my favorite method",
  "this is crucial",
  "this is key",
  "don't make the mistake",
  "avoid this common trap",
  "most people get this wrong",
  "contrary to popular belief",
  "unpopular opinion"
];

/**
 * Anecdote indicators suggesting personal stories
 */
export const ANECDOTE_MARKERS = [
  "last week",
  "last month",
  "last year",
  "recently",
  "the other day",
  "a few days ago",
  "a while back",
  "when i was",
  "i remember when",
  "there was this time",
  "true story",
  "let me tell you about",
  "funny story",
  "this happened to me",
  "i had a client who",
  "one of my viewers",
  "someone asked me"
];

/**
 * Specific detail patterns indicating research/expertise
 */
export const SPECIFICITY_PATTERNS = [
  /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?%\b/, // Percentages
  /\$\d{1,3}(?:,\d{3})*(?:\.\d+)?/, // Dollar amounts
  /\b\d{4}\b/, // Years
  /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?\b/i, // Dates
  /\b\d+(?:\.\d+)?x\b/i, // Multipliers (2x, 3.5x)
  /\b\d+(?:k|K|m|M|b|B)\b/, // Large numbers shorthand
  /according to\s+[A-Z][a-z]+/i, // Attributed sources
  /\bstudy (?:by|from)\s+[A-Z]/i // Cited studies
];

// =============================================================================
// STRUCTURE ANALYSIS
// =============================================================================

/**
 * Hook patterns for detecting strong openings
 */
export const HOOK_PATTERNS = [
  /^(?:what if|imagine|picture this|here's (?:the thing|a secret)|did you know|stop|wait)/i,
  /^(?:the biggest mistake|the #1 reason|most people don't know|nobody talks about)/i,
  /^(?:i'm going to show you|by the end of this|after this video)/i,
  /\?$/, // Questions as hooks
  /^(?:okay|ok|so|look|listen|hey|alright)/i // Conversational openers
];

/**
 * Call-to-action patterns
 */
export const CTA_PATTERNS = [
  /subscribe/i,
  /like (?:this video|the video|and subscribe)/i,
  /hit the (?:bell|notification)/i,
  /leave a comment/i,
  /let me know (?:in the comments|what you think|below)/i,
  /share this/i,
  /check out (?:the link|my|this)/i,
  /follow me/i,
  /join (?:my|the)/i,
  /download/i,
  /sign up/i,
  /click (?:the link|below|here)/i
];

/**
 * Pattern interrupt markers for retention
 */
export const PATTERN_INTERRUPT_MARKERS = [
  "but here's the thing",
  "plot twist",
  "but wait",
  "here's where it gets interesting",
  "now here's the kicker",
  "you're not going to believe this",
  "this is where most people mess up",
  "pay attention to this part",
  "this is important",
  "don't skip this"
];

// =============================================================================
// REPETITIVENESS DETECTION
// =============================================================================

/**
 * Minimum occurrences for a phrase to be flagged as repetitive
 */
export const REPETITION_THRESHOLD = 3;

/**
 * Minimum phrase length (in words) to check for repetition
 */
export const MIN_PHRASE_LENGTH = 3;

/**
 * Maximum phrase length (in words) to check for repetition
 */
export const MAX_PHRASE_LENGTH = 8;

/**
 * Similarity threshold for detecting similar sentences (0-1)
 * Higher = more similar required to flag
 */
export const SENTENCE_SIMILARITY_THRESHOLD = 0.7;

/**
 * Minimum vocabulary diversity score (unique words / total words)
 */
export const MIN_VOCABULARY_DIVERSITY = 0.3;

// =============================================================================
// WARNING MESSAGES
// =============================================================================

/**
 * Warning message templates by category
 */
export const WARNING_MESSAGES = {
  repetitiveness: {
    repeatedPhrase: (phrase, count) =>
      `The phrase "${phrase}" appears ${count} times. Consider varying your language.`,
    lowDiversity: (score) =>
      `Vocabulary diversity is low (${Math.round(score * 100)}%). Use more varied language.`,
    similarSentences:
      'Multiple sentences have very similar structure. Vary your sentence patterns.',
    templateLike:
      'Content appears template-based. Add more unique variations.'
  },

  originalInsight: {
    noFirstPerson:
      'No personal perspective detected. Add "I think", "In my experience", or share personal stories.',
    noOpinions:
      'No opinion statements found. Share your unique take on the topic.',
    noSpecificDetails:
      'Content lacks specific data or examples. Add numbers, dates, or concrete examples.',
    generic:
      'This section reads as generic information. Add your personal insights or experiences.'
  },

  aiPatterns: {
    hedgingDetected: (phrase) =>
      `AI-typical hedging phrase detected: "${phrase}". Remove or rephrase.`,
    formulaicPhrase: (phrase) =>
      `Generic AI phrase detected: "${phrase}". Use more authentic language.`,
    formalLanguage: (formal, casual) =>
      `Formal "${formal}" detected. Consider using "${casual}" for a conversational tone.`,
    transitionOveruse:
      'Excessive use of formal transitions. Use more natural flow between ideas.'
  },

  structure: {
    weakHook:
      'Opening hook is weak. Start with a question, bold statement, or pattern interrupt.',
    noCTA:
      'No call-to-action detected. Add engagement prompts for your audience.',
    noPatternInterrupts:
      'No pattern interrupts found. Add "but here\'s the thing" or similar to maintain retention.',
    monotonousSentences:
      'Sentence lengths are too uniform. Mix short punchy sentences with longer explanations.',
    longParagraphs:
      'Paragraphs are too long for video scripts. Break into shorter, digestible chunks.'
  }
};

// =============================================================================
// SUGGESTION TEMPLATES
// =============================================================================

/**
 * Improvement suggestions by category
 */
export const SUGGESTIONS = {
  repetitiveness: [
    'Use a thesaurus to find synonyms for repeated words',
    'Restructure sentences to express ideas differently',
    'Remove redundant phrases that add no new information',
    'Combine similar sentences into one stronger statement'
  ],

  originalInsight: [
    'Share a personal story related to this point',
    'Add "In my experience..." or "What I\'ve found is..."',
    'Include specific results or data you\'ve seen',
    'Express your opinion: "I believe..." or "My take is..."',
    'Reference a specific example from your own work'
  ],

  aiPatterns: [
    'Replace formal language with contractions',
    'Remove filler phrases like "It\'s important to note"',
    'Use casual transitions or remove them entirely',
    'Speak directly to viewers instead of making general statements',
    'Add imperfections - real speech isn\'t perfect'
  ],

  structure: [
    'Start with a hook: question, bold claim, or story',
    'Add a pattern interrupt every 2-3 minutes',
    'Mix sentence lengths: short, medium, long',
    'Include a clear call-to-action',
    'Break long paragraphs into 2-3 sentence chunks'
  ]
};

// =============================================================================
// CATEGORY DEFINITIONS
// =============================================================================

/**
 * Category metadata for display
 */
export const CATEGORY_INFO = {
  repetitiveness: {
    name: 'Repetitiveness',
    description: 'Measures vocabulary diversity and phrase repetition',
    icon: 'RefreshCw',
    color: 'blue'
  },
  originalInsight: {
    name: 'Original Insight',
    description: 'Detects personal perspective and unique viewpoints',
    icon: 'Lightbulb',
    color: 'yellow'
  },
  aiPatterns: {
    name: 'AI Patterns',
    description: 'Identifies AI-typical phrases and formal language',
    icon: 'Bot',
    color: 'purple'
  },
  structure: {
    name: 'Structure Quality',
    description: 'Evaluates hooks, CTAs, and script flow',
    icon: 'LayoutTemplate',
    color: 'green'
  }
};

// =============================================================================
// BADGE DEFINITIONS
// =============================================================================

/**
 * Badge status definitions
 */
export const BADGE_STATUS = {
  approved: {
    label: 'YouTube Approved',
    description: 'This script meets YouTube\'s authenticity guidelines',
    color: 'green',
    icon: 'CheckCircle'
  },
  'needs-review': {
    label: 'Needs Review',
    description: 'Some areas need attention before publishing',
    color: 'yellow',
    icon: 'AlertCircle'
  },
  'high-risk': {
    label: 'High Risk',
    description: 'Significant concerns - recommend major revisions',
    color: 'red',
    icon: 'XCircle'
  }
};
