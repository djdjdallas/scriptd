// Voice Profiles API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { validateSchema } from '@/lib/validators';
import { paginate } from '@/lib/api-handler';
import { apiLogger } from '@/lib/monitoring/logger';

// GET /api/voice/profiles - List user's voice profiles
export const GET = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get('channelId');
  const isActive = searchParams.get('active') !== 'false';
  
  // Pagination
  const { offset, limit, createResponse } = paginate({
    page: searchParams.get('page'),
    limit: searchParams.get('limit')
  });

  // Build query
  let query = supabase
    .from('voice_profiles')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_active', isActive)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (channelId) {
    query = query.eq('channel_id', channelId);
  }

  const { data: profiles, error, count } = await query;

  if (error) {
    apiLogger.error('Failed to fetch voice profiles', error, { userId: user.id });
    throw new ApiError('Failed to fetch voice profiles', 500);
  }

  // Format profiles for response
  const formattedProfiles = profiles.map(profile => ({
    id: profile.id,
    name: profile.profile_name,
    description: profile.description,
    channelId: profile.channel_id,
    characteristics: profile.parameters?.characteristics || {},
    sampleCount: profile.training_data?.sampleCount || 0,
    isActive: profile.is_active,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  }));

  return createResponse(formattedProfiles, count);
});

// POST /api/voice/profiles - Create new voice profile manually
export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const body = await req.json();
  
  // Validate request
  const validated = validateSchema(body, {
    name: { required: true, validator: (v) => v.trim().length >= 3 },
    description: { required: false, validator: (v) => v || '' },
    channelId: { required: false, validator: (v) => v },
    characteristics: { required: true, validator: (v) => typeof v === 'object' }
  });

  // Validate characteristics structure
  const requiredCharacteristics = ['tone', 'style', 'complexity', 'personality'];
  for (const char of requiredCharacteristics) {
    if (!validated.characteristics[char]) {
      throw new ApiError(`Characteristic '${char}' is required`, 400);
    }
  }

  try {
    // Create voice profile
    const { data: profile, error } = await supabase
      .from('voice_profiles')
      .insert({
        user_id: user.id,
        channel_id: validated.channelId,
        profile_name: validated.name,
        description: validated.description,
        training_data: {
          manual: true,
          createdAt: new Date().toISOString()
        },
        parameters: {
          characteristics: validated.characteristics,
          patterns: validated.characteristics.patterns || [],
          vocabulary: validated.characteristics.vocabulary || [],
          guidelines: validated.characteristics.guidelines || []
        },
        is_active: true
      })
      .select()
      .single();

    if (error) {
      apiLogger.error('Profile creation error', error, { userId: user.id });
      throw new ApiError('Failed to create voice profile', 500);
    }

    return {
      profile: {
        id: profile.id,
        name: profile.profile_name,
        description: profile.description,
        channelId: profile.channel_id,
        characteristics: profile.parameters.characteristics,
        createdAt: profile.created_at
      }
    };

  } catch (error) {
    apiLogger.error('Voice profile creation error', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Failed to create voice profile', 500);
  }
});