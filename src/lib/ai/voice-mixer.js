// Voice Profile Mixer
// Combines multiple voice profiles with weighted averaging

export async function mixVoiceProfiles(voiceProfiles, weights) {
  if (!voiceProfiles || voiceProfiles.length === 0) {
    return generateDefaultVoiceProfile();
  }

  // Filter out empty profiles
  const validProfiles = voiceProfiles.filter(profile => 
    profile && Object.keys(profile).length > 0
  );

  if (validProfiles.length === 0) {
    return generateDefaultVoiceProfile();
  }

  if (validProfiles.length === 1) {
    return validProfiles[0];
  }

  // Initialize combined profile
  const combinedProfile = {
    tone: [],
    style: [],
    vocabulary: [],
    personality_traits: [],
    speaking_pace: 'medium',
    energy_level: 'medium',
    formality: 'casual-professional',
    humor_level: 'moderate',
    characteristics: {}
  };

  // Combine each profile with weights
  validProfiles.forEach((profile, index) => {
    const weight = weights ? Object.values(weights)[index] : (1 / validProfiles.length);

    // Combine tone
    if (profile.tone) {
      const tones = Array.isArray(profile.tone) ? profile.tone : [profile.tone];
      combinedProfile.tone.push(...tones.map(t => ({ value: t, weight })));
    }

    // Combine style
    if (profile.style) {
      const styles = Array.isArray(profile.style) ? profile.style : [profile.style];
      combinedProfile.style.push(...styles.map(s => ({ value: s, weight })));
    }

    // Combine vocabulary
    if (profile.vocabulary) {
      const vocab = Array.isArray(profile.vocabulary) ? profile.vocabulary : [profile.vocabulary];
      combinedProfile.vocabulary.push(...vocab);
    }

    // Combine personality traits
    if (profile.personality_traits) {
      const traits = Array.isArray(profile.personality_traits) ? profile.personality_traits : [profile.personality_traits];
      combinedProfile.personality_traits.push(...traits.map(t => ({ value: t, weight })));
    }

    // Weighted characteristics
    if (profile.characteristics) {
      Object.entries(profile.characteristics).forEach(([key, value]) => {
        if (!combinedProfile.characteristics[key]) {
          combinedProfile.characteristics[key] = 0;
        }
        const numValue = typeof value === 'number' ? value : parseCharacteristicValue(value);
        combinedProfile.characteristics[key] += numValue * weight;
      });
    }
  });

  // Process combined values
  combinedProfile.tone = selectTopWeighted(combinedProfile.tone, 3);
  combinedProfile.style = selectTopWeighted(combinedProfile.style, 3);
  combinedProfile.personality_traits = selectTopWeighted(combinedProfile.personality_traits, 5);
  
  // Remove duplicates from vocabulary
  combinedProfile.vocabulary = [...new Set(combinedProfile.vocabulary)].slice(0, 20);

  // Normalize characteristics to 0-100 scale
  Object.keys(combinedProfile.characteristics).forEach(key => {
    combinedProfile.characteristics[key] = Math.round(
      Math.min(100, Math.max(0, combinedProfile.characteristics[key]))
    );
  });

  // Generate summary description
  combinedProfile.description = generateVoiceDescription(combinedProfile);

  return combinedProfile;
}

function selectTopWeighted(items, maxCount) {
  if (!items || items.length === 0) return [];

  // Group by value and sum weights
  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.value]) {
      grouped[item.value] = 0;
    }
    grouped[item.value] += item.weight;
  });

  // Sort by weight and select top items
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCount)
    .map(([value]) => value);
}

function parseCharacteristicValue(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num)) return num;
    
    // Map descriptive values to numbers
    const mappings = {
      'very low': 10,
      'low': 30,
      'medium': 50,
      'high': 70,
      'very high': 90
    };
    return mappings[value.toLowerCase()] || 50;
  }
  return 50; // Default middle value
}

function generateVoiceDescription(profile) {
  const toneStr = profile.tone.join(', ');
  const styleStr = profile.style.join(', ');
  const traitsStr = profile.personality_traits.slice(0, 3).join(', ');
  
  return `A unique voice that blends ${toneStr} tones with ${styleStr} style. ` +
    `Key personality traits include being ${traitsStr}. ` +
    `This creates a distinctive presence that stands out while maintaining broad appeal.`;
}

function generateDefaultVoiceProfile() {
  return {
    tone: ['friendly', 'informative', 'engaging'],
    style: ['conversational', 'clear', 'dynamic'],
    vocabulary: ['accessible', 'varied', 'topic-appropriate'],
    personality_traits: ['authentic', 'knowledgeable', 'approachable', 'enthusiastic'],
    speaking_pace: 'medium',
    energy_level: 'medium-high',
    formality: 'casual-professional',
    humor_level: 'moderate',
    characteristics: {
      enthusiasm: 70,
      clarity: 80,
      authenticity: 85,
      expertise: 75,
      relatability: 80,
      entertainment: 65,
      education: 75
    },
    description: 'A balanced voice profile suitable for a wide range of content and audiences.'
  };
}

export function analyzeVoiceCompatibility(profiles) {
  if (!profiles || profiles.length < 2) {
    return { compatibility: 100, notes: [] };
  }

  const notes = [];
  let compatibilityScore = 100;

  // Check tone compatibility
  const allTones = profiles.flatMap(p => p.tone || []);
  const uniqueTones = [...new Set(allTones)];
  
  if (uniqueTones.length > allTones.length * 0.7) {
    compatibilityScore -= 10;
    notes.push('Diverse tones may require careful blending');
  }

  // Check formality mismatch
  const formalityLevels = profiles.map(p => p.formality || 'medium');
  if (new Set(formalityLevels).size > 1) {
    const hasCasual = formalityLevels.some(f => f.includes('casual'));
    const hasFormal = formalityLevels.some(f => f.includes('formal'));
    if (hasCasual && hasFormal) {
      compatibilityScore -= 15;
      notes.push('Mix of casual and formal styles needs balancing');
    }
  }

  // Check energy level compatibility
  const energyLevels = profiles.map(p => p.energy_level || 'medium');
  const hasLow = energyLevels.some(e => e.includes('low'));
  const hasHigh = energyLevels.some(e => e.includes('high'));
  if (hasLow && hasHigh) {
    compatibilityScore -= 10;
    notes.push('Varying energy levels create dynamic range');
  }

  // Add positive notes
  if (compatibilityScore > 80) {
    notes.push('Voice profiles blend well together');
  } else if (compatibilityScore > 60) {
    notes.push('Unique combination creates distinctive voice');
  }

  return { 
    compatibility: Math.max(0, compatibilityScore), 
    notes,
    recommendation: compatibilityScore > 70 
      ? 'Good compatibility - proceed with remix'
      : 'Consider adjusting weights to emphasize compatible elements'
  };
}