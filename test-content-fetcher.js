/**
 * Test Script for Web Content Fetcher
 * Run with: node test-content-fetcher.js
 */

import { fetchWebContent, fetchMultipleUrls } from './src/lib/utils/web-content-fetcher.js';

console.log('🧪 Testing Web Content Fetcher\n');
console.log('=' .repeat(60));

// Test URLs from your actual research logs
const testUrls = [
  'https://www.justice.gov/opa/pr/two-estonian-nationals-plead-guilty-577m-cryptocurrency-fraud-scheme',
  'https://www.cnbc.com/2024/03/28/live-updates-ftx-founder-sam-bankman-fried-sentencing.html',
  'https://fortune.com/crypto/2024/12/04/celsius-network-founder-guilty-fraud-collapse-crypto-lending-platform/'
];

// Test 1: Single URL fetch with Jina
async function testSingleFetch() {
  console.log('\n📝 Test 1: Single URL Fetch (Jina AI)');
  console.log('-'.repeat(60));

  const url = testUrls[0];
  console.log(`Fetching: ${url}\n`);

  const result = await fetchWebContent(url, {
    useJina: true,
    fallbackToRaw: true,
    timeout: 30000
  });

  if (result.success) {
    console.log('✅ Success!');
    console.log(`Method: ${result.method}`);
    console.log(`Word Count: ${result.wordCount.toLocaleString()}`);
    console.log(`Content Length: ${result.content.length.toLocaleString()} characters`);
    console.log(`\nFirst 500 characters:`);
    console.log(result.content.substring(0, 500));
    console.log('...');
  } else {
    console.log('❌ Failed!');
    console.log(`Error: ${result.error}`);
  }
}

// Test 2: Batch URL fetch
async function testBatchFetch() {
  console.log('\n📝 Test 2: Batch URL Fetch');
  console.log('-'.repeat(60));

  console.log(`Fetching ${testUrls.length} URLs concurrently...\n`);

  const startTime = Date.now();

  const results = await fetchMultipleUrls(testUrls, {
    maxConcurrent: 3,
    minWordCount: 100,
    timeout: 30000,
    onProgress: (completed, total, currentUrl) => {
      console.log(`  Progress: ${completed}/${total} - ${currentUrl.substring(0, 60)}...`);
    }
  });

  const duration = Date.now() - startTime;

  console.log('\n✅ Batch fetch complete!');
  console.log(`Duration: ${duration}ms`);
  console.log(`Success Rate: ${results.length}/${testUrls.length} (${Math.round(results.length / testUrls.length * 100)}%)`);

  if (results.length > 0) {
    const totalWords = results.reduce((sum, r) => sum + r.wordCount, 0);
    const avgWords = Math.round(totalWords / results.length);

    console.log(`Total Words: ${totalWords.toLocaleString()}`);
    console.log(`Average Words: ${avgWords.toLocaleString()}`);
    console.log('\nResults:');

    results.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.url.substring(0, 60)}...`);
      console.log(`     Method: ${result.method}, Words: ${result.wordCount.toLocaleString()}`);
    });
  }
}

// Test 3: Fallback mechanism
async function testFallback() {
  console.log('\n📝 Test 3: Testing Fallback Mechanism');
  console.log('-'.repeat(60));

  // Test with Jina disabled
  const url = testUrls[1];
  console.log(`Fetching with direct method only: ${url}\n`);

  const result = await fetchWebContent(url, {
    useJina: false,
    fallbackToRaw: true
  });

  if (result.success) {
    console.log('✅ Fallback successful!');
    console.log(`Method: ${result.method}`);
    console.log(`Word Count: ${result.wordCount.toLocaleString()}`);
  } else {
    console.log('❌ Fallback failed');
    console.log(`Error: ${result.error}`);
  }
}

// Test 4: Error handling
async function testErrorHandling() {
  console.log('\n📝 Test 4: Error Handling');
  console.log('-'.repeat(60));

  const invalidUrls = [
    'https://this-domain-does-not-exist-12345.com',
    'not-a-valid-url',
    '',
    null
  ];

  for (const url of invalidUrls) {
    const result = await fetchWebContent(url);
    console.log(`URL: ${url || '(empty)'}`);
    console.log(`  Success: ${result.success}`);
    console.log(`  Error: ${result.error || 'none'}`);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testSingleFetch();
    await testBatchFetch();
    await testFallback();
    await testErrorHandling();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test suite failed:');
    console.error(error);
    process.exit(1);
  }
}

runAllTests();
