import { Play, Square, Settings, Save, FolderOpen, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';
import { SettingsModal } from '../SettingsModal';
import { cn } from '../../lib/utils';

interface TopBarProps {
  // Voice control
  isStreaming: boolean;
  streamStatus: 'connecting' | 'connected' | 'disconnected';
  onToggleStream: () => void;

  // Q&A controls
  isListeningForQuestions?: boolean;
  onToggleQuestions?: () => void;
  onManualQuestion?: () => void;
  showQAControls?: boolean;

  // File operations
  onSavePresentation?: () => void;
  onLoadPresentation?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showFileControls?: boolean;

  // Settings
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  cancelWord?: string;
  onCancelWordChange?: (word: string) => void;
}

export function TopBar({
  isStreaming,
  streamStatus,
  onToggleStream,
  isListeningForQuestions = false,
  onToggleQuestions,
  onManualQuestion,
  showQAControls = false,
  onSavePresentation,
  onLoadPresentation,
  showFileControls = false,
  selectedModel,
  onModelChange,
  cancelWord,
  onCancelWordChange,
}: TopBarProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b bg-background px-4">
        {/* Left: Sidebar toggle */}
        <SidebarTrigger />

        <div className="flex-1" />

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          {/* Q&A Controls (when in presenter mode) */}
          {showQAControls && (
            <>
              {onToggleQuestions && (
                <Button
                  onClick={onToggleQuestions}
                  variant={isListeningForQuestions ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'gap-2',
                    isListeningForQuestions &&
                      'bg-green-600 hover:bg-green-700 text-white'
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isListeningForQuestions ? 'Q&A ON' : 'Q&A'}
                  </span>
                </Button>
              )}
              {onManualQuestion && (
                <Button
                  onClick={onManualQuestion}
                  variant="outline"
                  size="sm"
                  className="hidden gap-2 sm:flex"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Ask</span>
                </Button>
              )}
            </>
          )}

          {/* File Controls */}
          {showFileControls && (
            <>
              {onSavePresentation && (
                <Button
                  onClick={onSavePresentation}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              )}
              {onLoadPresentation && (
                <>
                  <input
                    type="file"
                    accept=".verbadeck,.json"
                    onChange={onLoadPresentation}
                    className="hidden"
                    id="load-presentation-topbar"
                  />
                  <Button
                    onClick={() =>
                      document.getElementById('load-presentation-topbar')?.click()
                    }
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <label htmlFor="load-presentation-topbar" className="cursor-pointer">
                      <FolderOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Load</span>
                    </label>
                  </Button>
                </>
              )}
            </>
          )}

          {/* Settings */}
          <Button
            onClick={() => setShowSettings(true)}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          {/* Voice Control - Primary Action */}
          <Button
            onClick={onToggleStream}
            size="sm"
            className={cn(
              'gap-2 font-semibold shadow-md',
              isStreaming
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
            )}
          >
            {isStreaming ? (
              <>
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Voice</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        streamStatus={streamStatus}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        onShowAdvancedHelp={() => {}}
        cancelWord={cancelWord}
        onCancelWordChange={onCancelWordChange}
      />
    </>
  );
}
