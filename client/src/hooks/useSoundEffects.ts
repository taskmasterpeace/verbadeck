/**
 * useSoundEffects - Play sound effects for Know It All Wall events
 * Supports toggling sound on/off via localStorage
 */

import { useCallback, useRef } from 'react';

export type SoundEffect = 'keyword-detected' | 'question-detected' | 'answer-selected';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Check if sounds are enabled (localStorage)
  const areSoundsEnabled = useCallback(() => {
    try {
      const setting = localStorage.getItem('verbadeck-sounds-enabled');
      return setting === null || setting === 'true'; // Default to enabled
    } catch {
      return true; // Default to enabled if localStorage unavailable
    }
  }, []);

  // Toggle sounds on/off
  const toggleSounds = useCallback(() => {
    const currentSetting = areSoundsEnabled();
    try {
      localStorage.setItem('verbadeck-sounds-enabled', String(!currentSetting));
    } catch {
      console.warn('Could not save sound preference to localStorage');
    }
    return !currentSetting;
  }, [areSoundsEnabled]);

  // Play a beep sound using Web Audio API (no need for audio files)
  const playSound = useCallback((type: SoundEffect) => {
    if (!areSoundsEnabled()) return;

    try {
      // Create AudioContext lazily
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different frequencies and durations for different events
      switch (type) {
        case 'keyword-detected':
          oscillator.frequency.value = 800; // High pitch
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.1);
          break;

        case 'question-detected':
          oscillator.frequency.value = 600; // Medium pitch
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);
          break;

        case 'answer-selected':
          // Success sound: two-tone
          const oscillator2 = ctx.createOscillator();
          const gainNode2 = ctx.createGain();

          oscillator2.connect(gainNode2);
          gainNode2.connect(ctx.destination);

          oscillator.frequency.value = 600;
          oscillator2.frequency.value = 800;

          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

          gainNode2.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.1);

          oscillator2.start(ctx.currentTime + 0.1);
          oscillator2.stop(ctx.currentTime + 0.25);
          break;
      }
    } catch (error) {
      console.warn('Failed to play sound effect:', error);
    }
  }, [areSoundsEnabled]);

  return {
    playSound,
    areSoundsEnabled: areSoundsEnabled(),
    toggleSounds,
  };
}
