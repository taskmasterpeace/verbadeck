export interface ModelConfig {
  [operation: string]: string;
}

// Default models from server config (must match server/model-config.js)
export const SERVER_DEFAULTS: ModelConfig = {
  // Create from Scratch flow
  generateQuestions: 'openai/gpt-4o-mini',
  generateSlideOptions: 'openai/gpt-4o-mini',
  generateSpeakerNotes: 'openai/gpt-4o-mini',

  // Q&A features - optimized for INSANE SPEED with Groq
  generateFAQs: 'meta-llama/llama-3.1-8b-instruct', // GROQ - INSANELY FAST
  answerQuestion: 'meta-llama/llama-3.1-8b-instruct', // GROQ - INSANELY FAST

  // Know It All Wall - TEMP: Using GPT-4o-mini due to Scout rate limits
  analyzeKnowledgeBase: 'openai/gpt-4o-mini', // TEMP: Rate limits on Scout
  generateContextQuestions: 'openai/gpt-4o-mini', // TEMP: Rate limits on Scout
  generateFollowupQuestions: 'openai/gpt-4o-mini', // TEMP: Rate limits on Scout

  // Script processing
  processScript: 'openai/gpt-4o-mini',

  // Quick operations
  suggestTriggers: 'meta-llama/llama-3.1-8b-instruct', // GROQ - INSANELY FAST
  generateVariations: 'openai/gpt-4o-mini',
  suggestImagePrompt: 'meta-llama/llama-3.1-8b-instruct', // GROQ - INSANELY FAST
  generateTitles: 'openai/gpt-4o-mini',

  // Vision tasks
  processImages: 'anthropic/claude-3-haiku',
};
