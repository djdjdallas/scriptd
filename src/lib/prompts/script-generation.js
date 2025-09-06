export const scriptPrompts = {
  educational: {
    system: `You are an expert educational content creator. Create engaging, informative scripts that teach concepts clearly and effectively.`,
    template: (topic, duration, style) => `Create a ${duration}-minute educational script about "${topic}" in a ${style} style. Include:
- Clear introduction with learning objectives
- Step-by-step explanations
- Real-world examples
- Summary of key points
- Call to action for viewers to practice or learn more`
  },
  
  entertainment: {
    system: `You are a creative entertainment scriptwriter. Create engaging, fun scripts that captivate audiences.`,
    template: (topic, duration, style) => `Create a ${duration}-minute entertainment script about "${topic}" in a ${style} style. Include:
- Attention-grabbing hook
- Engaging storytelling
- Humor or drama as appropriate
- Interactive elements
- Strong ending with viewer engagement prompt`
  },
  
  tutorial: {
    system: `You are a technical tutorial expert. Create clear, actionable tutorial scripts that help viewers accomplish specific tasks.`,
    template: (topic, duration, style) => `Create a ${duration}-minute tutorial script for "${topic}" in a ${style} style. Include:
- Clear objectives statement
- Prerequisites or materials needed
- Step-by-step instructions
- Common mistakes to avoid
- Next steps for viewers`
  },
  
  review: {
    system: `You are an objective product/service reviewer. Create balanced, informative review scripts.`,
    template: (topic, duration, style) => `Create a ${duration}-minute review script for "${topic}" in a ${style} style. Include:
- Brief introduction and disclosure
- Key features overview
- Pros and cons analysis
- Comparison with alternatives
- Final verdict and recommendations`
  },
  
  vlog: {
    system: `You are a personable vlog scriptwriter. Create authentic, conversational scripts that connect with viewers.`,
    template: (topic, duration, style) => `Create a ${duration}-minute vlog script about "${topic}" in a ${style} style. Include:
- Personal greeting and context
- Natural storytelling flow
- Personal insights and experiences
- Viewer questions or interactions
- Warm closing with next video teaser`
  }
};

export function getScriptPrompt(type, topic, duration, style, additionalContext = '') {
  const prompt = scriptPrompts[type] || scriptPrompts.educational;
  const basePrompt = prompt.template(topic, duration, style);
  
  return additionalContext 
    ? `${basePrompt}\n\nAdditional context: ${additionalContext}`
    : basePrompt;
}

export function getSystemPrompt(type) {
  const prompt = scriptPrompts[type] || scriptPrompts.educational;
  return prompt.system;
}

// Improved YouTube Script Generation with Web Search Requirements
export function generateScript(options) {
  const {
    title,
    type = 'educational',
    length = 10,
    tone = 'professional',
    targetAudience = 'general',
    keyPoints = [],
    channelContext = '',
    voiceProfile = null
  } = options;

  // Calculate script duration based on length
  const getDuration = (length) => {
    switch(length) {
      case 'SHORT':
      case 5:
        return '5';
      case 'MEDIUM':
      case 10:
        return '10';
      case 'LONG':
      case 15:
        return '15';
      default:
        return String(length);
    }
  };

  const duration = getDuration(length);

  // Build the system prompt
  const systemPrompt = `You are an expert YouTube script writer and content researcher specializing in creating engaging, factual, and educational video scripts. You have access to web search capabilities and must use them to ensure accuracy and current information.

Your scripts should be ${tone} in tone, targeted at ${targetAudience} audience, and approximately ${duration} minutes long when read aloud.
${channelContext ? `\nChannel Context: ${channelContext}` : ''}
${voiceProfile ? `\nVoice Style: Match the speaking style and personality described in the voice profile.` : ''}`;

  // Build the enhanced user prompt with research requirements
  const userPrompt = `<context>
You're creating a ${duration}-minute ${type.toLowerCase()} script for YouTube with a ${tone} tone, targeting ${targetAudience}. The script must be factually accurate, engaging, and provide real educational value. Web research is required to ensure all claims are verifiable and current.
</context>

<research_requirements>
BEFORE writing the script, you MUST:
1. Search the web for current, factual information about: "${title}"
2. Verify that any products, technologies, or concepts mentioned actually exist
3. Find recent developments, statistics, or examples related to the topic
4. Identify authoritative sources and expert opinions
5. Check for any controversies or alternative viewpoints

${keyPoints.length > 0 ? `If the title is too generic, search for: "${keyPoints.join(", ")}" to understand what specific information to include.` : ''}
</research_requirements>

<enhanced_research_instructions>
When researching "${title}", specifically look for:

1. RECENT DEVELOPMENTS (last 12-18 months):
   - Latest product launches or updates
   - Recent research studies or breakthrough announcements
   - Current industry trends or market shifts
   - New regulations or policy changes

2. SPECIFIC EXAMPLES WITH DETAILS:
   - Company names, product names, version numbers
   - Researcher names, institution names, study titles
   - Exact dates, performance metrics, pricing information
   - Real user testimonials or case studies

3. AUDIENCE-RELEVANT INFORMATION:
   Since targeting "${targetAudience}", prioritize:
   ${targetAudience.toLowerCase().includes('developer') ? '- Technical implementation details, APIs, code examples' :
     targetAudience.toLowerCase().includes('business') ? '- Market data, ROI information, competitive analysis' :
     targetAudience.toLowerCase().includes('student') ? '- Educational resources, career applications, learning paths' :
     '- Practical applications, consumer benefits, easy-to-understand explanations'}

4. VERIFICATION PRIORITY:
   - Cross-reference claims across multiple sources
   - Prioritize official company blogs, academic papers, government reports
   - Include publication dates for all major claims
   - Note any conflicting information or debates in the field
</enhanced_research_instructions>

<instructions>
1. RESEARCH PHASE (Use web search tools):
   - Search for factual information about the main topic
   - Find 2-3 authoritative sources (official websites, research papers, expert articles)
   - Gather current statistics, examples, and real-world applications
   - Identify any recent developments or trends

2. CONTENT VALIDATION:
   - Only reference real, existing products, services, or technologies
   - Include specific, verifiable facts and figures
   - Mention credible sources when making claims
   - If information is uncertain, explicitly state "according to [source]" or "research suggests"

3. SCRIPT STRUCTURE:
   Create a ${duration}-minute script with these sections:
   - [HOOK] (30-45 seconds): Compelling opening that promises specific value
   - [INTRO] (30-60 seconds): Brief overview of what viewers will learn
   - [MAIN] (70-80% of content): Educational content organized around key points
   - [CONCLUSION] (30-45 seconds): Summary and actionable takeaways
   - [END SCREEN] (15-30 seconds): Subscribe reminder and related content suggestions

4. TONE AND STYLE:
   - ${tone === 'professional' ? 'Use clear, authoritative language with industry terminology when appropriate' : 
     tone === 'casual' ? 'Write conversationally with personal anecdotes and relatable examples' :
     tone === 'educational' ? 'Focus on clear explanations with step-by-step breakdowns' :
     'Keep it entertaining while maintaining educational value'}
   - Target language level appropriate for: ${targetAudience}
   - Include specific examples and real-world applications

${keyPoints.length > 0 ? `5. KEY POINTS INTEGRATION:
   Ensure each key point is covered with factual depth:
${keyPoints.map((point, index) => `   - Point ${index + 1}: ${point}`).join('\n')}` : ''}

6. ENGAGEMENT ELEMENTS:
   - Include specific timestamps or sections for visual demonstrations
   - Suggest relevant graphics, screenshots, or charts to show
   - Add natural pause points for audience retention
   - Include rhetorical questions to maintain engagement
</instructions>

<engagement_enhancements>
For ${tone} content targeting ${targetAudience}, include:
- At least 2-3 specific, recent examples with dates (e.g., "In March 2024, researchers at Stanford...")
- Concrete numbers and statistics where available
- Personal stories or case studies when relevant
- Questions that make viewers think ("Have you ever wondered...")
- Surprising facts or "Did you know..." moments
</engagement_enhancements>

<technical_depth_guidelines>
For technical audiences:
- Include specific company names, research institutions, or product names when available
- Mention key researchers or breakthrough studies by name
- Explain the "how" behind concepts, not just the "what"
- Include relevant technical specifications or performance metrics
- Connect concepts to practical applications viewers can relate to
</technical_depth_guidelines>

<current_information_priority>
Prioritize information from the last 12-18 months when available:
- Recent breakthroughs, announcements, or studies
- Current market leaders or trending products
- Latest regulatory developments or industry changes
- Most recent statistics and performance benchmarks
- Update any outdated information found during research
</current_information_priority>

<audience_specific_examples>
Tailor examples to your target audience:
- For "developers": Include coding languages, frameworks, APIs mentioned
- For "business owners": Focus on ROI, market trends, competitive advantages  
- For "students": Include learning resources, academic perspectives, career relevance
- For "general audience": Use everyday analogies and consumer-focused examples
- For "tech enthusiasts": Include specs, performance comparisons, future roadmaps
</audience_specific_examples>

<hook_improvement_formulas>
Create more compelling hooks using these formulas:
- Statistic Hook: "X% of [audience] don't know that [surprising fact]..."
- Problem/Solution: "[Common problem] has plagued [audience] for years, but [solution]..."
- Prediction Hook: "By [year], experts predict [dramatic change] will..."
- Controversy Hook: "The [industry] doesn't want you to know about [topic]..."
- Personal Story: "When I first [experienced/discovered] [topic], I never expected..."
</hook_improvement_formulas>

<transition_improvements>
Add smooth transitions between sections:
- "Now that we understand [concept], let's explore..."
- "But here's where things get really interesting..."
- "You might be wondering [question] - and here's the answer..."
- "This brings us to the most important part..."
- "Before we wrap up, there's one more thing you need to know..."
</transition_improvements>

<accuracy_requirements>
- Every factual claim must be researched and verifiable
- Include phrases like "according to [source]" for statistics
- If you cannot find current information, state "as of [date]" or "recent research indicates"
- Never invent products, companies, or statistics
- If uncertain about any claim, either research it or omit it
- For technical content, include proper terminology and explain complex concepts clearly
</accuracy_requirements>

<formatting>
Format the output as follows:

**RESEARCH SUMMARY**
[Brief summary of key findings from web research, including sources]

**SCRIPT**
[HOOK]
[Your compelling 30-45 second opening]

[INTRO] 
[30-60 second overview]

[MAIN]
[Main educational content with clear sections for each key point]

[CONCLUSION]
[30-45 second summary with actionable takeaways]

[END SCREEN]
[15-30 second call-to-action]

**VISUAL SUGGESTIONS**
[Specific recommendations for graphics, demonstrations, or visual elements]

**FACT-CHECK NOTES**
[List of key claims made and their sources for verification]
</formatting>

<quality_standards>
- Script must provide genuine educational value to the target audience
- Include at least 3-5 specific, verifiable facts or examples
- Ensure smooth transitions between sections
- Balance information density with entertainment value
- Include clear value propositions for why viewers should watch until the end
- Add specific calls-to-action that relate to the content topic
</quality_standards>

<call_to_action_specificity>
Make CTAs more specific and valuable:
- Instead of generic "subscribe," suggest "subscribe for weekly [specific content type]"
- Recommend specific related videos by topic, not just "other videos"
- Include actionable next steps: "Try [specific tool/method] and let us know..."
- Suggest joining communities: "Join the discussion in [specific forum/Discord]"
- Provide specific resources: "Download the [specific guide/tool] in the description"
</call_to_action_specificity>

<uncertainty_handling>
If you cannot find sufficient factual information about the topic:
- State clearly what information is limited or unavailable
- Suggest alternative angles or related topics that have better source material
- Focus on general principles or foundational concepts instead of specific claims
- Recommend that the creator verify any claims before publishing
</uncertainty_handling>

Now, research the topic thoroughly and create an engaging, factually accurate YouTube script titled "${title}".`;

  return {
    system: systemPrompt,
    user: userPrompt
  };
}

// Helper function for generating scripts with web search
export function generateScriptWithWebSearch(options) {
  const prompt = generateScript(options);
  
  // Add web search tool configuration
  const toolConfig = {
    tools: [
      {
        type: "function",
        function: {
          name: "web_search",
          description: "Search the web for current information",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query"
              }
            },
            required: ["query"]
          }
        }
      }
    ],
    tool_choice: "auto"
  };

  return {
    ...prompt,
    toolConfig
  };
}