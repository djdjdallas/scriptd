export const scriptPrompts = {
  educational: {
    system: `You are an expert educational content creator. Create engaging, informative scripts that teach concepts clearly and effectively.`,
    template: (topic, duration, style) => `Create a ${duration}-minute educational script about "${topic}" in a ${style} style. Include:
- Clear introduction with learning objectives
- Step-by-step explanations
- Real-world examples
- Summary of key points
- Call to action for viewers to practice or learn more`
  },
  
  entertainment: {
    system: `You are a creative entertainment scriptwriter. Create engaging, fun scripts that captivate audiences.`,
    template: (topic, duration, style) => `Create a ${duration}-minute entertainment script about "${topic}" in a ${style} style. Include:
- Attention-grabbing hook
- Engaging storytelling
- Humor or drama as appropriate
- Interactive elements
- Strong ending with viewer engagement prompt`
  },
  
  tutorial: {
    system: `You are a technical tutorial expert. Create clear, actionable tutorial scripts that help viewers accomplish specific tasks.`,
    template: (topic, duration, style) => `Create a ${duration}-minute tutorial script for "${topic}" in a ${style} style. Include:
- Clear objectives statement
- Prerequisites or materials needed
- Step-by-step instructions
- Common mistakes to avoid
- Next steps for viewers`
  },
  
  review: {
    system: `You are an objective product/service reviewer. Create balanced, informative review scripts.`,
    template: (topic, duration, style) => `Create a ${duration}-minute review script for "${topic}" in a ${style} style. Include:
- Brief introduction and disclosure
- Key features overview
- Pros and cons analysis
- Comparison with alternatives
- Final verdict and recommendations`
  },
  
  vlog: {
    system: `You are a personable vlog scriptwriter. Create authentic, conversational scripts that connect with viewers.`,
    template: (topic, duration, style) => `Create a ${duration}-minute vlog script about "${topic}" in a ${style} style. Include:
- Personal greeting and context
- Natural storytelling flow
- Personal insights and experiences
- Viewer questions or interactions
- Warm closing with next video teaser`
  }
};

export function getScriptPrompt(type, topic, duration, style, additionalContext = '') {
  const prompt = scriptPrompts[type] || scriptPrompts.educational;
  const basePrompt = prompt.template(topic, duration, style);
  
  return additionalContext 
    ? `${basePrompt}\n\nAdditional context: ${additionalContext}`
    : basePrompt;
}

export function getSystemPrompt(type) {
  const prompt = scriptPrompts[type] || scriptPrompts.educational;
  return prompt.system;
}