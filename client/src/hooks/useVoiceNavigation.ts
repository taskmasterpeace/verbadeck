import { useState, useCallback, useRef } from 'react';
import { VoiceController } from '../lib/voice-controller';
import { type Section } from '../lib/script-parser';
import { useVoiceStore } from '../stores/voice';

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

// VD-1: minimum gap between auto-detected questions, so the presenter's own continuous speech
// (rhetorical / role-play questions, thinking aloud) can't re-trigger Q&A back-to-back.
const QUESTION_COOLDOWN_MS = 8000;

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

  // Zustand voice store - sync transcripts globally
  const setStoreLastTranscript = useVoiceStore((state) => state.setLastTranscript);

  // Live transcript
  const [transcript, setTranscript] = useState<string[]>([]);
  const [lastTranscript, setLastTranscript] = useState('');
  // VD-1: timestamp of the last auto-detected question (cooldown guard).
  const lastQuestionTimeRef = useRef(0);

  // Check for trigger words (no wake/stop words - always advancing)
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    console.log('📝 handleTranscript called:', text, 'isFinal:', isFinal);

    setLastTranscript(text);
    // Sync to Zustand store so KnowItAllMode and other consumers get the transcript
    setStoreLastTranscript(text, isFinal);

    // Add to transcript ticker (only final)
    if (isFinal) {
      setTranscript((prev) => [...prev.slice(-20), text]);
    }

    // Check for CANCEL command when Q&A is loading (highest priority)
    if (isLoadingQA && cancelWord && voiceController.detectCancelWord(text, cancelWord)) {
      handleCancelQuestion();
      return; // Don't process other triggers
    }

    // Check for questions when Q&A mode is enabled (only on final transcripts).
    // VD-1: never while one is already being answered (isLoadingQA), and not within the cooldown —
    // otherwise the presenter's own continuous speech re-fires Q&A back-to-back.
    if (isListeningForQuestions && !isLoadingQA && Date.now() - lastQuestionTimeRef.current > QUESTION_COOLDOWN_MS) {
      const question = voiceController.detectQuestion(text, isFinal);
      if (question) {
        lastQuestionTimeRef.current = Date.now();
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
    voiceController,
    setStoreLastTranscript
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
