# VerbaDeck V2.0 - Critical Accessibility Fixes Implementation Guide

This document provides step-by-step instructions for fixing the critical accessibility violations identified in the audit.

## Priority 1: Critical Fixes (2 hours)

### Fix 1: Add Label to Range Input (Create From Scratch)

**File:** `c:\git\verbadeck\client\src\components\CreateFromScratch.tsx`

**Current Code (line search for `type="range"`):**
```tsx
<input type="range" min="3" max="25" class="w-full" value="5">
```

**Fixed Code:**
```tsx
<div className="space-y-2">
  <label htmlFor="slide-count-input" className="block text-sm font-medium">
    Number of slides: {slideCount}
  </label>
  <input
    id="slide-count-input"
    type="range"
    min="3"
    max="25"
    className="w-full"
    value={slideCount}
    onChange={(e) => setSlideCount(Number(e.target.value))}
    aria-label={`Number of slides: ${slideCount}`}
    aria-valuetext={`${slideCount} slides`}
  />
  <p className="text-xs text-muted-foreground">
    Choose between 3 and 25 slides for your presentation
  </p>
</div>
```

---

### Fix 2: Add Label to Select Element (Know It All Mode)

**File:** `c:\git\verbadeck\client\src\components\KnowItAllMode.tsx`

**Current Code (search for `data-testid="preset-selector"`):**
```tsx
<select class="flex-1 px-3 py-2 border rounded-lg text-sm" data-testid="preset-selector">
```

**Fixed Code:**
```tsx
<div className="space-y-1">
  <label htmlFor="preset-selector" className="block text-sm font-medium">
    Knowledge Base Preset
  </label>
  <select
    id="preset-selector"
    className="flex-1 px-3 py-2 border rounded-lg text-sm"
    data-testid="preset-selector"
    aria-label="Select a knowledge base preset"
  >
    {/* options */}
  </select>
</div>
```

---

### Fix 3: Add Accessible Name to Progress Bar

**File:** `c:\git\verbadeck\client\src\components\ui\progress.tsx`

**Current Code:**
```tsx
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
```

**Fixed Code:**
```tsx
interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  'aria-label'?: string;
  'aria-valuetext'?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    aria-label={props['aria-label'] || 'Progress'}
    aria-valuetext={props['aria-valuetext'] || `${value || 0}% complete`}
    {...props}
  >
```

**Then update usages in CreateFromScratch.tsx:**
```tsx
<Progress
  value={progress}
  aria-label="Slide generation progress"
  aria-valuetext={`Generating slides: ${progress}% complete`}
/>
```

---

## Priority 2: High Priority Fixes (4 hours)

### Fix 4: Color Contrast for Keyboard Shortcut Hint

**File:** `c:\git\verbadeck\client\src\layouts\MainLayout.tsx`

**Current Code (search for `Ctrl+/`):**
```tsx
<kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono">
  Ctrl+/
</kbd>
```

**Fixed Code (Option 1 - Darken text):**
```tsx
<kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono text-slate-700">
  Ctrl+/
</kbd>
```

**Fixed Code (Option 2 - Increase size):**
```tsx
<kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px] font-mono font-semibold">
  Ctrl+/
</kbd>
```

---

### Fix 5: Add Skip to Main Content Link

**File:** `c:\git\verbadeck\client\src\layouts\MainLayout.tsx`

**Location:** Very beginning of MainLayout component return statement

**Add this code:**
```tsx
export function MainLayout({ children, topBar, transcriptBar }: MainLayoutProps) {
  // ... existing state and hooks ...

  return (
    <>
      {/* Skip to main content link - ACCESSIBILITY FIX */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>

      <SidebarProvider defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>
        <Sidebar collapsible="icon">
          <SidebarNav />
        </Sidebar>
        <SidebarInset className="flex flex-col">
          {topBar && <div className="sticky top-0 z-40">{topBar}</div>}
          <main id="main-content" className="flex-1 overflow-auto">
            {children}
          </main>
          {/* ... rest of component ... */}
```

**Also add to `client/src/index.css` if not already present:**
```css
/* Screen reader only - visible on focus */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

### Fix 6: Add ARIA Live Regions

**File:** `c:\git\verbadeck\client\src\components\KnowItAllWall.tsx`

**Add at the top of the component return:**
```tsx
export function KnowItAllWall({ ... }: Props) {
  // ... existing code ...

  return (
    <div className="space-y-2">
      {/* ARIA Live Region for Screen Reader Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {detectedQuestion && `New question detected: ${detectedQuestion}`}
        {questions.find(q => q.status === 'generating') && 'Generating answer options, please wait...'}
        {questions.find(q => q.status === 'ready') && 'Answer options ready. Say a keyword to select an answer.'}
        {questions.find(q => q.status === 'answered') && 'Question answered successfully.'}
      </div>

      {/* ... rest of component ... */}
```

**File:** `c:\git\verbadeck\client\src\components\PresenterView.tsx`

**Add near the top of the return statement:**
```tsx
export function PresenterView({ ... }: Props) {
  // ... existing code ...

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {/* ARIA Live Region for Section Changes */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {`Section ${sectionIndex + 1} of ${totalSections}: ${currentSection?.heading || 'Untitled'}`}
      </div>

      {/* ... rest of component ... */}
```

**File:** `c:\git\verbadeck\client\src\components\layout\TopBar.tsx`

**Add for voice control status:**
```tsx
export function TopBar({ ... }: TopBarProps) {
  return (
    <>
      {/* ARIA Live Region for Voice Control Status */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {isStreaming ? 'Voice control is now active' : 'Voice control stopped'}
      </div>

      <div className="flex h-14 items-center gap-2 border-b bg-background px-4">
        {/* ... rest of component ... */}
```

---

## Priority 3: Modal Focus Management (6 hours)

### Fix 7: Settings Modal Focus Trap

**File:** `c:\git\verbadeck\client\src\components\settings\SettingsSidebar.tsx`

**Add these hooks at the top of the component:**
```tsx
import { useEffect, useRef, useCallback } from 'react';

export function SettingsSidebar({ isOpen, onClose }: Props) {
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Store trigger element and set initial focus
  useEffect(() => {
    if (isOpen) {
      // Store the element that opened the modal
      triggerElementRef.current = document.activeElement as HTMLElement;

      // Focus first element in modal
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    } else {
      // Return focus to trigger element when closing
      if (triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen]);

  // Trap focus within modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Tab') {
      const focusableElements = document.querySelectorAll(
        '[role="dialog"] button, [role="dialog"] [href], [role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea, [role="dialog"] [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <button
          ref={firstFocusableRef}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </button>

        <SheetHeader>
          <SheetTitle id="settings-title">Settings</SheetTitle>
          {/* ... rest of component ... */}
```

---

## Testing After Fixes

### 1. Run Accessibility Tests

```bash
npx playwright test tests/accessibility.spec.ts
```

**Expected Results After Fixes:**
- Dashboard: 0 violations (was 1)
- Create From Scratch: 0 violations (was 3)
- Know It All: 0 violations (was 2)
- All other pages: 0 violations

### 2. Manual Keyboard Testing

1. Open the app
2. Press Tab immediately - you should see "Skip to main content" link
3. Press Enter to skip to main content
4. Navigate through the app using only Tab and Enter
5. Open Settings modal, verify focus stays within modal
6. Press Escape, verify focus returns to Settings button

### 3. Screen Reader Testing (Optional)

**Windows (NVDA):**
1. Install NVDA (free)
2. Navigate to VerbaDeck
3. Listen for announcements when:
   - Changing slides in Presenter View
   - Detecting questions in Know It All
   - Starting/stopping voice control

**macOS (VoiceOver):**
1. Enable VoiceOver (Cmd+F5)
2. Navigate with VoiceOver cursor
3. Verify all interactive elements are announced
4. Check form labels are read correctly

---

## Verification Checklist

After implementing all fixes, verify:

- [ ] Range input in Create From Scratch has visible label
- [ ] Select element in Know It All has visible label
- [ ] Progress bar announces its purpose to screen readers
- [ ] Keyboard shortcut hint (Ctrl+/) has sufficient contrast
- [ ] "Skip to main content" link appears when pressing Tab
- [ ] Skip link jumps to main content area
- [ ] Status changes are announced to screen readers
- [ ] Settings modal traps focus properly
- [ ] Focus returns to trigger button when modal closes
- [ ] All accessibility tests pass
- [ ] No console errors or warnings

---

## Estimated Time Investment

| Phase | Tasks | Time | Complexity |
|-------|-------|------|------------|
| Phase 1 | Form labels, progress bar | 2 hours | Low |
| Phase 2 | Color contrast, skip link, live regions | 4 hours | Medium |
| Phase 3 | Focus management | 6 hours | High |
| Testing | Manual + automated | 2 hours | Medium |
| **Total** | | **14 hours** | |

---

## Success Criteria

After completing all fixes:

1. **Automated Tests:** All 27 accessibility tests pass
2. **WCAG Compliance:** Achieve WCAG 2.1 Level AA compliance
3. **Manual Testing:** Full keyboard navigation works without mouse
4. **Screen Reader:** All dynamic content properly announced
5. **No Regressions:** Existing functionality remains intact

---

## Support

If you encounter issues implementing these fixes:

1. Check the main ACCESSIBILITY.md document for detailed explanations
2. Review the test file: `tests/accessibility.spec.ts`
3. Run tests in UI mode: `npx playwright test --ui`
4. Use browser DevTools accessibility inspector

---

## Next Steps After Fixes

1. Run full test suite: `npm test`
2. Run accessibility tests: `npx playwright test tests/accessibility.spec.ts`
3. Update ACCESSIBILITY.md with "Fixed" status
4. Consider adding accessibility checks to CI/CD pipeline
5. Schedule periodic accessibility reviews (quarterly)
