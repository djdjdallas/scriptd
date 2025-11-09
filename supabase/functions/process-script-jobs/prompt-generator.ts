/**
 * YouTube Script Prompt Generator
 * TypeScript port for Supabase Edge Functions (Deno runtime)
 *
 * Ported from: src/lib/prompts/optimized-youtube-generator.js
 * Purpose: Generate sophisticated prompts for A- Hollywood-level script generation
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface VoiceProfileBasic {
  pace?: string;
  energy?: string;
  tone?: string;
  style?: string;
  personality?: string;
  vocabulary?: string;
  transitions?: string;
  humor?: string;
  hooks?: string;
  dos?: string[];
  donts?: string[];
  signature_phrases?: string[];
}

export interface VoiceProfileEnhanced {
  pacing_dynamics?: {
    slow_moments?: string;
    fast_moments?: string;
    pause_usage?: string;
  };
  emotional_dynamics?: {
    enthusiasm_triggers?: string;
    serious_moments?: string;
    empathy_expression?: string;
  };
  engagement_techniques?: {
    audience_interaction?: string;
    rhetorical_devices?: string;
    storytelling_approach?: string;
  };
  linguistic_fingerprints?: {
    sentence_structure?: string;
    word_choice_patterns?: string;
    filler_words?: string;
  };
  implementation_notes?: string;
}

export interface VoiceProfile {
  profile_name?: string;
  name?: string;
  basic?: VoiceProfileBasic;
  enhanced?: VoiceProfileEnhanced;
  training_data?: {
    basic?: VoiceProfileBasic;
    enhanced?: VoiceProfileEnhanced;
  };
}

export interface ContentPoint {
  title?: string;
  name?: string;
  description?: string;
  duration?: number;
  keyTakeaway?: string;
}

export interface ResearchSource {
  source_title?: string;
  source_url?: string;
  source_content?: string;
  source_type?: string;
  is_verified?: boolean;
  is_starred?: boolean;
}

export interface Research {
  summary?: string;
  sources?: ResearchSource[];
  insights?: {
    facts?: string[];
    statistics?: string[];
    trends?: string[];
    perspectives?: string[];
  };
}

export interface Sponsor {
  name?: string;
  product?: string;
  message?: string;
  cta?: string;
  talking_points?: string[];
  ftc_disclosure?: string;
}

export interface TargetAudience {
  demographics?: string;
  interests?: string;
  knowledge_level?: string;
  pain_points?: string[];
  goals?: string[];
}

export interface WorkflowContext {
  frame?: string | null;
  hook?: string | null;
  contentPoints?: ContentPoint[] | null;
  research?: Research | null;
  voiceProfile?: VoiceProfile | null;
  thumbnail?: string | null;
  targetAudience?: string | TargetAudience | null;
  tone?: string;
  sponsor?: Sponsor | null;
}

export interface ValidationCheck {
  hasTimestamps: boolean;
  hasVisualCues: boolean;
  hasQuestions: boolean;
  hasSections: boolean;
  reasonable_length: boolean;
  noPlaceholders: boolean;
  hasDescription: boolean;
  hasTags: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  checks?: ValidationCheck;
}

export interface LengthSuggestion {
  min: number;
  optimal: number;
  max: number;
  reasoning?: string;
}

export interface TitleVariation {
  title: string;
  characterCount: number;
  hasKeywords: boolean;
  type: string;
  clickStrength: string;
  isUnder60Chars: boolean;
  recommendation: string;
}

export interface ScriptMetadata {
  topic: string;
  targetLength: number;
  tone: string;
  audience: string;
  keywords: string[];
  lengthSuggestion: LengthSuggestion;
  titleVariations: TitleVariation[];
  generatedAt: string;
  errorOccurred?: boolean;
}

export interface OptimizedScriptResult {
  prompt: string | null;
  metadata: ScriptMetadata;
  error?: string;
  validate?: (script: string) => ValidationResult;
}

// ============================================================================
// MAIN PROMPT GENERATOR
// ============================================================================

/**
 * Generate comprehensive YouTube script prompt with voice profile integration
 */
export function generateYouTubeScriptPrompt(
  topic: string,
  targetLength: number,
  workflowContext: WorkflowContext = {}
): string {
  console.log('\n🎬 === GENERATING YOUTUBE SCRIPT PROMPT ===');
  console.log(`Topic: ${topic}`);
  console.log(`Target Length: ${targetLength} minutes`);
  console.log(`Target Words: ~${targetLength * 150} words`);

  // Extract workflow context components
  const {
    frame,
    hook,
    contentPoints,
    research,
    voiceProfile,
    thumbnail,
    targetAudience,
    tone,
    sponsor
  } = workflowContext;

  // Process voice profile if available
  let voiceData: VoiceProfile | null = null;
  if (voiceProfile) {
    console.log('\n🎤 VOICE PROFILE DETECTED - Processing...');

    voiceData = {
      name: voiceProfile.profile_name || voiceProfile.name,
      basic: voiceProfile.basic || voiceProfile.training_data?.basic || {},
      enhanced: voiceProfile.enhanced || voiceProfile.training_data?.enhanced || {}
    };

    console.log(`   Name: ${voiceData.name || 'Unnamed'}`);
    console.log(`   Has Basic: ${!!voiceData.basic}`);
    console.log(`   Has Enhanced: ${!!voiceData.enhanced}`);

    if (voiceData.basic) {
      const basic = voiceData.basic;
      console.log('\n   📋 Basic Characteristics:');
      if (basic.pace) console.log(`      Pace: ${basic.pace}`);
      if (basic.energy) console.log(`      Energy: ${basic.energy}`);
      if (basic.tone) console.log(`      Tone: ${basic.tone}`);
      if (basic.style) console.log(`      Style: ${basic.style}`);
      if (basic.personality) console.log(`      Personality: ${basic.personality}`);
      if (basic.vocabulary) console.log(`      Vocabulary: ${basic.vocabulary}`);
      if (basic.transitions) console.log(`      Transitions: ${basic.transitions}`);
      if (basic.humor) console.log(`      Humor: ${basic.humor}`);
      if (basic.hooks) console.log(`      Hooks: ${basic.hooks}`);

      if (basic.dos && basic.dos.length > 0) {
        console.log(`      Dos: ${basic.dos.length} items`);
      }
      if (basic.donts && basic.donts.length > 0) {
        console.log(`      Don'ts: ${basic.donts.length} items`);
      }
      if (basic.signature_phrases && basic.signature_phrases.length > 0) {
        console.log(`      Signature Phrases: ${basic.signature_phrases.length} items`);
      }
    }

    if (voiceData.enhanced) {
      console.log('\n   ⚡ Enhanced Characteristics:');
      const enhanced = voiceData.enhanced;
      if (enhanced.pacing_dynamics) console.log('      ✓ Pacing Dynamics');
      if (enhanced.emotional_dynamics) console.log('      ✓ Emotional Dynamics');
      if (enhanced.engagement_techniques) console.log('      ✓ Engagement Techniques');
      if (enhanced.linguistic_fingerprints) console.log('      ✓ Linguistic Fingerprints');
      if (enhanced.implementation_notes) console.log('      ✓ Implementation Notes');
    }
  } else {
    console.log('\n   ℹ️  No voice profile provided - using default voice');
  }

  // Process research sources
  console.log('\n📚 RESEARCH SOURCES:');
  const allSources = research?.sources || [];
  const verifiedSources = allSources.filter(s => s.is_verified);
  const starredSources = allSources.filter(s => s.is_starred);

  console.log(`   Total sources: ${allSources.length}`);
  console.log(`   Verified sources: ${verifiedSources.length}`);
  console.log(`   Starred sources: ${starredSources.length}`);

  // Process content points
  console.log('\n📝 CONTENT STRUCTURE:');
  if (contentPoints && contentPoints.length > 0) {
    console.log(`   Content points: ${contentPoints.length}`);
    contentPoints.forEach((point, idx) => {
      console.log(`   ${idx + 1}. ${point.title || point.name || 'Untitled'} (${point.duration ? Math.ceil(point.duration / 60) + 'min' : 'flexible'})`);
    });
  } else {
    console.log('   No specific content points - AI will structure content');
  }

  console.log('\n' + '='.repeat(60));

  // Build the prompt
  return `<role>You are an expert YouTube scriptwriter creating a ${targetLength}-minute video script.</role>

${voiceData ? `
<voice_profile>
  <profile_name>${voiceData.name || 'Professional Creator'}</profile_name>

  ${voiceData.basic ? `
  <basic_characteristics>
    ${voiceData.basic.pace ? `<pace>${voiceData.basic.pace}</pace>` : ''}
    ${voiceData.basic.energy ? `<energy>${voiceData.basic.energy}</energy>` : ''}
    ${voiceData.basic.tone ? `<tone>${voiceData.basic.tone}</tone>` : ''}
    ${voiceData.basic.style ? `<style>${voiceData.basic.style}</style>` : ''}
    ${voiceData.basic.personality ? `<personality>${voiceData.basic.personality}</personality>` : ''}
    ${voiceData.basic.vocabulary ? `<vocabulary>${voiceData.basic.vocabulary}</vocabulary>` : ''}
    ${voiceData.basic.transitions ? `<transitions>${voiceData.basic.transitions}</transitions>` : ''}
    ${voiceData.basic.humor ? `<humor>${voiceData.basic.humor}</humor>` : ''}
    ${voiceData.basic.hooks ? `<hooks>${voiceData.basic.hooks}</hooks>` : ''}

    ${voiceData.basic.dos && voiceData.basic.dos.length > 0 ? `
    <dos>
      ${voiceData.basic.dos.map(item => `<do>${item}</do>`).join('\n      ')}
    </dos>` : ''}

    ${voiceData.basic.donts && voiceData.basic.donts.length > 0 ? `
    <donts>
      ${voiceData.basic.donts.map(item => `<dont>${item}</dont>`).join('\n      ')}
    </donts>` : ''}

    ${voiceData.basic.signature_phrases && voiceData.basic.signature_phrases.length > 0 ? `
    <signature_phrases>
      ${voiceData.basic.signature_phrases.map(phrase => `<phrase>${phrase}</phrase>`).join('\n      ')}
    </signature_phrases>` : ''}
  </basic_characteristics>` : ''}

  ${voiceData.enhanced ? `
  <enhanced_characteristics>
    ${voiceData.enhanced.pacing_dynamics ? `
    <pacing_dynamics>
      ${voiceData.enhanced.pacing_dynamics.slow_moments ? `<slow_moments>${voiceData.enhanced.pacing_dynamics.slow_moments}</slow_moments>` : ''}
      ${voiceData.enhanced.pacing_dynamics.fast_moments ? `<fast_moments>${voiceData.enhanced.pacing_dynamics.fast_moments}</fast_moments>` : ''}
      ${voiceData.enhanced.pacing_dynamics.pause_usage ? `<pause_usage>${voiceData.enhanced.pacing_dynamics.pause_usage}</pause_usage>` : ''}
    </pacing_dynamics>` : ''}

    ${voiceData.enhanced.emotional_dynamics ? `
    <emotional_dynamics>
      ${voiceData.enhanced.emotional_dynamics.enthusiasm_triggers ? `<enthusiasm_triggers>${voiceData.enhanced.emotional_dynamics.enthusiasm_triggers}</enthusiasm_triggers>` : ''}
      ${voiceData.enhanced.emotional_dynamics.serious_moments ? `<serious_moments>${voiceData.enhanced.emotional_dynamics.serious_moments}</serious_moments>` : ''}
      ${voiceData.enhanced.emotional_dynamics.empathy_expression ? `<empathy_expression>${voiceData.enhanced.emotional_dynamics.empathy_expression}</empathy_expression>` : ''}
    </emotional_dynamics>` : ''}

    ${voiceData.enhanced.engagement_techniques ? `
    <engagement_techniques>
      ${voiceData.enhanced.engagement_techniques.audience_interaction ? `<audience_interaction>${voiceData.enhanced.engagement_techniques.audience_interaction}</audience_interaction>` : ''}
      ${voiceData.enhanced.engagement_techniques.rhetorical_devices ? `<rhetorical_devices>${voiceData.enhanced.engagement_techniques.rhetorical_devices}</rhetorical_devices>` : ''}
      ${voiceData.enhanced.engagement_techniques.storytelling_approach ? `<storytelling_approach>${voiceData.enhanced.engagement_techniques.storytelling_approach}</storytelling_approach>` : ''}
    </engagement_techniques>` : ''}

    ${voiceData.enhanced.linguistic_fingerprints ? `
    <linguistic_fingerprints>
      ${voiceData.enhanced.linguistic_fingerprints.sentence_structure ? `<sentence_structure>${voiceData.enhanced.linguistic_fingerprints.sentence_structure}</sentence_structure>` : ''}
      ${voiceData.enhanced.linguistic_fingerprints.word_choice_patterns ? `<word_choice_patterns>${voiceData.enhanced.linguistic_fingerprints.word_choice_patterns}</word_choice_patterns>` : ''}
      ${voiceData.enhanced.linguistic_fingerprints.filler_words ? `<filler_words>${voiceData.enhanced.linguistic_fingerprints.filler_words}</filler_words>` : ''}
    </linguistic_fingerprints>` : ''}

    ${voiceData.enhanced.implementation_notes ? `
    <implementation_notes>${voiceData.enhanced.implementation_notes}</implementation_notes>` : ''}
  </enhanced_characteristics>` : ''}

  <instructions>
    Embody this voice profile completely. Every sentence should reflect these characteristics.
    Use the dos and avoid the don'ts. Incorporate signature phrases naturally where appropriate.
    The enhanced characteristics provide deeper context for how to bring this voice to life.
  </instructions>
</voice_profile>` : ''}

<topic>${topic}</topic>

<target_length>${targetLength} minutes (approximately ${targetLength * 150} words)</target_length>

${targetAudience ? `
<target_audience>
  ${typeof targetAudience === 'string' ? targetAudience : JSON.stringify(targetAudience, null, 2)}
</target_audience>` : ''}

${tone ? `<tone>${tone}</tone>` : ''}

${frame ? `
<frame>
  ${frame}

  This frame should guide your overall narrative approach and perspective on the topic.
</frame>` : ''}

${hook ? `
<hook>
  ${hook}

  Use this hook to open your script. Make it compelling and attention-grabbing.
</hook>` : ''}

${contentPoints && contentPoints.length > 0 ? `
<content_structure>
  <sections>
    ${contentPoints.map((point, idx) => `
    <section number="${idx + 1}">
      <title>${point.title || point.name || `Section ${idx + 1}`}</title>
      ${point.description ? `<description>${point.description}</description>` : ''}
      ${point.duration ? `<target_duration>${Math.ceil(point.duration / 60)} minutes</target_duration>` : ''}
      ${point.keyTakeaway ? `<key_takeaway>${point.keyTakeaway}</key_takeaway>` : ''}
    </section>`).join('')}
  </sections>

  <instructions>
    Cover each section thoroughly. Each section should flow naturally into the next.
    Allocate time proportionally based on target durations if specified.
  </instructions>
</content_structure>` : ''}

${sponsor ? `
<sponsor_integration>
  <sponsor_details>
    <name>${sponsor.name}</name>
    ${sponsor.product ? `<product>${sponsor.product}</product>` : ''}
    ${sponsor.message ? `<message>${sponsor.message}</message>` : ''}
    ${sponsor.cta ? `<call_to_action>${sponsor.cta}</call_to_action>` : ''}
    ${sponsor.talking_points && sponsor.talking_points.length > 0 ? `
    <talking_points>
      ${sponsor.talking_points.map(point => `<point>${point}</point>`).join('\n      ')}
    </talking_points>` : ''}
    ${sponsor.ftc_disclosure ? `<ftc_disclosure>${sponsor.ftc_disclosure}</ftc_disclosure>` : ''}
  </sponsor_details>

  <integration_guidelines>
    <timing>Place sponsor segment 20-30% into the video (natural break point)</timing>
    <transition>Transition smoothly from content to sponsor using a relevant connection</transition>
    <authenticity>Present the sponsor authentically, as if genuinely recommending to a friend</authenticity>
    <value_focus>Emphasize genuine value/benefits to viewer, not just product features</value_focus>
    <brevity>Keep sponsor segment concise (45-90 seconds) to maintain viewer engagement</brevity>
    <disclosure>Include FTC-required disclosure prominently at the start of sponsor segment</disclosure>
  </integration_guidelines>

  <writing_guidelines>
    DO:
    - Relate sponsor product/service to video topic naturally
    - Share specific benefits relevant to your audience
    - Use conversational, authentic language
    - Include clear call-to-action with any promo codes
    - Acknowledge it's a sponsored segment upfront

    DON'T:
    - Make exaggerated or unverifiable claims
    - Abruptly switch topics without transition
    - Sound overly salesy or scripted
    - Use deceptive language that hides the sponsorship
    - Drag out the sponsor segment beyond necessary length
  </writing_guidelines>

  <placement_markers>
    When writing the script, clearly indicate where the sponsor segment begins and ends:

    [SPONSOR SEGMENT START]
    Your naturally integrated sponsor content here, following all guidelines above.
    [SPONSOR SEGMENT END]
  </placement_markers>
</sponsor_integration>` : ''}

<accuracy_requirements>
  <fact_checking>CRITICAL: Verify all statistics and claims before including</fact_checking>
  <uncertainty_handling>If unsure about specific numbers, use "approximately" or "reported"</uncertainty_handling>
  <source_verification>Only use information from credible sources</source_verification>
  <correction_protocol>If a fact cannot be verified, either omit it or clearly state it's unverified</correction_protocol>
</accuracy_requirements>

<youtube_optimization>
  <retention_hooks>Add pattern interrupts every 30-45 seconds</retention_hooks>
  <visual_cues>Include [B-roll: description] suggestions for each major point</visual_cues>
  <cta_placement>
    - Soft subscribe reminder at 25% mark
    - Engagement question at 50% mark
    - End screen setup in final 20 seconds
  </cta_placement>
  <chapters>Create chapter markers with timestamps (0:00 Intro, etc.)</chapters>
</youtube_optimization>

<engagement_strategies>
  <questions>Pose 3-4 direct questions to viewers throughout script</questions>
  <controversy>Present multiple perspectives on controversial topics</controversy>
  <personal_connection>Include "What would you do?" moments</personal_connection>
  <cliffhangers>Build suspense between sections with preview statements</cliffhangers>
  <comment_prompts>Include specific prompts like "Let me know in the comments if you've experienced..."</comment_prompts>
</engagement_strategies>

<seo_optimization>
  <keywords>Naturally incorporate target keywords 5-7 times throughout script</keywords>
  <description_content>Generate compelling first 125 characters for description</description_content>
  <tags_suggestions>Suggest 5-10 relevant tags based on content</tags_suggestions>
  <title_optimization>Create 2-3 title options with high CTR potential</title_optimization>
</seo_optimization>

<formatting>
  <structure>
    SECTION TITLE (duration)
    [Visual: B-roll suggestion]

    Main content with natural flow...

    [Tone shift: describe emotional direction]

    Transition statement to next section.
  </structure>
  <timestamps>Include cumulative timestamps for each section</timestamps>
  <stage_directions>Use [brackets] for all production notes</stage_directions>
  <emphasis>Use CAPS sparingly for critical points only</emphasis>
</formatting>

<content_requirements>
  <statistics>Include 2-3 VERIFIED statistics per major section</statistics>
  <examples>Provide concrete examples or mini case studies</examples>
  <sources>Reference credible sources naturally in script</sources>
  <balance>Present balanced viewpoints on controversial topics</balance>
  ${allSources.length > 0 || research?.insights ? `
  <research_to_include>
    ${verifiedSources.length > 0 ? `
    <verified_sources>
      ${verifiedSources.map(s => {
        return `- ${s.source_title} (${s.source_url}): ${s.source_content || ''}`;
      }).join('\n      ')}
    </verified_sources>` : ''}
    ${starredSources.length > 0 ? `
    <important_sources>
      ${starredSources.map(s => {
        return `- ${s.source_title} (${s.source_url}): ${s.source_content || ''}`;
      }).join('\n      ')}
    </important_sources>` : ''}
    ${research?.insights ? `
    <research_insights>
      ${research.insights.facts?.length ? `<key_facts>${research.insights.facts.join(' | ')}</key_facts>` : ''}
      ${research.insights.statistics?.length ? `<statistics>${research.insights.statistics.join(' | ')}</statistics>` : ''}
      ${research.insights.trends?.length ? `<trends>${research.insights.trends.join(' | ')}</trends>` : ''}
      ${research.insights.perspectives?.length ? `<perspectives>${research.insights.perspectives.join(' | ')}</perspectives>` : ''}
    </research_insights>` : ''}
    ${research?.summary ? `
    <research_summary>${research.summary}</research_summary>` : ''}
    <instructions>Incorporate these research findings naturally throughout the script, citing sources where appropriate</instructions>
  </research_to_include>` : ''}
</content_requirements>

<constraints>
  <must_avoid>
    - Unverified claims or statistics
    - Clickbait without substance
    - Excessive repetition
    - Copyright violations
    - Harmful or misleading information
    - PLACEHOLDER TEXT OR SHORTCUTS (e.g., "continue with...", "[add more here]", "...")
  </must_avoid>
  <must_include>
    - Accurate, fact-checked information
    - Clear value proposition
    - Actionable takeaways
    - Proper content warnings if needed
    - COMPLETE CONTENT FOR ENTIRE ${targetLength}-MINUTE DURATION
    - EVERY promised item (if title says "7 secrets", write ALL 7 in FULL)
  </must_include>
</constraints>

<CRITICAL_COMPLETENESS_RULE>
YOU MUST WRITE THE ENTIRE SCRIPT FROM START TO FINISH IN ONE RESPONSE.
- Write approximately ${targetLength * 150} words for a ${targetLength}-minute video
- FORBIDDEN: Never say "I'll continue", "due to length limits", "in the next response"
- FORBIDDEN: Never use [...], "Continue with", "Note: This is just the first portion"
- FORBIDDEN: Never stop mid-script or promise to continue later
- If you mention "7 secrets", write ALL 7 secrets completely
- Write EVERYTHING from [0:00] to [${targetLength}:00] NOW
</CRITICAL_COMPLETENESS_RULE>

<output_format>
  # ${topic} - YouTube Script

  ## Video Metadata
  - Target Length: ${targetLength} minutes
  - Primary Keywords: Write 5-7 actual keywords separated by commas
  - Suggested Title Options:
    1. Write complete title here
    2. Write complete title here
    3. Write complete title here

  ## Full Script
  Write the COMPLETE script from [0:00] to [${targetLength}:00] with ALL sections.
  Include all timestamps, visual cues, and content.
  DO NOT STOP UNTIL YOU REACH THE END TIME.

  ## Description Template
  Write a COMPLETE YouTube description with these sections:

  🔍 Opening hook - first 125 characters with main keyword

  Full paragraph about what viewers will learn

  ⏱️ TIMESTAMPS:
  0:00 Introduction
  List ALL timestamps from your script

  📚 RESOURCES MENTIONED:
  List resources if any

  🔔 SUBSCRIBE for more content

  📱 CONNECT WITH US:
  Social links

  #️⃣ HASHTAGS:
  Relevant hashtags

  ## Tags
  Write 10-15 actual tags separated by commas like: tag1, tag2, tag3
</output_format>

ABSOLUTE REQUIREMENT: Complete EVERYTHING in this single response. No continuations.
`;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate script output for quality and completeness
 */
export function validateScriptOutput(script: string): ValidationResult {
  if (!script || typeof script !== 'string') {
    return {
      isValid: false,
      errors: ['Script must be a non-empty string']
    };
  }

  // Check for placeholder patterns that indicate incomplete generation
  const placeholderPatterns = [
    /\[Rest of.*\]/i,
    /\[Continue.*\]/i,
    /\[Add more.*\]/i,
    /\[.*remaining.*\]/i,
    /\.\.\.\]$/,  // Ends with ...]
    /etc\.\]$/,   // Ends with etc.]
    /\[Insert.*\]/i,
    /\[Include.*here\]/i
  ];

  const hasPlaceholders = placeholderPatterns.some(pattern => pattern.test(script));

  const validationChecks: ValidationCheck = {
    hasTimestamps: /\d{1,2}:\d{2}/.test(script),
    hasVisualCues: /\[.*\]/.test(script),
    hasQuestions: /\?/.test(script),
    hasSections: script.includes('(') && script.includes(')'),
    reasonable_length: script.length > 1000 && script.length < 50000,
    noPlaceholders: !hasPlaceholders,
    hasDescription: script.includes('## Description') && script.includes('TIMESTAMPS:'),
    hasTags: script.includes('## Tags') && !script.includes('[10-15')
  };

  const errors: string[] = [];
  if (!validationChecks.hasTimestamps) errors.push("Missing timestamps");
  if (!validationChecks.hasVisualCues) errors.push("Missing visual cues");
  if (!validationChecks.hasQuestions) errors.push("No engagement questions");
  if (!validationChecks.hasSections) errors.push("Missing section markers");
  if (!validationChecks.reasonable_length) errors.push("Script length seems incorrect");
  if (!validationChecks.noPlaceholders) errors.push("Contains placeholder text - script incomplete");
  if (!validationChecks.hasDescription) errors.push("Missing complete description section");
  if (!validationChecks.hasTags) errors.push("Missing or incomplete tags section");

  return {
    isValid: errors.length === 0,
    errors: errors,
    checks: validationChecks
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract keywords from a topic for SEO
 */
export function extractKeywords(topic: string): string[] {
  if (!topic || typeof topic !== 'string') {
    return [];
  }

  const words = topic.toLowerCase().split(/\s+/);
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ]);

  return words.filter(word =>
    !stopWords.has(word) &&
    word.length > 2 &&
    !/^\d+$/.test(word) // Filter out pure numbers
  );
}

/**
 * Suggest video length based on topic complexity
 */
export function suggestVideoLength(topic: string): LengthSuggestion {
  if (!topic || typeof topic !== 'string') {
    return { min: 5, optimal: 8, max: 12 };
  }

  const complexTopics = ['tutorial', 'guide', 'explained', 'complete', 'advanced', 'comprehensive', 'deep dive', 'masterclass'];
  const quickTopics = ['tips', 'hacks', 'quick', 'simple', 'easy', 'fast', 'shorts', 'brief'];
  const reviewTopics = ['review', 'comparison', 'versus', 'vs', 'alternative', 'best'];

  const topicLower = topic.toLowerCase();

  if (complexTopics.some(word => topicLower.includes(word))) {
    return { min: 10, optimal: 15, max: 20, reasoning: 'Complex tutorial/guide content' };
  } else if (quickTopics.some(word => topicLower.includes(word))) {
    return { min: 3, optimal: 5, max: 8, reasoning: 'Quick tips or simple content' };
  } else if (reviewTopics.some(word => topicLower.includes(word))) {
    return { min: 7, optimal: 10, max: 15, reasoning: 'Review or comparison content' };
  }

  return { min: 5, optimal: 8, max: 12, reasoning: 'Standard informational content' };
}

/**
 * Generate title variations for CTR optimization
 */
export function generateTitleVariations(topic: string, keywords: string[] = []): TitleVariation[] {
  if (!topic || typeof topic !== 'string') {
    return [];
  }

  // Extract keywords if not provided
  if (!keywords || keywords.length === 0) {
    keywords = extractKeywords(topic);
  }

  const year = new Date().getFullYear();
  const nextYear = year + 1;

  const templates = [
    {
      template: `The Shocking Truth About ${topic}`,
      type: 'curiosity',
      strength: 'high'
    },
    {
      template: `${topic}: Everything You Need to Know in ${year}`,
      type: 'comprehensive',
      strength: 'medium'
    },
    {
      template: `Why ${topic} Changes Everything`,
      type: 'impact',
      strength: 'high'
    },
    {
      template: `${topic} Explained in ${suggestVideoLength(topic).optimal} Minutes`,
      type: 'educational',
      strength: 'medium'
    },
    {
      template: `The Hidden Secret of ${topic}`,
      type: 'mystery',
      strength: 'high'
    },
    {
      template: `${topic} - The Complete ${year} Guide`,
      type: 'guide',
      strength: 'medium'
    },
    {
      template: `Stop Making These ${topic} Mistakes`,
      type: 'mistakes',
      strength: 'high'
    },
    {
      template: `How ${topic} Actually Works (Not What You Think)`,
      type: 'contrarian',
      strength: 'high'
    },
    {
      template: `${topic} in ${nextYear}: What You Must Know`,
      type: 'future',
      strength: 'medium'
    },
    {
      template: `I Tested ${topic} for 30 Days - Here's What Happened`,
      type: 'personal',
      strength: 'high'
    }
  ];

  return templates.map(({ template, type, strength }) => ({
    title: template,
    characterCount: template.length,
    hasKeywords: keywords.some(kw => template.toLowerCase().includes(kw)),
    type: type,
    clickStrength: strength,
    isUnder60Chars: template.length <= 60,
    recommendation: template.length <= 60 ? 'Good length for display' : 'May be truncated in search results'
  }));
}

/**
 * Alternative prompt builder for synthesis-focused approach
 */
export function buildScriptGenerationPrompt(
  topic: string,
  duration: number,
  tone: string,
  research: Research
): string {
  const synthesisSource = research.sources?.find(s => s.source_type === 'synthesis');
  const webSources = research.sources?.filter(s => s.source_type === 'web' && (s.source_content?.length || 0) > 100) || [];

  return `<role>You are an expert YouTube scriptwriter specializing in ${tone} educational content.</role>

<task>
Create a ${duration}-minute YouTube script for the topic: "${topic}"

The script must be engaging, well-researched, and optimized for viewer retention.
</task>

<research_context>
You have been provided with comprehensive research on this topic. The research consists of:

1. **PRIMARY SOURCE - Research Synthesis (MOST IMPORTANT)**
This is a comprehensive analysis combining insights from multiple verified sources:
${synthesisSource?.source_content || 'No synthesis available'}

${webSources.length > 0 ? `
2. **SUPPLEMENTARY SOURCES - Additional Context**
These provide extra detail and specific examples to enrich the script:
${webSources.map((source, i) => `
Source ${i + 1}: ${source.source_title || 'Web Source'}
URL: ${source.source_url}
Content Preview (first 1500 chars):
${source.source_content?.substring(0, 1500)}
${(source.source_content?.length || 0) > 1500 ? `\n[${Math.floor(((source.source_content?.length || 0) - 1500) / 1000)}k more characters available in source]` : ''}
`).join('\n')}
` : ''}

**CRITICAL INSTRUCTIONS:**
- The research synthesis above contains ALL the key facts, statistics, and perspectives you need
- Use supplementary sources ONLY to add specific examples, quotes, or granular details
- DO NOT search for additional information - everything needed is provided above
- If a supplementary source seems relevant but wasn't successfully scraped, the synthesis already covers its key points
- Cite specific facts using the source numbers provided in the synthesis [1], [2], etc.
</research_context>

<script_requirements>
**Duration:** ${duration} minutes (approximately ${Math.floor(duration * 150)} words)

**Structure:**
[0:00] - Hook (30 seconds): Grab attention immediately with the most shocking/interesting fact
[0:30] - Introduction: Set up what the video will cover
[Main Content] - 5-7 key points from the research, each with:
  - Clear subheading with timestamp
  - Supporting facts and statistics from synthesis
  - Specific examples from supplementary sources when available
  - Smooth transitions between points
[Final minute] - Conclusion with key takeaway and call-to-action

**Tone:** ${tone}

**Content Guidelines:**
- Lead with the most compelling information from the synthesis
- Use specific statistics, dates, and facts provided in the research
- Include expert quotes when provided in sources
- Address common misconceptions mentioned in the synthesis
- Provide historical context where relevant
- End with actionable insights for viewers

**Format Requirements:**
- Include timestamps in [MM:SS] format
- Mark visual suggestions with [Visual: description]
- Keep paragraphs short (2-3 sentences max)
- Use conversational language while maintaining accuracy
- NO speculation beyond what's in the research provided
</script_requirements>

<quality_standards>
✓ Every major claim must trace back to the research provided
✓ Use specific numbers, dates, and names from the synthesis
✓ Incorporate expert quotes when available in sources
✓ Maintain narrative flow with clear transitions
✓ Balance entertainment value with educational depth
✗ DO NOT make up facts or statistics not in the research
✗ DO NOT search for additional information - use only what's provided
✗ DO NOT include generic filler content
</quality_standards>

Begin writing the script now:`;
}

/**
 * Main orchestrator function with error handling and validation
 */
export function generateOptimizedScript(options: {
  topic: string;
  targetLength?: number;
  tone?: string;
  audience?: string;
  includeKeywords?: boolean;
  includeTitleSuggestions?: boolean;
  validateOutput?: boolean;
  frame?: string | null;
  hook?: string | null;
  contentPoints?: ContentPoint[] | null;
  research?: Research | null;
  voiceProfile?: VoiceProfile | null;
  thumbnail?: string | null;
  targetAudience?: string | TargetAudience | null;
  sponsor?: Sponsor | null;
}): OptimizedScriptResult {
  console.log('\n🚀 === GENERATE OPTIMIZED SCRIPT CALLED ===');
  console.log('Options provided:', Object.keys(options));

  try {
    const {
      topic,
      targetLength = 10,
      tone = 'professional',
      audience = 'general',
      includeKeywords = true,
      includeTitleSuggestions = true,
      validateOutput: shouldValidate = true,
      frame = null,
      hook = null,
      contentPoints = null,
      research = null,
      voiceProfile = null,
      thumbnail = null,
      targetAudience = null,
      sponsor = null
    } = options;

    // Validate inputs
    if (!topic) {
      throw new Error('Topic is required');
    }

    // Create workflow context object with all parameters
    const workflowContext: WorkflowContext = {
      frame,
      hook,
      contentPoints,
      research,
      voiceProfile,
      thumbnail,
      targetAudience: targetAudience || audience,
      tone,
      sponsor
    };

    console.log('📦 WORKFLOW CONTEXT CREATED:');
    console.log('- Has frame:', !!frame);
    console.log('- Has hook:', !!hook);
    console.log('- Has contentPoints:', !!contentPoints);
    console.log('- Has research:', !!research);
    console.log('- Has voiceProfile:', !!voiceProfile);
    console.log('- Has thumbnail:', !!thumbnail);
    console.log('- Target audience:', targetAudience || audience);
    console.log('- Tone:', tone);

    // Generate the prompt with workflow context
    const prompt = generateYouTubeScriptPrompt(topic, targetLength, workflowContext);

    // Extract keywords
    const keywords = includeKeywords ? extractKeywords(topic) : [];

    // Get video length suggestions
    const lengthSuggestion = suggestVideoLength(topic);

    // Generate title variations
    const titleVariations = includeTitleSuggestions ?
      generateTitleVariations(topic, keywords) : [];

    // Prepare the complete output
    const result: OptimizedScriptResult = {
      prompt: prompt,
      metadata: {
        topic: topic,
        targetLength: targetLength,
        tone: tone,
        audience: audience,
        keywords: keywords,
        lengthSuggestion: lengthSuggestion,
        titleVariations: titleVariations,
        generatedAt: new Date().toISOString()
      }
    };

    console.log('\n📄 RESULT METADATA:');
    console.log('- Prompt length:', prompt.length, 'characters');
    console.log('- Keywords extracted:', keywords.length);
    console.log('- Title variations:', titleVariations.length);
    console.log('- Length suggestion:', lengthSuggestion);
    console.log('=== END GENERATE OPTIMIZED SCRIPT ===\n');

    // Add validation function if requested
    if (shouldValidate) {
      result.validate = (script: string) => validateScriptOutput(script);
    }

    return result;

  } catch (error) {
    console.error('Error generating optimized script:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      prompt: null,
      metadata: {
        topic: options.topic || '',
        targetLength: options.targetLength || 10,
        tone: options.tone || 'professional',
        audience: options.audience || 'general',
        keywords: [],
        lengthSuggestion: { min: 5, optimal: 8, max: 12 },
        titleVariations: [],
        generatedAt: new Date().toISOString(),
        errorOccurred: true
      }
    };
  }
}
