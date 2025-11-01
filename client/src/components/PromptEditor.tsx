import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Save, AlertTriangle } from 'lucide-react';

interface PromptData {
  operation: string;
  name: string;
  description: string;
  examplePrompt: string;
  parameters: Record<string, any>;
}

interface CustomPrompts {
  [operation: string]: string;
}

export function PromptEditor() {
  const [operations, setOperations] = useState<string[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [customPrompts, setCustomPrompts] = useState<CustomPrompts>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedOps, setExpandedOps] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPromptsAndCustomizations();
  }, []);

  const loadPromptsAndCustomizations = async () => {
    try {
      setLoading(true);

      // Fetch available operations
      const response = await fetch('http://localhost:3001/api/prompts');
      const data = await response.json();
      const ops = Object.keys(data.prompts || {});
      setOperations(ops);

      // Load custom prompts from localStorage
      const saved = localStorage.getItem('verbadeck-custom-prompts');
      if (saved) {
        setCustomPrompts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPromptDetails = async (operation: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/prompts/${operation}`);
      const data = await response.json();
      setPromptData(data);

      // Use custom prompt if available, otherwise use default
      const promptText = customPrompts[operation] || data.examplePrompt;
      setEditedPrompt(promptText);
      setSelectedOperation(operation);
    } catch (error) {
      console.error('Error loading prompt details:', error);
    }
  };

  const handleSave = () => {
    if (!selectedOperation) return;

    setSaving(true);
    const newCustomPrompts = {
      ...customPrompts,
      [selectedOperation]: editedPrompt
    };

    setCustomPrompts(newCustomPrompts);
    localStorage.setItem('verbadeck-custom-prompts', JSON.stringify(newCustomPrompts));

    setTimeout(() => setSaving(false), 500);
  };

  const handleReset = async () => {
    if (!selectedOperation || !promptData) return;

    // Remove custom prompt
    const newCustomPrompts = { ...customPrompts };
    delete newCustomPrompts[selectedOperation];
    setCustomPrompts(newCustomPrompts);
    localStorage.setItem('verbadeck-custom-prompts', JSON.stringify(newCustomPrompts));

    // Reset to default
    setEditedPrompt(promptData.examplePrompt);
  };

  const resetAllToDefaults = () => {
    if (confirm('Reset ALL prompts to defaults? This cannot be undone.')) {
      setCustomPrompts({});
      localStorage.removeItem('verbadeck-custom-prompts');
      if (selectedOperation && promptData) {
        setEditedPrompt(promptData.examplePrompt);
      }
    }
  };

  const toggleOperation = (operation: string) => {
    const newExpanded = new Set(expandedOps);
    if (newExpanded.has(operation)) {
      newExpanded.delete(operation);
      if (selectedOperation === operation) {
        setSelectedOperation(null);
        setPromptData(null);
      }
    } else {
      newExpanded.add(operation);
      loadPromptDetails(operation);
    }
    setExpandedOps(newExpanded);
  };

  const isModified = (operation: string) => {
    return customPrompts.hasOwnProperty(operation);
  };

  const hasUnsavedChanges = () => {
    if (!selectedOperation || !promptData) return false;
    const savedCustom = customPrompts[selectedOperation];
    return editedPrompt !== (savedCustom || promptData.examplePrompt);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading prompts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Prompt Editor (Developer Mode)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Edit AI prompts to fine-tune responses. Changes are saved locally and won't affect other users.
        </p>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <strong>Warning:</strong> Editing prompts can break JSON output. Always include the JSON format instructions and test thoroughly.
          </div>
        </div>
      </div>

      {/* Operations List */}
      <div className="space-y-2">
        {operations.map(operation => {
          const isExpanded = expandedOps.has(operation);
          const modified = isModified(operation);

          return (
            <div key={operation} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <button
                onClick={() => toggleOperation(operation)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{operation}</span>
                  {modified && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                      Modified
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* Editor */}
              {isExpanded && promptData && selectedOperation === operation && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm text-gray-900">{promptData.name}</h4>
                    <p className="text-xs text-gray-600">{promptData.description}</p>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    spellCheck={false}
                  />

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges() || saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saved!' : 'Save Changes'}
                      </button>

                      {modified && (
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset to Default
                        </button>
                      )}
                    </div>

                    {hasUnsavedChanges() && (
                      <span className="text-xs text-orange-600 font-semibold">
                        Unsaved changes
                      </span>
                    )}
                  </div>

                  {/* Parameters Info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">Parameters:</h5>
                    <pre className="text-xs font-mono text-gray-600">
                      {JSON.stringify(promptData.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global Actions */}
      <div className="border-t pt-4 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {Object.keys(customPrompts).length} of {operations.length} prompts modified
        </div>
        <button
          onClick={resetAllToDefaults}
          disabled={Object.keys(customPrompts).length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
        >
          Reset All to Defaults
        </button>
      </div>
    </div>
  );
}
