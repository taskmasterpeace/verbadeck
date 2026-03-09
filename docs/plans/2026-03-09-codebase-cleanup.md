# Codebase Cleanup — Design & Implementation Plan

> **Goal:** Commit 48 uncommitted files as logical groups, clean 86 stale markdown docs, fix 113 TS errors, fix broken mobile test. No architectural changes.

## Phase A: Triage & Commit the 48 Uncommitted Files

### Task 1: Review all diffs, group into logical commits
- Group 1: Server changes (prompts, model-config, openrouter, server.js, constants)
- Group 2: Client core (App.tsx already committed in e7aa835, remaining component changes)
- Group 3: Config & build (package.json, package-lock, vite.config, tailwind, playwright)
- Group 4: Documentation (README, QUICKSTART, CLAUDE.md, TEST_SUMMARY)
- Group 5: Remaining client components & hooks

### Task 2: Fix any issues found during review, then commit each group

## Phase B: Codebase Hygiene

### Task 3: Fix mobile-responsive.spec.ts
- Move `test.use()` outside describe block (Playwright requirement)

### Task 4: Fix TypeScript errors (unused vars/imports only)
- Remove unused imports, prefix unused vars with `_`
- Only touch files with TS6133/TS6192/TS6198 errors

### Task 5: Clean root-level markdown docs
- Keep in root: CLAUDE.md, README.md, QUICKSTART.md, TEST_SUMMARY.md, KEYBOARD_SHORTCUTS.md, USE_CASES.md, DEPLOYMENT_CHECKLIST.md
- Move ~60 completion/implementation reports to docs/archive/
- Delete ~10 truly redundant files (duplicates, expired plans)

## Phase C: Verify

### Task 6: Run full Playwright suite + TypeScript check
