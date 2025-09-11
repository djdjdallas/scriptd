// Advanced YouTube Voice Style Analyzer v2
// Comprehensive voice pattern analysis with prosodic features and content-specific metrics

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#96;/g, '`')
    .replace(/&nbsp;/g, ' ')
    .replace(/\[.*?\]/g, '') // Remove [music], [applause] etc
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTranscript(text) {
  return text
    .replace(/\[.*?\]/g, '') // Remove caption artifacts
    .replace(/\(.*?\)/g, '') // Remove parentheticals
    .replace(/\s+/g, ' ')
    .trim();
}

// =====================================================
// PROSODIC FEATURES ANALYSIS
// =====================================================

function analyzeProsody(transcripts) {
  const features = {
    sentenceLengthVariation: calculateSentenceLengthVariation(transcripts),
    questionFrequency: calculateQuestionFrequency(transcripts),
    exclamationUsage: calculateExclamationUsage(transcripts),
    pausePatterns: detectPausePatterns(transcripts),
    energyLevel: classifyEnergyLevel(transcripts),
    speechTempo: estimateSpeechTempo(transcripts)
  };
  
  return features;
}

function calculateSentenceLengthVariation(transcripts) {
  const sentences = transcripts.flatMap(t => 
    t.split(/[.!?]+/).filter(s => s.trim().length > 0)
  );
  
  if (sentences.length === 0) return { avg: 0, min: 0, max: 0, variance: 'low' };
  
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  
  // Calculate variance category
  const variance = (max - min) > 15 ? 'high' : (max - min) > 8 ? 'medium' : 'low';
  
  return {
    avg: Math.round(avg),
    min,
    max,
    variance,
    totalSentences: sentences.length
  };
}

function calculateQuestionFrequency(transcripts) {
  const fullText = transcripts.join(' ');
  const sentences = fullText.split(/[.!?]+/);
  const questions = sentences.filter(s => s.trim().endsWith('?') || 
    /^(what|when|where|why|who|how|can|could|would|should|do|does|did|is|are|was|were)/i.test(s.trim())
  );
  
  return {
    count: questions.length,
    percentage: Math.round((questions.length / Math.max(sentences.length, 1)) * 100),
    types: categorizeQuestions(questions)
  };
}

function categorizeQuestions(questions) {
  const types = {
    engagement: 0,  // "What do you think?"
    rhetorical: 0,  // "Isn't that amazing?"
    informational: 0 // "How does this work?"
  };
  
  questions.forEach(q => {
    const lower = q.toLowerCase();
    if (lower.includes('you think') || lower.includes('your') || lower.includes('comment')) {
      types.engagement++;
    } else if (lower.includes('right') || lower.includes('isn\'t') || lower.includes('don\'t you')) {
      types.rhetorical++;
    } else {
      types.informational++;
    }
  });
  
  return types;
}

function calculateExclamationUsage(transcripts) {
  const fullText = transcripts.join(' ');
  const sentences = fullText.split(/[.!?]+/);
  const exclamations = sentences.filter(s => s.includes('!'));
  
  return {
    count: exclamations.length,
    percentage: Math.round((exclamations.length / Math.max(sentences.length, 1)) * 100),
    intensity: exclamations.length > 10 ? 'high' : exclamations.length > 5 ? 'medium' : 'low'
  };
}

function detectPausePatterns(transcripts) {
  // Detect natural pause points (periods, commas, ellipses)
  const pauseIndicators = {
    shortPauses: 0,  // commas
    mediumPauses: 0, // semicolons, dashes
    longPauses: 0,   // periods, new paragraphs
    dramaticPauses: 0 // ellipses, multiple dots
  };
  
  transcripts.forEach(t => {
    pauseIndicators.shortPauses += (t.match(/,/g) || []).length;
    pauseIndicators.mediumPauses += (t.match(/[;—–-]/g) || []).length;
    pauseIndicators.longPauses += (t.match(/\./g) || []).length;
    pauseIndicators.dramaticPauses += (t.match(/\.{2,}|…/g) || []).length;
  });
  
  return pauseIndicators;
}

function classifyEnergyLevel(transcripts) {
  const fullText = transcripts.join(' ').toLowerCase();
  
  const highEnergyWords = ['amazing', 'awesome', 'incredible', 'fantastic', 'wow', 'excited', 'love', 'absolutely', 'definitely', 'super'];
  const calmWords = ['perhaps', 'maybe', 'consider', 'think', 'believe', 'seems', 'appears', 'might', 'could'];
  
  let highEnergyScore = 0;
  let calmScore = 0;
  
  highEnergyWords.forEach(word => {
    highEnergyScore += (fullText.match(new RegExp(word, 'gi')) || []).length;
  });
  
  calmWords.forEach(word => {
    calmScore += (fullText.match(new RegExp(word, 'gi')) || []).length;
  });
  
  const totalWords = fullText.split(/\s+/).length;
  const energyRatio = (highEnergyScore - calmScore) / Math.max(totalWords / 100, 1);
  
  return {
    level: energyRatio > 2 ? 'high' : energyRatio > 0 ? 'medium' : 'low',
    score: Math.round(energyRatio * 10) / 10,
    highEnergyWords: highEnergyScore,
    calmWords: calmScore
  };
}

function estimateSpeechTempo(transcripts) {
  // Estimate words per minute based on average video duration
  // Assuming average YouTube video speaking rate
  const totalWords = transcripts.join(' ').split(/\s+/).length;
  const estimatedMinutes = totalWords / 150; // Average speaking rate
  
  return {
    wordsPerMinute: 150, // Default estimate
    totalWords,
    estimatedDuration: Math.round(estimatedMinutes * 10) / 10,
    pace: totalWords / transcripts.length > 500 ? 'fast' : 
          totalWords / transcripts.length > 300 ? 'moderate' : 'slow'
  };
}

// =====================================================
// YOUTUBE CREATOR SPECIFIC ANALYSIS
// =====================================================

function analyzeYouTubeCreatorPatterns(transcripts) {
  return {
    introStyle: analyzeIntroStyle(transcripts),
    ctaPatterns: extractCallToActionPatterns(transcripts),
    engagementQuestions: extractEngagementQuestions(transcripts),
    transitionPhrases: extractTransitionPhrases(transcripts),
    signoffStyle: analyzeSignoffStyle(transcripts),
    hookPatterns: extractHookPatterns(transcripts)
  };
}

function analyzeIntroStyle(transcripts) {
  const intros = [];
  
  transcripts.forEach(transcript => {
    // Get first 50 words as potential intro
    const words = transcript.split(/\s+/).slice(0, 50).join(' ');
    
    // Common YouTube intro patterns
    const patterns = {
      greeting: /^(hey|hi|hello|what's up|welcome|yo)/i.test(words),
      channelMention: /channel|video|episode|show/i.test(words),
      topicIntro: /today|this video|going to|gonna|will/i.test(words),
      question: /\?/.test(words.slice(0, 100)),
      excitement: /!/i.test(words.slice(0, 100))
    };
    
    intros.push(patterns);
  });
  
  // Determine dominant intro style
  const styles = intros.reduce((acc, intro) => {
    Object.keys(intro).forEach(key => {
      if (intro[key]) acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {});
  
  const dominantStyle = Object.keys(styles).reduce((a, b) => 
    styles[a] > styles[b] ? a : b, 'standard'
  );
  
  return {
    style: dominantStyle,
    consistency: Math.round((styles[dominantStyle] / transcripts.length) * 100),
    patterns: styles
  };
}

function extractCallToActionPatterns(transcripts) {
  const fullText = transcripts.join(' ').toLowerCase();
  
  const ctaPatterns = {
    subscribe: /(subscribe|subscriber|subscription)/gi,
    like: /(like this video|hit the like|smash that like|leave a like)/gi,
    comment: /(comment|let me know|tell me|share your|drop a)/gi,
    share: /(share this|share with)/gi,
    notification: /(notification|bell|notify)/gi,
    links: /(description|link below|check out)/gi
  };
  
  const results = {};
  Object.keys(ctaPatterns).forEach(key => {
    const matches = fullText.match(ctaPatterns[key]) || [];
    results[key] = {
      count: matches.length,
      present: matches.length > 0
    };
  });
  
  return results;
}

function extractEngagementQuestions(transcripts) {
  const questions = [];
  
  transcripts.forEach(transcript => {
    const engagementPatterns = [
      /what do you (think|guys think|all think)/gi,
      /let me know (in|down)/gi,
      /have you (ever|tried|seen)/gi,
      /what's your (favorite|opinion|experience)/gi,
      /do you (agree|like|prefer)/gi,
      /which one (do you|would you)/gi
    ];
    
    engagementPatterns.forEach(pattern => {
      const matches = transcript.match(pattern);
      if (matches) questions.push(...matches);
    });
  });
  
  return {
    questions: [...new Set(questions)].slice(0, 10),
    count: questions.length,
    frequency: questions.length / transcripts.length
  };
}

function extractTransitionPhrases(transcripts) {
  const transitions = {};
  const transitionPatterns = {
    sequential: /(first|second|third|next|then|after that|finally)/gi,
    contrast: /(but|however|although|though|on the other hand)/gi,
    addition: /(also|additionally|furthermore|moreover|plus)/gi,
    example: /(for example|for instance|such as|like)/gi,
    conclusion: /(so|therefore|thus|in conclusion|to sum up)/gi,
    topic: /(now|moving on|let's talk about|speaking of)/gi
  };
  
  const fullText = transcripts.join(' ');
  
  Object.keys(transitionPatterns).forEach(type => {
    const matches = fullText.match(transitionPatterns[type]) || [];
    transitions[type] = {
      count: matches.length,
      examples: [...new Set(matches)].slice(0, 3)
    };
  });
  
  return transitions;
}

function analyzeSignoffStyle(transcripts) {
  const signoffs = [];
  
  transcripts.forEach(transcript => {
    // Get last 50 words as potential signoff
    const words = transcript.split(/\s+/).slice(-50).join(' ').toLowerCase();
    
    const patterns = {
      thanks: /thank/i.test(words),
      seeYou: /(see you|catch you)/i.test(words),
      nextTime: /next (time|video|episode|week)/i.test(words),
      subscribe: /subscribe/i.test(words),
      peace: /(peace|bye|later)/i.test(words)
    };
    
    signoffs.push(patterns);
  });
  
  return signoffs;
}

function extractHookPatterns(transcripts) {
  const hooks = [];
  
  transcripts.forEach(transcript => {
    // Analyze first 30 words for hook patterns
    const opening = transcript.slice(0, 200).toLowerCase();
    
    // Common hook types
    if (/have you ever|did you know|what if/i.test(opening)) {
      hooks.push('question');
    } else if (/\d+|percent|million|billion/i.test(opening)) {
      hooks.push('statistic');
    } else if (/story|once|yesterday|last/i.test(opening)) {
      hooks.push('story');
    } else if (/problem|issue|mistake|wrong/i.test(opening)) {
      hooks.push('problem');
    } else if (/secret|reveal|truth|hidden/i.test(opening)) {
      hooks.push('curiosity');
    }
  });
  
  const hookCounts = hooks.reduce((acc, hook) => {
    acc[hook] = (acc[hook] || 0) + 1;
    return acc;
  }, {});
  
  return {
    types: hookCounts,
    primaryHook: Object.keys(hookCounts).reduce((a, b) => 
      hookCounts[a] > hookCounts[b] ? a : b, 'standard'
    )
  };
}

// =====================================================
// VOICE PERSONALITY METRICS
// =====================================================

function analyzeVoicePersonality(transcripts) {
  const fullText = transcripts.join(' ');
  
  return {
    formalityScore: calculateFormality(fullText),
    humorFrequency: detectHumor(fullText),
    technicalDepth: analyzeTechnicalDepth(fullText),
    storytellingStyle: analyzeStorytellingStyle(transcripts),
    emotionalRange: analyzeEmotionalRange(fullText)
  };
}

function calculateFormality(text) {
  const informalIndicators = [
    'gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'nah', 'ok', 'okay',
    'guys', 'stuff', 'things', 'cool', 'awesome', 'literally'
  ];
  
  const formalIndicators = [
    'therefore', 'however', 'furthermore', 'nevertheless', 'consequently',
    'subsequently', 'moreover', 'hence', 'thus', 'shall', 'whom'
  ];
  
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  
  let informalCount = 0;
  let formalCount = 0;
  
  informalIndicators.forEach(word => {
    informalCount += (lower.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length;
  });
  
  formalIndicators.forEach(word => {
    formalCount += (lower.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length;
  });
  
  const score = Math.max(0, Math.min(100, 50 + (formalCount - informalCount) * 2));
  
  return {
    score,
    level: score > 70 ? 'formal' : score > 30 ? 'balanced' : 'casual',
    informalWords: informalCount,
    formalWords: formalCount
  };
}

function detectHumor(text) {
  const humorIndicators = [
    /haha|lol|hehe|lmao/gi,
    /just kidding|jk/gi,
    /funny|hilarious|joke/gi,
    /😂|😄|😆/g
  ];
  
  let humorCount = 0;
  humorIndicators.forEach(pattern => {
    humorCount += (text.match(pattern) || []).length;
  });
  
  const words = text.split(/\s+/).length;
  const humorDensity = (humorCount / words) * 1000; // Per 1000 words
  
  return {
    instances: humorCount,
    density: Math.round(humorDensity * 10) / 10,
    level: humorDensity > 5 ? 'frequent' : humorDensity > 2 ? 'occasional' : 'rare'
  };
}

function analyzeTechnicalDepth(text) {
  // This would need to be customized based on the channel's niche
  const technicalTerms = [
    'algorithm', 'optimize', 'configuration', 'implementation', 'framework',
    'analysis', 'methodology', 'systematic', 'infrastructure', 'architecture'
  ];
  
  const lower = text.toLowerCase();
  let technicalCount = 0;
  
  technicalTerms.forEach(term => {
    technicalCount += (lower.match(new RegExp(`\\b${term}\\b`, 'gi')) || []).length;
  });
  
  const words = text.split(/\s+/).length;
  const technicalDensity = (technicalCount / words) * 100;
  
  return {
    score: Math.round(technicalDensity * 10),
    level: technicalDensity > 5 ? 'technical' : technicalDensity > 2 ? 'semi-technical' : 'accessible',
    termCount: technicalCount
  };
}

function analyzeStorytellingStyle(transcripts) {
  const storyIndicators = {
    personal: 0,
    temporal: 0,
    descriptive: 0,
    dialogue: 0
  };
  
  transcripts.forEach(transcript => {
    const lower = transcript.toLowerCase();
    
    // Personal pronouns
    storyIndicators.personal += (lower.match(/\b(i|me|my|we|our)\b/gi) || []).length;
    
    // Temporal markers
    storyIndicators.temporal += (lower.match(/\b(when|then|after|before|while|during|once)\b/gi) || []).length;
    
    // Descriptive language
    storyIndicators.descriptive += (lower.match(/\b(beautiful|amazing|terrible|huge|tiny)\b/gi) || []).length;
    
    // Dialogue markers
    storyIndicators.dialogue += (lower.match(/".*?"|said|told|asked/gi) || []).length;
  });
  
  const total = Object.values(storyIndicators).reduce((a, b) => a + b, 0);
  const primaryStyle = Object.keys(storyIndicators).reduce((a, b) => 
    storyIndicators[a] > storyIndicators[b] ? a : b
  );
  
  return {
    indicators: storyIndicators,
    primaryStyle,
    storyScore: Math.min(100, Math.round((total / transcripts.join(' ').split(/\s+/).length) * 500))
  };
}

function analyzeEmotionalRange(text) {
  const emotions = {
    excitement: ['amazing', 'incredible', 'awesome', 'fantastic', 'wow', 'exciting'],
    happiness: ['happy', 'joy', 'glad', 'pleased', 'delighted', 'cheerful'],
    surprise: ['surprising', 'unexpected', 'shocked', 'astonished', 'unbelievable'],
    concern: ['worried', 'concerned', 'anxious', 'nervous', 'uncertain'],
    frustration: ['frustrated', 'annoying', 'irritating', 'difficult', 'challenging']
  };
  
  const lower = text.toLowerCase();
  const emotionScores = {};
  
  Object.keys(emotions).forEach(emotion => {
    let score = 0;
    emotions[emotion].forEach(word => {
      score += (lower.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length;
    });
    emotionScores[emotion] = score;
  });
  
  const dominantEmotion = Object.keys(emotionScores).reduce((a, b) => 
    emotionScores[a] > emotionScores[b] ? a : b
  );
  
  return {
    scores: emotionScores,
    dominant: dominantEmotion,
    range: Object.values(emotionScores).filter(s => s > 0).length
  };
}

// =====================================================
// QUALITY METRICS
// =====================================================

function calculateQualityMetrics(transcripts) {
  const fullText = transcripts.join(' ');
  const words = fullText.split(/\s+/);
  
  return {
    vocabularyDiversity: calculateVocabularyDiversity(words),
    fillerWordUsage: detectFillerWords(fullText),
    averageSentenceComplexity: calculateSentenceComplexity(fullText),
    consistencyScore: calculateConsistencyScore(transcripts)
  };
}

function calculateVocabularyDiversity(words) {
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const totalWords = words.length;
  
  // Type-Token Ratio (TTR)
  const ttr = uniqueWords.size / totalWords;
  
  // Vocabulary richness per 1000 words
  const richness = (uniqueWords.size / totalWords) * 1000;
  
  return {
    uniqueWords: uniqueWords.size,
    totalWords,
    ttr: Math.round(ttr * 100) / 100,
    richnessScore: Math.round(richness),
    level: richness > 500 ? 'rich' : richness > 300 ? 'moderate' : 'simple'
  };
}

function detectFillerWords(text) {
  const fillers = {
    'um': 0,
    'uh': 0,
    'like': 0,
    'you know': 0,
    'actually': 0,
    'basically': 0,
    'literally': 0,
    'honestly': 0,
    'right': 0,
    'so': 0
  };
  
  const lower = text.toLowerCase();
  
  Object.keys(fillers).forEach(filler => {
    fillers[filler] = (lower.match(new RegExp(`\\b${filler}\\b`, 'gi')) || []).length;
  });
  
  const totalFillers = Object.values(fillers).reduce((a, b) => a + b, 0);
  const words = text.split(/\s+/).length;
  const fillerDensity = (totalFillers / words) * 100;
  
  return {
    fillers,
    total: totalFillers,
    density: Math.round(fillerDensity * 10) / 10,
    level: fillerDensity > 5 ? 'high' : fillerDensity > 2 ? 'moderate' : 'low'
  };
}

function calculateSentenceComplexity(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const complexityScores = sentences.map(sentence => {
    const words = sentence.split(/\s+/).length;
    const commas = (sentence.match(/,/g) || []).length;
    const subclauses = (sentence.match(/\b(which|that|who|whom|whose|where|when)\b/gi) || []).length;
    
    return {
      words,
      complexity: words > 20 ? 'complex' : words > 10 ? 'moderate' : 'simple',
      score: words + (commas * 2) + (subclauses * 3)
    };
  });
  
  const avgComplexity = complexityScores.reduce((a, b) => a + b.score, 0) / complexityScores.length;
  
  return {
    average: Math.round(avgComplexity),
    distribution: {
      simple: complexityScores.filter(s => s.complexity === 'simple').length,
      moderate: complexityScores.filter(s => s.complexity === 'moderate').length,
      complex: complexityScores.filter(s => s.complexity === 'complex').length
    }
  };
}

function calculateConsistencyScore(transcripts) {
  // Measure consistency across different transcripts
  const metrics = transcripts.map(transcript => {
    const words = transcript.split(/\s+/).length;
    const sentences = transcript.split(/[.!?]+/).length;
    const avgSentenceLength = words / sentences;
    
    return {
      words,
      sentences,
      avgSentenceLength
    };
  });
  
  // Calculate standard deviation
  const avgWords = metrics.reduce((a, b) => a + b.words, 0) / metrics.length;
  const variance = metrics.reduce((a, b) => a + Math.pow(b.words - avgWords, 2), 0) / metrics.length;
  const stdDev = Math.sqrt(variance);
  
  const consistencyScore = Math.max(0, 100 - (stdDev / avgWords * 100));
  
  return {
    score: Math.round(consistencyScore),
    level: consistencyScore > 80 ? 'high' : consistencyScore > 60 ? 'moderate' : 'low',
    metrics
  };
}

// =====================================================
// VOICE FINGERPRINT
// =====================================================

function createVoiceFingerprint(transcripts) {
  const fullText = transcripts.join(' ');
  const words = fullText.toLowerCase().split(/\s+/);
  
  // Get top vocabulary
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 3 && !isStopWord(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const topVocabulary = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));
  
  // Get signature phrases (3-5 word combinations)
  const signaturePhrases = extractSignaturePhrases(transcripts);
  
  // Calculate speaking metrics
  const avgSentenceLength = fullText.split(/[.!?]+/)
    .filter(s => s.trim().length > 0)
    .reduce((acc, s) => acc + s.split(/\s+/).length, 0) / 
    Math.max(fullText.split(/[.!?]+/).length, 1);
  
  const questionRatio = (fullText.match(/\?/g) || []).length / 
    Math.max(fullText.split(/[.!?]+/).length, 1);
  
  return {
    topVocabulary,
    signaturePhrases,
    metrics: {
      avgSentenceLength: Math.round(avgSentenceLength),
      questionFrequency: Math.round(questionRatio * 100),
      speakingPace: estimateSpeechTempo(transcripts).wordsPerMinute
    },
    uniqueIdentifiers: {
      vocabularySize: new Set(words).size,
      distinctPhrases: signaturePhrases.length,
      personalityMarkers: identifyPersonalityMarkers(fullText)
    }
  };
}

function extractSignaturePhrases(transcripts) {
  const phrases = {};
  
  transcripts.forEach(transcript => {
    const words = transcript.toLowerCase().split(/\s+/);
    
    // Extract 3-5 word phrases
    for (let len = 3; len <= 5; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(' ');
        
        // Filter out phrases with too many stop words
        if (!isGenericPhrase(phrase)) {
          phrases[phrase] = (phrases[phrase] || 0) + 1;
        }
      }
    }
  });
  
  // Return phrases that appear at least twice
  return Object.entries(phrases)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, count]) => ({ phrase, count }));
}

function identifyPersonalityMarkers(text) {
  return {
    confidence: text.match(/\b(definitely|absolutely|certainly|obviously|clearly)\b/gi)?.length || 0,
    uncertainty: text.match(/\b(maybe|perhaps|possibly|might|could)\b/gi)?.length || 0,
    enthusiasm: text.match(/\b(amazing|awesome|fantastic|incredible|exciting)\b/gi)?.length || 0,
    analytical: text.match(/\b(because|therefore|however|although|whereas)\b/gi)?.length || 0
  };
}

function isStopWord(word) {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  return stopWords.includes(word.toLowerCase());
}

function isGenericPhrase(phrase) {
  const genericPhrases = ['going to be', 'want to be', 'need to be', 'have to be'];
  return genericPhrases.some(generic => phrase.includes(generic));
}

// =====================================================
// MAIN ANALYSIS FUNCTION
// =====================================================

export async function analyzeVoiceStyleAdvanced(transcripts, options = {}) {
  if (!transcripts || transcripts.length === 0) {
    return { error: 'No transcripts provided' };
  }
  
  // Decode and clean transcripts
  const decodedTranscripts = transcripts.map(t => decodeHtmlEntities(t));
  const cleanedTranscripts = decodedTranscripts.map(t => cleanTranscript(t));
  
  // Perform comprehensive analysis
  const analysis = {
    // Prosodic Features
    prosody: analyzeProsody(cleanedTranscripts),
    
    // YouTube Creator Patterns
    creatorPatterns: analyzeYouTubeCreatorPatterns(cleanedTranscripts),
    
    // Voice Personality
    personality: analyzeVoicePersonality(cleanedTranscripts),
    
    // Quality Metrics
    quality: calculateQualityMetrics(cleanedTranscripts),
    
    // Voice Fingerprint
    fingerprint: createVoiceFingerprint(cleanedTranscripts),
    
    // Metadata
    metadata: {
      transcriptsAnalyzed: transcripts.length,
      totalWords: cleanedTranscripts.join(' ').split(/\s+/).length,
      analysisVersion: '2.0',
      timestamp: new Date().toISOString()
    }
  };
  
  return analysis;
}

// Export individual functions for modular use
export {
  analyzeProsody,
  analyzeYouTubeCreatorPatterns,
  analyzeVoicePersonality,
  calculateQualityMetrics,
  createVoiceFingerprint
};