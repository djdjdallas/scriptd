/**
 * Admin Guard — Server-side
 *
 * For use in API routes and server components only.
 * Uses process.env.ADMIN_EMAIL as primary check, with DB role fallback.
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Check if a user object represents an admin (server-side).
 *
 * @param {Object} user - Supabase auth user object (must have .email and .id)
 * @param {Object} [supabase] - Optional supabase client (avoids creating a new one)
 * @returns {Promise<boolean>}
 */
export async function isAdminUser(user, supabase) {
  if (!user) return false;

  // Primary: check env-based email
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email === adminEmail) {
    return true;
  }

  // Fallback: check database role
  try {
    const client = supabase || await createClient();
    const { data, error } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) return false;
    return data?.role === 'admin';
  } catch {
    return false;
  }
}
