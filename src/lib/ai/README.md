# AI Service Layer

A comprehensive AI service layer for YouTube script generation with support for multiple AI providers.

## Features

- **Multiple AI Providers**: Support for OpenAI and Anthropic with easy extensibility
- **Task-Based Routing**: Automatically selects the best provider for each task type
- **Streaming Support**: Real-time streaming responses with SSE
- **Token Counting**: Accurate token counting and cost estimation
- **Voice Matching**: Analyze and replicate writing styles
- **Error Handling**: Robust retry logic and fallback mechanisms
- **Usage Tracking**: Detailed statistics and cost tracking

## Setup

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview  # optional, defaults to gpt-4-turbo-preview
OPENAI_ORGANIZATION=your_org_id    # optional

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-opus-20240229  # optional, defaults to claude-3-opus
```

### Installation

The AI service uses only native fetch API, no additional dependencies needed.

## Usage

### Basic Generation

```javascript
import { AIService, TaskType } from '@/lib/ai';
import { generateScriptPrompt } from '@/lib/prompts/script-generation';

// Initialize from environment
const ai = AIService.fromEnv();

// Generate a script
const scriptPrompt = generateScriptPrompt({
  topic: 'How to Start a YouTube Channel',
  style: 'educational',
  duration: 10,
  audience: 'beginners'
});

const response = await ai.generate({
  ...scriptPrompt,
  taskType: TaskType.SCRIPT_GENERATION
});

console.log(response.text);
console.log('Cost:', response.cost);
```

### Streaming Responses

```javascript
const stream = ai.generateStream({
  prompt: 'Write a YouTube script intro',
  taskType: TaskType.HOOK_GENERATION
});

for await (const chunk of stream) {
  if (chunk.type === 'content') {
    process.stdout.write(chunk.content);
  }
}
```

### API Route with Streaming

```javascript
// app/api/generate/route.js
import { AIService } from '@/lib/ai';
import { createSSEResponse } from '@/lib/ai/streaming';

export async function POST(request) {
  const { prompt, taskType } = await request.json();
  
  const ai = AIService.fromEnv();
  const stream = ai.generateStream({ prompt, taskType });
  
  return createSSEResponse(stream);
}
```

## Task Types

- `SCRIPT_GENERATION`: Full video scripts
- `TITLE_GENERATION`: Video titles and thumbnails
- `HOOK_GENERATION`: Opening hooks
- `VOICE_MATCHING`: Style analysis and matching
- `GENERAL`: General purpose generation

## Prompt Templates

### Script Generation

```javascript
import { generateScriptPrompt } from '@/lib/prompts/script-generation';

const prompt = generateScriptPrompt({
  topic: 'Your Topic',
  style: 'educational|entertaining|casual|professional',
  duration: 10, // minutes
  keyPoints: ['point1', 'point2'],
  tone: 'conversational'
});
```

### Title Generation

```javascript
import { generateTitlesPrompt } from '@/lib/prompts/title-generation';

const prompt = generateTitlesPrompt({
  topic: 'Your Topic',
  description: 'Video description',
  style: 'clickbait|educational|how-to',
  count: 5
});
```

### Hook Generation

```javascript
import { generateHooksPrompt } from '@/lib/prompts/hook-generation';

const prompt = generateHooksPrompt({
  topic: 'Your Topic',
  videoTitle: 'Your Title',
  style: 'question|story|statistic|preview',
  duration: 15 // seconds
});
```

### Voice Matching

```javascript
import { analyzeVoicePrompt, matchVoicePrompt } from '@/lib/prompts/voice-matching';

// Analyze voice
const analysis = await ai.generate({
  ...analyzeVoicePrompt({ sampleText: 'Sample content' }),
  taskType: TaskType.VOICE_MATCHING
});

// Match voice
const matched = await ai.generate({
  ...matchVoicePrompt({
    voiceProfile: analysis.text,
    content: 'New content to rewrite'
  }),
  taskType: TaskType.VOICE_MATCHING
});
```

## Cost Management

### Token Counting

```javascript
const tokens = await ai.countTokens('Your text here');
console.log('Token count:', tokens);
```

### Cost Estimation

```javascript
const cost = ai.estimateCost(
  inputTokens = 1000,
  outputTokens = 2000,
  { provider: 'openai', model: 'gpt-4' }
);
console.log('Estimated cost: $', cost);
```

### Usage Statistics

```javascript
const stats = ai.getUsageStats();
console.log('Total requests:', stats.requests);
console.log('Total cost: $', stats.totalCost);
console.log('By provider:', stats.byProvider);
```

## Advanced Features

### Custom Provider Configuration

```javascript
const ai = new AIService({
  providers: {
    openai: {
      apiKey: 'your-key',
      model: 'gpt-4',
      maxRetries: 5,
      retryDelay: 2000
    }
  },
  taskProviders: {
    [TaskType.SCRIPT_GENERATION]: 'openai',
    [TaskType.TITLE_GENERATION]: 'anthropic'
  }
});
```

### Stream Transformations

```javascript
import { bufferStream, throttleStream } from '@/lib/ai/streaming';

// Buffer chunks to reduce UI updates
const buffered = bufferStream(stream, 100); // 100 chars

// Throttle stream for rate limiting
const throttled = throttleStream(stream, 50); // 50ms delay
```

### Error Handling

```javascript
try {
  const response = await ai.generate({
    prompt: 'Generate content',
    taskType: TaskType.GENERAL
  });
} catch (error) {
  if (error.status === 429) {
    // Rate limited
  } else if (error.status === 401) {
    // Invalid API key
  }
  // Fallback logic
}
```

## Best Practices

1. **Use Task Types**: Always specify the appropriate task type for optimal provider selection
2. **Stream Long Content**: Use streaming for scripts and long-form content
3. **Monitor Costs**: Track usage statistics regularly
4. **Cache Results**: Implement caching for repeated generations
5. **Handle Errors**: Always implement error handling with fallbacks
6. **Token Limits**: Check token counts before making expensive calls

## Adding New Providers

To add a new AI provider:

1. Create a new provider class extending `BaseAIProvider`
2. Implement required methods
3. Add to the AIService configuration

```javascript
// lib/ai/providers/custom.js
import { BaseAIProvider } from './base.js';

export class CustomProvider extends BaseAIProvider {
  async generateCompletion(options) {
    // Implementation
  }
  
  async generateChatCompletion(options) {
    // Implementation
  }
  
  async countTokens(text) {
    // Implementation
  }
  
  estimateCost(inputTokens, outputTokens) {
    // Implementation
  }
}
```

## Performance Tips

- Use appropriate models for each task (GPT-3.5 for simple tasks, GPT-4 for complex)
- Implement request queuing for rate limiting
- Cache voice profiles for consistent generation
- Use streaming for real-time user feedback
- Batch similar requests when possible