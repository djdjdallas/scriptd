/**
 * URL Validation and Filtering Utilities
 * Determines which URLs can be fetched successfully
 */

export function isValidAndFetchableUrl(url) {
  // Skip special URLs
  if (!url || url.startsWith('#')) {
    return {
      valid: false,
      skip: true,
      reason: 'Special URL (internal reference)'
    };
  }

  try {
    const parsed = new URL(url);

    // Check for blocked domains that typically require authentication
    const blockedDomains = [
      'facebook.com',
      'instagram.com',
      'twitter.com',
      'x.com',
      'linkedin.com', // Often requires auth
      'pinterest.com',
      'tiktok.com',
      'reddit.com', // Sometimes blocks scrapers
      'medium.com', // Paywall issues
      'substack.com', // Sometimes paywalled
      'patreon.com', // Requires auth
      'discord.com', // Requires auth
      'slack.com', // Requires auth
      'notion.so', // Often private
      'drive.google.com', // Requires auth
      'docs.google.com', // Requires auth
      'dropbox.com', // Requires auth
    ];

    // Check if hostname includes any blocked domain
    const isBlocked = blockedDomains.some(domain =>
      parsed.hostname.includes(domain)
    );

    if (isBlocked) {
      return {
        valid: false,
        skip: true,
        reason: `Blocked domain (${parsed.hostname} typically requires authentication)`
      };
    }

    // Check for valid protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        valid: false,
        skip: true,
        reason: `Invalid protocol: ${parsed.protocol}`
      };
    }

    // Check for localhost/private IPs (usually not accessible in production)
    const privatePatterns = [
      /^localhost$/i,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /\.local$/i
    ];

    if (privatePatterns.some(pattern => pattern.test(parsed.hostname))) {
      return {
        valid: false,
        skip: true,
        reason: 'Private/local URL not accessible'
      };
    }

    // Check for file URLs
    if (parsed.protocol === 'file:') {
      return {
        valid: false,
        skip: true,
        reason: 'File URLs not supported'
      };
    }

    // URL appears valid and fetchable
    return { valid: true };

  } catch (error) {
    return {
      valid: false,
      skip: true,
      reason: `Invalid URL format: ${error.message}`
    };
  }
}

/**
 * Filter a list of sources to only include fetchable URLs
 */
export function filterFetchableSources(sources) {
  const results = {
    fetchable: [],
    skipped: []
  };

  for (const source of sources) {
    const url = source.source_url || source.url;
    const validation = isValidAndFetchableUrl(url);

    if (validation.valid) {
      results.fetchable.push(source);
    } else {
      results.skipped.push({
        ...source,
        skipReason: validation.reason
      });
    }
  }

  // Log summary
  console.log(`🔍 URL filtering results:`, {
    total: sources.length,
    fetchable: results.fetchable.length,
    skipped: results.skipped.length,
    skippedReasons: results.skipped.map(s => s.skipReason)
  });

  return results;
}

/**
 * Check if a domain is known to have anti-scraping measures
 */
export function hasAntiScrapingMeasures(url) {
  try {
    const parsed = new URL(url);

    const antiScrapingDomains = [
      'cloudflare.com',
      'amazon.com',
      'ebay.com',
      'walmart.com',
      'bestbuy.com',
      'target.com',
      'homedepot.com',
      'lowes.com',
      'netflix.com',
      'hulu.com',
      'disney.com',
      'hbo.com',
      'spotify.com'
    ];

    return antiScrapingDomains.some(domain =>
      parsed.hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

export default {
  isValidAndFetchableUrl,
  filterFetchableSources,
  hasAntiScrapingMeasures
};