/**
 * SessionStats - Compact single-row stats bar for Know It All Wall session
 * Shows: Timer, Total/Answered/Pending counts, Avg time, Sound toggle, Export
 */

import { QuestionCard } from '../../lib/know-it-all-types';
import { cn } from '../../lib/utils';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { ExportSession } from './ExportSession';

interface SessionStatsProps {
  questions: QuestionCard[];
  elapsedTime: number;
  queueMode: boolean;
  onQueueModeChange: (enabled: boolean) => void;
}

export function SessionStats({ questions, elapsedTime, queueMode, onQueueModeChange }: SessionStatsProps) {
  const { areSoundsEnabled, toggleSounds } = useSoundEffects();
  const [soundsEnabled, setSoundsEnabled] = useState(areSoundsEnabled);

  const handleToggleSounds = () => {
    const newState = toggleSounds();
    setSoundsEnabled(newState);
  };

  const total = questions.length;
  const answered = questions.filter(q => q.status === 'answered').length;
  const pending = questions.filter(q => q.status !== 'answered' && q.status !== 'error').length;
  const errors = questions.filter(q => q.status === 'error').length;

  // Placeholder avg time
  const avgTime = answered > 0 ? '30s' : '--';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs flex-wrap">
      {/* Timer */}
      <span className="font-mono font-bold text-purple-700">{formatTime(elapsedTime)}</span>

      <span className="text-gray-300">|</span>

      {/* Stats inline */}
      <span className="text-gray-600">
        <strong className="text-blue-700">{total}</strong> asked
      </span>
      <span className="text-gray-600">
        <strong className="text-green-700">{answered}</strong> answered
      </span>
      <span className="text-gray-600">
        <strong className="text-amber-700">{pending}</strong> pending
      </span>
      {errors > 0 && (
        <span className="text-red-600">
          <strong>{errors}</strong> failed
        </span>
      )}
      <span className="text-gray-500">avg {avgTime}</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Queue mode toggle */}
      <button
        onClick={() => onQueueModeChange(!queueMode)}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
          queueMode
            ? 'text-blue-700 hover:bg-blue-100'
            : 'text-orange-600 hover:bg-orange-100'
        )}
        title={queueMode ? 'Queue: One at a time — click for Rapid Fire' : 'Rapid Fire: Multiple questions — click for Queue'}
      >
        {queueMode ? '1x' : '⚡'}
        <span className="hidden sm:inline">{queueMode ? 'Queue' : 'Rapid'}</span>
      </button>

      {/* Sound toggle */}
      <button
        onClick={handleToggleSounds}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
          soundsEnabled
            ? 'text-purple-700 hover:bg-purple-100'
            : 'text-gray-400 hover:bg-gray-200'
        )}
        title={soundsEnabled ? 'Sound on' : 'Sound off'}
      >
        {soundsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
      </button>

      {/* Export inline */}
      <ExportSession questions={questions} elapsedTime={elapsedTime} />
    </div>
  );
}
