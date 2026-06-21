# Auto-Recovery on Startup - Design

**Goal:** When a user returns to VerbaDeck after closing/refreshing, show a banner offering to resume their last presentation from auto-save data.

**Approach:** Toast banner on Dashboard (non-intrusive, user chooses to resume or dismiss)

## Architecture

- Check for auto-save data on Dashboard mount
- Show dismissible banner with section count and time info
- Resume loads full presentation into store and navigates to Editor
- Dismiss clears auto-save data
- Uses existing `useAutoSave` hook and `file-storage.ts` types

## Components

1. `App.tsx` — Add recovery state and banner rendering on Dashboard view
2. `useAutoSave.ts` — Already has `loadAutoSave()` and `clearAutoSave()`
3. No new files needed

## Data Flow

1. App mounts → `loadAutoSave()` called
2. If auto-save has sections → set recovery state with metadata
3. User clicks Resume → `setSections()`, `setKnowledgeBase()`, navigate to Editor
4. User clicks Dismiss → `clearAutoSave()`, hide banner

## Not in scope

- No changes to auto-save interval or behavior
- No changes to Library or file save flows
- No Zustand persistence changes
