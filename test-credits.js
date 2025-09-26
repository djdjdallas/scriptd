#!/usr/bin/env node

// Test script for credit system
// Run with: node test-credits.js

const BASE_URL = 'http://localhost:3000';

async function testCredits() {
  console.log('🧪 Testing Credit System\n');
  console.log('========================\n');

  try {
    // Step 1: Check current balance
    console.log('1️⃣  Checking current credit balance...');
    const checkResponse = await fetch(`${BASE_URL}/api/credits/test-add`, {
      method: 'GET',
      headers: {
        'Cookie': process.env.COOKIE || ''
      }
    });
    
    if (!checkResponse.ok) {
      console.error('❌ Failed to check balance. Make sure you are logged in.');
      console.log('   Visit http://localhost:3000 and login first.');
      return;
    }

    const currentData = await checkResponse.json();
    console.log(`   Current balance: ${currentData.user.credits} credits`);
    console.log(`   User: ${currentData.user.email}\n`);

    // Step 2: Add test credits
    console.log('2️⃣  Adding 200 test credits...');
    const addResponse = await fetch(`${BASE_URL}/api/credits/test-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': process.env.COOKIE || ''
      },
      body: JSON.stringify({ amount: 200 })
    });

    if (!addResponse.ok) {
      console.error('❌ Failed to add credits');
      const error = await addResponse.text();
      console.error(error);
      return;
    }

    const addData = await addResponse.json();
    console.log(`   ✅ ${addData.message}`);
    console.log(`   New balance: ${addData.newBalance} credits\n`);

    // Step 3: Test script generation (this will deduct credits)
    console.log('3️⃣  Testing script generation (will deduct credits)...');
    console.log('   Navigate to: http://localhost:3000/scripts/create');
    console.log('   Or use the workflow at: http://localhost:3000/workflows\n');

    // Step 4: Check credit costs
    console.log('4️⃣  Credit costs for different features:');
    console.log('   - Script Generation (GPT-3.5): 10 credits');
    console.log('   - Script Generation (GPT-4): 30 credits');
    console.log('   - Title Generation: 3 credits');
    console.log('   - Hook Generation: 5 credits');
    console.log('   - Thumbnail Ideas: 5 credits');
    console.log('   - Voice Training: 100 credits');
    console.log('   - Voice Matching: 20 credits\n');

    console.log('✨ Test credits added successfully!');
    console.log('   You can now test the credit deduction system.');
    console.log('   Monitor credits at: http://localhost:3000/credits');

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n⚠️  Make sure:');
    console.log('   1. The development server is running (npm run dev)');
    console.log('   2. You are logged in at http://localhost:3000');
    console.log('   3. Copy your session cookie and run:');
    console.log('      COOKIE="your-cookie-here" node test-credits.js');
  }
}

// Alternative: Test via browser console
console.log('\n📝 Alternative: Run this in browser console while logged in:\n');
console.log(`
// Check balance
fetch('/api/credits/test-add')
  .then(r => r.json())
  .then(console.log);

// Add 200 test credits  
fetch('/api/credits/test-add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 200 })
})
  .then(r => r.json())
  .then(console.log);
`);

testCredits();