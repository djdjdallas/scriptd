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

// Import enhanced generation functions
import { generateEnhancedScript } from './script-generation-v2';

// Improved YouTube Script Generation with MANDATORY Web Search & Fact-Checking Requirements
export function generateScript(options) {
  const {
    title,
    topic = '', // Optional topic for additional context
    type = 'educational',
    length = 10,
    tone = 'professional',
    targetAudience = 'general',
    keyPoints = [],
    channelContext = '',
    voiceProfile = null,
    useEnhanced = true, // Use enhanced 2025 version by default
    platform = 'youtube_long',
    trendingTopics = [],
    performanceGoals = {},
    enableFactChecking = true // Enable mandatory fact-checking by default
  } = options;

  // Use enhanced version if enabled
  if (useEnhanced) {
    return generateEnhancedScript(options);
  }

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

  // Build the system prompt with MANDATORY 4-card structure and fact-checking requirements
  const systemPrompt = `You are an elite YouTube script writer specializing in high-retention, algorithm-optimized content for 2025. You MUST create scripts using the MANDATORY 4-CARD SYSTEM with comprehensive fact-checking.

CRITICAL REQUIREMENTS:
- You MUST create ALL 4 CARDS - NO EXCEPTIONS
- You MUST perform minimum 5 web searches for fact-checking
- You MUST NEVER create fictional companies or products - only use real, verifiable entities
- You MUST separate content properly between cards (no research in main script)
- Each card MUST have substantial, actionable content
- DO NOT end scripts with questions like "Would you like me to..." or "Should I..." - deliver complete, final scripts

Your scripts should be ${tone} in tone, targeted at ${targetAudience} audience, and approximately ${duration} minutes long when read aloud.
${channelContext ? `\nChannel Context: ${channelContext}` : ''}
${voiceProfile ? `
VOICE PROFILE INTEGRATION:
You are writing for "${voiceProfile.name}" with these specific characteristics:
${voiceProfile.formality ? `- Formality Level: ${voiceProfile.formality}` : ''}
${voiceProfile.enthusiasm ? `- Enthusiasm Level: ${voiceProfile.enthusiasm}` : ''}
${voiceProfile.speed ? `- Speaking Speed: ${voiceProfile.speed}x normal` : ''}
${voiceProfile.catchphrases?.length ? `- Signature Catchphrases: ${voiceProfile.catchphrases.join(', ')}` : ''}
${voiceProfile.greetings?.length ? `- Typical Greetings: ${voiceProfile.greetings.join(', ')}` : ''}
${voiceProfile.topWords?.length ? `- Frequently Used Words: ${voiceProfile.topWords.slice(0, 5).map(w => w.word || w).join(', ')}` : ''}

IMPORTANT: Naturally incorporate these voice characteristics into the script to match the creator's authentic style.` : ''}`;

  // Build the enhanced user prompt with research requirements
  const userPrompt = `<context>
You're creating a ${duration}-minute ${type.toLowerCase()} script for YouTube with a ${tone} tone, targeting ${targetAudience}. The script must be factually accurate, engaging, and provide real educational value. Web research is required to ensure all claims are verifiable and current.
${topic ? `\nTopic Context: ${topic}` : ''}
${voiceProfile ? `
Voice Profile Active: "${voiceProfile.name}"
- Write in the first person as this creator
- Match their speaking style and vocabulary patterns
- Include their signature phrases naturally where appropriate
- Maintain their typical energy and enthusiasm level` : ''}
</context>

<mandatory_fact_verification>
🚨 CRITICAL: YOU MUST PERFORM THE FOLLOWING WEB SEARCHES BEFORE WRITING ANY CONTENT:

1. COMPANY/PRODUCT VERIFICATION (REQUIRED):
   - Search: "[company name] official website 2024 2025"
   - Search: "[product name] exists real verification"
   - Search: "[service name] pricing features 2025"
   - If ANY company/product cannot be verified, mark as [HYPOTHETICAL EXAMPLE]

2. STATISTICAL VERIFICATION (REQUIRED):
   - Search: "[specific statistic] source study 2024 2025"
   - Search: "[claim] fact check verification"
   - Every number MUST have a verifiable source from the last 2 years
   - Include source date in format: <!-- Source: [URL] [Date] -->

3. CURRENT INFORMATION (REQUIRED):
   - Search: "${title} latest news 2024 2025"
   - Search: "${title} recent developments updates"
   - Prioritize information from the last 12 months

4. PRICE/OFFERING VERIFICATION (REQUIRED):
   - Search: "[company] pricing plans 2025"
   - Search: "[product] features specifications current"
   - Never guess prices - only use verified current pricing

5. CONTROVERSY CHECK (REQUIRED):
   - Search: "${title} controversy problems issues"
   - Search: "${title} fact check debunked myths"
   - Include balanced perspectives if controversies exist

${keyPoints.length > 0 ? `6. KEY POINTS VERIFICATION:
${keyPoints.map((point, i) => `   - Search ${i+1}: "${point} facts statistics 2024 2025"`).join('\n')}` : ''}

⚠️ MINIMUM REQUIRED SEARCHES: ${5 + keyPoints.length} searches MUST be performed
</mandatory_fact_verification>

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
   - [HOOK] (0:00-0:30): Compelling opening that promises specific value
   - [INTRO] (0:30-1:30): Brief overview of what viewers will learn
   - [MAIN] (1:30-${Math.floor(duration * 0.85)}:00): Educational content organized around key points
   - [CONCLUSION] (${Math.floor(duration * 0.85)}:00-${Math.floor(duration * 0.95)}:00): Summary and actionable takeaways
   - [END SCREEN] (${Math.floor(duration * 0.95)}:00-${duration}:00): Subscribe reminder and related content suggestions
   
   Include timestamp markers [MM:SS] at major transitions to help with pacing and editing.

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

<strict_accuracy_protocol>
🔴 MANDATORY ACCURACY RULES (VIOLATION = SCRIPT REJECTION):

1. NEVER CREATE FICTIONAL ENTITIES:
   - ❌ FORBIDDEN: "TechBoost AI" (if it doesn't exist)
   - ✅ REQUIRED: Only mention companies verified through web search
   - ✅ ALTERNATIVE: Use "a hypothetical company" or "Company X" for examples

2. STATISTICAL ACCURACY:
   - ❌ FORBIDDEN: Rounding 3% to 35% for dramatic effect
   - ❌ FORBIDDEN: Using outdated statistics (>2 years old)
   - ✅ REQUIRED: Exact figures with source: "According to [Source, Date], X% of..."
   - ✅ REQUIRED: If conflicting stats exist, use most recent reputable source

3. VERIFICATION TAGS:
   - [VERIFIED] - Information confirmed through web search
   - [LIKELY ACCURATE] - Multiple indirect sources support this
   - [UNVERIFIED] - Could not confirm through search
   - [HYPOTHETICAL] - Example created for illustration only

4. SOURCE CITATIONS:
   - In-script mention: "According to [Source Name]..."
   - HTML comment: <!-- Source: [URL] [Access Date] -->
   - Fact-check note: List search performed and result

5. CONFIDENCE LEVELS:
   - High confidence: 3+ reputable sources confirm
   - Medium confidence: 1-2 sources found
   - Low confidence: No direct sources, mark as [NEEDS VERIFICATION]

6. TRANSPARENCY REQUIREMENTS:
   - If a claim cannot be verified, YOU MUST:
     a) Remove it entirely, OR
     b) Replace with verified information, OR
     c) Clearly mark as "estimated" or "hypothetical example"
   - NEVER present speculation as fact
   - NEVER use phrases like "studies show" without citing the actual study
</strict_accuracy_protocol>

<mandatory_output_format>
YOU MUST CREATE EXACTLY 4 CARDS WITH THE FOLLOWING STRUCTURE:

## 📝 CARD 1: MAIN SCRIPT
[Clean, performable script content ONLY - no sources, no verification tags here]

**HOOK (0:00-0:15)**
[Compelling opening line - pure dialogue only]

**PVSS STRUCTURE (0:15-0:30)**
PROOF: [Your credibility statement]
VALUE: [What they'll learn today]
STRUCTURE: [How you'll teach it]
STAKES: [Why this matters now]

**MAIN CONTENT (0:30-${Math.floor(duration * 0.85)}:00)**
[All spoken content organized by sections]
[Include pattern interrupts marked simply]
[Natural transitions between topics]

**CONCLUSION (${Math.floor(duration * 0.85)}:00-${duration}:00)**
[Summary and call to action]

---

## 🔍 CARD 2: RESEARCH & VERIFICATION
[ALL fact-checking and source material goes here]

### Web Search Verification Log
**REQUIRED: Minimum ${5 + keyPoints.length} searches performed**
1. Search: "[exact query]" → Result: [key finding]
2. Search: "[exact query]" → Result: [key finding]
3. Search: "[exact query]" → Result: [key finding]
4. Search: "[exact query]" → Result: [key finding]
5. Search: "[exact query]" → Result: [key finding]
[Continue for all searches performed]

### Verified Claims & Sources
✅ **Claim 1**: [Specific claim from script]
   - Source: [Publication name]
   - URL: [Full URL]
   - Date: [Publication date]
   - Confidence: [High/Medium/Low]

✅ **Claim 2**: [Specific claim from script]
   - Source: [Publication name]
   - URL: [Full URL]
   - Date: [Publication date]
   - Confidence: [High/Medium/Low]

[Continue for ALL claims made in script]

### Statistics Used
📊 **Stat 1**: [Exact number/percentage]
   - Context: [How it's used in script]
   - Source: [Where it came from]
   - Year: [Data year]

### Fact-Check Summary
- Total searches performed: [#]
- Total claims made: [#]
- Claims verified: [#] ([%])
- Claims unverified: [#]
- Confidence level: [High/Medium/Low]

---

## 🎬 CARD 3: PRODUCTION GUIDE
[ALL visual and audio suggestions go here]

### Visual Timeline
**0:00-0:15 - HOOK**
- B-roll needed: [Specific footage description]
- Text overlay: "[Exact text to display]"
- Graphics: [Any animations or graphics]
- Transition: [Type of transition to next section]

**0:15-0:30 - PVSS**
- Visual style: [How to present this section]
- Text overlays: [Key points to emphasize]
- Background: [Setting or backdrop]

[Continue for EVERY section of the script]

### Audio Requirements
**Background Music**
- Intro (0:00-0:30): [Style/mood - e.g., "upbeat electronic"]
- Main content: [Style/mood - e.g., "subtle corporate"]
- Climax points: [Where to intensify]
- Outro: [Style/mood for ending]

**Sound Effects**
- [Timestamp]: [Effect type] - [Purpose]

### Pattern Interrupt Markers
1. [Timestamp]: [Type of interrupt] - [Visual/audio change]
2. [Timestamp]: [Type of interrupt] - [Visual/audio change]

---

## 📊 CARD 4: METADATA & OPTIMIZATION
[ALL SEO and analytics information goes here]

### SEO Optimization
**Primary Keyword**: [Main keyword]
**Secondary Keywords**: 
1. [Keyword 2]
2. [Keyword 3]
3. [Keyword 4]

**Title Options for A/B Testing**:
1. [Title variation 1] - Focus: [what it emphasizes]
2. [Title variation 2] - Focus: [what it emphasizes]
3. [Title variation 3] - Focus: [what it emphasizes]

**Description Template**:
[First 125 characters - most important]
[Rest of description with keywords naturally included]

**Tags** (in order of importance):
1. [Most relevant tag]
2. [Second tag]
3. [Third tag]
[Continue up to 15 tags]

### Performance Predictions
**Expected Metrics**:
- CTR: [X]% (benchmark: [Y]%)
- 30-second retention: [X]% (target: >70%)
- Average view duration: [X]% (target: >50%)

### Thumbnail Requirements
**Key Elements**:
1. [Visual element 1] - [Why it's important]
2. [Text overlay]: "[Exact text]" - [Font style]
3. [Color scheme]: [Colors to use]

### Analytics Tracking Plan
**Key Moments to Monitor**:
- [Timestamp]: [What to measure]
- [Timestamp]: [What to measure]

⚠️ VALIDATION: All 4 cards MUST be present and populated with substantial content
</mandatory_output_format>

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

<mandatory_uncertainty_protocol>
WHEN INFORMATION CANNOT BE VERIFIED:

1. IMMEDIATE ACTIONS (REQUIRED):
   ❌ DO NOT make up companies, products, or statistics
   ❌ DO NOT present guesses as facts
   ✅ DO explicitly state: "[COULD NOT VERIFY: searching for X yielded no results]"
   ✅ DO suggest alternative verified information

2. REPLACEMENT STRATEGIES:
   - Instead of unverifiable specific company → Use verified industry leader
   - Instead of unverifiable statistic → Use verified trend or range
   - Instead of unverifiable product → Use hypothetical clearly marked
   - Instead of unverifiable price → State "pricing varies" or "contact for quote"

3. HYPOTHETICAL EXAMPLES (WHEN NECESSARY):
   - MUST be introduced as: "For example, let's imagine a hypothetical company..."
   - MUST NOT use realistic-sounding names that could be confused with real entities
   - MUST be clearly marked throughout: [HYPOTHETICAL EXAMPLE]

4. TRANSPARENCY REQUIREMENTS:
   - List all searches that returned no results
   - Explain what information gaps exist
   - Provide confidence level for script accuracy
   - Recommend specific fact-checking steps before publishing

5. SCRIPT REJECTION CRITERIA:
   If more than 30% of key claims cannot be verified, you MUST:
   - Stop script generation
   - Report which information cannot be verified
   - Suggest alternative topic angles with better verifiable information
</mandatory_uncertainty_protocol>

FINAL INSTRUCTIONS:
1. Perform ALL required web searches (minimum ${5 + keyPoints.length})
2. Verify EVERY company, product, statistic, and price mentioned
3. Include [VERIFICATION] tags throughout the script
4. Add source citations as HTML comments
5. Create the FACT-CHECK NOTES section with all verifications
6. Ensure 100% factual accuracy - no fictional entities allowed

⚠️ CRITICAL OUTPUT RULES:
- DO NOT end the script with questions to the AI or user
- DO NOT include phrases like "Would you like me to refine any section?" or "Should I adjust anything?"
- DO NOT ask "Is there anything else you'd like me to add?"
- The script should end naturally with the END SCREEN section
- This is a FINAL script, not a draft - present it as complete

⚠️ REMEMBER: This script will be publicly published. False information damages credibility.
Fictional companies/products presented as real will result in script rejection.

Now, research the topic thoroughly through web searches and create an engaging, 100% factually accurate YouTube script titled "${title}".

${enableFactChecking === false ? '\n⚠️ NOTE: Fact-checking has been disabled for this generation. Accuracy is not guaranteed.' : ''}`;

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