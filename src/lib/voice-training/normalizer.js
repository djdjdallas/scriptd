/**
 * Voice Profile Normalizer
 *
 * Handles the shape mismatch between basic profiles (processor.js),
 * train route profiles (voice/train/route.js), and deep analysis profiles
 * (channel-analyzer.js / remix-voice-analyzer.js).
 *
 * Basic profile stores tone as a string ("enthusiastic"),
 * Deep profile stores tone as an array (["empathetic", "educational"]).
 * This normalizer produces a consistent shape for downstream consumers.
 */

/**
 * Normalize a voice profile into a consistent shape regardless of source.
 * @param {Object} profile - Raw voice profile from any source
 * @returns {Object} Normalized profile with consistent field types
 */
export function normalizeVoiceProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return null;
  }

  // Detect which shape we're dealing with
  const source = detectProfileSource(profile);

  return {
    // Core voice characteristics - always arrays for consistency
    tone: normalizeToArray(profile.tone, 'neutral'),
    style: normalizeToArray(profile.style, 'informative'),
    pace: normalizeToString(profile.pace || profile.pacing, 'moderate'),
    energy: normalizeToString(profile.energy, 'moderate'),
    personality: normalizeToArray(profile.personality, []),
    humor: normalizeToString(profile.humor, 'occasional'),

    // Implementation guidance
    summary: profile.summary || '',
    dos: normalizeToArray(profile.dos, []),
    donts: normalizeToArray(profile.donts || profile.don_ts, []),
    hooks: normalizeToString(profile.hooks, ''),
    transitions: normalizeToString(
      typeof profile.transitions === 'string' ? profile.transitions : '',
      ''
    ),

    // Signature elements
    signature_phrases: normalizeToArray(
      profile.signature_phrases || profile.commonPhrases || [],
      []
    ),
    greetings: normalizeToArray(profile.greetings, []),
    catchphrases: normalizeToArray(profile.catchphrases, []),
    signoffs: normalizeToArray(profile.signoffs, []),
    topWords: normalizeToArray(profile.topWords || profile.vocabulary, []),

    // Speech characteristics
    formality: normalizeToString(profile.formality, 'balanced'),
    enthusiasm: normalizeToString(profile.enthusiasm, 'medium'),
    technicalLevel: normalizeToString(profile.technicalLevel, 'semi-technical'),
    avgWordsPerSentence: profile.avgWordsPerSentence ||
      profile.characteristics?.sentenceComplexity ||
      profile.technicalPatterns?.avgWordsPerSentence || 15,

    // Enhanced analysis fields (from deep analysis)
    linguisticFingerprints: profile.linguisticFingerprints || null,
    narrativeStructure: profile.narrativeStructure || null,
    emotionalDynamics: profile.emotionalDynamics || profile.emotional_dynamics || null,
    contentPositioning: profile.contentPositioning || profile.content_positioning || null,
    culturalReferences: profile.culturalReferences || null,
    technicalPatterns: profile.technicalPatterns || null,
    engagementTechniques: profile.engagementTechniques || null,
    pacingDynamics: profile.pacingDynamics || null,

    // Audience relationship (from deep analysis)
    audience_relationship: profile.audience_relationship || null,

    // Performance data
    performance: profile.performance || null,

    // Basic profile characteristics (from processor.js)
    characteristics: profile.characteristics || null,

    // Advanced v2 analyzer data
    prosody: profile.prosody || profile.parameters?.prosody || null,
    creatorPatterns: profile.creatorPatterns || profile.parameters?.creatorPatterns || null,
    fingerprint: profile.fingerprint || profile.parameters?.fingerprint || null,
    quality: profile.quality || profile.parameters?.quality || null,

    // Metadata
    metadata: {
      ...(profile.metadata || {}),
      source,
      normalizedAt: new Date().toISOString(),
    },

    // Completeness
    completenessAnalysis: profile.completenessAnalysis || null,
  };
}

/**
 * Detect which system generated this profile
 * @param {Object} profile
 * @returns {'basic'|'train_route'|'deep_analysis'|'remix'|'unknown'}
 */
export function detectProfileSource(profile) {
  if (!profile) return 'unknown';

  // Deep analysis has linguisticFingerprints or arrays for tone
  if (profile.linguisticFingerprints || profile.narrativeStructure) {
    return 'deep_analysis';
  }

  // Remix profiles have combined_from_remix flag
  if (profile.combined_from_remix || profile.metadata?.combined_from_remix) {
    return 'remix';
  }

  // Train route profile has formality + enthusiasm but not characteristics
  if (profile.formality && profile.enthusiasm && !profile.characteristics) {
    return 'train_route';
  }

  // Basic processor profile has characteristics + pacing
  if (profile.characteristics && profile.pacing) {
    return 'basic';
  }

  // If tone is an array, it's likely from deep analysis
  if (Array.isArray(profile.tone)) {
    return 'deep_analysis';
  }

  return 'unknown';
}

/**
 * Ensure a value is always an array
 */
function normalizeToArray(value, fallback) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  if (value && typeof value === 'object') return Object.values(value);
  return Array.isArray(fallback) ? fallback : (fallback ? [fallback] : []);
}

/**
 * Ensure a value is always a string
 */
function normalizeToString(value, fallback) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return fallback;
}

/**
 * Build a script-generation-ready voice injection from a normalized profile.
 * This replaces the raw JSON.stringify dump in script-generation-v2.js
 * with structured, actionable instructions for the AI.
 *
 * @param {Object} profile - Normalized voice profile
 * @param {string} channelName - Channel name for context
 * @returns {string} Formatted voice instructions for prompt injection
 */
export function buildVoicePromptInjection(profile, channelName = '') {
  if (!profile) return '';

  const normalized = profile.metadata?.normalizedAt ? profile : normalizeVoiceProfile(profile);
  const hasDeepData = !!normalized.linguisticFingerprints;

  const sections = [];

  // Header
  sections.push(`VOICE PROFILE: ${channelName || 'Creator'}`);
  sections.push(`Voice Style: ${normalized.tone.join(', ')} | ${normalized.style.join(', ')}`);
  sections.push(`Energy: ${normalized.energy} | Pace: ${normalized.pace}`);

  if (normalized.summary) {
    sections.push(`\nVoice Summary: ${normalized.summary}`);
  }

  // Signature elements
  if (normalized.signature_phrases.length > 0) {
    sections.push(`\nSignature Phrases (use naturally): ${normalized.signature_phrases.slice(0, 10).map(p => typeof p === 'string' ? `"${p}"` : `"${p}"`).join(', ')}`);
  }

  if (normalized.greetings.length > 0) {
    sections.push(`Opening Style: ${normalized.greetings.slice(0, 3).join(' / ')}`);
  }

  if (normalized.catchphrases.length > 0) {
    sections.push(`Catchphrases: ${normalized.catchphrases.slice(0, 5).join(', ')}`);
  }

  // Deep analysis fields
  if (hasDeepData) {
    const lf = normalized.linguisticFingerprints;

    if (lf?.openingPatterns?.length > 0) {
      sections.push(`\nOPENING PATTERNS (use one):\n${lf.openingPatterns.slice(0, 3).map(p => `  - "${p}"`).join('\n')}`);
    }

    if (lf?.transitionPhrases?.length > 0) {
      sections.push(`\nTRANSITION PHRASES (use between sections):\n${lf.transitionPhrases.slice(0, 5).map(p => `  - "${p}"`).join('\n')}`);
    }

    if (lf?.closingPatterns?.length > 0) {
      sections.push(`\nCLOSING PATTERNS (use one):\n${lf.closingPatterns.slice(0, 3).map(p => `  - "${p}"`).join('\n')}`);
    }

    // Narrative structure
    if (normalized.narrativeStructure) {
      const ns = normalized.narrativeStructure;
      sections.push(`\nNARRATIVE STYLE:`);
      if (ns.storyArcPattern) sections.push(`  Story Arc: ${ns.storyArcPattern}`);
      if (ns.informationFlow) sections.push(`  Info Flow: ${ns.informationFlow}`);
    }

    // Emotional dynamics
    if (normalized.emotionalDynamics) {
      const ed = normalized.emotionalDynamics;
      if (ed.energyCurve?.length > 0) {
        sections.push(`\nEMOTIONAL PROGRESSION:\n${ed.energyCurve.map((beat, i) => `  Section ${i + 1}: ${beat}`).join('\n')}`);
      }
      if (ed.passionTriggers?.length > 0) {
        sections.push(`  Elevate energy for: ${ed.passionTriggers.join(', ')}`);
      }
    }

    // Engagement
    if (normalized.engagementTechniques) {
      const et = normalized.engagementTechniques;
      if (et.questionStrategy) sections.push(`\nQuestion Strategy: ${et.questionStrategy}`);
      if (et.ctaStyle) sections.push(`CTA Style: ${et.ctaStyle}`);
      if (et.communityLanguage?.length > 0) sections.push(`Community Language: ${et.communityLanguage.join(', ')}`);
    }

    // Technical specs
    if (normalized.technicalPatterns) {
      const tp = normalized.technicalPatterns;
      sections.push(`\nTECHNICAL SPECS:`);
      if (tp.avgWordsPerSentence) sections.push(`  Avg sentence length: ~${tp.avgWordsPerSentence} words`);
      if (tp.vocabularyComplexity) sections.push(`  Vocabulary: ${tp.vocabularyComplexity}`);
    }

    // Pacing
    if (normalized.pacingDynamics) {
      const pd = normalized.pacingDynamics;
      if (pd.speedVariations?.length > 0) sections.push(`\nPacing Variations: ${pd.speedVariations.join(' → ')}`);
      if (pd.emphasisTechniques?.length > 0) sections.push(`Emphasis: ${pd.emphasisTechniques.join(', ')}`);
    }
  }

  // Dos and Don'ts
  if (normalized.dos.length > 0) {
    sections.push(`\nDO:\n${normalized.dos.slice(0, 5).map(d => `  - ${d}`).join('\n')}`);
  }
  if (normalized.donts.length > 0) {
    sections.push(`\nDON'T:\n${normalized.donts.slice(0, 5).map(d => `  - ${d}`).join('\n')}`);
  }

  // Basic characteristics fallback
  if (!hasDeepData) {
    sections.push(`\nFormality: ${normalized.formality}`);
    sections.push(`Enthusiasm: ${normalized.enthusiasm}`);
    sections.push(`Technical Level: ${normalized.technicalLevel}`);
    if (normalized.avgWordsPerSentence) {
      sections.push(`Avg sentence length: ~${normalized.avgWordsPerSentence} words`);
    }
  }

  sections.push(`\nIMPORTANT: Write in first person as this creator. Match their speaking style, vocabulary patterns, and energy level. Include their signature phrases naturally.`);

  return sections.join('\n');
}

/**
 * Base weights for voice constraint categories.
 * Higher weight = more impactful on script quality.
 */
const CATEGORY_WEIGHTS = {
  hooks: 1.0,
  openings: 0.9,
  transitions: 0.8,
  emotional: 0.7,
  closings: 0.6,
  pacing: 0.5,
  engagement: 0.5,
  narrative: 0.4,
  technical: 0.3,
};

/**
 * Build a performance-weighted voice injection that selects the top 5
 * highest-impact constraints instead of dumping all data as soft suggestions.
 *
 * @param {Object} profile - Raw or normalized voice profile
 * @param {string} channelName - Channel name for context
 * @returns {{ weighted: string, full: string, constraints: Array }}
 */
export function buildPerformanceWeightedInjection(profile, channelName = '') {
  const normalized = profile?.metadata?.normalizedAt ? profile : normalizeVoiceProfile(profile);
  if (!normalized) {
    return { weighted: '', full: '', constraints: [] };
  }

  const performance = normalized.performance;
  const lf = normalized.linguisticFingerprints || {};

  // Build flat constraint array
  const constraints = [];

  const addConstraint = (category, instruction, reason) => {
    if (!instruction) return;
    let weight = CATEGORY_WEIGHTS[category] || 0.3;

    // Boost weight for categories that correlate with high performance
    if (performance?.patterns?.[category]?.performanceImpact === 'positive') {
      weight *= 1.3;
    }

    constraints.push({ category, weight, instruction, reason });
  };

  // Hooks
  if (normalized.hooks) {
    addConstraint('hooks', `Open with a hook style: ${normalized.hooks}`, 'correlated with high-performing videos');
  }

  // Openings
  if (lf.openingPatterns?.length > 0) {
    addConstraint('openings', `Use one of these opening patterns: "${lf.openingPatterns[0]}"`, 'correlated with high-performing videos');
  } else if (normalized.greetings?.length > 0) {
    addConstraint('openings', `Start with this greeting style: "${normalized.greetings[0]}"`, 'correlated with high-performing videos');
  }

  // Transitions
  if (lf.transitionPhrases?.length > 0) {
    addConstraint('transitions', `Use these transition phrases between sections: ${lf.transitionPhrases.slice(0, 3).map(p => `"${p}"`).join(', ')}`, 'correlated with high-performing videos');
  }

  // Emotional dynamics
  if (normalized.emotionalDynamics?.energyCurve?.length > 0) {
    const curve = normalized.emotionalDynamics.energyCurve;
    addConstraint('emotional', `Follow this emotional progression: ${curve.join(' → ')}`, 'correlated with high-performing videos');
  } else if (normalized.emotionalDynamics?.passionTriggers?.length > 0) {
    addConstraint('emotional', `Elevate energy when discussing: ${normalized.emotionalDynamics.passionTriggers.join(', ')}`, 'correlated with high-performing videos');
  }

  // Closings
  if (lf.closingPatterns?.length > 0) {
    addConstraint('closings', `End with this closing style: "${lf.closingPatterns[0]}"`, 'correlated with high-performing videos');
  }

  // Pacing
  if (normalized.pacingDynamics?.speedVariations?.length > 0) {
    addConstraint('pacing', `Vary pacing: ${normalized.pacingDynamics.speedVariations.join(' → ')}`, 'correlated with high-performing videos');
  }

  // Engagement
  if (normalized.engagementTechniques?.questionStrategy) {
    addConstraint('engagement', `Use this question strategy: ${normalized.engagementTechniques.questionStrategy}`, 'correlated with high-performing videos');
  }

  // Narrative
  if (normalized.narrativeStructure?.storyArcPattern) {
    addConstraint('narrative', `Structure content as: ${normalized.narrativeStructure.storyArcPattern}`, 'correlated with high-performing videos');
  }

  // Technical
  if (normalized.technicalPatterns?.avgWordsPerSentence) {
    addConstraint('technical', `Keep sentences around ${normalized.technicalPatterns.avgWordsPerSentence} words`, 'correlated with high-performing videos');
  }

  // Signature phrases (always high value)
  if (normalized.signature_phrases?.length > 0) {
    addConstraint('hooks', `Naturally include these signature phrases: ${normalized.signature_phrases.slice(0, 3).map(p => `"${p}"`).join(', ')}`, 'defines creator identity');
  }

  // Sort by weight descending, take top 5
  constraints.sort((a, b) => b.weight - a.weight);
  const top5 = constraints.slice(0, 5);

  const weighted = top5
    .map(c => `You MUST ${c.instruction}. [REASON: ${c.reason}]`)
    .join('\n');

  const full = buildVoicePromptInjection(profile, channelName);

  return { weighted, full, constraints };
}
