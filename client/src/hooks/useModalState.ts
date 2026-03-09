import { useState } from 'react';

/**
 * Custom hook to centralize all modal/dialog open/close states
 */
export function useModalState() {
  const [showLibraryBrowser, setShowLibraryBrowser] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);

  return {
    showLibraryBrowser,
    setShowLibraryBrowser,
    showKeyboardHelp,
    setShowKeyboardHelp,
    shortcutFeedback,
    setShortcutFeedback,
  };
}
