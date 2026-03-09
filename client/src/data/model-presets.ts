import type { ModelConfig } from './server-defaults';

export interface Preset {
  id: string;
  name: string;
  iconName: 'Zap' | 'Scale' | 'Gem' | 'DollarSign';
  description: string;
  color: string;
  hoverColor: string;
  models: ModelConfig;
}

export const PRESETS: Preset[] = [
  {
    id: 'maximum-speed',
    name: 'Maximum Speed',
    iconName: 'Zap',
    description: 'Ultra-fast Groq Llama models for all operations (~438ms avg)',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    hoverColor: 'hover:bg-yellow-200',
    models: {
      generateQuestions: 'meta-llama/llama-3.1-8b-instruct',
      generateSlideOptions: 'meta-llama/llama-3.1-8b-instruct',
      generateSpeakerNotes: 'meta-llama/llama-3.1-8b-instruct',
      generateFAQs: 'meta-llama/llama-3.1-8b-instruct',
      answerQuestion: 'meta-llama/llama-3.1-8b-instruct',
      analyzeKnowledgeBase: 'meta-llama/llama-3.1-8b-instruct',
      generateContextQuestions: 'meta-llama/llama-3.1-8b-instruct',
      generateFollowupQuestions: 'meta-llama/llama-3.1-8b-instruct',
      processScript: 'meta-llama/llama-3.1-8b-instruct',
      suggestTriggers: 'meta-llama/llama-3.1-8b-instruct',
      generateVariations: 'meta-llama/llama-3.1-8b-instruct',
      suggestImagePrompt: 'meta-llama/llama-3.1-8b-instruct',
      generateTitles: 'meta-llama/llama-3.1-8b-instruct',
      processImages: 'meta-llama/llama-3.1-8b-instruct',
    }
  },
  {
    id: 'balanced',
    name: 'Balanced',
    iconName: 'Scale',
    description: 'Optimal mix of speed and quality (recommended)',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    hoverColor: 'hover:bg-blue-200',
    models: {
      // Create from Scratch - quality matters
      generateQuestions: 'openai/gpt-4o-mini',
      generateSlideOptions: 'openai/gpt-4o-mini',
      generateSpeakerNotes: 'openai/gpt-4o-mini',

      // Q&A - speed is critical
      generateFAQs: 'meta-llama/llama-3.1-8b-instruct',
      answerQuestion: 'meta-llama/llama-3.1-8b-instruct',

      // Know It All Wall - speed optimized
      analyzeKnowledgeBase: 'openai/gpt-4o-mini',
      generateContextQuestions: 'openai/gpt-4o-mini',
      generateFollowupQuestions: 'openai/gpt-4o-mini',

      // Upload - quality
      processScript: 'openai/gpt-4o-mini',

      // Editor - mix
      suggestTriggers: 'meta-llama/llama-3.1-8b-instruct',
      generateVariations: 'openai/gpt-4o-mini',
      suggestImagePrompt: 'meta-llama/llama-3.1-8b-instruct',
      generateTitles: 'openai/gpt-4o-mini',

      // Vision
      processImages: 'anthropic/claude-3-haiku',
    }
  },
  {
    id: 'quality',
    name: 'Quality',
    iconName: 'Gem',
    description: 'Premium models for best results (higher cost)',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    hoverColor: 'hover:bg-purple-200',
    models: {
      generateQuestions: 'anthropic/claude-3.5-sonnet',
      generateSlideOptions: 'anthropic/claude-3.5-sonnet',
      generateSpeakerNotes: 'anthropic/claude-3.5-sonnet',
      generateFAQs: 'openai/gpt-4o-mini',
      answerQuestion: 'anthropic/claude-3.5-sonnet',
      analyzeKnowledgeBase: 'anthropic/claude-3.5-sonnet',
      generateContextQuestions: 'anthropic/claude-3.5-sonnet',
      generateFollowupQuestions: 'anthropic/claude-3.5-sonnet',
      processScript: 'anthropic/claude-3.5-sonnet',
      suggestTriggers: 'openai/gpt-4o-mini',
      generateVariations: 'anthropic/claude-3.5-sonnet',
      suggestImagePrompt: 'openai/gpt-4o-mini',
      generateTitles: 'openai/gpt-4o-mini',
      processImages: 'anthropic/claude-3.5-sonnet',
    }
  },
  {
    id: 'free',
    name: 'Free Models',
    iconName: 'DollarSign',
    description: 'All free models (limited availability)',
    color: 'bg-green-100 text-green-800 border-green-300',
    hoverColor: 'hover:bg-green-200',
    models: {
      generateQuestions: 'meta-llama/llama-4-scout:free',
      generateSlideOptions: 'meta-llama/llama-4-scout:free',
      generateSpeakerNotes: 'meta-llama/llama-4-scout:free',
      generateFAQs: 'meta-llama/llama-4-scout:free',
      answerQuestion: 'meta-llama/llama-4-scout:free',
      analyzeKnowledgeBase: 'meta-llama/llama-4-scout:free',
      generateContextQuestions: 'meta-llama/llama-4-scout:free',
      generateFollowupQuestions: 'meta-llama/llama-4-scout:free',
      processScript: 'meta-llama/llama-4-scout:free',
      suggestTriggers: 'meta-llama/llama-4-scout:free',
      generateVariations: 'meta-llama/llama-4-scout:free',
      suggestImagePrompt: 'meta-llama/llama-4-scout:free',
      generateTitles: 'meta-llama/llama-4-scout:free',
      processImages: 'nvidia/nemotron-nano-12b-v2-vl:free',
    }
  }
];
