/**
 * Integration Example for Optimized YouTube Script Generator
 * Shows how to integrate with your existing script generation workflow
 */

const generateOptimizedScript = require('./optimized-youtube-generator').default;

// Example 1: Basic Usage in an API Route
async function handleScriptGeneration(req, res) {
  try {
    const { topic, duration, tone, audience } = req.body;
    
    // Generate the optimized prompt
    const result = generateOptimizedScript({
      topic: topic || "How to grow on YouTube",
      targetLength: duration || 10,
      tone: tone || 'professional',
      audience: audience || 'content creators',
      validateOutput: true
    });
    
    if (result.error) {
      return res.status(400).json({ 
        error: result.error,
        message: "Failed to generate script prompt" 
      });
    }
    
    // Use the prompt with your AI service
    const scriptContent = await callAIService(result.prompt);
    
    // Validate the generated script
    const validation = result.validate(scriptContent);
    
    // Return the result with metadata
    return res.json({
      script: scriptContent,
      metadata: result.metadata,
      validation: validation,
      suggestions: {
        titles: result.metadata.titleVariations.slice(0, 3),
        keywords: result.metadata.keywords,
        optimalLength: result.metadata.lengthSuggestion.optimal
      }
    });
    
  } catch (error) {
    console.error('Script generation error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Example 2: Integration with existing script-generation.js
function enhanceExistingGenerator(existingOptions) {
  const {
    title,
    type = 'educational',
    length = 10,
    tone = 'professional',
    targetAudience = 'general',
    keyPoints = [],
    channelContext = '',
    voiceProfile = null
  } = existingOptions;
  
  // Generate the optimized version
  const optimizedResult = generateOptimizedScript({
    topic: title,
    targetLength: length,
    tone: tone,
    audience: targetAudience
  });
  
  // Merge with existing prompt structure
  const enhancedPrompt = `
${optimizedResult.prompt}

<additional_context>
${channelContext ? `Channel Context: ${channelContext}` : ''}
${voiceProfile ? `Voice Profile: ${JSON.stringify(voiceProfile)}` : ''}
${keyPoints.length > 0 ? `Key Points to Cover:\n${keyPoints.map((p, i) => `${i+1}. ${p}`).join('\n')}` : ''}
</additional_context>

<fact_checking_requirements>
MANDATORY: Verify all statistics and companies mentioned
- Cross-reference with at least 2 credible sources
- Use data from the last 24 months only
- If unsure, use "approximately" or "reported by [source]"
- Never invent companies or statistics
</fact_checking_requirements>
`;
  
  return {
    system: "You are an expert YouTube scriptwriter with a focus on factual accuracy and engagement.",
    user: enhancedPrompt,
    metadata: optimizedResult.metadata
  };
}

// Example 3: Workflow Integration with Multiple Steps
class YouTubeScriptWorkflow {
  constructor(options = {}) {
    this.options = options;
    this.scriptData = null;
  }
  
  // Step 1: Generate optimized prompt
  async generatePrompt(topic, length = 10) {
    const result = generateOptimizedScript({
      topic: topic,
      targetLength: length,
      tone: this.options.tone || 'professional',
      audience: this.options.audience || 'general'
    });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    this.scriptData = result;
    return result;
  }
  
  // Step 2: Generate script content
  async generateScript() {
    if (!this.scriptData) {
      throw new Error('Must generate prompt first');
    }
    
    // Call your AI service here
    const script = await this.callAI(this.scriptData.prompt);
    
    // Validate the output
    const validation = this.scriptData.validate(script);
    
    if (!validation.isValid) {
      console.warn('Script validation failed:', validation.errors);
      // Could trigger regeneration or manual review
    }
    
    return {
      script: script,
      validation: validation,
      metadata: this.scriptData.metadata
    };
  }
  
  // Step 3: Generate titles
  getTitleSuggestions() {
    if (!this.scriptData) {
      throw new Error('Must generate prompt first');
    }
    
    return this.scriptData.metadata.titleVariations
      .filter(t => t.isUnder60Chars)
      .sort((a, b) => {
        // Prioritize high click strength
        if (a.clickStrength === 'high' && b.clickStrength !== 'high') return -1;
        if (b.clickStrength === 'high' && a.clickStrength !== 'high') return 1;
        return 0;
      })
      .slice(0, 5);
  }
  
  // Step 4: Generate SEO metadata
  getSEOMetadata() {
    if (!this.scriptData) {
      throw new Error('Must generate prompt first');
    }
    
    const keywords = this.scriptData.metadata.keywords;
    const primaryKeyword = keywords[0] || '';
    const secondaryKeywords = keywords.slice(1, 5);
    
    return {
      primaryKeyword: primaryKeyword,
      secondaryKeywords: secondaryKeywords,
      tags: this.generateTags(keywords),
      description: this.generateDescription(primaryKeyword, secondaryKeywords)
    };
  }
  
  // Helper methods
  async callAI(prompt) {
    // Replace with your actual AI service call
    // This is just a placeholder
    return "Generated script content here...";
  }
  
  generateTags(keywords) {
    // Generate YouTube tags based on keywords
    const baseTags = keywords;
    const expandedTags = [];
    
    keywords.forEach(keyword => {
      expandedTags.push(`${keyword} tutorial`);
      expandedTags.push(`${keyword} guide`);
      expandedTags.push(`${keyword} 2025`);
    });
    
    return [...baseTags, ...expandedTags].slice(0, 15);
  }
  
  generateDescription(primary, secondary) {
    const year = new Date().getFullYear();
    return `Learn everything about ${primary} in this comprehensive guide. We cover ${secondary.join(', ')} and more. Updated for ${year} with the latest information and best practices.\n\nTimestamps:\n0:00 Introduction\n[Add more timestamps after script generation]\n\nLinks and Resources:\n[Add relevant links]`;
  }
}

// Example 4: Direct replacement for existing generateScript function
function replaceExistingGenerateScript(options) {
  const optimizedResult = generateOptimizedScript({
    topic: options.title,
    targetLength: options.length || 10,
    tone: options.tone || 'professional',
    audience: options.targetAudience || 'general'
  });
  
  // Return in the same format as your existing function expects
  return {
    system: `You are an expert YouTube scriptwriter. ${optimizedResult.prompt.slice(0, 200)}...`,
    user: optimizedResult.prompt,
    // Add any additional properties your existing code expects
    hookOptions: optimizedResult.metadata.titleVariations[0],
    keywords: optimizedResult.metadata.keywords,
    suggestedLength: optimizedResult.metadata.lengthSuggestion
  };
}

// Example 5: Using with fact-checking emphasis
async function generateFactCheckedScript(topic, options = {}) {
  const result = generateOptimizedScript({
    topic: topic,
    ...options
  });
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  // Add extra fact-checking instructions
  const enhancedPrompt = `
${result.prompt}

<strict_fact_checking>
CRITICAL: This script will be fact-checked. You MUST:
1. Only mention companies/products that existed as of 2024/2025
2. Use statistics from reputable sources (government, academic, major publications)
3. When citing numbers, include the source and year
4. If a fact cannot be verified, explicitly state "according to unverified reports" or omit it
5. Never round numbers dramatically (e.g., don't change 3% to 30% for effect)

Example of proper citation:
"According to Statista's 2024 report, YouTube has over 2.7 billion monthly active users"

Example of handling uncertainty:
"While exact numbers vary, experts estimate between X and Y..."
</strict_fact_checking>
`;
  
  return {
    prompt: enhancedPrompt,
    metadata: result.metadata,
    validate: result.validate
  };
}

// Export examples for use
module.exports = {
  handleScriptGeneration,
  enhanceExistingGenerator,
  YouTubeScriptWorkflow,
  replaceExistingGenerateScript,
  generateFactCheckedScript
};

// Quick test example
if (require.main === module) {
  console.log("Testing integration examples...\n");
  
  // Test the workflow
  const workflow = new YouTubeScriptWorkflow({
    tone: 'professional',
    audience: 'tech enthusiasts'
  });
  
  workflow.generatePrompt("The Rise of AI in 2025", 10)
    .then(result => {
      console.log("✅ Prompt generated successfully");
      console.log("Keywords:", result.metadata.keywords);
      console.log("Title suggestions:", workflow.getTitleSuggestions().map(t => t.title));
      console.log("SEO metadata:", workflow.getSEOMetadata());
    })
    .catch(error => {
      console.error("❌ Error:", error.message);
    });
}