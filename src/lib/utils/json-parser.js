/**
 * Centralized JSON parsing utilities for AI responses
 * Handles markdown extraction, JSON repair, and graceful fallbacks
 */

/**
 * Parse AI response that may be wrapped in markdown or have JSON issues
 * @param {string} content - Raw AI response content
 * @param {Object} options - Parsing options
 * @param {*} options.fallback - Value to return if parsing fails (default: {})
 * @param {boolean} options.repair - Attempt to repair malformed JSON (default: true)
 * @param {boolean} options.logErrors - Log parsing errors (default: false)
 * @returns {Object} Parsed JSON object or fallback value
 * @example
 * const result = parseAIResponse(aiContent, {
 *   fallback: { error: true },
 *   logErrors: true
 * });
 */
export function parseAIResponse(content, options = {}) {
  const { fallback = {}, repair = true, logErrors = false } = options;

  if (!content || typeof content !== 'string') {
    return fallback;
  }

  // Strategy 1: Direct parse
  try {
    return JSON.parse(content);
  } catch (directError) {
    if (logErrors) {
      console.debug('[JSON Parser] Direct parse failed, trying markdown extraction');
    }
  }

  // Strategy 2: Extract from markdown and parse
  const extracted = extractJSONFromMarkdown(content);
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch (markdownError) {
      if (logErrors) {
        console.debug('[JSON Parser] Markdown JSON parse failed, trying repair');
      }

      // Strategy 3: Repair extracted content and parse
      if (repair) {
        try {
          const repaired = repairJSON(extracted);
          return JSON.parse(repaired);
        } catch (repairError) {
          if (logErrors) {
            console.warn('[JSON Parser] Repair on extracted content failed', {
              contentPreview: extracted.substring(0, 100),
              error: repairError.message
            });
          }
        }
      }
    }
  }

  // Strategy 4: Try repair on original content
  if (repair) {
    try {
      const repaired = repairJSON(content);
      return JSON.parse(repaired);
    } catch (finalError) {
      if (logErrors) {
        console.warn('[JSON Parser] All parsing strategies failed', {
          contentPreview: content.substring(0, 100),
          error: finalError.message
        });
      }
    }
  }

  // Final fallback
  return fallback;
}

/**
 * Extract JSON content from markdown code blocks
 * @param {string} content - Content potentially containing markdown
 * @returns {string|null} Extracted JSON string or null
 * @example
 * const json = extractJSONFromMarkdown('```json\n{"key": "value"}\n```');
 * // Returns: '{"key": "value"}'
 */
export function extractJSONFromMarkdown(content) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Try patterns in order of specificity
  const patterns = [
    /```json\n?([\s\S]*?)\n?```/,  // ```json code blocks
    /```\n?([\s\S]*?)\n?```/,       // Generic ``` code blocks
    /(\{[\s\S]*\})/,                // Raw JSON object
    /(\[[\s\S]*\])/                 // Raw JSON array
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      // Verify it looks like JSON (starts with { or [)
      if (extracted.startsWith('{') || extracted.startsWith('[')) {
        return extracted;
      }
    }
  }

  return null;
}

/**
 * Attempt to repair common JSON syntax issues from AI responses
 * Handles: empty keys, trailing commas, unquoted keys, missing commas,
 * unescaped quotes in strings, and more
 * @param {string} jsonString - Potentially malformed JSON
 * @returns {string} Repaired JSON string
 * @example
 * const repaired = repairJSON('{"key": "value",}');
 * // Returns: '{"key": "value"}'
 */
export function repairJSON(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    return jsonString;
  }

  let fixed = jsonString.trim();

  // Step 1: Remove markdown code block markers if present
  fixed = fixed.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '');

  // Step 2: Remove empty keys (critical for AI responses)
  // Handles: "": "value", "": {...}, "": [...]
  fixed = fixed.replace(/,?\s*""\s*:\s*"[^"]*"/g, '');
  fixed = fixed.replace(/,?\s*""\s*:\s*\{[^}]*\}/g, '');
  fixed = fixed.replace(/,?\s*""\s*:\s*\[[^\]]*\]/g, '');

  // Step 3: Fix unescaped quotes in string values
  // This is tricky - process line by line to be careful
  const lines = fixed.split('\n');
  const repairedLines = lines.map(line => {
    // Match lines with key-value pairs where value is a string
    const kvMatch = line.match(/^(\s*)"([^"]+)":\s*"(.*)"\s*(,?)\s*$/);
    if (kvMatch) {
      const indent = kvMatch[1];
      const key = kvMatch[2];
      let value = kvMatch[3];
      const comma = kvMatch[4];

      // Escape unescaped quotes in value (quotes not preceded by backslash)
      value = value.replace(/(?<!\\)"/g, '\\"');

      return `${indent}"${key}": "${value}"${comma}`;
    }
    return line;
  });
  fixed = repairedLines.join('\n');

  // Step 4: Remove trailing commas before closing brackets/braces
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // Step 5: Add missing commas between properties
  // After } or ] followed by "key":
  fixed = fixed.replace(/([}\]])(\s*)("[^"]+":)/g, '$1,$2$3');
  // After string/number/boolean/null followed by "key":
  fixed = fixed.replace(/("|\d|true|false|null)(\s+)("[^"]+":)/g, '$1,$2$3');

  // Step 6: Clean up double commas created by previous operations
  fixed = fixed.replace(/,\s*,/g, ',');

  // Step 7: Remove leading commas after opening braces/brackets
  fixed = fixed.replace(/\{\s*,/g, '{');
  fixed = fixed.replace(/\[\s*,/g, '[');

  // Step 8: Fix missing quotes around property names (simple cases)
  fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  // Step 9: Fix single quotes to double quotes (careful with apostrophes in text)
  // Only do this for clear JSON patterns like 'key': or : 'value'
  fixed = fixed.replace(/'([^']+)'(\s*:)/g, '"$1"$2');
  fixed = fixed.replace(/(:\s*)'([^']+)'/g, '$1"$2"');

  // Step 10: Remove JavaScript-style comments
  fixed = fixed.replace(/\/\/.*$/gm, '');
  fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');

  // Step 11: Count and fix missing closing brackets/braces
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;

  // Add missing closing brackets
  if (openBrackets > closeBrackets) {
    const missing = openBrackets - closeBrackets;
    for (let i = 0; i < missing; i++) {
      fixed += ']';
    }
  }

  // Add missing closing braces
  if (openBraces > closeBraces) {
    const missing = openBraces - closeBraces;
    for (let i = 0; i < missing; i++) {
      fixed += '}';
    }
  }

  // Step 12: Fix incomplete string values at the end
  // Look for patterns like: "key": "incomplete value
  const incompleteStringMatch = fixed.match(/"[^"]*":\s*"[^"]*$/);
  if (incompleteStringMatch) {
    fixed += '"';
  }

  return fixed.trim();
}

/**
 * Safely parse JSON with a fallback value
 * Simple wrapper for JSON.parse that never throws
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Value to return on failure (default: null)
 * @returns {*} Parsed value or fallback
 * @example
 * const data = safeJSONParse('{"valid": true}', {});
 * // Returns: { valid: true }
 *
 * const data = safeJSONParse('invalid json', {});
 * // Returns: {}
 */
export function safeJSONParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

// Alias for backwards compatibility
export const safeJsonParse = safeJSONParse;

/**
 * Extract JSON from AI response using multiple strategies
 * @param {string} response - AI response that may contain JSON
 * @returns {Object|null} Parsed JSON object or null
 * @deprecated Use parseAIResponse instead for more control
 * @example
 * const data = extractJsonFromResponse('Here is the data: ```json\n{"key": "value"}\n```');
 */
export function extractJsonFromResponse(response) {
  return parseAIResponse(response, {
    fallback: null,
    repair: true,
    logErrors: false
  });
}
