/**
 * Content Planning Module for Script Generation
 *
 * Creates a detailed content plan that explicitly assigns topics to chunks
 * to prevent overlap and ensure proper distribution.
 */

/**
 * Generate a detailed content plan for multi-chunk script generation
 * @param {Object} params - Planning parameters
 * @returns {Object} Detailed content plan with chunk assignments
 */
async function generateContentPlan({
  title,
  topic,
  contentPoints,
  totalMinutes,
  chunkCount,
  apiKey,
  model = process.env.BALANCED_MODEL || 'claude-sonnet-4-5-20250929'
}) {
  // If no content points, return basic time-based distribution
  if (!contentPoints || contentPoints.length === 0) {
    return generateBasicPlan(totalMinutes, chunkCount);
  }

  // Calculate minutes per chunk
  const minutesPerChunk = totalMinutes / chunkCount;

  // Create a planning prompt for the AI
  const planningPrompt = `You are planning how to distribute content across ${chunkCount} chunks for a ${totalMinutes}-minute YouTube script.

VIDEO: ${title}
TOPIC: ${topic}

CONTENT POINTS TO DISTRIBUTE:
${contentPoints.map((point, idx) => `
${idx + 1}. "${point.title || point.name || 'Topic ' + idx}"
   Description: ${point.description || 'N/A'}
   Duration: ${point.duration ? Math.ceil(point.duration / 60) + ' minutes' : 'Flexible'}
   Key Takeaway: ${point.keyTakeaway || 'N/A'}
`).join('')}

CHUNK STRUCTURE:
${Array.from({ length: chunkCount }, (_, i) => `
Chunk ${i + 1}: Minutes ${i * minutesPerChunk}-${(i + 1) * minutesPerChunk}
`).join('')}

YOUR TASK:
Create a content distribution plan that:
1. Assigns each content point to EXACTLY ONE chunk
2. Balances content across chunks (similar amount of content per chunk)
3. Groups related topics together when possible
4. Ensures logical flow and narrative progression
5. Specifies EXACT section titles for each chunk

FORMAT YOUR RESPONSE AS JSON:
{
  "chunks": [
    {
      "chunkNumber": 1,
      "timeRange": "0-15",
      "assignedSections": [
        {
          "title": "Exact Section Title",
          "description": "What to cover",
          "estimatedMinutes": 5
        }
      ]
    }
  ]
}

CRITICAL RULES:
- Each section title must appear in EXACTLY ONE chunk
- No section can appear in multiple chunks
- All content points must be assigned
- Response must be valid JSON`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2048,
        temperature: 0.3, // Lower temperature for more consistent planning
        messages: [{
          role: 'user',
          content: planningPrompt
        }]
      })
    });

    if (!response.ok) {
      console.error('Content planning API error:', await response.text());
      return generateBasicPlan(totalMinutes, chunkCount);
    }

    const data = await response.json();
    const planText = data.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = planText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not parse content plan, using basic distribution');
      return distributeContentMechanically(contentPoints, chunkCount, minutesPerChunk);
    }

    try {
      const plan = JSON.parse(jsonMatch[0]);

      // Validate the plan
      if (!plan.chunks || !Array.isArray(plan.chunks)) {
        throw new Error('Invalid plan structure');
      }

      return plan;
    } catch (parseError) {
      console.warn('JSON parsing failed, using mechanical distribution:', parseError);
      return distributeContentMechanically(contentPoints, chunkCount, minutesPerChunk);
    }
  } catch (error) {
    console.error('Content planning error:', error);
    return generateBasicPlan(totalMinutes, chunkCount);
  }
}

/**
 * Mechanically distribute content points across chunks
 * Fallback when AI planning fails
 */
function distributeContentMechanically(contentPoints, chunkCount, minutesPerChunk) {
  const pointsPerChunk = Math.ceil(contentPoints.length / chunkCount);
  const chunks = [];

  for (let i = 0; i < chunkCount; i++) {
    const startIdx = i * pointsPerChunk;
    const endIdx = Math.min((i + 1) * pointsPerChunk, contentPoints.length);
    const chunkPoints = contentPoints.slice(startIdx, endIdx);

    chunks.push({
      chunkNumber: i + 1,
      timeRange: `${i * minutesPerChunk}-${(i + 1) * minutesPerChunk}`,
      assignedSections: chunkPoints.map(point => ({
        title: point.title || point.name || `Section ${startIdx + 1}`,
        description: point.description || '',
        estimatedMinutes: Math.ceil((point.duration || (minutesPerChunk * 60 / pointsPerChunk)) / 60)
      }))
    });
  }

  return { chunks };
}

/**
 * Generate a basic time-based plan when no content points exist
 */
function generateBasicPlan(totalMinutes, chunkCount) {
  const minutesPerChunk = totalMinutes / chunkCount;
  const chunks = [];

  for (let i = 0; i < chunkCount; i++) {
    chunks.push({
      chunkNumber: i + 1,
      timeRange: `${i * minutesPerChunk}-${(i + 1) * minutesPerChunk}`,
      assignedSections: []
    });
  }

  return { chunks };
}

/**
 * Apply a content plan to chunk generation
 * Ensures each chunk only covers its assigned sections
 */
function applyContentPlan(plan, chunkIndex) {
  if (!plan || !plan.chunks || chunkIndex >= plan.chunks.length) {
    return null;
  }

  const chunkPlan = plan.chunks[chunkIndex];
  return {
    assignedSections: chunkPlan.assignedSections,
    forbiddenSections: plan.chunks
      .filter((_, idx) => idx !== chunkIndex)
      .flatMap(c => c.assignedSections.map(s => s.title))
  };
}

module.exports = {
  generateContentPlan,
  distributeContentMechanically,
  generateBasicPlan,
  applyContentPlan
};
