import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateWithAI(prompt, model = 'claude-3-opus') {
  try {
    const modelMap = {
      'claude-3-opus': process.env.PREMIUM_MODEL || 'claude-opus-4-6',
      'claude-3-sonnet': process.env.BALANCED_MODEL || 'claude-sonnet-4-5-20250929',
      'claude-3-haiku': process.env.FAST_MODEL || 'claude-haiku-4-5-20251001',
      // Map old GPT model names to Claude equivalents
      'gpt-4-turbo': process.env.PREMIUM_MODEL || 'claude-opus-4-6',
      'gpt-3.5-turbo': process.env.FAST_MODEL || 'claude-haiku-4-5-20251001'
    };

    const selectedModel = modelMap[model] || process.env.PREMIUM_MODEL || 'claude-opus-4-6';

    const response = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude AI generation error:', error);
    throw new Error('Failed to generate content with Claude AI');
  }
}

export async function generateStructuredData(prompt, model = 'claude-3-opus') {
  try {
    const modelMap = {
      'claude-3-opus': process.env.PREMIUM_MODEL || 'claude-opus-4-6',
      'claude-3-sonnet': process.env.BALANCED_MODEL || 'claude-sonnet-4-5-20250929',
      'claude-3-haiku': process.env.FAST_MODEL || 'claude-haiku-4-5-20251001',
      'gpt-4-turbo': process.env.PREMIUM_MODEL || 'claude-opus-4-6',
      'gpt-3.5-turbo': process.env.FAST_MODEL || 'claude-haiku-4-5-20251001'
    };

    const selectedModel = modelMap[model] || process.env.PREMIUM_MODEL || 'claude-opus-4-6';

    const response = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for structured data
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON with no additional text or markdown formatting.`
        }
      ]
    });
    
    const text = response.content[0].text;
    
    // Try to extract JSON from the response
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // Try to find JSON in the text
      const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from Claude response');
    }
  } catch (error) {
    console.error('Claude AI structured data generation error:', error);
    throw new Error('Failed to generate structured data with Claude AI');
  }
}