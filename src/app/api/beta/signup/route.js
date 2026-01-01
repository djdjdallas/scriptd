import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { validateRequest } from '@/lib/api/validation';
import { withRateLimit } from '@/lib/api/rate-limit';
import { ApiError } from '@/lib/api/errors';
import { getPostHogClient } from '@/lib/posthog-server';

// Validation schema for beta signup
const betaSignupSchema = {
  name: { type: 'string', required: true, minLength: 2 },
  email: { type: 'string', required: true, format: 'email' },
  channelName: { type: 'string', required: true, minLength: 2 },
  channelUrl: { type: 'string', required: true, format: 'url' },
  subscriberCount: { type: 'string', required: true },
  contentType: { type: 'string', required: true },
  currentTools: { type: 'string' },
  biggestChallenge: { type: 'string', required: true, minLength: 20 },
  monthlyVideos: { type: 'string', required: true },
  hoursPerVideo: { type: 'string', required: true },
  whyJoinBeta: { type: 'string', required: true, minLength: 20 },
  agreedToTerms: { type: 'boolean', required: true },
};

export async function POST(request) {
  try {
    // Apply rate limiting
    await withRateLimit(request);

    const body = await request.json();
    const data = validateRequest(body, betaSignupSchema);

    if (!data.agreedToTerms) {
      throw new ApiError('You must agree to the terms to continue', 400);
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Check if email already exists in beta signups
    const { data: existingSignup } = await supabase
      .from('beta_signups')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingSignup) {
      throw new ApiError('You have already applied for the beta program', 400);
    }

    // Get current beta signup count
    const { count } = await supabase
      .from('beta_signups')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const spotsRemaining = Math.max(0, 25 - (count || 0));

    if (spotsRemaining === 0) {
      throw new ApiError('Sorry, all beta spots have been filled', 400);
    }

    // Extract channel ID from URL
    let channelId = null;
    try {
      const url = new URL(data.channelUrl);
      const pathParts = url.pathname.split('/');
      
      if (pathParts.includes('@')) {
        channelId = pathParts.find(part => part.startsWith('@'));
      } else if (pathParts.includes('channel')) {
        const channelIndex = pathParts.indexOf('channel');
        channelId = pathParts[channelIndex + 1];
      } else if (pathParts.includes('c')) {
        const cIndex = pathParts.indexOf('c');
        channelId = pathParts[cIndex + 1];
      }
    } catch {
      // Channel ID extraction failed - continue without it
    }

    // Calculate application score (for prioritization)
    let score = 0;
    
    // Subscriber count scoring
    const subRanges = {
      '50k-100k': 10,
      '100k-200k': 8,
      '200k-500k': 6,
      '10k-50k': 4,
      '500k+': 2,
    };
    score += subRanges[data.subscriberCount] || 0;

    // Video frequency scoring
    const videoRanges = {
      '5-8': 10,
      '9-12': 8,
      '3-4': 6,
      '12+': 4,
      '1-2': 2,
    };
    score += videoRanges[data.monthlyVideos] || 0;

    // Time spent scoring (more time = more benefit from automation)
    const timeRanges = {
      '40+': 10,
      '30-40': 8,
      '20-30': 6,
      '10-20': 4,
      '5-10': 2,
    };
    score += timeRanges[data.hoursPerVideo] || 0;

    // Content type scoring (prioritize educational and tech)
    const contentScores = {
      'educational': 5,
      'tech': 5,
      'gaming': 3,
      'business': 3,
      'lifestyle': 2,
      'entertainment': 2,
      'other': 1,
    };
    score += contentScores[data.contentType] || 0;

    // Insert beta signup
    const { error: insertError } = await supabase
      .from('beta_signups')
      .insert({
        name: data.name,
        email: data.email,
        channel_name: data.channelName,
        channel_url: data.channelUrl,
        channel_id: channelId,
        subscriber_count: data.subscriberCount,
        content_type: data.contentType,
        current_tools: data.currentTools,
        biggest_challenge: data.biggestChallenge,
        monthly_videos: data.monthlyVideos,
        hours_per_video: data.hoursPerVideo,
        why_join_beta: data.whyJoinBeta,
        agreed_to_terms: data.agreedToTerms,
        application_score: score,
        status: 'pending',
        metadata: {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent'),
          referrer: request.headers.get('referer'),
        },
      });

    if (insertError) {
      throw new ApiError('Failed to submit application', 500);
    }

    // Send confirmation email (implement this with your email service)
    // await sendBetaConfirmationEmail(data.email, data.name);

    // Track beta signup event in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: data.email, // Use email as distinct ID for anonymous users
      event: 'beta_signup_submitted',
      properties: {
        channel_size: data.subscriberCount,
        content_type: data.contentType,
        monthly_videos: data.monthlyVideos,
        hours_per_video: data.hoursPerVideo,
        application_score: score,
        spots_remaining: spotsRemaining - 1,
      }
    });
    await posthog.shutdown();

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      spotsRemaining: spotsRemaining - 1,
    });

  } catch (error) {
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

// GET endpoint to check remaining spots (public)
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { count } = await supabase
      .from('beta_signups')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const spotsRemaining = Math.max(0, 25 - (count || 0));

    return NextResponse.json({
      spotsRemaining,
      totalSpots: 25,
      isClosed: spotsRemaining === 0,
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to check beta status' },
      { status: 500 }
    );
  }
}