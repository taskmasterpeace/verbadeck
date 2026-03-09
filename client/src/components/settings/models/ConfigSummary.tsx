import { CheckCircle2 } from 'lucide-react';
import { RECOMMENDED_MODELS } from '@/lib/openrouter-models';
import type { ModelConfig } from '@/data/server-defaults';

interface ConfigSummaryProps {
  config: ModelConfig;
}

export function ConfigSummary({ config }: ConfigSummaryProps) {
  const getConfigSummary = () => {
    const modelCounts: { [key: string]: number } = {};
    Object.values(config).forEach(model => {
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });
    return modelCounts;
  };

  const configSummary = getConfigSummary();

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">Current Configuration</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(configSummary).map(([model, count]) => {
              const modelInfo = RECOMMENDED_MODELS.find(m => m.id === model);
              const displayName = modelInfo?.name || model;
              return (
                <div key={model} className="flex items-center gap-2">
                  <span className="font-mono text-gray-600">{count}×</span>
                  <span className="text-gray-800 truncate" title={displayName}>
                    {displayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
