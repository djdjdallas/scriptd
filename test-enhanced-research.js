/**
 * Test script for Enhanced Research System
 *
 * Run with: node test-enhanced-research.js
 */

import ResearchService from './src/lib/ai/research-service.js';

async function testEnhancedResearch() {
  console.log('🧪 Testing Enhanced Research System\n');

  // Test Case 1: Short content that needs expansion
  console.log('=== TEST 1: Topic that needs expansion ===');
  try {
    const result1 = await ResearchService.performEnhancedResearch({
      query: 'Amit Patel Jacksonville Jaguars embezzlement case',
      topic: 'NFL embezzlement scandal',
      targetDuration: 1800, // 30 minutes
      enableExpansion: true
    });

    console.log('\n📊 Test 1 Results:');
    console.log('Success:', result1.success);
    console.log('Sources:', result1.sources?.length || 0);
    console.log('Metrics:', result1.metrics);
    console.log('Expansion performed:', !!result1.expansionPlan);

    if (result1.expansionPlan) {
      console.log('Gaps identified:', result1.expansionPlan.identified_gaps?.length || 0);
      console.log('Expansion searches:', result1.expansionPlan.expansion_searches?.length || 0);
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Case 2: Expansion disabled
  console.log('=== TEST 2: Expansion disabled ===');
  try {
    const result2 = await ResearchService.performEnhancedResearch({
      query: 'cryptocurrency regulation 2024',
      targetDuration: 600, // 10 minutes
      enableExpansion: false // Disabled
    });

    console.log('\n📊 Test 2 Results:');
    console.log('Success:', result2.success);
    console.log('Sources:', result2.sources?.length || 0);
    console.log('Expansion performed:', !!result2.expansionPlan);
    console.log('(Should be false since disabled)');
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Case 3: Already adequate research (short duration)
  console.log('=== TEST 3: Already adequate research ===');
  try {
    const result3 = await ResearchService.performEnhancedResearch({
      query: 'climate change effects',
      targetDuration: 300, // 5 minutes (low bar)
      enableExpansion: true
    });

    console.log('\n📊 Test 3 Results:');
    console.log('Success:', result3.success);
    console.log('Sources:', result3.sources?.length || 0);
    console.log('Coverage:', result3.metrics?.coveragePercent?.toFixed(1) + '%');
    console.log('Expansion needed:', !!result3.expansionPlan);
    console.log('(May be false if initial research sufficient)');
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }

  console.log('\n✅ All tests completed!\n');
}

// Run tests
testEnhancedResearch().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
