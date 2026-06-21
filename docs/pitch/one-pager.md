# VerbaDeck — Investor One-Pager

## The problem

A salesperson is mid-demo with both hands on the product when the slide needs to
change. They break eye contact, reach for a clicker, lose their place, and the room
feels it. The same person froze last week on a Q&A question they didn't see coming,
and burned an hour the night before hunting Google Images for one usable photo.

Presentation software hasn't changed the core loop in twenty years: the human drives
the deck, slide by slide, and the deck does nothing to help them deliver. PowerPoint,
Keynote, and Google Slides are document editors — they make slides, not presenters.

## The solution

VerbaDeck advances slides when you say a trigger word, so your hands and eyes stay on
the room instead of on a clicker. Around that, it wraps an AI coach on the whole loop:
it suggests the trigger words, recommends slide images, rewrites sparse notes into a
real speaking framework, and pre-writes answers to the questions you're most likely to
get asked.

The insight: a presenter's voice is already both the controller and the content.
Capture it once, and the deck can follow the speaker instead of the speaker babysitting
the deck.

- Say a word, the slide advances — multi-trigger, plural-aware, with a "back" command
- One-click image recommendations from millions of free stock photos
- Speaker notes you can Expand, Simplify, or turn into an analogy or story
- Q&A anticipation: the ten most-likely questions, with answers written before you start
- A countdown buffer so the audience advances instantly while you finish your sentence

## What's shipped

Working today, end-to-end across create → prepare → present:

- **Voice control** — trigger-word slide advancement, multi-trigger and plural matching,
  "back"/"previous" navigation, real-time transcription (AssemblyAI streaming)
- **AI prep tools** — image recommendations (Unsplash/Pexels), speaker-note transforms
  (Expand / Simplify / Analogy / Story), and Q&A anticipation with pre-written answers
- **Live Q&A** — automatic question detection with eight answer tones and a managed
  knowledge base
- **Presenter system** — dual-monitor sync (clean audience view + presenter view), a
  countdown timer that buffers the presenter, and a live trigger carousel + transcript
- **Three ways to build a deck** — an AI-guided "Create from Scratch" wizard, "Process
  Existing Content" (paste text or import a PowerPoint with text + images), and the
  "Know It All Wall" Q&A practice mode
- **Cost-optimized AI** — 50+ models via OpenRouter with per-operation defaults (fast
  cheap models for background tasks, premium models where quality matters)

**Development momentum:** v1.0.0 reached · 48 commits across 9 active build days ·
roughly 4.5 months of development (October 2025 – March 2026) · last shipped 2026-03-10.
*(Verifiable from the repository. A formal shipping log — `/ship-changelog` — would
turn this into a release-by-release cadence.)*

## Who it's for

Anyone who presents with their hands busy and their reputation on the line:

- **Sales engineers & solutions consultants** demoing live — the core persona, because
  they literally can't reach for a clicker mid-demo
- **Product managers and executives** in board, investor, and review settings
- **Conference and TEDx speakers** who need body language, not keyboard shortcuts
- **Teachers, trainers, and medical presenters** — preservation mode keeps exact wording
  for clinical, legal, or compliance content

The job to be done: deliver hands-free, look prepared in Q&A, and cut presentation prep
from hours to minutes.

## Why now / why us

Two shifts make this the moment. Real-time speech-to-text finally got fast and cheap
enough (sub-second, streaming) to drive a live UI without lag, and LLMs made per-slide
coaching — notes, images, Q&A — affordable per presentation rather than per enterprise
seat. The clicker is a 1990s artifact in a hands-free, live-demo, hybrid-meeting world.

We believe the wedge is the live-demo presenter who can't break flow, expanding outward
to every hands-on speaker. We've shipped a working v1.0 that covers the entire
create-prepare-present loop — not a single-feature demo — built by Machine King Labs.

[SOURCE: presentation-software / sales-enablement market size] · [TEAM: founder and team bios]

## Traction

> Metrics below are placeholders until verified. Replace each bracket with a real,
> sourced number before sending.

- **Customers / pilots:** [TRACTION: # of paying or pilot users / teams]
- **Revenue:** [METRIC: MRR or ARR, with as-of date]
- **Usage:** [METRIC: active accounts / presentations delivered / weekly active]
- **Retention or outcome proof:** [METRIC: retention %, or a customer outcome]
- **Pipeline:** [TBD: signed LOIs, waitlist, demos booked]

*Development momentum (verifiable from the repo): v1.0.0, 48 commits across 9 active
build days, ~4.5 months of development through March 2026.*

## Business model

Today VerbaDeck is open-source (MIT) and runs on the user's own API keys, so cost to a
user is just metered AI usage. The monetization path is a hosted tier that bundles the
AI, adds team/organization features, and removes the bring-your-own-key setup.

- **Model:** [MODEL: hosted/managed tier + team plan pricing — not yet live]
- **Pricing reference point:** legacy tools charge ~$159/year per seat; VerbaDeck's edge
  is doing the prep work those tools don't

## The ask

[ASK: round/stage and amount — e.g. raising $X for N months of runway]

- **Use of funds:** [TBD: hosted infrastructure, GTM to sales teams, first hires]
- **Milestones this funds:** [TBD: first N paying teams, hosted launch, Rehearsal Mode]
- **Contact:** [CONTACT: name · email] · Machine King Labs · github.com/taskmasterpeace/verbadeck
