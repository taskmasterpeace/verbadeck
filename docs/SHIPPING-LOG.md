# 📣 VerbaDeck — What's New

> Built in public · 63 updates across 12 active build days · shipping since October 2025 · last shipped today.

---

## v1.2.0 — June 24, 2026

*Your private, invite-only studio — host it yourself, behind your own door.*

### 🆕 New
- **Invite-only access.** VerbaDeck is now a single-owner studio: you sign in, and the whole app is
  yours. Everyone else who shows up lands on a **waitlist** instead of walking in.
- **Run it as your own hosted tool.** A one-command setup puts the entire app — voice, AI, and the
  Knowledge Brain — behind your own private URL over a Cloudflare tunnel. No port-forwarding, no
  exposing your computer, and your API keys never leave it.

### ✨ Improved
- **The landing page now leads with the VerbaDeck mark** as its brand anchor.
- **A clearer first run.** "Create" drops you straight into the builder; the audience screen and the
  phone remote explain what to do when nothing's live yet; menus and preset controls fit small phones.

### 🔧 Fixed
- **Microphone trouble now explains itself** — a blocked, missing, or busy mic gets plain-English
  guidance, and you can always advance with the arrow keys.
- **Errors show as tidy notifications** instead of blocking pop-ups.
- **The Knowledge Brain points you to add a document** before you ask it a question.

### 🔒 Access
- Owner-only protection on every API call and the live voice connection, plus a one-line
  password-recovery command for the owner.

---

## v1.1.0 — June 22, 2026

*Recall your whole knowledge base, live — and a home on the web.*

### 🆕 New
- **Knowledge Brain — answer from everything you know, on stage.** Paste a large, growing body of
  text (company docs, transcripts, research, FAQs) and VerbaDeck indexes it instantly. When a
  question comes mid-talk, it finds the few most relevant passages and answers from them in about
  a second — so you can feed it far more than ever fit on a slide. Each document gets an
  auto-generated title and topic tags as you add it.
- **A home on the web.** VerbaDeck now has a polished landing page — an interface tour, the feature
  highlights, and an honest side-by-side with other tools — deploying to **verbadeck.com**.
- **Drive it from code.** Anything you can do in the Knowledge Brain, an agent or script can do
  too: add, search, and ask through a simple programmatic interface and a public endpoint.

### 🔧 Behind the scenes
- 28 new automated tests cover the Knowledge Brain (index, search, endpoints, and UI), and the
  dev server no longer restarts when you add to your knowledge base.

---

## v1.0.0 — June 21, 2026

*The production-ready 1.0: present a real deck hands-free, from first run to closing slide.*

### 🆕 New
- **Try a live sample in one click.** A new "Try a live sample pitch" button loads a ready-made
  4-slide investor pitch and drops you straight into the presenter — see the whole product
  working in five seconds, no setup.
- **Drive the deck programmatically.** A testMode bridge lets scripts and agents run the
  presentation exactly as your voice would — load a deck, advance slides, ask questions —
  which also powers a new automated test of the core hands-free flow.

### ✨ Improved
- **A premium, refreshed interface.** A deep-contrast navigation rail, refined typography, real
  depth and a calmer, more focused home screen — VerbaDeck now looks the part on stage and in
  front of investors.
- **A cinematic audience display.** The projected slide now renders in a refined dark theme with
  a soft brand glow — high-contrast, easy on the eyes in a dim room, and built to impress.
- **Faster first load.** The app loads each section's code only when you open it, so the initial
  screen appears noticeably quicker.
- **Clearer identity throughout.** Consistent product naming and versioning, full brand-colour
  consistency (no off-palette accents), and respect for your reduced-motion preference.

### 🐛 Fixed
- **Reliable editor, presenter, and Q&A.** Squashed a batch of correctness bugs so deleting a
  slide, showing structured speaker notes, picking a model in Know It All, and labelling
  recommended images all behave as expected.
- **On-brand phone remote.** The phone-remote card now matches the VerbaDeck palette.

### 🔧 Behind the scenes
- Verified hands-free navigation, the back command, double-advance protection, and live-question
  detection with end-to-end tests; hardened the production build.

---

## v0.9.0 — March 2026

*Voice you can trust mid-talk, and a sharper Know It All Wall.*

### 🐛 Fixed
- **Steadier live voice.** Fixed a reconnect issue that could silently drop the transcript while
  you were speaking, plus a re-render bug that killed the audio connection.
- **Instant question detection.** Questions are now picked up the moment you finish asking,
  instead of waiting for a pause.
- **A sharper Know It All Wall.** Better handling of partial speech, keyword order, rapid-fire
  questions, and hyphenated keywords.

### ✨ Improved
- **New brand icons everywhere** — favicon, app icon, and installable PWA icons.

---

<sub>Versions before 1.0.0 were reconstructed from git history to show momentum. Dates reflect
when the work shipped to the main branch.</sub>
