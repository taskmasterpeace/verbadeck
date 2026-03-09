import { Zap, Scale, Gem, DollarSign } from 'lucide-react';
import { PRESETS } from '@/data/model-presets';
import type { Preset } from '@/data/model-presets';

interface PresetSelectorProps {
  appliedPreset: string | null;
  onApplyPreset: (preset: Preset) => void;
}

const iconMap = {
  Zap,
  Scale,
  Gem,
  DollarSign
};

export function PresetSelector({ appliedPreset, onApplyPreset }: PresetSelectorProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <span>🎯 Quick Presets</span>
        {appliedPreset && (
          <span className="text-xs text-green-600 font-normal">✓ Applied!</span>
        )}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map(preset => {
          const Icon = iconMap[preset.iconName];
          return (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className={`p-4 border-2 rounded-lg transition-all ${preset.color} ${preset.hoverColor} ${
                appliedPreset === preset.id ? 'ring-2 ring-green-500 ring-offset-2' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{preset.name}</span>
              </div>
              <p className="text-xs opacity-90">{preset.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
