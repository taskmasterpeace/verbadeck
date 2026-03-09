import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Question } from '../types';

interface QuestionsStepProps {
  questions: Question[];
  answers: Record<string, string>;
  isProcessing: boolean;
  onAnswerChange: (questionId: string, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function QuestionsStep({
  questions,
  answers,
  isProcessing,
  onAnswerChange,
  onBack,
  onContinue,
}: QuestionsStepProps) {
  const allQuestionsAnswered = questions.every(q => answers[q.id]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="border-2 border-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {index + 1}
                </span>
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {question.type === 'multiple_choice' ? (
                <div className="space-y-2">
                  {question.options?.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => onAnswerChange(question.id, option)}
                      className={`w-full px-4 py-3 rounded-md text-left transition-all border-2 ${
                        answers[question.id] === option
                          ? 'bg-blue-50 border-blue-500 text-blue-900 font-medium'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                  {/* Manual entry option for multiple choice */}
                  <div className="pt-2 border-t">
                    <label className="text-xs text-gray-600 block mb-1">Or enter your own:</label>
                    <input
                      type="text"
                      value={answers[question.id] && !question.options?.includes(answers[question.id]) ? answers[question.id] : ''}
                      onChange={(e) => onAnswerChange(question.id, e.target.value)}
                      placeholder="Type your custom answer..."
                      className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : question.type === 'true_false' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => onAnswerChange(question.id, 'True')}
                    className={`flex-1 px-6 py-4 rounded-md font-semibold transition-all border-2 ${
                      answers[question.id] === 'True'
                        ? 'bg-green-50 border-green-500 text-green-900'
                        : 'bg-white border-gray-200 hover:border-green-300'
                    }`}
                  >
                    ✓ True
                  </button>
                  <button
                    onClick={() => onAnswerChange(question.id, 'False')}
                    className={`flex-1 px-6 py-4 rounded-md font-semibold transition-all border-2 ${
                      answers[question.id] === 'False'
                        ? 'bg-red-50 border-red-500 text-red-900'
                        : 'bg-white border-gray-200 hover:border-red-300'
                    }`}
                  >
                    × False
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  placeholder={question.placeholder || 'Your answer...'}
                  className="w-full px-4 py-3 rounded-md border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onContinue}
            disabled={isProcessing || !allQuestionsAnswered}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Slides...
              </>
            ) : (
              <>
                Generate Slides
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </CardContent>
      </Card>
    </>
  );
}
