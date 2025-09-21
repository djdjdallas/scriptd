import { getYouTubeClient, withRateLimit } from './client.js';

/**
 * Search for a YouTube channel by name and get its channel ID
 * This provides a dynamic way to find any channel's ID
 */
export async function findChannelIdByName(channelName) {
  if (!channelName) return null;
  
  console.log(`🔍 Searching YouTube for channel: "${channelName}"`);
  
  try {
    const youtube = getYouTubeClient();
    
    // Search for the channel
    const searchResponse = await withRateLimit('search', () =>
      youtube.search.list({
        part: ['snippet'],
        q: channelName,
        type: ['channel'],
        maxResults: 5,
      })
    );

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      console.log(`  ❌ No channels found for: "${channelName}"`);
      return null;
    }

    // Try to find exact match first
    let channel = searchResponse.data.items.find(item => 
      item.snippet.title.toLowerCase() === channelName.toLowerCase()
    );

    // If no exact match, try to find close match
    if (!channel) {
      channel = searchResponse.data.items.find(item => {
        const title = item.snippet.title.toLowerCase();
        const search = channelName.toLowerCase();
        
        // Remove common suffixes and compare
        const cleanTitle = title.replace(/[:\-–—]/g, '').trim();
        const cleanSearch = search.replace(/[:\-–—]/g, '').trim();
        
        return cleanTitle === cleanSearch || 
               title.includes(search) || 
               search.includes(title);
      });
    }

    // If still no match, use the first result as best guess
    if (!channel) {
      channel = searchResponse.data.items[0];
      console.log(`  ⚠️ No exact match, using best guess: "${channel.snippet.title}"`);
    }

    const channelId = channel.snippet.channelId;
    console.log(`  ✅ Found channel ID for "${channelName}": ${channelId}`);
    
    return channelId;

  } catch (error) {
    console.error(`Error searching for channel "${channelName}":`, error.message);
    return null;
  }
}

/**
 * Batch lookup multiple channels
 * Returns a map of channel names to IDs
 */
export async function findMultipleChannelIds(channelNames) {
  const results = {};
  
  for (const name of channelNames) {
    const id = await findChannelIdByName(name);
    if (id) {
      results[name] = id;
    }
  }
  
  return results;
}

/**
 * Get channel details by ID to verify it's correct
 */
export async function verifyChannelId(channelId, expectedName) {
  try {
    const youtube = getYouTubeClient();
    
    const response = await withRateLimit('channels', () =>
      youtube.channels.list({
        part: ['snippet'],
        id: [channelId],
      })
    );

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      const actualName = channel.snippet.title;
      
      // Check if the names are reasonably similar
      const similarity = actualName.toLowerCase().includes(expectedName.toLowerCase()) ||
                        expectedName.toLowerCase().includes(actualName.toLowerCase());
      
      return {
        valid: true,
        actualName,
        matches: similarity
      };
    }

    return { valid: false };

  } catch (error) {
    console.error(`Error verifying channel ID ${channelId}:`, error.message);
    return { valid: false, error: error.message };
  }
}