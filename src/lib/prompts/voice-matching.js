/**
 * Voice Matching Prompts
 * @module lib/prompts/voice-matching
 */

/**
 * Analyze writing style and voice
 * @param {Object} params - Analysis parameters
 * @param {string} params.sampleText - Sample text to analyze
 * @param {string} [params.contentType] - Type of content (script, blog, social)
 * @returns {Object} Prompt configuration
 */
export function analyzeVoicePrompt(params) {
  const { sampleText, contentType = 'script' } = params;

  const systemPrompt = `You are an expert linguist and writing analyst who can identify and replicate unique writing voices, styles, and patterns.`;

  const userPrompt = `Analyze this ${contentType} sample and create a comprehensive voice profile:

**Sample Text**:
${sampleText}

**Provide a detailed analysis of**:

1. **Tone & Personality**
   - Overall tone (friendly, authoritative, casual, etc.)
   - Personality traits evident in writing
   - Emotional range and expression

2. **Language Patterns**
   - Vocabulary level and word choices
   - Sentence structure and length variation
   - Use of technical vs. simple language
   - Favorite phrases or expressions

3. **Stylistic Elements**
   - Use of humor, metaphors, analogies
   - Storytelling techniques
   - Rhetorical devices
   - Pacing and rhythm

4. **Grammar & Syntax**
   - Formality level
   - Use of contractions
   - Punctuation style
   - Paragraph structure

5. **Unique Characteristics**
   - Distinctive quirks or patterns
   - Recurring themes
   - Cultural or regional influences
   - Target audience indicators

6. **Voice Replication Guidelines**
   - Key elements to maintain
   - Do's and don'ts
   - Example transformations

Format as a structured voice profile that can be used to generate content in this style.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    maxTokens: 1500
  };
}

/**
 * Match voice for content generation
 * @param {Object} params - Voice matching parameters
 * @param {string} params.voiceProfile - Voice profile or sample
 * @param {string} params.content - Content to rewrite
 * @param {string} [params.contentType] - Type of content
 * @returns {Object} Prompt configuration
 */
export function matchVoicePrompt(params) {
  const { voiceProfile, content, contentType = 'script' } = params;

  const systemPrompt = `You are an expert at adapting content to match specific writing voices and styles while maintaining the original message and information.`;

  const userPrompt = `Rewrite the following content to match this voice profile:

**Voice Profile**:
${voiceProfile}

**Original Content**:
${content}

**Requirements**:
- Maintain all factual information and key messages
- Adapt tone, style, and language patterns to match the voice
- Preserve the content structure and flow
- Make it sound naturally written by the same person

**Specific Adaptations**:
1. Adjust vocabulary to match complexity level
2. Restructure sentences to match typical patterns
3. Add characteristic phrases or expressions where appropriate
4. Match the emotional tone and energy level
5. Incorporate typical transitions and connectors

Provide:
1. The rewritten content
2. Key changes made and why
3. Voice consistency score (1-10)
4. Any challenging adaptations`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    maxTokens: Math.max(2000, content.length * 1.5)
  };
}

/**
 * Generate voice variations
 * @param {Object} params - Voice variation parameters
 * @param {string} params.baseContent - Base content
 * @param {Array<Object>} params.voiceProfiles - Different voice profiles
 * @returns {Object} Prompt configuration
 */
export function generateVoiceVariationsPrompt(params) {
  const { baseContent, voiceProfiles } = params;

  const systemPrompt = `You are a versatile writer who can adapt the same content to multiple distinct voices and styles.`;

  const profileDescriptions = voiceProfiles.map((profile, i) => 
    `**Voice ${i + 1}: ${profile.name}**\n${profile.description}`
  ).join('\n\n');

  const userPrompt = `Transform this content into ${voiceProfiles.length} different voice styles:

**Original Content**:
${baseContent}

**Voice Profiles**:
${profileDescriptions}

For each voice, provide:
1. The adapted content
2. Key stylistic changes made
3. How it maintains the original message
4. Most challenging adaptations

Ensure each version:
- Sounds authentically different
- Maintains factual accuracy
- Fits the voice naturally
- Could believably be from different creators`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    maxTokens: 2500
  };
}

/**
 * Create voice consistency guide
 * @param {Object} params - Guide parameters
 * @param {Array<string>} params.samples - Multiple samples from same creator
 * @param {string} params.creatorName - Name/identifier for creator
 * @returns {Object} Prompt configuration
 */
export function createVoiceGuidePrompt(params) {
  const { samples, creatorName } = params;

  const systemPrompt = `You are an expert at creating comprehensive style guides that ensure consistent voice across all content.`;

  const sampleTexts = samples.map((sample, i) => 
    `**Sample ${i + 1}**:\n${sample}`
  ).join('\n\n');

  const userPrompt = `Create a comprehensive voice and style guide for ${creatorName} based on these samples:

${sampleTexts}

**Create a detailed guide including**:

1. **Voice Overview**
   - One-paragraph voice summary
   - Three core personality traits
   - Target audience profile

2. **Language Guidelines**
   - Preferred vocabulary (with examples)
   - Avoided words/phrases
   - Technical vs. accessible balance
   - Jargon usage rules

3. **Sentence & Structure**
   - Typical sentence length
   - Paragraph structure
   - Transition preferences
   - Opening/closing patterns

4. **Tone Variations**
   - How tone shifts by topic
   - Emotional range boundaries
   - Humor usage and style
   - Seriousness indicators

5. **Do's and Don'ts**
   - Must-maintain elements (5)
   - Must-avoid elements (5)
   - Edge cases and exceptions

6. **Quick Reference**
   - 10-point checklist
   - Example transformations
   - Common mistakes to avoid

7. **Template Phrases**
   - Introduction templates
   - Transition phrases
   - Conclusion patterns
   - Call-to-action styles

Format as a practical guide that any writer could follow.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.4,
    maxTokens: 2000
  };
}

/**
 * Compare and blend voices
 * @param {Object} params - Blend parameters
 * @param {Array<string>} params.voices - Voice samples to blend
 * @param {Object} params.blendRatio - How much of each voice
 * @param {string} params.content - Content to write
 * @returns {Object} Prompt configuration
 */
export function blendVoicesPrompt(params) {
  const { voices, blendRatio, content } = params;

  const systemPrompt = `You are skilled at analyzing multiple writing voices and creating unique blends that combine their best elements.`;

  const voiceSamples = voices.map((voice, i) => 
    `**Voice ${i + 1} (${blendRatio[i] || 'equal'}% influence)**:\n${voice}`
  ).join('\n\n');

  const userPrompt = `Create a blended voice from these samples and apply it to new content:

${voiceSamples}

**Content to Write**:
${content}

**Blending Instructions**:
1. Identify the strongest elements from each voice
2. Create a harmonious blend based on the ratios
3. Avoid jarring style conflicts
4. Maintain coherent personality

**Provide**:
1. Blended voice profile summary
2. The content written in blended voice
3. Which elements came from which voice
4. How conflicts were resolved
5. Unique characteristics of the blend

The result should feel like a distinct, cohesive voice, not a patchwork.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.75,
    maxTokens: 1800
  };
}