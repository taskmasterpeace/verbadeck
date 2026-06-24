# Slide-generation library catalog (reference)

External research added on request (2026-06-23). Companion to the decision in
[2026-06-23-feature-notes.md](2026-06-23-feature-notes.md) → **Approach B: programmatic renderer,
real text, AI fills image slots.** Everything below is a "real text / programmatic" tool (none are
slide-as-image), so all of it is compatible with that decision. Star counts approximate.

## Top fits (high stars + programmatic)

| Project | Stars | Why it fits | Maps to VerbaDeck as… |
|---|---|---|---|
| [Slidev](https://github.com/slidevjs/slidev) | ~41.1k | Dev-first slides: Markdown + Vue components, theming, custom layouts, web-native | Alt **live render engine** (if we don't keep custom React) |
| [impress.js](https://github.com/impress/impress.js) | ~38.2k | Programmable positioning/transforms/transitions; Prezi-like spatial HTML | Cinematic/spatial mode — niche for us |
| [Marp](https://github.com/marp-team/marp) | ~9.9k | Markdown → decks, themes, export tooling; great for content pipelines | Markdown-in path / export |
| [Presenton](https://github.com/presenton/presenton) | ~8.5k | **Host-your-own-Gamma:** HTML/Tailwind layout templates, "create from JSON" API | **Closest reference architecture** for our renderer |
| [PPTAgent](https://github.com/icip-cas/PPTAgent) | ~4.5k | Agentic deck gen, template + freeform, PPTX export, offline mode | AI deck-planning prior art |
| [PptxGenJS](https://github.com/gitbrent/PptxGenJS) | ~4.4k | JS lib to generate standards-compliant **.pptx** (text/tables/charts/images/masters) | **PPTX export leg** (best direct fit) |
| [presentation-ai (ALLWEONE)](https://github.com/allweonedev/presentation-ai) | ~2.9k | Gamma-inspired: deck from a topic, slide counts, themes, editable React components | Full-stack baseline to study |
| [slide-deck-ai](https://github.com/barun-saha/slide-deck-ai) | ~0.4k | Textbook **LLM → JSON schema → python-pptx**, Pexels images, template picker | Backend "deck engine" pattern |

## Engines for layout/PPTX without a UI (borrow the guts)
- **[PptxGenJS](https://github.com/gitbrent/PptxGenJS)** — `LLM → JSON layout spec → PptxGenJS → .pptx`. Define masters/layouts/positioning, emit a downloadable deck. (GitHub topic: `powerpoint-generation`.)
- **[pptx-automizer](https://github.com/singerla/pptx-automizer)** (Node) — template-based: design a `.pptx` template in PowerPoint, fill placeholders programmatically with real text/data.
- **airppt-renderer** — standardized object description → HTML/CSS slides (spec → layout engine, optional PPTX).
- GitHub topics to browse by stars: [`slide-generator`](https://github.com/topics/slide-generator), [`powerpoint-generation`](https://github.com/topics/powerpoint-generation).

## Web-native slide editors
- **[DeckDeckGo](https://github.com/deckgo/deckdeckgo)** — open-source web presentation editor; slides are HTML/CSS/Stencil components; drive from JSON/LLM output, export PDF.

## Templated narrative skeletons
- **[SixArm/pitch-deck-template](https://github.com/SixArm/pitch-deck-template)** — Problem / Market / Solution / Traction… framework with per-slide guiding questions. Easy to encode as our deck-structure JSON schema: hard-code the section order, let the model vary text + layout choices only.

## How this maps to our decision (Approach B)
- **Live render (presenter + audience):** keep **custom React templates** — we already own both views + voice-advance + Tailwind + Framer Motion, so an engine (Slidev/reveal) would fight us. **Presenton's** HTML+Tailwind "create-from-JSON" model is the architecture to copy; **Slidev** is the fallback if we ever want a batteries-included engine.
- **PPTX export (new, worth adding):** **PptxGenJS** — lets users download a real `.pptx` to drop into PowerPoint / Google Slides / Canva. Same `SlideLayout` JSON → a PptxGenJS mapper. (`pptx-automizer` if we'd rather fill a hand-designed PPTX template.)
- **AI deck planning:** the **slide-deck-ai / PPTAgent / Presenton** pattern = LLM emits structured slide JSON → deterministic renderer. Exactly our plan; study them for the schema + prompt shape.
- **Images:** still AI/stock in the **slot only** (Nano Banana Pro / Ideogram / Pexels) — never baked-in text.

**Net:** nothing here changes the call. It *adds* one concrete feature lane — **PptxGenJS for `.pptx`
export** — and gives us three working references (Presenton, slide-deck-ai, presentation-ai) whose
`LLM → SlideLayout JSON → renderer` flow we should mirror.
