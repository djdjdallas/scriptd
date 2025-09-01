#!/usr/bin/env node

/**
 * Test script for credit bypass functionality
 * 
 * Usage:
 *   node scripts/test-credit-bypass.js
 */

import { shouldBypassCredits } from '../src/lib/credit-bypass.js';

console.log('Testing Credit Bypass System\n');

// Test 1: Environment variable bypass
console.log('Test 1: Environment Variable Bypass');
process.env.BYPASS_CREDIT_CHECKS = 'true';
const test1 = shouldBypassCredits();
console.log(`Result: ${test1 ? 'PASS' : 'FAIL'} - Should bypass when env var is true\n`);

// Reset
process.env.BYPASS_CREDIT_CHECKS = 'false';

// Test 2: User with bypass_credits flag
console.log('Test 2: User with bypass_credits flag');
const userWithBypass = { id: '123', email: 'user@example.com', bypass_credits: true };
const test2 = shouldBypassCredits(userWithBypass);
console.log(`Result: ${test2 ? 'PASS' : 'FAIL'} - Should bypass for user with flag\n`);

// Test 3: Email in bypass list
console.log('Test 3: Email in bypass list');
process.env.BYPASS_CREDIT_EMAILS = 'admin@example.com,test@example.com';
const userWithBypassEmail = { id: '456', email: 'test@example.com', bypass_credits: false };
const test3 = shouldBypassCredits(userWithBypassEmail);
console.log(`Result: ${test3 ? 'PASS' : 'FAIL'} - Should bypass for email in list\n`);

// Test 4: No bypass conditions met
console.log('Test 4: No bypass conditions');
process.env.BYPASS_CREDIT_CHECKS = 'false';
process.env.BYPASS_CREDIT_EMAILS = 'admin@example.com';
const regularUser = { id: '789', email: 'regular@example.com', bypass_credits: false };
const test4 = !shouldBypassCredits(regularUser);
console.log(`Result: ${test4 ? 'PASS' : 'FAIL'} - Should NOT bypass for regular user\n`);

// Test 5: Case-insensitive email matching
console.log('Test 5: Case-insensitive email');
process.env.BYPASS_CREDIT_EMAILS = 'ADMIN@EXAMPLE.COM';
const userWithMixedCaseEmail = { id: '999', email: 'admin@example.com', bypass_credits: false };
const test5 = shouldBypassCredits(userWithMixedCaseEmail);
console.log(`Result: ${test5 ? 'PASS' : 'FAIL'} - Should bypass with case-insensitive email\n`);

// Summary
const allTests = [test1, test2, test3, test4, test5];
const passed = allTests.filter(t => t).length;
console.log(`\nSummary: ${passed}/${allTests.length} tests passed`);

if (passed === allTests.length) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}