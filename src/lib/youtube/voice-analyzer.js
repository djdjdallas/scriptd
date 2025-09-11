// YouTube Voice Style Analyzer
// Analyzes transcripts to extract voice characteristics and speaking patterns

function decodeHtmlEntities(text) {
  // Decode common HTML entities from YouTube transcripts
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
    .replace(/&nbsp;/g, ' ');
}

export async function analyzeVoiceStyle(transcripts) {
  if (!transcripts || transcripts.length === 0) {
    return getDefaultVoiceProfile();
  }

  // Decode HTML entities and combine all transcripts for analysis
  const decodedTranscripts = transcripts.map(t => decodeHtmlEntities(t));
  const fullText = decodedTranscripts.join(' ');
  
  // Extract various voice characteristics
  const characteristics = {
    // Speaking patterns
    greetings: extractGreetings(fullText),
    catchphrases: extractCatchphrases(decodedTranscripts),  // Use decoded transcripts
    signoffs: extractSignoffs(fullText),
    
    // Language style
    formality: analyzeFormality(fullText),
    enthusiasm: analyzeEnthusiasm(fullText),
    humor: analyzeHumor(fullText),
    
    // Vocabulary analysis
    topWords: extractTopWords(fullText),
    technicalLevel: analyzeTechnicalLevel(fullText),
    avgSentenceLength: calculateAvgSentenceLength(fullText),
    
    // Speech patterns
    pacingIndicators: analyzePacing(fullText),
    emphasisPatterns: analyzeEmphasis(fullText),
    transitionPhrases: extractTransitionPhrases(fullText),
    
    // Content structure
    introPatterns: extractIntroPatterns(transcripts),
    ctaPatterns: extractCTAPatterns(fullText),
    questionPatterns: extractQuestionPatterns(fullText)
  };

  return characteristics;
}

function extractGreetings(text) {
  const greetingPatterns = [
    /^(hey|hi|hello|welcome|what's up|yo|greetings)[\s,!]+(everyone|guys|folks|friends|viewers|team|gang|family|beautiful people)/gim,
    /^(good\s+)(morning|afternoon|evening|day)[\s,!]+(everyone|guys|folks|friends|viewers)/gim,
    /^welcome\s+back\s+to\s+[\w\s]+/gim,
    /^it's\s+your\s+(boy|girl|host|friend)\s+[\w\s]+/gim
  ];

  const greetings = new Set();
  greetingPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.slice(0, 3).forEach(match => {
        greetings.add(match.trim().substring(0, 50));
      });
    }
  });

  return Array.from(greetings);
}

function extractCatchphrases(transcripts) {
  // Find phrases that appear in multiple transcripts
  const phraseCounts = {};
  const minPhraseLength = 3;
  const maxPhraseLength = 8;

  transcripts.forEach(transcript => {
    // Clean transcript from auto-caption artifacts
    const cleanedTranscript = transcript
      .replace(/\[.*?\]/g, '') // Remove [music], [applause], [ __ ] etc
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
    
    const words = cleanedTranscript.toLowerCase().split(/\s+/);
    
    // Extract n-grams
    for (let n = minPhraseLength; n <= maxPhraseLength; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        const phrase = words.slice(i, i + n).join(' ');
        
        // Filter out common phrases and artifacts
        if (phrase.length > 5 && // Minimum character length
            !phrase.includes('__') && // No underscores
            !phrase.includes('[') && // No brackets
            !isCommonPhrase(phrase) && 
            !containsStopWords(phrase)) {
          phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        }
      }
    }
  });

  // Find recurring phrases (appear in at least 30% of transcripts)
  const minOccurrences = Math.max(2, Math.floor(transcripts.length * 0.3));
  const catchphrases = Object.entries(phraseCounts)
    .filter(([phrase, count]) => count >= minOccurrences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);

  return catchphrases;
}

function extractSignoffs(text) {
  const signoffPatterns = [
    /(thanks\s+for\s+watching|see\s+you\s+next\s+time|catch\s+you\s+later|peace\s+out|bye\s+bye|until\s+next\s+time)/gi,
    /(don't\s+forget\s+to\s+subscribe|hit\s+that\s+subscribe|smash\s+that\s+like)/gi,
    /(i'll\s+see\s+you\s+in\s+the\s+next\s+(one|video|episode))/gi
  ];

  const signoffs = new Set();
  signoffPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.slice(0, 3).forEach(match => {
        signoffs.add(match.trim());
      });
    }
  });

  return Array.from(signoffs);
}

function analyzeFormality(text) {
  const formalIndicators = {
    high: [
      /therefore/gi, /furthermore/gi, /moreover/gi, /consequently/gi,
      /nonetheless/gi, /nevertheless/gi, /accordingly/gi, /hence/gi
    ],
    medium: [
      /basically/gi, /actually/gi, /obviously/gi, /clearly/gi,
      /definitely/gi, /probably/gi, /perhaps/gi
    ],
    low: [
      /gonna/gi, /wanna/gi, /gotta/gi, /kinda/gi, /sorta/gi,
      /yeah/gi, /yep/gi, /nope/gi, /dunno/gi, /ain't/gi
    ]
  };

  let formalityScore = 50; // Start neutral

  // Check formal indicators
  formalIndicators.high.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) formalityScore += matches.length * 2;
  });

  // Check informal indicators
  formalIndicators.low.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) formalityScore -= matches.length * 2;
  });

  // Normalize to scale
  if (formalityScore > 70) return 'formal';
  if (formalityScore < 30) return 'casual';
  return 'balanced';
}

function analyzeEnthusiasm(text) {
  const enthusiasmIndicators = {
    exclamations: (text.match(/!/g) || []).length,
    capitals: (text.match(/[A-Z]{2,}/g) || []).length,
    superlatives: (text.match(/amazing|awesome|incredible|fantastic|perfect|best|greatest/gi) || []).length,
    intensifiers: (text.match(/so\s+\w+|really\s+\w+|very\s+\w+|super\s+\w+|extremely/gi) || []).length
  };

  const totalWords = text.split(/\s+/).length;
  const enthusiasmScore = 
    (enthusiasmIndicators.exclamations * 2) +
    (enthusiasmIndicators.capitals) +
    (enthusiasmIndicators.superlatives * 3) +
    (enthusiasmIndicators.intensifiers * 2);

  const normalizedScore = (enthusiasmScore / totalWords) * 1000;

  if (normalizedScore > 15) return 'high';
  if (normalizedScore < 5) return 'low';
  return 'medium';
}

function analyzeHumor(text) {
  const humorIndicators = {
    laughs: (text.match(/haha|lol|lmao|😂|😆|😄/gi) || []).length,
    jokes: (text.match(/joke|funny|hilarious|comedy/gi) || []).length,
    sarcasm: (text.match(/obviously\s+not|yeah\s+right|sure\s+thing|as\s+if/gi) || []).length,
    wordplay: (text.match(/pun\s+intended|see\s+what\s+i\s+did|get\s+it/gi) || []).length
  };

  const humorScore = Object.values(humorIndicators).reduce((a, b) => a + b, 0);
  
  if (humorScore > 10) return 'humorous';
  if (humorScore > 3) return 'occasionally_funny';
  return 'serious';
}

function extractTopWords(text) {
  // Remove common words and extract meaningful vocabulary
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that',
    'these', 'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
  ]);

  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const wordCounts = {};

  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}

function analyzeTechnicalLevel(text) {
  const technicalTerms = [
    /algorithm/gi, /implementation/gi, /framework/gi, /architecture/gi,
    /optimization/gi, /methodology/gi, /paradigm/gi, /infrastructure/gi,
    /configuration/gi, /deployment/gi, /integration/gi, /specification/gi
  ];

  let technicalCount = 0;
  technicalTerms.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) technicalCount += matches.length;
  });

  const totalWords = text.split(/\s+/).length;
  const technicalDensity = (technicalCount / totalWords) * 100;

  if (technicalDensity > 2) return 'technical';
  if (technicalDensity > 0.5) return 'semi-technical';
  return 'non-technical';
}

function calculateAvgSentenceLength(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length === 0) return 15; // default

  const totalWords = sentences.reduce((total, sentence) => {
    return total + sentence.trim().split(/\s+/).length;
  }, 0);

  return Math.round(totalWords / sentences.length);
}

function analyzePacing(text) {
  // Look for pacing indicators
  const pacingPhrases = {
    fast: [
      /quick|quickly|rapidly|fast|hurry|rush/gi,
      /let's\s+go|come\s+on|right\s+away|immediately/gi
    ],
    slow: [
      /take\s+your\s+time|slowly|carefully|step\s+by\s+step/gi,
      /let's\s+break\s+this\s+down|one\s+thing\s+at\s+a\s+time/gi
    ],
    varied: [
      /first|second|then|next|finally|lastly/gi,
      /but\s+wait|hold\s+on|before\s+we\s+continue/gi
    ]
  };

  const scores = {
    fast: 0,
    slow: 0,
    varied: 0
  };

  Object.entries(pacingPhrases).forEach(([pace, patterns]) => {
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) scores[pace] += matches.length;
    });
  });

  // Return the dominant pacing style
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'moderate';
  
  return Object.entries(scores)
    .find(([pace, score]) => score === maxScore)[0];
}

function analyzeEmphasis(text) {
  const emphasisPatterns = [
    /really\s+important/gi,
    /pay\s+attention/gi,
    /key\s+point/gi,
    /remember\s+this/gi,
    /don't\s+forget/gi,
    /this\s+is\s+crucial/gi,
    /most\s+important/gi
  ];

  const emphasisCount = emphasisPatterns.reduce((count, pattern) => {
    const matches = text.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);

  if (emphasisCount > 10) return 'heavy';
  if (emphasisCount > 3) return 'moderate';
  return 'light';
}

function extractTransitionPhrases(text) {
  const transitionPatterns = [
    /now\s+let's|moving\s+on|next\s+up|with\s+that\s+said/gi,
    /on\s+the\s+other\s+hand|however|but\s+here's\s+the\s+thing/gi,
    /speaking\s+of\s+which|that\s+brings\s+us\s+to|which\s+leads\s+me\s+to/gi,
    /before\s+we\s+continue|real\s+quick|one\s+more\s+thing/gi
  ];

  const transitions = new Set();
  transitionPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.slice(0, 5).forEach(match => {
        transitions.add(match.toLowerCase());
      });
    }
  });

  return Array.from(transitions);
}

function extractIntroPatterns(transcripts) {
  // Analyze the beginning of transcripts for intro patterns
  const introPatterns = [];
  
  transcripts.forEach(transcript => {
    const firstPart = transcript.substring(0, 500);
    
    // Look for common intro structures
    if (firstPart.match(/in\s+this\s+video/i)) {
      introPatterns.push('preview_style');
    }
    if (firstPart.match(/today\s+we're/i)) {
      introPatterns.push('agenda_style');
    }
    if (firstPart.match(/have\s+you\s+ever|did\s+you\s+know/i)) {
      introPatterns.push('question_hook');
    }
    if (firstPart.match(/\d+\s+(tips|ways|reasons|things)/i)) {
      introPatterns.push('listicle_style');
    }
  });

  // Return most common pattern
  const counts = {};
  introPatterns.forEach(pattern => {
    counts[pattern] = (counts[pattern] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : 'standard';
}

function extractCTAPatterns(text) {
  const ctaPatterns = [
    /subscribe\s+to\s+my\s+channel/gi,
    /hit\s+the\s+like\s+button/gi,
    /leave\s+a\s+comment/gi,
    /check\s+out\s+the\s+links/gi,
    /follow\s+me\s+on/gi,
    /join\s+my\s+discord/gi,
    /support\s+on\s+patreon/gi
  ];

  const ctas = [];
  ctaPatterns.forEach(pattern => {
    if (text.match(pattern)) {
      ctas.push(pattern.source.replace(/\\s\+/g, ' ').replace(/\\/g, ''));
    }
  });

  return ctas;
}

function extractQuestionPatterns(text) {
  // Extract rhetorical questions used for engagement
  const questions = text.match(/[^.!?]*\?/g) || [];
  
  const rhetoricalQuestions = questions
    .filter(q => {
      const lower = q.toLowerCase();
      return lower.includes('have you ever') ||
             lower.includes('did you know') ||
             lower.includes('what if') ||
             lower.includes('can you imagine') ||
             lower.includes('remember when');
    })
    .slice(0, 5)
    .map(q => q.trim());

  return rhetoricalQuestions;
}

function isCommonPhrase(phrase) {
  const commonPhrases = [
    'going to be', 'want to', 'need to', 'have to', 'able to',
    'in this video', 'thank you', 'thanks for', 'make sure',
    'let me know', 'in the comments', 'don\'t forget'
  ];
  
  return commonPhrases.some(common => phrase.includes(common));
}

function containsStopWords(phrase) {
  const words = phrase.split(' ');
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were'];
  
  // If more than half the words are stop words, filter it out
  const stopWordCount = words.filter(word => stopWords.includes(word)).length;
  return stopWordCount > words.length / 2;
}

function getDefaultVoiceProfile() {
  return {
    greetings: [],
    catchphrases: [],
    signoffs: [],
    formality: 'balanced',
    enthusiasm: 'medium',
    humor: 'occasionally_funny',
    topWords: [],
    technicalLevel: 'semi-technical',
    avgSentenceLength: 15,
    pacingIndicators: 'moderate',
    emphasisPatterns: 'moderate',
    transitionPhrases: [],
    introPatterns: 'standard',
    ctaPatterns: [],
    questionPatterns: []
  };
}

export default analyzeVoiceStyle;