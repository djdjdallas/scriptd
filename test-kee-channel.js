/**
 * Test script for Kee channel with proper bio
 * This tests the improved handling of channel descriptions
 */

async function testKeeChannel() {
  const KEE_BIO = `My name is Kee.
I'm a student of philosophy & psychology and I create these videos with the hope of helping other
people overcome their biggest hardships and obstacles in life through philosophy and learning the Hidden Variables under the human Psyche`;

  const testCases = [
    {
      name: 'Without Bio (Current Issue)',
      data: {
        channelName: 'Kee',
        topic: 'all',
        sessionId: `test-without-bio-${Date.now()}`
      }
    },
    {
      name: 'With Bio (Fixed Version)',
      data: {
        channelName: 'Kee',
        topic: 'all',
        channelBio: KEE_BIO,
        sessionId: `test-with-bio-${Date.now()}`
      }
    },
    {
      name: 'With Specific Topic',
      data: {
        channelName: 'Kee',
        topic: 'psychology of letting go',
        channelBio: KEE_BIO,
        sessionId: `test-specific-${Date.now()}`
      }
    }
  ];

  console.log('🧪 Testing Kee Channel Action Plan Generation');
  console.log('=' .repeat(60));
  console.log('\n📝 Kee\'s Actual Bio:');
  console.log(KEE_BIO);
  console.log('\n' + '=' .repeat(60));

  for (const testCase of testCases) {
    console.log(`\n📊 Test: ${testCase.name}`);
    console.log('-' .repeat(60));

    try {
      const response = await fetch('http://localhost:3000/api/trending/action-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
          'Cookie': 'your-auth-cookie-here' // Replace with actual auth
        },
        body: JSON.stringify(testCase.data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('\n✨ Results:');
      console.log(`   Channel: ${result.channel}`);
      console.log(`   Original Topic: "${testCase.data.topic}"`);
      console.log(`   Final Topic: "${result.topic}"`);
      console.log(`   Detected Niche: ${result.detectedNiche}`);
      console.log(`   Broad Category: ${result.broadCategory}`);
      console.log(`   Confidence: ${result.nicheConfidence}`);
      console.log(`   Sub-categories: ${(result.subCategories || []).join(', ')}`);
      console.log(`   Reasoning: ${result.nicheReasoning}`);

      // Check first content idea
      if (result.contentIdeas && result.contentIdeas[0]) {
        console.log('\n📹 Sample Content Idea:');
        console.log(`   Title: ${result.contentIdeas[0].title}`);
        console.log(`   Hook: ${(result.contentIdeas[0].hook || '').substring(0, 80)}...`);
      }

      // Quality assessment
      console.log('\n🎯 Quality Assessment:');
      const isPhilosophyPsychology =
        result.detectedNiche?.toLowerCase().includes('psych') ||
        result.detectedNiche?.toLowerCase().includes('philosoph') ||
        result.broadCategory?.toLowerCase().includes('psych') ||
        result.broadCategory?.toLowerCase().includes('philosoph');

      const isMinimalistBranding =
        result.detectedNiche?.toLowerCase().includes('minimalist') ||
        result.detectedNiche?.toLowerCase().includes('personal brand');

      if (isPhilosophyPsychology) {
        console.log('   ✅ Correctly detected psychology/philosophy niche!');
      } else if (isMinimalistBranding) {
        console.log('   ❌ Incorrectly detected as minimalist/personal branding');
      } else {
        console.log(`   ⚠️ Detected as: ${result.detectedNiche}`);
      }

      if (result.nicheConfidence === 'high') {
        console.log('   ✅ High confidence detection');
      } else if (result.nicheConfidence === 'medium') {
        console.log('   ⚠️ Medium confidence detection');
      } else {
        console.log('   ❌ Low confidence detection');
      }

    } catch (error) {
      console.error(`\n❌ Test failed: ${error.message}`);
      console.error('Make sure the server is running and you have authentication set up');
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Testing Complete');
  console.log('\nExpected outcome with bio:');
  console.log('- Niche: "Philosophical Psychology" or "Applied Psychology Lessons"');
  console.log('- Category: Psychology/Philosophy/Education');
  console.log('- Content about overcoming hardships through psychology');
}

// Run the test
console.log('Starting Kee channel test...\n');
testKeeChannel().catch(console.error);