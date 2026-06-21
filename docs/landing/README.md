# VerbaDeck — landing page

A self-contained, brand-themed marketing page: `docs/landing/index.html`. No build step —
open it directly or host the `docs/landing/` folder (e.g. GitHub Pages → Settings → Pages →
`/docs`). It uses real product screenshots from `assets/` and a researched competitor
comparison.

## Add the lifestyle photos (optional, recommended)

The page has one full-bleed "Built for the room" band that looks for a photo and falls back
to a gradient if it's missing. Drop your in-context render here:

- `assets/in-context-stage.jpg` — the laptop-at-a-conference shot (used as the band background).

The desk/monitor render is already represented by the live presenter screenshot in the hero
frame; swap `assets/presenter.png` if you'd rather feature the photoreal version.

## Regenerate the interface screenshots

```bash
node scripts/shoot-showcase.mjs   # writes docs/screenshots/showcase/*
# then copy the ones you want into docs/landing/assets/
```

## What's on the page

Hero · "built for the room" band · why-it's-different · four feature rows (voice control,
live Q&A, dual-monitor, three ways to build) · competitor comparison · personas · final CTA.
Comparison reflects publicly documented capabilities as of June 2026.
