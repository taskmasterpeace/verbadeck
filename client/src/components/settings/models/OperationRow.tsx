import { useState } from 'react';
import { ChevronDown, ChevronUp, Code } from 'lucide-react';
import { RECOMMENDED_MODELS } from '@/lib/openrouter-models';

interface PromptMetadata {
  name: string;
  description: string;
}

interface OperationRowProps {
  operation: string;
  metadata: PromptMetadata;
  currentModel: string;
  onModelChange: (operation: string, modelId: string) => void;
}

export function OperationRow({ operation, metadata, currentModel, onModelChange }: OperationRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getModelBadge = (modelId: string) => {
    if (modelId.includes('claude')) return <span className="text-xs text-green-600">✓ Quality</span>;
    if (modelId.includes('gpt-4o-mini')) return <span className="text-xs text-blue-600">⚡ Fast & Cheap</span>;
    if (modelId.includes('llama-3.1-8b') || modelId.includes('llama-4-scout')) return <span className="text-xs text-yellow-600">⚡⚡⚡ Ultra-Fast</span>;
    if (modelId.includes('o1')) return <span className="text-xs text-indigo-600">🧠 Reasoning</span>;
    if (modelId.includes('perplexity')) return <span className="text-xs text-orange-600">🌐 Internet</span>;
    if (modelId.includes(':free')) return <span className="text-xs text-green-600">🆓 Free</span>;
    return null;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h6 className="font-semibold text-gray-900 text-sm">{metadata.name}</h6>
            <p className="text-xs text-gray-600 mt-0.5">{metadata.description}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
            title="Show details"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Compact Model Selector */}
        <div className="flex items-center gap-2">
          <select
            value={currentModel}
            onChange={(e) => onModelChange(operation, e.target.value)}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {RECOMMENDED_MODELS.map(model => (
              <option key={model.id} value={model.id} title={`${model.pricing.prompt}/1M tokens`}>
                {model.name}
              </option>
            ))}
          </select>
          {getModelBadge(currentModel)}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <Code className="w-3 h-3 mt-0.5 text-gray-500" />
              <div>
                <span className="font-semibold text-gray-500">Operation ID:</span>
                <code className="ml-1 font-mono text-gray-700">{operation}</code>
              </div>
            </div>
            {(() => {
              const modelInfo = RECOMMENDED_MODELS.find(m => m.id === currentModel);
              if (modelInfo) {
                return (
                  <div className="text-xs text-gray-600">
                    <div><strong>Cost:</strong> {modelInfo.pricing.prompt}/1M input, {modelInfo.pricing.completion}/1M output</div>
                    <div><strong>Context:</strong> {modelInfo.context_length.toLocaleString()} tokens</div>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
