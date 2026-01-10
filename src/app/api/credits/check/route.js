import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ServerCreditManager } from '@/lib/credits/server-manager';
import { apiLogger } from '@/lib/monitoring/logger';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: authError?.message 
      }, { status: 401 });
    }
    
    // Check credit balance
    const balance = await ServerCreditManager.checkBalance(supabase, user.id);
    
    // Get user credits directly from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits, bypass_credits')
      .eq('id', user.id)
      .single();
    
    // Get raw credit transaction records
    const { data: transactions, error: txError } = await supabase
      .from('credits_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    return NextResponse.json({
      user_id: user.id,
      balance: balance,
      user_credits: userData?.credits,
      bypass_credits: userData?.bypass_credits,
      user_error: userError,
      transactions_error: txError,
      recent_transactions: transactions,
      test_deduction: {
        haiku_5min: ServerCreditManager.getFeatureCost('SCRIPT_GENERATION', { model: 'GPT35' }),
        sonnet_5min: ServerCreditManager.getFeatureCost('SCRIPT_GENERATION', { model: 'GPT4' }),
      },
      env_bypass: process.env.BYPASS_CREDIT_CHECKS === 'true'
    });
  } catch (error) {
    apiLogger.error('Credit check error', error);
    return NextResponse.json({ 
      error: 'Failed to check credits',
      details: error.message 
    }, { status: 500 });
  }
}