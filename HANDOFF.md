# VerbaDeck — Session Handoff (2026-10-05)

Pick up here. This captures everything done, in-flight, and planned in the "voice bug-fix + Know It All panic-word" session.

## TL;DR
- **Bug fixes: DONE** — committed to branch `fix/voice-pipeline-bugs` (commit `b93c1e7`), not yet PR'd.
- **Feature plan: FILED as GitHub issues** — VD-6 (epic) + VD-7/8/9 (slices).
- **Audit backlog: NOT yet filed** — 8 issues drafted below; create them (temp drafts were lost).
- The headline feature Robert cares about = the **"skip/panic word"** for Know It All Wall (VD-7). His framing: in a live interview, a fake-out like *"ready for the next question?"* gets grabbed as a question — say a word ("skip that") and it drops that one and keeps listening so the REAL next question becomes the card.

## DONE (committed)
Branch `fix/voice-pipeline-bugs` @ `b93c1e7`. Verified: 61 client unit + 26 server unit + 6 core-promise E2E + 162 curated E2E green; `tsc` clean; prod build OK.
1. **Cancel-word** now word-boundary matched (was `includes()`; "stop" fired on "stopwatch") — `client/src/lib/voice-controller.ts`.
2. **WS proxy error** forwarded as `type:'Error'` so the client surfaces it instead of a silent disconnect — `server/server.js` ~1462.
3. **`word_boost`** derived from the deck's `selectedTriggers` (was hardcoded demo words), passed via `/ws?word_boost=`; server now matches `/ws` on parsed pathname — `App.tsx`, `useAudioStreaming.ts`, `server/server.js` ~1380.
4. **start/stop TOCTOU** guarded with `startIdRef` so a stop mid-connect can't orphan the AudioContext/WebSocket — `useAudioStreaming.ts`.
5. **Banned indigo** → blue/cyan — `PresenterPage.tsx`, `settings/models/OperationRow.tsx`.
6. **Untracked** gitignored build artifacts — `test-results/.last-run.json`, `playwright-report/index.html`.

> ⚠️ Correction for future audits: the nav **debounce is NOT dead**. It's enforced in `usePresentation.ts` `advanceSection`/`goBackSection` via `voiceController.isDebounced()`/`recordNavigation()`. The detection hook holds a separate stateless `VoiceController`. Do not "fix" it.

**Next:** review the branch and open a PR to `main`.

## FILED (GitHub issues — the feature plan)
- **#6 (VD-6)** — EPIC: Know It All Wall overhaul; tracks #7/#8/#9 + cross-cutting gotchas. Spec: `docs/superpowers/specs/2026-06-24-know-it-all-question-detection-and-queue-design.md`.
- **#7 (VD-7)** — spoken **skip + panic words** (the "skip that" control). Small, do FIRST, ships on the current detector. Closes #2.
- **#8 (VD-8)** — **turn-yield + pre-sequence detection** (only capture after a pause; ignore "ready for the next question?"). Closes the Wall half of #1.
- **#9 (VD-9)** — **bounded open-queue + focus-to-enlarge** (the big layout piece).
- Build order: **7 → 8 → 9**.

## NOT YET FILED — audit backlog (create these 8 issues)
Found in the 2026-06-25 full-code audit; deliberately scoped OUT of the bug-fix pass. Drafts were lost when context ended — recreate from this list (each should be its own detailed issue, VD-10…):

1. **Land the bug-fix pass** — track PR'ing branch `fix/voice-pipeline-bugs` (the 6 fixes above). Status: DONE/needs-PR.
2. **Cleanup: dead code + duplicate components + stale Q&A stores** — PresenterView `{false ? …}` dead branch (~L298-386); unused `STRUCTURED_OUTPUT_MODELS`/`supportsStructuredOutput` and unregistered `timingErrorMiddleware` in server; duplicate layout shells (MainLayout vs RootLayout), top bars (StatusBar vs layout/TopBar), transcript bars (TranscriptTicker vs layout/TranscriptBar); dead Q&A state (`useQAStore` + Q&A fields in `usePresentationStore` ~L38-44 — only `useQASession` is live).
3. **Design-system consistency** — ~723 hardcoded Tailwind colors across 60+ files bypass the token system (won't dark-theme); worst: StatusBar (100% raw + `🎤` emoji), CountdownProgressBar, Presenter badges, AudienceView controls, QAAnticipationPanel (53). Migrate to tokens + drop production emoji. No purple.
4. **Security hardening** — auth open-by-default when `OWNER_PASSWORD` unset (whole API + WS public; `server/auth.js`) — add prod startup guard + document in DEPLOY.md; stop leaking `error.message` on 500s; validate PPTX upload type/size (`server.js` ~516-533).
5. **Voice WebSocket resilience** — no reconnection today (`useAudioStreaming.ts` ~149-160); add backoff reconnect + client keepalive ping (server `pong` stub exists ~1437) + "reconnecting…" toast.
6. **Refactor oversized files** — App.tsx (999L), server.js (1572L, extract inline prompts to prompts.js), openrouter.js (1320L, add shared `_chat()` helper), KnowItAllWall/Mode.
7. **Release hygiene** — version drift: `docs/VERSION`=1.2.0 vs all `package.json`=1.0.0 (+ in-app footer); README test badge says "65" but actual is 85 unit tests. (Version bump is a release decision — confirm number.)
8. **Accessibility pass** — icon-only buttons lack `aria-label`; tab strips (PresenterView, SettingsSidebar) lack `role=tab`/`aria-selected`; re-run `tests/accessibility.spec.ts` (@axe-core/playwright).

## Machine state
- Branch checked out: `fix/voice-pipeline-bugs` (not pushed).
- Dev stack NOT running. Start with `npm run dev` (client :5175, server :3002). During the session the server was briefly run with `AUTH_DISABLED=true` for testing — it's stopped now; normal start requires owner auth (`OWNER_PASSWORD`).
- Untracked, unrelated (leave alone): `docs/screenshots/**`, `slide-lab/package-lock.json`, `.claude/settings.local.json`.

## How to test Know It All Wall (for the panic-word work)
`npm run dev` → the Wall needs owner login (set `OWNER_PASSWORD`, or run server with `AUTH_DISABLED=true` for a throwaway test). Load `/know-it-all?testMode=true` to get the `window.__verbadeck` bridge (`say/next/back/goto/setView/enableQA/loadDemo/getState/knowledge`). Paste knowledge → Start Session → type or `say()` a question → answer card generates. Current detector + the per-question reset live in `KnowItAllWall.tsx` (~L76-145) and `useKeywordDetection.ts` (L42, still uses `includes()` — fix in VD-7).

## Immediate next steps
1. Create the 8 backlog issues above (VD-10…VD-17).
2. PR branch `fix/voice-pipeline-bugs` → `main`.
3. Start building **VD-7** (skip/panic words) — default to a distinctive multi-word phrase (e.g. "skip that" / "reset the board"), gate to a standalone turn, reuse the word-boundary matcher from the cancel-word fix.

## Skills (`.claude/skills/`)
New this session — invoke with the Skill tool:
- **`run-and-test-verbadeck`** — launch the stack, the owner-auth gate + `AUTH_DISABLED=true` test trick, the `window.__verbadeck` `?testMode=true` bridge, and how to verify without screenshots hanging.
- **`voice-control-words`** — how to add/change a spoken command (cancel/skip/panic/back) correctly: word-boundary matching (the `includes()` bug), standalone-turn gating, priority chain, collisions. Required reading for VD-7.
- **`issue-breakdown`** — VerbaDeck's GitHub issue house style (Background/Scope/Plan/Files/Gotchas/Acceptance; epic+slices; the `gh` VD-N title trick). How the VD-6…VD-9 issues were written.

Updated: `voice-audio-specialist` (debounce-is-NOT-dead correction, dynamic word_boost, `'Error'` casing) and `know-it-all-specialist` (the `includes()` bug + the VD-6/7/8/9 overhaul banner).

## Memory
Durable notes are in `C:\Users\taskm\.claude\projects\D--git-verbadeck\memory\` — see `bugfix-pass-2026-06-25.md` and `MEMORY.md`.

## Uncommitted on disk (survive a context clear, but not yet in git)
`HANDOFF.md` and the 5 files under `.claude/skills/` are written to disk but **not committed** (kept off the `fix/voice-pipeline-bugs` bug-fix branch to keep its PR focused). Commit them wherever you want — say the word.
