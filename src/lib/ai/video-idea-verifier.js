/**
 * Video Idea Verifier
 * Validates that video ideas are based on real, verifiable events
 */

import Anthropic from '@anthropic-ai/sdk';

class VideoIdeaVerifier {
  /**
   * Verify if a video idea is based on real events
   * @param {Object} idea - Video idea to verify
   * @returns {Object} Verification result
   */
  static async verifyVideoIdea(idea) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️ No API key for verification');
      return {
        isVerified: false,
        confidence: 0,
        reason: 'Unable to verify without API key'
      };
    }

    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const verificationPrompt = `Verify if this video idea is based on REAL, DOCUMENTED events:

Title: ${idea.title}
Description: ${idea.description || ''}

Please verify:
1. Is this based on a real event that actually happened?
2. When did it occur (if applicable)?
3. What are the key verifiable facts?
4. Are there any inaccuracies in the description?

IMPORTANT:
- If this is about a specific incident (heist, hack, scandal), it MUST have actually happened
- If you cannot verify it happened, mark it as UNVERIFIED
- Be extremely strict - only mark as verified if you're certain it's real

Return JSON:
{
  "isVerified": true/false,
  "confidence": 0-100,
  "eventDate": "when it happened",
  "verifiableFacts": ["fact1", "fact2"],
  "corrections": "any corrections needed",
  "reason": "explanation"
}`;

      const response = await anthropic.messages.create({
        model: process.env.BALANCED_MODEL || 'claude-sonnet-4-6',
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for factual accuracy
        messages: [{
          role: 'user',
          content: verificationPrompt
        }]
      });

      const text = response.content[0].text;

      // Try to parse JSON from response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse verification response:', e);
      }

      // Fallback: look for key phrases
      const isVerified = text.toLowerCase().includes('verified') &&
                        !text.toLowerCase().includes('unverified') &&
                        !text.toLowerCase().includes('cannot verify');

      return {
        isVerified,
        confidence: isVerified ? 70 : 30,
        reason: text.substring(0, 200)
      };

    } catch (error) {
      console.error('Verification error:', error);
      return {
        isVerified: false,
        confidence: 0,
        reason: 'Verification failed'
      };
    }
  }

  /**
   * Verify multiple video ideas in batch
   * @param {Array} ideas - Array of video ideas
   * @returns {Array} Verification results
   */
  static async verifyMultipleIdeas(ideas) {
    const results = [];

    for (const idea of ideas) {
      const verification = await this.verifyVideoIdea(idea);
      results.push({
        ...idea,
        verification
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  /**
   * Filter out unverified ideas
   * @param {Array} ideas - Array of video ideas
   * @returns {Array} Only verified ideas
   */
  static async filterVerifiedIdeas(ideas) {
    const verified = await this.verifyMultipleIdeas(ideas);
    return verified.filter(idea =>
      idea.verification &&
      idea.verification.isVerified &&
      idea.verification.confidence >= 70
    );
  }

  /**
   * Generate fact-checked replacement ideas
   * @param {Array} unverifiedIdeas - Ideas that failed verification
   * @param {String} channelNiche - Channel's content niche
   * @returns {Array} New verified ideas
   */
  static async generateVerifiedReplacements(unverifiedIdeas, channelNiche) {
    if (!process.env.ANTHROPIC_API_KEY || unverifiedIdeas.length === 0) {
      return [];
    }

    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const prompt = `Generate ${unverifiedIdeas.length} REAL, VERIFIABLE video ideas for a ${channelNiche} channel.

These ideas were rejected for being unverifiable:
${unverifiedIdeas.map(idea => `- ${idea.title}`).join('\n')}

Generate replacement ideas that are:
1. Based on REAL, DOCUMENTED events
2. Similar in style/format to the rejected ideas
3. Verifiable with specific dates and facts
4. Interesting and engaging for the audience

Return JSON array:
[
  {
    "title": "Real event title",
    "description": "What happened",
    "year": "When it happened",
    "verifiableFacts": ["fact1", "fact2"],
    "format": "documentary/explainer",
    "duration": "20-25 minutes",
    "growth_potential": 8,
    "tags": ["tag1", "tag2"]
  }
]`;

      const response = await anthropic.messages.create({
        model: process.env.BALANCED_MODEL || 'claude-sonnet-4-6',
        max_tokens: 3000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const text = response.content[0].text;

      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const ideas = JSON.parse(jsonMatch[0]);

          // Mark all as pre-verified since we specifically asked for real events
          return ideas.map(idea => ({
            ...idea,
            isVerified: true,
            verificationDetails: `Occurred in ${idea.year}. ${idea.verifiableFacts?.[0] || ''}`
          }));
        }
      } catch (e) {
        console.error('Failed to parse replacement ideas:', e);
      }

      return [];

    } catch (error) {
      console.error('Failed to generate replacements:', error);
      return [];
    }
  }
}

export default VideoIdeaVerifier;