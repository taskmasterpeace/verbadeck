# VerbaDeck — promo storyboard · v1.1.0 · 45s

> **Spine:** *Your voice runs the deck, and AI answers the room.* Every beat serves that one idea.
> If a shot doesn't make a viewer believe "I could present hands-free and never get caught in
> Q&A," it doesn't belong.

## The arc

1. **Hook (0–6s)** — the pain, as the viewer's own memory: reaching for the clicker and losing
   the room. No logo yet. Generated boardroom b-roll, cool and a little tense.
2. **Reveal (6–10s)** — name it once, land the promise. The home hero pushes in; the wordmark
   resolves on the word "hands-free."
3. **Proof × 4 (10–36s)** — one shipped capability per beat, shown not told:
   - **Voice** — say a word, the slide moves (the core promise).
   - **Two screens** — cinematic audience view + presenter cockpit (the v1.0 polish).
   - **Live answers** — Q&A grounded in your deck *and* the new **Knowledge Brain** (the v1.1
     headline; this is the peak).
   - **Build it** — AI generation, PowerPoint import, rehearsal — open-source, five minutes.
4. **Payoff (36–39s)** — the outcome they keep: hands free, eyes up, clicker retired.
5. **CTA (39–42s)** — wordmark, tagline, verbadeck.com. Clean button.

## Energy / music curve

Low, tense pad under the hook → lift and warmth on the reveal → steady four-beat build through
the proof, **peak on "Knowledge Brain"** (beat 5, the new thing) → exhale on the payoff → one
clean resolve on the end card. Cut on the verbs; nothing on screen outlasts the line that
carries it.

## Real vs generated

| Shot | Beat | Type | Note |
|------|------|------|------|
| 1 | Hook | **generated** | boardroom + clicker b-roll (Ad Lab / Ideogram) |
| 2 | Reveal | **real** | `01-home.png` hero + wordmark |
| 3 | Voice | **real** | `07-presenter.png` (trigger cue) |
| 4 | Two screens | **real** | `08-audience.png` + `07-presenter.png` inset |
| 5 | Live answers | **real** | `09-knowledge-brain.png` → `04-know-it-all.png` |
| 6 | Build it | **real** | `03-create-from-scratch.png` → `05-library.png` |
| 7 | Payoff | **generated** | hands-free speaker b-roll |
| 8 | CTA | **composed** | brand end card from `client/public/logo.png` |

Six of eight shots are **real app footage** — the most honest, on-brand material available.
Only the human b-roll (hook, payoff) and the end card need a generator.

## Honest gaps

- **No live-motion capture.** The UI shots are stills; add subtle push-ins/parallax in the
  editor, or screen-record the real app for shots 3–6 to make the voice-advance feel alive.
- **verbadeck.com isn't serving yet** (DNS pending at the registrar). The CTA is correct as the
  destination, but don't publish the promo until the domain resolves — or point the CTA at the
  GitHub repo in the meantime.
- **No user guide** to cross-check claims against — every line here traces to a shipped
  SHIPPING-LOG item (voice control, cinematic audience, Q&A, Knowledge Brain, AI build / pptx
  import / rehearse, open-source), so the script is sound; running `/ship-guide` would let a
  reviewer verify wording against documented behavior.
