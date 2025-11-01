import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useEffect, useRef } from 'react';

interface TranscriptTickerProps {
  transcript: string[];
  lastTranscript: string;
}

export function TranscriptTicker({ transcript, lastTranscript }: TranscriptTickerProps) {
  const isListening = !lastTranscript;

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
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="h-20 flex items-center justify-center text-sm font-mono">
          {lastTranscript ? (
            <div className="text-foreground font-medium bg-primary/10 px-4 py-2 rounded w-full text-center">
              {lastTranscript}
            </div>
          ) : (
            <div className="text-center text-muted-foreground italic">
              🎤 Speak into your microphone...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
