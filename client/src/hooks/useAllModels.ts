import { useState, useEffect } from 'react';

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
}

const STORAGE_KEY = 'verbadeck-selected-model';

/**
 * Hook to fetch ALL models from OpenRouter and manage model selection with localStorage
 */
export function useAllModels() {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    // Load from localStorage or default to Claude 3.5 Sonnet
    return localStorage.getItem(STORAGE_KEY) || 'anthropic/claude-3.5-sonnet';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/models');

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('Failed to load models. Using defaults.');

      // Fallback to hardcoded models
      setModels([
        {
          id: 'anthropic/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          description: 'Best overall',
          pricing: { prompt: '3', completion: '15' },
        },
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku',
          description: 'Fastest Claude',
          pricing: { prompt: '0.25', completion: '1.25' },
        },
        {
          id: 'openai/gpt-4-turbo',
          name: 'GPT-4 Turbo',
          description: 'OpenAI flagship',
          pricing: { prompt: '10', completion: '30' },
        },
        {
          id: 'openai/gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Cost-effective',
          pricing: { prompt: '0.5', completion: '1.5' },
        },
        {
          id: 'meta-llama/llama-3.1-70b-instruct',
          name: 'Llama 3.1 70B',
          description: 'Open source',
          pricing: { prompt: '0.35', completion: '0.4' },
        },
        {
          id: 'google/gemini-flash-1.5',
          name: 'Gemini Flash 1.5',
          description: 'FREE - Fast and efficient',
          pricing: { prompt: '0', completion: '0' },
        },
        {
          id: 'meta-llama/llama-3.2-3b-instruct:free',
          name: 'Llama 3.2 3B',
          description: 'FREE - Small but capable',
          pricing: { prompt: '0', completion: '0' },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem(STORAGE_KEY, modelId);
  };

  const isFreeModel = (model: OpenRouterModel): boolean => {
    const prompt = parseFloat(model.pricing.prompt);
    const completion = parseFloat(model.pricing.completion);
    return (prompt === 0 && completion === 0) || model.id.includes(':free');
  };

  return {
    models,
    selectedModel,
    setSelectedModel: handleModelChange,
    isLoading,
    error,
    isFreeModel,
  };
}
