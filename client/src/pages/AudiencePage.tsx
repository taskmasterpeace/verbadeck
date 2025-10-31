import { useEffect, useState } from 'react';
import { AudienceView } from '@/components/AudienceView';
import type { Section } from '@/lib/script-parser';

interface PresentationState {
  currentSectionIndex: number;
  sections: Section[];
}

export function AudiencePage() {
  const [state, setState] = useState<PresentationState>({
    currentSectionIndex: 0,
    sections: [],
  });

  useEffect(() => {
    // Listen for updates from presenter window via BroadcastChannel
    const channel = new BroadcastChannel('verbadeck-presentation');

    channel.onmessage = (event) => {
      if (event.data.type === 'presentation-update') {
        setState(event.data.state);
      }
    };

    // Request initial state
    channel.postMessage({ type: 'request-state' });

    return () => {
      channel.close();
    };
  }, []);

  const currentSection = state.sections[state.currentSectionIndex];
  const progress = state.sections.length > 0
    ? ((state.currentSectionIndex + 1) / state.sections.length) * 100
    : 0;

  return (
    <AudienceView
      currentSection={currentSection}
      sectionIndex={state.currentSectionIndex}
      totalSections={state.sections.length}
      progress={progress}
    />
  );
}
