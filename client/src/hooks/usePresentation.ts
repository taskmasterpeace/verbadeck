import { useCallback } from 'react';
import { type Section } from '../lib/script-parser';
import { VoiceController } from '../lib/voice-controller';
import { useTransitions } from './useTransitions';
import { usePresentationStore } from '@/stores/usePresentationStore';

interface UsePresentationProps {
  voiceController: VoiceController;
}

export function usePresentation({ voiceController }: UsePresentationProps) {
  // Use Zustand store instead of local state
  const sections = usePresentationStore((state) => state.sections);
  const setSections = usePresentationStore((state) => state.setSections);
  const currentSectionIndex = usePresentationStore((state) => state.currentSectionIndex);
  const setCurrentSectionIndex = usePresentationStore((state) => state.setCurrentSectionIndex);
  const draggedIndex = usePresentationStore((state) => state.draggedIndex);
  const setDraggedIndex = usePresentationStore((state) => state.setDraggedIndex);
  const dragOverIndex = usePresentationStore((state) => state.dragOverIndex);
  const setDragOverIndex = usePresentationStore((state) => state.setDragOverIndex);

  const { shouldFlash, triggerTransition } = useTransitions();

  // Advance to next section
  const advanceSection = useCallback(() => {
    if (voiceController.isDebounced()) {
      return;
    }

    setCurrentSectionIndex((prev) => {
      if (prev < sections.length - 1) {
        const next = prev + 1;
        console.log(`➡️ Advancing to section ${next + 1}/${sections.length}`);
        voiceController.recordNavigation();
        triggerTransition(); // Visual feedback
        return next;
      }
      console.log('🏁 Already at last section');
      return prev;
    });
  }, [sections.length, triggerTransition, voiceController]);

  // Go back to previous section
  const goBackSection = useCallback(() => {
    if (voiceController.isDebounced()) {
      return;
    }

    setCurrentSectionIndex((prev) => {
      if (prev > 0) {
        const prevIdx = prev - 1;
        console.log(`⬅️ Going back to section ${prevIdx + 1}/${sections.length}`);
        voiceController.recordNavigation();
        triggerTransition(); // Visual feedback
        return prevIdx;
      }
      console.log('🏁 Already at first section');
      return prev;
    });
  }, [sections.length, triggerTransition, voiceController]);

  // Manual section navigation (for testing)
  const goToSection = useCallback((index: number) => {
    if (index >= 0 && index < sections.length) {
      setCurrentSectionIndex(index);
    }
  }, [sections.length]);

  // Get Zustand store actions
  const zustandUpdateSection = usePresentationStore((state) => state.updateSection);
  const zustandRemoveSection = usePresentationStore((state) => state.removeSection);

  // Update a section
  const updateSection = useCallback((index: number, updatedSection: Section) => {
    zustandUpdateSection(index, updatedSection);
  }, [zustandUpdateSection]);

  // Delete a section
  const deleteSection = useCallback((index: number) => {
    if (sections.length <= 1) {
      alert('Cannot delete the last section');
      return;
    }
    zustandRemoveSection(index);
  }, [sections.length, zustandRemoveSection]);

  // Drag-and-drop handlers for section reordering
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  // Get Zustand reorder action
  const zustandReorderSections = usePresentationStore((state) => state.reorderSections);

  const handleDragEnd = useCallback(() => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Use Zustand reorder action
    zustandReorderSections(draggedIndex, dragOverIndex);

    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, dragOverIndex, zustandReorderSections, setDraggedIndex, setDragOverIndex]);

  // Reorder sections handler for EditorWorkspace
  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    // Use Zustand reorder action
    zustandReorderSections(fromIndex, toIndex);
  }, [zustandReorderSections]);

  // Get Zustand add section action
  const zustandAddSection = usePresentationStore((state) => state.addSection);

  // Add new section handler for EditorWorkspace
  const addSection = useCallback(() => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      content: 'New section content...',
      advanceToken: 'next',
      selectedTriggers: ['next'],
      alternativeTriggers: [],
    };
    zustandAddSection(newSection);
  }, [zustandAddSection]);

  // Calculate progress
  const progress = sections.length > 0 ? ((currentSectionIndex + 1) / sections.length) * 100 : 0;

  // Get current/previous/next sections
  const currentSection = sections[currentSectionIndex];
  const previousSection = sections[currentSectionIndex - 1];
  const nextSection = sections[currentSectionIndex + 1];

  return {
    // State
    sections,
    setSections,
    currentSectionIndex,
    setCurrentSectionIndex,
    draggedIndex,
    dragOverIndex,
    shouldFlash,
    progress,
    currentSection,
    previousSection,
    nextSection,

    // Navigation
    advanceSection,
    goBackSection,
    goToSection,

    // CRUD operations
    updateSection,
    deleteSection,
    addSection,

    // Drag and drop
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    reorderSections,
  };
}
