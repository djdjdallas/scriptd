/**
 * Optimized YouTube Script Prompt Generator
 * Focused on factual accuracy and engagement optimization
 * Created: ${new Date().toISOString()}
 */

// Main generator function with enhanced fact-checking and YouTube optimization
const generateYouTubeScriptPrompt = (topic, targetLength = 10, workflowContext = {}) => {
  // Input validation
  if (!topic || typeof topic !== 'string') {
    throw new Error('Topic is required and must be a string');
  }
  
  if (targetLength < 1 || targetLength > 60) {
    throw new Error('Target length must be between 1 and 60 minutes');
  }

  // Extract workflow context
  const {
    frame = {},
    hook = null,
    contentPoints = [],
    research = {},
    voiceProfile = null,
    thumbnail = null
  } = workflowContext;

  // Process research sources
  const verifiedSources = research?.sources?.filter(s => s.fact_check_status === 'verified') || [];
  const starredSources = research?.sources?.filter(s => s.is_starred) || [];
  const allSources = [...verifiedSources, ...starredSources];

  return `
<role>You are an expert YouTube scriptwriter specializing in engaging, factual content</role>

<context>
  <purpose>Create a comprehensive YouTube script about ${topic}</purpose>
  <audience>General audience interested in the topic</audience>
  <video_length>${targetLength} minutes</video_length>
  ${frame?.problem_statement ? `<narrative_frame>
    <problem>${frame.problem_statement}</problem>
    <solution>${frame.solution_approach || 'To be developed'}</solution>
    <transformation>${frame.transformation_outcome || 'Positive change'}</transformation>
  </narrative_frame>` : ''}
  ${voiceProfile ? `<voice_profile>
    <name>${voiceProfile.name}</name>
    ${voiceProfile.description ? `<style>${voiceProfile.description}</style>` : ''}
  </voice_profile>` : ''}
</context>

<content_structure>
  <hook duration="15-30s">
    ${hook ? `- USE THIS EXACT HOOK: "${hook}"` : '- Start with compelling question or shocking statistic'}
    - Create immediate curiosity gap
    - Promise value within first 15 seconds
  </hook>
  <preview duration="15s">Brief overview of what viewers will learn</preview>
  <main_content>
    ${contentPoints?.points?.length > 0 ? 
    contentPoints.points.map((point, index) => `
    <section_${index + 1} duration="${point.duration}s">
      <title>${point.title}</title>
      <description>${point.description}</description>
      <key_takeaway>${point.keyTakeaway}</key_takeaway>
      - Include visual cues and B-roll suggestions
      - Add engagement element (question/poll)
      - Smooth transition to next section
    </section_${index + 1}>`).join('') : 
    `<section_template>
      - Section title with timestamp
      - 2-3 verified key points with evidence
      - Visual cue suggestions [B-roll notes]
      - Engagement hook (question/poll/comment prompt)
      - Smooth transition to next section
    </section_template>`}
  </main_content>
  <conclusion duration="30s">
    - Recap key takeaways
    - Call-to-action for comments/subscribe
    - Tease next video (if applicable)
  </conclusion>
</content_structure>

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
  ${allSources.length > 0 ? `
  <research_to_include>
    ${verifiedSources.length > 0 ? `
    <verified_sources>
      ${verifiedSources.map(s => `- ${s.source_title}: ${s.source_content?.substring(0, 200)}...`).join('\n      ')}
    </verified_sources>` : ''}
    ${starredSources.length > 0 ? `
    <important_sources>
      ${starredSources.map(s => `- ${s.source_title}: ${s.source_content?.substring(0, 200)}...`).join('\n      ')}
    </important_sources>` : ''}
  </research_to_include>` : ''}
</content_requirements>

<constraints>
  <must_avoid>
    - Unverified claims or statistics
    - Clickbait without substance
    - Excessive repetition
    - Copyright violations
    - Harmful or misleading information
  </must_avoid>
  <must_include>
    - Accurate, fact-checked information
    - Clear value proposition
    - Actionable takeaways
    - Proper content warnings if needed
  </must_include>
</constraints>

<output_format>
  # ${topic} - YouTube Script
  
  ## Video Metadata
  - Target Length: ${targetLength} minutes
  - Primary Keywords: [list keywords]
  - Suggested Title Options: [2-3 options]
  
  ## Full Script
  [Complete script with all sections, timestamps, and production notes]
  
  ## Description Template
  [First 125 characters optimized for SEO]
  [Rest of description with timestamps and links]
  
  ## Tags
  [10-15 relevant tags]
</output_format>
`;
};

// Validation function for script output
const validateScriptOutput = (script) => {
  if (!script || typeof script !== 'string') {
    return {
      isValid: false,
      errors: ['Script must be a non-empty string']
    };
  }

  const validationChecks = {
    hasTimestamps: /\d{1,2}:\d{2}/.test(script),
    hasVisualCues: /\[.*\]/.test(script),
    hasQuestions: /\?/.test(script),
    hasSections: script.includes('(') && script.includes(')'),
    reasonable_length: script.length > 1000 && script.length < 50000
  };
  
  const errors = [];
  if (!validationChecks.hasTimestamps) errors.push("Missing timestamps");
  if (!validationChecks.hasVisualCues) errors.push("Missing visual cues");
  if (!validationChecks.hasQuestions) errors.push("No engagement questions");
  if (!validationChecks.hasSections) errors.push("Missing section markers");
  if (!validationChecks.reasonable_length) errors.push("Script length seems incorrect");
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    checks: validationChecks
  };
};

// Helper function to extract keywords from a topic
const extractKeywords = (topic) => {
  if (!topic || typeof topic !== 'string') {
    return [];
  }
  
  // Extract main keywords from topic for SEO
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
};

// Function to suggest video length based on topic complexity
const suggestVideoLength = (topic) => {
  if (!topic || typeof topic !== 'string') {
    return { min: 5, optimal: 8, max: 12 }; // default
  }
  
  // Suggest optimal length based on topic complexity
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
};

// Function to generate title variations
const generateTitleVariations = (topic, keywords = []) => {
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
};

// Enhanced main function with error handling and validation
const generateOptimizedScript = (options = {}) => {
  try {
    const {
      topic,
      targetLength = 10,
      tone = 'professional',
      audience = 'general',
      includeKeywords = true,
      includeTitleSuggestions = true,
      validateOutput = true,
      // Workflow context
      frame = null,
      hook = null,
      contentPoints = null,
      research = null,
      voiceProfile = null,
      thumbnail = null
    } = options;
    
    // Validate inputs
    if (!topic) {
      throw new Error('Topic is required');
    }
    
    // Create workflow context object
    const workflowContext = {
      frame,
      hook,
      contentPoints,
      research,
      voiceProfile,
      thumbnail
    };
    
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
    const result = {
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
    
    // Add validation function if requested
    if (validateOutput) {
      result.validate = (script) => validateScriptOutput(script);
    }
    
    return result;
    
  } catch (error) {
    console.error('Error generating optimized script:', error);
    return {
      error: error.message,
      prompt: null,
      metadata: {
        generatedAt: new Date().toISOString(),
        errorOccurred: true
      }
    };
  }
};

// Test function for development
const testGenerator = () => {
  const testCases = [
    "The Ashley Madison Hack",
    "Quick Tips for Better Sleep",
    "Complete Python Tutorial for Beginners",
    "iPhone 15 vs Samsung S24 Review",
    ""  // Empty topic for error testing
  ];
  
  console.log("Testing YouTube Script Generator...\n");
  
  testCases.forEach((testTopic, index) => {
    console.log(`Test Case ${index + 1}: "${testTopic}"`);
    console.log("-".repeat(50));
    
    const result = generateOptimizedScript({
      topic: testTopic,
      targetLength: 10,
      validateOutput: true
    });
    
    if (result.error) {
      console.log("Error:", result.error);
    } else {
      console.log("Keywords:", result.metadata.keywords);
      console.log("Suggested Length:", result.metadata.lengthSuggestion);
      console.log("Title Variations:", result.metadata.titleVariations.slice(0, 3).map(t => t.title));
      
      // Test validation with mock script
      if (result.validate) {
        const mockScript = "0:00 Introduction [Visual: Logo]\n0:30 Main content with question?\n(Section 1)";
        const validation = result.validate(mockScript);
        console.log("Validation Test:", validation);
      }
    }
    
    console.log("\n");
  });
};

// Export all functions for use in your app
module.exports = {
  generateYouTubeScriptPrompt,
  validateScriptOutput,
  extractKeywords,
  suggestVideoLength,
  generateTitleVariations,
  generateOptimizedScript,
  testGenerator,
  default: generateOptimizedScript
};