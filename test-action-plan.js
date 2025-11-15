/**
 * Test script for the improved action plan generator
 * Run this to verify the quality improvements
 */

async function testActionPlanGeneration() {
  const testCases = [
    {
      channelName: 'Psyphoria',
      topic: 'all',
      description: 'Testing generic topic handling'
    },
    {
      channelName: 'Blackfiles',
      topic: 'Search Result',
      description: 'Testing with specific topic'
    },
    {
      channelName: 'TechMystery',
      topic: 'general',
      description: 'Testing another generic topic'
    }
  ];

  console.log('🧪 Testing Action Plan Generator Improvements\n');
  console.log('='.repeat(50));

  for (const testCase of testCases) {
    console.log(`\n📊 Test Case: ${testCase.description}`);
    console.log(`   Channel: ${testCase.channelName}`);
    console.log(`   Topic: ${testCase.topic}`);
    console.log('-'.repeat(50));

    try {
      const response = await fetch('http://localhost:3000/api/trending/action-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
        body: JSON.stringify({
          channelName: testCase.channelName,
          topic: testCase.topic,
          sessionId: `test-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Check quality indicators
      console.log('\n✅ Quality Check Results:');
      console.log(`   ✓ Topic transformed: "${testCase.topic}" → "${result.topic}"`);
      console.log(`   ✓ Detected niche: ${result.detectedNiche || 'N/A'}`);
      console.log(`   ✓ Confidence: ${result.nicheConfidence || 'N/A'}`);
      console.log(`   ✓ Real events used: ${result.realEventsUsed || 0}`);
      console.log(`   ✓ Search provider: ${result.searchProvider || 'none'}`);
      console.log(`   ✓ Enhancement pipeline: ${result.enhancementPipeline || 'unknown'}`);

      // Check for specific content
      if (result.contentTemplates && result.contentTemplates[0]) {
        const template = result.contentTemplates[0];
        console.log('\n📝 Content Template Sample:');
        console.log(`   Format: ${template.format || 'Missing'}`);
        console.log(`   Hook: ${(template.hook || 'Missing').substring(0, 50)}...`);
      }

      if (result.equipment && result.equipment[0]) {
        const item = result.equipment[0];
        console.log('\n🎥 Equipment Sample:');
        console.log(`   Item: ${item.item}`);
        console.log(`   Purpose: ${item.purpose || 'Missing'}`);
      }

      // Check for quality issues
      const issues = [];
      if (result.topic === 'all' || result.topic === 'general') {
        issues.push('Topic not properly transformed');
      }
      if (!result.detectedNiche || result.detectedNiche === 'Content Creation') {
        issues.push('Generic niche detection');
      }
      if (result.equipment?.some(e => !e.purpose || e.purpose.includes('undefined'))) {
        issues.push('Equipment purposes missing or undefined');
      }
      if (result.contentTemplates?.some(t => !t.format || !t.hook)) {
        issues.push('Content templates incomplete');
      }

      if (issues.length > 0) {
        console.log('\n⚠️ Quality Issues Found:');
        issues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        console.log('\n✨ No quality issues detected!');
      }

    } catch (error) {
      console.error(`\n❌ Test failed: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Testing Complete');
}

// Run the test
console.log('Starting action plan generator tests...\n');
testActionPlanGeneration().catch(console.error);