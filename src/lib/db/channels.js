import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

/**
 * Get a channel by ID with voice profile
 * @param {string} channelId - The channel ID
 * @returns {Promise<Object|null>} Channel data with voice profile
 */
export async function getChannel(channelId) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (error) {
      console.error('Error fetching channel:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getChannel:', error);
    return null;
  }
}

/**
 * Get channels for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of channels
 */
export async function getUserChannels(userId) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user channels:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserChannels:', error);
    return [];
  }
}

/**
 * Update channel voice profile
 * @param {string} channelId - The channel ID
 * @param {Object} voiceProfile - The voice profile data
 * @returns {Promise<boolean>} Success status
 */
export async function updateChannelVoiceProfile(channelId, voiceProfile) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('channels')
      .update({ voice_profile: voiceProfile, updated_at: new Date().toISOString() })
      .eq('id', channelId);

    if (error) {
      console.error('Error updating channel voice profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateChannelVoiceProfile:', error);
    return false;
  }
}

/**
 * Create or update a channel
 * @param {Object} channelData - The channel data
 * @returns {Promise<Object|null>} Created/updated channel
 */
export async function upsertChannel(channelData) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('channels')
      .upsert(channelData, { onConflict: 'youtube_channel_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting channel:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertChannel:', error);
    return null;
  }
}

/**
 * Delete a channel
 * @param {string} channelId - The channel ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteChannel(channelId) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);

    if (error) {
      console.error('Error deleting channel:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteChannel:', error);
    return false;
  }
}
