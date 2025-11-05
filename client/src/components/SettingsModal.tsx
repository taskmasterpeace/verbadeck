import { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { AdvancedSettings } from './AdvancedSettings';
import { PromptEditor } from './PromptEditor';
import { UserGuideViewer } from './UserGuideViewer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamStatus: 'connecting' | 'connected' | 'disconnected';
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  onShowAdvancedHelp?: () => void;
}

/**
 * SettingsModal Component
 *
 * Modal with 4 tabs: Settings, Models, Prompts, and Help.
 * Includes ModelSelector, AdvancedSettings, PromptEditor, and advanced help button.
 *
 * Extracted from StatusBar.tsx (lines 274-477)
 */
export function SettingsModal({
  isOpen,
  onClose,
  streamStatus,
  selectedModel,
  onModelChange,
  onShowAdvancedHelp,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'models' | 'prompts' | 'help'>('settings');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Settings & Help</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              ⚙️ Settings
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'models'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🤖 Models
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'prompts'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📝 Prompts
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'help'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📖 Help
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'settings' ? (
            /* Settings Tab */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">AI Model Selection</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which AI model to use for processing scripts, generating Q&A answers, and creating presentations.
                </p>
                {selectedModel && onModelChange && (
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                  />
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                  streamStatus === 'connected'
                    ? 'bg-green-100 text-green-800'
                    : streamStatus === 'connecting'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {streamStatus === 'connected' && '🟢 Connected to AssemblyAI'}
                  {streamStatus === 'connecting' && '🟡 Connecting...'}
                  {streamStatus === 'disconnected' && '⚫ Disconnected'}
                </div>
              </div>
            </div>
          ) : activeTab === 'models' ? (
            /* Models Tab */
            <AdvancedSettings />
          ) : activeTab === 'prompts' ? (
            /* Prompts Tab */
            <PromptEditor />
          ) : (
            /* Help Tab */
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="text-lg font-bold mb-3">🎤 Voice-Driven Presentations</h3>
                <p className="text-gray-700 mb-2">
                  VerbaDeck uses AI-powered voice recognition to automatically advance slides when you speak trigger words during your presentation.
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">🚀 Quick Start</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li><strong>Create your presentation</strong> - Choose "Create from Scratch" or "Process Existing Content"</li>
                  <li><strong>Review trigger words</strong> - Each slide has words that advance to the next slide when spoken</li>
                  <li><strong>Click "Present"</strong> - Enter presenter mode to see your slides</li>
                  <li><strong>Start Voice Control</strong> - Click the 🎤 Voice button to enable voice navigation</li>
                  <li><strong>Speak naturally</strong> - Say your trigger words to automatically advance slides</li>
                </ol>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">✨ Features</h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <p className="font-semibold">Create from Scratch</p>
                    <p className="text-xs">AI asks you questions about your presentation, then generates multiple slide options for you to choose from.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Process Existing Content</p>
                    <p className="text-xs">Paste your script or upload PowerPoint - AI automatically splits it into sections and suggests trigger words.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Edit Sections</p>
                    <p className="text-xs">Fine-tune your content, add images, and customize which trigger words are active.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Q&A Mode</p>
                    <p className="text-xs">During presentations, ask questions and get AI-powered answer options in multiple formats and tones.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Knowledge Base</p>
                    <p className="text-xs">Add FAQs or auto-generate them from your presentation to improve Q&A accuracy.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Dual Monitor Support</p>
                    <p className="text-xs">Open Audience View on your second monitor for a clean, professional display.</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">💡 Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Speak trigger words clearly and naturally - they work even with plurals</li>
                  <li>Use the "BACK" command to return to previous slides</li>
                  <li>Save your presentations and load them later</li>
                  <li>Try different AI models for better quality or faster processing</li>
                  <li>The transcript bar shows what VerbaDeck is hearing in real-time</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">🎯 Trigger Word Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Choose words that appear naturally at the end of each section</li>
                  <li>Avoid common words like "the", "a", "is"</li>
                  <li>Use distinctive, memorable words</li>
                  <li>You can have multiple trigger words active per slide</li>
                  <li>Toggle triggers on/off in the Edit Sections view</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={() => {
                    if (onShowAdvancedHelp) {
                      onShowAdvancedHelp();
                      onClose();
                    }
                  }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>📖 Open Advanced User Guide</span>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Complete documentation with examples, use cases, and troubleshooting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
