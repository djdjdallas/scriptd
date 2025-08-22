/**
 * Script Generation Prompts
 * @module lib/prompts/script-generation
 */

/**
 * Generate a YouTube script
 * @param {Object} params - Script parameters
 * @param {string} params.topic - Main topic of the video
 * @param {string} params.style - Writing style (educational, entertaining, casual, professional)
 * @param {number} params.duration - Target duration in minutes
 * @param {string} [params.audience] - Target audience
 * @param {Array<string>} [params.keyPoints] - Key points to cover
 * @param {string} [params.tone] - Tone of voice
 * @param {string} [params.callToAction] - Call to action for the video
 * @returns {Object} Prompt configuration
 */
export function generateScriptPrompt(params) {
  const {
    topic,
    style,
    duration,
    audience = 'general audience',
    keyPoints = [],
    tone = 'conversational',
    callToAction = 'like and subscribe'
  } = params;

  const systemPrompt = `You are an expert YouTube script writer specializing in creating engaging, well-structured video scripts. Your scripts are known for their clear structure, engaging hooks, and natural flow that keeps viewers watching until the end.`;

  const userPrompt = `Create a YouTube video script about "${topic}" with the following requirements:

**Style**: ${style}
**Duration**: ${duration} minutes (approximately ${duration * 150} words)
**Target Audience**: ${audience}
**Tone**: ${tone}

${keyPoints.length > 0 ? `**Key Points to Cover**:\n${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}` : ''}

**Structure Required**:
1. Hook (0-15 seconds): Grab attention immediately
2. Introduction (15-30 seconds): Introduce yourself and the topic
3. Main Content: Break into clear sections with smooth transitions
4. Summary/Recap: Brief overview of key takeaways
5. Call to Action: ${callToAction}

**Guidelines**:
- Write in a natural, conversational tone as if speaking directly to the camera
- Include [VISUAL] cues for B-roll, graphics, or demonstrations
- Add [PAUSE] markers for dramatic effect or emphasis
- Use storytelling techniques to maintain engagement
- Include questions to encourage viewer interaction
- Keep sentences concise and easy to follow when spoken aloud
- Add timestamps for major sections

Please format the script with clear section headers and visual/audio cues.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    maxTokens: Math.max(2000, duration * 200)
  };
}

/**
 * Generate a script outline
 * @param {Object} params - Outline parameters
 * @param {string} params.topic - Main topic
 * @param {string} params.style - Video style
 * @param {number} params.duration - Target duration
 * @returns {Object} Prompt configuration
 */
export function generateScriptOutlinePrompt(params) {
  const { topic, style, duration } = params;

  const systemPrompt = `You are an expert at creating detailed video script outlines that serve as blueprints for engaging YouTube content.`;

  const userPrompt = `Create a detailed outline for a ${duration}-minute ${style} YouTube video about "${topic}".

Include:
1. Hook ideas (3 options)
2. Main sections with time allocations
3. Key talking points for each section
4. Transition suggestions between sections
5. Visual/B-roll suggestions
6. Potential viewer questions to address
7. Call-to-action options

Format as a structured outline with clear hierarchy.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    maxTokens: 1500
  };
}

/**
 * Improve an existing script
 * @param {Object} params - Improvement parameters
 * @param {string} params.script - Original script
 * @param {string} params.goal - Improvement goal (engagement, clarity, pacing)
 * @param {Array<string>} [params.issues] - Specific issues to address
 * @returns {Object} Prompt configuration
 */
export function improveScriptPrompt(params) {
  const { script, goal, issues = [] } = params;

  const systemPrompt = `You are an expert script editor who specializes in improving YouTube scripts for maximum viewer retention and engagement.`;

  const userPrompt = `Please improve the following YouTube script with a focus on ${goal}:

${issues.length > 0 ? `**Specific Issues to Address**:\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}\n` : ''}

**Original Script**:
${script}

**Improvement Guidelines**:
- Maintain the original message and key points
- Enhance hooks and transitions
- Improve pacing and flow
- Add engaging elements (questions, examples, analogies)
- Ensure clear and concise language
- Add visual/audio cues where beneficial
- Strengthen the call to action

Please provide the improved script with tracked changes or comments explaining major improvements.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    maxTokens: Math.max(2000, script.length * 1.5)
  };
}

/**
 * Generate script section
 * @param {Object} params - Section parameters
 * @param {string} params.section - Section name (intro, main, conclusion)
 * @param {string} params.context - Context from previous sections
 * @param {string} params.topic - Video topic
 * @param {Object} params.requirements - Section requirements
 * @returns {Object} Prompt configuration
 */
export function generateScriptSectionPrompt(params) {
  const { section, context, topic, requirements } = params;

  const sectionPrompts = {
    intro: `Write an engaging introduction for a YouTube video about "${topic}". Include:
- A powerful hook (first 15 seconds)
- Brief self-introduction
- What viewers will learn
- Why they should keep watching`,
    
    main: `Write the main content section for a YouTube video about "${topic}". Include:
- Clear explanations with examples
- Smooth transitions between points
- Engagement techniques (questions, relatable scenarios)
- Visual cues for B-roll and graphics`,
    
    conclusion: `Write a compelling conclusion for a YouTube video about "${topic}". Include:
- Quick recap of key points
- Final thoughts or takeaway message
- Clear call to action
- Thank you to viewers`
  };

  const userPrompt = `${sectionPrompts[section] || sectionPrompts.main}

${context ? `**Previous Context**:\n${context}\n` : ''}

${requirements ? `**Specific Requirements**:\n${JSON.stringify(requirements, null, 2)}` : ''}

Write in a conversational, engaging tone suitable for YouTube.`;

  return {
    messages: [
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    maxTokens: 1000
  };
}

/**
 * Generate multiple script variations
 * @param {Object} params - Variation parameters
 * @param {string} params.topic - Video topic
 * @param {number} params.count - Number of variations
 * @param {Array<string>} params.styles - Different styles to try
 * @returns {Object} Prompt configuration
 */
export function generateScriptVariationsPrompt(params) {
  const { topic, count = 3, styles } = params;

  const systemPrompt = `You are a creative YouTube script writer who can adapt your writing style to different audiences and tones.`;

  const userPrompt = `Create ${count} different script variations for a YouTube video about "${topic}".

${styles && styles.length > 0 ? `Use these styles: ${styles.join(', ')}` : 'Vary the style, tone, and approach for each version.'}

For each variation, provide:
1. Style/approach description
2. Target audience
3. Opening hook (first 30 seconds)
4. Main content structure
5. Unique angle or perspective

Make each variation distinctly different in approach while covering the same core topic.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.9,
    maxTokens: 2500
  };
}