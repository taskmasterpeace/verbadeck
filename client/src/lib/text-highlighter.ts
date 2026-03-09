/**
 * Text Highlighter Utility
 * Identifies keywords within text and returns segments for inline highlighting
 */

export interface TextSegment {
  text: string;
  isKeyword: boolean;
  keyword?: string; // The actual keyword that matched (for tracking)
}

/**
 * Parse text and identify keyword occurrences
 * @param text - The text to parse
 * @param keywords - Array of keywords to highlight
 * @returns Array of text segments with keyword markers
 */
export function parseTextWithKeywords(
  text: string,
  keywords: string[]
): TextSegment[] {
  if (!text || keywords.length === 0) {
    return [{ text, isKeyword: false }];
  }

  // Normalize keywords (lowercase, trim)
  const normalizedKeywords = keywords
    .filter(k => k && k.trim().length > 0)
    .map(k => k.toLowerCase().trim());

  if (normalizedKeywords.length === 0) {
    return [{ text, isKeyword: false }];
  }

  // Create regex pattern that matches any keyword with word boundaries
  // Sort by length (longest first) to match longer phrases before shorter ones
  const sortedKeywords = [...normalizedKeywords].sort((a, b) => b.length - a.length);
  const pattern = sortedKeywords
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape regex special chars
    .join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add non-keyword text before this match
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        isKeyword: false,
      });
    }

    // Add the keyword match
    segments.push({
      text: match[0],
      isKeyword: true,
      keyword: match[0].toLowerCase(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining non-keyword text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isKeyword: false,
    });
  }

  return segments.length > 0 ? segments : [{ text, isKeyword: false }];
}

/**
 * Check if a keyword is detected in a list of detected keywords
 * @param keyword - The keyword to check
 * @param detectedKeywords - Array of detected keywords (normalized)
 * @returns True if the keyword has been detected
 */
export function isKeywordDetected(
  keyword: string,
  detectedKeywords: string[]
): boolean {
  const normalized = keyword.toLowerCase().trim();
  return detectedKeywords.some(dk => dk.toLowerCase().trim() === normalized);
}
