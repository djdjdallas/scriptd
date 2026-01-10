import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiLogger } from '@/lib/monitoring/logger';

// Simple in-memory cache for search results (15 minutes)
const searchCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request) {
  try {
    // Check authentication
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { query } = await request.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Perform web search using available search APIs
    // This is a placeholder - integrate with your preferred search API
    // Options: Google Custom Search API, Bing Search API, SerpAPI, etc.
    
    // For now, we'll simulate a search with mock data
    // In production, replace this with actual API calls
    const searchResults = await performWebSearch(query);

    // Cache the results
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      data: searchResults
    });

    // Clean old cache entries
    cleanCache();

    return NextResponse.json(searchResults);
  } catch (error) {
    apiLogger.error('Search error', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

async function performWebSearch(query) {
  // Simulate search delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock search results - replace with actual API integration
  // Example with Google Custom Search API:
  /*
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`
  );
  
  if (!response.ok) {
    throw new Error('Search API failed');
  }
  
  const data = await response.json();
  
  return {
    query,
    results: data.items?.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: new URL(item.link).hostname
    })) || [],
    totalResults: data.searchInformation?.totalResults || 0,
    searchTime: data.searchInformation?.searchTime || 0
  };
  */

  // Mock data for development
  const mockResults = [
    {
      title: `Results for "${query}"`,
      link: `https://example.com/search?q=${encodeURIComponent(query)}`,
      snippet: `This is a mock search result for "${query}". In production, this would be real search data.`,
      source: 'example.com'
    },
    {
      title: `${query} - Wikipedia`,
      link: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(' ', '_'))}`,
      snippet: `Wikipedia article about ${query}. Comprehensive information and references.`,
      source: 'wikipedia.org'
    },
    {
      title: `Latest ${query} Statistics 2024`,
      link: `https://statista.com/statistics/${encodeURIComponent(query)}`,
      snippet: `Current statistics and data about ${query} for 2024.`,
      source: 'statista.com'
    }
  ];

  // Create a summary based on mock results
  const summary = `Found information about "${query}" from multiple sources. Key findings include recent statistics, comprehensive definitions, and current trends. Verification confidence: Medium (mock data).`;

  return {
    query,
    results: mockResults,
    summary,
    source: mockResults[0]?.source || 'N/A',
    confidence: 'Medium',
    totalResults: mockResults.length,
    timestamp: new Date().toISOString()
  };
}

function cleanCache() {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      searchCache.delete(key);
    }
  }
}

// Also support GET for testing
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  // Reuse POST logic
  return POST(new Request(request.url, {
    method: 'POST',
    body: JSON.stringify({ query }),
    headers: request.headers
  }));
}