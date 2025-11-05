export type SlideLayout = 'balanced' | 'image-focus' | 'text-focus' | 'image-top' | 'image-bottom';

export interface Section {
  id: string;
  heading?: string; // Optional slide heading/title (3-7 words)
  content: string;
  advanceToken: string;
  alternativeTriggers?: string[]; // AI-suggested alternative trigger words
  selectedTriggers?: string[]; // User-selected trigger words (for multi-trigger support)
  imageUrl?: string; // Optional image URL for PowerPoint-style slides
  speakerNotes?: string; // Optional speaker notes - what to say vs what audience sees
  imageOnly?: boolean; // If true, only display image (no text) to audience
  layout?: SlideLayout; // Layout style for the slide (auto-detected or user-selected)
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

/**
 * Auto-detect optimal slide layout based on image aspect ratio
 * @param aspectRatio - The aspect ratio string (e.g., "16:9", "1:1", "9:16")
 * @returns The optimal SlideLayout for this aspect ratio
 */
export function detectOptimalLayout(aspectRatio: string): SlideLayout {
  const [width, height] = aspectRatio.split(':').map(Number);
  const ratio = width / height;

  // Wide images (landscape) - great for top placement
  if (ratio >= 1.5) {
    return 'image-top'; // 16:9, 21:9, etc.
  }

  // Square-ish images - balanced side-by-side works well
  if (ratio >= 0.8 && ratio <= 1.2) {
    return 'balanced'; // 1:1, 4:5, etc.
  }

  // Tall images (portrait) - balanced side-by-side
  if (ratio < 0.8) {
    return 'balanced'; // 9:16, 2:3, etc.
  }

  // Default fallback
  return 'balanced';
}

/**
 * Smart aspect ratio selection for bulk image generation
 * Creates visual variety while maintaining professional consistency
 *
 * Strategy:
 * - Intro/conclusion slides: Wide format (16:9) for impact
 * - Content-heavy slides: Square (1:1) for balanced text/image
 * - Short content: Tall format (9:16) for dramatic vertical images
 * - Creates alternating pattern to avoid monotony
 *
 * @param section - The section to generate an image for
 * @param sectionIndex - Position in the presentation (0-based)
 * @param totalSections - Total number of sections
 * @returns Optimal aspect ratio string (e.g., "16:9")
 */
export function selectAspectRatioForSection(
  section: Section,
  sectionIndex: number,
  totalSections: number
): string {
  // First slide: Use wide format for strong opening
  if (sectionIndex === 0) {
    return '16:9';
  }

  // Last slide: Use wide format for strong closing
  if (sectionIndex === totalSections - 1) {
    return '16:9';
  }

  // Content length analysis
  const contentLength = section.content.length;
  const hasLongContent = contentLength > 150;
  const hasShortContent = contentLength < 80;

  // Position-based pattern (creates rhythm through presentation)
  const positionMod = sectionIndex % 3;

  // Short content → Tall images work great (9:16)
  if (hasShortContent) {
    return '9:16';
  }

  // Long content → Square for better balance (1:1)
  if (hasLongContent) {
    return '1:1';
  }

  // Medium content → Cycle through formats for variety
  switch (positionMod) {
    case 0:
      return '16:9'; // Wide - dramatic, cinematic
    case 1:
      return '1:1';  // Square - balanced, classic
    case 2:
      return '4:5';  // Slightly tall - modern, engaging
    default:
      return '1:1';
  }
}
