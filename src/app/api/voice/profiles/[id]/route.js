// Voice Profile Detail API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { validateSchema } from '@/lib/validators';

// GET /api/voice/profiles/[id] - Get specific voice profile
export const GET = createApiHandler(async (req, { params }) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { id } = params;

  const { data: profile, error } = await supabase
    .from('voice_profiles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    throw new ApiError('Voice profile not found', 404);
  }

  return {
    profile: {
      id: profile.id,
      name: profile.profile_name,
      description: profile.description,
      channelId: profile.channel_id,
      characteristics: profile.parameters?.characteristics || {},
      patterns: profile.parameters?.patterns || [],
      vocabulary: profile.parameters?.vocabulary || [],
      guidelines: profile.parameters?.guidelines || [],
      trainingData: {
        sampleCount: profile.training_data?.sampleCount || 0,
        totalWords: profile.training_data?.totalWords || 0,
        analyzedAt: profile.training_data?.analyzedAt,
        manual: profile.training_data?.manual || false
      },
      isActive: profile.is_active,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }
  };
});

// PUT /api/voice/profiles/[id] - Update voice profile
export const PUT = createApiHandler(async (req, { params }) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { id } = params;
  const body = await req.json();

  // Validate request
  const validated = validateSchema(body, {
    name: { required: false, validator: (v) => !v || v.trim().length >= 3 },
    description: { required: false, validator: (v) => v !== undefined },
    characteristics: { required: false, validator: (v) => !v || typeof v === 'object' },
    patterns: { required: false, validator: (v) => !v || Array.isArray(v) },
    vocabulary: { required: false, validator: (v) => !v || Array.isArray(v) },
    guidelines: { required: false, validator: (v) => !v || Array.isArray(v) },
    isActive: { required: false, validator: (v) => typeof v === 'boolean' || v === undefined }
  });

  // Check ownership
  const { data: existingProfile, error: fetchError } = await supabase
    .from('voice_profiles')
    .select('id, parameters')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existingProfile) {
    throw new ApiError('Voice profile not found', 404);
  }

  // Build update object
  const updates = {};
  
  if (validated.name !== undefined) {
    updates.profile_name = validated.name;
  }
  
  if (validated.description !== undefined) {
    updates.description = validated.description;
  }
  
  if (validated.isActive !== undefined) {
    updates.is_active = validated.isActive;
  }

  // Update parameters if any characteristic fields are provided
  if (validated.characteristics || validated.patterns || validated.vocabulary || validated.guidelines) {
    updates.parameters = {
      ...existingProfile.parameters,
      characteristics: validated.characteristics || existingProfile.parameters?.characteristics || {},
      patterns: validated.patterns || existingProfile.parameters?.patterns || [],
      vocabulary: validated.vocabulary || existingProfile.parameters?.vocabulary || [],
      guidelines: validated.guidelines || existingProfile.parameters?.guidelines || []
    };
  }

  updates.updated_at = new Date().toISOString();

  // Update profile
  const { data: updatedProfile, error: updateError } = await supabase
    .from('voice_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Profile update error:', updateError);
    throw new ApiError('Failed to update voice profile', 500);
  }

  return {
    profile: {
      id: updatedProfile.id,
      name: updatedProfile.profile_name,
      description: updatedProfile.description,
      characteristics: updatedProfile.parameters?.characteristics || {},
      patterns: updatedProfile.parameters?.patterns || [],
      vocabulary: updatedProfile.parameters?.vocabulary || [],
      guidelines: updatedProfile.parameters?.guidelines || [],
      isActive: updatedProfile.is_active,
      updatedAt: updatedProfile.updated_at
    }
  };
});

// DELETE /api/voice/profiles/[id] - Delete voice profile
export const DELETE = createApiHandler(async (req, { params }) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { id } = params;

  // Check ownership
  const { data: profile, error: fetchError } = await supabase
    .from('voice_profiles')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !profile) {
    throw new ApiError('Voice profile not found', 404);
  }

  // Soft delete by setting is_active to false
  const { error: deleteError } = await supabase
    .from('voice_profiles')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (deleteError) {
    console.error('Profile deletion error:', deleteError);
    throw new ApiError('Failed to delete voice profile', 500);
  }

  return {
    success: true,
    message: 'Voice profile deleted successfully'
  };
});