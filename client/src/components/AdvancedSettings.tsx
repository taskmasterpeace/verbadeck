import { useState, useEffect } from 'react';
import { CATEGORIES } from '@/data/operation-categories';
import { useModelConfig } from '@/hooks/useModelConfig';
import { apiGet, isAPIError } from '@/lib/api-client';
import { PresetSelector } from './settings/models/PresetSelector';
import { ConfigSummary } from './settings/models/ConfigSummary';
import { CategorySection } from './settings/models/CategorySection';
import { HelpSection } from './settings/models/HelpSection';

interface PromptMetadata {
  name: string;
  description: string;
}

interface PromptsData {
  [key: string]: PromptMetadata;
}

export function AdvancedSettings() {
  const [prompts, setPrompts] = useState<PromptsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { config, appliedPreset, applyPreset, updateOperation, updateCategory, reset } = useModelConfig();

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch prompts metadata
      const promptsData = await apiGet<{ prompts: PromptsData }>('/api/prompts');
      setPrompts(promptsData.prompts || {});

    } catch (err) {
      const message = isAPIError(err) ? err.message : (err instanceof Error ? err.message : 'Failed to load advanced settings');
      setError(message);
      console.error('Error loading advanced settings:', err);
    } finally {
      setLoading(false);
    }
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
          onClick={fetchPrompts}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Model Configuration</h3>
        <p className="text-sm text-gray-600">
          Choose AI models for different operations. Use presets for quick setup or customize each operation individually.
        </p>
      </div>

      {/* Configuration Summary */}
      <ConfigSummary config={config} />

      {/* Preset Buttons */}
      <PresetSelector appliedPreset={appliedPreset} onApplyPreset={applyPreset} />

      {/* Category-Based Configuration */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">⚙️ Configure by Feature Area</h4>

        {CATEGORIES.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            prompts={prompts}
            config={config}
            onModelChange={updateOperation}
            onCategoryChange={updateCategory}
          />
        ))}
      </div>

      {/* Help Section */}
      <HelpSection />

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold transition-colors"
        >
          Reset to Server Defaults
        </button>
        <p className="text-xs text-gray-500">
          💡 Changes are saved automatically
        </p>
      </div>
    </div>
  );
}
