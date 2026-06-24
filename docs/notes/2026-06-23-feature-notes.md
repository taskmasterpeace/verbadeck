# VerbaDeck — Feature Notes · 2026-06-23

Captured from a working session. Three threads, not yet built — this is the brief for later.

---

## 1. Editable quick-load presets (in Settings)

**What:** Add a way in the **Settings menu** to create / edit / delete / reorder the **quick-load
presets** — so they're user-curated, not fixed.

**Where they live today:** the **Know It All Wall** has a preset select + "Load" button (the
quick-load presets). *(Known issue on file: that select + load button overflows at 375px mobile.)*

**Scope sketch:**
- Settings → new **"Presets"** section/tab.
- CRUD list: name, description, the preset payload, with **rename / duplicate / delete / drag-reorder**.
- Persist to `localStorage` (and/or fold into the existing presentation-library system).
- Reuse the existing preset-load path so *loading* behavior is unchanged — we're only adding management.

**⚠️ Confirm before building:** what exactly *is* a "preset" today — a Know It All Q&A set, a full
presentation, or a knowledge bundle? Nail the data shape first. (Look at how the Know It All preset
select is populated today.)

---

## 2. Context-budget indicator for presets (Know It All Wall)

**What:** When a user assembles a preset/knowledge for the Know It All Wall, **show how much model
context it will consume** — a live "**X / Y tokens**" gauge — so they know if they're overstuffing
the model or about to get truncated.

**Why:** presets/knowledge can grow large and users currently get **zero feedback** on whether the
content fits the model's window.

**How (technical):**
- **Estimate tokens client-side:** quick heuristic ≈ `chars / 4`, or bundle a small tokenizer
  (`gpt-tokenizer` / `js-tiktoken`, a few KB) for accuracy.
- **Colored gauge:** green `<60%` · amber `<90%` · red `≥90%` of the window.
- **Tie the meter to the model that actually consumes the preset** (from `server/model-config.js`),
  not a generic number. Approx windows (⚠️ verify exact values against model-config.js + provider docs
  when implementing — don't trust these from memory):
  - Live Q&A / FAQ / triggers → **Llama 3.1 8B (Groq)** — 128K native, but Groq's *served* cap is
    often smaller; **verify the practical ceiling**, that's the real constraint here.
  - Question gen / slide options / script processing → **GPT-4o mini** — ~128K.
  - Speaker-note transforms / Q&A anticipation → **Claude 3.5 Sonnet** — ~200K.

**⚠️ The math depends on the path** — clarify which the preset uses:
- **Whole-prompt presets** (content stuffed into the prompt) → meter = "**does it fit the window**."
- **Knowledge Brain path** (chunked + top-k retrieved) → only a few chunks are sent, so the meter is
  really "**indexed size vs. retrieval budget / quality**," a different number. The Brain already
  retrieves top-k, so a giant brain doesn't blow the window — but a giant *whole-prompt preset* does.

This is the actual insight worth surfacing to users: **whole-prompt = hard ceiling; brain = soft,
retrieval-quality tradeoff.** The gauge should say which mode it's measuring.

---

## 3. Research brief — make the presentations look dramatically better

Goal: don't reinvent the wheel. Find existing frameworks/libraries we can adopt (or borrow patterns
from) to upgrade the **Presenter** and **Audience** slide rendering. Copy-paste the prompt below into
a research tool / agent.

### 📋 Research prompt (hand this off)

```
Research the best open-source frameworks and libraries for rendering beautiful, modern
presentation slides that I can integrate into an existing React 18 + TypeScript + Vite +
Tailwind CSS app (we already use Framer Motion). This is for "VerbaDeck," a voice-driven
presentation tool with two synced views — a Presenter cockpit and a clean Audience/projector
view — where slides come from a data model (heading, markdown content, speaker notes, optional
image) and advance automatically when the speaker says trigger words.

I do NOT want to rebuild from scratch. I want to either adopt a library or steal its
theming/layout/transition patterns.

Cover and compare at least these, plus anything else strong:
- reveal.js, Spectacle (React), Slidev, MDX Deck / mdx-deck, Motion Canvas, impress.js,
  remark / remark-slideshow, Sli.dev, Deck.gl-style layout systems, and any 2024–2026
  React-native slide libraries.

For EACH option, report:
1. License (must be permissive — MIT/Apache; flag anything copyleft).
2. Integration model — does it run as a React component/library, or does it take over the page/
   routing? Can I render ONE slide as a component fed by my own data model, or is it markdown/MDX-
   file driven only?
3. Out-of-the-box aesthetic quality (link real example decks/screenshots).
4. Theming system — how slide layouts, type scale, color, and spacing are defined; can I drive it
   from Tailwind tokens / a brand palette?
5. Transitions/animation — what it ships; does it conflict with or complement Framer Motion?
6. Auto-layout — can it turn arbitrary content (heading + body + image) into a well-composed slide
   automatically (auto-fit text, image/text split layouts, templates), or must I hand-place
   everything?
7. Dual-display / presenter+audience support, and whether advancing is controllable
   programmatically (I drive it from voice triggers, not clicks).
8. Bundle size / SSR / Vite compatibility / maintenance health (last release, stars, open issues).

Then give:
- A ranked recommendation: "ADOPT <X>" vs. "BORROW PATTERNS FROM <Y> but keep our own renderer,"
  with the integration effort (S/M/L) and the single biggest risk for each.
- A short list of 6–10 gorgeous real-world decks/templates to use as visual north stars.
- Specifically: the best approach for AUTO-LAYOUT (content → professionally-composed slide) since
  our content is dynamic and AI-generated, and we can't hand-design every slide.
```

---

## ✅ DECISION (2026-06-23): how to make slides — render them, don't generate them

**Recommendation: a programmatic LAYOUT renderer with REAL text, where AI fills only the image
slots and the LLM emits a structured `SlideLayout` JSON. This is the "wave" — control the layout +
text programmatically; let image models do imagery, not typography.**

*(Web-research pass for concrete repos/citations was rate-limited mid-run and has been re-launched;
the decision below stands on its own. A live prototype proving it is at
`docs/notes/slide-layouts-demo.html` → screenshot `docs/screenshots/showcase/slide-layouts-demo.png`.)*

### Why NOT "generate the whole slide as an AI image with text in it"
- **Text is every image model's weakest axis.** GPT-Image-2, Flux, SDXL — and even Nano Banana Pro
  (the current best) — render text as *pixels*: garbling on anything longer than a few words, no
  control over exact wrapping/position, **no editing one word without regenerating the whole image**,
  $ + seconds of latency *per slide*, and zero selectable/accessible/searchable text.
- For a tool whose entire value is *the words on the slide* + voice-advancing them, baking text into
  an image fights the model on its worst dimension.
- **Nano Banana Pro is genuinely "almost ready"** — best-in-class legible text + infographics, which
  is exactly why it *feels* close. But "mostly correct" on an investor slide is a failure, and it's
  still not editable or data-bound. Its real strength is **imagery and on-image labels → that's the
  image SLOT, not the whole slide.**

### Why the layout-renderer wins
1. **Perfect, instant, free, editable text** — real DOM/Tailwind text, every time (see prototype).
2. **It's what every serious tool already does** — Gamma, Beautiful.ai, Tome, Canva Magic, Pitch,
   Google Slides all use templated layouts + real text + images in slots. None bake slide text into a
   generated image. Don't reinvent a worse wheel.
3. **It's the most agent-native option** (the /agent-native-architecture instinct): the agent
   manipulates a structured slide object — `{ layout, heading, bullets[], imagePrompt }` — not an
   opaque PNG. Anything the user can do (pick layout, edit text, swap image), the agent does via the
   same JSON. True parity.

### The architecture
- **Layout templates** in React (real text, Tailwind, Framer Motion transitions): title · split ·
  big-stat · quote · bullets · image-forward · section. The prototype already seeds 5 of these.
- **LLM picks the layout + writes copy + emits one image PROMPT per slide** → `SlideLayout` JSON
  (extends our `Section` model).
- **AI/stock fills only the image slot** (Nano Banana Pro / Ideogram / Pexels) — where text-accuracy
  doesn't matter.
- **Export** rendered slides to PNG (audience snapshot / thumbnails / share) via Satori (`@vercel/og`)
  or a Playwright screenshot — so we still ship "images," but from pixel-perfect HTML.
- **Keep the image models in the toolbox**, scoped to slots — plus an optional "poster mode" (one
  decorative image, no critical text) where whole-image gen is fine.

### Research findings (web, June 2026) — every signal points to B

**Reference architecture to copy → [Presenton](https://github.com/presenton/presenton) (~8.5k★):**
LLM → content; **HTML + Tailwind layout templates**, deterministic render; **"create presentation
from JSON"** flow; editable PPTX export. Closest analog to what we want. Also
[presentation-ai](https://github.com/allweonedev/presentation-ai) (~2.9k★, Gamma clone, editable
React components) and [slide-deck-ai](https://github.com/barun-saha/slide-deck-ai) (LLM → JSON schema
→ python-pptx, Pexels images).

**The most telling data point:** among GitHub image-gen repos, the *prompt galleries* bake text into
the image (that's the demo) — but every actual *editing product* composites **real text** over AI
images: `yft-design` (~1.6k★, Fabric.js), `BeatPrints` (~1.1k★, Pillow), `markdown-poster` (HTML→img),
`social-image-generator` (contenteditable HTML→img). Builders who ship pick real text.

**The major tools are unanimous** (no slide-as-image anywhere): **Gamma** separates content/design,
AI picks from a constrained layout-template set; **Beautiful.ai "Smart Slides"** = 300+ layouts with
design logic that auto-adjusts as content changes; **Pitch/Canva** = template + editable text layers +
image slots. AI does content/image-selection/layout-choice, never bakes the raster.

**Model reality (why text-in-image fails the bar):**
- **Nano Banana Pro** (best in class): ~88–94% on *short* strings, but ~80% at 15–30 words and ~**60%
  at 30+ words**; small text distorts at 1K (fix = render 2K/4K → cost/latency). Google's own docs warn
  it "can still struggle with accurate spelling." → "almost," not drop-in for exact slide text.
- **gpt-image-1 / GPT Image 2**: reliably usable for short text, but **not** pixel-exact, not
  region-reflowable, not an editable text layer. ~$0.011–$0.167/image + multi-second latency *per
  regeneration*. (gpt-image-1 deprecates 2026-10-23.)

### Confirmed stack
- **Live render:** custom React components for our `{heading, markdown, speakerNotes, imageUrl}` model
  (we already own presenter/audience views; Spectacle/reveal add a runtime we don't need). Spectacle is
  the fallback if we ever want a batteries-included engine.
- **Auto-fit AI's variable-length copy:** `fitty` (tiny, maintained) as the engine; `react-textfit` for
  zero-glue.
- **Image slot:** existing Replicate / Ideogram / Gemini (Nano Banana Pro) + Pexels — scoped to the slot.
- **HTML→PNG export:** `@vercel/og` (Satori) for speed/scale, Playwright for full-fidelity fallback.
- **PPTX export (optional, user-download):** `PptxGenJS` — same `SlideLayout` JSON → a real `.pptx`
  for PowerPoint / Google Slides / Canva.

> 📚 Full library catalog (Slidev, impress.js, Marp, Presenton, PPTAgent, PptxGenJS, pptx-automizer,
> DeckDeckGo, slide-deck-ai, presentation-ai, pitch-deck-template…) with star counts and how each maps
> to Approach B: **[slide-gen-library-catalog.md](slide-gen-library-catalog.md)**.

**Effort: M. Highest-leverage first step:** define the `SlideLayout` JSON schema + build the layout
templates (prototype is the seed), then point the AI script-processor at "emit SlideLayout JSON"
instead of plain sections.

---

## ✅ PROTOTYPE BUILT & TESTED (2026-06-23) — the pipeline works end-to-end

Built a working vertical slice in `slide-lab/` (gitignored sandbox) and ran it for real:
**topic → LLM determines layout + writes copy + emits an image prompt (strict JSON) → Replicate
(flux-schnell) generates each slot image → deterministic HTML render (real text) → PNG.** Plus a
second leg: the **same JSON → editable `.pptx`** via PptxGenJS. Result deck:
`docs/screenshots/showcase/ai-deck-demo.png` — 5 AI-chosen layouts (title · split · bullets · stat ·
quote), perfect text, on-brand AI images with **zero baked-in text.**

### What we learned (the build lessons)
1. **Strict JSON Schema is mandatory for layout determination.** Plain `json_object` failed *twice* —
   once it omitted the title's `heading` (blank slide), once it put a stray string in the `slides`
   array (crash). Switching to `response_format: { type:'json_schema', strict:true }` with **every
   field required** (model fills unused ones with ""/[]) made it 100% reliable. This is THE lesson.
2. **"No text / no words / no letters in the image" in the prompt works.** flux-schnell respected it
   every time — clean abstract/photographic backgrounds, no garbled text. That's the entire reason
   the architecture holds: **text lives in the DOM, imagery lives in the slot.**
3. **flux-schnell (Replicate) is the right slot model:** ~2–3s/image, ~$0.003 each → a 5-slide deck
   costs **~1.5¢ and ~35s**. Use Ideogram for graphic/poster style, Pexels as the instant free fallback.
4. **One structured `SlideLayout` JSON → many outputs:** same object rendered to gorgeous HTML/PNG
   **and** an editable PowerPoint. Validates "structured layout is the single source of truth."
5. gpt-4o-mini's layout *choices* were genuinely good and varied — content-appropriate without nudging.

### Production architecture (turn the slice into "our own thing")
- **`SlideLayout` schema** = canonical slide object (extends our `Section` model): `{ layout, eyebrow,
  heading, subhead, bullets[], stat, statLabel, quote, attribution, imagePrompt, imageUrl }`.
- **Server:** `POST /api/deck/generate { topic | sections, n }` → strict-schema LLM → `SlideLayout[]`
  → (async, fire-and-forget like the Knowledge Brain's tagger) generate slot images via Replicate,
  patch `imageUrl` as they land. Reuse `getModelForOperation()` + the OpenRouter client.
- **Client:** port the `slide-lab` HTML templates into **React layout components** rendered live in
  Presenter/Audience; `currentSectionIndex` (voice-advance) drives the active slide. Auto-fit copy
  with `fitty`.
- **Export:** PNG via Satori/Playwright, `.pptx` via PptxGenJS — both off the same JSON.
- **Agent-native:** the deck IS structured JSON, so `window.__verbadeck` gets `deck.generate / get /
  setSlide / regenImage` — full user/agent parity, no opaque pixels.

**Sandbox files:** `slide-lab/generate-deck.mjs` (pipeline), `slide-lab/to-pptx.mjs` (export),
`slide-lab/contact-sheet.mjs`. Run: `node slide-lab/generate-deck.mjs "<topic>" 5`.

---

## 🎛️ USER CONTROLS & INPUT CHANNELS (design — read before building)

The control surface IS the product. Goal: the user steers *what the deck is about*, *who it's for*,
and *what it looks like* — without drowning in knobs. Design principles:

- **Sensible defaults, progressive disclosure.** "Topic + Audience → Generate" works with zero config.
  Everything else lives in an **Advanced** drawer.
- **One persistent directive, not per-slide babysitting.** Global choices thread into every slide;
  per-slide overrides exist for the exceptions.
- **Agent-native.** Every control is a field on a `DeckSpec` object → an agent can set it too.

### The `DeckSpec` — the single input channel
Everything the user picks becomes one object that feeds (a) the LLM system prompt and (b) every
image prompt. Per-slide `SlideLayout` can override any of it.

| Group | Control | Options / type | Feeds |
|---|---|---|---|
| **Content** | Topic / prompt | freeform | LLM |
| | Source | freeform · paste text · existing sections · **Knowledge Brain** · upload doc | LLM |
| | Slide count | 3–20 (or "auto") | LLM |
| | Audience | freeform ("seed VCs", "Black women founders", "8th-grade class") | LLM **and** imagery |
| | Goal | pitch · teach · sell · report · keynote | LLM |
| | Tone | **reuse our 10-tone system** | LLM |
| **Imagery** *(the focus)* | Image source *(per slide, mixable)* | **AI-generate · Stock (Pexels) · Upload — all three in v1** | image step |
| | **Art direction** | freeform "who appears / style" | every image prompt |
| | People | **AI decides (default, contextual+inclusive)** · None · Match audience · Custom | art direction |
| | Visual style | Photographic · Illustration · 3D · Flat-vector · Abstract | image prompt |
| | Mood (optional hint) | Natural · Warm · Cinematic · High-contrast — **never brand-locked** | image prompt |
| **Design** | Layouts | **AI chooses** (default) · constrain to a subset · force per slide | LLM |
| | Density | Minimal · Balanced · Detailed | LLM |
| | Theme | brand.json themes (colors + fonts) | renderer |
| | Aspect ratio | 16:9 · 4:3 · 9:16 (social) | renderer + image AR |
| **Output** | Format | **Live web deck · PNG** (v1) · PPTX, PDF (fast-follow) | export |
| | Speaker notes | on / off | LLM |

### Imagery — the "art direction" channel (the important one)
Your example — *"this deck is for Black women, so the imagery should show Black women"* — is exactly
right, and the clean primitive is **one persistent "art direction" directive the user owns**, injected
into EVERY slot image prompt. It's freeform so it's flexible and respectful, with quick-pickers that
compose into it:

- **A single "Who appears / image style" field**, e.g. *"Black women professionals, documentary
  photography, warm natural light."* This string is appended to every `imagePrompt` the LLM emits.
- **Quick "People" control — default is "AI decides":** it infers appropriate, inclusive people from
  the topic + audience with zero user action. The rest are explicit overrides:
  - **None** → abstract/product imagery, no people (great for B2B/data decks).
  - **Match audience** → derives the directive from the Audience field ("depict people representative
    of *{audience}*").
  - **Custom** → the user types exactly who (the Black-women case).
- **Image source is per-slide and mixable — all three in v1:** **AI-generate · Stock (Pexels) ·
  Upload your own.** A deck can freely mix them (AI hero slide, an uploaded product shot, a stock
  team photo).
- **Style + mood pickers** (photographic/illustration/abstract; on-brand/warm/etc.) also fold in.
- **Always auto-appended (we proved it matters):** `no text, no words, no letters, no logos, no
  watermark` — this is why the layout approach holds.
- **Per-slide override:** each slide card gets **Regenerate · Edit prompt · Use stock · Upload · Lock**.
  A slide's prompt inherits the global art direction but can be fully overridden.

**Responsible framing (keep it effective AND right):** make it about *representing the user's
audience*, expressed in the user's own words — not a rigid demographic dropdown (which invites
stereotyping and feels clinical). A descriptive field ("Black women founders in tech") is more
flexible, more respectful, and just becomes part of the prompt. Default when unspecified =
**inclusive / diverse**. Note that image models still carry bias, so we offer per-slide regen + stock
+ upload as the escape hatches when a generation misses.

### Mixing image sources — the asset tray + auto-fill (core, not an edge case)
Image source is **per slide**, and a deck **mixes all three freely**. Your case —
*"I have a few of my own photos; use those where they fit and fill the rest with AI or stock"* — is
the **default workflow**, designed in from the start:

1. **Asset tray.** The user drops in a handful of their own images up front; they sit in a per-deck
   tray (uploaded once, reusable across any slide).
2. **Auto-match (reuses our embeddings infra).** On generate, each uploaded image is captioned +
   embedded and matched to the most relevant slide — the **same cosine retrieval the Knowledge Brain
   uses**. The user's photos land on the slides they fit; the user can drag to reassign.
3. **Fill the rest.** Every slide with no assigned upload falls back to the deck's **default source**
   (AI by default, or Stock). So a 10-slide deck + 3 uploads = **3 real photos + 7 AI/stock, zero
   manual work.**
4. **Per-slide override, always.** Each slide shows a source badge — **your photo · AI · stock** — and
   one click swaps it: pick from the tray, reroll the AI image, search stock, or upload another. Source
   lives on the slide, so each is independent.

Model: `DeckSpec { defaultImageSource, assets: UploadedImage[] }` ·
`SlideLayout.image { source:'ai'|'stock'|'upload', prompt? | query? | assetId?, url, locked? }`.
The one control that captures it: **"Use my images where they fit · fill the rest with [ AI ▾ ]."**

### How it flows
```
DeckSpec  ──►  LLM system prompt  (audience, goal, tone, layout constraints, density)
   │                 └─►  SlideLayout[]  (layout + copy + per-slide imagePrompt)
   └──►  art-direction string  ──► appended to EVERY imagePrompt before image gen
                                     (+ negative "no text…", + aspect ratio, + optional mood)
   per-slide overrides ──► win over globals (imagePromptOverride, imageSource, lock)
```

### UX surface (minimal → powerful)
1. **Quick bar:** Topic · Audience · [Generate]. (Tone/style default; people = Match audience.)
2. **Advanced drawer:** slide count, goal, layouts, density, theme, aspect, output, and the **Image
   direction** block (source · who appears · style · mood).
3. **Per-slide controls** after generation (regen/edit/stock/upload/lock/reorder/add/delete).
4. **Presets:** save a `DeckSpec` as a reusable preset (ties into the Settings-presets idea in §1).

### Resolved — v1 scope (locked 2026-06-23)
- **People / representation:** the **AI decides** it contextually (inclusive by default). The
  art-direction field is the override; no extra toggle to surface.
- **Image sources:** **all three ship in v1 — AI-generate · Stock · Upload — mixable within one deck**
  (chosen per slide).
- **PPTX export:** **NOT v1** (fast-follow). v1 outputs = live web deck + PNG.
- **Brand-lock on imagery:** **No — never tint images to the brand palette.** Brand lives in the layout
  chrome (type, color, frame), not painted onto photos/illustrations.

---

## 🖼️ IMAGE PICKER & SOURCING — user journey → challenges → solutions

Picking the right image is NOT one click. Walking the journey surfaces the real friction:

### The journey
1. Deck generates → each slide gets a **default** image (AI, or an auto-matched upload).
2. User reviews the deck → some images are wrong / not what they pictured.
3. User opens a slide to change its image → **and here it gets hard, differently per source.**
4. Repeat across slides → user also wants the deck to feel **cohesive**.

### Challenges (where it breaks) → solutions

- **C1 — "Stock isn't one click; it's search → browse → pick."** You can't just "use stock"; you need
  a query, a gallery of candidates, and a selection.
  → **A real Stock gallery.** Pexels search grid in-app, click to select, crop-to-slot preview,
  photographer credit stored. (We have `PEXELS_API_KEY` — fully buildable.)

- **C2 — "I don't know what to search for."** *(your "get prompts for the stock images")*
  → **AI-suggested stock queries.** The same LLM that writes the slide also emits **2–3 `stockQueries`
  per slide** ("diverse team brainstorming", "modern office founders", "soundwave abstract"). They show
  as **clickable chips** above the search box — one tap runs the search; fully editable; copyable for
  searching elsewhere.

- **C3 — "The AI image missed and I don't want to retype the prompt."**
  → **AI tab with variations.** Editable prompt (pre-filled from the slide + art direction), **Generate
  4 → variation gallery → pick.** Reroll keeps the art direction. (flux-schnell is cheap/fast enough.)

- **C4 — "Where are my own images?"**
  → **Upload tab = the asset tray** (from the mixing design) + drop new.

- **C5 — "Stock photos are all different shapes — will it fit the slot?"**
  → **Crop-to-slot preview + draggable focal point.** Show the image inside the real slide slot; store
  `crop {x,y,zoom}`.

- **C6 — "Mixed sources make the deck feel incoherent."**
  → **Cohesion via the LAYOUT, not the image.** The template applies a consistent slot treatment (the
  scrim the text sits on, the frame, the type) to every slide regardless of source — so an upload, a
  stock shot, and an AI image still read as one deck. *(We do NOT tint the images — that was the
  rejected idea — we keep the chrome consistent.)*

- **C7 — "I want to fix images fast across the whole deck."**
  → **Deck-level image board.** A gallery of every slide's image at once; click any to open its picker;
  bulk actions ("regenerate all AI", "swap all to stock query X").

### The unified Image Picker (one component, three tabs) — opens per slide
- **AI** — editable prompt (art direction applied) · **Generate 4** · variation gallery · pick.
- **Stock** — **AI-suggested query chips** · search box · **Pexels gallery** · pick · credit.
- **Upload** — your asset tray · drop new.
- Shared footer: crop-to-slot · lock · "set as default source for this deck".
- Lives as a **side panel** (slide stays visible) rather than a modal.

### Data-model + API additions
- `SlideLayout.image`: add `stockQueries?: string[]`, `crop?: {x,y,zoom}`, `credit?: {author,url}`.
- LLM output: emit `stockQueries[]` per slide alongside `imagePrompt`.
- Server: `GET /api/stock/search?q=` (Pexels proxy, owner-gated), reuse `POST` image-gen with
  `num_outputs:4` for variations.

### Open question
- Picker as a **side panel** (slide stays in view — my lean) vs a full modal gallery?

---

## Next steps (when ready)
- #1 and #2 are real features — worth a quick **/brainstorming** pass each (especially confirming the
  "what is a preset" + "whole-prompt vs. brain" questions above) before any code.
- #3 → run the research prompt, then we pick adopt-vs-borrow and I prototype the new slide renderer.
