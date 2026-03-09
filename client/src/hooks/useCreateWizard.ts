import { useState, useCallback } from 'react';
import type { WizardStep, WizardData, Question, Slide } from '@/components/create/types';

const INITIAL_DATA: WizardData = {
  topic: '',
  numSlides: 5,
  questionPreferences: {
    multiple_choice: 40,
    true_false: 30,
    fill_in_blank: 30,
  },
  useAISelection: true,
  questions: [],
  answers: {},
  slides: [],
  selectedOptions: {},
};

export function useCreateWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('topic');
  const [data, setData] = useState<WizardData>(INITIAL_DATA);

  // Update data functions
  const updateTopic = useCallback((topic: string) => {
    setData(prev => ({ ...prev, topic }));
  }, []);

  const updateNumSlides = useCallback((numSlides: number) => {
    setData(prev => ({ ...prev, numSlides }));
  }, []);

  const updateQuestionPreferences = useCallback((preferences: Partial<WizardData['questionPreferences']>) => {
    setData(prev => ({
      ...prev,
      questionPreferences: { ...prev.questionPreferences, ...preferences }
    }));
  }, []);

  const toggleAISelection = useCallback(() => {
    setData(prev => ({ ...prev, useAISelection: !prev.useAISelection }));
  }, []);

  const setQuestions = useCallback((questions: Question[]) => {
    setData(prev => ({ ...prev, questions }));
  }, []);

  const updateAnswer = useCallback((questionId: string, value: string) => {
    setData(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value }
    }));
  }, []);

  const setSlides = useCallback((slides: Slide[]) => {
    setData(prev => {
      // Pre-select first option for each slide
      const initialSelections: Record<number, number> = {};
      slides.forEach((slide) => {
        initialSelections[slide.position] = 0;
      });
      return {
        ...prev,
        slides,
        selectedOptions: initialSelections
      };
    });
  }, []);

  const updateSlideSelection = useCallback((slidePosition: number, optionIndex: number) => {
    setData(prev => ({
      ...prev,
      selectedOptions: { ...prev.selectedOptions, [slidePosition]: optionIndex }
    }));
  }, []);

  // Navigation functions
  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev === 'topic') return 'questions';
      if (prev === 'questions') return 'slides';
      if (prev === 'slides') return 'speaker-notes';
      return prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev === 'questions') return 'topic';
      if (prev === 'slides') return 'questions';
      if (prev === 'speaker-notes') return 'slides';
      return prev;
    });
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  // Progress calculation
  const getProgressPercentage = useCallback(() => {
    switch (currentStep) {
      case 'topic': return 0;
      case 'questions': return 25;
      case 'slides': return 50;
      case 'speaker-notes': return 75;
      case 'review': return 100;
      default: return 0;
    }
  }, [currentStep]);

  const getStepNumber = useCallback(() => {
    switch (currentStep) {
      case 'topic': return 1;
      case 'questions': return 2;
      case 'slides': return 3;
      case 'speaker-notes': return 4;
      case 'review': return 5;
      default: return 1;
    }
  }, [currentStep]);

  return {
    // State
    currentStep,
    data,

    // Data update functions
    updateTopic,
    updateNumSlides,
    updateQuestionPreferences,
    toggleAISelection,
    setQuestions,
    updateAnswer,
    setSlides,
    updateSlideSelection,

    // Navigation
    nextStep,
    prevStep,
    goToStep,

    // Progress
    getProgressPercentage,
    getStepNumber,
  };
}
