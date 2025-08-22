// Research Chat API Route

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { getAIService } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import { CREDIT_COSTS } from '@/lib/constants';

// POST /api/research/chat
export const POST = createApiHandler(async (req) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError('Authentication required', 401);
  }

  const { sessionId, message, context = [] } = await req.json();

  if (!message?.trim()) {
    throw new ApiError('Message is required', 400);
  }

  // Check credits
  const { data: user } = await supabase
    .from('users')
    .select('credits')
    .eq('id', session.user.id)
    .single();

  if (!user || user.credits < CREDIT_COSTS.RESEARCH_CHAT) {
    throw new ApiError('Insufficient credits', 402);
  }

  // Get or create research session
  let researchSession;
  if (sessionId) {
    const { data } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', session.user.id)
      .single();
    
    researchSession = data;
  }

  if (!researchSession) {
    const { data, error } = await supabase
      .from('research_sessions')
      .insert({
        user_id: session.user.id,
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
    const response = await ai.generateChat({
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

    // Deduct credits
    await supabase
      .from('users')
      .update({ credits: user.credits - CREDIT_COSTS.RESEARCH_CHAT })
      .eq('id', session.user.id);

    // Record transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: session.user.id,
        amount: -CREDIT_COSTS.RESEARCH_CHAT,
        type: 'research_chat',
        description: 'Research chat message',
        metadata: {
          sessionId: researchSession.id,
          messageId: aiMessage.id
        }
      });

    // Check if AI suggested any sources
    const urlRegex = /https?:\/\/[^\s]+/g;
    const suggestedUrls = response.text.match(urlRegex) || [];

    return {
      sessionId: researchSession.id,
      messageId: aiMessage.id,
      response: response.text,
      usage: response.usage,
      creditsUsed: CREDIT_COSTS.RESEARCH_CHAT,
      suggestedUrls
    };

  } catch (error) {
    console.error('Research chat error:', error);
    throw new ApiError('Failed to process research chat', 500);
  }
});