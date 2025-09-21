import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // Get user data from users table
  const { data: userData } = await supabase
    .from('users')
    .select('id, email, subscription_tier, credits')
    .eq('id', user.id)
    .single();
  
  // Get subscription data from user_subscriptions table
  const { data: subData } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return NextResponse.json({
    user: userData,
    subscription: subData,
    isPremiumByTier: userData?.subscription_tier && userData.subscription_tier !== 'free',
    isPremiumByStatus: subData?.status === 'active'
  });
}