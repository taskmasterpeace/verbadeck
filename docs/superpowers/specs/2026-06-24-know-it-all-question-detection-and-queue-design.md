# Know It All Wall — Conversational Question Detection + Bounded Open-Queue

**Date:** 2026-06-24
**Status:** Design (approved direction; pending spec review)
**Closes:** [#1](https://github.com/taskmasterpeace/verbadeck/issues/1) (the Wall detector half — presenter's own speech captured as questions) and [#2](https://github.com/taskmasterpeace/verbadeck/issues/2) (panic words)
**Origin:** Live demo, 2026-06-24 — *"There was a question asked, and then a second question asked… I said a question again, I gotta fix that"* and *"I gotta have panic words."*

---

## 1. Problem

The Know It All Wall detects a question whenever a final transcript **starts with** one of ~50 starter words (`how / what / is / are / tell me / explain / …`) or ends with `?`. Natural presenter speech constantly starts that way, so the presenter's *own* talking lands on the wall as questions and gets answered. Two failure shapes from the demo:

1. **False positives** — declarative/rhetorical speech captured as questions.
2. **Pre-sequence confusion** — *"You ready for the next question? …alright, let me ask you…"* — the preamble itself is question-shaped and gets grabbed as "the question," while the real question that follows is dropped (queue-mode blocks it) or competes with it.

Today's only controls are a binary toggle: **queue mode** (one question at a time, others silently dropped) vs **rapid fire** (unlimited stacking). Neither matches how a presenter actually fields back-to-back questions.

> Note: the presenter-mode Q&A path (`useVoiceNavigation` → `voice-controller.detectQuestion`) is a **separate** detector and already received a cooldown guard (commit `43cecf2`). This spec is the Wall's own detector (`KnowItAllWall.tsx`), which is where the demo happened.

---

## 2. Research grounding

- **Pre-sequences (Schegloff 1980, "Preliminaries to Preliminaries: 'Can I Ask You a Question?'").** A turn like *"can I ask you a question?"* is a **pre-sequence**: it *projects* an upcoming question but is **not** the base question. It expects a go-ahead, after which the real ("base") question is delivered. → Pre-question markers must **arm** the listener, not be captured. (In a talk the audience usually skips the go-ahead and just asks, so we model arm → capture, not arm → go-ahead → capture.)
- **Turn-yield is the strongest cue.** Research on interrogative vs. rhetorical questions finds that *whether and how the speaker continues their turn after the interrogative* is a top predictor of a genuine, answer-seeking question. A real question is followed by a **turn transition** (the asker stops); a rhetorical aside is talked straight through. → Capture on **turn-yield**, not sentence shape alone.
- **We already receive the turn-yield signal.** AssemblyAI v3 streaming detects the end of a turn and ships `end_of_turn` (surfaced as `useVoiceStore().isLastTranscriptFinal`). We **trust its flag** — no custom silence timer in v1; its sensitivity is tunable later.

Sources: Schegloff, *Sociological Inquiry* (1980) — https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1475-682X.1980.tb00018.x · "Interaction of discourse markers and prosody in rhetorical questions," *Journal of Linguistics* — https://www.cambridge.org/core/journals/journal-of-linguistics/article/interaction-of-discourse-markers-and-prosody-in-rhetorical-questions-in-german/8762D075A538E1D40B40A4D4D66484D6

---

## 3. Detection pipeline (always-on)

A new **pure** classifier, `client/src/lib/question-detection.ts`, classifies each transcript event so it can be unit-tested without the component.

```ts
type Utterance = { text: string; isFinal: boolean }; // isFinal === AssemblyAI end_of_turn
type Verdict =
  | { kind: 'panic' }                 // reset word
  | { kind: 'skip' }                  // skip/next word
  | { kind: 'reopen'; pillId: string }// opening words match a waiting pill → re-open it
  | { kind: 'pre' }                   // pre-question marker → arm, do not capture
  | { kind: 'question'; text: string }// a real, answer-seeking question → capture
  | { kind: 'rhetorical' }            // tag/aside → ignore
  | { kind: 'none' };

function classify(u: Utterance, ctx: DetectContext): Verdict; // ctx carries config + current pills + armedUntil
```

**Normalization first.** Every rule runs on a normalized transcript: lowercase, strip leading fillers (`um, uh, so, like, okay`), collapse whitespace, expand common contractions (`lemme→let me, gonna→going to, wanna→want to, gotta→got to`). Markers match as **phrase-contains**, not only `startsWith`, so *"so, real quick, can I ask…"* still arms. (§13 covers the word lists.)

**Priority order** (first match wins): `panic → skip → reopen → pre → question → rhetorical → none`.

Rules:

1. **Panic / skip** — match against configured `panicWord` / `skipWord` (comma-separated, like the existing `cancelWord`). Checked first so they always win, even mid-turn.
2. **Reopen** — if the utterance's opening words exactly prefix-match a **waiting pill's** question, return `reopen(pillId)` so it focuses that pill instead of being treated as a new question. This is what makes *"say the first words to pop it open"* unambiguous.
3. **Pre-question markers → arm.** Match a pre-question phrase (*"can I ask you," "let me ask you," "I have a question," "quick question," "ready for the next (question|one)," "here's my question," "got a question"*) → return `pre`. The component sets `armedUntil = now + ARM_WINDOW_MS (15_000)` and captures nothing.
4. **Question capture requires turn-yield.** Return `question` **only when `isFinal` (end_of_turn) is true**, the text is interrogative (ends with `?`, or starts with a question word / command starter), `length > 10`, and it isn't pure-rhetorical. Requiring `isFinal` is the core change: the asker **paused**. Mid-turn `?`s are no longer captured. *Always-on + preamble boost:* capture happens regardless of armed state; being armed only **relaxes** the bar (accept a slightly-below-threshold interrogative, widen dedup tolerance) — it never *gates* capture.
5. **Rhetorical filter.** A tag/aside (*"right?," "you know?," "isn't it?," "okay?," "you know what I mean?"*) or anything that fails the `isFinal` gate → `rhetorical` → ignore.

Dedup against in-play questions stays (case-insensitive exact match) plus a short same-text cooldown so one slow `end_of_turn` re-emission doesn't double-add.

---

## 4. The wall: bounded open-queue (max 2 open + pills)

Replaces the queue/rapid-fire toggle.

- **Open set:** up to **2** cards rendered "open" at once, each with its A/B answer pair (existing `answer1`/`answer2`). Both are visible; **voice-confirm targets one *focused* card** — see §4.1.
- **Pills:** further captured questions collapse into compact **2-word pills** (`status: 'queued'`) under the open cards. A pill **re-opens** on tap, keyboard, or the `reopen` voice verdict (§3) — letting the presenter "shoot through any of them" in any order.
- **Cap = 3 in play** (2 open + 1 pill). A 4th capture is held as `status: 'waiting'` and surfaced only as a count ("+1 waiting"); it promotes when a slot frees. No overwriting, no silent loss.
- **Complete:** confirming the focused card's answer keyword (existing voice-confirm) marks it `complete` (checked + cleared) — *exactly as today*. The next pill/waiting question promotes into the open set.

### 4.1 Focus model (resolves keyword collision)

Two open cards mean up to four answer keyword sets live at once → collisions. Resolution: exactly **one open card is *focused*** at a time (default: the oldest open). **Only the focused card's answer keywords are voice-armed.** The second open card is a **read-ahead peek** (visible, answers shown) but not voice-armed.

**Focusing = enlarging (the presenter's refinement, 2026-06-24).** Say a card's **opening words** (or `"next"`, or tap it) and that card **grows to fill the space** while the other shrinks to a peek — so the question you're answering is unmistakably the big one. The matched opening words are **highlighted on the card** as confirmation the system locked onto the right question (*"so it knows, okay, this is what the user's saying"*). Up to **three** questions are visible at once (2 open + 1 pill); a pill enlarges into focus the same way when you say its words. Only the focused card's keywords are voice-armed, preserving the unambiguous keyword-confirm mechanism.

### 4.2 State / data model

`QuestionCard.status` extends to: `'generating' | 'ready' | 'confirming' | 'queued' | 'waiting' | 'complete' | 'dismissed'`. Derived selectors compute `openCards`, `focusedId`, `pills`, `waitingCount` from the single `questions` array — no parallel state.

---

## 5. Panic / skip / reset words ([#2](https://github.com/taskmasterpeace/verbadeck/issues/2))

- **Config:** add `panicWord` and `skipWord` to the presentation/settings store, alongside the existing `cancelWord`. Comma-separated, user-editable; empty = disabled.
- **Panic** → set all non-`complete` cards to `dismissed`, abort in-flight generation (§6), clear the open set, return to idle ("Speak a question"). The "specific reset" from the demo.
- **Skip** → dismiss only the focused card (abort its in-flight call); promote the next.
- Both are highest priority in `classify` so they fire even while answering.

---

## 6. Answer generation, concurrency & cancellation

- **Eager for open, lazy for pills.** Generate the A/B pair only for cards in the **open set** (≤2). Pills/waiting are captured (text stored) but **not** generated until promoted — saves cost and avoids wasted work on questions later skipped or panicked away.
- **Concurrency cap = 2** in-flight generations (the two open cards); promotion triggers the next.
- **Cancellation.** Each generation holds an `AbortController`. **Panic** aborts all in-flight + pending; **skip** aborts the focused card's call. Reuses the existing `cancelAnswerQuestion` path.
- **Ordering.** Capture order is preserved; the oldest open card is the default focus.

---

## 7. Feedback & visible states

The presenter must always know what the wall is doing — especially that it's *listening but holding*.

- **Idle:** "Speak a question."
- **Armed (pre-question window open):** a subtle "listening for your question…" pulse + a countdown of the 15s window — confirms the preamble registered.
- **Captured:** brief flash + soft chime as a card lands, so a question entering the queue is noticeable mid-sentence.
- **Generating / ready / focused / complete:** distinct affordances (spinner → answers → focus ring → check-and-clear).
- **Pill promote / 4th waiting:** "+N waiting" counter; promotion animates the pill into an open slot.

All transitions respect `prefers-reduced-motion`.

---

## 8. Manual control & agent-native parity

Every voice action has a **click/keyboard** equivalent and is **drivable from `window.__verbadeck`** (project principle + needed for E2E):

- Bridge actions: `openPill(id)`, `focusCard(id)`, `confirm(cardId, 'A'|'B')`, `skip()`, `panic()`, plus existing manual question entry.
- Keyboard: `←/→` move focus across open cards, `1`/`2` confirm A/B of the focused card, `Backspace` skip, `Esc` panic, `Enter` open the first pill.
- Bridge state exposed: `{ armedUntil, openCards, focusedId, pills, waitingCount, lastVerdict }` for assertions and agent control.

---

## 9. Config validation & word collisions

Panic/skip/cancel words are spoken triggers — they must not collide with each other, with slide **advance** triggers, or with common filler.

- On save, validate the panic/skip/cancel sets are mutually exclusive and don't match any active section trigger word; warn inline if they do.
- Defaults are rare in normal speech and multi-word where possible (panic = `"reset the board"`, skip = `"skip that"`), reducing accidental fire.

---

## 10. Affected files

| File | Change |
|---|---|
| `client/src/lib/question-detection.ts` *(new)* | Pure `classify()` + normalization + marker/rhetorical/starter lists + config/context types. Fully unit-tested. |
| `client/src/components/KnowItAllWall.tsx` | Replace the detection `useEffect` (lines ~76–145) with `classify()` + armed-window state; replace queue/rapid-fire with the open-queue + focus model; render 2 open cards + focus ring + pills + "+N waiting"; lazy generation. |
| `client/src/components/know-it-all/*` (SessionStats, cards, pill) | Drop the queue-mode toggle; add focus ring, pill component, armed/waiting indicators, capture feedback. |
| `client/src/stores/` (presentation/settings) | Add `panicWord`, `skipWord` (persisted with settings). |
| `client/src/components/SettingsSidebar` (or Know It All config) | Editable panic/skip/cancel fields + collision validation (§9). |
| `window.__verbadeck` bridge (App.tsx bridgeRef) | Expose the actions + state in §8. |
| `client/src/lib/question-detection.test.ts` *(new)* | Unit tests for every rule, normalization, and the demo transcripts. |
| `tests/know-it-all-*.spec.ts` | E2E for arm-don't-capture, capture-on-end-of-turn, 2-open + focus + pill promote, panic/skip — via the `?testMode=true` bridge. |

---

## 11. Edge cases & error handling

- **No `end_of_turn` ever fires** (ASR quirk): fallback — if an interim interrogative is stable for `> ARM_WINDOW_MS/2` with no further speech, treat as final. Logged.
- **Pre-question with no follow-up** (armed window expires): window lapses, nothing captured, no stuck state.
- **Compound question in one turn** (*"how does pricing work, and what about teams?"*): v1 captures as a **single** card (no auto-split) — auto-splitting risks fragmenting one nuanced question; revisit if real sessions show demand.
- **Voice pill re-open vs. new question:** resolved by the `reopen` verdict (§3 rule 2) — exact opening-words prefix-match to a waiting pill wins over new-question capture.
- **Answer API failure** for an open card: existing error-answer behavior; the card stays open so the presenter can field it manually.
- **Panic/skip mid-generation:** aborts the in-flight call (§6); no orphaned answers land after a reset.
- **Dedup vs. legitimately repeated question:** exact-text dedup only within the in-play set; once `complete`/`dismissed`, the same text can be asked again.

---

## 12. Testing strategy

- **Unit (`classify`)** — table-driven over real demo lines: `"you ready for the next question?"` → `pre`; `"how does pricing work?"`+`isFinal` → `question`; same +`!isFinal` → `none`; `"isn't that wild?"` (tag) → `rhetorical`; `"reset the board"` → `panic`; pill-prefix utterance → `reopen`; contraction/filler normalization cases.
- **E2E (Wall, testMode bridge)** — drive transcript events: arm→capture lands exactly one question; two back-to-back → 2 open cards (one focused); a third → pill; `reopen`/`focusCard` works; confirming the focused keyword completes + promotes; panic clears to idle and aborts generation.
- **Gate:** `tsc` clean + new unit suite + the Wall E2E green before close.

---

## 13. Transcript normalization & marker lists

- Normalization (§3) is a small pure helper, unit-tested independently.
- Pre-question, rhetorical-tag, and command-starter lists are **named constants** in `question-detection.ts` for fast iteration as we learn from real sessions. Treat them as data, not logic.

---

## 14. Telemetry & debug overlay

Detection is the riskiest part — make misfires diagnosable.

- Every utterance logs `{ text, isFinal, verdict, reason }` (existing emoji-log style).
- A dev-only **debug ribbon** (toggle, off by default) shows the last few verdicts on-screen during a live session, so a misfire is explained on the spot rather than guessed at later.

---

## 15. Success criteria (acceptance)

Beyond "tests pass," the design succeeds when, on the demo script that originally misfired:

- Continuous presenter speech (no pause after question-shaped phrases) → **0 captures**.
- A genuine question followed by a pause → **exactly 1** capture.
- Two back-to-back paused questions → **2 open cards** (one focused); a third → **1 pill**.
- Panic word → wall returns to idle, in-flight generation aborted.
- The pre-sequence *"you ready for the next question? …let me ask you… [real Q]"* → preamble **not** captured; real Q **is**.

---

## 16. Issue mapping & scope

- **[#1](https://github.com/taskmasterpeace/verbadeck/issues/1)** — closed by the detection pipeline (§3): the Wall stops capturing the presenter's own speech.
- **[#2](https://github.com/taskmasterpeace/verbadeck/issues/2)** — closed by §5 (panic + skip words).
- **New surface** — the bounded open-queue + focus model (§4) supersedes the queue/rapid-fire toggle; file its own tracking issue at build time.

**Out of scope (v1):** speaker diarization / multi-mic separation; tuning AssemblyAI's `end_of_turn` thresholds (use defaults); compound-question auto-split; per-presentation panic-word presets; answering more than 2 questions truly simultaneously.

---

## 17. Backward compatibility & rollout

- Removing the queue/rapid-fire toggle: drop persisted `queueMode`; `SessionStats` prop set changes. Questions are session-only state → **no data migration**.
- Ship behind a lightweight `WALL_V2` build flag during build-out so the old path stays available until the new detector is validated in a live session, then remove the flag.

---

## 18. Open tunables (defaults set, revisit after live use)

- `ARM_WINDOW_MS` = 15000 · `MAX_OPEN` = 2 · `MAX_IN_PLAY` = 3 · pill label = first 2 words · gen concurrency = 2.
- Word lists + normalization map live as named constants in `question-detection.ts`.
