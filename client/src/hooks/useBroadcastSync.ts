import { useEffect, useRef } from 'react';
import { usePresentationStore } from '../stores/usePresentationStore';

/**
 * Custom hook for BroadcastChannel synchronization between presenter and audience views.
 *
 * This hook manages bidirectional communication:
 * - Presenter broadcasts state changes to audience
 * - Audience requests initial state on mount
 * - Auto-syncs on store changes
 *
 * Usage:
 * - In App.tsx (presenter): useBroadcastSync('presenter')
 * - In AudiencePage.tsx (audience): useBroadcastSync('audience')
 */

type SyncMode = 'presenter' | 'audience';

interface BroadcastMessage {
  type: 'presentation-update' | 'request-state';
  state?: {
    currentSectionIndex: number;
    sections: any[];
  };
}

export function useBroadcastSync(mode: SyncMode) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const {
    sections,
    currentSectionIndex,
    setCurrentSectionIndex,
    setSections,
  } = usePresentationStore();

  useEffect(() => {
    // Create BroadcastChannel
    const channel = new BroadcastChannel('verbadeck-presentation');
    channelRef.current = channel;

    console.log(`📡 BroadcastChannel initialized in ${mode} mode`);

    if (mode === 'presenter') {
      // PRESENTER MODE: Listen for state requests from audience
      channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        if (event.data.type === 'request-state') {
          console.log('📤 Presenter: Sending current state to audience');
          channel.postMessage({
            type: 'presentation-update',
            state: {
              currentSectionIndex,
              sections,
            },
          } as BroadcastMessage);
        }
      };
    } else {
      // AUDIENCE MODE: Listen for updates from presenter
      channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        if (event.data.type === 'presentation-update' && event.data.state) {
          const { currentSectionIndex: newIndex, sections: newSections } = event.data.state;

          console.log(`📥 Audience: Received update - Slide ${newIndex + 1}/${newSections.length}`);

          // Update Zustand store
          setSections(newSections);
          setCurrentSectionIndex(newIndex);
        }
      };

      // Request initial state from presenter
      console.log('📡 Audience: Requesting initial state from presenter');
      channel.postMessage({ type: 'request-state' } as BroadcastMessage);
    }

    // Cleanup on unmount
    return () => {
      console.log(`📡 BroadcastChannel closed in ${mode} mode`);
      channel.close();
      channelRef.current = null;
    };
  }, [mode]); // Only re-run if mode changes (which shouldn't happen)

  // PRESENTER MODE: Auto-broadcast on state changes
  useEffect(() => {
    if (mode === 'presenter' && channelRef.current) {
      console.log(`📤 Presenter: Broadcasting update - Slide ${currentSectionIndex + 1}/${sections.length}`);
      channelRef.current.postMessage({
        type: 'presentation-update',
        state: {
          currentSectionIndex,
          sections,
        },
      } as BroadcastMessage);
    }
  }, [mode, currentSectionIndex, sections]);

  return {
    channel: channelRef.current,
    isConnected: !!channelRef.current,
  };
}
