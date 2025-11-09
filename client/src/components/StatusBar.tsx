import { Badge } from './ui/badge';
import { Play, Square, Info, MessageCircle, Wand2, Sparkles, Edit, FileText, Save, FolderOpen, Settings, Brain, BookMarked } from 'lucide-react';
import { useState } from 'react';
import { UserGuideViewer } from './UserGuideViewer';
import { SettingsModal } from './SettingsModal';

type ViewMode = 'create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch' | 'know-it-all';

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
  onSaveToLibrary?: () => void;
  onLoadFromLibrary?: () => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  cancelWord?: string;
  onCancelWordChange?: (word: string) => void;
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
  onSaveToLibrary,
  onLoadFromLibrary,
  selectedModel,
  onModelChange,
  cancelWord,
  onCancelWordChange,
}: StatusBarProps) {
  const [showSettings, setShowSettings] = useState(false);
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
                data-testid="settings-button"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Know It All Wall Button */}
              {setViewMode && (
                <button
                  onClick={() => setViewMode('know-it-all')}
                  className={`p-2 sm:px-3 sm:py-2 rounded-lg border transition-all ${
                    viewMode === 'know-it-all'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 border-gray-300'
                  }`}
                  title="Know It All Wall - Rapid Q&A Mode"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

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
                  {onSaveToLibrary && (
                    <button
                      onClick={onSaveToLibrary}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold transition-all shadow-md flex items-center gap-2"
                      title="Save to Library"
                    >
                      <BookMarked className="w-4 h-4" />
                      <span className="hidden md:inline">Library</span>
                    </button>
                  )}
                  <button
                    onClick={onSavePresentation}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-all shadow-md flex items-center gap-2"
                    title="Save to File"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden md:inline">Save</span>
                  </button>
                </div>
              )}

              {onLoadPresentation && (
                <div className={sectionsCount === 0 || viewMode === 'presenter' ? 'ml-auto flex items-center gap-2' : 'flex items-center gap-2'}>
                  {onLoadFromLibrary && (
                    <button
                      onClick={onLoadFromLibrary}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold transition-all shadow-md flex items-center gap-2"
                      title="Load from Library"
                    >
                      <BookMarked className="w-4 h-4" />
                      <span className="hidden md:inline">Library</span>
                    </button>
                  )}
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
                      title="Load from File"
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

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        streamStatus={streamStatus}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        onShowAdvancedHelp={() => setShowAdvancedHelp(true)}
        cancelWord={cancelWord}
        onCancelWordChange={onCancelWordChange}
      />

      {/* Advanced Help Modal */}
      {showAdvancedHelp && (
        <UserGuideViewer onClose={() => setShowAdvancedHelp(false)} />
      )}
    </>
  );
}
