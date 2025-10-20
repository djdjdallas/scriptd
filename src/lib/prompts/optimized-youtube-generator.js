/**
 * Optimized YouTube Script Prompt Generator
 * Focused on factual accuracy and engagement optimization
 * Created: ${new Date().toISOString()}
 */

// Main generator function with enhanced fact-checking and YouTube optimization
const generateYouTubeScriptPrompt = (topic, targetLength = 10, workflowContext = {}) => {
  console.log('🎬 === YOUTUBE SCRIPT GENERATOR DEBUG ===');
  console.log('Topic:', topic);
  console.log('Target Length:', targetLength, 'minutes');
  console.log('Workflow Context Keys:', Object.keys(workflowContext));
  
  // Input validation
  if (!topic || typeof topic !== 'string') {
    throw new Error('Topic is required and must be a string');
  }
  
  if (targetLength < 1 || targetLength > 60) {
    throw new Error('Target length must be between 1 and 60 minutes');
  }

  // Extract workflow context
  const {
    frame = {},
    hook = null,
    contentPoints = [],
    research = {},
    voiceProfile = null,
    thumbnail = null,
    targetAudience = null,
    tone = 'professional',
    sponsor = null
  } = workflowContext;
  
  console.log('📋 WORKFLOW CONTEXT EXTRACTED:');
  console.log('- Frame provided:', !!frame && Object.keys(frame).length > 0);
  console.log('- Hook provided:', !!hook);
  console.log('- Content Points:', contentPoints?.points?.length || 0);
  console.log('- Research provided:', !!research && Object.keys(research).length > 0);
  console.log('- Voice Profile:', voiceProfile?.name || 'None');
  console.log('- Thumbnail:', !!thumbnail);
  console.log('- Target Audience:', targetAudience || 'None specified');
  console.log('- Tone:', tone);

  // NEW: Detailed target audience logging
  console.log('\n');
  console.log('═════════════════════════════════════════════════════════════');
  console.log('👥 TARGET AUDIENCE DETAILS:');
  console.log('═════════════════════════════════════════════════════════════');
  if (targetAudience) {
    console.log('Full audience description being sent to Claude:');
    console.log('"' + targetAudience + '"');
    console.log('Character count:', targetAudience.length);
    console.log('Will appear in prompt as: <audience>' + targetAudience + '</audience>');
  } else {
    console.log('No target audience specified - will use default: "General audience interested in the topic"');
  }
  console.log('═════════════════════════════════════════════════════════════');

  // Force flush to ensure logs appear
  if (process.stdout && typeof process.stdout.write === 'function') {
    process.stdout.write('');
  }

  // Process research sources
  console.log('\n🔬 PROCESSING RESEARCH SOURCES:');
  console.log('Total sources received:', research?.sources?.length || 0);
  
  const verifiedSources = research?.sources?.filter(s => s.fact_check_status === 'verified') || [];
  const starredSources = research?.sources?.filter(s => s.is_starred) || [];
  const allSources = [...verifiedSources, ...starredSources];
  
  console.log('- Verified sources:', verifiedSources.length);
  console.log('- Starred sources:', starredSources.length);
  console.log('- All sources to use:', allSources.length);
  
  if (verifiedSources.length > 0) {
    console.log('Verified source titles:', verifiedSources.map(s => s.source_title));
  }
  if (starredSources.length > 0) {
    console.log('Starred source titles:', starredSources.map(s => s.source_title));
  }
  
  // Log research insights if available
  if (research?.insights) {
    console.log('\n📊 RESEARCH INSIGHTS:');
    console.log('- Facts:', research.insights.facts?.length || 0);
    console.log('- Statistics:', research.insights.statistics?.length || 0);
    console.log('- Trends:', research.insights.trends?.length || 0);
    console.log('- Perspectives:', research.insights.perspectives?.length || 0);
  }
  
  if (research?.summary) {
    console.log('\n📝 RESEARCH SUMMARY:');
    console.log(research.summary.substring(0, 200) + '...');
  }

  // Extract comprehensive voice profile details
  console.log('\n');
  console.log('═════════════════════════════════════════════════════════════');
  console.log('🎤 PROCESSING VOICE PROFILE:');
  console.log('═════════════════════════════════════════════════════════════');

  if (voiceProfile) {
    console.log('Voice profile structure keys:', Object.keys(voiceProfile));
    console.log('Voice profile name:', voiceProfile.profile_name || voiceProfile.name);

    // Log basic characteristics in detail
    if (voiceProfile.basic || voiceProfile.training_data?.basic) {
      const basic = voiceProfile.basic || voiceProfile.training_data?.basic;
      console.log('\n📝 BASIC CHARACTERISTICS BEING SENT TO CLAUDE:');
      console.log('  Pace:', basic?.pace || 'not set');
      console.log('  Energy:', basic?.energy || 'not set');
      console.log('  Tone:', Array.isArray(basic?.tone) ? basic.tone.join(', ') : (basic?.tone || 'not set'));
      console.log('  Style:', Array.isArray(basic?.style) ? basic.style.join(', ') : (basic?.style || 'not set'));
      console.log('  Personality:', Array.isArray(basic?.personality) ? basic.personality.join(', ') : (basic?.personality || 'not set'));
      console.log('  Vocabulary:', basic?.vocabulary || 'not set');
      console.log('  Transitions:', basic?.transitions || 'not set');
      console.log('  Humor:', basic?.humor || 'not set');
      console.log('  Hooks:', basic?.hooks || 'not set');

      console.log('\n✅ DOS (Must Do):');
      if (basic?.dos && basic.dos.length > 0) {
        basic.dos.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
      } else {
        console.log('  (None specified - will use default)');
      }

      console.log('\n❌ DONTS (Must Avoid):');
      if (basic?.donts && basic.donts.length > 0) {
        basic.donts.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
      } else {
        console.log('  (None specified - will use default)');
      }

      console.log('\n💬 SIGNATURE PHRASES:');
      if (basic?.signature_phrases && basic.signature_phrases.length > 0) {
        basic.signature_phrases.forEach((phrase, i) => console.log(`  ${i + 1}. "${phrase}"`));
      } else {
        console.log('  (None specified)');
      }
    }

    // Log enhanced characteristics in detail
    if (voiceProfile.enhanced || voiceProfile.training_data?.enhanced) {
      const enhanced = voiceProfile.enhanced || voiceProfile.training_data?.enhanced;
      console.log('\n🎯 ENHANCED CHARACTERISTICS BEING SENT TO CLAUDE:');

      // Pacing Dynamics
      if (enhanced?.pacingDynamics) {
        console.log('\n  📊 Pacing Dynamics:');
        console.log('    Pause Patterns:', enhanced.pacingDynamics.pausePatterns?.frequency || 'not set');
        console.log('    Speed Variations:', Array.isArray(enhanced.pacingDynamics.speedVariations)
          ? enhanced.pacingDynamics.speedVariations.join(', ')
          : 'not set');
        console.log('    Emphasis Techniques:', Array.isArray(enhanced.pacingDynamics.emphasisTechniques)
          ? enhanced.pacingDynamics.emphasisTechniques.join(', ')
          : 'not set');
      }

      // Engagement Techniques
      if (enhanced?.engagementTechniques) {
        console.log('\n  🎪 Engagement Techniques:');
        console.log('    CTA Style:', enhanced.engagementTechniques.ctaStyle || 'not set');
        console.log('    Question Strategy:', enhanced.engagementTechniques.questionStrategy || 'not set');
        console.log('    Direct Address Frequency:', enhanced.engagementTechniques.directAddressFrequency || 'not set');
        if (enhanced.engagementTechniques.pronounUsage) {
          console.log('    Pronoun Balance:');
          console.log('      - "I" statements:', enhanced.engagementTechniques.pronounUsage.i + '%');
          console.log('      - "We" inclusive:', enhanced.engagementTechniques.pronounUsage.we + '%');
          console.log('      - "You" direct:', enhanced.engagementTechniques.pronounUsage.you + '%');
        }
      }

      // Linguistic Fingerprints
      if (enhanced?.linguisticFingerprints) {
        console.log('\n  🔤 Linguistic Fingerprints:');
        if (enhanced.linguisticFingerprints.fillerWords) {
          console.log('    Filler Words:');
          Object.entries(enhanced.linguisticFingerprints.fillerWords).forEach(([word, freq]) => {
            console.log(`      - "${word}": ${(freq * 100).toFixed(1)}% frequency`);
          });
        }
        if (enhanced.linguisticFingerprints.transitionPhrases) {
          console.log('    Transition Phrases:');
          enhanced.linguisticFingerprints.transitionPhrases.forEach((phrase, i) => {
            console.log(`      ${i + 1}. "${phrase}"`);
          });
        }
      }

      // Implementation Notes
      if (enhanced?.implementationNotes) {
        console.log('\n  📋 Implementation Notes:');
        if (enhanced.implementationNotes.pacingControl) {
          console.log('    Pacing Control:', enhanced.implementationNotes.pacingControl);
        }
        if (enhanced.implementationNotes.questionTiming) {
          console.log('    Question Timing:', enhanced.implementationNotes.questionTiming);
        }
        if (enhanced.implementationNotes.humorIntegration) {
          console.log('    Humor Integration:', enhanced.implementationNotes.humorIntegration);
        }
        if (enhanced.implementationNotes.transitionStrategy) {
          console.log('    Transition Strategy:', enhanced.implementationNotes.transitionStrategy);
        }
        if (enhanced.implementationNotes.fillerWordPlacement) {
          console.log('    Filler Word Placement:', enhanced.implementationNotes.fillerWordPlacement);
        }
      }
    } else {
      console.log('No enhanced characteristics available');
    }
  } else {
    console.log('No voice profile provided');
  }
  
  const voiceData = voiceProfile ? {
    // Basic profile info
    name: voiceProfile.profile_name || voiceProfile.name,
    
    // Basic voice characteristics
    basic: voiceProfile.basic || voiceProfile.training_data?.basic || {},
    dos: voiceProfile.basic?.dos || voiceProfile.training_data?.basic?.dos || [],
    donts: voiceProfile.basic?.donts || voiceProfile.training_data?.basic?.donts || [],
    pace: voiceProfile.basic?.pace || voiceProfile.training_data?.basic?.pace || 'moderate',
    tone: voiceProfile.basic?.tone || voiceProfile.training_data?.basic?.tone || [],
    hooks: voiceProfile.basic?.hooks || voiceProfile.training_data?.basic?.hooks || '',
    humor: voiceProfile.basic?.humor || voiceProfile.training_data?.basic?.humor || 'balanced',
    style: voiceProfile.basic?.style || voiceProfile.training_data?.basic?.style || [],
    energy: voiceProfile.basic?.energy || voiceProfile.training_data?.basic?.energy || 'medium',
    personality: voiceProfile.basic?.personality || voiceProfile.training_data?.basic?.personality || [],
    vocabulary: voiceProfile.basic?.vocabulary || voiceProfile.training_data?.basic?.vocabulary || 'accessible',
    transitions: voiceProfile.basic?.transitions || voiceProfile.training_data?.basic?.transitions || 'smooth',
    signature_phrases: voiceProfile.basic?.signature_phrases || voiceProfile.training_data?.basic?.signature_phrases || [],
    
    // Enhanced characteristics
    enhanced: voiceProfile.enhanced || voiceProfile.training_data?.enhanced || {},
    pacingDynamics: voiceProfile.enhanced?.pacingDynamics || voiceProfile.training_data?.enhanced?.pacingDynamics || {},
    emotionalDynamics: voiceProfile.enhanced?.emotionalDynamics || voiceProfile.training_data?.enhanced?.emotionalDynamics || {},
    engagementTechniques: voiceProfile.enhanced?.engagementTechniques || voiceProfile.training_data?.enhanced?.engagementTechniques || {},
    linguisticFingerprints: voiceProfile.enhanced?.linguisticFingerprints || voiceProfile.training_data?.enhanced?.linguisticFingerprints || {},
    implementationNotes: voiceProfile.enhanced?.implementationNotes || voiceProfile.training_data?.enhanced?.implementationNotes || {},
    
    // Fallback to parameters if available
    parameters: voiceProfile.parameters || {}
  } : null;

  // Log content points structure
  if (contentPoints?.points?.length > 0) {
    console.log('\n📌 CONTENT POINTS:');
    console.log('Total points:', contentPoints.points.length);
    contentPoints.points.forEach((point, i) => {
      console.log(`Point ${i + 1}:`, {
        title: point.title,
        duration: point.duration + 's',
        hasKeyTakeaway: !!point.keyTakeaway
      });
    });
    const totalDuration = contentPoints.points.reduce((acc, p) => acc + p.duration, 0);
    console.log('Total duration from points:', totalDuration, 'seconds (' + Math.ceil(totalDuration / 60) + ' minutes)');
  }
  
  // Log frame structure
  if (frame && Object.keys(frame).length > 0) {
    console.log('\n🎯 NARRATIVE FRAME:');
    console.log('- Problem:', frame.problem_statement ? 'Provided' : 'None');
    console.log('- Solution:', frame.solution_approach ? 'Provided' : 'None');
    console.log('- Transformation:', frame.transformation_outcome ? 'Provided' : 'None');
  }
  
  // Log hook
  if (hook) {
    console.log('\n🪝 HOOK:');
    console.log('Hook length:', hook.length, 'characters');
    console.log('Hook preview:', hook.substring(0, 100) + '...');
  }
  
  // Log thumbnail
  if (thumbnail) {
    console.log('\n🖼️ THUMBNAIL:');
    console.log('Description provided:', !!thumbnail.description);
  }

  // Log sponsor
  if (sponsor) {
    console.log('\n💰 SPONSOR INTEGRATION:');
    console.log('Sponsor:', sponsor.sponsor_name);
    console.log('Product:', sponsor.sponsor_product);
    console.log('Placement:', sponsor.placement_preference);
    console.log('Duration:', sponsor.sponsor_duration, 'seconds');
    console.log('Key points:', sponsor.sponsor_key_points?.length || 0);
  }

  console.log('\n');
  console.log('═════════════════════════════════════════════════════════════');
  console.log('📤 FINAL SUMMARY OF DATA BEING SENT TO CLAUDE:');
  console.log('═════════════════════════════════════════════════════════════');
  console.log('Target Audience:', targetAudience || 'General audience (default)');
  console.log('Voice Profile:', voiceProfile ? (voiceProfile.profile_name || voiceProfile.name) : 'None (default style)');
  if (voiceProfile) {
    const basic = voiceProfile.basic || voiceProfile.training_data?.basic;
    const enhanced = voiceProfile.enhanced || voiceProfile.training_data?.enhanced;
    console.log('  - Basic guidelines:', basic?.dos?.length || 0, 'dos,', basic?.donts?.length || 0, 'donts');
    console.log('  - Signature phrases:', basic?.signature_phrases?.length || 0);
    console.log('  - Enhanced features:', enhanced ? 'YES' : 'NO');
    if (enhanced) {
      console.log('    • Pacing dynamics:', !!enhanced.pacingDynamics);
      console.log('    • Engagement techniques:', !!enhanced.engagementTechniques);
      console.log('    • Linguistic fingerprints:', !!enhanced.linguisticFingerprints);
      console.log('    • Implementation notes:', !!enhanced.implementationNotes);
    }
  }
  console.log('Tone:', tone);
  console.log('Research sources:', (research?.sources?.length || 0), 'total');
  console.log('Content structure:', contentPoints?.points?.length || 0, 'sections');
  console.log('Narrative frame:', frame?.problem_statement ? 'PROVIDED' : 'Not provided');
  console.log('Hook:', hook ? hook.length + ' chars' : 'Auto-generate');
  console.log('═════════════════════════════════════════════════════════════');

  console.log('\n✅ PROMPT GENERATION COMPLETE');
  console.log('═════════════════════════════════════════════════════════════\n');
  
  return `
<role>You are an expert YouTube scriptwriter specializing in engaging, factual content</role>

<context>
  <purpose>Create a comprehensive YouTube script about ${topic}</purpose>
  <audience>${targetAudience || 'General audience interested in the topic'}</audience>
  <tone>${tone}</tone>
  <video_length>${targetLength} minutes</video_length>
  ${frame?.problem_statement ? `<narrative_frame>
    <problem>${frame.problem_statement}</problem>
    <solution>${frame.solution_approach || 'To be developed'}</solution>
    <transformation>${frame.transformation_outcome || 'Positive change'}</transformation>
  </narrative_frame>` : ''}
  ${voiceData ? `<voice_profile>
    <name>${voiceData.name}</name>
    
    <core_characteristics>
      <pace>${voiceData.pace}</pace>
      <energy>${voiceData.energy}</energy>
      <tone>${Array.isArray(voiceData.tone) ? voiceData.tone.join(', ') : voiceData.tone}</tone>
      <style>${Array.isArray(voiceData.style) ? voiceData.style.join(', ') : voiceData.style}</style>
      <personality>${Array.isArray(voiceData.personality) ? voiceData.personality.join(', ') : voiceData.personality}</personality>
      <vocabulary>${voiceData.vocabulary}</vocabulary>
      <transitions>${voiceData.transitions}</transitions>
      <humor>${voiceData.humor}</humor>
      <hooks>${voiceData.hooks}</hooks>
    </core_characteristics>
    
    <writing_guidelines>
      <must_do>
        ${voiceData.dos?.map(d => `- ${d}`).join('\n        ') || '- Follow natural conversational style'}
      </must_do>
      <must_avoid>
        ${voiceData.donts?.map(d => `- ${d}`).join('\n        ') || '- Avoid overly formal language'}
      </must_avoid>
    </writing_guidelines>
    
    <signature_elements>
      <phrases>${voiceData.signature_phrases?.join(', ') || 'Natural conversational phrases'}</phrases>
      ${voiceData.linguisticFingerprints?.fillerWords ? `
      <filler_words>
        - Use "like" naturally (${(voiceData.linguisticFingerprints.fillerWords.like * 100).toFixed(0)}% frequency)
        - Use "so" for transitions (${(voiceData.linguisticFingerprints.fillerWords.so * 100).toFixed(0)}% frequency)
        - Include "actually" for emphasis (${(voiceData.linguisticFingerprints.fillerWords.actually * 100).toFixed(0)}% frequency)
        - Sprinkle in "you know" conversationally (${(voiceData.linguisticFingerprints.fillerWords['you know'] * 100).toFixed(0)}% frequency)
      </filler_words>` : ''}
      ${voiceData.linguisticFingerprints?.transitionPhrases ? `
      <transition_phrases>${voiceData.linguisticFingerprints.transitionPhrases.join(', ')}</transition_phrases>` : ''}
    </signature_elements>
    
    ${voiceData.pacingDynamics ? `
    <pacing_instructions>
      <pause_patterns>${voiceData.pacingDynamics.pausePatterns?.frequency || 'natural'}</pause_patterns>
      <speed_variations>${Array.isArray(voiceData.pacingDynamics.speedVariations) ? voiceData.pacingDynamics.speedVariations.join(', ') : 'consistent'}</speed_variations>
      <emphasis_techniques>${Array.isArray(voiceData.pacingDynamics.emphasisTechniques) ? voiceData.pacingDynamics.emphasisTechniques.join(', ') : 'natural emphasis'}</emphasis_techniques>
    </pacing_instructions>` : ''}
    
    ${voiceData.engagementTechniques ? `
    <engagement_strategy>
      <cta_style>${voiceData.engagementTechniques.ctaStyle || 'conversational'}</cta_style>
      <question_strategy>${voiceData.engagementTechniques.questionStrategy || 'strategic'}</question_strategy>
      <direct_address_frequency>${voiceData.engagementTechniques.directAddressFrequency || 0.15}</direct_address_frequency>
      ${voiceData.engagementTechniques.pronounUsage ? `
      <pronoun_balance>
        - "I" statements: ${voiceData.engagementTechniques.pronounUsage.i}%
        - "We" inclusive: ${voiceData.engagementTechniques.pronounUsage.we}%
        - "You" direct: ${voiceData.engagementTechniques.pronounUsage.you}%
      </pronoun_balance>` : ''}
    </engagement_strategy>` : ''}
    
    ${voiceData.implementationNotes ? `
    <specific_instructions>
      ${voiceData.implementationNotes.pacingControl ? `<pacing>${voiceData.implementationNotes.pacingControl}</pacing>` : ''}
      ${voiceData.implementationNotes.questionTiming ? `<questions>${voiceData.implementationNotes.questionTiming}</questions>` : ''}
      ${voiceData.implementationNotes.humorIntegration ? `<humor>${voiceData.implementationNotes.humorIntegration}</humor>` : ''}
      ${voiceData.implementationNotes.transitionStrategy ? `<transitions>${voiceData.implementationNotes.transitionStrategy}</transitions>` : ''}
      ${voiceData.implementationNotes.fillerWordPlacement ? `<filler_usage>${voiceData.implementationNotes.fillerWordPlacement}</filler_usage>` : ''}
    </specific_instructions>` : ''}
    
    <critical_instruction>You MUST write in this exact voice style throughout the entire script. Use the signature phrases, maintain the specified pacing, and follow all dos and don'ts.</critical_instruction>
  </voice_profile>` : ''}
</context>

<content_structure>
  <hook duration="15-30s">
    ${hook ? `- USE THIS EXACT HOOK: "${hook}"` : '- Start with compelling question or shocking statistic'}
    - Create immediate curiosity gap
    - Promise value within first 15 seconds
  </hook>
  <preview duration="15s">Brief overview of what viewers will learn</preview>
  <main_content>
    ${contentPoints?.points?.length > 0 ? 
    contentPoints.points.map((point, index) => `
    <section_${index + 1} duration="${point.duration}s">
      <title>${point.title}</title>
      <description>${point.description}</description>
      <key_takeaway>${point.keyTakeaway}</key_takeaway>
      - Include visual cues and B-roll suggestions
      - Add engagement element (question/poll)
      - Smooth transition to next section
    </section_${index + 1}>`).join('') : 
    `<section_template>
      - Section title with timestamp
      - 2-3 verified key points with evidence
      - Visual cue suggestions [B-roll notes]
      - Engagement hook (question/poll/comment prompt)
      - Smooth transition to next section
    </section_template>`}
  </main_content>
  <conclusion duration="30s">
    - Recap key takeaways
    - Call-to-action for comments/subscribe
    - Tease next video (if applicable)
  </conclusion>
</content_structure>

${sponsor ? `
<sponsor_integration>
  <sponsor_info>
    <name>${sponsor.sponsor_name}</name>
    <product>${sponsor.sponsor_product}</product>
    <call_to_action>${sponsor.sponsor_cta}</call_to_action>
    ${sponsor.sponsor_key_points?.length > 0 ? `
    <key_points>
      ${sponsor.sponsor_key_points.map(point => `<point>${point}</point>`).join('\n      ')}
    </key_points>` : ''}
    <duration_seconds>${sponsor.sponsor_duration || 30}</duration_seconds>
  </sponsor_info>

  <integration_requirements>
    <placement>
      <preference>${sponsor.placement_preference || 'auto'}</preference>
      ${sponsor.placement_preference === 'auto' ? `
      <optimal_placement>Place sponsor segment at the optimal retention point (typically 25-35% into video, after establishing value but before main climax). This is statistically the best time for sponsor mentions.</optimal_placement>` : ''}
      ${sponsor.placement_preference === 'early' ? `
      <placement_timing>Place sponsor segment in the early part of the video (15-25% into video), after the hook but before diving deep into main content.</placement_timing>` : ''}
      ${sponsor.placement_preference === 'mid' ? `
      <placement_timing>Place sponsor segment in the middle of the video (45-55% into video), during a natural transition point.</placement_timing>` : ''}
      ${sponsor.placement_preference === 'late' ? `
      <placement_timing>Place sponsor segment near the end (75-85% into video), before the conclusion but after delivering main value.</placement_timing>` : ''}
      ${sponsor.custom_placement_time ? `
      <custom_timing>Place sponsor segment at approximately ${sponsor.custom_placement_time} seconds into the video.</custom_timing>` : ''}
    </placement>

    <transition_style>${sponsor.transition_style || 'natural'}</transition_style>
    <transition_instructions>
      ${sponsor.transition_style === 'natural' || !sponsor.transition_style ? `
      Create a smooth, natural segue that connects the sponsor to the surrounding content thematically. Make the transition feel organic and relevant to what was just discussed.
      Example: "Speaking of [topic], this actually reminds me of something that's made this so much easier for me..."` : ''}
      ${sponsor.transition_style === 'direct' ? `
      Use a quick, straightforward transition. Be honest and direct about the sponsorship.
      Example: "Before we continue, I want to tell you about today's sponsor..."` : ''}
      ${sponsor.transition_style === 'segue' ? `
      Create a thematic bridge that relates the sponsor to the current topic. Find a genuine connection.
      Example: "And if you're serious about [topic], you'll want to check out..."` : ''}
    </transition_instructions>

    <tone_matching>${sponsor.tone_match !== false ? 'Match sponsor segment tone to overall script style' : 'Keep sponsor segment neutral'}</tone_matching>

    ${sponsor.include_disclosure !== false ? `
    <disclosure>
      IMPORTANT: Include FTC-compliant sponsorship disclosure at the beginning of the sponsor segment.
      Example: "This video is sponsored by ${sponsor.sponsor_name}" OR "A huge thank you to ${sponsor.sponsor_name} for sponsoring this video"
    </disclosure>` : ''}
  </integration_requirements>

  <writing_guidelines>
    <rule>SEAMLESS INTEGRATION: The sponsor segment should feel like a natural part of the video, not a jarring interruption</rule>
    <rule>VALUE CONNECTION: Connect the sponsor to the viewer's needs or interests based on the video topic</rule>
    <rule>ENTHUSIASM: Write the sponsor segment with the same energy and authenticity as the rest of the script</rule>
    <rule>ALL REQUIRED ELEMENTS: Ensure ALL key points are mentioned naturally throughout the sponsor segment</rule>
    <rule>CTA CLARITY: Make the call-to-action clear, memorable, and easy to act on. Include any special URLs or codes exactly as provided</rule>
    <rule>TIMING: Keep sponsor segment to approximately ${sponsor.sponsor_duration || 30} seconds (${Math.floor((sponsor.sponsor_duration || 30) / 150 * 100)} words)</rule>
    <rule>RETENTION AWARENESS: Use engaging language to maintain viewer attention during sponsor segment. Don't let energy drop!</rule>
    <rule>AUTHENTICITY: If possible, add a personal touch or genuine endorsement that feels natural to the creator's voice</rule>
  </writing_guidelines>

  <placement_markers>
    When writing the script, clearly indicate where the sponsor segment begins and ends:

    [SPONSOR SEGMENT START]
    Your naturally integrated sponsor content here, following all guidelines above.
    [SPONSOR SEGMENT END]
  </placement_markers>
</sponsor_integration>
` : ''}

<accuracy_requirements>
  <fact_checking>CRITICAL: Verify all statistics and claims before including</fact_checking>
  <uncertainty_handling>If unsure about specific numbers, use "approximately" or "reported"</uncertainty_handling>
  <source_verification>Only use information from credible sources</source_verification>
  <correction_protocol>If a fact cannot be verified, either omit it or clearly state it's unverified</correction_protocol>
</accuracy_requirements>

<youtube_optimization>
  <retention_hooks>Add pattern interrupts every 30-45 seconds</retention_hooks>
  <visual_cues>Include [B-roll: description] suggestions for each major point</visual_cues>
  <cta_placement>
    - Soft subscribe reminder at 25% mark
    - Engagement question at 50% mark  
    - End screen setup in final 20 seconds
  </cta_placement>
  <chapters>Create chapter markers with timestamps (0:00 Intro, etc.)</chapters>
</youtube_optimization>

<engagement_strategies>
  <questions>Pose 3-4 direct questions to viewers throughout script</questions>
  <controversy>Present multiple perspectives on controversial topics</controversy>
  <personal_connection>Include "What would you do?" moments</personal_connection>
  <cliffhangers>Build suspense between sections with preview statements</cliffhangers>
  <comment_prompts>Include specific prompts like "Let me know in the comments if you've experienced..."</comment_prompts>
</engagement_strategies>

<seo_optimization>
  <keywords>Naturally incorporate target keywords 5-7 times throughout script</keywords>
  <description_content>Generate compelling first 125 characters for description</description_content>
  <tags_suggestions>Suggest 5-10 relevant tags based on content</tags_suggestions>
  <title_optimization>Create 2-3 title options with high CTR potential</title_optimization>
</seo_optimization>

<formatting>
  <structure>
    SECTION TITLE (duration)
    [Visual: B-roll suggestion]
    
    Main content with natural flow...
    
    [Tone shift: describe emotional direction]
    
    Transition statement to next section.
  </structure>
  <timestamps>Include cumulative timestamps for each section</timestamps>
  <stage_directions>Use [brackets] for all production notes</stage_directions>
  <emphasis>Use CAPS sparingly for critical points only</emphasis>
</formatting>

<content_requirements>
  <statistics>Include 2-3 VERIFIED statistics per major section</statistics>
  <examples>Provide concrete examples or mini case studies</examples>
  <sources>Reference credible sources naturally in script</sources>
  <balance>Present balanced viewpoints on controversial topics</balance>
  ${allSources.length > 0 || research?.insights ? `
  <research_to_include>
    ${verifiedSources.length > 0 ? `
    <verified_sources>
      ${verifiedSources.map(s => {
        // Include full content - no truncation!
        // Claude needs all the research to write comprehensive scripts
        return `- ${s.source_title} (${s.source_url}): ${s.source_content || ''}`;
      }).join('\n      ')}
    </verified_sources>` : ''}
    ${starredSources.length > 0 ? `
    <important_sources>
      ${starredSources.map(s => {
        // Include full content - no truncation!
        // Claude needs all the research to write comprehensive scripts
        return `- ${s.source_title} (${s.source_url}): ${s.source_content || ''}`;
      }).join('\n      ')}
    </important_sources>` : ''}
    ${research?.insights ? `
    <research_insights>
      ${research.insights.facts?.length > 0 ? `<key_facts>${research.insights.facts.join(' | ')}</key_facts>` : ''}
      ${research.insights.statistics?.length > 0 ? `<statistics>${research.insights.statistics.join(' | ')}</statistics>` : ''}
      ${research.insights.trends?.length > 0 ? `<trends>${research.insights.trends.join(' | ')}</trends>` : ''}
      ${research.insights.perspectives?.length > 0 ? `<perspectives>${research.insights.perspectives.join(' | ')}</perspectives>` : ''}
    </research_insights>` : ''}
    ${research?.summary ? `
    <research_summary>${research.summary}</research_summary>` : ''}
    <instructions>Incorporate these research findings naturally throughout the script, citing sources where appropriate</instructions>
  </research_to_include>` : ''}
</content_requirements>

<constraints>
  <must_avoid>
    - Unverified claims or statistics
    - Clickbait without substance
    - Excessive repetition
    - Copyright violations
    - Harmful or misleading information
    - PLACEHOLDER TEXT OR SHORTCUTS (e.g., "continue with...", "[add more here]", "...")
  </must_avoid>
  <must_include>
    - Accurate, fact-checked information
    - Clear value proposition
    - Actionable takeaways
    - Proper content warnings if needed
    - COMPLETE CONTENT FOR ENTIRE ${targetLength}-MINUTE DURATION
    - EVERY promised item (if title says "7 secrets", write ALL 7 in FULL)
  </must_include>
</constraints>

<CRITICAL_COMPLETENESS_RULE>
YOU MUST WRITE THE ENTIRE SCRIPT FROM START TO FINISH IN ONE RESPONSE.
- Write approximately ${targetLength * 150} words for a ${targetLength}-minute video
- FORBIDDEN: Never say "I'll continue", "due to length limits", "in the next response"
- FORBIDDEN: Never use [...], "Continue with", "Note: This is just the first portion"
- FORBIDDEN: Never stop mid-script or promise to continue later
- If you mention "7 secrets", write ALL 7 secrets completely
- Write EVERYTHING from [0:00] to [${targetLength}:00] NOW
</CRITICAL_COMPLETENESS_RULE>

<output_format>
  # ${topic} - YouTube Script
  
  ## Video Metadata
  - Target Length: ${targetLength} minutes
  - Primary Keywords: Write 5-7 actual keywords separated by commas
  - Suggested Title Options:
    1. Write complete title here
    2. Write complete title here
    3. Write complete title here
  
  ## Full Script
  Write the COMPLETE script from [0:00] to [${targetLength}:00] with ALL sections.
  Include all timestamps, visual cues, and content.
  DO NOT STOP UNTIL YOU REACH THE END TIME.
  
  ## Description Template
  Write a COMPLETE YouTube description with these sections:
  
  🔍 Opening hook - first 125 characters with main keyword
  
  Full paragraph about what viewers will learn
  
  ⏱️ TIMESTAMPS:
  0:00 Introduction
  List ALL timestamps from your script
  
  📚 RESOURCES MENTIONED:
  List resources if any
  
  🔔 SUBSCRIBE for more content
  
  📱 CONNECT WITH US:
  Social links
  
  #️⃣ HASHTAGS:
  Relevant hashtags
  
  ## Tags
  Write 10-15 actual tags separated by commas like: tag1, tag2, tag3
</output_format>

ABSOLUTE REQUIREMENT: Complete EVERYTHING in this single response. No continuations.
`;
};

// Validation function for script output
const validateScriptOutput = (script) => {
  if (!script || typeof script !== 'string') {
    return {
      isValid: false,
      errors: ['Script must be a non-empty string']
    };
  }

  // Check for placeholder patterns that indicate incomplete generation
  const placeholderPatterns = [
    /\[Rest of.*\]/i,
    /\[Continue.*\]/i,
    /\[Add more.*\]/i,
    /\[.*remaining.*\]/i,
    /\.\.\.\]$/,  // Ends with ...]
    /etc\.\]$/,   // Ends with etc.]
    /\[Insert.*\]/i,
    /\[Include.*here\]/i
  ];
  
  const hasPlaceholders = placeholderPatterns.some(pattern => pattern.test(script));
  
  const validationChecks = {
    hasTimestamps: /\d{1,2}:\d{2}/.test(script),
    hasVisualCues: /\[.*\]/.test(script),
    hasQuestions: /\?/.test(script),
    hasSections: script.includes('(') && script.includes(')'),
    reasonable_length: script.length > 1000 && script.length < 50000,
    noPlaceholders: !hasPlaceholders,
    hasDescription: script.includes('## Description') && script.includes('TIMESTAMPS:'),
    hasTags: script.includes('## Tags') && !script.includes('[10-15')
  };
  
  const errors = [];
  if (!validationChecks.hasTimestamps) errors.push("Missing timestamps");
  if (!validationChecks.hasVisualCues) errors.push("Missing visual cues");
  if (!validationChecks.hasQuestions) errors.push("No engagement questions");
  if (!validationChecks.hasSections) errors.push("Missing section markers");
  if (!validationChecks.reasonable_length) errors.push("Script length seems incorrect");
  if (!validationChecks.noPlaceholders) errors.push("Contains placeholder text - script incomplete");
  if (!validationChecks.hasDescription) errors.push("Missing complete description section");
  if (!validationChecks.hasTags) errors.push("Missing or incomplete tags section");
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    checks: validationChecks
  };
};

// Helper function to extract keywords from a topic
const extractKeywords = (topic) => {
  if (!topic || typeof topic !== 'string') {
    return [];
  }
  
  // Extract main keywords from topic for SEO
  const words = topic.toLowerCase().split(/\s+/);
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ]);
  
  return words.filter(word => 
    !stopWords.has(word) && 
    word.length > 2 &&
    !/^\d+$/.test(word) // Filter out pure numbers
  );
};

// Function to suggest video length based on topic complexity
const suggestVideoLength = (topic) => {
  if (!topic || typeof topic !== 'string') {
    return { min: 5, optimal: 8, max: 12 }; // default
  }
  
  // Suggest optimal length based on topic complexity
  const complexTopics = ['tutorial', 'guide', 'explained', 'complete', 'advanced', 'comprehensive', 'deep dive', 'masterclass'];
  const quickTopics = ['tips', 'hacks', 'quick', 'simple', 'easy', 'fast', 'shorts', 'brief'];
  const reviewTopics = ['review', 'comparison', 'versus', 'vs', 'alternative', 'best'];
  
  const topicLower = topic.toLowerCase();
  
  if (complexTopics.some(word => topicLower.includes(word))) {
    return { min: 10, optimal: 15, max: 20, reasoning: 'Complex tutorial/guide content' };
  } else if (quickTopics.some(word => topicLower.includes(word))) {
    return { min: 3, optimal: 5, max: 8, reasoning: 'Quick tips or simple content' };
  } else if (reviewTopics.some(word => topicLower.includes(word))) {
    return { min: 7, optimal: 10, max: 15, reasoning: 'Review or comparison content' };
  }
  
  return { min: 5, optimal: 8, max: 12, reasoning: 'Standard informational content' };
};

// Function to generate title variations
const generateTitleVariations = (topic, keywords = []) => {
  if (!topic || typeof topic !== 'string') {
    return [];
  }
  
  // Extract keywords if not provided
  if (!keywords || keywords.length === 0) {
    keywords = extractKeywords(topic);
  }
  
  const year = new Date().getFullYear();
  const nextYear = year + 1;
  
  const templates = [
    {
      template: `The Shocking Truth About ${topic}`,
      type: 'curiosity',
      strength: 'high'
    },
    {
      template: `${topic}: Everything You Need to Know in ${year}`,
      type: 'comprehensive',
      strength: 'medium'
    },
    {
      template: `Why ${topic} Changes Everything`,
      type: 'impact',
      strength: 'high'
    },
    {
      template: `${topic} Explained in ${suggestVideoLength(topic).optimal} Minutes`,
      type: 'educational',
      strength: 'medium'
    },
    {
      template: `The Hidden Secret of ${topic}`,
      type: 'mystery',
      strength: 'high'
    },
    {
      template: `${topic} - The Complete ${year} Guide`,
      type: 'guide',
      strength: 'medium'
    },
    {
      template: `Stop Making These ${topic} Mistakes`,
      type: 'mistakes',
      strength: 'high'
    },
    {
      template: `How ${topic} Actually Works (Not What You Think)`,
      type: 'contrarian',
      strength: 'high'
    },
    {
      template: `${topic} in ${nextYear}: What You Must Know`,
      type: 'future',
      strength: 'medium'
    },
    {
      template: `I Tested ${topic} for 30 Days - Here's What Happened`,
      type: 'personal',
      strength: 'high'
    }
  ];
  
  return templates.map(({ template, type, strength }) => ({
    title: template,
    characterCount: template.length,
    hasKeywords: keywords.some(kw => template.toLowerCase().includes(kw)),
    type: type,
    clickStrength: strength,
    isUnder60Chars: template.length <= 60,
    recommendation: template.length <= 60 ? 'Good length for display' : 'May be truncated in search results'
  }));
};

// Enhanced main function with error handling and validation
const generateOptimizedScript = (options = {}) => {
  console.log('\n🚀 === GENERATE OPTIMIZED SCRIPT CALLED ===');
  console.log('Options provided:', Object.keys(options));
  
  try {
    const {
      topic,
      targetLength = 10,
      tone = 'professional',
      audience = 'general',
      includeKeywords = true,
      includeTitleSuggestions = true,
      validateOutput = true,
      // Workflow context
      frame = null,
      hook = null,
      contentPoints = null,
      research = null,
      voiceProfile = null,
      thumbnail = null,
      targetAudience = null
    } = options;
    
    // Validate inputs
    if (!topic) {
      throw new Error('Topic is required');
    }
    
    // Create workflow context object with all parameters
    const workflowContext = {
      frame,
      hook,
      contentPoints,
      research,
      voiceProfile,
      thumbnail,
      targetAudience: targetAudience || audience,
      tone
    };
    
    console.log('📦 WORKFLOW CONTEXT CREATED:');
    console.log('- Has frame:', !!frame);
    console.log('- Has hook:', !!hook);
    console.log('- Has contentPoints:', !!contentPoints);
    console.log('- Has research:', !!research);
    console.log('- Has voiceProfile:', !!voiceProfile);
    console.log('- Has thumbnail:', !!thumbnail);
    console.log('- Target audience:', targetAudience || audience);
    console.log('- Tone:', tone);
    
    // Generate the prompt with workflow context
    const prompt = generateYouTubeScriptPrompt(topic, targetLength, workflowContext);
    
    // Extract keywords
    const keywords = includeKeywords ? extractKeywords(topic) : [];
    
    // Get video length suggestions
    const lengthSuggestion = suggestVideoLength(topic);
    
    // Generate title variations
    const titleVariations = includeTitleSuggestions ? 
      generateTitleVariations(topic, keywords) : [];
    
    // Prepare the complete output
    const result = {
      prompt: prompt,
      metadata: {
        topic: topic,
        targetLength: targetLength,
        tone: tone,
        audience: audience,
        keywords: keywords,
        lengthSuggestion: lengthSuggestion,
        titleVariations: titleVariations,
        generatedAt: new Date().toISOString()
      }
    };
    
    console.log('\n📄 RESULT METADATA:');
    console.log('- Prompt length:', prompt.length, 'characters');
    console.log('- Keywords extracted:', keywords.length);
    console.log('- Title variations:', titleVariations.length);
    console.log('- Length suggestion:', lengthSuggestion);
    console.log('=== END GENERATE OPTIMIZED SCRIPT ===\n');
    
    // Add validation function if requested
    if (validateOutput) {
      result.validate = (script) => validateScriptOutput(script);
    }
    
    return result;
    
  } catch (error) {
    console.error('Error generating optimized script:', error);
    return {
      error: error.message,
      prompt: null,
      metadata: {
        generatedAt: new Date().toISOString(),
        errorOccurred: true
      }
    };
  }
};

// Test function for development
const testGenerator = () => {
  const testCases = [
    "The Ashley Madison Hack",
    "Quick Tips for Better Sleep",
    "Complete Python Tutorial for Beginners",
    "iPhone 15 vs Samsung S24 Review",
    ""  // Empty topic for error testing
  ];
  
  console.log("Testing YouTube Script Generator...\n");
  
  testCases.forEach((testTopic, index) => {
    console.log(`Test Case ${index + 1}: "${testTopic}"`);
    console.log("-".repeat(50));
    
    const result = generateOptimizedScript({
      topic: testTopic,
      targetLength: 10,
      validateOutput: true
    });
    
    if (result.error) {
      console.log("Error:", result.error);
    } else {
      console.log("Keywords:", result.metadata.keywords);
      console.log("Suggested Length:", result.metadata.lengthSuggestion);
      console.log("Title Variations:", result.metadata.titleVariations.slice(0, 3).map(t => t.title));
      
      // Test validation with mock script
      if (result.validate) {
        const mockScript = "0:00 Introduction [Visual: Logo]\n0:30 Main content with question?\n(Section 1)";
        const validation = result.validate(mockScript);
        console.log("Validation Test:", validation);
      }
    }
    
    console.log("\n");
  });
};

// Function to build script generation prompt that prioritizes synthesis
function buildScriptGenerationPrompt(topic, duration, tone, research) {
  const synthesisSource = research.sources.find(s => s.source_type === 'synthesis');
  const webSources = research.sources.filter(s => s.source_type === 'web' && s.source_content?.length > 100);
  
  return `<role>You are an expert YouTube scriptwriter specializing in ${tone} educational content.</role>

<task>
Create a ${duration}-minute YouTube script for the topic: "${topic}"

The script must be engaging, well-researched, and optimized for viewer retention.
</task>

<research_context>
You have been provided with comprehensive research on this topic. The research consists of:

1. **PRIMARY SOURCE - Research Synthesis (MOST IMPORTANT)**
This is a comprehensive analysis combining insights from multiple verified sources:
${synthesisSource?.source_content || 'No synthesis available'}

${webSources.length > 0 ? `
2. **SUPPLEMENTARY SOURCES - Additional Context**
These provide extra detail and specific examples to enrich the script:
${webSources.map((source, i) => `
Source ${i + 1}: ${source.source_title || 'Web Source'}
URL: ${source.source_url}
Content Preview (first 1500 chars):
${source.source_content.substring(0, 1500)}
${source.source_content.length > 1500 ? `\n[${Math.floor((source.source_content.length - 1500) / 1000)}k more characters available in source]` : ''}
`).join('\n')}
` : ''}

**CRITICAL INSTRUCTIONS:**
- The research synthesis above contains ALL the key facts, statistics, and perspectives you need
- Use supplementary sources ONLY to add specific examples, quotes, or granular details
- DO NOT search for additional information - everything needed is provided above
- If a supplementary source seems relevant but wasn't successfully scraped, the synthesis already covers its key points
- Cite specific facts using the source numbers provided in the synthesis [1], [2], etc.
</research_context>

<script_requirements>
**Duration:** ${duration} minutes (approximately ${Math.floor(duration * 150)} words)

**Structure:**
[0:00] - Hook (30 seconds): Grab attention immediately with the most shocking/interesting fact
[0:30] - Introduction: Set up what the video will cover
[Main Content] - 5-7 key points from the research, each with:
  - Clear subheading with timestamp
  - Supporting facts and statistics from synthesis
  - Specific examples from supplementary sources when available
  - Smooth transitions between points
[Final minute] - Conclusion with key takeaway and call-to-action

**Tone:** ${tone}

**Content Guidelines:**
- Lead with the most compelling information from the synthesis
- Use specific statistics, dates, and facts provided in the research
- Include expert quotes when provided in sources
- Address common misconceptions mentioned in the synthesis
- Provide historical context where relevant
- End with actionable insights for viewers

**Format Requirements:**
- Include timestamps in [MM:SS] format
- Mark visual suggestions with [Visual: description]
- Keep paragraphs short (2-3 sentences max)
- Use conversational language while maintaining accuracy
- NO speculation beyond what's in the research provided
</script_requirements>

<quality_standards>
✓ Every major claim must trace back to the research provided
✓ Use specific numbers, dates, and names from the synthesis
✓ Incorporate expert quotes when available in sources
✓ Maintain narrative flow with clear transitions
✓ Balance entertainment value with educational depth
✗ DO NOT make up facts or statistics not in the research
✗ DO NOT search for additional information - use only what's provided
✗ DO NOT include generic filler content
</quality_standards>

Begin writing the script now:`;
}

// Export all functions for use in your app
module.exports = {
  generateYouTubeScriptPrompt,
  validateScriptOutput,
  extractKeywords,
  suggestVideoLength,
  generateTitleVariations,
  generateOptimizedScript,
  testGenerator,
  buildScriptGenerationPrompt,
  default: generateOptimizedScript
};