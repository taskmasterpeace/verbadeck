# VerbaDeck — User & Admin Guide

*Current as of **v1.2.0** (see [docs/VERSION](VERSION)). What changed across releases: [SHIPPING-LOG.md](SHIPPING-LOG.md).*

VerbaDeck is a **voice-driven presentation studio**: you speak, and your slides advance on their own
when you say a trigger word — no clicker, no keyboard. While you present, it listens for questions and
answers them live from your own deck and your **Knowledge Brain**. It runs as a **private, single-owner
internal tool** behind your own URL.

This guide has two halves: **Part 1 — Using VerbaDeck** (for you, the presenter) and
**Part 2 — Admin & Self-hosting** (running it, the owner account, and the Cloudflare tunnel).

> **Feature maturity** is tagged on each section: **(Available)** ships today · **(Partial)** works
> with caveats · **(Planned)** designed, not yet built.

[SCREENSHOT: home-hero]

---

# Part 1 — Using VerbaDeck

## Getting in — sign in or join the waitlist (Available)
**What it does.** VerbaDeck is invite-only. The single owner signs in to use the app; everyone else
can request access and is added to a waitlist.
**Where.** The first screen you see when you open the app (the landing gate).
**Steps (owner).**
1. On the gate, keep the **Sign in** tab selected.
2. Enter the owner **email** and **password**.
3. Click **Sign in** — the full app loads.
**Steps (everyone else).**
1. Click the **Request access** tab.
2. Enter your email (name + a note are optional) and click **Join the waitlist**.
3. You'll see "You're on the list."
**What you'll see.** Signed in: the deep-ink sidebar (Dashboard, Create, Editor, Presenter, Know It
All Wall, Knowledge Brain, Library) and a **Sign out** button at the bottom. Not signed in: the
landing page with the "what's new" snippet and the sign-in / request-access card.
**Limitations.** One owner account only. Forgot the password? See *Admin → Password recovery*.

[SCREENSHOT: landing-gate]

## The Dashboard (Available)
**What it does.** Your home base and the fastest way to start.
**Where.** Sidebar → **Dashboard** (the `/` route).
**Steps.** The quickest start is **"Try a live sample pitch"** — it loads a ready 4-slide investor
deck and drops you into the Presenter so you can experience voice control with zero setup. Below that
are the three creation paths as cards: **Create from Scratch**, **Process Existing Content**, and
**Know It All Wall**.
**What you'll see.** The "Present hands-free" hero, the say-a-word → slide-advances → AI-fields-the-
question flow, and the three cards.
**Limitations.** Presentations aren't auto-saved to the server; use **Library** to keep them (below).

## Creating a presentation

### Create from Scratch (Available)
**What it does.** An AI-guided wizard that turns a topic into a structured deck with trigger words and
speaker notes.
**Where.** Sidebar → **Create → From Scratch** (`/create/scratch`). *(Note: visiting `/create` sends
you straight here.)*
**Steps.**
1. Enter your **topic** and answer the guided questions the AI asks.
2. Review the generated sections; each gets a heading, content, and a suggested **trigger word**.
3. Send it to the **Editor** to refine, or to the **Presenter** to start.
**Example.** Topic "Series A pitch for a voice app" → a title slide, problem, solution, traction, and
ask, each with a trigger like "problem" or "traction".
**What you'll see.** A step-by-step form, then a list of sections you can edit.
**Limitations.** Generation quality depends on the model; always skim the result before presenting.

### Process Existing Content (Available)
**What it does.** Paste raw text (notes, a script, an outline) and AI splits it into slides with
trigger words.
**Where.** Sidebar → **Create → Process Content** (`/create/process`).
**Steps.** Pick an AI model (optional), paste your text, and run it. Review the sections it produces.
**What you'll see.** A text box and a model selector; output is a set of editable sections.
**Limitations.** Very long inputs may be summarized; check important details survived.

## The Editor (Available)
**What it does.** Edit every part of a slide: heading, content, speaker notes (rich text), the active
**trigger words**, and an optional image. Also where you manage the **Knowledge Base** (Q&A pairs) and
test triggers.
**Where.** Sidebar → **Editor** (`/editor`).
**Steps.**
1. Select a section.
2. Edit the heading/content; write **speaker notes** (markdown supported).
3. Toggle which **trigger words** are active for that slide (the AI suggests alternatives; you pick).
4. Optionally add an image.
**What you'll see.** A sections list, a rich editor, and trigger toggles. With no deck loaded you get a
"No presentation loaded" screen with buttons to create or load one.
**Limitations.** Triggers match the spoken word with simple plural handling ("moment" matches
"moments"); pick distinctive words to avoid accidental advances.

[SCREENSHOT: editor]

## Presenting — the Presenter view + voice control (Available)
**What it does.** The core of VerbaDeck. You present; saying a slide's trigger word advances the
audience instantly, and a countdown then updates your notes so you can finish your thought.
**Where.** Sidebar → **Presenter** (`/presenter`). Start voice with the **Voice** button (top right)
or **Start Listening** in the status bar.
**Steps.**
1. Open Presenter with a deck loaded.
2. Click **Voice** and **allow the microphone** when the browser asks.
3. Speak naturally. When you say the current slide's trigger word, the slide advances; say **"back"**
   (or "previous") to go back.
4. To advance without speaking, use the **← / →** arrow keys.
**What you'll see.** A presenter cockpit: the current slide, your speaker notes, the trigger words,
a countdown bar between trigger and note-change, and a live transcript ticker at the bottom.
**Limitations.** The microphone needs permission, and off-`localhost` it needs an **https** URL (the
tunnel provides this). If the mic is blocked, missing, or busy, you'll get a clear message telling you
how to fix it — and the arrow keys always work as a fallback.

[SCREENSHOT: presenter]

### Live Q&A while presenting (Available)
**What it does.** When you (or the room) ask a question aloud, VerbaDeck detects it and generates an
answer drawn from your current deck **and** your Knowledge Brain.
**Where.** Inside Presenter, with voice running.
**What you'll see.** A question panel with a quick answer and key points; you can pick a tone.
**Limitations.** Question detection works best with a clear question ("how do you…?"). Answers are
grounded in your content; if the Knowledge Brain is empty it answers from the deck only.

## Audience view — the second screen (Available)
**What it does.** A clean, cinematic, controls-free slide for your projector or second monitor, kept in
sync with what you present.
**Where.** Open it from **Presenter → "Open Audience View"** (it opens the `/audience` route in a new
window you drag to the projector).
**What you'll see.** A full-bleed slide. Opened on its own with nothing live, it shows a **"Waiting for
the presentation to begin…"** state with a hint that it's launched from the Presenter.
**Limitations.** Sync uses the browser's BroadcastChannel — keep the audience window in the **same
browser** as the Presenter.

## Phone remote — the Controller (Available)
**What it does.** Use your phone as a remote: advance slides, and trigger Q&A, from your hand.
**Where.** The `/controller` route on your phone.
**Steps.** Start a presentation on your laptop, then on the phone enter the **6-character room code**
shown on the presenter's screen and tap **Connect**.
**What you'll see.** A pairing screen, then big Prev/Next buttons, the current slide number, your notes,
and a Q&A toggle.
**Limitations.** Needs an active presentation to pair with; the phone must reach the same server.

## Know It All Wall (Available)
**What it does.** A standalone Q&A practice/answer mode — load a knowledge base of Q&A pairs and get
voice-activated, keyword-confirmed answers. Great for rehearsing tough questions.
**Where.** Sidebar → **Know It All Wall** (`/know-it-all`).
**Steps.** Load or build a knowledge base (or use a **Quick Load Preset**), pick a tone, and start.
**What you'll see.** A setup panel with presets and tone, then the answer wall.
**Limitations.** Presets are stored in your browser. On very narrow phones the preset controls wrap to
fit (fixed in v1.2.0).

## Knowledge Brain (Available)
**What it does.** Dump a large, growing body of text (company docs, transcripts, research, FAQs) and
recall it instantly during live Q&A. It chunks, embeds, and indexes everything, then retrieves the few
most relevant passages to answer in about a second.
**Where.** Sidebar → **Knowledge Brain** (`/knowledge`).
**Steps.**
1. In **Add to the brain**, paste text (an optional title helps) and click **Add to brain**.
2. Each document is auto-given a title and topic tags.
3. Use **Test a question** to see what it retrieves and how it answers; **Sources** show what it used.
4. Remove a document with the trash icon.
**Example.** Paste your company metrics; on stage, ask "what's our runway?" and the live Q&A answers
from it.
**What you'll see.** Two cards (add / ask), stats ("N documents · N chunks indexed · embed provider"),
and an indexed-documents list. With nothing added, the Ask box hints "Add a document first."
**Limitations.** The brain is shared across the app (one pool); per-presentation knowledge sets are
**(Planned)**.

[SCREENSHOT: knowledge-brain]

## Library (Available)
**What it does.** Save presentations and reload them later (since decks aren't auto-persisted to the
server).
**Where.** Sidebar → **Library** (`/library`).
**Steps.** Save the current deck; later, load any saved deck back into the Editor/Presenter.
**Limitations.** Stored in your browser unless exported.

## Settings (Available)
**What it does.** Adjust app preferences — including the **countdown duration** (1–10s between a trigger
and your notes changing) and the **cancel word**.
**Where.** Sidebar footer → **Settings** (opens a side panel; there is no separate page).
**Limitations.** A built-in editor for the Quick Load Presets, and a model-context meter, are
**(Planned)**.

## On the roadmap (Planned)
- **AI deck generator** — describe a topic and the AI designs each slide's layout, writes the real
  text, and generates the image: layout-driven rendering with perfect text + AI/stock/uploaded images
  in the picture slot. Designed and prototyped (`slide-lab/`), not yet in the app.
- **Image Picker** — a unified per-slide picker (AI variations · a Stock gallery with AI-suggested
  search terms · Upload), with mixable sources across one deck.
- **PPTX export**, **per-presentation knowledge sets**, and an in-Settings **preset editor**.

---

# Part 2 — Admin & Self-hosting

VerbaDeck runs on **your** machine and is exposed privately over a **Cloudflare named tunnel** — so the
app, its API, the voice WebSocket, and your API keys all stay on your computer, reachable at your own
HTTPS URL. Full reference: **[DEPLOY-TUNNEL.md](DEPLOY-TUNNEL.md)**.

## The owner account & waitlist (Available)
- The single owner is set by `OWNER_EMAIL` / `OWNER_PASSWORD` in the project `.env`. Only this email
  can sign in; everyone else who signs up is recorded on the waitlist.
- **Read the waitlist:** signed in as owner, `GET /api/waitlist` returns everyone who's requested
  access (stored in `.data/waitlist.json`).
- **Auth scope:** every `/api/*` route and the live voice socket require the owner session; the public
  landing/sign-in page and the waitlist signup are the only unauthenticated surfaces.

## Password recovery (Available — new in v1.2.0)
Locked out? From the project root:
```
npm run reset-owner-password -- "your new password"
```
This updates `OWNER_PASSWORD` in `.env`. **Restart the server** to apply.

## Running it behind the Cloudflare named tunnel (Available)
This is the "internal tool, your own URL" setup — and the exact runbook used for
`verbadeck.machinekinglabs.com`.

1. **Build the client** so the server can serve it as one origin:
   ```
   npm run build:client
   ```
2. **Start the single-origin, auth-on server** on port 3002:
   ```
   cd server && node server.js
   ```
   You should see `📦 Serving built client from client/dist (single-origin mode)`. Confirm the gate
   is on: `curl localhost:3002/api/auth/me` returns `authenticated:false`.
3. **Run the connector** (uses the tunnel token from your Cloudflare account; a saved copy lives in
   `.data/tunnel-token.txt`):
   ```
   cloudflared tunnel run --token <YOUR_TUNNEL_TOKEN>
   ```
   Look for "Registered tunnel connection" (×4).
4. Visit your hostname (e.g. `https://verbadeck.machinekinglabs.com`) → the sign-in gate → sign in.
   Voice, AI, and the Knowledge Brain all work because it's one secure origin (`wss://…/ws`).

**Setting it up the first time** (creating the tunnel + routing a hostname) is in DEPLOY-TUNNEL.md —
either the dashboard flow or `node scripts/tunnel-up.mjs`.

## ⚠️ Admin gotchas (learned the hard way)
- **Rebuild after code changes.** The tunnel serves `client/dist`, the *built* bundle — not your
  source. After any fix, re-run `npm run build:client` and restart the server, or the live tool stays
  on the old build.
- **Never tunnel an auth-disabled server.** `AUTH_DISABLED=true` (used for local dev/tests) turns the
  gate off. If the connector is pointed at an auth-disabled server, your app is **public with no login**.
  Always confirm `authenticated:false` on `/api/auth/me` *before* starting `cloudflared`.
- **Your machine must stay on.** The tunnel only exposes this computer; if it sleeps, the site is down.
  For always-on, install `cloudflared` as a service and run the Node server under a process manager.
- **Optional second lock:** put the hostname behind **Cloudflare Access** (Zero Trust) allowing only
  your email — a network-edge gate on top of the app's own auth.

## Environment & keys
Required in `.env`: `AAI_API_KEY` (AssemblyAI voice), `OPENROUTER_API_KEY` (AI), `REPLICATE_API_KEY`
(image generation), plus `PEXELS_API_KEY` for stock images. Auth: `OWNER_EMAIL`, `OWNER_PASSWORD`,
`AUTH_SECRET`. The server exits on boot if a required key is missing.

---

## Troubleshooting
| Symptom | Fix |
|---|---|
| Slides won't advance by voice | Click **Voice** and allow the mic; check the transcript ticker is moving; use ← → as a fallback. |
| "Microphone is blocked" | Click the camera/mic icon in the address bar → **Allow** → press Start again. Off-localhost, use the **https** URL. |
| Audience screen is blank | It's launched from **Presenter → Open Audience View**; keep it in the same browser. |
| Phone remote won't pair | Start a presentation first; enter the **6-char code** from the presenter screen. |
| Live site shows an old version | Rebuild: `npm run build:client`, then restart the server. |
| Locked out of the owner account | `npm run reset-owner-password -- "new password"`, then restart. |

*Questions about what shipped when? See [SHIPPING-LOG.md](SHIPPING-LOG.md).*
