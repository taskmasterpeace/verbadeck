import { useState, useCallback } from 'react';
import { type Section } from '../lib/script-parser';
import { useOpenRouter } from './useOpenRouter';

interface Answer {
  heading: string;
  brief: string;
  bullets: string[];
  full: string;
  keywords: string[];
}

interface UseQASessionProps {
  sections: Section[];
  currentSectionIndex: number;
  knowledgeBase: { question: string; answer: string }[];
  sharedKnowledgeBase?: string; // For Know It All Wall mode - plain text knowledge base
  selectedTone: string;
  getOperationModel: (operation: string) => string | undefined;
  mode?: 'presenter' | 'know-it-all'; // Mode to determine which endpoint to use
}

export function useQASession({
  sections,
  currentSectionIndex,
  knowledgeBase,
  sharedKnowledgeBase,
  selectedTone,
  getOperationModel,
  mode = 'presenter' // Default to presenter mode for backward compatibility
}: UseQASessionProps) {
  const [isListeningForQuestions, setIsListeningForQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<{ answer1: Answer; answer2: Answer } | null>(null);
  const [isLoadingQA, setIsLoadingQA] = useState(false);
  const [qaDialogOpen, setQaDialogOpen] = useState(false);
  const [manualQuestion, setManualQuestion] = useState('');

  const { answerQuestion, answerQuestionWithKeywords, cancelAnswerQuestion } = useOpenRouter();

  // Handle question detection from voice
  const handleQuestionDetected = useCallback(async (question: string) => {
    setCurrentQuestion(question);
    setIsLoadingQA(true);
    setQuestionAnswers(null);

    try {
      const qaModel = getOperationModel('answerQuestion');
      console.log(`💬 Using model for Q&A (${mode} mode): ${qaModel || 'server default'}`);

      let answers;

      if (mode === 'know-it-all') {
        // Know It All Wall mode - use sharedKnowledgeBase (plain text)
        const knowledgeBaseText = sharedKnowledgeBase || '';

        console.log(`🧠 Answering question using knowledge base only (${knowledgeBaseText.length} chars)`);
        answers = await answerQuestionWithKeywords(
          question,
          knowledgeBaseText,
          qaModel,
          selectedTone
        );
      } else {
        // Presenter mode - use slide-aware context
        const presentationContent = sections.map(s => s.content).join('\n\n');

        console.log(`📊 Answering question with slide context (slide ${currentSectionIndex + 1}/${sections.length})`);
        answers = await answerQuestion(
          question,
          presentationContent,
          knowledgeBase,
          qaModel,
          selectedTone,
          sections.map(s => ({ heading: s.heading, content: s.content })),
          currentSectionIndex,
        );
      }

      setQuestionAnswers(answers);
    } catch (error) {
      console.error('Failed to generate answer:', error);
      setQuestionAnswers({
        answer1: {
          heading: 'Error',
          brief: 'Unable to generate answer. Please respond manually.',
          bullets: [],
          full: 'An error occurred while processing your question. Please try asking again.',
          keywords: []
        },
        answer2: {
          heading: 'Error',
          brief: 'Error occurred while processing the question.',
          bullets: [],
          full: 'There was a technical issue. Please check your connection and try again.',
          keywords: []
        }
      });
    } finally {
      setIsLoadingQA(false);
    }
  }, [sections, currentSectionIndex, knowledgeBase, sharedKnowledgeBase, selectedTone, getOperationModel, mode, answerQuestion, answerQuestionWithKeywords]);

  // Cancel current question
  const handleCancelQuestion = useCallback(() => {
    console.log('🛑 Cancelling current question...');
    cancelAnswerQuestion();
    setCurrentQuestion(null);
    setQuestionAnswers(null);
    setIsLoadingQA(false);
  }, [cancelAnswerQuestion]);

  // Dismiss question panel
  const handleDismissQuestion = useCallback(() => {
    setCurrentQuestion(null);
    setQuestionAnswers(null);
    setIsLoadingQA(false);
    setQaDialogOpen(false);
  }, []);

  // Handle manual question submission
  const handleManualQuestion = useCallback(async () => {
    if (!manualQuestion.trim()) {
      alert('Please enter a question');
      return;
    }
    // Close the dialog immediately
    setQaDialogOpen(false);
    // Process the question
    await handleQuestionDetected(manualQuestion);
    // Clear the question
    setManualQuestion('');
  }, [manualQuestion, handleQuestionDetected]);

  return {
    // State
    isListeningForQuestions,
    setIsListeningForQuestions,
    currentQuestion,
    questionAnswers,
    isLoadingQA,
    qaDialogOpen,
    setQaDialogOpen,
    manualQuestion,
    setManualQuestion,

    // Actions
    handleQuestionDetected,
    handleCancelQuestion,
    handleDismissQuestion,
    handleManualQuestion,
  };
}
