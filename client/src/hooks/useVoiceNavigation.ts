import { useState, useCallback, useRef } from 'react';
import { VoiceController } from '../lib/voice-controller';
import { type Section } from '../lib/script-parser';

interface UseVoiceNavigationProps {
  sections: Section[];
  currentSectionIndex: number;
  advanceSection: () => void;
  goBackSection: () => void;
  isListeningForQuestions: boolean;
  handleQuestionDetected: (question: string) => Promise<void>;
  isLoadingQA: boolean;
  handleCancelQuestion: () => void;
  cancelWord: string;
}

export function useVoiceNavigation({
  sections,
  currentSectionIndex,
  advanceSection,
  goBackSection,
  isListeningForQuestions,
  handleQuestionDetected,
  isLoadingQA,
  handleCancelQuestion,
  cancelWord,
}: UseVoiceNavigationProps) {
  // Voice controller for centralized voice detection logic
  const voiceControllerRef = useRef(new VoiceController());
  const voiceController = voiceControllerRef.current;

  // Live transcript
  const [transcript, setTranscript] = useState<string[]>([]);
  const [lastTranscript, setLastTranscript] = useState('');

  // Check for trigger words (no wake/stop words - always advancing)
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    console.log('📝 handleTranscript called:', text, 'isFinal:', isFinal);

    setLastTranscript(text);

    // Add to transcript ticker (only final)
    if (isFinal) {
      setTranscript((prev) => [...prev.slice(-20), text]);
    }

    // Check for CANCEL command when Q&A is loading (highest priority)
    if (isLoadingQA && cancelWord && voiceController.detectCancelWord(text, cancelWord)) {
      handleCancelQuestion();
      return; // Don't process other triggers
    }

    // Check for questions when Q&A mode is enabled (only on final transcripts)
    if (isListeningForQuestions) {
      const question = voiceController.detectQuestion(text, isFinal);
      if (question) {
        handleQuestionDetected(question);
        return; // Don't process other triggers when question detected
      }
    }

    // Check for BACK command first (works on any section except first)
    if (currentSectionIndex > 0 && voiceController.detectBackCommand(text)) {
      goBackSection();
      return; // Don't check for other triggers
    }

    // Check for section-specific trigger words
    if (sections.length > 0 && currentSectionIndex < sections.length) {
      const currentSection = sections[currentSectionIndex];
      const nextSectionIndex = voiceController.detectTriggerWords(
        text,
        currentSection,
        currentSectionIndex
      );

      if (nextSectionIndex !== null) {
        advanceSection();
      }
    }
  }, [
    sections,
    currentSectionIndex,
    advanceSection,
    goBackSection,
    isListeningForQuestions,
    isLoadingQA,
    cancelWord,
    handleCancelQuestion,
    handleQuestionDetected,
    voiceController
  ]);

  return {
    voiceController,
    transcript,
    setTranscript,
    lastTranscript,
    setLastTranscript,
    handleTranscript,
  };
}
