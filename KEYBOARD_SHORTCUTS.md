# VerbaDeck Keyboard Shortcuts

## Overview

VerbaDeck includes a comprehensive keyboard shortcuts system that allows power users to navigate and control the application efficiently without using the mouse. All shortcuts are cross-platform compatible (Ctrl on Windows/Linux, ⌘ Cmd on macOS).

## Quick Reference

Press **Ctrl+/** (or **⌘+/** on Mac) anytime to view the complete keyboard shortcuts help modal.

## Complete Shortcut List

### File Operations

| Shortcut | Action | Description |
|----------|--------|-------------|
| **Ctrl+S** | Save presentation | Saves the current presentation to a .verbadeck file (only available when presentation has content) |
| **Ctrl+O** | Open/Load presentation | Opens file dialog to load a saved presentation from file |
| **Ctrl+N** | New presentation | Creates a new presentation (confirms before clearing current work) |
| **Ctrl+L** | Open library | Opens the presentation library browser to load or manage saved presentations |

### Navigation

| Shortcut | Action | Description |
|----------|--------|-------------|
| **Ctrl+H** | Go to home/create | Navigate to the home/create view to start a new presentation |
| **Ctrl+E** | Focus editor | Navigate to the editor view (only available when presentation exists) |
| **Ctrl+P** | Start presenter mode | Enter presenter mode to begin presenting (only available when presentation exists) |
| **Ctrl+K** | Open Know It All | Navigate to Know It All mode for rapid Q&A practice |

### Editor Operations

| Shortcut | Action | Description |
|----------|--------|-------------|
| **Ctrl+T** | Test triggers | Switch to the Test Triggers tab in editor (only in editor view) |
| **Ctrl+Q** | Knowledge base | Switch to the Knowledge Base tab in editor (only in editor view) |

### Voice Control

| Shortcut | Action | Description |
|----------|--------|-------------|
| **Ctrl+Space** | Toggle voice control | Start or stop voice recognition |
| **Ctrl+M** | Toggle Q&A mode | Enable or disable Q&A listening mode (only in presenter view) |

### Help

| Shortcut | Action | Description |
|----------|--------|-------------|
| **Ctrl+/** | Show keyboard shortcuts | Open or close the keyboard shortcuts help modal |

## Features

### Smart Input Detection
Shortcuts are automatically disabled when typing in:
- Text inputs
- Textareas
- Content-editable elements
- Select dropdowns

This prevents accidental triggering while editing content.

### Visual Feedback
When a shortcut is triggered, a brief toast notification appears in the top-right corner showing:
- The shortcut that was pressed
- The action that was performed

The feedback disappears automatically after 2 seconds.

### Context-Aware Shortcuts
Some shortcuts are only available in specific contexts:
- **Editor shortcuts** (Ctrl+T, Ctrl+Q) only work when in editor view
- **Presenter shortcuts** (Ctrl+M) only work in presenter mode
- **File shortcuts** (Ctrl+S) only work when there's content to save

Disabled shortcuts are grayed out in the help modal.

### Cross-Platform Compatibility
The system automatically detects your operating system and displays:
- **Ctrl** on Windows and Linux
- **⌘ Cmd** on macOS
- **⇧ Shift** on macOS (instead of "Shift")
- **⌥ Alt** on macOS (instead of "Alt")

### Searchable Help
The keyboard shortcuts help modal includes a search feature:
1. Press **Ctrl+/** to open the help
2. Type in the search box to filter shortcuts
3. Search works across:
   - Shortcut descriptions
   - Key combinations
   - Categories

## Implementation Details

### Architecture

The keyboard shortcuts system consists of three main components:

#### 1. `useKeyboardShortcuts` Hook
Location: `client/src/hooks/useKeyboardShortcuts.ts`

Core functionality:
- Global keyboard event listener
- Platform detection (Mac vs Windows/Linux)
- Input field detection
- Shortcut matching and execution
- Visual feedback triggering

#### 2. `KeyboardShortcutsHelp` Component
Location: `client/src/components/KeyboardShortcutsHelp.tsx`

Features:
- Modal dialog with categorized shortcuts
- Search/filter functionality
- Visual keyboard key display (Ctrl+K style)
- Responsive design
- Accessible markup (ARIA labels)

#### 3. Integration in `App.tsx`
The shortcuts are configured in the main App component with context-aware enabling/disabling logic.

### Adding New Shortcuts

To add a new keyboard shortcut:

1. Open `client/src/App.tsx`
2. Find the `keyboardShortcuts` array
3. Add a new shortcut object:

```typescript
{
  key: 'x',                    // The key to press
  ctrl: true,                  // Require Ctrl/Cmd modifier
  shift: false,                // Optional: require Shift
  alt: false,                  // Optional: require Alt
  description: 'Do something', // User-facing description
  category: 'Navigation',      // Category for help modal
  action: () => {
    // Your action here
    doSomething();
  },
  enabled: someCondition,      // Optional: context-aware enabling
}
```

### Browser Compatibility

The keyboard shortcuts system works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Note: Some system-level shortcuts (e.g., Ctrl+W to close tab) cannot be overridden.

### Accessibility

The system is designed with accessibility in mind:
- Screen reader announcements for visual feedback
- Keyboard-only navigation in the help modal
- Clear visual indicators for active shortcuts
- Semantic HTML with proper ARIA labels
- High contrast visual feedback

## Testing

### Manual Testing
1. Load VerbaDeck
2. Press **Ctrl+/** to open shortcuts help
3. Try each shortcut in its appropriate context
4. Verify feedback toasts appear
5. Test search functionality in help modal
6. Verify shortcuts don't trigger in input fields

### Automated Testing
Run the Playwright test suite:

```bash
npm test tests/keyboard-shortcuts.spec.ts
```

Test coverage includes:
- Opening/closing help modal
- Search functionality
- Individual shortcuts
- Context-aware behavior
- Input field protection
- Visual feedback
- Cross-platform key display

## Troubleshooting

### Shortcuts not working?

1. **Check browser focus**: Make sure the browser window is focused
2. **Check input focus**: Shortcuts don't work when typing in text fields
3. **Check context**: Some shortcuts only work in specific views (editor, presenter, etc.)
4. **Check browser extensions**: Some extensions may intercept keyboard shortcuts
5. **Try incognito mode**: Test without browser extensions

### Conflicts with browser shortcuts?

Some shortcuts may conflict with browser defaults:
- **Ctrl+S** - Browser may show save dialog (this is prevented by default)
- **Ctrl+N** - Browser may open new window (this is prevented when confirmed)
- **Ctrl+T** - Browser may open new tab (only works in editor, so usually safe)

If conflicts occur, the browser shortcut will typically take precedence.

## Future Enhancements

Potential improvements:
- [ ] Customizable shortcuts (user-defined key bindings)
- [ ] Shortcut chords (e.g., Ctrl+K, Ctrl+S for multi-key sequences)
- [ ] Global shortcuts across tabs (if using Service Worker)
- [ ] Export/import shortcut configurations
- [ ] Shortcut macros (record sequences of actions)
- [ ] Voice-activated shortcuts (e.g., "open editor")

## Contributing

To contribute new shortcuts:

1. Ensure the shortcut doesn't conflict with browser defaults
2. Add it to the appropriate category
3. Include clear description
4. Add tests in `keyboard-shortcuts.spec.ts`
5. Update this documentation
6. Submit a pull request

---

**Last Updated**: November 2025
**Version**: VerbaDeck 2.0
