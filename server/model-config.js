/**
 * Model configuration for different VerbaDeck operations
 * All models listed here support structured JSON output
 *
 * Priority: Fast, cost-effective models with reliable structured output for background tasks
 * Premium models reserved for user-facing quality-sensitive operations
 */

export const MODEL_DEFAULTS = {
  // Create from Scratch flow - uses gpt-4o-mini for speed and cost
  generateQuestions: 'openai/gpt-4o-mini',
  generateSlideOptions: 'openai/gpt-4o-mini',

  // Q&A features - balanced between quality and cost
  generateFAQs: 'openai/gpt-4o-mini',
  answerQuestion: 'anthropic/claude-3.5-sonnet', // Higher quality for live Q&A

  // Script processing - user's primary work, deserves quality
  processScript: 'anthropic/claude-3.5-sonnet',

  // Quick operations - gpt-4o-mini for speed
  suggestTriggers: 'openai/gpt-4o-mini',
  generateVariations: 'openai/gpt-4o-mini',
  suggestImagePrompt: 'openai/gpt-4o-mini', // Fast, creative prompt generation

  // Vision tasks - needs capable multimodal model
  processImages: 'anthropic/claude-3.5-sonnet',
};

/**
 * Get the default model for a specific operation
 * @param {string} operation - Operation name (e.g., 'generateQuestions')
 * @param {string} userModel - User-provided model override (optional)
 * @returns {string} Model ID to use
 */
export function getModelForOperation(operation, userModel = null) {
  // If user specifies a model, always use it
  if (userModel) {
    return userModel;
  }

  // Otherwise, use operation-specific default
  return MODEL_DEFAULTS[operation] || MODEL_DEFAULTS.processScript;
}

/**
 * Models that support structured output (JSON mode)
 * Used for validation
 */
export const STRUCTURED_OUTPUT_MODELS = [
  // OpenAI models with native JSON mode
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'openai/gpt-4-turbo',
  'openai/gpt-3.5-turbo',
  'openai/o1',
  'openai/o1-mini',

  // Anthropic models (via JSON prompting)
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-opus',
  'anthropic/claude-3-haiku',

  // Google Gemini
  'google/gemini-pro-1.5',
  'google/gemini-flash-1.5',

  // Meta Llama
  'meta-llama/llama-3.1-70b-instruct',
  'meta-llama/llama-3.1-405b-instruct',

  // Perplexity (Llama-based)
  'perplexity/llama-3.1-sonar-large-128k-online',
  'perplexity/llama-3.1-sonar-small-128k-online',
];

/**
 * Validate if a model supports structured output
 * @param {string} modelId - Model ID to check
 * @returns {boolean} True if model supports structured output
 */
export function supportsStructuredOutput(modelId) {
  return STRUCTURED_OUTPUT_MODELS.some(model =>
    modelId.includes(model) || model.includes(modelId)
  );
}
