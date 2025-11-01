import { Badge } from './ui/badge';
import { Play, Square, Info, MessageCircle, Wand2, Sparkles, Edit, FileText, Save, FolderOpen, Settings, X, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { ModelSelector } from './ModelSelector';
import { UserGuideViewer } from './UserGuideViewer';

type ViewMode = 'create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch';

interface StatusBarProps {
  streamStatus: 'connecting' | 'connected' | 'disconnected';
  isStreaming: boolean;
  onToggleStream: () => void;
  isListeningForQuestions?: boolean;
  onToggleQuestions?: () => void;
  onManualQuestion?: () => void;
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  sectionsCount?: number;
  onSavePresentation?: () => void;
  onLoadPresentation?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export function StatusBar({
  streamStatus,
  isStreaming,
  onToggleStream,
  isListeningForQuestions = false,
  onToggleQuestions,
  onManualQuestion,
  viewMode,
  setViewMode,
  sectionsCount = 0,
  onSavePresentation,
  onLoadPresentation,
  selectedModel,
  onModelChange,
}: StatusBarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAdvancedHelp, setShowAdvancedHelp] = useState(false);

  const statusColor = streamStatus === 'connected' ? 'default' : streamStatus === 'connecting' ? 'secondary' : 'outline';

  return (
    <>
      {/* Mobile: Compact Top Bar */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          {/* Top Row: Logo + Controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Logo (smaller on mobile) */}
            <img src="/logo.png" alt="VerbaDeck" className="h-8 sm:h-12 md:h-16 w-auto" />

            {/* Right: Primary Controls */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-lg text-gray-700 hover:bg-gray-100 border border-gray-300"
                title="Settings & Help"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Q&A Toggle Button (presenter mode only) */}
              {viewMode === 'presenter' && onToggleQuestions && (
                <button
                  onClick={onToggleQuestions}
                  className={`
                    px-3 py-2 rounded-lg font-semibold transition-all items-center gap-2 border-2 flex
                    ${isListeningForQuestions
                      ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  title={isListeningForQuestions ? 'Q&A Mode ON - Listening for questions' : 'Click to enable Q&A mode'}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden md:inline">{isListeningForQuestions ? 'Q&A ON' : 'Q&A'}</span>
                </button>
              )}

              {/* Ask Question Button (manual entry, desktop only) */}
              {viewMode === 'presenter' && onManualQuestion && (
                <button
                  onClick={onManualQuestion}
                  className="hidden sm:flex px-3 py-2 rounded-lg font-semibold transition-all items-center gap-2 border-2 bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                  title="Manually type a question"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Ask</span>
                </button>
              )}

              {/* Voice Control Button */}
              <button
                onClick={onToggleStream}
                className={`
                  px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg text-sm sm:text-lg
                  ${isStreaming
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                  }
                `}
              >
                {isStreaming ? (
                  <>
                    <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">🎤 Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Row: Navigation (desktop) / Hidden on mobile when not needed */}
          {!isStreaming && setViewMode && (
            <div className="hidden sm:flex items-center gap-2 border-t pt-3 mt-3">
              {/* Workflow: CREATE → EDIT → PRESENT → VOICE */}

              {/* Step 1: CREATE (combines Create from Scratch + Process Content) */}
              <button
                onClick={() => setViewMode('create')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold ${
                  viewMode === 'create' || viewMode === 'create-from-scratch' || viewMode === 'ai-processor'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden lg:inline">1. Create</span>
                <span className="lg:hidden">Create</span>
              </button>

              {/* Arrow */}
              <span className="text-gray-400 font-bold">→</span>

              {/* Step 2: EDIT */}
              <button
                onClick={() => setViewMode('editor')}
                disabled={sectionsCount === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                  viewMode === 'editor'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <Edit className="w-4 h-4" />
                <span className="hidden lg:inline">2. Edit ({sectionsCount})</span>
                <span className="lg:hidden">Edit</span>
              </button>

              {/* Arrow */}
              <span className="text-gray-400 font-bold">→</span>

              {/* Step 3: PRESENT */}
              <button
                onClick={() => setViewMode('presenter')}
                disabled={sectionsCount === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                  viewMode === 'presenter'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="hidden lg:inline">3. Present</span>
                <span className="lg:hidden">Present</span>
              </button>

              {/* Arrow */}
              <span className="text-gray-400 font-bold">→</span>

              {/* Step 4: VOICE (shown as status, actual button is top-right) */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-semibold">
                <Play className="w-4 h-4" />
                <span className="hidden lg:inline">4. Voice</span>
                <span className="lg:hidden">Voice</span>
              </div>

              {/* Action Buttons */}
              {sectionsCount > 0 && viewMode !== 'presenter' && onSavePresentation && (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={onSavePresentation}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-all shadow-md flex items-center gap-2"
                    title="Save"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden md:inline">Save</span>
                  </button>
                </div>
              )}

              {onLoadPresentation && (
                <div className={sectionsCount === 0 || viewMode === 'presenter' ? 'ml-auto' : ''}>
                  <input
                    type="file"
                    accept=".verbadeck,.json"
                    onChange={onLoadPresentation}
                    className="hidden"
                    id="load-presentation-statusbar"
                  />
                  <label htmlFor="load-presentation-statusbar">
                    <button
                      onClick={() => document.getElementById('load-presentation-statusbar')?.click()}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      title="Load"
                      type="button"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span className="hidden md:inline">Load</span>
                    </button>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Bottom Navigation Bar (when not streaming) */}
      {!isStreaming && setViewMode && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-around px-2 py-2">
            <button
              onClick={() => setViewMode('create')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                viewMode === 'create' || viewMode === 'create-from-scratch' || viewMode === 'ai-processor'
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-medium">Create</span>
            </button>
            <button
              onClick={() => setViewMode('editor')}
              disabled={sectionsCount === 0}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all disabled:opacity-30 ${
                viewMode === 'editor'
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <Edit className="w-5 h-5" />
              <span className="text-xs font-medium">Edit</span>
            </button>
            <button
              onClick={() => setViewMode('presenter')}
              disabled={sectionsCount === 0}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all disabled:opacity-30 ${
                viewMode === 'presenter'
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">Present</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Settings & Help</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setShowHelp(false)}
                  className={`flex-1 px-6 py-3 font-medium transition-colors ${
                    !showHelp
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={() => setShowHelp(true)}
                  className={`flex-1 px-6 py-3 font-medium transition-colors ${
                    showHelp
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
              {!showHelp ? (
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
                        setShowAdvancedHelp(true);
                        setShowSettings(false);
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
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Help Modal */}
      {showAdvancedHelp && (
        <UserGuideViewer onClose={() => setShowAdvancedHelp(false)} />
      )}
    </>
  );
}
