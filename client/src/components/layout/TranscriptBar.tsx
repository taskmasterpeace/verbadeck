import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TranscriptBarProps {
  transcript: string[];
  lastTranscript: string;
  isVisible: boolean;
}

export function TranscriptBar({ transcript, lastTranscript, isVisible }: TranscriptBarProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Live Transcript
              </span>
            </div>

            {/* Transcript content */}
            <div className="flex-1 overflow-hidden">
              {lastTranscript ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="truncate text-sm font-medium">
                    {lastTranscript}
                  </p>
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Speak into your microphone...
                </p>
              )}
            </div>

            {/* Transcript history count */}
            {transcript.length > 0 && (
              <div className="hidden sm:block">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {transcript.length} transcripts
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
