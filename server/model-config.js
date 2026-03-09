/**
 * Model configuration for different VerbaDeck operations
 * All models listed here support structured JSON output
 *
 * Priority: Fast, cost-effective models with reliable structured output for background tasks
 * Premium models reserved for user-facing quality-sensitive operations
 */

export const MODEL_DEFAULTS = {
  // Create from Scratch flow - uses gpt-4o-mini for quality
  generateQuestions: 'openai/gpt-4o-mini',
  generateSlideOptions: 'openai/gpt-4o-mini',
  generateSpeakerNotes: 'openai/gpt-4o-mini', // NEW: Speaker notes generation (deferred after slide selection)

  // Q&A features - optimized for INSANE SPEED with Groq (fallback to GPT-4o-mini)
  generateFAQs: 'meta-llama/llama-3.1-8b-instruct', // INSANELY FAST (950ms avg) via Groq
  answerQuestion: 'meta-llama/llama-3.1-8b-instruct', // INSANELY FAST (950ms avg) via Groq
  answerQuestionWithKeywords: 'meta-llama/llama-3.1-8b-instruct', // Know-It-All Wall Q&A (Groq primary)

  // Know It All Wall - optimized for INSANE SPEED with Groq Scout 17B
  analyzeKnowledgeBase: 'openai/gpt-4o-mini', // TEMP: Using GPT-4o-mini due to Scout rate limits
  generateContextQuestions: 'openai/gpt-4o-mini', // TEMP: Using GPT-4o-mini due to Scout rate limits
  generateFollowupQuestions: 'openai/gpt-4o-mini', // TEMP: Using GPT-4o-mini due to Scout rate limits

  // Script processing - changed to affordable quality model
  processScript: 'openai/gpt-4o-mini', // Good quality at $0.15/1M, 20s avg

  // Quick operations - mix of speed and quality
  suggestTriggers: 'meta-llama/llama-3.1-8b-instruct', // INSANELY FAST via Groq
  generateVariations: 'openai/gpt-4o-mini', // Quality for variations
  suggestImagePrompt: 'meta-llama/llama-3.1-8b-instruct', // INSANELY FAST via Groq
  generateTitles: 'openai/gpt-4o-mini', // Quality for titles
  recommendImages: 'openai/gpt-4o-mini', // Smart search query generation

  // Speaker note transformations
  expandSpeakerNotes: 'anthropic/claude-3.5-sonnet', // Quality for structured expansion
  simplifySpeakerNotes: 'openai/gpt-4o-mini', // Fast simplification
  addAnalogy: 'anthropic/claude-3.5-sonnet', // Creative analogies
  addStory: 'anthropic/claude-3.5-sonnet', // Narrative generation

  // Smart Q&A anticipation
  anticipateQuestions: 'anthropic/claude-3.5-sonnet', // Deep analysis
  generateQAAnswer: 'anthropic/claude-3.5-sonnet', // Quality answers

  // Vision tasks - needs capable multimodal model (keep haiku, under $1)
  processImages: 'anthropic/claude-3-haiku', // Fast Claude at $0.25/1M
};

/**
 * Provider routing configuration for models that need specific providers
 * Maps model IDs to their preferred provider (e.g., Groq for ultra-fast inference)
 */
export const MODEL_PROVIDER_ROUTING = {
  'meta-llama/llama-3.1-8b-instruct': 'Groq',
  'meta-llama/llama-3.3-70b-instruct': 'Groq',
  'meta-llama/llama-4-scout-17b-16e-instruct': 'Groq',
};

/**
 * Fallback models for when primary models hit rate limits
 * Maps primary model ID to fallback model ID
 */
export const MODEL_FALLBACKS = {
  'meta-llama/llama-3.1-8b-instruct': 'openai/gpt-4o-mini', // Groq → GPT-4o-mini
  'meta-llama/llama-3.3-70b-instruct': 'openai/gpt-4o-mini',
  'meta-llama/llama-4-scout-17b-16e-instruct': 'openai/gpt-4o-mini',
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
 * ONLY MODELS UNDER $1/1M TOKENS
 */
export const STRUCTURED_OUTPUT_MODELS = [
  // OpenAI models with native JSON mode (under $1)
  'openai/gpt-4o-mini', // $0.15 input, $0.60 output
  'openai/gpt-3.5-turbo', // $0.50 input, $1.50 output
  'openai/gpt-oss-20b', // $0.00008 input, $0.0003 output
  'openai/gpt-oss-safeguard-20b',

  // Anthropic models (via JSON prompting, under $1)
  'anthropic/claude-3-haiku', // $0.25 input, $1.25 output

  // Google Gemini (under $1)
  'google/gemini-flash-1.5',

  // Qwen - CHEAP & GOOD
  'qwen/qwen-2.5-7b-instruct', // $0.09 input/output
  'qwen/qwen-2.5-72b-instruct', // $0.35 input/output

  // Meta Llama (via Groq for ultra-fast inference)
  'meta-llama/llama-3.1-8b-instruct', // $0.05 input, $0.08 output
  'meta-llama/llama-3.3-70b-instruct', // $0.59 input, $0.79 output
  'meta-llama/llama-4-scout-17b-16e-instruct', // $0.11 input, $0.34 output (Groq)
  'meta-llama/llama-4-scout:free', // Free version (slower)
  'meta-llama/llama-3.1-70b-instruct', // $0.35 input, $0.40 output

  // Free Models (verified working)
  'nvidia/nemotron-nano-12b-v2-vl:free',

  // Perplexity (Llama-based, under $1)
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

/**
 * Get provider routing configuration for a model (if any)
 * @param {string} modelId - Model ID
 * @returns {object|null} Provider routing config or null
 */
export function getProviderRouting(modelId) {
  const provider = MODEL_PROVIDER_ROUTING[modelId];
  if (provider) {
    return {
      provider: {
        order: [provider],
        allow_fallbacks: true  // Enable fallbacks to handle rate limits gracefully
      }
    };
  }
  return null;
}

/**
 * Get fallback model for a primary model (if any)
 * @param {string} modelId - Primary model ID
 * @returns {string|null} Fallback model ID or null
 */
export function getFallbackModel(modelId) {
  return MODEL_FALLBACKS[modelId] || null;
}
