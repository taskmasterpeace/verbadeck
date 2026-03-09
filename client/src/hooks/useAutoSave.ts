import { useEffect, useRef, useState } from 'react';
import type { Section } from '@/lib/script-parser';
import type { PresentationData } from '@/lib/file-storage';

const AUTO_SAVE_KEY = 'verbadeck-autosave';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  hasAutoSave: boolean;
}

interface UseAutoSaveParams {
  sections: Section[];
  knowledgeBase: { question: string; answer: string }[];
  settings: {
    selectedTone?: string;
    selectedModel?: string;
    currentSectionIndex?: number;
    viewMode?: string;
  };
  enabled: boolean; // Only auto-save when not streaming
}

export function useAutoSave({
  sections,
  knowledgeBase,
  settings,
  enabled,
}: UseAutoSaveParams) {
  const [status, setStatus] = useState<AutoSaveStatus>({
    isSaving: false,
    lastSaved: null,
    hasAutoSave: false,
  });

  const lastSaveContentRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Check if there's an auto-save on mount
  useEffect(() => {
    const autoSave = localStorage.getItem(AUTO_SAVE_KEY);
    setStatus(prev => ({
      ...prev,
      hasAutoSave: !!autoSave,
    }));
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !Array.isArray(sections) || sections.length === 0) {
      return;
    }

    // Create a fingerprint of current state
    const currentContent = JSON.stringify({
      sections: sections.map(s => ({ id: s.id, content: s.content, advanceToken: s.advanceToken })),
      knowledgeBaseLength: knowledgeBase.length,
      settingsFingerprint: `${settings.selectedModel}-${settings.currentSectionIndex}`,
    });

    // Only save if content has changed
    if (currentContent === lastSaveContentRef.current) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule auto-save
    saveTimeoutRef.current = setTimeout(() => {
      setStatus(prev => ({ ...prev, isSaving: true }));

      try {
        const data: PresentationData = {
          version: '1.0',
          title: 'Auto-saved Presentation',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          sections,
          knowledgeBase,
          settings,
          metadata: {
            totalSlides: sections.length,
            model: settings.selectedModel,
          },
        };

        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
        lastSaveContentRef.current = currentContent;

        setStatus({
          isSaving: false,
          lastSaved: new Date(),
          hasAutoSave: true,
        });

        console.log('💾 Auto-saved presentation');
      } catch (error) {
        console.error('Auto-save failed:', error);
        setStatus(prev => ({ ...prev, isSaving: false }));
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [sections, knowledgeBase, settings, enabled]);

  // Load auto-save
  const loadAutoSave = (): PresentationData | null => {
    try {
      const autoSave = localStorage.getItem(AUTO_SAVE_KEY);
      if (!autoSave) return null;

      const data = JSON.parse(autoSave) as PresentationData;
      console.log('📂 Loaded auto-saved presentation');
      return data;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  };

  // Clear auto-save (call this after successful manual save)
  const clearAutoSave = () => {
    localStorage.removeItem(AUTO_SAVE_KEY);
    setStatus(prev => ({ ...prev, hasAutoSave: false }));
    console.log('🗑️ Cleared auto-save');
  };

  return {
    status,
    loadAutoSave,
    clearAutoSave,
  };
}
