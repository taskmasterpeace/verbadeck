# Know It All Wall — Conversational Question Detection + Bounded Open-Queue

**Date:** 2026-06-24
**Status:** Design (approved to write up; pending spec review)
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

- **Pre-sequences (Schegloff 1980, "Preliminaries to Preliminaries: 'Can I Ask You a Question?'").** A turn like *"can I ask you a question?"* is a **pre-sequence**: it *projects* an upcoming question but is **not** the base question. It expects a go-ahead, after which the real ("base") question is delivered. → Pre-question markers must **arm** the listener, not be captured.
- **Turn-yield is the strongest cue.** Research on interrogative vs. rhetorical questions finds that *whether and how the speaker continues their turn after the interrogative* is a top predictor of whether it's a genuine, answer-seeking question. A real question is followed by a **turn transition** (the asker stops and yields the floor); a rhetorical aside is talked straight through. → Capture on **turn-yield**, not on sentence shape alone.
- **We already receive the turn-yield signal.** AssemblyAI v3 streaming detects the end of a turn and ships `end_of_turn` (surfaced in the app as `useVoiceStore().isLastTranscriptFinal`). We **trust its flag** — no custom silence timer in v1. Its sensitivity is tunable later if needed.

Sources: Schegloff, *Sociological Inquiry* (1980) — https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1475-682X.1980.tb00018.x · "Interaction of discourse markers and prosody in rhetorical questions," *Journal of Linguistics* — https://www.cambridge.org/core/journals/journal-of-linguistics/article/interaction-of-discourse-markers-and-prosody-in-rhetorical-questions-in-german/8762D075A538E1D40B40A4D4D66484D6

---

## 3. Detection pipeline (always-on)

A new **pure** classifier, `client/src/lib/question-detection.ts`, classifies each transcript event so it can be unit-tested without the component.

```ts
type Utterance = { text: string; isFinal: boolean }; // isFinal === AssemblyAI end_of_turn
type Verdict =
  | { kind: 'panic' }            // reset word
  | { kind: 'skip' }             // skip/next word
  | { kind: 'pre' }              // pre-question marker → arm, do not capture
  | { kind: 'question'; text }   // a real, answer-seeking question → capture
  | { kind: 'rhetorical' }       // tag/aside → ignore
  | { kind: 'none' };

function classify(u: Utterance, cfg: DetectConfig): Verdict;
```

**Priority order** (first match wins): `panic → skip → pre → question → rhetorical → none`.

Rules:

1. **Panic / skip** — exact-ish match against configured `panicWord` / `skipWord` (comma-separated, like the existing `cancelWord`). Checked first so they always win, even mid-turn.
2. **Pre-question markers → arm.** If the text matches a pre-question phrase (*"can I ask you," "let me ask you," "I have a question," "quick question," "ready for the next (question|one)," "here's my question," "got a question"*), return `pre`. The component sets `armedUntil = now + ARM_WINDOW_MS (15_000)` and captures nothing. This is the fix for *"allow that first one to not be the question, but still be listening."*
3. **Question capture requires turn-yield.** Return `question` **only when `isFinal` (end_of_turn) is true** and the text is interrogative (ends with `?`, or starts with a question word / command starter) and `length > 10` and is not pure-rhetorical. Requiring `isFinal` is the core change: it means the asker **paused** (yielded the floor). Mid-turn `?`s are no longer captured.
   - *Always-on + preamble boost:* capture happens regardless of armed state. Being armed (within the window) only **relaxes** the bar — e.g. accept a slightly-below-threshold interrogative, or extend dedup tolerance — so a real question right after a pre-sequence is reliably caught. Armed state never *gates* capture.
4. **Rhetorical filter.** If the interrogative is only a tag/aside (*"right?," "you know?," "isn't it?," "okay?," "you know what I mean?"*) or fails the `isFinal` gate (speaker talked through it), return `rhetorical` → ignore.

Dedup against in-play questions stays (case-insensitive exact match), plus a short same-text cooldown so one slow `end_of_turn` re-emission doesn't double-add.

---

## 4. The wall: bounded open-queue (max 2 open + pills)

Replaces the queue/rapid-fire toggle.

- **Open set:** up to **2** cards rendered "open" at once, each with its A/B answer pair (existing `answer1`/`answer2`) and confirm keywords.
- **Pills:** further captured questions collapse into compact **2-word pills** (`status: 'queued'`) shown under the open cards. A pill **re-opens** on tap or when its first words are spoken — letting the presenter "shoot through any of them" in any order.
- **Cap = 3 in play** (2 open + 1 pill). A 4th capture is held as `status: 'waiting'` and surfaced only as a count ("+1 waiting"); it promotes when a slot frees. No overwriting.
- **Complete:** confirming an answer's keyword (existing voice-confirm mechanism) marks that card `complete` (checked + cleared) — *exactly as today*. The next pill/waiting question promotes into the open set.

### State / data model

`QuestionCard.status` extends to: `'generating' | 'ready' | 'confirming' | 'queued' | 'waiting' | 'complete' | 'dismissed'`. "Open" = `ready | confirming | generating` and in the first 2 non-complete slots. Derived selectors compute `openCards`, `pills`, `waitingCount` from the single `questions` array — no parallel state.

---

## 5. Panic / skip / reset words ([#2](https://github.com/taskmasterpeace/verbadeck/issues/2))

- **Config:** add `panicWord` and `skipWord` to the presentation/settings store, alongside the existing `cancelWord`. Comma-separated, user-editable; sensible non-colliding defaults (e.g. panic = `"reset board"`, skip = `"skip that, next question"`). Empty = disabled.
- **Panic** → set all non-`complete` cards to `dismissed`, clear the open set, return the wall to idle ("Speak a question"). The "specific reset" from the demo.
- **Skip** → dismiss only the focused/active card; promote the next.
- Both are highest priority in `classify` so they fire even while answering.

---

## 6. Affected files

| File | Change |
|---|---|
| `client/src/lib/question-detection.ts` *(new)* | Pure `classify()` + marker/rhetorical/tag lists + config type. Fully unit-tested. |
| `client/src/components/KnowItAllWall.tsx` | Replace the detection `useEffect` (lines ~76–145) with `classify()` + armed-window state; replace queue/rapid-fire with the open-queue model; render 2 open cards + pills + "+N waiting". |
| `client/src/components/know-it-all/*` (SessionStats etc.) | Drop the queue-mode toggle; show open/pill/waiting state; pill component. |
| `client/src/stores/` (presentation/settings) | Add `panicWord`, `skipWord` (persisted with settings). |
| `client/src/components/SettingsSidebar` (or Know It All config) | Editable panic/skip/cancel word fields. |
| `client/src/lib/question-detection.test.ts` *(new)* | Unit tests for every rule + the demo transcripts. |
| `tests/know-it-all-*.spec.ts` | E2E for arm-don't-capture, capture-on-end-of-turn, 2-open + pill promote, panic/skip — driven via the `?testMode=true` bridge. |

---

## 7. Edge cases & error handling

- **No `end_of_turn` ever fires** (ASR quirk): a hard fallback — if an interim interrogative is stable for `> ARM/2` with no further speech, treat as final. Logged.
- **Pre-question with no follow-up** (armed window expires): window simply lapses; nothing captured. No stuck state.
- **Answer API failure** for an open card: existing error-answer behavior; the card stays open so the presenter can still field it manually.
- **Dedup vs. legitimately repeated question:** exact-text dedup only within the in-play set; once a card is `complete`/`dismissed` the same text can be asked again.
- **Pills overflow:** only the cap matters; `waitingCount` is the overflow valve, never silent loss.

---

## 8. Testing strategy

- **Unit (`classify`)** — table-driven over real demo lines: `"you ready for the next question?"` → `pre`; `"how does pricing work?"`+`isFinal` → `question`; `"how does pricing work?"`+`!isFinal` → `none`; `"isn't that wild?"` (tag) → `rhetorical`; `"reset board"` → `panic`. Each rule + priority order covered.
- **E2E (Wall, testMode bridge)** — drive transcript events: arm→capture sequence lands exactly one question; two back-to-back questions → 2 open cards; a third → pill; confirming a keyword completes + promotes; panic clears to idle.
- **Gate:** `tsc` clean + new unit suite + the Wall E2E green before close.

---

## 9. Issue mapping & scope

- **[#1](https://github.com/taskmasterpeace/verbadeck/issues/1)** — closed by the detection pipeline (§3): the Wall stops capturing the presenter's own speech. (Presenter-mode path already guarded in `43cecf2`.)
- **[#2](https://github.com/taskmasterpeace/verbadeck/issues/2)** — closed by §5 (panic + skip words).
- **New surface** — the bounded open-queue (§4) supersedes the queue/rapid-fire toggle; worth its own issue for tracking.

**Out of scope (v1):** speaker diarization / multi-mic separation; tuning AssemblyAI's `end_of_turn` thresholds (use defaults); per-presentation panic-word presets; answering more than 2 questions truly simultaneously (we open 2, queue the rest).

---

## 10. Open tunables (defaults set, revisit after live use)

- `ARM_WINDOW_MS` = 15000 · `MAX_OPEN` = 2 · `MAX_IN_PLAY` = 3 · pill label = first 2 words.
- Pre-question, rhetorical-tag, and command-starter word lists live in `question-detection.ts` as named constants for easy iteration.
