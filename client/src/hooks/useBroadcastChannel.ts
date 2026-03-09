import { useEffect, useRef, useMemo } from 'react';
import { type Section } from '../lib/script-parser';

// Type definitions for Window Management API (experimental browser API)
interface ScreenDetails {
  screens: ScreenDetailed[];
  currentScreen: ScreenDetailed;
}

interface ScreenDetailed {
  left: number;
  top: number;
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  isPrimary: boolean;
  isInternal: boolean;
  devicePixelRatio: number;
  label: string;
}

// Extend Window interface to include getScreenDetails
interface WindowWithScreenDetails extends Window {
  getScreenDetails?: () => Promise<ScreenDetails>;
}

interface BroadcastState {
  currentSectionIndex: number;
  sections: Section[];
}

/**
 * Custom hook to manage BroadcastChannel for syncing presenter and audience views
 */
export function useBroadcastChannel(currentSectionIndex: number, sections: Section[]) {
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const currentStateRef = useRef<BroadcastState>({ currentSectionIndex, sections });

  // Memoize serialized sections to avoid expensive JSON operations on every render
  const plainSections = useMemo(() => {
    return Array.isArray(sections) ? JSON.parse(JSON.stringify(sections)) : [];
  }, [sections]);

  // Keep state ref up-to-date
  currentStateRef.current = { currentSectionIndex, sections };

  // Set up broadcast channel for audience view
  useEffect(() => {
    const channel = new BroadcastChannel('verbadeck-presentation');
    broadcastChannelRef.current = channel;

    // Listen for state requests from audience window
    channel.onmessage = (event) => {
      if (event.data.type === 'request-state') {
        // Use ref to get current values instead of closure
        const { currentSectionIndex, sections } = currentStateRef.current;

        // Serialize sections to plain objects (remove any Zustand proxies/functions)
        const plainSections = Array.isArray(sections) ? JSON.parse(JSON.stringify(sections)) : [];

        channel.postMessage({
          type: 'presentation-update',
          state: {
            currentSectionIndex,
            sections: plainSections,
          },
        });
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Broadcast state changes to audience view
  useEffect(() => {
    if (broadcastChannelRef.current && Array.isArray(sections)) {
      // Use memoized plainSections (only re-serialized when sections change)
      broadcastChannelRef.current.postMessage({
        type: 'presentation-update',
        state: {
          currentSectionIndex,
          sections: plainSections,
        },
      });
    }
  }, [currentSectionIndex, sections, plainSections]);

  /**
   * Open audience view in new window with Window Management API support
   */
  const openAudienceView = async () => {
    try {
      // Try to use Window Management API for multi-screen support
      if ('getScreenDetails' in window) {
        const screenDetails = await (window as WindowWithScreenDetails).getScreenDetails?.();
        if (!screenDetails) {
          throw new Error('getScreenDetails returned undefined');
        }
        console.log('📺 Screens detected:', screenDetails.screens.length);

        // If multiple screens, open on the second screen
        if (screenDetails.screens.length > 1) {
          const externalScreen = screenDetails.screens[1];
          const audienceWindow = window.open(
            '/audience',
            'VerbaDeck Audience View',
            `left=${externalScreen.left},top=${externalScreen.top},width=${externalScreen.availWidth},height=${externalScreen.availHeight},menubar=no,toolbar=no,location=no,status=no`
          );

          if (audienceWindow) {
            // Try to make it fullscreen on the external display
            try {
              await (audienceWindow.document.documentElement as any).requestFullscreen({
                screen: externalScreen
              });
              console.log('✅ Fullscreen on external display');
            } catch (err) {
              console.log('ℹ️ Fullscreen not supported or denied');
            }
          } else {
            alert('Please allow popups to open the audience view');
          }
          return;
        }
      }
    } catch (err) {
      console.log('ℹ️ Window Management API not available, using fallback');
    }

    // Fallback: Standard window.open
    const audienceWindow = window.open(
      '/audience',
      'VerbaDeck Audience View',
      'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no'
    );

    if (!audienceWindow) {
      alert('Please allow popups to open the audience view');
    }
  };

  return {
    openAudienceView,
  };
}
