/**
 * Hook Generation Prompts
 * @module lib/prompts/hook-generation
 */

/**
 * Generate video hooks
 * @param {Object} params - Hook parameters
 * @param {string} params.topic - Video topic
 * @param {string} params.videoTitle - Video title
 * @param {string} [params.style] - Hook style (question, story, statistic, preview)
 * @param {number} [params.duration=15] - Hook duration in seconds
 * @param {string} [params.emotion] - Target emotion (curiosity, shock, excitement)
 * @returns {Object} Prompt configuration
 */
export function generateHooksPrompt(params) {
  const {
    topic,
    videoTitle,
    style = 'mixed',
    duration = 15,
    emotion = 'curiosity'
  } = params;

  const systemPrompt = `You are a master of creating YouTube video hooks that stop viewers from scrolling and compel them to watch. You understand the psychology of attention and how to leverage it in the first crucial seconds.`;

  const userPrompt = `Create 5 powerful hooks for a YouTube video titled "${videoTitle}" about ${topic}.

**Requirements**:
- Duration: ${duration} seconds when spoken
- Style preference: ${style}
- Target emotion: ${emotion}

**Hook Types to Include**:
1. Question Hook - Pose an intriguing question
2. Statistic/Fact Hook - Share surprising information
3. Story Hook - Begin with a compelling narrative
4. Preview Hook - Tease the value they'll get
5. Challenge/Contradiction Hook - Challenge common beliefs

**For each hook provide**:
- The hook script (word-for-word)
- Hook type used
- Estimated speaking duration
- Visual suggestion for first 3 seconds
- Why this hook works psychologically

Remember:
- First 3 seconds are most critical
- Use pattern interrupts
- Create an open loop that needs closing
- Be authentic while being engaging`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.9,
    maxTokens: 1500
  };
}

/**
 * Generate hook variations for A/B testing
 * @param {Object} params - A/B test parameters
 * @param {string} params.topic - Video topic
 * @param {string} params.originalHook - Current hook to improve
 * @param {Array<string>} params.testVariables - Variables to test
 * @returns {Object} Prompt configuration
 */
export function generateHookABTestPrompt(params) {
  const {
    topic,
    originalHook,
    testVariables = ['opening_line', 'emotion', 'pacing']
  } = params;

  const systemPrompt = `You are a data-driven content strategist who creates systematic A/B tests for video hooks to maximize retention.`;

  const userPrompt = `Create A/B test variations for this video hook:

**Original Hook**: "${originalHook}"
**Topic**: ${topic}
**Test Variables**: ${testVariables.join(', ')}

For each variable, create 2-3 variations that:
- Isolate a single change
- Are meaningfully different
- Can be measured for effectiveness

Format:
**Test 1: [Variable Name]**
- Control: [Original version]
- Variant A: [New version] 
  - Change: [What specifically changed]
  - Hypothesis: [Expected impact]
- Variant B: [New version]
  - Change: [What specifically changed]
  - Hypothesis: [Expected impact]

Include:
- Success metrics to track
- Recommended test duration
- Analysis framework`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    maxTokens: 1200
  };
}

/**
 * Generate pattern interrupt hooks
 * @param {Object} params - Pattern interrupt parameters
 * @param {string} params.topic - Video topic
 * @param {string} params.expectedStart - What viewers expect
 * @param {string} [params.targetAudience] - Specific audience
 * @returns {Object} Prompt configuration
 */
export function generatePatternInterruptHooksPrompt(params) {
  const {
    topic,
    expectedStart,
    targetAudience = 'general'
  } = params;

  const systemPrompt = `You are an expert at creating pattern interrupts - unexpected openings that break viewer expectations and demand attention.`;

  const userPrompt = `Create pattern interrupt hooks for a video about "${topic}".

**What viewers expect**: ${expectedStart}
**Target audience**: ${targetAudience}

Generate 5 hooks that:
1. Completely subvert expectations
2. Create immediate cognitive dissonance
3. Force viewers to keep watching for resolution
4. Are relevant to the actual content

**Types to include**:
- Contradictory statement
- Unexpected visual/audio cue description
- Breaking the fourth wall
- Starting in the middle of action
- Reverse psychology

For each hook:
- Script (including any special directions)
- How it breaks the pattern
- The psychological mechanism at work
- Transition to main content

Remember: The surprise must lead naturally into valuable content, not just be shocking for shock's sake.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.9,
    maxTokens: 1300
  };
}

/**
 * Generate story-based hooks
 * @param {Object} params - Story hook parameters
 * @param {string} params.topic - Video topic
 * @param {string} params.message - Core message of video
 * @param {boolean} [params.personal=false] - Use personal story
 * @returns {Object} Prompt configuration
 */
export function generateStoryHooksPrompt(params) {
  const {
    topic,
    message,
    personal = false
  } = params;

  const systemPrompt = `You are a master storyteller who crafts compelling narrative hooks that draw viewers into YouTube videos through the power of story.`;

  const userPrompt = `Create story-based hooks for a video about "${topic}" with the message: ${message}.

**Story Type**: ${personal ? 'Personal/first-person' : 'Third-person or allegorical'}

Generate 4 different story hooks that:
1. Start in the middle of action or tension
2. Create immediate emotional investment
3. Relate directly to the video's topic
4. Can be told in 15-20 seconds

**Story Techniques to Use**:
1. In medias res (middle of action)
2. Emotional moment
3. Moment of realization/failure
4. Unexpected outcome

For each hook provide:
- The story hook (exact script)
- Emotion it evokes
- How it connects to the main topic
- Visual elements needed
- Transition line to main content

Make stories:
- Specific and visual
- Emotionally resonant
- Relevant to viewer's life
- Incomplete (requiring video to resolve)`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.85,
    maxTokens: 1400
  };
}

/**
 * Generate curiosity gap hooks
 * @param {Object} params - Curiosity gap parameters
 * @param {string} params.topic - Video topic
 * @param {string} params.revelation - What will be revealed
 * @param {Array<string>} [params.misconceptions] - Common misconceptions
 * @returns {Object} Prompt configuration
 */
export function generateCuriosityGapHooksPrompt(params) {
  const {
    topic,
    revelation,
    misconceptions = []
  } = params;

  const systemPrompt = `You are an expert at creating curiosity gaps - the space between what viewers know and what they want to know - that compel continued viewing.`;

  const userPrompt = `Create curiosity gap hooks for a video about "${topic}" that will reveal: ${revelation}.

${misconceptions.length > 0 ? `**Common Misconceptions**:\n${misconceptions.map((m, i) => `${i + 1}. ${m}`).join('\n')}` : ''}

Generate 5 hooks that:
1. Identify what viewers think they know
2. Hint at surprising information
3. Create urgency to learn more
4. Don't give away the answer

**Curiosity Techniques**:
- "Most people think X, but..."
- "What if I told you..."
- "The real reason why..."
- "X is not what you think"
- "The hidden truth about..."

For each hook:
- The hook script
- The knowledge gap created
- Psychological trigger used
- Level of curiosity (1-10)
- Why viewers can't skip

Balance between:
- Being specific enough to be credible
- Being vague enough to maintain mystery
- Creating genuine value expectation`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    maxTokens: 1300
  };
}