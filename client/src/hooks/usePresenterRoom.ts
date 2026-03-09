import { useState, useCallback, useEffect, useRef } from 'react';
import { useControllerSocket } from './useControllerSocket';
import { usePresentationStore } from '@/stores';

export function usePresenterRoom() {
  const [isHosting, setIsHosting] = useState(false);
  const [qaFromRemote, setQaFromRemote] = useState(false);

  const sections = usePresentationStore((s) => s.sections);
  const currentSectionIndex = usePresentationStore((s) => s.currentSectionIndex);

  const handleRemoteNavigate = useCallback((direction: 'next' | 'prev' | number) => {
    const store = usePresentationStore.getState();
    if (direction === 'next') store.nextSection();
    else if (direction === 'prev') store.previousSection();
    else if (typeof direction === 'number') store.setCurrentSectionIndex(direction);
  }, []);

  const handleRemoteToggleQA = useCallback((enabled: boolean) => {
    setQaFromRemote(enabled);
  }, []);

  const handleRemoteDismissQA = useCallback(() => {
    setQaFromRemote(false);
  }, []);

  const socket = useControllerSocket({
    role: 'presenter',
    onNavigate: isHosting ? handleRemoteNavigate : undefined,
    onToggleQA: isHosting ? handleRemoteToggleQA : undefined,
    onDismissQA: isHosting ? handleRemoteDismissQA : undefined,
  });

  // Broadcast state changes to controllers
  const prevStateRef = useRef({ currentSectionIndex, sectionsLength: sections.length });

  useEffect(() => {
    if (!isHosting || !socket.isConnected) return;
    const prev = prevStateRef.current;
    if (prev.currentSectionIndex !== currentSectionIndex || prev.sectionsLength !== sections.length) {
      socket.sendStateUpdate({
        currentIndex: currentSectionIndex,
        totalSlides: sections.length,
        sections: sections.map(s => ({ heading: s.heading, content: s.content, advanceToken: s.advanceToken })),
        isStreaming: false,
        qaState: null,
      });
      prevStateRef.current = { currentSectionIndex, sectionsLength: sections.length };
    }
  }, [isHosting, socket.isConnected, currentSectionIndex, sections, socket.sendStateUpdate]);

  const startHosting = useCallback(() => setIsHosting(true), []);
  const stopHosting = useCallback(() => setIsHosting(false), []);

  return {
    isHosting,
    startHosting,
    stopHosting,
    roomCode: socket.roomCode,
    isConnected: socket.isConnected,
    qaFromRemote,
    setQaFromRemote,
    sendQAUpdate: socket.sendQAUpdate,
    sendDismissQA: socket.sendDismissQA,
  };
}
