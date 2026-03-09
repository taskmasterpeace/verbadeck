import { useState, useEffect } from 'react';
import { ModelConfig, SERVER_DEFAULTS } from '@/data/server-defaults';
import type { Preset } from '@/data/model-presets';

const STORAGE_KEY = 'verbadeck-operation-models';

export function useModelConfig() {
  const [config, setConfig] = useState<ModelConfig>({});
  const [appliedPreset, setAppliedPreset] = useState<string | null>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedModels = localStorage.getItem(STORAGE_KEY);
    if (savedModels) {
      setConfig(JSON.parse(savedModels));
    } else {
      setConfig(SERVER_DEFAULTS);
    }
  }, []);

  // Save config to localStorage
  const saveConfig = (newConfig: ModelConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  // Apply a preset
  const applyPreset = (preset: Preset) => {
    saveConfig(preset.models);
    setAppliedPreset(preset.id);

    // Clear preset indicator after 3 seconds
    setTimeout(() => {
      setAppliedPreset(null);
    }, 3000);
  };

  // Update a single operation
  const updateOperation = (operation: string, modelId: string) => {
    const newConfig = {
      ...config,
      [operation]: modelId
    };
    saveConfig(newConfig);
    setAppliedPreset(null); // Clear preset indicator when manually changing
  };

  // Apply model to all operations in a category
  const updateCategory = (operations: string[], modelId: string) => {
    const newConfig = { ...config };
    operations.forEach(operation => {
      newConfig[operation] = modelId;
    });
    saveConfig(newConfig);
    setAppliedPreset(null);
  };

  // Reset to server defaults
  const reset = () => {
    saveConfig(SERVER_DEFAULTS);
    setAppliedPreset(null);
  };

  return {
    config,
    appliedPreset,
    applyPreset,
    updateOperation,
    updateCategory,
    reset
  };
}
