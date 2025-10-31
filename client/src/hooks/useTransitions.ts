import { useState, useEffect } from 'react';

export type TransitionEffect = 'subtle' | 'standard' | 'dramatic';

interface UseTransitionsProps {
  onSectionAdvance?: () => void;
  effect?: TransitionEffect;
}

export function useTransitions({ onSectionAdvance }: UseTransitionsProps = {}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldFlash, setShouldFlash] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      // Flash border effect
      setShouldFlash(true);

      // Reset after animation
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setShouldFlash(false);
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  const triggerTransition = () => {
    setIsTransitioning(true);
    onSectionAdvance?.();
  };

  return {
    isTransitioning,
    shouldFlash,
    triggerTransition,
  };
}
