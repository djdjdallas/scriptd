/**
 * Utility for safely parsing potentially malformed JSON
 */

export function safeJsonParse(text, fallback = null) {
  // First, try standard JSON.parse
  try {
    return JSON.parse(text);
  } catch (initialError) {
    console.warn('Initial JSON parse failed:', initialError.message);
  }

  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    const extractedJson = jsonMatch[1] || jsonMatch[0];

    try {
      return JSON.parse(extractedJson);
    } catch (extractError) {
      console.warn('Extracted JSON parse failed:', extractError.message);

      // Try to fix common JSON issues
      let fixedJson = extractedJson;

      // Fix truncated arrays or objects
      fixedJson = attemptJsonRepair(fixedJson);

      try {
        return JSON.parse(fixedJson);
      } catch (repairError) {
        console.error('JSON repair failed:', repairError.message);
      }
    }
  }

  // Return fallback if all attempts fail
  return fallback;
}

function attemptJsonRepair(jsonString) {
  let fixed = jsonString;

  // Remove trailing commas
  fixed = fixed.replace(/,\s*([}\]])/g, '$1');

  // Count opening and closing brackets/braces
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;

  // Add missing closing brackets/braces
  if (openBrackets > closeBrackets) {
    const missing = openBrackets - closeBrackets;
    for (let i = 0; i < missing; i++) {
      fixed += ']';
    }
  }

  if (openBraces > closeBraces) {
    const missing = openBraces - closeBraces;
    for (let i = 0; i < missing; i++) {
      fixed += '}';
    }
  }

  // Fix incomplete string values at the end
  // Look for patterns like: "potential": "Revenue
  const incompleteStringMatch = fixed.match(/"[^"]*":\s*"[^"]*$/);
  if (incompleteStringMatch) {
    fixed += '"';
  }

  // Fix incomplete array/object entries
  // If the JSON ends with something like: "method": "
  const incompleteValueMatch = fixed.match(/"[^"]*":\s*"?$/);
  if (incompleteValueMatch) {
    fixed += '"placeholder"}';
  }

  return fixed;
}

export function extractJsonFromResponse(response) {
  // Try multiple extraction patterns
  const patterns = [
    /```json\s*([\s\S]*?)```/,
    /```\s*([\s\S]*?)```/,
    /(\{[\s\S]*\})/
  ];

  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match) {
      const extracted = match[1] || match[0];
      const parsed = safeJsonParse(extracted);
      if (parsed) {
        return parsed;
      }
    }
  }

  // Last resort: try parsing the entire response
  return safeJsonParse(response);
}