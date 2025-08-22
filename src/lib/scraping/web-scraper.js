// Web Scraping Utilities

import { load } from 'cheerio';

export class WebScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
  }

  async scrapeUrl(url, options = {}) {
    const { selector, limit, extractImages = false } = options;

    try {
      const response = await fetch(url, {
        headers: this.headers,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      const html = await response.text();
      const $ = load(html);

      // Extract metadata
      const metadata = {
        title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
        description: $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content') || '',
        author: $('meta[name="author"]').attr('content') || '',
        publishedDate: $('meta[property="article:published_time"]').attr('content') ||
                      $('time').first().attr('datetime') || '',
        image: $('meta[property="og:image"]').attr('content') || ''
      };

      // Extract main content
      let content = '';
      
      if (selector) {
        content = $(selector).text().trim();
      } else {
        // Try common content selectors
        const contentSelectors = [
          'article',
          'main',
          '[role="main"]',
          '.content',
          '#content',
          '.post',
          '.entry-content',
          '.article-body'
        ];

        for (const sel of contentSelectors) {
          const element = $(sel);
          if (element.length > 0) {
            content = element.text().trim();
            break;
          }
        }

        // Fallback to body if no content found
        if (!content) {
          // Remove script and style tags
          $('script, style, nav, header, footer').remove();
          content = $('body').text().trim();
        }
      }

      // Clean up content
      content = this.cleanContent(content);

      // Extract headings for structure
      const headings = [];
      $('h1, h2, h3').each((i, el) => {
        if (limit && i >= limit) return false;
        headings.push({
          level: el.name,
          text: $(el).text().trim()
        });
      });

      // Extract links
      const links = [];
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && text && !href.startsWith('#')) {
          links.push({
            url: new URL(href, url).href,
            text
          });
        }
      });

      // Extract images if requested
      const images = [];
      if (extractImages) {
        $('img[src]').each((i, el) => {
          const src = $(el).attr('src');
          const alt = $(el).attr('alt') || '';
          if (src) {
            images.push({
              url: new URL(src, url).href,
              alt
            });
          }
        });
      }

      return {
        url,
        metadata,
        content,
        headings,
        links: links.slice(0, 20), // Limit links
        images: images.slice(0, 10), // Limit images
        wordCount: content.split(/\s+/).length,
        scrapedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
  }

  cleanContent(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .trim();
  }

  async scrapeYouTubeVideo(videoId) {
    // YouTube-specific scraping
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      const response = await fetch(url, {
        headers: this.headers
      });

      const html = await response.text();
      
      // Extract video data from YouTube's initial data
      const dataMatch = html.match(/var ytInitialData = ({.+?});/);
      if (!dataMatch) {
        throw new Error('Could not extract YouTube data');
      }

      const data = JSON.parse(dataMatch[1]);
      
      // Navigate through YouTube's complex data structure
      const videoDetails = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer;
      const videoSecondary = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer;

      return {
        title: videoDetails?.title?.runs?.[0]?.text || '',
        views: videoDetails?.viewCount?.videoViewCountRenderer?.viewCount?.simpleText || '',
        publishedDate: videoDetails?.dateText?.simpleText || '',
        description: videoSecondary?.description?.runs?.map(r => r.text).join('') || '',
        channelName: videoSecondary?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text || '',
        likes: videoDetails?.videoActions?.menuRenderer?.topLevelButtons?.[0]?.toggleButtonRenderer?.defaultText?.simpleText || ''
      };
    } catch (error) {
      console.error('YouTube scraping error:', error);
      throw new Error(`Failed to scrape YouTube video: ${error.message}`);
    }
  }

  async scrapeMultiple(urls, options = {}) {
    const { concurrency = 3 } = options;
    const results = [];
    
    // Process URLs in batches
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(
        batch.map(url => this.scrapeUrl(url, options))
      );
      
      results.push(...batchResults.map((result, index) => ({
        url: batch[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      })));
    }
    
    return results;
  }
}

// Singleton instance
let scraperInstance;

export function getWebScraper() {
  if (!scraperInstance) {
    scraperInstance = new WebScraper();
  }
  return scraperInstance;
}