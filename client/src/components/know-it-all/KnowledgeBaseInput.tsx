import { Upload, Trash2, Save } from 'lucide-react';

interface LoadedPreset {
  id: string;
  name: string;
  icon: string;
}

interface KnowledgeBaseInputProps {
  value: string;
  onChange: (value: string) => void;
  loadedPresets: LoadedPreset[];
  onLoadFile: () => void;
  onClear: () => void;
  onSaveAsPreset: () => void;
}

export function KnowledgeBaseInput({
  value,
  onChange,
  loadedPresets,
  onLoadFile,
  onClear,
  onSaveAsPreset,
}: KnowledgeBaseInputProps) {
  const hasContent = value.trim().length > 0;
  const isVeryLarge = value.length > 100000;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Knowledge Base</label>
        <div className="flex gap-2">
          <button
            onClick={onLoadFile}
            className="text-xs px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            Load File
          </button>
          {hasContent && (
            <>
              <button
                onClick={onClear}
                className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-600 flex items-center gap-1"
                data-testid="clear-knowledge-base-button"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
              <button
                onClick={onSaveAsPreset}
                className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center gap-1"
                data-testid="save-as-preset-button"
              >
                <Save className="w-3 h-3" />
                Save as Preset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loaded Presets Badges */}
      {loadedPresets.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs text-blue-700 font-medium">Loaded:</span>
          {loadedPresets.map((preset) => (
            <div
              key={preset.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-900"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your resume, product description, company information, or any content you want to answer questions about...

TIP: Load multiple presets and combine them (e.g., your resume + a job description)"
        className="w-full min-h-[200px] font-mono text-sm p-3 border rounded-lg resize-y"
        data-testid="knowledge-base-textarea"
      />

      <div className="flex items-center justify-between text-xs">
        <span className={isVeryLarge ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
          {value.length.toLocaleString()} characters
          {isVeryLarge && ' ⚠️ Very large - consider splitting into multiple presets'}
        </span>
        <span className="text-muted-foreground">
          Llama 3.1 8B (Groq) • ~1s responses
        </span>
      </div>
    </div>
  );
}
