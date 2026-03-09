import { savePresentation, loadPresentation } from '@/lib/file-storage';
import { usePresentationStore } from '@/stores/usePresentationStore';

interface UseFileOperationsReturn {
  handleSavePresentation: () => Promise<void>;
  handleLoadPresentation: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSavePresentationAs: (title?: string) => Promise<void>;
}

/**
 * useFileOperations Hook
 *
 * Handles save/load operations for presentations using Zustand store.
 * Now reads state from the global presentation store instead of props.
 *
 * Enhanced from App.tsx (lines 638-699) to use Zustand.
 */
export function useFileOperations(): UseFileOperationsReturn {
  // Get state and actions from Zustand store
  const sections = usePresentationStore(state => state.sections);
  const knowledgeBase = usePresentationStore(state => state.knowledgeBase);
  const selectedTone = usePresentationStore(state => state.selectedTone);
  const selectedModel = usePresentationStore(state => state.selectedModel);
  const currentSectionIndex = usePresentationStore(state => state.currentSectionIndex);
  const viewMode = usePresentationStore(state => state.viewMode);
  const cancelWord = usePresentationStore(state => state.cancelWord);
  const presentationStyle = usePresentationStore(state => state.presentationStyle);

  const loadPresentationData = usePresentationStore(state => state.loadPresentationData);

  // Save presentation to file with current state
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
          viewMode,
          cancelWord,
          presentationStyle: presentationStyle || undefined,
        }
      );
      console.log('✅ Presentation saved with complete state from Zustand store');
    } catch (error) {
      console.error('Error saving presentation:', error);
      alert('Failed to save presentation');
    }
  };

  // Save presentation with custom title
  const handleSavePresentationAs = async (title?: string) => {
    if (sections.length === 0) {
      alert('No presentation to save');
      return;
    }

    try {
      await savePresentation(
        sections,
        title,
        knowledgeBase,
        {
          selectedTone,
          selectedModel,
          currentSectionIndex,
          viewMode,
          cancelWord,
          presentationStyle: presentationStyle || undefined,
        }
      );
      console.log('✅ Presentation saved as:', title);
    } catch (error) {
      console.error('Error saving presentation:', error);
      alert('Failed to save presentation');
    }
  };

  // Load presentation from file into Zustand store
  const handleLoadPresentation = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await loadPresentation(file);

      // Load data into Zustand store
      loadPresentationData({
        sections: data.sections,
        knowledgeBase: data.knowledgeBase,
        settings: {
          selectedTone: data.settings?.selectedTone,
          selectedModel: data.settings?.selectedModel,
          currentSectionIndex: data.settings?.currentSectionIndex,
          viewMode: data.settings?.viewMode,
          cancelWord: data.settings?.cancelWord,
          presentationStyle: data.settings?.presentationStyle,
        },
      });

      console.log(`✅ Loaded presentation with ${data.sections.length} sections into Zustand store`);
      console.log('   - Knowledge base:', data.knowledgeBase?.length || 0, 'entries');
      console.log('   - Settings:', data.settings);

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
    handleSavePresentationAs,
  };
}
