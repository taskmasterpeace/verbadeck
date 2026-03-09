import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RECOMMENDED_MODELS } from '@/lib/openrouter-models';
import type { OperationCategory } from '@/data/operation-categories';
import type { ModelConfig } from '@/data/server-defaults';
import { OperationRow } from './OperationRow';

interface PromptMetadata {
  name: string;
  description: string;
}

interface PromptsData {
  [key: string]: PromptMetadata;
}

interface CategorySectionProps {
  category: OperationCategory;
  prompts: PromptsData;
  config: ModelConfig;
  onModelChange: (operation: string, modelId: string) => void;
  onCategoryChange: (operations: string[], modelId: string) => void;
}

export function CategorySection({ category, prompts, config, onModelChange, onCategoryChange }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(category.id === 'create-from-scratch');

  const categoryOperations = category.operations.filter(op => prompts[op]);

  if (categoryOperations.length === 0) return null;

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gray-50 hover:bg-gray-100 p-4 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div className="text-left">
            <h5 className="font-semibold text-gray-900">{category.name}</h5>
            <p className="text-xs text-gray-600">{category.description} ({categoryOperations.length} operations)</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Category Content */}
      {isExpanded && (
        <div className="p-4 bg-white space-y-3">
          {/* Category-Level Bulk Changer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <label className="block text-xs font-semibold text-blue-900 mb-2">
              Apply to all {categoryOperations.length} operations in {category.name}:
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onCategoryChange(categoryOperations, e.target.value);
                  e.target.value = ''; // Reset
                }
              }}
              defaultValue=""
              className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>-- Select model to apply --</option>
              {RECOMMENDED_MODELS.map(model => {
                let badge = '';
                if (model.primaryCapability === 'ultra-fast') badge = ' ⚡⚡⚡';
                else if (model.primaryCapability === 'fast') badge = ' ⚡⚡';
                else if (model.primaryCapability === 'reasoning') badge = ' 💭';
                else if (model.primaryCapability === 'free') badge = ' 🆓';
                else if (model.primaryCapability === 'internet') badge = ' 🌐';

                return (
                  <option key={model.id} value={model.id}>
                    {model.name}{badge}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Individual Operations */}
          {categoryOperations.map(operation => {
            const metadata = prompts[operation];
            const currentModel = config[operation] || 'openai/gpt-4o-mini';

            return (
              <OperationRow
                key={operation}
                operation={operation}
                metadata={metadata}
                currentModel={currentModel}
                onModelChange={onModelChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
