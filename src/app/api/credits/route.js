// Credits Management API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { validateCreditsWithBypass } from '@/lib/credit-bypass';
import { apiLogger } from '@/lib/monitoring/logger';

// GET /api/credits - Get user's credit balance and history
export const GET = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { searchParams } = new URL(req.url);
  const includeHistory = searchParams.get('history') === 'true';

  // Get user's current credit balance
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits, subscription_status, subscription_plan')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new ApiError('Failed to fetch user data', 500);
  }

  const response = {
    balance: userData.credits || 0,
    subscription: {
      status: userData.subscription_status || 'inactive',
      plan: userData.subscription_plan || 'free'
    }
  };

  // Include transaction history if requested
  if (includeHistory) {
    const { data: transactions, error: txError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!txError) {
      response.history = transactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        createdAt: tx.created_at,
        metadata: tx.metadata
      }));
    }
  }

  return response;
});

// POST /api/credits/transfer - Transfer credits between users (for teams)
export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { recipientId, amount, reason } = await req.json();

  if (!recipientId || !amount || amount <= 0) {
    throw new ApiError('Invalid transfer request', 400);
  }

  // Start transaction
  const { data: sender, error: senderError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (senderError || !sender) {
    throw new ApiError('Failed to fetch user data', 500);
  }

  // Check sender's credits with bypass option
  const creditValidation = validateCreditsWithBypass(sender.credits, amount, user);
  if (!creditValidation.isValid) {
    throw new ApiError(creditValidation.message, 400);
  }

  // Check if recipient exists
  const { data: recipient, error: recipientError } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', recipientId)
    .single();

  if (recipientError || !recipient) {
    throw new ApiError('Recipient not found', 404);
  }

  try {
    // Deduct from sender
    await supabase
      .from('users')
      .update({ credits: sender.credits - amount })
      .eq('id', user.id);

    // Add to recipient
    await supabase
      .from('users')
      .update({ credits: supabase.raw('credits + ?', [amount]) })
      .eq('id', recipientId);

    // Record transactions
    const transactionData = {
      reason: reason || 'Credit transfer',
      senderId: user.id,
      recipientId: recipientId,
      recipientEmail: recipient.email
    };

    // Sender transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -amount,
        type: 'transfer_out',
        description: `Transferred to ${recipient.email}`,
        metadata: transactionData
      });

    // Recipient transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: recipientId,
        amount: amount,
        type: 'transfer_in',
        description: `Received from ${user.email}`,
        metadata: transactionData
      });

    return {
      success: true,
      newBalance: sender.credits - amount,
      transfer: {
        amount,
        recipient: recipient.email,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    apiLogger.error('Transfer error', error);
    throw new ApiError('Failed to complete transfer', 500);
  }
});