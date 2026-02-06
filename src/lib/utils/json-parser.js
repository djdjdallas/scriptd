/**
 * Centralized JSON parsing utilities for AI responses
 * Handles markdown extraction, JSON repair, and graceful fallbacks
 *
 * Based on techniques from jsonrepair and other LLM JSON repair libraries
 * @see https://github.com/josdejong/jsonrepair
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
    const result = JSON.parse(content);
    if (logErrors) console.debug('[JSON Parser] Success via strategy 1: direct parse');
    return result;
  } catch (directError) {
    if (logErrors) {
      console.debug('[JSON Parser] Direct parse failed, trying markdown extraction');
    }
  }

  // Strategy 2: Extract from markdown and parse
  const extracted = extractJSONFromMarkdown(content);
  if (extracted) {
    try {
      const result = JSON.parse(extracted);
      if (logErrors) console.debug('[JSON Parser] Success via strategy 2: markdown extraction');
      return result;
    } catch (markdownError) {
      if (logErrors) {
        console.debug('[JSON Parser] Markdown JSON parse failed, trying repair');
      }

      // Strategy 3: Repair extracted content and parse
      if (repair) {
        try {
          const repaired = repairJSON(extracted);
          const result = JSON.parse(repaired);
          if (logErrors) console.debug('[JSON Parser] Success via strategy 3: repair extracted content');
          return result;
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

  // Strategy 4: Extract outermost balanced JSON structure
  {
    const balanced = extractBalancedJSON(extracted || content);
    if (balanced) {
      try {
        const result = JSON.parse(balanced);
        if (logErrors) console.debug('[JSON Parser] Success via strategy 4a: balanced extraction');
        return result;
      } catch (balancedError) {
        if (repair) {
          try {
            const repaired = repairJSON(balanced);
            const result = JSON.parse(repaired);
            if (logErrors) console.debug('[JSON Parser] Success via strategy 4b: balanced extraction + repair');
            return result;
          } catch (balancedRepairError) {
            if (logErrors) {
              console.debug('[JSON Parser] Balanced extraction + repair failed');
            }
          }
        }
      }
    }
  }

  // Strategy 5: Try repair on original content
  if (repair) {
    try {
      const repaired = repairJSON(content);
      const result = JSON.parse(repaired);
      if (logErrors) console.debug('[JSON Parser] Success via strategy 5: repair original content');
      return result;
    } catch (finalError) {
      if (logErrors) {
        console.warn('[JSON Parser] Standard repair failed, trying comprehensive repair', {
          contentPreview: content.substring(0, 100),
          error: finalError.message
        });
      }
    }
  }

  // Strategy 6: Try comprehensive tokenization-based repair
  if (repair) {
    try {
      const comprehensiveRepaired = comprehensiveJSONRepair(extracted || content);
      const result = JSON.parse(comprehensiveRepaired);
      if (logErrors) console.debug('[JSON Parser] Success via strategy 6: comprehensive tokenization repair');
      return result;
    } catch (comprehensiveError) {
      if (logErrors) {
        console.warn('[JSON Parser] Comprehensive repair failed, trying aggressive quote repair', {
          error: comprehensiveError.message
        });
      }
    }
  }

  // Strategy 7: Try aggressive quote repair
  if (repair) {
    try {
      const aggressiveRepaired = aggressiveQuoteRepair(content);
      const result = JSON.parse(aggressiveRepaired);
      if (logErrors) console.debug('[JSON Parser] Success via strategy 7: aggressive quote repair');
      return result;
    } catch (aggressiveError) {
      if (logErrors) {
        console.warn('[JSON Parser] Aggressive quote repair failed', {
          error: aggressiveError.message
        });
      }
    }
  }

  // Strategy 8: Try deep JSON repair using error position feedback
  if (repair) {
    try {
      const deepRepaired = deepJSONRepair(extracted || content);
      const result = JSON.parse(deepRepaired);
      if (logErrors) console.debug('[JSON Parser] Success via strategy 8: deep JSON repair');
      return result;
    } catch (deepError) {
      if (logErrors) {
        console.warn('[JSON Parser] Deep JSON repair failed', {
          error: deepError.message
        });
      }
    }
  }

  // Strategy 9: Try to extract partial valid JSON
  const partialJSON = extractPartialValidJSON(content);
  if (partialJSON && Object.keys(partialJSON).length > 0) {
    if (logErrors) {
      console.debug('[JSON Parser] Success via strategy 9: partial JSON extraction', {
        keys: Object.keys(partialJSON).length
      });
    }
    return { ...partialJSON, _partial: true };
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
 * Extract the outermost balanced JSON structure from a string
 * Handles trailing content after valid JSON and finds the matching close bracket/brace
 * @param {string} content - String potentially containing JSON with extra content
 * @returns {string|null} Balanced JSON string or null
 */
function extractBalancedJSON(content) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Find the first { or [
  const firstBrace = content.indexOf('{');
  const firstBracket = content.indexOf('[');

  let startIndex = -1;

  if (firstBrace === -1 && firstBracket === -1) return null;

  if (firstBrace === -1) {
    startIndex = firstBracket;
  } else if (firstBracket === -1) {
    startIndex = firstBrace;
  } else if (firstBrace < firstBracket) {
    startIndex = firstBrace;
  } else {
    startIndex = firstBracket;
  }

  // Walk through and find the matching close, tracking all bracket types
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIndex; i < content.length; i++) {
    const ch = content[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{' || ch === '[') {
      depth++;
    } else if (ch === '}' || ch === ']') {
      depth--;
    }

    if (depth === 0 && i > startIndex) {
      return content.substring(startIndex, i + 1);
    }
  }

  // If we never balanced, the JSON might be truncated — return what we have
  // and let repairJSON handle closing the open structures
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

  // Step 11: Strip content after the outermost balanced closing brace/bracket
  // Handles trailing garbage after valid JSON (e.g., AI adding explanatory text)
  {
    let depth = 0;
    let inStr = false;
    let esc = false;
    let lastBalancedEnd = -1;

    for (let i = 0; i < fixed.length; i++) {
      const ch = fixed[i];
      if (esc) { esc = false; continue; }
      if (ch === '\\' && inStr) { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '{' || ch === '[') depth++;
      else if (ch === '}' || ch === ']') depth--;
      if (depth === 0 && (ch === '}' || ch === ']')) {
        lastBalancedEnd = i;
        break;
      }
    }

    if (lastBalancedEnd > 0 && lastBalancedEnd < fixed.length - 1) {
      fixed = fixed.substring(0, lastBalancedEnd + 1);
    }
  }

  // Step 12: Fix incomplete string values at the end (truncated responses)
  // Look for patterns like: "key": "incomplete value
  const incompleteStringMatch = fixed.match(/"[^"]*":\s*"[^"]*$/);
  if (incompleteStringMatch) {
    fixed += '"';
  }

  // Step 13: Count and fix missing closing brackets/braces
  // This handles truncated AI responses where the JSON was cut off mid-structure
  {
    // Remove trailing comma before adding closers
    fixed = fixed.replace(/,\s*$/, '');

    const ob = (fixed.match(/\{/g) || []).length;
    const cb = (fixed.match(/\}/g) || []).length;
    const obrk = (fixed.match(/\[/g) || []).length;
    const cbrk = (fixed.match(/\]/g) || []).length;

    for (let i = 0; i < obrk - cbrk; i++) fixed += ']';
    for (let i = 0; i < ob - cb; i++) fixed += '}';
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
 * Aggressively repair unescaped quotes in JSON string values
 * Handles cases where quotes inside string values break JSON parsing
 * @param {string} content - JSON content with potential unescaped quotes
 * @returns {string} Repaired JSON string
 */
function aggressiveQuoteRepair(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let fixed = content.trim();

  // Remove markdown code block markers
  fixed = fixed.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '');

  // State machine to track string contexts and repair quotes
  let result = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < fixed.length; i++) {
    const ch = fixed[i];

    if (escape) {
      result += ch;
      escape = false;
      continue;
    }

    if (ch === '\\') {
      result += ch;
      if (inString) {
        escape = true;
      }
      continue;
    }

    if (ch === '"') {
      if (!inString) {
        // Starting a string
        inString = true;
        result += ch;
      } else {
        // Potentially ending a string - check what follows
        // Valid endings: , } ] : or whitespace followed by one of those, or end of content
        const afterQuote = fixed.substring(i + 1).trimStart();
        const firstNonSpace = afterQuote[0];

        // Also check if the next non-whitespace after potential closing quote
        // looks like it could be a JSON key (starts a new "key": pattern)
        const looksLikeNextKey = /^"[^"]+"\s*:/.test(afterQuote);

        if (
          firstNonSpace === ',' ||
          firstNonSpace === '}' ||
          firstNonSpace === ']' ||
          firstNonSpace === ':' ||
          afterQuote === '' ||
          looksLikeNextKey
        ) {
          // This is a real closing quote
          inString = false;
          result += ch;
        } else {
          // This is an unescaped quote inside a string - escape it
          result += '\\"';
        }
      }
    } else {
      result += ch;
    }
  }

  // If still in a string at the end, close it
  if (inString) {
    result += '"';
  }

  // Apply standard repairs
  return repairJSON(result);
}

/**
 * Comprehensive tokenization-based JSON repair
 * Handles complex issues like unescaped quotes, control characters, Python constants
 * Based on techniques from jsonrepair library
 * @param {string} content - JSON content to repair
 * @returns {string} Repaired JSON string
 */
function comprehensiveJSONRepair(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let text = content.trim();

  // Remove markdown code fences
  text = text.replace(/^```json?\s*\n?/i, '').replace(/\n?\s*```$/i, '');

  // Strip any text before first { or [ and after last matching } or ]
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let startPos = -1;
  if (firstBrace === -1 && firstBracket === -1) return text;
  if (firstBrace === -1) startPos = firstBracket;
  else if (firstBracket === -1) startPos = firstBrace;
  else startPos = Math.min(firstBrace, firstBracket);

  text = text.substring(startPos);

  // Replace Python constants with JSON equivalents
  text = text.replace(/\bNone\b/g, 'null');
  text = text.replace(/\bTrue\b/g, 'true');
  text = text.replace(/\bFalse\b/g, 'false');

  // Replace special unicode quotes with regular quotes
  text = text.replace(/[\u2018\u2019\u201B]/g, "'"); // Single quotes
  text = text.replace(/[\u201C\u201D\u201F]/g, '"'); // Double quotes

  // Replace special unicode whitespace
  text = text.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ');

  // Remove ellipsis that AI sometimes adds
  text = text.replace(/\.{3,}|…/g, '');

  // Process character by character to handle complex cases
  let result = '';
  let i = 0;
  let inString = false;
  let stringQuote = '"';
  let escape = false;
  const stack = []; // Track { and [ nesting

  while (i < text.length) {
    const ch = text[i];
    const nextCh = text[i + 1] || '';

    if (escape) {
      // Handle escape sequences
      if ('"\\/bfnrtu'.includes(ch)) {
        result += ch;
      } else if (ch === '\n' || ch === '\r') {
        // Unescaped newline in string - convert to \n
        result += 'n';
        if (ch === '\r' && nextCh === '\n') i++;
      } else {
        // Invalid escape - keep the character but escape it properly
        result += ch;
      }
      escape = false;
      i++;
      continue;
    }

    if (inString) {
      if (ch === '\\') {
        result += ch;
        escape = true;
        i++;
        continue;
      }

      if (ch === stringQuote) {
        // Check if this is a valid string close
        const after = text.substring(i + 1).trimStart();
        const afterCh = after[0];

        if (
          afterCh === ',' ||
          afterCh === '}' ||
          afterCh === ']' ||
          afterCh === ':' ||
          after === '' ||
          /^"[^"]*"\s*:/.test(after) // Next key-value pair
        ) {
          // Valid close
          result += '"';
          inString = false;
        } else {
          // Unescaped quote inside string
          result += '\\"';
        }
        i++;
        continue;
      }

      // Handle unescaped control characters in strings
      if (ch === '\n' || ch === '\r' || ch === '\t') {
        if (ch === '\n') result += '\\n';
        else if (ch === '\r') result += '\\r';
        else if (ch === '\t') result += '\\t';
        i++;
        continue;
      }

      // Regular character in string
      result += ch;
      i++;
      continue;
    }

    // Not in a string
    if (ch === '"' || ch === "'") {
      inString = true;
      stringQuote = ch === "'" ? "'" : '"';
      result += '"'; // Always use double quotes
      i++;
      continue;
    }

    if (ch === '{' || ch === '[') {
      stack.push(ch);
      result += ch;
      i++;
      continue;
    }

    if (ch === '}' || ch === ']') {
      // Remove trailing comma before closer
      result = result.replace(/,\s*$/, '');
      stack.pop();
      result += ch;
      i++;
      continue;
    }

    if (ch === ',') {
      // Check for trailing comma (comma before } or ])
      const afterComma = text.substring(i + 1).trimStart();
      if (afterComma[0] === '}' || afterComma[0] === ']') {
        // Skip trailing comma
        i++;
        continue;
      }
      result += ch;
      i++;
      continue;
    }

    // Handle missing commas between values
    if (/[}\]\d]/.test(result[result.length - 1]) || result.trimEnd().endsWith('true') || result.trimEnd().endsWith('false') || result.trimEnd().endsWith('null')) {
      if (ch === '"' || ch === '{' || ch === '[' || /[a-zA-Z]/.test(ch)) {
        // Might need a comma
        const lastNonSpace = result.trimEnd().slice(-1);
        if (lastNonSpace === '}' || lastNonSpace === ']' || lastNonSpace === '"' || /\d/.test(lastNonSpace)) {
          // Check if the previous content looks like it needs a comma
          const trimmed = result.trimEnd();
          if (!trimmed.endsWith(',') && !trimmed.endsWith(':') && !trimmed.endsWith('{') && !trimmed.endsWith('[')) {
            result = result.trimEnd() + ',';
          }
        }
      }
    }

    // Handle unquoted property names
    if (/[a-zA-Z_$]/.test(ch)) {
      // Check if this looks like a property name (followed by :)
      let identifier = ch;
      let j = i + 1;
      while (j < text.length && /[a-zA-Z0-9_$]/.test(text[j])) {
        identifier += text[j];
        j++;
      }
      // Skip whitespace after identifier
      while (j < text.length && /\s/.test(text[j])) j++;

      if (text[j] === ':') {
        // This is an unquoted property name
        result += '"' + identifier + '"';
        i = j;
        continue;
      }
    }

    // Skip JS-style comments
    if (ch === '/' && nextCh === '/') {
      // Line comment
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && nextCh === '*') {
      // Block comment
      i += 2;
      while (i < text.length - 1 && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    result += ch;
    i++;
  }

  // Close unclosed string
  if (inString) {
    result += '"';
  }

  // Close unclosed brackets/braces
  while (stack.length > 0) {
    const open = stack.pop();
    result = result.replace(/,\s*$/, ''); // Remove trailing comma
    result += open === '{' ? '}' : ']';
  }

  return result;
}

/**
 * Deep repair for AI-generated JSON with complex nested structures
 * Uses error position feedback to locate and fix specific issues
 * @param {string} content - JSON content to repair
 * @returns {string} Repaired JSON string
 */
function deepJSONRepair(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let fixed = content.trim();
  fixed = fixed.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '');

  // Try to parse and use error position to fix
  let lastError = null;
  let lastErrorMsg = '';
  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    try {
      JSON.parse(fixed);
      return fixed; // Successfully parsed
    } catch (e) {
      const errorMsg = e.message;

      // Extract position from error message
      const posMatch = errorMsg.match(/position (\d+)/);
      if (!posMatch) break;

      const errorPos = parseInt(posMatch[1]);
      if (lastError === errorPos && lastErrorMsg === errorMsg) {
        // Same error - we're stuck
        break;
      }
      lastError = errorPos;
      lastErrorMsg = errorMsg;

      // Handle specific error patterns
      const isArrayElementError = errorMsg.includes("after array element");
      const isExpectedComma = errorMsg.includes("Expected ','");

      // Check context around error position
      const contextAfter = fixed.substring(errorPos, Math.min(fixed.length, errorPos + 50));
      const charAtError = fixed[errorPos] || '';

      // Strategy 1: Handle "Expected ',' or ']' after array element" errors
      if (isArrayElementError || (isExpectedComma && charAtError === '{')) {
        // Find the last complete array element by looking for } followed by { without comma
        const lookback = Math.max(0, errorPos - 100);
        const searchArea = fixed.substring(lookback, errorPos + 10);

        // Look for } followed by whitespace and then { (missing comma between objects in array)
        const missingCommaMatch = searchArea.match(/\}(\s*)(\{)/);
        if (missingCommaMatch) {
          const matchStart = lookback + searchArea.indexOf(missingCommaMatch[0]);
          fixed = fixed.substring(0, matchStart + 1) + ',' + fixed.substring(matchStart + 1);
          attempts++;
          continue;
        }

        // Check if there's an incomplete object - look for unclosed string before error
        // Find last { before error and see if it's properly closed
        let depth = 0;
        let lastObjStart = -1;
        let inStr = false;
        let esc = false;
        for (let i = errorPos - 1; i >= Math.max(0, errorPos - 500); i--) {
          if (esc) { esc = false; continue; }
          if (fixed[i] === '\\' && inStr) { esc = true; continue; }
          if (fixed[i] === '"' && !esc) { inStr = !inStr; continue; }
          if (inStr) continue;
          if (fixed[i] === '}') depth++;
          if (fixed[i] === '{') {
            if (depth === 0) {
              lastObjStart = i;
              break;
            }
            depth--;
          }
        }

        // If we found an object start, check if it needs closing
        if (lastObjStart >= 0) {
          // Scan forward from object start to find issues
          let objDepth = 0;
          let inObjStr = false;
          let objEsc = false;
          for (let i = lastObjStart; i < errorPos; i++) {
            if (objEsc) { objEsc = false; continue; }
            if (fixed[i] === '\\' && inObjStr) { objEsc = true; continue; }
            if (fixed[i] === '"') { inObjStr = !inObjStr; continue; }
            if (inObjStr) continue;
            if (fixed[i] === '{') objDepth++;
            if (fixed[i] === '}') objDepth--;
          }

          if (objDepth > 0) {
            // Object not properly closed - close it before the error position
            let insertPos = errorPos;
            // Find a good place to insert (after last complete value)
            for (let i = errorPos - 1; i >= lastObjStart; i--) {
              if (fixed[i] === '"' || fixed[i] === '}' || fixed[i] === ']' || /\d/.test(fixed[i])) {
                insertPos = i + 1;
                break;
              }
            }
            // Remove trailing comma if present
            const beforeInsert = fixed.substring(0, insertPos).trimEnd();
            if (beforeInsert.endsWith(',')) {
              fixed = beforeInsert.slice(0, -1) + '}' + fixed.substring(insertPos);
            } else {
              fixed = fixed.substring(0, insertPos) + '}' + fixed.substring(insertPos);
            }
            attempts++;
            continue;
          }
        }
      }

      // Strategy 2: Handle unescaped quotes within strings
      // Find the last string start before error position
      let stringStart = -1;
      let inStr = false;
      let esc = false;
      for (let i = 0; i < errorPos && i < fixed.length; i++) {
        if (esc) { esc = false; continue; }
        if (fixed[i] === '\\' && inStr) { esc = true; continue; }
        if (fixed[i] === '"') {
          if (!inStr) {
            stringStart = i;
            inStr = true;
          } else {
            inStr = false;
            stringStart = -1;
          }
        }
      }

      // If we're in a string and hit an error, there's likely an unescaped quote
      if (inStr && stringStart >= 0) {
        // Find the problematic quote - scan from string start
        let foundFix = false;
        for (let i = stringStart + 1; i < errorPos && i < fixed.length; i++) {
          if (fixed[i] === '\\') { i++; continue; }
          if (fixed[i] === '"') {
            // Check if this quote breaks parsing by looking ahead
            const afterThis = fixed.substring(i + 1).trimStart();
            // If next non-whitespace is NOT a valid JSON token after string close
            if (afterThis[0] && !',:}]'.includes(afterThis[0]) && !afterThis.startsWith('"')) {
              // This quote needs escaping
              fixed = fixed.substring(0, i) + '\\"' + fixed.substring(i + 1);
              foundFix = true;
              break;
            }
          }
        }
        if (foundFix) {
          attempts++;
          continue;
        }

        // If still in string at error, might need to close it
        // Check if error position has something that looks like a key
        if (/^"[^"]+"\s*:/.test(contextAfter)) {
          // Close the current string and add comma
          fixed = fixed.substring(0, errorPos) + '",' + fixed.substring(errorPos);
          attempts++;
          continue;
        }
      }

      // Strategy 3: Not in a string - might be missing comma or other issue
      if (!inStr) {
        // Check for missing comma between values
        if (charAtError === '"' || charAtError === '{' || charAtError === '[') {
          // Look back for a closing quote, }, ], number, or keyword
          let lookback = errorPos - 1;
          while (lookback >= 0 && /\s/.test(fixed[lookback])) lookback--;

          const charBefore = fixed[lookback];
          if (lookback >= 0 && (charBefore === '"' || charBefore === '}' || charBefore === ']' || /\d/.test(charBefore))) {
            // Check it's not already followed by comma
            const between = fixed.substring(lookback + 1, errorPos);
            if (!between.includes(',')) {
              fixed = fixed.substring(0, lookback + 1) + ',' + fixed.substring(lookback + 1);
              attempts++;
              continue;
            }
          }

          // Check for true/false/null before error position
          const wordBefore = fixed.substring(Math.max(0, lookback - 5), lookback + 1);
          if (/(?:true|false|null)$/.test(wordBefore)) {
            fixed = fixed.substring(0, lookback + 1) + ',' + fixed.substring(lookback + 1);
            attempts++;
            continue;
          }
        }

        // Handle extra/misplaced characters that break parsing
        if (charAtError && !'{}[]",:\n\r\t '.includes(charAtError) && !/[a-zA-Z0-9\-_.]/.test(charAtError)) {
          // Remove the problematic character
          fixed = fixed.substring(0, errorPos) + fixed.substring(errorPos + 1);
          attempts++;
          continue;
        }
      }

      attempts++;
    }
  }

  return fixed;
}

/**
 * Extract the largest valid JSON structure from content
 * Tries to parse progressively smaller portions to find valid JSON
 * Handles complex nested arrays like contentRecommendations
 * @param {string} content - Content potentially containing valid JSON subset
 * @returns {Object|null} Parsed JSON object or null
 */
function extractPartialValidJSON(content) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Clean up the content first
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '');

  // Find the first { or [
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace === -1) return null;

  // Try to find complete top-level properties and build a valid object
  const result = {};

  // Extract key-value pairs using regex
  // Match: "key": "string value" or "key": number or "key": boolean or "key": null
  const simplePatterns = [
    /"([^"]+)":\s*"([^"]*(?:\\.[^"]*)*)"/g,  // String values
    /"([^"]+)":\s*(\d+(?:\.\d+)?)/g,          // Number values
    /"([^"]+)":\s*(true|false|null)/g          // Boolean/null values
  ];

  for (const pattern of simplePatterns) {
    let match;
    pattern.lastIndex = 0; // Reset regex state
    while ((match = pattern.exec(cleaned)) !== null) {
      const key = match[1];
      let value = match[2];

      // Skip empty keys
      if (!key) continue;

      // Convert value types
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value === 'null') value = null;
      else if (/^\d+(?:\.\d+)?$/.test(value)) value = parseFloat(value);

      result[key] = value;
    }
  }

  // Try to extract nested objects - look for "key": {...} patterns
  // Uses a more sophisticated approach to find balanced braces
  const objectKeyPattern = /"([a-zA-Z_][a-zA-Z0-9_]*)":\s*\{/g;
  let objectMatch;
  while ((objectMatch = objectKeyPattern.exec(cleaned)) !== null) {
    const key = objectMatch[1];
    const startIndex = objectMatch.index + objectMatch[0].length - 1; // Position of {

    // Find the matching closing brace
    let depth = 0;
    let inStr = false;
    let esc = false;
    let endIndex = -1;

    for (let i = startIndex; i < cleaned.length; i++) {
      if (esc) { esc = false; continue; }
      if (cleaned[i] === '\\' && inStr) { esc = true; continue; }
      if (cleaned[i] === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (cleaned[i] === '{') depth++;
      else if (cleaned[i] === '}') {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex > startIndex) {
      const objectContent = cleaned.substring(startIndex, endIndex + 1);
      try {
        const parsed = JSON.parse(objectContent);
        result[key] = parsed;
      } catch {
        // If parsing fails, try repairing the object
        try {
          const repaired = repairJSON(objectContent);
          const parsed = JSON.parse(repaired);
          result[key] = parsed;
        } catch {
          // Continue without this object
        }
      }
    }
  }

  // Try to extract arrays - look for "key": [...] patterns
  // Use balanced bracket finding for complex arrays
  const arrayKeyPattern = /"([a-zA-Z_][a-zA-Z0-9_]*)":\s*\[/g;
  let arrayKeyMatch;
  while ((arrayKeyMatch = arrayKeyPattern.exec(cleaned)) !== null) {
    const key = arrayKeyMatch[1];
    const startIndex = arrayKeyMatch.index + arrayKeyMatch[0].length - 1; // Position of [

    // Find the matching closing bracket
    let depth = 0;
    let inStr = false;
    let esc = false;
    let endIndex = -1;

    for (let i = startIndex; i < cleaned.length; i++) {
      if (esc) { esc = false; continue; }
      if (cleaned[i] === '\\' && inStr) { esc = true; continue; }
      if (cleaned[i] === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (cleaned[i] === '[') depth++;
      else if (cleaned[i] === ']') {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex > startIndex) {
      const arrayContent = cleaned.substring(startIndex, endIndex + 1);
      try {
        const parsed = JSON.parse(arrayContent);
        result[key] = parsed;
      } catch {
        // Try to repair the array
        try {
          const repaired = repairJSON(arrayContent);
          const parsed = JSON.parse(repaired);
          result[key] = parsed;
        } catch {
          // Try to extract individual objects from the array
          const extractedItems = extractArrayItems(arrayContent);
          if (extractedItems.length > 0) {
            result[key] = extractedItems;
          }
        }
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Extract individual items from a potentially malformed array string
 * Handles arrays of objects like contentRecommendations
 * @param {string} arrayContent - Array content including [ and ]
 * @returns {Array} Array of extracted items
 */
function extractArrayItems(arrayContent) {
  const items = [];

  // Remove outer brackets
  let content = arrayContent.trim();
  if (content.startsWith('[')) content = content.substring(1);
  if (content.endsWith(']')) content = content.slice(0, -1);
  content = content.trim();

  if (!content) return items;

  // Find individual objects in the array
  let i = 0;
  while (i < content.length) {
    // Skip whitespace and commas
    while (i < content.length && /[\s,]/.test(content[i])) i++;
    if (i >= content.length) break;

    if (content[i] === '{') {
      // Find matching }
      let depth = 0;
      let inStr = false;
      let esc = false;
      let start = i;
      let end = -1;

      for (let j = i; j < content.length; j++) {
        if (esc) { esc = false; continue; }
        if (content[j] === '\\' && inStr) { esc = true; continue; }
        if (content[j] === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (content[j] === '{') depth++;
        else if (content[j] === '}') {
          depth--;
          if (depth === 0) {
            end = j;
            break;
          }
        }
      }

      if (end > start) {
        const objStr = content.substring(start, end + 1);
        try {
          const obj = JSON.parse(objStr);
          items.push(obj);
        } catch {
          // Try repairing the object
          try {
            const repaired = repairJSON(objStr);
            const obj = JSON.parse(repaired);
            items.push(obj);
          } catch {
            // Try extracting simple properties from this object
            const simpleObj = extractSimpleObject(objStr);
            if (simpleObj && Object.keys(simpleObj).length > 0) {
              items.push(simpleObj);
            }
          }
        }
        i = end + 1;
      } else {
        // Couldn't find end, skip this character
        i++;
      }
    } else if (content[i] === '"') {
      // String item
      let end = i + 1;
      let esc = false;
      while (end < content.length) {
        if (esc) { esc = false; end++; continue; }
        if (content[end] === '\\') { esc = true; end++; continue; }
        if (content[end] === '"') break;
        end++;
      }
      if (end < content.length) {
        try {
          const str = JSON.parse(content.substring(i, end + 1));
          items.push(str);
        } catch {
          // Skip
        }
        i = end + 1;
      } else {
        i++;
      }
    } else {
      // Number, boolean, or null
      let end = i;
      while (end < content.length && !/[\s,\]}]/.test(content[end])) end++;
      const token = content.substring(i, end);
      if (token === 'true') items.push(true);
      else if (token === 'false') items.push(false);
      else if (token === 'null') items.push(null);
      else if (/^-?\d+(\.\d+)?$/.test(token)) items.push(parseFloat(token));
      i = end;
    }
  }

  return items;
}

/**
 * Extract simple properties from a potentially malformed object string
 * @param {string} objStr - Object string including { and }
 * @returns {Object} Extracted properties
 */
function extractSimpleObject(objStr) {
  const result = {};

  // Try to match key-value pairs
  const patterns = [
    /"([^"]+)":\s*"([^"]*(?:\\.[^"]*)*)"/g,  // String values
    /"([^"]+)":\s*(\d+(?:\.\d+)?)/g,          // Number values
    /"([^"]+)":\s*(true|false|null)/g          // Boolean/null values
  ];

  for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(objStr)) !== null) {
      const key = match[1];
      let value = match[2];

      if (!key) continue;

      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value === 'null') value = null;
      else if (/^\d+(?:\.\d+)?$/.test(value)) value = parseFloat(value);

      result[key] = value;
    }
  }

  // Try to extract simple arrays (arrays of strings)
  const simpleArrayPattern = /"([^"]+)":\s*\[\s*((?:"[^"]*"(?:\s*,\s*)?)+)\s*\]/g;
  let arrMatch;
  while ((arrMatch = simpleArrayPattern.exec(objStr)) !== null) {
    const key = arrMatch[1];
    const arrContent = arrMatch[2];
    const items = [];
    const itemPattern = /"([^"]*)"/g;
    let itemMatch;
    while ((itemMatch = itemPattern.exec(arrContent)) !== null) {
      items.push(itemMatch[1]);
    }
    if (items.length > 0) {
      result[key] = items;
    }
  }

  return result;
}

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
