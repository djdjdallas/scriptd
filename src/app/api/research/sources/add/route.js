// Add Research Source API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { getWebScraper } from '@/lib/scraping/web-scraper';
import { getAIService } from '@/lib/ai';
import { apiLogger } from '@/lib/monitoring/logger';

// POST /api/research/sources/add
export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { url, sessionId } = await req.json();

  if (!url || !isValidUrl(url)) {
    throw new ApiError('Valid URL is required', 400);
  }

  try {
    // Scrape the URL
    const scraper = getWebScraper();
    const scrapedData = await scraper.scrapeUrl(url, {
      extractImages: false,
      limit: 10
    });

    // Generate summary using AI
    const ai = getAIService();
    const summaryResponse = await ai.generateText({
      prompt: `Summarize this content for YouTube video research. Focus on key points and interesting facts:\n\n${scrapedData.content.substring(0, 3000)}`,
      maxTokens: 200,
      temperature: 0.5
    });

    // Save source to database
    const { data: source, error } = await supabase
      .from('research_sources')
      .insert({
        user_id: user.id,
        session_id: sessionId || null,
        url,
        title: scrapedData.metadata.title || 'Untitled',
        content: scrapedData.content.substring(0, 10000), // Limit content size
        summary: summaryResponse.text,
        metadata: {
          author: scrapedData.metadata.author,
          publishedDate: scrapedData.metadata.publishedDate,
          image: scrapedData.metadata.image,
          wordCount: scrapedData.wordCount,
          headings: scrapedData.headings.slice(0, 10),
          scrapedAt: scrapedData.scrapedAt
        }
      })
      .select()
      .single();

    if (error) {
      throw new ApiError('Failed to save source', 500);
    }

    return {
      source: {
        id: source.id,
        url: source.url,
        title: source.title,
        summary: source.summary,
        wordCount: source.metadata.wordCount,
        starred: false,
        createdAt: source.created_at
      }
    };

  } catch (error) {
    apiLogger.error('Add source error', error);

    if (error.message.includes('Failed to fetch')) {
      throw new ApiError('Could not access the URL. Please check if it\'s valid and accessible.', 400);
    }
    
    throw new ApiError('Failed to add source', 500);
  }
});

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}