import { MessageCircleQuestion } from 'lucide-react';

interface Analysis {
  documentTypes: string[];
  primaryUseCase: string;
  detectedContext: string;
  confidence: number;
  suggestedFocus: string[];
}

interface ContextQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
}

interface InitialQuestionsStepProps {
  analysis: Analysis;
  questions: ContextQuestion[];
  answers: { questionId: string; selectedOptionId: string }[];
  onAnswerChange: (questionId: string, optionId: string) => void;
  onCancel: () => void;
  onContinue: () => void;
}

export function InitialQuestionsStep({
  analysis,
  questions,
  answers,
  onAnswerChange,
  onCancel,
  onContinue,
}: InitialQuestionsStepProps) {
  const allAnswered = answers.length === questions.length;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MessageCircleQuestion className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-1">Analysis Complete</h4>
            <p className="text-sm text-muted-foreground">{analysis.detectedContext}</p>
            <div className="flex gap-2 mt-2">
              {analysis.documentTypes.map((type) => (
                <span
                  key={type}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">
          Please answer a few questions to help tailor my responses:
        </p>
        {questions.map((question) => (
          <div key={question.id} className="space-y-2 border rounded-lg p-4">
            <p className="font-medium text-sm">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={answers.some(
                      a => a.questionId === question.id && a.selectedOptionId === option.id
                    )}
                    onChange={() => onAnswerChange(question.id, option.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          disabled={!allAnswered}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
