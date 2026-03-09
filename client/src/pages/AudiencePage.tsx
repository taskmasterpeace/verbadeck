import { useState, useEffect, useRef } from 'react';
import { AudienceView } from '@/components/AudienceView';
import { usePresentationStore } from '@/stores';
import { useBroadcastSync } from '@/hooks/useBroadcastSync';

/**
 * AudiencePage - Clean presentation view for audience (dual monitor support)
 *
 * Features:
 * - Auto-syncs with presenter view via BroadcastChannel
 * - Receives updates when presenter navigates
 * - Requests initial state on mount
 * - Uses Zustand store for state management
 */
export function AudiencePage() {
  const { sections, currentSectionIndex } = usePresentationStore();
  const [shouldFlash, setShouldFlash] = useState(false);

  // Initialize BroadcastChannel sync in audience mode
  useBroadcastSync('audience');

  // Track section changes for flash effect
  const prevIndexRef = useRef(currentSectionIndex);

  useEffect(() => {
    // Trigger flash effect when section changes
    if (currentSectionIndex !== prevIndexRef.current) {
      setShouldFlash(true);
      setTimeout(() => setShouldFlash(false), 800); // Match flash duration
      prevIndexRef.current = currentSectionIndex;
    }
  }, [currentSectionIndex]);

  const currentSection = sections[currentSectionIndex];
  const progress = sections.length > 0
    ? ((currentSectionIndex + 1) / sections.length) * 100
    : 0;

  return (
    <AudienceView
      currentSection={currentSection}
      sectionIndex={currentSectionIndex}
      totalSections={sections.length}
      progress={progress}
      shouldFlash={shouldFlash}
    />
  );
}
