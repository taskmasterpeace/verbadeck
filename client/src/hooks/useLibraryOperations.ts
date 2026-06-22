import { useCallback } from 'react';
import { type Section } from '../lib/script-parser';
import { saveToLibrary, loadFromLibrary } from '../lib/presentation-library';

type ViewMode = 'create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch' | 'know-it-all' | 'knowledge';

interface UseLibraryOperationsProps {
  sections: Section[];
  knowledgeBase: { question: string; answer: string }[];
  selectedTone: string;
  selectedModel: string;
  currentSectionIndex: number;
  viewMode: ViewMode;
  setSections: (sections: Section[]) => void;
  setKnowledgeBase: (kb: { question: string; answer: string }[]) => void;
  setSelectedTone: (tone: string) => void;
  setSelectedModel: (model: string) => void;
  setCurrentSectionIndex: (index: number) => void;
  setViewMode: (mode: ViewMode) => void;
  clearAutoSave: () => void;
}

export function useLibraryOperations({
  sections,
  knowledgeBase,
  selectedTone,
  selectedModel,
  currentSectionIndex,
  viewMode,
  setSections,
  setKnowledgeBase,
  setSelectedTone,
  setSelectedModel,
  setCurrentSectionIndex,
  setViewMode,
  clearAutoSave,
}: UseLibraryOperationsProps) {

  // Save to library
  const handleSaveToLibrary = useCallback(() => {
    if (sections.length === 0) {
      alert('No presentation to save');
      return;
    }

    const name = prompt('Enter a name for this presentation:');
    if (!name || name.trim() === '') return;

    try {
      saveToLibrary(
        name.trim(),
        sections,
        knowledgeBase,
        {
          selectedTone,
          selectedModel,
          currentSectionIndex,
          viewMode
        }
      );
      clearAutoSave(); // Clear auto-save after successful manual save
      alert(`Saved "${name}" to library!`);
      console.log(`📚 Saved presentation "${name}" to library`);
    } catch (error) {
      console.error('Error saving to library:', error);
      alert('Failed to save to library');
    }
  }, [sections, knowledgeBase, selectedTone, selectedModel, currentSectionIndex, viewMode, clearAutoSave]);

  // Load from library by ID
  const handleLoadFromLibrary = useCallback((id: string) => {
    try {
      const data = loadFromLibrary(id);
      if (!data) {
        alert('Presentation not found in library');
        return;
      }

      setSections(data.sections);

      // Restore knowledge base if present
      if (data.knowledgeBase) {
        setKnowledgeBase(data.knowledgeBase);
      }

      // Restore settings if present
      if (data.settings) {
        if (data.settings.selectedTone) setSelectedTone(data.settings.selectedTone);
        if (data.settings.selectedModel) setSelectedModel(data.settings.selectedModel);
        if (data.settings.currentSectionIndex !== undefined) {
          setCurrentSectionIndex(data.settings.currentSectionIndex);
        }
        if (data.settings.viewMode) setViewMode(data.settings.viewMode as ViewMode);
      } else {
        // If no settings, use defaults
        setCurrentSectionIndex(0);
        setViewMode('editor');
      }

      console.log(`📚 Loaded presentation "${data.title}" from library`);
    } catch (error) {
      console.error('Error loading from library:', error);
      alert('Failed to load from library');
    }
  }, [setSections, setKnowledgeBase, setSelectedTone, setSelectedModel, setCurrentSectionIndex, setViewMode]);

  return {
    handleSaveToLibrary,
    handleLoadFromLibrary,
  };
}
