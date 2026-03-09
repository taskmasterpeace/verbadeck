import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronRight } from 'lucide-react';
import type { QuestionTypePreferences } from '../types';

interface TopicInputStepProps {
  topic: string;
  numSlides: number;
  questionPreferences: QuestionTypePreferences;
  useAISelection: boolean;
  isProcessing: boolean;
  onTopicChange: (topic: string) => void;
  onNumSlidesChange: (numSlides: number) => void;
  onQuestionPreferencesChange: (preferences: Partial<QuestionTypePreferences>) => void;
  onToggleAISelection: () => void;
  onContinue: () => void;
}

export function TopicInputStep({
  topic,
  numSlides,
  questionPreferences,
  useAISelection,
  isProcessing,
  onTopicChange,
  onNumSlidesChange,
  onQuestionPreferencesChange,
  onToggleAISelection,
  onContinue,
}: TopicInputStepProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            What's your presentation about?
          </label>
          <textarea
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="e.g., AI-powered meeting assistant for sales teams, Sustainable energy solutions for urban areas..."
            className="w-full h-32 px-4 py-3 rounded-md border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Number of Slides</label>
            <span className="text-2xl font-bold text-blue-600">{numSlides}</span>
          </div>
          <input
            type="range"
            min="3"
            max="25"
            value={numSlides}
            onChange={(e) => onNumSlidesChange(parseInt(e.target.value))}
            className="w-full"
            disabled={isProcessing}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 slides</span>
            <span>25 slides</span>
          </div>
        </div>

        {/* Question Type Preferences */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Question Types</label>
            <button
              onClick={onToggleAISelection}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                useAISelection
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {useAISelection ? '🤖 AI Decides' : '✋ Manual'}
            </button>
          </div>

          {!useAISelection && (
            <div className="space-y-4">
              {/* Multiple Choice Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Multiple Choice</span>
                  <span className="text-sm font-bold text-blue-600">{questionPreferences.multiple_choice}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={questionPreferences.multiple_choice}
                  onChange={(e) => onQuestionPreferencesChange({
                    multiple_choice: parseInt(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isProcessing}
                />
              </div>

              {/* True/False Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">True/False</span>
                  <span className="text-sm font-bold text-green-600">{questionPreferences.true_false}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={questionPreferences.true_false}
                  onChange={(e) => onQuestionPreferencesChange({
                    true_false: parseInt(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isProcessing}
                />
              </div>

              {/* Fill in the Blank Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Fill in the Blank</span>
                  <span className="text-sm font-bold text-amber-600">{questionPreferences.fill_in_blank}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={questionPreferences.fill_in_blank}
                  onChange={(e) => onQuestionPreferencesChange({
                    fill_in_blank: parseInt(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isProcessing}
                />
              </div>

              <p className="text-xs text-muted-foreground italic">
                💡 Tip: Percentages don't need to add up to 100%. AI will use these as guidelines.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onContinue}
          disabled={isProcessing || !topic.trim()}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}
