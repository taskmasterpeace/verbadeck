# Presenter View Module

## Overview
Dual-monitor presentation system with adaptive density layout, countdown timer between trigger and note change, and BroadcastChannel sync to audience window.

## Files
| File | Lines | Purpose |
|------|-------|---------|
| `client/src/pages/PresenterPage.tsx` | 175 | Container + QR code for phone remote |
| `client/src/components/PresenterView.tsx` | 487 | Main presenter display (LARGE - needs split) |
| `client/src/components/AudienceView.tsx` | 458 | Clean audience display (LARGE) |
| `client/src/hooks/useBroadcastChannel.ts` | 148 | BroadcastChannel sync |
| `client/src/hooks/usePresenterRoom.ts` | 66 | Room code generation for phone controller |
| `client/src/components/layout/TranscriptBar.tsx` | ~50 | Live transcript ticker |

## Countdown Timer System
1. Trigger word detected -> `currentSectionIndex` updates immediately (audience sees new slide)
2. `isCountingDown` = true, countdown animation starts
3. After `countdownDuration` seconds -> `presenterDisplayIndex` updates (notes change)
4. Gives presenter buffer time to finish thought before new notes appear

## Adaptive Density Layout (PresenterView)
- 300+ words -> compact fonts (text-sm)
- 400+ words -> 2-column layout
- 570+ words -> ultra-dense (7px labels)
- Word count calculated from speakerNotes + content

## BroadcastChannel Sync
- Channel: 'verbadeck-presentation'
- Presenter -> Audience: `{type: 'presentation-update', state: {currentSectionIndex, sections}}`
- Audience -> Presenter: `{type: 'request-state'}` on load
- Same-origin only (browser security)

## Keyboard Shortcuts (PresenterView)
- Arrow Right/Down/Space: Next slide
- Arrow Left/Up: Previous slide
- Home: First slide
- End: Last slide
- 1-9: Jump to slide N
- Escape: Exit presentation

## Known Issues
- **487 lines** - should split adaptive layout, keyboard shortcuts, and note rendering
- Presenter blank when navigating directly (sections not persisted to localStorage)
- Word count recalculated on every render (should useMemo)
- Hardcoded density thresholds (300/400/570) not configurable
- AudienceView serializes full sections array on every change (expensive)

## Connections
- **Reads from**: usePresentationStore (presenterDisplayIndex, sections, isCountingDown)
- **Triggers**: usePresentationStore.goToSection(), advanceSection()
- **Broadcasts to**: AudienceView via BroadcastChannel
- **Receives from**: Phone controller via usePresenterRoom WebSocket
