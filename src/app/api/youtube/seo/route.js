import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  generateOptimizedTitle,
  generateOptimizedDescription,
  generateOptimizedTags,
  analyzeKeywordDensity,
  getTrendingKeywords,
  calculateSEOScore 
} from '@/lib/youtube/seo';
import { validateRequest } from '@/lib/api/validation';
import { withRateLimit } from '@/lib/api/rate-limit';
import { ApiError } from '@/lib/api/errors';
import { CREDIT_COSTS } from '@/lib/constants';
import { deductCredits } from '@/lib/credits';

// Validation schemas
const optimizeTitleSchema = {
  topic: { type: 'string', required: true, minLength: 3 },
  keywords: { type: 'array', required: true, minItems: 1 },
  channelNiche: { type: 'string', required: true },
  competitorTitles: { type: 'array', default: [] },
  targetLength: { type: 'number', default: 60 },
};

const optimizeDescriptionSchema = {
  title: { type: 'string', required: true },
  content: { type: 'string', required: true },
  keywords: { type: 'array', required: true },
  channelDescription: { type: 'string', required: true },
  links: { type: 'array', default: [] },
  timestamps: { type: 'array', default: [] },
};

const optimizeTagsSchema = {
  title: { type: 'string', required: true },
  content: { type: 'string', required: true },
  category: { type: 'string', required: true },
  competitorTags: { type: 'array', default: [] },
  maxTags: { type: 'number', default: 30 },
};

const analyzeSEOSchema = {
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  tags: { type: 'array', required: true },
  keywords: { type: 'array', required: true },
  thumbnailOptimized: { type: 'boolean', default: false },
};

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new ApiError('Authentication required', 401);
    }

    const body = await request.json();
    const { action } = body;

    // Apply rate limiting
    await withRateLimit(request, session.user.id);

    let result;
    let creditCost = 0;

    switch (action) {
      case 'optimizeTitle': {
        const data = validateRequest(body.data, optimizeTitleSchema);
        creditCost = 2; // Lower cost for title optimization
        
        // Check and deduct credits
        await deductCredits(supabase, session.user.id, creditCost, 'seo_title_optimization');
        
        result = await generateOptimizedTitle(data);
        break;
      }

      case 'optimizeDescription': {
        const data = validateRequest(body.data, optimizeDescriptionSchema);
        creditCost = 3;
        
        await deductCredits(supabase, session.user.id, creditCost, 'seo_description_optimization');
        
        result = await generateOptimizedDescription(data);
        break;
      }

      case 'optimizeTags': {
        const data = validateRequest(body.data, optimizeTagsSchema);
        creditCost = 2;
        
        await deductCredits(supabase, session.user.id, creditCost, 'seo_tags_optimization');
        
        result = await generateOptimizedTags(data);
        break;
      }

      case 'analyzeSEO': {
        const data = validateRequest(body.data, analyzeSEOSchema);
        creditCost = 1; // Analysis is cheaper
        
        await deductCredits(supabase, session.user.id, creditCost, 'seo_analysis');
        
        result = calculateSEOScore(data);
        break;
      }

      case 'getTrending': {
        const { niche, region } = body.data;
        if (!niche) {
          throw new ApiError('Niche is required', 400);
        }
        
        creditCost = 1;
        await deductCredits(supabase, session.user.id, creditCost, 'trending_keywords');
        
        result = await getTrendingKeywords(niche, region);
        break;
      }

      case 'analyzeKeywordDensity': {
        const { text, keywords } = body.data;
        if (!text || !keywords) {
          throw new ApiError('Text and keywords are required', 400);
        }
        
        // This is a simple calculation, no credits needed
        result = analyzeKeywordDensity(text, keywords);
        creditCost = 0;
        break;
      }

      default:
        throw new ApiError('Invalid action', 400);
    }

    // Log the SEO operation
    if (creditCost > 0) {
      await supabase.from('seo_operations').insert({
        user_id: session.user.id,
        action,
        credits_used: creditCost,
        metadata: body.data,
      });
    }

    return NextResponse.json({ 
      success: true,
      data: result,
      creditsUsed: creditCost,
    });

  } catch (error) {
    console.error('SEO API error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for trending keywords (public, rate-limited)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    const region = searchParams.get('region') || 'US';

    if (!niche) {
      throw new ApiError('Niche parameter is required', 400);
    }

    // Public endpoint rate limiting by IP
    await withRateLimit(request);

    const result = await getTrendingKeywords(niche, region);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Trending keywords error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}