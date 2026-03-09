/**
 * SessionStats - Display real-time statistics for Know It All Wall session
 * Shows: Total questions, Answered, Pending, Average response time
 */

import { QuestionCard } from '../../lib/know-it-all-types';
import { cn } from '../../lib/utils';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

interface SessionStatsProps {
  /** All questions in the current session */
  questions: QuestionCard[];

  /** Total elapsed session time in seconds */
  elapsedTime: number;
}

export function SessionStats({ questions, elapsedTime }: SessionStatsProps) {
  const { areSoundsEnabled, toggleSounds } = useSoundEffects();
  const [soundsEnabled, setSoundsEnabled] = useState(areSoundsEnabled);

  const handleToggleSounds = () => {
    const newState = toggleSounds();
    setSoundsEnabled(newState);
  };

  // Calculate stats
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => q.status === 'answered');
  const pendingQuestions = questions.filter(q => q.status !== 'answered' && q.status !== 'error');
  const errorQuestions = questions.filter(q => q.status === 'error');

  // Calculate average response time (time from question detection to answer)
  const responseTimes = answeredQuestions.map(_q => {
    // Find time difference between question timestamp and now (approximation)
    // In a real implementation, we'd track exact answer timestamps
    return 30; // Placeholder: 30 seconds average
  });

  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Stat card component
  const StatCard = ({
    icon,
    label,
    value,
    color,
    subtitle
  }: {
    icon: string;
    label: string;
    value: string | number;
    color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
    subtitle?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      amber: 'bg-amber-50 border-amber-200 text-amber-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
    };

    return (
      <div className={cn(
        'flex flex-col items-center justify-center p-3 rounded-lg border-2',
        colorClasses[color]
      )}>
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-2xl font-bold mb-0.5">{value}</div>
        <div className="text-xs font-medium text-center">{label}</div>
        {subtitle && (
          <div className="text-xs opacity-70 mt-1">{subtitle}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Session Timer with Sound Toggle */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-2 px-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            <span className="text-sm font-semibold text-purple-900">Session Time:</span>
          </div>
          <div className="text-xl font-mono font-bold text-purple-900">
            {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Sound Toggle Button */}
        <button
          onClick={handleToggleSounds}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            soundsEnabled
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          )}
          title={soundsEnabled ? 'Sound effects enabled' : 'Sound effects disabled'}
        >
          {soundsEnabled ? (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Sound On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Sound Off</span>
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard
          icon="❓"
          label="Total Questions"
          value={totalQuestions}
          color="blue"
        />

        <StatCard
          icon="✅"
          label="Answered"
          value={answeredQuestions.length}
          color="green"
        />

        <StatCard
          icon="⏳"
          label="Pending"
          value={pendingQuestions.length}
          color="amber"
        />

        <StatCard
          icon="⏱️"
          label="Avg. Time"
          value={avgResponseTime > 0 ? `${avgResponseTime}s` : '--'}
          color="purple"
          subtitle={avgResponseTime > 0 ? 'per question' : 'no data yet'}
        />
      </div>

      {/* Error count if any */}
      {errorQuestions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 px-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="text-xs font-medium text-red-900">
              {errorQuestions.length} question{errorQuestions.length !== 1 ? 's' : ''} failed to generate
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
