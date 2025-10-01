import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWebScraper } from '@/lib/scraping/web-scraper';
import { contentFetchLimiter } from '@/lib/rate-limiter';

export async function POST(request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimit = await contentFetchLimiter.checkLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: rateLimit.message,
          resetIn: rateLimit.resetIn 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': contentFetchLimiter.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + rateLimit.resetIn * 1000).toISOString()
          }
        }
      );
    }

    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Skip fetching for special URLs
    if (url.startsWith('#')) {
      return NextResponse.json({ 
        content: '', 
        message: 'Synthetic source - no content to fetch' 
      });
    }

    console.log(`📥 Fetching content from: ${url}`);
    
    try {
      // Use the WebScraper to fetch content with timeout
      const scraper = getWebScraper();
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Scraping timeout')), 10000)
      );
      
      // Race between scraping and timeout
      const scrapedData = await Promise.race([
        scraper.scrapeUrl(url, {
          extractImages: false,
          limit: 10 // Limit headings to 10
        }),
        timeoutPromise
      ]);

      // Check if we got meaningful content
      const contentLength = scrapedData.content?.length || 0;
      
      if (contentLength < 100) {
        console.warn(`⚠️ Limited content from ${url}: ${contentLength} chars`);
        return NextResponse.json({
          content: scrapedData.content || '',
          metadata: scrapedData.metadata,
          wordCount: scrapedData.wordCount,
          headings: scrapedData.headings,
          success: true,
          partial: true,
          message: 'Limited content available'
        });
      }

      // Return the scraped content with rate limit headers
      return NextResponse.json({
        content: scrapedData.content,
        metadata: scrapedData.metadata,
        wordCount: scrapedData.wordCount,
        headings: scrapedData.headings,
        success: true,
        partial: false
      }, {
        headers: {
          'X-RateLimit-Limit': contentFetchLimiter.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(Date.now() + rateLimit.resetIn * 1000).toISOString()
        }
      });
      
    } catch (scrapeError) {
      console.error(`Failed to scrape ${url}:`, scrapeError.message);
      
      // Check if it's a specific error type
      const isTimeout = scrapeError.message === 'Scraping timeout';
      const isBlocked = scrapeError.message?.includes('403') || 
                       scrapeError.message?.includes('429');
      
      // Return partial data if available
      return NextResponse.json({
        content: '',
        error: scrapeError.message,
        success: false,
        partial: true,
        errorType: isTimeout ? 'timeout' : isBlocked ? 'blocked' : 'unknown',
        message: isTimeout ? 'Request timed out' : 
                isBlocked ? 'Access blocked by website' : 
                'Failed to fetch content'
      });
    }

  } catch (error) {
    console.error('Fetch content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}