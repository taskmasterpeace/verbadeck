import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook to manage AI model selection (global and operation-specific)
 */
export function useModelManagement() {
  // Global selected model (used as fallback)
  const [selectedModel, setSelectedModel] = useLocalStorage<string>(
    'verbadeck-selected-model',
    'openai/gpt-4o-mini'
  );

  // Operation-specific models (configured in Models tab)
  const [operationModels, setOperationModels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('verbadeck-operation-models');
    return saved ? JSON.parse(saved) : {};
  });

  /**
   * Get the model for a specific operation
   * Always reads from localStorage to get the latest selection
   */
  const getOperationModel = (operation: string): string | undefined => {
    const saved = localStorage.getItem('verbadeck-operation-models');
    if (saved) {
      const models = JSON.parse(saved);
      return models[operation];
    }
    return undefined;
  };

  // Listen for changes to operation models in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'verbadeck-operation-models' && e.newValue) {
        setOperationModels(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    selectedModel,
    setSelectedModel,
    operationModels,
    getOperationModel,
  };
}
