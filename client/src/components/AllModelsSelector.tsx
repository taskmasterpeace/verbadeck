import { useState } from 'react';
import { useAllModels } from '@/hooks/useAllModels';
import { ChevronDown, Sparkles, Loader2 } from 'lucide-react';

interface AllModelsSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function AllModelsSelector({ selectedModel, onModelChange }: AllModelsSelectorProps) {
  const { models, isLoading, error, isFreeModel } = useAllModels();
  const [isOpen, setIsOpen] = useState(false);

  const selected = models.find(m => m.id === selectedModel);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-200 bg-white">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span className="text-sm text-gray-600">Loading models...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 border-blue-200 bg-white hover:border-blue-400 transition-all"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Sparkles className={`w-4 h-4 flex-shrink-0 ${selected && isFreeModel(selected) ? 'text-green-600' : 'text-blue-600'}`} />
          <span className="font-medium text-gray-900 text-sm truncate">
            {selected?.name || 'Select a model'}
          </span>
          {selected && isFreeModel(selected) && (
            <span className="px-1.5 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full flex-shrink-0">
              FREE
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-20 mt-2 w-full max-h-96 overflow-y-auto rounded-lg border-2 border-gray-200 bg-white shadow-2xl">
            {error && (
              <div className="p-3 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-800">
                {error}
              </div>
            )}

            <div className="p-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                    model.id === selectedModel
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                        <span className="truncate">{model.name}</span>
                        {isFreeModel(model) && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full flex-shrink-0">
                            FREE
                          </span>
                        )}
                      </div>
                      {model.description && (
                        <div className="text-sm text-gray-600 mt-0.5">{model.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        ${model.pricing.prompt}/M prompt · ${model.pricing.completion}/M completion
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
