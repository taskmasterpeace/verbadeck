import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

interface PresentationTimerProps {
  /** Whether the presentation is active */
  isActive: boolean;

  /** Current section index (0-based) */
  currentSection: number;

  /** Total number of sections */
  totalSections: number;

  /** Estimated time per section in seconds (optional) */
  estimatedTimePerSection?: number;
}

export function PresentationTimer({
  isActive,
  currentSection,
  totalSections,
  estimatedTimePerSection = 60, // Default: 1 minute per section
}: PresentationTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState(0);

  // Reset timer when presentation becomes active
  useEffect(() => {
    if (isActive && startTime === null) {
      setStartTime(Date.now());
      setElapsedSeconds(0);
      setPausedTime(0);
      setIsPaused(false);
    } else if (!isActive) {
      setStartTime(null);
    }
  }, [isActive, startTime]);

  // Update elapsed time every second
  useEffect(() => {
    if (!isActive || isPaused || startTime === null) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime - pausedTime) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, startTime, pausedTime]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTogglePause = () => {
    if (isPaused) {
      // Resume: add the pause duration to pausedTime
      setPausedTime(pausedTime + (Date.now() - (startTime || 0)));
      setStartTime(Date.now());
    } else {
      // Pause: record when we paused
      setStartTime(Date.now());
    }
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setPausedTime(0);
    setIsPaused(false);
  };

  // Calculate estimated remaining time
  const sectionsRemaining = totalSections - currentSection - 1;
  const estimatedRemainingSeconds = Math.max(0, sectionsRemaining * estimatedTimePerSection);

  // Calculate progress percentage
  const progressPercentage = totalSections > 0 ? ((currentSection + 1) / totalSections) * 100 : 0;

  if (!isActive) return null;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-slate-300 rounded-lg p-3 shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Elapsed Time */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          <div>
            <div className="text-xs text-slate-500 font-medium">Elapsed</div>
            <div className={`text-xl font-mono font-bold ${isPaused ? 'text-amber-600' : 'text-slate-800'}`}>
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1 text-center">
            Section {currentSection + 1} of {totalSections}
          </div>
        </div>

        {/* Estimated Remaining */}
        <div className="text-right">
          <div className="text-xs text-slate-500 font-medium">Est. Remaining</div>
          <div className="text-xl font-mono font-bold text-slate-600">
            {formatTime(estimatedRemainingSeconds)}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePause}
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
            title={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-green-600" />
            ) : (
              <Pause className="w-4 h-4 text-amber-600" />
            )}
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
