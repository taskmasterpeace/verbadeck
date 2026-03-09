# VerbaDeck V2.0 - State Management

This directory contains Zustand stores for centralized state management in VerbaDeck V2.0.

## Store Architecture

### 1. **presentation.ts** - Presentation State
Core presentation data and settings.

**State:**
- `sections: Section[]` - All presentation sections with triggers
- `currentSectionIndex: number` - Active section
- `knowledgeBase: FAQ[]` - Q&A knowledge base
- `presentationStyle: PresentationStyle | null` - Visual style settings
- `sharedKnowledgeBase: string` - Raw text for Know-It-All mode
- `selectedModel: string` - Default AI model
- `selectedTone: string` - Q&A response tone
- `cancelWord: string` - Voice command to cancel Q&A
- `operationModels: Record<string, string>` - Model overrides per operation
- `draggedIndex: number | null` - Drag & drop state
- `dragOverIndex: number | null` - Drag & drop state

**Actions:**
- `setSections()`, `updateSection()`, `deleteSection()` - Section management
- `advanceSection()`, `goBackSection()`, `goToSection()` - Navigation
- `reorderSections()` - Drag & drop reordering
- `setKnowledgeBase()`, `setPresentationStyle()` - Settings
- `getOperationModel()` - Get model for specific operation

**Persistence:** ✅ localStorage (via Zustand persist middleware)

---

### 2. **voice.ts** - Voice & Streaming State
Manages voice streaming and transcript data.

**State:**
- `isStreaming: boolean` - Microphone active
- `status: 'connecting' | 'connected' | 'disconnected'` - WebSocket status
- `transcript: string[]` - History of final transcripts (last 20)
- `lastTranscript: string` - Most recent interim/final transcript
- `isListeningForQuestions: boolean` - Q&A mode active

**Actions:**
- `setIsStreaming()`, `setStatus()` - Streaming control
- `setTranscript()`, `addToTranscript()`, `setLastTranscript()` - Transcript management
- `setIsListeningForQuestions()` - Q&A mode toggle

**Persistence:** ❌ No persistence (ephemeral state)

---

### 3. **ui.ts** - UI State
Manages view modes, modals, and loading states.

**State:**
- `viewMode: ViewMode` - Current view ('create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch' | 'know-it-all')
- `editorTab: EditorTab` - Active editor tab ('sections' | 'knowledge' | 'testing')
- `showLibraryBrowser: boolean` - Library browser modal
- `qaDialogOpen: boolean` - Manual Q&A dialog
- `isGeneratingFAQs: boolean` - FAQ generation loading state
- `isBulkGenerating: boolean` - Bulk image generation loading state
- `bulkProgress: { current, total }` - Bulk generation progress
- `bulkStatus: { type, message } | null` - Status messages
- `autoSaveStatus: string | null` - Auto-save status

**Actions:**
- `setViewMode()`, `setEditorTab()` - Navigation
- `setShowLibraryBrowser()`, `setQaDialogOpen()` - Modal control
- `setIsGeneratingFAQs()`, `setIsBulkGenerating()` - Loading states
- `setBulkProgress()`, `setBulkStatus()` - Progress tracking
- `setAutoSaveStatus()` - Auto-save status

**Persistence:** ✅ localStorage (viewMode, editorTab only)

---

### 4. **qa.ts** - Q&A State
Manages live Q&A feature state.

**State:**
- `currentQuestion: string | null` - Active question
- `questionAnswers: { answer1, answer2 } | null` - Generated answers
- `isLoadingQA: boolean` - Answer generation loading state
- `manualQuestion: string` - User-typed question input

**Actions:**
- `setCurrentQuestion()`, `setQuestionAnswers()` - Q&A data
- `setIsLoadingQA()` - Loading state
- `setManualQuestion()` - Manual input
- `cancelQuestion()` - Cancel answer generation
- `dismissQuestion()` - Close Q&A panel

**Persistence:** ❌ No persistence (ephemeral state)

---

## Usage Example

```typescript
import { usePresentationStore, useVoiceStore, useUIStore, useQAStore } from './stores';

function MyComponent() {
  // Select only the state you need
  const sections = usePresentationStore((state) => state.sections);
  const advanceSection = usePresentationStore((state) => state.advanceSection);

  const isStreaming = useVoiceStore((state) => state.isStreaming);
  const lastTranscript = useVoiceStore((state) => state.lastTranscript);

  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  const currentQuestion = useQAStore((state) => state.currentQuestion);

  // Use the state and actions
  return (
    <div>
      <button onClick={advanceSection}>Next Section</button>
      {isStreaming && <p>Listening: {lastTranscript}</p>}
    </div>
  );
}
```

## Migration from App.tsx

When migrating components from the old `App.tsx` state:

1. Replace `useState` hooks with store selectors
2. Replace prop drilling with direct store access
3. Use selective subscription for performance (only select needed state)
4. Replace `useCallback` with store actions (already memoized)

**Before:**
```typescript
const [sections, setSections] = useState<Section[]>([]);
const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

const advanceSection = useCallback(() => {
  setCurrentSectionIndex((prev) => {
    if (prev < sections.length - 1) {
      return prev + 1;
    }
    return prev;
  });
}, [sections.length]);
```

**After:**
```typescript
const sections = usePresentationStore((state) => state.sections);
const currentSectionIndex = usePresentationStore((state) => state.currentSectionIndex);
const advanceSection = usePresentationStore((state) => state.advanceSection);
```

## Store Design Principles

1. **Single Responsibility** - Each store manages one domain
2. **Selective Subscription** - Components only re-render when their selected state changes
3. **No Derived State** - Compute derived values in components
4. **Persistence Where Needed** - Only persist user preferences and data
5. **Type Safety** - Full TypeScript support with proper interfaces
6. **DevTools Ready** - Works with Redux DevTools browser extension

## Performance Notes

- Zustand uses shallow equality by default for selectors
- Only subscribe to state you need to avoid unnecessary re-renders
- Store actions are already memoized (no need for useCallback)
- Persist middleware only saves/loads selected keys (not entire store)

## Testing

```typescript
import { act, renderHook } from '@testing-library/react';
import { usePresentationStore } from './presentation';

test('should advance section', () => {
  const { result } = renderHook(() => usePresentationStore());

  act(() => {
    result.current.setSections([
      { id: '1', content: 'Slide 1', advanceToken: 'next' },
      { id: '2', content: 'Slide 2', advanceToken: 'next' },
    ]);
  });

  expect(result.current.currentSectionIndex).toBe(0);

  act(() => {
    result.current.advanceSection();
  });

  expect(result.current.currentSectionIndex).toBe(1);
});
```
