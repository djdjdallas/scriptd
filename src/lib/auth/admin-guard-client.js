/**
 * Admin Guard — Client-side
 *
 * For use in page components and client components only.
 * Does not import server-only modules.
 */

/**
 * Check if a user is an admin (client-side).
 * Queries the users table via the provided client-side supabase instance.
 *
 * @param {Object} user - Supabase auth user
 * @param {Object} supabaseClient - Client-side supabase instance from createClient()
 * @returns {Promise<boolean>}
 */
export async function isAdminUserClient(user, supabaseClient) {
  if (!user) return false;

  try {
    const { data, error } = await supabaseClient
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
