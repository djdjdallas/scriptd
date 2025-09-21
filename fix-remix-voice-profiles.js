// Script to fix voice profiles for existing remix channels
// Run this with: node fix-remix-voice-profiles.js

async function fixRemixVoiceProfiles() {
  try {
    console.log('🔧 Fixing voice profiles for existing remix channels...\n');
    
    // First check the current status
    console.log('📊 Checking current status...');
    const checkResponse = await fetch('http://localhost:3000/api/channels/remix/fix-voice-profiles');
    
    if (!checkResponse.ok) {
      throw new Error(`Status check failed: ${checkResponse.status}`);
    }
    
    const status = await checkResponse.json();
    console.log(`Found ${status.remixChannels} remix channels`);
    console.log(`Found ${status.voiceProfiles} existing voice profiles`);
    console.log(`Need to fix: ${status.needsFix} channels\n`);
    
    if (status.needsFix === 0) {
      console.log('✅ All remix channels already have voice profiles!');
      return;
    }
    
    // Now run the fix
    console.log('🚀 Running fix...');
    const fixResponse = await fetch('http://localhost:3000/api/channels/remix/fix-voice-profiles', {
      method: 'POST'
    });
    
    if (!fixResponse.ok) {
      const error = await fixResponse.json();
      throw new Error(`Fix failed: ${error.error} - ${error.details}`);
    }
    
    const result = await fixResponse.json();
    console.log(`\n✅ Successfully fixed ${result.fixed} channels!`);
    
    if (result.profiles && result.profiles.length > 0) {
      console.log('\nCreated voice profiles:');
      result.profiles.forEach(profile => {
        console.log(`  - ${profile.profile_name} (ID: ${profile.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixRemixVoiceProfiles();