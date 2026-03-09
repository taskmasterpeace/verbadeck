import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CountdownProgressBarProps {
  duration: number; // Duration in seconds
  onComplete: () => void; // Callback when countdown finishes
}

/**
 * CountdownProgressBar Component
 *
 * Shows a smooth progress bar countdown at the top of presenter notes.
 * Used to delay presenter note changes while audience view updates immediately.
 *
 * Design Decision: Progress bar at top of presenter notes (per user feedback)
 */
export function CountdownProgressBar({ duration, onComplete }: CountdownProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, endTime - now);

      // Update progress (0 to 100)
      const newProgress = Math.min(100, (elapsed / (duration * 1000)) * 100);
      setProgress(newProgress);

      // Update time remaining
      setTimeRemaining(Math.ceil(remaining / 1000));

      // Check if complete
      if (newProgress >= 100) {
        clearInterval(interval);
        onComplete();
      }
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-amber-900">
            Notes updating in {timeRemaining}s...
          </span>
        </div>

        <div className="text-xs text-amber-700">
          Audience sees new slide
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-amber-100 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-600"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
