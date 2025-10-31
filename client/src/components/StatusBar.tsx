import { Badge } from './ui/badge';
import { Play, Square } from 'lucide-react';

interface StatusBarProps {
  streamStatus: 'connecting' | 'connected' | 'disconnected';
  isStreaming: boolean;
  onToggleStream: () => void;
}

export function StatusBar({
  streamStatus,
  isStreaming,
  onToggleStream,
}: StatusBarProps) {
  const statusColor = streamStatus === 'connected' ? 'default' : streamStatus === 'connecting' ? 'secondary' : 'outline';

  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: App Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">VerbaDeck</h1>
            <Badge variant={statusColor} className="text-xs">
              {streamStatus === 'connected' && '🟢 Connected'}
              {streamStatus === 'connecting' && '🟡 Connecting...'}
              {streamStatus === 'disconnected' && '⚫ Disconnected'}
            </Badge>
          </div>

          {/* Right: Controls */}
          <button
            onClick={onToggleStream}
            className={`
              px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2
              ${isStreaming
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }
            `}
          >
            {isStreaming ? (
              <>
                <Square className="w-4 h-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Listening
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
