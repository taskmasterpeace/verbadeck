import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: string;
  action: () => void;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  preventInInputs?: boolean;
  showFeedback?: (message: string) => void;
}

/**
 * Hook to manage global keyboard shortcuts
 *
 * Features:
 * - Cross-platform (Ctrl on Windows/Linux, Cmd on Mac)
 * - Respects input focus (doesn't trigger in textareas/inputs)
 * - Visual feedback for shortcuts
 * - Enable/disable shortcuts dynamically
 *
 * @example
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { key: 's', ctrl: true, description: 'Save', category: 'File', action: handleSave }
 *   ],
 *   enabled: true,
 *   showFeedback: (msg) => toast(msg)
 * });
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  preventInInputs = true,
  showFeedback,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger if disabled
    if (!enabled) return;

    // Don't trigger in input fields, textareas, or contenteditable elements
    if (preventInInputs) {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isEditable = target.isContentEditable;

      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        isEditable
      ) {
        return;
      }
    }

    // Check if event matches any shortcut
    const matchedShortcut = shortcutsRef.current.find(shortcut => {
      if (shortcut.enabled === false) return false;

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;

      // Must have ctrl/meta if specified
      if (shortcut.ctrl && !(event.ctrlKey || event.metaKey)) return false;

      // Must NOT have ctrl/meta if not specified
      if (!shortcut.ctrl && (event.ctrlKey || event.metaKey)) return false;

      return keyMatches && ctrlMatches && shiftMatches && altMatches;
    });

    if (matchedShortcut) {
      event.preventDefault();
      event.stopPropagation();

      // Show visual feedback if provided
      if (showFeedback) {
        const modifiers = [];
        if (matchedShortcut.ctrl) modifiers.push(isMac() ? '⌘' : 'Ctrl');
        if (matchedShortcut.shift) modifiers.push('Shift');
        if (matchedShortcut.alt) modifiers.push(isMac() ? '⌥' : 'Alt');
        modifiers.push(matchedShortcut.key.toUpperCase());

        showFeedback(`${modifiers.join('+')} - ${matchedShortcut.description}`);
      }

      // Execute the action
      matchedShortcut.action();
    }
  }, [enabled, preventInInputs, showFeedback]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Helper to detect Mac OS
 */
export function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

/**
 * Helper to format shortcut key for display
 */
export function formatShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac() ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac() ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac() ? '⌥' : 'Alt');
  }

  // Format key display
  const keyDisplay = shortcut.key.length === 1
    ? shortcut.key.toUpperCase()
    : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);

  parts.push(keyDisplay);

  return parts.join('+');
}

/**
 * Helper to get OS-specific modifier key symbol
 */
export function getModifierSymbol(modifier: 'ctrl' | 'shift' | 'alt'): string {
  const symbols = {
    ctrl: isMac() ? '⌘' : 'Ctrl',
    shift: isMac() ? '⇧' : 'Shift',
    alt: isMac() ? '⌥' : 'Alt',
  };

  return symbols[modifier];
}
