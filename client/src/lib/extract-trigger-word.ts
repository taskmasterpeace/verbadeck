/**
 * Extract the largest meaningful word from a question to use as a trigger
 * Filters out common question words and short words
 */

const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'can', 'may', 'might', 'must', 'shall',
  'what', 'when', 'where', 'who', 'why', 'how', 'which', 'whose',
  'this', 'that', 'these', 'those',
  'you', 'your', 'he', 'she', 'it', 'we', 'they', 'him', 'her', 'us', 'them',
  'my', 'his', 'its', 'our', 'their',
  'for', 'with', 'about', 'from', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'under', 'over',
  'and', 'or', 'but', 'if', 'than', 'because', 'as', 'until', 'while',
  'of', 'at', 'by', 'to', 'in', 'on',
  'tell', 'me', 'please', 'give', 'describe', 'explain'
]);

export function extractTriggerWord(question: string): string {
  // Remove question mark and lowercase
  const cleaned = question.replace(/[?.,!]/g, '').toLowerCase();

  // Split into words
  const words = cleaned.split(/\s+/);

  // Filter and sort by length
  const meaningfulWords = words
    .filter(word =>
      word.length > 3 && // Minimum 4 characters
      !COMMON_WORDS.has(word) &&
      /^[a-z]+$/.test(word) // Only letters
    )
    .sort((a, b) => b.length - a.length); // Longest first

  // Return longest meaningful word, or fallback to first non-common word
  return meaningfulWords[0] || words.find(w => !COMMON_WORDS.has(w)) || 'question';
}
