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

// Cache helper with context-aware TTL
const cache = new Map();
const DEFAULT_CACHE_TTL = 60000; // 1 minute for trending data
const STATIC_CACHE_TTL = 300000; // 5 minutes for static data like categories

// Different cache times for different data types
const CACHE_TTL_MAP = {
  'trending': 30000,     // 30 seconds for trending videos
  'search': 60000,       // 1 minute for search results
  'recent': 30000,       // 30 seconds for recent videos
  'categories': 300000,  // 5 minutes for categories (rarely change)
  'channels': 180000,    // 3 minutes for channel data
  'related': 120000,     // 2 minutes for related content
};

export function getCached(key, forceRefresh = false) {
  if (forceRefresh) {
    cache.delete(key);
    return null;
  }
  
  const cached = cache.get(key);
  if (!cached) return null;
  
  // Determine cache TTL based on key type
  let ttl = DEFAULT_CACHE_TTL;
  for (const [type, typeTtl] of Object.entries(CACHE_TTL_MAP)) {
    if (key.startsWith(type)) {
      ttl = typeTtl;
      break;
    }
  }
  
  if (Date.now() - cached.timestamp < ttl) {
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

export function clearCache(pattern = null) {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Extract channel ID from various YouTube URL formats
export function extractChannelId(url) {
  if (!url) return null;
  
  // Clean the URL
  const cleanUrl = url.trim();
  
  const patterns = [
    // youtube.com/channel/ID (24 character ID)
    { regex: /youtube\.com\/channel\/([a-zA-Z0-9_-]{24})/, type: 'id' },
    // youtube.com/c/customname
    { regex: /youtube\.com\/c\/([a-zA-Z0-9_-]+)/, type: 'identifier' },
    // youtube.com/@handle
    { regex: /youtube\.com\/@([a-zA-Z0-9_.-]+)/, type: 'identifier' },
    // youtube.com/user/username
    { regex: /youtube\.com\/user\/([a-zA-Z0-9_-]+)/, type: 'identifier' },
    // youtu.be/c/customname or youtu.be/@handle
    { regex: /youtu\.be\/[@c]\/([a-zA-Z0-9_.-]+)/, type: 'identifier' },
    // Direct channel ID (24 characters)
    { regex: /^UC[a-zA-Z0-9_-]{22}$/, type: 'id', fullMatch: true },
    // Direct handle (with or without @)
    { regex: /^@?([a-zA-Z0-9_.-]+)$/, type: 'identifier', fullMatch: true },
  ];

  for (const { regex, type, fullMatch } of patterns) {
    const match = fullMatch ? cleanUrl.match(regex) : cleanUrl.match(regex);
    if (match) {
      const value = match[fullMatch ? 0 : 1];
      console.log(`Extracted ${type}: ${value} from URL: ${cleanUrl}`);
      return { type, value: fullMatch && type === 'id' ? value : value.replace('@', '') };
    }
  }

  console.error('Could not extract channel ID from URL:', cleanUrl);
  return null;
}