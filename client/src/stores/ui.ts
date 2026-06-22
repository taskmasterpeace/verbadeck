import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch' | 'know-it-all' | 'knowledge';
export type EditorTab = 'sections' | 'knowledge' | 'testing';

interface UIState {
  // View state
  viewMode: ViewMode;
  editorTab: EditorTab;

  // Modal/Dialog state
  showLibraryBrowser: boolean;
  qaDialogOpen: boolean;

  // Loading/status states
  isGeneratingFAQs: boolean;
  isBulkGenerating: boolean;
  bulkProgress: { current: number; total: number };
  bulkStatus: { type: 'success' | 'error' | 'info'; message: string } | null;
  autoSaveStatus: string | null;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setEditorTab: (tab: EditorTab) => void;
  setShowLibraryBrowser: (show: boolean) => void;
  setQaDialogOpen: (open: boolean) => void;
  setIsGeneratingFAQs: (generating: boolean) => void;
  setIsBulkGenerating: (generating: boolean) => void;
  setBulkProgress: (progress: { current: number; total: number }) => void;
  setBulkStatus: (status: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  setAutoSaveStatus: (status: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  viewMode: 'create' as ViewMode,
  editorTab: 'sections' as EditorTab,
  showLibraryBrowser: false,
  qaDialogOpen: false,
  isGeneratingFAQs: false,
  isBulkGenerating: false,
  bulkProgress: { current: 0, total: 0 },
  bulkStatus: null,
  autoSaveStatus: null,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialState,

      setViewMode: (mode) => set({ viewMode: mode }),
      setEditorTab: (tab) => set({ editorTab: tab }),
      setShowLibraryBrowser: (show) => set({ showLibraryBrowser: show }),
      setQaDialogOpen: (open) => set({ qaDialogOpen: open }),
      setIsGeneratingFAQs: (generating) => set({ isGeneratingFAQs: generating }),
      setIsBulkGenerating: (generating) => set({ isBulkGenerating: generating }),
      setBulkProgress: (progress) => set({ bulkProgress: progress }),
      setBulkStatus: (status) => set({ bulkStatus: status }),
      setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),

      reset: () => set(initialState),
    }),
    {
      name: 'verbadeck-ui-store',
      partialize: (state) => ({
        viewMode: state.viewMode,
        editorTab: state.editorTab,
      }),
    }
  )
);
