/**
 * Title Generation Prompts
 * @module lib/prompts/title-generation
 */

/**
 * Generate YouTube video titles
 * @param {Object} params - Title parameters
 * @param {string} params.topic - Video topic
 * @param {string} params.description - Brief description of video content
 * @param {string} [params.style] - Title style (clickbait, educational, how-to, listicle)
 * @param {Array<string>} [params.keywords] - Keywords to potentially include
 * @param {number} [params.count=5] - Number of titles to generate
 * @returns {Object} Prompt configuration
 */
export function generateTitlesPrompt(params) {
  const {
    topic,
    description,
    style = 'engaging',
    keywords = [],
    count = 5
  } = params;

  const systemPrompt = `You are an expert YouTube title creator who understands how to craft titles that maximize click-through rates while accurately representing video content. You know the balance between intrigue and clarity.`;

  const userPrompt = `Generate ${count} compelling YouTube video titles for a video about "${topic}".

**Video Description**: ${description}
**Style**: ${style}
${keywords.length > 0 ? `**Keywords to consider**: ${keywords.join(', ')}` : ''}

**Title Requirements**:
- Maximum 60 characters (ideal for YouTube)
- Include power words that drive clicks
- Create curiosity or promise value
- Be honest and accurately represent the content
- Use numbers when appropriate
- Consider SEO without sacrificing engagement

**Format each title with**:
1. The title itself
2. Character count
3. Primary emotion/hook (curiosity, urgency, value, etc.)
4. SEO score (1-10)
5. Brief explanation of why it works

Provide variety in approach - some focusing on benefits, others on curiosity, how-to format, etc.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.9,
    maxTokens: 1000
  };
}

/**
 * Optimize an existing title
 * @param {Object} params - Optimization parameters
 * @param {string} params.currentTitle - Current title to optimize
 * @param {string} params.goal - Optimization goal (clicks, SEO, clarity)
 * @param {Object} [params.analytics] - Current performance data
 * @returns {Object} Prompt configuration
 */
export function optimizeTitlePrompt(params) {
  const { currentTitle, goal, analytics = {} } = params;

  const systemPrompt = `You are a YouTube optimization expert who improves video titles based on performance data and best practices.`;

  const userPrompt = `Optimize this YouTube video title for ${goal}:

**Current Title**: "${currentTitle}"
${analytics.ctr ? `**Current CTR**: ${analytics.ctr}%` : ''}
${analytics.impressions ? `**Impressions**: ${analytics.impressions}` : ''}

Provide:
1. 3-5 optimized variations
2. Specific changes made and why
3. Predicted impact on ${goal}
4. A/B testing recommendations

Consider:
- Character length optimization
- Power word usage
- Emotional triggers
- SEO keywords
- Clarity vs curiosity balance`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    maxTokens: 800
  };
}

/**
 * Generate A/B test title variations
 * @param {Object} params - A/B test parameters
 * @param {string} params.baseTitle - Base title to create variations from
 * @param {string} params.topic - Video topic
 * @param {Array<string>} params.testElements - Elements to test (emotion, length, keywords)
 * @returns {Object} Prompt configuration
 */
export function generateTitleABTestPrompt(params) {
  const { baseTitle, topic, testElements = ['emotion', 'length', 'format'] } = params;

  const systemPrompt = `You are a data-driven YouTube strategist who creates systematic A/B tests for video titles.`;

  const userPrompt = `Create A/B test variations for this YouTube title: "${baseTitle}"

**Topic**: ${topic}
**Test Elements**: ${testElements.join(', ')}

For each test element, create 2-3 variations that:
- Change only the specific element being tested
- Maintain the core message
- Are significantly different enough to test

Format:
**Test 1: [Element Name]**
- Control: [Original or baseline]
- Variant A: [Variation] - [What changed]
- Variant B: [Variation] - [What changed]
- Hypothesis: [What you expect to learn]

Include testing recommendations and success metrics.`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    maxTokens: 1000
  };
}

/**
 * Generate trending title formats
 * @param {Object} params - Trending parameters
 * @param {string} params.topic - Video topic
 * @param {string} params.niche - YouTube niche/category
 * @param {Array<Object>} [params.competitors] - Competitor titles and performance
 * @returns {Object} Prompt configuration
 */
export function generateTrendingTitlesPrompt(params) {
  const { topic, niche, competitors = [] } = params;

  const systemPrompt = `You are a YouTube trends analyst who identifies and adapts successful title formats while maintaining originality.`;

  const userPrompt = `Generate YouTube titles using current trending formats for "${topic}" in the ${niche} niche.

${competitors.length > 0 ? `**Successful Competitor Titles**:\n${competitors.map(c => `- "${c.title}" (${c.views} views)`).join('\n')}` : ''}

Create titles that:
1. Use proven high-performing formats
2. Include trending patterns (e.g., "X Thing I Wish I Knew", "Why X is Actually Y")
3. Maintain authenticity and avoid direct copying
4. Appeal to algorithm and audience

Provide:
- 5 trending format titles
- The format pattern used
- Why this format is currently effective
- Customization tips for the topic`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    maxTokens: 1000
  };
}

/**
 * Generate locale-specific titles
 * @param {Object} params - Locale parameters
 * @param {string} params.topic - Video topic
 * @param {string} params.baseTitle - Original title
 * @param {Array<string>} params.locales - Target locales/languages
 * @returns {Object} Prompt configuration
 */
export function generateLocaleTitlesPrompt(params) {
  const { topic, baseTitle, locales } = params;

  const systemPrompt = `You are a multilingual YouTube content strategist who adapts titles for different markets while maintaining cultural relevance and appeal.`;

  const userPrompt = `Adapt this YouTube title for different locales: "${baseTitle}"

**Topic**: ${topic}
**Target Locales**: ${locales.join(', ')}

For each locale, provide:
1. Translated/adapted title
2. Cultural considerations made
3. Local search terms incorporated
4. Character count
5. Why this adaptation works for the market

Ensure titles are:
- Culturally appropriate
- Using local idioms/expressions where effective
- Optimized for local YouTube search
- Maintaining the original's appeal`;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    maxTokens: 1200
  };
}