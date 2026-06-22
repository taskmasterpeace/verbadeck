# VerbaDeck — promo shotlist · v1.1.0 · 45s · ~41s VO + end-card hold

Real frames live in `docs/screenshots/showcase/`. Generator prompts are tool-agnostic and
brand-themed (bg `#0a0f14`, brand `#15a6d6`, accent teal `#2dd4bf`; **no purple**). Adapter
commands at the bottom.

| # | Time | Shot (on screen) | VO line | On-screen text | Source / prompt |
|---|------|------------------|---------|----------------|-----------------|
| 1 | 0:00–0:06 | Founder mid-pitch in a boardroom, hand dropping to a clicker, eyes leaving the room | "Every founder loses the room the second they reach for a clicker. Eyes drop. Momentum dies." | — | **gen:** cinematic boardroom pitch, a founder reaching down for a slide clicker mid-sentence, investors half-engaged, shallow depth of field, cool window light, `#0a0f14` shadows, teal `#2dd4bf` rim light, photoreal, 16:9 |
| 2 | 0:06–0:10 | VerbaDeck home hero; headline + wordmark resolve, slow push-in | "VerbaDeck flips it. Present hands-free — your voice runs the deck." | VerbaDeck · "hands-free" | `docs/screenshots/showcase/01-home.png` (slow push-in; wordmark lands on "hands-free") |
| 3 | 0:10–0:16 | Presenter cockpit; a spoken word highlights the "Say: problem" cue and the slide advances | "Say a trigger word, and the slide moves. Your hands and your eyes stay on the room." | Say "problem" → advance | `docs/screenshots/showcase/07-presenter.png` (highlight the trigger chip; quick cut to next section) |
| 4 | 0:16–0:22 | Split: cinematic dark audience slide (big) + presenter cockpit inset (small) | "Your audience sees a clean, cinematic slide. You get a cockpit — timer, cues, what's next." | Audience view · Presenter view | `docs/screenshots/showcase/08-audience.png` (main) + `07-presenter.png` (inset, lower-right) |
| 5 | 0:22–0:30 | Knowledge Brain: text pours into the index, tags appear; cut to a live answer with sources | "Hit a hard question? It answers live, from your own deck — and from everything you've loaded into its Knowledge Brain." | Live Q&A · Knowledge Brain | `docs/screenshots/showcase/09-knowledge-brain.png` → `04-know-it-all.png` (answer + sources) |
| 6 | 0:30–0:36 | Three creation paths fan out; AI builds a deck, a .pptx imports, the library fills | "Build with AI, import a PowerPoint, or rehearse the tough questions. Open-source, and yours in five minutes." | Build · Import · Rehearse · open-source | `docs/screenshots/showcase/03-create-from-scratch.png` → `05-library.png` |
| 7 | 0:36–0:39 | Calm wide: presenter standing, hands open, audience leaning in; the clicker sits unused on the table | "Hands free. Eyes up. Retire the clicker." | — | **gen:** confident speaker mid-talk, both hands open and gesturing, engaged audience, a slide clicker left untouched on the table in foreground, warm key light, `#0a0f14` background, teal `#2dd4bf` accent on stage edge, photoreal, 16:9 |
| 8 | 0:39–0:42 | End card: wordmark, tagline, URL on the brand grid | "VerbaDeck — present at verbadeck.com." | **VerbaDeck** · Present hands-free · verbadeck.com | **gen/compose:** `client/public/logo.png` centered on `#0a0f14`, faint `#15a6d6` dot-grid, tagline in Inter, teal `#2dd4bf` CTA underline |

## Generator adapter commands

Tool-agnostic prompts above. Mapped to tools detected on this machine (per global config):

**Ad Lab** (`D:/git/mkm/ad-lab`) — for the two photoreal b-roll shots (1 and 7) and motion:
```bash
cd D:/git/mkm/ad-lab
# Shot 1 — clicker hook
node scripts/generate-image.js -p "cinematic boardroom pitch, founder reaching for a slide clicker mid-sentence, investors half-engaged, shallow DOF, cool window light, dark #0a0f14 shadows, teal #2dd4bf rim light, photoreal, 16:9" -o ../verbadeck/docs/promo/frames/01-hook.jpg
# Shot 7 — hands-free payoff
node scripts/generate-image.js -p "confident speaker mid-talk, both hands open, engaged audience, an unused slide clicker on the table foreground, warm key light, dark #0a0f14 background, teal stage-edge accent, photoreal, 16:9" -o ../verbadeck/docs/promo/frames/07-payoff.jpg
# Optional: animate either still to a 5s push-in
node scripts/generate-video.js -p "slow cinematic push-in, subtle parallax" -i ../verbadeck/docs/promo/frames/01-hook.jpg -o ../verbadeck/docs/promo/frames/01-hook.mp4
```

**Directors Palette** (`D:/git/directors-palette-v2`) or **local Ideogram** (`D:\pinokio\api\ideogram4`)
— swap in for the same two prompts if you'd rather not use Ad Lab. The UI shots (2–6, 8) need
no generator: they're real screenshots / a composed end card.

> Not detected / swap: any video editor for the final assembly (CapCut, Premiere, Resolve) —
> drop the 8 shots on a timeline in order, lay the VO from `voiceover.md`, beat-match cuts to the
> timecodes above.
