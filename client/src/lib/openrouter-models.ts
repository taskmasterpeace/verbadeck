/**
 * OpenRouter model definitions and categories
 * All models listed support structured JSON output
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
  capabilities: {
    reasoning: boolean;      // Advanced reasoning capabilities (e.g., o1, o3)
    internet: boolean;       // Real-time internet access
    structured_output: boolean; // JSON mode support
    speed: 'fast' | 'standard' | 'slow'; // Relative speed
  };
  top_provider?: string;
}

export interface ModelCategory {
  name: string;
  description: string;
  models: string[]; // Model IDs
}

/**
 * Curated list of models with structured output support for VerbaDeck
 * All models listed support JSON mode which is required for Q&A and script processing
 */
export const RECOMMENDED_MODELS: Model[] = [
  // Reasoning Models
  {
    id: 'openai/o1',
    name: 'OpenAI o1',
    description: 'Advanced reasoning - best for complex analysis',
    context_length: 128000,
    pricing: { prompt: '$15.00', completion: '$60.00' },
    capabilities: { reasoning: true, internet: false, structured_output: true, speed: 'slow' },
  },
  {
    id: 'openai/o1-mini',
    name: 'OpenAI o1-mini',
    description: 'Faster reasoning model - good balance',
    context_length: 128000,
    pricing: { prompt: '$3.00', completion: '$12.00' },
    capabilities: { reasoning: true, internet: false, structured_output: true, speed: 'standard' },
  },

  // Internet-Enabled Models
  {
    id: 'perplexity/llama-3.1-sonar-large-128k-online',
    name: 'Perplexity Sonar Large (Online)',
    description: 'Real-time internet access - great for current info',
    context_length: 127072,
    pricing: { prompt: '$1.00', completion: '$1.00' },
    capabilities: { reasoning: false, internet: true, structured_output: true, speed: 'standard' },
  },
  {
    id: 'perplexity/llama-3.1-sonar-small-128k-online',
    name: 'Perplexity Sonar Small (Online)',
    description: 'Fast internet-enabled model',
    context_length: 127072,
    pricing: { prompt: '$0.20', completion: '$0.20' },
    capabilities: { reasoning: false, internet: true, structured_output: true, speed: 'fast' },
  },

  // Standard High-Quality Models
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Best overall - fast, accurate, great for script processing',
    context_length: 200000,
    pricing: { prompt: '$3.00', completion: '$15.00' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'fast' },
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'OpenAI flagship - excellent quality',
    context_length: 128000,
    pricing: { prompt: '$10.00', completion: '$30.00' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'standard' },
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Latest GPT-4 - fast and capable',
    context_length: 128000,
    pricing: { prompt: '$2.50', completion: '$10.00' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'fast' },
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'Google\'s latest - huge context window',
    context_length: 2000000,
    pricing: { prompt: '$1.25', completion: '$5.00' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'standard' },
  },

  // Fast Models
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Excellent for structured output - fast and cost-effective',
    context_length: 128000,
    pricing: { prompt: '$0.15', completion: '$0.60' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'fast' },
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fastest Claude model - good for quick processing',
    context_length: 200000,
    pricing: { prompt: '$0.25', completion: '$1.25' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'fast' },
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Cost-effective and very fast',
    context_length: 16385,
    pricing: { prompt: '$0.50', completion: '$1.50' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'fast' },
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Open source - fast and good quality',
    context_length: 131072,
    pricing: { prompt: '$0.35', completion: '$0.40' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'fast' },
  },
];

export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    name: 'Reasoning',
    description: 'Advanced reasoning capabilities for complex analysis',
    models: [
      'openai/o1',
      'openai/o1-mini',
    ],
  },
  {
    name: 'Internet',
    description: 'Real-time internet access for current information',
    models: [
      'perplexity/llama-3.1-sonar-large-128k-online',
      'perplexity/llama-3.1-sonar-small-128k-online',
    ],
  },
  {
    name: 'Standard',
    description: 'High-quality general purpose models',
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4-turbo',
      'openai/gpt-4o',
      'google/gemini-pro-1.5',
    ],
  },
  {
    name: 'Fast',
    description: 'Optimized for speed and cost-effectiveness',
    models: [
      'openai/gpt-4o-mini',
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
      'meta-llama/llama-3.1-70b-instruct',
      'perplexity/llama-3.1-sonar-small-128k-online',
    ],
  },
  {
    name: 'Recommended',
    description: 'Best overall models for VerbaDeck',
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'anthropic/claude-3-haiku',
    ],
  },
];

export function getModelById(id: string): Model | undefined {
  return RECOMMENDED_MODELS.find((m) => m.id === id);
}

export function getDefaultModel(): Model {
  return RECOMMENDED_MODELS[0]; // Claude 3.5 Sonnet
}
