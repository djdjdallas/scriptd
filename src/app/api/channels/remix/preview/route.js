import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeVoiceCompatibility } from '@/lib/ai/voice-mixer';
import { apiLogger } from '@/lib/monitoring/logger';

export async function POST(request) {
  try {
    const { channelIds, config } = await request.json();

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a quick preview without full analysis
    const preview = {
      audience: {
        description: `Your remixed channel will target a combined audience interested in diverse content. The unique blend will help you stand out in a crowded space.`
      },
      growthPotential: `Strong potential - Remixing ${channelIds.length} successful channel strategies provides a solid foundation for growth.`,
      contentStrategy: `Your content will blend the best elements from your selected channels, creating a unique voice that resonates with multiple audience segments.`,
      voiceProfile: `A distinctive voice combining elements from all selected channels, weighted according to your preferences.`
    };

    // If we have actual channel data, provide more specific preview
    if (channelIds.length > 0) {
      const channels = [];
      
      for (const channelId of channelIds.slice(0, 3)) { // Limit to 3 for preview
        const { data: channel } = await supabase
          .from('channels')
          .select('id, title, name, subscriber_count, voice_profile')
          .or(`id.eq.${channelId},youtube_channel_id.eq.${channelId}`)
          .single();
        
        if (channel) {
          channels.push(channel);
        }
      }

      if (channels.length > 0) {
        // Calculate combined subscriber potential
        const totalSubs = channels.reduce((sum, c) => sum + (c.subscriber_count || 0), 0);
        preview.growthPotential = `Combined reach potential of ${totalSubs.toLocaleString()} subscribers from source channels.`;

        // Check voice compatibility if voice profiles exist
        const voiceProfiles = channels.map(c => c.voice_profile).filter(Boolean);
        if (voiceProfiles.length > 1 && config.elements?.voice_style) {
          const compatibility = analyzeVoiceCompatibility(voiceProfiles);
          preview.voiceCompatibility = compatibility;
        }

        // Generate specific audience description
        const channelNames = channels.map(c => c.title || c.name).filter(Boolean);
        if (channelNames.length > 0) {
          preview.audience.description = `Combining audiences from ${channelNames.join(', ')} creates a unique viewer base with diverse interests and high engagement potential.`;
        }
      }
    }

    return NextResponse.json(preview);

  } catch (error) {
    apiLogger.error('Preview generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate preview', details: error.message },
      { status: 500 }
    );
  }
}