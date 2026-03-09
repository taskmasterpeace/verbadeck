import { useState } from 'react';
import { apiPost, isAPIError } from '@/lib/api-client';

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

type SetupPhase = 'idle' | 'analyzing' | 'initial-questions' | 'processing-answers' | 'followup-questions' | 'ready';

interface UseKnowItAllSetupOptions {
  knowledgeBase: string;
  getOperationModel: (operation: string) => string | undefined;
  onSessionReady: () => void;
}

export function useKnowItAllSetup({
  knowledgeBase,
  getOperationModel,
  onSessionReady,
}: UseKnowItAllSetupOptions) {
  const [setupPhase, setSetupPhase] = useState<SetupPhase>('idle');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [initialQuestions, setInitialQuestions] = useState<ContextQuestion[]>([]);
  const [initialAnswers, setInitialAnswers] = useState<{ questionId: string; selectedOptionId: string }[]>([]);
  const [followupQuestions, setFollowupQuestions] = useState<ContextQuestion[]>([]);
  const [followupAnswers, setFollowupAnswers] = useState<{ questionId: string; selectedOptionId: string }[]>([]);
  const [setupError, setSetupError] = useState<string | null>(null);

  const startSetup = async () => {
    setSetupError(null);
    setSetupPhase('analyzing');

    try {
      // Step 1: Analyze knowledge base
      const analysisData = await apiPost<Analysis>('/api/analyze-knowledge-base', {
        knowledgeBase,
        model: getOperationModel('analyzeKnowledgeBase') || undefined,
      });
      setAnalysis(analysisData);

      // Step 2: Generate initial context questions
      setSetupPhase('initial-questions');
      const questionsData = await apiPost<{ questions: ContextQuestion[] }>('/api/generate-context-questions', {
        analysis: analysisData,
        knowledgeBase,
        model: getOperationModel('generateContextQuestions') || undefined,
      });
      setInitialQuestions(questionsData.questions);
    } catch (error) {
      console.error('Setup error:', error);
      const message = isAPIError(error) ? error.message : (error instanceof Error ? error.message : 'Setup failed');
      setSetupError(message);
      setSetupPhase('idle');
    }
  };

  const handleInitialAnswer = (questionId: string, optionId: string) => {
    setInitialAnswers(prev => [
      ...prev.filter(a => a.questionId !== questionId),
      { questionId, selectedOptionId: optionId }
    ]);
  };

  const submitInitialAnswers = async () => {
    setSetupPhase('processing-answers');
    setSetupError(null);

    try {
      // Step 3: Generate follow-up questions based on initial answers
      const followupData = await apiPost<{ questions: ContextQuestion[] }>('/api/generate-followup-questions', {
        analysis,
        initialAnswers,
        knowledgeBase,
        model: getOperationModel('generateFollowupQuestions') || undefined,
      });
      setFollowupQuestions(followupData.questions);
      setSetupPhase('followup-questions');
    } catch (error) {
      console.error('Follow-up generation error:', error);
      const message = isAPIError(error) ? error.message : (error instanceof Error ? error.message : 'Failed to generate follow-up questions');
      setSetupError(message);
      setSetupPhase('initial-questions');
    }
  };

  const handleFollowupAnswer = (questionId: string, optionId: string) => {
    setFollowupAnswers(prev => [
      ...prev.filter(a => a.questionId !== questionId),
      { questionId, selectedOptionId: optionId }
    ]);
  };

  const submitFollowupAnswers = () => {
    // All setup complete - start the session
    setSetupPhase('ready');
    onSessionReady();
  };

  const cancelSetup = () => {
    setSetupPhase('idle');
    setAnalysis(null);
    setInitialQuestions([]);
    setInitialAnswers([]);
    setFollowupQuestions([]);
    setFollowupAnswers([]);
    setSetupError(null);
  };

  return {
    setupPhase,
    analysis,
    initialQuestions,
    initialAnswers,
    followupQuestions,
    followupAnswers,
    setupError,
    startSetup,
    handleInitialAnswer,
    submitInitialAnswers,
    handleFollowupAnswer,
    submitFollowupAnswers,
    cancelSetup,
  };
}
