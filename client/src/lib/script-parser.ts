export interface Section {
  id: string;
  content: string;
  advanceToken: string;
  alternativeTriggers?: string[]; // AI-suggested alternative trigger words
  selectedTriggers?: string[]; // User-selected trigger words (for multi-trigger support)
  imageUrl?: string; // Optional image URL for PowerPoint-style slides
}

/**
 * Normalize word to match token (lowercase, no punctuation)
 * This is what we'll use for matching against transcripts
 */
export function normalizeToken(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Create a regex pattern that matches the token with simple suffix tolerance
 * Handles plural forms: moment/moments, opportunity/opportunities
 */
export function createTokenPattern(token: string): RegExp {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match exact token with optional s/es/ies suffix, with word boundaries
  return new RegExp(`\\b${escaped}(s|es|ies)?\\b`, 'i');
}
