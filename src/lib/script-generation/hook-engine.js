/**
 * Dedicated Hook Generation Engine
 *
 * Generates high-quality YouTube hooks as a focused, standalone step
 * before main script generation. Hooks are the most critical part of
 * a YouTube script — the first 3 seconds determine video success.
 *
 * Uses Haiku 4.5 (WORKFLOW_MODEL) for speed and cost efficiency.
 */

import Anthropic from '@anthropic-ai/sdk';
import { WORKFLOW_MODEL } from '@/lib/constants';
import { buildVoicePromptInjection } from '@/lib/voice-training/normalizer';
import { apiLogger } from '@/lib/monitoring/logger';

/**
 * Generate a compelling hook for a YouTube script.
 *
 * @param {Object} params
 * @param {Object} params.voiceProfile - Normalized voice profile (optional)
 * @param {Object} params.scriptContext - { title, type, targetAudience, tone, length }
 * @param {string} params.channelName - Channel name for voice matching
 * @returns {Promise<{ success: boolean, hook?: string, fallbackUsed: boolean, error?: string }>}
 */
export async function generateHook({ voiceProfile, scriptContext, channelName }) {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const voiceInjection = voiceProfile
      ? buildVoicePromptInjection(voiceProfile, channelName || '')
      : '';

    const systemPrompt = `You are a YouTube hook specialist. Write ONLY a compelling 15-30 second opening hook for a YouTube video.

RULES:
- The hook must grab attention in the first 3 seconds
- Use a specific, concrete claim or question — never vague
- Match the creator's voice if a voice profile is provided
- Output ONLY the hook text, no labels, no markdown, no explanations
- Keep it between 30 and 80 words

${voiceInjection ? `CREATOR VOICE:\n${voiceInjection}` : ''}`;

    const userPrompt = `Write a hook for this YouTube video:
Title: ${scriptContext.title}
Type: ${scriptContext.type || 'educational'}
Audience: ${scriptContext.targetAudience || 'general'}
Tone: ${scriptContext.tone || 'professional'}
Video Length: ${scriptContext.length || 10} minutes

Remember: Output ONLY the hook text, nothing else.`;

    const response = await anthropic.messages.create({
      model: WORKFLOW_MODEL,
      max_tokens: 500,
      temperature: 0.8,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    let hook = response.content[0].text.trim();

    // Clean any accidental markdown or labels
    hook = hook
      .replace(/^(hook:|opening:|intro:)\s*/i, '')
      .replace(/^["']|["']$/g, '')
      .trim();

    if (!hook || hook.length < 10) {
      return { success: false, fallbackUsed: true, error: 'Hook too short' };
    }

    apiLogger.info('Hook pre-generated successfully', {
      hookLength: hook.length,
      wordCount: hook.split(/\s+/).length,
    });

    return { success: true, hook, fallbackUsed: false };
  } catch (error) {
    apiLogger.error('Hook generation failed, falling back to inline', {
      error: error.message,
    });
    return { success: false, fallbackUsed: true, error: error.message };
  }
}
