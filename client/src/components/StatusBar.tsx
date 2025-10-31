import { Badge } from './ui/badge';
import { Play, Square, Info, MessageCircle } from 'lucide-react';

interface StatusBarProps {
  streamStatus: 'connecting' | 'connected' | 'disconnected';
  isStreaming: boolean;
  onToggleStream: () => void;
  isListeningForQuestions?: boolean;
  onToggleQuestions?: () => void;
}

export function StatusBar({
  streamStatus,
  isStreaming,
  onToggleStream,
  isListeningForQuestions = false,
  onToggleQuestions,
}: StatusBarProps) {
  const statusColor = streamStatus === 'connected' ? 'default' : streamStatus === 'connecting' ? 'secondary' : 'outline';

  return (
    <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo + App Title */}
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="VerbaDeck" className="h-20 w-auto" />
            <div className={`text-sm px-4 py-2 rounded-full font-semibold ${
              streamStatus === 'connected'
                ? 'bg-green-100 text-green-800'
                : streamStatus === 'connecting'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {streamStatus === 'connected' && '🟢 Connected'}
              {streamStatus === 'connecting' && '🟡 Connecting...'}
              {streamStatus === 'disconnected' && '⚫ Disconnected'}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Help Tooltip */}
            <div className="group relative">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute right-0 top-8 z-10 w-80 p-4 bg-gray-900 text-white text-sm rounded-lg shadow-xl">
                <p className="font-bold mb-2">🎤 Start Listening</p>
                <p className="mb-3">Use this during your presentation to enable voice navigation. Speak your trigger words to advance slides.</p>
                <p className="font-bold mb-2">✨ Process with AI</p>
                <p>Use this to convert your raw script text into presentation sections with smart trigger words.</p>
              </div>
            </div>

            {/* Q&A Toggle (only show when streaming) */}
            {isStreaming && onToggleQuestions && (
              <button
                onClick={onToggleQuestions}
                className={`
                  px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 border-2
                  ${isListeningForQuestions
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }
                `}
              >
                <MessageCircle className="w-4 h-4" />
                Listen for Questions
              </button>
            )}

            <button
              onClick={onToggleStream}
              className={`
                px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg text-lg
                ${isStreaming
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-xl'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-xl'
                }
              `}
            >
              {isStreaming ? (
                <>
                  <Square className="w-5 h-5" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  🎤 Voice Control
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
