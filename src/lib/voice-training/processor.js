import { createClient } from '@/lib/supabase/server';

export async function processVoiceTraining({
  channelId,
  userId: _userId,
  channelData,
  isFree: _isFree = true // Always free
}) {
  const supabase = await createClient();
  
  try {
    // Fetch channel videos for training data
    const videos = await fetchChannelVideos(channelData.youtube_channel_id || channelData.channel_id, 10);
    
    // Extract training data from videos
    const trainingData = await extractTrainingData(videos, channelData);
    
    // Create or update voice profile
    const { data: voiceProfile, error: profileError } = await supabase
      .from('voice_profiles')
      .upsert({
        channel_id: channelId,
        profile_name: `${channelData.title || channelData.name} Voice`,
        training_data: {
          samples: trainingData.samples,
          patterns: trainingData.patterns,
          vocabulary: trainingData.vocabulary,
          sampleCount: videos.length,
          totalWords: trainingData.totalWords,
          analyzedAt: new Date().toISOString(),
          isFree: true // Mark as free training
        },
        parameters: {
          characteristics: trainingData.characteristics,
          tone: trainingData.tone,
          style: trainingData.style,
          pacing: trainingData.pacing,
          commonPhrases: trainingData.commonPhrases,
          vocabulary: trainingData.uniqueVocabulary
        },
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'channel_id'
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Failed to create voice profile: ${profileError.message}`);
    }

    // Return the profile data
    return {
      success: true,
      profile: voiceProfile.parameters,
      profileId: voiceProfile.id,
      trainingStats: {
        videosAnalyzed: videos.length,
        totalWords: trainingData.totalWords,
        uniquePhrases: trainingData.patterns.length,
        vocabularySize: trainingData.vocabulary.length,
        isFree: true
      }
    };

  } catch (error) {
    console.error('Voice training processing error:', error);
    throw error;
  }
}

async function fetchChannelVideos(_channelId, limit = 10) {
  // In production, this would use the YouTube API
  // For now, return mock data for development
  
  // Mock video data
  return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
    id: `video_${i + 1}`,
    title: `Sample Video ${i + 1}`,
    description: `This is a sample video description for video ${i + 1}`,
    transcript: generateMockTranscript(i),
    duration: Math.floor(Math.random() * 600) + 120, // 2-12 minutes
    publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
  }));
}

function generateMockTranscript(index) {
  const topics = [
    'technology and innovation',
    'creative content creation',
    'educational tutorials',
    'entertainment and gaming',
    'lifestyle and wellness'
  ];
  
  const styles = [
    'professional and informative',
    'casual and friendly',
    'energetic and enthusiastic',
    'calm and thoughtful',
    'humorous and engaging'
  ];
  
  return `Welcome back to the channel! Today we're discussing ${topics[index % topics.length]}. 
    My style is ${styles[index % styles.length]}. 
    Let's dive into the content and explore some amazing insights together.
    Remember to like and subscribe if you find this helpful!`;
}

async function extractTrainingData(videos, _channelData) {
  
  // Aggregate all transcripts
  const allText = videos
    .map(v => `${v.title} ${v.description} ${v.transcript}`)
    .join(' ');
  
  // Extract patterns and vocabulary
  const words = allText.toLowerCase().split(/\s+/);
  const uniqueWords = [...new Set(words)];
  
  // Find common phrases (simplified)
  const phrases = extractCommonPhrases(allText);
  
  // Analyze style and tone
  const styleAnalysis = analyzeStyle(allText);
  
  return {
    samples: videos.map(v => ({
      id: v.id,
      text: v.transcript,
      duration: v.duration
    })),
    patterns: phrases,
    vocabulary: uniqueWords.slice(0, 1000), // Top 1000 words
    totalWords: words.length,
    uniqueVocabulary: uniqueWords.slice(0, 500),
    commonPhrases: phrases.slice(0, 50),
    characteristics: {
      averageVideoLength: videos.reduce((sum, v) => sum + v.duration, 0) / videos.length,
      vocabularyRichness: uniqueWords.length / words.length,
      ...styleAnalysis.characteristics
    },
    tone: styleAnalysis.tone,
    style: styleAnalysis.style,
    pacing: styleAnalysis.pacing
  };
}

function extractCommonPhrases(text) {
  // Simple phrase extraction (in production, use NLP library)
  const phrases = [];
  const words = text.toLowerCase().split(/\s+/);
  
  // Extract 2-4 word phrases
  for (let i = 0; i < words.length - 3; i++) {
    phrases.push(words.slice(i, i + 2).join(' '));
    phrases.push(words.slice(i, i + 3).join(' '));
    phrases.push(words.slice(i, i + 4).join(' '));
  }
  
  // Count phrase frequency
  const phraseCount = {};
  phrases.forEach(phrase => {
    phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
  });
  
  // Return top phrases
  return Object.entries(phraseCount)
    .filter(([phrase, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([phrase]) => phrase);
}

function analyzeStyle(text) {
  // Simple style analysis (in production, use AI/NLP)
  const lower = text.toLowerCase();
  
  // Determine tone based on keywords
  let tone = 'neutral';
  if (lower.includes('excited') || lower.includes('amazing') || lower.includes('awesome')) {
    tone = 'enthusiastic';
  } else if (lower.includes('professional') || lower.includes('technical')) {
    tone = 'professional';
  } else if (lower.includes('fun') || lower.includes('lol') || lower.includes('haha')) {
    tone = 'casual';
  }
  
  // Determine style
  let style = 'informative';
  if (lower.includes('tutorial') || lower.includes('how to')) {
    style = 'educational';
  } else if (lower.includes('review') || lower.includes('opinion')) {
    style = 'analytical';
  } else if (lower.includes('story') || lower.includes('experience')) {
    style = 'narrative';
  }
  
  // Determine pacing
  const sentences = text.split(/[.!?]+/);
  const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
  let pacing = 'moderate';
  if (avgWordsPerSentence < 10) {
    pacing = 'fast';
  } else if (avgWordsPerSentence > 20) {
    pacing = 'slow';
  }
  
  return {
    tone,
    style,
    pacing,
    characteristics: {
      sentenceComplexity: avgWordsPerSentence,
      exclamationUsage: (text.match(/!/g) || []).length,
      questionUsage: (text.match(/\?/g) || []).length,
      emphasisWords: (lower.match(/very|really|absolutely|definitely/g) || []).length
    }
  };
}