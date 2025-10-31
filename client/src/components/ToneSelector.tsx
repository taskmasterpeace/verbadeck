import { TONE_OPTIONS, ToneOption } from '../lib/tone-options';

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

export function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/80">Response Personality:</span>
        <span className="text-xs text-white/50">Choose how AI answers this question</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TONE_OPTIONS.map((option: ToneOption) => (
          <button
            key={option.value}
            onClick={() => onToneChange(option.value)}
            className={`
              relative px-3 py-2.5 rounded-lg border transition-all text-left
              ${selectedTone === option.value
                ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500 shadow-lg shadow-purple-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }
            `}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">{option.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${selectedTone === option.value ? 'text-purple-300' : 'text-white'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-white/50 line-clamp-2 mt-0.5">
                  {option.description}
                </div>
              </div>
            </div>
            {selectedTone === option.value && (
              <div className="absolute top-1 right-1">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
