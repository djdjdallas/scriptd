// Temporary endpoint for adding test credits
// DELETE THIS FILE AFTER TESTING

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(req) {
  try {
    const { user } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { amount = 200 } = await req.json();
    const supabase = createClient();

    // Add credits directly to user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: supabase.raw('COALESCE(credits, 0) + ?', [amount]) 
      })
      .eq('id', user.id)
      .select('credits')
      .single();

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
    }

    // Record the transaction
    const { error: txError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        type: 'test_credit',
        description: 'Test credits for development',
        metadata: { 
          source: 'test_endpoint',
          timestamp: new Date().toISOString()
        }
      });

    if (txError) {
      console.error('Error recording transaction:', txError);
    }

    return NextResponse.json({
      success: true,
      message: `Added ${amount} test credits`,
      newBalance: updatedUser.credits,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Test credits error:', error);
    return NextResponse.json({ 
      error: 'Failed to add test credits',
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to check current balance
export async function GET(req) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('credits, email')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to get credits' }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: userData.email,
        credits: userData.credits || 0
      }
    });

  } catch (error) {
    console.error('Get credits error:', error);
    return NextResponse.json({ 
      error: 'Failed to get credits',
      details: error.message 
    }, { status: 500 });
  }
}