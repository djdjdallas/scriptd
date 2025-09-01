import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-handler';

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new ApiError('Authentication required', 401);
  }
  
  return { user, supabase };
}