import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { topic, hookStyle } = await request.json();

    if (!topic?.trim()) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would use OpenAI or another AI service
    // For now, we'll generate mock hooks based on proven formulas
    
    const hooks = generateHooks(topic.trim(), hookStyle || 'question');

    return NextResponse.json({
      success: true,
      hooks,
      topic,
      style: hookStyle
    });

  } catch (error) {
    console.error('Hook generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hooks' },
      { status: 500 }
    );
  }
}

function generateHooks(topic, style) {
  const hooks = [];
  
  // Generate 5-8 hooks based on the style
  switch (style) {
    case 'question':
      hooks.push(...generateQuestionHooks(topic));
      break;
    case 'shocking':
      hooks.push(...generateShockingHooks(topic));
      break;
    case 'story':
      hooks.push(...generateStoryHooks(topic));
      break;
    case 'problem':
      hooks.push(...generateProblemHooks(topic));
      break;
    case 'benefit':
      hooks.push(...generateBenefitHooks(topic));
      break;
    case 'curiosity':
      hooks.push(...generateCuriosityHooks(topic));
      break;
    default:
      hooks.push(...generateMixedHooks(topic));
  }
  
  // Add engagement scores
  return hooks.map((hook, index) => ({
    text: hook,
    type: capitalizeFirst(style),
    engagement: (9.5 - index * 0.3).toFixed(1)
  }));
}

function generateQuestionHooks(topic) {
  return [
    `Did you know that 90% of people make this critical mistake when ${topic.toLowerCase()}?`,
    `What if I told you there's a better way to ${topic.toLowerCase()}?`,
    `Why do most people fail at ${topic.toLowerCase()}?`,
    `Have you ever wondered why ${topic.toLowerCase()} seems so difficult?`,
    `What's the one thing experts don't tell you about ${topic.toLowerCase()}?`,
    `Do you want to know the secret to perfect ${topic.toLowerCase()}?`
  ];
}

function generateShockingHooks(topic) {
  return [
    `This one technique will completely transform your ${topic.toLowerCase()} - and you probably already have everything you need!`,
    `I can't believe I was doing ${topic.toLowerCase()} wrong for so long!`,
    `This ${topic.toLowerCase()} method is so effective, it should be illegal!`,
    `You won't believe what happened when I tried this ${topic.toLowerCase()} technique...`,
    `This simple change made my ${topic.toLowerCase()} 10x better overnight!`,
    `WARNING: This ${topic.toLowerCase()} method is addictive!`
  ];
}

function generateStoryHooks(topic) {
  return [
    `Last week, I completely failed at ${topic.toLowerCase()}... until I discovered this game-changing method.`,
    `Three years ago, I thought ${topic.toLowerCase()} was impossible. Here's what changed everything.`,
    `My biggest ${topic.toLowerCase()} disaster taught me this valuable lesson...`,
    `I used to struggle with ${topic.toLowerCase()} until my mentor showed me this secret.`,
    `The day I learned this ${topic.toLowerCase()} technique changed everything for me.`,
    `I almost gave up on ${topic.toLowerCase()}... then this happened.`
  ];
}

function generateProblemHooks(topic) {
  return [
    `If you've ever struggled with ${topic.toLowerCase()}, this video will change everything.`,
    `Tired of failing at ${topic.toLowerCase()}? Here's the solution you've been looking for.`,
    `Stop making these common ${topic.toLowerCase()} mistakes!`,
    `If your ${topic.toLowerCase()} isn't working, you're probably making one of these errors.`,
    `Frustrated with your ${topic.toLowerCase()} results? Here's why it's not working.`,
    `The biggest ${topic.toLowerCase()} problems (and how to solve them).`
  ];
}

function generateBenefitHooks(topic) {
  return [
    `In the next 15 minutes, you'll learn everything you need to know about ${topic.toLowerCase()}.`,
    `By the end of this video, you'll master ${topic.toLowerCase()} like a pro.`,
    `Watch this and never struggle with ${topic.toLowerCase()} again.`,
    `Learn the exact system I use for perfect ${topic.toLowerCase()} every time.`,
    `Master ${topic.toLowerCase()} with this simple 5-step process.`,
    `Get professional ${topic.toLowerCase()} results at home with this method.`
  ];
}

function generateCuriosityHooks(topic) {
  return [
    `The secret to perfect ${topic.toLowerCase()} that nobody tells you...`,
    `What happens when you apply this ${topic.toLowerCase()} technique? (Mind-blowing results!)`,
    `The hidden truth about ${topic.toLowerCase()} that will surprise you.`,
    `This ${topic.toLowerCase()} method defies everything you've been taught.`,
    `The controversial ${topic.toLowerCase()} technique that actually works.`,
    `Why everything you know about ${topic.toLowerCase()} is wrong.`
  ];
}

function generateMixedHooks(topic) {
  // Return a mix of different styles
  return [
    `Did you know that 90% of people make this critical mistake when ${topic.toLowerCase()}?`,
    `This one technique will completely transform your ${topic.toLowerCase()}!`,
    `Last week, I completely failed at ${topic.toLowerCase()}... until I discovered this method.`,
    `If you've ever struggled with ${topic.toLowerCase()}, this video will change everything.`,
    `In the next 15 minutes, you'll master ${topic.toLowerCase()} like a pro.`,
    `The secret to perfect ${topic.toLowerCase()} that nobody tells you...`
  ];
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}