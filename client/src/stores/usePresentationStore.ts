import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Section } from '@/lib/script-parser';
import type { PresentationStyle } from '@/components/PresentationStyleManager';

export type ViewMode = 'create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch' | 'know-it-all' | 'knowledge';

export interface Answer {
  heading: string;
  brief: string;
  bullets: string[];
  full: string;
  keywords: string[];
}

interface PresentationState {
  // Presentation content
  sections: Section[];
  currentSectionIndex: number; // What audience sees (changes immediately on trigger)
  presenterDisplayIndex: number; // What presenter notes show (changes after countdown)
  isCountingDown: boolean; // True during countdown period
  knowledgeBase: { question: string; answer: string }[];
  sharedKnowledgeBase: string;

  // UI state
  viewMode: ViewMode;
  editorTab: 'sections' | 'knowledge' | 'testing';

  // Settings
  selectedModel: string;
  selectedTone: string;
  cancelWord: string;
  operationModels: Record<string, string>;
  presentationStyle: PresentationStyle | null;
  countdownDuration: number; // Seconds between trigger word and note change (default: 3)

  // Q&A state
  isListeningForQuestions: boolean;
  currentQuestion: string | null;
  questionAnswers: { answer1: Answer; answer2: Answer } | null;
  isLoadingQA: boolean;
  qaDialogOpen: boolean;
  manualQuestion: string;

  // Library state
  showLibraryBrowser: boolean;

  // Drag and drop state
  draggedIndex: number | null;
  dragOverIndex: number | null;

  // Transcript state
  transcript: string[];
  lastTranscript: string;

  // Streaming state
  isStreaming: boolean;
}

interface PresentationActions {
  // Presentation content actions
  setSections: (sections: Section[] | ((prev: Section[]) => Section[])) => void;
  updateSection: (index: number, section: Partial<Section>) => void;
  addSection: (section: Section) => void;
  removeSection: (index: number) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  deleteSection: (index: number) => void;
  setCurrentSectionIndex: (index: number | ((prev: number) => number)) => void;
  setPresenterDisplayIndex: (index: number) => void;
  setIsCountingDown: (counting: boolean) => void;
  nextSection: () => void;
  previousSection: () => void;

  // Knowledge base actions
  setKnowledgeBase: (kb: { question: string; answer: string }[]) => void;
  addKnowledgeBaseEntry: (entry: { question: string; answer: string }) => void;
  removeKnowledgeBaseEntry: (index: number) => void;
  setSharedKnowledgeBase: (text: string) => void;

  // UI actions
  setViewMode: (mode: ViewMode) => void;
  setEditorTab: (tab: 'sections' | 'knowledge' | 'testing') => void;

  // Settings actions
  setSelectedModel: (model: string) => void;
  setSelectedTone: (tone: string) => void;
  setCancelWord: (word: string) => void;
  setOperationModels: (models: Record<string, string>) => void;
  setOperationModel: (operation: string, model: string) => void;
  getOperationModel: (operation: string) => string | undefined;
  setPresentationStyle: (style: PresentationStyle | null) => void;
  setCountdownDuration: (seconds: number) => void;

  // Q&A actions
  setIsListeningForQuestions: (listening: boolean) => void;
  setCurrentQuestion: (question: string | null) => void;
  setQuestionAnswers: (answers: { answer1: Answer; answer2: Answer } | null) => void;
  setIsLoadingQA: (loading: boolean) => void;
  setQaDialogOpen: (open: boolean) => void;
  setManualQuestion: (question: string) => void;

  // Library actions
  setShowLibraryBrowser: (show: boolean) => void;

  // Drag and drop actions
  setDraggedIndex: (index: number | null) => void;
  setDragOverIndex: (index: number | null) => void;

  // Transcript actions
  setTranscript: (transcript: string[]) => void;
  addTranscript: (text: string) => void;
  setLastTranscript: (text: string) => void;

  // Streaming actions
  setIsStreaming: (streaming: boolean) => void;

  // Bulk actions
  loadPresentationData: (data: {
    sections?: Section[];
    knowledgeBase?: { question: string; answer: string }[];
    settings?: {
      selectedTone?: string;
      selectedModel?: string;
      currentSectionIndex?: number;
      viewMode?: string;
      cancelWord?: string;
      presentationStyle?: PresentationStyle | null;
    };
  }) => void;

  clearPresentation: () => void;
  reset: () => void;
}

type PresentationStore = PresentationState & PresentationActions;

const initialState: PresentationState = {
  // Presentation content
  sections: [],
  currentSectionIndex: 0, // Audience view (changes immediately)
  presenterDisplayIndex: 0, // Presenter notes (changes after countdown)
  isCountingDown: false, // True during countdown animation
  knowledgeBase: [],
  sharedKnowledgeBase: '',

  // UI state
  viewMode: 'create',
  editorTab: 'sections',

  // Settings
  selectedModel: 'openai/gpt-4o-mini',
  selectedTone: 'professional',
  cancelWord: 'cancel',
  operationModels: {},
  presentationStyle: null,
  countdownDuration: 3, // 3 seconds default countdown after trigger word

  // Q&A state
  isListeningForQuestions: false,
  currentQuestion: null,
  questionAnswers: null,
  isLoadingQA: false,
  qaDialogOpen: false,
  manualQuestion: '',

  // Library state
  showLibraryBrowser: false,

  // Drag and drop state
  draggedIndex: null,
  dragOverIndex: null,

  // Transcript state
  transcript: [],
  lastTranscript: '',

  // Streaming state
  isStreaming: false,
};

export const usePresentationStore = create<PresentationStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Presentation content actions
        setSections: (sections) => {
          // IMPORTANT: Support functional updates like React's setState
          if (typeof sections === 'function') {
            set((state) => ({ sections: sections(state.sections) }));
          } else {
            set({ sections });
          }
        },

        updateSection: (index, section) => set((state) => ({
          sections: state.sections.map((s, i) => i === index ? { ...s, ...section } : s)
        })),

        addSection: (section) => set((state) => ({
          sections: [...state.sections, section]
        })),

        removeSection: (index) => set((state) => ({
          sections: state.sections.filter((_, i) => i !== index),
          currentSectionIndex: state.currentSectionIndex >= state.sections.length - 1
            ? Math.max(0, state.sections.length - 2)
            : state.currentSectionIndex
        })),

        reorderSections: (fromIndex, toIndex) => set((state) => {
          const newSections = [...state.sections];
          const [moved] = newSections.splice(fromIndex, 1);
          newSections.splice(toIndex, 0, moved);
          return { sections: newSections };
        }),

        // Alias for removeSection — kept for components that reference deleteSection
        deleteSection: (index) => set((state) => ({
          sections: state.sections.filter((_, i) => i !== index),
          currentSectionIndex: state.currentSectionIndex >= state.sections.length - 1
            ? Math.max(0, state.sections.length - 2)
            : state.currentSectionIndex
        })),

        setCurrentSectionIndex: (index) => {
          // IMPORTANT: Support functional updates like React's setState
          if (typeof index === 'function') {
            set((state) => ({ currentSectionIndex: index(state.currentSectionIndex) }));
          } else {
            set({ currentSectionIndex: index });
          }
        },

        setPresenterDisplayIndex: (index) => set({ presenterDisplayIndex: index }),

        setIsCountingDown: (counting) => set({ isCountingDown: counting }),

        nextSection: () => set((state) => ({
          currentSectionIndex: Math.min(state.currentSectionIndex + 1, state.sections.length - 1)
        })),

        previousSection: () => set((state) => ({
          currentSectionIndex: Math.max(0, state.currentSectionIndex - 1)
        })),

        // Knowledge base actions
        setKnowledgeBase: (kb) => set({ knowledgeBase: kb }),

        addKnowledgeBaseEntry: (entry) => set((state) => ({
          knowledgeBase: [...state.knowledgeBase, entry]
        })),

        removeKnowledgeBaseEntry: (index) => set((state) => ({
          knowledgeBase: state.knowledgeBase.filter((_, i) => i !== index)
        })),

        setSharedKnowledgeBase: (text) => set({ sharedKnowledgeBase: text }),

        // UI actions
        setViewMode: (mode) => set({ viewMode: mode }),
        setEditorTab: (tab) => set({ editorTab: tab }),

        // Settings actions
        setSelectedModel: (model) => set({ selectedModel: model }),
        setSelectedTone: (tone) => set({ selectedTone: tone }),
        setCancelWord: (word) => set({ cancelWord: word }),
        setOperationModels: (models) => set({ operationModels: models }),

        setOperationModel: (operation, model) => set((state) => ({
          operationModels: { ...state.operationModels, [operation]: model }
        })),

        // Read the model configured for an operation. Prefers store state, then
        // falls back to the localStorage key shared with useModelManagement so both
        // sources stay consistent. Returns undefined → caller uses its own default.
        getOperationModel: (operation) => {
          const fromState = get().operationModels[operation];
          if (fromState) return fromState;
          try {
            const saved = localStorage.getItem('verbadeck-operation-models');
            if (saved) return JSON.parse(saved)[operation];
          } catch {
            /* ignore malformed localStorage */
          }
          return undefined;
        },

        setPresentationStyle: (style) => set({ presentationStyle: style }),

        setCountdownDuration: (seconds) => set({ countdownDuration: Math.max(1, Math.min(10, seconds)) }), // Clamp between 1-10 seconds

        // Q&A actions
        setIsListeningForQuestions: (listening) => set({ isListeningForQuestions: listening }),
        setCurrentQuestion: (question) => set({ currentQuestion: question }),
        setQuestionAnswers: (answers) => set({ questionAnswers: answers }),
        setIsLoadingQA: (loading) => set({ isLoadingQA: loading }),
        setQaDialogOpen: (open) => set({ qaDialogOpen: open }),
        setManualQuestion: (question) => set({ manualQuestion: question }),

        // Library actions
        setShowLibraryBrowser: (show) => set({ showLibraryBrowser: show }),

        // Drag and drop actions
        setDraggedIndex: (index) => set({ draggedIndex: index }),
        setDragOverIndex: (index) => set({ dragOverIndex: index }),

        // Transcript actions
        setTranscript: (transcript) => set({ transcript }),

        addTranscript: (text) => set((state) => ({
          transcript: [...state.transcript.slice(-19), text] // Keep last 20
        })),

        setLastTranscript: (text) => set({ lastTranscript: text }),

        // Streaming actions
        setIsStreaming: (streaming) => set({ isStreaming: streaming }),

        // Bulk actions
        loadPresentationData: (data) => {
          console.log('💾 loadPresentationData called with:', {
            sectionsCount: data.sections?.length || 0,
            kbCount: data.knowledgeBase?.length || 0,
            settings: data.settings,
            firstSectionHeading: data.sections?.[0]?.heading || 'N/A'
          });

          // IMPORTANT: Ensure sections is an array before setting
          if (!Array.isArray(data.sections)) {
            console.error('❌ ERROR: data.sections is not an array!', typeof data.sections, data.sections);
            return;
          }

          const newState = {
            sections: data.sections,
            knowledgeBase: data.knowledgeBase ?? get().knowledgeBase,
            selectedTone: data.settings?.selectedTone ?? get().selectedTone,
            selectedModel: data.settings?.selectedModel ?? get().selectedModel,
            currentSectionIndex: data.settings?.currentSectionIndex ?? 0,
            viewMode: (data.settings?.viewMode as ViewMode) ?? get().viewMode,
            cancelWord: data.settings?.cancelWord ?? get().cancelWord,
            presentationStyle: data.settings?.presentationStyle ?? get().presentationStyle,
          };

          console.log('💾 Setting new state:', {
            sectionsCount: newState.sections.length,
            currentIndex: newState.currentSectionIndex,
            viewMode: newState.viewMode
          });

          set(newState);

          // Verify after set
          setTimeout(() => {
            const currentState = get();
            console.log('💾 VERIFICATION - State after set():', {
              sectionsCount: currentState.sections.length,
              sectionsType: Array.isArray(currentState.sections) ? 'array' : typeof currentState.sections,
              currentIndex: currentState.currentSectionIndex,
              viewMode: currentState.viewMode,
              firstSectionHeading: currentState.sections[0]?.heading || 'N/A'
            });
          }, 100);
        },

        clearPresentation: () => set({
          sections: [],
          currentSectionIndex: 0,
          presenterDisplayIndex: 0,
          isCountingDown: false,
          knowledgeBase: [],
          transcript: [],
          lastTranscript: '',
          // Preserves user settings: selectedModel, selectedTone, cancelWord, etc.
        }),

        reset: () => set(initialState),
      }),
      {
        name: 'verbadeck-presentation-v3',
        // IMPORTANT: DO NOT persist sections or currentSectionIndex
        // Presentations are loaded dynamically from library/AI processing
        // Persisting them causes rehydration to overwrite dynamically loaded data
        partialize: (state) => ({
          // User settings only - NO presentation content
          selectedModel: state.selectedModel,
          selectedTone: state.selectedTone,
          cancelWord: state.cancelWord,
          operationModels: state.operationModels,
          presentationStyle: state.presentationStyle,
          sharedKnowledgeBase: state.sharedKnowledgeBase,
        }),
      }
    )
  )
);

// Selectors for common state access patterns
export const selectSections = (state: PresentationStore) => state.sections;
export const selectCurrentSection = (state: PresentationStore) =>
  state.sections[state.currentSectionIndex];
export const selectKnowledgeBase = (state: PresentationStore) => state.knowledgeBase;
export const selectViewMode = (state: PresentationStore) => state.viewMode;
export const selectSettings = (state: PresentationStore) => ({
  selectedModel: state.selectedModel,
  selectedTone: state.selectedTone,
  cancelWord: state.cancelWord,
  presentationStyle: state.presentationStyle,
});
