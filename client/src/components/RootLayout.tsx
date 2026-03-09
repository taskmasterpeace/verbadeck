import { Outlet } from 'react-router-dom';
import { StatusBar } from './StatusBar';
import { StatusIndicator } from './StatusIndicator';
import { TranscriptTicker } from './TranscriptTicker';
import { Footer } from './Footer';
import { useVoiceStore } from '@/stores/voice';
import { useUIStore } from '@/stores/ui';

interface RootLayoutProps {
  // Audio streaming props
  onToggleStream: () => void;

  // Q&A props
  isListeningForQuestions: boolean;
  onToggleQuestions: () => void;
  onManualQuestion: () => void;

  // File operations
  onSavePresentation: () => void;
  onLoadPresentation: () => void;
  onSaveToLibrary: () => void;
  onLoadFromLibrary: () => void;
}

export function RootLayout({
  onToggleStream,
  isListeningForQuestions,
  onToggleQuestions,
  onManualQuestion,
  onSavePresentation,
  onLoadPresentation,
  onSaveToLibrary,
  onLoadFromLibrary,
}: RootLayoutProps) {
  // Get data from stores
  const isStreaming = useVoiceStore((state) => state.isStreaming);
  const transcript = useVoiceStore((state) => state.transcript);
  const lastTranscript = useVoiceStore((state) => state.lastTranscript);
  const viewMode = useUIStore((state) => state.viewMode);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StatusBar
        onToggleStream={onToggleStream}
        isListeningForQuestions={isListeningForQuestions}
        onToggleQuestions={onToggleQuestions}
        onManualQuestion={onManualQuestion}
        onSavePresentation={onSavePresentation}
        onLoadPresentation={onLoadPresentation}
        onSaveToLibrary={onSaveToLibrary}
        onLoadFromLibrary={onLoadFromLibrary}
      />

      {/* Floating status indicator */}
      <StatusIndicator isStreaming={isStreaming} />

      {/* Main content */}
      <Outlet />

      {/* Transcript Ticker - Fixed at very bottom when streaming */}
      {isStreaming && viewMode !== 'know-it-all' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t shadow-lg">
          <div className="container mx-auto px-4 py-2">
            <TranscriptTicker
              transcript={transcript}
              lastTranscript={lastTranscript}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
