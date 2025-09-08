/**
 * Analyzes text to extract writing/speaking style patterns
 */

export class StyleAnalyzer {
  /**
   * Analyze text and extract style metrics
   * @param {string} text - Text to analyze
   * @returns {Object} Style metrics and patterns
   */
  static analyze(text) {
    if (!text || text.length === 0) {
      return this.getEmptyAnalysis();
    }

    const sentences = this.extractSentences(text);
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    return {
      // Basic metrics
      metrics: {
        totalWords: words.length,
        totalSentences: sentences.length,
        avgWordsPerSentence: Math.round(words.length / sentences.length),
        avgWordLength: this.calculateAvgWordLength(words),
        vocabularyDiversity: this.calculateVocabularyDiversity(words),
        readabilityScore: this.calculateReadability(text, sentences, words)
      },

      // Speaking patterns
      patterns: {
        greetings: this.extractGreetings(text),
        signoffs: this.extractSignoffs(text),
        fillerWords: this.extractFillerWords(text),
        catchphrases: this.extractCatchphrases(text),
        transitions: this.extractTransitions(text),
        questions: this.extractQuestions(sentences),
        exclamations: this.extractExclamations(sentences)
      },

      // Tone analysis
      tone: {
        formality: this.analyzeFormality(text),
        enthusiasm: this.analyzeEnthusiasm(text),
        humor: this.detectHumor(text),
        educational: this.analyzeEducational(text),
        conversational: this.analyzeConversational(text)
      },

      // Content structure
      structure: {
        introStyle: this.analyzeIntroStyle(sentences),
        outroStyle: this.analyzeOutroStyle(sentences),
        usesLists: this.detectListUsage(text),
        usesExamples: this.detectExamples(text),
        callsToAction: this.extractCTAs(text)
      },

      // Vocabulary characteristics
      vocabulary: {
        topWords: this.getTopWords(words, 20),
        topPhrases: this.extractTopPhrases(text, 10),
        technicalTerms: this.extractTechnicalTerms(words),
        emotionalWords: this.extractEmotionalWords(words),
        powerWords: this.extractPowerWords(words)
      }
    };
  }

  static extractSentences(text) {
    // Simple sentence extraction (can be improved with NLP library)
    return text.match(/[^.!?]+[.!?]+/g) || [];
  }

  static calculateAvgWordLength(words) {
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return Math.round(totalLength / words.length * 10) / 10;
  }

  static calculateVocabularyDiversity(words) {
    const uniqueWords = new Set(words);
    return Math.round((uniqueWords.size / words.length) * 100);
  }

  static calculateReadability(text, sentences, words) {
    // Flesch Reading Ease approximation
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static countSyllables(word) {
    // Simple syllable counting (approximate)
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiou]/.test(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) {
      count--;
    }
    
    // Ensure at least one syllable
    return Math.max(1, count);
  }

  static extractGreetings(text) {
    const greetingPatterns = [
      /hey\s+(everyone|guys|there|y'all|folks)/gi,
      /what's\s+up\s+(everyone|guys|youtube)/gi,
      /welcome\s+back\s+to/gi,
      /hello\s+(everyone|guys|there)/gi,
      /hi\s+(everyone|guys|there)/gi,
      /good\s+(morning|afternoon|evening)/gi
    ];

    const found = [];
    greetingPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        found.push(...matches);
      }
    });

    return [...new Set(found)];
  }

  static extractSignoffs(text) {
    const signoffPatterns = [
      /see\s+you\s+(next\s+time|later|soon|guys)/gi,
      /thanks\s+for\s+watching/gi,
      /catch\s+you\s+(later|next\s+time)/gi,
      /peace\s+out/gi,
      /until\s+next\s+time/gi,
      /bye\s+(bye|guys|everyone)/gi,
      /take\s+care/gi
    ];

    const found = [];
    signoffPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        found.push(...matches);
      }
    });

    return [...new Set(found)];
  }

  static extractFillerWords(text) {
    const fillers = {
      'um': (text.match(/\bum\b/gi) || []).length,
      'uh': (text.match(/\buh\b/gi) || []).length,
      'like': (text.match(/\blike\b/gi) || []).length,
      'you know': (text.match(/you\s+know/gi) || []).length,
      'actually': (text.match(/\bactually\b/gi) || []).length,
      'basically': (text.match(/\bbasically\b/gi) || []).length,
      'literally': (text.match(/\bliterally\b/gi) || []).length,
      'right': (text.match(/\bright\?/gi) || []).length,
      'so': (text.match(/^so\b/gim) || []).length
    };

    return Object.entries(fillers)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
  }

  static extractCatchphrases(text) {
    // Extract repeated multi-word phrases (2-4 words)
    const phrases = {};
    const words = text.toLowerCase().split(/\s+/);
    
    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(' ');
        if (phrase.length > 5 && !phrase.match(/^(the|and|but|for|with|from|that|this|what|when|where|have|will|would|could|should)/)) {
          phrases[phrase] = (phrases[phrase] || 0) + 1;
        }
      }
    }

    return Object.entries(phrases)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase]) => phrase);
  }

  static extractTransitions(text) {
    const transitions = {
      sequential: ['first', 'second', 'third', 'next', 'then', 'finally', 'lastly'],
      additive: ['also', 'moreover', 'furthermore', 'additionally', 'plus'],
      contrast: ['however', 'but', 'although', 'though', 'yet', 'still'],
      causal: ['because', 'since', 'therefore', 'thus', 'hence', 'so'],
      example: ['for example', 'for instance', 'such as', 'like', 'specifically']
    };

    const found = {};
    Object.entries(transitions).forEach(([type, words]) => {
      const count = words.reduce((sum, word) => {
        const pattern = new RegExp(`\\b${word}\\b`, 'gi');
        return sum + (text.match(pattern) || []).length;
      }, 0);
      if (count > 0) {
        found[type] = count;
      }
    });

    return found;
  }

  static extractQuestions(sentences) {
    return sentences.filter(s => s.trim().endsWith('?')).length;
  }

  static extractExclamations(sentences) {
    return sentences.filter(s => s.trim().endsWith('!')).length;
  }

  static analyzeFormality(text) {
    const formalIndicators = ['therefore', 'however', 'furthermore', 'moreover', 'consequently'];
    const informalIndicators = ['gonna', 'wanna', 'gotta', 'yeah', 'yep', 'nope', 'cool', 'awesome'];
    
    const formalCount = formalIndicators.reduce((count, word) => 
      count + (text.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length, 0);
    
    const informalCount = informalIndicators.reduce((count, word) => 
      count + (text.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length, 0);
    
    if (formalCount > informalCount * 2) return 'formal';
    if (informalCount > formalCount * 2) return 'casual';
    return 'neutral';
  }

  static analyzeEnthusiasm(text) {
    const exclamations = (text.match(/!/g) || []).length;
    const capitalWords = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
    const enthusiasticWords = ['amazing', 'awesome', 'incredible', 'fantastic', 'excellent', 'wow', 'love'];
    
    const enthusiasmCount = enthusiasticWords.reduce((count, word) => 
      count + (text.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length, 0);
    
    const totalIndicators = exclamations + capitalWords + enthusiasmCount;
    const wordsCount = text.split(/\s+/).length;
    const ratio = totalIndicators / wordsCount;
    
    if (ratio > 0.05) return 'high';
    if (ratio > 0.02) return 'medium';
    return 'low';
  }

  static detectHumor(text) {
    const humorIndicators = ['haha', 'lol', 'joke', 'funny', 'hilarious', 'laugh', '😂', '😄', '😆'];
    const count = humorIndicators.reduce((sum, indicator) => 
      sum + (text.match(new RegExp(indicator, 'gi')) || []).length, 0);
    
    return count > 0;
  }

  static analyzeEducational(text) {
    const educationalPhrases = [
      'let me explain', 'how to', 'tutorial', 'learn', 'understand',
      'step by step', 'guide', 'lesson', 'tip', 'trick'
    ];
    
    const count = educationalPhrases.reduce((sum, phrase) => 
      sum + (text.match(new RegExp(phrase, 'gi')) || []).length, 0);
    
    return count >= 3;
  }

  static analyzeConversational(text) {
    const conversationalIndicators = [
      'you know', 'i mean', 'right?', 'you guys', 'let me know',
      'what do you think', 'tell me', 'comment below'
    ];
    
    const count = conversationalIndicators.reduce((sum, phrase) => 
      sum + (text.match(new RegExp(phrase, 'gi')) || []).length, 0);
    
    return count >= 3;
  }

  static analyzeIntroStyle(sentences) {
    if (sentences.length === 0) return 'none';
    
    const firstSentence = sentences[0].toLowerCase();
    
    if (firstSentence.includes('welcome') || firstSentence.includes('hey') || firstSentence.includes('hello')) {
      return 'greeting';
    }
    if (firstSentence.includes('?')) {
      return 'question';
    }
    if (firstSentence.includes('today') || firstSentence.includes('this video')) {
      return 'preview';
    }
    
    return 'direct';
  }

  static analyzeOutroStyle(sentences) {
    if (sentences.length === 0) return 'none';
    
    const lastSentences = sentences.slice(-3).join(' ').toLowerCase();
    
    if (lastSentences.includes('subscribe') || lastSentences.includes('like')) {
      return 'call-to-action';
    }
    if (lastSentences.includes('thanks') || lastSentences.includes('thank you')) {
      return 'gratitude';
    }
    if (lastSentences.includes('see you') || lastSentences.includes('next time')) {
      return 'farewell';
    }
    
    return 'simple';
  }

  static detectListUsage(text) {
    const listPatterns = [
      /\b(first|1st|one)\b.*\b(second|2nd|two)\b/gis,
      /\d+\./gm,
      /^[-•*]/gm
    ];
    
    return listPatterns.some(pattern => pattern.test(text));
  }

  static detectExamples(text) {
    const examplePhrases = ['for example', 'for instance', 'such as', 'like when', 'imagine'];
    return examplePhrases.some(phrase => text.toLowerCase().includes(phrase));
  }

  static extractCTAs(text) {
    const ctaPatterns = [
      /subscribe\s+to/gi,
      /hit\s+the\s+(like|bell|subscribe)/gi,
      /click\s+(the\s+)?(link|below)/gi,
      /check\s+out/gi,
      /comment\s+below/gi,
      /let\s+me\s+know/gi,
      /share\s+this/gi
    ];

    const found = [];
    ctaPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        found.push(...matches);
      }
    });

    return [...new Set(found)];
  }

  static getTopWords(words, limit = 20) {
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
      'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
      'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
      'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
      'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
      'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
      'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
      'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had',
      'were', 'said', 'did', 'getting', 'made', 'find', 'where', 'much', 'too',
      'very', 'still', 'being', 'going', 'why', 'let', 'put', 'made', 'here'
    ]);

    const wordCount = {};
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
  }

  static extractTopPhrases(text, limit = 10) {
    const phrases = {};
    const sentences = text.toLowerCase().split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      for (let len = 2; len <= 4; len++) {
        for (let i = 0; i <= words.length - len; i++) {
          const phrase = words.slice(i, i + len).join(' ');
          if (phrase.length > 5 && !phrase.match(/^(the|and|but|for|with)/)) {
            phrases[phrase] = (phrases[phrase] || 0) + 1;
          }
        }
      }
    });

    return Object.entries(phrases)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([phrase, count]) => ({ phrase, count }));
  }

  static extractTechnicalTerms(words) {
    // Simple heuristic: words that might be technical
    const technical = words.filter(word => 
      word.length > 6 && 
      (word.includes('-') || /[A-Z]/.test(word) || /\d/.test(word))
    );
    
    return [...new Set(technical)].slice(0, 10);
  }

  static extractEmotionalWords(words) {
    const emotionalWords = [
      'love', 'hate', 'amazing', 'terrible', 'awesome', 'awful',
      'fantastic', 'horrible', 'beautiful', 'ugly', 'happy', 'sad',
      'excited', 'boring', 'interesting', 'frustrating', 'incredible'
    ];
    
    return words.filter(word => emotionalWords.includes(word));
  }

  static extractPowerWords(words) {
    const powerWords = [
      'secret', 'proven', 'easy', 'instant', 'free', 'new',
      'guaranteed', 'exclusive', 'limited', 'breakthrough', 'revolutionary',
      'transform', 'discover', 'unlock', 'master', 'ultimate'
    ];
    
    return words.filter(word => powerWords.includes(word));
  }

  static getEmptyAnalysis() {
    return {
      metrics: {
        totalWords: 0,
        totalSentences: 0,
        avgWordsPerSentence: 0,
        avgWordLength: 0,
        vocabularyDiversity: 0,
        readabilityScore: 0
      },
      patterns: {
        greetings: [],
        signoffs: [],
        fillerWords: {},
        catchphrases: [],
        transitions: {},
        questions: 0,
        exclamations: 0
      },
      tone: {
        formality: 'neutral',
        enthusiasm: 'low',
        humor: false,
        educational: false,
        conversational: false
      },
      structure: {
        introStyle: 'none',
        outroStyle: 'none',
        usesLists: false,
        usesExamples: false,
        callsToAction: []
      },
      vocabulary: {
        topWords: [],
        topPhrases: [],
        technicalTerms: [],
        emotionalWords: [],
        powerWords: []
      }
    };
  }
}

export default StyleAnalyzer;