import { createTokenPattern } from './script-parser';
import type { Section } from './script-parser';

/**
 * VoiceController - Centralized voice control logic for VerbaDeck
 *
 * Handles all transcript detection:
 * - Trigger word detection for section advancement
 * - Back command detection for navigation
 * - Question detection for Q&A mode
 * - Cancel word detection for Q&A cancellation
 */
export class VoiceController {
  private lastNavTime: number = 0;
  private readonly NAV_DEBOUNCE_MS = 2000;

  /**
   * Detect if transcript contains a back command
   * Uses word boundary regex to prevent false positives like "feedback"
   *
   * @param transcript - The transcript text to check
   * @returns true if back command detected
   */
  detectBackCommand(transcript: string): boolean {
    const lowerText = transcript.toLowerCase();
    const backPattern = /\b(back|previous|go\s+back)\b/i;
    return backPattern.test(lowerText);
  }

  /**
   * Detect trigger words in transcript and return next section index
   *
   * @param transcript - The transcript text to check
   * @param currentSection - Current section with triggers
   * @param currentSectionIndex - Current section index
   * @returns next section index if trigger detected, null otherwise
   */
  detectTriggerWords(
    transcript: string,
    currentSection: Section,
    currentSectionIndex: number
  ): number | null {
    const lowerText = transcript.toLowerCase();

    // Get all active triggers (selectedTriggers or fallback to primary)
    const triggers = currentSection.selectedTriggers && currentSection.selectedTriggers.length > 0
      ? currentSection.selectedTriggers
      : [currentSection.advanceToken];

    console.log(`🔍 Section ${currentSectionIndex + 1} - Looking for triggers:`, triggers);
    console.log(`   Transcript: "${lowerText}"`);

    // Check all selected triggers
    for (const trigger of triggers) {
      const pattern = createTokenPattern(trigger);
      console.log(`   Testing "${trigger}" with pattern ${pattern} against "${lowerText}"`);

      if (pattern.test(lowerText)) {
        console.log(`✅ Trigger word matched: "${trigger}"`);
        return currentSectionIndex + 1;
      } else {
        console.log(`   ❌ No match`);
      }
    }

    return null;
  }

  /**
   * Detect questions in transcript (contains '?')
   * Only detects on final transcripts
   *
   * @param transcript - The transcript text to check
   * @param isFinal - Whether this is a final transcript
   * @returns detected question or null
   */
  detectQuestion(transcript: string, isFinal: boolean): string | null {
    if (isFinal && transcript.includes('?')) {
      console.log('❓ Question detected:', transcript);
      return transcript;
    }
    return null;
  }

  /**
   * Detect cancel words in transcript
   * Supports multiple comma-separated cancel words
   *
   * @param transcript - The transcript text to check
   * @param cancelWord - Comma-separated cancel words
   * @returns true if cancel word detected
   */
  detectCancelWord(transcript: string, cancelWord: string): boolean {
    if (!cancelWord) return false;

    const lowerText = transcript.toLowerCase();
    const cancelWords = cancelWord
      .split(',')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);

    for (const word of cancelWords) {
      if (lowerText.includes(word)) {
        console.log(`🛑 Cancel word detected: "${word}"`);
        return true;
      }
    }

    return false;
  }

  /**
   * Check if navigation is debounced (too soon after last nav)
   *
   * @returns true if debounced (should skip navigation)
   */
  isDebounced(): boolean {
    const now = Date.now();
    if (now - this.lastNavTime < this.NAV_DEBOUNCE_MS) {
      console.log('⏱️ Debounced navigation (too soon)');
      return true;
    }
    return false;
  }

  /**
   * Record navigation time for debouncing
   */
  recordNavigation(): void {
    this.lastNavTime = Date.now();
  }

  /**
   * Reset debounce timer (useful for testing)
   */
  resetDebounce(): void {
    this.lastNavTime = 0;
  }
}
