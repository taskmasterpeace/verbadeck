/**
 * JSON Parser Utility
 * Handles AI response parsing with fallbacks for code blocks and raw JSON
 */

/**
 * Parse AI-generated JSON responses with multiple fallback strategies
 *
 * Tries in order:
 * 1. Direct JSON.parse (for clean JSON responses)
 * 2. Extract from markdown code blocks (```json ... ```)
 * 3. Extract first JSON object/array from response
 *
 * @param {string} content - Raw AI response content
 * @returns {any} Parsed JSON object or array
 * @throws {Error} If no valid JSON found in response
 */
export function parseAIResponse(content) {
  // Strategy 1: Try direct JSON parse
  try {
    return JSON.parse(content);
  } catch (e) {
    // Continue to fallback strategies
  }

  // Strategy 2: Try extracting from markdown code block
  // Matches: ```json\n{...}\n``` or ```{...}```
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      // Continue to next strategy
    }
  }

  // Strategy 3: Try extracting first JSON object or array
  // Looks for first { or [ and finds matching closing bracket
  const objectMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[1]);
    } catch (e) {
      // Final attempt failed
    }
  }

  // All strategies failed
  throw new Error('No valid JSON found in AI response');
}
