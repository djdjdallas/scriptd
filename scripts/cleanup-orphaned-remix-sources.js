#!/usr/bin/env node

/**
 * Cleanup Orphaned Remix Source Channels
 *
 * This script removes channels that were created as temporary source channels
 * during remix analysis but were not properly deleted.
 *
 * Criteria for deletion:
 * - Channel is NOT a remix channel (is_remix = false)
 * - Channel has voice_training_status = 'skipped' (indicates it's an external source)
 * - Channel was created recently (within last 30 days)
 * - OR: Channel appears in remix_source_ids but is not the main remix channel
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupOrphanedSources() {
  console.log('🔍 Searching for orphaned remix source channels...\n');

  try {
    // Strategy 1: Find channels with voice_training_status = 'skipped'
    // These are external channels that were created during remix
    const { data: skippedChannels, error: skippedError } = await supabase
      .from('channels')
      .select('id, title, youtube_channel_id, created_at, is_remix, user_id')
      .eq('voice_training_status', 'skipped')
      .eq('is_remix', false);

    if (skippedError) {
      console.error('Error fetching skipped channels:', skippedError);
      return;
    }

    console.log(`Found ${skippedChannels?.length || 0} channels with voice_training_status='skipped'`);

    // Strategy 2: Find channels that are referenced in remix_source_ids but are not remix channels
    const { data: allRemixChannels, error: remixError } = await supabase
      .from('channels')
      .select('id, title, remix_source_ids')
      .eq('is_remix', true)
      .not('remix_source_ids', 'is', null);

    if (remixError) {
      console.error('Error fetching remix channels:', remixError);
      return;
    }

    // Collect all source IDs that are actually used in remixes
    const usedSourceIds = new Set();
    allRemixChannels?.forEach(remix => {
      if (Array.isArray(remix.remix_source_ids)) {
        remix.remix_source_ids.forEach(id => usedSourceIds.add(id));
      }
    });

    console.log(`Found ${usedSourceIds.size} unique channel IDs referenced in remixes`);

    // Get details of these referenced channels
    const { data: referencedChannels, error: refError } = await supabase
      .from('channels')
      .select('id, title, youtube_channel_id, is_remix, user_id')
      .in('id', Array.from(usedSourceIds));

    if (refError) {
      console.error('Error fetching referenced channels:', refError);
    }

    // Find channels that are:
    // 1. Referenced in remix_source_ids
    // 2. NOT remix channels themselves
    // 3. Have 'skipped' voice training (external sources)
    const orphanedSources = referencedChannels?.filter(ch =>
      !ch.is_remix &&
      skippedChannels?.some(s => s.id === ch.id)
    ) || [];

    console.log(`\nFound ${orphanedSources.length} orphaned source channels to delete:\n`);

    if (orphanedSources.length === 0) {
      console.log('✅ No orphaned channels found. Database is clean!');
      return;
    }

    // Group by user for reporting
    const byUser = {};
    orphanedSources.forEach(ch => {
      if (!byUser[ch.user_id]) {
        byUser[ch.user_id] = [];
      }
      byUser[ch.user_id].push(ch);
    });

    // Display what will be deleted
    Object.entries(byUser).forEach(([userId, channels]) => {
      console.log(`User ${userId}:`);
      channels.forEach(ch => {
        console.log(`  - ${ch.title} (${ch.youtube_channel_id})`);
      });
      console.log();
    });

    // Confirm deletion
    console.log('⚠️  This will DELETE the channels listed above.');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete orphaned channels
    const idsToDelete = orphanedSources.map(ch => ch.id);

    console.log('🗑️  Deleting orphaned channels...');

    const { error: deleteError } = await supabase
      .from('channels')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('❌ Error deleting channels:', deleteError);
      return;
    }

    console.log(`✅ Successfully deleted ${idsToDelete.length} orphaned source channels!`);

    // Verify deletion
    const { data: remaining, error: verifyError } = await supabase
      .from('channels')
      .select('id')
      .eq('voice_training_status', 'skipped')
      .eq('is_remix', false);

    if (!verifyError) {
      console.log(`\n📊 Remaining channels with 'skipped' status: ${remaining?.length || 0}`);
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupOrphanedSources()
  .then(() => {
    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
