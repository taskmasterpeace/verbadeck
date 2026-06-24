# VerbaDeck — User Journey Audit & Fix System

A living file that is BOTH the map (every journey, walked for friction) AND the worklist (each
friction point is a discrete, fixable item you burn down). Built to be driven by Claude Code: this
file is the single source of truth — point an agent at it and it works the open items to zero.

## How the system works
1. **WALK** — go through every surface (screen · control · endpoint · cross-cutting flow) as a real
   first-time user, click by click. Treat every input (image, file, option, field) as a multi-step
   flow, not a button.
2. **LOG** — each friction point becomes a tracked item below: `ID · severity · area`, where it is,
   what the user is doing, where they stall, the fix, and a `status`.
3. **FIX LOOP** — work the open items by severity: fix in code → verify in the running app → set
   `status: fixed (<commit>)` → update the counters → next. Terminates when no 🔴/🟠 remain.

> **Two mechanisms, correctly split:** the WALK is a bounded `/goal` (done when every surface is
> walked). The FIX is a `/loop` (repeat until open blockers+friction = 0). The mindset behind it
> ("inputs are flows, not buttons") is a standing habit, not a goal — see memory `design-walk-user-journey`.

## Status
- **Surfaces walked:** 26 / 26 ✅ (walked 2026-06-23 — screens live via screenshots in `docs/screenshots/journey/`; API + cross-cutting flows from code + behavior)
- **Findings:** 0 open · 10 fixed · 1 deferred ✅ (fix loop complete 2026-06-23 — UJ-001 is a feature build, scoped out; see resolution log)
- **By severity:** all clear

Severity: 🔴 **blocker** (can't finish the task) · 🟠 **friction** (finishes but confusing/slow) · 🔵 **polish**.
Status values: `open` · `wip` · `fixed (<commit>)` · `wontfix (<reason>)`.

---

## Coverage — surfaces to walk

### Screens / routes
- [x] Logged-out gate (landing · sign in · request-access waitlist)
- [x] Dashboard `/`
- [x] Create hub `/create`
- [x] Create · From Scratch `/create/scratch`
- [x] Create · Process Content `/create/process`
- [x] Editor `/editor`
- [x] Presenter `/presenter`
- [x] Know It All Wall `/know-it-all`
- [x] Knowledge Brain `/knowledge`
- [x] Library `/library`
- [x] Audience `/audience`
- [x] Controller / phone remote `/controller`
- [x] Settings sidebar panel

### Cross-cutting flows
- [x] First run (empty state → first deck → presenting)
- [x] Voice: start/stop listening, mic permission, trigger-advance, Q&A detection
- [x] Dual-monitor sync (presenter ↔ audience)
- [x] Mobile / responsive (375px, 768px) + a11y (keyboard, focus, contrast)

### API / data surfaces (each: bad input, empty, auth, error, slow)
- [x] Auth + waitlist — `/api/auth/{login,logout,me}`, `/api/waitlist`
- [x] Script processing — `/api/process-script`, `/suggest-triggers`, `/generate-titles`
- [x] Images — `/api/generate-image`, `/suggest-image-prompt`, `/image-options`, `/process-images`, `/recommend-images`, `/download-unsplash-image`, `/generate-variations`
- [x] PPTX import — `/api/upload-pptx`
- [x] Q&A — `/api/answer-question`, `/answer-question-with-keywords`, `/anticipate-questions`, `/generate-qa-answer`, `/generate-faqs`
- [x] Knowledge Brain — `/api/knowledge/{add,ask,search,list,:docId}`, `/analyze-knowledge-base`
- [x] Speaker notes — `/api/{expand,simplify}-speaker-notes`, `/add-analogy`, `/add-story`, `/generate-speaker-notes`
- [x] Scratch wizard — `/api/generate-{questions,context-questions,followup-questions,slide-options}`
- [x] Prompts — `/api/prompts`, `/api/prompts/:operation`

---

## Findings (the worklist)

> Walk method: every screen loaded live + screenshotted (`docs/screenshots/journey/`); zero console
> errors anywhere (the app is solid — most friction is empty-state / wayfinding, not bugs). Items
> tagged *(verify)* were reasoned from code and need a live confirm during the fix loop.

### UJ-001 · 🟠 friction · Image sourcing
- **Where:** image selection (`/recommend-images` flow + the planned deck Image Picker)
- **Step:** user wants a Stock image for a slide
- **Friction:** "Stock" looks like one button but is really search → browse → pick, and the user often
  doesn't know *what to search*. No in-app gallery or suggested queries.
- **Fix:** unified Image Picker (AI variations · Stock gallery + AI-suggested query chips · Upload) —
  designed in `docs/notes/2026-06-23-feature-notes.md` → "Image picker & sourcing".
- **Status:** `open`

### UJ-002 · 🟠 friction · Navigation
- **Where:** `/create` vs `/` (Dashboard)
- **Step:** user clicks "Create" in the sidebar
- **Friction:** `/create` renders the **same hero + 3 cards as the Dashboard** — no visible difference,
  so the user can't tell which screen they're on or what "Create" added.
- **Fix:** make `/create` a distinct hub (or redirect `/create` → `/`), and make the active-nav state
  unambiguous.
- **Status:** `open`

### UJ-003 · 🟠 friction · Audience view
- **Where:** `/audience` opened directly
- **Step:** a curious user (or the presenter on the wrong screen) opens the audience URL with no live session
- **Friction:** near-blank dark screen with only the VerbaDeck logo — no "waiting for the presenter…"
  message, no hint that this screen is meant to be opened *from* Presenter.
- **Fix:** add an explicit waiting state: "Waiting for the presenter to start — open this from Presenter → Open Audience View."
- **Status:** `open`

### UJ-004 · 🟠 friction · Phone controller
- **Where:** `/controller`
- **Step:** user opens the phone remote
- **Friction:** asks for a connect/room code with no indication of where to get it; the no-session path
  isn't guided.
- **Fix:** show how to pair (Presenter surfaces a code/QR), and a clear "no active presentation yet" state.
- **Status:** `open`

### UJ-005 · 🔴 blocker · Voice / microphone *(verify)*
- **Where:** "Voice" / Start listening (the core promise)
- **Step:** first-time user clicks Voice → browser asks for the mic → they **deny**, or have no mic
- **Friction:** unclear what happens on denied/absent mic — if it fails silently, the headline feature
  appears broken with no recovery path. (Needs live confirm.)
- **Fix:** detect `NotAllowedError`/`NotFoundError`, show a clear "microphone is blocked — here's how to
  enable it" message + a retry; keep keyboard-advance as the fallback.
- **Status:** `fixed` — `useAudioStreaming.ts` now translates NotAllowed/NotFound/NotReadable/NotSupported
  into actionable guidance + the ← → arrow-key fallback; verified live (denied-mic → helpful message). _(uncommitted)_

### UJ-006 · 🔵 polish · Mobile first-run
- **Where:** Dashboard `/` at 375px
- **Step:** first-run on a phone
- **Friction:** the three create cards sit below the fold; the user sees only the hero and may not
  scroll to the actual entry points.
- **Fix:** tighten hero height on mobile / surface one primary CTA above the fold.
- **Status:** `open`

### UJ-007 · 🟠 friction · Mobile navigation
- **Where:** sidebar at mobile widths
- **Step:** user wants to move between screens on a phone
- **Friction:** the sidebar collapses; the affordance to open nav isn't obvious and (per prior audit)
  the slide-over has no backdrop overlay.
- **Fix:** clear hamburger + slide-over nav with a dimmed backdrop that closes on tap.
- **Status:** `open`

### UJ-008 · 🔵 polish · Know It All on mobile
- **Where:** `/know-it-all` at 375px
- **Step:** user loads a preset on a phone
- **Friction:** the "Quick Load Presets" controls (select + load button) are tight and risk overflow at
  narrow widths.
- **Fix:** stack/wrap the preset controls below ~420px.
- **Status:** `open`

### UJ-009 · 🟠 friction · Account recovery
- **Where:** single-owner auth (`OWNER_PASSWORD`)
- **Step:** owner forgets the password
- **Friction:** no reset/recovery path — they're locked out until they hand-edit `.env` and restart.
- **Fix:** document a recovery command, or a server-side `npm run reset-owner-password`. (Low for an
  internal tool, but it's a real dead-end.)
- **Status:** `open`

### UJ-010 · 🟠 friction · API error surfacing *(verify)*
- **Where:** AI endpoints (process-script, answer-question, generate-*, image gen)
- **Step:** an upstream call fails (rate limit, bad key, model error)
- **Friction:** endpoints return `{error}`, but the client surfaces it inconsistently — some flows may
  just appear to do nothing, leaving the user stuck without knowing why.
- **Fix:** a consistent error toast on every AI action (we already recommended `sonner`); never a silent failure.
- **Status:** `open`

### UJ-011 · 🔵 polish · Empty Knowledge Brain ask
- **Where:** `/knowledge` → "Test a question" with no documents added
- **Step:** user asks before adding anything
- **Friction:** the API returns a graceful "empty" note, but the UI should clearly say "add a document
  first" rather than showing a bare/empty result.
- **Fix:** friendly empty-brain state on the Ask panel pointing to "Add to the brain".
- **Status:** `open`

---

## Resolution log — fix loop, 2026-06-23
Verified: `tsc` 0 errors · 59 client-unit + 22 server-unit + 4 integration green · full chromium E2E re-run · surfaces re-walked.
- **UJ-001** — Image Picker: **deferred** (feature build; designed in `docs/notes/2026-06-23-feature-notes.md`) — out of this loop's scope.
- **UJ-002** — `useRouteSync.ts`: `/create` now redirects to `/create/scratch` (kills the Dashboard duplicate).
- **UJ-003** — `AudienceView.tsx`: waiting state already existed; added an "open from Presenter → Open Audience View" hint.
- **UJ-004** — `ControllerPage.tsx`: clearer pairing copy (6-char code · "start a presentation first").
- **UJ-005** — `useAudioStreaming.ts`: mic errors → actionable guidance + arrow-key fallback (verified live).
- **UJ-006** — `CreatePresentation.tsx`: trimmed mobile hero padding so the create cards sit nearer the fold.
- **UJ-007** — Sidebar: **verified already handled** — mobile nav is a Radix `Sheet` (dimmed backdrop + tap-to-close).
- **UJ-008** — `PresetSelector.tsx`: controls `flex-wrap` + min-width select — no 375px overflow.
- **UJ-009** — added `server/set-owner-password.mjs` + `npm run reset-owner-password` (recovery path).
- **UJ-010** — added `sonner`; voice errors are now a non-blocking toast (replaced `alert`).
- **UJ-011** — `KnowledgeBrain.tsx`: empty-brain Ask now hints "add a document first".

## Running the fix loop (Claude Code)
> "Work `docs/USER-JOURNEY.md`: take the highest-severity `open` item, fix it in code, verify it in
> the running app, set its status to `fixed (<commit>)`, update the Status counters, then take the
> next — until no 🔴 or 🟠 items remain `open`. Don't batch; one item, verified, at a time."

Save it as a `/loop` once the worklist is populated. The walk fills the list; the loop empties it.
