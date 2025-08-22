import { google } from 'googleapis';

// Initialize YouTube Data API v3 client
export function getYouTubeClient() {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable is not set');
  }

  return google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });
}

// Rate limiting helper
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

export async function withRateLimit(key, fn) {
  const now = Date.now();
  const windowKey = `${key}-${Math.floor(now / RATE_LIMIT_WINDOW)}`;
  
  const current = rateLimitMap.get(windowKey) || 0;
  if (current >= MAX_REQUESTS_PER_WINDOW) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  rateLimitMap.set(windowKey, current + 1);
  
  // Clean up old entries
  for (const [k] of rateLimitMap) {
    if (!k.startsWith(`${key}-${Math.floor(now / RATE_LIMIT_WINDOW)}`)) {
      rateLimitMap.delete(k);
    }
  }
  
  return fn();
}

// Cache helper
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes

export function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  
  // Clean up old cache entries
  if (cache.size > 1000) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    entries.slice(0, 500).forEach(([k]) => cache.delete(k));
  }
}

// Extract channel ID from various YouTube URL formats
export function extractChannelId(url) {
  const patterns = [
    // youtube.com/channel/ID
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    // youtube.com/c/customname
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    // youtube.com/@handle
    /youtube\.com\/@([a-zA-Z0-9_.-]+)/,
    // youtube.com/user/username
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
    // Direct channel ID
    /^([a-zA-Z0-9_-]{24})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { type: pattern.source.includes('channel') ? 'id' : 'identifier', value: match[1] };
    }
  }

  return null;
}