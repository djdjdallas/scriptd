// Research Chat API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { getAIService } from '@/lib/ai';
import { CREDIT_COSTS } from '@/lib/constants';
import { validateCreditsWithBypass, conditionalCreditDeduction } from '@/lib/credit-bypass';
import { apiLogger } from '@/lib/monitoring/logger';
import { getPostHogClient } from '@/lib/posthog-server';

// POST /api/research/chat
export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { sessionId, message, context = [] } = await req.json();

  if (!message?.trim()) {
    throw new ApiError('Message is required', 400);
  }

  // Check credits
  const { data: userData } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  const creditCost = CREDIT_COSTS.RESEARCH_CHAT || 1;
  
  if (!userData) {
    throw new ApiError('Failed to fetch user data', 500);
  }
  
  // Check user credits with bypass option
  const creditValidation = validateCreditsWithBypass(userData.credits, creditCost, user);
  if (!creditValidation.isValid) {
    throw new ApiError(creditValidation.message, 402);
  }

  // Get or create research session
  let researchSession;
  if (sessionId) {
    const { data } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
    
    researchSession = data;
  }

  if (!researchSession) {
    const { data, error } = await supabase
      .from('research_sessions')
      .insert({
        user_id: user.id,
        title: message.substring(0, 100),
        metadata: { context: [] }
      })
      .select()
      .single();

    if (error) {
      throw new ApiError('Failed to create research session', 500);
    }
    
    researchSession = data;
  }

  try {
    // Build AI prompt with context
    const systemPrompt = `You are a research assistant helping with YouTube video script preparation. 
Your role is to help gather, analyze, and synthesize information for creating engaging video content.
Be concise but thorough. Cite sources when referencing specific information.`;

    const contextPrompt = context.length > 0 
      ? `\n\nAvailable sources:\n${context.map((s, i) => 
          `[${i + 1}] ${s.title}\n${s.content?.substring(0, 500)}...`
        ).join('\n\n')}`
      : '';

    const userPrompt = `${message}${contextPrompt}`;

    // Generate AI response
    const ai = getAIService();
    const response = await ai.generateChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        ...researchSession.metadata?.messages?.slice(-10) || [], // Include recent history
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 1000
    });

    // Save message to database
    const { data: savedMessage } = await supabase
      .from('research_messages')
      .insert({
        session_id: researchSession.id,
        role: 'user',
        content: message,
        metadata: { context: context.map(c => ({ url: c.url, title: c.title })) }
      })
      .select()
      .single();

    // Save AI response
    const { data: aiMessage } = await supabase
      .from('research_messages')
      .insert({
        session_id: researchSession.id,
        role: 'assistant',
        content: response.text,
        metadata: { 
          usage: response.usage,
          model: response.model
        }
      })
      .select()
      .single();

    // Update session metadata
    await supabase
      .from('research_sessions')
      .update({
        updated_at: new Date().toISOString(),
        metadata: {
          ...researchSession.metadata,
          lastActivity: new Date().toISOString(),
          messageCount: (researchSession.metadata?.messageCount || 0) + 2
        }
      })
      .eq('id', researchSession.id);

    // Deduct credits (with bypass check)
    const creditDeduction = await conditionalCreditDeduction(
      supabase,
      user.id,
      userData.credits,
      creditCost,
      user
    );

    if (!creditDeduction.success && !creditDeduction.bypassed) {
      apiLogger.error('Failed to deduct credits', null, { error: creditDeduction.error });
      // Don't throw error, message was already processed
    }

    // Record transaction (only if credits weren't bypassed)
    if (!creditDeduction.bypassed) {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -creditCost,
          type: 'research_chat',
          description: 'Research chat message',
          metadata: {
            sessionId: researchSession.id,
            messageId: aiMessage.id
          }
        });
    }

    // Check if AI suggested any sources
    const urlRegex = /https?:\/\/[^\s]+/g;
    const suggestedUrls = response.text.match(urlRegex) || [];

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: 'research_chat_message_sent',
      properties: {
        session_id: researchSession.id,
        message_length: message.length,
        context_source_count: context.length,
        credits_used: creditDeduction.bypassed ? 0 : creditCost,
        credits_bypassed: !!creditDeduction.bypassed,
        response_length: response.text?.length || 0,
        suggested_urls_count: suggestedUrls.length,
      }
    });

    return {
      sessionId: researchSession.id,
      messageId: aiMessage.id,
      response: response.text,
      usage: response.usage,
      creditsUsed: creditDeduction.bypassed ? 0 : creditCost,
      creditsBypassed: creditDeduction.bypassed,
      suggestedUrls
    };

  } catch (error) {
    apiLogger.error('Research chat error', error);

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: 'research_chat_failed',
      properties: {
        error_message: error.message || 'Unknown error',
      }
    });

    throw new ApiError('Failed to process research chat', 500);
  }
});