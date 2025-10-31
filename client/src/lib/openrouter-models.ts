/**
 * OpenRouter model definitions and categories
 */

export interface Model {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: string;
}

export interface ModelCategory {
  name: string;
  description: string;
  models: string[]; // Model IDs
}

/**
 * Curated list of popular models for VerbaDeck
 * Full list can be fetched from API, but these are recommended
 */
export const RECOMMENDED_MODELS: Model[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Best overall - fast, accurate, great for script processing',
    context_length: 200000,
    pricing: { prompt: '$3.00', completion: '$15.00' },
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fastest Claude model - good for quick processing',
    context_length: 200000,
    pricing: { prompt: '$0.25', completion: '$1.25' },
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'OpenAI flagship - excellent quality',
    context_length: 128000,
    pricing: { prompt: '$10.00', completion: '$30.00' },
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Cost-effective and fast',
    context_length: 16385,
    pricing: { prompt: '$0.50', completion: '$1.50' },
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Open source - good quality',
    context_length: 131072,
    pricing: { prompt: '$0.35', completion: '$0.40' },
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'Google\'s latest - huge context window',
    context_length: 2000000,
    pricing: { prompt: '$1.25', completion: '$5.00' },
  },
];

export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    name: 'Recommended',
    description: 'Best models for script processing',
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4-turbo',
      'anthropic/claude-3-haiku',
    ],
  },
  {
    name: 'Cost-Effective',
    description: 'Budget-friendly options',
    models: [
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
      'meta-llama/llama-3.1-70b-instruct',
    ],
  },
  {
    name: 'Premium',
    description: 'Highest quality models',
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4-turbo',
      'google/gemini-pro-1.5',
    ],
  },
];

export function getModelById(id: string): Model | undefined {
  return RECOMMENDED_MODELS.find((m) => m.id === id);
}

export function getDefaultModel(): Model {
  return RECOMMENDED_MODELS[0]; // Claude 3.5 Sonnet
}
