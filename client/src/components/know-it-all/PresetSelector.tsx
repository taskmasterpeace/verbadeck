import { BookOpen, Trash2 } from 'lucide-react';

interface KnowledgeBasePreset {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface PresetSelectorProps {
  presets: KnowledgeBasePreset[];
  selectedPresetId: string | null;
  onSelectPreset: (presetId: string | null) => void;
  onLoadPreset: (presetId: string, mode: 'replace' | 'append') => void;
  onDeletePreset: (presetId: string) => void;
  hasContent: boolean;
}

export function PresetSelector({
  presets,
  selectedPresetId,
  onSelectPreset,
  onLoadPreset,
  onDeletePreset,
  hasContent,
}: PresetSelectorProps) {
  if (presets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        <BookOpen className="w-4 h-4" />
        Quick Load Presets
      </label>
      <div className="flex gap-2">
        <select
          value={selectedPresetId || ''}
          onChange={(e) => onSelectPreset(e.target.value || null)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
          data-testid="preset-selector"
        >
          <option value="">Select a preset...</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => selectedPresetId && onLoadPreset(selectedPresetId, 'replace')}
          disabled={!selectedPresetId}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title="Replace current content"
          data-testid="load-preset-button"
        >
          Load
        </button>
        {hasContent && selectedPresetId && (
          <button
            onClick={() => selectedPresetId && onLoadPreset(selectedPresetId, 'append')}
            className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
            title="Combine with current content"
            data-testid="combine-preset-button"
          >
            + Combine
          </button>
        )}
        {selectedPresetId && !selectedPresetId.startsWith('sample-') && (
          <button
            onClick={() => selectedPresetId && onDeletePreset(selectedPresetId)}
            className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-1"
            title="Delete this preset"
            data-testid="delete-preset-button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        💡 Tip: Load your resume, then click "+ Combine" with a job description for interview prep
      </p>
    </div>
  );
}
