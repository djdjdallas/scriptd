/**
 * Transform the detailed voice analysis into a clean, actionable voice profile
 */
export function transformVoiceProfile(rawVoiceProfile) {
  if (!rawVoiceProfile) return null;

  // Extract key components from the raw profile
  const basic = rawVoiceProfile.basic || {};
  const advanced = rawVoiceProfile.advanced || {};
  const personality = rawVoiceProfile.personality || {};
  const creatorPatterns = rawVoiceProfile.creatorPatterns || {};

  // Transform into the clean structure
  const transformedProfile = {
    // Core voice characteristics
    tone: extractTones(basic, advanced, personality),
    style: extractStyles(basic, rawVoiceProfile),
    pace: rawVoiceProfile.pace || basic.pace || 'moderate',
    energy: rawVoiceProfile.energy || extractEnergy(advanced),

    // Signature elements
    signature_phrases: extractSignaturePhrases(basic, advanced),

    // Emotional dynamics
    emotional_dynamics: {
      empathy_level: basic.emotional_dynamics?.empathy_level || detectEmpathyLevel(basic),
      validation_frequency: basic.emotional_dynamics?.validation_frequency || 'frequent',
      tone_progression: basic.emotional_dynamics?.tone_progression || 'supportive → educational → empowering',
      vulnerability_pattern: detectVulnerabilityPattern(basic),
      audience_aligned_tone: detectAlignedTone(basic)
    },

    // Audience relationship
    audience_relationship: {
      addressing_style: basic.audience_relationship?.addressing_style || 'friend_to_friend',
      authority_stance: basic.audience_relationship?.authority_stance || 'knowledgeable_friend',
      relationship_type: basic.audience_relationship?.relationship_type || 'supportive_educator',
      inclusivity_level: basic.audience_relationship?.inclusivity_level || 'individual_focused'
    },

    // Content positioning
    content_positioning: {
      mission: extractMission(basic, rawVoiceProfile),
      core_values: extractCoreValues(basic, rawVoiceProfile),
      educational_focus: basic.content_positioning?.educational_focus || true,
      vulnerability_level: basic.content_positioning?.vulnerability_level || 'high'
    },

    // Linguistic fingerprints
    linguisticFingerprints: {
      topicKeywords: extractTopicKeywords(basic),
      catchphrases: basic.catchphrases || [],
      transitionPhrases: basic.transitionPhrases || [],
      questionPatterns: basic.questionPatterns || []
    },

    // Performance metrics (for reference)
    performance: {
      speakingPace: advanced?.fingerprint?.metrics?.speakingPace || 150,
      avgSentenceLength: advanced?.fingerprint?.metrics?.avgSentenceLength || 11,
      vocabularyComplexity: advanced?.quality?.vocabularyDiversity?.level || 'accessible',
      fillerUsage: advanced?.quality?.fillerWordUsage?.level || 'low'
    }
  };

  return transformedProfile;
}

// Helper functions to extract specific elements
function extractTones(basic, advanced, personality) {
  const tones = [];

  // Extract from emotional dynamics
  if (basic.emotional_dynamics?.empathy_level === 'high') {
    tones.push('empathetic');
  }
  if (basic.content_positioning?.educational_focus) {
    tones.push('educational');
  }
  if (basic.content_positioning?.vulnerability_level === 'high') {
    tones.push('vulnerable');
  }

  // Extract from personality
  if (personality?.emotionalRange?.dominant === 'happiness') {
    tones.push('supportive');
  }

  // Default tones if none found
  if (tones.length === 0) {
    tones.push('balanced', 'educational', 'supportive');
  }

  return tones;
}

function extractStyles(basic, rawProfile) {
  const styles = [];

  if (basic.content_positioning?.trauma_informed) {
    styles.push('trauma-informed');
  }
  if (basic.content_positioning?.mission_driven) {
    styles.push('mission-driven');
  }
  if (basic.audience_relationship?.personal_story_frequency === 'occasional') {
    styles.push('personal');
  }
  if (basic.technicalLevel === 'non-technical') {
    styles.push('accessible');
  }

  // Default styles if none found
  if (styles.length === 0) {
    styles.push('educational', 'supportive', 'accessible');
  }

  return styles;
}

function extractEnergy(advanced) {
  const energyLevel = advanced?.prosody?.energyLevel?.level;

  if (energyLevel === 'low' || energyLevel === 'calm') {
    return 'calm-purposeful';
  } else if (energyLevel === 'high') {
    return 'energetic';
  }

  return 'moderate';
}

function extractSignaturePhrases(basic, advanced) {
  const phrases = [];

  // Use existing signature phrases
  if (basic.signature_phrases && Array.isArray(basic.signature_phrases)) {
    phrases.push(...basic.signature_phrases);
  }

  // Add catchphrases
  if (basic.catchphrases && Array.isArray(basic.catchphrases)) {
    phrases.push(...basic.catchphrases.slice(0, 4));
  }

  // Use fingerprint phrases if available
  if (advanced?.fingerprint?.signaturePhrases) {
    const fpPhrases = advanced.fingerprint.signaturePhrases
      .slice(0, 4)
      .map(p => p.phrase);
    phrases.push(...fpPhrases);
  }

  // Remove duplicates
  return [...new Set(phrases)].slice(0, 8);
}

function detectEmpathyLevel(basic) {
  const empLevel = basic.emotional_dynamics?.empathy_level;
  if (empLevel) return empLevel;

  // Detect from other indicators
  if (basic.content_positioning?.trauma_informed) {
    return 'very_high';
  }

  return 'high';
}

function detectVulnerabilityPattern(basic) {
  const vulnLevel = basic.content_positioning?.vulnerability_level;

  if (vulnLevel === 'high') {
    return 'shares struggles authentically';
  } else if (vulnLevel === 'moderate') {
    return 'occasional personal insights';
  }

  return 'professional boundaries maintained';
}

function detectAlignedTone(basic) {
  const empathy = basic.emotional_dynamics?.empathy_level;
  const vulnerability = basic.content_positioning?.vulnerability_level;

  if (empathy === 'high' && vulnerability === 'high') {
    return 'vulnerable_empathetic';
  } else if (empathy === 'high') {
    return 'supportive_understanding';
  }

  return 'educational_supportive';
}

function extractMission(basic, rawProfile) {
  if (basic.content_positioning?.mission_driven) {
    // For Kee's channel specifically
    return 'help_overcome_hardships_through_psychology';
  }

  return 'educate_and_support_audience';
}

function extractCoreValues(basic, rawProfile) {
  const values = [];

  if (basic.content_positioning?.trauma_informed) {
    values.push('healing');
  }
  if (basic.emotional_dynamics?.empathy_level === 'high') {
    values.push('empathy');
  }
  if (basic.content_positioning?.educational_focus) {
    values.push('education');
  }
  values.push('self-awareness', 'emotional intelligence');

  return values.slice(0, 5);
}

function extractTopicKeywords(basic) {
  const keywords = [];

  // Extract from top words
  if (basic.topWords && Array.isArray(basic.topWords)) {
    const relevantWords = basic.topWords
      .filter(w => w.word.length > 4 && !['their', 'about', 'every', 'without'].includes(w.word))
      .slice(0, 5)
      .map(w => w.word);
    keywords.push(...relevantWords);
  }

  // Add known psychology keywords
  if (keywords.includes('emotional') || keywords.includes('psychology')) {
    keywords.push('psychology', 'trauma', 'childhood', 'healing');
  }

  return [...new Set(keywords)].slice(0, 8);
}

/**
 * Get a summary description of the voice profile
 */
export function getVoiceProfileSummary(profile) {
  if (!profile) return 'No voice profile available';

  const tone = Array.isArray(profile.tone) ? profile.tone.join(', ') : profile.tone;
  const style = Array.isArray(profile.style) ? profile.style.join(', ') : profile.style;

  return `${tone} tone with ${style} style at ${profile.pace} pace with ${profile.energy} energy`;
}