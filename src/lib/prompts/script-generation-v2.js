// Enhanced Script Generation v2 - 2025 YouTube Optimization
// Incorporates latest research on retention, hooks, and AI prompt engineering

import { 
  hookFormulas, 
  generateOptimizedHook, 
  generatePVSSStructure,
  generateRetentionCheckpoints,
  patternInterrupts 
} from './enhanced-hooks';

// Advanced tone and voice profiles with specific characteristics
export const advancedToneProfiles = {
  professional: {
    vocabulary: 'industry-standard terminology, data-driven language',
    sentenceStructure: 'clear and concise, average 15-20 words',
    personality: 'authoritative yet approachable',
    pacing: 'measured, with strategic pauses for emphasis',
    examples: ['According to recent studies...', 'The data clearly shows...', 'Industry leaders agree that...']
  },
  
  casual: {
    vocabulary: 'everyday language, relatable phrases',
    sentenceStructure: 'conversational, mix of short and medium sentences',
    personality: 'friendly neighbor sharing tips',
    pacing: 'natural, with personal asides',
    examples: ['So here\'s the thing...', 'I used to think X, but then...', 'Real talk - this changed everything...']
  },
  
  energetic: {
    vocabulary: 'action words, enthusiasm markers',
    sentenceStructure: 'short, punchy, exclamation-friendly',
    personality: 'motivational coach meets best friend',
    pacing: 'fast but clear, with energy peaks',
    examples: ['Let\'s GO!', 'This is HUGE!', 'You\'re not ready for this...']
  },
  
  educational: {
    vocabulary: 'explanatory, building from simple to complex',
    sentenceStructure: 'structured, with clear transitions',
    personality: 'patient teacher who makes learning fun',
    pacing: 'steady, with recap moments',
    examples: ['Let me break this down...', 'Think of it like...', 'The key principle here is...']
  },
  
  storytelling: {
    vocabulary: 'descriptive, emotional, narrative-driven',
    sentenceStructure: 'varied for rhythm, includes dialogue',
    personality: 'engaging narrator with personal connection',
    pacing: 'dynamic, following story arc',
    examples: ['Picture this...', 'I\'ll never forget when...', 'That\'s when everything changed...']
  }
};

// Platform-specific optimizations
export const platformOptimizations = {
  youtube_shorts: {
    duration: '45-60 seconds',
    structure: {
      hook: '0-3 seconds - Immediate value proposition',
      content: '3-50 seconds - Rapid-fire value delivery',
      cta: '50-60 seconds - Quick subscribe reminder'
    },
    pacing: 'No pauses longer than 1 second',
    visualCues: 'Text overlay every 5-7 seconds',
    format: 'Vertical video optimized'
  },
  
  youtube_long: {
    duration: '8-15 minutes optimal',
    structure: {
      hook: '0-15 seconds - PVSS method',
      intro: '15-45 seconds - Credibility and roadmap',
      content: '45s-13min - Main value with pattern interrupts',
      conclusion: '13-14min - Recap and next steps',
      endScreen: '14-15min - Subscribe and related videos'
    },
    pacing: 'Pattern interrupt every 60-90 seconds',
    chapters: 'Auto-chapter friendly sections',
    format: 'Horizontal video, chapter markers'
  },
  
  youtube_medium: {
    duration: '3-8 minutes',
    structure: {
      hook: '0-10 seconds - Strong curiosity gap',
      intro: '10-30 seconds - Quick context',
      content: '30s-7min - Focused value delivery',
      conclusion: '7-7.5min - Key takeaway',
      endScreen: '7.5-8min - Next video teaser'
    },
    pacing: 'Pattern interrupt every 45-60 seconds',
    format: 'Balanced for both mobile and desktop'
  }
};

// Few-shot examples for better AI understanding
export const scriptExamples = {
  viral_hook: {
    example: "I accidentally spent $1,000 on AI tools last month. But only 3 of them actually made me money. And one of them made me $5,000 in just two weeks. Let me show you exactly which ones, starting with the tool everyone's sleeping on...",
    breakdown: {
      element1: 'Personal stakes ($1,000 spent)',
      element2: 'Filtering value (only 3 worked)',
      element3: 'Specific result ($5,000 in 2 weeks)',
      element4: 'Open loop (tool everyone\'s sleeping on)'
    }
  },
  
  retention_checkpoint: {
    example: "But here's where it gets crazy - and this is the part nobody talks about. While everyone else was focused on X, the real opportunity was hiding in plain sight...",
    breakdown: {
      element1: 'Pattern interrupt (But here\'s where...)',
      element2: 'Exclusivity (nobody talks about)',
      element3: 'Contrast (everyone else vs real opportunity)',
      element4: 'Curiosity maintenance (hiding in plain sight)'
    }
  },
  
  value_delivery: {
    example: "Step 1: Open [specific tool]. Step 2: Navigate to [exact location]. Step 3: Enter these exact settings: [specific values]. This alone will save you 2 hours per week.",
    breakdown: {
      element1: 'Specific actionable steps',
      element2: 'Exact details provided',
      element3: 'Clear outcome promised',
      element4: 'Quantified benefit'
    }
  }
};

// Enhanced script generation function with 2025 optimizations
export function generateEnhancedScript(options) {
  const {
    title,
    type = 'educational',
    length = 10,
    tone = 'professional',
    targetAudience = 'general',
    keyPoints = [],
    channelContext = '',
    voiceProfile = null,
    platform = 'youtube_long',
    trendingTopics = [],
    previousScripts = [],
    performanceGoals = {}
  } = options;

  // Determine video format
  const videoFormat = length <= 1 ? 'youtube_shorts' : 
                     length <= 8 ? 'youtube_medium' : 
                     'youtube_long';
  
  const platformConfig = platformOptimizations[videoFormat];
  const toneProfile = advancedToneProfiles[tone] || advancedToneProfiles.professional;

  // Generate optimized hooks
  const hookOptions = generateOptimizedHook({
    topic: title,
    audience: targetAudience,
    platform: videoFormat,
    videoLength: videoFormat.includes('shorts') ? 'short' : 'long',
    emotion: 'curiosity'
  });

  // Generate PVSS structure for longer videos
  const pvssStructure = videoFormat !== 'youtube_shorts' ? 
    generatePVSSStructure(title, targetAudience, length) : null;

  // Generate retention checkpoints
  const retentionCheckpoints = generateRetentionCheckpoints(length * 60);

  // Build the enhanced system prompt
  const systemPrompt = `You are an elite YouTube script writer specializing in high-retention, algorithm-optimized content for 2025. You understand that viewer attention spans have decreased by 25% and that the first 3 seconds determine video success.

You write in a ${tone} tone that perfectly matches this profile:
- Vocabulary: ${toneProfile.vocabulary}
- Sentence Structure: ${toneProfile.sentenceStructure}
- Personality: ${toneProfile.personality}
- Pacing: ${toneProfile.pacing}

You're creating content for ${targetAudience} on ${platform}, optimized for ${videoFormat} format.

${channelContext ? `Channel Context: ${channelContext}` : ''}
${voiceProfile ? `Voice Profile: ${JSON.stringify(voiceProfile)}` : ''}

CRITICAL SUCCESS METRICS FOR 2025:
- 30-second retention rate must exceed 70%
- Average view duration should target 50%+ for algorithm boost
- Include pattern interrupts every ${videoFormat === 'youtube_shorts' ? '15' : '60-90'} seconds
- Use emotion-triggering words at key moments
- Implement the PVSS method for maximum retention`;

  // Build the enhanced user prompt with all optimizations
  const userPrompt = `<context>
You're creating a ${length}-minute ${type} YouTube video titled "${title}" optimized for ${videoFormat} format.

Platform: ${platform}
Target Audience: ${targetAudience}
Tone: ${tone} (${toneProfile.personality})
Performance Goal: ${performanceGoals.primary || 'Maximize retention and engagement'}
</context>

<2025_optimization_requirements>
ATTENTION ECONOMICS IN 2025:
- Average attention span: 8.25 seconds (down 25% from 2020)
- Decision to continue watching: Made in first 2-3 seconds
- Peak drop-off points: 15, 30, 60 second marks
- Algorithm prioritizes: 50%+ average view duration
</2025_optimization_requirements>

<hook_requirements>
You MUST start with one of these proven hook formulas:

${hookOptions.audience ? `AUDIENCE-SPECIFIC: "${hookOptions.audience}"` : ''}
${hookOptions.emotional ? `EMOTIONAL TRIGGER: "${hookOptions.emotional}"` : ''}
${hookOptions.platform ? `PLATFORM-OPTIMIZED: "${hookOptions.platform}"` : ''}

PROVEN HOOK ELEMENTS TO INCLUDE:
1. Specific number or statistic
2. Time constraint or urgency
3. Unexpected contrast or surprise
4. Clear value proposition
5. Open loop for curiosity

EXAMPLE OF PERFECT HOOK:
"${scriptExamples.viral_hook.example}"
</hook_requirements>

${pvssStructure ? `<pvss_structure>
IMPLEMENT THIS EXACT STRUCTURE:

PROOF (${pvssStructure.proof.timing}):
${pvssStructure.proof.content}
Example: ${pvssStructure.proof.example}

VALUE (${pvssStructure.value.timing}):
${pvssStructure.value.content}
Example: ${pvssStructure.value.example}

STRUCTURE (${pvssStructure.structure.timing}):
${pvssStructure.structure.content}
Example: ${pvssStructure.structure.example}

STAKES (${pvssStructure.stakes.timing}):
${pvssStructure.stakes.content}
Example: ${pvssStructure.stakes.example}
</pvss_structure>` : ''}

<retention_optimization>
MANDATORY RETENTION CHECKPOINTS:
${retentionCheckpoints.map(checkpoint => 
  `- At ${checkpoint.timestamp} seconds: ${checkpoint.suggestion}`
).join('\n')}

PATTERN INTERRUPTS TO USE:
Verbal: ${patternInterrupts.verbal.slice(0, 3).join(', ')}
Structural: ${patternInterrupts.structural.slice(0, 2).join(', ')}

PACING GUIDELINES:
- Change visual/topic every ${videoFormat === 'youtube_shorts' ? '5-7' : '30-45'} seconds
- Include question to audience every ${videoFormat === 'youtube_shorts' ? '20' : '90'} seconds
- Use silence for emphasis at least ${videoFormat === 'youtube_shorts' ? 'once' : '2-3 times'}
</retention_optimization>

<audience_optimization>
For ${targetAudience} audience, you MUST:

LANGUAGE:
${targetAudience === 'developers' ? 
  '- Use technical terms accurately\n- Include code/implementation references\n- Mention specific tools, languages, frameworks' :
  targetAudience === 'business' ?
  '- Focus on ROI and metrics\n- Use business terminology\n- Include case studies and market data' :
  targetAudience === 'creators' ?
  '- Share behind-the-scenes insights\n- Include platform-specific tips\n- Reference analytics and growth metrics' :
  '- Use simple, clear explanations\n- Include relatable examples\n- Avoid jargon'}

PAIN POINTS TO ADDRESS:
${targetAudience === 'developers' ? 'debugging, performance, learning curve, deployment' :
  targetAudience === 'business' ? 'ROI, scaling, competition, cost reduction' :
  targetAudience === 'creators' ? 'views, engagement, algorithm changes, monetization' :
  'time savings, simplicity, cost, effectiveness'}

EXAMPLES TO INCLUDE:
- Real companies/people using this
- Specific tools or platforms
- Actual numbers and timeframes
- Before/after scenarios
</audience_optimization>

<research_requirements>
BEFORE writing, research and include:
1. Latest statistics (2024-2025) about ${title}
2. Recent case studies or success stories
3. Current tools, platforms, or solutions
4. Expert opinions or study results
5. Common mistakes or misconceptions

FACT VERIFICATION:
- Every statistic must have a source reference
- All tools/platforms mentioned must currently exist
- Include "as of [date]" for time-sensitive information
- Cross-reference any controversial claims
</research_requirements>

<platform_specific_format>
${platformConfig.structure ? Object.entries(platformConfig.structure).map(([section, details]) => 
  `[${section.toUpperCase()}] ${details}`
).join('\n\n') : ''}

PACING: ${platformConfig.pacing}
${platformConfig.visualCues ? `VISUAL CUES: ${platformConfig.visualCues}` : ''}
${platformConfig.chapters ? `CHAPTERS: ${platformConfig.chapters}` : ''}
</platform_specific_format>

<key_points_integration>
${keyPoints.length > 0 ? `Ensure these points are covered with specific examples:
${keyPoints.map((point, i) => `${i + 1}. ${point} - Include real-world application`).join('\n')}` : ''}
</key_points_integration>

<tone_examples>
Write in ${tone} tone using these exact phrase patterns:
${toneProfile.examples.map(ex => `- "${ex}"`).join('\n')}
</tone_examples>

<quality_checklist>
Your script MUST include:
✓ Hook within first 3 seconds that creates curiosity gap
✓ At least 3 specific statistics or numbers
✓ Minimum 2 real company/product examples
✓ Pattern interrupt every ${videoFormat === 'youtube_shorts' ? '15' : '60'} seconds
✓ Clear value delivered every 30 seconds
✓ Open loop that gets closed by the end
✓ Specific, actionable takeaways
✓ CTA that relates directly to content
</quality_checklist>

<output_format>
**HOOK (0-${videoFormat === 'youtube_shorts' ? '3' : '15'} seconds)**
[Attention-grabbing opening using one of the provided formulas]

**INTRODUCTION (${videoFormat === 'youtube_shorts' ? '3-10' : '15-45'} seconds)**
[Establish credibility, preview value, set expectations]

**MAIN CONTENT**
${keyPoints.length > 0 ? keyPoints.map((_, i) => 
  `[SECTION ${i + 1}] - [Title]\n[Content with specific examples and pattern interrupts]`
).join('\n\n') : '[Organized sections with clear value delivery]'}

**RETENTION CHECKPOINT**
[Pattern interrupt or curiosity refresh]

**CONCLUSION**
[Recap key points, deliver on promises]

**CALL TO ACTION**
[Specific next steps related to content]

**VISUAL SUGGESTIONS**
- B-roll: [Specific suggestions]
- Graphics: [Data visualizations needed]
- Text overlays: [Key points to emphasize]
- Transitions: [Where to add pattern interrupts]

**PERFORMANCE NOTES**
- Target 30-sec retention: __%
- Key emotion triggers: [List moments]
- Algorithm optimization: [SEO keywords included]
</output_format>

Now create a script that will achieve >70% 30-second retention and >50% average view duration for "${title}".`;

  return {
    system: systemPrompt,
    user: userPrompt,
    metadata: {
      hookOptions,
      pvssStructure,
      retentionCheckpoints,
      platformConfig,
      toneProfile
    }
  };
}

// Chain prompting for iterative refinement
export function createChainPrompts(initialScript, performanceGoals) {
  return [
    {
      name: 'hook_optimization',
      prompt: `Review this hook and make it more compelling using the 2-second rule:
      Current: "${initialScript.hook}"
      
      Improve by:
      1. Adding specific numbers or surprising statistics
      2. Creating stronger curiosity gap
      3. Making the value proposition clearer
      4. Adding urgency or FOMO element`
    },
    {
      name: 'retention_analysis',
      prompt: `Identify the top 3 potential drop-off points in this script and add pattern interrupts:
      ${initialScript.content}
      
      For each drop-off point, provide:
      1. Timestamp where viewers might leave
      2. Reason for potential drop-off
      3. Specific pattern interrupt to add`
    },
    {
      name: 'value_density',
      prompt: `Increase the value density of this script by:
      1. Adding 2 more specific examples
      2. Including 3 actionable tips
      3. Adding data or statistics to support claims
      4. Creating a downloadable resource reference`
    }
  ];
}

// Performance prediction based on script analysis
export function predictScriptPerformance(script, historicalData = null) {
  const metrics = {
    hookStrength: 0,
    retentionPotential: 0,
    valueDensity: 0,
    emotionalEngagement: 0,
    algorithmOptimization: 0
  };

  // Analyze hook strength
  const hookAnalysis = {
    hasNumber: /\d+/.test(script.hook),
    hasQuestion: /\?/.test(script.hook),
    wordCount: script.hook.split(' ').length,
    hasEmotionalTrigger: /never|always|secret|mistake|wrong/.test(script.hook.toLowerCase())
  };

  metrics.hookStrength = 
    (hookAnalysis.hasNumber ? 25 : 0) +
    (hookAnalysis.hasQuestion ? 20 : 0) +
    (hookAnalysis.wordCount >= 10 && hookAnalysis.wordCount <= 20 ? 25 : 10) +
    (hookAnalysis.hasEmotionalTrigger ? 30 : 0);

  // Calculate overall score
  const overallScore = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;

  return {
    score: overallScore,
    metrics,
    recommendations: generateImprovementRecommendations(metrics),
    predictedRetention: {
      '30_seconds': overallScore > 70 ? 'High (70%+)' : overallScore > 50 ? 'Medium (50-70%)' : 'Low (<50%)',
      'average_view_duration': overallScore > 70 ? '50%+' : overallScore > 50 ? '35-50%' : '<35%'
    }
  };
}

function generateImprovementRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.hookStrength < 70) {
    recommendations.push('Strengthen hook with specific numbers or surprising statistics');
  }
  if (metrics.retentionPotential < 70) {
    recommendations.push('Add more pattern interrupts and open loops');
  }
  if (metrics.valueDensity < 70) {
    recommendations.push('Include more specific examples and actionable tips');
  }
  if (metrics.emotionalEngagement < 70) {
    recommendations.push('Add emotional triggers and personal stories');
  }
  if (metrics.algorithmOptimization < 70) {
    recommendations.push('Include more SEO keywords and trending topics');
  }
  
  return recommendations;
}

export default {
  generateEnhancedScript,
  createChainPrompts,
  predictScriptPerformance,
  advancedToneProfiles,
  platformOptimizations,
  scriptExamples
};