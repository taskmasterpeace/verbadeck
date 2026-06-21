# Auto-Recovery on Startup — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show a dismissible recovery banner on the Dashboard when auto-save data exists, letting users resume their last presentation.

**Architecture:** On Dashboard mount, read `localStorage['verbadeck-autosave']` via `loadAutoSave()`. If sections exist, render a banner above the 3-card grid. Resume loads data into Zustand store and navigates to Editor. Dismiss clears auto-save. No new files, no new dependencies.

**Tech Stack:** React 18, TypeScript, Zustand, Tailwind CSS, Playwright

---

### Task 1: Write the Playwright test for auto-recovery banner

**Files:**
- Create: `tests/auto-recovery.spec.ts`

**Step 1: Write the test file**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Auto-Recovery Banner', () => {
  const AUTO_SAVE_KEY = 'verbadeck-autosave';

  const fakeAutoSave = JSON.stringify({
    version: '1.0',
    title: 'Auto-saved Presentation',
    created: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    modified: new Date(Date.now() - 60000).toISOString(),
    sections: [
      { id: '1', content: 'Slide one content', advanceToken: 'next', selectedTriggers: ['next'] },
      { id: '2', content: 'Slide two content', advanceToken: 'continue', selectedTriggers: ['continue'] },
      { id: '3', content: 'Slide three content', advanceToken: 'done', selectedTriggers: ['done'] },
    ],
    knowledgeBase: [],
    settings: { selectedTone: 'professional', selectedModel: 'openai/gpt-4o-mini' },
    metadata: { totalSlides: 3 },
  });

  test('shows recovery banner when auto-save data exists', async ({ page }) => {
    await page.goto('http://localhost:5174');
    // Inject auto-save data before navigating
    await page.evaluate((data) => {
      localStorage.setItem('verbadeck-autosave', data);
    }, fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');

    const banner = page.getByTestId('auto-recovery-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('3 slides');
  });

  test('does NOT show banner when no auto-save data', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.evaluate(() => localStorage.removeItem('verbadeck-autosave'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const banner = page.getByTestId('auto-recovery-banner');
    await expect(banner).not.toBeVisible();
  });

  test('dismiss button hides banner and clears auto-save', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.evaluate((data) => {
      localStorage.setItem('verbadeck-autosave', data);
    }, fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');

    const banner = page.getByTestId('auto-recovery-banner');
    await expect(banner).toBeVisible();

    await page.getByTestId('dismiss-recovery').click();
    await expect(banner).not.toBeVisible();

    // Verify localStorage was cleared
    const autoSave = await page.evaluate(() => localStorage.getItem('verbadeck-autosave'));
    expect(autoSave).toBeNull();
  });

  test('resume button loads presentation and navigates to editor', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.evaluate((data) => {
      localStorage.setItem('verbadeck-autosave', data);
    }, fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('resume-recovery').click();
    await page.waitForLoadState('networkidle');

    // Should navigate to editor
    await expect(page).toHaveURL(/\/editor/);

    // Should show the 3 sections from auto-save
    await expect(page.getByText('Slide one content')).toBeVisible({ timeout: 5000 });
  });

  test('banner shows relative time since last save', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.evaluate((data) => {
      localStorage.setItem('verbadeck-autosave', data);
    }, fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');

    const banner = page.getByTestId('auto-recovery-banner');
    await expect(banner).toContainText(/ago/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/auto-recovery.spec.ts --reporter=list`
Expected: FAIL — `auto-recovery-banner` test ID not found

**Step 3: Commit**

```bash
git add tests/auto-recovery.spec.ts
git commit -m "test: add auto-recovery banner Playwright tests"
```

---

### Task 2: Add recovery state and banner to App.tsx

**Files:**
- Modify: `client/src/App.tsx:1-10` (imports)
- Modify: `client/src/App.tsx:43-50` (add recovery state)
- Modify: `client/src/App.tsx:142-152` (add recovery check useEffect)
- Modify: `client/src/App.tsx:540-546` (render banner above CreatePresentation)

**Step 1: Add recovery state and check logic**

In `client/src/App.tsx`, add these imports at the top (alongside existing imports):

```typescript
import { RotateCcw, X } from 'lucide-react';
```

After the `useAutoSave` hook call (~line 152), add:

```typescript
// Auto-recovery state
const [recoveryData, setRecoveryData] = useState<{
  sectionCount: number;
  savedAt: string;
} | null>(null);

// Check for auto-save data on mount (Dashboard recovery)
useEffect(() => {
  if (viewMode !== 'create') return;
  const saved = loadAutoSave();
  if (saved && saved.sections && saved.sections.length > 0) {
    setRecoveryData({
      sectionCount: saved.sections.length,
      savedAt: saved.modified || saved.created,
    });
  }
}, [viewMode]); // Re-check when returning to dashboard
```

**Step 2: Add handler functions**

After the recovery useEffect, add:

```typescript
const handleResumeRecovery = () => {
  const saved = loadAutoSave();
  if (!saved) return;
  setSections(saved.sections);
  if (saved.knowledgeBase) setKnowledgeBase(saved.knowledgeBase);
  setCurrentSectionIndex(0);
  setRecoveryData(null);
  clearAutoSave();
  setViewModeWithRoute('editor');
};

const handleDismissRecovery = () => {
  setRecoveryData(null);
  clearAutoSave();
};
```

**Step 3: Add relative time helper**

Add this helper function inside App (or above the component):

```typescript
function getRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}
```

**Step 4: Render the recovery banner**

In the `mainContent` JSX, inside the `{viewMode === 'create' && !isStreaming && (` block (~line 540), add the banner **before** `<CreatePresentation>`:

```tsx
{viewMode === 'create' && !isStreaming && (
  <>
    {/* Auto-Recovery Banner */}
    {recoveryData && (
      <div
        data-testid="auto-recovery-banner"
        className="container mx-auto max-w-7xl px-8 pt-8 pb-0"
      >
        <div className="flex items-center justify-between gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Resume your last presentation?
              </p>
              <p className="text-xs text-blue-700">
                {recoveryData.sectionCount} slide{recoveryData.sectionCount !== 1 ? 's' : ''} • saved {getRelativeTime(recoveryData.savedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="resume-recovery"
              onClick={handleResumeRecovery}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Resume
            </button>
            <button
              data-testid="dismiss-recovery"
              onClick={handleDismissRecovery}
              className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
              aria-label="Dismiss recovery"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )}
    <CreatePresentation
      onSelectFromScratch={() => setViewModeWithRoute('create-from-scratch')}
      onSelectProcessContent={() => setViewModeWithRoute('ai-processor')}
      onSelectKnowItAll={() => setViewModeWithRoute('know-it-all')}
    />
  </>
)}
```

**Step 5: Run tests**

Run: `npx playwright test tests/auto-recovery.spec.ts --reporter=list`
Expected: All 5 tests PASS

**Step 6: Commit**

```bash
git add client/src/App.tsx
git commit -m "feat: add auto-recovery banner on Dashboard startup"
```

---

### Task 3: Run full test suite to check for regressions

**Step 1: Run all existing tests**

Run: `npx playwright test --reporter=list`
Expected: All tests pass (including new auto-recovery tests)

**Step 2: Run headed mode for visual verification**

Run: `npx playwright test tests/auto-recovery.spec.ts --headed`
Expected: Visually verify the banner appears, dismisses, and resumes correctly

**Step 3: Commit the test file and any fixes**

If any tests failed, fix them. Then:

```bash
git add -A
git commit -m "test: verify auto-recovery with full test suite"
```
