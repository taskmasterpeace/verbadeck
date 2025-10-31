import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useEffect, useRef } from 'react';

interface TranscriptTickerProps {
  transcript: string[];
  lastTranscript: string;
}

export function TranscriptTicker({ transcript, lastTranscript }: TranscriptTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcript arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, lastTranscript]);

  const isListening = transcript.length === 0 && !lastTranscript;

  return (
    <Card className="bg-background border-t-2 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            {isListening ? 'Listening...' : 'Live Transcript'}
          </CardTitle>
          {transcript.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {transcript.length} line{transcript.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div
          ref={scrollRef}
          className="h-20 overflow-y-auto text-sm space-y-1 font-mono"
        >
          {transcript.map((text, i) => (
            <div key={i} className="text-muted-foreground">
              {text}
            </div>
          ))}
          {lastTranscript && (
            <div className="text-foreground font-medium bg-primary/10 px-2 py-1 rounded animate-pulse">
              {lastTranscript}
            </div>
          )}
          {isListening && (
            <div className="text-center text-muted-foreground py-4 italic">
              🎤 Speak into your microphone...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
