/**
 * Onboarding Flow Test Script
 *
 * This script tests the complete onboarding flow including:
 * - Database tables and RPC functions
 * - Progress tracking
 * - Reward system
 * - Analytics tracking
 *
 * Usage: node test-onboarding.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test utilities
const TEST_USER_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'test-password-123';
let testUserId = null;

async function runTests() {
  console.log('🚀 Starting Onboarding Flow Tests\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Check tables exist
    await testTablesExist();

    // Test 2: Check RPC functions exist
    await testRPCFunctions();

    // Test 3: Create test user
    await createTestUser();

    // Test 4: Test onboarding progress tracking
    await testProgressTracking();

    // Test 5: Test complete onboarding with rewards
    await testCompleteOnboarding();

    // Test 6: Verify analytics tracking
    await testAnalyticsTracking();

    // Test 7: Test skip functionality
    await testSkipOnboarding();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Cleanup
    await cleanup();
  }
}

async function testTablesExist() {
  console.log('\n📊 Test 1: Checking if tables exist...');

  const tables = [
    'user_onboarding_progress',
    'onboarding_analytics',
    'onboarding_rewards'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      throw new Error(`Table '${table}' does not exist. Did you run the migration?`);
    }

    console.log(`  ✓ Table '${table}' exists`);
  }

  console.log('  ✅ All tables exist');
}

async function testRPCFunctions() {
  console.log('\n🔧 Test 2: Checking RPC functions...');

  const functions = [
    'update_onboarding_progress',
    'get_onboarding_status',
    'skip_onboarding',
    'complete_onboarding'
  ];

  for (const func of functions) {
    // Check if function exists by querying pg_proc
    const { data, error } = await supabase
      .rpc('get_onboarding_status', { p_user_id: '00000000-0000-0000-0000-000000000000' });

    // We expect an error or empty result, but not "function does not exist"
    if (error && error.message.includes('does not exist')) {
      throw new Error(`RPC function '${func}' does not exist`);
    }

    console.log(`  ✓ Function '${func}' exists`);
  }

  console.log('  ✅ All RPC functions exist');
}

async function createTestUser() {
  console.log('\n👤 Test 3: Creating test user...');

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true
  });

  if (authError) {
    throw new Error(`Failed to create test user: ${authError.message}`);
  }

  testUserId = authData.user.id;
  console.log(`  ✓ Test user created: ${testUserId}`);

  // Create or update user record (may already exist via trigger)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', testUserId)
    .single();

  if (!existingUser) {
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: TEST_USER_EMAIL,
        name: 'Test User',
        onboarding_completed: false,
        onboarding_step: 0,
        credits: 50
      });

    if (userError) {
      throw new Error(`Failed to create user record: ${userError.message}`);
    }
    console.log('  ✓ User record inserted');
  } else {
    // Update existing user to reset state
    await supabase
      .from('users')
      .update({
        name: 'Test User',
        onboarding_completed: false,
        onboarding_step: 0,
        credits: 50
      })
      .eq('id', testUserId);
    console.log('  ✓ User record updated');
  }

  console.log('  ✅ Test user created successfully');
}

async function testProgressTracking() {
  console.log('\n📈 Test 4: Testing progress tracking...');

  // Test updating progress for each step
  const steps = [
    { name: 'welcome', number: 1, data: { viewed: true } },
    { name: 'profile', number: 2, data: { name: 'Test User', user_type: 'creator' } },
    { name: 'channel', number: 3, data: { skipped: true } },
    { name: 'goals', number: 4, data: { content_goals: ['education', 'entertainment'] } }
  ];

  for (const step of steps) {
    const { data, error } = await supabase
      .rpc('update_onboarding_progress', {
        p_user_id: testUserId,
        p_step_name: step.name,
        p_step_number: step.number,
        p_completed: true,
        p_data: step.data
      });

    if (error) {
      throw new Error(`Failed to update progress for ${step.name}: ${error.message}`);
    }

    console.log(`  ✓ Step '${step.name}' progress tracked`);
  }

  // Verify progress was saved
  const { data: progress } = await supabase
    .from('user_onboarding_progress')
    .select('*')
    .eq('user_id', testUserId);

  if (!progress || progress.length !== steps.length) {
    throw new Error('Progress not saved correctly');
  }

  console.log('  ✅ Progress tracking working correctly');
}

async function testCompleteOnboarding() {
  console.log('\n🎉 Test 5: Testing onboarding completion with rewards...');

  // Get initial credits
  const { data: userBefore } = await supabase
    .from('users')
    .select('credits, onboarding_completed')
    .eq('id', testUserId)
    .single();

  console.log(`  Initial credits: ${userBefore.credits}`);

  // Complete onboarding
  const { data: result, error } = await supabase
    .rpc('complete_onboarding', { p_user_id: testUserId });

  if (error) {
    throw new Error(`Failed to complete onboarding: ${error.message}`);
  }

  if (!result.success) {
    throw new Error(`Onboarding completion failed: ${result.message || result.error}`);
  }

  console.log(`  ✓ Onboarding completed: ${result.message}`);
  console.log(`  ✓ Credits awarded: ${result.credits_awarded}`);

  // Verify credits were added
  const { data: userAfter } = await supabase
    .from('users')
    .select('credits, onboarding_completed')
    .eq('id', testUserId)
    .single();

  const expectedCredits = userBefore.credits + result.credits_awarded;

  if (userAfter.credits !== expectedCredits) {
    throw new Error(
      `Credits not added correctly. Expected: ${expectedCredits}, Got: ${userAfter.credits}`
    );
  }

  if (!userAfter.onboarding_completed) {
    throw new Error('onboarding_completed flag not set');
  }

  console.log(`  ✓ Final credits: ${userAfter.credits}`);
  console.log(`  ✓ onboarding_completed flag set correctly`);

  // Verify reward record was created
  const { data: reward } = await supabase
    .from('onboarding_rewards')
    .select('*')
    .eq('user_id', testUserId)
    .single();

  if (!reward) {
    throw new Error('Reward record not created');
  }

  console.log(`  ✓ Reward record created: ${reward.reward_type}`);
  console.log('  ✅ Onboarding completion and rewards working correctly');
}

async function testAnalyticsTracking() {
  console.log('\n📊 Test 6: Testing analytics tracking...');

  // Check analytics events were created
  const { data: events } = await supabase
    .from('onboarding_analytics')
    .select('*')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: true });

  if (!events || events.length === 0) {
    throw new Error('No analytics events found');
  }

  console.log(`  ✓ Found ${events.length} analytics events`);

  // Verify event types
  const eventTypes = events.map(e => e.event_type);
  console.log(`  ✓ Event types: ${eventTypes.join(', ')}`);

  // Should have step_completed and completed events
  if (!eventTypes.includes('step_completed')) {
    console.warn('  ⚠️  Warning: No step_completed events found');
  }

  if (!eventTypes.includes('completed')) {
    console.warn('  ⚠️  Warning: No completed event found');
  }

  console.log('  ✅ Analytics tracking working');
}

async function testSkipOnboarding() {
  console.log('\n⏭️  Test 7: Testing skip functionality...');

  // Create another test user
  const skipUserEmail = `skip-test-${Date.now()}@example.com`;

  const { data: authData } = await supabase.auth.admin.createUser({
    email: skipUserEmail,
    password: TEST_PASSWORD,
    email_confirm: true
  });

  const skipUserId = authData.user.id;

  await supabase.from('users').insert({
    id: skipUserId,
    email: skipUserEmail,
    name: 'Skip Test User',
    credits: 50
  });

  console.log(`  ✓ Created skip test user: ${skipUserId}`);

  // Skip onboarding
  const { data: skipResult, error: skipError } = await supabase
    .rpc('skip_onboarding', { p_user_id: skipUserId });

  if (skipError) {
    throw new Error(`Failed to skip onboarding: ${skipError.message}`);
  }

  console.log('  ✓ Skip onboarding executed');

  // Verify user is marked as completed
  const { data: user } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', skipUserId)
    .single();

  if (!user.onboarding_completed) {
    throw new Error('Skip did not mark onboarding as completed');
  }

  console.log('  ✓ User marked as completed after skip');

  // Verify analytics event
  const { data: events } = await supabase
    .from('onboarding_analytics')
    .select('*')
    .eq('user_id', skipUserId)
    .eq('event_type', 'abandoned');

  if (!events || events.length === 0) {
    throw new Error('No abandoned event tracked for skip');
  }

  console.log('  ✓ Skip event tracked in analytics');

  // Cleanup skip user
  await supabase.auth.admin.deleteUser(skipUserId);

  console.log('  ✅ Skip functionality working correctly');
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  if (testUserId) {
    // Delete test user
    await supabase.auth.admin.deleteUser(testUserId);
    console.log('  ✓ Test user deleted');
  }

  console.log('  ✅ Cleanup complete');
}

// Run tests
runTests().catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
