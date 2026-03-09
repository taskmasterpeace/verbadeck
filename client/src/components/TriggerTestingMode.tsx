import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, Square, CheckCircle2, Circle, Mic } from 'lucide-react';
import { createTokenPattern } from '@/lib/script-parser';
import { Badge } from './ui/badge';

interface TriggerTestingModeProps {
  triggers: string[];
  isStreaming: boolean;
  onToggleStream: () => void;
  transcript: string;
  streamStatus: 'connecting' | 'connected' | 'disconnected';
}

interface TriggerStatus {
  word: string;
  detected: boolean;
  detectedAt?: Date;
}

export function TriggerTestingMode({
  triggers,
  isStreaming,
  onToggleStream,
  transcript,
  streamStatus,
}: TriggerTestingModeProps) {
  const [triggerStatuses, setTriggerStatuses] = useState<TriggerStatus[]>([]);
  const [lastTranscript, setLastTranscript] = useState('');

  // Initialize trigger statuses
  useEffect(() => {
    setTriggerStatuses(
      triggers.map(word => ({
        word,
        detected: false,
      }))
    );
  }, [triggers]);

  // Check for trigger word detection
  useEffect(() => {
    if (!transcript || transcript === lastTranscript) return;

    setLastTranscript(transcript);
    const lowerText = transcript.toLowerCase();

    // Check each trigger word
    setTriggerStatuses(prevStatuses =>
      prevStatuses.map(status => {
        if (status.detected) return status; // Already detected

        const pattern = createTokenPattern(status.word);
        if (pattern.test(lowerText)) {
          console.log(`✅ Detected trigger: "${status.word}"`);
          return {
            ...status,
            detected: true,
            detectedAt: new Date(),
          };
        }
        return status;
      })
    );
  }, [transcript, lastTranscript]);

  // Reset all statuses
  const handleReset = () => {
    setTriggerStatuses(
      triggers.map(word => ({
        word,
        detected: false,
      }))
    );
    setLastTranscript('');
  };

  const detectedCount = triggerStatuses.filter(s => s.detected).length;
  const totalCount = triggerStatuses.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Trigger Word Testing Mode
            </div>
            <Badge variant={streamStatus === 'connected' ? 'default' : 'outline'}>
              {streamStatus === 'connected' ? 'Listening' : streamStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Click "Start Testing" to activate your microphone</li>
              <li>Speak each trigger word clearly</li>
              <li>Watch for the checkmark when a word is detected</li>
              <li>Click "Reset" to test again</li>
            </ol>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleStream}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center gap-2 ${
                isStreaming ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop Testing
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Testing
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={detectedCount === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Reset All
            </button>

            <div className="ml-auto text-sm text-muted-foreground">
              Detected: <span className="font-bold text-primary">{detectedCount}/{totalCount}</span>
            </div>
          </div>

          {/* Trigger Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {triggerStatuses.map((status, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${status.detected
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {status.detected ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`font-semibold ${status.detected ? 'text-green-900' : 'text-gray-700'}`}>
                      "{status.word}"
                    </span>
                  </div>
                </div>
                {status.detectedAt && (
                  <div className="mt-2 text-xs text-green-700">
                    Detected at {status.detectedAt.toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {triggers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No trigger words to test.</p>
              <p className="text-sm mt-2">Add sections with trigger words to enable testing.</p>
            </div>
          )}

          {/* Live Transcript */}
          {isStreaming && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                Live Transcript
                {streamStatus === 'connected' && (
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </h3>
              <div className="bg-gray-50 border rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
                {transcript ? (
                  <p className="text-sm whitespace-pre-wrap">{transcript}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Waiting for speech...</p>
                )}
              </div>
            </div>
          )}

          {/* Success Summary */}
          {detectedCount === totalCount && totalCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900">All trigger words detected!</p>
              <p className="text-sm text-green-700 mt-1">Your microphone and trigger detection are working perfectly.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
