# Keyboard Shortcuts - Manual Testing Guide

## Prerequisites
1. Start the development server: `npm run dev`
2. Open browser to http://localhost:5173
3. Wait for app to fully load

## Test Checklist

### 1. Help Modal (Ctrl+/)
- [ ] Press **Ctrl+/** → Keyboard Shortcuts modal opens
- [ ] Modal shows all categories: File, Navigation, Editor, Voice, Help
- [ ] Visual keyboard keys display correctly (e.g., "Ctrl", "S")
- [ ] Press **Ctrl+/** again → Modal closes

### 2. Search Functionality
- [ ] Open help modal (**Ctrl+/**)
- [ ] Type "save" in search box
- [ ] Only "Save presentation" shortcut visible
- [ ] Clear search → All shortcuts visible again
- [ ] Close modal

### 3. File Operations

#### Ctrl+L - Open Library
- [ ] Press **Ctrl+L**
- [ ] Library browser modal opens
- [ ] Toast notification appears: "Ctrl+L - Open library"
- [ ] Toast disappears after 2 seconds
- [ ] Close library modal

#### Ctrl+N - New Presentation
- [ ] Create some content first (go through create flow)
- [ ] Press **Ctrl+N**
- [ ] Confirmation dialog appears
- [ ] Cancel → No change
- [ ] Press **Ctrl+N** again
- [ ] Confirm → Sections cleared, returns to create view

#### Ctrl+O - Open Presentation
- [ ] Press **Ctrl+O**
- [ ] File picker dialog opens
- [ ] Cancel file picker
- [ ] Toast notification appears

#### Ctrl+S - Save Presentation (context-aware)
- [ ] Without content: Press **Ctrl+S** → Nothing happens (disabled)
- [ ] Create content (via Create from Scratch or Process Content)
- [ ] Press **Ctrl+S**
- [ ] Save dialog appears
- [ ] Save a file
- [ ] Toast notification appears

### 4. Navigation Shortcuts

#### Ctrl+H - Home/Create
- [ ] Navigate to editor view
- [ ] Press **Ctrl+H**
- [ ] Returns to create view (URL changes to / or /create)
- [ ] Toast appears

#### Ctrl+E - Editor (context-aware)
- [ ] Without content: **Ctrl+E** → Nothing happens
- [ ] With content: **Ctrl+E** → Goes to editor view
- [ ] Editor tabs visible
- [ ] Toast appears

#### Ctrl+P - Presenter Mode (context-aware)
- [ ] Without content: **Ctrl+P** → Nothing happens
- [ ] With content: **Ctrl+P** → Enters presenter view
- [ ] Sections visible
- [ ] Toast appears

#### Ctrl+K - Know It All
- [ ] Press **Ctrl+K**
- [ ] Navigates to Know It All view
- [ ] URL changes to /know-it-all
- [ ] Toast appears

### 5. Editor Shortcuts (context-aware)

#### Ctrl+T - Test Triggers
- [ ] Go to editor view (with content)
- [ ] Press **Ctrl+T**
- [ ] "Test Triggers" tab becomes active
- [ ] Toast appears
- [ ] Press **Ctrl+T** from non-editor view → Nothing happens

#### Ctrl+Q - Knowledge Base
- [ ] In editor view (with content)
- [ ] Press **Ctrl+Q**
- [ ] "Knowledge Base" tab becomes active
- [ ] Toast appears

### 6. Voice Control

#### Ctrl+Space - Toggle Voice
- [ ] Press **Ctrl+Space**
- [ ] Voice control starts (mic icon changes)
- [ ] Toast appears: "Toggle voice control"
- [ ] Press **Ctrl+Space** again
- [ ] Voice control stops
- [ ] Toast appears again

#### Ctrl+M - Q&A Mode (context-aware)
- [ ] In presenter view with content
- [ ] Press **Ctrl+M**
- [ ] Q&A mode toggles ON (button changes color)
- [ ] Toast appears
- [ ] Press **Ctrl+M** again
- [ ] Q&A mode toggles OFF
- [ ] From non-presenter view → Nothing happens

### 7. Input Field Protection
- [ ] Go to Know It All view
- [ ] Click in search/question input field
- [ ] Type **Ctrl+S** (or any shortcut)
- [ ] Characters appear in input (shortcut NOT triggered)
- [ ] Shortcuts should NOT work when typing in inputs

### 8. Visual Feedback
- [ ] Trigger any shortcut
- [ ] Toast appears in top-right corner
- [ ] Toast shows shortcut key (e.g., "Ctrl+L")
- [ ] Toast shows action description
- [ ] Toast has dark background, white text
- [ ] Toast auto-dismisses after ~2 seconds

### 9. Sidebar Hint
- [ ] Look at sidebar footer (if sidebar expanded)
- [ ] Should see: "Press Ctrl+/ for shortcuts"
- [ ] Text uses `<kbd>` styling for "Ctrl+/"

### 10. Mac Testing (if on Mac)
- [ ] All shortcuts show ⌘ instead of Ctrl
- [ ] All shortcuts work with Cmd key
- [ ] Help modal shows ⌘ symbols

### 11. Keyboard-Only Navigation
- [ ] Open help modal (**Ctrl+/**)
- [ ] Use **Tab** to navigate
- [ ] Focus moves to search box
- [ ] Focus moves to close button
- [ ] Press **Enter** on close button → Modal closes

### 12. Edge Cases

#### Browser Conflicts
- [ ] Press **Ctrl+S** → VerbaDeck saves (browser save blocked)
- [ ] Press **Ctrl+N** → VerbaDeck confirms (browser new window blocked)
- [ ] Other shortcuts don't conflict with browser defaults

#### Rapid Triggering
- [ ] Press **Ctrl+K** 5 times rapidly
- [ ] Only one toast should show at a time
- [ ] Navigation works correctly

#### Multiple Modifiers
- [ ] Try **Ctrl+Shift+S** → Should NOT trigger save
- [ ] Try **Alt+S** → Should NOT trigger save
- [ ] Only correct modifier combos work

## Expected Results

✅ **Pass Criteria**:
- All shortcuts work as described
- Toasts appear for all actions
- Context-aware shortcuts respect state
- Shortcuts don't trigger in input fields
- Help modal is searchable
- No browser shortcut conflicts
- Visual feedback is clear and timely

❌ **Failure Indicators**:
- Shortcut doesn't trigger action
- Toast doesn't appear
- Toast doesn't disappear
- Shortcuts trigger in input fields
- Help modal search doesn't work
- Context-aware shortcuts work when disabled
- Browser shortcuts override VerbaDeck

## Troubleshooting

**Shortcuts not working?**
1. Check browser console for errors
2. Verify browser window is focused
3. Check you're not in an input field
4. Try refreshing the page
5. Check browser extensions aren't interfering

**Help modal not opening?**
1. Try clicking elsewhere first (ensure focus)
2. Check console for React errors
3. Verify modal component loaded
4. Try with browser DevTools closed

## Notes

- This is a manual test - automation requires running dev server
- Test in Chrome, Firefox, and Safari if possible
- Test on both Windows and Mac for platform-specific symbols
- Take screenshots of any issues for bug reports

---

**Test Duration**: ~15-20 minutes for complete test
**Last Updated**: November 2025
