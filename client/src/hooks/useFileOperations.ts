import { savePresentation, loadPresentation } from '@/lib/file-storage';
import type { Section } from '@/lib/script-parser';

type ViewMode = 'create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch';

interface UseFileOperationsParams {
  sections: Section[];
  setSections: (sections: Section[]) => void;
  knowledgeBase: { question: string; answer: string }[];
  setKnowledgeBase: (kb: { question: string; answer: string }[]) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  currentSectionIndex: number;
  setCurrentSectionIndex: (index: number) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

interface UseFileOperationsReturn {
  handleSavePresentation: () => Promise<void>;
  handleLoadPresentation: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

/**
 * useFileOperations Hook
 *
 * Handles save/load operations for presentations, including sections,
 * knowledge base, and UI settings (tone, model, current section, view mode).
 *
 * Extracted from App.tsx (lines 638-699)
 */
export function useFileOperations({
  sections,
  setSections,
  knowledgeBase,
  setKnowledgeBase,
  selectedTone,
  setSelectedTone,
  selectedModel,
  setSelectedModel,
  currentSectionIndex,
  setCurrentSectionIndex,
  viewMode,
  setViewMode,
}: UseFileOperationsParams): UseFileOperationsReturn {

  // Save presentation to file
  const handleSavePresentation = async () => {
    if (sections.length === 0) {
      alert('No presentation to save');
      return;
    }

    try {
      await savePresentation(
        sections,
        undefined, // title (use default)
        knowledgeBase,
        {
          selectedTone,
          selectedModel,
          currentSectionIndex,
          viewMode
        }
      );
      console.log('✅ Presentation saved with complete state');
    } catch (error) {
      console.error('Error saving presentation:', error);
      alert('Failed to save presentation');
    }
  };

  // Load presentation from file
  const handleLoadPresentation = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await loadPresentation(file);
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

      console.log(`✅ Loaded presentation with ${data.sections.length} sections and complete state`);

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error loading presentation:', error);
      alert(error instanceof Error ? error.message : 'Failed to load presentation');
    }
  };

  return {
    handleSavePresentation,
    handleLoadPresentation,
  };
}
