// Known YouTube Channel IDs for popular creators
// This serves as a fallback when channels don't have IDs from search

export const KNOWN_CHANNELS = {
  // By channel name (case-insensitive)
  'patrick cc': 'UCGaVdbSav8xWuFWTadK6loA',
  'patrick cc:': 'UCGaVdbSav8xWuFWTadK6loA',
  'patrickcctv': 'UCGaVdbSav8xWuFWTadK6loA',
  
  'johnny harris': 'UCmGSJVG3mCRXVOP4yZrU1Dw',
  'johnnyharris': 'UCmGSJVG3mCRXVOP4yZrU1Dw',
  
  'mkbhd': 'UCBJycsmduvYEL83R_U4JriQ',
  'marques brownlee': 'UCBJycsmduvYEL83R_U4JriQ',
  
  'mrbeast': 'UCX6OQ3DkcsbYNE6H8uQQuVA',
  'mr beast': 'UCX6OQ3DkcsbYNE6H8uQQuVA',
  
  'pewdiepie': 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
  
  'veritasium': 'UCHnyfMqiRRG1u-2MsSQLbXA',
  
  'kurzgesagt': 'UCsXVk37bltHxD1rDPwtNM8Q',
  'kurzgesagt – in a nutshell': 'UCsXVk37bltHxD1rDPwtNM8Q',
  
  'vsauce': 'UC6nSFpj9HTCZ5t-N3Rm3-HA',
  
  'mark rober': 'UCY1kMZp36IQSyNx_9h4mpCg',
  'markrober': 'UCY1kMZp36IQSyNx_9h4mpCg',
  
  'cody ko': 'UCfp86n--4JvqKbunwSI2lYQ',
  'codyko': 'UCfp86n--4JvqKbunwSI2lYQ',
  
  'emma chamberlain': 'UC78cxCAcp7JfQPgKxYdyGrg',
  'emmachamberlain': 'UC78cxCAcp7JfQPgKxYdyGrg',
  
  'casey neistat': 'UCtinbF-Q-fVthA0qrFQTgXQ',
  'caseyneistat': 'UCtinbF-Q-fVthA0qrFQTgXQ',
  
  'peter mckinnon': 'UC3DkFux8Iv-aYnTRWzwaiBA',
  'petermckinnon': 'UC3DkFux8Iv-aYnTRWzwaiBA',
  
  'unbox therapy': 'UCsTcErHg8oDvUnTzoqsYeNw',
  'unboxtherapy': 'UCsTcErHg8oDvUnTzoqsYeNw',
  
  'linus tech tips': 'UCXuqSBlHAE6Xw-yeJA0Tunw',
  'linustechtips': 'UCXuqSBlHAE6Xw-yeJA0Tunw',
  
  'airrack': 'UCyXKqAFHlxfD4eEMkLbaqIA',
  
  'yes theory': 'UCvK4bOhULCpmLabd2pDMtnA',
  'yestheory': 'UCvK4bOhULCpmLabd2pDMtnA',
  
  'colin and samir': 'UCU_ulb3R2ynwgdNnq_2gLTQ',
  'colinandsamir': 'UCU_ulb3R2ynwgdNnq_2gLTQ',
  
  'ali abdaal': 'UCoOae5nYA7VqaXzerajD0lg',
  'aliabdaal': 'UCoOae5nYA7VqaXzerajD0lg',
  
  'matt d\'avella': 'UCJ24N4O0bP7LGLBDvye7oCA',
  'matt davella': 'UCJ24N4O0bP7LGLBDvye7oCA',
  
  'the infographics show': 'UCfdNM3NAhaBOXCafH7krzrA',
  'infographics show': 'UCfdNM3NAhaBOXCafH7krzrA',
  
  'vox': 'UCLXo7UDZvByw2ixzpQCufnA',
  
  'vice': 'UCn8zNIfYAQNdrFRrr8oibKw',
  
  'wendover productions': 'UC9RM-iSvTu1uPJb8X5yp3EQ',
  
  'real engineering': 'UCR1IuLEqb6UEA_zQ81kwrfA',
  
  'cgp grey': 'UC2C_jShtL725hvbm1arSV9w',
  'cgpgrey': 'UC2C_jShtL725hvbm1arSV9w'
};

/**
 * Get YouTube channel ID for a known channel name
 * @param {string} channelName - The channel name to lookup
 * @returns {string|null} - The YouTube channel ID or null if not found
 */
export function getKnownChannelId(channelName) {
  if (!channelName) return null;
  
  const normalized = channelName.toLowerCase().trim();
  return KNOWN_CHANNELS[normalized] || null;
}

/**
 * Check if a channel is known
 * @param {string} channelName - The channel name to check
 * @returns {boolean} - True if the channel is known
 */
export function isKnownChannel(channelName) {
  return !!getKnownChannelId(channelName);
}