import { useEffect, useRef } from 'react';
import { usePresentationStore } from '@/stores/usePresentationStore';

/**
 * usePresenterCountdown Hook
 *
 * Manages the countdown delay between trigger word detection and presenter note updates.
 *
 * How it works:
 * 1. Trigger word detected → currentSectionIndex updates IMMEDIATELY (audience sees new slide)
 * 2. Countdown timer starts (progress bar shows at top of presenter notes)
 * 3. After countdown completes → presenterDisplayIndex updates (presenter sees new notes)
 *
 * This gives the presenter a 3-second buffer to finish their current thought
 * while the audience has already moved to the next slide.
 */
export function usePresenterCountdown() {
  const currentSectionIndex = usePresentationStore(state => state.currentSectionIndex);
  const presenterDisplayIndex = usePresentationStore(state => state.presenterDisplayIndex);
  const countdownDuration = usePresentationStore(state => state.countdownDuration);
  const setPresenterDisplayIndex = usePresentationStore(state => state.setPresenterDisplayIndex);
  const setIsCountingDown = usePresentationStore(state => state.setIsCountingDown);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing countdown timer
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    // If currentSectionIndex changed and doesn't match presenter display
    if (currentSectionIndex !== presenterDisplayIndex) {
      console.log(`⏱️  Starting ${countdownDuration}s countdown (audience sees slide ${currentSectionIndex + 1}, presenter still on ${presenterDisplayIndex + 1})`);

      // Start countdown
      setIsCountingDown(true);

      // After countdown duration, update presenter display
      countdownTimerRef.current = setTimeout(() => {
        console.log(`✅ Countdown complete - updating presenter notes to slide ${currentSectionIndex + 1}`);
        setPresenterDisplayIndex(currentSectionIndex);
        setIsCountingDown(false);
        countdownTimerRef.current = null;
      }, countdownDuration * 1000);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [currentSectionIndex, presenterDisplayIndex, countdownDuration, setPresenterDisplayIndex, setIsCountingDown]);

  return {
    isCountingDown: usePresentationStore(state => state.isCountingDown),
    countdownDuration
  };
}
