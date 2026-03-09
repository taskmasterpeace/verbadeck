/**
 * OpenRouter model definitions and categories
 * All models listed support structured JSON output
 * Updated with real timing data from production logs
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
    reasoning: boolean;      // Advanced reasoning capabilities
    internet: boolean;       // Real-time internet access
    structured_output: boolean; // JSON mode support (ALL models must have this)
    speed: 'ultra-fast' | 'fast' | 'standard' | 'slow'; // Relative speed
  };
  primaryCapability: 'ultra-fast' | 'fast' | 'reasoning' | 'free' | 'internet' | 'standard'; // Main icon to display
  speedRank: 0 | 1 | 2 | 3;     // Speed ranking: 3 = ultra-fast (<1s), 2 = fast (1-3s), 1 = standard (3-6s), 0 = slow (>6s)
  category: string;          // Primary category for display
  expectedResponseTime: number; // Expected response time in milliseconds (REAL DATA from timing logs)
  top_provider?: string;      // Preferred provider (e.g., 'Groq') - forces provider routing
}

export interface ModelCategory {
  name: string;
  description: string;
  models: string[]; // Model IDs
}

/**
 * Curated list of models with structured output support for VerbaDeck
 * All models listed support JSON mode which is required for Q&A and script processing
 * ONLY MODELS UNDER $1/1M TOKENS
 */
export const RECOMMENDED_MODELS: Model[] = [
  // Ultra-Fast Models (< 2s) - GROQ POWERED
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B (Groq)',
    description: 'INSANELY FAST - Groq LPU hardware (960ms avg)',
    context_length: 131072,
    pricing: { prompt: '$0.05', completion: '$0.08' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'ultra-fast' },
    primaryCapability: 'ultra-fast',
    speedRank: 3,
    category: 'Ultra-Fast',
    expectedResponseTime: 1200, // Real data: 674ms-1211ms, avg 950ms, using P95
    top_provider: 'Groq',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B (Groq)',
    description: 'BLAZING FAST - Groq LPU hardware, larger model',
    context_length: 131072,
    pricing: { prompt: '$0.59', completion: '$0.79' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'ultra-fast' },
    primaryCapability: 'ultra-fast',
    speedRank: 3,
    category: 'Ultra-Fast',
    expectedResponseTime: 1500, // Estimated based on 70B size
    top_provider: 'Groq',
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B (Groq)',
    description: 'ULTRA-FAST - Latest Llama 4 MoE on Groq LPU (1433ms avg)',
    context_length: 10000000, // 10M context
    pricing: { prompt: '$0.11', completion: '$0.34' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'ultra-fast' },
    primaryCapability: 'ultra-fast',
    speedRank: 3,
    category: 'Ultra-Fast',
    expectedResponseTime: 1600, // Real data: 1083ms-1613ms, avg 1433ms, using P95
    top_provider: 'Groq',
  },


  // Qwen Models - CHEAP & GOOD
  {
    id: 'qwen/qwen-2.5-7b-instruct',
    name: 'Qwen 2.5 7B',
    description: 'CHEAP - Excellent quality for price ($0.09/1M)',
    context_length: 131072,
    pricing: { prompt: '$0.09', completion: '$0.09' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'standard' },
    primaryCapability: 'standard',
    speedRank: 1,
    category: 'Budget',
    expectedResponseTime: 4000, // Real data: 3709-4090ms, avg 3900ms
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    description: 'BEST VALUE - High quality, low cost ($0.35/1M)',
    context_length: 131072,
    pricing: { prompt: '$0.35', completion: '$0.35' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'standard' },
    primaryCapability: 'standard',
    speedRank: 1,
    category: 'Budget',
    expectedResponseTime: 4000, // Estimated based on 72B size
  },

  // Fast Models (1-7s)
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    description: 'Fast open-weight MoE (5317ms avg)',
    context_length: 128000,
    pricing: { prompt: '$0.00008', completion: '$0.0003' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'fast' },
    primaryCapability: 'fast',
    speedRank: 2,
    category: 'Fast',
    expectedResponseTime: 7000, // Real data: 4141ms-6927ms, avg 5317ms, using P95
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fastest Claude (4722ms avg)',
    context_length: 200000,
    pricing: { prompt: '$0.25', completion: '$1.25' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'fast' },
    primaryCapability: 'fast',
    speedRank: 2,
    category: 'Fast',
    expectedResponseTime: 5600, // Real data: 3889ms-5591ms, avg 4722ms, using P95
  },

  // Standard Speed Models (3-20s)
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Good for structured output (processScript: 19s, titles: 1.5s)',
    context_length: 128000,
    pricing: { prompt: '$0.15', completion: '$0.60' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'standard' },
    primaryCapability: 'standard',
    speedRank: 1,
    category: 'Standard',
    expectedResponseTime: 20000, // Real data: 15302ms-23977ms for script processing
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Open source - decent quality, low cost',
    context_length: 131072,
    pricing: { prompt: '$0.35', completion: '$0.40' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'standard' },
    primaryCapability: 'standard',
    speedRank: 1,
    category: 'Standard',
    expectedResponseTime: 4800, // Original estimate, no real data yet
  },

  // Free Models
  {
    id: 'nvidia/nemotron-nano-12b-v2-vl:free',
    name: 'NVIDIA Nemotron Nano 12B (Free)',
    description: 'Free vision-language model',
    context_length: 32768,
    pricing: { prompt: 'Free', completion: 'Free' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'standard' },
    primaryCapability: 'free',
    speedRank: 1,
    category: 'Free',
    expectedResponseTime: 5700, // Original estimate
  },
  {
    id: 'meta-llama/llama-4-scout:free',
    name: 'Llama 4 Scout (Free)',
    description: 'FREE - Latest Llama 4, no Groq LPU',
    context_length: 10000000,
    pricing: { prompt: 'Free', completion: 'Free' },
    capabilities: { reasoning: false, internet: false, structured_output: true, speed: 'fast' },
    primaryCapability: 'free',
    speedRank: 2,
    category: 'Free',
    expectedResponseTime: 5000, // Real data: 4771-4963ms, avg 4867ms
  },
];

export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    name: 'Recommended',
    description: 'Best overall models for VerbaDeck',
    models: [
      'meta-llama/llama-3.1-8b-instruct',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'qwen/qwen-2.5-72b-instruct',
      'openai/gpt-4o-mini',
    ],
  },
  {
    name: 'Ultra-Fast',
    description: 'Groq LPU powered - insanely fast (< 2s)',
    models: [
      'meta-llama/llama-3.1-8b-instruct',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'meta-llama/llama-3.3-70b-instruct',
    ],
  },
  {
    name: 'Fast',
    description: 'Optimized for speed (1-7s)',
    models: [
      'meta-llama/llama-4-scout:free',
      'qwen/qwen-2.5-7b-instruct',
      'openai/gpt-oss-20b',
      'anthropic/claude-3-haiku',
    ],
  },
  {
    name: 'Budget',
    description: 'Best quality per dollar',
    models: [
      'qwen/qwen-2.5-72b-instruct',
      'qwen/qwen-2.5-7b-instruct',
      'meta-llama/llama-3.1-70b-instruct',
      'meta-llama/llama-3.1-8b-instruct',
    ],
  },
  {
    name: 'Standard',
    description: 'High-quality general purpose models',
    models: [
      'openai/gpt-4o-mini',
      'qwen/qwen-2.5-72b-instruct',
      'meta-llama/llama-3.1-70b-instruct',
      'anthropic/claude-3-haiku',
    ],
  },
  {
    name: 'Free',
    description: 'Completely free models',
    models: [
      'meta-llama/llama-4-scout:free',
      'nvidia/nemotron-nano-12b-v2-vl:free',
    ],
  },
];

export function getModelById(id: string): Model | undefined {
  return RECOMMENDED_MODELS.find((m) => m.id === id);
}

export function getDefaultModel(): Model {
  return RECOMMENDED_MODELS[0]; // Llama 3.1 8B (Groq)
}
