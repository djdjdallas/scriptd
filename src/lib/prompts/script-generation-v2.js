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

// Enhanced script generation function with 2025 optimizations + MANDATORY FACT-CHECKING
export function generateEnhancedScript(options) {
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
    platform = 'youtube_long',
    trendingTopics = [],
    previousScripts = [],
    performanceGoals = {},
    enableFactChecking = true // MANDATORY fact-checking enabled by default
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

  // Build the enhanced system prompt with MANDATORY 4-CARD STRUCTURE and fact-checking
  const systemPrompt = `You are an elite YouTube script writer specializing in high-retention, algorithm-optimized content for 2025.

MANDATORY OUTPUT STRUCTURE - YOU MUST CREATE EXACTLY 4 CARDS:
🔴 CARD 1: MAIN SCRIPT - Clean performance content ONLY
🔴 CARD 2: RESEARCH & VERIFICATION - ALL fact-checking and sources
🔴 CARD 3: PRODUCTION GUIDE - ALL visual/audio suggestions
🔴 CARD 4: METADATA & OPTIMIZATION - ALL SEO and analytics

CRITICAL REQUIREMENTS:
⚠️ YOU MUST CREATE ALL 4 CARDS - NO EXCEPTIONS
⚠️ EACH CARD MUST HAVE SUBSTANTIAL CONTENT
⚠️ CARDS MUST BE CLEARLY SEPARATED WITH DIVIDERS
⚠️ MISSING ANY CARD = INCOMPLETE RESPONSE
🔴 You MUST verify ALL information through web searches BEFORE including it
🔴 You MUST NEVER create fictional companies, products, or statistics
🔴 Scripts with unverified information will be REJECTED

You understand that viewer attention spans have decreased by 25% and that the first 3 seconds determine video success. However, viral misinformation destroys channel credibility permanently.

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
${topic ? `\nTopic Description: ${topic}` : ''}

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

<mandatory_fact_checking_protocol>

🚨 MANDATORY WEB SEARCHES BEFORE WRITING (MINIMUM ${5 + keyPoints.length} SEARCHES):

1. ENTITY VERIFICATION (REQUIRED FOR EVERY MENTION):
   ✓ Search: "[company name] official website exists real 2025"
   ✓ Search: "[product name] features pricing current 2024 2025"
   ✓ Search: "[service name] reviews legitimate verification"
   ⚠️ If cannot verify → Mark as [HYPOTHETICAL EXAMPLE] or remove

2. STATISTICAL ACCURACY (REQUIRED FOR EVERY NUMBER):
   ✓ Search: "[statistic] source study research 2024 2025"
   ✓ Search: "[percentage claim] fact check accurate data"
   ✓ Must find source within last 24 months
   ✓ Include: <!-- Source: [URL] [Date Accessed] -->
   ⚠️ NEVER round 3% to 35% for drama - use exact figures

3. CURRENT INFORMATION VERIFICATION:
   ✓ Search: "${title} latest news updates 2024 2025"
   ✓ Search: "${title} recent developments breakthroughs"
   ✓ Search: "${title} market leaders top companies 2025"
   ✓ Prioritize last 12 months, max 18 months old

4. PRICING/FEATURES VERIFICATION:
   ✓ Search: "[product] pricing plans cost 2025"
   ✓ Search: "[service] features comparison alternatives"
   ✓ Never guess prices - only verified current pricing
   ✓ If no pricing found, state "pricing available upon request"

5. CONTROVERSY/ACCURACY CHECK:
   ✓ Search: "${title} controversy debunked fact check"
   ✓ Search: "${title} myths misconceptions false claims"
   ✓ Search: "${title} problems issues complaints"
   ✓ Include balanced perspective if controversies exist

${keyPoints.length > 0 ? `6. KEY POINTS DEEP VERIFICATION:
${keyPoints.map((point, i) => `   ✓ Search ${i+1}: "${point} facts data statistics 2024 2025 verified"
   ✓ Search ${i+1}b: "${point} examples case studies real world"`).join('\n')}` : ''}

VERIFICATION STATUS TAGS (REQUIRED):
[VERIFIED] - Confirmed through 2+ reputable sources
[LIKELY ACCURATE] - 1 source found, appears credible
[UNVERIFIED] - No sources found, needs checking
[HYPOTHETICAL] - Fictional example, clearly marked

⛔ AUTOMATIC REJECTION TRIGGERS:
- Any fictional company presented as real
- Statistics without sources
- Outdated information (>2 years) presented as current
- More than 20% unverified claims
</mandatory_fact_checking_protocol>

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

<enhanced_quality_checklist>
Your script MUST include:
✓ Hook within first 3 seconds with VERIFIED compelling fact
✓ At least 3 VERIFIED statistics with sources (dated within 2 years)
✓ Minimum 2 REAL, VERIFIED company/product examples (not fictional)
✓ Pattern interrupt every ${videoFormat === 'youtube_shorts' ? '15' : '60'} seconds
✓ Clear FACTUAL value delivered every 30 seconds
✓ Open loop that gets closed with VERIFIED information
✓ Specific, actionable takeaways based on REAL tools/methods
✓ CTA that relates directly to content
✓ [VERIFIED] tags for all factual claims
✓ Source citations as HTML comments throughout
✓ Complete FACT-CHECK NOTES section at end

⚠️ REJECTION CRITERIA:
❌ Any fictional entity presented as real = INSTANT REJECTION
❌ Statistics without sources = REJECTION
❌ >20% unverified claims = REJECTION
❌ Missing fact-check notes = REJECTION
</enhanced_quality_checklist>

<mandatory_enhanced_output_format>
YOUR OUTPUT MUST BE EXACTLY IN THIS FORMAT:

## 📝 CARD 1: MAIN SCRIPT
[This card contains ONLY the clean, speakable script - NO sources, NO verification tags]

**HOOK (0:00-0:15)**
[Your compelling opening line - pure dialogue only]

**PVSS STRUCTURE (0:15-0:30)**
PROOF: [Your credibility statement]
VALUE: [What they'll learn today]
STRUCTURE: [How you'll teach it]
STAKES: [Why this matters now]

**MAIN CONTENT (0:30-${Math.floor(length * 0.85)}:00)**
[All spoken content organized by sections]
[Include pattern interrupts marked simply]
[Natural transitions between topics]

**CONCLUSION (${Math.floor(length * 0.85)}:00-${length}:00)**
[Summary and call to action]

---

## 🔍 CARD 2: RESEARCH & VERIFICATION
[This card contains ALL fact-checking and source material]

### Web Search Verification Log
**REQUIRED: Minimum ${5 + keyPoints.length} searches performed**
1. Search: "[exact query]" → Result: [key finding]
2. Search: "[exact query]" → Result: [key finding]
3. Search: "[exact query]" → Result: [key finding]
4. Search: "[exact query]" → Result: [key finding]
5. Search: "[exact query]" → Result: [key finding]
[Continue for all searches]

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

[Continue for ALL claims]

### Statistics Used
📊 **Stat 1**: [Exact number/percentage]
   - Context: [How it's used in script]
   - Source: [Where it came from]
   - Year: [Data year]

### Fact-Check Summary
- Total searches performed: [#]
- Total claims made: [#]
- Claims verified: [#] ([%])
- Confidence level: [High/Medium/Low]

---

## 🎬 CARD 3: PRODUCTION GUIDE
[This card contains ALL visual and audio suggestions]

### Visual Timeline
**0:00-0:15 - HOOK**
- B-roll needed: [Specific footage description]
- Text overlay: "[Exact text to display]"
- Graphics: [Any animations or graphics]

**0:15-0:30 - PVSS**
- Visual style: [How to present this section]
- Text overlays: [Key points to emphasize]

[Continue for EVERY section]

### Audio Requirements
**Background Music**
- Intro (0:00-0:30): [Style/mood]
- Main content: [Style/mood]
- Outro: [Style/mood]

**Sound Effects**
- [Timestamp]: [Effect type] - [Purpose]

### Pattern Interrupt Markers
1. [Timestamp]: [Type of interrupt] - [Visual/audio change]
2. [Timestamp]: [Type of interrupt] - [Visual/audio change]

---

## 📊 CARD 4: METADATA & OPTIMIZATION
[This card contains ALL SEO and analytics information]

### SEO Optimization
**Primary Keyword**: [Main keyword]
**Secondary Keywords**: 
1. [Keyword 2]
2. [Keyword 3]

**Title Options for A/B Testing**:
1. [Title variation 1]
2. [Title variation 2]
3. [Title variation 3]

**Description Template**:
[First 125 characters]
[Rest of description]

**Tags** (in order):
1. [Tag 1]
2. [Tag 2]
[Up to 15 tags]

### Performance Predictions
- CTR: [X]%
- 30-sec retention: [X]%
- Average view duration: [X]%

### Thumbnail Requirements
1. [Visual element 1]
2. [Text overlay]: "[Text]"
3. [Color scheme]: [Colors]

⚠️ END OF 4-CARD STRUCTURE - ALL CARDS MUST BE PRESENT
</mandatory_enhanced_output_format>

CRITICAL FINAL INSTRUCTIONS:

1. ⚠️ PERFORM ALL REQUIRED WEB SEARCHES (Minimum ${5 + keyPoints.length})
2. ✓ VERIFY every company, product, service, and statistic
3. ✓ USE [VERIFIED], [UNVERIFIED], [HYPOTHETICAL] tags throughout
4. ✓ ADD source citations as <!-- HTML comments -->
5. ✓ CREATE comprehensive FACT-CHECK NOTES section
6. ✓ ENSURE 100% accuracy - NO fictional entities as real
7. ✓ COMPLETE the Web Search Verification Log

🔴 REMEMBER: 
- Fictional companies/products = INSTANT REJECTION
- Missing fact-check notes = REJECTION
- Unverified statistics = REJECTION
- This script represents the channel's credibility

${enableFactChecking === false ? '⚠️ WARNING: Fact-checking disabled. Accuracy not guaranteed. Enable for production use.' : '✅ FACT-CHECKING ENABLED: All information will be verified'}

Now create a HIGH-RETENTION (>70% at 30sec, >50% AVD) and 100% FACTUALLY ACCURATE script for "${title}".`;

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

// Helper function to validate fact-checking in generated scripts
export function validateFactChecking(scriptContent) {
  const validation = {
    hasSearchLog: scriptContent.includes('WEB SEARCH VERIFICATION LOG'),
    hasFactSummary: scriptContent.includes('FACT VERIFICATION SUMMARY'),
    hasSourceCitations: (scriptContent.match(/<!-- Source:/g) || []).length,
    hasVerificationTags: (scriptContent.match(/\[VERIFIED\]/g) || []).length,
    hasFactCheckNotes: scriptContent.includes('FACT-CHECK NOTES'),
    hypotheticalCount: (scriptContent.match(/\[HYPOTHETICAL\]/g) || []).length,
    unverifiedCount: (scriptContent.match(/\[UNVERIFIED\]|\[NEEDS VERIFICATION\]/g) || []).length
  };

  validation.isValid = 
    validation.hasSearchLog && 
    validation.hasFactSummary && 
    validation.hasSourceCitations >= 3 &&
    validation.hasVerificationTags >= 3 &&
    validation.hasFactCheckNotes;

  validation.score = 
    (validation.hasSearchLog ? 20 : 0) +
    (validation.hasFactSummary ? 20 : 0) +
    (validation.hasSourceCitations >= 3 ? 20 : validation.hasSourceCitations * 5) +
    (validation.hasVerificationTags >= 3 ? 20 : validation.hasVerificationTags * 5) +
    (validation.hasFactCheckNotes ? 20 : 0);

  validation.warnings = [];
  if (validation.unverifiedCount > 0) {
    validation.warnings.push(`${validation.unverifiedCount} unverified claims found`);
  }
  if (validation.hypotheticalCount > 3) {
    validation.warnings.push(`High number of hypothetical examples (${validation.hypotheticalCount})`);
  }
  if (validation.hasSourceCitations < 5) {
    validation.warnings.push(`Low source citation count (${validation.hasSourceCitations})`);
  }

  return validation;
}

export default {
  generateEnhancedScript,
  createChainPrompts,
  predictScriptPerformance,
  validateFactChecking,
  advancedToneProfiles,
  platformOptimizations,
  scriptExamples
};