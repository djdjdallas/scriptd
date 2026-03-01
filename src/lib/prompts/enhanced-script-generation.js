export function generateEnhancedScriptPrompt(config) {
  const { topic, channel, voiceProfile, tier, features } = config;
  
  // Extract deep patterns from enhanced voice profile
  const linguisticPatterns = voiceProfile.linguisticFingerprints || {};
  const narrativeStructure = voiceProfile.narrativeStructure || {};
  const emotionalDynamics = voiceProfile.emotionalDynamics || {};
  const engagementTechniques = voiceProfile.engagementTechniques || {};
  const pacingDynamics = voiceProfile.pacingDynamics || {};
  
  const prompt = `Create a YouTube script that authentically replicates this channel's voice using their specific linguistic patterns.

TOPIC: ${topic}
CHANNEL: ${channel.name}

MANDATORY VOICE IMPLEMENTATION:

1. OPENING (Use EXACTLY one of these patterns):
${linguisticPatterns.openingPatterns?.map(p => `   - "${p}"`).join('\n') || '   - Natural conversational opening'}

2. NARRATIVE STRUCTURE:
- Story Arc: ${narrativeStructure.storyArcPattern || 'Build progressively'}
- Information Flow: ${narrativeStructure.informationFlow || 'Sequential revelation'}
- Hook Placement: ${narrativeStructure.hookPlacement?.join(', ') || 'Beginning and transitions'}
- Example Style: ${narrativeStructure.exampleStyle || 'Illustrative'}

3. EMOTIONAL PROGRESSION:
Follow this exact emotional curve through the script:
${emotionalDynamics.energyCurve?.map((beat, i) => `   Section ${i+1}: ${beat}`).join('\n') || '   Maintain steady energy'}

Passion Triggers (elevate energy for these): ${emotionalDynamics.passionTriggers?.join(', ') || 'Key revelations'}

4. LINGUISTIC REQUIREMENTS:
- Must use these transition phrases between sections:
  ${linguisticPatterns.transitionPhrases?.map(p => `"${p}"`).join(', ') || 'Natural transitions'}
  
- Include these signature phrases naturally (at least 3 times total):
  ${linguisticPatterns.signaturePhrases?.map(p => `"${p}"`).join(', ') || 'No specific phrases'}
  
- Filler word usage: ${JSON.stringify(linguisticPatterns.fillerWords || {})}

5. TECHNICAL SPECIFICATIONS:
- Average sentence length: ${voiceProfile.technicalPatterns?.avgWordsPerSentence || 15} words
- Vocabulary complexity: ${voiceProfile.technicalPatterns?.vocabularyComplexity || 'Moderate'}
- Jargon usage: ${JSON.stringify(voiceProfile.technicalPatterns?.jargonUsage || {})}

6. ENGAGEMENT PATTERNS:
- Direct address frequency: ${engagementTechniques.directAddressFrequency || 0.2} (use "you" this often)
- Pronoun distribution: ${JSON.stringify(engagementTechniques.pronounUsage || {})}
- Question strategy: ${engagementTechniques.questionStrategy || 'Occasional rhetorical'}
- Community language: Include these phrases: ${engagementTechniques.communityLanguage?.join(', ') || 'None'}

7. PACING DYNAMICS:
- Speed variations: ${pacingDynamics.speedVariations?.join(' → ') || 'Consistent'}
- Pause indicators: [Insert "..." or "—" for pauses ${pacingDynamics.pausePatterns?.frequency || 'naturally'}]
- Emphasis: Use ${pacingDynamics.emphasisTechniques?.join(', ') || 'natural emphasis'}

8. CONTENT POSITIONING:
- Relationship to audience: ${voiceProfile.contentPositioning?.audienceRelationship || 'Educator'}
- Authority stance: ${voiceProfile.contentPositioning?.authorityStance || 'Knowledgeable'}
- Self-reference rate: ${voiceProfile.contentPositioning?.selfReferenceRate || 0.1} (personal examples)

9. CULTURAL REFERENCES:
- Example categories to use: ${voiceProfile.culturalReferences?.exampleCategories?.join(', ') || 'General'}
- Metaphor types: ${voiceProfile.culturalReferences?.metaphorTypes?.join(', ') || 'Common'}
- Current events style: ${voiceProfile.culturalReferences?.currentEventsStyle || 'Occasional'}

10. CLOSING PATTERN (Use EXACTLY one of these):
${linguisticPatterns.closingPatterns?.map(p => `   - "${p}"`).join('\n') || '   - Natural conclusion'}

STRUCTURAL REQUIREMENTS:
- Include pattern interrupts every ${narrativeStructure.hookPlacement?.includes('middle') ? '3-4 paragraphs' : '5-6 paragraphs'}
- ${emotionalDynamics.vulnerabilityPattern === 'frequent' ? 'Include 2-3 personal/vulnerable moments' : 'Maintain professional distance'}
- CTA placement and style: ${engagementTechniques.ctaStyle || 'End only'}

QUALITY CHECKS:
Before completing, verify:
✓ Used at least 3 signature phrases naturally
✓ Followed the emotional curve progression
✓ Maintained correct pronoun distribution
✓ Used specified opening and closing patterns
✓ Included transition phrases between major sections
✓ Matched the average sentence length within ±3 words
✓ Positioned self according to authority stance

${tier === 'premium' ? 'PREMIUM: Add detailed research, citations, and extended examples.' : ''}
${features?.factChecking ? 'Include fact-checking notes in [brackets].' : ''}

CRITICAL: Do not write a generic YouTube script. Write in THIS SPECIFIC CHANNEL'S VOICE using their exact patterns.`;

  return prompt;
}

export async function generateScript(config) {
  const { channel, topic, tier = 'balanced', features = {} } = config;
  
  // Ensure we have enhanced voice profile data
  if (!channel.voice_profile?.linguisticFingerprints) {
    console.warn('Channel missing enhanced voice profile, using basic generation');
    return generateBasicScript(config);
  }
  
  // Generate the enhanced prompt
  const enhancedPrompt = generateEnhancedScriptPrompt({
    topic,
    channel,
    voiceProfile: channel.voice_profile,
    tier,
    features
  });
  
  // Call your AI service with the enhanced prompt
  const response = await callAIService(enhancedPrompt, tier);
  
  // Post-process to verify voice compliance
  const processedScript = verifyVoiceCompliance(response, channel.voice_profile);
  
  return processedScript;
}

export function verifyVoiceCompliance(script, voiceProfile) {
  const checks = {
    signaturePhrases: checkSignaturePhrases(script, voiceProfile),
    sentenceLength: checkSentenceLength(script, voiceProfile),
    pronounUsage: checkPronounDistribution(script, voiceProfile),
    transitions: checkTransitionUsage(script, voiceProfile)
  };

  // Return script with metadata about compliance
  return {
    content: script,
    voiceCompliance: checks,
    overallScore: calculateComplianceScore(checks)
  };
}

export function checkSignaturePhrases(script, voiceProfile) {
  const phrases = voiceProfile.linguisticFingerprints?.signaturePhrases || [];
  const found = phrases.filter(phrase => 
    script.toLowerCase().includes(phrase.toLowerCase())
  );
  return {
    required: phrases.length,
    found: found.length,
    phrases: found
  };
}

export function checkSentenceLength(script, voiceProfile) {
  const target = voiceProfile.technicalPatterns?.avgWordsPerSentence || 15;
  const sentences = script.split(/[.!?]+/);
  const avgLength = sentences.reduce((sum, s) => 
    sum + s.trim().split(/\s+/).length, 0) / sentences.length;
  
  return {
    target,
    actual: Math.round(avgLength),
    deviation: Math.abs(avgLength - target)
  };
}

export function checkPronounDistribution(script, voiceProfile) {
  const target = voiceProfile.engagementTechniques?.pronounUsage || {};
  const words = script.toLowerCase().split(/\s+/);
  const counts = {
    you: words.filter(w => w === 'you' || w === 'your').length,
    we: words.filter(w => w === 'we' || w === 'our').length,
    i: words.filter(w => w === 'i' || w === 'my').length
  };
  
  const total = counts.you + counts.we + counts.i;
  const actual = {
    you: Math.round((counts.you / total) * 100),
    we: Math.round((counts.we / total) * 100),
    i: Math.round((counts.i / total) * 100)
  };
  
  return {
    target,
    actual,
    deviation: Math.abs(actual.you - (target.you || 0)) + 
               Math.abs(actual.we - (target.we || 0)) + 
               Math.abs(actual.i - (target.i || 0))
  };
}

export function checkTransitionUsage(script, voiceProfile) {
  const transitions = voiceProfile.linguisticFingerprints?.transitionPhrases || [];
  const found = transitions.filter(phrase => 
    script.toLowerCase().includes(phrase.toLowerCase())
  );
  
  return {
    expected: transitions.length,
    found: found.length,
    phrases: found
  };
}

export function calculateComplianceScore(checks) {
  const weights = {
    signaturePhrases: 0.3,
    sentenceLength: 0.2,
    pronounUsage: 0.25,
    transitions: 0.25
  };
  
  let score = 0;
  
  // Signature phrases score
  if (checks.signaturePhrases.required > 0) {
    score += weights.signaturePhrases * 
             (checks.signaturePhrases.found / checks.signaturePhrases.required);
  }
  
  // Sentence length score (within 3 words = full score)
  score += weights.sentenceLength * 
           Math.max(0, 1 - (checks.sentenceLength.deviation / 10));
  
  // Pronoun usage score (lower deviation = higher score)
  score += weights.pronounUsage * 
           Math.max(0, 1 - (checks.pronounUsage.deviation / 100));
  
  // Transition usage score
  if (checks.transitions.expected > 0) {
    score += weights.transitions * 
             (checks.transitions.found / checks.transitions.expected);
  }
  
  return Math.round(score * 100);
}

async function generateBasicScript(config) {
  // Fallback to basic script generation
  const { prompt } = await import('./script-generation.js');
  return prompt(config);
}

async function callAIService(prompt, tier) {
  // This should integrate with your actual AI service
  // For now, returning placeholder
  const { callOpenAI } = await import('../ai-service.js');
  return callOpenAI(prompt, { 
    model: tier === 'premium' ? 'gpt-4' : 'gpt-3.5-turbo',
    temperature: 0.7
  });
}