import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler } from '@/lib/api-handler';

export const GET = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();
  
  // Get user details from the users table
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('[API /user] Error fetching user:', error);
    // Return default user data if not found
    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        credits: 15, // Default credits
        subscription_tier: 'free'
      }
    });
  }
  
  return NextResponse.json({
    data: {
      id: userData.id,
      email: userData.email,
      credits: userData.credits || 15,
      subscription_tier: userData.subscription_tier || 'free',
      name: userData.name,
      avatar_url: userData.avatar_url
    }
  });
});