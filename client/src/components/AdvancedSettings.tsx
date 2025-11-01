import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Code } from 'lucide-react';
import { RECOMMENDED_MODELS } from '../lib/openrouter-models';

interface PromptMetadata {
  name: string;
  description: string;
}

interface PromptsData {
  [key: string]: PromptMetadata;
}

interface ModelConfig {
  [operation: string]: string;
}

// Default models from server config
const SERVER_DEFAULTS: ModelConfig = {
  generateQuestions: 'openai/gpt-4o-mini',
  generateSlideOptions: 'openai/gpt-4o-mini',
  generateFAQs: 'openai/gpt-4o-mini',
  answerQuestion: 'anthropic/claude-3.5-sonnet',
  processScript: 'anthropic/claude-3.5-sonnet',
  suggestTriggers: 'openai/gpt-4o-mini',
  generateVariations: 'openai/gpt-4o-mini',
  suggestImagePrompt: 'openai/gpt-4o-mini',
};

export function AdvancedSettings() {
  const [prompts, setPrompts] = useState<PromptsData>({});
  const [models, setModels] = useState<ModelConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPromptsAndModels();
  }, []);

  const fetchPromptsAndModels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch prompts metadata
      const promptsResponse = await fetch('http://localhost:3001/api/prompts');
      if (!promptsResponse.ok) {
        throw new Error('Failed to fetch prompts');
      }
      const promptsData = await promptsResponse.json();
      setPrompts(promptsData.prompts || {});

      // Load model config from localStorage or use server defaults
      const savedModels = localStorage.getItem('verbadeck-operation-models');
      if (savedModels) {
        setModels(JSON.parse(savedModels));
      } else {
        setModels(SERVER_DEFAULTS);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load advanced settings');
      console.error('Error loading advanced settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePrompt = (operation: string) => {
    const newExpanded = new Set(expandedPrompts);
    if (newExpanded.has(operation)) {
      newExpanded.delete(operation);
    } else {
      newExpanded.add(operation);
    }
    setExpandedPrompts(newExpanded);
  };

  const handleModelChange = (operation: string, modelId: string) => {
    const newModels = {
      ...models,
      [operation]: modelId
    };
    setModels(newModels);
    // Save to localStorage
    localStorage.setItem('verbadeck-operation-models', JSON.stringify(newModels));
  };

  const resetToDefaults = () => {
    setModels(SERVER_DEFAULTS);
    localStorage.setItem('verbadeck-operation-models', JSON.stringify(SERVER_DEFAULTS));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading advanced settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold">Error loading settings</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchPromptsAndModels}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const operations = Object.keys(prompts);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Operation-Specific Model Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Each AI operation uses a specific model. Fast operations use GPT-4o Mini for speed and cost,
          while quality-critical operations use Claude 3.5 Sonnet for better results.
        </p>
      </div>

      {/* Operations List */}
      <div className="space-y-3">
        {operations.map(operation => {
          const isExpanded = expandedPrompts.has(operation);
          const metadata = prompts[operation];
          const currentModel = models[operation] || 'openai/gpt-4o-mini';

          return (
            <div key={operation} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{metadata.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{metadata.description}</p>
                  </div>
                  <button
                    onClick={() => togglePrompt(operation)}
                    className="ml-4 p-1 hover:bg-gray-200 rounded transition-colors"
                    title="View prompt details"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Model Selector */}
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">Model:</label>
                  <select
                    value={currentModel}
                    onChange={(e) => handleModelChange(operation, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {RECOMMENDED_MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.pricing.prompt}/1M tokens
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 flex items-center gap-2">
                    {currentModel.includes('claude') && (
                      <span className="text-xs text-green-600">✓ Quality</span>
                    )}
                    {currentModel.includes('gpt-4o-mini') && (
                      <span className="text-xs text-blue-600">⚡ Fast & Cheap</span>
                    )}
                    {currentModel.includes('o1') && (
                      <span className="text-xs text-purple-600">🧠 Reasoning</span>
                    )}
                    {currentModel.includes('perplexity') && (
                      <span className="text-xs text-orange-600">🌐 Internet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                    <Code className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-semibold text-xs text-gray-500 uppercase mb-1">Operation ID</p>
                      <code className="text-xs font-mono">{operation}</code>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    <p>💡 <strong>Tip:</strong> Prompts and model selection will be editable in a future update.</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <h4 className="font-semibold text-blue-900 mb-2">📊 Model Strategy</h4>
        <ul className="space-y-1 text-blue-800 text-xs">
          <li>• <strong>GPT-4o Mini:</strong> Fast operations like generating questions, FAQs, and trigger suggestions</li>
          <li>• <strong>Claude 3.5 Sonnet:</strong> Quality-critical operations like script processing and live Q&A</li>
          <li>• Changes are saved to localStorage and persist across sessions</li>
        </ul>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
