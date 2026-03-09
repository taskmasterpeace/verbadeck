import { create } from 'zustand';

export interface Answer {
  heading: string;
  brief: string;
  bullets: string[];
  full: string;
  keywords: string[];
}

interface QAState {
  // Current Q&A state
  currentQuestion: string | null;
  questionAnswers: { answer1: Answer; answer2: Answer } | null;
  isLoadingQA: boolean;

  // Manual question input
  manualQuestion: string;

  // Actions
  setCurrentQuestion: (question: string | null) => void;
  setQuestionAnswers: (answers: { answer1: Answer; answer2: Answer } | null) => void;
  setIsLoadingQA: (loading: boolean) => void;
  setManualQuestion: (question: string) => void;

  // Complex actions
  cancelQuestion: () => void;
  dismissQuestion: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentQuestion: null,
  questionAnswers: null,
  isLoadingQA: false,
  manualQuestion: '',
};

export const useQAStore = create<QAState>((set) => ({
  ...initialState,

  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setQuestionAnswers: (answers) => set({ questionAnswers: answers }),
  setIsLoadingQA: (loading) => set({ isLoadingQA: loading }),
  setManualQuestion: (question) => set({ manualQuestion: question }),

  cancelQuestion: () =>
    set({
      currentQuestion: null,
      questionAnswers: null,
      isLoadingQA: false,
    }),

  dismissQuestion: () =>
    set({
      currentQuestion: null,
      questionAnswers: null,
      isLoadingQA: false,
    }),

  reset: () => set(initialState),
}));
