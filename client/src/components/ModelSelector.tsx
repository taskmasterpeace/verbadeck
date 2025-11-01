import { useState, useEffect } from 'react';
import { Check, ChevronDown, Brain, Globe, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RECOMMENDED_MODELS, MODEL_CATEGORIES, getDefaultModel, type Model, getModelById } from '@/lib/openrouter-models';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<Model>(getDefaultModel());

  useEffect(() => {
    const model = RECOMMENDED_MODELS.find((m) => m.id === selectedModel);
    if (model) {
      setCurrentModel(model);
    }
  }, [selectedModel]);

  const handleSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selected Model Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-muted transition-colors min-w-[280px]"
      >
        <div className="flex-1 text-left">
          <div className="text-sm font-medium">{currentModel.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {currentModel.description}
          </div>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-full min-w-[400px] bg-background border rounded-lg shadow-lg z-50 max-h-[500px] overflow-y-auto">
            {MODEL_CATEGORIES.map((category) => (
              <div key={category.name} className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {category.name}
                </div>
                <div className="space-y-1">
                  {category.models.map((modelId) => {
                    const model = RECOMMENDED_MODELS.find((m) => m.id === modelId);
                    if (!model) return null;

                    const isSelected = selectedModel === model.id;

                    return (
                      <button
                        key={model.id}
                        onClick={() => handleSelect(model.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-3 py-2 rounded-md text-left transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{model.name}</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                          <div className={cn(
                            'text-xs mt-1',
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          )}>
                            {model.description}
                          </div>
                          <div className={cn(
                            'text-xs mt-1 font-mono',
                            isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
                          )}>
                            {model.context_length.toLocaleString()} tokens
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="border-t p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Claude 3.5 Sonnet is recommended for best results.
                All models are powered by <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter</a>.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
