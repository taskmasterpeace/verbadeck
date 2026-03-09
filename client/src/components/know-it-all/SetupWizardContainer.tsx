import { AnalyzingStep } from './wizard/AnalyzingStep';
import { InitialQuestionsStep } from './wizard/InitialQuestionsStep';
import { ProcessingAnswersStep } from './wizard/ProcessingAnswersStep';
import { FollowupQuestionsStep } from './wizard/FollowupQuestionsStep';
import { useKnowItAllSetup } from '@/hooks/useKnowItAllSetup';

interface SetupWizardContainerProps {
  knowledgeBase: string;
  getOperationModel: (operation: string) => string | undefined;
  onSessionReady: () => void;
  onWarning: (title: string, message: string) => void;
}

export function SetupWizardContainer({
  knowledgeBase,
  getOperationModel,
  onSessionReady,
  onWarning,
}: SetupWizardContainerProps) {
  const {
    setupPhase,
    analysis,
    initialQuestions,
    initialAnswers,
    followupQuestions,
    followupAnswers,
    setupError,
    handleInitialAnswer,
    submitInitialAnswers,
    handleFollowupAnswer,
    submitFollowupAnswers,
    cancelSetup,
  } = useKnowItAllSetup({
    knowledgeBase,
    getOperationModel,
    onSessionReady,
  });

  const handleSubmitInitialAnswers = () => {
    if (initialAnswers.length !== initialQuestions.length) {
      onWarning('Complete All Questions', 'Please answer all questions before continuing.');
      return;
    }
    submitInitialAnswers();
  };

  const handleSubmitFollowupAnswers = () => {
    if (followupAnswers.length !== followupQuestions.length) {
      onWarning('Complete All Questions', 'Please answer all follow-up questions before continuing.');
      return;
    }
    submitFollowupAnswers();
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Setting up your session...</span>
          <span className="text-muted-foreground">
            {setupPhase === 'analyzing' && '1/4'}
            {setupPhase === 'initial-questions' && '2/4'}
            {setupPhase === 'processing-answers' && '3/4'}
            {setupPhase === 'followup-questions' && '4/4'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{
              width:
                setupPhase === 'analyzing' ? '25%' :
                setupPhase === 'initial-questions' ? '50%' :
                setupPhase === 'processing-answers' ? '75%' :
                setupPhase === 'followup-questions' ? '100%' : '0%'
            }}
          />
        </div>
      </div>

      {/* Analyzing Phase */}
      {setupPhase === 'analyzing' && <AnalyzingStep />}

      {/* Initial Questions Phase */}
      {setupPhase === 'initial-questions' && analysis && (
        <InitialQuestionsStep
          analysis={analysis}
          questions={initialQuestions}
          answers={initialAnswers}
          onAnswerChange={handleInitialAnswer}
          onCancel={cancelSetup}
          onContinue={handleSubmitInitialAnswers}
        />
      )}

      {/* Processing Answers Phase */}
      {setupPhase === 'processing-answers' && <ProcessingAnswersStep />}

      {/* Follow-up Questions Phase */}
      {setupPhase === 'followup-questions' && (
        <FollowupQuestionsStep
          questions={followupQuestions}
          answers={followupAnswers}
          onAnswerChange={handleFollowupAnswer}
          onCancel={cancelSetup}
          onStartSession={handleSubmitFollowupAnswers}
        />
      )}

      {/* Error Display */}
      {setupError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <span className="font-medium">Error:</span> {setupError}
          </p>
          <button
            onClick={cancelSetup}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Go back and try again
          </button>
        </div>
      )}
    </div>
  );
}
