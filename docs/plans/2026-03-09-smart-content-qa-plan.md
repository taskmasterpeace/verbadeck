# Smart Content Processing & Contextual Q&A — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make live Q&A answers slide-aware (contextual), add a goal picker for content processing, and replace the full-screen Q&A modal with a non-disruptive side panel.

**Architecture:** Part 2 (contextual Q&A) ships first as the priority. The server `answerQuestion` method gets rebuilt to accept sections + currentSlideIndex instead of flat text. The client passes slide context from Zustand store. Part 3 replaces QAPanel modal with a slide-in side panel. Part 1 adds a goal picker to AIScriptProcessor.

**Tech Stack:** React 18, TypeScript, Zustand, Tailwind CSS, Express, OpenRouter API, Playwright

---

### Task 1: Update server API to accept slide-aware context

**Files:**
- Modify: `server/server.js:541-569` (answer-question endpoint)
- Modify: `server/openrouter.js:717-795` (answerQuestion method)

**Step 1: Update the API endpoint to accept new fields**

In `server/server.js`, replace the `/api/answer-question` handler (lines 541-569) with:

```javascript
app.post('/api/answer-question', createTimingMiddleware('answerQuestion'), async (req, res) => {
  try {
    const { question, presentationContent, knowledgeBase, model, tone, sections, currentSlideIndex, presentationGoal } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Support both new (sections + index) and legacy (presentationContent) formats
    let contextContent;
    if (sections && Array.isArray(sections) && typeof currentSlideIndex === 'number') {
      // New contextual format - server builds the context window
      const total = sections.length;
      const current = sections[currentSlideIndex];
      const previous = currentSlideIndex > 0 ? sections[currentSlideIndex - 1] : null;
      const next = currentSlideIndex < total - 1 ? sections[currentSlideIndex + 1] : null;

      // Build remaining slides summary (exclude current/prev/next)
      const otherSlides = sections
        .filter((_, i) => i !== currentSlideIndex && i !== currentSlideIndex - 1 && i !== currentSlideIndex + 1)
        .map((s, i) => `- ${s.heading || `Slide`}: ${s.content.substring(0, 80)}...`)
        .join('\n');

      contextContent = `You are helping a presenter answer a live question. They are on slide ${currentSlideIndex + 1} of ${total}.

CURRENT SLIDE (what presenter is discussing right now):
Title: ${current.heading || 'Untitled'}
${current.content}

PREVIOUS SLIDE (what was just covered):
${previous ? `Title: ${previous.heading || 'Untitled'}\n${previous.content}` : 'This is the first slide.'}

NEXT SLIDE (what is coming up):
${next ? `Title: ${next.heading || 'Untitled'}\n${next.content}` : 'This is the last slide.'}

OTHER SLIDES IN PRESENTATION:
${otherSlides || 'None'}

${presentationGoal ? `PRESENTATION GOAL: ${presentationGoal}` : ''}`;
    } else if (presentationContent && presentationContent.trim().length > 0) {
      // Legacy flat format
      contextContent = presentationContent;
    } else {
      return res.status(400).json({ error: 'Either sections+currentSlideIndex or presentationContent is required' });
    }

    const selectedModel = getModelForOperation('answerQuestion', model);
    console.log(`💬 Answering question: "${question}" (tone: ${tone || 'professional'}, slide: ${currentSlideIndex ?? 'N/A'}) using ${selectedModel}`);
    const answers = await openRouterClient.answerQuestion(
      question,
      contextContent,
      knowledgeBase || [],
      selectedModel,
      tone || 'professional'
    );
    console.log(`✅ Generated 2 answer options in ${tone || 'professional'} tone`);

    res.json(answers);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: error.message });
  }
});
```

The `openrouter.js` `answerQuestion` method does NOT need changes — it already receives `presentationContent` as a string. The server endpoint now builds the contextual string before passing it through.

**Step 2: Restart server and verify endpoint still works**

Run: `curl -X POST http://localhost:3002/api/answer-question -H "Content-Type: application/json" -d "{\"question\":\"test\",\"presentationContent\":\"test content\"}" 2>&1 | head -5`
Expected: JSON response (not an error) — verifies backward compatibility

**Step 3: Commit**

```bash
git add server/server.js
git commit -m "feat: slide-aware context for live Q&A answers"
```

---

### Task 2: Update client to send slide context

**Files:**
- Modify: `client/src/hooks/useOpenRouter.ts:134-179` (answerQuestion function)
- Modify: `client/src/hooks/useQASession.ts:12-16,40-74` (handleQuestionDetected)

**Step 1: Add new parameters to useOpenRouter's answerQuestion**

In `client/src/hooks/useOpenRouter.ts`, update the `answerQuestion` function signature (line 134) and fetch body (line 155):

```typescript
  const answerQuestion = async (
    question: string,
    presentationContent: string,
    knowledgeBase: { question: string; answer: string }[],
    model?: string,
    tone: string = 'professional',
    sections?: { heading?: string; content: string }[],
    currentSlideIndex?: number,
    presentationGoal?: string,
  ): Promise<{ answer1: AnswerResponse; answer2: AnswerResponse }> => {
    setIsProcessing(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE}/api/answer-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          presentationContent,
          knowledgeBase,
          model,
          tone,
          sections,
          currentSlideIndex,
          presentationGoal,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to answer question');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('✋ Question answering cancelled');
        throw new Error('Question cancelled');
      }
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };
```

**Step 2: Update useQASession to pass sections and index**

In `client/src/hooks/useQASession.ts`, add `currentSectionIndex` to the props interface (line 12-16):

```typescript
interface UseQASessionProps {
  sections: Section[];
  currentSectionIndex: number; // NEW: for contextual Q&A
  knowledgeBase: { question: string; answer: string }[];
  sharedKnowledgeBase?: string;
  selectedTone: string;
  getOperationModel: (operation: string) => string | undefined;
  mode?: 'presenter' | 'know-it-all';
}
```

Update the destructuring (line 22):

```typescript
export function useQASession({
  sections,
  currentSectionIndex,
  knowledgeBase,
  ...
```

Update the presenter mode branch in `handleQuestionDetected` (lines 62-73):

```typescript
      } else {
        // Presenter mode - use slide-aware context
        const presentationContent = sections.map(s => s.content).join('\n\n');

        console.log(`📊 Answering question with slide context (slide ${currentSectionIndex + 1}/${sections.length})`);
        answers = await answerQuestion(
          question,
          presentationContent,
          knowledgeBase,
          qaModel,
          selectedTone,
          sections.map(s => ({ heading: s.heading, content: s.content })),
          currentSectionIndex,
        );
      }
```

Add `currentSectionIndex` to the useCallback dependency array (line 98).

**Step 3: Update App.tsx to pass currentSectionIndex to useQASession**

In `client/src/App.tsx`, find the `useQASession` call (~line 117) and add `currentSectionIndex`:

```typescript
  const qaSession = useQASession({
    sections,
    currentSectionIndex, // NEW
    knowledgeBase,
    sharedKnowledgeBase,
    selectedTone,
    getOperationModel,
    mode: viewMode === 'know-it-all' ? 'know-it-all' : 'presenter'
  });
```

**Step 4: Commit**

```bash
git add client/src/hooks/useOpenRouter.ts client/src/hooks/useQASession.ts client/src/App.tsx
git commit -m "feat: client sends slide context for contextual Q&A"
```

---

### Task 3: Replace Q&A modal with side panel

**Files:**
- Modify: `client/src/components/QAPanel.tsx:1-373` (full rewrite to side panel)
- Modify: `client/src/App.tsx:697-718` (QAPanel render location)

**Step 1: Rewrite QAPanel as a slide-in side panel**

Replace `client/src/components/QAPanel.tsx` entirely. The new component:

- Uses `fixed right-0 top-0 h-full w-[450px]` positioning (slides in from right)
- Translates in/out with `transition-transform duration-300`
- Shows brief answer prominently at top in a highlighted box
- Bullets and full answer below in scrollable area
- Compact timer (inline, not a big circular SVG)
- "Continue" button at bottom
- Does NOT cover the presenter view — sits alongside it

```tsx
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Loader2, X, Copy, Check, Clock } from 'lucide-react';
import { getModelById } from '@/lib/openrouter-models';

interface Answer {
  heading: string;
  brief: string;
  bullets: string[];
  full: string;
  keywords: string[];
}

interface QAPanelProps {
  question: string;
  answers?: { answer1: Answer; answer2: Answer } | null;
  isLoading?: boolean;
  onDismiss: () => void;
  onCancel?: () => void;
  cancelWord?: string;
  selectedModel?: string;
}

export function QAPanel({ question, answers, isLoading, onDismiss, onCancel, cancelWord, selectedModel }: QAPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b'>('a');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const modelInfo = selectedModel ? getModelById(selectedModel) : null;
  const expectedTime = modelInfo?.expectedResponseTime || 4000;

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) setElapsedTime(Date.now() - startTimeRef.current);
      }, 100);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isLoading]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeAnswer = answers ? (selectedAnswer === 'a' ? answers.answer1 : answers.answer2) : null;

  return (
    <div className="fixed right-0 top-0 h-full w-[450px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 border-b bg-blue-50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MessageCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm font-medium text-blue-900 truncate">{question}</p>
        </div>
        <button onClick={onDismiss} className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Generating answer...</p>
                <p className="text-xs text-gray-500">
                  {(elapsedTime / 1000).toFixed(1)}s / ~{(expectedTime / 1000).toFixed(1)}s expected
                </p>
              </div>
            </div>
            {onCancel && (
              <button onClick={onCancel} className="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                Cancel ({cancelWord || 'cancel'})
              </button>
            )}
          </div>
        ) : answers ? (
          <>
            {/* Answer Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedAnswer('a')}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedAnswer === 'a' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Option A
              </button>
              <button
                onClick={() => setSelectedAnswer('b')}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedAnswer === 'b' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Option B
              </button>
            </div>

            {activeAnswer && (
              <div className="space-y-3">
                {/* Brief - prominent */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-green-700">QUICK ANSWER</span>
                    <button
                      onClick={() => handleCopy(activeAnswer.brief, selectedAnswer === 'a' ? 1 : 2)}
                      className="text-gray-400 hover:text-green-600 p-0.5"
                    >
                      {copiedIndex === (selectedAnswer === 'a' ? 1 : 2) ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{activeAnswer.brief}</p>
                </div>

                {/* Bullets */}
                <div>
                  <span className="text-xs font-semibold text-blue-600">KEY POINTS</span>
                  <ul className="mt-1 space-y-1">
                    {(activeAnswer.bullets || []).map((bullet, idx) => (
                      <li key={idx} className="text-sm text-gray-800 flex gap-2">
                        <span className="text-blue-500">-</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Full */}
                <div>
                  <span className="text-xs font-semibold text-gray-500">DETAILED</span>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">{activeAnswer.full}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic text-sm">No answers generated yet.</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3">
        <button onClick={onDismiss} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm">
          Continue Presentation
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Update QAPanel render in App.tsx**

In `client/src/App.tsx`, the QAPanel is rendered inside `mainContent` (~line 697). No changes needed to how it's rendered — the component itself now positions as a side panel instead of a centered modal. The `fixed` positioning handles placement.

However, remove the `fixed inset-0 bg-black/50` overlay wrapper if present (it was part of the old modal). The QAPanel now handles its own positioning.

**Step 3: Commit**

```bash
git add client/src/components/QAPanel.tsx client/src/App.tsx
git commit -m "feat: replace Q&A modal with slide-in side panel"
```

---

### Task 4: Add goal picker to Process Content

**Files:**
- Modify: `client/src/components/AIScriptProcessor.tsx:82-127` (add goal state and picker UI)

**Step 1: Add goal state and detection logic**

In `client/src/components/AIScriptProcessor.tsx`, after the existing state declarations (line 85), add:

```typescript
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const GOALS = [
    { id: 'pitch', label: 'Pitch', description: 'Persuade, sell an idea, call to action', tone: 'bold' },
    { id: 'training', label: 'Training', description: 'Teach, step-by-step, educational', tone: 'conversational' },
    { id: 'update', label: 'Status Update', description: 'Inform, progress report, metrics', tone: 'professional' },
    { id: 'keynote', label: 'Keynote', description: 'Inspire, big ideas, storytelling', tone: 'storytelling' },
  ];

  // Detect if text has section markers (structured = skip goal picker)
  const hasStructuredMarkers = (text: string) => {
    return /SECTION\s+\d+/i.test(text) || /^#{1,3}\s/m.test(text) || /^\d+\.\s+[A-Z]/m.test(text);
  };
```

**Step 2: Update handleProcess to pass goal context**

Update `handleProcess` (line 93) to include goal in the API call. Before the `processScript` call, add:

```typescript
    // If unstructured text and no goal selected, show goal picker
    if (!hasStructuredMarkers(rawText) && !selectedGoal) {
      setShowGoalPicker(true);
      return;
    }
```

Update the `processScript` call to pass goal info (the server prompt can use it later):

```typescript
      const result = await processScript(rawText, selectedModel, preserveWording);
```

No change to `processScript` call for now — the goal is stored in state and will be used by Q&A anticipation later. The tone auto-selection is the immediate win.

**Step 3: Add goal auto-selection of tone**

When a goal is selected, auto-set the tone in the Zustand store. Add after the GOALS array:

```typescript
  const { setSelectedTone } = usePresentationStore();

  const handleGoalSelect = (goal: typeof GOALS[number]) => {
    setSelectedGoal(goal.id);
    setSelectedTone(goal.tone);
    setShowGoalPicker(false);
  };
```

**Step 4: Render goal picker UI**

Add the goal picker between the textarea and the Process button. Insert before the `{/* Processing State */}` comment (~line 250):

```tsx
        {/* Goal Picker - shown for unstructured text */}
        {showGoalPicker && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">What type of presentation is this?</label>
              <button
                onClick={() => { setShowGoalPicker(false); setSelectedGoal('general'); }}
                className="text-xs text-gray-500 hover:text-blue-600"
              >
                Skip — just process it
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:border-blue-500 hover:shadow-md ${
                    selectedGoal === goal.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{goal.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{goal.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected goal badge */}
        {selectedGoal && selectedGoal !== 'general' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {GOALS.find(g => g.id === selectedGoal)?.label || selectedGoal}
            </span>
            <button onClick={() => setSelectedGoal(null)} className="text-xs text-gray-500 hover:text-red-500">
              Clear
            </button>
          </div>
        )}
```

**Step 5: Commit**

```bash
git add client/src/components/AIScriptProcessor.tsx
git commit -m "feat: add goal picker for unstructured content processing"
```

---

### Task 5: Write Playwright tests

**Files:**
- Create: `tests/contextual-qa.spec.ts`

**Step 1: Write tests for the contextual Q&A and goal picker**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Goal Picker - Process Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/create/process');
    await page.waitForLoadState('networkidle');
  });

  test('shows goal picker when unstructured text is entered and Process clicked', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('I want to talk about our new product launch and how it will change the market.');
    await page.locator('button:has-text("Process with AI")').click();
    await expect(page.getByText('What type of presentation is this?')).toBeVisible();
    await expect(page.getByText('Pitch')).toBeVisible();
    await expect(page.getByText('Training')).toBeVisible();
    await expect(page.getByText('Status Update')).toBeVisible();
    await expect(page.getByText('Keynote')).toBeVisible();
  });

  test('skip link bypasses goal picker', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('Some unstructured content about our product.');
    await page.locator('button:has-text("Process with AI")').click();
    await page.getByText('Skip').click();
    // Goal picker should be hidden
    await expect(page.getByText('What type of presentation is this?')).not.toBeVisible();
  });

  test('does NOT show goal picker for structured text with SECTION markers', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('SECTION 1: INTRODUCTION\nHello world.\n\nSECTION 2: BODY\nMain content here.');
    await page.locator('button:has-text("Process with AI")').click();
    // Should NOT show goal picker - goes straight to processing
    await expect(page.getByText('What type of presentation is this?')).not.toBeVisible();
  });
});

test.describe('Q&A Side Panel', () => {
  test('Q&A button visible in presenter TopBar', async ({ page }) => {
    // Load a presentation via auto-save
    const fakeAutoSave = JSON.stringify({
      version: '1.0', title: 'Test', created: new Date().toISOString(), modified: new Date().toISOString(),
      sections: [
        { id: '1', heading: 'Slide 1', content: 'Test content for slide one.', advanceToken: 'next', selectedTriggers: ['next'] },
        { id: '2', heading: 'Slide 2', content: 'Test content for slide two.', advanceToken: 'done', selectedTriggers: ['done'] },
      ],
      knowledgeBase: [], settings: {}, metadata: {},
    });

    await page.goto('http://localhost:5174');
    await page.evaluate((d) => localStorage.setItem('verbadeck-autosave', d), fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('resume-recovery').click();
    await page.waitForLoadState('networkidle');

    // Navigate to presenter
    await page.click('a:has-text("Presenter")');
    await page.waitForTimeout(1000);

    // Q&A button should be visible in TopBar
    await expect(page.getByText('Q&A')).toBeVisible();
  });
});
```

**Step 2: Run tests**

Run: `npx playwright test tests/contextual-qa.spec.ts --project=chromium --reporter=list`
Expected: Tests for goal picker should pass. Q&A panel test verifies button is present.

**Step 3: Commit**

```bash
git add tests/contextual-qa.spec.ts
git commit -m "test: add contextual Q&A and goal picker tests"
```

---

### Task 6: Run full regression suite

**Step 1: Run all tests**

Run: `npx playwright test --project=chromium --reporter=list`
Expected: All tests pass including new ones. Existing Q&A-related tests still work (backward compatible).

**Step 2: Visual verification in headed mode**

Run: `npx playwright test tests/contextual-qa.spec.ts --project=chromium --headed`
Expected: Goal picker appears for unstructured text, skips for structured text. Q&A button visible in presenter.

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "test: verify contextual Q&A and goal picker with full suite"
```
