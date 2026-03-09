interface ContextQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
}

interface FollowupQuestionsStepProps {
  questions: ContextQuestion[];
  answers: { questionId: string; selectedOptionId: string }[];
  onAnswerChange: (questionId: string, optionId: string) => void;
  onCancel: () => void;
  onStartSession: () => void;
}

export function FollowupQuestionsStep({
  questions,
  answers,
  onAnswerChange,
  onCancel,
  onStartSession,
}: FollowupQuestionsStepProps) {
  const allAnswered = answers.length === questions.length;

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm">
          <span className="font-medium">Almost there!</span> Just a couple more questions to refine my understanding.
        </p>
      </div>

      <div className="space-y-4">
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
          onClick={onStartSession}
          disabled={!allAnswered}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Session
        </button>
      </div>
    </div>
  );
}
